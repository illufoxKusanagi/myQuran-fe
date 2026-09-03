export interface JuzStart {
  juz: number
  surahId: number
  ayahNumber: number
}

export const JUZ_STARTS: JuzStart[] = [
  { juz: 1, surahId: 1, ayahNumber: 1 },
  { juz: 2, surahId: 2, ayahNumber: 142 },
  { juz: 3, surahId: 2, ayahNumber: 253 },
  { juz: 4, surahId: 3, ayahNumber: 93 },
  { juz: 5, surahId: 4, ayahNumber: 24 },
  { juz: 6, surahId: 4, ayahNumber: 148 },
  { juz: 7, surahId: 5, ayahNumber: 82 },
  { juz: 8, surahId: 6, ayahNumber: 111 },
  { juz: 9, surahId: 7, ayahNumber: 88 },
  { juz: 10, surahId: 8, ayahNumber: 41 },
  { juz: 11, surahId: 9, ayahNumber: 93 },
  { juz: 12, surahId: 11, ayahNumber: 6 },
  { juz: 13, surahId: 12, ayahNumber: 53 },
  { juz: 14, surahId: 15, ayahNumber: 1 },
  { juz: 15, surahId: 17, ayahNumber: 1 },
  { juz: 16, surahId: 18, ayahNumber: 75 },
  { juz: 17, surahId: 21, ayahNumber: 1 },
  { juz: 18, surahId: 23, ayahNumber: 1 },
  { juz: 19, surahId: 25, ayahNumber: 21 },
  { juz: 20, surahId: 27, ayahNumber: 56 },
  { juz: 21, surahId: 29, ayahNumber: 46 },
  { juz: 22, surahId: 33, ayahNumber: 31 },
  { juz: 23, surahId: 36, ayahNumber: 28 },
  { juz: 24, surahId: 39, ayahNumber: 32 },
  { juz: 25, surahId: 41, ayahNumber: 47 },
  { juz: 26, surahId: 46, ayahNumber: 1 },
  { juz: 27, surahId: 51, ayahNumber: 31 },
  { juz: 28, surahId: 58, ayahNumber: 1 },
  { juz: 29, surahId: 67, ayahNumber: 1 },
  { juz: 30, surahId: 78, ayahNumber: 1 },
]

export function getJuzStart(juz: number): JuzStart | undefined {
  return JUZ_STARTS.find((j) => j.juz === juz)
}
