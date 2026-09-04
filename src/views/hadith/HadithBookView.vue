<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Settings2,
  BookOpen,
  ListOrdered,
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { useHadithList } from '@/features/hadith/composables/useHadith';
import { useHadithBookPages } from '@/features/hadith/composables/useHadithBookPages';
import { useBookFlip } from '@/features/reader/composables/useBookFlip';
import { useReadingSettings } from '@/features/reader/composables/useReadingSettings';
import ReadingSettingsDialog from '@/features/reader/components/ReadingSettingsDialog.vue';
import ReaderNavSidebar from '@/features/reader/components/ReaderNavSidebar.vue';
import '@/features/reader/reader.css';

const route = useRoute();
const router = useRouter();
const bookSlug = route.params.book as string;
const kitabNo = ref<number>(Number(route.query.kitab ?? 1));

const { hadiths, book, loading, error, fetchList } = useHadithList(bookSlug);

const stageRef = ref<HTMLElement | null>(null);
const bookWrapRef = ref<HTMLElement | null>(null);
const currentIndex = ref(0);
const isPortrait = ref(false);
const isSettingsOpen = ref(false);

const bookTitle = computed(() => book.value?.name ?? bookSlug);
const arabicTitle = computed(() => book.value?.arabicName ?? '');
const kitabTitle = computed(() => {
  if (hadiths.value.length > 0 && hadiths.value[0].kitabName) {
    return hadiths.value[0].kitabName;
  }
  return `Kitab ${kitabNo.value}`;
});

const {
  isRtlBook,
  bookPages,
  hasPrevPage,
  hasNextPage,
  leftHadith,
  rightHadith,
} = useHadithBookPages(
  hadiths,
  currentIndex,
  isPortrait,
  bookTitle,
  kitabTitle,
  arabicTitle
);

const {
  detectLayout,
  initPageFlip,
  handleResize,
  flipNext,
  flipPrev,
  goToPage,
  attachObserver,
  destroyBook,
} = useBookFlip({
  bookWrapRef,
  stageRef,
  bookPages: bookPages as any,
  isRtlBook,
  currentIndex,
  isPortrait,
});

const isNavOpen = ref(false);

function jumpToHadith(hadithNumber: number): boolean {
  const idx = bookPages.value.findIndex(
    (p) => p.type === 'hadith' && p.hadith.number === hadithNumber
  );
  if (idx === -1) return false;
  goToPage(idx);
  return true;
}

function onKitabChange(newKitabNo: number) {
  kitabNo.value = newKitabNo;
  router.replace({
    query: { kitab: String(newKitabNo) },
  });
}

const { settings: readingSettings } = useReadingSettings();

function attachScrollGuards() {
  if (!bookWrapRef.value) return;
  const roots = bookWrapRef.value.querySelectorAll('.pf-scroll');
  roots.forEach((el) => {
    const container = el as HTMLElement;
    if ((container as any)._scrollGuarded) return;

    container.addEventListener(
      'wheel',
      (e: WheelEvent) => {
        const canScrollUp = container.scrollTop > 0 && e.deltaY < 0;
        const canScrollDown =
          container.scrollTop + container.clientHeight <
            container.scrollHeight && e.deltaY > 0;

        if (canScrollUp || canScrollDown) {
          container.scrollTop += e.deltaY;
          e.stopPropagation();
          e.preventDefault();
        }
      },
      { passive: false, capture: true }
    );

    container.addEventListener('mousedown', (e: MouseEvent) => {
      e.stopPropagation();
    });

    let startY = 0;
    container.addEventListener(
      'touchstart',
      (e: TouchEvent) => {
        if (e.touches.length === 1) {
          startY = e.touches[0].clientY;
          e.stopPropagation();
        }
      },
      { passive: true }
    );

    container.addEventListener(
      'touchmove',
      (e: TouchEvent) => {
        if (e.touches.length === 1) {
          const currentY = e.touches[0].clientY;
          const deltaY = startY - currentY;
          const canScrollUp = container.scrollTop > 0 && deltaY < 0;
          const canScrollDown =
            container.scrollTop + container.clientHeight <
              container.scrollHeight && deltaY > 0;

          if (canScrollUp || canScrollDown) {
            container.scrollTop += deltaY;
            startY = currentY;
            e.stopPropagation();
          }
        }
      },
      { passive: true }
    );

    (container as any)._scrollGuarded = true;
  });
}

