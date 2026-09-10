// src/features/mushaf/composables/useMushafPages.ts
import { computed, ref, watch, type Ref } from 'vue';
import type { MushafBookPage } from '../types';
import {
  TOTAL_MUSHAF_PAGES,
  getPageImageUrl,
  getCdnFallbackUrl,
  getJuzByPage,
  getSurahsByPage,
} from '../mushafData';

export function useMushafPages(
  currentIndex: Ref<number>,
  isPortrait: Ref<boolean>
) {
  const isRtlBook = ref(true);
  const requestedTargetPage = ref<number | null>(null);

  // Generate 604 logical pages with front cover, blanks, and back cover
  const bookPages = computed<MushafBookPage[]>(() => {
    const logicPages: MushafBookPage[] = [];

    // 1. Front Hard Cover
    logicPages.push({ type: 'cover-front', key: 'cover-front' });

    // 2. Front Blank page for realistic book spine & spread alignment
    logicPages.push({ type: 'blank', key: 'front-blank', side: 'front' });

    // 3. 604 Mushaf Pages
    for (let p = 1; p <= TOTAL_MUSHAF_PAGES; p++) {
      const surahs = getSurahsByPage(p);
      logicPages.push({
        type: 'mushaf-page',
        key: `page-${p}`,
        pageNumber: p,
        juzNumber: getJuzByPage(p),
        surahNames: surahs.map((s) => s.name),
        imageUrl: getPageImageUrl(p),
        cdnFallbackUrl: getCdnFallbackUrl(p),
      });
    }

    // 4. Padding to ensure even number of leaves
    if ((logicPages.length + 2) % 2 !== 0) {
      logicPages.push({ type: 'blank', key: 'padding-extra', side: 'back' });
    }

    // 5. Back Blank & Back Cover
    logicPages.push({ type: 'blank', key: 'back-blank', side: 'back' });
    logicPages.push({ type: 'cover-back', key: 'cover-back' });

    // For authentic RTL Arabic Mushaf, reverse array (flipPrev advances forward)
    return [...logicPages].reverse();
  });

  const totalBookPages = computed(() => bookPages.value.length);
  const hasPrevPage = computed(() => currentIndex.value > 0);
  const hasNextPage = computed(
    () => currentIndex.value < totalBookPages.value - 1
  );

  const leftPage = computed<MushafBookPage | undefined>(
    () => bookPages.value[currentIndex.value]
  );
  const rightPage = computed<MushafBookPage | undefined>(() => {
    if (isPortrait.value) return undefined;
    return bookPages.value[currentIndex.value + 1];
  });

  // In RTL spread: right page is read first, then left page
  watch(currentIndex, () => {
    if (requestedTargetPage.value) {
      const isVisible =
        (rightPage.value?.type === 'mushaf-page' &&
          rightPage.value.pageNumber === requestedTargetPage.value) ||
        (leftPage.value?.type === 'mushaf-page' &&
          leftPage.value.pageNumber === requestedTargetPage.value);
      if (!isVisible) {
        requestedTargetPage.value = null;
      }
    }
  });

  // In RTL spread: right page is read first, then left page, prioritizing explicit jump target if visible
  const activePageNumber = computed<number>(() => {
    if (requestedTargetPage.value) {
      if (
        rightPage.value?.type === 'mushaf-page' &&
        rightPage.value.pageNumber === requestedTargetPage.value
      ) {
        return requestedTargetPage.value;
      }
      if (
        leftPage.value?.type === 'mushaf-page' &&
        leftPage.value.pageNumber === requestedTargetPage.value
      ) {
        return requestedTargetPage.value;
      }
    }

    if (rightPage.value?.type === 'mushaf-page' && rightPage.value.pageNumber) {
      return rightPage.value.pageNumber;
    }
    if (leftPage.value?.type === 'mushaf-page' && leftPage.value.pageNumber) {
      return leftPage.value.pageNumber;
    }
    return 1;
  });

  const currentJuz = computed<number>(() =>
    getJuzByPage(activePageNumber.value)
  );

  const activeSurahs = computed(() => getSurahsByPage(activePageNumber.value));

  // Find index in bookPages array for a given physical page number (1–604)
  function findPageIndexByPageNumber(pageNum: number): number {
    const p = Math.max(1, Math.min(TOTAL_MUSHAF_PAGES, pageNum));
    requestedTargetPage.value = p;
    const idx = bookPages.value.findIndex(
      (item) => item.type === 'mushaf-page' && item.pageNumber === p
    );
    if (idx === -1) return bookPages.value.length - 1;

    // In two-page mode, align to even spread boundary if needed
    if (!isPortrait.value && idx % 2 !== 0) {
      return Math.max(0, idx - 1);
    }
    return idx;
  }

  // Active preload window: load images within ±8 pages of current spread for instantaneous flips
  const preloadedPages = computed<Set<number>>(() => {
    const set = new Set<number>();
    const current = activePageNumber.value;
    const start = Math.max(1, current - 8);
    const end = Math.min(TOTAL_MUSHAF_PAGES, current + 8);

    for (let i = start; i <= end; i++) {
      set.add(i);
    }
    return set;
  });

  function isPagePreloaded(pageNum?: number): boolean {
    if (!pageNum) return false;
    return preloadedPages.value.has(pageNum);
  }

  return {
    isRtlBook,
    bookPages,
    totalBookPages,
    hasPrevPage,
    hasNextPage,
    leftPage,
    rightPage,
    activePageNumber,
    currentJuz,
    activeSurahs,
    findPageIndexByPageNumber,
    isPagePreloaded,
  };
}
