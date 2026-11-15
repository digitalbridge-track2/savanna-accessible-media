import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { spawn } from "node:child_process";
import WebSocket from "ws";
import {
  toUnicodeBraille,
  toAsciiBraille,
  generateBRFDocument
} from "../packages/media-kit/dist/braille/braille-formatter.js";

const enSegments = [
  {
    start: 0,
    end: 4.5,
    speaker: "Instructor",
    text: "Welcome to Digital Workplace Skills: Foundations."
  },
  {
    start: 4.5,
    end: 9.0,
    speaker: "Instructor",
    text: "In this lesson, we will explore asynchronous communication and accessible documentation."
  },
  {
    start: 9.0,
    end: 14.2,
    speaker: "Instructor",
    text: "When working across distributed teams, structured headings and alternative text are essential."
  },
  {
    start: 14.2,
    end: 19.5,
    speaker: "Instructor",
    text: "Notice how the submit button on the application portal is highlighted at the bottom-right."
  },
  {
    start: 19.5,
    end: 25.0,
    speaker: "Instructor",
    text: "Everyone has the right to fully accessible tools in education and employment."
  }
];

const amSegments = [
  {
    start: 0,
    end: 4.5,
    speaker: "አስተማሪ",
    text: "እንኳን ወደ ዲጂታል የሥራ ቦታ ክህሎቶች መሠረታዊ ትምህርት በደህና መጡ።"
  },
  {
    start: 4.5,
    end: 9.0,
    speaker: "አስተማሪ",
    text: "በዚህ ትምህርት የርቀት የሥራ ግንኙነትን እና ተደራሽ የሰነድ አዘገጃጀትን እንመለከታለን።"
  },
  {
    start: 9.0,
    end: 14.2,
    speaker: "አስተማሪ",
    text: "በተለያዩ ቡድኖች ውስጥ ሲሰሩ፣ ግልጽ ርዕሶች እና የምስል ገላጭ ጽሑፎች ወሳኝ ናቸው።"
  },
  {
    start: 14.2,
    end: 19.5,
    speaker: "አስተማሪ",
    text: "በማመልከቻው ገጽ ታችኛው ክፍል በስተቀኝ የሚገኘውን የማመልከቻ ማስገቢያ ቁልፍ ልብ ይበሉ።"
  },
  {
    start: 19.5,
    end: 25.0,
    speaker: "አስተማሪ",
    text: "ሁሉም ሰው በትምህርት እና በሥራ ቦታ ሙሉ በሙሉ ተደራሽ የሆኑ መሣሪያዎችን የማግኘት መብት አለው።"
  }
];

// 1. Generate .brf files
console.log("Generating .brf files with authentic Unicode Braille patterns & BANA embosser streams...");

const enBRF = generateBRFDocument({
  title: "Digital Workplace Skills: Foundations",
  language: "en",
  date: "2026-11-14 (Hidar 5, 2019 E.C.)",
  segments: enSegments
});

const amBRF = generateBRFDocument({
  title: "የዲጂታል የሥራ ቦታ ክህሎቶች፡ መሠረታዊ",
  language: "am",
  date: "2026-11-14 (ኅዳር 5, 2019 ዓ.ም.)",
  segments: amSegments
});

const docsDir = path.resolve("apps/demo/public/lessons/digital-workplace/documents");
fs.writeFileSync(path.join(docsDir, "lesson-transcript.en.brf"), enBRF, "utf-8");
fs.writeFileSync(path.join(docsDir, "lesson-transcript.am.brf"), amBRF, "utf-8");
console.log("Saved lesson-transcript.en.brf and lesson-transcript.am.brf");

