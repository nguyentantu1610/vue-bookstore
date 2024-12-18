<script setup lang="ts">
import { RouterView } from "vue-router";
import Footer from "./components/Footer.vue";
</script>

<template>
  <Toast />
  <ConfirmPopup></ConfirmPopup>
  <ScrollTop />
  <RouterView />
  <Footer />
</template>
