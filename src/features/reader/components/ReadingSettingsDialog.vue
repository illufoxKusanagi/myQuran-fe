<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { Settings, RotateCcw } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useReadingSettings, type PaperTheme } from '../composables/useReadingSettings'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [v: boolean]; close: [] }>()

const { settings, resetSettings } = useReadingSettings()

const localArabic = ref(settings.value.arabicFontSize)
const localTranslation = ref(settings.value.translationFontSize)

watch(() => settings.value.arabicFontSize, (v) => (localArabic.value = v))
watch(() => settings.value.translationFontSize, (v) => (localTranslation.value = v))
watch(localArabic, (v) => (settings.value.arabicFontSize = v))
watch(localTranslation, (v) => (settings.value.translationFontSize = v))

const themes: { value: PaperTheme; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'sepia', label: 'Sepia' },
  { value: 'dark', label: 'Dark' },
  { value: 'amoled', label: 'AMOLED' },
]

function close() {
  emit('update:open', false)
  emit('close')
}

function handleEsc(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) close()
}

watch(
  () => props.open,
  (v) => {
    if (v) document.addEventListener('keydown', handleEsc)
    else document.removeEventListener('keydown', handleEsc)
  }
)

onBeforeUnmount(() => document.removeEventListener('keydown', handleEsc))
</script>

<template>
  <Transition name="dialog-fade">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close" />
      <div class="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-xl p-5 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Settings class="w-4 h-4 text-primary" /></div>
            <h2 class="font-semibold text-foreground">Pengaturan Bacaan</h2>
          </div>
          <Button variant="ghost" size="sm" @click="close">Tutup</Button>
        </div>

        <div class="space-y-6">
          <div>
            <label class="text-sm font-medium text-foreground">Ukuran Arab: {{ settings.arabicFontSize }}px</label>
            <input type="range" :min="20" :max="40" :step="1" v-model.number="localArabic" class="w-full mt-2 accent-primary" />
            <div class="flex justify-between text-xs text-muted-foreground mt-1"><span>20px</span><span>40px</span></div>
          </div>

          <div>
            <label class="text-sm font-medium text-foreground">Ukuran Terjemahan: {{ settings.translationFontSize }}px</label>
            <input type="range" :min="11" :max="16" :step="1" v-model.number="localTranslation" class="w-full mt-2 accent-primary" />
            <div class="flex justify-between text-xs text-muted-foreground mt-1"><span>11px</span><span>16px</span></div>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-foreground">Tampilkan Latin</span>
            <button
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              :class="settings.showLatin ? 'bg-primary' : 'bg-muted'"
              role="switch"
              :aria-checked="settings.showLatin"
              @click="settings.showLatin = !settings.showLatin"
            >
              <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" :class="settings.showLatin ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-foreground">Tampilkan Terjemahan</span>
            <button
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              :class="settings.showTranslation ? 'bg-primary' : 'bg-muted'"
              role="switch"
              :aria-checked="settings.showTranslation"
              @click="settings.showTranslation = !settings.showTranslation"
            >
              <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" :class="settings.showTranslation ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>

          <div>
            <p class="text-sm font-medium text-foreground mb-2">Tema Kertas</p>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="t in themes"
                :key="t.value"
                class="rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors"
                :class="settings.paperTheme === t.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-accent'"
                @click="settings.paperTheme = t.value"
              >
                {{ t.label }}
              </button>
            </div>
          </div>

          <Button variant="outline" class="w-full gap-2" @click="resetSettings"><RotateCcw class="w-4 h-4" /> Reset ke Default</Button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}
.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
</style>
