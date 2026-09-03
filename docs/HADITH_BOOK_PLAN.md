# 📚 Hadith Mushaf Book Plan

> **Goal**: Render Hadith collections with the same physical *Mushaf* book experience as Quran (`page-flip` RTL, hard covers, `pf-scroll`), not a vertical list.
> **Reuse**: `useBookPages` / `useBookFlip` / `reader.css` / `ReadingSettingsDialog` — no new engine.

---

## 1. Current vs Target

- **Now** (`HadithListView`): vertical stack of `HadithCard` (20 per page, `Prev/Next`), click → `HadithDetailView`.
- **Quran** (`SurahView`): `useBookPages` (RTL `logicPages.reverse()`, `startPage = length-1`) + `useBookFlip` (staging `stageRef` → `PageFlip.loadFromHTML`) + `reader.css` (hard covers, `is-active-ayah`, `paper-*`).
- **Hadith** needs same RTL Arabic (`LPMQ Isep Misbah`) but **7 books × ~7000 hadiths** — cannot `fetch all` like Surah (≈100 ayahs).

---

## 2. Architecture Reuse

```
src/features/hadith/
├── types.ts                # Hadith, HadithBook, HadithPagination (exists)
├── composables/
│   ├── useHadith.ts        # fetchBooks/fetchList/fetchOne/fetchRandom (exists)
│   └── useHadithBookPages.ts # NEW — mirrors useBookPages for hadith
├── components/
│   ├── HadithBookCard.vue  # grid card (exists)
│   ├── HadithCard.vue      # single hadith (exists)
│   └── HadithTafsirDrawer.vue # optional grade/kitab detail drawer
└── hadith.css              # reuse reader.css, add .hadith-grade
src/views/hadith/
├── HadithBooksView.vue     # /hadith  (exists)
├── HadithListView.vue      # /hadith/:book (exists, keep as list fallback)
├── HadithDetailView.vue    # /hadith/:book/:number (exists)
└── HadithBookView.vue      # NEW — /hadith/:book/book  (mushaf)
```

---

## 3. Data Slice: `useHadithBookPages.ts`

- Input: `hadiths: Ref<Hadith[]>`, `currentIndex`, `isPortrait` (same signature as `useBookPages` but no `surahArabic` RTL check — Hadith is always RTL Arabic, so `isRtlBook = true` constant).
- Output: `bookPages: ComputedRef<BookPage[]>` where `BookPage = {type:'cover-front'|'hadith'|'blank'|'cover-back', hadith, hadithIndex}`.
- Logic: `cover-front` + `front-blank` + `hadiths.map` + padding `blank` + `cover-back` + `logicPages.reverse()` (same RTL inversion). No Juz logic.
- Pagination: fetch **20 hadiths** via `GET /hadith/:bookSlug?page=&limit=20` per window. Keep `pagination.hasNext` to prefetch next 20 when `currentIndex` near end (infinite append), not `fetch all 7000` (2MB).

---

## 4. Reader: `HadithBookView.vue` (`/hadith/:book/book`)

- Copy `SurahView.vue` (~300L) structure: `stageRef` + `bookWrapRef` + `ReaderHeader` (show `book.name` + `Hadith count`) + `ReaderControls` (without qari/rate, keep `leftHadith/rightHadith` + `is-active-hadith` highlight) + `ReadingSettingsDialog` (reuse `showArabic/showTranslation` + `paperTheme`, hide `arabicSize` for hadith if needed) + `TafsirDrawer` → show `kitabName/babName/grade`.
- Remove `useQuranAudio` (no recitation) or keep stub for future.
- Keep `useReaderShortcuts` (arrows, `Ctrl+K`).
- Keep `reader.css` (`pf-arabic`, `pf-lower` for `hadith.latin/translation`, `pf-badge` for `hadith.number`, `paper-*`, `is-active-ayah` → `is-active-hadith`).

---

## 5. Styling

- Reuse `reader.css` — add:
  - `.hadith-grade` badge (emerald `Shahih`, amber `Hasan`, gray others) — same as `HadithCard`.
  - No new layout; `pf-scroll` (`flex:1 1 0; max-height:520px; overflow-y:auto; touch-action:pan-y`) already handles long hadith (e.g., Bukhari long matan) via scroll + `attachScrollGuards` capture.

---

## 6. Navigation

- `HadithListView` header: add `📖 Baca sebagai Buku` button → `router.push({name:'hadith-book', params:{book:slug}})`.
- `QuickJumpDialog` already handles `yasin/kursi`; add `hadith` keywords: `bukhari:1`, `muslim 12` → `getHadithPageIndex` via `hadiths.findIndex` or `router.push` to `/hadith/:book/:number` then `jumpToHadith`.
- `HadithBookView` `jumpToHadith(number)` via `bookPages.findIndex(p=>p.hadith.number===number)` + `goToPage(idx)`.

