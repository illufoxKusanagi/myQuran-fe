import { onBeforeUnmount, nextTick, watch, type Ref, type ComputedRef } from 'vue'
import { PageFlip } from 'page-flip'
import type { BookPage } from '../types'

interface BookFlipOptions {
  bookWrapRef: Ref<HTMLElement | null>
  stageRef: Ref<HTMLElement | null>
  bookPages: ComputedRef<BookPage[]>
  isRtlBook: ComputedRef<boolean>
  currentIndex: Ref<number>
  isPortrait: Ref<boolean>
}

export function useBookFlip(options: BookFlipOptions) {
  let bookInstance: any = null
  let resizeTimeout: number | null = null
  let resizeObserver: ResizeObserver | null = null
  let lastW = 0
  let lastH = 0

  function detectLayout() {
    options.isPortrait.value = window.innerWidth < 768
  }

  function getPageSize() {
    const wrap = options.bookWrapRef.value!
    const rect = wrap.getBoundingClientRect()
    const w = Math.round(rect.width)
    const h = Math.round(rect.height)
    if (w < 80 || h < 80) return null
    const pageW = options.isPortrait.value ? w : Math.round(w / 2)
    return { w, h, pageW, pageH: h }
  }

  function initPageFlip(preserveIndex = false) {
    if (bookInstance) return
    if (!options.bookWrapRef.value || !options.stageRef.value || options.bookPages.value.length === 0) return
    const pages = Array.from(options.stageRef.value.querySelectorAll('.pf-page'))
    if (pages.length === 0) return
    const size = getPageSize()
    if (!size) {
      requestAnimationFrame(() => initPageFlip(preserveIndex))
      return
    }
    lastW = size.w
    lastH = size.h

    const startPage = preserveIndex
      ? Math.min(options.currentIndex.value, options.bookPages.value.length - 1)
      : options.isRtlBook.value
        ? Math.max(0, options.bookPages.value.length - 1)
        : 0

    bookInstance = new PageFlip(options.bookWrapRef.value, {
      width: size.pageW,
      height: size.pageH,
      showCover: true,
      useMouseEvents: true,
      drawShadow: true,
      maxShadowOpacity: 0.3,
      flippingTime: 600,
      startZIndex: 10,
      startPage,
      usePortrait: options.isPortrait.value,
      autoSize: false,
    })

    bookInstance.loadFromHTML(pages)
    options.currentIndex.value = startPage
    bookInstance.on('flip', (e: any) => {
      options.currentIndex.value = e.data
    })
  }

  function rebuild(preserveIndex = false) {
    const idx = options.currentIndex.value
    destroyBook()
    nextTick(() =>
      requestAnimationFrame(() => {
        if (preserveIndex) options.currentIndex.value = idx
        initPageFlip(preserveIndex)
      })
    )
  }

  function scheduleReinit() {
    if (resizeTimeout) clearTimeout(resizeTimeout)
    resizeTimeout = window.setTimeout(() => {
      const wrap = options.bookWrapRef.value
      if (!wrap) return
      const rect = wrap.getBoundingClientRect()
      const w = Math.round(rect.width)
      const h = Math.round(rect.height)
      const portraitNow = window.innerWidth < 768
      const sizeChanged = Math.abs(w - lastW) > 2 || Math.abs(h - lastH) > 2
      if (portraitNow !== options.isPortrait.value || sizeChanged) {
        options.isPortrait.value = portraitNow
        destroyBook()
        nextTick(() => requestAnimationFrame(() => initPageFlip()))
      }
    }, 150)
  }

  function handleResize() {
    scheduleReinit()
  }

  function attachObserver() {
    if (!options.bookWrapRef.value || typeof ResizeObserver === 'undefined') return
    resizeObserver = new ResizeObserver(() => scheduleReinit())
    resizeObserver.observe(options.bookWrapRef.value)
  }

  watch(
    () => options.bookWrapRef.value,
    (el) => {
      if (el && !resizeObserver) attachObserver()
    }
  )

  watch(
    () => options.bookPages.value.length,
    (len, prev) => {
      if (len > 0 && prev === 0) {
        nextTick(() => requestAnimationFrame(() => initPageFlip()))
      }
    }
  )

  function flipNext() {
    if (bookInstance) bookInstance.flipNext('top')
  }

  function flipPrev() {
    if (bookInstance) bookInstance.flipPrev('top')
  }

  function goToPage(pageIndex: number) {
    if (bookInstance && pageIndex >= 0 && pageIndex < options.bookPages.value.length) {
      bookInstance.flip(pageIndex)
    }
  }

  function destroyBook() {
    if (bookInstance) {
      bookInstance.destroy()
      bookInstance = null
    }
  }

  onBeforeUnmount(() => {
    if (resizeTimeout) clearTimeout(resizeTimeout)
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
    window.removeEventListener('resize', handleResize)
    destroyBook()
  })

  return {
    detectLayout,
    initPageFlip,
    handleResize,
    flipNext,
    flipPrev,
    goToPage,
    destroyBook,
    attachObserver,
    rebuild,
  }
}
