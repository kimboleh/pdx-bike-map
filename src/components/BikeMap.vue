<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
    facilityTypes,
    facilityGroups,
    allFacilityCodes,
    facilityNameByCode,
    getClassColors,
    type FacilityGroup,
} from '../types/facilityTypes';
import EsriMap from '@arcgis/core/Map';
import Graphic from '@arcgis/core/Graphic';
import MapView from '@arcgis/core/views/MapView';
import Extent from '@arcgis/core/geometry/Extent';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';
import '@arcgis/core/assets/esri/themes/light/main.css';

const mapContainer = ref<HTMLDivElement | null>(null);
const classColors = getClassColors();
const visibleCodes = ref<string[]>([...allFacilityCodes]);
const isFilterOpen = ref(true);
const allOn = (g: FacilityGroup) => g.codes.every((c) => visibleCodes.value.includes(c));
const someOn = (g: FacilityGroup) => g.codes.some((c) => visibleCodes.value.includes(c));

let view: MapView | undefined;
let bikeLayer: GeoJSONLayer | undefined;

// values come from PortlandMaps data, converted to lat/long
const portlandExtent = new Extent({
    xmin: -122.84, // west
    ymin: 45.42,   // south
    xmax: -122.46, // east
    ymax: 45.66,   // north
    spatialReference: { wkid: 4326 },
});

// shows or hides all facility groups within a given class
function toggleGroup(g: FacilityGroup, on: boolean) {
    const rest = visibleCodes.value.filter((c) => !g.codes.includes(c));
    visibleCodes.value = on ? [...rest, ...g.codes] : rest;
}

// returns a SQL statement specifying which facility codes should be visible
function buildWhere(): string {
    if (visibleCodes.value.length === allFacilityCodes.length) return '1=1';
    if (visibleCodes.value.length === 0) return '1=0';
    return `Facility IN (${visibleCodes.value.map((c) => `'${c}'`).join(', ')})`;
}

// sets the new data in the layer and updates result count
async function applyFilter() {
    if (bikeLayer) {
        bikeLayer.definitionExpression = buildWhere();
    }
}

// watches for a change & updates whenever checkboxes are changed
watch(visibleCodes, applyFilter);

onMounted(() => {
    if (!mapContainer.value) return;

    // render the facilities - solid lines if active, dashed lines if planned
    const renderer = new UniqueValueRenderer({
        valueExpression: `
            var planned = $feature.Status == "PLANNED";
            return $feature.Facility + "|" + IIF(planned, "planned", "active");
        `,
        valueExpressionTitle: 'Facility type and build status',
        defaultSymbol: { type: 'simple-line', color: "#000000", width: 1 },
        uniqueValueInfos: facilityTypes.flatMap((f) => [
            {
                value: `${f.code}|active`,
                label: f.name,
                symbol: { type: 'simple-line', color: classColors[f.class], width: 2, style: 'solid' },
            },
            {
                value: `${f.code}|planned`,
                label: `${f.name} (planned)`,
                symbol: { type: 'simple-line', color: classColors[f.class], width: 2, style: 'dash' },
            },
        ]),
    });

    // render the GeoJSON and create popups for each facility
    bikeLayer = new GeoJSONLayer({
        url: '/bike-facilities.geojson',
        title: 'Bike facilities',
        outFields: ['*'],
        renderer,
        popupTemplate: {
            title: '{SegmentName}',
            content: (event: { graphic: Graphic }) => {
                const { Facility, Status, YearBuilt, LengthMiles } = event.graphic.attributes;
                const container = document.createElement('div');

                const lines = [
                    `Type: ${facilityNameByCode[Facility] ?? Facility}`,
                    `Status: ${Status === 'PLANNED' ? 'Planned' : 'Active'}`,
                    ...(YearBuilt ? [`Built: ${YearBuilt}`] : []),
                    `Length: ${LengthMiles} mi`,
                ];

                lines.forEach((text) => {
                    const p = document.createElement('p');
                    p.textContent = text;
                    container.appendChild(p);
                });

                return container;
            },
        },
    });

    const map = new EsriMap({
        basemap: 'osm',
        layers: [bikeLayer],
    });

    view = new MapView({
        container: mapContainer.value,
        map,
        center: [-122.65, 45.52],
        zoom: 14,
        extent: portlandExtent,
        constraints: {
            geometry: portlandExtent,
            minZoom: 11, // stops zooming out past the region
        },
    });

    view.ui.move("zoom", "bottom-right");
});

// saves memory by ensuring view + layer get
// destroyed if it unmounts
onBeforeUnmount(() => {
    view?.destroy();
    view = undefined;
    bikeLayer = undefined;
});
</script>

<template>
    <div id="filter-sidebar" :class="{ 'is-open': isFilterOpen }">
        <div id="filter-panel" class="filter-panel">
            <fieldset class="filters">
                <h2><legend>Filter facility types</legend></h2>
                <!- Loop through each class in facilityGroups ->
                <div
                    v-for="group in facilityGroups"
                    :key="group.class"
                    class="filters__group"
                    role="group"
                    :aria-labelledby="`class-${group.class}-heading`"
                >
                    <!- Add the class's heading ->
                    <label class="filters__all">
                        <input
                            type="checkbox"
                            :checked="allOn(group)"
                            :indeterminate="someOn(group) && !allOn(group)"
                            @change="toggleGroup(group, ($event.target as HTMLInputElement).checked)"
                        />
                        <h3 :id="`class-${group.class}-heading`">{{ group.name }}</h3>
                    </label>

                    <!- Loop through each class's facility types, then add them with their own checkboxes ->
                    <label v-for="code in group.codes" :key="code" class="filters__type">
                        <input type="checkbox" :value="code" v-model="visibleCodes" />
                        {{ facilityNameByCode[code] }}
                    </label>
                </div>
            </fieldset>
        </div>

        <button
            type="button"
            class="filter-toggle"
            aria-label="Facility filters"
            aria-controls="filter-panel"
            :aria-expanded="isFilterOpen"
            @click="isFilterOpen = !isFilterOpen"
        >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="2" />
            </svg>
        </button>
    </div>
    <div id="bike-map-wrapper">
        <div
            ref="mapContainer"
            class="bike-map"
            role="region"
            aria-label="Map of Portland bike facilities"
        ></div>
    </div>
    <div class="map-legend" role="group" aria-labelledby="legend-heading">
        <h2 id="legend-heading" class="map-legend__title">Legend</h2>

        <ul class="map-legend__list">
            <li v-for="group in facilityGroups" :key="group.class">
            <svg class="map-legend__line" viewBox="0 0 32 4" aria-hidden="true" focusable="false">
                <line x1="0" y1="2" x2="32" y2="2" :class="`legend-stroke--class-${group.class}`" />
            </svg>
            {{ group.name }}
            </li>
        </ul>

        <ul class="map-legend__list">
            <li>
            <svg class="map-legend__line" viewBox="0 0 32 4" aria-hidden="true" focusable="false">
                <line x1="0" y1="2" x2="32" y2="2" class="legend-stroke--status" />
            </svg>
            Active
            </li>
            <li>
            <svg class="map-legend__line" viewBox="0 0 32 4" aria-hidden="true" focusable="false">
                <line x1="0" y1="2" x2="32" y2="2" class="legend-stroke--status" stroke-dasharray="6 4" />
            </svg>
            Planned
            </li>
        </ul>
    </div>
</template>