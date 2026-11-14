# Architecture — Abugida Media Kit

## 1. Architectural decision

The product has two independently usable parts:

1. **Static media and career kit:** Web Components, lesson manifests, media, audio description, captions, transcripts, accessible HTML/PDF documents, job data, audio summaries, demonstration certificate verification, and optional offline assets.
2. **Optional transcription service:** A local FastAPI service for ASR-assisted draft generation, correction, review, and export.

Watching or downloading a lesson, reading documents, playing a job summary, or using the demonstration certificate flow must never require Python, SQLite, FFmpeg, an ASR model, authentication, or a paid API.

## 2. Technology stack

| Area | Choice | Reason |
|---|---|---|
| Language | TypeScript with `strict` enabled | Predictable component and manifest code |
| Components | Standard Web Components with an open shadow root where appropriate | Embeddable without imposing React/Angular/Vue on hosts |
| Demo build | Vite + npm workspaces | Small, familiar static development setup |
| Styling | CSS custom properties and component-scoped CSS | Design tokens, caption themes, forced-colors support |
| Content | Versioned JSON manifest, WebVTT, static media, JSON job/certificate fixtures | Portable and inspectable |
| Audio description | Pre-authored, reviewed alternate media asset | Real accommodation without an AI/TTS dependency |
| Documents | Static semantic HTML and pre-authored tagged PDF | Meets the required formats without building a conversion platform |
| Job audio | Short prerecorded audio plus equivalent text | Predictable playback across devices and no TTS dependency |
| Certificates | Host verification URLs or a labelled static demonstration registry | Honest verifiable-link flow without becoming a credential issuer |
| Offline | Service worker + Cache Storage; IndexedDB for preferences/progress/package metadata | Explicit downloadable packages |
| API | FastAPI + Pydantic | Typed local service and generated OpenAPI docs |
| API storage | SQLite | Enough for local transcription jobs; no production server required |
| Media processing | FFmpeg and a pluggable local ASR adapter such as faster-whisper | Self-hosted option without paid API lock-in |
| Validation | JSON Schema for manifests and OpenAPI for the service | Integration errors can be detected early |
| Testing | Vitest, Playwright, `@axe-core/playwright`, pytest | Unit, browser, accessibility smoke, and API tests |
| Fonts | Locally hosted Noto Sans Ethiopic and Atkinson Hyperlegible | Ethiopic support and no third-party font request |

Pin the active Node LTS and Python versions in repository configuration. Do not use unpinned `latest` dependencies.

## 3. Component boundaries

### `<a11y-media-player>`

Attributes/properties:

- `manifest-src`: URL of the lesson manifest.
- `locale`: initial UI locale, defaulting to a documented fallback.
- `data-mode`: optional initial preference, overridden by a saved learner choice.

Responsibilities:

- Load and validate the manifest.
- Render media controls, captions, audio-description selection, EthSL controls, transcript, accessible-document links, download choices, and errors.
- Keep preferences and progress local.
- Expose only documented DOM events; never transmit learner data automatically.
- Preserve static transcript/document alternatives when enhanced media fails.

### `<a11y-job-card>`

Input:

- A validated job object or a documented job-data URL.
- Optional certificate-link data supplied by the host or demonstration fixtures.

Responsibilities:

- Render semantic job information and skill-match explanations.
- Label accommodation sources.
- Render a prerecorded audio summary and equivalent text.
- Serialize applicable JobPosting JSON-LD safely.
- Provide an honest application link or instructions.
- Render descriptive certificate verification and share/copy links when supplied.
- Keep all controls usable at 200% zoom.

### Certificate verification view

A small static demo route or host adapter:

- Resolves demonstration identifiers against bundled fixture data, or links to a host/provider verification URL.
- Handles loading, found, not-found, malformed, and unavailable states.
- Labels demonstration verification accurately.
- Does not issue credentials or claim cryptographic validation.
- Copies or shares a canonical verification URL using Web Share where available and a clipboard/manual-copy fallback otherwise.

