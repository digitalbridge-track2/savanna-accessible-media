import React, { useState } from "react";
import { SupportedLocale } from "@abugida/media-kit";
import { NavLink } from "../router";
import { IconCopy, IconCheck, IconExternal } from "../components/Icons";

/**
 * Syntax highlighter for HTML / TSX integration code.
 * Matches colors directly to standard IDE code workspace aesthetics:
 * - Comments: #4A607A (italic slate)
 * - Tags / Functions: #4D92FF (vivid sky blue, matching `print`)
 * - Attributes: #E5C07B (warm gold)
 * - Strings: #A6D854 (lime yellow-green)
 * - Delimiters / Brackets: #7EC7D8 (cyan)
 * - Keywords: #C678DD (purple)
 */
function highlightSyntaxLine(line: string): React.ReactNode[] {
  if (!line || line.trim() === "") {
    return [<span key="empty">&nbsp;</span>];
  }

  const trimmed = line.trim();
  if (trimmed.startsWith("<!--") || trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
    return [
      <span key="comment" style={{ color: "#4A607A", fontStyle: "italic" }}>
        {line}
      </span>,
    ];
  }

  const tokenRegex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(<\/?[a-zA-Z0-9_-]+)|(\/?>)|\b(import|from|export|default|const|let|var|return)\b|([a-zA-Z0-9_-]+)(?==)|\b(defer|async|required)\b|([=;:,()\{\}])|(\s+)|([^"'\s<>\/=;:,()\{\}]+)/g;

  const elements: React.ReactNode[] = [];
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = tokenRegex.exec(line)) !== null) {
    const [, str, tag, angle, kw, attr, booleanAttr, punct, space, text] = match;
    const key = `t-${idx++}`;

    if (str) {
      elements.push(<span key={key} style={{ color: "#A6D854" }}>{str}</span>);
    } else if (tag) {
      const isClosing = tag.startsWith("</");
      const bracket = isClosing ? "</" : "<";
      const name = tag.slice(bracket.length);
      elements.push(
        <span key={key}>
          <span style={{ color: "#7EC7D8" }}>{bracket}</span>
          <span style={{ color: "#4D92FF", fontWeight: 600 }}>{name}</span>
        </span>
      );
    } else if (angle) {
      elements.push(<span key={key} style={{ color: "#7EC7D8" }}>{angle}</span>);
    } else if (kw) {
      elements.push(<span key={key} style={{ color: "#C678DD", fontWeight: 600 }}>{kw}</span>);
    } else if (attr || booleanAttr) {
      elements.push(<span key={key} style={{ color: "#E5C07B" }}>{attr || booleanAttr}</span>);
    } else if (punct) {
      elements.push(<span key={key} style={{ color: "#7EC7D8" }}>{punct}</span>);
    } else if (space) {
      elements.push(<span key={key}>{space}</span>);
    } else if (text) {
      elements.push(<span key={key} style={{ color: "#ABB2BF" }}>{text}</span>);
    }
  }

  return elements.length > 0 ? elements : [line];
}

interface EmbedTexts {
  pageTitle: string;
  pageSubtitle: string;
  tabScript: string;
  tabModule: string;
  tabIframe: string;
  copiedAlert: string;
  copySnippetBtn: string;
  copyBtn: string;
  copiedBtn: string;
  iframeTitle: string;
  lineFocusTitle: (lineNum: number) => string;
  encapsulationHeading: string;
  encapsulationDesc: string;
  feat1Title: string;
  feat1Desc: string;
  feat2Title: string;
  feat2Desc: string;
  feat3Title: string;
  feat3Desc: string;
  livePlayerBtn: string;
}

