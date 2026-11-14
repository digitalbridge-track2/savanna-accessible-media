import React, { useState } from "react";

export const EmbedView: React.FC<{ locale: "en" | "am" }> = ({ locale }) => {
  const [copied, setCopied] = useState(false);
  const isAm = locale === "am";

  const codeSnippet = `<!-- Level 1 Drop-in Script Tag (Zero build steps) -->
<script src="http://localhost:3000/dist/a11y-media-kit.umd.js"></script>

<!-- Accessible Media Player Web Component -->
<a11y-media-player
  manifest-src="http://localhost:3000/lessons/digital-workplace/lesson.json"
  locale="${locale}">
</a11y-media-player>`;

  const handleCopy = async () => {
    let success = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(codeSnippet);
        success = true;
      }
    } catch {
      // proceed to fallback
    }

    if (!success) {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = codeSnippet;
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
        {isAm ? "ደረጃ 1፡ የስክሪፕት ታግ አጠቃቀም" : "Level 1: Standalone Script-Tag Embed"}
      </h2>
      <p style={{ margin: "0 0 1.75rem 0", color: "var(--color-muted-ink)", fontSize: "17px" }}>
        {isAm
          ? "ለነባር የትምህርት መድረኮች (Savanna LMS፣ Moodle፣ Canvas) ያለምንም የግንባታ ቅድመ ሁኔታ በአንድ መስመር HTML ይጫኑ።"
          : "Zero-dependency drop-in for existing platforms (Savanna LMS, Moodle, Canvas, WordPress). Just add one script tag."}
      </p>

      <section className="card" style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <h3 style={{ margin: 0, color: "var(--color-ink)", fontSize: "21px", letterSpacing: "-0.005em" }}>
            {isAm ? "የማካተት ኮድ ምሳሌ" : "HTML Integration Snippet"}
          </h3>
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
                }}
              >
                ✓ {isAm ? "ኮዱ ተገልብጧል!" : "Snippet copied to clipboard!"}
              </span>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCopy}
              style={{ minHeight: "38px", padding: "0.45rem 1.15rem", fontSize: "13px" }}
            >
              {isAm ? "ኮዱን ቅዳ" : "Copy Snippet"}
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
          <code>{codeSnippet}</code>
        </pre>
      </section>

      {/* Live Preview Section */}
      <section style={{ marginBottom: "3rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <h3 style={{ margin: 0, color: "var(--color-ink)", fontSize: "24px", letterSpacing: "-0.008em" }}>
            {isAm ? "የቀጥታ የተካተተ ምሳሌ (Live Embedded Instance)" : "Live Embedded Instance"}
          </h3>
          <span className="badge badge-brand">
            Shadow DOM Isolated
          </span>
        </div>
        <p style={{ margin: "0 0 1.5rem 0", color: "var(--color-muted-ink)", fontSize: "14px" }}>
          {isAm
            ? "ከዚህ በታች ያለው ማጫወቻ በ Shadow DOM ውስጥ የተዘጋጀ ሲሆን ከውጭ ገጾች ጋር ምንም ዓይነት የ CSS ወይም የስክሪፕት ግጭት አይፈጥርም።"
            : "The instance below demonstrates seamless mounting via standard custom elements with encapsulated styling and zero CSS bleed."}
        </p>

        {/* @ts-ignore custom element */}
        <a11y-media-player
          id="embedded-player"
          manifest-src="/lessons/digital-workplace/lesson.json"
          locale={locale}
        />
      </section>
    </div>
  );
};
