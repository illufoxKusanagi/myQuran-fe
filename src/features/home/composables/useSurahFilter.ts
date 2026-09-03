import { ref, computed, type Ref } from 'vue'

interface Surah {
  id: number
  surahName: string
  arabic: string
  numAyah: number
  location: string
}

export function useSurahFilter(surahs: Ref<Surah[]>) {
  const query = ref('')
  const tab = ref<'all' | 'Makkiyah' | 'Madaniyah'>('all')

  const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    return surahs.value.filter((s) => {
      const matchTab = tab.value === 'all' || s.location === tab.value
      if (!matchTab) return false
      if (!q) return true
      return (
        s.surahName.toLowerCase().includes(q) ||
        s.arabic.includes(q) ||
        String(s.id).includes(q) ||
        s.location.toLowerCase().includes(q)
      )
    })
  })

  return { query, tab, filtered }
}