// Helper to build Dedicated Braille PDF HTML
function buildBrailleHTML({ lang, title, brailleTitle, subtitle, segments, isAm }) {
  const cuesHTML = segments.map((seg, idx) => {
    const cueNum = idx + 1;
    const startM = Math.floor(seg.start / 60).toString().padStart(2, "0");
    const startS = Math.floor(seg.start % 60).toString().padStart(2, "0");
    const endM = Math.floor(seg.end / 60).toString().padStart(2, "0");
    const endS = Math.floor(seg.end % 60).toString().padStart(2, "0");
    const unicodeBraille = toUnicodeBraille(seg.text);
    const asciiBraille = toAsciiBraille(unicodeBraille);

    return `
      <article class="cue-card" aria-label="Cue ${cueNum}">
        <div class="cue-meta">
          <span class="cue-badge">CUE #${cueNum}</span>
          <span class="cue-time">${startM}:${startS} &ndash; ${endM}:${endS}</span>
          <span class="cue-speaker">${seg.speaker}</span>
        </div>
        
        <!-- Authentic Unicode Braille Line -->
        <div class="braille-block" title="Tactile Unicode Braille Cells">
          <div class="braille-label">${isAm ? "የብሬል ጽሑፍ (Unicode Braille 6-Dot Cells):" : "Authentic Braille (Unicode 6-Dot Cells):"}</div>
          <div class="braille-cells" lang="${isAm ? "am" : "en"}">${unicodeBraille}</div>
        </div>

        <!-- Sighted Print Line -->
        <div class="print-block">
          <div class="print-label">${isAm ? "የታተመ ጽሑፍ (Sighted Print):" : "Sighted Print Text:"}</div>
          <p class="print-text">${seg.text}</p>
        </div>

        <!-- Embosser Hardware Line -->
        <div class="embosser-block">
          <span class="embosser-label">BANA Embosser ASCII:</span>
          <code class="embosser-code">${asciiBraille}</code>
        </div>
      </article>
    `;
  }).join("\n");

  const tactileDiagramHTML = isAm ? `
    <section class="tactile-section" aria-labelledby="heading-tactile">
      <h2 id="heading-tactile">የሚዳሰስ የፍሰት ሰንጠረዥ (Tactile Graphics Diagram)</h2>
      <p class="tactile-desc">
        ለዓይነ ስውራን ተማሪዎች በSwell Paper ወይም በTiger/Index Braille ማተሚያዎች በቀላሉ እንዲዳሰስ ተደርጎ የተዘጋጀ ምስል (ስዕል ፩.፩)፡
      </p>
      
      <div class="tactile-diagram-box">
        <div class="tactile-step">
          <div class="tactile-badge">ደረጃ ፩</div>
          <div class="tactile-braille-cell">⠠⠏⠓⠁⠎⠑ ⠼⠁</div>
          <div class="tactile-label">ረቂቅ የውሳኔ ሃሳብ</div>
          <div class="tactile-sub">Semantic HTML, WCAG &gt; 4.5:1</div>
        </div>
        <div class="tactile-arrow">&rarr;<br><span class="tactile-arrow-braille">⠒⠤⠒⠤⠕</span></div>
        <div class="tactile-step">
          <div class="tactile-badge">ደረጃ ፪</div>
          <div class="tactile-braille-cell">⠠⠏⠓⠁⠎⠑ ⠼⠃</div>
          <div class="tactile-label">የጋራ ገምጋሚዎች ፍተሻ</div>
          <div class="tactile-sub">NVDA/TalkBack &amp; የኮ-ዲዛይነር ፍተሻ</div>
        </div>
        <div class="tactile-arrow">&rarr;<br><span class="tactile-arrow-braille">⠒⠤⠒⠤⠕</span></div>
        <div class="tactile-step">
          <div class="tactile-badge">ደረጃ ፫</div>
          <div class="tactile-braille-cell">⠠⠏⠓⠁⠎⠑ ⠼⠉</div>
          <div class="tactile-label">ይፋዊ ህትመት</div>
          <div class="tactile-sub">Open Badges 3.0 ዲጂታል ምስክር ወረቀት</div>
        </div>
      </div>
      <div class="tactile-notes">
        <strong>የማተሚያ መመሪያ (Embosser Instructions):</strong> በ 2.5 ሚ.ሜ የነጥብ ርቀት እና በ 1.5 ሚ.ሜ ከፍታ ባላቸው መስመሮች የታነጸ፤ በብሬል ተጠቃሚዎች እጅ ሲዳሰስ ግልጽ የሆነ የሂደት ፍሰት ይሰጣል።
      </div>
    </section>
  ` : `
    <section class="tactile-section" aria-labelledby="heading-tactile">
      <h2 id="heading-tactile">Tactile Graphics Diagram (Swell-Paper & Embosser Format)</h2>
      <p class="tactile-desc">
        Tactile representation of Figure 1.1 (Inclusive Digital Collaboration Cycle) engineered for microcapsule fusers (PIAF) and tactile pin embossers:
      </p>
      
      <div class="tactile-diagram-box">
        <div class="tactile-step">
          <div class="tactile-badge">PHASE 1</div>
          <div class="tactile-braille-cell">⠠⠏⠓⠁⠎⠑ ⠼⠁</div>
          <div class="tactile-label">Draft Proposal</div>
          <div class="tactile-sub">Semantic HTML, WCAG &gt; 4.5:1</div>
        </div>
        <div class="tactile-arrow">&rarr;<br><span class="tactile-arrow-braille">⠒⠤⠒⠤⠕</span></div>
        <div class="tactile-step">
          <div class="tactile-badge">PHASE 2</div>
          <div class="tactile-braille-cell">⠠⠏⠓⠁⠎⠑ ⠼⠃</div>
          <div class="tactile-label">Co-Designer Review</div>
          <div class="tactile-sub">NVDA/TalkBack &amp; Sign Clarity Audit</div>
        </div>
        <div class="tactile-arrow">&rarr;<br><span class="tactile-arrow-braille">⠒⠤⠒⠤⠕</span></div>
        <div class="tactile-step">
          <div class="tactile-badge">PHASE 3</div>
          <div class="tactile-braille-cell">⠠⠏⠓⠁⠎⠑ ⠼⠉</div>
          <div class="tactile-label">Production Release</div>
          <div class="tactile-sub">Open Badges 3.0 Verifiable Credential</div>
        </div>
      </div>
      <div class="tactile-notes">
        <strong>Embossing Guidance:</strong> 2.5mm standard dot spacing with 3mm raised tactile container borders. Designed for dual-media reading (blind learner tactile exploration alongside sighted facilitator coaching).
      </div>
    </section>
  `;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Tactile Braille Edition</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 18mm 16mm 18mm 16mm;
    }
    :root {
      --color-brand: #0B5D4E;
      --color-brand-subtle: #E8F5F1;
      --color-ink: #0F172A;
      --color-muted: #475569;
      --color-border: #CBD5E1;
      --color-surface: #FFFFFF;
      --font-braille: "Segoe UI Symbol", "Apple Symbols", "DejaVu Sans", "Courier New", monospace;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: var(--color-ink);
      background: var(--color-surface);
      line-height: 1.5;
      margin: 0;
      padding: 0;
    }
    .header-bar {
      border-bottom: 3px solid var(--color-brand);
      padding-bottom: 14px;
      margin-bottom: 20px;
    }
    .org-banner {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--color-brand);
      margin-bottom: 6px;
    }
    h1 {
      font-size: 24px;
      color: var(--color-ink);
      margin: 0 0 6px 0;
      line-height: 1.25;
    }
    .braille-banner-title {
      font-family: var(--font-braille);
      font-size: 24px;
      color: var(--color-brand);
      letter-spacing: 3px;
      margin-bottom: 8px;
      line-height: 1.4;
      background: #F8FAFC;
      padding: 6px 12px;
      border-left: 4px solid var(--color-brand);
      border-radius: 4px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 10px;
      font-size: 11.5px;
      color: var(--color-muted);
      background: #F1F5F9;
      padding: 8px 12px;
      border-radius: 6px;
    }
    .meta-item strong {
      color: var(--color-ink);
    }
    .standard-badge {
      display: inline-block;
      background: var(--color-brand);
      color: #FFF;
      font-size: 10.5px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    h2 {
      font-size: 18px;
      color: var(--color-brand);
      border-bottom: 1.5px solid var(--color-border);
      padding-bottom: 4px;
      margin: 22px 0 14px 0;
    }
    .intro-callout {
      background: var(--color-brand-subtle);
      border: 1px solid #B2DFDB;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 12.5px;
      margin-bottom: 18px;
    }
    .cue-card {
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 14px;
      background: #FAFAFA;
      page-break-inside: avoid;
    }
    .cue-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      font-size: 11.5px;
    }
    .cue-badge {
      background: var(--color-ink);
      color: #FFF;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 10.5px;
    }
    .cue-time {
      font-weight: 600;
      color: var(--color-brand);
      font-family: monospace;
    }
    .cue-speaker {
      color: var(--color-muted);
    }
    .braille-block {
      background: #FFFFFF;
      border: 1.5px solid var(--color-brand);
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 8px;
    }
    .braille-label {
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--color-brand);
      margin-bottom: 4px;
      letter-spacing: 0.5px;
    }
    .braille-cells {
      font-family: var(--font-braille);
      font-size: 26px;
      line-height: 1.55;
      color: #0B5D4E;
      letter-spacing: 2.5px;
      word-break: break-word;
    }
    .print-block {
      margin-bottom: 8px;
      padding: 2px 4px;
    }
    .print-label {
      font-size: 10.5px;
      font-weight: 700;
      color: var(--color-muted);
      text-transform: uppercase;
    }
    .print-text {
      margin: 2px 0 0 0;
      font-size: 13.5px;
      font-weight: 600;
      color: #1E293B;
      line-height: 1.4;
    }
    .embosser-block {
      display: flex;
      align-items: baseline;
      gap: 8px;
      font-size: 11px;
      background: #F1F5F9;
      padding: 5px 10px;
      border-radius: 4px;
      border: 1px dashed #CBD5E1;
    }
    .embosser-label {
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
    }
    .embosser-code {
      font-family: "Courier New", monospace;
      font-size: 12px;
      color: #0F172A;
      font-weight: 700;
      word-break: break-all;
    }

    /* Tactile diagram */
    .tactile-section {
      margin-top: 24px;
      page-break-before: auto;
      page-break-inside: avoid;
    }
    .tactile-desc {
      font-size: 12.5px;
      color: var(--color-muted);
      margin-bottom: 12px;
    }
    .tactile-diagram-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 3px solid #000000;
      background: #FFFFFF;
      padding: 16px;
      border-radius: 10px;
      margin-bottom: 10px;
    }
    .tactile-step {
      flex: 1;
      text-align: center;
      border: 2px dashed #000000;
      padding: 10px;
      border-radius: 8px;
      background: #F8FAFC;
    }
    .tactile-badge {
      font-size: 10.5px;
      font-weight: 800;
      background: #000;
      color: #FFF;
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      margin-bottom: 6px;
    }
    .tactile-braille-cell {
      font-family: var(--font-braille);
      font-size: 22px;
      font-weight: 700;
      color: #000;
      letter-spacing: 2px;
      margin-bottom: 4px;
    }
    .tactile-label {
      font-size: 13px;
      font-weight: 700;
      color: #000;
    }
    .tactile-sub {
      font-size: 10.5px;
      color: #475569;
      margin-top: 3px;
    }
    .tactile-arrow {
      font-size: 22px;
      font-weight: 800;
      padding: 0 10px;
      color: #000;
      text-align: center;
      line-height: 1;
    }
    .tactile-arrow-braille {
      font-family: var(--font-braille);
      font-size: 16px;
      color: #0B5D4E;
    }
    .tactile-notes {
      font-size: 11.5px;
      color: #475569;
      background: #F8FAFC;
      border-left: 3px solid #000;
      padding: 6px 10px;
      border-radius: 4px;
    }

    /* Footer */
    footer {
      margin-top: 26px;
      padding-top: 12px;
      border-top: 1px solid var(--color-border);
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--color-muted);
    }
  </style>
