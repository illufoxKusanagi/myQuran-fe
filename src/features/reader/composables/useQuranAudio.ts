import { ref, watch, onBeforeUnmount, type Ref, type ComputedRef } from 'vue'
import type { Ayah, BookPage } from '../types'
import { QARIS } from './useQariSettings'

const QARI_KEY = 'myquran_qari'
const RATE_KEY = 'myquran_playback_rate'

function loadQari(): string {
  try {
    const v = localStorage.getItem(QARI_KEY)
    if (v && QARIS.some((q) => q.id === v)) return v
  } catch {}
  return 'alafasy'
}

function loadRate(): number {
  try {
    const v = Number(localStorage.getItem(RATE_KEY))
    if ([0.75, 1, 1.25, 1.5].includes(v)) return v
  } catch {}
  return 1
}

interface AudioOptions {
  surahId: number
  isPortrait: Ref<boolean>
  isRtlBook: ComputedRef<boolean>
  bookPages: ComputedRef<BookPage[]>
  currentIndex: Ref<number>
  getAyahByPageIndex: (pageIndex: number) => Ayah | undefined
  onFlipNext: () => void
  onFlipPrev: () => void
}

export function useQuranAudio(options: AudioOptions) {
  const isPlaying = ref(false)
  const isContinuous = ref(false)
  const selectedQari = ref<string>(loadQari())
  const playbackRate = ref<number>(loadRate())
  const activeAyahNumber = ref<number | null>(null)
  let audioEl: HTMLAudioElement | null = null
  let pendingFlipTimeout: number | null = null

  function clearPendingTimeout() {
    if (pendingFlipTimeout !== null) {
      clearTimeout(pendingFlipTimeout)
      pendingFlipTimeout = null
    }
  }

  watch(selectedQari, (v) => {
    try {
      localStorage.setItem(QARI_KEY, v)
    } catch {}
  })
  watch(playbackRate, (v) => {
    try {
      localStorage.setItem(RATE_KEY, String(v))
    } catch {}
    if (audioEl) audioEl.playbackRate = v
  })

  function getQariFolder(): string {
    return QARIS.find((q) => q.id === selectedQari.value)?.folder ?? 'Alafasy_128kbps'
  }

  function getAudioUrl(ayahNumber: number): string {
    const s = String(options.surahId).padStart(3, '0')
    const a = String(ayahNumber).padStart(3, '0')
    return `https://everyayah.com/data/${getQariFolder()}/${s}${a}.mp3`
  }

  function hasContentToAdvance(firstVisibleIndex: number, lastVisibleIndex: number): boolean {
    if (options.isRtlBook.value) return options.bookPages.value.slice(0, firstVisibleIndex).some((p) => p.type === 'ayah')
    return options.bookPages.value.slice(lastVisibleIndex + 1).some((p) => p.type === 'ayah')
  }

  function playSingleAyah(pageIndex: number): boolean {
    const ayah = options.getAyahByPageIndex(pageIndex)
    if (!ayah) return false
    if (!audioEl) audioEl = new Audio()
    activeAyahNumber.value = ayah.ayahNumber
    audioEl.onerror = () => {
      console.warn('Audio failed to load:', audioEl?.src)
      clearPendingTimeout()
      isPlaying.value = false
      activeAyahNumber.value = null
    }
    audioEl.src = getAudioUrl(ayah.ayahNumber)
    audioEl.playbackRate = playbackRate.value
    audioEl.play().catch((err) => {
      console.warn('Audio play interrupted:', err)
      isPlaying.value = false
      activeAyahNumber.value = null
    })
    isPlaying.value = true
    return true
  }

  function playSpread(startIndex: number) {
    const visiblePageIndexes = options.isPortrait.value ? [startIndex] : [startIndex, startIndex + 1]
    const readingOrderIndexes =
      !options.isPortrait.value && options.isRtlBook.value ? [...visiblePageIndexes].reverse() : visiblePageIndexes
    const playablePageIndexes = readingOrderIndexes.filter((idx) => options.getAyahByPageIndex(idx) !== undefined)

    if (playablePageIndexes.length === 0) {
      isPlaying.value = false
      activeAyahNumber.value = null
      return
    }

    const firstVisibleIndex = visiblePageIndexes[0]
    const lastVisibleIndex = visiblePageIndexes[visiblePageIndexes.length - 1]

    const playQueue = (queueIndex: number) => {
      const started = playSingleAyah(playablePageIndexes[queueIndex])
      if (!started || !audioEl) {
        isPlaying.value = false
        activeAyahNumber.value = null
        return
      }
      audioEl.onended = () => {
        if (queueIndex < playablePageIndexes.length - 1) playQueue(queueIndex + 1)
        else onSpreadDone(firstVisibleIndex, lastVisibleIndex)
      }
    }

    playQueue(0)
  }

  function onSpreadDone(firstVisibleIndex: number, lastVisibleIndex: number) {
    if (isContinuous.value && hasContentToAdvance(firstVisibleIndex, lastVisibleIndex)) {
      if (options.isRtlBook.value) options.onFlipPrev()
      else options.onFlipNext()
      clearPendingTimeout()
      pendingFlipTimeout = window.setTimeout(() => playSpread(options.currentIndex.value), 800)
    } else {
      isPlaying.value = false
      activeAyahNumber.value = null
    }
  }

  function togglePlay() {
    if (isPlaying.value) {
      clearPendingTimeout()
      audioEl?.pause()
      isPlaying.value = false
      activeAyahNumber.value = null
    } else {
      playSpread(options.currentIndex.value)
    }
  }

  function stopAudio() {
    clearPendingTimeout()
    if (audioEl) {
      audioEl.pause()
      audioEl.currentTime = 0
    }
    isPlaying.value = false
    activeAyahNumber.value = null
  }

  onBeforeUnmount(() => {
    clearPendingTimeout()
    stopAudio()
    audioEl = null
  })

  return { isPlaying, isContinuous, selectedQari, playbackRate, activeAyahNumber, togglePlay, stopAudio, playSpread, playSingleAyah, getAudioUrl }
}
