# Able Player Reverse-Engineering Study & Architecture Comparison

**Target Studied:** Able Player (v4.5 / `demos/video5.html` — Video with synchronized sign language from local sources)  
**Upstream Repository:** [https://github.com/ableplayer/ableplayer](https://github.com/ableplayer/ableplayer)  
**Licence:** MIT Licence (Copyright (c) 2014-2024 Able Player project)  
**Inspection Date:** 2026-11-14  
**Environment:** Chromium Headless CDP, curl network inspection, upstream Git source review (`scripts/sign.js`, `scripts/dragdrop.js`, `scripts/transcript.js`, `scripts/event.js`).

---

## 1. Executive Summary & Architectural Differences

| Dimension | Able Player (Upstream) | Abugida Media Kit (Our Player) |
| :--- | :--- | :--- |
| **Component Architecture** | jQuery plugin mutating light DOM (`$('body')`, `$ableWrapper`) | Native Web Component (`<a11y-media-player>`) with Shadow DOM encapsulation |
| **Language & Typing** | JavaScript ES6 with JSDoc annotations | Strict TypeScript (`strict: true`) across all packages |
| **Dependencies** | jQuery 3.7.1, DOMPurify, Cookie/local storage polyfills | Zero runtime framework dependencies (vanilla browser APIs) |
| **Sign Language Media** | Pop-up draggable div with secondary `<video>` | Synchronized EthSL `<video>` with 4 preset positions, 3 sizes, pointer drag, and narrow reflow |
| **Mobile / iOS Strategy** | Disables sign language on iOS (`isIOS()`) due to legacy audio policies | Muted secondary video allowing simultaneous playback on mobile & modern iOS |
| **Transcript Mechanism** | Injected `role="dialog"` popup or external container | Semantic `<section>` with auto-follow toggle, manual scroll pause, cue search, and visual descriptions |
| **Accessibility Standards** | WCAG 2.1 AA | WCAG 2.2 AA (0 critical/serious axe-core violations), bilingual EN/AM support |

---

## 2. Deep Technical Analysis by Functional Area

### A. Media Timing & Secondary Sign-Language Synchronization
* **Upstream Source:** `scripts/event.js` (`onMediaUpdateTime`), `scripts/sign.js` (`injectSignPlayerCode`).
* **Observed Behavior:**
  - The main media element serves as the single timing authority.
  - Secondary sign video is created with `muted=true` and `tabindex="-1"`.
  - Main events (`play`, `pause`, `seeking`, `ratechange`) are mirrored to the sign video.
* **Findings & Pitfalls in Upstream:**
  - In `scripts/sign.js`, sign playback is completely disabled on iOS devices (`if (this.isIOS()) return;`).
  - Drift handling in `onMediaUpdateTime` does not employ an explicit drift tolerance threshold in all playback modes, risking micro-stutters if `currentTime` is written continuously.
  - If a secondary video fails or buffers, error recovery can stall main playback if promises are unhandled.
* **Adoption in Abugida:**
  - Single master media clock maintained.
  - Muted secondary video with an explicit **250ms drift threshold** (`driftThreshold = 0.25`).
  - Drift correction only fires when `|main.currentTime - sign.currentTime| > 0.25`.
  - Asynchronous `play()` promise catchers (`signVideo.play().catch(() => {})`) to avoid unhandled promise rejection.
  - Guaranteed pause state: `signVideo` will never play if `mainVideo.paused` is true.

### B. Interactive Transcript & Following Behavior
* **Upstream Source:** `scripts/transcript.js` (`injectTranscriptArea`, `handleTranscriptLockToggle`, `scrollToCue`).
* **Observed Behavior:**
  - Highlighting active cue using `currentTime >= cue.start && currentTime <= cue.end`.
  - Auto-scroll checkbox controls whether the transcript view stays centered on the active cue.
  - **Manual Scroll Decoupling:** When a user scrolls (`mousewheel`, touch scroll) or clicks inside the transcript, auto-scroll is paused (`handleTranscriptLockToggle(false)`).
  - Clicking a cue seeks the video and starts playback (`this.seekTo(...)` + `this.playMedia()`).
  - Container-only scrolling: `div.scrollTop(cueOffset - containerOffset)` without scrolling the host document.
* **Findings & Pitfalls in Upstream:**
  - Upstream attaches `role="dialog"` and `aria-label="Transcript"` to the popup transcript, which can confuse screen readers if the user is treating it as an in-page reference document.
  - Keyboard focus management: clicking a cue can sometimes jump focus back to the media player, disorienting keyboard/screen-reader users.
* **Adoption in Abugida:**
  - Implement a visible **"Follow Playback" / "Resume Following"** toggle button with clear live state (`aria-pressed`).
  - Auto-scroll automatically pauses when the learner manually scrolls inside the transcript list, preventing auto-scroll loops and fighting the learner.
  - Semantic `<button class="btn-seek-time" aria-label="Play from MM:SS">` for every cue.
  - Activating a cue seeks to segment start, triggers playback safely, and **preserves keyboard focus** on the clicked seek button.
  - Visual highlighting (`.active`) without using `aria-live` regions (preventing screen reader verbosity).
  - Normalization of both integer millisecond timestamps (`start_ms`, `end_ms`) and fractional seconds (`start`, `end`).

### C. Movable & Resizable EthSL Window with Accessible Alternatives
* **Upstream Source:** `scripts/dragdrop.js` (`initDragDrop`, `startDrag`, `startResize`, `addWindowMenu`).
* **Observed Behavior:**
  - Upstream uses mouse/pointer drag and resize handles on window corners.
  - Accessible alternatives: A "Window options" menu button with keyboard navigation commands.
* **Findings & Pitfalls in Upstream:**
  - Dragging without viewport clamping allows windows to be dragged off-screen or out of visible viewport.
  - `role="application"` is temporarily assigned during dragging, which alters screen reader keyboard processing.
* **Adoption in Abugida:**
  - **Preset-First Accessible Design:** 4 keyboard-operable position presets (`pos-top-right`, `pos-top-left`, `pos-bottom-right`, `pos-bottom-left`) and 3 size presets (`small`, `medium`, `large`).
  - **Pointer Drag & Resize Enhancement:** Optional pointer dragging with pointer capture (`setPointerCapture`) and strict boundary clamping inside the video viewport.
  - **Zero Drag-Only Traps:** Every pointer action is mirrored by visible toolbar buttons/selects.
  - **Responsive Reflow:** On viewports `< 640px` or at 200% zoom, the window automatically docks below or stacks neatly, preventing occlusion of the main video or captions.

---

## 3. Mapping: Upstream Findings to Abugida Implementation

| Upstream Finding | Architectural Evaluation | Action in Abugida Media Kit |
| :--- | :--- | :--- |
| **Auto-scroll pause on manual scroll** | Essential UX to avoid fighting the user. | Implemented in `TranscriptViewer` with wheel/scroll/touch detection and visible "Follow/Resume" toggle. |
| **Muted secondary video for sign language** | Standard practice for HTML5 multi-stream video. | Adopted in `MediaSyncController` with 250ms drift clamping and promise rejection safety. |
| **Pop-up `role="dialog"` on transcript** | Problematic for non-modal reference reading. | Rejected; retained semantic `<section>` with fluid docked or compact reflow. |
| **Mouse-only drag handle** | Accessibility violation (WCAG 2.5.7 Dragging Movements). | Position & size presets provided as primary; pointer drag is strictly an optional enhancement. |
| **Disabling sign on iOS** | Unnecessary with modern `playsinline` and muted secondary video. | Removed device sniffing; uses feature detection and muted streams. |
| **jQuery dependency** | Violates zero-dependency and Web Component architecture. | Reimplemented using native DOM, Shadow DOM, and modern TypeScript. |
