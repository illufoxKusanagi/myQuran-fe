# CodeRabbit Review Remediation Plan

This implementation plan addresses all 27 findings identified by the CodeRabbit review on branch `feat/mushaf` against `master`. The plan is partitioned into three phases to allow methodical execution and verification.

---

## User Review Required

> [!IMPORTANT]
> - **Zero Git Mutations**: In accordance with the workspace rules, all fixes will be made directly to working tree files via `replace_file_content`. No commits, rebases, or pushes will be executed.
> - **Incremental Verification**: Each phase will be type-checked with `bun run build` (`vue-tsc -b && vite build`) to ensure zero regressions before proceeding to the next.

---

## Proposed Changes

### Phase 1: Mushaf Feature Fixes (Immediate Priority)

Resolves all findings directly tied to the new 604-page physical Mushaf reader subsystem.

#### [MODIFY] [MushafPageItem.vue](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/features/mushaf/components/MushafPageItem.vue)
- **Problem (Major)**: The "Coba Lagi" retry button directly assigned `page.cdnFallbackUrl` and failed to reset `imageError`, preventing re-attempts from the primary proxy URL.
- **Fix**:
  - Implement a dedicated `retry()` function that resets `imageError.value = false`, `imageLoaded.value = false`, `retryCount.value = 0`.
  - Append a cache-busting timestamp or re-assign `currentSrc.value = props.page.imageUrl` so the browser triggers a fresh network request.

#### [MODIFY] [MushafView.vue](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/views/MushafView.vue)
- **Problem (Minor)**: `setTimeout` for initial page jump is unreferenced, leaving an unhandled timer if the component unmounts before 150ms.
- **Fix**:
  - Store timer in `initialJumpTimer: ReturnType<typeof setTimeout> | null`.
  - Clear timer in `onBeforeUnmount` before `destroyBook()`.

#### [MODIFY] [MushafControls.vue](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/features/mushaf/components/MushafControls.vue)
- **Problem (Minor)**: `isFullscreen` toggles optimistically on button click instead of reacting to browser state. If the user exits via `Esc` key, the icon becomes inverted.
- **Fix**:
  - Add a listener for `document.addEventListener('fullscreenchange', syncFullscreen)`.
  - Update `isFullscreen.value = !!document.fullscreenElement`.
  - Clean up event listener in `onBeforeUnmount`.

#### [MODIFY] [useMushafPages.ts](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/features/mushaf/composables/useMushafPages.ts)
- **Problem (Minor)**: In two-page spread mode, jumping to an even page (left side of the spread) causes `activePageNumber` to default to the right page, so the toolbar and Juz chip report the right page instead of the requested target.
- **Fix**:
  - Track an explicit `requestedTargetPage: Ref<number | null>`.
  - If the requested page is visible on the current spread, prioritize it in `activePageNumber`. Clear the override upon user spread navigation.

#### [MODIFY] [MushafJumpDialog.vue](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/features/mushaf/components/MushafJumpDialog.vue)
- **Problem (Minor)**: In the Surah jump list, `s.arabic` lacks RTL direction and text alignment.
- **Fix**:
  - Add `dir="rtl"` and `text-right` to the Arabic text span around line 304.

---

### Phase 2: Core Reader & Audio Stability (Memory Leaks & Race Conditions)

Addresses major memory leaks and lifecycle flaws in the shared reader engine.

#### [MODIFY] [SurahView.vue](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/views/SurahView.vue)
- **Problem (Major)**: `onBeforeUnmount` removes window resize listener but forgets to call `destroyBook()`, leaking the `PageFlip` DOM instance, leaf clones, and `ResizeObserver`.
- **Fix**: Add `destroyBook()` to `onBeforeUnmount`.

#### [MODIFY] [HadithBookView.vue](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/views/hadith/HadithBookView.vue)
- **Problem (Major)**: Identical unmount leak—does not call `destroyBook()`.
- **Fix**: Add `destroyBook()` to `onBeforeUnmount`.

#### [MODIFY] [useBookFlip.ts](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/features/reader/composables/useBookFlip.ts)
- **Problem 1 (Major)**: Unbounded `requestAnimationFrame` recursion in `initPageFlip` when `getPageSize()` returns null.
- **Fix 1**: Track `initRafId: number | null`, cap retries to 10 attempts, and cancel pending RAF in `destroyBook` and unmount.
- **Problem 2 (Major)**: `scheduleReinit` rebuilds the book without `preserveIndex: true`, resetting reader back to page 0 on screen resize.
- **Fix 2**: Pass `preserveIndex: true` (`rebuild(true)`).

#### [MODIFY] [useQuranAudio.ts](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/features/reader/composables/useQuranAudio.ts)
- **Problem (Major)**: `playSingleAyah` reuses `audioEl` without clearing `audioEl.onended`, causing stale queue progression handlers to trigger.
- **Fix**: Set `audioEl.onended = null` before starting single ayah playback.

#### [MODIFY] [useAyahList.ts](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/features/reader/composables/useAyahList.ts)
- **Problem 1 (Major)**: `fetchAyahs` does not abort previous in-flight requests, causing race conditions on rapid surah changes.
- **Fix 1**: Add `AbortController` tracking, abort previous controller, pass `signal` to `fetch`, and ignore `AbortError`.
- **Problem 2 (Minor)**: Missing validation on `data.ayahs` before assignment.
- **Fix 2**: Ensure `Array.isArray(data.ayahs)` before assigning to `ayahs.value`.

