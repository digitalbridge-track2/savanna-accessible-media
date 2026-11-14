import React, { useState } from "react";

export const EmbedView: React.FC<{ locale: "en" | "am" }> = ({ locale }) => {
  const [copied, setCopied] = useState(false);
  const isAm = locale === "am";

  const codeSnippet = `<!-- Level 1 Drop-in Script Tag (Zero build steps) -->
<script type="module" src="http://localhost:3000/dist/a11y-media-kit.umd.js"></script>

<!-- Accessible Media Player Web Component -->
<a11y-media-player
  manifest-src="/lessons/digital-workplace/lesson.json"
  locale="${locale}">
</a11y-media-player>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.8rem", color: "var(--color-brand)", marginBottom: "0.5rem" }}>
        {isAm ? "ደረጃ 1፡ የስክሪፕት ታግ አጠቃቀም" : "Level 1: Standalone Script-Tag Embed"}
      </h2>
      <p style={{ margin: "0 0 1.5rem 0", color: "var(--color-muted-ink)", fontSize: "1.05rem" }}>
        {isAm
          ? "ለነባር የትምህርት መድረኮች (Savanna LMS፣ Moodle፣ Canvas) ያለምንም የግንባታ ቅድመ ሁኔታ በአንድ መስመር HTML ይጫኑ።"
          : "Zero-dependency drop-in for existing platforms (Savanna LMS, Moodle, Canvas, WordPress). Just add one script tag."}
      </p>

      <section className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <h3 style={{ margin: 0, color: "var(--color-brand)" }}>
            {isAm ? "የማካተት ኮድ ምሳሌ" : "HTML Integration Snippet"}
          </h3>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleCopy}
            style={{ fontSize: "0.85rem", padding: "0.4rem 0.85rem", minHeight: "36px" }}
          >
            {copied
              ? (isAm ? "ኮዱ ተገልብጧል!" : "Copied to Clipboard!")
              : (isAm ? "ኮዱን ቅዳ" : "Copy Snippet")}
          </button>
        </div>

        <p style={{ margin: "0 0 1rem 0", color: "var(--color-muted-ink)", fontSize: "0.93rem" }}>
          {isAm
            ? "ይህንን ኮድ በማንኛውም የኤችቲኤምኤል ገጽ ላይ ይለጥፉ፡"
            : "Copy and paste this snippet into any standard web page or LMS content block:"}
        </p>

        <pre
          style={{
            background: "#0F172A",
            color: "#F8FAFC",
            padding: "1.25rem",
            borderRadius: "6px",
            overflowX: "auto",
            fontSize: "0.9rem",
            lineHeight: 1.5,
          }}
        >
          <code>{codeSnippet}</code>
        </pre>
      </section>

      <section className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--color-brand)" }}>
          {isAm ? "የቀጥታ ማሳያ" : "Live Embedded Instance"}
        </h3>
        <p style={{ margin: "0 0 1.5rem 0", color: "var(--color-muted-ink)", fontSize: "0.93rem" }}>
          {isAm ? "ከዚህ በታች ያለው ማጫወቻ በድረ-ገጹ ውስጥ በቀጥታ የተቀመጠ ነው፡" : "The component below is instantiated via the standalone web component:"}
        </p>

        {/* @ts-ignore custom element */}
        <a11y-media-player
          manifest-src="/lessons/digital-workplace/lesson.json"
          locale={locale}
        />
      </section>
    </div>
  );
};
