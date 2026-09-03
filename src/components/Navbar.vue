<script setup lang="ts">
import { Moon, Sun, Info } from 'lucide-vue-next'
import { useDarkMode } from '@/composables/useDarkMode'
import { Button } from '@/components/ui/button'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'

const { isDark, toggle } = useDarkMode()
</script>

<template>
  <nav class="app-navbar">
    <!-- Brand -->
    <RouterLink to="/" class="brand">
      <span class="brand-icon">📖</span>
      MyQuran
    </RouterLink>

    <!-- Right actions -->
    <div class="flex items-center gap-1">
      <RouterLink to="/hadith" class="text-sm font-medium px-2 py-1 rounded hover:bg-accent">Hadith</RouterLink>
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
              Baca Al-Quran dengan tampilan buku interaktif, dilengkapi terjemahan
              dan tafsir. Dibuat dengan Vue 3 + ElysiaJS.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <!-- Dark mode toggle -->
      <Button variant="ghost" size="icon" @click="toggle" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
        <Sun v-if="isDark" class="w-4 h-4" />
        <Moon v-else class="w-4 h-4" />
      </Button>
    </div>
  </nav>
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
