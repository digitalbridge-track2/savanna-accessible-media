# Certificate Verification & Share Flow Evidence

---

## 1. Verification Protocol
* **Query Parameter Resolution:** The `/verify.html` portal dynamically parses `?certId=...`.
* **Bundled Demonstration Registry:** Resolves against [`certificates.demo.json`](file:///apps/demo/public/certificates/certificates.demo.json).
* **Transparent Verification Status:** Displays honest status message:  
  `✓ Demonstrated Credential Verified (Bundled Demo Registry)`.  
  Never falsely claims cryptographic public-key verification or unverified third-party trust.
* **Dual-Calendar Issue Date:** Renders both canonical ISO format and Ethiopian Calendar:  
  `2026-11-14 (ህዳር 5፣ 2019 ዓ.ም)`

---

## 2. Privacy Guarantees
* **Minimum Necessary Data:** Exposes only learner display name, credential title, issuing organization, and issue date.
* **Zero Medical Data:** Strictly excludes all disability, medical, accommodation, or personal notes from the public verification payload.
* **Accessible Copy/Share:** Invokes standard `navigator.share` with automatic graceful fallback to clipboard copying without stealing focus.
