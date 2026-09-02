<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  open: boolean
  currentSurahId: number
  jumpToAyah: (ayahNumber: number) => boolean
}>()

const emit = defineEmits<{ 'update:open': [v: boolean]; close: [] }>()

const router = useRouter()
const query = ref('')
const error = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

watch(
  () => props.open,
  (v) => {
    if (v) {
      query.value = ''
      error.value = ''
      setTimeout(() => inputRef.value?.focus(), 50)
    }
  }
)

function close() {
  emit('update:open', false)
  emit('close')
}

function onBackdrop(e: MouseEvent) {
  if (e.target === e.currentTarget) close()
}

function handleSubmit() {
  const q = query.value.trim()
  if (!q) return

  const juzMatch = q.match(/^juz\s*(\d+)$/i) || q.match(/^(\d+)$/)
  if (juzMatch && q.toLowerCase().startsWith('juz')) {
    const juz = Number(juzMatch[1])
    if (juz < 1 || juz > 30) {
      error.value = 'Juz harus 1–30'
      return
    }
    close()
    router.push({ name: 'home', query: { juz: String(juz) } } as any)
    return
  }

  const saMatch = q.match(/^(\d+)\s*:\s*(\d+)$/)
  if (saMatch) {
    const s = Number(saMatch[1])
    const a = Number(saMatch[2])
    if (s < 1 || s > 114) {
      error.value = 'Surah harus 1–114'
      return
    }
    if (s === props.currentSurahId) {
      const ok = props.jumpToAyah(a)
      if (!ok) {
        error.value = `Ayat ${a} tidak ditemukan`
        return
      }
      close()
      return
    }
    close()
    router.push({ name: 'surah', params: { id: s }, query: { ayah: String(a) } } as any)
    return
  }

  const n = Number(q)
  if (!isNaN(n) && n >= 1 && n <= 114) {
    close()
    router.push({ name: 'surah', params: { id: n } })
    return
  }

  error.value = 'Format: 2:255 atau 18:10 atau juz 5'
}
</script>

<template>
  <Transition name="dialog-fade">
    <div v-if="open" class="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] p-4" @click="onBackdrop">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div class="relative w-full max-w-lg rounded-2xl bg-card border border-border shadow-xl p-5">
        <div class="flex items-center gap-3 mb-3">
          <Search class="w-5 h-5 text-muted-foreground" />
          <h2 class="font-semibold text-foreground">Lompat Cepat</h2>
          <span class="ml-auto text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">Ctrl+K</span>
          <Button variant="ghost" size="sm" @click="close">Esc</Button>
        </div>
        <form @submit.prevent="handleSubmit">
          <input
            ref="inputRef"
            v-model="query"
            placeholder="Contoh: 2:255  •  18:10  •  36  •  juz 30"
            class="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <p v-if="error" class="text-xs text-destructive mt-2">{{ error }}</p>
          <p class="text-xs text-muted-foreground mt-2">Tekan Enter untuk lompat. Juz 1–30, Surah 1–114.</p>
        </form>
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
