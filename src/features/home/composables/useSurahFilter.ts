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

  const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return surahs.value
    return surahs.value.filter(
      (s) =>
        s.surahName.toLowerCase().includes(q) ||
        s.arabic.includes(q) ||
        String(s.id).includes(q) ||
        s.location.toLowerCase().includes(q)
    )
  })

  return { query, filtered }
}
