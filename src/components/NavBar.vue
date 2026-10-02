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
    <ul class="nav-bar__list">
      <li v-for="link in links" :key="link.href">
        <a :href="link.href" :aria-current="link.current ? 'page' : undefined">
          {{ link.label }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<style scoped lang="scss">
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;

  &__list {
    display: flex;
    gap: 1.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  a[aria-current='page'] {
    font-weight: 700;
    text-decoration: underline;
  }
}
</style>