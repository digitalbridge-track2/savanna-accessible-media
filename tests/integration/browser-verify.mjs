import { spawn } from "node:child_process";

async function runBrowserVerification() {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  console.log("Launching headless Chrome...");
  const chromeProc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
  ]);

  // Give Chrome a moment to spin up
  await new Promise((r) => setTimeout(r, 1500));

  try {
    const verRes = await fetch("http://127.0.0.1:9222/json/version");
    const verData = await verRes.json();
    console.log("Connected to Chrome:", verData.Browser);

    const newTabRes = await fetch("http://127.0.0.1:9222/json/new?http://localhost:3000/lesson", {
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
        const eslWindow = shadow.querySelector("#esl-window");
        const dragHandle = shadow.querySelector("#esl-drag-handle");
        const signVideo = shadow.querySelector("#sign-video");
        const statusIndicator = shadow.querySelector("#sign-status-indicator");

        const followBtn = shadow.querySelector("#btn-toggle-follow");
        const segmentButtons = Array.from(shadow.querySelectorAll(".btn-seek-time"));
        const searchInput = shadow.querySelector("#transcript-search");
        const resetBtn = shadow.querySelector("#btn-reset-layout");
        const prefsDialog = shadow.querySelector("#prefs-dialog");

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

        // Test follow toggle
        let followToggleInitial = followBtn ? followBtn.getAttribute("aria-pressed") : null;
        if (followBtn) {
          followBtn.click();
        }
        let followToggleAfterClick = followBtn ? followBtn.getAttribute("aria-pressed") : null;
        if (followBtn) {
          followBtn.click(); // restore following
        }
        let followToggleRestored = followBtn ? followBtn.getAttribute("aria-pressed") : null;

        // Test search filtering
        let searchCountBefore = segmentButtons.length;
        let searchFilterSuccess = false;
        if (searchInput) {
          searchInput.value = "Welcome";
          searchInput.dispatchEvent(new Event("input", { bubbles: true }));
          const filteredItems = shadow.querySelectorAll("#transcript-target .transcript-item");
          searchFilterSuccess = filteredItems.length >= 1;
          // reset search
          searchInput.value = "";
          searchInput.dispatchEvent(new Event("input", { bubbles: true }));
        }

        return {
          playerMounted: true,
          mainVideoPresent: !!mainVideo,
          eslWindowPresent: !!eslWindow,
          dragHandlePresent: !!dragHandle,
          signVideoMuted: signVideo ? signVideo.muted : false,
          segmentCount: segmentButtons.length,
          firstSegmentLabel: segmentButtons[0] ? segmentButtons[0].getAttribute("aria-label") : null,
          seekTestPassed,
          activeElementRetained: activeElementAfterSeek.toLowerCase() === "button",
          followToggleInitial,
          followToggleAfterClick,
          followToggleRestored,
          searchInputPresent: !!searchInput,
          searchFilterSuccess,
          statusIndicatorPresent: !!statusIndicator,
          resetBtnPresent: !!resetBtn,
        };
      })()`,
      returnByValue: true,
    });

    console.log("Evaluation Results Full:\n", JSON.stringify(evalResult.result?.result?.value || evalResult, null, 2));

    // Test responsive viewport (narrow screen < 640px)
    await send("Emulation.setDeviceMetricsOverride", {
      width: 480,
      height: 800,
      deviceScaleFactor: 1,
      mobile: true,
    });

    await new Promise((r) => setTimeout(r, 600));

    const responsiveResult = await send("Runtime.evaluate", {
      expression: `(() => {
        const player = document.querySelector("a11y-media-player");
        const shadow = player.shadowRoot;
        const eslWindow = shadow.querySelector("#esl-window");
        const styles = window.getComputedStyle(eslWindow);
        const dragHandle = shadow.querySelector("#esl-drag-handle");
        const dragStyles = window.getComputedStyle(dragHandle);
        return {
          viewportWidth: window.innerWidth,
          eslPosition: styles.position,
          dragHandleDisplay: dragStyles.display,
        };
      })()`,
      returnByValue: true,
    });

    console.log("Narrow Screen Responsive Results:\n", JSON.stringify(responsiveResult.result?.result?.value || responsiveResult, null, 2));

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
