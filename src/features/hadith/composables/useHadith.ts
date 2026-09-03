import { ref } from 'vue';
import type { HadithBook, Hadith, HadithPagination } from '../types';

const API = import.meta.env.VITE_API_URL;

export function useHadithBooks() {
  const books = ref<HadithBook[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchBooks() {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(`${API}/hadith/books`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      books.value = await res.json();
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  return { books, loading, error, fetchBooks };
}

export function useHadithList(bookSlug: string) {
  const hadiths = ref<Hadith[]>([]);
  const pagination = ref<HadithPagination | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const book = ref<HadithBook | null>(null);

  async function fetchList(page = 1, limit = 20, kitab?: number) {
    loading.value = true;
    error.value = null;
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (kitab) params.set('kitab', String(kitab));
      const res = await fetch(`${API}/hadith/${bookSlug}?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      book.value = data.book;
      hadiths.value = data.hadiths;
      pagination.value = data.pagination;
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  return { hadiths, pagination, book, loading, error, fetchList };
}

export function useHadithDetail(bookSlug: string, num: number) {
  const hadith = ref<Hadith | null>(null);
  const book = ref<HadithBook | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchOne() {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(`${API}/hadith/${bookSlug}/${num}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      hadith.value = data.hadith;
      book.value = data.book;
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  return { hadith, book, loading, error, fetchOne };
}

export function useRandomHadith() {
  const hadith = ref<Hadith | null>(null);
  const book = ref<HadithBook | null>(null);
  const loading = ref(false);

  async function fetchRandom(bookSlug?: string) {
    loading.value = true;
    try {
      const url = bookSlug
        ? `${API}/hadith/random?book=${bookSlug}`
        : `${API}/hadith/random`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const h = (data.hadith ?? data) as Hadith & {
        bookSlug?: string;
        bookName?: string;
      };
      hadith.value = h;
      if (data.book) {
        book.value = data.book;
      } else if ((h as any).bookSlug) {
        book.value = {
          id: 0,
          slug: (h as any).bookSlug,
          name: (h as any).bookName ?? (h as any).bookSlug,
          arabicName: '',
          author: '',
          totalHadith: 0,
          availableHadiths: 0,
        };
      } else {
        book.value = null;
      }
    } catch {
    } finally {
      loading.value = false;
    }
  }

  return { hadith, book, loading, fetchRandom };
}
