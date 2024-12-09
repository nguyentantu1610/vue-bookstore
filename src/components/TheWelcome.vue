<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';

const { name } = storeToRefs(useAuthStore())
const { logout } = useAuthStore()

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
  <h1 v-if="name">
    {{ name }}
  </h1>
  <div class="card flex justify-center">
    <Button label="Logout" variant="outlined" @click="logout" />
  </div>

  <div class="card flex justify-center">
    <InputText type="text" />
  </div>

  <Button label="Toggle Dark Mode" @click="toggleDarkMode()" />
</template>
