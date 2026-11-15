import WebSocket from "ws";
import http from "node:http";
import { spawn } from "node:child_process";

async function test() {
  const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
    "--headless=new",
    "--remote-debugging-port=9224",
    "--window-size=1200,900",
    "--disable-gpu",
    "--no-sandbox",
    "about:blank"
  ]);

  try {
    await new Promise((r) => setTimeout(r, 1500));
    const targets = await new Promise((res, rej) => {
      http.get("http://127.0.0.1:9224/json/list", (r) => {
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

    const res = await send("Runtime.evaluate", {
      expression: `(() => {
        const player = document.querySelector("a11y-media-player");
        if (!player) return { error: "no player element in DOM" };
        if (!player.shadowRoot) return { error: "no shadowRoot yet" };
        return {
          innerHtmlLength: player.shadowRoot.innerHTML.length,
          children: Array.from(player.shadowRoot.children).map(c => c.tagName + '.' + c.className),
          htmlSnippet: player.shadowRoot.innerHTML.slice(0, 500)
        };
      })()`,
      returnByValue: true
    });

    console.log("Player shadow root inspect:", JSON.stringify(res, null, 2));

    // Also test at 1000px viewport
    await send("Emulation.setDeviceMetricsOverride", {
      width: 1000,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false
    });
    await new Promise((r) => setTimeout(r, 500));

    const res1000 = await send("Runtime.evaluate", {
      expression: `(() => {
        const player = document.querySelector("a11y-media-player");
        const shadow = player.shadowRoot;
        const panel = shadow.getElementById("player-container");
        const row = shadow.querySelector(".controls-row");
        const mute = shadow.getElementById("btn-mute");
        const fs = shadow.getElementById("btn-fullscreen");
        const prefs = shadow.getElementById("btn-prefs");
        const rRect = row.getBoundingClientRect();
        const mRect = mute.getBoundingClientRect();
        const fsRect = fs.getBoundingClientRect();
        const pRect = prefs.getBoundingClientRect();

        return {
          panelClientWidth: panel.clientWidth,
          rowClientWidth: row.clientWidth,
          rowScrollWidth: row.scrollWidth,
          hasHorizontalScroll: row.scrollWidth > row.clientWidth,
          rowRight: rRect.right,
          prefsRight: pRect.right,
          fsRight: fsRect.right,
          muteRight: mRect.right,
          isFsVisible: fsRect.right <= rRect.right,
          isMuteVisible: mRect.right <= rRect.right
        };
      })()`,
      returnByValue: true
    });

    console.log("Result at 1000px:", JSON.stringify(res1000.result.value, null, 2));

  } finally {
    chrome.kill();
  }
}

test().catch(console.error);
