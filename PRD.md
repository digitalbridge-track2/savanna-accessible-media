# PRD — Abugida Media Kit

**Status:** Hackathon implementation baseline  
**Track:** Track 2 — Accessible Learning Media + Accessible Career Gateway  
**Primary artifacts:** Embeddable `<a11y-media-player>` and `<a11y-job-card>` web components, accessible lesson documents, and a verifiable certificate-link flow  
**Demo languages:** English and Amharic  
**Core principle:** One lesson, available in the format each learner needs, without creating a separate “accessible app.”

## 1. Problem and opportunity

Training content often assumes that learners can hear the audio, see the video, read English fluently, use a mouse, and maintain a fast connection. A lesson can therefore become unusable even when its subject matter is relevant.

Abugida Media Kit gives existing learning platforms a drop-in media experience with:

- Keyboard- and screen-reader-operable playback.
- Reviewed English and Amharic captions.
- Customizable caption size and color themes.
- Synchronized Ethiopian Sign Language interpretation.
- Human-reviewed audio description.
- Searchable transcripts with descriptions of meaningful visuals.
- Semantic HTML and genuinely tagged PDF lesson documents.
- An explicit lightweight offline package containing audio, text, and light HTML.
- Additional downloadable lesson formats where supported by real assets.
- An optional, open transcription and human-review pipeline.
- Accessible job cards with prerecorded audio summaries.
- Verifiable certificate links that learners can share with employers.

The host platform remains responsible for its overall accessibility. Our module must not introduce new barriers.

## 2. Product goals

1. A co-designer can complete the primary learner tasks without developer assistance.
2. A platform developer can embed the player using a script tag and a lesson manifest.
3. The core player, documents, job cards, and demonstration certificate verification work without a backend, paid API, account, or AI model.
4. Learners can select audio description without losing their place or access to other accommodations.
5. Learners can download a measured lightweight lesson package and continue offline on a low-cost Android device.
6. Learners can select a data format without silently losing captions, sign-language access, or another selected accommodation.
7. Generated transcripts are clearly marked as drafts until human-reviewed.
8. Related jobs and certificates remain available regardless of lesson completion.
9. Job summaries are available as prerecorded audio and equivalent text.
10. Certificate links lead to an honest verification experience and can be shared without exposing disability or other unnecessary personal information.
11. The module runs in the official Savanna starter and can also be installed on an ordinary host page.
12. The repository contains reproducible accessibility, installation, privacy, document, device/network, and data-usage evidence.

## 3. Non-goals for the hackathon

Do not build:

- A replacement LMS or job board.
- Authentication, organizations, billing, or multi-tenancy.
- A production job-application system.
- AI-generated sign-language avatars.
- ASL content presented as Ethiopian Sign Language.
- Automatic publication of unreviewed ASR captions.
- Automatic audio-description generation on the critical path. Demo audio descriptions must be authored or reviewed by people.
- A general-purpose PDF-generation or document-conversion platform.
- A production credential issuer, certificate authority, or public badge infrastructure.
- A claim that a static demonstration registry provides cryptographic proof of credential authenticity.
- LTI 1.3, Open Badges 3.0 issuance, live streaming, or a recommendation engine unless separately confirmed as necessary for the supplied starter.
- Amharic TTS as a dependency for job summaries or other critical functionality.
- BRF export unless its language output is genuinely validated.
- Support for every Ethiopian language; demonstrate English and Amharic well.
- A separate “accessible” application that replaces the platforms learners already use.

## 4. Users and jobs to be done

| User | Needs | Primary success task |
|---|---|---|
| Deaf learner | Understand a lesson with sound off | Enable reviewed captions, adjust their appearance, and use the EthSL interpretation |
| Hard-of-hearing learner | Combine audio with readable captions | Control volume, playback, and caption presentation independently |
| Blind or low-vision learner | Operate media and obtain visual context | Enable audio description, navigate controls, search the transcript, read lesson documents, and open a job card |
| Keyboard-only or motor-impaired learner | Avoid drag-only or pointer-only interactions | Reach every function with visible focus and no keyboard trap |
| Learner on a low-cost Android device or weak connection | Avoid excessive data use and interruptions | Select the measured lightweight package, download it under 3G-like conditions, and continue offline |
| Amharic-speaking learner | Learn without an English-only interface | Use natural Amharic UI, captions, and transcript content |
| Refugee, returnee, or learner with access constraints | Understand job and application requirements | Find employer-provided accommodations and alternative application information |
| Graduate sharing evidence of learning | Give an employer a usable certificate link | Open, copy or share, and independently verify a certificate link |
| Employer | Understand a shared credential without inaccessible barriers | Open the verification page and inspect issuer, credential, and status information |
| Content editor | Produce usable captions efficiently | Generate or import a draft, correct it, mark review status, and export VTT/JSON |
| Platform integrator | Adopt the module without rewriting the host | Install from documentation and provide valid lesson, job, and certificate data |
| Co-designer/judge | Verify claims | Complete tasks and inspect test evidence |

