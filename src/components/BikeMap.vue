<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { facilityTypes, facilityNameByCode, getClassColors } from '../types/facilityTypes';
import EsriMap from '@arcgis/core/Map';
import Graphic from '@arcgis/core/Graphic';
import MapView from '@arcgis/core/views/MapView';
import Extent from '@arcgis/core/geometry/Extent';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';
import '@arcgis/core/assets/esri/themes/light/main.css';

const mapContainer = ref<HTMLDivElement | null>(null);
const PLANNED_STATUS = 'PLANNED';
const classColors = getClassColors();
let view: MapView | undefined;

// values come from PortlandMaps data, converted to lat/long
const portlandExtent = new Extent({
    xmin: -122.84, // west
    ymin: 45.42,   // south
    xmax: -122.46, // east
    ymax: 45.66,   // north
    spatialReference: { wkid: 4326 },
});

onMounted(() => {
    if (!mapContainer.value) return;

    // render the facilities - solid lines if active, dashed lines if planned
    const renderer = new UniqueValueRenderer({
        valueExpression: `
            var planned = $feature.Status == "${PLANNED_STATUS}";
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
    const bikeLayer = new GeoJSONLayer({
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
});

// saves memory by ensuring view gets
// destroyed if it unmounts
onBeforeUnmount(() => {
    view?.destroy();
    view = undefined;
});
</script>

<template>
    <div id="filter-sidebar">
        <h3>Filter Facilities</h3>
    </div>
    <div id="bike-map-wrapper">
        <div
            ref="mapContainer"
            class="bike-map"
            role="region"
            aria-label="Map of Portland bike facilities"
        ></div>
    </div>
</template>