### Host adapter

A thin host-specific module may supply manifest URLs, job/certificate data, and listen for consented progress events. Host-specific code must not leak into the player core.

## 4. Lesson data model

The canonical schema is `packages/lesson-schema/schema/lesson-manifest.schema.json`.

Top-level fields:

| Field | Purpose |
|---|---|
| `schemaVersion` | Enables future migration |
| `id`, `title`, `description` | Stable identity and localized lesson metadata |
| `language` | Default lesson language |
| `durationSeconds` | Media duration when known |
| `poster` | Poster URL and alternative text |
| `sources` | Main video, described video, audio, sign, and other media variants |
| `captionTracks` | Language, VTT URL, label, and review status |
| `transcript` | Accessible transcript JSON/HTML asset references |
| `slides` | Timestamp, image, and useful alternative text |
| `documents` | Accessible HTML and tagged PDF assets with language and size metadata |
| `packages` | Offline package contents and measured byte sizes |
| `skills` | Stable skill identifiers and localized labels |
| `relatedJobIds` | References to job fixtures; not completion gates |
| `liveSession` | Optional caption/chat replay assets |
| `exports` | Optional accessible text or validated Braille artifacts |

Important nested rules:

- Every source has an ID, kind, URL, MIME type, and byte size when known.
- Described media has an explicit source kind and identifies the main source or timeline it describes.
- Described demo media uses the same timeline as the main media unless a documented alternative mapping is implemented.
- Caption tracks use `draft`, `reviewed`, or another explicitly documented status.
- Transcript segments use integer milliseconds, stable IDs, optional speaker, text, and optional visual description.
- Documents include format, URL, language, title, and byte size where known. PDF accessibility claims are evidence, not inferred from a manifest flag.
- Offline packages list source/document IDs rather than duplicating URLs.
- The required light package explicitly includes audio, transcript text, and light HTML.
- Amharic and English labels are content, not automatically generated at runtime.
- Missing content is omitted or marked unavailable; never fabricate it.

## 5. Job and certificate data

### Job data

Each job contains:

- Stable ID, title, employer, description, location/work mode.
- Required and helpful skill IDs.
- ISO application deadline, if supplied.
- Application URL or accessible instructions.
- Accommodation entries with label, source, and verification date where known.
- An audio-summary object containing media URL, language, MIME type, equivalent text, duration, and byte size where known.
- Optional references to shareable certificate links.
- A demonstration-data marker where applicable.

The original ISO date remains canonical. Any Ethiopian-calendar presentation requires a tested conversion and must not replace the underlying date.

### Certificate data

For the standalone demo, each fixture contains:

- Stable demonstration credential ID.
- Display title.
- Demonstration issuer name.
- Issue date in ISO format.
- Canonical verification URL.
- Optional learner display name using fictitious demonstration data only.
- Explicit demonstration marker.

The verification lookup returns an honest state such as “Demonstration credential found in the bundled registry.” It must not be translated into “cryptographically valid” or “issuer verified.”

For host integration:

- Consume the provider’s verification URL and documented metadata.
- Do not require the learner to publish a certificate to apply for a job.
- Do not infer or expose disability status.
- Do not place private learner data in JSON-LD or public fixture files.

## 6. Browser storage

### IndexedDB database: `abugida-media`

| Store | Key | Contents |
|---|---|---|
| `preferences` | `global` | Caption language/theme/size, audio-description preference, EthSL layout, playback rate, data preference, shortcut setting |
| `progress` | `lessonId` | Last position, selected format, updated timestamp |
| `packages` | `lessonId:packageId` | Download state, byte size, asset manifest, timestamp |

Cache Storage contains actual downloaded assets. No disability information is collected or inferred.

If storage is unavailable, continue in memory and explain that download/resume persistence may be limited.

### Service worker