## 5. Scope and priorities

### P0 — Required for submission

#### A. Accessible media player

- No autoplay.
- Semantic buttons and labelled controls for play/pause, seek, volume, playback speed, captions, audio description, preferences, transcript, documents, downloads, and EthSL display.
- Visible focus, logical focus order, no positive `tabindex`, and no keyboard traps.
- Controls reflow at high zoom and on narrow screens.
- Touch targets are comfortably operable.
- Error states provide transcript, document, or alternative-media routes where available.
- Captions and the elapsed-time display are not `aria-live` regions.
- Shortcuts, if included, are optional, scoped to the focused player, documented, and can be disabled. Every shortcut has an equivalent visible button.
- Source or media failures do not erase the transcript or strand keyboard focus.

**Acceptance:** Primary tasks are manually tested with keyboard only, NVDA, TalkBack, 200% zoom, and sound off. Axe reports no critical or serious issues in tested states.

#### B. English and Amharic captions

- Caption choices: Off, English, አማርኛ.
- Demo tracks are human-reviewed; machine output is labelled “Draft.”
- Caption size presets from normal through large, with wrapping rather than clipping.
- Curated color themes, including light-on-dark and yellow-on-black.
- Captions do not announce continuously to screen readers.
- Preferences persist locally when storage is available.
- Amharic content uses appropriate language markup and a font supporting Ethiopic script.

**Acceptance:** A learner completes the lesson with sound off and can change caption settings without reloading.

#### C. Ethiopian Sign Language window

- Uses a genuine, consented EthSL recording; never generated or substituted content.
- Muted secondary video synchronized with the active master media timeline.
- Show/hide, four position presets, at least three sizes, and reset.
- Pointer dragging is optional and never the only positioning method.
- On small screens, the interpretation may move below the main video rather than become unreadably small.
- Sync handles play, pause, seeking, rate changes, described-source switching where supported, and reasonable drift.
- A failed sign stream produces an honest status and does not block the transcript or main lesson.

**Acceptance:** A Deaf co-designer can operate all window controls without dragging and confirms that the interpretation remains visible and understandable. Submission is blocked if genuine EthSL media is unavailable; an integration placeholder is not a completed feature.

#### D. Audio description, transcript, and visual alternatives

Provide actual audio description, not only textual descriptions.

- Supply a short, human-reviewed audio-described version of the demo lesson, using descriptions recorded into natural pauses where practical.
- Provide a clearly labelled “Audio description” control.
- The described version may be implemented as an alternate media source with the same lesson timeline.
- Switching versions preserves playback position and play/pause intent where technically supported, without unexpectedly autoplaying.
- Handle source-loading failure honestly and preserve access to the transcript and original media.
- Do not require AI, TTS, or the transcription service for described playback.
- Provide a full accessible HTML transcript adjacent to or below the player.
- Search filters transcript segments.
- Each result has a button such as “Play from 02:14.”
- Activating a result does not unexpectedly move keyboard focus.
- Speaker names and meaningful non-speech information appear where relevant.
- Important visual information also appears as reviewed text in the transcript, for example:  
  `[Visual: The Submit application button is highlighted at the bottom-right.]`
- Slide images have useful text alternatives; decorative images use empty alternatives.

**Acceptance:** A blind co-designer can locate and enable audio description, operate playback, and obtain the meaningful visual context. Transcript descriptions remain available but are not presented as a substitute for implementing the required audio-description feature.

#### E. Tagged PDF and HTML lesson documents

Provide at least one accessible document set for the demo lesson.

**HTML document:**

