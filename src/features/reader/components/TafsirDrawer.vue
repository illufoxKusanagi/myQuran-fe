<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from 'vue';
import { Button } from '@/components/ui/button';
import type { Ayah } from '../types';

const props = defineProps<{
  isOpen: boolean;
  ayah?: Ayah;
}>();

const emit = defineEmits<{ close: [] }>();

const panelRef = ref<HTMLElement | null>(null);
const closeBtnRef = ref<InstanceType<typeof Button> | HTMLElement | null>(null);
let previousFocus: HTMLElement | null = null;

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter(
    (el) =>
      !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
  );
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault();
    emit('close');
    return;
  }
  if (e.key === 'Tab' && panelRef.value) {
    const focusable = getFocusable(panelRef.value);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

watch(
  () => props.isOpen,
  async (open) => {
    if (open) {
      previousFocus = document.activeElement as HTMLElement | null;
      await nextTick();
      const btn = (closeBtnRef.value as any)?.$el ?? closeBtnRef.value;
      if (btn instanceof HTMLElement) btn.focus();
      else if (panelRef.value) {
        const focusable = getFocusable(panelRef.value);
        if (focusable[0]) focusable[0].focus();
      }
      document.addEventListener('keydown', handleKeydown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = '';
      if (previousFocus && typeof previousFocus.focus === 'function')
        previousFocus.focus();
    }
  }
);

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <Transition name="drawer">
    <div v-if="isOpen" class="fixed inset-0 z-50">
      <div class="drawer-backdrop" @click="emit('close')" />
      <div
        ref="panelRef"
        class="drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Tafsir ayat"
        tabindex="-1"
      >
        <div
          class="sticky top-0 bg-card flex items-start justify-between p-4 border-b border-border z-10"
        >
          <div>
            <p class="font-semibold text-foreground">Tafsir</p>
            <p class="text-xs text-muted-foreground">
              Ayah {{ ayah?.ayahNumber }}
            </p>
          </div>
          <Button
            ref="closeBtnRef"
            variant="ghost"
            size="sm"
            @click="emit('close')"
            >Close</Button
          >
        </div>
        <div v-if="ayah" class="p-5 space-y-5">
          <div class="rounded-lg bg-muted p-4">
            <p
              class="font-arabic text-2xl text-foreground leading-loose"
              dir="rtl"
              style="text-align: right"
            >
              {{ ayah.arabic }}
            </p>
            <p class="text-muted-foreground text-sm mt-2 italic">
              {{ ayah.translation }}
            </p>
          </div>
          <div>
            <p class="text-sm font-semibold text-foreground mb-2">
              Tafsir Wajiz
            </p>
            <p class="text-sm text-muted-foreground leading-relaxed">
              {{ ayah.wajizTafsir || 'Not available.' }}
            </p>
          </div>
          <div class="border-t border-border pt-4">
            <p class="text-sm font-semibold text-foreground mb-2">
              Tafsir Tahlili
            </p>
            <p class="text-sm text-muted-foreground leading-relaxed">
              {{ ayah.tahliliTafsir || 'Not available.' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.drawer-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(0.25rem);
}
.drawer-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--card);
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 -0.625rem 2.5rem rgba(0, 0, 0, 0.15);
}
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
</style>
