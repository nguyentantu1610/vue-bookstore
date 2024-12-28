<script setup lang="ts">
import Header from "../components/Header.vue";
</script>

<template>
  <Header />
  <main class="mt-14">
    <RouterView />
    <ScrollTop />
  </main>
</template>