- Semantic headings, paragraphs, lists, links, and language markup.
- Useful image alternatives and descriptions for meaningful visuals.
- Logical reading order and keyboard operation.
- Responsive layout without horizontal page scrolling at supported zoom/reflow widths.
- No dependence on the enhanced media player.

**Tagged PDF:**

- A real tag structure, not only a visual layout or a file named “accessible.”
- Document title and language.
- Tagged headings, paragraphs, lists, and images as applicable.
- Logical reading order.
- Alternative text or descriptions for meaningful images.
- Decorative artifacts handled appropriately.
- Download link identifies the format and, where known, file size.

**Acceptance:** The PDF is inspected with an appropriate PDF accessibility/tag checker and manually read with NVDA. The HTML document passes keyboard, screen-reader, zoom, and axe checks. Do not claim PDF/UA conformance unless the relevant requirements have actually been validated.

#### F. Low-data and offline lesson packages

The required package is:

1. **Light lesson package:** audio, text transcript, and light HTML, including meaningful visual descriptions and caption assets where applicable.

Offer additional formats only when supported by actual lesson assets:

2. Text transcript, documents, and slides.
3. Sign-focused package, where a usable sign stream is available.
4. Full lesson package.

Requirements:

- Display measured file sizes before download.
- Never automatically remove a learner’s selected accommodation because the network is slow.
- Show download progress, completion, cancellation, and failure states.
- Handle unavailable storage or quota errors honestly.
- Keep progress and preferences on the device.
- Do not require the transcription API for playback, documents, or offline use.
- Test the required light package on a physical low-cost Android device where available.
- Use repeatable 3G throttling for development evidence and distinguish emulation from any real-network measurement.

**Acceptance:** After downloading, stop the API, enable airplane mode, reload, and complete the selected lesson journey. Record actual package sizes, device/browser details, and throttling conditions. Do not claim an unmeasured percentage saving or present offline success as proof of real 3G performance.

#### G. Transcript pipeline

- Accept a short media upload or use the included sample.
- Run a local/open ASR adapter when configured.
- Produce timestamped draft segments.
- Provide an editing and review interface.
- Export WebVTT and transcript JSON.
- Permit manually authored VTT/transcript assets when ASR is unavailable.
- Clearly distinguish transcription from translation and audio-description authoring.
- Precomputed sample outputs may support the demo, but must be labelled as such.

**Acceptance:** The OpenAPI documentation is reachable, one sample produces or loads a transcript, edits persist locally, and exports contain the edits. The player, documents, job cards, and certificate demonstration still work if the API is stopped.

#### H. Accessible Career Gateway

Render `<a11y-job-card>` using semantic headings, lists, links, audio controls, and plain language.

Each job card includes:

- Title, employer, location/work mode, relevant skills, deadline when known, and application instructions.
- Accommodations only when supplied by the employer or another identified source.
- Unknown accommodations marked as unknown rather than assumed.
- Deterministic skill tags and explained matches; no opaque “AI match score.”
- Valid `schema.org/JobPosting` JSON-LD for applicable demo jobs.
- Jobs available regardless of lesson completion.
- External application links that clearly identify their destination. No fake “Application submitted” state.

**Audio summary:**

- Provide a short prerecorded audio summary for each demo job.
- Use native `<audio controls>` or equivalently accessible controls.
- Do not autoplay.
- Give the player a meaningful accessible name.
- Provide equivalent adjacent text containing the same essential information.
- Include language and byte-size metadata where useful.
- Test the complete card, including audio controls, at 200% zoom and with keyboard, NVDA, and TalkBack.

**Verifiable certificate links:**

- Render descriptive certificate links associated with the learner’s shareable evidence, where supplied by the host or demonstration fixtures.
- Prefer consuming a real verification URL issued by Savanna or another host/provider.
- Provide a working standalone demonstration using clearly labelled demonstration credentials and a bundled verification registry.
- The verification view exposes relevant credential identifier, issuer, issue date, and verification status as applicable.
- Provide an accessible share or copy-link action with a fallback when Web Share is unavailable.
- A static demo must say that it verifies against demonstration data; it must not claim cryptographic or production issuer verification.
- Do not expose disability status, accommodation needs, private notes, or unnecessary learner identity information.
- Never render a hard-coded “Verified” badge without performing the corresponding lookup or consuming a genuine provider response.

#### I. Adoption, Ethiopia readiness, and evidence

