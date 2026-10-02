<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue';
import NavBar from './components/NavBar.vue';
import type { NavLink } from './types/nav';

const links: NavLink[] = [
  { label: 'Map', href: '#map', current: true },
  { label: 'About the data', href: '#about' },
]
</script>

<template>
  <NavBar :links="links">
    <template #brand>Bike PDX</template>
  </NavBar>
  <HelloWorld />
</template>
