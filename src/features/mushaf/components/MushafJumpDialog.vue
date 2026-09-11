<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { X, Search, BookOpen, Layers, Hash } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { JUZ_PAGES, SURAHS_PAGES, TOTAL_MUSHAF_PAGES } from '../mushafData';
import { matchesTransliteration } from '@/lib/transliteration';

const props = defineProps<{
  open: boolean;
  currentPage: number;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  jump: [pageNumber: number];
}>();

type TabType = 'page' | 'juz' | 'surah';
const activeTab = ref<TabType>('page');

const inputPage = ref<number>(props.currentPage || 1);
const surahQuery = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      inputPage.value = props.currentPage || 1;
      surahQuery.value = '';
      if (activeTab.value === 'page') {
        nextTick(() => inputRef.value?.focus());
      }
    }
  }
);

watch(activeTab, (tab) => {
  if (tab === 'page') {
    nextTick(() => inputRef.value?.focus());
  }
});

function close() {
  emit('update:open', false);
}

function handleBackdrop(e: MouseEvent) {
  if (e.target === e.currentTarget) close();
}

function submitPage() {
  const p = Math.max(
    1,
    Math.min(TOTAL_MUSHAF_PAGES, Number(inputPage.value) || 1)
  );
  emit('jump', p);
  close();
}

function selectJuz(startPage: number) {
  emit('jump', startPage);
  close();
}

function selectSurah(startPage: number) {
  emit('jump', startPage);
  close();
}

const filteredSurahs = computed(() => {
  const q = surahQuery.value.trim();
  if (!q) return SURAHS_PAGES;
  return SURAHS_PAGES.filter(
    (s) =>
      matchesTransliteration(s.name, q) ||
      s.arabic.includes(q) ||
      String(s.id) === q ||
      String(s.id).startsWith(q)
  );
});
</script>

