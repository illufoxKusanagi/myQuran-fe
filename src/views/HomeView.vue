<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'

interface Surah {
  id: number
  surahName: string
  arabic: string
  numAyah: number
  location: string
}

const router = useRouter()
const surahs = ref<Surah[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/surah`)
    surahs.value = await response.json()
  } catch (error) {
    console.error('Failed to fetch surahs:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col flex-1 bg-cyan-100 dark:bg-cyan-900">
    <div class="max-w-5xl mx-auto px-4 py-10 w-full flex-1">

      <!-- Hero -->
      <div class="text-center mb-10">
        <h1 class="heading-1 text-foreground mb-2">My Quran</h1>
        <p class="text-muted-foreground text-base">Baca Al-Quran kapan saja, dimana saja, tanpa install</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <p class="text-muted-foreground animate-pulse">Memuat surat-surat...</p>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <button v-for="surah in surahs" :key="surah.id"
          class="group flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-4 text-left transition-all hover:border-primary/50 hover:bg-accent/5 hover:shadow-sm active:scale-[0.99] cursor-pointer"
          @click="router.push({ name: 'surah', params: { id: surah.id } })">
          <!-- Number badge -->
          <div class="shrink-0 w-10 h-10 rounded-full border border-border flex items-center justify-center">
            <span class="text-xs font-semibold text-muted-foreground tabular-nums">{{ surah.id }}</span>
          </div>

          <!-- Name + meta -->
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-foreground leading-tight truncate">{{ surah.surahName }}</p>
            <p class="text-xs text-muted-foreground mt-0.5">{{ surah.numAyah }} Ayahs · {{ surah.location }}</p>
          </div>

          <!-- Arabic name -->
          <span class="arabic-text text-xl text-foreground shrink-0 group-hover:text-primary transition-colors">
            <p class="text-foreground">
              {{ surah.arabic }}
            </p>
          </span>
        </button>
      </div>

    </div>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>