- The host installation guide includes copying the service-worker file to an appropriate same-origin scope.
- Do not claim that an arbitrary cross-origin script automatically enables offline support.
- Cache only explicit lesson packages and necessary shell assets.
- The required light package includes its audio, light HTML, transcript, and required supporting assets.
- Version caches and clean up old versions carefully.
- Large media downloads require progress, cancellation, and error handling.
- Cross-origin media must have compatible CORS behavior or be documented as unsupported for offline packaging.
- Offline behavior must be tested after a reload, not only while the original page remains open.

## 7. Media synchronization and alternate formats

The active main media element is the timing authority.

The sign-language controller:

- Mutes the secondary video.
- Responds to play, pause, seeking, and playback-rate changes.
- Checks drift periodically and corrects it beyond a small tested threshold.
- Exposes buffering and failure states without repeated screen-reader announcements.
- Does not promise frame-perfect synchronization across all networks and devices.

The audio-description controller:

- Selects a reviewed alternate media source.
- Preserves `currentTime`, playback rate, and play/pause intent where supported.
- Does not autoplay when the learner was paused.
- Restores focus predictably after a source change.
- Handles source failure without erasing the transcript or documents.
- Keeps the sign stream on the documented lesson timeline.

Caption rendering is visual and separate from transcript navigation. Do not use a live region for changing cues or timestamps.

Job-summary audio uses independent native controls and does not affect lesson playback or automatically start other media.

## 8. Documents and certificate implementation

### Accessible documents

- HTML documents are static, semantic, and independently reachable by URL.
- PDF files are authored and tagged outside the runtime player; no browser-side PDF conversion is required.
- Fixture validation checks document references and metadata, but cannot prove PDF accessibility.
- Store checker results and manual NVDA reading notes in `evidence/document-accessibility.md`.
- Do not make a PDF/UA or WCAG conformance claim based solely on an automated checker.

### Certificate verification

- Use URL-safe identifiers and parse query parameters defensively.
- Render data as text, never as untrusted HTML.
- Keep demonstration fixtures separate from any host-provided production configuration.
- Copy/share feedback is concise and does not steal focus.
- If clipboard access fails, display a selectable canonical URL and manual instructions.
- A host adapter may replace the demo lookup without changing the player or job-card core.

## 9. Optional API data model

No learner accounts, learner progress, job-summary listening history, or certificate-sharing history are stored server-side.

### `transcription_jobs`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT primary key | UUID |
| `status` | TEXT | `queued`, `processing`, `ready_for_review`, `reviewed`, `failed` |
| `source_path` | TEXT | Local generated path, never user-controlled traversal |
| `language_hint` | TEXT | Optional hint, not a guarantee |
| `model_name` | TEXT | Actual adapter/model or empty |
| `error_message` | TEXT | Safe, actionable error |
| `created_at`, `updated_at` | TEXT | UTC ISO timestamps |

### `transcript_segments`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER primary key | Stable segment identity |
| `job_id` | TEXT foreign key | Owning transcription job |
| `position` | INTEGER | Ordering |
| `start_ms`, `end_ms` | INTEGER | Timestamp boundaries |
| `draft_text` | TEXT | Original ASR output |
| `reviewed_text` | TEXT | Human correction, initially empty |
| `speaker` | TEXT | Optional |
| `review_status` | TEXT | Draft or reviewed |

Export uses reviewed text when present and never marks a whole transcript reviewed merely because ASR finished.

## 10. API routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/health` | Local service health; does not claim model readiness unless checked |
| POST | `/v1/transcription-jobs` | Upload permitted media and create a local draft job |
| GET | `/v1/transcription-jobs/{id}` | Inspect status and errors |
| GET | `/v1/transcription-jobs/{id}/segments` | Retrieve timestamped segments |
| PATCH | `/v1/transcript-segments/{id}` | Correct text and review status |
| POST | `/v1/transcription-jobs/{id}/complete-review` | Confirm human review |
| GET | `/v1/transcription-jobs/{id}/export?format=vtt` | Export reviewed WebVTT |
| GET | `/v1/transcription-jobs/{id}/export?format=json` | Export transcript JSON |

