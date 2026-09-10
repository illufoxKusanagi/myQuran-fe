import { ref, computed, type Ref } from 'vue';
import { matchesTransliteration } from '@/lib/transliteration';

interface Surah {
  id: number;
  surahName: string;
  arabic: string;
  numAyah: number;
  location: string;
}

export function useSurahFilter(surahs: Ref<Surah[]>) {
  const query = ref('');

  const filtered = computed(() => {
    const q = query.value.trim();
    if (!q) return surahs.value;
    return surahs.value.filter(
      (s) =>
        matchesTransliteration(s.surahName, q) ||
        s.arabic.includes(q) ||
        String(s.id) === q ||
        String(s.id).startsWith(q) ||
        matchesTransliteration(s.location, q)
    );
  });

  return { query, filtered };
}
