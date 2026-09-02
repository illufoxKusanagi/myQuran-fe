# 📖 Long Ayah Scrolling Issue: Root Cause Analysis & Solution

> **Target Bug**: Ayah text overflows page container on long verses (e.g., *Al-Baqarah: 61*, *Al-Baqarah: 255 / Ayat al-Kursi*, *Al-Baqarah: 282 / Ayah ad-Dayn*) and cannot be scrolled.  
> **Affected View**: `src/views/SurahView.vue`  
> **Library Involved**: `page-flip` (`st-page-flip`)

---

## 🛑 Problem Summary

When rendering long verses with detailed translations and footnotes, the total content height exceeds the physical page container (`height: min(640px, calc(100vh - 160px))`). Readers cannot scroll using the mouse wheel, touch gestures, or by dragging the scrollbar to read the remaining Arabic text, transliteration, or translation.

---

## 🔍 Root Cause Analysis

### 1. StPageFlip Intercepts Mousedown & Calls `e.preventDefault()`
In `node_modules/page-flip/src/UI/UI.ts`:
```typescript
private onMouseDown = (e: MouseEvent): void => {
    if (this.checkTarget(e.target)) {
        const pos = this.getMousePos(e.clientX, e.clientY);
        this.app.startUserTouch(pos);
        e.preventDefault(); // ❌ BLOCKS native scrolling & scrollbar dragging
    }
};

private checkTarget(target: EventTarget): boolean {
    if (!this.app.getSettings().clickEventForward) return true;
    if (['a', 'button'].includes((target as HTMLElement).tagName.toLowerCase())) {
        return false;
    }
    return true; // ❌ Returns true for <div>, <p>, scrollbars, etc.
}
```
* **Impact**: Because `checkTarget` only whitelists `<a>` and `<button>` tags, clicking or dragging on `<div class="pf-scroll">` causes StPageFlip to intercept the event, execute `e.preventDefault()`, and attempt to initiate a 3D page curl instead of scrolling.

---

### 2. Flawed `attachScrollGuards()` Implementation
In `src/views/SurahView.vue` (lines 108–128):
```javascript
function attachScrollGuards() {
  if (!bookWrapRef.value) return
  const roots = bookWrapRef.value.querySelectorAll('.pf-scroll')
  roots.forEach((el) => {
    if ((e as any)._guarded) return
    const stop = (ev: Event) => {
      ev.stopPropagation()
      ev.stopImmediatePropagation?.() // ❌ Kills wheel propagation in capture phase
    }
    const optsWheel: any = { passive: false, capture: true }
    e.addEventListener('wheel', stop as any, optsWheel)
    e.addEventListener('touchstart', stop as any, optsTouch)
    e.addEventListener('touchmove', stop as any, optsMove)
    ;(e as any)._guarded = true
  })
}
```
* **Impact**:
  1. `stopImmediatePropagation()` in the **capture phase** intercepts the `wheel` event before the browser dispatches native scrolling, without manually calculating and setting `el.scrollTop += ev.deltaY`.
  2. StPageFlip dynamically moves/clones `.stf__item` elements during flips (such as navigating through 61 pages in Al-Baqarah). Newly active pages become un-guarded or get stuck with stale listeners.

---

### 3. StPageFlip Shadow & Canvas Layers Sit on Top of Content
In `node_modules/page-flip/src/Render/HTMLRender.ts` & `stPageFlip.css`:
* StPageFlip injects shadow overlays (`.stf__outerShadow`, `.stf__innerShadow`, `.stf__hardShadow`) with `z-index: 15` and a root `<canvas>` overlay directly over the page content.
* **Impact**: Without explicit `pointer-events: none !important;`, these layers sit physically above `.pf-scroll` and block pointer, wheel, and touch events.

---

### 4. Global `select-none` on Root Reader Container
In `src/views/SurahView.vue` (line 229):
```html
<div class="flex-1 flex flex-col bg-cyan-100 dark:bg-cyan-900 overflow-hidden select-none">
```
* **Impact**: `select-none` (`user-select: none`) on the entire viewport disables text selection and disrupts scrollbar drag mechanics in several browser engines.

---

## 🛠️ Step-by-Step Resolution

### Step 1: Update CSS Overlay Pointer Rules (`src/features/reader/reader.css`)
Ensure shadows and canvas overlays allow pointer events to pass through to the underlying content:
```css
/* Ensure StPageFlip canvas and shadows do not block mouse/touch */
.stf__parent canvas,
.stf__outerShadow,
.stf__innerShadow,
.stf__hardShadow,
.stf__hardInnerShadow {
  pointer-events: none !important;
}

/* Enable text selection and scrolling on the scroll container */
.pf-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #d4d4d8 transparent;
  touch-action: pan-y;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  user-select: text;
  -webkit-user-select: text;
  pointer-events: auto;
  position: relative;
  z-index: 2;
}
```

### Step 2: Implement Active Wheel & Touch Scroll Isolation (`SurahView.vue`)
Replace the flawed `attachScrollGuards` with an active scroll driver:
```typescript
function attachScrollGuards() {
  if (!bookWrapRef.value) return
  const roots = bookWrapRef.value.querySelectorAll('.pf-scroll')

  roots.forEach((el) => {
    const container = el as HTMLElement
    if ((container as any)._scrollGuarded) return

    // 1. Mouse Wheel: Manually scroll the container & stop event bubbling to PageFlip
    container.addEventListener(
      'wheel',
      (e: WheelEvent) => {
        const canScrollUp = container.scrollTop > 0 && e.deltaY < 0
        const canScrollDown =
          container.scrollTop + container.clientHeight < container.scrollHeight && e.deltaY > 0

        if (canScrollUp || canScrollDown) {
          container.scrollTop += e.deltaY
          e.stopPropagation()
          e.preventDefault()
        }
      },
      { passive: false, capture: true }
    )

    // 2. Prevent PageFlip from triggering page-flip drag on mouse click inside scroll area
    container.addEventListener('mousedown', (e: MouseEvent) => {
      e.stopPropagation()
    })

    // 3. Touch Scroll Driver for Mobile
    let startY = 0
    container.addEventListener(
      'touchstart',
      (e: TouchEvent) => {
        if (e.touches.length === 1) {
          startY = e.touches[0].clientY
          e.stopPropagation()
        }
      },
      { passive: true }
    )

    container.addEventListener(
      'touchmove',
      (e: TouchEvent) => {
        if (e.touches.length === 1) {
          const currentY = e.touches[0].clientY
          const deltaY = startY - currentY
          const canScrollUp = container.scrollTop > 0 && deltaY < 0
          const canScrollDown =
            container.scrollTop + container.clientHeight < container.scrollHeight && deltaY > 0

          if (canScrollUp || canScrollDown) {
            container.scrollTop += deltaY
            startY = currentY
            e.stopPropagation()
          }
        }
      },
      { passive: true }
    )

    ;(container as any)._scrollGuarded = true
  })
}
```

### Step 3: Attach to StPageFlip `flip` Event
Call `attachScrollGuards()` whenever a page turn finishes so newly active pages (like Ayah 61) immediately receive scroll listeners:
```typescript
book.on('flip', () => {
  nextTick(() => {
    requestAnimationFrame(() => attachScrollGuards())
  })
})
```

