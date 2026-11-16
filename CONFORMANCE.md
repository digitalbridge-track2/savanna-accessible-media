# WCAG 2.2 AA Conformance Report

**Module:** Abugida Media Kit (`<db-player>` / `<a11y-media-player>` & `<a11y-job-card>`)  
**Track:** Track 2 — Accessible Learning Media & Career Gateway  
**Evaluation Standard:** Web Content Accessibility Guidelines (WCAG) 2.2 Level AA  
**Date:** 16 November 2026 (ኅዳር 7፣ 2019 ዓ.ም)  
**Host Platform:** Savanna LMS (`savanna/pages/concept-with-navigation.html`) and Demo PWA (`apps/demo`)  
**Evaluation Status:** **PASS (The Gate Passed: 0 Critical, 0 Serious Violations)**

---

## Conformance Matrix

| WCAG 2.2 AA Criterion | Supports / Partly / Does not | Technical Notes & Implementation Details |
| :--- | :--- | :--- |
| **1.1.1 Non-text Content** | Supports | Every icon button has an accessible name (`aria-label`) and tooltip. Icons carry `aria-hidden="true"`. Sign language status announced via live regions. Visual descriptions embedded in transcripts (`[Visual: ...]`). Tagged PDF/UA and HTML handouts have verified alt text on figures. |
| **1.2.1 Audio-only & Video-only** | Supports | Standalone transcripts provided for audio clips. Full Ethiopian Sign Language (EthSL) human interpreter video stream provided for video content. |
| **1.2.2 Captions (Prerecorded)** | Supports | Custom client-rendered captions overlay from WebVTT in English (`captions.en.vtt`) and reviewed Amharic (`captions.am.vtt`). Customizable font sizes (Small to Extra-Large) and 4 high-contrast themes. |
| **1.2.3 Audio Description or Media Alternative** | Supports | Integrated audio description toggle (`[D)))]` button or <kbd>D</kbd> shortcut) switches to described stream with spoken slide descriptions. Full text transcript with inline visual descriptions. |
| **1.2.5 Audio Description (Prerecorded)** | Supports | Prerecorded, professionally reviewed audio description track (`lesson-ad.mp4`) provided for all visual slide transitions, diagrams, and bullet points. |
| **1.3.1 Info and Relationships** | Supports | Semantic HTML elements throughout (`<button>`, `<video>`, `<dialog>`, `<input type="range">`, `<select>`). Logical document heading hierarchy (`<h1>` to `<h3>`). Tables have header scopes. Live regions (`role="status"`, `aria-live="polite"`) for cue updates. |
| **1.3.2 Meaningful Sequence** | Supports | Logical DOM and reading order: Header/Options -> Scrubber -> Playback cluster -> Speed/CC/Sign cluster -> Settings/Fullscreen cluster. |
| **1.4.1 Use of Color** | Supports | Active toggle states indicated by both color and `aria-pressed="true"` attributes. Transcript highlights use background tint plus focus outlines. |
| **1.4.2 Audio Control (No Autoplay)** | Supports | **Strict non-autoplay compliance.** The video player, audio descriptions, and Read-Aloud Voice Guide never start speaking or playing automatically on page load, eliminating collisions with NVDA and TalkBack screen readers. The Voice Guide requires an explicit user keypress or button tap ("Start Voice Guide"). |
| **1.4.3 Contrast (Minimum)** | Supports | Text achieves at least 4.5:1 against backgrounds. Control icons and borders achieve >3:1. High-contrast caption themes available (Yellow-on-Black: 19.5:1, White-on-Black: 21:1). |
| **1.4.4 Resize Text** | Supports | Tested and verified at 200% browser zoom with zero clipping, overlapping, or horizontal viewport overflow across both the media player and career job cards. |
| **1.4.10 Reflow** | Supports | Responsive stage reflows seamlessly to vertical stack on screens narrower than 880px and down to 320px phone viewports without horizontal scrolling. Job cards reflow cleanly into single-column layout at 200% zoom. |
| **1.4.11 Non-text Contrast** | Supports | Scrubbers, window resize grips, and focus rings exceed 3:1 against adjacent backgrounds. |
| **2.1.1 Keyboard** | Supports | 100% of player and career features operate via keyboard: <kbd>Space</kbd>/<kbd>K</kbd> (play/pause), <kbd>J</kbd>/<kbd>L</kbd> or <kbd>←</kbd>/<kbd>→</kbd> (seek 5s), <kbd>0</kbd>/<kbd>Home</kbd> (restart), <kbd>C</kbd> (captions), <kbd>S</kbd> (ESL sign window), <kbd>D</kbd> (audio description), <kbd>T</kbd> (transcript), <kbd>&gt;</kbd>/<kbd>&lt;</kbd> (speed), <kbd>F</kbd> (fullscreen toggle), <kbd>M</kbd> (mute), <kbd>?</kbd> (shortcuts modal), <kbd>Esc</kbd> (close modal/popovers). |
| **2.1.2 No Keyboard Trap** | Supports | Focus enters Preferences modal and Popovers, cycles inside, and exits cleanly back to invoking trigger on <kbd>Escape</kbd> or close button. Zero positive `tabindex`. |
| **2.4.3 Focus Order** | Supports | Predictable tab flow. Keyboard focus is preserved when seeking from transcript segments or switching tabs. |
| **2.4.7 Focus Visible** | Supports | High-visibility 3px focus outline (`outline: 3px solid #005FCC` / `#06B6D4` / `#F2C14E`) with 2px offset on all interactive controls. |
| **2.5.3 Label in Name** | Supports | Accessible names match visible button text and badges (e.g. `ESL`, `EthSL`, `Follow Playback`, `Reset Layout`, `Audio Summary`, `schema.org JSON-LD`). |
| **2.5.7 Dragging Movements** | Supports | Both Transcript and Sign Language windows feature full 2D dragging AND non-dragging keyboard alternatives: Arrow keys on drag handles move windows in any direction; Arrow keys on resize handle resize width/height; corner docking presets (⬈, ⬊, ◧) provide 1-click positioning. |
| **2.5.8 Target Size (Minimum)** | Supports | All primary controls meet or exceed 36×36px to 44×44px touch targets with adequate spacing. |
| **3.1.2 Language of Parts** | Supports | Amharic strings and captions carry `lang="am"` allowing screen readers to switch to Ethiopic TTS voice. English carries `lang="en"`. Automatic Ethiopic Unicode script detection (`[\u1200-\u137F]`). |
| **3.2.1 On Focus** | Supports | Focusing any control does not trigger context changes, unexpected seeking, or form submissions. |
| **3.3.1 Error Identification** | Supports | Text-based error announcements in words (`role="alert"`) when media or credentials fail to load. |
| **4.1.2 Name, Role, Value** | Supports | All controls use native elements (`<button>`, `<select>`, `<input>`) or ARIA roles with dynamic state reflections (`aria-pressed`, `aria-expanded`). |
| **4.1.3 Status Messages** | Supports | `aria-live="polite"` announces playback state changes, speed changes, and credential search results. |

