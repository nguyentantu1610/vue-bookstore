<script setup lang="ts">
import { useRouter } from "vue-router";
import Header from "../components/Header.vue";
import { ref } from "vue";
import SideBar from "../components/SideBar.vue";
const router = useRouter();
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
