<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppFooter from '@/components/AppFooter.vue';
import HadithCard from '@/features/hadith/components/HadithCard.vue';
import type { Hadith, HadithBook } from '@/features/hadith/types';
import { Button } from '@/components/ui/button';

const route = useRoute();
const router = useRouter();
const hadith = ref<Hadith | null>(null);
const book = ref<HadithBook | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

async function fetchOne() {
  loading.value = true;
  error.value = null;
  try {
    const slug = route.params.book as string;
    const num = route.params.number as string;
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/hadith/${slug}/${num}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    hadith.value = data.hadith;
    book.value = data.book;
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}

onMounted(fetchOne);
watch(() => [route.params.book, route.params.number], fetchOne);
</script>

<template>
  <div class="flex flex-col flex-1 bg-background">
    <div class="max-w-3xl mx-auto px-4 py-8 w-full flex-1">
      <Button variant="ghost" size="sm" class="mb-4" @click="router.back()"
        >← Kembali</Button
      >
      <div
        v-if="loading"
        class="py-20 text-center animate-pulse text-muted-foreground"
      >
        Memuat...
      </div>
      <div v-else-if="error" class="py-10 text-center text-destructive">
        {{ error }}
      </div>
      <template v-else-if="hadith">
        <p class="text-xs text-muted-foreground mb-2">
          {{ book?.name }} · Hadith #{{ hadith.number }} ·
          {{ hadith.kitabName }} / {{ hadith.babName }}
        </p>
        <HadithCard :hadith="hadith" />
      </template>
    </div>
    <AppFooter />
  </div>
</template>
