<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { Ayah } from '@/features/reader/types'
import { useBookPages } from '@/features/reader/composables/useBookPages'
import { useBookFlip } from '@/features/reader/composables/useBookFlip'
import { useQuranAudio } from '@/features/reader/composables/useQuranAudio'
import { useLastRead } from '@/features/reader/composables/useLastRead'
import ReaderHeader from '@/features/reader/components/ReaderHeader.vue'
import ReaderControls from '@/features/reader/components/ReaderControls.vue'
import TafsirDrawer from '@/features/reader/components/TafsirDrawer.vue'
import ReadingSettingsDialog from '@/features/reader/components/ReadingSettingsDialog.vue'
import QuickJumpDialog from '@/features/reader/components/QuickJumpDialog.vue'
import { useReadingSettings } from '@/features/reader/composables/useReadingSettings'
import { useReaderShortcuts } from '@/features/reader/composables/useReaderShortcuts'
import '@/features/reader/reader.css'

const route = useRoute()
const router = useRouter()
const surahId = Number(route.params.id)

const ayahs = ref<Ayah[]>([])
const surahName = ref('')
const surahArabic = ref('')
const surahTranslation = ref('')
const loading = ref(true)
const error = ref<string | null>(null)

const stageRef = ref<HTMLElement | null>(null)
const bookWrapRef = ref<HTMLElement | null>(null)
const currentIndex = ref(0)
const isPortrait = ref(false)

const { isRtlBook, bookPages, hasPrevPage, hasNextPage, leftAyah, rightAyah, getAyahByPageIndex } = useBookPages(
  ayahs,
  surahArabic,
  currentIndex,
  isPortrait
)

const currentJuz = computed(() => leftAyah.value?.juz ?? rightAyah.value?.juz ?? null)

const { detectLayout, initPageFlip, handleResize, flipNext, flipPrev, goToPage, attachObserver } = useBookFlip({
  bookWrapRef,
  stageRef,
  bookPages,
  isRtlBook,
  currentIndex,
  isPortrait,
})

const { isPlaying, isContinuous, selectedQari, playbackRate, activeAyahNumber, togglePlay } = useQuranAudio({
  surahId,
  isPortrait,
  isRtlBook,
  bookPages,
  currentIndex,
  getAyahByPageIndex,
  onFlipNext: flipNext,
  onFlipPrev: flipPrev,
})

const isTafsirOpen = ref(false)
const tafsirTarget = ref<'left' | 'right'>('left')
const tafsirAyah = computed(() => (tafsirTarget.value === 'left' ? leftAyah.value : rightAyah.value))

function openTafsir(side: 'left' | 'right') {
  tafsirTarget.value = side
  isTafsirOpen.value = true
}

function formatTranslation(t: string): string {
  const esc = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return esc.replace(/(\d+)\)/g, '<sup class="footnote-marker">$1)</sup>')
}

const { saveLastRead } = useLastRead()
const { settings: readingSettings } = useReadingSettings()
const isSettingsOpen = ref(false)
const isQuickJumpOpen = ref(false)

function jumpToAyah(ayahNumber: number): boolean {
  const idx = bookPages.value.findIndex((p) => p.type === 'ayah' && p.ayah.ayahNumber === ayahNumber)
  if (idx === -1) return false
  goToPage(idx)
  return true
}

useReaderShortcuts({
  onFlipNext: flipNext,
  onFlipPrev: flipPrev,
  onTogglePlay: togglePlay,
  onToggleTafsir: () => {
    if (isTafsirOpen.value) isTafsirOpen.value = false
    else if (leftAyah.value || rightAyah.value) {
      tafsirTarget.value = leftAyah.value ? 'left' : 'right'
      isTafsirOpen.value = true
    }
  },
  onToggleSettings: () => (isSettingsOpen.value = !isSettingsOpen.value),
  onQuickJump: () => (isQuickJumpOpen.value = true),
  onClose: () => {
    if (isQuickJumpOpen.value) isQuickJumpOpen.value = false
    else if (isSettingsOpen.value) isSettingsOpen.value = false
    else if (isTafsirOpen.value) isTafsirOpen.value = false
  },
})

