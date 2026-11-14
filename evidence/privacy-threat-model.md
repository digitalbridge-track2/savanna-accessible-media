# Privacy & Security Threat Model

## 1. Core Principles (Privacy by Design)

* **Zero Medical or Disability Profiling:** The system never asks learners for medical documentation, disability diagnosis, or personal trauma history.
* **Local-First Preferences:** Caption size, contrast themes, and ESL window position are stored purely in the user's browser `localStorage` and `IndexedDB`.
* **Zero Third-Party Leaks:** No external analytics (Google Analytics, Meta Pixel), no external CDNs (fonts and scripts are self-hosted), and zero cross-site tracking cookies.
* **Consent-Driven Sharing:** Job accommodation preferences and certificate links are only shared when the learner explicitly initiates a share action.

---

## 2. Threat Analysis & Mitigations

| Threat Vector | Potential Vulnerability | Mitigation in Abugida Media Kit |
| :--- | :--- | :--- |
| **XSS in Transcripts** | Malicious injection in subtitle cues or transcript JSON | Strict string escaping via `escapeHtml()` and DOM property binding (`textContent`). Never using unescaped `innerHTML`. |
| **Data Egress** | Tracking user accommodations | All preferences remain in client-side IndexedDB. Zero outbound telemetric pings. |
| **Credential Spoofing** | Fake claims of cryptographic verification | Certificate view explicitly labels demonstration registries vs real provider links; never displays a fake "Cryptographically Verified" badge. |
| **Private Data in URL** | Exposing learner identity in shared URLs | Certificate share URLs contain only opaque IDs (`certId=CERT-DB-2026-0042`) without disability or accommodation metadata. |
