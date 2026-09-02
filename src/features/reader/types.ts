export interface Ayah {
  id: number
  surahId: number
  ayahNumber: number
  arabic: string
  latin: string
  translation: string
  wajizTafsir: string
  tahliliTafsir: string
  page: number
  juz: number
}

export interface SurahMeta {
  id: number
  surahName: string
  arabic: string
  translation?: string
  numAyah?: number
  location?: string
}

export type BookPage =
  | { type: 'cover-front'; key: string }
  | { type: 'ayah'; key: string; ayah: Ayah; ayahIndex: number }
  | { type: 'blank'; key: string; side: 'front' | 'back' }
  | { type: 'cover-back'; key: string }
