<script setup lang="ts">
import { ref } from 'vue';
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  ArrowRightLeft,
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { TOTAL_MUSHAF_PAGES } from '../mushafData';

const props = defineProps<{
  currentPage: number;
  currentJuz: number;
  hasNext: boolean;
  hasPrev: boolean;
}>();

const emit = defineEmits<{
  next: [];
  prev: [];
  openJump: [];
  toggleFullscreen: [];
  switchToDigital: [];
}>();

const isFullscreen = ref(false);

function handleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().catch(() => {});
    isFullscreen.value = true;
  } else {
    document.exitFullscreen?.().catch(() => {});
    isFullscreen.value = false;
  }
  emit('toggleFullscreen');
}
</script>

<template>
  <div
    class="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 p-1.5 px-2.5 rounded-full bg-card/90 dark:bg-card/95 backdrop-blur-md border border-border shadow-xl select-none max-w-[95vw]"
  >
    <!-- Previous Spread Button (Left arrow in visual RTL moves back towards front) -->
    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8 rounded-full"
      :disabled="!hasPrev"
      @click="emit('prev')"
      title="Halaman Sebelumnya"
      aria-label="Halaman Sebelumnya"
    >
      <ChevronLeft class="w-4 h-4" />
    </Button>

    <!-- Page Number & Juz Trigger (Opens Jump Dialog) -->
    <button
      type="button"
      class="flex items-center gap-2 h-8 px-3 rounded-full hover:bg-accent text-xs font-semibold text-foreground transition-colors cursor-pointer"
      @click="emit('openJump')"
      title="Klik untuk memilih halaman atau juz"
    >
      <span class="text-primary font-bold">Halaman {{ currentPage }}</span>
      <span class="text-muted-foreground/60">/</span>
      <span class="text-muted-foreground text-[0.6875rem]">{{
        TOTAL_MUSHAF_PAGES
      }}</span>
      <span
        class="hidden sm:inline-block px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[0.625rem] font-bold"
      >
        Juz {{ currentJuz }}
      </span>
    </button>

    <!-- Next Spread Button (Right arrow in visual RTL moves forward into Quran) -->
    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8 rounded-full"
      :disabled="!hasNext"
      @click="emit('next')"
      title="Halaman Berikutnya"
      aria-label="Halaman Berikutnya"
    >
      <ChevronRight class="w-4 h-4" />
    </Button>

    <div class="w-px h-4 bg-border mx-0.5"></div>

    <!-- Switch to Digital Mode Button -->
    <Button
      variant="ghost"
      size="sm"
      class="h-8 px-2.5 rounded-full text-xs gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
      @click="emit('switchToDigital')"
      title="Beralih ke Teks Ayat Digital"
    >
      <ArrowRightLeft class="w-3.5 h-3.5 text-primary" />
      <span class="hidden md:inline">Mode Digital</span>
    </Button>

    <!-- Fullscreen Toggle -->
    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
      @click="handleFullscreen"
      :title="isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'"
      :aria-label="isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'"
    >
      <Minimize v-if="isFullscreen" class="w-4 h-4" />
      <Maximize v-else class="w-4 h-4" />
    </Button>
  </div>
</template>