<template>
  <Transition name="jump-modal">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      @click="handleBackdrop"
    >
      <div
        class="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <!-- Modal Header -->
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-border/80"
        >
          <div class="flex items-center gap-2">
            <BookOpen class="w-4 h-4 text-primary" />
            <h2 class="text-sm font-semibold text-foreground">
              Pindah Halaman Mushaf
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            class="h-7 w-7 rounded-lg"
            @click="close"
          >
            <X class="w-4 h-4" />
          </Button>
        </div>

        <!-- Navigation Tabs -->
        <div
          class="grid grid-cols-3 gap-1 p-2 bg-muted/40 border-b border-border/60"
        >
          <button
            type="button"
            class="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            :class="
              activeTab === 'page'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="activeTab = 'page'"
          >
            <Hash class="w-3.5 h-3.5" />
            <span>Halaman</span>
          </button>
          <button
            type="button"
            class="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            :class="
              activeTab === 'juz'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="activeTab = 'juz'"
          >
            <Layers class="w-3.5 h-3.5" />
            <span>Juz (1–30)</span>
          </button>
          <button
            type="button"
            class="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            :class="
              activeTab === 'surah'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="activeTab = 'surah'"
          >
            <BookOpen class="w-3.5 h-3.5" />
            <span>Surah</span>
          </button>
        </div>

        <!-- Tab 1: By Page Number -->
        <div v-if="activeTab === 'page'" class="p-5 space-y-4">
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">
              Nomor Halaman (1 – {{ TOTAL_MUSHAF_PAGES }})
            </label>
            <div class="flex items-center gap-2">
              <input
                ref="inputRef"
                v-model.number="inputPage"
                type="number"
                min="1"
                :max="TOTAL_MUSHAF_PAGES"
                class="flex-1 h-10 px-3 rounded-lg border border-border bg-background text-foreground text-base text-center font-bold focus:outline-hidden focus:ring-2 focus:ring-primary"
                @keydown.enter="submitPage"
              />
              <Button
                class="h-10 px-5 text-xs font-semibold"
                @click="submitPage"
              >
                Buka
              </Button>
            </div>
          </div>

          <!-- Quick Increment Buttons -->
          <div class="pt-2 border-t border-border/60">
            <span
              class="text-[0.6875rem] text-muted-foreground block mb-2 font-medium"
              >Lompat Cepat:</span
            >
            <div class="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                class="py-1.5 px-2 rounded-md bg-muted hover:bg-accent text-xs font-medium text-foreground cursor-pointer transition-colors"
                @click="
                  emit('jump', 1);
                  close();
                "
              >
                Hal. 1
              </button>
              <button
                type="button"
                class="py-1.5 px-2 rounded-md bg-muted hover:bg-accent text-xs font-medium text-foreground cursor-pointer transition-colors"
                @click="
                  emit('jump', Math.max(1, currentPage - 10));
                  close();
                "
              >
                -10 Hal
              </button>
              <button
                type="button"
                class="py-1.5 px-2 rounded-md bg-muted hover:bg-accent text-xs font-medium text-foreground cursor-pointer transition-colors"
                @click="
                  emit('jump', Math.min(TOTAL_MUSHAF_PAGES, currentPage + 10));
                  close();
                "
              >
                +10 Hal
              </button>
              <button
                type="button"
                class="py-1.5 px-2 rounded-md bg-muted hover:bg-accent text-xs font-medium text-foreground cursor-pointer transition-colors"
                @click="
                  emit('jump', TOTAL_MUSHAF_PAGES);
                  close();
                "
              >
                Hal. 604
              </button>
            </div>
          </div>
        </div>

        <!-- Tab 2: By 30 Juz -->
        <div
          v-else-if="activeTab === 'juz'"
          class="p-3 overflow-y-auto max-h-[60vh]"
        >
          <div class="grid grid-cols-3 sm:grid-cols-5 gap-2">
            <button
              v-for="j in JUZ_PAGES"
              :key="j.juz"
              type="button"
              class="flex flex-col items-center justify-center p-2.5 rounded-xl border border-border/70 hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer text-center group"
              @click="selectJuz(j.startPage)"
            >
              <span
                class="text-xs font-bold text-foreground group-hover:text-primary"
              >
                Juz {{ j.juz }}
              </span>
              <span class="text-[0.625rem] text-muted-foreground mt-0.5">
                Hal. {{ j.startPage }}
              </span>
            </button>
          </div>
        </div>

        <!-- Tab 3: By 114 Surahs -->
        <div
          v-else-if="activeTab === 'surah'"
          class="flex flex-col flex-1 min-h-0"
        >
          <div class="p-3 border-b border-border/70">
            <div class="relative">
              <Search
                class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"
              />
              <input
                v-model="surahQuery"
                type="text"
                placeholder="Cari surat (misal: Baqarah, Yasin, Nisa)..."
                class="w-full h-8 pl-8 pr-3 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div class="overflow-y-auto max-h-[50vh] p-2 space-y-1">
            <button
              v-for="s in filteredSurahs"
              :key="s.id"
              type="button"
              class="w-full flex items-center justify-between p-2 rounded-lg hover:bg-accent text-left transition-colors cursor-pointer group"
              @click="selectSurah(s.startPage)"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <span
                  class="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-[0.6875rem] font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  {{ s.id }}
                </span>
                <div class="truncate">
                  <span
                    class="text-xs font-semibold text-foreground group-hover:text-primary block truncate"
                  >
                    {{ s.name }}
                  </span>
                  <span class="text-[0.625rem] text-muted-foreground">
                    {{ s.numAyah }} Ayat • Mulai Hal. {{ s.startPage }}
                  </span>
                </div>
              </div>
              <span
                dir="rtl"
                class="font-arabic text-sm text-foreground/80 pl-2 text-right"
              >
                {{ s.arabic }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.jump-modal-enter-active,
.jump-modal-leave-active {
  transition: opacity 0.15s ease;
}
.jump-modal-enter-from,
.jump-modal-leave-to {
  opacity: 0;
}
</style>
