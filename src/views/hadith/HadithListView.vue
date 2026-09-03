<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppFooter from '@/components/AppFooter.vue';
import HadithCard from '@/features/hadith/components/HadithCard.vue';
import { useHadithList } from '@/features/hadith/composables/useHadith';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const slug = route.params.book as string;
const page = ref(Number(route.query.page ?? 1));

const { hadiths, pagination, book, loading, error, fetchList } =
  useHadithList(slug);

function load() {
  fetchList(page.value, 20);
}

onMounted(load);
watch(page, load);
watch(
  () => route.params.book,
  () => location.reload()
);

function go(p: number) {
  page.value = p;
  router.replace({ query: { page: String(p) } });
}

function openDetail(n: number) {
  router.push({
    name: 'hadith-detail',
    params: { book: slug, number: String(n) },
  });
}

const jumpPageInput = ref('');
const jumpHadithInput = ref('');

function handleJumpPage() {
  const p = Number(jumpPageInput.value);
  if (
    !isNaN(p) &&
    p >= 1 &&
    pagination.value &&
    p <= pagination.value.totalPages
  ) {
    go(p);
    jumpPageInput.value = '';
  }
}

function handleJumpHadith() {
  const n = Number(jumpHadithInput.value);
  if (!isNaN(n) && n >= 1) {
    openDetail(n);
    jumpHadithInput.value = '';
  }
}

function openBookMode() {
  const currentKitab = hadiths.value[0]?.kitabNo ?? 1;
  router.push({
    name: 'hadith-book',
    params: { book: slug },
    query: { kitab: String(currentKitab) },
  });
}
</script>

<template>
  <div class="flex flex-col flex-1 bg-background">
    <div class="max-w-3xl mx-auto px-4 py-8 w-full flex-1">
      <Button
        variant="ghost"
        size="sm"
        class="mb-4"
        @click="router.push({ name: 'hadith-books' })"
      >
        ← Kembali
      </Button>

      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6"
      >
        <div>
          <h1 class="text-xl font-bold">{{ book?.name ?? slug }}</h1>
          <p class="text-sm text-muted-foreground">
            {{ book?.arabicName }} ·
            {{ pagination?.total.toLocaleString() }} hadith
          </p>
        </div>
        <Button
          variant="outline"
          class="gap-2 shrink-0 w-full sm:w-auto border-primary/30 hover:border-primary hover:bg-primary/5 text-primary"
          @click="openBookMode"
        >
          <BookOpen class="w-4 h-4" />
          <span>Baca sebagai Buku</span>
        </Button>
      </div>

      <div
        v-if="loading"
        class="py-20 text-center animate-pulse text-muted-foreground"
      >
        Memuat hadith...
      </div>
      <div v-else-if="error" class="py-10 text-center text-destructive">
        {{ error }}
      </div>
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="h in hadiths"
          :key="h.id"
          role="button"
          tabindex="0"
          :aria-label="`Buka hadith nomor ${h.number}`"
          class="cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          @click="openDetail(h.number)"
          @keydown.enter.prevent="openDetail(h.number)"
          @keydown.space.prevent="openDetail(h.number)"
        >
          <HadithCard :hadith="h" />
        </div>

        <!-- Pagination & Jump Controls -->
        <div
          v-if="pagination"
          class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-border/60"
        >
          <!-- Prev / Next Pagination -->
          <div class="flex items-center gap-2">
            <Button
              :disabled="!pagination.hasPrev"
              variant="outline"
              size="sm"
              @click="go(page - 1)"
            >
              Prev
            </Button>
            <span class="text-xs text-muted-foreground px-1">
              {{ pagination.page }} / {{ pagination.totalPages }}
            </span>
            <Button
              :disabled="!pagination.hasNext"
              variant="outline"
              size="sm"
              @click="go(page + 1)"
            >
              Next
            </Button>
          </div>

          <!-- Direct Jump Inputs -->
          <div
            class="flex items-center gap-2 sm:gap-3 flex-wrap justify-center"
          >
            <form
              class="flex items-center gap-1.5"
              @submit.prevent="handleJumpPage"
            >
              <span class="text-xs text-muted-foreground">Hal:</span>
              <input
                v-model="jumpPageInput"
                type="number"
                min="1"
                :max="pagination.totalPages"
                placeholder="..."
                class="w-14 h-8 px-2 text-xs bg-muted/40 border border-input rounded-md text-foreground text-center focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                class="h-8 px-2 text-xs"
              >
                Ke
              </Button>
            </form>

            <span class="text-border hidden sm:inline">|</span>

            <form
              class="flex items-center gap-1.5"
              @submit.prevent="handleJumpHadith"
            >
              <span class="text-xs text-muted-foreground">No:</span>
              <input
                v-model="jumpHadithInput"
                type="number"
                min="1"
                placeholder="Hadits..."
                class="w-20 h-8 px-2 text-xs bg-muted/40 border border-input rounded-md text-foreground text-center focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                class="h-8 px-2.5 text-xs"
              >
                Buka
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
    <AppFooter />
  </div>
</template>