function attachScrollGuards() {
  if (!bookWrapRef.value) return
  const roots = bookWrapRef.value.querySelectorAll('.pf-scroll')
  roots.forEach((el) => {
    const container = el as HTMLElement
    if ((container as any)._scrollGuarded) return
    container.addEventListener(
      'wheel',
      (e: WheelEvent) => {
        const canScrollUp = container.scrollTop > 0 && e.deltaY < 0
        const canScrollDown = container.scrollTop + container.clientHeight < container.scrollHeight && e.deltaY > 0
        if (canScrollUp || canScrollDown) {
          container.scrollTop += e.deltaY
          e.stopPropagation()
          e.preventDefault()
        }
      },
      { passive: false, capture: true } as any
    )
    container.addEventListener(
      'mousedown',
      (e: MouseEvent) => {
        e.stopPropagation()
      },
      { capture: true } as any
    )
    let startY = 0
    container.addEventListener(
      'touchstart',
      (e: TouchEvent) => {
        if (e.touches.length === 1) {
          startY = e.touches[0].clientY
          e.stopPropagation()
        }
      },
      { passive: true, capture: true } as any
    )
    container.addEventListener(
      'touchmove',
      (e: TouchEvent) => {
        if (e.touches.length === 1) {
          const currentY = e.touches[0].clientY
          const deltaY = startY - currentY
          const canScrollUp = container.scrollTop > 0 && deltaY < 0
          const canScrollDown = container.scrollTop + container.clientHeight < container.scrollHeight && deltaY > 0
          if (canScrollUp || canScrollDown) {
            container.scrollTop += deltaY
            startY = currentY
            e.stopPropagation()
          }
        }
      },
      { passive: true, capture: true } as any
    )
    ;(container as any)._scrollGuarded = true
  })
}

function syncBookTheme() {
  if (!bookWrapRef.value) return
  const root = bookWrapRef.value
  root.style.setProperty('--arabic-size', readingSettings.value.arabicFontSize / 16 + 'rem')
  root.style.setProperty('--translation-size', readingSettings.value.translationFontSize / 16 + 'rem')
  root.style.setProperty('--latin-size', readingSettings.value.translationFontSize / 16 + 'rem')
  root.classList.remove('paper-sepia', 'paper-dark', 'paper-amoled', 'hide-arabic', 'hide-latin', 'hide-translation')
  if (readingSettings.value.paperTheme !== 'default') root.classList.add(`paper-${readingSettings.value.paperTheme}`)
  if (!readingSettings.value.showArabic) root.classList.add('hide-arabic')
  if (!readingSettings.value.showLatin) root.classList.add('hide-latin')
  if (!readingSettings.value.showTranslation) root.classList.add('hide-translation')
  ensureBookAlive()
  nextTick(() => requestAnimationFrame(() => attachScrollGuards()))
}

function ensureBookAlive() {
  if (!bookWrapRef.value || loading.value) return
  const hasBook = !!bookWrapRef.value.querySelector('.stf__parent')
  if (!hasBook) {
    nextTick(() => requestAnimationFrame(() => initPageFlip(true)))
  }
}

watch(
  () => [readingSettings.value.paperTheme, readingSettings.value.arabicFontSize, readingSettings.value.translationFontSize, readingSettings.value.showArabic, readingSettings.value.showLatin, readingSettings.value.showTranslation],
  () => {
    if (loading.value) return
    nextTick(() => requestAnimationFrame(() => syncBookTheme()))
  }
)

watch(activeAyahNumber, (num) => {
  if (!bookWrapRef.value) return
  const pages = bookWrapRef.value.querySelectorAll('.pf-page')
  pages.forEach((el) => {
    const badge = el.querySelector('.pf-badge')
    const n = badge ? Number(badge.textContent) : null
    el.classList.toggle('is-active-ayah', n !== null && n === num)
  })
})

  watch(
  [leftAyah, rightAyah, currentIndex],
  () => {
    const ayah = leftAyah.value ?? rightAyah.value
    if (!ayah || !surahName.value) return
    saveLastRead({
      surahId,
      surahName: surahName.value,
      surahArabic: surahArabic.value,
      ayahNumber: ayah.ayahNumber,
      totalAyahs: ayahs.value.length,
    })
    nextTick(() => requestAnimationFrame(() => attachScrollGuards()))
  }
)

