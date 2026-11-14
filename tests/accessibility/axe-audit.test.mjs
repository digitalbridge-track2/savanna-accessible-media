import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import axe from "axe-core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../../");

const PAGES_TO_TEST = [
  { name: "Demo Home (index.html)", file: "apps/demo/index.html" },
  { name: "Accessible Lesson (lesson.html)", file: "apps/demo/lesson.html" },
  { name: "Transcript Studio (studio.html)", file: "apps/demo/studio.html" },
  { name: "Certificate Verification (verify.html)", file: "apps/demo/verify.html" },
  { name: "Accessible HTML Handout (lesson.en.html)", file: "apps/demo/public/lessons/digital-workplace/documents/lesson.en.html" },
];

test("Axe-Core Automated Accessibility Suite (The Gate)", async (t) => {
  for (const page of PAGES_TO_TEST) {
    await t.test(`Audit ${page.name}: Must have 0 critical and 0 serious violations`, async () => {
      const filePath = path.join(rootDir, page.file);
      assert.ok(fs.existsSync(filePath), `File does not exist: ${filePath}`);

      const html = fs.readFileSync(filePath, "utf-8");
      const dom = new JSDOM(html, { runScripts: "outside-only" });

      // Run axe on the document body
      const results = await axe.run(dom.window.document.documentElement, {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
        },
      });

      const critical = results.violations.filter((v) => v.impact === "critical");
      const serious = results.violations.filter((v) => v.impact === "serious");

      if (critical.length > 0 || serious.length > 0) {
        console.error(`\n❌ Accessibility Violations in ${page.name}:`);
        for (const v of [...critical, ...serious]) {
          console.error(`- [${v.impact?.toUpperCase()}] ${v.id}: ${v.description}`);
          console.error(`  Help: ${v.helpUrl}`);
        }
      }

      assert.equal(critical.length, 0, `Found ${critical.length} critical accessibility violations in ${page.name}`);
      assert.equal(serious.length, 0, `Found ${serious.length} serious accessibility violations in ${page.name}`);
    });
  }
});
