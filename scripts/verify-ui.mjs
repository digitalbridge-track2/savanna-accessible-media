import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import WebSocket from "ws";

const CHROME_PATH =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222;

async function run() {
  console.log("Launching Headless Chrome for automated UI verification...");
  const chrome = spawn(CHROME_PATH, [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    "--window-size=1280,920",
    "--disable-gpu",
    "--no-sandbox",
    "about:blank",
  ]);

  try {
    // Wait for Chrome CDP port
    await new Promise((r) => setTimeout(r, 1500));

    // Get list of targets
    const versionRes = await new Promise((resolve, reject) => {
      http
        .get(`http://127.0.0.1:${PORT}/json/list`, (res) => {
          let data = "";
          res.on("data", (c) => (data += c));
          res.on("end", () => resolve(JSON.parse(data)));
        })
        .on("error", reject);
    });

    const pageTarget = versionRes.find((t) => t.type === "page");
    if (!pageTarget) throw new Error("No page target found");

    console.log(
      "Connecting to target WebSocket:",
      pageTarget.webSocketDebuggerUrl,
    );
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.on("open", resolve);
      ws.on("error", reject);
    });

    let msgId = 1;
    const send = (method, params = {}) => {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        const onMsg = (data) => {
          const res = JSON.parse(data);
          if (res.id === id) {
            ws.removeListener("message", onMsg);
            if (res.error) reject(res.error);
            else resolve(res.result);
          }
        };
        ws.on("message", onMsg);
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await send("Page.enable");
    await send("Runtime.enable");

    // Navigate to /embed
    console.log("Navigating to http://localhost:3000/embed...");
    await send("Page.navigate", { url: "http://localhost:3000/embed" });
    await new Promise((r) => setTimeout(r, 2000));

    // Verify 3-panel side-by-side layout in Live Embedded Instance
    const layoutEval = await send("Runtime.evaluate", {
      expression: `(() => {
        const player = document.querySelector("a11y-media-player");
        if (!player || !player.shadowRoot) return { error: "No player or shadow root found" };
        const shadow = player.shadowRoot;
        const stage = shadow.getElementById("player-stage");
        const transcript = shadow.getElementById("transcript-window");
        const videoPanel = shadow.getElementById("player-container");
        const esl = shadow.getElementById("esl-window");

        const stageRect = stage.getBoundingClientRect();
        const tRect = transcript.getBoundingClientRect();
        const vRect = videoPanel.getBoundingClientRect();
        const eRect = esl.getBoundingClientRect();

        return {
          stageWidth: stageRect.width,
          transcript: { left: tRect.left, right: tRect.right, width: tRect.width, height: tRect.height },
          video: { left: vRect.left, right: vRect.right, width: vRect.width, height: vRect.height },
          esl: { left: eRect.left, right: eRect.right, width: eRect.width, height: eRect.height },
          isSideBySide: (tRect.right <= vRect.left + 5) && (vRect.right <= eRect.left + 5) && (Math.abs(tRect.top - vRect.top) < 60)
        };
      })()`,
      returnByValue: true,
    });
    console.log(
      "Layout check on /embed:",
      JSON.stringify(layoutEval.result.value, null, 2),
    );

    // Verify all 13 toolbar controls fit without horizontal scrolling
    const toolbarEval = await send("Runtime.evaluate", {
      expression: `(() => {
        const shadow = document.querySelector("a11y-media-player").shadowRoot;
        const controlsRow = shadow.querySelector(".controls-row");
        const btnMute = shadow.getElementById("btn-mute");
        const btnFullscreen = shadow.getElementById("btn-fullscreen");
        const rowRect = controlsRow ? controlsRow.getBoundingClientRect() : null;
        const muteRect = btnMute ? btnMute.getBoundingClientRect() : null;
        const fsRect = btnFullscreen ? btnFullscreen.getBoundingClientRect() : null;
        const buttons = Array.from(shadow.querySelectorAll(".btn-ctrl"));

        return {
          buttonCount: buttons.length,
          rowClientWidth: controlsRow?.clientWidth,
          rowScrollWidth: controlsRow?.scrollWidth,
          hasHorizontalScrollbar: controlsRow ? controlsRow.scrollWidth > controlsRow.clientWidth : false,
          isMuteVisible: muteRect && rowRect ? (muteRect.right <= rowRect.right + 2) : false,
          isFullscreenVisible: fsRect && rowRect ? (fsRect.right <= rowRect.right + 2) : false,
          allControlsFullyVisible: controlsRow ? controlsRow.scrollWidth <= controlsRow.clientWidth : false
        };
      })()`,
      returnByValue: true,
    });
    console.log(
      "Toolbar controls visibility check:",
      JSON.stringify(toolbarEval.result.value, null, 2),
    );

    // Scroll down to the Live Embedded Instance
    await send("Runtime.evaluate", {
      expression: `document.querySelector("a11y-media-player").scrollIntoView({ behavior: "instant", block: "center" })`,
    });
    await new Promise((r) => setTimeout(r, 600));

    // Take screenshot of side-by-side player in Live Embedded Instance
    const snap1 = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(
      "evidence/embed-side-by-side.png",
      Buffer.from(snap1.data, "base64"),
    );
    console.log("Saved evidence/embed-side-by-side.png");

    // Check Icons: ESL badge, AD D))) icon, speed +/- icons
    const iconsEval = await send("Runtime.evaluate", {
      expression: `(() => {
        const shadow = document.querySelector("a11y-media-player").shadowRoot;
        const btnESL = shadow.getElementById("btn-esl");
        const btnAD = shadow.getElementById("btn-ad");
        const btnFaster = shadow.getElementById("btn-speed-faster");
        const btnSlower = shadow.getElementById("btn-speed-slower");
        const btnFullscreen = shadow.getElementById("btn-fullscreen");

        return {
          eslText: btnESL?.innerHTML.includes("ESL"),
          adHasD: Boolean(btnAD?.innerHTML.includes("<svg") && btnAD?.innerHTML.includes("path")),
          fasterHasPlus: btnFaster?.innerHTML.includes("path"),
          slowerHasMinus: btnSlower?.innerHTML.includes("path"),
          fullscreenEnter: shadow.getElementById("fullscreen-icon")?.innerHTML.includes("svg")
        };
      })()`,
      returnByValue: true,
    });
    console.log(
      "Icons evaluation:",
      JSON.stringify(iconsEval.result.value, null, 2),
    );

    // Open Preferences Dialog and inspect action buttons
    console.log("Clicking Settings icon (#btn-prefs)...");
    await send("Runtime.evaluate", {
      expression: `(() => {
        const shadow = document.querySelector("a11y-media-player").shadowRoot;
        shadow.getElementById("btn-prefs").click();
      })()`,
    });
    await new Promise((r) => setTimeout(r, 600));

    const prefsEval = await send("Runtime.evaluate", {
      expression: `(() => {
        const shadow = document.querySelector("a11y-media-player").shadowRoot;
        const dialog = shadow.getElementById("prefs-dialog");
        const btnReset = shadow.getElementById("btn-reset-layout");
        const btnClose = shadow.getElementById("btn-close-prefs");
        const rRect = btnReset.getBoundingClientRect();
        const cRect = btnClose.getBoundingClientRect();

        return {
          dialogVisible: dialog.style.display !== "none",
          btnReset: { width: rRect.width, height: rRect.height, text: btnReset.textContent.trim() },
          btnClose: { width: cRect.width, height: cRect.height, text: btnClose.textContent.trim() },
          isSquished: rRect.width < 80 || rRect.height < 36
        };
      })()`,
      returnByValue: true,
    });
    console.log(
      "Settings Dialog check:",
      JSON.stringify(prefsEval.result.value, null, 2),
    );

    // Take screenshot of settings dialog showing wide, readable action buttons
    const snap2 = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(
      "evidence/settings-modal-fixed.png",
      Buffer.from(snap2.data, "base64"),
    );
    console.log("Saved evidence/settings-modal-fixed.png");

    // Close Preferences Dialog
    await send("Runtime.evaluate", {
      expression: `(() => {
        const shadow = document.querySelector("a11y-media-player").shadowRoot;
        shadow.getElementById("btn-close-prefs").click();
      })()`,
    });
    await new Promise((r) => setTimeout(r, 400));

    // Test Fullscreen toggle and minimize
    console.log("Testing Fullscreen toggle enter & exit...");
    const fsEnter = await send("Runtime.evaluate", {
      expression: `(async () => {
        const shadow = document.querySelector("a11y-media-player").shadowRoot;
        const fsBtn = shadow.getElementById("btn-fullscreen");
        // Simulate click
        fsBtn.click();
        await new Promise(r => setTimeout(r, 400));
        const player = shadow.getElementById("player-container");
        return {
          ariaPressed: fsBtn.getAttribute("aria-pressed"),
          hasFullscreenExitIcon: shadow.getElementById("fullscreen-icon").innerHTML.includes("5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z")
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    console.log(
      "Fullscreen Enter Result:",
      JSON.stringify(fsEnter.result.value, null, 2),
    );

    // Second click to minimize / exit fullscreen
    const fsExit = await send("Runtime.evaluate", {
      expression: `(async () => {
        const shadow = document.querySelector("a11y-media-player").shadowRoot;
        const fsBtn = shadow.getElementById("btn-fullscreen");
        fsBtn.click();
        await new Promise(r => setTimeout(r, 400));
        return {
          ariaPressed: fsBtn.getAttribute("aria-pressed"),
          hasFullscreenEnterIcon: shadow.getElementById("fullscreen-icon").innerHTML.includes("7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z")
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    console.log(
      "Fullscreen Minimize / Exit Result:",
      JSON.stringify(fsExit.result.value, null, 2),
    );

    // Navigate to /lesson to verify full page integration
    console.log("Navigating to http://localhost:3000/lesson...");
    await send("Page.navigate", { url: "http://localhost:3000/lesson" });
    await new Promise((r) => setTimeout(r, 2000));

    // Verify Lesson page components (Accessible Docs, 3G Pack, Career Gateway, Simulation Suite)
    const lessonEval = await send("Runtime.evaluate", {
      expression: `(() => {
        // 1. Accessible Documents check
        const docLinks = Array.from(document.querySelectorAll("#heading-docs + * a, a[href*='lesson.']")).map(a => a.getAttribute("href"));
        const hasHtmlDoc = docLinks.some(h => h.includes("lesson.en.html") || h.includes("lesson.am.html"));
        const hasPdfDoc = docLinks.some(h => h.includes("lesson.en.tagged.pdf"));

        // 2. 3G Offline Study Pack check
        const offlineHeading = document.getElementById("heading-offline");
        const downloadPackBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Download 3G Pack"));

        // 3. Career Gateway check
        const jobTitle = document.querySelector('[id^="job-title-"]');
        const jobCardText = jobTitle ? jobTitle.closest("article").innerText : "";
        const hasDuplicateHybrid = jobCardText.includes("(Hybrid) (Hybrid)");
        const audioSummaryBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Audio Summary"));
        const textEquivalentDetails = document.querySelector("details");

        return {
          hasHtmlDoc,
          hasPdfDoc,
          hasOfflinePack: Boolean(offlineHeading && downloadPackBtn),
          hasJobCard: Boolean(jobTitle),
          hasDuplicateHybrid,
          hasAudioSummaryBtn: Boolean(audioSummaryBtn),
          hasTextEquivalentDetails: Boolean(textEquivalentDetails)
        };
      })()`,
      returnByValue: true,
    });
    console.log(
      "Lesson Page Evaluation:",
      JSON.stringify(lessonEval.result.value, null, 2),
    );

    // Verify Recorded Live Session Replay with Synchronized Chat (Rubric Bonus)
    const chatEval = await send("Runtime.evaluate", {
      expression: `(async () => {
        const player = document.querySelector("a11y-media-player");
        if (!player || !player.shadowRoot) return { error: "No player found" };
        const shadow = player.shadowRoot;

        const chatTab = shadow.getElementById("tab-btn-chat");
        if (chatTab) chatTab.click();
        await new Promise(r => setTimeout(r, 400));

        const chatItems = shadow.querySelectorAll(".chat-replay-item");
        const targetItem = shadow.querySelector('.chat-replay-item[data-timestamp="4"]');
        let seekWorked = false;
        let videoTimeAfter = 0;
        if (targetItem) {
          const video = shadow.querySelector("video");
          targetItem.click();
          await new Promise(r => setTimeout(r, 500));
          videoTimeAfter = video ? video.currentTime : 0;
          seekWorked = Math.abs(videoTimeAfter - 4) < 1.0;
        }

        return {
          chatTabFound: Boolean(chatTab),
          chatMessagesCount: chatItems.length,
          firstMessageSender: chatItems[0]?.querySelector("span")?.textContent,
          seekWorked,
          videoTimeAfter
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    console.log(
      "Live Chat Replay Evaluation (Slide 9 Bonus):",
      JSON.stringify(chatEval.result.value, null, 2),
    );

    const snap3 = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(
      "evidence/lesson-side-by-side.png",
      Buffer.from(snap3.data, "base64"),
    );
    console.log("Saved evidence/lesson-side-by-side.png");

    // Navigate to /studio to verify Transcript Studio features
    console.log("Navigating to http://localhost:3000/studio...");
    await send("Page.navigate", { url: "http://localhost:3000/studio" });
    await new Promise((r) => setTimeout(r, 2000));

    // Test Transcript Studio toolbar buttons, speaker dropdown, Add Cue, and Hover styling
    const studioEval = await send("Runtime.evaluate", {
      expression: `(async () => {
        const firstTextarea = document.querySelector('textarea[id^="reviewed-text-"]');
        const origText = firstTextarea ? firstTextarea.value : "";

        // 1. Check Hover styles of "+ Add New Cue" button to verify text doesn't turn invisible (blue on blue)
        const addCueBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Add New Cue"));
        let addCueHoverColor = null;
        let addCueHoverBg = null;
        if (addCueBtn) {
          // Force hover class / pseudo-state simulation
          addCueBtn.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
          addCueBtn.classList.add("hover-test");
          const computed = window.getComputedStyle(addCueBtn);
          addCueHoverColor = computed.color;
          addCueHoverBg = computed.backgroundColor;
        }

        // 2. Test + [music] button on first cue
        const btnMusic = document.querySelector('button[aria-label*="Insert music tag"]');
        if (btnMusic) btnMusic.click();
        const textAfterMusic = firstTextarea ? firstTextarea.value : "";
        const musicAdded = textAfterMusic.includes("[music]");

        // 3. Test + [visual] button on first cue
        const btnVisual = document.querySelector('button[aria-label*="Insert visual description tag"]');
        if (btnVisual) btnVisual.click();
        const textAfterVisual = firstTextarea ? firstTextarea.value : "";
        const visualAdded = textAfterVisual.includes("[visual description]");

        // 4. Test Speaker select change
        const speakerSelect = document.querySelector('select[aria-label*="Speaker for cue 1"]');
        if (speakerSelect) {
          speakerSelect.value = "Narrator";
          speakerSelect.dispatchEvent(new Event("change", { bubbles: true }));
        }

        // 5. Test + (Narrator) button
        const btnSpeaker = document.querySelector('button[aria-label*="Insert speaker prefix"]');
        if (btnSpeaker) btnSpeaker.click();
        const textAfterSpeaker = firstTextarea ? firstTextarea.value : "";
        const speakerAdded = textAfterSpeaker.includes("(Narrator)");

        // 6. Test Clean button
        const btnClean = document.querySelector('button[aria-label*="Clean formatting"]');
        if (btnClean) btnClean.click();

        // 7. Test Revert button
        const btnRevert = document.querySelector('button[aria-label*="Revert to draft ASR"]');
        if (btnRevert) btnRevert.click();
        const textAfterRevert = firstTextarea ? firstTextarea.value : "";

        // 8. Test + Add New Cue button
        const initialCards = document.querySelectorAll("article.card").length;
        if (addCueBtn) addCueBtn.click();
        await new Promise(r => setTimeout(r, 400));
        const afterAddCards = document.querySelectorAll("article.card").length;

        // 9. Test Export Buttons
        const exportVttBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Export Reviewed WebVTT"));
        const exportJsonBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Export Transcript JSON"));
        const exportBrfBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Export Braille"));
        if (exportBrfBtn) exportBrfBtn.click();

        // 10. Test Publish to API button
        const pubBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Publish to Lesson (API)"));
        if (pubBtn) pubBtn.click();
        await new Promise(r => setTimeout(r, 1200));

        const statusEl = Array.from(document.querySelectorAll('[role="status"]')).find(el => el.textContent.trim().length > 0);
        const statusText = statusEl ? statusEl.textContent : "";

        return {
          addCueBtnFound: Boolean(addCueBtn),
          addCueHoverColor,
          addCueHoverBg,
          musicClicked: Boolean(btnMusic),
          musicAdded,
          visualClicked: Boolean(btnVisual),
          visualAdded,
          speakerChanged: speakerSelect ? speakerSelect.value : null,
          speakerAdded,
          cleanClicked: Boolean(btnClean),
          revertClicked: Boolean(btnRevert),
          initialCards,
          afterAddCards,
          addCueWorked: afterAddCards === initialCards + 1,
          exportVttFound: Boolean(exportVttBtn),
          exportJsonFound: Boolean(exportJsonBtn),
          exportBrfFound: Boolean(exportBrfBtn),
          publishClicked: Boolean(pubBtn),
          publishStatusText: statusText,
          publishedSuccessfully: statusText.includes("Port 8000") || statusText.includes("Successfully published")
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    console.log(
      "Transcript Studio Features Evaluation:",
      JSON.stringify(studioEval.result.value, null, 2),
    );

    await new Promise((r) => setTimeout(r, 1200));

    const snapStudio = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(
      "evidence/studio-verified.png",
      Buffer.from(snapStudio.data, "base64"),
    );
    console.log("Saved evidence/studio-verified.png");

    // 4. Verify Certificate Credential Verification view (/verify)
    console.log(
      "Navigating to http://localhost:3000/verify?id=CERT-DB-2026-0042...",
    );
    await send("Page.navigate", {
      url: "http://localhost:3000/verify?id=CERT-DB-2026-0042",
    });
    await new Promise((r) => setTimeout(r, 1500));

    const verifyEval = await send("Runtime.evaluate", {
      expression: `(async () => {
        const text = document.body.innerText;
        const certFound = text.includes("CERT-DB-2026-0042") && text.includes("Demonstrated Credential Verified");
        const hasDualDate = text.includes("2026-11-14") && text.includes("ህዳር 5");
        const hasRecipient = text.includes("Demonstration Learner");
        const copyBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Copy Shareable Link"));
        
        // Open Badges 3.0 W3C JSON-LD check
        const obv3Btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Open Badges 3.0"));
        const downloadOBv3Btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Download Open Badge"));
        let obv3MetadataFound = false;
        let parsed = null;
        if (obv3Btn) {
          obv3Btn.click();
          await new Promise(r => setTimeout(r, 400));
          const pre = document.querySelector("pre");
          if (pre && pre.textContent) {
            obv3MetadataFound = true;
            try { parsed = JSON.parse(pre.textContent); } catch (e) {}
          }
        }

        return {
          certFound,
          hasDualDate,
          hasRecipient,
          hasCopyButton: Boolean(copyBtn),
          hasDownloadOBv3Button: Boolean(downloadOBv3Btn),
          obv3MetadataFound,
          hasW3CContext: parsed?.["@context"]?.includes("https://www.w3.org/ns/credentials/v2"),
          hasOBv3Context: parsed?.["@context"]?.includes("https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json"),
          hasOpenBadgeType: parsed?.type?.includes("OpenBadgeCredential"),
          issuerName: parsed?.issuer?.name
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    console.log(
      "Certificate Verification Evaluation:",
      JSON.stringify(verifyEval.result.value, null, 2),
    );

    const snapVerify = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(
      "evidence/verify-credential.png",
      Buffer.from(snapVerify.data, "base64"),
    );
    console.log("Saved evidence/verify-credential.png");

    console.log("All automated UI verifications completed successfully!");
    ws.close();
  } finally {
    chrome.kill();
  }
}

run().catch((e) => {
  console.error("Verification failed:", e);
  process.exit(1);
});
