<script setup lang="ts">
import { ArrowLeft, Settings, ListOrdered } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

defineProps<{
  surahName: string;
  surahArabic: string;
  ayahCount: number;
  currentJuz?: number | null;
  surahId?: number;
}>();

defineEmits<{ back: []; settings: []; openNav: [] }>();
</script>

<template>
  <header
    class="shrink-0 h-14 border-b border-border bg-card flex items-center gap-2 sm:gap-3 px-3 sm:px-4"
  >
    <Button
      variant="ghost"
      size="icon"
      aria-label="Kembali ke daftar surah"
      @click="$emit('back')"
    >
      <ArrowLeft class="w-5 h-5" />
    </Button>
    <div
      class="flex-1 min-w-0 cursor-pointer group"
      title="Buka daftar ayat"
      @click="$emit('openNav')"
    >
      <div class="flex items-center gap-1.5">
        <p
          class="font-semibold text-foreground leading-none truncate group-hover:text-primary transition-colors"
        >
          {{ surahName }}
        </p>
        <ListOrdered
          class="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0"
        />
      </div>
      <p class="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
        <span>{{ ayahCount }} Ayat</span>
        <span
          v-if="currentJuz"
          class="inline-flex items-center rounded-full bg-primary/10 text-primary px-1.5 py-0 text-[0.625rem] font-semibold"
        >
          Juz {{ currentJuz }}
        </span>
      </p>
    </div>

    <!-- Explicit Daftar Ayat Button -->
    <Button
      variant="outline"
      size="sm"
      class="gap-1.5 h-8 px-2 sm:px-2.5 text-xs text-foreground border-border hover:border-primary/40 hover:bg-accent shrink-0"
      @click="$emit('openNav')"
    >
      <ListOrdered class="w-3.5 h-3.5 text-primary" />
      <span class="hidden sm:inline">Daftar Ayat</span>
    </Button>

    <p
      class="font-arabic text-xl sm:text-2xl text-foreground leading-none shrink-0 hidden md:block"
      dir="rtl"
      style="text-align: right"
    >
      {{ surahArabic }}
    </p>
    <Button
      variant="ghost"
      size="icon"
      aria-label="Pengaturan bacaan"
      @click="$emit('settings')"
    >
      <Settings class="w-5 h-5" />
    </Button>
  </header>
</template>
