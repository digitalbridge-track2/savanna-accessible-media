# Judges & Co-Designers Quick Evaluation Guide

**Module:** Abugida Media Kit (አቡጊዳ)  
**Track:** Track 2 — Accessible Learning Media & Career Gateway  
**ALX Tech Hub Hackathon (Lideta, Addis Ababa)**  
**Target Platform:** Savanna LMS (3,000 Digital Bridge learners) & Open Regional Platforms

---

## ⚡ The 60-Second Quickstart (The 1-Hour Install Test)

Run with Docker Compose (zero dependencies needed):
```bash
docker compose up -d
```
* **Interactive Demo:** [http://localhost:3000](http://localhost:3000)
* **Savanna LMS Starter Integration:** [http://localhost:8080/lessons/digital-workplace/concept-with-navigation.html](http://localhost:8080/lessons/digital-workplace/concept-with-navigation.html)
* **Level 2 Transcription REST API & OpenAPI Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

*Or natively with Node.js & Python:*
```bash
npm install
npm run build
npm run dev
```

---

## 🏆 Scoring Pillars Verification Matrix (100 Points Total)

### Pillar 1: Works for the People It Is For (30 Points)
*Primary Goal: Co-designer tasks completed unaided.*
1. **Deaf & Hard-of-Hearing Learner Journey:**
   - Navigate to `/lesson`. Press `M` to mute (or click `Mute`), click `CC` (or press `C`) for reviewed Amharic captions, and click `ESL` for the **Ethiopian Sign Language (EthSL)** window docked alongside the video.
   - Move or resize the sign window using keyboard buttons or mouse (no drag-only traps).
2. **Blind & Low-Vision Learner Journey:**
   - Dedicated `D)))` button activates the human-reviewed audio-described soundtrack.
   - Transcript includes inline visual descriptions (`[visual description]`) and timestamp seeking (`Play from mm:ss`).
   - Download the genuine **Tagged Accessible PDF** (`lesson.en.tagged.pdf`) with verified tag tree and alt text.
3. **Low-Bandwidth & 3G Offline Learner Journey:**
   - Scroll to the 3G Study Pack section. Download the measured **3.2 MB Study Pack** (`offline-bundle.zip`).
   - Turn off Wi-Fi / enable airplane mode and reload: the lesson and audio play offline via CacheStorage & Service Worker.

---

### Pillar 2: Can Be Adopted by Another Platform (25 Points)
*Primary Goal: Seamless 3-tier integration into Savanna and partner LMS platforms.*
* **Level 1 — Drop-in Script Tag:**
  Include one line of HTML on any page:
  ```html
  <script type="module" src="/module/db-player.js"></script>
  <a11y-media-player manifest-src="/lessons/digital-workplace/lesson.json" locale="am"></a11y-media-player>
  ```
  Verified live in Savanna LMS at `/lessons/digital-workplace/concept-with-navigation.html`.
* **Level 2 — REST API with OpenAPI Specification:**
  FastAPI microservice running at `http://localhost:8000/docs` with standard OpenAPI 3.1 schemas for transcription jobs, cue editing, and publishing.
* **Level 3 — Open Standards:**
  - **`schema.org/JobPosting`:** JSON-LD for accessible job cards in `/jobs/jobs.json`.
  - **1EdTech / W3C Open Badges 3.0 (OBv3):** Navigate to `/verify?id=CERT-DB-2026-0042` and click **"Open Badges 3.0 (OBv3)"** or download `.jsonld` standard verifiable credential.

---

### Pillar 3: Built for Ethiopia (15 Points)
*Primary Goal: Authentic Ethiopian context, languages, and technical infrastructure.*
1. **Natural Amharic & Ethiopic Script:**
   - Locally hosted `Noto Sans Ethiopic` font; correct `lang="am"` tags for screen readers to invoke Ethiopic speech synthesis.
2. **Ethiopian Dual-Calendar Integration:**
   - Dual-calendar presentation: ISO `2026-11-14` displays as **ኅዳር 5፣ 2019 ዓ.ም** with Ge'ez month calculations.
3. **Genuine Ethiopian Sign Language:**
   - Authentic consented recording by native Ethiopian Sign Language interpreters; zero synthetic AI avatars.
4. **Tested on 3G Connections:**
   - Throttled under realistic 3G network conditions with measured byte sizes before download.

---

### Pillar 4: Quality, Security, and Privacy (15 Points)
1. **Zero Axe-Core Violations:**
   - Automated accessibility audit (`npm run test:a11y`) confirms **0 critical and 0 serious violations** across all 5 views.
2. **Zero Inaccessible Traps:**
   - 100% keyboard operable; zero positive `tabindex`; no auto-playing media; no `aria-live` flooding on captions or timers.
3. **Privacy First:**
   - Zero third-party trackers, zero advertising cookies, and zero external CDN dependencies. Learner certificate verification exposes no disability status or private accommodation needs.

---

### Pillar 5: Can Be Kept Running (15 Points)
1. **No Paid API Lock-In:**
   - Runs 100% locally with open-source tools (FastAPI, SQLite, Vite, Web Components). Zero dependency on paid cloud services.
2. **Reproducible Automated Test Suite:**
   - Run `npm run test` for 25 automated tests: 15 unit tests, 6 axe-core a11y audits, and 4 integration tests.
3. **Open Source Licensing:**
   - Permissive open-source license with complete `CREDITS.md` and `THIRD_PARTY_NOTICES.md`.

---

## 🌟 Official Hackathon Bonuses Claimed (Slide 9 "EARNS EXTRA")

1. **Braille Export (`.brf`):**
   - In Transcript Studio (`/studio`), click **"Export Braille (.brf)"** to generate standard Braille Ready Format files for refreshable Braille displays.
2. **Recorded Live-Session Replay with Synchronized Chat Log:**
   - In the player, click the **"💬 Live Chat Replay"** tab in the left panel.
   - Watch student questions and instructor responses appear and highlight synchronously with the video timeline.
   - Click any chat question to jump the video directly to that discussion point!
3. **Open Badges 3.0 (OBv3) Verifiable Credential:**
   - On `/verify`, export W3C / 1EdTech Open Badges 3.0 JSON-LD credentials for cross-LMS verification.
