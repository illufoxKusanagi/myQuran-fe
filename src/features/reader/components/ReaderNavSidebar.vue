<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Search, BookOpen, Layers, Hash } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import kitabsJson from '@/features/hadith/data/kitabs.json'

const props = defineProps<{
  open: boolean
  mode: 'quran' | 'hadith'
  title: string
  subtitle?: string
  totalAyahs?: number
  activeAyah?: number
  hadiths?: { number: number; grade?: string; babName?: string }[]
  activeHadith?: number
  currentKitabNo?: number
  bookSlug?: string
}>()

const emit = defineEmits<{
  'update:open': [v: boolean]
  'selectAyah': [ayahNumber: number]
  'selectHadith': [hadithNumber: number]
  'changeKitab': [kitabNo: number]
}>()

const searchQuery = ref('')
const activeTab = ref<'items' | 'kitab'>('items')
const targetKitabInput = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      searchQuery.value = ''
      activeTab.value = 'items'
      targetKitabInput.value = String(props.currentKitabNo ?? 1)
    }
  }
)

watch(activeTab, () => {
  searchQuery.value = ''
})

function close() {
  emit('update:open', false)
}

// Quran Ayah List filtered
const filteredAyahs = computed(() => {
  const count = props.totalAyahs ?? 0
  const q = searchQuery.value.trim()
  const list = Array.from({ length: count }, (_, i) => i + 1)
  if (!q) return list
  return list.filter((n) => String(n).includes(q))
})

// Hadith List filtered
const filteredHadiths = computed(() => {
  const list = props.hadiths ?? []
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return list
  return list.filter((h) => String(h.number).includes(q) || (h.babName && h.babName.toLowerCase().includes(q)))
})

// Hadith Kitabs for current collection
const bookKitabs = computed(() => {
  const slug = props.bookSlug || 'bukhari'
  const list = (kitabsJson as Record<string, { no: number; name: string; total: number; startNumber: number }[]>)[slug] || []
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return list
  return list.filter((k) => k.name.toLowerCase().includes(q) || String(k.no).includes(q))
})

function handleAyahClick(ayahNumber: number) {
  emit('selectAyah', ayahNumber)
  close()
}

function handleHadithClick(hadithNumber: number) {
  emit('selectHadith', hadithNumber)
  close()
}

function handleKitabSubmit() {
  const k = Number(targetKitabInput.value)
  if (!isNaN(k) && k > 0) {
    emit('changeKitab', k)
    close()
  }
}
</script>