- Level 1: script-tag web component.
- Level 2: transcription REST API with generated OpenAPI documentation.
- Level 3: valid JobPosting JSON-LD.
- A standalone host page demonstrating installation without the demo application.
- Mandatory integration with the official Savanna starter supplied at kickoff.
- README installation tested by someone who did not write it.
- Amharic UI/content, Ethiopic font support, and correct language markup.
- A tested dual-calendar presentation for at least one career or certificate date, retaining the original ISO date as canonical.
- Low-cost Android, 3G-throttling, offline, and actual data-usage evidence.
- WCAG test report with scope and known limitations.
- Co-designer change log and measured data-usage evidence.
- A root open-source `LICENSE`, third-party notices, media/content licensing information, and team credits.

### P1 — Only after every P0 item is green

- Recorded live-session viewer with synchronized captions and a searchable chat log.
- Chat replay must not flood an ARIA live region or steal focus.
- Small technical-term glossary in the transcript review workflow.
- Additional reviewed language variants for job audio summaries.
- Additional downloadable packages or document languages.

### P2 — Conditional bonus

- BRF export only if language support and output are validated.
- If only English BRF is validated, label it “English BRF.”
- Provide accessible Unicode Amharic HTML/text separately.
- Make line and page lengths configurable.
- Never claim that arbitrary Unicode-to-ASCII substitution is valid Amharic Braille.

## 6. Screens and app flow

### Screen A — Demo home (`/`)

Purpose: let judges and developers enter the product quickly.

Contents:

- Short product statement.
- “Open accessible lesson” primary action.
- “Open transcript studio” secondary action.
- Links to installation documentation and evidence.
- Small status note identifying demonstration data.

No long marketing page, autoplaying background media, or animated hero is required.

### Screen B — Lesson (`/lesson.html`)

Layout:

1. Breadcrumb and lesson heading.
2. Media player.
3. Transcript section.
4. Accessible HTML and tagged PDF document links.
5. Lesson formats/download section.
6. Skills covered.
7. Related accessible job cards and shareable certificate links where supplied.

#### Deaf learner flow

`Open lesson → select Amharic captions → adjust size/theme → show EthSL → move/resize EthSL → choose lesson package → continue offline`

#### Blind learner flow

`Open lesson → locate player by heading → enable audio description → operate playback → open transcript or HTML document → search a term → activate a timestamp → navigate to related jobs → inspect accommodations and application link`

#### Low-bandwidth learner flow

`Open lesson → compare measured package sizes → download the light audio/text/HTML package → go offline → resume at saved position`

#### Career-sharing flow

`Open related job card → play or read its summary → inspect skills and accommodations → open a certificate link → verify it → copy or share the link with an employer`

### Screen C — Preferences dialog/panel

- Caption language and appearance.
- Audio-description preference where supported.
- EthSL default visibility, position, and size.
- Preferred data format.
- Playback speed.
- Optional keyboard-shortcut setting.
- Reset preferences.

It is skippable, has a clear heading, returns focus to its opener, and is not required to discover basic controls.

### Screen D — Transcript studio (`/studio.html`)

`Select sample or upload media → create/load transcription job → inspect draft status → edit segments → play individual segments → mark review complete → export VTT/JSON`

Failure flow:

`ASR unavailable → explain the problem → use included transcript/import path → never display fabricated success`

### Screen E — Certificate verification (`/verify.html`)

- Accept a documented certificate identifier or verification URL.
- Load only the bundled demonstration registry or an explicitly configured host/provider source.
- Show clear loading, not-found, invalid-link, and verified-against-demo-data states.
- Use semantic headings, description lists or equivalent structures, and plain language.
- Display the original ISO date and tested secondary calendar presentation where applicable.
- Provide an accessible copy/share action without unexpectedly moving focus.
- Identify all demonstration credentials as demonstration content.

## 7. Design brief

### Visual direction

Calm, credible, warm, and highly legible. The product should look like modern learning infrastructure, not a medical or charity website. Use real Ethiopian learning and interpretation content respectfully, with consent.

### Color tokens