function syncBookTheme() {
  if (!bookWrapRef.value) return;
  const root = bookWrapRef.value;
  const arabicSize = `${readingSettings.value.arabicFontSize}px`;
  const translationSize = `${readingSettings.value.translationFontSize}px`;

  root.style.setProperty('--arabic-size', arabicSize);
  root.style.setProperty('--translation-size', translationSize);
  root.style.setProperty('--latin-size', translationSize);

  if (stageRef.value) {
    stageRef.value.style.setProperty('--arabic-size', arabicSize);
    stageRef.value.style.setProperty('--translation-size', translationSize);
    stageRef.value.style.setProperty('--latin-size', translationSize);
  }

  root.querySelectorAll<HTMLElement>('.pf-arabic').forEach((el) => {
    el.style.fontSize = arabicSize;
  });
  root.querySelectorAll<HTMLElement>('.pf-translation').forEach((el) => {
    el.style.fontSize = translationSize;
  });
  root.querySelectorAll<HTMLElement>('.pf-latin').forEach((el) => {
    el.style.fontSize = translationSize;
  });
  root.classList.remove(
    'paper-sepia',
    'paper-dark',
    'paper-amoled',
    'hide-arabic',
    'hide-latin',
    'hide-translation'
  );
  if (readingSettings.value.paperTheme !== 'default')
    root.classList.add(`paper-${readingSettings.value.paperTheme}`);
  if (!readingSettings.value.showArabic) root.classList.add('hide-arabic');
  if (!readingSettings.value.showLatin) root.classList.add('hide-latin');
  if (!readingSettings.value.showTranslation)
    root.classList.add('hide-translation');
  nextTick(() => requestAnimationFrame(() => attachScrollGuards()));
}

watch(
  () => [
    readingSettings.value.paperTheme,
    readingSettings.value.arabicFontSize,
    readingSettings.value.translationFontSize,
    readingSettings.value.showArabic,
    readingSettings.value.showLatin,
    readingSettings.value.showTranslation,
  ],
  () => {
    if (loading.value) return;
    nextTick(() => requestAnimationFrame(() => syncBookTheme()));
  }
);

watch([leftHadith, rightHadith, currentIndex], () => {
  nextTick(() => requestAnimationFrame(() => attachScrollGuards()));
});

async function loadData() {
  destroyBook();
  await fetchList(1, 100, kitabNo.value);
  await nextTick();
  detectLayout();
  await nextTick();
  requestAnimationFrame(() => {
    initPageFlip();
    attachObserver();
    requestAnimationFrame(() => {
      syncBookTheme();
      attachScrollGuards();
    });
  });
}

