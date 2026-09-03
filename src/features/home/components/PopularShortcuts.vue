<script setup lang="ts">
import { useRouter } from 'vue-router'
import { POPULAR_REFS } from '@/features/reader/popular'

const router = useRouter()

function go(surahId: number, ayah: number) {
  router.push({ name: 'surah', params: { id: surahId }, query: { ayah: String(ayah) } } as any)
}
</script>

<template>
  <div class="mb-6">
    <p class="text-sm font-semibold text-foreground mb-2 text-center">Surah & Ayat Populer</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-w-2xl mx-auto">
      <button
        v-for="p in POPULAR_REFS"
        :key="p.key"
        class="group flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 text-left hover:border-primary/50 hover:bg-accent/5 transition-colors"
        @click="go(p.surahId, p.ayahNumber)"
      >
        <span class="font-arabic text-right text-lg leading-none shrink-0" dir="rtl">{{ p.arabic }}</span>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold leading-none truncate">{{ p.label }}</p>
          <p class="text-xs text-muted-foreground mt-1">{{ p.desc }}</p>
        </div>
      </button>
    </div>
  </div>
</template>