#### [MODIFY] [QuickJumpDialog.vue](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/features/reader/components/QuickJumpDialog.vue)
- **Problem (Major)**: `handleSubmit` does not await `props.jumpToAyah(a)` before checking result and closing.
- **Fix**: Make `handleSubmit` `async`, await `props.jumpToAyah(a)`, and only call `close()` if true.

#### [MODIFY] [TafsirDrawer.vue](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/features/reader/components/TafsirDrawer.vue)
- **Problem (Minor)**: `watch(() => props.isOpen)` does not run immediately, failing to attach focus traps/keydown listeners if drawer is initially open.
- **Fix**: Add `{ immediate: true }` to the watcher.

#### [MODIFY] [useReaderShortcuts.ts](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/features/reader/composables/useReaderShortcuts.ts)
- **Problem (Minor)**: Single-key shortcuts (`t`, `s`) trigger even when focused on `<select>` elements or when modifier keys (`Ctrl`, `Meta`, `Alt`) are held.
- **Fix**: Add `SELECT` to target tag guard, and check `!e.ctrlKey && !e.metaKey && !e.altKey`.

---

### Phase 3: Navigation, Home & Hadith Subsystem Fixes

Resolves remaining edge-case bugs across Hadith and Home views.

#### [MODIFY] [LastReadHero.vue](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/features/home/components/LastReadHero.vue)
- **Problem 1 (Major)**: `continueReading` pushes route without `query: { ayah: String(lastRead.ayahNumber) }`, sending readers to verse 1.
- **Fix 1**: Include `query: { ayah: String(lastRead.value.ayahNumber) }`.
- **Problem 2 (Minor)**: Arabic text span lacks `text-right` class.
- **Fix 2**: Add `text-right` to class list.

#### [MODIFY] [HadithDetailView.vue](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/views/hadith/HadithDetailView.vue)
- **Problem (Major)**: Route-driven fetch lacks `AbortController` and request ID tracking; rapid prev/next clicks cause stale hadiths to display.
- **Fix**: Introduce `AbortController` + sequential request ID; discard stale responses.

#### [MODIFY] [HadithListView.vue](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/views/hadith/HadithListView.vue)
- **Problem 1 (Minor)**: `route.query.page` is not watched on direct URL changes, and lacks positive integer normalization.
- **Fix 1**: Watch `route.query.page`, parse with `Math.max(1, parseInt(...) || 1)`, and trigger `fetchList`.
- **Problem 2 (Minor)**: Arabic book name near line 93 lacks isolated `dir="rtl"` and `text-right`.
- **Fix 2**: Wrap in dedicated element with `dir="rtl"` and `text-right`.

#### [MODIFY] [GlobalSearchDialog.vue](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/components/GlobalSearchDialog.vue)
- **Problem (Minor)**: Empty-query branch does not abort active `activeAbortController`, allowing in-flight requests to repopulate results after clearing.
- **Fix**: Abort and nullify `activeAbortController` in empty query check.

#### [MODIFY] [JuzJumpChips.vue](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/features/home/components/JuzJumpChips.vue)
- **Problem (Minor)**: `selected` state is not reset after navigation, preventing re-selection; unnecessary `as any` cast on router push.
- **Fix**: Reset `selected.value = ''` after navigation, and remove `as any`.

#### [MODIFY] [HadithBookCard.vue](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/features/hadith/components/HadithBookCard.vue)
- **Problem (Minor)**: Hadith count formatting should explicitly use `'id-ID'` locale.
- **Fix**: Update to `book.availableHadiths.toLocaleString('id-ID')`.

#### [MODIFY] [ReaderNavSidebar.vue](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/features/reader/components/ReaderNavSidebar.vue)
- **Problem (Minor)**: Kitab input submits without checking against total available kitabs for the current book.
- **Fix**: Validate entered number against `allKitabs.value.length`.

#### [MODIFY] [useLastRead.ts](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/features/reader/composables/useLastRead.ts)
- **Problem (Minor)**: `readStorage` does not validate `parsed.timestamp` or `parsed.ayahNumber` finite numbers, potentially breaking `timeAgo`.
- **Fix**: Add `Number.isFinite(parsed.timestamp)` and `Number.isFinite(parsed.ayahNumber)` checks.

#### [MODIFY] [HadithBookView.vue](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/views/hadith/HadithBookView.vue)
- **Problem (Minor)**: `getGradeClass` falls back to `grade-daif` for any unrecognized grade string.
- **Fix**: Require explicit check for `"daif"`, `"dhaif"`, or `"dha'if"`; otherwise return empty string.

#### [MODIFY] [transliteration.ts](file:///home/illufoxkusanagi/Documents/myQuran-frontend/src/lib/transliteration.ts)
- **Problem (Minor)**: `PREFIX_REGEX` short prefixes shadow longer prefixes (e.g. `ad` shadows `adz`, `as` shadows `ash`/`asy`), breaking transliteration searches for Surahs like Adz-Dzariyat.
- **Fix**: Order prefixes longest-first: `/^(?:adz|ash|asy|al|an|ar|as|at|az|ad)[\s-]+/i`.

---

## Verification Plan

### Automated Type Safety & Build
After each phase, execute:
```bash
bun run build
```
- Verifies `vue-tsc -b` produces 0 TypeScript compilation errors.
- Verifies `vite build` bundles all 2,600+ modules with exit code 0.

### Automated CodeRabbit Re-Check
After all phases are completed:
```bash
/home/illufoxkusanagi/.local/bin/coderabbit review --agent --base master
```
- Confirms the total finding count drops to 0 (clean bill of health).