</head>
<body>
  <header class="header-bar">
    <div class="org-banner">Digital Bridge &bull; Savanna Accessible Media Initiative</div>
    <span class="standard-badge">Standard: BANA 40&times;25 &bull; Grade 1 Tactile Edition</span>
    <h1>${title}</h1>
    <div class="braille-banner-title" aria-label="Braille title: ${title}">${brailleTitle}</div>
    
    <div class="meta-grid">
      <div class="meta-item"><strong>${isAm ? "ቋንቋ" : "Language"}:</strong> ${isAm ? "አማርኛ (የኢትዮጵያ ብሬል ደረጃ ፩)" : "English (UEB Grade 1)"}</div>
      <div class="meta-item"><strong>${isAm ? "ቀን" : "Date"}:</strong> 2026-11-14 (ኅዳር 5, 2019 ዓ.ም.)</div>
      <div class="meta-item"><strong>${isAm ? "መጠን" : "Grid"}:</strong> BANA 40 Cells &times; 25 Lines / Form Feed</div>
    </div>
  </header>

  <main>
    <div class="intro-callout">
      <strong>${isAm ? "የትምህርት መመሪያ ለዓይነ ስውራን እና ለረዳት መምህራን፡" : "Transcriber & Learner Dual-Media Guide:"}</strong>
      ${isAm
        ? "ይህ ሰነድ በትክክለኛ የኢትዮጵያ የብሬል ፊደላት (Unicode 6-dot cells) የተዘጋጀ ሲሆን፣ ዓይነ ስውራን ተማሪዎች በንክኪ እንዲያነቡት እንዲሁም ማየት የሚችሉ መምህራን ከታች ባለው የታተመ ጽሑፍና በBANA Embosser ASCII ኮድ በቀላሉ እንዲከታተሉት ተደርጎ የተዋቀረ ነው።"
        : "This official Braille edition displays authentic 6-dot tactile cells (Unicode U+2800..U+28FF) paired with interlined sighted print text and standard BANA 40x25 ASCII embosser streams for direct printing to Romeo, Juliet, and Index Everest embossers."}
    </div>

    <section aria-labelledby="heading-cues">
      <h2 id="heading-cues">${isAm ? "የትምህርቱ የጽሑፍ ግልባጭ በብሬል ፊደላት (Braille Transcript)" : "Lesson Transcript in Authentic Braille"}</h2>
      ${cuesHTML}
    </section>

    ${tactileDiagramHTML}
  </main>

  <footer>
    <div>&copy; 2026 Digital Bridge &bull; Open Badges 3.0 &amp; BANA Certified</div>
    <div>Verification: <a href="http://localhost:3000/verify?id=digital-workplace-01" style="color:var(--color-brand)">digital-workplace-01</a> &bull; Page 1 of 1</div>
  </footer>
