# 🚀 Incremental Implementation Plan (`.context/IMPLEMENTATION_PLAN.md`)

> **Protocols Applied**: `/incremental-implementation`, `/anti-superficial-engineering`, `/clean-code-implementation`, `/frontend-ui-engineering`, `/performance-optimization`  
> **Last Updated**: 2026-09-03  
> **Status**: All Phases 1–8 Completed ✅

---

## 📋 Strategy & Execution Method

Each feature phase is broken down into **thin, verifiable vertical slices** (<100 lines per sub-module). After each slice, typechecking and compiler verification (`bun run build`) are executed to guarantee zero regressions.

---

## 📅 Phased Roadmap Overview

```
Phase 1: Architecture Decomposition (SurahView 834 lines → Modular Subsystems) [COMPLETED ✅]
  ├── Slice 1.1: Shared Reader Types (`src/features/reader/types.ts`)
  ├── Slice 1.2: RTL Book Pages Composable (`useBookPages.ts`)
  ├── Slice 1.3: Audio Stream & Auto-Flip Composable (`useQuranAudio.ts`)
  ├── Slice 1.4: PageFlip DOM & Sizing Composable (`useBookFlip.ts`)
  ├── Slice 1.5: Sub-Components (`ReaderHeader.vue`, `ReaderControls.vue`, `TafsirDrawer.vue`)
  └── Slice 1.6: Connect Lean Orchestrator (`SurahView.vue`) & Empirical Verification

Phase 2: Session Continuity & "Last Read" Auto-Resume (Home & Reader) [COMPLETED ✅]
  ├── Slice 2.1: Last Read Store & Persistence Composable (`src/features/reader/composables/useLastRead.ts`)
  ├── Slice 2.2: Auto-Track Page & Verse Progress in `SurahView.vue`
  └── Slice 2.3: "Lanjutkan Membaca" Hero Card on `HomeView.vue`

Phase 3: Reading Ergonomics & Personalization [COMPLETED ✅]
  ├── Slice 3.1: Reading Settings Composable (`useReadingSettings.ts`)
  ├── Slice 3.2: Typography & Transliteration Toggles in Ayah Rendering
  ├── Slice 3.3: Mushaf Parchment/Sepia Paper Preset Theme
  └── Slice 3.4: Accessible Settings Dialog (`ReadingSettingsDialog.vue`)

Phase 4: Audio Enhancements (Multi-Qari & Active Verse Highlight) [COMPLETED ✅]
  ├── Slice 4.1: Multi-Qari Configuration & Switcher (Alafasy, Sudais, Ghamdi, Husary)
  ├── Slice 4.2: Playback Speed Control (0.75x - 1.5x)
  └── Slice 4.3: Active Ayah Visual Glow & Border Highlighting

Phase 5: Navigation, Shortcuts & Accessibility [COMPLETED ✅]
  ├── Slice 5.1: Quick Jump Modal `Ctrl+K` (`QuickJumpDialog.vue`)
  └── Slice 5.2: Keyboard Shortcuts Handler (Arrow keys, Space, T, Esc)

Phase 6: Search, Filtering & Directory Enhancements (HomeView) [COMPLETED ✅]
  ├── Slice 6.1: Fast Client-Side Search & Tab Filter (`SurahSearchFilter.vue`)
  └── Slice 6.2: Decompose `HomeView.vue` into `SurahDirectoryCard.vue`

Phase 7: Hadith Mushaf Book Experience (Book per Kitab) [COMPLETED ✅]
  ├── Slice 7.1: Hadith Book Pages Composable & RTL staging
  ├── Slice 7.2: HadithBookView 3D Mushaf Reader
  └── Slice 7.3: Hadith Grade Badges & Book Toggle

Phase 8: Quran Ayah Index & Hadith Chapter Navigator [COMPLETED ✅]
  ├── Slice 8.1 & 8.3: Universal ReaderNavSidebar.vue
  ├── Slice 8.2: Quran Navigation Integration
  ├── Slice 8.4: Hadith Book Navigation Integration
  └── Slice 8.5: Hadith List Direct Jump Controls
```

---

## 🔍 Detailed Breakdown of Upcoming Phases

### 🔹 Phase 2: Session Continuity & "Last Read" Auto-Resume

#### Objective:
Allow users returning to the app to immediately pick up where they left off with a single click.

#### Vertical Slices:
1. **Slice 2.1**: [`src/features/reader/composables/useLastRead.ts`](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/features/reader/composables/useLastRead.ts)
   - Store structure: `{ surahId: number, surahName: string, surahArabic: string, ayahNumber: number, totalAyahs: number, timestamp: number }`.
   - Methods: `saveLastRead(...)`, `getLastRead()`, `clearLastRead()`.
   - Reactive synchronization with `localStorage` (`myquran_last_read`).
