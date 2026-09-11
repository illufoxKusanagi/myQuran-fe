import { onMounted, onBeforeUnmount } from 'vue';

interface ShortcutHandlers {
  onFlipNext: () => void;
  onFlipPrev: () => void;
  onTogglePlay?: () => void;
  onToggleTafsir?: () => void;
  onToggleSettings?: () => void;
  onQuickJump?: () => void;
  onClose?: () => void;
}

export function useReaderShortcuts(handlers: ShortcutHandlers) {
  function handler(e: KeyboardEvent) {
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable
    )
      return;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      handlers.onQuickJump?.();
      return;
    }

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        handlers.onFlipPrev();
        break;
      case 'ArrowRight':
        e.preventDefault();
        handlers.onFlipNext();
        break;
      case ' ':
        if (target.tagName === 'BUTTON') return;
        e.preventDefault();
        handlers.onTogglePlay?.();
        break;
      case 't':
      case 'T':
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          handlers.onToggleTafsir?.();
        }
        break;
      case 's':
      case 'S':
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          handlers.onToggleSettings?.();
        }
        break;
      case 'Escape':
        handlers.onClose?.();
        break;
    }
  }

  onMounted(() => window.addEventListener('keydown', handler));
  onBeforeUnmount(() => window.removeEventListener('keydown', handler));
}
