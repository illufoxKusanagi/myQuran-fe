<script setup lang="ts">
import {
  ref,
  onMounted,
  onBeforeUnmount,
  nextTick,
  computed,
  watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import type { Ayah } from '@/features/reader/types';
import { useBookPages } from '@/features/reader/composables/useBookPages';
import { useBookFlip } from '@/features/reader/composables/useBookFlip';
import { useQuranAudio } from '@/features/reader/composables/useQuranAudio';
import { useLastRead } from '@/features/reader/composables/useLastRead';
import ReaderHeader from '@/features/reader/components/ReaderHeader.vue';
import ReaderControls from '@/features/reader/components/ReaderControls.vue';
import TafsirDrawer from '@/features/reader/components/TafsirDrawer.vue';
import ReadingSettingsDialog from '@/features/reader/components/ReadingSettingsDialog.vue';
import QuickJumpDialog from '@/features/reader/components/QuickJumpDialog.vue';
import ReaderNavSidebar from '@/features/reader/components/ReaderNavSidebar.vue';
import { useReadingSettings } from '@/features/reader/composables/useReadingSettings';
import { useReaderShortcuts } from '@/features/reader/composables/useReaderShortcuts';
import '@/features/reader/reader.css';

const isNavOpen = ref(false);

const route = useRoute();
const router = useRouter();
const surahId = Number(route.params.id);

const ayahs = ref<Ayah[]>([]);
const surahName = ref('');
const surahArabic = ref('');
const surahTranslation = ref('');
const loading = ref(true);
const error = ref<string | null>(null);

const stageRef = ref<HTMLElement | null>(null);
const bookWrapRef = ref<HTMLElement | null>(null);
const currentIndex = ref(0);
const isPortrait = ref(false);

const {
  isRtlBook,
  bookPages,
  hasPrevPage,
  hasNextPage,
  leftAyah,
  rightAyah,
  getAyahByPageIndex,
} = useBookPages(ayahs, surahArabic, currentIndex, isPortrait);

const currentJuz = computed(
  () => leftAyah.value?.juz ?? rightAyah.value?.juz ?? null
);

const {
  detectLayout,
  initPageFlip,
  handleResize,
  flipNext,
  flipPrev,
  goToPage,
  attachObserver,
} = useBookFlip({
  bookWrapRef,
  stageRef,
  bookPages,
  isRtlBook,
  currentIndex,
  isPortrait,
});

const {
  isPlaying,
  isContinuous,
  selectedQari,
  playbackRate,
  activeAyahNumber,
  togglePlay,
} = useQuranAudio({
  surahId,
  isPortrait,
  isRtlBook,
  bookPages,
  currentIndex,
  getAyahByPageIndex,
  onFlipNext: flipNext,
  onFlipPrev: flipPrev,
});

const isTafsirOpen = ref(false);
const tafsirTarget = ref<'left' | 'right'>('left');
const tafsirAyah = computed(() =>
  tafsirTarget.value === 'left' ? leftAyah.value : rightAyah.value
);

function openTafsir(side: 'left' | 'right') {
  tafsirTarget.value = side;
  isTafsirOpen.value = true;
}

function formatTranslation(t: string): string {
  const esc = t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return esc.replace(/(\d+)\)/g, '<sup class="footnote-marker">$1)</sup>');
}

const { saveLastRead } = useLastRead();
const { settings: readingSettings } = useReadingSettings();
const isSettingsOpen = ref(false);
const isQuickJumpOpen = ref(false);

function jumpToAyah(ayahNumber: number): boolean {
  const idx = bookPages.value.findIndex(
    (p) => p.type === 'ayah' && p.ayah.ayahNumber === ayahNumber
  );
  if (idx === -1) return false;
  goToPage(idx);
  return true;
}

useReaderShortcuts({
  onFlipNext: flipNext,
  onFlipPrev: flipPrev,
  onTogglePlay: togglePlay,
  onToggleTafsir: () => {
    if (isTafsirOpen.value) isTafsirOpen.value = false;
    else if (leftAyah.value || rightAyah.value) {
      tafsirTarget.value = leftAyah.value ? 'left' : 'right';
      isTafsirOpen.value = true;
    }
  },
  onToggleSettings: () => (isSettingsOpen.value = !isSettingsOpen.value),
  onQuickJump: () => (isQuickJumpOpen.value = true),
  onClose: () => {
    if (isQuickJumpOpen.value) isQuickJumpOpen.value = false;
    else if (isSettingsOpen.value) isSettingsOpen.value = false;
    else if (isTafsirOpen.value) isTafsirOpen.value = false;
  },
});

