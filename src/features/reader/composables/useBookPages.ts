import { computed, type Ref } from 'vue'
import type { Ayah, BookPage } from '../types'

export function useBookPages(
  ayahs: Ref<Ayah[]>,
  surahArabic: Ref<string>,
  currentIndex: Ref<number>,
  isPortrait: Ref<boolean>
) {
  const isRtlBook = computed(() => surahArabic.value.trim().length > 0)

  const bookPages = computed<BookPage[]>(() => {
    const pages: BookPage[] = []

    if (!isRtlBook.value) {
      pages.push({ type: 'cover-front', key: 'cover-front' })
      pages.push({ type: 'blank', key: 'front-blank', side: 'front' })
      ayahs.value.forEach((ayah, i) => {
        pages.push({ type: 'ayah', key: `ayah-${ayah.id ?? ayah.ayahNumber}`, ayah, ayahIndex: i })
      })
      if (pages.length % 2 !== 0) pages.push({ type: 'blank', key: 'back-blank-extra', side: 'back' })
      pages.push({ type: 'blank', key: 'back-blank', side: 'back' })
      pages.push({ type: 'cover-back', key: 'cover-back' })
    } else {
      const logicPages: BookPage[] = []
      logicPages.push({ type: 'cover-front', key: 'cover-front' })
      logicPages.push({ type: 'blank', key: 'front-blank', side: 'front' })
      ayahs.value.forEach((ayah, i) => {
        logicPages.push({ type: 'ayah', key: `ayah-${ayah.id ?? ayah.ayahNumber}`, ayah, ayahIndex: i })
      })
      if ((logicPages.length + 2) % 2 !== 0) logicPages.push({ type: 'blank', key: 'padding-extra', side: 'back' })
      logicPages.push({ type: 'blank', key: 'back-blank', side: 'back' })
      logicPages.push({ type: 'cover-back', key: 'cover-back' })
      pages.push(...logicPages.reverse())
    }

    return pages
  })

  const totalBookPages = computed(() => bookPages.value.length)
  const hasPrevPage = computed(() => currentIndex.value > 0)
  const hasNextPage = computed(() => currentIndex.value < totalBookPages.value - 1)

  const leftPage = computed<BookPage | undefined>(() => bookPages.value[currentIndex.value])
  const rightPage = computed<BookPage | undefined>(() => {
    if (isPortrait.value) return undefined
    return bookPages.value[currentIndex.value + 1]
  })

  const leftAyah = computed<Ayah | undefined>(() => {
    if (leftPage.value?.type !== 'ayah') return undefined
    return leftPage.value.ayah
  })

  const rightAyah = computed<Ayah | undefined>(() => {
    if (rightPage.value?.type !== 'ayah') return undefined
    return rightPage.value.ayah
  })

  function getAyahByPageIndex(pageIndex: number): Ayah | undefined {
    const page = bookPages.value[pageIndex]
    if (!page || page.type !== 'ayah') return undefined
    return page.ayah
  }

  return { isRtlBook, bookPages, totalBookPages, hasPrevPage, hasNextPage, leftPage, rightPage, leftAyah, rightAyah, getAyahByPageIndex }
}
