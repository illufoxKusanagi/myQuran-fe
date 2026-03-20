<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import { useDarkMode } from '@/composables/useDarkMode'

// Initialize dark mode from localStorage on first load
useDarkMode()
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />
    <!-- RouterView fills the remaining height; each view decides its own overflow/scroll -->
    <div class="flex-1 flex flex-col">
      <RouterView />
    </div>
  </div>
</template>
