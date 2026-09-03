import { computed, type Ref } from 'vue';
import type { Hadith, HadithBookPage } from '../types';

export function useHadithBookPages(
  hadiths: Ref<Hadith[]>,
  currentIndex: Ref<number>,
  isPortrait: Ref<boolean>,
  bookName: Ref<string>,
  kitabName?: Ref<string>,
  arabicName?: Ref<string>
) {
  const isRtlBook = computed(() => true);

  const bookPages = computed<HadithBookPage[]>(() => {
    const pages: HadithBookPage[] = [];
    const logicPages: HadithBookPage[] = [];

    logicPages.push({
      type: 'cover-front',
      key: 'cover-front',
      bookName: bookName.value,
      kitabName: kitabName?.value,
      arabicName: arabicName?.value,
    });
    logicPages.push({ type: 'blank', key: 'front-blank', side: 'front' });

    hadiths.value.forEach((h, i) => {
      logicPages.push({
        type: 'hadith',
        key: `hadith-${h.id ?? h.number}`,
        hadith: h,
        hadithIndex: i,
      });
    });

    if ((logicPages.length + 2) % 2 !== 0) {
      logicPages.push({ type: 'blank', key: 'padding-extra', side: 'back' });
    }
    logicPages.push({ type: 'blank', key: 'back-blank', side: 'back' });
    logicPages.push({ type: 'cover-back', key: 'cover-back' });

    pages.push(...logicPages.reverse());
    return pages;
  });

  const totalBookPages = computed(() => bookPages.value.length);
  const hasPrevPage = computed(() => currentIndex.value > 0);
  const hasNextPage = computed(
    () => currentIndex.value < totalBookPages.value - 1
  );

  const leftPage = computed<HadithBookPage | undefined>(
    () => bookPages.value[currentIndex.value]
  );
  const rightPage = computed<HadithBookPage | undefined>(() => {
    if (isPortrait.value) return undefined;
    return bookPages.value[currentIndex.value + 1];
  });

  const leftHadith = computed<Hadith | undefined>(() => {
    if (leftPage.value?.type !== 'hadith') return undefined;
    return leftPage.value.hadith;
  });

  const rightHadith = computed<Hadith | undefined>(() => {
    if (rightPage.value?.type !== 'hadith') return undefined;
    return rightPage.value.hadith;
  });

  function getHadithByPageIndex(pageIndex: number): Hadith | undefined {
    const page = bookPages.value[pageIndex];
    if (!page || page.type !== 'hadith') return undefined;
    return page.hadith;
  }

  return {
    isRtlBook,
    bookPages,
    totalBookPages,
    hasPrevPage,
    hasNextPage,
    leftPage,
    rightPage,
    leftHadith,
    rightHadith,
    getHadithByPageIndex,
  };
}
