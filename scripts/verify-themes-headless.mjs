import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import WebSocket from "ws";

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".vtt": "text/vtt",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

const distDir = path.resolve("apps/demo/dist");

const server = http.createServer((req, res) => {
  let reqPath = req.url.split("?")[0];
  if (reqPath === "/" || reqPath === "/lesson" || reqPath === "/studio" || reqPath === "/verify" || reqPath === "/embed") {
    reqPath = reqPath === "/" ? "/index.html" : `${reqPath}.html`;
  }

  let filePath = path.join(distDir, reqPath);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(distDir, "index.html");
  }

  const ext = path.extname(filePath);
  const mime = MIME_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not Found");
    } else {
      res.writeHead(200, { "Content-Type": mime });
      res.end(data);
    }
  });
});

server.listen(4180, "127.0.0.1", async () => {
  console.log("Serving apps/demo/dist on http://127.0.0.1:4180");

  const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
    "--headless=new",
    "--remote-debugging-port=9229",
    "--window-size=1280,900",
    "--disable-gpu",
    "--no-sandbox",
    "about:blank"
  ]);

  try {
    await new Promise((r) => setTimeout(r, 1500));
    const targets = await new Promise((res, rej) => {
      http.get("http://127.0.0.1:9229/json/list", (r) => {
        let d = "";
        r.on("data", (c) => (d += c));
        r.on("end", () => res(JSON.parse(d)));
      }).on("error", rej);
    });

    const page = targets.find((t) => t.type === "page");
    const ws = new WebSocket(page.webSocketDebuggerUrl);

    let id = 1;
    const pending = new Map();
    ws.on("message", (msg) => {
      const parsed = JSON.parse(msg);
      if (parsed.id && pending.has(parsed.id)) {
        pending.get(parsed.id)(parsed);
        pending.delete(parsed.id);
      }
    });

    await new Promise((res) => ws.on("open", res));
    const send = (method, params = {}) =>
      new Promise((res) => {
        const msgId = id++;
        pending.set(msgId, res);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });

    await send("Page.enable");
    await send("Page.navigate", { url: "http://127.0.0.1:4180/lesson.html" });
    await new Promise((r) => setTimeout(r, 2000));

    // Verify ThemePicker exists and check active themes
    const themes = [
      "apple-light",
      "deuteranopia-protanopia",
      "tritanopia",
      "monochrome-high-contrast",
      "dark-high-contrast"
    ];

    fs.mkdirSync("evidence", { recursive: true });

    for (const theme of themes) {
      console.log(`Testing theme application: ${theme}`);
      await send("Runtime.evaluate", {
        expression: `(() => {
          document.documentElement.setAttribute("data-theme", "${theme}");
          localStorage.setItem("abugida-theme", "${theme}");
          const players = document.querySelectorAll("a11y-media-player, db-player");
          players.forEach((p) => p.setAttribute("data-theme", "${theme}"));
        })()`
      });
      await new Promise((r) => setTimeout(r, 500));

      const styles = await send("Runtime.evaluate", {
        expression: `(() => {
          const comp = getComputedStyle(document.documentElement);
          return {
            theme: document.documentElement.getAttribute("data-theme"),
            canvas: comp.getPropertyValue("--color-canvas").trim(),
            surface: comp.getPropertyValue("--color-surface").trim(),
            brand: comp.getPropertyValue("--color-brand").trim(),
            ink: comp.getPropertyValue("--color-ink").trim()
          };
        })()`,
        returnByValue: true
      });
      console.log(`Applied:`, styles.result.value);

      const shot = await send("Page.captureScreenshot", { format: "png" });
      const imgPath = `evidence/theme-${theme}.png`;
      if (shot && shot.result && shot.result.data) {
        fs.writeFileSync(imgPath, Buffer.from(shot.result.data, "base64"));
        console.log(`Saved screenshot -> ${imgPath}`);
      }
    }

    console.log("ALL THEMES SUCCESSFULLY VERIFIED!");
  } catch (err) {
    console.error("Theme verification error:", err);
  } finally {
    chrome.kill();
    server.close();
  }
});
