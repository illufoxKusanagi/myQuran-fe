<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, BookOpen, Search } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { useBookFlip } from '@/features/reader/composables/useBookFlip';
import { useMushafPages } from '@/features/mushaf/composables/useMushafPages';
import { SURAHS_PAGES } from '@/features/mushaf/mushafData';
import MushafPageItem from '@/features/mushaf/components/MushafPageItem.vue';
import MushafControls from '@/features/mushaf/components/MushafControls.vue';
import MushafJumpDialog from '@/features/mushaf/components/MushafJumpDialog.vue';
import '@/features/reader/reader.css';

const route = useRoute();
const router = useRouter();

const stageRef = ref<HTMLElement | null>(null);
const bookWrapRef = ref<HTMLElement | null>(null);
const currentIndex = ref(0);
const isPortrait = ref(false);
const isJumpOpen = ref(false);

function getInitialPage(): number {
  if (route.query.surah) {
    const s = SURAHS_PAGES.find(
      (item) => item.id === Number(route.query.surah)
    );
    if (s) return s.startPage;
  }
  return Number(route.params.page || route.query.page) || 1;
}

const initialTargetPage = ref<number>(getInitialPage());

const {
  isRtlBook,
  bookPages,
  hasPrevPage,
  hasNextPage,
  activePageNumber,
  currentJuz,
  activeSurahs,
  findPageIndexByPageNumber,
  isPagePreloaded,
} = useMushafPages(currentIndex, isPortrait);

const {
  detectLayout,
  initPageFlip,
  handleResize,
  flipNext,
  flipPrev,
  goToPage,
  destroyBook,
} = useBookFlip({
  bookWrapRef,
  stageRef,
  bookPages: bookPages as any,
  isRtlBook: computed(() => isRtlBook.value),
  currentIndex,
  isPortrait,
});

function jumpToPageNumber(pageNum: number) {
  const idx = findPageIndexByPageNumber(pageNum);
  goToPage(idx);
}

// Keep browser URL synced with active reading page
watch(activePageNumber, (p) => {
  if (p && route.params.page !== String(p)) {
    router
      .replace({
        params: { page: String(p) },
      })
      .catch(() => {});
  }
});

function handleNextSpread() {
  // In RTL Arabic reading order, flipPrev advances forward into the book
  flipPrev();
}

function handlePrevSpread() {
  // In RTL Arabic reading order, flipNext turns backward towards the cover
  flipNext();
}

function handleKeydown(e: KeyboardEvent) {
  if (isJumpOpen.value) return;
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    handleNextSpread();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    handlePrevSpread();
  } else if (e.key.toLowerCase() === 'j') {
    e.preventDefault();
    isJumpOpen.value = true;
  }
}

function navigateToDigital() {
  const currentSurah = activeSurahs.value[0];
  const surahId = currentSurah ? currentSurah.id : 1;
  router.push({ name: 'surah', params: { id: surahId } });
}

