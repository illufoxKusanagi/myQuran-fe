// src/features/mushaf/types.ts

export type MushafPageType =
  | 'cover-front'
  | 'blank'
  | 'mushaf-page'
  | 'cover-back';

export interface MushafBookPage {
  type: MushafPageType;
  key: string;
  side?: 'front' | 'back';
  pageNumber?: number; // 1 to 604
  juzNumber?: number; // 1 to 30
  surahNames?: string[];
  imageUrl?: string;
  cdnFallbackUrl?: string;
}

export interface MushafPageMeta {
  page: number;
  juz: number | null;
  surahIds: number[];
  imageUrl: string;
  localImageUrl: string;
  totalAyahs: number;
  ayahs?: any[];
}

export interface JuzPageRef {
  juz: number;
  name: string;
  startPage: number;
}

export interface SurahPageRef {
  id: number;
  name: string;
  arabic: string;
  startPage: number;
  numAyah: number;
}
