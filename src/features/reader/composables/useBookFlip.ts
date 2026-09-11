import {
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch,
  type Ref,
  type ComputedRef,
} from 'vue';
import { PageFlip } from 'page-flip';
import type { BookPage } from '../types';

interface BookFlipOptions {
  bookWrapRef: Ref<HTMLElement | null>;
  stageRef: Ref<HTMLElement | null>;
  bookPages: ComputedRef<BookPage[]>;
  isRtlBook: ComputedRef<boolean>;
  currentIndex: Ref<number>;
  isPortrait: Ref<boolean>;
  onFlipInit?: () => void;
}

export function useBookFlip(options: BookFlipOptions) {
  let bookInstance: any = null;
  let resizeTimeout: number | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let initRafId: number | null = null;
  let rebuildRafId: number | null = null;
  let initRetryCount = 0;
  const MAX_INIT_RETRIES = 20;
  let lastW = 0;
  let lastH = 0;

  function detectLayout() {
    options.isPortrait.value = window.innerWidth < 768;
  }

  function getPageSize() {
    const wrap = options.bookWrapRef.value;
    if (!wrap || !wrap.isConnected) return null;
    const rect = wrap.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (w < 80 || h < 80) return null;
    const pageW = options.isPortrait.value ? w : Math.round(w / 2);
    return { w, h, pageW, pageH: h };
  }

  function initPageFlip(preserveIndex = false) {
    if (bookInstance) return;
    const wrap = options.bookWrapRef.value;
    const stage = options.stageRef.value;
    if (
      !wrap ||
      !wrap.isConnected ||
      !stage ||
      options.bookPages.value.length === 0
    )
      return;

    const rawPages = Array.from(
      stage.querySelectorAll<HTMLElement>('.pf-page')
    );
    if (rawPages.length === 0) return;

    const size = getPageSize();
    if (!size) {
      if (initRetryCount < MAX_INIT_RETRIES) {
        initRetryCount++;
        initRafId = requestAnimationFrame(() => initPageFlip(preserveIndex));
      } else {
        console.warn(
          'PageFlip init aborted: container dimensions unavailable after maximum retries'
        );
      }
      return;
    }
    initRetryCount = 0;
    initRafId = null;
    lastW = size.w;
    lastH = size.h;

    // Clone pages so PageFlip loadFromHTML does not remove them from stageRef
    const pages = rawPages.map((el) => el.cloneNode(true) as HTMLElement);

    // Mount inside a dedicated child host container so PageFlip.destroy() does not remove bookWrapRef from DOM
    wrap.innerHTML = '';
    const host = document.createElement('div');
    host.className = 'pf-mount-host w-full h-full relative overflow-visible';
    host.style.width = '100%';
    host.style.height = '100%';
    host.style.position = 'relative';
    host.style.overflow = 'visible';
    wrap.appendChild(host);

    const startPage = preserveIndex
      ? Math.max(
          0,
          Math.min(
            options.currentIndex.value,
            options.bookPages.value.length - 1
          )
        )
      : options.isRtlBook.value
        ? Math.max(0, options.bookPages.value.length - 1)
        : 0;

    bookInstance = new PageFlip(host, {
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
    });

    bookInstance.loadFromHTML(pages);
    options.currentIndex.value = startPage;
    bookInstance.on('flip', (e: any) => {
      options.currentIndex.value = e.data;
    });

    requestAnimationFrame(() => {
      options.onFlipInit?.();
    });
  }

  function rebuild(preserveIndex = false) {
    if (rebuildRafId !== null) {
      cancelAnimationFrame(rebuildRafId);
      rebuildRafId = null;
    }
    const idx = options.currentIndex.value;
    destroyBook();
    nextTick(() => {
      rebuildRafId = requestAnimationFrame(() => {
        rebuildRafId = null;
        if (preserveIndex) options.currentIndex.value = idx;
        initPageFlip(preserveIndex);
      });
    });
  }

  function scheduleReinit() {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      const wrap = options.bookWrapRef.value;
      if (!wrap || !wrap.isConnected) return;
      const rect = wrap.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (w < 80 || h < 80) {
        if (initRetryCount < MAX_INIT_RETRIES) {
          initRetryCount++;
          scheduleReinit();
        }
        return;
      }
      initRetryCount = 0;
      const portraitNow = window.innerWidth < 768;
      const sizeChanged = Math.abs(w - lastW) > 2 || Math.abs(h - lastH) > 2;
      if (portraitNow !== options.isPortrait.value || sizeChanged) {
        options.isPortrait.value = portraitNow;
        rebuild(true);
      }
    }, 150);
  }

  function handleResize() {
    scheduleReinit();
  }

  function attachObserver() {
    if (!options.bookWrapRef.value || typeof ResizeObserver === 'undefined')
      return;
    resizeObserver = new ResizeObserver(() => scheduleReinit());
    resizeObserver.observe(options.bookWrapRef.value);
  }

  watch(
    () => options.bookWrapRef.value,
    (el) => {
      if (el && !resizeObserver) attachObserver();
    }
  );

  watch(
    () => options.bookPages.value.length,
    (len, prev) => {
      if (len > 0 && prev === 0) {
        nextTick(() => requestAnimationFrame(() => initPageFlip()));
      }
    }
  );

  function flipNext() {
    if (bookInstance) bookInstance.flipNext('top');
  }

  function flipPrev() {
    if (bookInstance) bookInstance.flipPrev('top');
  }

  function goToPage(pageIndex: number) {
    if (
      bookInstance &&
      pageIndex >= 0 &&
      pageIndex < options.bookPages.value.length
    ) {
      bookInstance.flip(pageIndex);
    }
  }

  function destroyBook() {
    if (initRafId !== null) {
      cancelAnimationFrame(initRafId);
      initRafId = null;
    }
    if (rebuildRafId !== null) {
      cancelAnimationFrame(rebuildRafId);
      rebuildRafId = null;
    }
    initRetryCount = 0;
    if (bookInstance) {
      try {
        bookInstance.destroy();
      } catch (err) {
        console.warn('PageFlip destroy warning:', err);
      }
      bookInstance = null;
    }
    if (options.bookWrapRef.value) {
      options.bookWrapRef.value.innerHTML = '';
    }
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleResize);
  });

  onBeforeUnmount(() => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    document.removeEventListener('fullscreenchange', handleResize);
    window.removeEventListener('resize', handleResize);
    destroyBook();
  });

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
  };
}
