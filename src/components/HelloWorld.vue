<script setup lang="ts">
import heroImg from '../assets/img/hero.png'
import viteLogo from '../assets/img/vite.svg'
import vueLogo from '../assets/img/vue.svg'

</script>
<style scoped lang="scss"></style>

<template>
  <section id="center">
    <div class="hero">
      <img :src="heroImg" class="base" width="170" height="179" alt="" />
      <img :src="vueLogo" class="framework" alt="Vue logo" />
      <img :src="viteLogo" class="vite" alt="Vite logo" />
    </div>
    <div>
      <h1>Bike PDX</h1>
      <p>Get from Point A to Point B!</p>
    </div>
  </section>
</template>
