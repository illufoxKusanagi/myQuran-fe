<script setup lang="ts">
import { Search } from 'lucide-vue-next'

defineProps<{
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [v: string]
}>()
</script>

<template>
  <div class="mb-6">
    <div class="relative max-w-xl mx-auto">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        :value="modelValue"
        placeholder="Cari surah, arab, atau nomor..."
        class="w-full h-11 pl-10 pr-4 rounded-full border border-input bg-card text-sm outline-none focus:ring-2 focus:ring-ring"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>
