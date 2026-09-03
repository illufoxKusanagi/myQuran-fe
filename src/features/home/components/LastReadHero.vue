<script setup lang="ts">
import { useRouter } from 'vue-router'
import { BookOpen, Clock, ChevronRight } from 'lucide-vue-next'
import { useLastRead } from '@/features/reader/composables/useLastRead'

const router = useRouter()
const { lastRead, timeAgo } = useLastRead()

function continueReading() {
  if (!lastRead.value) return
  router.push({ name: 'surah', params: { id: lastRead.value.surahId } })
}
</script>

<template>
  <div v-if="lastRead" class="mb-8 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 dark:border-emerald-900 p-5 flex items-center gap-4">
    <div class="shrink-0 w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center">
      <BookOpen class="w-6 h-6 text-white" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-xs font-semibold tracking-widest uppercase text-emerald-700 dark:text-emerald-400">Lanjutkan Membaca</p>
      <div class="flex items-baseline gap-2 mt-1">
        <p class="font-semibold text-foreground truncate">{{ lastRead.surahName }}</p>
        <span class="font-arabic text-lg text-foreground shrink-0" dir="rtl">{{ lastRead.surahArabic }}</span>
      </div>
      <div class="flex items-center gap-2 mt-1">
        <span class="inline-flex items-center rounded-full bg-white dark:bg-card border border-border px-2.5 py-0.5 text-xs font-medium">Ayat {{ lastRead.ayahNumber }} dari {{ lastRead.totalAyahs }}</span>
        <span class="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock class="w-3 h-3" />{{ timeAgo(lastRead.timestamp) }}</span>
      </div>
    </div>
    <button
      class="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 transition-colors"
      @click="continueReading"
    >
      Lanjutkan <ChevronRight class="w-4 h-4" />
    </button>
  </div>
</template>
