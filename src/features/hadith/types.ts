export interface HadithBook {
  id: number;
  slug: string;
  name: string;
  arabicName: string;
  author: string;
  totalHadith: number;
  availableHadiths: number;
}

export interface Hadith {
  id: number;
  bookId: number;
  number: number;
  kitabNo: number;
  kitabName: string;
  babNo: number;
  babName: string;
  grade: string;
  arabic: string;
  latin?: string;
  translation: string;
}

export interface HadithPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type HadithBookPage =
  | {
      type: 'cover-front';
      key: string;
      bookName: string;
      kitabName?: string;
      arabicName?: string;
    }
  | { type: 'hadith'; key: string; hadith: Hadith; hadithIndex: number }
  | { type: 'blank'; key: string; side: 'front' | 'back' }
  | { type: 'cover-back'; key: string };
