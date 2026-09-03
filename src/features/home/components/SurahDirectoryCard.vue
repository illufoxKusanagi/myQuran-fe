<script setup lang="ts">
defineProps<{
  id: number
  surahName: string
  arabic: string
  numAyah: number
  location: string
}>()

defineEmits<{ click: [] }>()
</script>

<template>
  <button
    class="group flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-4 text-left transition-all hover:border-primary/50 hover:bg-accent/5 hover:shadow-sm active:scale-[0.99] cursor-pointer w-full"
    @click="$emit('click')"
  >
    <div class="shrink-0 w-10 h-10 rounded-full border border-border flex items-center justify-center">
      <span class="text-xs font-semibold text-muted-foreground tabular-nums">{{ id }}</span>
    </div>
    <div class="flex-1 min-w-0">
      <p class="font-semibold text-foreground leading-tight truncate">{{ surahName }}</p>
      <p class="text-xs text-muted-foreground mt-0.5">{{ numAyah }} Ayat · {{ location }}</p>
    </div>
    <span class="arabic-text text-xl text-foreground shrink-0 group-hover:text-primary transition-colors" dir="rtl">
      {{ arabic }}
    </span>
  </button>
</template>