const EMBED_TEXTS: Record<SupportedLocale, EmbedTexts> = {
  en: {
    pageTitle: "Level 1: Embed & Developer Integration Console",
    pageSubtitle: "Zero-dependency drop-in for existing platforms (Savanna LMS, Moodle, Canvas, WordPress). Drop a single tag into any CMS or framework.",
    tabScript: "Script Tag (HTML Drop-in)",
    tabModule: "ES Module / npm",
    tabIframe: "Iframe Sandbox",
    copiedAlert: "Snippet copied to clipboard.",
    copySnippetBtn: "Copy Snippet",
    copyBtn: "Copy",
    copiedBtn: "Copied!",
    iframeTitle: "Accessible Learning Media Player",
    lineFocusTitle: (lineNum) => `Line ${lineNum} (click to focus)`,
    encapsulationHeading: "Encapsulation & Shadow DOM Architecture",
    encapsulationDesc: "The media player encapsulates all styles, keybind handlers, and ARIA tree branches inside an isolated Shadow DOM root, guaranteeing zero style leaks or host-page interference.",
    feat1Title: "1. Zero Runtime Dependencies",
    feat1Desc: "Ships as a 38 KB tree-shaken UMD bundle. No framework prerequisites or peer dependencies needed.",
    feat2Title: "2. Declarative Attributes",
    feat2Desc: "Reflects runtime DOM attributes dynamically: changing locale immediately updates captions, labels, and ESL sync.",
    feat3Title: "3. Certified A11y Suite",
    feat3Desc: "Engineered with 0 critical axe-core violations, ARIA 1.2 toolbar patterns, synchronized ESL, and AD audio.",
    livePlayerBtn: "Experience Live Classroom Player",
  },
  am: {
    pageTitle: "ደረጃ 1፡ የስክሪፕት ታግ እና የማካተቻ ኮንሶል",
    pageSubtitle: "ለነባር የትምህርት መድረኮች (Savanna LMS፣ Moodle፣ Canvas፣ WordPress) ያለምንም የግንባታ ቅድመ ሁኔታ በአንድ መስመር ኮድ በቀላሉ ይጫኑ።",
    tabScript: "የስክሪፕት ታግ (HTML)",
    tabModule: "ES Module / npm",
    tabIframe: "Iframe ሳንድቦክስ",
    copiedAlert: "ኮዱ ተገልብጧል።",
    copySnippetBtn: "ኮዱን ቅዳ",
    copyBtn: "ቅዳ",
    copiedBtn: "ተገልብጧል!",
    iframeTitle: "ተደራሽ የቪዲዮ ማጫወቻ",
    lineFocusTitle: (lineNum) => `መስመር ${lineNum} (ጠቅ ያድርጉ)`,
    encapsulationHeading: "የ Shadow DOM ደህንነት እና ማግለል",
    encapsulationDesc: "አቡጊዳ ሚዲያ ኪት በራሱ ጥላ DOM (Shadow DOM) ውስጥ ተዘግቶ ስለሚሰራ አስተናጋጁ ገጽ ምንም ዓይነት የ CSS ወይም የስክሪፕት ግጭት አይገጥመውም።",
    feat1Title: "1. ዜሮ ውጫዊ ጥገኝነት",
    feat1Desc: "ምንም አይነት React፣ Vue ወይም ውጫዊ የ CSS ማዕቀፍ አያስፈልገውም። በንጹህ Web Standards የተገነባ።",
    feat2Title: "2. ተለዋዋጭ ቋንቋ እና ምርጫዎች",
    feat2Desc: "የቋንቋ እና የቪዲዮ ምንጭ ቅንብሮችን በ HTML attributes (`locale=\"am\"`, `manifest-src=\"...\"`) በቀላሉ ይቀይሩ።",
    feat3Title: "3. WCAG 2.2 AAA ተደራሽነት",
    feat3Desc: "በአክስ-ኮር (Axe-Core) የተፈተነ 0 ስህተት፣ ሙሉ የኪቦርድ አሰሳ፣ የኢትዮጵያ ምልክት ቋንቋ እና የድምፅ ማብራሪያ።",
    livePlayerBtn: "ተደራሽ የክፍል ተሞክሮውን ይክፈቱ",
  },
  om: {
    pageTitle: "Sadarkaa 1: Koodii Maxxansaa fi Qindeessaa Hojjettootaa",
    pageSubtitle: "Sirnoota barnootaa jiraniif (Savanna LMS, Moodle, Canvas, WordPress) qophii dabalataa malee sarara koodii tokkoon salphatti maxxansaa.",
    tabScript: "Koodii HTML (Script Tag)",
    tabModule: "ES Module / npm",
    tabIframe: "Iframe Saandiboksii",
    copiedAlert: "Koodichi garagalffameera.",
    copySnippetBtn: "Koodii Garagalchi",
    copyBtn: "Garagalchi",
    copiedBtn: "Garagalffameera!",
    iframeTitle: "Taphachiisaa Miidiyaa Barnootaa Hundaaf Mijataa",
    lineFocusTitle: (lineNum) => `Sarara ${lineNum} (cuqaasi)`,
    encapsulationHeading: "Ijaarsa Shadow DOM fi Nageenya Eegumsaa",
    encapsulationDesc: "Taphachiisaan miidiyaa kun seera Shadow DOM qulqulluu waan fayyadamuuf haala uffata CSS ykn koodii fuula keessanii waliin wal hin dhabu.",
    feat1Title: "1. Hirkattoota Alaa Malee",
    feat1Desc: "React, Vue ykn feerimwoorkii biraa hin barbaadu. Ulaagaalee weebii qulqulluudhaan ijaarame.",
    feat2Title: "2. Amaloota Ibsamoo (Declarative)",
    feat2Desc: "Qindaa'ina afaanii fi maddaa akka locale=\"om\" battalatti barreeffama sagalee fi mallattoo jijjiira.",
    feat3Title: "3. Qaqqabummaa WCAG 2.2 AAA",
    feat3Desc: "Dogoggora Axe-Core 0, adeemsa kiiboordii guutuu, Afaan Mallattoo Itoophiyaa fi ibsa sagalee qaba.",
    livePlayerBtn: "Taphachiisaa Kutaa Barnootaa Qabatamaa Bani",
  },
  ti: {
    pageTitle: "ደረጃ 1፡ ናይ ስክሪፕት ታግን ምትእስሳር ኮንሶልን",
    pageSubtitle: "ንዝጸንሑ ናይ ትምህርቲ መድረኻት (Savanna LMS፣ Moodle፣ Canvas፣ WordPress) ብዘይ ገለ ናይ ህንጸት ቅድመ-ኩነት ብሓንቲ መስመር ኮድ ብቐሊሉ ሰኹቱ።",
    tabScript: "ናይ ስክሪፕት ታግ (HTML)",
    tabModule: "ES Module / npm",
    tabIframe: "Iframe ሳንድቦክስ",
    copiedAlert: "ኮድ ተቐዲሑ ኣሎ።",
    copySnippetBtn: "ኮድ ቅዳሕ",
    copyBtn: "ቅዳሕ",
    copiedBtn: "ተቐዲሑ!",
    iframeTitle: "ተበጻሒ ናይ ቪድዮ መጫወቲ",
    lineFocusTitle: (lineNum) => `መስመር ${lineNum} (ጠውቑ)`,
    encapsulationHeading: "ናይ Shadow DOM ውሕስነትን ምፍላይን",
    encapsulationDesc: "አቡጊዳ ሚዲያ ኪት ኣብ ውሽጢ Shadow DOM ተዓጽዩ ስለዝሰርሕ፡ ምስቲ ዘአንግዶ ዘሎ ገጽ ዝኾነ ዓይነት ናይ CSS ወይ ስክሪፕት ግጭት ኣየጋጥሞን።",
    feat1Title: "1. ዜሮ ናይ ግዳም ጽግዕተኛታት",
    feat1Desc: "ዝኾነ React፣ Vue ወይ ናይ ግዳም CSS ፍሬምዎርክ ኣየድልዮን። ብንጹህ ናይ ወብ መዐቀኒታት ዝተሃነጸ።",
    feat2Title: "2. ተለዋዋጢ ቋንቋን ምርጫታትን",
    feat2Desc: "ናይ ቋንቋን ምንጪ ቪድዮን ቅጥዕታት ብ HTML attributes (`locale=\"ti\"`) ብቐሊሉ ቀይሩ።",
    feat3Title: "3. WCAG 2.2 AAA ተበጻሕነት",
    feat3Desc: "ብAxe-Core ዝተፈተነ 0 ጌጋታት፣ ምሉእ ናይ ኪቦርድ ምጉዓዝ፣ ናይ ኢትዮጵያ ምልክት ቋንቋን ናይ ድምጺ መብርህን ዘጠቓለለ።",
    livePlayerBtn: "ተበጻሒ ናይ ክፍሊ ተመኩሮ ክፈቱ",
  },
  so: {
    pageTitle: "Heerka 1: Qalabka Maxalliga ah & Qunsulka Isku-dhafka Horumariyaha",
    pageSubtitle: "Ku dar madal kasta oo hore u jirtay (Savanna LMS, Moodle, Canvas, WordPress) adigoo isticmaalaya hal khad oo koodh ah adigoon u baahnayn wax kale.",
    tabScript: "Koodhka HTML (Script Tag)",
    tabModule: "ES Module / npm",
    tabIframe: "Iframe Sandbox",
    copiedAlert: "Koodhka waa la koobiyeeyay.",
    copySnippetBtn: "Koobiyee Koodhka",
    copyBtn: "Koobiyee",
    copiedBtn: "Waa la koobiyeeyay!",
    iframeTitle: "Ciyaaryahanka Warbaahinta Waxbarashada ee La Heli Karo",
    lineFocusTitle: (lineNum) => `Khadka ${lineNum} (riix)`,
    encapsulationHeading: "Dhismaha Shadow DOM & Ilaalinta Nidaamka",
    encapsulationDesc: "Ciyaaryahanka warbaahintu wuxuu ku dhex shaqeeyaa Shadow DOM gooni ah, taasoo dammaanad qaadaysa inaysan jirin wax isku dhac ah oo dhanka CSS ama koodhka ah.",
    feat1Title: "1. Wax Ku Tiirsan Ma Jiro",
    feat1Desc: "Uma baahna React, Vue ama qaab dhismeed kale. Waxaa lagu dhisay halbeegyada rasmiga ah ee shabakadda.",
    feat2Title: "2. Astaamaha La Sheego",
    feat2Desc: "Beddelka luqadda sida locale=\"so\" waxay isla markiiba cusboonaysiisaa qoraallada iyo hagaha luqadda dhegoolaha.",
    feat3Title: "3. Helitaanka WCAG 2.2 AAA",
    feat3Desc: "Waxaa lagu tijaabiyay Axe-Core iyadoo leh 0 khaladaad ah, isticmaalka kiiboodhka oo buuxa, iyo Luqadda Dhegoolaha Itoobiya.",
    livePlayerBtn: "Fur Qalabka Fasalka ee Tooska ah",
  },
};