| Token | Value | Use |
|---|---|---|
| Canvas | `#F7F8F5` | Page background |
| Surface | `#FFFFFF` | Cards and panels |
| Ink | `#14201B` | Primary text |
| Muted ink | `#52615A` | Secondary text after contrast verification |
| Brand | `#0B5D4E` | Primary actions and active states |
| Brand hover | `#08483D` | Hover state |
| Accent | `#F2C14E` | Highlights with dark text, not small text on white |
| Focus | `#005FCC` | Visible focus indicator |
| Border | `#B7C2BB` | Dividers; stronger treatment for control boundaries where needed |

All final combinations must pass contrast testing. Support `forced-colors` rather than depending solely on these colors.

### Typography

- Locally host `Noto Sans Ethiopic` and `Atkinson Hyperlegible`, with system fallbacks.
- Body: 16px minimum, 1.5–1.7 line height.
- Use fluid heading sizes with `clamp()`, without reducing body text on mobile.
- Avoid all-caps paragraphs, thin font weights, and justified text.
- Mark language changes with `lang="en"` and `lang="am"`.

### Layout

- Maximum content width: approximately 1200px.
- Desktop: player/transcript area with a secondary column where space permits.
- Below desktop width: one logical column; transcript follows the player.
- Eight-pixel spacing rhythm, generous whitespace, rounded cards, and minimal shadows.
- No horizontal page scrolling at 320 CSS pixels or required zoom levels.
- Icon-only controls are avoided unless their accessible names and familiar meaning are clear.
- Audio, document, and certificate controls remain visible and operable at 200% zoom.

### Motion and media

- No autoplay.
- Respect `prefers-reduced-motion`.
- Animation is limited to brief state feedback and is never necessary to understand content.
- Skeletons and spinners have text equivalents and do not repeatedly announce.

## 8. Privacy and content requirements

- No analytics by default.
- No learner data is sent to the transcription service during playback.
- No paid API keys or external CDNs are required.
- Job accommodations and matching explanations are not inferred from disability status.
- Demo jobs, credentials, and testimonials are labelled as demo content.
- Public certificate URLs contain the minimum practical information and no disability or accommodation data.
- Real certificate information is displayed or shared only with the learner’s consent and according to host policy.
- Demonstration certificate verification does not claim production or cryptographic trust.
- Media, fonts, code, documents, audio summaries, and ASR models have compatible licenses.
- Co-designer images, quotations, and recordings require consent.
- Consent to participate in testing does not automatically imply consent to redistribute recordings under an open licence.

## 9. Success evidence

The submission is successful when:

- Co-designers complete agreed tasks unaided and their changes are documented.
- Axe has zero critical/serious findings in tested HTML states, supported by manual testing.
- Audio description works as an actual media accommodation and is reviewed for usefulness.
- The tagged PDF is checked for tags and manually read with NVDA; the HTML document passes its own accessibility checks.
- The required light audio/text/HTML package works after download with networking disabled.
- Actual Android/TalkBack and 3G-throttling conditions are recorded.
- The player, documents, job cards, and certificate demonstration work with the transcription API offline.
- A fresh installer follows the README without developer intervention.
- The job card, including its audio summary, passes keyboard, screen-reader, 200% zoom, and JSON-LD checks.
- Certificate links resolve to an honest verification view and can be copied or shared.
- Ethiopian-calendar presentation is tested and retains the ISO date.
- The official Savanna starter integration is demonstrated.
- The repository contains an open licence, third-party notices, and team credits.
- Known limitations are disclosed rather than hidden.

## 10. Final demonstration

1. State the problem in one sentence.
2. Show the component embedded in an ordinary host page and identify the Savanna integration.
3. Demonstrate captions and EthSL with sound off.
4. Enable audio description and demonstrate transcript navigation with assistive technology.
5. Open the accessible HTML document and tagged PDF.
6. Download the measured light package and continue in airplane mode.
7. Open an accessible related job card at 200% zoom and play its audio summary.
8. Open, verify, and copy or share a demonstration certificate link.
9. Show co-designer changes, fresh-install evidence, device/network results, and measured package sizes.
10. Explain sustainability: static player and content, optional open transcription service, no paid dependency.

Closing message:

> We did not build another special app. We built an accessible lesson and career module that the platforms learners already use can adopt.

## References

- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WAI accessible audio and video: https://www.w3.org/WAI/media/av/
- WAI audio description guidance: https://www.w3.org/WAI/media/av/description/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- WCAG PDF techniques: https://www.w3.org/WAI/WCAG22/Techniques/pdf/
- JobPosting: https://schema.org/JobPosting
