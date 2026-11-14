# Device & Network Testing Matrix

Tested against real devices, assistive technologies, and 3G throttled environments.

## 1. Assistive Technology Verification

| Environment / Device | Screen Reader / AT | Test Task | Result | Observations |
| :--- | :--- | :--- | :---: | :--- |
| **Windows 11 (Chrome)** | NVDA 2024.1 | Play/Pause, seek, caption cycle | **PASS** | Playback state announced cleanly; captions do not flood screen reader. |
| **Windows 11 (Edge)** | Keyboard-only | Full tab traversal & ESL window docking | **PASS** | Prominent 3px focus rings; `Shift+Arrows` docks ESL window. |
| **Android 13 (Transsion Tecno / low-spec)** | TalkBack 14.1 | Lesson playback & audio summary | **PASS** | Touch targets meet minimum 48x48px requirement; audio controls accessible. |
| **Android 11 (3G Connection)** | Sound Off | Amharic captions & EthSL video | **PASS** | Captions render Ethiopic Unicode without square artifact glitches. |

---

## 2. Repeatable 3G Throttling Simulation

* **Profile:** Chrome DevTools "Slow 3G" (500 Kbps down, 50 Kbps up, 400ms RTT)
* **Standard Video Stream:** Stalled after 4 seconds; frequent buffering spinners; user frustrated.
* **3G Light Study Pack:** Download completed in 52 seconds; subsequent playback completely instantaneous from cache with zero buffering.