export const EmbedView: React.FC<{ locale: SupportedLocale }> = ({ locale }) => {
  const [copied, setCopied] = useState(false);
  const [embedType, setEmbedType] = useState<"script" | "customElement" | "iframe">("script");
  const [activeLineIndex, setActiveLineIndex] = useState<number>(5);
  const t = EMBED_TEXTS[locale] || EMBED_TEXTS.en;

  const hostOrigin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "https://savanna.alxafrica.com";

  const snippets = {
    script: {
      fileName: "index.html",
      language: "HTML5 Custom Element",
      path: "public > index.html",
      defaultLine: 5,
      code: `<!-- 1. Include Abugida Media Kit Script in your HTML <head> or <body> -->
<script src="${hostOrigin}/module/a11y-media-player.js" defer></script>

<!-- 2. Mount the accessible media player anywhere in your page or LMS -->
<a11y-media-player
  manifest-src="${hostOrigin}/manifests/lesson.json"
  locale="${locale}">
</a11y-media-player>`,
    },
    customElement: {
      fileName: "App.tsx",
      language: "TypeScript / JSX",
      path: "src > components > App.tsx",
      defaultLine: 5,
      code: `// 1. In your modern React / Vue / Vite / Webpack project:
import "@abugida/media-kit";

// 2. Use directly in JSX / templates with zero configuration:
<a11y-media-player
  manifest-src="/manifests/lesson.json"
  locale="${locale}">
</a11y-media-player>`,
    },
    iframe: {
      fileName: "embed.html",
      language: "HTML5 Iframe",
      path: "templates > embed.html",
      defaultLine: 2,
      code: `<!-- 1. Responsive Accessible Iframe Embed (Sandboxed) -->
<iframe
  src="${hostOrigin}/lesson?embed=true"
  width="100%"
  height="640"
  frameborder="0"
  allow="autoplay; fullscreen; encrypted-media"
  title="${t.iframeTitle}"
  style="border-radius: 14px; border: 1px solid #D2D2D7;">
</iframe>`,
    },
  };

  const currentSnippet = snippets[embedType];
  const lines = currentSnippet.code.split("\n");

  const handleSelectTab = (type: "script" | "customElement" | "iframe") => {
    setEmbedType(type);
    setActiveLineIndex(snippets[type].defaultLine);
  };

  const handleCopy = async () => {
    let success = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(currentSnippet.code);
        success = true;
      }
    } catch {
      // Fallback below
    }

    if (!success) {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = currentSnippet.code;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch (e) {
        console.warn("Clipboard copy fallback failed:", e);
      }
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div>
      <h2 style={{ fontSize: "34px", color: "var(--color-ink)", marginBottom: "0.5rem", letterSpacing: "-0.011em" }}>
        {t.pageTitle}
      </h2>
      <p style={{ margin: "0 0 2rem 0", color: "var(--color-muted-ink)", fontSize: "17px" }}>
        {t.pageSubtitle}
      </p>

      {/* Code Snippet Card */}
      <section
        className="card"
        style={{
          marginBottom: "2.5rem",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-card)",
          padding: "1.75rem",
        }}
      >
        {/* Tab Switcher & Status Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              className={`btn ${embedType === "script" ? "btn-primary" : "btn-outline"}`}
              onClick={() => handleSelectTab("script")}
              style={{ fontSize: "13px", padding: "0.4rem 0.9rem", minHeight: "34px" }}
              aria-pressed={embedType === "script"}
            >
              {t.tabScript}
            </button>
            <button
              type="button"
              className={`btn ${embedType === "customElement" ? "btn-primary" : "btn-outline"}`}
              onClick={() => handleSelectTab("customElement")}
              style={{ fontSize: "13px", padding: "0.4rem 0.9rem", minHeight: "34px" }}
              aria-pressed={embedType === "customElement"}
            >
              {t.tabModule}
            </button>
            <button
              type="button"
              className={`btn ${embedType === "iframe" ? "btn-primary" : "btn-outline"}`}
              onClick={() => handleSelectTab("iframe")}
              style={{ fontSize: "13px", padding: "0.4rem 0.9rem", minHeight: "34px" }}
              aria-pressed={embedType === "iframe"}
            >
              {t.tabIframe}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {copied && (
              <span
                role="status"
                style={{
                  fontSize: "13px",
                  color: "#128045",
                  fontWeight: 500,
                  background: "#E8F8F0",
                  padding: "0.35rem 0.85rem",
                  borderRadius: "var(--radius-pill)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                <IconCheck size={14} />
                <span>{t.copiedAlert}</span>
              </span>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCopy}
              style={{ minHeight: "36px", padding: "0.45rem 1.15rem", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "0.45rem" }}
            >
              <IconCopy size={14} />
              <span>{t.copySnippetBtn}</span>
            </button>
          </div>
        </div>

        {/* Realistic IDE Code Workspace Container */}
        <div
          className="code-workspace-window"
          style={{
            background: "#131926",
            borderRadius: "14px",
            border: "1px solid #232B3E",
            boxShadow: "0 18px 36px rgba(0, 0, 0, 0.35), 0 1px 3px rgba(0, 0, 0, 0.2)",
            overflow: "hidden",
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
        >
          {/* Workspace Chrome / Header */}
          <div
            style={{
              background: "#182030",
              borderBottom: "1px solid #232B3E",
              padding: "0.6rem 1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            {/* Left: macOS Traffic Lights & Active Editor Tab */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }} aria-hidden="true">
                <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#FF5F56", display: "inline-block", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)" }} />
                <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#FFBD2E", display: "inline-block", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)" }} />
                <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#27C93F", display: "inline-block", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)" }} />
              </div>

              {/* Active Tab */}
              <div
                style={{
                  background: "#131926",
                  borderTop: "2px solid #4D92FF",
                  borderLeft: "1px solid #232B3E",
                  borderRight: "1px solid #232B3E",
                  borderBottom: "none",
                  padding: "0.25rem 0.85rem",
                  borderRadius: "6px 6px 0 0",
                  fontSize: "12.5px",
                  color: "#E6EDF3",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  fontWeight: 500,
                }}
              >
                <span style={{ color: "#E5C07B", fontSize: "11px" }}>&lt;/&gt;</span>
                <span>{currentSnippet.fileName}</span>
                <span style={{ fontSize: "10px", color: "#6E7681", marginLeft: "2px" }}>•</span>
              </div>

              <span style={{ fontSize: "11px", color: "#6E7681" }}>
                {currentSnippet.path}
              </span>
            </div>

            {/* Right: Language Pill, Lines Count, Quick Copy */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <span
                style={{
                  fontSize: "11px",
                  color: "#8B949E",
                  background: "rgba(255, 255, 255, 0.06)",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  letterSpacing: "0.03em",
                }}
              >
                {currentSnippet.language}
              </span>
              <span style={{ fontSize: "11px", color: "#6E7681" }}>
                {lines.length} lines
              </span>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  background: copied ? "#1F6FEB" : "rgba(255, 255, 255, 0.08)",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "6px",
                  padding: "0.3rem 0.75rem",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontFamily: "inherit",
                }}
                title={t.copySnippetBtn}
              >
                {copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
                <span>{copied ? t.copiedBtn : t.copyBtn}</span>
              </button>
            </div>
          </div>

          {/* Workspace Body: Line Numbers + Highlighted Code Lines */}
          <div
            style={{
              padding: "1rem 0",
              overflowX: "auto",
              fontSize: "13.5px",
              lineHeight: "1.65",
            }}
          >
            {lines.map((line, idx) => {
              const lineNum = idx + 1;
              const isActive = lineNum === activeLineIndex;

              return (
                <div
                  key={lineNum}
                  onClick={() => setActiveLineIndex(lineNum)}
                  style={{
                    display: "flex",
                    background: isActive ? "#1C263C" : "transparent",
                    cursor: "pointer",
                    position: "relative",
                    minWidth: "max-content",
                    width: "100%",
                    transition: "background 0.12s ease",
                  }}
                  title={t.lineFocusTitle(lineNum)}
                >
                  {/* Active Line Left Marker */}
                  {isActive && (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: "3px",
                        background: "#4D92FF",
                      }}
                    />
                  )}

                  {/* Line Number Gutter */}
                  <div
                    style={{
                      width: "44px",
                      paddingRight: "16px",
                      textAlign: "right",
                      color: isActive ? "#7EC7D8" : "#3D4963",
                      userSelect: "none",
                      fontSize: "12.5px",
                      flexShrink: 0,
                      fontFamily: "inherit",
                      borderRight: "1px solid #1E2638",
                      marginRight: "16px",
                    }}
                  >
                    {lineNum}
                  </div>

                  {/* Line Content */}
                  <div
                    style={{
                      paddingRight: "2rem",
                      whiteSpace: "pre",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {highlightSyntaxLine(line)}
                    {/* Blinking Cursor on Active Line */}
                    {isActive && (
                      <span
                        style={{
                          display: "inline-block",
                          width: "2px",
                          height: "1.1em",
                          background: "#4D92FF",
                          marginLeft: "3px",
                          verticalAlign: "text-bottom",
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integration Capabilities & Live Interactive Stage Navigator */}
      <section
        style={{
          background: "var(--color-surface-elevated)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-card)",
          padding: "2rem",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <h3 style={{ margin: "0 0 0.35rem 0", color: "var(--color-ink)", fontSize: "22px", fontWeight: 600 }}>
              {t.encapsulationHeading}
            </h3>
            <p style={{ margin: 0, color: "var(--color-muted-ink)", fontSize: "14px" }}>
              {t.encapsulationDesc}
            </p>
          </div>
          <span className="badge badge-brand">
            W3C Custom Elements v1
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.25rem",
            marginTop: "1.5rem",
            marginBottom: "1.75rem",
          }}
        >
          <div style={{ padding: "1.25rem", background: "var(--color-surface)", borderRadius: "12px", border: "1px solid var(--color-border-subtle)" }}>
            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "15px", color: "var(--color-ink)", fontWeight: 600 }}>
              {t.feat1Title}
            </h4>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--color-muted-ink)", lineHeight: 1.5 }}>
              {t.feat1Desc}
            </p>
          </div>

          <div style={{ padding: "1.25rem", background: "var(--color-surface)", borderRadius: "12px", border: "1px solid var(--color-border-subtle)" }}>
            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "15px", color: "var(--color-ink)", fontWeight: 600 }}>
              {t.feat2Title}
            </h4>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--color-muted-ink)", lineHeight: 1.5 }}>
              {t.feat2Desc}
            </p>
          </div>

          <div style={{ padding: "1.25rem", background: "var(--color-surface)", borderRadius: "12px", border: "1px solid var(--color-border-subtle)" }}>
            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "15px", color: "var(--color-ink)", fontWeight: 600 }}>
              {t.feat3Title}
            </h4>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--color-muted-ink)", lineHeight: 1.5 }}>
              {t.feat3Desc}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <NavLink
            to="/lesson"
            className="btn btn-primary"
            style={{ minHeight: "42px", padding: "0.6rem 1.4rem", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            <span>{t.livePlayerBtn}</span>
            <IconExternal size={14} />
          </NavLink>
        </div>
      </section>
    </div>
  );
};
