# Workspace Context & Memory (`.context/CONTEXT.md`)

> **Protocol**: Anti-Superficial Engineering (Rule 5: Mandatory Workspace Context Memory)  
> **Last Updated**: 2026-09-02  
> **Project**: MyQuran Frontend (`myQuran-frontend`)

---

## 1. Project Overview & Tech Stack

- **Application**: Interactive digital Al-Qur'an reader with physical page-turning emulation.
- **Framework**: Vue 3 (`<script setup lang="ts">`, Composition API only).
- **Type Checking**: TypeScript 5.9+ (Verified clean with `vue-tsc -b`).
- **Runtime & PM**: Bun (`oven/bun:1`).
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`, `@theme inline` in `src/style.css`, OKLCH variables).
- **UI Primitives**: Reka UI + Shadcn-Vue pattern (`src/components/ui/`).
- **Book Engine**: `page-flip` (StPageFlip) with custom RTL staging and spread sequencing.
- **Audio Recitation**: EveryAyah CDN (multi-qari: Alafasy, Sudais, Ghamdi, Husary) with playbackRate.
- **Typography**: Official Indonesian Ministry of Religious Affairs standard font `LPMQ Isep Misbah` (`public/fonts/LPMQ-IsepMisbah.woff2`).
- **Telemetry**: `@sentry/vue` initialized in `src/main.ts`.

---

## 2. Architectural Structure & Feature Modules

```text
src/
├── features/
│   ├── reader/                          # Core reading engine subsystem
│   │   ├── components/
│   │   │   ├── ReaderHeader.vue         # Top navigation & Surah metadata + settings trigger
│   │   │   ├── ReaderControls.vue       # Bottom controls, qari/rate/mode toggles, audio triggers
│   │   │   ├── ReaderNavSidebar.vue     # Universal off-canvas navigation sidebar (Quran & Hadith)
│   │   │   ├── TafsirDrawer.vue         # Slide-up Tafsir commentary drawer (focus trap)
│   │   │   ├── ReadingSettingsDialog.vue# Typography/paper theme dialog (font + hide toggles)
│   │   │   └── QuickJumpDialog.vue      # Cmd+K jump to Surah:Ayah/Juz
│   │   ├── composables/
│   │   │   ├── useBookPages.ts          # RTL page sequence calculation & leaf generation
│   │   │   ├── useBookFlip.ts           # StPageFlip lifecycle, ResizeObserver, reinit guards
│   │   │   ├── useQuranAudio.ts         # Audio streaming, qari/rate, activeAyah highlight, auto-flip
│   │   │   ├── useReadingSettings.ts    # Font scale + showArabic/Latin/translation + paperTheme (localStorage)
│   │   │   ├── useLastRead.ts           # last_read persistence (surahId/ayahNumber/timestamp)
│   │   │   ├── useQariSettings.ts       # Qari catalog + playback rates
│   │   │   └── useReaderShortcuts.ts    # Keyboard shortcuts (arrows/space/T/S/Ctrl+K/Esc)
│   │   ├── reader.css                   # Book mount, pf-page, pf-scroll (scrollable), footnote, paper themes
│   │   └── types.ts                     # Ayah (+footnote), BookPage, SurahMeta type definitions
│   ├── hadith/                          # Hadith reading & catalog subsystem
│   │   ├── components/
│   │   │   ├── HadithCard.vue           # Single Hadith presentation card
│   │   │   ├── HadithBookCard.vue       # Hadith collection card
│   │   │   └── RandomHadithWidget.vue   # Dashboard random hadith widget
│   │   ├── composables/
│   │   │   ├── useHadith.ts             # API client for books, lists, detail
│   │   │   └── useHadithBookPages.ts    # RTL pagination & leaf generation for Hadith book
│   │   ├── formatters.ts                # Bab/Kitab/Grade sanitizers & formatters
│   │   └── types.ts                     # Hadith, HadithBook, HadithBookPage
│   └── home/                            # Home directory & search subsystem
│       ├── components/
│       │   ├── LastReadHero.vue         # Lanjutkan Membaca hero card
│       │   ├── SurahSearchFilter.vue    # Search input + Makkiyah/Madaniyah tabs (to be revised)
│       │   └── SurahDirectoryCard.vue   # Single surah directory card
│       └── composables/
│           └── useSurahFilter.ts        # Client-side search/filter (114 rows)
├── components/
│   ├── ui/                              # Atomic Shadcn / Reka UI primitives
│   ├── AppFooter.vue                    # Persistent footer
│   ├── AudioControlBar.vue              # Generic audio bar (legacy)
│   ├── AyahPage.vue                     # Legacy single-ayah unit (deprecated, unused in book)
│   ├── ModeToggle.vue                   # Theme toggle
│   └── Navbar.vue                       # Top application navbar
├── composables/
│   └── useDarkMode.ts                   # Reactive dark/light mode with localStorage persistence
├── lib/
│   └── utils.ts                         # Tailwind class merge helper (`cn`)
├── views/
│   ├── HomeView.vue                     # 114 Surahs directory view (<80 lines, LastReadHero + filter)
│   ├── SurahView.vue                    # Lean reader view orchestrator (~300 lines, book + dialogs)
│   └── hadith/                          # Hadith views
│       ├── HadithBooksView.vue          # Catalog of Hadith collections
│       ├── HadithListView.vue           # Paginated list mode with jump controls
│       ├── HadithBookView.vue           # 3D physical Mushaf book mode per Kitab
│       └── HadithDetailView.vue         # Single Hadith detail view
├── App.vue                              # Root application layout
├── main.ts                              # Entrypoint & Sentry init
└── style.css                            # Tailwind CSS v4 and theme tokens
```

---

## 3. Critical Domain Constraints & Invariants

1. **RTL Page Array Inversion**: `page-flip` is LTR by default. The `bookPages` array is reversed for Arabic text, starting at index `length - 1`. Turning forward is executed via `book.flipPrev('top')`.
2. **Hidden Staging Container**: PageFlip reads cloned DOM from `<div ref="stageRef" style="position:absolute;left:-9999px;">`. Never mount PageFlip directly on active Vue reactive nodes.
3. **Typography**: Always use `.arabic-text` or `.font-arabic` with `direction: rtl;` for Quranic text.
4. **Book Scroll Isolation**: Long ayahs render inside `.pf-scroll` (`flex:1; overflow-y:auto; touch-action:pan-y; overscroll-behavior:contain`). PageFlip captures `touchstart/mousedown` on `.stf__parent`; `.pf-scroll` must `stopPropagation` in capture phase for `wheel/touchstart/touchmove/pointerdown` or PageFlip hijacks vertical scroll. Mount-level theme (`paper-*`, `hide-*`) via `bookWrapRef` class, not per-page rebuild, to avoid destroy/blank on theme toggle.
5. **Footnote Kemenag**: `Ayah.footnote` + inline `1)` markers → `formatTranslation()` escapes HTML then wraps `(\d+\))` as `<sup class="footnote-marker">`; rendered via `v-html`. `Catatan Kaki` block below translation, hidden when `hide-translation`.
6. **ReadingSettings**: `showArabic/showLatin/showTranslation` + `paperTheme` persisted in `myquran_reading_settings`; `Qari`/`playbackRate` in `myquran_qari`/`myquran_playback_rate`; `last_read` in `myquran_last_read`.

---

## 4. Refactoring History & Log

- **2026-09-01 (Phase 1 Refactor)**:
  - Decomposed monolithic `SurahView.vue` (834 lines) into modular composables (`useBookPages.ts`, `useBookFlip.ts`, `useQuranAudio.ts`) and presentation components (`ReaderHeader.vue`, `ReaderControls.vue`, `TafsirDrawer.vue`).
  - Purged dead starter template (`src/components/HelloWorld.vue`).
  - Verified compilation clean with zero TypeScript errors (`bun run build`).
- **2026-09-02 (Phases 2-6 + Fixes)**:
  - Phase 2: `useLastRead` + `LastReadHero` + auto-track on page flip/audio.
  - Phase 3: `useReadingSettings` (arabic 20-40, translation 11-16, showArabic/Latin/translation, paper sepia/dark/amoled) + `ReadingSettingsDialog` + CSS vars.
  - Phase 4: Multi-qari (Alafasy/Sudais/Ghamdi/Husary) + playbackRate 0.75-1.5 + active ayah glow (`is-active-ayah`).
  - Phase 5: `QuickJumpDialog` (Ctrl+K, Surah:Ayah/Juz) + `useReaderShortcuts` (arrows/space/T/S/Esc).
  - Phase 6: `useSurahFilter` + `SurahSearchFilter` + `SurahDirectoryCard` + `HomeView` decompose.
  - Fix: PageFlip sizing via `getBoundingClientRect` + `ResizeObserver`, `contain:paint` removed, `backface-visibility`, mount `paper-*` via `bookWrapRef`, `stf__block overflow:visible`.
  - Fix: Footnote Kemenag (`footnote` field) with dark/amoled contrast fix; footnote hidden with translation.
  - Fix: Long ayah scroll via `.pf-scroll` (`flex:1; overflow-y:auto; touch-action:pan-y`) + `attachScrollGuards()` capture `stopPropagation` for wheel/touch/pointer to prevent PageFlip hijack. No truncation (`-webkit-line-clamp` removed).
  - Verified `bun run build` clean (2647 modules).
