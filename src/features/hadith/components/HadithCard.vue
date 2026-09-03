<script setup lang="ts">
import type { Hadith } from '../types'

defineProps<{ hadith: Hadith }>()
</script>

<template>
  <article class="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
    <div class="flex items-center gap-2 text-xs">
      <span class="rounded-full bg-primary text-primary-foreground px-2 py-0.5 font-semibold">#{{ hadith.number }}</span>
      <span class="text-muted-foreground">{{ hadith.kitabName }} · {{ hadith.babName }}</span>
      <span v-if="hadith.grade" class="ml-auto rounded-full border px-2 py-0.5" :class="hadith.grade === 'Shahih' ? 'border-emerald-300 text-emerald-700 bg-emerald-50' : 'border-amber-300 text-amber-700 bg-amber-50'">{{ hadith.grade }}</span>
    </div>
    <p class="font-arabic text-[1.25rem] leading-loose text-foreground" dir="rtl" style="text-align:right">{{ hadith.arabic }}</p>
    <p v-if="hadith.latin" class="text-xs text-muted-foreground italic">{{ hadith.latin }}</p>
    <p class="text-sm leading-relaxed text-foreground">{{ hadith.translation }}</p>
  </article>
</template>
