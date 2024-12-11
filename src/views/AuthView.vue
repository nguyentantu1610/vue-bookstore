<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const enter = computed(() => {
  return route.meta.enter as string;
});
const leave = computed(() => {
  return route.meta.leave as string;
});
</script>

<template>
  <main id="my-main">
    <div class="flex justify-center items-center" style="height: 90vh">
      <RouterView v-slot="{ Component }">
        <Transition
          :enter-active-class="enter"
          :leave-active-class="leave"
          mode="out-in"
        >
          <component :is="Component" />
        </Transition>
      </RouterView>
    </div>
  </main>
</template>

<style scoped>
#my-main {
  background-image: url("/bg-snowflake.png");
  background-size: cover;
  background-position: center;
  overflow: hidden;
}
</style>
