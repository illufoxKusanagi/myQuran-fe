<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PageFlip } from 'page-flip'
import {
  ArrowLeft, ChevronLeft, ChevronRight,
  Play, Pause, BookOpen, Repeat, ListMusic
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const route = useRoute()
const router = useRouter()
const surahId = Number(route.params.id)

interface Ayah {
  id: number
  surahId: number
  ayahNumber: number
  arabic: string
  latin: string
  translation: string
  wajizTafsir: string
  tahliliTafsir: string
  page: number
  juz: number
}

type BookPage =
  | { type: 'cover-front'; key: string }
  | { type: 'ayah'; key: string; ayah: Ayah; ayahIndex: number }
  | { type: 'blank'; key: string; side: 'front' | 'back' }
  | { type: 'cover-back'; key: string }

const ayahs = ref<Ayah[]>([])
const surahName = ref('')
const surahArabic = ref('')
const surahTranslation = ref('')
const loading = ref(true)
const error = ref<string | null>(null)

// PageFlip
const stageRef = ref<HTMLElement | null>(null)
const bookWrapRef = ref<HTMLElement | null>(null)
let book: any = null

// Index of the CURRENT page (0-based) — PageFlip emits the left-page index
const currentIndex = ref(0)

// Whether we're in portrait (single-page) mode
const isPortrait = ref(false)
const isRtlBook = computed(() => surahArabic.value.trim().length > 0)

/**
 * Book page order:
 * 1) front cover (hard)
 * 2) front blank page
 * 3) ayah pages (RTL spread order for Arabic)
 * 4) optional extra back blank when ayah count is odd
 * 5) back blank page
 * 6) back cover (hard)
 *
 * This keeps the spread aligned and makes ayah 1 start on page 3
 * when counting the front cover as page 1.
 */
const bookPages = computed<BookPage[]>(() => {
  const pages: BookPage[] = []

  if (!isRtlBook.value) {
    pages.push({ type: 'cover-front', key: 'cover-front' })
    pages.push({ type: 'blank', key: 'front-blank', side: 'front' })

    ayahs.value.forEach((ayah, i) => {
      pages.push({
        type: 'ayah',
        key: `ayah-${ayah.id ?? ayah.ayahNumber}`,
        ayah,
        ayahIndex: i
      })
    })

    // To maintain spread rhythm, padding is needed if length before back covers is odd
    if (pages.length % 2 !== 0) {
      pages.push({ type: 'blank', key: 'back-blank-extra', side: 'back' })
    }
    pages.push({ type: 'blank', key: 'back-blank', side: 'back' })
    pages.push({ type: 'cover-back', key: 'cover-back' })

  } else {
    // Logically build physical pages then reverse for perfect RTL simulation.
    const logicPages: BookPage[] = []
    logicPages.push({ type: 'cover-front', key: 'cover-front' })
    logicPages.push({ type: 'blank', key: 'front-blank', side: 'front' })

    ayahs.value.forEach((ayah, i) => {
      logicPages.push({
        type: 'ayah',
        key: `ayah-${ayah.id ?? ayah.ayahNumber}`,
        ayah,
        ayahIndex: i
      })
    })

    // Total length must be even so reversed array renders correctly.
    if ((logicPages.length + 2) % 2 !== 0) {
      logicPages.push({ type: 'blank', key: 'padding-extra', side: 'back' })
    }
    logicPages.push({ type: 'blank', key: 'back-blank', side: 'back' })
    logicPages.push({ type: 'cover-back', key: 'cover-back' })

    pages.push(...logicPages.reverse())
  }

  return pages
})

const totalBookPages = computed(() => bookPages.value.length)
const hasPrevPage = computed(() => currentIndex.value > 0)
const hasNextPage = computed(() => currentIndex.value < totalBookPages.value - 1)

const leftPage = computed<BookPage | undefined>(() => bookPages.value[currentIndex.value])
const rightPage = computed<BookPage | undefined>(() => {
  if (isPortrait.value) return undefined
  return bookPages.value[currentIndex.value + 1]
})

// The two currently visible ayahs (left page + right page in spread)
const leftAyah = computed<Ayah | undefined>(() => {
  if (leftPage.value?.type !== 'ayah') return undefined
  return leftPage.value.ayah
})

const rightAyah = computed<Ayah | undefined>(() => {
  if (rightPage.value?.type !== 'ayah') return undefined
  return rightPage.value.ayah
})

// Audio
const isPlaying = ref(false)
const isContinuous = ref(false)
let audioEl: HTMLAudioElement | null = null

// Tafsir — can show for left or right ayah
const isTafsirOpen = ref(false)
const tafsirTarget = ref<'left' | 'right'>('left')
const tafsirAyah = computed(() => tafsirTarget.value === 'left' ? leftAyah.value : rightAyah.value)

// ── Load data ──────────────────────────────────────────
onMounted(async () => {
  try {
    const [surahRes, ayahRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/surah/${surahId}`),
      fetch(`${import.meta.env.VITE_API_URL}/ayah/${surahId}`)
    ])
    const surahData = await surahRes.json()
    surahName.value = surahData.surahName || `Surah ${surahId}`
    surahArabic.value = surahData.arabic || ''
    surahTranslation.value =
      surahData.translation || surahData.indonesianTranslation || surahData.arti || ''
    ayahs.value = await ayahRes.json()
  } catch (err) {
    error.value = 'Failed to load Surah data'
    console.error(err)
  } finally {
    loading.value = false
  }

  await nextTick()
  detectLayout()
  initPageFlip()
  window.addEventListener('resize', handleResize)
})

function detectLayout() {
  // md breakpoint = 768px
  isPortrait.value = window.innerWidth < 768
}

let resizeTimeout: number | null = null
function handleResize() {
  // Debounce to avoid rebuilding on every pixel
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = window.setTimeout(() => {
    const wasPortrait = isPortrait.value
    detectLayout()
    // Reinit if mode changed
    if (wasPortrait !== isPortrait.value) {
      book?.destroy()
      book = null
      nextTick(() => initPageFlip())
    }
  }, 250)
}

function initPageFlip() {
  if (!bookWrapRef.value || !stageRef.value || bookPages.value.length === 0) return
  const pages = Array.from(stageRef.value.querySelectorAll('.pf-page'))
  if (pages.length === 0) return

  const wrap = bookWrapRef.value
  const containerW = wrap.clientWidth
  const containerH = wrap.clientHeight
  const pageW = isPortrait.value ? containerW : Math.floor(containerW / 2)

  // RTL starts at the very end of the array (the visual Front Cover).
  const startPage = isRtlBook.value ? Math.max(0, bookPages.value.length - 1) : 0

  book = new PageFlip(wrap, {
    width: pageW,
    height: containerH,
    // `showCover: true` tells StPageFlip to treat first/last pages as hard covers.
    showCover: true,
    useMouseEvents: true,
    drawShadow: true,
    maxShadowOpacity: 0.45,
    flippingTime: 600,
    startZIndex: 10,
    startPage,
    usePortrait: isPortrait.value,
    autoSize: false,
  })

  book.loadFromHTML(pages)
  currentIndex.value = startPage

  book.on('flip', (e: any) => {
    currentIndex.value = e.data
  })
}

// ── Navigation ─────────────────────────────────────────
function flipNext() {
  if (book && hasNextPage.value) book.flipNext('top')
}

function flipPrev() {
  if (book && hasPrevPage.value) book.flipPrev('top')
}

const leftArrowDisabled = computed(() => !hasPrevPage.value)
const rightArrowDisabled = computed(() => !hasNextPage.value)

function onLeftArrow() {
  // Arrow Left = user visually pulling left page backward. 
  // Native PageFlip flipPrev does exactly this.
  flipPrev()
}

function onRightArrow() {
  // Arrow Right = user visually pulling right page forward.
  // Native PageFlip flipNext does exactly this.
  flipNext()
}

// ── Audio ──────────────────────────────────────────────
function getAudioUrl(ayahNumber: number) {
  const s = String(surahId).padStart(3, '0')
  const a = String(ayahNumber).padStart(3, '0')
  return `https://everyayah.com/data/Alafasy_128kbps/${s}${a}.mp3`
}

function getAyahByPageIndex(pageIndex: number) {
  const page = bookPages.value[pageIndex]
  if (!page || page.type !== 'ayah') return undefined
  return page.ayah
}

function hasContentToAdvance(lastVisibleIndex: number) {
  if (isRtlBook.value) {
    // Array is reversed. Next unread content belongs to lower indices.
    return bookPages.value.slice(0, lastVisibleIndex).some(page => page.type === 'ayah')
  } else {
    return bookPages.value.slice(lastVisibleIndex + 1).some(page => page.type === 'ayah')
  }
}

function playSingleAyah(pageIndex: number) {
  const ayah = getAyahByPageIndex(pageIndex)
  if (!ayah) return false
  if (!audioEl) audioEl = new Audio()
  audioEl.src = getAudioUrl(ayah.ayahNumber)
  audioEl.play()
  isPlaying.value = true
  return true
}

/**
 * Play the current spread (left + right in two-page mode).
 * In two-page mode: plays left → right → (if continuous) flip → repeat.
 * In single-page mode: plays current → (if continuous) flip → repeat.
 * The page NEVER flips until both visible ayahs are done.
 */
function playSpread(startIndex: number) {
  const visiblePageIndexes = isPortrait.value
    ? [startIndex]
    : [startIndex, startIndex + 1]

  const readingOrderIndexes = (!isPortrait.value && isRtlBook.value)
    ? [...visiblePageIndexes].reverse()
    : visiblePageIndexes

  const playablePageIndexes = readingOrderIndexes.filter(
    pageIndex => getAyahByPageIndex(pageIndex) !== undefined
  )

  if (playablePageIndexes.length === 0) {
    isPlaying.value = false
    return
  }

  const lastVisibleIndex = visiblePageIndexes[visiblePageIndexes.length - 1]

  const playQueue = (queueIndex: number) => {
    const started = playSingleAyah(playablePageIndexes[queueIndex])
    if (!started || !audioEl) {
      isPlaying.value = false
      return
    }

    audioEl.onended = () => {
      if (queueIndex < playablePageIndexes.length - 1) {
        playQueue(queueIndex + 1)
      } else {
        onSpreadDone(lastVisibleIndex)
      }
    }
  }

  playQueue(0)
}

function onSpreadDone(lastVisibleIndex: number) {
  if (isContinuous.value && hasContentToAdvance(lastVisibleIndex)) {
    // Flip physically left-to-right (prev) to advance if RTL book
    if (isRtlBook.value) book?.flipPrev('top')
    else book?.flipNext('top')

    setTimeout(() => {
      // currentIndex will be updated by the 'flip' event
      playSpread(currentIndex.value)
    }, 800)
  } else {
    isPlaying.value = false
  }
}

function togglePlay() {
  if (isPlaying.value) {
    audioEl?.pause()
    isPlaying.value = false
  } else {
    playSpread(currentIndex.value)
  }
}

onBeforeUnmount(() => {
  audioEl?.pause()
  book?.destroy()
  window.removeEventListener('resize', handleResize)
})

// ── Tafsir ─────────────────────────────────────────────
function openTafsir(side: 'left' | 'right') {
  tafsirTarget.value = side
  isTafsirOpen.value = true
}
</script>

<template>
  <div class="flex-1 flex flex-col bg-cyan-100 dark:bg-cyan-900 overflow-hidden select-none">

    <!-- ─── Rotate prompt (commented out, keeping for future use) ──
    <div class="landscape-only-overlay">
      <RotateCw class="w-12 h-12 text-muted-foreground mb-4" />
      <p class="text-foreground font-semibold text-lg">Please rotate your device</p>
      <p class="text-muted-foreground text-sm mt-1">The reading view requires landscape orientation</p>
    </div>
    -->

    <!-- ─── Header ──────────────────────────────────────── -->
    <header class="shrink-0 h-14 border-b border-border bg-card flex items-center gap-3 px-4">
      <Button variant="ghost" size="icon" @click="router.push('/')">
        <ArrowLeft class="w-5 h-5" />
      </Button>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-foreground leading-none truncate">{{ surahName }}</p>
        <p class="text-xs text-muted-foreground mt-0.5">{{ ayahs.length }} Ayahs</p>
      </div>
      <p class="text-2xl text-foreground leading-none shrink-0 font-arabic">{{ surahArabic }}</p>
    </header>

    <!-- ─── States ──────────────────────────────────────── -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <p class="text-muted-foreground animate-pulse">Loading…</p>
    </div>
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <p class="text-destructive">{{ error }}</p>
    </div>

    <!-- ─── Book area ────────────────────────────────────── -->
    <template v-else>

      <!-- Hidden staging div — PageFlip reads .pf-page nodes from here -->
      <div ref="stageRef" aria-hidden="true"
        style="position:absolute;visibility:hidden;pointer-events:none;left:-9999px;">
        <!-- Only covers are hard pages. Ayah and blank leaves stay soft. -->
        <div v-for="page in bookPages" :key="page.key" class="pf-page" :class="{
          'pf-cover-front': page.type === 'cover-front',
          'pf-cover-back': page.type === 'cover-back',
          'pf-blank': page.type === 'blank',
          'pf-blank-front': page.type === 'blank' && page.side === 'front',
          'pf-blank-back': page.type === 'blank' && page.side === 'back'
        }" :data-density="page.type === 'ayah' || page.type === 'blank' ? 'soft' : 'hard'">
          <!-- Front cover content (title, Indonesian translation, Arabic) -->
          <template v-if="page.type === 'cover-front'">
            <div class="pf-cover-inner">
              <p class="pf-cover-label">Surah</p>
              <h2 class="pf-cover-title">{{ surahName }}</h2>
              <p v-if="surahTranslation" class="pf-cover-translation">{{ surahTranslation }}</p>
              <p class="pf-cover-arabic">{{ surahArabic }}</p>
            </div>
          </template>

          <!-- Main ayah page content -->
          <template v-else-if="page.type === 'ayah'">
            <div class="pf-badge">{{ page.ayah.ayahNumber }}</div>
            <p class="pf-arabic">{{ page.ayah.arabic }}</p>
            <div class="pf-lower">
              <p class="pf-latin">{{ page.ayah.latin }}</p>
              <p class="pf-translation">{{ page.ayah.translation }}</p>
            </div>
          </template>

          <!-- Blank helper leaves used to keep pagination/book rhythm -->
          <div v-else-if="page.type === 'blank'" class="pf-blank-inner" />

          <!-- Back cover is intentionally visual-only -->
          <div v-else class="pf-cover-back-inner" />
        </div>
      </div>

      <!-- Book + nav arrows -->
      <main class="flex-1 flex items-center justify-center gap-3 overflow-visible px-2 py-4">
        <button class="nav-arrow" :disabled="leftArrowDisabled" @click="onLeftArrow">
          <ChevronLeft class="w-5 h-5" />
        </button>

        <div ref="bookWrapRef" class="book-mount"></div>

        <button class="nav-arrow" :disabled="rightArrowDisabled" @click="onRightArrow">
          <ChevronRight class="w-5 h-5" />
        </button>
      </main>

      <!-- ─── Bottom control bar ──────────────────────────── -->
      <footer class="shrink-0 border-t border-border bg-card flex items-center justify-between px-3 py-2.5 gap-2">

        <!-- Left side: ayah info for both visible pages -->
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <!-- Left page info -->
          <div v-if="leftAyah" class="flex items-center gap-2 min-w-0">
            <span class="text-xs shrink-0 font-semibold text-foreground tabular-nums">
              {{ leftAyah.ayahNumber }}
            </span>
            <Button variant="ghost" size="icon" class="w-7 h-7" @click="openTafsir('left')" title="Tafsir left page">
              <BookOpen class="w-3.5 h-3.5" />
            </Button>
          </div>

          <!-- Separator & right page info (only in two-page mode) -->
          <template v-if="rightAyah && !isPortrait">
            <span class="text-border">|</span>
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-xs shrink-0 font-semibold text-foreground tabular-nums">
                {{ rightAyah.ayahNumber }}
              </span>
              <Button variant="ghost" size="icon" class="w-7 h-7" @click="openTafsir('right')"
                title="Tafsir right page">
                <BookOpen class="w-3.5 h-3.5" />
              </Button>
            </div>
          </template>

          <span class="text-xs text-muted-foreground ml-1">/ {{ ayahs.length }}</span>
        </div>

        <!-- Right side: audio controls -->
        <div class="flex items-center gap-2 shrink-0">
          <button class="flex items-center gap-1.5 text-xs font-medium transition-colors px-2 py-1 rounded-md"
            :class="isContinuous ? 'text-primary bg-primary/10' : 'text-muted-foreground'"
            @click="isContinuous = !isContinuous">
            <ListMusic v-if="isContinuous" class="w-3.5 h-3.5" />
            <Repeat v-else class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">{{ isContinuous ? 'Continuous' : 'Separate' }}</span>
          </button>

          <Button size="icon" class="rounded-full w-9 h-9" @click="togglePlay">
            <Pause v-if="isPlaying" class="w-4 h-4" />
            <Play v-else class="w-4 h-4 ml-px" />
          </Button>
        </div>
      </footer>
    </template>

    <!-- ─── Tafsir drawer ────────────────────────────────── -->
    <Transition name="drawer">
      <div v-if="isTafsirOpen" class="fixed inset-0 z-50">
        <div class="drawer-backdrop" @click="isTafsirOpen = false" />
        <div class="drawer-panel">
          <!-- Sticky header -->
          <div class="sticky top-0 bg-card flex items-start justify-between p-4 border-b border-border z-10">
            <div>
              <p class="font-semibold text-foreground">Tafsir</p>
              <p class="text-xs text-muted-foreground">Ayah {{ tafsirAyah?.ayahNumber }}</p>
            </div>
            <Button variant="ghost" size="sm" @click="isTafsirOpen = false">Close</Button>
          </div>

          <div v-if="tafsirAyah" class="p-5 space-y-5">
            <!-- Arabic preview -->
            <div class="rounded-lg bg-muted p-4">
              <p class="font-arabic text-2xl text-foreground leading-loose" dir="rtl" style="text-align:right;">
                {{ tafsirAyah.arabic }}
              </p>
              <p class="text-muted-foreground text-sm mt-2 italic">{{ tafsirAyah.translation }}</p>
            </div>

            <div>
              <p class="text-sm font-semibold text-foreground mb-2">Tafsir Wajiz</p>
              <p class="text-sm text-muted-foreground leading-relaxed">
                {{ tafsirAyah.wajizTafsir || 'Not available.' }}
              </p>
            </div>

            <div class="border-t border-border pt-4">
              <p class="text-sm font-semibold text-foreground mb-2">Tafsir Tahlili</p>
              <p class="text-sm text-muted-foreground leading-relaxed">
                {{ tafsirAyah.tahliliTafsir || 'Not available.' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/*
── Rotate overlay (commented out — kept for future use) ──
.landscape-only-overlay {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 100;
  background: oklch(var(--background));
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}
@media (max-width: 768px) and (orientation: portrait) {
  .landscape-only-overlay {
    display: flex;
  }
}
*/

/* ── Book mount ──────────────────────────────────────── */
.book-mount {
  /* two-page on desktop, narrower on mobile for single-page */
  width: min(880px, calc(100vw - 120px));
  height: min(640px, calc(100vh - 160px));
  position: relative;
  border-radius: 8px;
  overflow: visible;
  box-shadow:
    0 16px 28px rgba(15, 23, 42, 0.12),
    0 3px 8px rgba(15, 23, 42, 0.08),
    inset 0 0 0 1px rgba(15, 23, 42, 0.05);
}

@media (max-width: 767px) {
  .book-mount {
    width: min(400px, calc(100vw - 80px));
    height: min(600px, calc(100vh - 160px));
  }
}

/* ── Nav arrows ──────────────────────────────────────── */
.nav-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: oklch(from var(--card) l c h);
  border: 1px solid oklch(from var(--border) l c h);
  color: oklch(from var(--foreground) l c h);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s, opacity 0.2s;
}

.nav-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-arrow:not(:disabled):hover {
  background-color: oklch(from var(--muted) l c h);
}

/* ── Drawer ──────────────────────────────────────────── */
.drawer-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

.drawer-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--card);
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.15);
}

/* ── Transition ──────────────────────────────────────── */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
</style>

<!-- ── Global styles for PageFlip-rendered pages ─────── -->
<style>
/* Font class reusable across pages and drawer */
.font-arabic {
  font-family: 'LPMQ Isep Misbah', 'Amiri', 'Traditional Arabic', serif;
}

/* PageFlip page container */
.pf-page {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  /* Use solid white background, not oklch variable — avoids cross-browser paint issues */
  background: #ffffff;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  padding: 24px 20px 16px;
  gap: 14px;
  overflow: hidden;
  /* Prevent content from leaking into adjacent pages */
  contain: paint;
}

.pf-page.--hard {
  /* Default base for hard pages (covers). */
  background: #efe1c7;
  border-color: #d5c1a0;
}

/* Book-specific page roles. */
.pf-cover-front,
.pf-cover-back,
.pf-blank {
  gap: 0;
}

.pf-cover-front,
.pf-cover-back {
  /* Cover spacing. Increase/decrease for different visual density. */
  padding: 28px 22px;
}

.pf-cover-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 10px;
}

