# Implementation Plan — Abugida Media Kit

## 1. Delivery rules

- **P0 first:** all required functionality, accessibility gate, installation evidence, and submission artifacts.
- **P1 second:** recorded live-session replay and other validated enhancements.
- **P2 last:** BRF export only when its language output is genuinely validated.
- Every milestone must end with a runnable build and recorded test results.
- Fix co-designer barriers before adding features.
- Keep one known-good demo tag. Never demonstrate an unreviewed branch.
- The static player, documents, job cards, and certificate demonstration must remain usable when the transcription API is stopped.
- Do not replace a working required feature with a more impressive optional feature.
- Do not treat transcript text alone as completion of audio description.
- Do not treat a visual PDF export as completion of tagged PDF support.
- Do not treat a hard-coded status badge as certificate verification.
- Do not claim that offline emulation proves performance on a real 3G network.
- If content production is taking too long, shorten the demo lesson rather than dropping a required accommodation.

## 2. Definition of done

A feature is done only when:

- Its acceptance criteria in `PRD.md` pass.
- Keyboard and relevant assistive-technology behavior have been checked.
- Loading, empty, error, success, and unavailable states are handled where relevant.
- Appropriate automated tests pass.
- Required manual evidence exists for capabilities automation cannot establish.
- No fake integration, fabricated result, or unsupported claim remains.
- Documentation and relevant evidence files are updated.
- The feature does not introduce a regression in another required journey.

## Milestone 0 — Confirm the brief, assets, and co-design tasks

**Owner:** Whole team  
**Priority:** P0

### Build

1. Compare these documents with the official Track 2 brief and supplied Savanna starter.
2. Update any conflicting requirement before implementation.
3. Agree on primary learner tasks with the co-designer, including lesson completion and the career/certificate journey.
4. Inspect the co-designer’s preferred device, browser, input method, and assistive technology.
5. Select one short lesson and confirm consent and licensing for all media.
6. Confirm content-production owners for:
   - Reviewed English and Amharic captions.
   - Genuine Ethiopian Sign Language media.
   - Reviewed audio-described media.
   - Semantic HTML and tagged PDF documents.
   - Prerecorded job audio summaries.
7. Confirm whether Savanna supplies real certificate-verification URLs. If not, prepare the clearly labelled standalone demonstration registry.
8. Assign component ownership and agree on repository conventions.

### Verify

- Primary task scripts exist in `evidence/manual-test-matrix.md`.
- Every requirement has an owner.
- Required assets have a realistic production path.
- P0, P1, and P2 scope is understood by the whole team.

### Exit condition

Everyone can explain the primary tasks, required scope, asset dependencies, and cut line.

## Milestone 1 — Runnable skeleton and real fixtures

**Owner:** Integration engineer and content/QA member  
**Priority:** P0

### Build

1. Create npm workspaces, the Vite demo, TypeScript, linting, and test configuration.
2. Add all npm scripts listed in `CLAUDE.md`.
3. Add design tokens and locally hosted fonts.
4. Define `lesson-manifest.schema.json`, including described sources, documents, packages, job audio, and certificate references.
5. Add one short lesson containing:
   - Main media.
   - Genuine EthSL media, or an honestly labelled development placeholder that blocks final submission until replaced.
   - Reviewed audio-described media.
   - Reviewed English and Amharic captions.
   - English and Amharic transcript content.
   - Descriptions of meaningful visuals.
   - Slides and useful alternatives.
   - Semantic HTML and tagged PDF document assets.
   - A defined light audio/text/HTML package.
6. Add clearly labelled demonstration jobs with prerecorded audio summaries.
7. Add clearly labelled demonstration certificate fixtures.
8. Render an accessible static lesson page before adding complex playback behavior.

### Verify

- `npm run build`
- `npm run validate:fixtures`
- Headings, landmarks, links, static transcript, HTML document, and job information pass keyboard review.
- Missing or malformed fixture fields produce useful validation errors.
- All referenced assets exist.
- Demonstration content is labelled.

### Exit condition

A learner can read the transcript, HTML lesson, and job information without depending on enhanced media playback.

## Milestone 2 — Accessible player vertical slice

**Owner:** Player/accessibility engineer  
**Priority:** P0

### Build

1. Implement `<a11y-media-player>` and manifest loading.
2. Add play/pause, seek, volume, playback speed, and understandable status text.
3. Add logical focus order, visible focus, zoom/reflow, and error handling.
4. Add transcript search and timestamp buttons.
5. Keep captions, elapsed time, and continuously changing status out of live regions.
6. Run the first co-designer test before polishing secondary visuals.

