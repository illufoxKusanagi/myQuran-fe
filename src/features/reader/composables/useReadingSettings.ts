import { ref, watch } from 'vue'

export type PaperTheme = 'default' | 'sepia' | 'dark' | 'amoled'

export interface ReadingSettings {
  arabicFontSize: number
  translationFontSize: number
  showLatin: boolean
  showTranslation: boolean
  paperTheme: PaperTheme
}

const STORAGE_KEY = 'myquran_reading_settings'

const defaults: ReadingSettings = {
  arabicFontSize: 26,
  translationFontSize: 12,
  showLatin: true,
  showTranslation: true,
  paperTheme: 'default',
}

function load(): ReadingSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaults }
    const parsed = JSON.parse(raw) as Partial<ReadingSettings>
    return {
      arabicFontSize: clamp(Number.isFinite(parsed.arabicFontSize as number) ? (parsed.arabicFontSize as number) : defaults.arabicFontSize, 20, 40),
      translationFontSize: clamp(Number.isFinite(parsed.translationFontSize as number) ? (parsed.translationFontSize as number) : defaults.translationFontSize, 11, 16),
      showLatin: parsed.showLatin ?? defaults.showLatin,
      showTranslation: parsed.showTranslation ?? defaults.showTranslation,
      paperTheme: isPaperTheme(parsed.paperTheme) ? parsed.paperTheme! : defaults.paperTheme,
    }
  } catch {
    return { ...defaults }
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function isPaperTheme(v: unknown): v is PaperTheme {
  return v === 'default' || v === 'sepia' || v === 'dark' || v === 'amoled'
}

const settings = ref<ReadingSettings>(load())

watch(
  settings,
  (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    } catch {}
  },
  { deep: true }
)

export function useReadingSettings() {
  function setArabicSize(v: number) {
    settings.value.arabicFontSize = clamp(v, 20, 40)
  }
  function setTranslationSize(v: number) {
    settings.value.translationFontSize = clamp(v, 11, 16)
  }
  function resetSettings() {
    settings.value = { ...defaults }
  }
  return { settings, setArabicSize, setTranslationSize, resetSettings }
}
