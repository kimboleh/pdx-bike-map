<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import esriConfig from '@arcgis/core/config';
import EsriMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';
import '@arcgis/core/assets/esri/themes/light/main.css';

const mapContainer = ref<HTMLDivElement | null>(null);
let view: MapView | undefined;

const css = getComputedStyle(document.documentElement);
const class1 = css.getPropertyValue('--color-class-1').trim();
const class2 = css.getPropertyValue('--color-class-2').trim();
const class3 = css.getPropertyValue('--color-class-3').trim();
const class4 = css.getPropertyValue('--color-class-4').trim();

onMounted(() => {
    if (!mapContainer.value) return

    const renderer = new UniqueValueRenderer({
        field: 'Facility',
        defaultSymbol: { type: 'simple-line', color: class1, width: 1 },
        uniqueValueInfos: [
            {
            value: 'ABL',
            label: 'Advisory Bike Lane',
            symbol: { type: 'simple-line', color: class2, width: 2, style: 'solid' },
            },    
            {
            value: 'BL',
            label: 'Bike Lane',
            symbol: { type: 'simple-line', color: class2, width: 2, style: 'solid' },
            },
            {
            value: 'BBBL',
            label: 'Bike Lane Buffered by Bus Lane',
            symbol: { type: 'simple-line', color: class2, width: 2, style: 'solid' },
            },
            {
            value: 'BBL',
            label: 'Buffered Bike Lane',
            symbol: { type: 'simple-line', color: class2, width: 2, style: 'solid' },
            },
            {
            value: 'ESR',
            label: 'Enhanced Shared Roadway',
            symbol: { type: 'simple-line', color: class3, width: 2, style: 'solid' },
            },
            {
            value: 'LSB',
            label: 'Local Service Bikeway',
            symbol: { type: 'simple-line', color: class3, width: 2, style: 'solid' },
            },
            {
            value: 'NG',
            label: 'Neighborhood Greenway',
            symbol: { type: 'simple-line', color: class1, width: 2, style: 'solid' },
            },
            {
            value: 'PBL',
            label: 'Protected Bike Lane',
            symbol: { type: 'simple-line', color: class4, width: 2, style: 'solid' },
            },
            {
            value: 'SBBL',
            label: 'Shared Bus-Bike Lane',
            symbol: { type: 'simple-line', color: class2, width: 2, style: 'solid' },
            },
            {
            value: 'SIR',
            label: 'Separated in-roadway',
            symbol: { type: 'simple-line', color: class4, width: 2, style: 'solid' },
            },
            {
            value: 'TRL',
            label: 'Off-Street Path/Trail',
            symbol: { type: 'simple-line', color: class1, width: 2, style: 'solid' },
            },
        ],
    });

    const bikeLayer = new GeoJSONLayer({
        url: '/bike-facilities.geojson',
        title: 'Bike facilities',
        renderer,
        popupTemplate: {
            title: '{SegmentName}',
            content: 'Type: {Facility}<br>Built: {YearBuilt}<br>Length: {LengthMiles} mi',
        },
    });

    const map = new EsriMap({
        basemap: 'osm',
        layers: [bikeLayer],
    })

    view = new MapView({
        container: mapContainer.value,
        map,
        center: [-122.65, 45.52],
        zoom: 11,
    });

    bikeLayer.queryFeatureCount().then((n) => console.log('features:', n));
})

onBeforeUnmount(() => {
    view?.destroy()
    view = undefined
})
</script>

<template>
    <div id="bike-map-wrapper">
        <div
            ref="mapContainer"
            class="bike-map"
            role="region"
            aria-label="Map of Portland bike facilities"
        ></div>
    </div>
</template>

<style scoped lang="scss">
    .bike-map, #bike-map-wrapper {
        width: 100%;
        height: 100%;
    }
</style>