# CLAUDE.md — AI Working Agreement

## Read first

1. `PRD.md`: users, scope, acceptance criteria, user flows, and design tokens.
2. `ARCHITECTURE.md`: stack, schemas, API contracts, folders, and constraints.
3. `PLAN.md`: current milestone, test requirements, schedule, and cut line.
4. The official Track 2 brief and supplied Savanna starter override assumptions here; update all documents when a confirmed requirement changes.

## Mission

Build an embeddable, offline-capable accessible lesson player, accessible HTML/PDF documents, an optional transcript pipeline, accessible job cards with audio summaries, and honest certificate-verification links. Optimize for unaided co-designer task completion, easy adoption, and reproducible evidence—not feature count.

## Non-negotiable rules

### Scope and independence

- Complete P0 before P1/P2. Do not add scope without updating `PLAN.md`.
- The static player, documents, job cards, and certificate demonstration must work without Python, SQLite, FFmpeg, ASR, or a paid API.
- Integration with the official Savanna starter is P0, not optional.
- Live-session replay and BRF export must not displace required functionality.
- Never fake transcription, translation, audio description, synchronization, submission, installation, Savanna integration, certificate verification, LTI, badges, Braille support, or test results.

### Accessible interaction

- Use native semantic HTML before ARIA.
- No clickable `div`, positive `tabindex`, keyboard traps, autoplay, drag-only actions, or inaccessible custom controls.
- Do not put captions, timers, media cues, or chat replay in `aria-live` regions.
- Every shortcut needs a visible button equivalent; scope shortcuts to the player, document them, and allow them to be disabled. Avoid global character shortcuts.
- Preserve visible focus, logical focus order, zoom/reflow, reduced motion, forced colors, useful error messages, and correct `lang="en"` / `lang="am"` markup.
- Timestamp navigation and source switching must not unexpectedly move focus.
- Test complete components and flows, not only isolated controls.

### Required media accommodations

- English and Amharic demo captions must be reviewed, resizable, and recolorable.
- ASR output is a draft until human-reviewed. Transcription is not translation.
- Never generate sign-language avatars or present ASL as Ethiopian Sign Language.
- A development placeholder for EthSL blocks submission until genuine, consented media is installed.
- Audio description must be an actual reviewed audio accommodation. Transcript descriptions are additionally required but do not replace it.
- Described-source switching should preserve playback position, playback rate, and play/pause intent where supported, and must not unexpectedly autoplay.
- Do not require AI or TTS for audio description.

### Documents and offline behavior

- Provide both semantic HTML and genuinely tagged PDF lesson documents with descriptions or alternatives for meaningful images.
- A visually polished or manually tagged-looking PDF is not enough; inspect its tags and reading order and manually read it with NVDA.
- Do not claim PDF/UA conformance unless it has actually been validated.
- The required light offline package must contain audio, text transcript, and light HTML.
- Offline packages show measured sizes and preserve selected accommodations.
- Offline acceptance includes airplane mode and a reload, not merely continued playback on an already-open page.
- Record physical Android and 3G-throttling conditions honestly. Offline success is not evidence of real-world 3G performance.

### Career Gateway and certificates

- Jobs remain available regardless of lesson completion.
- Do not infer accommodations or disability status.
- Label demo jobs and accommodation sources honestly.
- Every demo job card includes prerecorded summary audio with accessible native controls and equivalent text.
- Job-summary audio must not autoplay and must remain usable at 200% zoom.
- Certificate links must lead to a real verification view or a genuine host/provider URL.
- Never render a hard-coded “Verified” state without a corresponding lookup or provider response.
- A static demonstration registry must be labelled as demonstration verification, not cryptographic or production issuer verification.
- Certificate sharing must have an accessible fallback and must not expose disability, accommodation, contact, or other unnecessary personal information.
- Keep ISO dates canonical. Any Ethiopian-calendar presentation requires tested conversion.

### Privacy, security, and release

- No analytics, advertising, fingerprinting, external CDN, or silent data transmission.
- Sanitize transcript, chat, manifest, job, and certificate content. Avoid unsafe `innerHTML`.
- Validate certificate identifiers and other URL inputs; do not introduce arbitrary URL fetching.
- Do not expose sensitive metadata in documents, public fixtures, JSON-LD, or shareable certificate URLs.
- Include the selected open-source `LICENSE`, team credits, third-party notices, and applicable media/content permissions before submission.
- Participation consent does not automatically grant permission to redistribute recordings under an open licence.
- Axe is a smoke test, not proof of WCAG conformance; retain manual AT testing.
- Axe cannot establish PDF accessibility, EthSL comprehension, or the usefulness of audio description.

## Commands

Run from the repository root unless a command documents otherwise:

```sh
npm ci
npm run dev
npm run build
npm run lint
npm run typecheck
npm run validate:fixtures
npm run test
npm run test:unit
npm run test:e2e
npm run test:a11y
npm run api:dev
npm run api:test
```

If a script is missing, add its minimal implementation to `package.json`; do not silently substitute a different stack. `npm run test` must run the automated CI suite. Manual NVDA, TalkBack, co-designer, PDF-reading, device/network, and fresh-install tests remain separate evidence.

## Code style

- TypeScript: `strict`; avoid `any`, broad enums, global state, and large components.
- Reuse schema-generated/shared types. Validate external data at system boundaries.
- Keep media synchronization, described-source switching, preferences, offline storage, certificate lookup, and UI rendering separate.
- Python: type hints, Pydantic boundaries, small services, and deterministic tests using a fake ASR adapter. Never require a real model in CI.
- CSS: use tokens from `PRD.md`; support Ethiopic text without fixed-height clipping.
- Prefer small, audited dependencies. Check licenses and avoid framework lock-in.
- Use meaningful accessible names and user-facing copy; do not expose raw exceptions.
- Keep host-specific Savanna and certificate-provider logic in thin adapters rather than the component core.
- Keep demonstration credentials and jobs explicitly marked in their fixtures.
- Do not commit secrets, uploaded learner media, large models, generated media packs, or real learner credentials.

## Evidence discipline

- Record actual commands, versions, devices, browsers, assistive technologies, and results.
- Distinguish automated, manual, emulated, and real-device/network evidence.
- Never convert “not tested” into “passed.”
- Never claim WCAG conformance solely from axe output.
- Never claim PDF accessibility solely from an automated checker.
- Never describe precomputed output as a live ASR result.
- Record measured asset/package sizes rather than estimated savings.
- Document co-designer observations, resulting changes, and retest outcomes.
- Update `evidence/known-limitations.md` whenever a limitation is deferred rather than fixed.

## Workflow and completion

1. Identify the active milestone and smallest testable change before editing.
2. Preserve existing accessible behavior; add regression tests for repaired defects.
3. Handle loading, empty, error, success, unavailable-storage, and provider-unavailable states where relevant.
4. Run relevant commands, then `npm run build` and `npm run test` before completion.
5. Update README/evidence when installation, behavior, privacy, licensing, or limitations change.
6. Never weaken or delete a test merely to make a failing implementation pass.
7. Report changed files, commands run, actual results, manual tests still required, and remaining risks.
8. Never claim a manual test was performed when it was not.
9. Keep a known-good release and do not merge optional bonuses into it without retesting the complete gate.
10. Stop and ask when a requested change conflicts with accessibility, privacy, the official brief, required P0 scope, or the static player’s independence from the backend.
