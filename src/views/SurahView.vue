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

const ayahs = ref<Ayah[]>([])
const surahName = ref('')
const surahArabic = ref('')
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

// The two currently visible ayahs (left page + right page in spread)
const leftAyah = computed<Ayah | undefined>(() => ayahs.value[currentIndex.value])
const rightAyah = computed<Ayah | undefined>(() => {
  if (isPortrait.value) return undefined
  return ayahs.value[currentIndex.value + 1]
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
  if (!bookWrapRef.value || !stageRef.value || ayahs.value.length === 0) return
  const pages = Array.from(stageRef.value.querySelectorAll('.pf-page'))
  if (pages.length === 0) return

  const wrap = bookWrapRef.value
  const containerW = wrap.clientWidth
  const containerH = wrap.clientHeight
  const pageW = isPortrait.value ? containerW : Math.floor(containerW / 2)

  book = new PageFlip(wrap, {
    width: pageW,
    height: containerH,
    showCover: false,
    useMouseEvents: true,
    drawShadow: true,
    maxShadowOpacity: 0.45,
    flippingTime: 600,
    usePortrait: isPortrait.value,
    autoSize: false,
  })

  book.loadFromHTML(pages)

  book.on('flip', (e: any) => {
    currentIndex.value = e.data
  })
}

// ── Navigation ─────────────────────────────────────────
function flipNext() {
  if (book && currentIndex.value < ayahs.value.length - 1) book.flipNext('top')
}

function flipPrev() {
  if (book && currentIndex.value > 0) book.flipPrev('top')
}

// ── Audio ──────────────────────────────────────────────
function getAudioUrl(ayahNumber: number) {
  const s = String(surahId).padStart(3, '0')
  const a = String(ayahNumber).padStart(3, '0')
  return `https://everyayah.com/data/Alafasy_128kbps/${s}${a}.mp3`
}

function playSingleAyah(index: number) {
  const ayah = ayahs.value[index]
  if (!ayah) { isPlaying.value = false; return }
  if (!audioEl) audioEl = new Audio()
  audioEl.src = getAudioUrl(ayah.ayahNumber)
  audioEl.play()
  isPlaying.value = true
}

/**
 * Play the current spread (left + right in two-page mode).
 * In two-page mode: plays left → right → (if continuous) flip → repeat.
 * In single-page mode: plays current → (if continuous) flip → repeat.
 * The page NEVER flips until both visible ayahs are done.
 */
function playSpread(startIndex: number) {
  const leftIdx = startIndex
  const rightIdx = isPortrait.value ? -1 : startIndex + 1
  const hasRight = rightIdx >= 0 && rightIdx < ayahs.value.length

  // Play the left page
  playSingleAyah(leftIdx)
  if (!audioEl) return

  audioEl.onended = () => {
    if (hasRight) {
      // Play the right page (no flip!)
      playSingleAyah(rightIdx)
      if (!audioEl) return
      audioEl.onended = () => {
        onSpreadDone(rightIdx)
      }
    } else {
      onSpreadDone(leftIdx)
    }
  }
}

function onSpreadDone(lastPlayedIndex: number) {
  if (isContinuous.value && lastPlayedIndex < ayahs.value.length - 1) {
    // Flip to next spread, then play it
    book?.flipNext('top')
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
        <div v-for="ayah in ayahs" :key="ayah.ayahNumber" class="pf-page">
          <div class="pf-badge">{{ ayah.ayahNumber }}</div>
          <p class="pf-arabic">{{ ayah.arabic }}</p>
          <div class="pf-lower">
            <p class="pf-latin">{{ ayah.latin }}</p>
            <p class="pf-translation">{{ ayah.translation }}</p>
          </div>
        </div>
      </div>

      <!-- Book + nav arrows -->
      <main class="flex-1 flex items-center justify-center gap-3 overflow-hidden px-2 py-4">
        <button class="nav-arrow" :disabled="currentIndex === 0" @click="flipPrev">
          <ChevronLeft class="w-5 h-5" />
        </button>

        <div ref="bookWrapRef" class="book-mount"></div>

        <button class="nav-arrow" :disabled="currentIndex >= ayahs.length - 1" @click="flipNext">
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
  display: flex;
  flex-direction: column;
  padding: 24px 20px 16px;
  gap: 14px;
  overflow: hidden;
  /* Prevent content from leaking into adjacent pages */
  contain: paint;
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
