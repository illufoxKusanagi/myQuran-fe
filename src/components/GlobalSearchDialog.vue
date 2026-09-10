<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { Search, X, Loader2, BookOpen, ChevronRight } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { matchesTransliteration } from '@/lib/transliteration';

export interface SurahItem {
  id: number;
  surahName: string;
  arabic: string;
  numAyah: number;
  location: string;
}

export interface AyahSearchResult {
  id: number;
  surahId: number;
  surahName: string;
  surahLatin: string;
  surahArabic: string;
  ayahNumber: number;
  page: number;
  juz: number | null;
  arabic: string;
  latin: string;
  translation: string;
  footnote: string | null;
}

export interface AyahSearchResponse {
  query: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  results: AyahSearchResult[];
}

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  'update:open': [v: boolean];
  close: [];
}>();

const router = useRouter();
const query = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

const surahs = ref<SurahItem[]>([]);
const isSurahsLoaded = ref(false);

const ayahResults = ref<AyahSearchResult[]>([]);
const totalAyahs = ref(0);
const currentPage = ref(1);
const hasNextPage = ref(false);

const loading = ref(false);
const loadingMore = ref(false);
const searchError = ref<string | null>(null);

let activeAbortController: AbortController | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// Load Surah index once for quick matching
async function loadSurahs() {
  if (isSurahsLoaded.value) return;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/surah`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        surahs.value = data;
        isSurahsLoaded.value = true;
      }
    }
  } catch (err) {
    console.error('Failed to load surahs list:', err);
  }
}

// Client-side instant matching for Surahs using transliteration normalizer
const matchedSurahs = computed(() => {
  const q = query.value.trim();
  if (!q) return [];
  return surahs.value
    .filter(
      (s) =>
        matchesTransliteration(s.surahName, q) ||
        s.arabic.includes(q) ||
        String(s.id) === q ||
        String(s.id).startsWith(q)
    )
    .slice(0, 4);
});

async function executeAyahSearch(page = 1, append = false) {
  const q = query.value.trim();
  if (!q) {
    ayahResults.value = [];
    totalAyahs.value = 0;
    hasNextPage.value = false;
    loading.value = false;
    return;
  }

  if (activeAbortController) {
    activeAbortController.abort();
    activeAbortController = null;
  }

  const controller = new AbortController();
  activeAbortController = controller;

  if (append) {
    loadingMore.value = true;
  } else {
    loading.value = true;
    searchError.value = null;
  }

  try {
    const params = new URLSearchParams({
      q,
      page: String(page),
      limit: '20',
      withTafsir: 'false',
    });

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/ayah/search?${params}`,
      { signal: controller.signal }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: AyahSearchResponse = await res.json();

    if (append) {
      ayahResults.value = [...ayahResults.value, ...(data.results || [])];
    } else {
      ayahResults.value = data.results || [];
    }

    totalAyahs.value = data.pagination?.total || 0;
    currentPage.value = data.pagination?.page || 1;
    hasNextPage.value = Boolean(data.pagination?.hasNext);
  } catch (err: any) {
    if (err.name === 'AbortError') return;
    searchError.value = 'Gagal memuat hasil pencarian. Silakan coba lagi.';
  } finally {
    if (activeAbortController === controller) {
      loading.value = false;
      loadingMore.value = false;
      activeAbortController = null;
    }
  }
}

function handleInput() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    executeAyahSearch(1, false);
  }, 350);
}

function loadMore() {
  if (!hasNextPage.value || loadingMore.value) return;
  executeAyahSearch(currentPage.value + 1, true);
}

function close() {
  emit('update:open', false);
  emit('close');
}

function handleBackdrop(e: MouseEvent) {
  if (e.target === e.currentTarget) close();
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close();
}

function navigateToSurah(surahId: number) {
  close();
  router.push({ name: 'surah', params: { id: surahId } });
}

