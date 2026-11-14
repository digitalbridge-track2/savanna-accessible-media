# Document Accessibility & Tagged PDF Verification

*Audit record for lesson handouts: Semantic HTML & Tagged PDF (`lesson.en.html`, `lesson.en.tagged.pdf`).*

---

## 1. Semantic HTML Handout (`lesson.en.html`)
* **Heading Hierarchy:** `<h1>` (Page Title), `<h2>` (Major Sections), `<h3>` (Figure Details). Strict logical nesting without skipping levels.
* **Text Alternatives:** All visual charts and diagrams include inline visual description blocks:  
  `[Visual Description: A horizontal flowchart showing three stages: 1. Draft Proposal, 2. Peer & Co-designer Review, 3. Hardening & Release.]`
* **Zoom & Reflow:** Tested at 200% and 400% browser zoom; layout reflows smoothly with zero horizontal scrollbar.
* **Axe-core automated result:** 0 critical, 0 serious, 0 moderate violations.

---

## 2. Tagged PDF Handout (`lesson.en.tagged.pdf`)
* **Catalog & Viewer Preferences:** Includes `/ViewerPreferences << /DisplayDocTitle true >>` ensuring document title is announced by screen readers rather than file path.
* **Document Metadata:** Verified `/Title (Digital Workplace Skills: Foundations)`, `/Author (Digital Bridge 2026)`, and `/Subject (Accessible Lesson Handout)`.
* **Tagged Content Stream:** Content stream structured into sequential text objects (`BT ... ET`) maintaining natural reading order for NVDA and Adobe Acrobat Read Out Loud.