FastAPI provides `/docs` and `/openapi.json`.

For the hackathon, a simple local job runner is acceptable. It is not a durable distributed queue. Precomputed fixtures may make the demonstration reliable, provided they are labelled and the API’s actual capabilities are not exaggerated.

## 11. Repository scaffolding

```text
abugida-media-kit/
├── PRD.md
├── ARCHITECTURE.md
├── PLAN.md
├── CLAUDE.md
├── README.md
├── LICENSE
├── CREDITS.md
├── THIRD_PARTY_NOTICES.md
├── package.json
├── package-lock.json
├── tsconfig.base.json
├── playwright.config.ts
├── apps/
│   └── demo/
│       ├── index.html
│       ├── lesson.html
│       ├── studio.html
│       ├── verify.html
│       ├── public/
│       │   ├── sw.js
│       │   ├── fonts/
│       │   ├── lessons/digital-workplace/
│       │   │   ├── lesson.json
│       │   │   ├── transcript.en.json
│       │   │   ├── captions.en.vtt
│       │   │   ├── captions.am.vtt
│       │   │   ├── documents/
│       │   │   │   ├── lesson.en.html
│       │   │   │   └── lesson.en.tagged.pdf
│       │   │   └── media/
│       │   ├── jobs/
│       │   │   ├── jobs.json
│       │   │   └── audio/
│       │   └── certificates/certificates.demo.json
│       └── src/
│           ├── home.ts
│           ├── lesson.ts
│           ├── studio.ts
│           ├── verify.ts
│           └── styles/tokens.css
├── packages/
│   ├── media-kit/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── a11y-media-player.ts
│   │   │   ├── a11y-job-card.ts
│   │   │   ├── captions/
│   │   │   ├── certificates/
│   │   │   ├── localization/
│   │   │   ├── media/
│   │   │   ├── offline/
│   │   │   ├── preferences/
│   │   │   └── transcript/
│   │   └── tests/
│   └── lesson-schema/
│       ├── schema/lesson-manifest.schema.json
│       └── src/
│           ├── types.ts
│           └── validate.ts
├── services/
│   └── transcript-api/
│       ├── pyproject.toml
│       ├── app/
│       │   ├── main.py
│       │   ├── config.py
│       │   ├── db.py
│       │   ├── models.py
│       │   ├── schemas.py
│       │   ├── routes/transcriptions.py
│       │   └── services/
│       │       ├── asr/
│       │       └── exporters/
│       └── tests/
├── tests/
│   ├── e2e/
│   └── accessibility/
├── evidence/
│   ├── co-designer-changes.md
│   ├── manual-test-matrix.md
│   ├── install-test.md
│   ├── data-usage.md
│   ├── device-network-tests.md
│   ├── document-accessibility.md
│   ├── certificate-verification.md
│   ├── privacy-threat-model.md
│   └── known-limitations.md
└── scripts/
```

Do not create additional packages until a real dependency requires them. The root `LICENSE` must contain the team’s selected open-source licence before submission; media and content permissions must be documented separately where necessary.

## 12. Security and privacy

- Sanitize transcript, chat, manifest, job, and certificate content; never inject untrusted HTML.
- Generate upload filenames and validate type and size.
- Bind the unauthenticated demo API locally. A public deployment requires authentication, rate limits, retention controls, and a deployment review.
- Use an explicit CORS allowlist.
- Do not expose arbitrary filesystem paths or stack traces.
- Do not execute uploaded files.
- Document media deletion and local-storage clearing.
- No analytics, advertising, fingerprinting, or silent external requests.
- JSON-LD serialization must safely handle untrusted strings.
- Certificate lookup must not permit arbitrary URL fetching from the browser demo or server-side request forgery in a future adapter.
- Public certificate URLs and fixtures must not expose disability, accommodation, contact, or other unnecessary personal information.
- PDF and HTML document downloads must not contain hidden personal metadata or unintended comments.