function attachScrollGuards() {
  if (!bookWrapRef.value) return;
  const roots = bookWrapRef.value.querySelectorAll('.pf-scroll');
  roots.forEach((el) => {
    const container = el as HTMLElement;
    if ((container as any)._scrollGuarded) return;
    container.addEventListener(
      'wheel',
      (e: WheelEvent) => {
        const canScrollUp = container.scrollTop > 0 && e.deltaY < 0;
        const canScrollDown =
          container.scrollTop + container.clientHeight <
            container.scrollHeight && e.deltaY > 0;
        if (canScrollUp || canScrollDown) {
          container.scrollTop += e.deltaY;
          e.stopPropagation();
          e.preventDefault();
        }
      },
      { passive: false, capture: true } as any
    );
    container.addEventListener(
      'mousedown',
      (e: MouseEvent) => {
        e.stopPropagation();
      },
      { capture: true } as any
    );
    let startY = 0;
    container.addEventListener(
      'touchstart',
      (e: TouchEvent) => {
        if (e.touches.length === 1) {
          startY = e.touches[0].clientY;
          e.stopPropagation();
        }
      },
      { passive: true, capture: true } as any
    );
    container.addEventListener(
      'touchmove',
      (e: TouchEvent) => {
        if (e.touches.length === 1) {
          const currentY = e.touches[0].clientY;
          const deltaY = startY - currentY;
          const canScrollUp = container.scrollTop > 0 && deltaY < 0;
          const canScrollDown =
            container.scrollTop + container.clientHeight <
              container.scrollHeight && deltaY > 0;
          if (canScrollUp || canScrollDown) {
            container.scrollTop += deltaY;
            startY = currentY;
            e.stopPropagation();
          }
        }
      },
      { passive: true, capture: true } as any
    );
    (container as any)._scrollGuarded = true;
  });
}

function syncBookTheme() {
  const wrap = bookWrapRef.value;
  if (!wrap) return;
  const theme = readingSettings.value.paperTheme;
  const oldThemes = ['paper-cream', 'paper-white', 'paper-sepia', 'paper-dark'];
  oldThemes.forEach((t) => wrap.classList.remove(t));
  wrap.classList.add(`paper-${theme}`);
  wrap.classList.toggle('hide-arabic', !readingSettings.value.showArabic);
  wrap.classList.toggle('hide-latin', !readingSettings.value.showLatin);
  wrap.classList.toggle(
    'hide-translation',
    !readingSettings.value.showTranslation
  );
  wrap.style.setProperty(
    '--arabic-font-scale',
    String(readingSettings.value.arabicFontSize)
  );
  wrap.style.setProperty(
    '--translation-font-scale',
    String(readingSettings.value.translationFontSize)
  );
}

watch(
  () => [
    readingSettings.value.paperTheme,
    readingSettings.value.arabicFontSize,
    readingSettings.value.translationFontSize,
    readingSettings.value.showArabic,
    readingSettings.value.showLatin,
    readingSettings.value.showTranslation,
  ],
  () => {
    if (loading.value) return;
    nextTick(() => requestAnimationFrame(() => syncBookTheme()));
  }
);

watch(activeAyahNumber, (num) => {
  if (!bookWrapRef.value) return;
  const pages = bookWrapRef.value.querySelectorAll('.pf-page');
  pages.forEach((el) => {
    const badge = el.querySelector('.pf-badge');
    const n = badge ? Number(badge.textContent) : null;
    el.classList.toggle('is-active-ayah', n !== null && n === num);
  });
});

watch([leftAyah, rightAyah, currentIndex], () => {
  const ayah = leftAyah.value ?? rightAyah.value;
  if (!ayah || !surahName.value) return;
  saveLastRead({
    surahId,
    surahName: surahName.value,
    surahArabic: surahArabic.value,
    ayahNumber: ayah.ayahNumber,
    totalAyahs: ayahs.value.length,
  });
  nextTick(() => requestAnimationFrame(() => attachScrollGuards()));
});

