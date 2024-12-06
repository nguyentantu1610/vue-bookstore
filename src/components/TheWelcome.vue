<script setup lang="ts">

function toggleDarkMode() {
  document.documentElement.classList.toggle('my-app-dark');
}

</script>

<template>

<header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>
  <h1>
    Hello world!
  </h1>
  <div class="card flex justify-center">
    <Button label="Primary" variant="outlined" />
  </div>

  <div class="card flex justify-center">
    <InputText type="text" />
  </div>

  <Button label="Toggle Dark Mode" @click="toggleDarkMode()" />
</template>
