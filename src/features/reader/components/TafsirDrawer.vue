<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from 'vue';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-vue-next';
import type { Ayah } from '../types';

export interface AyahTafsirResponse {
  ayahNumber: number;
  wajizTafsir: string;
  tahliliTafsir: string;
}

const props = defineProps<{
  isOpen: boolean;
  ayah?: Ayah;
}>();

const emit = defineEmits<{ close: [] }>();

const panelRef = ref<HTMLElement | null>(null);
const closeBtnRef = ref<InstanceType<typeof Button> | HTMLElement | null>(null);
let previousFocus: HTMLElement | null = null;

const activeTab = ref<'wajiz' | 'tahlili'>('wajiz');
const loadingTafsir = ref(false);
const tafsirError = ref<string | null>(null);
const tafsirCache = new Map<string, AyahTafsirResponse>();
const tafsirData = ref<AyahTafsirResponse | null>(null);
let activeAbortController: AbortController | null = null;

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter(
    (el) =>
      !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
  );
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault();
    emit('close');
    return;
  }
  if (e.key === 'Tab' && panelRef.value) {
    const focusable = getFocusable(panelRef.value);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

async function fetchTafsir() {
  if (!props.ayah) return;
  const { surahId, ayahNumber } = props.ayah;
  const cacheKey = `${surahId}:${ayahNumber}`;

  if (activeAbortController) {
    activeAbortController.abort();
    activeAbortController = null;
  }

  if (tafsirCache.has(cacheKey)) {
    tafsirData.value = tafsirCache.get(cacheKey)!;
    loadingTafsir.value = false;
    tafsirError.value = null;
    return;
  }

  if (props.ayah.wajizTafsir || props.ayah.tahliliTafsir) {
    const data: AyahTafsirResponse = {
      ayahNumber,
      wajizTafsir: props.ayah.wajizTafsir || '',
      tahliliTafsir: props.ayah.tahliliTafsir || '',
    };
    tafsirCache.set(cacheKey, data);
    tafsirData.value = data;
    loadingTafsir.value = false;
    tafsirError.value = null;
    return;
  }

  loadingTafsir.value = true;
  tafsirError.value = null;
  tafsirData.value = null;

  const controller = new AbortController();
  activeAbortController = controller;

  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/ayah/${surahId}/${ayahNumber}/tafsir`,
      { signal: controller.signal }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: AyahTafsirResponse = await res.json();
    if (
      props.ayah?.surahId === surahId &&
      props.ayah?.ayahNumber === ayahNumber
    ) {
      tafsirCache.set(cacheKey, data);
      tafsirData.value = data;
    }
  } catch (err: any) {
    if (err.name === 'AbortError') return;
    if (
      props.ayah?.surahId === surahId &&
      props.ayah?.ayahNumber === ayahNumber
    ) {
      tafsirError.value = 'Gagal memuat tafsir. Silakan periksa koneksi Anda.';
    }
  } finally {
    if (activeAbortController === controller) {
      loadingTafsir.value = false;
      activeAbortController = null;
    }
  }
}

watch(
  () => [props.isOpen, props.ayah?.surahId, props.ayah?.ayahNumber],
  ([open]) => {
    if (open && props.ayah) {
      fetchTafsir();
    }
  },
  { immediate: true }
);

watch(
  () => props.isOpen,
  async (open) => {
    if (open) {
      previousFocus = document.activeElement as HTMLElement | null;
      await nextTick();
      const btn = (closeBtnRef.value as any)?.$el ?? closeBtnRef.value;
      if (btn instanceof HTMLElement) btn.focus();
      else if (panelRef.value) {
        const focusable = getFocusable(panelRef.value);
        if (focusable[0]) focusable[0].focus();
      }
      document.addEventListener('keydown', handleKeydown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = '';
      if (previousFocus && typeof previousFocus.focus === 'function')
        previousFocus.focus();
    }
  }
);

onBeforeUnmount(() => {
  if (activeAbortController) {
    activeAbortController.abort();
    activeAbortController = null;
  }
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <Transition name="drawer">
    <div v-if="isOpen" class="fixed inset-0 z-50">
      <div class="drawer-backdrop" @click="emit('close')" />
      <div
        ref="panelRef"
        class="drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Tafsir ayat"
        tabindex="-1"
      >
        <!-- Header -->
        <div
          class="sticky top-0 bg-card flex items-center justify-between p-4 border-b border-border z-10"
        >
          <div>
            <p class="font-semibold text-foreground">Tafsir Kemenag</p>
            <p class="text-xs text-muted-foreground">
              Ayat {{ ayah?.ayahNumber }}
            </p>
          </div>
          <Button
            ref="closeBtnRef"
            variant="ghost"
            size="sm"
            @click="emit('close')"
          >
            Tutup
          </Button>
        </div>

        <div v-if="ayah" class="p-5 space-y-5">
          <!-- Ayah Banner -->
          <div class="rounded-lg bg-muted/60 p-4 border border-border/50">
            <p
              class="font-arabic text-2xl text-foreground leading-loose"
              dir="rtl"
              style="text-align: right"
            >
              {{ ayah.arabic }}
            </p>
            <p class="text-foreground text-sm mt-3 leading-relaxed">
              {{ ayah.translation }}
            </p>
          </div>

          <!-- Tab Switcher: Wajiz vs Tahlili -->
          <div
            class="grid grid-cols-2 p-1 bg-muted/60 rounded-lg text-xs font-medium"
          >
            <button
              type="button"
              class="py-1.5 px-3 rounded-md transition-all cursor-pointer text-center"
              :class="
                activeTab === 'wajiz'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              "
              @click="activeTab = 'wajiz'"
            >
              Tafsir Wajiz (Ringkas)
            </button>
            <button
              type="button"
              class="py-1.5 px-3 rounded-md transition-all cursor-pointer text-center"
              :class="
                activeTab === 'tahlili'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              "
              @click="activeTab = 'tahlili'"
            >
              Tafsir Tahlili (Lengkap)
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="loadingTafsir" class="space-y-4 py-4 animate-pulse">
            <div class="h-4 w-28 bg-muted rounded" />
            <div class="space-y-2">
              <div class="h-3.5 bg-muted rounded w-full" />
              <div class="h-3.5 bg-muted rounded w-5/6" />
              <div class="h-3.5 bg-muted rounded w-4/6" />
            </div>
          </div>

          <!-- Error State -->
          <div
            v-else-if="tafsirError"
            class="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center space-y-3"
          >
            <p class="text-xs text-destructive">{{ tafsirError }}</p>
            <Button
              variant="outline"
              size="sm"
              class="h-8 text-xs gap-1.5"
              @click="fetchTafsir"
            >
              <RefreshCw class="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </Button>
          </div>

          <!-- Tafsir Content -->
          <div v-else class="space-y-3 pb-8">
            <!-- Wajiz Content -->
            <div v-if="activeTab === 'wajiz'">
              <p
                class="text-xs font-semibold text-primary uppercase tracking-wider mb-2"
              >
                Tafsir Ringkas
              </p>
              <p
                class="text-sm text-foreground/90 leading-relaxed text-justify"
              >
                {{
                  tafsirData?.wajizTafsir ||
                  ayah.wajizTafsir ||
                  'Tafsir Wajiz tidak tersedia untuk ayat ini.'
                }}
              </p>
            </div>

            <!-- Tahlili Content -->
            <div v-else>
              <p
                class="text-xs font-semibold text-primary uppercase tracking-wider mb-2"
              >
                Tafsir Mendalam & Komprehensif
              </p>
              <div
                class="text-sm text-foreground/90 leading-relaxed whitespace-pre-line text-justify space-y-3"
              >
                {{
                  tafsirData?.tahliliTafsir ||
                  ayah.tahliliTafsir ||
                  'Tafsir Tahlili tidak tersedia untuk ayat ini.'
                }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.drawer-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(0.25rem);
}
.drawer-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--card);
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 -0.625rem 2.5rem rgba(0, 0, 0, 0.15);
}
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
</style>
