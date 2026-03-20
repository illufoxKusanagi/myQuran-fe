<script setup lang="ts">
import { Play, Pause, SkipForward, SkipBack, Repeat, ListMusic } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  isPlaying: boolean
  isContinuous: boolean
  currentAyahId: number
  totalAyahs: number
}>()

const emit = defineEmits<{
  (e: 'togglePlay'): void
  (e: 'toggleMode'): void
  (e: 'next'): void
  (e: 'prev'): void
}>()
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 flex items-center justify-between z-50 shadow-lg">
    <div class="flex items-center gap-4">
      <div class="text-sm font-medium">Ayah {{ currentAyahId }} of {{ totalAyahs }}</div>
      <Button variant="ghost" size="sm" @click="emit('toggleMode')" :class="{ 'text-primary': isContinuous }">
        <ListMusic v-if="isContinuous" class="w-4 h-4 mr-2" />
        <Repeat v-else class="w-4 h-4 mr-2" />
        {{ isContinuous ? 'Continuous' : 'Separate' }}
      </Button>
    </div>

    <div class="flex items-center gap-2">
      <Button variant="ghost" size="icon" @click="emit('prev')" :disabled="currentAyahId <= 1">
        <SkipBack class="w-4 h-4" />
      </Button>
      
      <Button variant="default" size="icon" class="rounded-full w-12 h-12" @click="emit('togglePlay')">
        <Pause v-if="isPlaying" class="w-6 h-6" />
        <Play v-else class="w-6 h-6 ml-1" />
      </Button>
      
      <Button variant="ghost" size="icon" @click="emit('next')" :disabled="currentAyahId >= totalAyahs">
        <SkipForward class="w-4 h-4" />
      </Button>
    </div>
  </div>
</template>
