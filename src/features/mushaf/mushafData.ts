// src/features/mushaf/mushafData.ts
import type { JuzPageRef, SurahPageRef } from './types';

export const TOTAL_MUSHAF_PAGES = 604;

export const JUZ_PAGES: JuzPageRef[] = [
  { juz: 1, name: 'Juz 1', startPage: 1 },
  { juz: 2, name: 'Juz 2', startPage: 22 },
  { juz: 3, name: 'Juz 3', startPage: 42 },
  { juz: 4, name: 'Juz 4', startPage: 62 },
  { juz: 5, name: 'Juz 5', startPage: 82 },
  { juz: 6, name: 'Juz 6', startPage: 102 },
  { juz: 7, name: 'Juz 7', startPage: 122 },
  { juz: 8, name: 'Juz 8', startPage: 142 },
  { juz: 9, name: 'Juz 9', startPage: 162 },
  { juz: 10, name: 'Juz 10', startPage: 182 },
  { juz: 11, name: 'Juz 11', startPage: 202 },
  { juz: 12, name: 'Juz 12', startPage: 222 },
  { juz: 13, name: 'Juz 13', startPage: 242 },
  { juz: 14, name: 'Juz 14', startPage: 262 },
  { juz: 15, name: 'Juz 15', startPage: 282 },
  { juz: 16, name: 'Juz 16', startPage: 302 },
  { juz: 17, name: 'Juz 17', startPage: 322 },
  { juz: 18, name: 'Juz 18', startPage: 342 },
  { juz: 19, name: 'Juz 19', startPage: 362 },
  { juz: 20, name: 'Juz 20', startPage: 382 },
  { juz: 21, name: 'Juz 21', startPage: 402 },
  { juz: 22, name: 'Juz 22', startPage: 422 },
  { juz: 23, name: 'Juz 23', startPage: 442 },
  { juz: 24, name: 'Juz 24', startPage: 462 },
  { juz: 25, name: 'Juz 25', startPage: 482 },
  { juz: 26, name: 'Juz 26', startPage: 502 },
  { juz: 27, name: 'Juz 27', startPage: 522 },
  { juz: 28, name: 'Juz 28', startPage: 542 },
  { juz: 29, name: 'Juz 29', startPage: 562 },
  { juz: 30, name: 'Juz 30', startPage: 582 },
];