onMounted(async () => {
  try {
    const [surahRes, ayahRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/surah/${surahId}`),
      fetch(`${import.meta.env.VITE_API_URL}/ayah/${surahId}?withTafsir=false`),
    ]);
    if (!surahRes.ok || !ayahRes.ok) {
      throw new Error(
        `Failed to load Surah data: HTTP ${surahRes.status} / ${ayahRes.status}`
      );
    }
    const surahData = await surahRes.json();
    surahName.value = surahData.surahName || `Surah ${surahId}`;
    surahArabic.value = surahData.arabic || '';
    surahTranslation.value =
      surahData.translation ||
      surahData.indonesianTranslation ||
      surahData.arti ||
      '';
    const ayahData = await ayahRes.json();
    ayahs.value = Array.isArray(ayahData) ? ayahData : ayahData.ayahs || [];
  } catch (err) {
    error.value = 'Failed to load Surah data';
    console.error(err);
  } finally {
    loading.value = false;
  }

  await nextTick();
  detectLayout();
  await nextTick();
  requestAnimationFrame(() => {
    initPageFlip();
    attachObserver();
    requestAnimationFrame(() => {
      syncBookTheme();
      attachScrollGuards();
    });
  });
  window.addEventListener('resize', handleResize);
  const qAyah = Number(route.query.ayah);
  const qJuz = Number(route.query.juz);
  if (qAyah) {
    await nextTick();
    requestAnimationFrame(() => jumpToAyah(qAyah));
  } else if (qJuz) {
    const target = ayahs.value.find((a) => a.juz === qJuz);
    if (target) {
      await nextTick();
      requestAnimationFrame(() => jumpToAyah(target.ayahNumber));
    }
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div
    class="flex-1 flex flex-col bg-cyan-100 dark:bg-cyan-900 overflow-hidden select-none"
  >
    <ReaderHeader
      :surah-name="surahName"
      :surah-arabic="surahArabic"
      :ayah-count="ayahs.length"
      :current-juz="currentJuz"
      :surah-id="surahId"
      @back="router.push('/')"
      @settings="isSettingsOpen = true"
      @open-nav="isNavOpen = true"
    />

    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <p class="text-muted-foreground animate-pulse">Loading…</p>
    </div>
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <p class="text-destructive">{{ error }}</p>
    </div>

    <template v-else>
      <div
        ref="stageRef"
        aria-hidden="true"
        style="
          position: absolute;
          visibility: hidden;
          pointer-events: none;
          left: -624.9375rem;
        "
      >
        <div
          v-for="pageItem in bookPages"
          :key="pageItem.key"
          class="pf-page"
          :class="{
            'pf-cover-front': pageItem.type === 'cover-front',
            'pf-cover-back': pageItem.type === 'cover-back',
            'pf-blank': pageItem.type === 'blank',
          }"
          :data-density="
            pageItem.type === 'cover-front' || pageItem.type === 'cover-back'
              ? 'hard'
              : 'soft'
          "
        >
          <template v-if="pageItem.type === 'cover-front'">
            <div class="pf-cover-inner">
              <p class="pf-cover-label">Surah</p>
              <h2 class="pf-cover-title">{{ surahName }}</h2>
              <p v-if="surahTranslation" class="pf-cover-translation">
                {{ surahTranslation }}
              </p>
              <p class="pf-cover-arabic">{{ surahArabic }}</p>
            </div>
          </template>
          <template v-else-if="pageItem.type === 'ayah'">
            <div class="flex items-center justify-between">
              <div class="pf-badge">{{ pageItem.ayah.ayahNumber }}</div>
              <span
                class="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[0.625rem] font-semibold"
                >Juz {{ pageItem.ayah.juz }}</span
              >
            </div>
            <div class="pf-scroll">
              <p class="pf-arabic">{{ pageItem.ayah.arabic }}</p>
              <div class="pf-lower">
                <p class="pf-latin">{{ pageItem.ayah.latin }}</p>
                <p
                  class="pf-translation"
                  v-html="formatTranslation(pageItem.ayah.translation)"
                ></p>
                <div v-if="pageItem.ayah.footnote" class="pf-footnote">
                  <p class="pf-footnote-label">Catatan Kaki</p>
                  <p class="pf-footnote-text">{{ pageItem.ayah.footnote }}</p>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <main
        class="flex-1 flex items-center justify-center gap-1.5 sm:gap-3 overflow-visible px-1 sm:px-2 py-2 sm:py-4 relative"
      >
        <button
          class="nav-arrow w-8 h-8 sm:w-10 sm:h-10 shrink-0"
          :disabled="!hasPrevPage"
          aria-label="Halaman Sebelumnya"
          @click="flipPrev"
        >
          <ChevronLeft class="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <div ref="bookWrapRef" class="book-mount" />
        <button
          class="nav-arrow w-8 h-8 sm:w-10 sm:h-10 shrink-0"
          :disabled="!hasNextPage"
          aria-label="Halaman Berikutnya"
          @click="flipNext"
        >
          <ChevronRight class="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </main>

      <ReaderControls
        :left-ayah="leftAyah"
        :right-ayah="rightAyah"
        :total-ayahs="ayahs.length"
        :is-portrait="isPortrait"
        :is-playing="isPlaying"
        :is-continuous="isContinuous"
        :selected-qari="selectedQari"
        :playback-rate="playbackRate"
        @open-tafsir="openTafsir"
        @toggle-mode="isContinuous = !isContinuous"
        @toggle-play="togglePlay"
        @update:qari="selectedQari = $event"
        @update:rate="playbackRate = $event"
      />
    </template>

    <TafsirDrawer
      :is-open="isTafsirOpen"
      :ayah="tafsirAyah"
      @close="isTafsirOpen = false"
    />
    <ReadingSettingsDialog
      :open="isSettingsOpen"
      @update:open="isSettingsOpen = $event"
      @close="isSettingsOpen = false"
    />
    <QuickJumpDialog
      :open="isQuickJumpOpen"
      :current-surah-id="surahId"
      :jump-to-ayah="jumpToAyah"
      @update:open="isQuickJumpOpen = $event"
      @close="isQuickJumpOpen = false"
    />

    <!-- Navigation Drawer Sidebar -->
    <ReaderNavSidebar
      v-model:open="isNavOpen"
      mode="quran"
      :title="surahName"
      :subtitle="`${ayahs.length} Ayat · ${surahTranslation}`"
      :total-ayahs="ayahs.length"
      :active-ayah="
        activeAyahNumber ?? (leftAyah?.ayahNumber || rightAyah?.ayahNumber)
      "
      @select-ayah="jumpToAyah"
    />
  </div>
</template>