### Verify

- Complete the primary flow using keyboard only.
- Run an NVDA smoke test.
- Run axe against default, playing, transcript, and error states.
- Confirm timestamp buttons seek correctly without unexpected focus movement.
- Confirm all controls have meaningful accessible names.

### Exit condition

The basic lesson can be completed unaided. Otherwise, stop feature work and repair the barriers.

## Milestone 3 — Captions, Ethiopian Sign Language, and audio description

**Owners:** Player engineer, content owner, and media/offline engineer  
**Priority:** P0

### Build

1. Add Off, English, and Amharic caption selection.
2. Add curated caption sizes and color themes.
3. Persist caption preferences locally.
4. Add EthSL show/hide, position presets, sizes, and reset.
5. Implement a stacked small-screen layout where overlaying would reduce comprehension.
6. Implement sign-video synchronization, drift correction, buffering, and failure states.
7. Add the reviewed described-media source and accessible audio-description control.
8. Preserve playback position, playback rate, and play/pause intent during described-source switching where supported.
9. Ensure pointer dragging, if added, is never required.

### Verify

- Complete the lesson with sound off.
- Operate every EthSL function without a mouse.
- Enable and disable audio description using keyboard and screen reader.
- Confirm switching sources does not unexpectedly autoplay, reset playback, or lose focus.
- Test TalkBack on a physical Android device.
- Test 200% zoom and narrow-screen reflow.
- Conduct a Deaf co-designer usability and comprehension review.
- Conduct a blind co-designer review of audio-description usefulness where available.
- Verify that captions and the sign window do not obscure essential content.

### Exit condition

Required media accommodations work without drag-only interactions, screen-reader announcement flooding, or transcript-only substitution for audio description.

## Milestone 4 — Data choices, accessible documents, and offline packages

**Owner:** Media/offline engineer, with content/QA support  
**Priority:** P0

### Build

1. Implement the required light package containing audio, text transcript, and light HTML.
2. Add additional package formats only where supported by actual assets.
3. Display measured byte sizes before download.
4. Implement the same-origin service worker and document its host installation.
5. Add download progress, cancellation, completion, and failure states.
6. Store package metadata, progress, and preferences locally.
7. Handle unavailable storage, quota limits, offline reloads, and CORS failures honestly.
8. Never automatically remove a selected accommodation because the connection is slow.
9. Verify that HTML/PDF document links are semantic, descriptive, and keyboard accessible.
10. Record PDF tag-checker and manual-reading evidence.

### Verify

- Download the required light package under documented 3G throttling.
- Stop the transcription API.
- Enable airplane mode.
- Reload and complete the selected lesson journey.
- Test download cancellation and insufficient-storage behavior where practical.
- Test on a physical Android device.
- Read the tagged PDF with NVDA and inspect its tag structure.
- Test the HTML document with keyboard, NVDA, TalkBack where applicable, zoom, and axe.
- Record actual package sizes and conditions in:
  - `evidence/data-usage.md`
  - `evidence/device-network-tests.md`
  - `evidence/document-accessibility.md`

### Exit condition

The downloaded light lesson works offline after reload, both required document formats are genuinely available, and no unmeasured data-saving or document-accessibility claim appears.

## Milestone 5 — Transcript API and review studio

**Owner:** Pipeline engineer  
**Priority:** P0

### Build

1. Implement FastAPI health, transcription-job, segment-editing, review, and export routes.
2. Add SQLite persistence and Pydantic validation.
3. Add a fake ASR adapter for deterministic automated tests.
4. Add the optional local ASR adapter without making model installation part of core setup.
5. Build the studio flow:
   - Select the included sample or upload permitted media.
   - Create or load a transcription job.
   - Display honest processing and failure states.
   - Edit individual segments.
   - Play individual segments for correction.
   - Mark review completion.
   - Export VTT and JSON.
6. Provide a manual transcript/VTT import path.
7. Keep ASR output labelled as draft until human-reviewed.

### Verify

- `npm run api:test`
- `/docs` and `/openapi.json` are reachable.
- Editing a segment changes the exported result.
- ASR failure does not fabricate a transcript.
- Stopping the API does not break playback, documents, offline lessons, job audio, or the certificate demonstration.
- Upload validation rejects unsupported or oversized input.

### Exit condition

One sample can move through draft, correction, review, and export, with precomputed assets clearly labelled wherever used.

## Milestone 6 — Career Gateway, certificates, localization, and adoption artifacts

**Owner:** Integration engineer  
**Priority:** P0

### Build

