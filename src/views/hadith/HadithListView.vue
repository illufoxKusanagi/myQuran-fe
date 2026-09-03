<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import HadithCard from '@/features/hadith/components/HadithCard.vue'
import { useHadithList } from '@/features/hadith/composables/useHadith'
import { Button } from '@/components/ui/button'

const route = useRoute()
const router = useRouter()
const slug = route.params.book as string
const page = ref(Number(route.query.page ?? 1))

const { hadiths, pagination, book, loading, error, fetchList } = useHadithList(slug)

function load() { fetchList(page.value, 20) }

onMounted(load)
watch(page, load)
watch(() => route.params.book, () => location.reload())

function go(p: number) {
  page.value = p
  router.replace({ query: { page: String(p) } })
}
function openDetail(n: number) {
  router.push({ name: 'hadith-detail', params: { book: slug, number: String(n) } })
}
</script>

<template>
  <div class="flex flex-col flex-1 bg-background">
    <div class="max-w-3xl mx-auto px-4 py-8 w-full flex-1">
      <Button variant="ghost" size="sm" class="mb-4" @click="router.push({ name: 'hadith-books' })">← Kembali</Button>
      <div class="mb-6">
        <h1 class="text-xl font-bold">{{ book?.name ?? slug }}</h1>
        <p class="text-sm text-muted-foreground">{{ book?.arabicName }} · {{ pagination?.total.toLocaleString() }} hadith</p>
      </div>
      <div v-if="loading" class="py-20 text-center animate-pulse text-muted-foreground">Memuat hadith...</div>
      <div v-else-if="error" class="py-10 text-center text-destructive">{{ error }}</div>
      <div v-else class="flex flex-col gap-3">
        <div v-for="h in hadiths" :key="h.id" class="cursor-pointer" @click="openDetail(h.number)">
          <HadithCard :hadith="h" />
        </div>
        <div v-if="pagination" class="flex items-center justify-center gap-2 mt-6">
          <Button :disabled="!pagination.hasPrev" variant="outline" size="sm" @click="go(page - 1)">Prev</Button>
          <span class="text-xs text-muted-foreground">{{ pagination.page }} / {{ pagination.totalPages }}</span>
          <Button :disabled="!pagination.hasNext" variant="outline" size="sm" @click="go(page + 1)">Next</Button>
        </div>
      </div>
    </div>
    <AppFooter />
  </div>
</template>
