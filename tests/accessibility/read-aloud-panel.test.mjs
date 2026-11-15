import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import axe from "axe-core";
import { createServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../../");
const appDir = path.join(rootDir, "apps/demo");
const fixturePath = path.join(rootDir, "tests/fixtures/read-aloud-panel-ssr.tsx");

async function renderPanels() {
  const server = await createServer({
    root: appDir,
    configFile: false,
    logLevel: "silent",
    appType: "custom",
    server: { middlewareMode: true },
  });

  try {
    const module = await server.ssrLoadModule(fixturePath);
    return {
      en: module.renderReadAloudPanel("en"),
      am: module.renderReadAloudPanel("am"),
    };
  } finally {
    await server.close();
  }
}

test("Read-aloud panel accessibility (server-rendered open state)", async (t) => {
  const panels = await renderPanels();

  for (const [locale, markup] of Object.entries(panels)) {
    await t.test(`Audit ${locale} panel: 0 critical and 0 serious violations`, async () => {
      const dom = new JSDOM(
        `<!DOCTYPE html><html lang="${locale}"><head><title>Read-aloud panel audit</title></head><body>${markup}</body></html>`,
        { url: "http://localhost/" }
      );
      const document = dom.window.document;

      const panel = document.querySelector("#read-aloud-panel");
      assert.ok(panel, "Expected the open read-aloud panel to render");
      assert.equal(panel.getAttribute("aria-labelledby"), "read-aloud-panel-title");
      assert.ok(
        document.querySelector("#ra-voice"),
        "Expected the voice selector to render"
      );

      const results = await axe.run(document.documentElement, {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
        },
      });

      const critical = results.violations.filter((violation) => violation.impact === "critical");
      const serious = results.violations.filter((violation) => violation.impact === "serious");

      if (critical.length > 0 || serious.length > 0) {
        console.error(`\n❌ Accessibility violations in the ${locale} read-aloud panel:`);
        for (const violation of [...critical, ...serious]) {
          console.error(`- [${violation.impact?.toUpperCase()}] ${violation.id}: ${violation.description}`);
          console.error(`  Help: ${violation.helpUrl}`);
        }
      }

      assert.equal(
        critical.length,
        0,
        `Found ${critical.length} critical violations in the ${locale} panel`
      );
      assert.equal(
        serious.length,
        0,
        `Found ${serious.length} serious violations in the ${locale} panel`
      );
    });
  }
});