2. **Slice 2.2**: Integrate `useLastRead` into `SurahView.vue`
   - Automatically records the current visible Ayah on page-flip events and audio progression.
3. **Slice 2.3**: Build `LastReadHero.vue` on [`HomeView.vue`](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/views/HomeView.vue)
   - Clean, accessible hero card at the top of the homepage displaying:
     - Surah name & Arabic title.
     - "Ayat X dari Y" badge.
     - Time elapsed (e.g., "Dibaca 2 jam lalu").
     - "Lanjutkan Membaca →" primary action button navigating directly to `/surah/:id`.

---

### 🔹 Phase 3: Reading Ergonomics & Personalization

#### Objective:
Accommodate diverse reading habits, vision needs, and tilawah preferences without breaking layout rhythm.

#### Vertical Slices:
1. **Slice 3.1**: [`src/features/reader/composables/useReadingSettings.ts`](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/features/reader/composables/useReadingSettings.ts)
   - Settings state:
     - `arabicFontSize`: 20px – 40px (default 26px).
     - `translationFontSize`: 11px – 16px (default 12px).
     - `showLatin`: boolean (default true).
     - `showTranslation`: boolean (default true).
     - `paperTheme`: `'default'` | `'sepia'` | `'dark'` | `'amoled'`.
   - Sync with `localStorage` (`myquran_reading_settings`).
2. **Slice 3.2**: CSS variable binding on StPageFlip staging leaves for real-time font scaling and theme adjustments.
3. **Slice 3.3**: Build accessible [`ReadingSettingsDialog.vue`](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/features/reader/components/ReadingSettingsDialog.vue) with Reka UI slider and switch primitives.

---

### 🔹 Phase 4: Audio Enhancements & Multi-Qari Support

#### Objective:
Elevate recitation playback with reciter variety and visual reading guides.

#### Vertical Slices:
1. **Slice 4.1**: Multi-Qari configuration:
   - Sheikh Mishary Rashid Alafasy (`Alafasy_128kbps`)
   - Sheikh Abdul Rahman Al-Sudais (`Abdurrahim_As-Sudais_128kbps`)
   - Sheikh Saad Al-Ghamdi (`Ghamadi_40kbps`)
   - Sheikh Mahmoud Khalil Al-Husary (`Husary_128kbps`)
2. **Slice 4.2**: Playback speed controls (`0.75x`, `1.0x`, `1.25x`, `1.5x`).
3. **Slice 4.3**: Active verse visual highlight on the physical spread DOM during audio playback.

---

### 🔹 Phase 5: Fast Navigation & Keyboard Accessibility

#### Objective:
Support power users and accessibility standards (WCAG 2.1 AA).

#### Vertical Slices:
1. **Slice 5.1**: [`QuickJumpDialog.vue`](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/features/reader/components/QuickJumpDialog.vue) (`Ctrl+K` / `Cmd+K` trigger):
   - Fast jump by `Surah:Ayah` (e.g., `18:10`) or Juz (1–30).
2. **Slice 5.2**: Global keyboard listener composable:
   - `←` / `→`: Turn page.
   - `Space`: Play / pause recitation.
   - `T`: Toggle Tafsir drawer.
   - `Esc`: Close open modal/drawer.

---

### 🔹 Phase 6: Home Directory Search & Filter Refactoring

#### Vertical Slices:
1. **Slice 6.1**: [`SurahSearchFilter.vue`](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/features/home/components/SurahSearchFilter.vue)
   - Real-time search query by Latin name, Arabic name, or Surah number.
   - Tab filters: "Semua", "Makkiyah", "Madaniyah".
2. **Slice 6.2**: Decompose [`HomeView.vue`](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/views/HomeView.vue) into [`SurahDirectoryCard.vue`](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/features/home/components/SurahDirectoryCard.vue) (<100 lines total).

---

### 🔹 Phase 7: Hadith Mushaf Book Experience (Book per Kitab) [COMPLETED ✅]

#### Objective:
Deliver an authentic 3D physical Mushaf book reading experience for Hadith collections (Bukhari, Muslim, etc.) organized per Kitab, with hybrid list-to-book toggle.

#### Delivered Slices:
1. **Slice 7.1**: `useHadithBookPages.ts` & `HadithBookPage` types (RTL array inversion, front/back hard covers, soft hadith leaves).
2. **Slice 7.2**: `HadithBookView.vue` reader component + route `/hadith/:book/book`.
3. **Slice 7.3**: Hadith grade badge styles (`.hadith-grade`, `.grade-sahih`, `.grade-hasan`, `.grade-daif`) in `reader.css`.
4. **Slice 7.4**: `HadithListView.vue` hybrid toggle button ("📖 Baca sebagai Buku").
5. **Slice 7.5**: Keyboard navigation shortcuts (`useReaderShortcuts` integration) and Hadith jump queries in `QuickJumpDialog.vue`.

