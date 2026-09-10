import { ref } from 'vue';
import type { Ayah, SurahMeta, PaginationMeta } from '../types';

export interface PaginatedAyahResponse {
  surahId: number;
  pagination: PaginationMeta;
  ayahs: Ayah[];
}

export function useAyahList(surahId: number) {
  const ayahs = ref<Ayah[]>([]);
  const surahMeta = ref<SurahMeta | null>(null);
  const pagination = ref<PaginationMeta | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchSurahMeta() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/surah/${surahId}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      surahMeta.value = await res.json();
    } catch (e: any) {
      console.error('Failed to load surah meta:', e);
    }
  }

  let activeAbortController: AbortController | null = null;

  async function fetchAyahs(page = 1, limit = 20) {
    if (activeAbortController) {
      activeAbortController.abort();
    }
    const controller = new AbortController();
    activeAbortController = controller;

    loading.value = true;
    error.value = null;
    try {
      if (!surahMeta.value) {
        await fetchSurahMeta();
      }
      if (controller.signal.aborted) return;

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        paginate: 'true',
        withTafsir: 'false',
      });

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/ayah/${surahId}?${params}`,
        {
          signal: controller.signal,
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: PaginatedAyahResponse = await res.json();

      if (controller.signal.aborted) return;
      ayahs.value = Array.isArray(data.ayahs) ? data.ayahs : [];
      pagination.value = data.pagination || null;
    } catch (e: any) {
      if (e.name === 'AbortError' || controller.signal.aborted) return;
      error.value = e.message || 'Gagal memuat daftar ayat';
    } finally {
      if (activeAbortController === controller) {
        loading.value = false;
        activeAbortController = null;
      }
    }
  }

  return {
    ayahs,
    surahMeta,
    pagination,
    loading,
    error,
    fetchAyahs,
    fetchSurahMeta,
  };
}
