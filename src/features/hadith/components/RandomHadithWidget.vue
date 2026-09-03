<script setup lang="ts">
import { onMounted } from 'vue'
import { useRandomHadith } from '../composables/useHadith'
import { useRouter } from 'vue-router'

const router = useRouter()
const { hadith, book, fetchRandom } = useRandomHadith()
onMounted(() => fetchRandom())

function open() {
  if (!hadith.value) return
  const slug = book.value?.slug ?? (hadith.value as any).bookSlug
  if (!slug) return
  router.push({ name: 'hadith-detail', params: { book: slug, number: String(hadith.value.number) } })
}
</script>

<template>
  <div v-if="hadith" class="rounded-xl border border-border bg-card p-4">
    <p class="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">Hadith Hari Ini — {{ book?.name }}</p>
    <p class="font-arabic text-lg leading-loose" dir="rtl" style="text-align:right">{{ hadith.arabic.slice(0, 280) }}...</p>
    <p class="text-sm leading-relaxed mt-2 line-clamp-3">{{ hadith.translation.slice(0, 220) }}...</p>
    <button type="button" class="mt-3 text-xs font-semibold text-primary hover:underline cursor-pointer" @click="open">Baca selengkapnya →</button>
  </div>
</template>
