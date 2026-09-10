<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { Loader2, ImageOff } from 'lucide-vue-next';
import type { MushafBookPage } from '../types';

const props = defineProps<{
  page: MushafBookPage;
  preloaded: boolean;
}>();

const imageLoaded = ref(false);
const imageError = ref(false);
const currentSrc = ref('');
const retryCount = ref(0);

// Initialize or update image source when preloaded status changes
watch(
  () => props.preloaded,
  (isPreloaded) => {
    if (isPreloaded && !currentSrc.value && props.page.imageUrl) {
      currentSrc.value = props.page.imageUrl;
    }
  },
  { immediate: true }
);

function handleImageLoad() {
  imageLoaded.value = true;
  imageError.value = false;
}

function handleImageError() {
  // If backend proxy failed and we haven't tried the direct CDN yet, fallback to Kemenag CDN
  if (retryCount.value === 0 && props.page.cdnFallbackUrl) {
    retryCount.value++;
    currentSrc.value = props.page.cdnFallbackUrl;
    return;
  }
  imageError.value = true;
  imageLoaded.value = false;
}

function handleRetry() {
  imageError.value = false;
  imageLoaded.value = false;
  retryCount.value = 0;
  const baseSrc = props.page.imageUrl || props.page.cdnFallbackUrl || '';
  currentSrc.value = '';
  nextTick(() => {
    currentSrc.value = baseSrc
      ? `${baseSrc}${baseSrc.includes('?') ? '&' : '?'}retry=${Date.now()}`
      : '';
  });
}
</script>

<template>
  <div
    class="mushaf-page-container relative w-full h-full flex items-center justify-center bg-white select-none overflow-hidden p-4 sm:p-6 md:p-8"
  >
    <!-- Shimmer Placeholder while loading -->
    <div
      v-if="!imageLoaded && !imageError && preloaded"
      class="absolute inset-4 sm:inset-6 md:inset-8 flex flex-col items-center justify-center bg-neutral-100 animate-pulse rounded-xl"
    >
      <Loader2 class="w-8 h-8 text-neutral-400 animate-spin mb-2" />
      <span class="text-xs text-neutral-500 font-medium"
        >Memuat Halaman {{ page.pageNumber }}...</span
      >
    </div>

    <!-- Scanned Mushaf Image (Fills page authentically) -->
    <img
      v-if="currentSrc"
      :src="currentSrc"
      :alt="`Mushaf Halaman ${page.pageNumber}`"
      class="w-full h-full object-contain transition-opacity duration-300 pointer-events-none"
      :class="{ 'opacity-0': !imageLoaded, 'opacity-100': imageLoaded }"
      @load="handleImageLoad"
      @error="handleImageError"
      loading="lazy"
      draggable="false"
    />

    <!-- Error State -->
    <div
      v-if="imageError"
      class="flex flex-col items-center justify-center p-4 text-center space-y-2 bg-neutral-50 rounded-xl border border-neutral-200 m-4"
    >
      <ImageOff class="w-8 h-8 text-neutral-400" />
      <p class="text-xs text-neutral-600">
        Halaman {{ page.pageNumber }} gagal dimuat.
      </p>
      <button
        type="button"
        class="text-[0.6875rem] text-emerald-700 underline cursor-pointer hover:text-emerald-900 font-medium"
        @click="handleRetry"
      >
        Coba Lagi
      </button>
    </div>
  </div>
</template>

<style scoped>
.mushaf-page-container {
  background-color: #ffffff !important;
  box-shadow: inset 0 0 16px rgba(0, 0, 0, 0.03);
}
</style>
