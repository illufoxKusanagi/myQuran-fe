<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Moon, Sun, Info, Search } from 'lucide-vue-next';
import { useDarkMode } from '@/composables/useDarkMode';
import { Button } from '@/components/ui/button';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import GlobalSearchDialog from '@/components/GlobalSearchDialog.vue';

const { isDark, toggle } = useDarkMode();
const isSearchOpen = ref(false);

function handleGlobalKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    isSearchOpen.value = !isSearchOpen.value;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});
</script>

<template>
  <nav class="app-navbar">
    <!-- Brand -->
    <RouterLink to="/" class="brand">
      <span class="brand-icon">📖</span>
      MyQuran
    </RouterLink>

    <!-- Right actions -->
    <div class="flex items-center gap-1.5">
      <!-- Global Search Button -->
      <button
        type="button"
        class="flex items-center gap-2 h-8 px-2.5 rounded-lg border border-border bg-muted/40 hover:bg-accent text-muted-foreground hover:text-foreground text-xs transition-colors cursor-pointer"
        @click="isSearchOpen = true"
        aria-label="Cari Ayat dan Surah (Ctrl+K)"
      >
        <Search class="w-3.5 h-3.5" />
        <span class="hidden sm:inline">Cari ayat...</span>
        <kbd
          class="hidden md:inline-block px-1.5 py-0.5 text-[0.625rem] font-mono rounded bg-card border border-border/80"
          >Ctrl K</kbd
        >
      </button>

      <RouterLink
        to="/hadith"
        class="text-xs sm:text-sm font-medium px-2 py-1 rounded hover:bg-accent text-foreground"
        >Hadith</RouterLink
      >
      <!-- About tooltip -->
      <TooltipProvider :delay-duration="200">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="ghost" size="icon" aria-label="About MyQuran">
              <Info class="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" class="max-w-64 text-center">
            <p class="font-semibold mb-1">MyQuran</p>
            <p class="text-xs text-muted-foreground leading-relaxed">
              Baca Al-Quran dengan tampilan buku interaktif, dilengkapi
              terjemahan dan tafsir. Dibuat dengan Vue 3 + ElysiaJS.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <!-- Dark mode toggle -->
      <Button
        variant="ghost"
        size="icon"
        @click="toggle"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      >
        <Sun v-if="isDark" class="w-4 h-4" />
        <Moon v-else class="w-4 h-4" />
      </Button>
    </div>
  </nav>

  <GlobalSearchDialog v-model:open="isSearchOpen" />
</template>

<style scoped>
.app-navbar {
  height: 3.25rem;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 0.0625rem solid hsl(var(--border));
  background-color: hsl(var(--card));
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1rem;
  color: hsl(var(--foreground));
  letter-spacing: -0.01em;
}

.brand-icon {
  font-size: 1.1rem;
}
</style>
