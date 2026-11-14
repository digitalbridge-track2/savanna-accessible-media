# Known Limitations & Honest Disclosure

In accordance with the hackathon judging standards, the team transparently discloses known limitations and trade-offs of the current hackathon release:

1. **Demonstration Certificate Registry:**
   * The current certificate verification view (`/verify.html`) validates credentials against the bundled demonstration registry (`certificates.demo.json`). It does not yet connect to an external production Public Key Infrastructure (PKI) or blockchain ledger.
2. **Audio Description Coverage:**
   * The audio description track is provided as an alternate pre-recorded media stream (`kind="described"`). Dynamic text-to-speech description of ad-hoc video slides is not generated in real-time, preserving predictable offline reliability.
3. **Sign Language Video Sync Under Severe Drift:**
   * While drift correction resynchronizes the secondary ESL video when drift exceeds 250ms, low-end devices under heavy CPU throttling may experience a brief visual snap when catching up to the master timeline.
4. **Braille Export Format:**
   * The Braille `.brf` generator provides Grade 1 uncontracted Braille ASCII formatting for English transcripts. Full contracted Amharic Braille requires specialized linguistic translation tables and is scheduled for the post-hackathon hardening sprint.
