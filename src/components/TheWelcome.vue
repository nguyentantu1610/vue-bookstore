<script setup lang="ts">

function toggleDarkMode() {
  document.documentElement.classList.toggle('my-app-dark');
}

</script>

<template>
  <h1 class="text-3xl font-bold underline">
    Hello world!
  </h1>
  <div class="card flex justify-center">
    <Button label="Primary" variant="outlined" style="color: #FFFFFF; background-color: #020617;"/>
  </div>

  <Button label="Toggle Dark Mode" @click="toggleDarkMode()" />
</template>
