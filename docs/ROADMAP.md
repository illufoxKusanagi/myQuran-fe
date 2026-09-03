# 🗺️ MyQuran Architecture & Feature Roadmap

This document outlines the architectural refactoring strategy and future feature roadmap for **MyQuran**, aligned with **Anti-Superficial Engineering**, **Clean Code Implementation**, **Frontend UI Engineering**, and **Performance Optimization** standards.

---

## 🏗️ 1. Architecture Refactoring & Decomposition

### Goal: Eliminate Monolithic Files (SRP & Clean Code)
Currently, [`SurahView.vue`](../src/views/SurahView.vue) contains ~834 lines handling data fetching, PageFlip DOM lifecycle, audio queue state machines, Tafsir UI, header UI, and raw styling.

We are refactoring feature logic into focused sub-modules under `src/features/`:

```text
src/
├── features/
│   ├── home/
│   │   ├── components/
│   │   │   ├── LastReadHero.vue          # "Terakhir Dibaca" auto-resume card
│   │   │   ├── SurahDirectoryCard.vue    # Single surah directory card
│   │   │   └── SurahSearchFilter.vue     # Search & Makkiyah/Madaniyah filter tabs
│   │   └── composables/
│   │       └── useSurahFilter.ts         # Fast reactive search/filter state
│   ├── reader/
│   │   ├── components/
│   │   │   ├── ReaderHeader.vue          # Reader navigation header
│   │   │   ├── ReaderControls.vue        # Bottom reading and audio controls
│   │   │   ├── TafsirDrawer.vue          # Tafsir Wajiz & Tahlili slide-up drawer
│   │   │   ├── ReadingSettingsDialog.vue # Typography, font size & theme dialog
│   │   │   └── QuickJumpDialog.vue       # Jump to Surah:Ayah or Juz dialog
│   │   └── composables/
│   │       ├── useBookPages.ts           # RTL page array sequencing & padding
│   │       ├── useBookFlip.ts            # PageFlip instance lifecycle & responsive resizing
│   │       ├── useQuranAudio.ts          # Recitation streaming & auto-flip spread loop
│   │       ├── useReadingSettings.ts     # Font scaling, transliteration & paper theme state
│   │       └── useLastRead.ts            # LocalStorage last-read session persistence
│   └── share/
│       └── components/
│           └── AyahQuoteCardModal.vue    # Social media ayah card generator
├── views/
│   ├── HomeView.vue                      # Composable directory view (<100 lines)
│   └── SurahView.vue                     # Composable reader orchestrator (<120 lines)
```

---

## 🚀 2. Feature Roadmap & Milestone Phases

### 🔹 Phase 1: Modular Decomposition & Refactoring
- [ ] Extract `useBookPages.ts`, `useBookFlip.ts`, `useQuranAudio.ts`.
- [ ] Extract `TafsirDrawer.vue`, `ReaderHeader.vue`, `ReaderControls.vue`.
- [ ] Refactor `SurahView.vue` and `HomeView.vue` into lean orchestrators (<120 lines).
- [ ] Ensure 100% type safety and zero regressions with `vue-tsc -b`.

### 🔹 Phase 2: Session Continuity & "Last Read" Auto-Resume
- [ ] Implement `useLastRead.ts` with local persistence.
- [ ] Build `LastReadHero.vue` on HomeView allowing 1-click continuation.
- [ ] Auto-track page turns and audio verse progress.

### 🔹 Phase 3: Reading Ergonomics & Customization
- [ ] Font size scaling (Arabic text $20\text{px}-40\text{px}$, Latin/Translation font scale).
- [ ] Focus mode / Visibility toggles: Show/Hide Latin transliteration, Show/Hide Indonesian translation.
- [ ] Mushaf Sepia/Parchment theme preset (`#fcf8ec` warm paper mode).
- [ ] Build accessible `ReadingSettingsDialog.vue` using Reka UI primitives.

### 🔹 Phase 4: Audio Recitation Enhancements
- [ ] Multi-Qari (Reciter) switcher via EveryAyah CDN:
  - Sheikh Mishary Rashid Alafasy (`Alafasy_128kbps`)
  - Sheikh Abdul Rahman Al-Sudais (`Abdurrahim_As-Sudais_128kbps`)
  - Sheikh Saad Al-Ghamdi (`Ghamadi_40kbps`)
  - Sheikh Mahmoud Khalil Al-Husary (`Husary_128kbps`)
- [ ] Active Ayah visual highlight on the physical spread during recitation.
- [ ] Playback speed selector ($0.75\times, 1.0\times, 1.25\times, 1.5\times$).

### 🔹 Phase 5: Fast Navigation & Keyboard Accessibility
- [ ] `QuickJumpDialog.vue` (`Ctrl+K` / `Cmd+K`) for jumping to `Surah:Ayah` or Juz (1–30).
- [ ] Keyboard shortcuts (`←`/`→` to flip, `Space` for play/pause, `T` for Tafsir, `S` for Settings).
- [ ] Full WCAG 2.1 AA keyboard focus trapping in all modals.

### 🔹 Phase 6: PWA & Performance Optimization
- [ ] Offline caching for visited Surahs and fonts via Vite PWA (`@vite-pwa/vite-plugin-pwa`).
- [ ] Preconnect to EveryAyah CDN origins in `index.html`.
- [ ] Mobile 60 FPS animation optimization.
