# Read-Aloud Mode

Page-level read-aloud for the React demo in `apps/demo`. It uses the browser's native Web Speech API and adds no runtime dependencies.

## What it does

- Reads the element under the mouse after a **700 ms** hover, and cancels the pending read when the pointer leaves.
- Reads the element that receives keyboard focus while the user is navigating with Tab, Shift+Tab, or arrow keys.
- Extracts useful speech for headings, paragraphs, lists and list items, buttons, links, images with meaningful `alt`, form labels/values/descriptions, table headers/cells/captions, quotes, terms/definitions, and explicitly marked information cards.
- Skips hidden, empty, decorative, icon-only, and layout content. Elements inside `data-read-aloud-ignore` are never read.
- Keeps **one active utterance**. Starting a new read cancels the previous one, and late browser callbacks from an old utterance are ignored.
- Avoids repeating the same text on the same element within **2.2 s**, unless the user explicitly presses Repeat or Read current content.
- Supports English and Amharic, with localized control-panel text and speech labels.
- Stops speech when the route changes, the page is hidden, or the page is unloaded.

## Files

### New

| File | Purpose |
| :--- | :--- |
| `apps/demo/src/read-aloud/ReadAloudProvider.tsx` | React context, event delegation, hover/focus logic, dedupe, highlighting, persistence, live announcements. |
| `apps/demo/src/read-aloud/ReadAloudPanel.tsx` | Accessible launcher, control panel, status, voice selector, sliders, and keyboard handling. |
| `apps/demo/src/read-aloud/content-extractor.ts` | Target resolution, accessible-name approximation, speech text for each content type, language resolution. |
| `apps/demo/src/read-aloud/speech-engine.ts` | Web Speech wrapper: support detection, voice selection, utterance lifecycle, clamping, error handling, cleanup. |
| `apps/demo/src/read-aloud/messages.ts` | English/Amharic UI strings, speech labels, error messages, and language helpers. |
| `apps/demo/src/read-aloud/read-aloud.css` | Launcher, panel, highlight, responsive, forced-colors, reduced-motion, and print styles. |
| `tests/unit/read-aloud.test.mjs` | 30 extraction and speech-engine tests. |
| `tests/accessibility/read-aloud-panel.test.mjs` | Axe audit of the open panel in English and Amharic. |
| `tests/fixtures/read-aloud-panel-ssr.tsx` | Server-renders the open panel for the axe audit. |

### Modified

| File | Change |
| :--- | :--- |
| `apps/demo/src/App.tsx` | Wraps the app in `ReadAloudProvider`, mounts `ReadAloudPanel`, and adds `lang={locale}` to `<main>`. |
| `apps/demo/src/main.tsx` | Imports `read-aloud.css`. |
| `apps/demo/src/views/HomeView.tsx` | Marks adoption cards with `data-read-aloud="card"`. |
| `apps/demo/src/components/JobCardItem.tsx` | Marks job cards with `data-read-aloud="card"`. |
| `apps/demo/tsconfig.json` | Enables `allowImportingTsExtensions` for the read-aloud module's explicit `.ts` imports. |
| `README.md` | Links to this document. |

## How it works

1. `ReadAloudProvider` attaches delegated `pointerover`, `pointerout`, `focusin`, `keydown`, and page-lifecycle listeners at the document level. It uses `event.composedPath()` so elements inside the media player's open shadow DOM are also reachable.
2. `resolveReadableTarget()` walks outward from the event target and returns the nearest meaningful element. A link inside a paragraph reads as a link; the paragraph's padding reads as the paragraph; a card's padding reads the card.
3. `extractReadableContent()` builds a spoken string for that element, including structural context such as "Heading level 2", "List item 2 of 3", "link", "button", or "column header".
4. Hover starts a 700 ms timer. Leaving the element, moving to another target, pressing a pointer button, or disabling the feature clears the timer and stops hover speech.
5. Keyboard focus reads only after a keyboard event has been observed, so mouse clicks and touch taps do not produce a second "focus" announcement.
6. `SpeechEngine` cancels the previous utterance, creates one new `SpeechSynthesisUtterance`, and uses a generation token to ignore callbacks from replaced utterances.
7. The active element receives `data-read-aloud-active="true"` for a visible outline. For elements inside a shadow root, the matching highlight style is injected into that shadow root once.
8. Settings are saved to `localStorage` under `abugida_read_aloud_settings`. A blocked or unavailable storage API falls back to in-memory defaults.

## Controls and shortcut

- Floating **Read aloud** launcher (bottom-right) opens the settings panel.
- Independent toggles for **Enable read-aloud**, **hover reading**, and **keyboard-focus reading**.
- Buttons for **Read current content**, **Pause**, **Resume**, **Stop speech**, and **Repeat**.
- Sliders for speed (0.5×–2×), pitch (0.5–2), and volume (0–100%).
- Voice selector. "Automatic" picks a voice that matches the content language; an explicitly chosen voice is used only when its language matches.
- Shortcut: **Alt or Option + Shift + R** toggles read-aloud on or off. `Esc` closes the panel and returns focus to the launcher.
- The panel is a non-modal disclosure. Opening it does not move focus or trap the keyboard.