1. Implement semantic `<a11y-job-card>`.
2. Add deterministic skill matching with a human-readable explanation.
3. Display accommodation sources and unknown states honestly.
4. Add prerecorded job-summary audio, native accessible controls, and equivalent text.
5. Add safely serialized `schema.org/JobPosting` JSON-LD.
6. Keep jobs available regardless of lesson completion.
7. Implement descriptive certificate links and the standalone verification view.
8. Add copy/share behavior with an accessible fallback.
9. Label demonstration verification accurately and avoid unsupported trust claims.
10. Add a tested dual-calendar presentation for at least one career or certificate date, retaining the original ISO date.
11. Produce the distributable script-tag build.
12. Add a standalone host-page example.
13. Integrate with the official Savanna starter.
14. Write installation and troubleshooting instructions for:
    - Static player.
    - Service worker.
    - Optional transcription API.
    - Manifest and fixture validation.
    - Accessible document assets.
    - Job audio summaries.
    - Certificate links and demonstration verification.
15. Add the selected root open-source `LICENSE`, `CREDITS.md`, and third-party/media notices.

### Verify

- Job cards, including audio controls, pass keyboard, 200% zoom, NVDA, and TalkBack checks.
- Job-summary audio does not autoplay and has equivalent text.
- JSON-LD parses and contains the expected fields.
- External application links do not simulate a successful submission.
- Certificate found, not-found, malformed-link, and copy/share-fallback states work.
- Demonstration certificates are labelled and never represented as cryptographically or production-issuer verified.
- Calendar conversion passes known-date tests and the ISO value remains available.
- The script-tag build works without the demo application.
- Savanna integration uses the actual supplied starter rather than a mocked screenshot.
- Licence and credit files exist and third-party assets have documented permissions.

### Exit condition

All three adoption levels work, the complete Career Gateway works, and the module has a credible open-release package.

## Milestone 7 — Full gate, security, and installation evidence

**Owner:** QA lead, with all engineers fixing regressions  
**Priority:** P0

### Build and test

1. Run co-designer tasks without coaching and record observed friction.
2. Fix and retest identified barriers.
3. Complete the manual matrix:
   - NVDA with a supported Windows browser.
   - TalkBack with Chrome on physical Android.
   - Keyboard only.
   - Sound off.
   - 200% zoom.
   - Narrow-screen reflow.
   - Forced colors.
   - Reduced motion.
   - Audio description.
   - EthSL operation and comprehension.
   - HTML and tagged PDF documents.
   - Job-summary audio.
   - Certificate verification and sharing.
   - Offline operation after reload.
4. Run axe against all important HTML UI states.
5. Inspect the PDF tag structure and perform manual NVDA reading.
6. Check upload handling, untrusted content rendering, storage behavior, certificate inputs, document metadata, and external requests.
7. Ask someone who did not write the README to perform a fresh installation.
8. Record actual results and limitations in `evidence/`.
9. Prepare the scoped WCAG 2.2 AA conformance report without overstating untested areas.

### Verify

- Zero critical or serious axe findings in tested HTML states.
- Manual testing supplements, rather than being replaced by, axe.
- Co-designer changes include observation, fix, and retest result.
- Fresh-install deviations are fixed in the README or product.
- Privacy documentation matches actual network and storage behavior.
- PDF and media-quality claims are supported by manual evidence.
- 3G emulation, real-network testing, and offline testing are clearly distinguished.
- The final report does not claim conformance for untested third-party pages or host platforms.

### Exit condition

The team can demonstrate every gate requirement and defend every claim with evidence.

## Milestone 8 — Feature freeze, release, and demonstration

**Owner:** Whole team  
**Priority:** P0

### Build

1. Freeze required features.
2. Fix only release-blocking defects.
3. Tag a known-good release.
4. Build and test from a clean checkout.
5. Keep all demo assets local.
6. Prepare a recorded backup for venue contingencies, while prioritizing the live product.
7. Rehearse the demonstration within the allotted time.

### Demonstration order

1. Problem and intended learner.
2. Script-tag embedding in an ordinary host page and the real Savanna integration.
3. Captions and EthSL with sound off.
4. Audio description and transcript navigation using assistive technology.
5. Accessible HTML and tagged PDF lesson documents.
6. Measured light-package download and airplane-mode continuation after reload.
7. Accessible related job card at 200% zoom with its audio summary.
8. Certificate-link verification and copy/share flow.
9. Co-designer changes, fresh-install evidence, device/network results, and measured package sizes.
10. Sustainability, open licence, and known limitations.

### Exit condition

Two consecutive rehearsals succeed without developer intervention or unexplained console errors.

## Milestone 9 — Optional bonuses

