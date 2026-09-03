import { ref } from 'vue'

export interface LastRead {
  surahId: number
  surahName: string
  surahArabic: string
  ayahNumber: number
  totalAyahs: number
  timestamp: number
}

const STORAGE_KEY = 'myquran_last_read'

function readStorage(): LastRead | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LastRead
    if (!parsed.surahId || !parsed.surahName) return null
    return parsed
  } catch {
    return null
  }
}

const lastRead = ref<LastRead | null>(readStorage())

export function useLastRead() {
  function saveLastRead(data: Omit<LastRead, 'timestamp'>) {
    const entry: LastRead = { ...data, timestamp: Date.now() }
    lastRead.value = entry
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entry))
    } catch {}
  }

  function getLastRead(): LastRead | null {
    return lastRead.value
  }

  function clearLastRead() {
    lastRead.value = null
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }

  function timeAgo(ts: number): string {
    const diff = Date.now() - ts
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Baru saja'
    if (mins < 60) return `${mins} menit lalu`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} jam lalu`
    const days = Math.floor(hours / 24)
    if (days === 1) return 'Kemarin'
    return `${days} hari lalu`
  }

  return { lastRead, saveLastRead, getLastRead, clearLastRead, timeAgo }
}
