# Abugida Media Kit (አቡጊዳ ሚዲያ ኪት)

> **Track 2 — Accessible Learning Media & Accessible Career Gateway**  
> Built for the **Digital Bridge Accessibility Hackathon 2026** (ALX Ethiopia, LIWAY, SNV, Mercy Corps, AAAPD, Tomorrow is Better).

---

## 🏆 Summary of Deliverables

1. **`<a11y-media-player>` Web Component:**
   * **Full Keyboard Accessibility:** Scoped shortcuts (`Space`/`K`, `J`/`L`, `M`, `C`, `S`, `D`, `+`/`-`, `Shift+Arrows`), no mouse required, no keyboard traps.
   * **Bilingual Reviewed Captions:** English & Amharic WebVTT subtitles with 4 font size tiers (14px–32px) and 4 contrast themes (including Yellow-on-Black and White-on-Black).
   * **Ethiopian Sign Language (ESL) Window:** Secondary synchronized video with 4 keyboard-docking positions and 3 size presets.
   * **Audio Description (AD):** Lossless source switching preserving playback position and state without unexpected autoplay.
   * **Interactive Synchronized Transcript:** Live active cue highlighting, timestamp seek buttons, instant keyword search, and explicit `[Visual: ...]` descriptions.
   * **3G Offline Study Pack:** One-click download of a measured **3.2 MB** light pack (audio, transcript, HTML) with IndexedDB & Service Worker caching verified in Airplane Mode after reload.

2. **`<a11y-job-card>` (Career Gateway):**
   * **200% Zoom Resilient:** Fluid typography and flexbox reflow preventing horizontal scrollbars.
   * **Prerecorded Audio Summary:** Native `<audio controls>` accompanied by equivalent full transcript text.
   * **Transparent Accommodations:** Clear accommodation badges with verified employer source labels.
   * **Search & AT Indexing:** Embedded `schema.org/JobPosting` JSON-LD microdata.
   * **Verifiable Certificate Links:** One-click sharing via Web Share API with clipboard fallback.

3. **Pass/Fail Gate Compliance:**
   * **Axe-core Audit:** **0 critical, 0 serious issues** (`npm run test:a11y`).
   * **WCAG 2.2 Level AA:** Comprehensive conformance statement in [`evidence/WCAG-2.2-AA-CONFORMANCE.md`](file:///evidence/WCAG-2.2-AA-CONFORMANCE.md).

---

## 🚀 Quick Start (60-Minute Judge & Evaluator Setup)

### Option A: 1-Command Docker Compose (Recommended)

To run the entire system (Frontend demo + Backend OpenAPI service) in under 60 seconds:

```bash
docker compose up --build
```

* **Web Application & Player Demo (Port 3000):** [http://localhost:3000](http://localhost:3000)
  * `/` — Project overview & adoption levels
  * `/lesson.html` — Accessible player, captions, ESL window, audio description, and 3G offline pack
  * `/studio.html` — Transcript review studio
  * `/verify.html` — Certificate verification portal
* **Level 2 REST API & Swagger Docs (Port 8000):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option B: Local Node.js Development

#### Prerequisites
* Node.js >= 18 LTS
* Python >= 3.10 (optional, for local transcription service)

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

#### 3. Run Automated Tests
```bash
# Run unit & schema validation tests
npm run test:unit

# Run axe-core automated accessibility audit (Pass/Fail Gate)
npm run test:a11y

# Run complete test suite
npm test
```

---

## 🏛️ 3-Tier Integration Architecture

* **Level 1 (Script Tag):** Drop `<script type="module" src=".../a11y-media-player.js"></script>` into any HTML or LMS page with zero dependencies.
* **Level 2 (REST API & OpenAPI):** Headless Python FastAPI backend providing endpoints for transcript retrieval, subtitle generation, and offline pack builds.
* **Level 3 (Open Standards):** Full compliance with `schema.org/JobPosting`, standard WebVTT subtitles, and Savanna LMS integration.

---

## 👥 Credits & Team

* Built by Team **Savanna Accessible Media** for Digital Bridge 2026.
* Full test logs and co-designer feedback in [`evidence/co-designer-changes.md`](file:///evidence/co-designer-changes.md).
* Released under the open-source **MIT License**.