onMounted(() => {
  loadData();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

function openDetail(hadithNumber: number) {
  router.push({
    name: 'hadith-detail',
    params: { book: bookSlug, number: String(hadithNumber) },
  });
}

function getGradeClass(grade?: string) {
  if (!grade) return '';
  const g = grade.toLowerCase();
  if (g.includes('shahih') || g.includes('sahih')) return 'grade-sahih';
  if (g.includes('hasan')) return 'grade-hasan';
  return 'grade-daif';
}

watch(
  () => route.query.kitab,
  (newKitab) => {
    if (newKitab) {
      kitabNo.value = Number(newKitab);
      loadData();
    }
  }
);
</script>

<template>
  <div
    class="flex-1 flex flex-col bg-background text-foreground overflow-hidden"
  >
    <!-- Header -->
    <header
      class="shrink-0 h-14 border-b border-border bg-card flex items-center justify-between gap-3 px-4"
    >
      <div class="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          @click="
            router.push({ name: 'hadith-list', params: { book: bookSlug } })
          "
          aria-label="Kembali ke Daftar"
        >
          <ArrowLeft class="w-5 h-5" />
        </Button>
        <div
          class="min-w-0 cursor-pointer group"
          title="Buka navigasi hadits & kitab"
          @click="isNavOpen = true"
        >
          <div class="flex items-center gap-1.5">
            <p
              class="font-semibold text-foreground leading-none truncate group-hover:text-primary transition-colors"
            >
              {{ bookTitle }}
            </p>
            <ListOrdered
              class="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0"
            />
          </div>
          <p class="text-xs text-muted-foreground mt-0.5 truncate">
            {{ kitabTitle }} · {{ hadiths.length }} Hadith
          </p>
        </div>
      </div>
      <div class="flex items-center gap-1.5 shrink-0">
        <Button
          variant="outline"
          size="sm"
          class="gap-1.5 h-8 px-2 sm:px-2.5 text-xs text-foreground border-border hover:border-primary/40 hover:bg-accent"
          @click="isNavOpen = true"
        >
          <ListOrdered class="w-3.5 h-3.5 text-primary" />
          <span class="hidden sm:inline">Pilih Hadits</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          @click="isSettingsOpen = true"
          aria-label="Pengaturan Tampilan"
        >
          <Settings2 class="w-4 h-4" />
        </Button>
        <span
          class="text-xl font-arabic text-foreground shrink-0 hidden sm:inline"
          >{{ arabicTitle }}</span
        >
      </div>
    </header>

    <!-- Loading & Error -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <p class="text-muted-foreground animate-pulse">Memuat Kitab Hadith…</p>
    </div>
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <p class="text-destructive">{{ error }}</p>
    </div>

    <!-- Book Reading Area -->
    <template v-else>
      <!-- Staging Container for PageFlip -->
      <div
        ref="stageRef"
        aria-hidden="true"
        style="
          position: absolute;
          visibility: hidden;
          pointer-events: none;
          left: -9999px;
        "
      >
        <div
          v-for="page in bookPages"
          :key="page.key"
          class="pf-page"
          :class="{
            'pf-cover-front': page.type === 'cover-front',
            'pf-cover-back': page.type === 'cover-back',
            'pf-blank': page.type === 'blank',
          }"
          :data-density="
            page.type === 'hadith' || page.type === 'blank' ? 'soft' : 'hard'
          "
        >
          <!-- Front Cover -->
          <template v-if="page.type === 'cover-front'">
            <div class="pf-cover-inner">
              <p class="pf-cover-label">{{ page.bookName }}</p>
              <h2 class="pf-cover-title">
                {{ page.kitabName || 'Kitab Hadits' }}
              </h2>
              <p v-if="page.arabicName" class="pf-cover-arabic">
                {{ page.arabicName }}
              </p>
              <p class="pf-cover-translation mt-2">
                {{ hadiths.length }} Hadits
              </p>
            </div>
          </template>

          <!-- Hadith Page Leaf -->
          <template v-else-if="page.type === 'hadith'">
            <div class="flex items-center justify-between shrink-0 mb-1">
              <div class="pf-badge">{{ page.hadith.number }}</div>
              <span
                v-if="page.hadith.grade"
                class="hadith-grade"
                :class="getGradeClass(page.hadith.grade)"
              >
                {{ page.hadith.grade }}
              </span>
            </div>

            <div class="pf-scroll">
              <p
                v-if="page.hadith.babName"
                class="text-xs font-semibold text-primary/80 mb-2 border-b border-border/50 pb-1"
              >
                {{ page.hadith.babName }}
              </p>
              <p
                class="pf-arabic"
                :style="{ fontSize: `${readingSettings.arabicFontSize}px` }"
              >
                {{ page.hadith.arabic }}
              </p>
              <div class="pf-lower">
                <p
                  v-if="page.hadith.latin"
                  class="pf-latin"
                  :style="{
                    fontSize: `${readingSettings.translationFontSize}px`,
                  }"
                >
                  {{ page.hadith.latin }}
                </p>
                <p
                  class="pf-translation"
                  :style="{
                    fontSize: `${readingSettings.translationFontSize}px`,
                  }"
                >
                  {{ page.hadith.translation }}
                </p>
              </div>
            </div>
          </template>

          <!-- Blank Leaves -->
          <div v-else-if="page.type === 'blank'" class="pf-blank-inner" />
          <div v-else class="pf-cover-back-inner" />
        </div>
      </div>

      <!-- Book Mount Stage -->
      <main
        class="flex-1 flex items-center justify-center gap-3 overflow-visible px-2 py-4"
      >
        <button
          class="nav-arrow"
          :disabled="!hasPrevPage"
          aria-label="Halaman Sebelumnya"
          @click="flipPrev"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
        <div ref="bookWrapRef" class="book-mount" />
        <button
          class="nav-arrow"
          :disabled="!hasNextPage"
          aria-label="Halaman Berikutnya"
          @click="flipNext"
        >
          <ChevronRight class="w-5 h-5" />
        </button>
      </main>

      <!-- Bottom Reading Bar -->
      <footer
        class="shrink-0 border-t border-border bg-card flex items-center justify-between px-4 py-2.5 gap-2"
      >
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <div v-if="leftHadith" class="flex items-center gap-2 min-w-0">
            <span
              class="text-xs shrink-0 font-semibold text-foreground tabular-nums"
            >
              No. {{ leftHadith.number }}
            </span>
            <Button
              variant="ghost"
              size="icon"
              class="w-7 h-7"
              @click="openDetail(leftHadith.number)"
              title="Lihat Detail Hadits"
            >
              <BookOpen class="w-3.5 h-3.5" />
            </Button>
          </div>

          <template v-if="rightHadith && !isPortrait">
            <span class="text-border">|</span>
            <div class="flex items-center gap-2 min-w-0">
              <span
                class="text-xs shrink-0 font-semibold text-foreground tabular-nums"
              >
                No. {{ rightHadith.number }}
              </span>
              <Button
                variant="ghost"
                size="icon"
                class="w-7 h-7"
                @click="openDetail(rightHadith.number)"
                title="Lihat Detail Hadits"
              >
                <BookOpen class="w-3.5 h-3.5" />
              </Button>
            </div>
          </template>

          <span class="text-xs text-muted-foreground ml-1 truncate">
            (Kitab: {{ kitabTitle }})
          </span>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            class="text-xs h-8 gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
            @click="isNavOpen = true"
          >
            <ListOrdered class="w-3.5 h-3.5" />
            <span>Pilih Hadits</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            class="text-xs h-8"
            @click="
              router.push({ name: 'hadith-list', params: { book: bookSlug } })
            "
          >
            Daftar Hadits
          </Button>
        </div>
      </footer>
    </template>

    <ReadingSettingsDialog
      :open="isSettingsOpen"
      @update:open="isSettingsOpen = $event"
      @close="isSettingsOpen = false"
    />

    <!-- Navigation Drawer Sidebar -->
    <ReaderNavSidebar
      v-model:open="isNavOpen"
      mode="hadith"
      :title="bookTitle"
      :subtitle="kitabTitle"
      :hadiths="hadiths"
      :active-hadith="leftHadith?.number || rightHadith?.number"
      :current-kitab-no="kitabNo"
      :book-slug="bookSlug"
      @select-hadith="jumpToHadith"
      @change-kitab="onKitabChange"
    />
  </div>
</template>
