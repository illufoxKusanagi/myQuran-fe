<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import HadithBookCard from '@/features/hadith/components/HadithBookCard.vue'
import { useHadithBooks } from '@/features/hadith/composables/useHadith'

const router = useRouter()
const { books, loading, error, fetchBooks } = useHadithBooks()

onMounted(fetchBooks)

function open(slug: string) {
  router.push({ name: 'hadith-list', params: { book: slug } })
}
</script>

<template>
  <div class="flex flex-col flex-1 bg-background">
    <div class="max-w-5xl mx-auto px-4 py-10 w-full flex-1">
      <div class="text-center mb-8">
        <h1 class="heading-1 text-foreground mb-2">Hadith</h1>
        <p class="text-muted-foreground">7 Koleksi · 29.187 hadith dari hadits.id</p>
      </div>
      <div v-if="loading" class="flex justify-center py-20"><p class="animate-pulse text-muted-foreground">Memuat kitab...</p></div>
      <div v-else-if="error" class="text-center py-10"><p class="text-destructive">{{ error }}</p></div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <HadithBookCard v-for="b in books" :key="b.slug" :book="b" @open="open" />
      </div>
    </div>
    <AppFooter />
  </div>
</template>