function navigateToAyah(surahId: number, ayahNumber: number) {
  close();
  router.push({
    name: 'surah',
    params: { id: surahId },
    query: { ayah: String(ayahNumber) },
  });
}

function highlightMatch(text: string, q: string): string {
  if (!text) return '';
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (!q.trim()) return escaped;
  const terms = q
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 1)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (terms.length === 0) return escaped;
  const regex = new RegExp(`(${terms.join('|')})`, 'gi');
  return escaped.replace(
    regex,
    '<mark class="bg-primary/20 text-primary font-semibold rounded px-0.5">$1</mark>'
  );
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      document.addEventListener('keydown', handleKeydown);
      loadSurahs();
      await nextTick();
      setTimeout(() => inputRef.value?.focus(), 50);
    } else {
      document.removeEventListener('keydown', handleKeydown);
      if (activeAbortController) {
        activeAbortController.abort();
        activeAbortController = null;
      }
      if (debounceTimer) clearTimeout(debounceTimer);
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
  if (activeAbortController) activeAbortController.abort();
  if (debounceTimer) clearTimeout(debounceTimer);
});
</script>

<template>
  <Transition name="search-dialog">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-16 bg-black/60 backdrop-blur-xs"
      @click="handleBackdrop"
    >
      <div
        class="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[82vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-label="Cari Ayat dan Surah"
      >
        <!-- Search Input Bar -->
        <div
          class="flex items-center px-4 border-b border-border bg-card shrink-0"
        >
          <Search class="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            placeholder="Cari ayat, kata kunci (puasa, wanita, nisa, dsb)..."
            class="flex-1 h-13 px-3.5 bg-transparent text-foreground placeholder:text-muted-foreground outline-hidden text-sm sm:text-base"
            @input="handleInput"
          />
          <Button
            v-if="query"
            variant="ghost"
            size="icon"
            class="w-7 h-7 text-muted-foreground hover:text-foreground shrink-0"
            @click="
              query = '';
              handleInput();
            "
          >
            <X class="w-4 h-4" />
          </Button>
          <div
            class="hidden sm:flex items-center pl-2 text-[0.6875rem] font-mono text-muted-foreground border-l border-border ml-1"
          >
            <kbd class="px-1.5 py-0.5 rounded bg-muted border border-border/80"
              >ESC</kbd
            >
          </div>
        </div>

        <!-- Scrollable Search Results -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Initial State (No Query) -->
          <div
            v-if="!query.trim()"
            class="py-12 text-center space-y-2 text-muted-foreground"
          >
            <BookOpen class="w-8 h-8 mx-auto opacity-40 mb-3" />
            <p class="text-sm font-medium text-foreground">
              Cari ayat di seluruh Al-Qur'an
            </p>
            <p
              class="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed"
            >
              Ketik nama surat seperti
              <span class="font-semibold text-foreground">"Nisa"</span>, atau
              topik seperti
              <span class="font-semibold text-foreground">"puasa"</span>,
              <span class="font-semibold text-foreground">"sedekah"</span>, atau
              <span class="font-semibold text-foreground">"surga"</span>.
            </p>
          </div>

          <!-- Section 1: Matching Surahs -->
          <div v-if="matchedSurahs.length > 0" class="space-y-2">
            <p
              class="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1"
            >
              Surah
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                v-for="s in matchedSurahs"
                :key="s.id"
                type="button"
                class="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/40 hover:bg-accent hover:border-primary/40 transition-colors text-left group cursor-pointer"
                @click="navigateToSurah(s.id)"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <span
                    class="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0"
                  >
                    {{ s.id }}
                  </span>
                  <div class="min-w-0">
                    <p
                      class="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors"
                    >
                      {{ s.surahName }}
                    </p>
                    <p class="text-[0.6875rem] text-muted-foreground">
                      {{ s.numAyah }} Ayat • {{ s.location }}
                    </p>
                  </div>
                </div>
                <span
                  class="font-arabic text-lg text-foreground/80 shrink-0 ml-2"
                  dir="rtl"
                >
                  {{ s.arabic }}
                </span>
              </button>
            </div>
          </div>

          <!-- Section 2: Ayah Matches -->
          <div v-if="query.trim()" class="space-y-3 pt-1">
            <div class="flex items-center justify-between px-1">
              <p
                class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Hasil Ayat <span v-if="totalAyahs > 0">({{ totalAyahs }})</span>
              </p>
              <Loader2
                v-if="loading"
                class="w-3.5 h-3.5 animate-spin text-primary"
              />
            </div>

            <!-- Loading Spinner -->
            <div
              v-if="loading && ayahResults.length === 0"
              class="py-12 text-center"
            >
              <Loader2 class="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
              <p class="text-xs text-muted-foreground">
                Mencari di seluruh Al-Qur'an...
              </p>
            </div>

            <!-- Error State -->
            <div
              v-else-if="searchError"
              class="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-center"
            >
              <p class="text-xs text-destructive">{{ searchError }}</p>
              <Button
                variant="outline"
                size="sm"
                class="mt-2 text-xs h-7"
                @click="executeAyahSearch(1, false)"
              >
                Coba Lagi
              </Button>
            </div>

            <!-- No Results Found -->
            <div
              v-else-if="
                !loading &&
                ayahResults.length === 0 &&
                matchedSurahs.length === 0
              "
              class="py-12 text-center space-y-1"
            >
              <p class="text-sm font-medium text-foreground">
                Tidak ada ayat ditemukan
              </p>
              <p class="text-xs text-muted-foreground">
                Coba gunakan kata kunci lain dalam bahasa Indonesia atau ejaan
                latin.
              </p>
            </div>

            <!-- Ayah Result Cards -->
            <div v-else class="space-y-2.5">
              <button
                type="button"
                v-for="ayah in ayahResults"
                :key="ayah.id"
                class="w-full text-left p-3.5 rounded-xl border border-border/70 bg-card hover:bg-accent/40 hover:border-primary/40 transition-all cursor-pointer space-y-2 group block"
                @click="navigateToAyah(ayah.surahId, ayah.ayahNumber)"
              >
                <!-- Card Header -->
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span
                      class="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold"
                    >
                      {{ ayah.surahName }} : {{ ayah.ayahNumber }}
                    </span>
                    <span
                      v-if="ayah.juz"
                      class="text-[0.6875rem] text-muted-foreground font-medium"
                    >
                      Juz {{ ayah.juz }}
                    </span>
                  </div>
                  <div
                    class="flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span>Buka ayat</span>
                    <ChevronRight class="w-3.5 h-3.5" />
                  </div>
                </div>

                <!-- Arabic Text Preview -->
                <p
                  class="font-arabic text-xl text-foreground leading-relaxed text-right line-clamp-2"
                  dir="rtl"
                >
                  {{ ayah.arabic }}
                </p>

                <!-- Translation with Highlighted Query -->
                <p
                  class="text-xs text-foreground/90 leading-relaxed text-justify line-clamp-3"
                  v-html="highlightMatch(ayah.translation, query)"
                ></p>
              </button>

              <!-- Load More Button -->
              <div v-if="hasNextPage" class="pt-2 text-center pb-2">
                <Button
                  variant="outline"
                  size="sm"
                  class="text-xs h-8 px-4 gap-2"
                  :disabled="loadingMore"
                  @click="loadMore"
                >
                  <Loader2
                    v-if="loadingMore"
                    class="w-3.5 h-3.5 animate-spin"
                  />
                  <span>{{
                    loadingMore ? 'Memuat...' : 'Muat Lebih Banyak'
                  }}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.search-dialog-enter-active,
.search-dialog-leave-active {
  transition: opacity 0.15s ease;
}
.search-dialog-enter-from,
.search-dialog-leave-to {
  opacity: 0;
}
</style>