## Language behavior

- The nearest non-`html` `lang` attribute wins. If the text is mostly Ethiopic script but the inherited language is not Amharic, the content is treated as Amharic.
- If no explicit language is found, Ethiopic script detection is used, then the document language.
- Amharic content is **not** read with an English voice. If no Amharic voice is installed, speech is skipped and a visible/live notice explains why.
- The panel UI follows the app locale (`en` or `am`); structural speech labels follow the content language.

## Browser and voice limitations

- The Web Speech API is implemented differently across browsers. Chrome/Edge generally expose system and network voices; Safari uses macOS/iOS voices; Firefox depends on the platform speech service.
- Available voices are controlled by the operating system, not this app. Amharic voices are often absent, especially on Linux and in CI.
- Some browsers load voices asynchronously. The panel keeps a `voiceschanged` listener and offers a refresh when reopened.
- Speech may be blocked until a user gesture. The feature never reads the page automatically on load.
- Rate, pitch, and volume are requests; a voice may ignore or approximate them.
- Network voices require connectivity and may fail independently of the page.
- Headless browsers and CI cannot validate audible output. Automated tests cover extraction, engine state, and panel semantics only.
- If the browser's `cancel()` / `speak()` race drops an utterance, pressing Read current content again recovers. Behavior varies by browser version.

## Automated checks

```bash
npm run test:unit          # 37 unit tests pass
npm run test:a11y          # 9 axe tests pass
npm test                   # both suites pass
npm run build              # production build succeeds
```

The axe audit runs WCAG 2.0/2.1/2.2 A and AA tags against the static pages and against the server-rendered open panel in both locales. Result: **0 critical, 0 serious violations**.

Verified on **Node 20.12.1** (the Docker build version) and **Node 22.23.5**. The tests load the TypeScript modules through Vite, so they do not depend on newer Node type-stripping support.

## Manual test checklist

| ID | Scenario | Expected result |
| :--- | :--- | :--- |
| RA-01 | Hover a heading for less than 700 ms, then leave | Nothing is spoken. |
| RA-02 | Hover a heading for 700 ms | Heading level and text are spoken once. |
| RA-03 | Move directly from one paragraph to another | The first reading stops; the new paragraph is read after the delay. |
| RA-04 | Tab through headings, links, buttons, and fields | Each focused element is read with its role/state; no mouse click required. |
| RA-05 | Shift+Tab back through the same elements | Reading follows focus in reverse. |
| RA-06 | Turn off keyboard reading, then Tab | Focus moves silently; hover still works. |
| RA-07 | Turn off hover reading, then hover | Hover is silent; keyboard reading still works. |
| RA-08 | Press Alt/Option+Shift+R twice | Read-aloud toggles off and on; the state is announced. |
| RA-09 | Start speech, then press Pause, Resume, Stop | Playback pauses, resumes, and stops; status updates each time. |
| RA-10 | Press Repeat | The same content is read again immediately. |
| RA-11 | Change speed, pitch, volume, and voice | New readings use the chosen values. |
| RA-12 | Open the panel, press Esc | Panel closes and focus returns to the launcher. |
| RA-13 | Navigate to another route while speech is playing | Speech stops and the highlight is removed. |
| RA-14 | Hide the tab or navigate away | Speech stops. |
| RA-15 | Switch the app to Amharic and read a heading | Amharic UI and (if installed) an Amharic voice are used. |
| RA-16 | Remove all Amharic voices, then read Amharic text | No unsuitable voice is used; the missing-voice notice is shown and announced. |
| RA-17 | Use a browser without `speechSynthesis` | The panel reports unsupported; the page remains usable. |
| RA-18 | Use a screen reader with keyboard reading off | The screen reader is not doubled by the feature. |
| RA-19 | Zoom to 200% / use a 320 px viewport | Launcher and panel remain reachable and do not cause horizontal page scrolling. |
| RA-20 | Enable forced colors or reduced motion | Highlight and panel remain visible; no motion/transition dependency. |
| RA-21 | Hover a card's empty padding | The card summary is read; hovering a link inside reads the link. |
| RA-22 | Load the page | Nothing is read automatically. |

## Known issues and remaining limitations

- **Not manually validated here:** audible output, real system voices, NVDA/JAWS/VoiceOver/TalkBack behavior, and mobile browsers were not available in this environment. Those rows above still require a human pass.
- The automated axe run covers rendered semantics, not speech quality or timing.
- Mixed-language strings without a `lang` attribute rely on a majority-Ethiopic heuristic. Adding `lang="am"` to Amharic passages remains the most reliable fix.
- Some existing views contain mixed English/Amharic labels; `main` carries the app locale, so inherited language can be approximate for those strings.
- The feature intentionally does not read the whole page. Users who want continuous reading should use their screen reader's browse mode.
- Pre-existing TypeScript errors outside this feature remain: `NavLink` does not accept `style` in `HomeView.tsx`, and `OfflineStorageManager.savePackage` is missing in `LessonView.tsx`. `npm run typecheck` still reports only those three errors.