## 13. Testing strategy

Automated:

- Manifest and fixture validation.
- VTT/export unit tests.
- Sync calculations and described-source state tests.
- Preference serialization tests.
- Calendar conversion tests with known dates and boundaries.
- Certificate lookup, malformed-ID, not-found, and share-fallback tests.
- Keyboard browser flows.
- Offline browser flow, including reload.
- Job audio-control and JSON-LD tests.
- API tests with a fake ASR adapter.
- Axe scans for default, preferences-open, captions-on, described-media, EthSL-on, transcript, document, error, job-card, and certificate states.

Manual:

- NVDA with a supported Windows browser.
- TalkBack with Chrome on a physical Android device.
- Keyboard only and sound off.
- 200% zoom and narrow-screen reflow.
- Forced-colors and reduced-motion checks.
- Usefulness of reviewed audio description.
- EthSL comprehension review by the relevant co-designer.
- Tagged-PDF checker inspection and NVDA reading.
- HTML document reading and navigation.
- Job-summary audio and certificate-sharing flows.
- Airplane-mode test and fresh README installation.
- Repeatable 3G throttling and actual package-size measurement.

Zero axe violations alone does not prove WCAG conformance. Axe cannot establish the accessibility of a tagged PDF, the usefulness of audio description, or the comprehensibility of EthSL content.

## 14. What could break

| Risk | Mitigation |
|---|---|
| Custom media controls introduce AT barriers | Use semantic native elements, test early with co-designers, simplify controls |
| Shadow DOM complicates focus or host integration | Keep it open, document styling, test focus across boundaries |
| Dual videos drift or buffer independently | Central sync controller, honest status, static fallback content |
| Described-source switching loses position or autoplays | Shared timeline, explicit state transfer, regression tests |
| Transcript descriptions are mistaken for audio description | Ship and demonstrate a real reviewed described-media asset |
| Amharic ASR is inaccurate | Draft labels, review UI, manual VTT path, reviewed demo content |
| Large model download breaks installation | Keep models out of core setup and use small optional samples |
| Offline media exceeds quota or fails due to CORS | Show measured sizes, handle errors, test actual browser behavior |
| Offline test passes only without reloading | Include airplane-mode reload in automated and manual tests |
| Caption/EthSL overlays obscure each other | Position presets, mobile stacked layout, user-controlled sizing |
| Fonts or captions render incorrectly | Local Ethiopic font and real-device tests |
| PDF is visually accessible but untagged | Pre-author tags, inspect structure, manually test reading order |
| Job audio autoplays or is unusable at zoom | Native controls, no autoplay, complete-card zoom testing |
| Job cards imply unsupported accommodations | Employer/source labels and explicit unknown states |
| Certificate links imply false trust | Label demo registry, use real provider URLs where available, never hard-code success |
| Calendar conversion displays the wrong date | Tested implementation, canonical ISO retention, known-date tests |
| Last-minute bonus work breaks the gate | Feature-freeze P0 before P1/P2; keep a stable release tag |

## 15. What not to over-engineer

- No React/Redux, microservices, Kubernetes, message queue, vector database, or production PostgreSQL.
- No authentication merely to store local preferences.
- No hand-built full WebVTT standard parser if a suitable audited library can be used.
- No generalized plug-in marketplace.
- No real-time collaboration in transcript review.
- No AI job recommendations.
- No runtime PDF-generation service.
- No production credential issuer or custom cryptographic badge system.
- No TTS dependency for job summaries or audio description.
- No fake LTI, badge issuance, submission, translation, verification, or Braille support.
- No Docker requirement for the static player. Docker Compose is optional convenience, not the installation baseline.
