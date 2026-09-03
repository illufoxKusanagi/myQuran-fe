export interface PopularRef {
  key: string
  label: string
  arabic: string
  surahId: number
  ayahNumber: number
  desc: string
}

export const POPULAR_REFS: PopularRef[] = [
  { key: 'yasin', label: 'Yasin', arabic: 'يس', surahId: 36, ayahNumber: 1, desc: 'Surah 36' },
  { key: 'waqiah', label: "Al-Waqi'ah", arabic: 'الواقعة', surahId: 56, ayahNumber: 1, desc: 'Surah 56' },
  { key: 'mulk', label: 'Al-Mulk', arabic: 'الملك', surahId: 67, ayahNumber: 1, desc: 'Surah 67' },
  { key: 'kahfi', label: 'Al-Kahfi', arabic: 'الكهف', surahId: 18, ayahNumber: 1, desc: 'Surah 18' },
  { key: 'rahman', label: 'Ar-Rahman', arabic: 'الرحمن', surahId: 55, ayahNumber: 1, desc: 'Surah 55' },
  { key: 'kursi', label: 'Ayat Kursi', arabic: 'آية الكرسي', surahId: 2, ayahNumber: 255, desc: '2:255' },
]
