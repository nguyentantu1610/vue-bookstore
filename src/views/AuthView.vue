<template>
  <main id="my-main">
    <RouterView v-slot="{ Component, route }">
      <Transition
        :enter-active-class="route.meta.enter"
        :leave-active-class="route.meta.leave"
        mode="out-in"
      >
        <component :is="Component" />
      </Transition>
    </RouterView>
    <!-- <RouterView /> -->
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
