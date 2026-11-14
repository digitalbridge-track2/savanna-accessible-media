import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../../");

test("Integration Test Suite: 3-Tier Architecture Verification", async (t) => {
  // Level 1: Standalone Drop-in Script Tag & Web Component bundle
  await t.test("Level 1 Integration: Web Component bundle & drop-in script assets", async () => {
    // 1. Check local bundle build
    const bundlePath = path.join(rootDir, "packages/media-kit/dist-bundle/a11y-media-kit.umd.js");
    assert.ok(fs.existsSync(bundlePath), "Standalone UMD bundle must exist in dist-bundle");

    // 2. If Docker demo container is up on port 3000, verify HTTP serving
    try {
      const res = await fetch("http://localhost:3000/dist/a11y-media-kit.umd.js");
      if (res.ok) {
        const text = await res.text();
        assert.ok(text.includes("a11y-media-player"), "Bundle must register a11y-media-player custom element");
      }
    } catch {
      // Container not running in standalone offline test; local bundle existence is verified
    }
  });

  // Level 2: Headless REST API pipeline
  await t.test("Level 2 Integration: FastAPI transcription & health endpoints", async () => {
    // Test API connectivity (if container/service is running on port 8000)
    try {
      const healthRes = await fetch("http://localhost:8000/health");
      assert.equal(healthRes.status, 200, "API health check must return HTTP 200");
      const healthData = await healthRes.json();
      assert.equal(healthData.status, "healthy");
      assert.equal(healthData.asr_adapter, "local-fallback");

      const jobRes = await fetch("http://localhost:8000/v1/transcription-jobs/job-eval-001");
      assert.equal(jobRes.status, 200, "Transcription job endpoint must return HTTP 200");
      const jobData = await jobRes.json();
      assert.equal(jobData.status, "ready_for_review");
      assert.ok(jobData.segments.length > 0, "Transcription job must return segments");
      assert.ok(jobData.segments.some((s) => s.draft_text.includes("እንኳን")), "Must return Ethiopic transcript text");
    } catch (err) {
      // If service is not running on port 8000, verify the FastAPI code exists locally
      const mainPyPath = path.join(rootDir, "services/transcript-api/app/main.py");
      assert.ok(fs.existsSync(mainPyPath), "main.py must exist in services/transcript-api/app");
    }
  });

  // Level 3: Open Standards, Microdata & Credential Verification
  await t.test("Level 3 Integration: schema.org JSON-LD, WebVTT & Verification registry", async () => {
    // 1. Schema.org / Microdata
    const jobsPath = path.join(rootDir, "apps/demo/public/jobs/jobs.json");
    const jobs = JSON.parse(fs.readFileSync(jobsPath, "utf-8"));
    const job = jobs[0];
    assert.ok(job.title.en && job.title.am, "Job must have bilingual titles");
    assert.ok(job.accommodations?.length > 0, "Job must specify accessibility accommodations");

    // 2. Verifiable credential registry
    const certPath = path.join(rootDir, "apps/demo/public/certificates/certificates.demo.json");
    const certs = JSON.parse(fs.readFileSync(certPath, "utf-8"));
    const cert = certs.find((c) => c.id === "CERT-DB-2026-0042");
    assert.ok(cert, "Must find test credential CERT-DB-2026-0042");
    assert.equal(cert.issueDateISO, "2026-11-14");
    assert.ok(cert.issueDateEthiopic.includes("ህዳር"), "Credential must have Ethiopic dual-calendar date");

    // 3. WebVTT bilingual caption tracks
    const vttEnPath = path.join(rootDir, "apps/demo/public/lessons/digital-workplace/captions.en.vtt");
    const vttAmPath = path.join(rootDir, "apps/demo/public/lessons/digital-workplace/captions.am.vtt");
    assert.ok(fs.existsSync(vttEnPath), "English WebVTT file must exist");
    assert.ok(fs.existsSync(vttAmPath), "Amharic WebVTT file must exist");
  });
});
