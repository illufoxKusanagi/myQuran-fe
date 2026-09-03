<script setup lang="ts">
import type { HadithBook } from '../types'

defineProps<{ book: HadithBook }>()
defineEmits<{ open: [slug: string] }>()
</script>

<template>
  <button
    class="group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm"
    @click="$emit('open', book.slug)"
  >
    <p class="font-arabic text-right text-xl leading-none" dir="rtl">{{ book.arabicName }}</p>
    <p class="font-semibold text-foreground leading-tight">{{ book.name }}</p>
    <p class="text-xs text-muted-foreground">{{ book.author }} · {{ book.availableHadiths.toLocaleString() }} hadith</p>
    <span class="mt-1 inline-flex w-fit rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[0.625rem] font-semibold">{{ book.slug }}</span>
  </button>
</template>
