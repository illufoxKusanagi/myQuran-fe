<script setup lang="ts">
import { BookOpen, Play, Pause, Repeat, ListMusic } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import type { Ayah } from '../types'
import { QARIS, PLAYBACK_RATES } from '../composables/useQariSettings'

defineProps<{
  leftAyah?: Ayah
  rightAyah?: Ayah
  totalAyahs: number
  isPortrait: boolean
  isPlaying: boolean
  isContinuous: boolean
  selectedQari: string
  playbackRate: number
}>()

defineEmits<{
  'open-tafsir': [side: 'left' | 'right']
  'toggle-mode': []
  'toggle-play': []
  'update:qari': [id: string]
  'update:rate': [rate: number]
}>()
</script>

<template>
  <footer class="shrink-0 border-t border-border bg-card flex items-center justify-between px-3 py-2.5 gap-2 flex-wrap">
    <div class="flex items-center gap-3 min-w-0 flex-1">
      <div v-if="leftAyah" class="flex items-center gap-2 min-w-0">
        <span class="text-xs shrink-0 font-semibold text-foreground tabular-nums">{{ leftAyah.ayahNumber }}</span>
        <Button variant="ghost" size="icon" class="w-7 h-7" aria-label="Buka tafsir ayat kiri" @click="$emit('open-tafsir', 'left')">
          <BookOpen class="w-3.5 h-3.5" />
        </Button>
      </div>
      <template v-if="rightAyah && !isPortrait">
        <span class="text-border">|</span>
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-xs shrink-0 font-semibold text-foreground tabular-nums">{{ rightAyah.ayahNumber }}</span>
          <Button variant="ghost" size="icon" class="w-7 h-7" aria-label="Buka tafsir ayat kanan" @click="$emit('open-tafsir', 'right')">
            <BookOpen class="w-3.5 h-3.5" />
          </Button>
        </div>
      </template>
      <span class="text-xs text-muted-foreground ml-1">/ {{ totalAyahs }}</span>
    </div>

    <div class="flex items-center gap-2 shrink-0 flex-wrap">
      <select
        :value="selectedQari"
        aria-label="Pilih qari"
        class="h-8 rounded-md border border-input bg-background px-2 text-xs"
        @change="$emit('update:qari', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="q in QARIS" :key="q.id" :value="q.id">{{ q.name }}</option>
      </select>

      <select
        :value="String(playbackRate)"
        aria-label="Kecepatan pemutaran"
        class="h-8 rounded-md border border-input bg-background px-2 text-xs"
        @change="$emit('update:rate', Number(($event.target as HTMLSelectElement).value))"
      >
        <option v-for="r in PLAYBACK_RATES" :key="r" :value="String(r)">{{ r }}x</option>
      </select>

      <button
        class="flex items-center gap-1.5 text-xs font-medium transition-colors px-2 py-1 rounded-md"
        :class="isContinuous ? 'text-primary bg-primary/10' : 'text-muted-foreground'"
        :aria-pressed="isContinuous"
        aria-label="Ganti mode pemutaran"
        @click="$emit('toggle-mode')"
      >
        <ListMusic v-if="isContinuous" class="w-3.5 h-3.5" />
        <Repeat v-else class="w-3.5 h-3.5" />
        <span class="hidden sm:inline">{{ isContinuous ? 'Berkelanjutan' : 'Satu-satu' }}</span>
      </button>
      <Button size="icon" class="rounded-full w-9 h-9" :aria-label="isPlaying ? 'Jeda murattal' : 'Putar murattal'" @click="$emit('toggle-play')">
        <Pause v-if="isPlaying" class="w-4 h-4" />
        <Play v-else class="w-4 h-4 ml-px" />
      </Button>
    </div>
  </footer>
</template>
