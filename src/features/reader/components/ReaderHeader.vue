<script setup lang="ts">
import { ArrowLeft, Settings } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

defineProps<{
  surahName: string
  surahArabic: string
  ayahCount: number
  currentJuz?: number | null
}>()

defineEmits<{ back: []; settings: [] }>()
</script>

<template>
  <header class="shrink-0 h-14 border-b border-border bg-card flex items-center gap-3 px-4">
    <Button variant="ghost" size="icon" aria-label="Kembali ke daftar surah" @click="$emit('back')">
      <ArrowLeft class="w-5 h-5" />
    </Button>
    <div class="flex-1 min-w-0">
      <p class="font-semibold text-foreground leading-none truncate">{{ surahName }}</p>
      <p class="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
        <span>{{ ayahCount }} Ayat</span>
        <span v-if="currentJuz" class="inline-flex items-center rounded-full bg-primary/10 text-primary px-1.5 py-0 text-[0.625rem] font-semibold">Juz {{ currentJuz }}</span>
      </p>
    </div>
    <p class="font-arabic text-2xl text-foreground leading-none shrink-0" dir="rtl" style="text-align: right">{{ surahArabic }}</p>
    <Button variant="ghost" size="icon" aria-label="Pengaturan bacaan" @click="$emit('settings')">
      <Settings class="w-5 h-5" />
    </Button>
  </header>
</template>
