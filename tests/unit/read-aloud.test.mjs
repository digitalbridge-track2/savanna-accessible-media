import test, { after } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { createServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(__dirname, "../../apps/demo");

// Load the TypeScript modules through Vite so the suite also runs on the
// Node 20 toolchain used by the Docker build, which cannot import .ts files.
const server = await createServer({
  root: appDir,
  configFile: false,
  logLevel: "silent",
  appType: "custom",
  server: { middlewareMode: true },
});

const {
  cleanSpeechText,
  extractReadableContent,
  getAccessibleName,
  isElementHidden,
  resolveContentLanguage,
  resolveReadableTarget,
} = await server.ssrLoadModule(
  path.join(appDir, "src/read-aloud/content-extractor.ts")
);

const { hasVoiceForLanguage, pickVoice, SpeechEngine } = await server.ssrLoadModule(
  path.join(appDir, "src/read-aloud/speech-engine.ts")
);

after(async () => {
  await server.close();
});

function makeDom(body, lang = "en") {
  const dom = new JSDOM(
    `<!DOCTYPE html><html lang="${lang}"><body>${body}</body></html>`,
    { url: "http://localhost/" }
  );
  return dom;
}

function element(doc, selector) {
  const found = doc.querySelector(selector);
  assert.ok(found, `Expected selector to match: ${selector}`);
  return found;
}

test("Read-aloud content extraction", async (t) => {
  await t.test("announces heading level and text", () => {
    const dom = makeDom("<h2>Digital Workplace Skills</h2>");
    const content = extractReadableContent(element(dom.window.document, "h2"));
    assert.equal(content.kind, "heading");
    assert.equal(content.text, "Heading level 2: Digital Workplace Skills");
    assert.equal(content.language, "en");
  });

  await t.test("reads paragraph text and ignores decorative icons", () => {
    const dom = makeDom("<p><span aria-hidden=\"true\">📚</span> Learn at your own pace.</p>");
    const content = extractReadableContent(element(dom.window.document, "p"));
    assert.equal(content.kind, "paragraph");
    assert.equal(content.text, "Learn at your own pace.");
  });

  await t.test("prefers a button's accessible label", () => {
    const dom = makeDom(
      "<button type=\"button\" aria-label=\"Listen to audio summary for Digital Skills\">🔊</button>"
    );
    const content = extractReadableContent(element(dom.window.document, "button"));
    assert.equal(content.kind, "button");
    assert.equal(
      content.text,
      "Listen to audio summary for Digital Skills, button"
    );
  });

  await t.test("indicates links and new-tab behavior", () => {
    const dom = makeDom(
      "<a href=\"/lesson\" target=\"_blank\">Open Accessible Lesson ↗</a>"
    );
    const content = extractReadableContent(element(dom.window.document, "a"));
    assert.equal(content.kind, "link");
    assert.equal(
      content.text,
      "Open Accessible Lesson, link, opens in a new tab"
    );
  });

  await t.test("reads meaningful image alt text", () => {
    const dom = makeDom(
      "<img src=\"lesson.webp\" alt=\"Instructor demonstrating a laptop\">"
    );
    const content = extractReadableContent(element(dom.window.document, "img"));
    assert.equal(content.kind, "image");
    assert.equal(content.text, "Image: Instructor demonstrating a laptop");
  });

  await t.test("ignores images with empty alt text", () => {
    const dom = makeDom("<img src=\"divider.png\" alt=\"\">");
    assert.equal(
      extractReadableContent(element(dom.window.document, "img")),
      null
    );
  });

  await t.test("combines form label, type, value, required state, and instructions", () => {
    const dom = makeDom(`
      <label for="email">Email address</label>
      <input id="email" type="email" value="learner@example.com" required aria-describedby="email-help">
      <p id="email-help">We never share your email.</p>
    `);
    const content = extractReadableContent(element(dom.window.document, "#email"));
    assert.equal(content.kind, "form-field");
    assert.match(content.text, /^Email address, email field/);
    assert.match(content.text, /current value: learner@example\.com/);
    assert.match(content.text, /required/);
    assert.match(content.text, /instructions: We never share your email\./);
  });

  await t.test("reads checkbox state from its associated label", () => {
    const dom = makeDom(
      "<label><input type=\"checkbox\" checked> Enable read-aloud</label>"
    );
    const content = extractReadableContent(element(dom.window.document, "input"));
    assert.equal(content.kind, "form-field");
    assert.match(content.text, /Enable read-aloud, checkbox, checked/);
  });

  await t.test("never reads a password value", () => {
    const dom = makeDom(
      "<label for=\"pw\">Password</label><input id=\"pw\" type=\"password\" value=\"secret\">"
    );
    const content = extractReadableContent(element(dom.window.document, "#pw"));
    assert.ok(content);
    assert.match(content.text, /Password, password field/);
    assert.doesNotMatch(content.text, /secret/);
  });

  await t.test("announces list context and list-item position", () => {
    const dom = makeDom(
      "<ul><li>First item</li><li>Second item</li><li>Third item</li></ul>"
    );
    const list = extractReadableContent(element(dom.window.document, "ul"));
    assert.equal(list.text, "List, 3 items");
    const second = extractReadableContent(
      element(dom.window.document, "li:nth-child(2)")
    );
    assert.equal(second.text, "List item 2 of 3: Second item");
  });

  await t.test("announces table headers and column context for cells", () => {
    const dom = makeDom(`
      <table>
        <caption>Review status</caption>
        <thead><tr><th scope="col">Segment</th><th scope="col">Status</th></tr></thead>
        <tbody><tr><th scope="row">Intro</th><td>Reviewed</td></tr></tbody>
      </table>
    `);
    const header = extractReadableContent(element(dom.window.document, "th"));
    assert.equal(header.text, "column header: Segment");
    const cell = extractReadableContent(element(dom.window.document, "td"));
    assert.match(cell.text, /table cell: Reviewed/);
    assert.match(cell.text, /column header: Status/);
    assert.match(cell.text, /row header: Intro/);
    const caption = extractReadableContent(element(dom.window.document, "caption"));
    assert.equal(caption.text, "Table caption: Review status");
  });

  await t.test("ignores hidden, empty, decorative, and control-panel content", () => {
    const dom = makeDom(`
      <p hidden>Hidden paragraph</p>
      <p aria-hidden="true">Aria hidden paragraph</p>
      <button aria-hidden="true">🔊</button>
      <div></div>
      <div data-read-aloud-ignore=""><button>Read aloud</button></div>
      <p></p>
    `);
    const doc = dom.window.document;
    assert.equal(extractReadableContent(element(doc, "p[hidden]")), null);
    assert.equal(extractReadableContent(element(doc, "p[aria-hidden]")), null);
    assert.equal(extractReadableContent(element(doc, "button")), null);
    assert.equal(extractReadableContent(element(doc, "div[data-read-aloud-ignore] button")), null);
    assert.equal(extractReadableContent(element(doc, "p:last-child")), null);
  });

  await t.test("resolves the nearest meaningful ancestor, not the whole container", () => {
    const dom = makeDom(
      "<p>Read <strong>this link</strong> <a href=\"/x\">details</a> now.</p>"
    );
    const doc = dom.window.document;
    const strong = extractReadableTargetFrom(doc, "strong");
    assert.equal(strong.kind, "paragraph");
    const link = resolveReadableTarget(element(doc, "a"));
    assert.equal(link.kind, "link");
    assert.equal(link.text, "details, link");
  });

  await t.test("reads an explicitly marked information card", () => {
    const dom = makeDom(`
      <article data-read-aloud="card">
        <h3>Level 1: Script Tag</h3>
        <p>Embed the player with one line of HTML.</p>
        <a href="/embed">View embed code</a>
      </article>
    `);
    const content = extractReadableContent(element(dom.window.document, "article"));
    assert.equal(content.kind, "region");
    assert.match(content.text, /^Card: Level 1: Script Tag/);
    assert.match(content.text, /Embed the player with one line of HTML\./);
  });

  await t.test("supports explicit lang and Ethiopic script detection", () => {
    const dom = makeDom(
      "<h2 lang=\"am\">የዲጂታል የሥራ ቦታ ክህሎቶች</h2><h2>እንኳን ደህና መጡ</h2>",
      "en"
    );
    const doc = dom.window.document;
    const explicit = extractReadableContent(element(doc, "h2[lang]"));
    assert.equal(explicit.language, "am");
    assert.match(explicit.text, /^የርዕስ ደረጃ 2:/);
    const detected = extractReadableContent(element(doc, "h2:last-child"));
    assert.equal(detected.language, "am");
    assert.equal(
      resolveContentLanguage(element(doc, "h2:last-child"), "እንኳን ደህና መጡ"),
      "am"
    );
  });

  await t.test("lets clearly Amharic text override an inherited English lang", () => {
    const dom = makeDom(
      "<main lang=\"en\"><h2>እንኳን ደህና መጡ ወደ ትምህርቱ</h2><p>Short English note.</p></main>",
      "en"
    );
    const doc = dom.window.document;
    const amharic = extractReadableContent(element(doc, "h2"));
    assert.equal(amharic.language, "am");
    assert.match(amharic.text, /^የርዕስ ደረጃ 2:/);
    assert.equal(
      extractReadableContent(element(doc, "p")).language,
      "en",
      "a mostly English string keeps its inherited language"
    );
  });

  await t.test("does not speak label-only empty elements", () => {
    const dom = makeDom(
      "<main><h2> </h2><table><caption></caption><tr><th scope=\"col\"></th></tr></table><blockquote></blockquote><dl><dt></dt><dd></dd></dl></main>"
    );
    const doc = dom.window.document;
    assert.equal(extractReadableContent(element(doc, "h2")), null);
    assert.equal(extractReadableContent(element(doc, "caption")), null);
    assert.equal(extractReadableContent(element(doc, "th")), null);
    assert.equal(extractReadableContent(element(doc, "blockquote")), null);
    assert.equal(extractReadableContent(element(doc, "dt")), null);
    assert.equal(extractReadableContent(element(doc, "dd")), null);
  });

  await t.test("caps long region speech", () => {
    const longText = "word ".repeat(400);
    const dom = makeDom(
      `<article data-read-aloud="card"><p>${longText}</p></article>`
    );
    const content = extractReadableContent(element(dom.window.document, "article"));
    assert.ok(content.text.length <= 800, `Expected <= 800, got ${content.text.length}`);
  });

  await t.test("normalises icon glyphs and whitespace in speech text", () => {
    assert.equal(cleanSpeechText("  📚  Open   lesson →  "), "Open lesson");
    assert.equal(cleanSpeechText("✓ Completed •"), "Completed");
  });

  await t.test("computes accessible names and hidden state", () => {
    const dom = makeDom(
      "<button aria-labelledby=\"btn-label\"><span aria-hidden=\"true\">→</span></button><span id=\"btn-label\">Next page</span><div id=\"hidden\" style=\"display:none\"><p>Gone</p></div>"
    );
    const doc = dom.window.document;
    assert.equal(getAccessibleName(element(doc, "button")), "Next page");
    assert.equal(isElementHidden(element(doc, "#hidden p")), true);
  });
});

function extractReadableTargetFrom(doc, selector) {
  return resolveReadableTarget(element(doc, selector));
}

class FakeUtterance {
  constructor(text) {
    this.text = text || "";
    this.lang = "";
    this.rate = 1;
    this.pitch = 1;
    this.volume = 1;
    this.voice = null;
    this.onstart = null;
    this.onend = null;
    this.onerror = null;
    this.onpause = null;
    this.onresume = null;
  }
}

function makeEngine(voices = []) {
  const calls = { speak: [], cancel: 0, pause: 0, resume: 0 };
  const listeners = new Map();
  const synth = {
    speaking: false,
    paused: false,
    getVoices: () => voices,
    speak(utterance) {
      calls.speak.push(utterance);
    },
    cancel() {
      calls.cancel += 1;
    },
    pause() {
      calls.pause += 1;
    },
    resume() {
      calls.resume += 1;
    },
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    removeEventListener(type, listener) {
      if (listeners.get(type) === listener) listeners.delete(type);
    },
  };
  const engine = new SpeechEngine({
    speechSynthesis: synth,
    SpeechSynthesisUtterance: FakeUtterance,
  });
  return { engine, synth, calls, listeners };
}

const SPEAK_REQUEST = {
  text: "Hello from the read-aloud feature.",
  lang: "en",
  voice: null,
  rate: 1.2,
  pitch: 1,
  volume: 0.8,
};

test("Speech engine", async (t) => {
  await t.test("reports unsupported browsers without throwing", () => {
    const engine = new SpeechEngine({});
    assert.equal(engine.supported, false);
    assert.equal(engine.getSnapshot().status, "unsupported");
    assert.equal(engine.speak(SPEAK_REQUEST), false);
    engine.dispose();
  });

  await t.test("speaks one utterance with the requested settings", () => {
    const { engine, calls, listeners } = makeEngine();
    const states = [];
    const unsubscribe = engine.subscribe((snapshot) => states.push(snapshot.status));

    const started = engine.speak(SPEAK_REQUEST);
    assert.equal(started, true);
    assert.equal(calls.speak.length, 1);
    assert.equal(calls.cancel, 1);
    const utterance = calls.speak[0];
    assert.equal(utterance.text, SPEAK_REQUEST.text);
    assert.equal(utterance.lang, "en");
    assert.equal(utterance.rate, 1.2);
    assert.equal(utterance.volume, 0.8);

    utterance.onstart();
    assert.equal(engine.getSnapshot().status, "speaking");

    engine.pause();
    assert.equal(calls.pause, 1);
    assert.equal(engine.getSnapshot().status, "paused");

    engine.resume();
    assert.equal(calls.resume, 1);
    assert.equal(engine.getSnapshot().status, "speaking");

    utterance.onend();
    assert.equal(engine.getSnapshot().status, "idle");
    assert.ok(states.includes("speaking"));
    assert.ok(listeners.has("voiceschanged"), "voice listener should be attached");
    unsubscribe();
    engine.dispose();
    assert.equal(listeners.has("voiceschanged"), false, "voice listener should be removed");
  });

  await t.test("passes the browser's native voice object to the utterance", () => {
    const voices = [
      {
        voiceURI: "en-local",
        name: "English Local",
        lang: "en-US",
        localService: true,
        default: true,
      },
    ];
    const { engine, calls } = makeEngine(voices);
    const normalised = engine.getVoices();
    assert.notEqual(
      normalised[0],
      voices[0],
      "the UI should receive a plain, serialisable voice copy"
    );

    engine.speak({ ...SPEAK_REQUEST, voice: normalised[0] });
    assert.equal(
      calls.speak[0].voice,
      voices[0],
      "the engine must resolve back to the native SpeechSynthesisVoice"
    );
    engine.dispose();
  });

  await t.test("ignores late callbacks from a replaced utterance", () => {
    const { engine, calls } = makeEngine();
    engine.speak(SPEAK_REQUEST);
    const first = calls.speak[0];
    first.onstart();
    engine.speak({ ...SPEAK_REQUEST, text: "Second sentence." });
    const second = calls.speak[1];
    second.onstart();

    first.onend();
    first.onerror({ error: "interrupted" });
    assert.equal(engine.getSnapshot().status, "speaking");
    assert.equal(engine.getSnapshot().text, "Second sentence.");

    second.onend();
    assert.equal(engine.getSnapshot().status, "idle");
    engine.dispose();
  });

  await t.test("stops speech and ignores an interrupted error", () => {
    const { engine, calls } = makeEngine();
    engine.speak(SPEAK_REQUEST);
    const utterance = calls.speak[0];
    utterance.onstart();
    engine.stop();
    assert.equal(engine.getSnapshot().status, "idle");
    assert.equal(engine.getSnapshot().error, null);
    utterance.onerror({ error: "interrupted" });
    assert.equal(engine.getSnapshot().status, "idle");
    assert.equal(engine.getSnapshot().error, null);
    engine.dispose();
  });

  await t.test("surfaces real speech errors", () => {
    const { engine, calls } = makeEngine();
    engine.speak(SPEAK_REQUEST);
    calls.speak[0].onerror({ error: "not-allowed" });
    assert.equal(engine.getSnapshot().status, "idle");
    assert.equal(engine.getSnapshot().error, "not-allowed");
    engine.dispose();
  });

  await t.test("selects a matching voice and keeps Amharic honest", () => {
    const voices = [
      { voiceURI: "en-local", name: "English Local", lang: "en-US", localService: true },
      { voiceURI: "en-remote", name: "English Remote", lang: "en-GB", localService: false },
      { voiceURI: "am-local", name: "Amharic Local", lang: "am-ET", localService: true },
    ];
    assert.equal(pickVoice(voices, null, "en").voiceURI, "en-local");
    assert.equal(pickVoice(voices, "en-remote", "en").voiceURI, "en-remote");
    assert.equal(
      pickVoice(voices, "en-remote", "am").voiceURI,
      "am-local",
      "an incompatible preferred voice must not be used for Amharic"
    );
    assert.equal(hasVoiceForLanguage(voices, "am"), true);
    assert.equal(hasVoiceForLanguage(voices.slice(0, 2), "am"), false);
    assert.equal(pickVoice(voices.slice(0, 2), null, "am"), null);
  });

  await t.test("clamps unsafe rate, pitch, and volume values", () => {
    const { engine, calls } = makeEngine();
    engine.speak({
      text: "Testing bounds",
      lang: "en",
      voice: null,
      rate: 99,
      pitch: -4,
      volume: 42,
    });
    const utterance = calls.speak[0];
    assert.equal(utterance.rate, 2);
    assert.equal(utterance.pitch, 0.5);
    assert.equal(utterance.volume, 1);
    engine.dispose();
  });
});
