# Manual Accessibility & Device Test Matrix

Evaluation record for the pass/fail gate and five scoring pillars.

| Test ID | Area / Component | Test Condition | Criteria | Result | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| M01 | Media Player | Keyboard-only | All controls reachable with visible focus; no traps | PASS | Space/Enter toggles playback |
| M02 | Media Player | NVDA (Windows) | Play/pause, captions, ESL toggles announced cleanly | PASS | ARIA labels and states verified |
| M03 | Media Player | Sound Off | Reviewed Amharic captions and EthSL video window | PASS | No clipping, high-contrast |
| M04 | Job Cards | 200% Zoom | Reflows cleanly without horizontal page scroll | PASS | Text wraps, audio control usable |
| M05 | 3G Offline Pack | Airplane Mode | Reload after download retains full lesson access | PASS | Service Worker serves cache |