**Owner:** Available engineer after explicit team approval  
**Priority:** P1/P2

Proceed only if Milestones 0–8 remain green.

### P1 options

- Recorded live-session captions and searchable synchronized chat.
- Technical-term glossary for transcript reviewers.
- Additional reviewed language variants for job audio summaries.
- Additional downloadable packages or document languages.

### P2 option

- BRF export only with validated language support and output.
- Clearly label English-only BRF if Amharic output cannot be validated.
- Never substitute arbitrary character mapping for Braille translation.

### Exit condition

The bonus has its own tests and can be removed without affecting the required release.

## 3. Suggested two-day schedule

### Day one

- **Opening:** Milestone 0 with the co-designer.
- **Late morning:** Milestone 1 and the first player vertical slice.
- **Early afternoon:** Milestones 2 and 3; first unaided co-designer test.
- **Late afternoon:** Repair barriers, continue media accommodations, and begin documents and offline packages.
- **End of day:** One integrated, deployable lesson—not disconnected branches.

The pipeline engineer may develop Milestone 5 in parallel, provided fixtures and API contracts are agreed first. Content owners must produce the short reviewed media and document assets in parallel rather than waiting for the player to be finished.

### Day two

- **Morning:** Complete Milestones 4–6 in parallel.
- **Midday:** Integrate, run the complete gate matrix, and conduct fresh-install testing.
- **Early afternoon:** Milestone 7 and defect repair.
- **Feature freeze:** Milestone 8, evidence packaging, and rehearsal.
- **Remaining time only:** Milestone 9.

If required media assets are late, shorten the lesson and simplify its visual presentation. Do not substitute ASL, generated sign avatars, transcript-only audio description, or an untagged PDF.

## 4. Cut line when time is short

Cut in this order:

1. BRF and live-session replay.
2. Glossary, additional languages, and extra document/package variants.
3. Full-video and other nonessential downloadable packages; retain the required light package.
4. Decorative UI refinements.
5. Live ASR demonstration; retain import, review, export, and labelled sample outputs.
6. Optional pointer dragging and nonessential playback settings.

Never cut:

- Co-designer testing.
- Core keyboard and screen-reader operation.
- Reviewed, resizable, recolorable English and Amharic captions.
- Genuine EthSL media and required window controls.
- Actual audio description.
- Transcript alternatives.
- The required light audio/text/HTML offline package.
- Tagged PDF and semantic HTML lesson documents.
- Accessible job cards and their audio summaries.
- Verifiable certificate links.
- Real Savanna starter integration.
- Script-tag, OpenAPI, and JobPosting adoption artifacts.
- Installation documentation.
- Privacy, licensing, and known-limitations disclosure.

## 5. Submission checklist

- [ ] Production build succeeds from a clean checkout.
- [ ] Unit, browser, accessibility smoke, and API tests pass.
- [ ] Required co-designer tasks are documented with unaided results.
- [ ] NVDA, TalkBack, keyboard, sound-off, zoom, and offline tests are recorded.
- [ ] Axe reports are stored in `evidence/`.
- [ ] The WCAG 2.2 AA report states scope and known limitations honestly.
- [ ] Reviewed English and Amharic captions can be resized and recolored.
- [ ] Genuine, consented EthSL media is movable and resizable without drag-only interaction.
- [ ] Actual reviewed audio description works and is not represented by transcript text alone.
- [ ] The player works with the API stopped.
- [ ] The required light package contains audio, text, and light HTML.
- [ ] The light package works offline after a reload with networking disabled.
- [ ] Package sizes, Android device details, and 3G-throttling conditions are measured and recorded.
- [ ] Semantic HTML and genuinely tagged PDF documents are available with meaningful image descriptions.
- [ ] The PDF receives both tag/checker inspection and manual NVDA reading.
- [ ] Job accommodations are sourced or marked unknown.
- [ ] Job cards have prerecorded audio summaries, equivalent text, and accessible controls at 200% zoom.
- [ ] Certificate links resolve to an honest verification view and support copying or sharing.
- [ ] Demonstration credentials are labelled and no fake verification claim remains.
- [ ] Tested calendar presentation retains the canonical ISO date.
- [ ] Script-tag, OpenAPI, and JobPosting adoption artifacts are present.
- [ ] The official Savanna starter integration works.
- [ ] A fresh installer successfully follows the README.
- [ ] No paid API key, external CDN, analytics service, or model download is required for the core demo.
- [ ] `LICENSE`, `CREDITS.md`, licences, consent records, and third-party notices are included as applicable.
- [ ] The stable release is tagged.
- [ ] The final demonstration has been rehearsed twice.