export const SURAHS_PAGES: SurahPageRef[] = [
  { id: 1, name: 'Al-Fatihah', arabic: 'الفاتحة', startPage: 1, numAyah: 7 },
  { id: 2, name: 'Al-Baqarah', arabic: 'البقرة', startPage: 2, numAyah: 286 },
  {
    id: 3,
    name: "Ali 'Imran",
    arabic: 'آل عمران',
    startPage: 50,
    numAyah: 200,
  },
  { id: 4, name: "An-Nisa'", arabic: 'النساء', startPage: 77, numAyah: 176 },
  {
    id: 5,
    name: "Al-Ma'idah",
    arabic: 'المائدة',
    startPage: 106,
    numAyah: 120,
  },
  { id: 6, name: "Al-An'am", arabic: 'الأنعام', startPage: 128, numAyah: 165 },
  { id: 7, name: "Al-A'raf", arabic: 'الأعراف', startPage: 151, numAyah: 206 },
  { id: 8, name: 'Al-Anfal', arabic: 'الأنفال', startPage: 177, numAyah: 75 },
  { id: 9, name: 'At-Taubah', arabic: 'التوبة', startPage: 187, numAyah: 129 },
  { id: 10, name: 'Yunus', arabic: 'يونس', startPage: 208, numAyah: 109 },
  { id: 11, name: 'Hud', arabic: 'هود', startPage: 221, numAyah: 123 },
  { id: 12, name: 'Yusuf', arabic: 'يوسف', startPage: 235, numAyah: 111 },
  { id: 13, name: "Ar-Ra'd", arabic: 'الرعد', startPage: 249, numAyah: 43 },
  { id: 14, name: 'Ibrahim', arabic: 'إبراهيم', startPage: 255, numAyah: 52 },
  { id: 15, name: 'Al-Hijr', arabic: 'الحجر', startPage: 262, numAyah: 99 },
  { id: 16, name: 'An-Nahl', arabic: 'النحل', startPage: 267, numAyah: 128 },
  { id: 17, name: "Al-Isra'", arabic: 'الإسراء', startPage: 282, numAyah: 111 },
  { id: 18, name: 'Al-Kahf', arabic: 'الكهف', startPage: 293, numAyah: 110 },
  { id: 19, name: 'Maryam', arabic: 'مريم', startPage: 305, numAyah: 98 },
  { id: 20, name: 'Taha', arabic: 'طه', startPage: 312, numAyah: 135 },
  {
    id: 21,
    name: "Al-Anbiya'",
    arabic: 'الأنبياء',
    startPage: 322,
    numAyah: 112,
  },
  { id: 22, name: 'Al-Hajj', arabic: 'الحج', startPage: 332, numAyah: 78 },
  {
    id: 23,
    name: "Al-Mu'minun",
    arabic: 'المؤمنون',
    startPage: 342,
    numAyah: 118,
  },
  { id: 24, name: 'An-Nur', arabic: 'النور', startPage: 350, numAyah: 64 },
  { id: 25, name: 'Al-Furqan', arabic: 'الفرقان', startPage: 359, numAyah: 77 },
  {
    id: 26,
    name: "Asy-Syu'ara'",
    arabic: 'الشعراء',
    startPage: 367,
    numAyah: 227,
  },
  { id: 27, name: 'An-Naml', arabic: 'النمل', startPage: 377, numAyah: 93 },
  { id: 28, name: 'Al-Qasas', arabic: 'القصص', startPage: 385, numAyah: 88 },
  {
    id: 29,
    name: "Al-'Ankabut",
    arabic: 'العنكبوت',
    startPage: 396,
    numAyah: 69,
  },
  { id: 30, name: 'Ar-Rum', arabic: 'الروم', startPage: 404, numAyah: 60 },
  { id: 31, name: 'Luqman', arabic: 'لقمان', startPage: 411, numAyah: 34 },
  { id: 32, name: 'As-Sajdah', arabic: 'السجدة', startPage: 415, numAyah: 30 },
  { id: 33, name: 'Al-Ahzab', arabic: 'الأحزاب', startPage: 418, numAyah: 73 },
  { id: 34, name: "Saba'", arabic: 'سبأ', startPage: 428, numAyah: 54 },
  { id: 35, name: 'Fatir', arabic: 'فاطر', startPage: 434, numAyah: 45 },
  { id: 36, name: 'Yasin', arabic: 'يس', startPage: 440, numAyah: 83 },
  {
    id: 37,
    name: 'As-Saffat',
    arabic: 'الصافات',
    startPage: 446,
    numAyah: 182,
  },
  { id: 38, name: 'Sad', arabic: 'ص', startPage: 453, numAyah: 88 },
  { id: 39, name: 'Az-Zumar', arabic: 'الزمر', startPage: 458, numAyah: 75 },
  { id: 40, name: 'Gafir', arabic: 'غافر', startPage: 467, numAyah: 85 },
  { id: 41, name: 'Fussilat', arabic: 'فصلت', startPage: 477, numAyah: 54 },
  { id: 42, name: 'Asy-Syura', arabic: 'الشورى', startPage: 483, numAyah: 53 },
  { id: 43, name: 'Az-Zukhruf', arabic: 'الزخرف', startPage: 489, numAyah: 89 },
  { id: 44, name: 'Ad-Dukhan', arabic: 'الدخان', startPage: 496, numAyah: 59 },
  {
    id: 45,
    name: 'Al-Jasiyah',
    arabic: 'الجاثية',
    startPage: 499,
    numAyah: 37,
  },
  { id: 46, name: 'Al-Ahqaf', arabic: 'الأحقاف', startPage: 502, numAyah: 35 },
  { id: 47, name: 'Muhammad', arabic: 'محمد', startPage: 507, numAyah: 38 },
  { id: 48, name: 'Al-Fath', arabic: 'الفتح', startPage: 511, numAyah: 29 },
  {
    id: 49,
    name: 'Al-Hujurat',
    arabic: 'الحجرات',
    startPage: 515,
    numAyah: 18,
  },
  { id: 50, name: 'Qaf', arabic: 'ق', startPage: 518, numAyah: 45 },
  {
    id: 51,
    name: 'Az-Zariyat',
    arabic: 'الذاريات',
    startPage: 520,
    numAyah: 60,
  },
  { id: 52, name: 'At-Tur', arabic: 'الطور', startPage: 523, numAyah: 49 },
  { id: 53, name: 'An-Najm', arabic: 'النجم', startPage: 526, numAyah: 62 },
  { id: 54, name: 'Al-Qamar', arabic: 'القمر', startPage: 528, numAyah: 55 },
  { id: 55, name: 'Ar-Rahman', arabic: 'الرحمن', startPage: 531, numAyah: 78 },
  {
    id: 56,
    name: "Al-Waqi'ah",
    arabic: 'الواقعة',
    startPage: 534,
    numAyah: 96,
  },
  { id: 57, name: 'Al-Hadid', arabic: 'الحديد', startPage: 537, numAyah: 29 },
  {
    id: 58,
    name: 'Al-Mujadalah',
    arabic: 'المجادلة',
    startPage: 542,
    numAyah: 22,
  },
  { id: 59, name: 'Al-Hasyr', arabic: 'الحشر', startPage: 545, numAyah: 24 },
  {
    id: 60,
    name: 'Al-Mumtahanah',
    arabic: 'الممتحنة',
    startPage: 549,
    numAyah: 13,
  },
  { id: 61, name: 'As-Saff', arabic: 'الصف', startPage: 551, numAyah: 14 },
  { id: 62, name: "Al-Jumu'ah", arabic: 'الجمعة', startPage: 553, numAyah: 11 },
  {
    id: 63,
    name: 'Al-Munafiqun',
    arabic: 'المنافقون',
    startPage: 554,
    numAyah: 11,
  },
  {
    id: 64,
    name: 'At-Tagabun',
    arabic: 'التغابن',
    startPage: 556,
    numAyah: 18,
  },
  { id: 65, name: 'At-Talaq', arabic: 'الطلاق', startPage: 558, numAyah: 12 },
  { id: 66, name: 'At-Tahrim', arabic: 'التحريم', startPage: 560, numAyah: 12 },
  { id: 67, name: 'Al-Mulk', arabic: 'الملك', startPage: 562, numAyah: 30 },
  { id: 68, name: 'Al-Qalam', arabic: 'القلم', startPage: 564, numAyah: 52 },
  { id: 69, name: 'Al-Haqqah', arabic: 'الحاقة', startPage: 566, numAyah: 52 },
  {
    id: 70,
    name: "Al-Ma'arij",
    arabic: 'المعارج',
    startPage: 568,
    numAyah: 44,
  },
  { id: 71, name: 'Nuh', arabic: 'نوح', startPage: 570, numAyah: 28 },
  { id: 72, name: 'Al-Jinn', arabic: 'الجن', startPage: 572, numAyah: 28 },
  {
    id: 73,
    name: 'Al-Muzzammil',
    arabic: 'المزمل',
    startPage: 574,
    numAyah: 20,
  },
  {
    id: 74,
    name: 'Al-Muddassir',
    arabic: 'المدثر',
    startPage: 575,
    numAyah: 56,
  },
  {
    id: 75,
    name: 'Al-Qiyamah',
    arabic: 'القيامة',
    startPage: 577,
    numAyah: 40,
  },
  { id: 76, name: 'Al-Insan', arabic: 'الإنسان', startPage: 578, numAyah: 31 },
  {
    id: 77,
    name: 'Al-Mursalat',
    arabic: 'المرسلات',
    startPage: 580,
    numAyah: 50,
  },
  { id: 78, name: "An-Naba'", arabic: 'النبأ', startPage: 582, numAyah: 40 },
  {
    id: 79,
    name: "An-Nazi'at",
    arabic: 'النازعات',
    startPage: 583,
    numAyah: 46,
  },
  { id: 80, name: "'Abasa", arabic: 'عبس', startPage: 585, numAyah: 42 },
  { id: 81, name: 'At-Takwir', arabic: 'التكوير', startPage: 586, numAyah: 29 },
  {
    id: 82,
    name: 'Al-Infitar',
    arabic: 'الانفطار',
    startPage: 587,
    numAyah: 19,
  },
  {
    id: 83,
    name: 'Al-Mutaffifin',
    arabic: 'المطففين',
    startPage: 587,
    numAyah: 36,
  },
  {
    id: 84,
    name: 'Al-Insyiqaq',
    arabic: 'الانشقاق',
    startPage: 589,
    numAyah: 25,
  },
  { id: 85, name: 'Al-Buruj', arabic: 'البروج', startPage: 590, numAyah: 22 },
  { id: 86, name: 'At-Tariq', arabic: 'الطارق', startPage: 591, numAyah: 17 },
  { id: 87, name: "Al-A'la", arabic: 'الأعلى', startPage: 591, numAyah: 19 },
  {
    id: 88,
    name: 'Al-Gasyiyah',
    arabic: 'الغاشية',
    startPage: 592,
    numAyah: 26,
  },
  { id: 89, name: 'Al-Fajr', arabic: 'الفجر', startPage: 593, numAyah: 30 },
  { id: 90, name: 'Al-Balad', arabic: 'البلد', startPage: 594, numAyah: 20 },
  { id: 91, name: 'Asy-Syams', arabic: 'الشمس', startPage: 595, numAyah: 15 },
  { id: 92, name: 'Al-Lail', arabic: 'الليل', startPage: 595, numAyah: 21 },
  { id: 93, name: 'Ad-Duha', arabic: 'الضحى', startPage: 596, numAyah: 11 },
  { id: 94, name: 'Asy-Syarh', arabic: 'الشرح', startPage: 596, numAyah: 8 },
  { id: 95, name: 'At-Tin', arabic: 'التين', startPage: 597, numAyah: 8 },
  { id: 96, name: "Al-'Alaq", arabic: 'العلق', startPage: 597, numAyah: 19 },
  { id: 97, name: 'Al-Qadr', arabic: 'القدر', startPage: 598, numAyah: 5 },
  { id: 98, name: 'Al-Bayyinah', arabic: 'البينة', startPage: 598, numAyah: 8 },
  {
    id: 99,
    name: 'Az-Zalzalah',
    arabic: 'الزلزلة',
    startPage: 599,
    numAyah: 8,
  },
  {
    id: 100,
    name: "Al-'Adiyat",
    arabic: 'العاديات',
    startPage: 599,
    numAyah: 11,
  },
  {
    id: 101,
    name: "Al-Qari'ah",
    arabic: 'القارعة',
    startPage: 600,
    numAyah: 11,
  },
  {
    id: 102,
    name: 'At-Takasur',
    arabic: 'التكاثر',
    startPage: 600,
    numAyah: 8,
  },
  { id: 103, name: "Al-'Asr", arabic: 'العصر', startPage: 601, numAyah: 3 },
  { id: 104, name: 'Al-Humazah', arabic: 'الهمزة', startPage: 601, numAyah: 9 },
  { id: 105, name: 'Al-Fil', arabic: 'الفيل', startPage: 601, numAyah: 5 },
  { id: 106, name: 'Quraisy', arabic: 'قريش', startPage: 602, numAyah: 4 },
  { id: 107, name: "Al-Ma'un", arabic: 'الماعون', startPage: 602, numAyah: 7 },
  { id: 108, name: 'Al-Kausar', arabic: 'الكوثر', startPage: 602, numAyah: 3 },
  {
    id: 109,
    name: 'Al-Kafirun',
    arabic: 'الكافرون',
    startPage: 603,
    numAyah: 6,
  },
  { id: 110, name: 'An-Nasr', arabic: 'النصر', startPage: 603, numAyah: 3 },
  { id: 111, name: 'Al-Lahab', arabic: 'اللهب', startPage: 603, numAyah: 5 },
  { id: 112, name: 'Al-Ikhlas', arabic: 'الإخلاص', startPage: 604, numAyah: 4 },
  { id: 113, name: 'Al-Falaq', arabic: 'الفلق', startPage: 604, numAyah: 5 },
  { id: 114, name: 'An-Nas', arabic: 'الناس', startPage: 604, numAyah: 6 },
];

/**
 * Returns the direct URL for a page image from backend proxy
 */
export function getPageImageUrl(page: number): string {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${base}/page/${page}/image`;
}

/**
 * Returns the official Kemenag CDN image URL as direct fallback
 */
export function getCdnFallbackUrl(page: number): string {
  const pad = String(page).padStart(3, '0');
  return `https://media.qurankemenag.net/khat2/QK_${pad}.webp`;
}

/**
 * Returns which Juz a page belongs to (1–30)
 */
export function getJuzByPage(page: number): number {
  if (page <= 1) return 1;
  for (let i = JUZ_PAGES.length - 1; i >= 0; i--) {
    if (page >= JUZ_PAGES[i].startPage) {
      return JUZ_PAGES[i].juz;
    }
  }
  return 1;
}

/**
 * Returns all Surahs that appear or start on a given page
 */
export function getSurahsByPage(page: number): SurahPageRef[] {
  return SURAHS_PAGES.filter((s, idx) => {
    const nextSurah = SURAHS_PAGES[idx + 1];
    const endPage = nextSurah ? nextSurah.startPage : 604;
    return page >= s.startPage && page <= endPage;
  });
}