<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity"
        @click="close"
      />
    </Transition>

    <!-- Slide-in Sidebar Panel -->
    <Transition name="slide-left">
      <aside
        v-if="open"
        class="fixed inset-y-0 left-0 z-50 w-80 sm:w-96 max-w-[88vw] bg-card border-r border-border flex flex-col shadow-2xl text-foreground"
        role="dialog"
        aria-modal="true"
      >
        <!-- Sidebar Header -->
        <div class="h-16 px-4 border-b border-border flex items-center justify-between gap-3 shrink-0 bg-card">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <BookOpen v-if="mode === 'quran'" class="w-4 h-4" />
              <Layers v-else class="w-4 h-4" />
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-sm leading-tight truncate">
                {{ mode === 'quran' ? 'Daftar Ayat' : 'Navigasi Kitab' }}
              </p>
              <p class="text-xs text-muted-foreground truncate">{{ title }}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" class="w-8 h-8 shrink-0 text-muted-foreground hover:text-foreground" @click="close" aria-label="Tutup Navigasi">
            <X class="w-4 h-4" />
          </Button>
        </div>

        <!-- Mode Subheader / Tabs for Hadith -->
        <div v-if="mode === 'hadith'" class="px-4 pt-3 shrink-0">
          <div class="grid grid-cols-2 p-1 bg-muted/60 rounded-lg text-xs font-medium">
            <button
              class="py-1.5 rounded-md transition-colors text-center"
              :class="activeTab === 'items' ? 'bg-card text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'"
              @click="activeTab = 'items'"
            >
              Hadits di Kitab Ini
            </button>
            <button
              class="py-1.5 rounded-md transition-colors text-center"
              :class="activeTab === 'kitab' ? 'bg-card text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'"
              @click="activeTab = 'kitab'"
            >
              Daftar Kitab (Bab)
            </button>
          </div>
        </div>

        <!-- Search Input Box (Always Visible) -->
        <div class="p-4 pb-2 shrink-0">
          <div class="relative">
            <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="
                mode === 'quran'
                  ? 'Cari nomor ayat...'
                  : activeTab === 'items'
                    ? 'Cari nomor hadits...'
                    : 'Cari nama atau nomor kitab...'
              "
              class="w-full h-9 pl-9 pr-3 text-xs bg-muted/40 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <!-- Content Area: Quran Ayah Grid -->
        <div v-if="mode === 'quran'" class="flex-1 overflow-y-auto px-4 py-2">
          <p class="text-[11px] font-medium text-muted-foreground mb-2.5">
            Pilih ayat untuk melompat langsung (Total {{ totalAyahs }} Ayat)
          </p>
          <div class="grid grid-cols-5 sm:grid-cols-6 gap-1.5 pb-6">
            <button
              v-for="num in filteredAyahs"
              :key="num"
              type="button"
              class="h-9 rounded-md text-xs font-semibold flex items-center justify-center transition-all tabular-nums border cursor-pointer"
              :class="
                num === activeAyah
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm font-bold scale-[1.03]'
                  : 'bg-card hover:bg-accent text-foreground border-border/60 hover:border-primary/40'
              "
              @click="handleAyahClick(num)"
            >
              {{ num }}
            </button>
          </div>
          <div v-if="filteredAyahs.length === 0" class="py-8 text-center text-xs text-muted-foreground">
            Ayat tidak ditemukan
          </div>
        </div>

        <!-- Content Area: Hadith in Current Kitab -->
        <div v-else-if="activeTab === 'items'" class="flex-1 overflow-y-auto px-4 py-2">
          <p class="text-[11px] font-medium text-muted-foreground mb-2.5">
            Hadits pada Kitab {{ currentKitabNo }} ({{ hadiths?.length ?? 0 }} Hadits)
          </p>
          <div class="grid grid-cols-4 sm:grid-cols-5 gap-1.5 pb-6">
            <button
              v-for="h in filteredHadiths"
              :key="h.number"
              type="button"
              class="h-9 rounded-md text-xs font-semibold flex items-center justify-center transition-all tabular-nums border cursor-pointer"
              :class="
                h.number === activeHadith
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm font-bold scale-[1.03]'
                  : 'bg-card hover:bg-accent text-foreground border-border/60 hover:border-primary/40'
              "
              @click="handleHadithClick(h.number)"
            >
              {{ h.number }}
            </button>
          </div>
          <div v-if="filteredHadiths.length === 0" class="py-8 text-center text-xs text-muted-foreground">
            Hadits tidak ditemukan
          </div>
        </div>

        <!-- Content Area: Hadith Kitab Switcher -->
        <div v-else class="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          <!-- Manual Kitab Number Jump -->
          <div class="p-3 bg-muted/30 border border-border rounded-lg space-y-2">
            <p class="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Hash class="w-3.5 h-3.5 text-primary" />
              <span>Lompat ke Nomor Kitab</span>
            </p>
            <form class="flex gap-2" @submit.prevent="handleKitabSubmit">
              <input
                v-model="targetKitabInput"
                type="number"
                min="1"
                placeholder="No. Kitab..."
                class="flex-1 h-9 px-3 text-xs bg-card border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
              <Button type="submit" size="sm" class="h-9 px-3 text-xs">
                Buka
              </Button>
            </form>
          </div>

          <!-- All Kitabs in this Book -->
          <div>
            <p class="text-[11px] font-medium text-muted-foreground mb-2">
              Daftar Kitab (Total {{ bookKitabs.length }} Kitab)
            </p>
            <div class="space-y-1 pb-6">
              <button
                v-for="k in bookKitabs"
                :key="k.no"
                type="button"
                class="w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors flex items-center justify-between border border-transparent hover:border-border hover:bg-accent cursor-pointer"
                :class="
                  k.no === currentKitabNo
                    ? 'bg-primary/10 text-primary font-semibold border-primary/30'
                    : 'text-foreground'
                "
                @click="emit('changeKitab', k.no), close()"
              >
                <div class="min-w-0 pr-2">
                  <span class="truncate block font-medium">{{ k.name }}</span>
                  <span class="text-[10px] text-muted-foreground block mt-0.5">
                    {{ k.total }} hadits · Mulai No. {{ k.startNumber }}
                  </span>
                </div>
                <span class="text-[10px] text-muted-foreground font-mono shrink-0 ml-2 bg-muted/60 px-2 py-1 rounded">
                  Kitab {{ k.no }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer indicator -->
        <div class="p-3 border-t border-border bg-muted/20 shrink-0 text-center text-[11px] text-muted-foreground">
          {{ subtitle || title }}
        </div>
      </aside>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>
