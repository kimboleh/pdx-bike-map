<script setup lang="ts">
import type { NavLink } from '../types/nav';
import logo from '../assets/img/bikepdx.png';

defineProps<{
  links: NavLink[]
  label?: string
}>()
</script>

<template>
  <nav class="nav-bar" :aria-label="label ?? 'Main'">
    <div class="nav-bar__brand">
        <img :src="logo" class="base" width="50" height="50" alt="" />
      <slot name="brand" />
    </div>
  </nav>
</template>
