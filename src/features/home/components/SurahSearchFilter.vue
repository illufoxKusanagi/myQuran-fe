<script setup lang="ts">
import { Search } from 'lucide-vue-next'

defineProps<{
  modelValue: string
  tab: 'all' | 'Makkiyah' | 'Madaniyah'
}>()

defineEmits<{
  'update:modelValue': [v: string]
  'update:tab': [v: 'all' | 'Makkiyah' | 'Madaniyah']
}>()

const tabs = [
  { value: 'all' as const, label: 'Semua' },
  { value: 'Makkiyah' as const, label: 'Makkiyah' },
  { value: 'Madaniyah' as const, label: 'Madaniyah' },
]
</script>

<template>
  <div class="space-y-4 mb-6">
    <div class="relative max-w-xl mx-auto">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        :value="modelValue"
        placeholder="Cari surah, arab, atau nomor..."
        class="w-full h-11 pl-10 pr-4 rounded-full border border-input bg-card text-sm outline-none focus:ring-2 focus:ring-ring"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>
    <div class="flex items-center justify-center gap-2">
      <button
        v-for="t in tabs"
        :key="t.value"
        :aria-pressed="tab === t.value"
        class="rounded-full px-4 py-1.5 text-sm font-medium border transition-colors"
        :class="tab === t.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-accent'"
        @click="$emit('update:tab', t.value)"
      >
        {{ t.label }}
      </button>
    </div>
  </div>
</template>