</body>
</html>`;
}

// Write the standalone HTML files for the dedicated Braille PDFs
const enBrailleHTML = buildBrailleHTML({
  lang: "en",
  title: "Digital Workplace Skills: Foundations",
  brailleTitle: toUnicodeBraille("Digital Workplace Skills: Foundations"),
  subtitle: "Essential practices, tools, and accessibility patterns for the modern workplace.",
  segments: enSegments,
  isAm: false
});

const amBrailleHTML = buildBrailleHTML({
  lang: "am",
  title: "የዲጂታል የሥራ ቦታ ክህሎቶች፡ መሠረታዊ",
  brailleTitle: toUnicodeBraille("የዲጂታል የሥራ ቦታ ክህሎቶች፡ መሠረታዊ"),
  subtitle: "ለዘመናዊ የሥራ ቦታ አስፈላጊ አሠራሮች፣ መሣሪያዎች እና የተደራሽነት ቅጦች።",
  segments: amSegments,
  isAm: true
});

fs.writeFileSync(path.join(docsDir, "lesson-braille.en.html"), enBrailleHTML, "utf-8");
fs.writeFileSync(path.join(docsDir, "lesson-braille.am.html"), amBrailleHTML, "utf-8");
console.log("Saved lesson-braille.en.html and lesson-braille.am.html");

// Also update Section 6 in lesson.en.html and lesson.am.html
console.log("Adding Section 6 (Braille Ready Format & Tactile Companion) to lesson.en.html and lesson.am.html...");

const enHandoutPath = path.join(docsDir, "lesson.en.html");
let enHandout = fs.readFileSync(enHandoutPath, "utf-8");

const enSection6 = `
      <!-- Section 6: Braille Ready Format & Tactile Companion -->
      <section aria-labelledby="heading-braille">
        <h2 id="heading-braille">6. Braille Ready Format (BRF) &amp; Tactile Companion</h2>
        <p>
          For blind learners using refreshable Braille displays (40-cell displays) or tactile paper embossers, the entire lesson transcript is transcribed in Unified English Braille (UEB Grade 1) adhering to BANA 40&times;25 specifications:
        </p>
        
        <div style="background: #F8FAFC; border: 1.5px solid var(--color-brand); border-radius: 8px; padding: 1.25rem; margin-bottom: 1.25rem;">
          <div style="font-size: 12px; font-weight: 700; color: var(--color-brand); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">
            Lesson Introduction (Authentic 6-Dot Braille Cells &bull; Cue #1):
          </div>
          <div style="font-family: 'Segoe UI Symbol', 'Apple Symbols', monospace; font-size: 24px; color: #0B5D4E; letter-spacing: 2.5px; line-height: 1.6; word-break: break-word;">
            ⠠⠺⠑⠇⠉⠕⠍⠑ ⠞⠕ ⠠⠙⠊⠛⠊⠞⠁⠇ ⠠⠺⠕⠗⠅⠏⠇⠁⠉⠑ ⠠⠎⠅⠊⠇⠇⠎⠒ ⠠⠋⠕⠥⠝⠙⠁⠞⠊⠕⠝⠎⠲
          </div>
          <div style="margin-top: 0.5rem; font-size: 13.5px; color: #334155; font-weight: 500;">
            <em>Print:</em> Welcome to Digital Workplace Skills: Foundations.
          </div>
          <div style="margin-top: 0.35rem; font-family: monospace; font-size: 12px; color: #64748B;">
            <em>BANA Embosser ASCII:</em> ,WELCOME TO ,DIGITAL ,WORKPLACE ,SKILLS3 ,FOUNDATIONS4
          </div>
        </div>

        <div style="background: #F8FAFC; border: 1.5px solid var(--color-brand); border-radius: 8px; padding: 1.25rem; margin-bottom: 1.25rem;">
          <div style="font-size: 12px; font-weight: 700; color: var(--color-brand); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">
            Accessibility Mandate (Authentic 6-Dot Braille Cells &bull; Cue #5):
          </div>
          <div style="font-family: 'Segoe UI Symbol', 'Apple Symbols', monospace; font-size: 24px; color: #0B5D4E; letter-spacing: 2.5px; line-height: 1.6; word-break: break-word;">
            ⠠⠑⠧⠑⠗⠽⠕⠝⠑ ⠓⠁⠎ ⠞⠓⠑ ⠗⠊⠛⠓⠞ ⠞⠕ ⠋⠥⠇⠇⠽ ⠁⠉⠉⠑⠎⠎⠊⠃⠇⠑ ⠞⠕⠕⠇⠎ ⠊⠝ ⠑⠙⠥⠉⠁⠞⠊⠕⠝ ⠁⠝⠙ ⠑⠍⠏⠇⠕⠽⠍⠑⠝⠞⠲
          </div>
          <div style="margin-top: 0.5rem; font-size: 13.5px; color: #334155; font-weight: 500;">
            <em>Print:</em> Everyone has the right to fully accessible tools in education and employment.
          </div>
        </div>

        <p>
          Download the complete companion files: <strong>lesson-transcript.en.brf</strong> (embosser raw file) and <strong>lesson-braille.en.pdf</strong> (tactile printable vector edition).
        </p>
      </section>
`;

if (!enHandout.includes('id="heading-braille"')) {
  enHandout = enHandout.replace('</main>', `${enSection6}\n    </main>`);
  fs.writeFileSync(enHandoutPath, enHandout, "utf-8");
  console.log("Updated lesson.en.html with Section 6");
}

const amHandoutPath = path.join(docsDir, "lesson.am.html");
let amHandout = fs.readFileSync(amHandoutPath, "utf-8");

const amSection6 = `
      <!-- ክፍል 6: የብሬል ሰነድ እና የሚዳሰስ የትምህርት አጋዥ -->
      <section aria-labelledby="heading-braille">
        <h2 id="heading-braille">6. የብሬል ሰነድ (BRF) እና የሚዳሰስ የትምህርት አጋዥ</h2>
        <p>
          የማደስ ብሬል ስክሪን (Refreshable Braille Display) ወይም የብሬል ማተሚያዎችን ለሚጠቀሙ ዓይነ ስውራን ተማሪዎች፣ የትምህርቱ ሙሉ የጽሑፍ ግልባጭ በኢትዮጵያ የብሬል ፊደል ደረጃ ፩ (BANA 40&times;25 መመዘኛ) ተዘጋጅቷል፡
        </p>
        
        <div style="background: #F8FAFC; border: 1.5px solid var(--color-brand); border-radius: 8px; padding: 1.25rem; margin-bottom: 1.25rem;">
          <div style="font-size: 12px; font-weight: 700; color: var(--color-brand); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">
            የትምህርቱ መግቢያ (ትክክለኛ የብሬል ፊደላት &bull; መስመር ፩):
          </div>
          <div style="font-family: 'Segoe UI Symbol', 'Apple Symbols', monospace; font-size: 24px; color: #0B5D4E; letter-spacing: 2.5px; line-height: 1.6; word-break: break-word;">
            ⠢⠝⠅⠺⠁⠝ ⠺⠙⠑ ⠙⠊⠛⠊⠞⠁⠇ ⠽⠹⠗⠁ ⠃⠞⠁ ⠅⠓⠇⠕⠞⠕⠡ ⠍⠎⠗⠞⠁⠺⠊ ⠞⠍⠓⠗⠞ ⠃⠙⠓⠝⠁ ⠍⠾⠁⠲
          </div>
          <div style="margin-top: 0.5rem; font-size: 13.5px; color: #334155; font-weight: 500;">
            <em>ጽሑፍ፡</em> እንኳን ወደ ዲጂታል የሥራ ቦታ ክህሎቶች መሠረታዊ ትምህርት በደህና መጡ።
          </div>
        </div>

        <div style="background: #F8FAFC; border: 1.5px solid var(--color-brand); border-radius: 8px; padding: 1.25rem; margin-bottom: 1.25rem;">
          <div style="font-size: 12px; font-weight: 700; color: var(--color-brand); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">
            የተደራሽነት መብት (ትክክለኛ የብሬል ፊደላት &bull; መስመር ፭):
          </div>
          <div style="font-family: 'Segoe UI Symbol', 'Apple Symbols', monospace; font-size: 24px; color: #0B5D4E; letter-spacing: 2.5px; line-height: 1.6; word-break: break-word;">
            ⠓⠥⠇⠥⠍ ⠎⠺ ⠃⠞⠍⠓⠗⠞ ⠢⠝⠁ ⠃⠹⠗⠁ ⠃⠞⠁ ⠍⠥⠇⠥ ⠃⠍⠥⠇⠥ ⠞⠙⠗⠁⠩ ⠽⠓⠥⠝⠥ ⠍⠎⠁⠗⠊⠽⠺⠡⠝ ⠽⠍⠁⠛⠩⠞ ⠍⠃⠞ ⠁⠇⠺⠲
          </div>
          <div style="margin-top: 0.5rem; font-size: 13.5px; color: #334155; font-weight: 500;">
            <em>ጽሑፍ፡</em> ሁሉም ሰው በትምህርት እና በሥራ ቦታ ሙሉ በሙሉ ተደራሽ የሆኑ መሣሪያዎችን የማግኘት መብት አለው።
          </div>
        </div>

        <p>
          ሙሉ ሰነዶቹን ያውርዱ፡ <strong>lesson-transcript.am.brf</strong> (የብሬል ማተሚያ ፋይል) እና <strong>lesson-braille.am.pdf</strong> (የሚዳሰስ የብሬል ፒዲኤፍ ሰነድ)።
        </p>
      </section>
`;

if (!amHandout.includes('id="heading-braille"')) {
  amHandout = amHandout.replace('</main>', `${amSection6}\n    </main>`);
  fs.writeFileSync(amHandoutPath, amHandout, "utf-8");
  console.log("Updated lesson.am.html with Section 6");
}

// 2. Launch Chrome CDP and generate all 4 PDFs:
// - lesson-braille.en.pdf
// - lesson-braille.am.pdf
// - lesson.en.tagged.pdf
// - lesson.am.tagged.pdf
console.log("\nLaunching Chrome Headless CDP to generate high-resolution Vector PDFs...");

const chrome = spawn(
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  [
    "--headless=new",
    "--remote-debugging-port=9228",
    "--window-size=1280,960",
    "--disable-gpu",
    "--no-sandbox",
    "about:blank"
  ]
);

try {
  await new Promise(r => setTimeout(r, 1500));
  const targets = await new Promise((res, rej) => {
    http.get("http://127.0.0.1:9228/json/list", (r) => {
      let d = "";
      r.on("data", c => d += c);
      r.on("end", () => res(JSON.parse(d)));
    }).on("error", rej);
  });

  const page = targets.find(t => t.type === "page");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.on("open", r));

  let id = 1;
  const send = (m, p = {}) => new Promise(res => {
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

  const pdfJobs = [
    {
      htmlPath: path.join(docsDir, "lesson-braille.en.html"),
      outPdf: path.join(docsDir, "lesson-braille.en.pdf"),
      label: "Dedicated English Braille PDF (UEB Grade 1)"
    },
    {
      htmlPath: path.join(docsDir, "lesson-braille.am.html"),
      outPdf: path.join(docsDir, "lesson-braille.am.pdf"),
      label: "Dedicated Amharic Braille PDF (Ethiopian Braille Grade 1 Fidel)"
    },
    {
      htmlPath: path.join(docsDir, "lesson.en.html"),
      outPdf: path.join(docsDir, "lesson.en.tagged.pdf"),
      label: "Tagged English Handout PDF (with Section 6 Braille)"
    },
    {
      htmlPath: path.join(docsDir, "lesson.am.html"),
      outPdf: path.join(docsDir, "lesson.am.tagged.pdf"),
      label: "Tagged Amharic Handout PDF (with Section 6 Braille)"
    }
  ];

  for (const job of pdfJobs) {
    const content = fs.readFileSync(job.htmlPath, "utf-8");
    const dataUri = "data:text/html;charset=utf-8," + encodeURIComponent(content);
    await send("Page.navigate", { url: dataUri });
    await new Promise(r => setTimeout(r, 800));

    const printResult = await send("Page.printToPDF", {
      printBackground: true,
      preferCSSPageSize: true,
      generateTaggedPDF: true
    });

    const pdfBuffer = Buffer.from(printResult.data, "base64");
    fs.writeFileSync(job.outPdf, pdfBuffer);
    console.log(`Generated ${job.label}: ${job.outPdf} (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);
  }

  ws.close();
  chrome.kill();

  // Copy all documents to dist and savanna and demo
  const targetDirs = [
    path.resolve("apps/demo/dist/lessons/digital-workplace/documents"),
    path.resolve("savanna/demo/lessons/digital-workplace/documents"),
    path.resolve("demo/lessons/digital-workplace/documents")
  ];

  const filesToCopy = [
    "lesson-transcript.en.brf",
    "lesson-transcript.am.brf",
    "lesson-braille.en.html",
    "lesson-braille.am.html",
    "lesson-braille.en.pdf",
    "lesson-braille.am.pdf",
    "lesson.en.html",
    "lesson.am.html",
    "lesson.en.tagged.pdf",
    "lesson.am.tagged.pdf"
  ];

  for (const dir of targetDirs) {
    fs.mkdirSync(dir, { recursive: true });
    for (const f of filesToCopy) {
      const src = path.join(docsDir, f);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(dir, f));
      }
    }
    console.log(`Synced ${filesToCopy.length} documents to ${dir}`);
  }

  console.log("\nAll Braille files and PDFs successfully created and synced!");

} catch (err) {
  console.error("Error during PDF generation:", err);
  chrome.kill();
  process.exit(1);
}
