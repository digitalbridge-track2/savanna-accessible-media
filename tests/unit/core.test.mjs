import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../../");

test("Unit Test Suite: Manifest & VTT Core Parsing", async (t) => {
  await t.test("Validates lesson.json manifest against schema requirements", () => {
    const manifestPath = path.join(
      rootDir,
      "apps/demo/public/lessons/digital-workplace/lesson.json"
    );
    assert.ok(fs.existsSync(manifestPath), "lesson.json must exist");

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    assert.equal(manifest.schemaVersion, "1.0.0");
    assert.ok(manifest.title.en, "Must include English title");
    assert.ok(manifest.title.am, "Must include Amharic title");
    assert.ok(manifest.sources.length >= 2, "Must include multiple media sources");
    assert.ok(
      manifest.sources.some((s) => s.kind === "described"),
      "Must include an audio-described source"
    );
    assert.ok(
      manifest.sources.some((s) => s.kind === "sign"),
      "Must include an Ethiopian Sign Language source"
    );
    assert.ok(
      manifest.captionTracks.some((c) => c.language === "am"),
      "Must include Amharic caption track"
    );
    assert.ok(
      manifest.documents.some((d) => d.format === "html"),
      "Must include accessible HTML document"
    );
    assert.ok(
      manifest.packages.some((p) => p.id === "pkg-3g-light"),
      "Must include 3G light study package"
    );
  });

  await t.test("Validates Amharic WebVTT caption cues", () => {
    const vttPath = path.join(
      rootDir,
      "apps/demo/public/lessons/digital-workplace/captions.am.vtt"
    );
    assert.ok(fs.existsSync(vttPath), "captions.am.vtt must exist");
    const content = fs.readFileSync(vttPath, "utf-8");

    assert.ok(content.startsWith("WEBVTT"), "Must start with WEBVTT signature");
    assert.ok(
      content.includes("እንኳን ወደ ዲጂታል"),
      "Must contain valid Ethiopic Unicode script"
    );
    assert.ok(content.includes("-->"), "Must contain timestamp ranges");
  });

  await t.test("Validates Job Cards JSON-LD and Accommodations", () => {
    const jobsPath = path.join(rootDir, "apps/demo/public/jobs/jobs.json");
    assert.ok(fs.existsSync(jobsPath), "jobs.json must exist");
    const jobs = JSON.parse(fs.readFileSync(jobsPath, "utf-8"));

    assert.ok(Array.isArray(jobs) && jobs.length > 0, "Jobs must be a non-empty array");
    const job = jobs[0];
    assert.ok(job.title.en && job.title.am, "Job title must be bilingual");
    assert.ok(job.audioSummary?.src, "Job must have an audio summary source");
    assert.ok(job.accommodations.length > 0, "Job must disclose accommodations");
    assert.ok(
      job.accommodations.every((a) => a.source),
      "Every accommodation must have a verifiable source"
    );
  });
});
