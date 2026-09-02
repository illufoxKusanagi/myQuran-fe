# Workspace Context & Memory (`.context/CONTEXT.md`)

> **Protocol**: Anti-Superficial Engineering (Rule 5: Mandatory Workspace Context Memory)  
> **Last Updated**: 2026-09-01  
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
- **Audio Recitation**: EveryAyah CDN (Sheikh Mishary Rashid Alafasy).
- **Typography**: Official Indonesian Ministry of Religious Affairs standard font `LPMQ Isep Misbah` (`public/fonts/LPMQ-IsepMisbah.woff2`).
- **Telemetry**: `@sentry/vue` initialized in `src/main.ts`.

---

## 2. Architectural Structure & Feature Modules

```text
src/
├── features/
│   ├── reader/                          # Core reading engine subsystem
│   │   ├── components/
│   │   │   ├── ReaderHeader.vue         # Top navigation & Surah metadata
│   │   │   ├── ReaderControls.vue       # Bottom controls, mode toggles, audio triggers
│   │   │   └── TafsirDrawer.vue         # Slide-up Tafsir commentary drawer
│   │   ├── composables/
│   │   │   ├── useBookPages.ts          # RTL page sequence calculation & leaf generation
│   │   │   ├── useBookFlip.ts           # StPageFlip lifecycle, DOM cloning & resize observer
│   │   │   └── useQuranAudio.ts         # Audio streaming, single/continuous queue & auto-flip
│   │   ├── reader.css                   # Scoped/unscoped page-flip canvas styles
│   │   └── types.ts                     # Ayah, BookPage, SurahMeta type definitions
│   └── home/                            # Home directory & search subsystem (planned)
├── components/
│   ├── ui/                              # Atomic Shadcn / Reka UI primitives
│   ├── AppFooter.vue                    # Persistent footer
│   ├── AudioControlBar.vue              # Generic audio bar
│   ├── AyahPage.vue                     # Single-ayah presentation unit
│   ├── ModeToggle.vue                   # Theme toggle
│   └── Navbar.vue                       # Top application navbar
├── composables/
│   └── useDarkMode.ts                   # Reactive dark/light mode with localStorage persistence
├── lib/
│   └── utils.ts                         # Tailwind class merge helper (`cn`)
├── views/
│   ├── HomeView.vue                     # 114 Surahs directory view
│   └── SurahView.vue                    # Lean reader view orchestrator (<190 lines)
├── App.vue                              # Root application layout
├── main.ts                              # Entrypoint & Sentry init
└── style.css                            # Tailwind CSS v4 and theme tokens
```

---

## 3. Critical Domain Constraints & Invariants

1. **RTL Page Array Inversion**: `page-flip` is LTR by default. The `bookPages` array is reversed for Arabic text, starting at index `length - 1`. Turning forward is executed via `book.flipPrev('top')`.
2. **Hidden Staging Container**: PageFlip reads cloned DOM from `<div ref="stageRef" style="position:absolute;left:-9999px;">`. Never mount PageFlip directly on active Vue reactive nodes.
3. **Typography**: Always use `.arabic-text` or `.font-arabic` with `direction: rtl;` for Quranic text.

---

## 4. Refactoring History & Log

- **2026-09-01 (Phase 1 Refactor)**:
  - Decomposed monolithic `SurahView.vue` (834 lines) into modular composables (`useBookPages.ts`, `useBookFlip.ts`, `useQuranAudio.ts`) and presentation components (`ReaderHeader.vue`, `ReaderControls.vue`, `TafsirDrawer.vue`).
  - Purged dead starter template (`src/components/HelloWorld.vue`).
  - Verified compilation clean with zero TypeScript errors (`bun run build`).