onMounted(() => {
  detectLayout();
  window.addEventListener('resize', handleResize);
  window.addEventListener('keydown', handleKeydown);

  nextTick(() => {
    initPageFlip();
    // Jump to requested initial page if greater than 1
    if (initialTargetPage.value > 1) {
      setTimeout(() => {
        jumpToPageNumber(initialTargetPage.value);
      }, 150);
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('keydown', handleKeydown);
  destroyBook();
});
</script>

<template>
  <div
    class="mushaf-reader-root flex flex-col h-[100dvh] w-full overflow-hidden bg-[#e8e4d9] dark:bg-[#0c0a09] select-none"
  >
    <!-- Top Sub-Header -->
    <header
      class="h-12 border-b border-border/80 bg-card/90 dark:bg-card/95 backdrop-blur-xs flex items-center justify-between px-3 sm:px-6 z-30"
    >
      <div class="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
          @click="router.push('/')"
          title="Kembali ke Beranda"
        >
          <ArrowLeft class="w-4 h-4" />
        </Button>
        <div class="flex items-center gap-2">
          <BookOpen class="w-4 h-4 text-primary" />
          <h1 class="text-xs sm:text-sm font-bold text-foreground">
            Mushaf Standar Indonesia
          </h1>
        </div>
      </div>

      <!-- Center / Right Info -->
      <div class="flex items-center gap-2">
        <div
          class="flex items-center gap-1.5 text-xs text-muted-foreground font-medium"
        >
          <span class="text-foreground font-semibold">
            {{ activeSurahs.map((s) => s.name).join(', ') || "Al-Qur'an" }}
          </span>
          <span>•</span>
          <span class="text-primary font-bold">Juz {{ currentJuz }}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          class="h-7 px-2.5 text-[0.6875rem] gap-1.5 rounded-lg border-border"
          @click="isJumpOpen = true"
        >
          <Search class="w-3 h-3" />
          <span class="hidden sm:inline">Pindah Hal.</span>
          <kbd
            class="hidden md:inline-block px-1 text-[0.5625rem] font-mono rounded bg-muted"
            >J</kbd
          >
        </Button>
      </div>
    </header>

    <!-- Main 3D Book Stage Container -->
    <main
      class="relative flex-1 flex items-center justify-center overflow-hidden p-2 sm:p-4"
    >
      <div
        ref="bookWrapRef"
        class="flipbook-wrapper relative mx-auto my-auto max-w-full max-h-full"
        style="width: 100%; height: 100%; max-width: 1200px; max-height: 88vh"
      ></div>

      <!-- Off-screen Virtual Staging DOM for PageFlip Engine -->
      <div
        ref="stageRef"
        class="stage-container"
        style="
          position: absolute;
          left: -9999px;
          top: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0;
        "
      >
        <div
          v-for="p in bookPages"
          :key="p.key"
          class="pf-page"
          :data-density="p.type.startsWith('cover') ? 'hard' : 'soft'"
        >
          <!-- 1. Front Hard Cover -->
          <div
            v-if="p.type === 'cover-front'"
            class="w-full h-full flex flex-col items-center justify-between p-6 sm:p-10 bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#022c22] text-white border-4 border-[#ca8a04] shadow-2xl relative overflow-hidden"
          >
            <!-- Decorative Ornate Gold Borders -->
            <div
              class="absolute inset-3 border-2 border-[#fef08a]/60 rounded-xl pointer-events-none"
            ></div>
            <div
              class="absolute inset-5 border border-[#fef08a]/30 rounded-lg pointer-events-none"
            ></div>

            <div class="pt-8 text-center space-y-1 relative z-10">
              <span
                class="text-[0.6875rem] tracking-widest text-[#fef08a] uppercase font-semibold"
              >
                KEMENTERIAN AGAMA REPUBLIK INDONESIA
              </span>
              <p class="text-xs text-white/80">
                Lajnah Pentashihan Mushaf Al-Qur'an
              </p>
            </div>

            <div class="my-auto text-center space-y-4 relative z-10">
              <h2
                class="font-arabic text-4xl sm:text-5xl text-[#fef08a] leading-loose drop-shadow-md"
              >
                القرآن الكريم
              </h2>
              <div class="w-24 h-0.5 bg-[#fef08a] mx-auto opacity-80"></div>
              <h3
                class="text-base sm:text-lg font-bold tracking-wide text-white drop-shadow-xs"
              >
                MUSHAF AL-QUR'AN
              </h3>
              <p class="text-xs text-white/90 font-medium">
                Standar Indonesia • 604 Halaman
              </p>
            </div>

            <div class="pb-6 text-center space-y-2 relative z-10">
              <div
                class="px-4 py-1.5 rounded-full bg-black/20 border border-[#fef08a]/40 inline-flex items-center gap-2"
              >
                <span class="text-[0.6875rem] text-[#fef08a]"
                  >Buka dari kanan ke kiri</span
                >
              </div>
            </div>
          </div>

          <!-- 2. Blank / Endpaper Page -->
          <div
            v-else-if="p.type === 'blank'"
            class="w-full h-full bg-[#fbf9f1] dark:bg-[#191614] flex items-center justify-center p-6 border border-border/30"
          >
            <div
              class="w-full h-full border border-dashed border-border/40 rounded-lg flex items-center justify-center opacity-30"
            >
              <span class="font-arabic text-xl text-muted-foreground"
                >بسم الله الرحمن الرحيم</span
              >
            </div>
          </div>

          <!-- 3. Authentic 604 Mushaf Scanned Page -->
          <div v-else-if="p.type === 'mushaf-page'" class="w-full h-full">
            <MushafPageItem
              :page="p"
              :preloaded="isPagePreloaded(p.pageNumber)"
            />
          </div>

          <!-- 4. Back Hard Cover -->
          <div
            v-else-if="p.type === 'cover-back'"
            class="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#022c22] via-[#047857] to-[#064e3b] text-white border-4 border-[#ca8a04] relative overflow-hidden"
          >
            <div
              class="absolute inset-3 border-2 border-[#fef08a]/60 rounded-xl pointer-events-none"
            ></div>
            <div class="text-center space-y-3 z-10">
              <h4 class="font-arabic text-3xl text-[#fef08a]">
                صدق الله العظيم
              </h4>
              <p class="text-xs text-white/80">Al-Qur'an Al-Karim</p>
              <div class="pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  class="bg-black/30 border-[#fef08a]/50 text-[#fef08a] hover:bg-black/50 text-xs"
                  @click="jumpToPageNumber(1)"
                >
                  Kembali ke Awal
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom Floating Controls -->
    <MushafControls
      :current-page="activePageNumber"
      :current-juz="currentJuz"
      :has-next="hasPrevPage"
      :has-prev="hasNextPage"
      @next="handleNextSpread"
      @prev="handlePrevSpread"
      @open-jump="isJumpOpen = true"
      @switch-to-digital="navigateToDigital"
    />

    <!-- Jump Dialog (Halaman, Juz, Surah) -->
    <MushafJumpDialog
      v-model:open="isJumpOpen"
      :current-page="activePageNumber"
      @jump="jumpToPageNumber"
    />
  </div>
</template>

<style scoped>
.flipbook-wrapper {
  box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.35);
  border-radius: 4px;
}
</style>
