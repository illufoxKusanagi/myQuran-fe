<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronDown } from 'lucide-vue-next'
import { JUZ_STARTS } from '@/features/reader/juz'

const router = useRouter()
const selected = ref('')

function onChange() {
  const juz = Number(selected.value)
  if (!juz) return
  const s = JUZ_STARTS.find((j) => j.juz === juz)
  if (!s) return
  router.push({ name: 'surah', params: { id: s.surahId }, query: { ayah: String(s.ayahNumber), juz: String(juz) } } as any)
}
</script>

<template>
  <div class="mb-6 max-w-md mx-auto">
    <label for="juz-select" class="block text-sm font-semibold text-foreground mb-2 text-center">Lompat Juz</label>
    <div class="relative">
      <select
        id="juz-select"
        v-model="selected"
        class="w-full h-11 rounded-xl border border-input bg-card px-4 pr-10 text-sm appearance-none outline-none focus:ring-2 focus:ring-ring"
        @change="onChange"
      >
        <option value="" disabled>Pilih Juz 1–30</option>
        <option v-for="j in JUZ_STARTS" :key="j.juz" :value="String(j.juz)">Juz {{ j.juz }} — Surah {{ j.surahId }} : {{ j.ayahNumber }}</option>
      </select>
      <ChevronDown class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    </div>
    <p class="text-xs text-muted-foreground text-center mt-1">Satu Juz bisa lintas Surah — otomatis ke awal Juz</p>
  </div>
</template>
