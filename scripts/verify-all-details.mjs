import WebSocket from "ws";
import http from "node:http";
import fs from "node:fs";
import { spawn } from "node:child_process";

async function verifyAll() {
  console.log("Starting comprehensive UI and feature verification on http://localhost:3000/lesson...");

  const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
    "--headless=new",
    "--remote-debugging-port=9227",
    "--window-size=1280,960",
    "--disable-gpu",
    "--no-sandbox",
    "about:blank"
  ]);

  try {
    await new Promise((r) => setTimeout(r, 1500));
    const targets = await new Promise((res, rej) => {
      http.get("http://127.0.0.1:9227/json/list", (r) => {
        let d = "";
        r.on("data", (c) => (d += c));
        r.on("end", () => res(JSON.parse(d)));
      }).on("error", rej);
    });

    const page = targets.find((t) => t.type === "page");
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((r) => ws.on("open", r));

    let id = 1;
    const send = (m, p = {}) =>
      new Promise((res) => {
        const cur = id++;
        const fn = (d) => {
          const msg = JSON.parse(d);
          if (msg.id === cur) {
            ws.off("message", fn);
            res(msg.result);
          }
        };
        ws.on("message", fn);
        ws.send(JSON.stringify({ id: cur, method: m, params: p }));
      });

    await send("Page.enable");
    await send("Runtime.enable");
    await send("Page.navigate", { url: "http://localhost:3000/lesson" });
    await new Promise((r) => setTimeout(r, 2000));

    // 1. Verify Player Layout & Controls Bar
    console.log("\n--- Checking Feature 4: Video Player & Controls Bar ---");
    const playerCheck = await send("Runtime.evaluate", {
      expression: `(() => {
        const player = document.querySelector("a11y-media-player");
        if (!player || !player.shadowRoot) return { error: "Player custom element not mounted" };
        const shadow = player.shadowRoot;
        const panel = shadow.getElementById("player-container");
        const row = shadow.querySelector(".controls-row");
        const buttons = Array.from(shadow.querySelectorAll(".btn-ctrl"));
        const btnMute = shadow.getElementById("btn-mute");
        const btnFs = shadow.getElementById("btn-fullscreen");
        const btnPrefs = shadow.getElementById("btn-prefs");

        const rRect = row.getBoundingClientRect();
        const mRect = btnMute.getBoundingClientRect();
        const fRect = btnFs.getBoundingClientRect();
        const pRect = btnPrefs.getBoundingClientRect();

        return {
          panelWidth: panel.clientWidth,
          panelMaxWidth: getComputedStyle(panel).maxWidth,
          rowClientWidth: row.clientWidth,
          rowScrollWidth: row.scrollWidth,
          hasHorizontalScrollbar: row.scrollWidth > row.clientWidth,
          buttonCount: buttons.length,
          allButtons: buttons.map(b => b.id || b.getAttribute("aria-label")),
          isPrefsVisible: pRect.right <= rRect.right + 2,
          isFullscreenVisible: fRect.right <= rRect.right + 2,
          isMuteVisible: mRect.right <= rRect.right + 2,
          distanceMuteToRightEdge: Math.round(rRect.right - mRect.right)
        };
      })()`,
      returnByValue: true
    });
    console.log("Player Check Results:", JSON.stringify(playerCheck.result.value, null, 2));

    // Take screenshot of player controls
    await send("Runtime.evaluate", {
      expression: `document.querySelector("a11y-media-player").scrollIntoView({ behavior: "instant", block: "center" })`
    });
    await new Promise((r) => setTimeout(r, 600));
    const snapPlayer = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("evidence/verified-player-controls.png", Buffer.from(snapPlayer.data, "base64"));
    console.log("Saved evidence/verified-player-controls.png");

    // 2. Verify Feature 1: Accessible Lesson Documents
    console.log("\n--- Checking Feature 1: Accessible Lesson Documents ---");
    const docsCheck = await send("Runtime.evaluate", {
      expression: `(() => {
        const links = Array.from(document.querySelectorAll("section[aria-labelledby='heading-docs'] a"));
        return links.map(a => ({
          text: a.textContent.trim(),
          href: a.getAttribute("href"),
          download: a.getAttribute("download"),
          target: a.getAttribute("target"),
          parentText: a.parentElement.textContent.replace(/\\s+/g, " ").trim()
        }));
      })()`,
      returnByValue: true
    });
    console.log("Docs Check Results:", JSON.stringify(docsCheck.result.value, null, 2));

    // 3. Verify Feature 2: 3G Low-Data Offline Study Pack
    console.log("\n--- Checking Feature 2: 3G Low-Data Offline Study Pack ---");
    const offlineCheckBefore = await send("Runtime.evaluate", {
      expression: `(() => {
        const sec = document.querySelector("section[aria-labelledby='heading-offline']");
        const btn = sec.querySelector("button");
        return {
          title: sec.querySelector("h3")?.textContent.trim(),
          buttonText: btn?.textContent.trim(),
          sectionText: sec.textContent.replace(/\\s+/g, " ").trim()
        };
      })()`,
      returnByValue: true
    });
    console.log("3G Pack Before Click:", JSON.stringify(offlineCheckBefore.result.value, null, 2));

    // Click Download 3G Pack button
    console.log("Clicking Download 3G Pack button...");
    await send("Runtime.evaluate", {
      expression: `document.querySelector("section[aria-labelledby='heading-offline'] button").click()`
    });
    await new Promise((r) => setTimeout(r, 1000));

    const offlineCheckAfter = await send("Runtime.evaluate", {
      expression: `(() => {
        const sec = document.querySelector("section[aria-labelledby='heading-offline']");
        const btn = sec.querySelector("button");
        const msg = sec.querySelector("[aria-live='polite']");
        return {
          buttonText: btn?.textContent.trim(),
          notificationMsg: msg?.textContent.trim()
        };
      })()`,
      returnByValue: true
    });
    console.log("3G Pack After Click:", JSON.stringify(offlineCheckAfter.result.value, null, 2));

    // 4. Verify Feature 3: Career Gateway Job Card Item
    console.log("\n--- Checking Feature 3: Career Gateway Job Card ---");
    const jobCheck = await send("Runtime.evaluate", {
      expression: `(() => {
        const jobCard = document.querySelector("section[aria-labelledby='heading-lesson-jobs'] article.card");
        if (!jobCard) return { error: "No job card found" };
        const title = jobCard.querySelector("h4")?.textContent.trim();
        const metaLine = jobCard.querySelector("p")?.textContent.replace(/\\s+/g, " ").trim();
        const badge = jobCard.querySelector(".badge")?.textContent.trim();
        const audioBtn = jobCard.querySelector("button");
        const accommodations = Array.from(jobCard.querySelectorAll("li")).map(li => li.textContent.replace(/\\s+/g, " ").trim());
        const detailsText = jobCard.querySelector("details")?.textContent.replace(/\\s+/g, " ").trim();

        return {
          title,
          metaLine,
          badge,
          hasDuplicateHybrid: metaLine ? metaLine.includes("(Hybrid) (Hybrid)") : false,
          audioBtnText: audioBtn?.textContent.replace(/\\s+/g, " ").trim(),
          accommodations,
          detailsText
        };
      })()`,
      returnByValue: true
    });
    console.log("Job Card Results:", JSON.stringify(jobCheck.result.value, null, 2));

    // Test Audio Summary Play/Pause Toggle
    console.log("Testing Audio Summary button click...");
    await send("Runtime.evaluate", {
      expression: `document.querySelector("section[aria-labelledby='heading-lesson-jobs'] article.card button").click()`
    });
    await new Promise((r) => setTimeout(r, 500));

    const audioCheckAfter = await send("Runtime.evaluate", {
      expression: `(() => {
        const audioBtn = document.querySelector("section[aria-labelledby='heading-lesson-jobs'] article.card button");
        return {
          audioBtnTextAfterClick: audioBtn?.textContent.replace(/\\s+/g, " ").trim(),
          ariaPressed: audioBtn?.getAttribute("aria-pressed")
        };
      })()`,
      returnByValue: true
    });
    console.log("Audio Button Toggle:", JSON.stringify(audioCheckAfter.result.value, null, 2));

    // Take screenshot of Career Gateway and Documents
    await send("Runtime.evaluate", {
      expression: `document.querySelector("section[aria-labelledby='heading-lesson-jobs']").scrollIntoView({ behavior: "instant", block: "center" })`
    });
    await new Promise((r) => setTimeout(r, 600));
    const snapJobs = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("evidence/verified-career-gateway.png", Buffer.from(snapJobs.data, "base64"));
    console.log("Saved evidence/verified-career-gateway.png");

  } finally {
    chrome.kill();
  }
}

verifyAll().catch(console.error);