onMounted(async () => {
  try {
    const [surahRes, ayahRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/surah/${surahId}`),
      fetch(`${import.meta.env.VITE_API_URL}/ayah/${surahId}`),
    ])
    const surahData = await surahRes.json()
    surahName.value = surahData.surahName || `Surah ${surahId}`
    surahArabic.value = surahData.arabic || ''
    surahTranslation.value = surahData.translation || surahData.indonesianTranslation || surahData.arti || ''
    ayahs.value = await ayahRes.json()
  } catch (err) {
    error.value = 'Failed to load Surah data'
    console.error(err)
  } finally {
    loading.value = false
  }
  await nextTick()
  detectLayout()
  await nextTick()
  requestAnimationFrame(() => {
    initPageFlip()
    attachObserver()
    requestAnimationFrame(() => {
      syncBookTheme()
      attachScrollGuards()
    })
  })
  window.addEventListener('resize', handleResize)
  const qAyah = Number(route.query.ayah)
  const qJuz = Number(route.query.juz)
  if (qAyah) {
    await nextTick()
    requestAnimationFrame(() => jumpToAyah(qAyah))
  } else if (qJuz) {
    const target = ayahs.value.find((a) => a.juz === qJuz)
    if (target) {
      await nextTick()
      requestAnimationFrame(() => jumpToAyah(target.ayahNumber))
    }
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="flex-1 flex flex-col bg-cyan-100 dark:bg-cyan-900 overflow-hidden select-none">
    <ReaderHeader :surah-name="surahName" :surah-arabic="surahArabic" :ayah-count="ayahs.length" :current-juz="currentJuz" @back="router.push('/')" @settings="isSettingsOpen = true" />

    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <p class="text-muted-foreground animate-pulse">Loading…</p>
    </div>
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <p class="text-destructive">{{ error }}</p>
    </div>

    <template v-else>
      <div ref="stageRef" aria-hidden="true" style="position: absolute; visibility: hidden; pointer-events: none; left: -624.9375rem">
        <div
          v-for="page in bookPages"
          :key="page.key"
          class="pf-page"
          :class="{
            'pf-cover-front': page.type === 'cover-front',
            'pf-cover-back': page.type === 'cover-back',
            'pf-blank': page.type === 'blank',
          }"
          :data-density="page.type === 'ayah' || page.type === 'blank' ? 'soft' : 'hard'"
        >
          <template v-if="page.type === 'cover-front'">
            <div class="pf-cover-inner">
              <p class="pf-cover-label">Surah</p>
              <h2 class="pf-cover-title">{{ surahName }}</h2>
              <p v-if="surahTranslation" class="pf-cover-translation">{{ surahTranslation }}</p>
              <p class="pf-cover-arabic">{{ surahArabic }}</p>
            </div>
          </template>
          <template v-else-if="page.type === 'ayah'">
            <div class="flex items-center justify-between">
              <div class="pf-badge">{{ page.ayah.ayahNumber }}</div>
              <span class="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[0.625rem] font-semibold">Juz {{ page.ayah.juz }}</span>
            </div>
            <div class="pf-scroll">
              <p class="pf-arabic">{{ page.ayah.arabic }}</p>
              <div class="pf-lower">
                <p class="pf-latin">{{ page.ayah.latin }}</p>
                <p class="pf-translation" v-html="formatTranslation(page.ayah.translation)"></p>
                <div v-if="page.ayah.footnote" class="pf-footnote">
                  <p class="pf-footnote-label">Catatan Kaki</p>
                  <p class="pf-footnote-text">{{ page.ayah.footnote }}</p>
                </div>
              </div>
            </div>
          </template>
          <div v-else-if="page.type === 'blank'" class="pf-blank-inner" />
          <div v-else class="pf-cover-back-inner" />
        </div>
      </div>

      <main class="flex-1 flex items-center justify-center gap-1.5 sm:gap-3 overflow-visible px-1 sm:px-2 py-2 sm:py-4 relative">
        <button class="nav-arrow w-8 h-8 sm:w-10 sm:h-10 shrink-0" :disabled="!hasPrevPage" aria-label="Halaman Sebelumnya" @click="flipPrev">
          <ChevronLeft class="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <div ref="bookWrapRef" class="book-mount" />
        <button class="nav-arrow w-8 h-8 sm:w-10 sm:h-10 shrink-0" :disabled="!hasNextPage" aria-label="Halaman Berikutnya" @click="flipNext">
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

    <TafsirDrawer :is-open="isTafsirOpen" :ayah="tafsirAyah" @close="isTafsirOpen = false" />
    <ReadingSettingsDialog :open="isSettingsOpen" @update:open="isSettingsOpen = $event" @close="isSettingsOpen = false" />
    <QuickJumpDialog :open="isQuickJumpOpen" :current-surah-id="surahId" :jump-to-ayah="jumpToAyah" @update:open="isQuickJumpOpen = $event" @close="isQuickJumpOpen = false" />
  </div>
</template>