.pf-cover-label {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8b6d45;
}

.pf-cover-title {
  margin: 0;
  font-size: clamp(22px, 4vw, 34px);
  line-height: 1.2;
  font-weight: 700;
  color: #6f5332;
}

.pf-cover-translation {
  margin: 0;
  font-size: 13px;
  color: #8b6d45;
}

.pf-cover-arabic {
  margin: 4px 0 0;
  font-family: 'LPMQ Isep Misbah', 'Amiri', 'Traditional Arabic', serif;
  direction: rtl;
  text-align: center;
  line-height: 1.8;
  font-size: clamp(24px, 4.5vw, 36px);
  color: #5d4428;
}

.pf-cover-back {
  /* Back cover color. */
  background: #ddc8a6;
}

.pf-cover-back-inner {
  width: 100%;
  height: 100%;
  border: 1px solid rgba(111, 83, 50, 0.16);
  border-radius: 2px;
}

.pf-blank {
  /* Blank leaf color between content and back cover. */
  background: #fbf8f2;
}

/*
  Cover customization guide:
  1) Change front cover color by adding `background` in .pf-cover-front.
  2) Change back cover color in .pf-cover-back.
  3) Change blank leaf color in .pf-blank.
  4) Change title/arabic text colors in .pf-cover-title and .pf-cover-arabic.

  Example front cover image:
  .pf-cover-front {
    background-image: url('/images/your-cover.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
*/