---

## 7. Slices (<100L each)

1. `useHadithBookPages.ts` + `HadithBookPage` type
2. `HadithBookView.vue` + route `/hadith/:book/book` (20-item window, prefetch)
3. `reader.css` grade tweak + `HadithTafsir` drawer reuse
4. `HadithListView` → book-mode toggle button
5. `QuickJumpDialog` hadith keyword + `HomeView` popular hadith shortcut (optional)

---

## 8. Tradeoffs & Decisions

- **Pagination**: **20-50 window with `hasNext` prefetch** (recommended) vs `fetch all 7000` (heavy, 2MB JSON, slow `bookPages` compute). Window keeps `bookPages` <100L and flip smooth.
- **Per-hadith page vs per-kitab**: **One hadith = one page** (like current) — simplest, consistent badge. Packing 2-3 short hadiths per spread saves flips but complicates `jumpToHadith`.
- **List fallback**: **Keep both** — `HadithListView` for search/scan, `HadithBookView` for immersive reading; toggle preserves user choice.

---

## 9. Verification

- `bun run build` (`vue-tsc -b`) 0 errors
- `page-flip` RTL staging unchanged (`stageRef` hidden, `loadFromHTML`)
- Long hadith scroll via `pf-scroll` + `attachScrollGuards` (wheel/touch capture) already fixed for Quran
- No new `/juz/:id` route — respects existing constraint

---

## 10. Open Questions

- Book per **collection** (Bukhari = 7000-page mushaf) or per **Kitab** (e.g., `Kitab Permulaan Wahyu` = separate book)?
- Keep `HadithListView` as default and book as optional, or replace list entirely with book?

---

## 11. All Options Considered

| # | Option | Description | Pros | Cons |
|---|--------|-------------|------|------|
| A | **Book per Collection** (Recommended) | One continuous mushaf per Hadith book: `Bukhari` = 7000 pages, `Muslim` = 5362, etc. Pag 20 window with prefetch. | Matches Juz/Surah model (one book = one collection), simple `useHadithBookPages`, preserves cross-Kitab flow, easy `jumpToHadith(number)` | 7000 pages is heavy if fully loaded (mitigated by 20-window), long flip distance |
| B | **Book per Kitab** | Each `Kitab` (e.g., `Kitab Permulaan Wahyu` ~ 10 hadiths) is a separate short book. | Shorter books (<50 pages), faster load, natural chapter breaks | 200+ books per collection, confusing nav, loses continuous reading, extra route `/hadith/:book/kitab/:kitabNo` |
| C | **Hybrid: List + Book Toggle** (Recommended) | Keep `HadithListView` (vertical scan, `Prev/Next`, search) + add `📖 Baca sebagai Buku` toggle in header. User chooses mode. | Best UX: scan quickly in list, read immersively in book; no need to choose for user | Duplicate views to maintain |
| D | **Replace List with Book Only** | Remove `HadithListView`, only `HadithBookView`. | Single code path, true mushaf | Loses fast scan/search pagination users expect from `hadits.id` |
| E | **Pagination: 20-window** (Recommended) | Fetch `limit=20` per window, prefetch next when `currentIndex > length-10`. | Fast, <100KB JSON, smooth flip | Needs `hasNext` logic |
| F | **Pagination: Fetch All** | `GET /hadith/bukhari?limit=100` with `total 7000` at once. | Simple `bookPages` from one fetch | 2MB+, slow `computed`, memory/battery heavy on mobile |

---

## 12. Instruction to Agent (Mandatory)

> **Agent must NOT choose for the user. Before writing any code for this plan:**
> 1. Present the table above (A–F) as a `question` tool call with `header`, `question`, `options[]` — make `Recommended` options first and labeled `(Recommended)`.
> 2. Wait for explicit user selection (user may pick e.g., `A + C + E`).
> 3. Only after receiving the selection, proceed to implement the chosen slice(s) **one thin slice at a time** (`useHadithBookPages.ts` → `HadithBookView.vue` → `reader.css` tweak → list toggle → QuickJump).
> 4. After each slice, `bun run build` must pass and `coderabbit review --agent` must be 0 criticals before next slice.
> 5. If user says “you decide”, default to **A + C + E** (Book per Collection + List+Book Toggle + 20-window).
>
> **Do not** hardcode a choice, do not start with `bukhari` full fetch, and do not create `HadithBookView` before asking. The user — not the agent — owns the product decision.
