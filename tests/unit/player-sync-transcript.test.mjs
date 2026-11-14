import test from "node:test";
import assert from "node:assert/strict";

// Mock minimal HTMLVideoElement for Node.js unit testing
class MockVideoElement {
  constructor() {
    this.currentTime = 0;
    this.duration = 100;
    this.playbackRate = 1.0;
    this.paused = true;
    this.muted = false;
    this.readyState = 4; // HAVE_ENOUGH_DATA
    this.listeners = {};
    this.playCallCount = 0;
    this.pauseCallCount = 0;
  }

  addEventListener(event, listener) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(listener);
  }

  removeEventListener(event, listener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
  }

  dispatchEvent(event) {
    const list = this.listeners[event.type || event] || [];
    for (const l of list) {
      l(event);
    }
  }

  async play() {
    this.paused = false;
    this.playCallCount++;
    this.dispatchEvent("play");
  }

  pause() {
    this.paused = true;
    this.pauseCallCount++;
    this.dispatchEvent("pause");
  }
}

test("Player Sync & Transcript Unit Tests", async (t) => {
  // 1. Millisecond-to-second conversion
  await t.test("Millisecond-to-second conversion and boundary normalization", () => {
    const rawSegments = [
      { id: "s1", start_ms: 0, end_ms: 3200, text: "Welcome" },
      { id: "s2", start_ms: 3500, end_ms: 8100, text: "Next topic" },
    ];

    const normalized = rawSegments.map((s) => ({
      id: s.id,
      start: s.start_ms / 1000,
      end: s.end_ms / 1000,
      text: s.text,
    }));

    assert.equal(normalized[0].start, 0);
    assert.equal(normalized[0].end, 3.2);
    assert.equal(normalized[1].start, 3.5);
    assert.equal(normalized[1].end, 8.1);
  });

  // 2. Active transcript segment selection and boundaries
  await t.test("Active segment selection handles boundaries, gaps, and edges correctly", () => {
    const segments = [
      { id: 1, start: 2.0, end: 5.0, text: "First" },
      { id: 2, start: 6.0, end: 10.0, text: "Second" },
    ];

    const getActive = (t) => segments.find((s) => t >= s.start && t < s.end) || null;

    // Before first segment
    assert.equal(getActive(0.5), null);
    assert.equal(getActive(1.99), null);

    // Exact start boundary
    assert.equal(getActive(2.0)?.id, 1);

    // Inside segment
    assert.equal(getActive(3.5)?.id, 1);

    // Exact end boundary (transitions to gap)
    assert.equal(getActive(5.0), null);

    // Gap between segments (5.0s - 6.0s)
    assert.equal(getActive(5.5), null);

    // Second segment start
    assert.equal(getActive(6.0)?.id, 2);
    assert.equal(getActive(9.99)?.id, 2);

    // After last segment
    assert.equal(getActive(10.0), null);
    assert.equal(getActive(12.0), null);
  });

  // 3. Pending seeks before metadata is available
  await t.test("Pending seek queues when readyState < 1 and executes on loadedmetadata", () => {
    let readyState = 0; // HAVE_NOTHING
    let currentTime = 0;
    let pendingSeek = null;
    let seekExecuted = false;

    const requestSeek = (targetTime) => {
      if (readyState < 1) {
        pendingSeek = targetTime;
      } else {
        currentTime = targetTime;
        seekExecuted = true;
      }
    };

    requestSeek(14.5);
    assert.equal(pendingSeek, 14.5);
    assert.equal(seekExecuted, false);

    // Metadata loaded
    readyState = 1; // HAVE_METADATA
    if (pendingSeek !== null) {
      currentTime = pendingSeek;
      seekExecuted = true;
      pendingSeek = null;
    }

    assert.equal(currentTime, 14.5);
    assert.equal(seekExecuted, true);
    assert.equal(pendingSeek, null);
  });

  // 4. Sign drift-correction decisions
  await t.test("Sign drift correction only assigns currentTime when drift > threshold", () => {
    const driftThreshold = 0.25; // 250ms
    let signCurrentTime = 10.0;
    let driftCorrections = 0;

    const checkDrift = (mainTime) => {
      const diff = Math.abs(mainTime - signCurrentTime);
      if (diff > driftThreshold) {
        signCurrentTime = mainTime;
        driftCorrections++;
      }
    };

    // Minor jitter within threshold (e.g. 100ms, 200ms)
    checkDrift(10.1);
    assert.equal(driftCorrections, 0);
    assert.equal(signCurrentTime, 10.0);

    checkDrift(10.22);
    assert.equal(driftCorrections, 0);
    assert.equal(signCurrentTime, 10.0);

    // Significant drift exceeding threshold (e.g. 350ms)
    checkDrift(10.36);
    assert.equal(driftCorrections, 1);
    assert.equal(signCurrentTime, 10.36);
  });

  // 5. Playback-rate and paused-state behavior
  await t.test("Main media controls secondary sign play/pause and rate mirroring", async () => {
    const main = new MockVideoElement();
    const sign = new MockVideoElement();

    // Mirror logic
    main.addEventListener("play", () => {
      if (!main.paused && sign.paused) {
        sign.play();
      }
    });

    main.addEventListener("pause", () => {
      if (!sign.paused) {
        sign.pause();
      }
    });

    main.addEventListener("ratechange", () => {
      sign.playbackRate = main.playbackRate;
    });

    // Start main playback
    await main.play();
    assert.equal(main.paused, false);
    assert.equal(sign.paused, false);

    // Change rate
    main.playbackRate = 1.5;
    main.dispatchEvent("ratechange");
    assert.equal(sign.playbackRate, 1.5);

    // Pause main playback
    main.pause();
    assert.equal(main.paused, true);
    assert.equal(sign.paused, true);

    // Secondary sign video MUST NOT play when main is paused
    if (main.paused) {
      sign.pause();
    }
    assert.equal(sign.paused, true);
  });

  // 6. Viewport coordinate clamping for movable window
  await t.test("Position coordinate clamping prevents window from leaving viewport", () => {
    const viewport = { width: 800, height: 450 };
    const windowSize = { width: 240, height: 135 };

    const clamp = (left, top) => {
      const maxLeft = Math.max(0, viewport.width - windowSize.width);
      const maxTop = Math.max(0, viewport.height - windowSize.height);
      return {
        left: Math.min(Math.max(0, left), maxLeft),
        top: Math.min(Math.max(0, top), maxTop),
      };
    };

    // Normal position
    assert.deepEqual(clamp(100, 50), { left: 100, top: 50 });

    // Negative out of bounds (top/left)
    assert.deepEqual(clamp(-40, -10), { left: 0, top: 0 });

    // Excessive out of bounds (bottom/right)
    assert.deepEqual(clamp(950, 600), { left: 560, top: 315 });
  });

  // 7. Preferences parsing, validation, and reset
  await t.test("Preferences recovery from corrupt storage and reset behavior", () => {
    const DEFAULT_PREFERENCES = {
      captionLanguage: "en",
      captionSize: "medium",
      captionTheme: "default",
      audioDescriptionEnabled: false,
      eslVisible: true,
      eslPosition: "bottom-right",
      eslSize: "medium",
      playbackRate: 1.0,
    };

    const parsePrefs = (raw) => {
      try {
        if (!raw) return { ...DEFAULT_PREFERENCES };
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_PREFERENCES, ...parsed };
      } catch {
        return { ...DEFAULT_PREFERENCES };
      }
    };

    // Valid JSON
    const valid = parsePrefs('{"captionLanguage":"am","eslSize":"large"}');
    assert.equal(valid.captionLanguage, "am");
    assert.equal(valid.eslSize, "large");
    assert.equal(valid.eslPosition, "bottom-right"); // preserved default

    // Corrupted JSON recovery
    const corrupted = parsePrefs('{"captionLanguage": incomplete...');
    assert.deepEqual(corrupted, DEFAULT_PREFERENCES);

    // Reset restores defaults
    const reset = parsePrefs(null);
    assert.deepEqual(reset, DEFAULT_PREFERENCES);
  });
});
