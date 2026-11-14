import { spawn } from "node:child_process";

async function runBrowserVerification() {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  console.log("Launching headless Chrome...");
  const chromeProc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9225",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
  ]);

  // Give Chrome a moment to spin up
  await new Promise((r) => setTimeout(r, 1500));

  try {
    const verRes = await fetch("http://127.0.0.1:9225/json/version");
    const verData = await verRes.json();
    console.log("Connected to Chrome:", verData.Browser);

    const newTabRes = await fetch("http://127.0.0.1:9225/json/new?http://localhost:3000/lesson", {
      method: "PUT",
    });
    const tabData = await newTabRes.json();
    const wsUrl = tabData.webSocketDebuggerUrl;

    const ws = new WebSocket(wsUrl);

    let id = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const resolve = pending.get(msg.id);
        pending.delete(msg.id);
        resolve(msg);
      }
    };

    await new Promise((resolve) => (ws.onopen = resolve));

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++;
        pending.set(msgId, resolve);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await send("Page.enable");
    await send("Runtime.enable");

    // Wait 3.5 seconds for page, manifest, and transcripts to render
    await new Promise((r) => setTimeout(r, 3500));

    // Run evaluation script inside the page
    const evalResult = await send("Runtime.evaluate", {
      expression: `(() => {
        const player = document.querySelector("a11y-media-player");
        if (!player) return { error: "Player custom element not found" };
        const shadow = player.shadowRoot;
        if (!shadow) return { error: "ShadowRoot not found" };

        const mainVideo = shadow.querySelector("#main-video");
        const videoViewport = shadow.querySelector(".video-viewport");
        const transcriptWindow = shadow.querySelector("#transcript-window");
        const eslWindow = shadow.querySelector("#esl-window");
        const playerStage = shadow.querySelector("#player-stage");

        const transcriptDragHandle = shadow.querySelector("#transcript-drag-handle");
        const eslDragHandle = shadow.querySelector("#esl-drag-handle");
        const transcriptResizeHandle = shadow.querySelector("#transcript-resize-handle");
        const eslResizeHandle = shadow.querySelector("#esl-resize-handle");

        const signVideo = shadow.querySelector("#sign-video");
        const statusIndicator = shadow.querySelector("#sign-status-indicator");
        const cbAutoScroll = shadow.querySelector("#cb-auto-scroll");
        const selectTranscriptLang = shadow.querySelector("#select-transcript-lang");

        const segmentButtons = Array.from(shadow.querySelectorAll(".btn-seek-time"));
        const searchInput = shadow.querySelector("#transcript-search");
        const resetBtn = shadow.querySelector("#btn-reset-layout");

        // Verify that neither transcript nor esl-window is inside video-viewport
        const transcriptOutsideVideo = !videoViewport.contains(transcriptWindow);
        const eslOutsideVideo = !videoViewport.contains(eslWindow);

        // Test seeking and focus retention
        let seekTestPassed = false;
        let activeElementAfterSeek = "";
        if (segmentButtons.length > 0) {
          const firstBtn = segmentButtons[0];
          firstBtn.focus();
          firstBtn.click();
          seekTestPassed = (mainVideo.currentTime >= 0);
          activeElementAfterSeek = shadow.activeElement ? shadow.activeElement.tagName : "none";
        }

        // Test auto scroll checkbox
        let autoScrollInitial = cbAutoScroll ? cbAutoScroll.checked : null;
        if (cbAutoScroll) {
          cbAutoScroll.click();
        }
        let autoScrollAfterClick = cbAutoScroll ? cbAutoScroll.checked : null;
        if (cbAutoScroll) {
          cbAutoScroll.click(); // restore
        }

        // Test search filtering
        let searchFilterSuccess = false;
        if (searchInput) {
          searchInput.value = "Welcome";
          searchInput.dispatchEvent(new Event("input", { bubbles: true }));
          const filteredItems = shadow.querySelectorAll("#transcript-target .transcript-item");
          searchFilterSuccess = filteredItems.length >= 1;
          searchInput.value = "";
          searchInput.dispatchEvent(new Event("input", { bubbles: true }));
        }

        // Test bidirectional 2D resizing on transcript window
        const initW = transcriptWindow.offsetWidth;
        const initH = transcriptWindow.offsetHeight;

        transcriptResizeHandle.dispatchEvent(new PointerEvent("pointerdown", {
          clientX: 500,
          clientY: 500,
          bubbles: true,
          composed: true,
          pointerId: 10
        }));

        window.dispatchEvent(new PointerEvent("pointermove", {
          clientX: 560,
          clientY: 580,
          bubbles: true,
          composed: true,
          pointerId: 10
        }));

        // Allow microtask / style commit
        window.dispatchEvent(new PointerEvent("pointerup", {
          clientX: 560,
          clientY: 580,
          bubbles: true,
          composed: true,
          pointerId: 10
        }));

        // Test keyboard accessibility for resizing
        transcriptResizeHandle.focus();
        transcriptResizeHandle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
        transcriptResizeHandle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));

        const finalW = transcriptWindow.offsetWidth;
        const finalH = transcriptWindow.offsetHeight;
        const bidirectionalResizeSuccess = finalW > initW && finalH > initH;

        return {
          playerMounted: true,
          mainVideoPresent: !!mainVideo,
          transcriptWindowPresent: !!transcriptWindow,
          eslWindowPresent: !!eslWindow,
          transcriptOutsideVideo,
          eslOutsideVideo,
          transcriptDragHandlePresent: !!transcriptDragHandle,
          eslDragHandlePresent: !!eslDragHandle,
          transcriptResizeHandlePresent: !!transcriptResizeHandle,
          eslResizeHandlePresent: !!eslResizeHandle,
          bidirectionalResizeSuccess,
          signVideoMuted: signVideo ? signVideo.muted : false,
          segmentCount: segmentButtons.length,
          firstSegmentLabel: segmentButtons[0] ? segmentButtons[0].getAttribute("aria-label") : null,
          seekTestPassed,
          activeElementRetained: activeElementAfterSeek.toLowerCase() === "button",
          autoScrollInitial,
          autoScrollAfterClick,
          selectTranscriptLangPresent: !!selectTranscriptLang,
          searchInputPresent: !!searchInput,
          searchFilterSuccess,
          statusIndicatorPresent: !!statusIndicator,
          resetBtnPresent: !!resetBtn,
        };
      })()`,
      returnByValue: true,
    });

    console.log("Evaluation Results Full:\n", JSON.stringify(evalResult.result?.result?.value || evalResult, null, 2));

    ws.close();
  } finally {
    chromeProc.kill("SIGKILL");
    console.log("Chrome terminated.");
  }
}

runBrowserVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
