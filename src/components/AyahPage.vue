<script setup lang="ts">
import { Play, Pause, BookOpen } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  ayah: {
    id: number
    surahId: number
    ayahNumber: number
    arabic: string
    latin: string
    translation: string
    wajizTafsir: string
    tahliliTafsir: string
    page: number
    juz: number
  }
  isAudioPlaying?: boolean
}>()

const emit = defineEmits<{
  (e: 'playAudio', ayahNumber: number): void
  (e: 'showTafsir', ayahNumber: number): void
}>()
</script>

<template>
  <div
    class="ayah-page-wrapper w-full h-full flex flex-col p-6 bg-accent overflow-hidden relative border-r border-border snap-start">
    <!-- Action Bar -->
    <div class="flex justify-between items-center mb-6">
      <div class="counter">{{ props.ayah.ayahNumber }}</div>
      <div class="flex gap-2">
        <Button variant="outline" size="icon" @click="emit('playAudio', props.ayah.ayahNumber)">
          <Play v-if="!isAudioPlaying" class="w-4 h-4" />
          <Pause v-else class="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" @click="emit('showTafsir', props.ayah.ayahNumber)">
          <BookOpen class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- Ayah Content -->
    <div class="flex flex-col gap-8 overflow-y-auto pb-24">
      <p class="arabic-text">{{ props.ayah.arabic }}</p>

      <div class="flex flex-col gap-2 text-left">
        <p class="body-large font-medium text-primary">{{ props.ayah.latin }}</p>
        <p class="body-muted">{{ props.ayah.translation }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ayah-page-wrapper {
  /* This ensures the page-flip respects our container */
  box-sizing: border-box;
}
</style>
