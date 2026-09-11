<script setup lang="ts">
import { Loader2, ImageOff } from 'lucide-vue-next';
import type { MushafBookPage } from '../types';

defineProps<{
  page: MushafBookPage;
  preloaded?: boolean;
}>();
</script>

<template>
  <div
    class="mushaf-page-container relative w-full h-full flex items-center justify-center bg-white select-none overflow-hidden p-4 sm:p-6 md:p-8"
  >
    <!-- Shimmer Placeholder while loading -->
    <div
      class="mushaf-spinner absolute inset-4 sm:inset-6 md:inset-8 flex flex-col items-center justify-center bg-neutral-100 animate-pulse rounded-xl pointer-events-none"
    >
      <Loader2 class="w-8 h-8 text-neutral-400 animate-spin mb-2" />
      <span class="text-xs text-neutral-500 font-medium"
        >Memuat Halaman {{ page.pageNumber }}...</span
      >
    </div>

    <!-- Scanned Mushaf Image (Fills page authentically) -->
    <img
      :src="page.imageUrl"
      :data-fallback="page.cdnFallbackUrl"
      :alt="`Mushaf Halaman ${page.pageNumber}`"
      class="mushaf-page-img w-full h-full object-contain transition-opacity duration-300 pointer-events-none opacity-0"
      loading="lazy"
      draggable="false"
      onload="
        this.classList.remove('opacity-0');
        this.classList.add('opacity-100');
        const s = this.parentElement.querySelector('.mushaf-spinner');
        if (s) s.style.display = 'none';
      "
      onerror="
        if (!this.dataset.fallbackTried && this.dataset.fallback) {
          this.dataset.fallbackTried = '1';
          this.src = this.dataset.fallback;
        } else {
          const e = this.parentElement.querySelector('.mushaf-error');
          if (e) e.classList.remove('hidden');
          const s = this.parentElement.querySelector('.mushaf-spinner');
          if (s) s.style.display = 'none';
        }
      "
    />

    <!-- Error State -->
    <div
      class="mushaf-error hidden flex flex-col items-center justify-center p-4 text-center space-y-2 bg-neutral-50 rounded-xl border border-neutral-200 m-4"
    >
      <ImageOff class="w-8 h-8 text-neutral-400" />
      <p class="text-xs text-neutral-600">
        Halaman {{ page.pageNumber }} gagal dimuat.
      </p>
      <button
        type="button"
        class="text-[0.6875rem] text-emerald-700 underline cursor-pointer hover:text-emerald-900 font-medium"
        onclick="
          const p = this.closest('.mushaf-page-container');
          const img = p?.querySelector('.mushaf-page-img');
          const s = p?.querySelector('.mushaf-spinner');
          const e = p?.querySelector('.mushaf-error');
          if (img) {
            img.dataset.fallbackTried = '';
            const src = img.dataset.fallback || img.src;
            img.src =
              src + (src.includes('?') ? '&' : '?') + 'retry=' + Date.now();
          }
          if (s) s.style.display = 'flex';
          if (e) e.classList.add('hidden');
        "
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
