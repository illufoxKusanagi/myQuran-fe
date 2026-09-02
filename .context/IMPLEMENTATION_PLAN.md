# 🚀 Incremental Implementation Plan (`.context/IMPLEMENTATION_PLAN.md`)

> **Protocols Applied**: `/incremental-implementation`, `/anti-superficial-engineering`, `/clean-code-implementation`, `/frontend-ui-engineering`, `/performance-optimization`  
> **Last Updated**: 2026-09-01  
> **Status**: Phase 1 Completed ✅ | Phase 2 Ready 🚀

---

## 📋 Strategy & Execution Method

Each feature phase is broken down into **thin, verifiable vertical slices** (<100 lines per sub-module). After each slice, typechecking and compiler verification (`bun run build`) are executed to guarantee zero regressions.

---

## 📅 Phased Roadmap Overview

```
Phase 1: Architecture Decomposition (SurahView 834 lines → Modular Subsystems) [IN PROGRESS / UNVERIFIED ⚠️]
  ├── Slice 1.1: Shared Reader Types (`src/features/reader/types.ts`)
  ├── Slice 1.2: RTL Book Pages Composable (`useBookPages.ts`)
  ├── Slice 1.3: Audio Stream & Auto-Flip Composable (`useQuranAudio.ts`)
  ├── Slice 1.4: PageFlip DOM & Sizing Composable (`useBookFlip.ts`)
  ├── Slice 1.5: Sub-Components (`ReaderHeader.vue`, `ReaderControls.vue`, `TafsirDrawer.vue`)
  └── Slice 1.6: Connect Lean Orchestrator (`SurahView.vue`) & Empirical Verification

Phase 2: Session Continuity & "Last Read" Auto-Resume (Home & Reader) [PENDING]
  ├── Slice 2.1: Last Read Store & Persistence Composable (`src/features/reader/composables/useLastRead.ts`)
  ├── Slice 2.2: Auto-Track Page & Verse Progress in `SurahView.vue`
  └── Slice 2.3: "Lanjutkan Membaca" Hero Card on `HomeView.vue`

Phase 3: Reading Ergonomics & Personalization
  ├── Slice 3.1: Reading Settings Composable (`useReadingSettings.ts`)
  ├── Slice 3.2: Typography & Transliteration Toggles in Ayah Rendering
  ├── Slice 3.3: Mushaf Parchment/Sepia Paper Preset Theme
  └── Slice 3.4: Accessible Settings Dialog (`ReadingSettingsDialog.vue`)

Phase 4: Audio Enhancements (Multi-Qari & Active Verse Highlight)
  ├── Slice 4.1: Multi-Qari Configuration & Switcher (Alafasy, Sudais, Ghamdi, Husary)
  ├── Slice 4.2: Playback Speed Control (0.75x - 1.5x)
  └── Slice 4.3: Active Ayah Visual Glow & Border Highlighting

Phase 5: Navigation, Shortcuts & Accessibility
  ├── Slice 5.1: Quick Jump Modal `Ctrl+K` (`QuickJumpDialog.vue`)
  └── Slice 5.2: Keyboard Shortcuts Handler (Arrow keys, Space, T, Esc)

Phase 6: Search, Filtering & Directory Enhancements (HomeView)
  ├── Slice 6.1: Fast Client-Side Search & Tab Filter (`SurahSearchFilter.vue`)
  └── Slice 6.2: Decompose `HomeView.vue` into `SurahDirectoryCard.vue`
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

## 🛡️ Verification Gate per Slice
Every increment must pass:
1. `bun run build` (`vue-tsc -b && vite build`) with zero TypeScript errors.
2. Verified DOM cleanup on unmount (no memory leaks from listeners or audio handles).
3. Zero disruption to StPageFlip RTL page sequencing.