.pf-blank-inner {
  width: 100%;
  height: 100%;
}

.pf-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1.5px solid #d4d4d8;
  font-size: 11px;
  font-weight: 600;
  color: #71717a;
  flex-shrink: 0;
}

.pf-arabic {
  font-family: 'LPMQ Isep Misbah', 'Amiri', 'Traditional Arabic', serif;
  direction: rtl;
  text-align: right;
  font-size: clamp(18px, 3.5vw, 26px);
  line-height: 2;
  /* Use a solid dark color for maximum cross-browser compatibility */
  color: #18181b;
  flex: 1;
  overflow: hidden;
  /* Force text wrapping so long ayahs don't overflow the page */
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Match StPageFlip demo strategy: page-depth belongs to each page layer */
.pf-page.--left {
  border-right: 0;
  box-shadow: inset -10px 0 26px -10px rgba(15, 23, 42, 0.24);
}

.pf-page.--right {
  border-left: 0;
  box-shadow: inset 10px 0 26px -10px rgba(15, 23, 42, 0.24);
}

.pf-lower {
  border-top: 1px solid #e4e4e7;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pf-latin {
  font-size: 12px;
  font-weight: 500;
  color: #18181b;
  line-height: 1.5;
}

.pf-translation {
  font-size: 11px;
  color: #71717a;
  line-height: 1.4;
}
</style>
