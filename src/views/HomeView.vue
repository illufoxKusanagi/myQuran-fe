<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { BookOpen, ChevronRight } from 'lucide-vue-next';
import AppFooter from '@/components/AppFooter.vue';
import LastReadHero from '@/features/home/components/LastReadHero.vue';
import JuzJumpChips from '@/features/home/components/JuzJumpChips.vue';
import PopularShortcuts from '@/features/home/components/PopularShortcuts.vue';
import SurahSearchFilter from '@/features/home/components/SurahSearchFilter.vue';
import RandomHadithWidget from '@/features/hadith/components/RandomHadithWidget.vue';
import SurahDirectoryCard from '@/features/home/components/SurahDirectoryCard.vue';
import { useSurahFilter } from '@/features/home/composables/useSurahFilter';

interface Surah {
  id: number;
  surahName: string;
  arabic: string;
  numAyah: number;
  location: string;
}

const router = useRouter();
const surahs = ref<Surah[]>([]);
const loading = ref(true);
const fetchError = ref<string | null>(null);

const { query, filtered } = useSurahFilter(surahs);

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/surah`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new TypeError('Expected array of surahs');
    surahs.value = data;
  } catch (e) {
    fetchError.value = 'Gagal memuat daftar surah. Periksa koneksi.';
    console.error('Failed to fetch surahs:', e);
    surahs.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="flex flex-col flex-1 bg-cyan-100 dark:bg-cyan-900">
    <div class="max-w-5xl mx-auto px-4 py-10 w-full flex-1">
      <div class="text-center mb-10">
        <h1 class="heading-1 text-foreground mb-2">My Quran</h1>
        <p class="text-muted-foreground text-base">
          Baca Al-Quran kapan saja, dimana saja, tanpa install
        </p>
      </div>

      <LastReadHero />

      <!-- 604-Page Mushaf Quick Entry Banner -->
      <div class="mb-6 max-w-2xl mx-auto">
        <RouterLink
          to="/mushaf"
          class="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-primary/30 bg-card hover:border-primary/60 hover:shadow-md transition-all group cursor-pointer"
        >
          <div class="flex items-center gap-3.5">
            <div
              class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0"
            >
              <BookOpen class="w-5 h-5" />
            </div>
            <div>
              <h3
                class="text-sm font-bold text-foreground group-hover:text-primary transition-colors"
              >
                Mushaf Standar Indonesia (604 Halaman)
              </h3>
              <p class="text-xs text-muted-foreground">
                Baca dengan tampilan visual cetak Kemenag dan animasi buka
                lembar 3D
              </p>
            </div>
          </div>
          <ChevronRight
            class="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0"
          />
        </RouterLink>
      </div>

      <RandomHadithWidget />
      <PopularShortcuts />
      <JuzJumpChips />
      <SurahSearchFilter v-model="query" />

      <div v-if="loading" class="flex justify-center py-20">
        <p class="text-muted-foreground animate-pulse">Memuat surat-surat...</p>
      </div>

      <div v-else-if="fetchError" class="text-center py-10">
        <p class="text-destructive">{{ fetchError }}</p>
      </div>

      <div
        v-else-if="filtered.length === 0"
        class="text-center py-10 text-muted-foreground"
      >
        Tidak ada surah ditemukan
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <SurahDirectoryCard
          v-for="surah in filtered"
          :key="surah.id"
          :id="surah.id"
          :surah-name="surah.surahName"
          :arabic="surah.arabic"
          :num-ayah="surah.numAyah"
          :location="surah.location"
          @click="router.push({ name: 'surah', params: { id: surah.id } })"
        />
      </div>
    </div>
    <AppFooter />
  </div>
</template>
