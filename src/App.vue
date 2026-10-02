<script setup lang="ts">
import BikeMap from './components/BikeMap.vue';
import NavBar from './components/NavBar.vue';
import type { NavLink } from './types/nav';

const links: NavLink[] = [
  { label: 'Map', href: '#map', current: true },
  { label: 'About the data', href: '#about' },
]
</script>

<template>
  <NavBar :links="links">
    <template #brand>
      <span id="site-title">Bike PDX</span>
    </template>
  </NavBar>
  <BikeMap />
</template>
