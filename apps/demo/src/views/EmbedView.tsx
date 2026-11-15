import React, { useState } from "react";
import { NavLink } from "../router";
import { IconCopy, IconCheck, IconExternal } from "../components/Icons";

export const EmbedView: React.FC<{ locale: "en" | "am" }> = ({ locale }) => {
  const [copied, setCopied] = useState(false);
  const [embedType, setEmbedType] = useState<"script" | "customElement" | "iframe">("script");
  const isAm = locale === "am";

  const snippets = {
    script: `<!-- 1. Include Abugida Media Kit Script in your HTML <head> or <body> -->
<script src="https://cdn.savanna.alxafrica.com/media-kit/v1/a11y-media-player.js" defer></script>

<!-- 2. Mount the custom element anywhere in your page or CMS (Moodle/Canvas) -->
<a11y-media-player
  manifest-src="https://cdn.savanna.alxafrica.com/lessons/digital-workplace/lesson.json"
  locale="${locale}">
</a11y-media-player>`,
    customElement: `// In your React / Vue / Angular / Webpack project:
import "@abugida/media-kit";

// Use directly in JSX:
<a11y-media-player
  manifest-src="/lessons/digital-workplace/lesson.json"
  locale="${locale}">
</a11y-media-player>`,
    iframe: `<!-- Responsive Accessible Iframe Embed -->
<iframe
  src="http://localhost:3000/lesson?embed=true"
  width="100%"
  height="640"
  frameborder="0"
  allow="autoplay; fullscreen; encrypted-media"
  title="${isAm ? "ተደራሽ የቪዲዮ ማጫወቻ" : "Accessible Learning Media Player"}"
  style="border-radius: 12px; border: 1px solid #D2D2D7;">
</iframe>`,
  };

  const activeSnippet = snippets[embedType];

  const handleCopy = async () => {
    let success = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(activeSnippet);
        success = true;
      }
    } catch {
      // Fallback below
    }

    if (!success) {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = activeSnippet;
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
        {isAm ? "ደረጃ 1፡ የስክሪፕት ታግ እና የማካተቻ ኮንሶል" : "Level 1: Embed & Developer Integration Console"}
      </h2>
      <p style={{ margin: "0 0 2rem 0", color: "var(--color-muted-ink)", fontSize: "17px" }}>
        {isAm
          ? "ለነባር የትምህርት መድረኮች (Savanna LMS፣ Moodle፣ Canvas፣ WordPress) ያለምንም የግንባታ ቅድመ ሁኔታ በአንድ መስመር ኮድ በቀላሉ ይጫኑ።"
          : "Zero-dependency drop-in for existing platforms (Savanna LMS, Moodle, Canvas, WordPress). Drop a single tag into any CMS or framework."}
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button
              type="button"
              className={`btn ${embedType === "script" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setEmbedType("script")}
              style={{ fontSize: "13px", padding: "0.4rem 0.9rem", minHeight: "34px" }}
            >
              {isAm ? "የስክሪፕት ታግ (HTML)" : "Script Tag (HTML Drop-in)"}
            </button>
            <button
              type="button"
              className={`btn ${embedType === "customElement" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setEmbedType("customElement")}
              style={{ fontSize: "13px", padding: "0.4rem 0.9rem", minHeight: "34px" }}
            >
              {isAm ? "ES Module / npm" : "ES Module / npm"}
            </button>
            <button
              type="button"
              className={`btn ${embedType === "iframe" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setEmbedType("iframe")}
              style={{ fontSize: "13px", padding: "0.4rem 0.9rem", minHeight: "34px" }}
            >
              {isAm ? "Iframe ሳንድቦክስ" : "Iframe Sandbox"}
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
                <span>{isAm ? "ኮዱ ተገልብጧል።" : "Snippet copied to clipboard."}</span>
              </span>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCopy}
              style={{ minHeight: "36px", padding: "0.45rem 1.15rem", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "0.45rem" }}
            >
              <IconCopy size={14} />
              <span>{isAm ? "ኮዱን ቅዳ" : "Copy Snippet"}</span>
            </button>
          </div>
        </div>

        <pre
          style={{
            background: "#1D1D1F",
            color: "#F5F5F7",
            padding: "1.25rem 1.5rem",
            borderRadius: "var(--radius-card)",
            overflowX: "auto",
            fontSize: "13px",
            lineHeight: 1.55,
            fontFamily: "var(--font-mono)",
            margin: 0,
            border: "1px solid #333336",
          }}
        >
          <code>{activeSnippet}</code>
        </pre>
      </section>

      {/* Integration Capabilities & Live Interactive Stage Navigator */}
      <section
        style={{
          background: "#FFFFFF",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-card)",
          padding: "2rem",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <h3 style={{ margin: "0 0 0.35rem 0", color: "var(--color-ink)", fontSize: "22px", fontWeight: 600 }}>
              {isAm ? "የ Shadow DOM ደህንነት እና ማግለል" : "Encapsulation & Shadow DOM Architecture"}
            </h3>
            <p style={{ margin: 0, color: "var(--color-muted-ink)", fontSize: "14px" }}>
              {isAm
                ? "አቡጊዳ ሚዲያ ኪት በራሱ ጥላ DOM (Shadow DOM) ውስጥ ተዘግቶ ስለሚሰራ አስተናጋጁ ገጽ ምንም ዓይነት የ CSS ወይም የስክሪፕት ግጭት አይገጥመውም።"
                : "The media player encapsulates all styles, keybind handlers, and ARIA tree branches inside an isolated Shadow DOM root, guaranteeing zero style leaks or host-page interference."}
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
              {isAm ? "1. ዜሮ ውጫዊ ጥገኝነት" : "1. Zero Runtime Dependencies"}
            </h4>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--color-muted-ink)", lineHeight: 1.5 }}>
              {isAm
                ? "ምንም አይነት React፣ Vue ወይም ውጫዊ የ CSS ማዕቀፍ አያስፈልገውም። በንጹህ Web Standards የተገነባ።"
                : "Ships as a 38 KB tree-shaken UMD bundle. No framework prerequisites or peer dependencies needed."}
            </p>
          </div>

          <div style={{ padding: "1.25rem", background: "var(--color-surface)", borderRadius: "12px", border: "1px solid var(--color-border-subtle)" }}>
            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "15px", color: "var(--color-ink)", fontWeight: 600 }}>
              {isAm ? "2. ተለዋዋጭ ቋንቋ እና ምርጫዎች" : "2. Declarative Attributes"}
            </h4>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--color-muted-ink)", lineHeight: 1.5 }}>
              {isAm
                ? "የቋንቋ እና የቪዲዮ ምንጭ ቅንብሮችን በ HTML attributes (`locale=\"am\"`, `manifest-src=\"...\"`) በቀላሉ ይቀይሩ።"
                : "Reflects runtime DOM attributes dynamically: changing `locale=\"am\"` immediately updates captions, labels, and ESL sync."}
            </p>
          </div>

          <div style={{ padding: "1.25rem", background: "var(--color-surface)", borderRadius: "12px", border: "1px solid var(--color-border-subtle)" }}>
            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "15px", color: "var(--color-ink)", fontWeight: 600 }}>
              {isAm ? "3. WCAG 2.2 AAA ተደራሽነት" : "3. Certified A11y Suite"}
            </h4>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--color-muted-ink)", lineHeight: 1.5 }}>
              {isAm
                ? "በአክስ-ኮር (Axe-Core) የተፈተነ 0 ስህተት፣ ሙሉ የኪቦርድ አሰሳ፣ የኢትዮጵያ ምልክት ቋንቋ እና የድምፅ ማብራሪያ።"
                : "Engineered with 0 critical axe-core violations, ARIA 1.2 toolbar patterns, synchronized ESL, and AD audio."}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <NavLink
            to="/lesson"
            className="btn btn-primary"
            style={{ minHeight: "42px", padding: "0.6rem 1.4rem", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            <span>{isAm ? "ተደራሽ የክፍል ተሞክሮውን ይክፈቱ" : "Experience Live Classroom Player"}</span>
            <IconExternal size={14} />
          </NavLink>
        </div>
      </section>
    </div>
  );
};
