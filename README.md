# Abugida Media Kit (አቡጊዳ ሚዲያ ኪት)

> **Track 2 — Accessible Learning Media & Accessible Career Gateway**  
> Built for the **Digital Bridge Accessibility Hackathon 2026** (ALX Ethiopia, LIWAY, SNV, Mercy Corps, AAAPD, Tomorrow is Better).

---

## What It Is

Abugida Media Kit provides open, embeddable modules for learning platforms and job boards:

1. **`<a11y-media-player>`**: Accessible, keyboard- and screen-reader-operable media player with:
   - English & Amharic captions (resizable, recolorable, contrast-tested).
   - Synchronized Ethiopian Sign Language (EthSL) window (movable, resizable, keyboard-operable).
   - Audio description (AD) audio track toggle.
   - Interactive, searchable HTML transcript with descriptions of key visual content.
   - Low-bandwidth 3G Offline Pack (audio, text transcript, and lightweight HTML).
2. **Accessible Lesson Documents**: Semantic HTML and tagged PDF study materials.
3. **`<a11y-job-card>` (Career Gateway)**:
   - 200% zoom-resilient job cards with transparent accommodation disclosures.
   - Prerecorded audio job summary with accessible native controls.
   - Verifiable certificate links (tested with standalone demo registry & Savanna LMS integration).

---

## 3-Tier Integration Architecture

- **Level 1 (Script Tag)**: `<script type="module" src=".../a11y-media-player.js"></script>` — 1 line of HTML.
- **Level 2 (REST API & OpenAPI)**: Optional local FastAPI service with interactive OpenAPI docs (`/docs`).
- **Level 3 (Open Standards)**: Valid `schema.org/JobPosting` JSON-LD microdata, standard WebVTT subtitles, and semantic web components.

---

## Quick Start (60-Minute Judge & Collaborator Setup)

### Prerequisites
- Node.js >= 18 LTS (Node v20+ recommended)
- Python >= 3.10 (optional, for transcript studio API)

### 1. Installation
```bash
git clone <repository-url>
cd abugida-media-kit
npm install
```

### 2. Run the Demo
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser:
- `/` — Demo home page & architecture overview.
- `/lesson.html` — Accessible media player, Amharic captions, EthSL, audio description, and offline download.
- `/studio.html` — Transcript studio and segment review.
- `/verify.html` — Standalone certificate verification link demo.

### 3. Automated Testing
```bash
# Run unit & validation tests
npm run test

# Validate lesson fixtures and schemas
npm run validate:fixtures

# Run accessibility smoke tests
npm run test:a11y
```

---

## Project Structure

```text
abugida-media-kit/
├── PRD.md                       # Product requirements & user stories
├── ARCHITECTURE.md              # Technical design & schema definitions
├── PLAN.md                      # Milestones, schedule, and definition of done
├── CLAUDE.md                    # AI working agreement & engineering standards
├── packages/
│   ├── lesson-schema/           # Manifest JSON Schema & validators
│   └── media-kit/               # Custom Elements (<a11y-media-player>, <a11y-job-card>)
├── apps/
│   └── demo/                    # Vite demo site (lesson, studio, verify)
├── services/
│   └── transcript-api/          # Optional local FastAPI transcription service
└── evidence/                    # Test matrices, co-designer logs, and conformance reports
```

---

## Team & Credits

- See [CREDITS.md](file:///./CREDITS.md) for full team rosters, co-designers, and partner credits.
- Licensed under the [MIT License](file:///./LICENSE).
