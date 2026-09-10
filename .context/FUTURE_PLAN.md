# 🚀 MyQuran Frontend — Future Roadmap & Improvement Plan

This document outlines the architectural roadmap, planned features, and technical specifications for upcoming iterations of **MyQuran Frontend**. It aligns frontend development with the capabilities documented in [`API_FRONTEND_GUIDE.md`](./API_FRONTEND_GUIDE.md).

---

## 🧭 Roadmap Overview & Impact Matrix

| Phase | Feature Initiative                               |  Impact  | Complexity | Target Endpoints                                   |
| :---- | :----------------------------------------------- | :------: | :--------: | :------------------------------------------------- |
| **1** | **Global Ayah & Keyword Search**                 |  🔴 High  |   Medium   | `GET /ayah/search`                                 |
| **2** | **Bookmarks, Favorites & History**               |  🔴 High  |    Low     | Client-side (`localStorage` / IndexedDB)           |
| **3** | **Dynamic Audio Engine (40+ Qaris)**             | 🟡 Medium |   Medium   | `GET /reciter`, `GET /audio/surah/:id`             |
| **4** | **Daily Inspiration (Hadith & Ayah of the Day)** | 🟡 Medium |    Low     | `GET /hadith/random`                               |
| **5** | **604-Page Authentic Kemenag Mushaf Mode**       |  🔴 High  |    High    | `GET /page/:pageNumber`, `/page/:pageNumber/image` |
| **6** | **PWA & Offline First Architecture**             | 🟡 Medium |   Medium   | Service Worker / Cache API                         |
| **7** | **Social Quote & Ayah Card Exporter**            |  🟢 Low   |   Medium   | HTML5 Canvas / DOM-to-Image                        |

---

## 📌 Detailed Implementation Specifications

### Phase 1: Global Ayah & Keyword Search (`Ctrl + K` / `Cmd + K`)
* **Objective**: Enable full-text search across all 6,236 verses instead of only filtering Surah names.
* **Technical Details**:
  * **Endpoint**: `GET /ayah/search?q={query}&surah={surahId}&page={page}&limit={limit}&withTafsir=false`
  * **Triggers**: Global keyboard shortcut (`Ctrl+K` / `Cmd+K`) or search button in Navbar.
  * **UX / UI**:
    * Clean modal dialog with debounced search input (300ms).
    * Filter chips for Surah scope, Arabic, Latin, or Indonesian translation.
    * Highlight matching query text in results.
    * Clicking a result navigates directly to `/surah/:id` and auto-flips to that verse.

---

### Phase 2: Bookmarks, Favorites & Reading Notes
* **Objective**: Empower readers to mark verses, create reading lists, and track multi-surah reading goals.
* **Technical Details**:
  * **Storage Engine**: `IndexedDB` or structured `localStorage` under `myquran_bookmarks`.
  * **Features**:
    * **Quick Bookmark**: Single-click ribbon button on any Ayah in `SurahView` or Hadith in `HadithBookView`.
    * **Collections / Tags**: Group bookmarks (e.g. *Doa Harian*, *Hafalan*, *Kajian Tafsir*).
    * **Reading History**: Automated tracking of the last 10 visited Surahs/Ayahs with timestamps.
    * **Data Export & Import**: Backup bookmarks as JSON to prevent data loss across devices.

---

### Phase 3: Dynamic Audio Engine & Reciter Catalog (40+ Qaris)
* **Objective**: Replace the current 4 hardcoded Qaris with the backend's dynamic reciter catalog.
* **Technical Details**:
  * **Endpoints**:
    * `GET /reciter`: Dynamic list of 40+ verified Qaris (subfolders, bitrates, styles like Murattal vs Mujawwad).
    * `GET /audio/surah/:surahId?reciterId={reciterId}&from={from}&to={to}`: Direct audio streaming URL batching.
  * **Features**:
    * Reciter selector with search, country flags, and recitation style filters.
    * Playback speed control (`0.75x`, `1.0x`, `1.25x`, `1.5x`, `2.0x`).
    * Visual audio waveform or progress scrub bar during continuous recitation.
    * Active verse pulse and automated page progression.

---

### Phase 4: Daily Inspiration on Homepage ("Hadits & Ayat Hari Ini")
* **Objective**: Provide daily spiritual touchpoints on `HomeView.vue`.
* **Technical Details**:
  * **Endpoint**: `GET /hadith/random` (optional query: `?book=bukhari`).
  * **Features**:
    * Hero card displaying a randomly chosen authentic Hadith with Arabic script, book reference, chapter/bab, and Indonesian translation.
    * **Shuffle / Refresh Button**: One-click fetch for another random Hadith.
    * **Direct Reader Link**: Jump button to read the Hadith in its full context within `HadithBookView`.

---

### Phase 5: Authentic 604-Page Kemenag Mushaf Mode
* **Objective**: Offer readers the authentic visual experience of physical printed Indonesian Mushafs alongside the interactive digital layout.
* **Technical Details**:
  * **Endpoints**:
    * `GET /page/:pageNumber`: Metadata and verse mapping for pages 1–604.
    * `GET /page/:pageNumber/image`: High-resolution WebP scans from the Ministry of Religious Affairs (Kemenag).
  * **Features**:
    * Reader mode switcher in `ReaderHeader`: **Digital Interactive Mode** vs **Mushaf Standar Indonesia Mode**.
    * Reuse the existing 3D `page-flip` physics engine with high-res scanned page textures.
    * Client-side preloading for adjacent spreads to ensure instant, stutter-free page turning.

---

### Phase 6: Progressive Web App (PWA) & Offline Reading
* **Objective**: Allow users to install MyQuran as a native desktop/mobile app with offline reading capabilities.
* **Technical Details**:
  * **Library**: `vite-plugin-pwa`.
  * **Features**:
    * Offline caching for the core application shell, UI icons, and the official Kemenag LPMQ font (`/fonts/LPMQ-IsepMisbah.woff2`).
    * Cache visited Surahs and Hadiths in runtime CacheStorage so they remain readable without an internet connection.
    * Web App Manifest with app icons, theme color (`oklch`), and standalone display mode.

---

### Phase 7: Ayah Social Card & Quote Generator
* **Objective**: Allow users to generate and share beautiful Quranic quote cards on WhatsApp, Instagram, or Twitter.
* **Technical Details**:
  * **Library**: HTML5 Canvas / `html-to-image`.
  * **Features**:
    * "Bagikan Ayat" button on the Ayah and Tafsir drawer.
    * Customizable background themes (Clean, Paper Sepia, Dark Emerald, Geometric Islamic pattern).
    * Includes Arabic calligraphy, Indonesian translation, and Surah reference tag.
    * Direct download as PNG/WebP or 1-click native Web Share API.

