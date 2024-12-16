<script setup lang="ts"></script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink :to="{ name: 'home' }">Home</RouterLink>
        <RouterLink :to="{ name: 'login' }">Login</RouterLink>
      </nav>
    </div>
  </header>
  <div class="card flex justify-center"></div>
</template>
