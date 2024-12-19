<script setup lang="ts">
import Header from "../components/Header.vue";
import SideBar from "../components/SideBar.vue";
</script>

<template>
  <Header />
  <main class="mt-14">
    <div class="flex flex-row" style="height: 83vh">
      <SideBar />
      <RouterView />
    </div>
  </main>
</template>