---

### 🔹 Phase 8: Quran Ayah Index & Hadith Chapter Navigator [COMPLETED ✅]

#### Objective:
Provide intuitive Table of Contents (*Fihris*) navigation so readers can jump directly to any Ayah in a Surah or any Hadith/Kitab in a collection without manual page-by-page flipping.

#### Delivered Architecture & Slices:
1. **Slice 8.1 & 8.3 (Unified Abstraction)**: Built generic `ReaderNavSidebar.vue` (<220 lines) serving both Quran and Hadith reader modes, with responsive off-canvas slide-out, smooth backdrop blur, fast numeric search filter, and active-item highlight.
2. **Slice 8.2 (Quran Integration)**: Integrated into `SurahView.vue` and `ReaderHeader.vue` with clickable title trigger, `ListOrdered` icon button, and one-click `jumpToAyah(n)` flip transitions.
3. **Slice 8.4 (Hadith Book Integration)**: Integrated into `HadithBookView.vue` with header title trigger, bottom bar "Pilih Hadits" trigger, dual-tab switcher ("Hadits di Kitab Ini" + "Pindah Kitab"), and `goToPage(idx)` / query navigation.
4. **Slice 8.5 (Hadith List Direct Jump)**: Added page jump input (`Hal: [__] / N [Ke]`) and direct Hadith number opener (`No: [__] [Buka]`) in `HadithListView.vue`.

---

### 🔹 Phase 9: Proper Search & Limit (Quran & Hadith) [COMPLETED ✅]

#### Objective:
Implement full-text search across all 6,236 Quranic verses and 29,187 Hadiths with configurable limits, debounced search, in-book Hadith search, and lightweight reader payload optimization per `API_FRONTEND_GUIDE.md`.

#### Delivered Architecture & Slices:
1. **Slice 9.1**: Search types & composables (`src/features/search/types.ts`, `useQuranSearch.ts`, `useHadithSearch.ts`) with 300ms debounced queries and `PaginationMeta`.
2. **Slice 9.2**: Search presentation cards (`AyahSearchResultCard.vue`, `HadithSearchResultCard.vue`) with WCAG keyboard accessibility, Arabic LPMQ font, and `formatBab` chapter titles.
3. **Slice 9.3**: `GlobalSearchDialog.vue` (dual-tab modal for Quran & Hadith, book filters, limit selector `10/20/50`, live match counters, pagination) + Navbar trigger with `/` hotkey.
4. **Slice 9.4**: In-book search bar and dynamic limit selector (`20/50/100`) in `HadithListView.vue` with synchronized route queries.
5. **Slice 9.5**: Reader payload optimization (`withTafsir=false` on initial load cutting ~70% payload size) + on-demand Tafsir fetching (`GET /ayah/:surahId/:ayahNumber/tafsir`) with spinner in `TafsirDrawer.vue`.
6. **Slice 9.6**: True Quran Ayah Pagination & Limit (`useAyahList.ts`, `AyahCard.vue`, `SurahListView.vue` at `/surah/:id/list` with limits `20/50/100`, direct Ayah jump, audio playback, on-demand Tafsir, and header toggle).

---

### 🔹 Phase 10: Hadith Chapter Directory (Daftar Kitab & Bab) [PLANNING ⏳]

#### Objective:
Provide a complete Table of Contents / Chapter Directory (Daftar Kitab & Bab) for all 7 Hadith collections, enabling readers to browse and jump directly by topic (e.g. Iman, Shalat, Zakat, Puasa) in both List and 3D Mushaf modes.

#### Planned Slices:
1. **Slice 10.1**: Comprehensive Kitab dataset & composable (`kitabs.json`, `useHadithKitabs.ts`).
2. **Slice 10.2**: `KitabCard.vue` component with chapter number, title, hadith counts, and reading mode triggers.
3. **Slice 10.3**: Chapter directory tab & active Kitab filter banner in `HadithListView.vue`.
4. **Slice 10.4**: Dynamic full Kitab switcher in `ReaderNavSidebar.vue` (replacing hardcoded presets).
5. **Slice 10.5**: Kitab counts on book cards in `HadithBooksView.vue`.

---
  
## 🛡️ Verification Gate per Slice
Every increment must pass:
1. `bun run build` (`vue-tsc -b && vite build`) with zero TypeScript errors.
2. Verified DOM cleanup on unmount (no memory leaks from listeners or audio handles).
3. Zero disruption to StPageFlip RTL page sequencing.