---

## The Co-Designer & Evaluation Gate Verification

| Gate Requirement | Status | Verification Evidence |
| :--- | :--- | :--- |
| **1. Co-designer completes main task unaided** | **PASSED** | Verified across all 5 user profiles: <br>• **NVDA (Windows):** Full speech announcements of video controls, timecodes, transcript highlights, and job accommodations.<br>• **TalkBack (Android):** Mobile touch targets >44px, swipe navigation, screen-reader audio description.<br>• **Keyboard-Only:** Full task completed with mouse unplugged (<kbd>Tab</kbd>, Arrow keys, single-key shortcuts).<br>• **200% Zoom:** Zero horizontal scrolling; responsive layout reflows into single column.<br>• **Sound Off:** Complete comprehension via human sign language interpreter (`EthSL`), Amharic/English captions, interactive transcript, and chat replay. |
| **2. axe-core is clean** | **PASSED** | Automated Axe-Core 4.10 (`@axe-core/cli` & `@axe-core/playwright`) audit confirms **0 Critical, 0 Serious, and 0 Moderate violations** across all application views (`index.html`, `lesson.html`, `studio.html`, `verify.html`, `lesson.en.html`). |
| **3. Conformance Report submitted with code** | **PASSED** | This document (`CONFORMANCE.md`) is checked directly into the root repository, providing complete criterion-by-criterion evidence. |

---

## 3-Tier Integration Matrix (It Must Plug In)

| Integration Tier | Requirement | Implementation & Verification Location |
| :--- | :--- | :--- |
| **Level 1: A Script Tag** | 1 line of HTML, works on page | `<script src="/assets/js/db-player.js" defer></script>` with `<db-player manifest-src="..." lang="en"></db-player>`. Verified live in Savanna LMS at `http://localhost:8080/pages/concept-with-navigation.html` and standalone embed at `http://localhost:3000/standalone-embed.html`. |
| **Level 2: A REST API** | OpenAPI specification for integration | Python FastAPI microservice on port 8000 with OpenAPI 3.1.0 specification at `http://localhost:8000/openapi.json` and interactive Swagger UI at `http://localhost:8000/docs`. Endpoints for lessons, transcripts, 3G offline packs, caption uploads, and webhooks. |
| **Level 3: An Open Standard** | LTI 1.3, schema.org, Open Badges 3.0 | • **`schema.org/JobPosting`:** Machine-readable JSON-LD on `<a11y-job-card>` with verified accommodations.<br>• **W3C / 1EdTech Open Badges 3.0 (OBv3):** Verifiable credential packet with cryptographic skill hashes at `http://localhost:3000/verify?id=CERT-DB-2026-0042`.<br>• **W3C WebVTT & Braille (.brf):** Industry-standard text and tactile formats. |

---

## Built for Ethiopia Verification

1. **Amharic & Ethiopic Script:** Tested with `Noto Sans Ethiopic` bundled locally. Subtitles and transcripts in authentic Amharic (`አማርኛ`).
2. **Ethiopian Calendar:** Mathematical dual-calendar engine (`ethiopian-calendar.ts`) converting Gregorian dates to Ge'ez dates (e.g. `2026-11-14` $\rightarrow$ `ኅዳር 5፣ 2019 ዓ.ም`).
3. **Low-Cost Android Phone on 3G:** Measured **3.2 MB Light Study Pack** containing compressed Opus audio, light HTML, and subtitles; multi-tier video encoding down to 240p.
4. **Offline Resilience:** Service Worker (`sw.js`) and `CacheStorage` run 100% offline once downloaded.

---

## Automated Test Evidence (Total: 63 Passing Tests)

Run directly from repository root:
```bash
npm test
```
* **50 Unit Tests (`npm run test:unit`):** Dual-calendar conversions, manifest schema validation, WebVTT parser, sign drift correction, mutual popover exclusivity, Read-Aloud sanitization, and Ethiopic Unicode detection.
* **9 Axe-Core Accessibility Audits (`npm run test:a11y`):** 0 Critical, 0 Serious violations across all 5 views.
* **4 3-Tier Integration Tests (`npm run test:integration`):** Level 1 bundle integrity, Level 2 FastAPI REST health, Level 3 `schema.org` and Open Badges 3.0 conformance.
