# WCAG 2.2 AA Conformance Report

**Module:** Abugida Media Kit (`<db-player>` / `<a11y-media-player>`)  
**Track:** Track 2 — Accessible Learning Media & Career Gateway  
**Evaluation Standard:** Web Content Accessibility Guidelines (WCAG) 2.2 Level AA  
**Date:** 14 November 2026 (ኅዳር 5፣ 2019 ዓ.ም)  
**Starter Host:** `savanna/pages/concept-with-navigation.html` and `demo/blank.html`

---

## Conformance Matrix

| WCAG 2.2 AA Criterion | Supports / Partly / Does not | Technical Notes & Implementation Details |
| :--- | :--- | :--- |
| **1.1.1 Non-text Content** | Supports | Every icon button has an accessible name (`aria-label`) and tooltip. Icons carry `aria-hidden="true"`. Sign language status announced. Visual descriptions embedded in transcripts. |
| **1.2.1 Audio-only & Video-only** | Supports | Standalone transcripts provided for audio clips. Full Ethiopian Sign Language video stream provided for video content. |
| **1.2.2 Captions (Prerecorded)** | Supports | Custom client-rendered captions overlay from WebVTT in English (`lesson.en.vtt`) and reviewed Amharic (`lesson.am.vtt`). Not reliant on un-stylable native browser captions. |
| **1.2.3 Audio Description or Media Alternative** | Supports | Integrated audio description toggle (`[D)))]` button) switches to described stream with spoken slide descriptions. |
| **1.2.5 Audio Description (Prerecorded)** | Supports | Prerecorded audio description track provided for all visual slide transitions. |
| **1.3.1 Info and Relationships** | Supports | Semantic HTML elements throughout (`<button>`, `<video>`, `<dialog>`, `<input type="range">`, `<select>`). Live regions (`role="status"`, `aria-live="polite"`) for cue updates. |
| **1.3.2 Meaningful Sequence** | Supports | Logical DOM and reading order: Header/Options -> Scrubber -> Playback cluster -> Speed/CC/Sign cluster -> Settings/Fullscreen cluster. |
| **1.4.1 Use of Color** | Supports | Active toggle states indicated by both color and `aria-pressed="true"` attributes. Transcript highlights use background tint plus focus outlines. |
| **1.4.3 Contrast (Minimum)** | Supports | Text achieves at least 4.5:1 against backgrounds. Control icons and borders achieve >3:1. High contrast caption themes available (Yellow-on-Black: 19.5:1, White-on-Black: 21:1). |
| **1.4.4 Resize Text** | Supports | Tested and verified at 200% browser zoom with zero clipping, overlapping, or horizontal viewport overflow. |
| **1.4.10 Reflow** | Supports | Responsive stage reflows seamlessly to vertical stack on screens narrower than 880px and down to 320px phone viewports without horizontal scrolling. |
| **1.4.11 Non-text Contrast** | Supports | Scrubbers, window resize grips, and focus rings exceed 3:1 against adjacent backgrounds. |
| **2.1.1 Keyboard** | Supports | 100% of player features operate via keyboard: <kbd>Space</kbd>/<kbd>K</kbd> (play/pause), <kbd>J</kbd>/<kbd>L</kbd> or <kbd>←</kbd>/<kbd>→</kbd> (seek 5s), <kbd>0</kbd>/<kbd>Home</kbd> (restart), <kbd>C</kbd> (captions), <kbd>S</kbd> (ESL sign window), <kbd>D</kbd> (audio description), <kbd>T</kbd> (transcript), <kbd>&gt;</kbd>/<kbd>&lt;</kbd> (speed), <kbd>F</kbd> (fullscreen toggle), <kbd>M</kbd> (mute), <kbd>Esc</kbd> (close modal). |
| **2.1.2 No Keyboard Trap** | Supports | Focus enters Preferences modal, cycles inside, and exits cleanly back to invoking trigger on <kbd>Escape</kbd> or Save & Close. |
| **2.4.3 Focus Order** | Supports | Predictable tab flow. Keyboard focus is preserved when seeking from transcript segments. |
| **2.4.7 Focus Visible** | Supports | High-visibility 3px focus outline (`outline: 3px solid #005FCC` / `#F2C14E`) with 2px offset on all interactive controls. |
| **2.5.3 Label in Name** | Supports | Accessible names match visible button text and badges (e.g. `ESL`, `EthSL`, `Follow Playback`, `Reset Layout`). |
| **2.5.7 Dragging Movements** | Supports | Both Transcript and Sign Language windows feature full 2D dragging AND non-dragging keyboard alternatives: Arrow keys on drag handles move windows in any direction; Arrow keys on resize handle resize width/height; double-click or Reset Layout button re-docks windows. |
| **2.5.8 Target Size (Minimum)** | Supports | All primary controls meet or exceed 36×36px to 44×44px touch targets with adequate spacing. |
| **3.1.2 Language of Parts** | Supports | Amharic strings and captions carry `lang="am"` allowing screen readers to switch to Ethiopic TTS voice. English carries `lang="en"`. |
| **3.2.1 On Focus** | Supports | Focusing any control does not trigger context changes, unexpected seeking, or form submissions. |
| **3.3.1 Error Identification** | Supports | Text-based error announcements in words (`role="alert"`) when media or credentials fail to load. |
| **4.1.2 Name, Role, Value** | Supports | All controls use native elements (`<button>`, `<select>`) or ARIA roles with dynamic state reflections (`aria-pressed`, `aria-expanded`). |
| **4.1.3 Status Messages** | Supports | `aria-live="polite"` announces playback state changes, speed changes, and credential search results. |

---

## Evaluation & Testing Sign-Off

- **Testing Tools Used:**
  - Automated Axe-Core 4.10.3 (`@axe-core/cli`) audit: **0 critical, 0 serious violations** across all application views and standalone host pages.
  - Headless Chrome DevTools Protocol (CDP) automated UI verification script (`scripts/verify-ui.mjs`).
  - Screen Reader verification: NVDA on Windows and TalkBack on Android 13.
  - Manual keyboard testing with mouse unplugged (tabbing, arrow navigation, shortcuts).
  - High-zoom testing: 200% and 300% zoom at 1280px and 320px viewport widths.
  - Sound-off verification: Visual subtitle cues (`[music]`, `[visual slide title]`) ensure 100% meaning comprehension without audio.
- **Tested By:** Co-design team and engineers, Track 2 (Accessible Learning Media).
- **Known Limitations & Host Environment Notes:**
  - In `file://` protocol origins, browser cross-origin restrictions block local WebVTT and media file access. As documented in Section 2, the module must be served over `http://localhost:...` or HTTPS tunnels (`cloudflared` / `ngrok`).
  - Amharic Text-to-Speech (TTS) availability varies by phone vendor; pre-recorded audio summaries are bundled in the offline pack as an offline fallback.
