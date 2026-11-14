import React, { useState } from "react";
import { formatDualDate } from "@abugida/media-kit";

export const VerifyView: React.FC<{ locale: "en" | "am" }> = ({ locale }) => {
  const [copyMsg, setCopyMsg] = useState("");
  const isAm = locale === "am";

  const dualDate = formatDualDate(new Date(2026, 10, 14));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyMsg(isAm ? "የማረጋገጫ ሊንኩ ተገልብጧል!" : "Verification link copied to clipboard!");
    } catch {
      setCopyMsg(isAm ? "ሊንኩን ከአድራሻ ሳጥኑ መቅዳት ይችላሉ።" : "Please copy the browser URL directly.");
    }
  };

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "1.8rem", color: "var(--color-brand)", marginBottom: "0.5rem" }}>
        {isAm ? "የምስክር ወረቀት ማረጋገጫ" : "Certificate Credential Verification"}
      </h2>
      <p style={{ margin: "0 0 1.5rem 0", color: "var(--color-muted-ink)", fontSize: "1.05rem" }}>
        {isAm
          ? "ለቀጣሪዎች እና ለትምህርት ተቋማት ክፍት እና አስተማማኝ የማረጋገጫ መድረክ"
          : "Transparent, verifiable credentials for employers and educational institutions."}
      </p>

      <section className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--color-brand)" }}>
          {isAm ? "የምስክር ወረቀት ሁኔታ" : "Credential Status"}
        </h3>
        <p style={{ margin: "0 0 1.25rem 0", color: "var(--color-muted-ink)", fontSize: "0.95rem" }}>
          {isAm ? "በተረጋገጠው ማዕከላዊ መዝገብ ውስጥ የተገኘ ውጤት፡" : "Verification lookup in Savanna LMS demonstration registry:"}
        </p>

        <div
          style={{
            background: "#E8F5E9",
            borderLeft: "5px solid #2E7D32",
            padding: "1.25rem",
            borderRadius: "6px",
            marginBottom: "1.5rem",
          }}
        >
          <h4 style={{ margin: "0 0 0.75rem 0", color: "#1B5E20", fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>✓</span> {isAm ? "የተረጋገጠ ትክክለኛ ምስክር ወረቀት" : "Demonstrated Credential Verified"}
          </h4>

          <dl
            style={{
              margin: 0,
              display: "grid",
              gridTemplateColumns: "minmax(140px, auto) 1fr",
              gap: "0.6rem 1rem",
              fontSize: "0.95rem",
            }}
          >
            <dt><strong>{isAm ? "የመለያ ቁጥር:" : "Credential ID:"}</strong></dt>
            <dd><code>CERT-DB-2026-0042</code></dd>

            <dt><strong>{isAm ? "ተቀባይ:" : "Recipient:"}</strong></dt>
            <dd>{isAm ? "የማሳያ ሰልጣኝ (Demonstration Learner)" : "Demonstration Learner"}</dd>

            <dt><strong>{isAm ? "የኮርሱ ርዕስ:" : "Course:"}</strong></dt>
            <dd>{isAm ? "የዲጂታል የሥራ ቦታ ክህሎቶች፡ መሠረታዊ" : "Digital Workplace Skills: Foundations"}</dd>

            <dt><strong>{isAm ? "ሰጪ ተቋም:" : "Issuer:"}</strong></dt>
            <dd>Savanna Learning Platform &bull; Digital Bridge 2026</dd>

            <dt><strong>{isAm ? "የተሰጠበት ቀን:" : "Issue Date:"}</strong></dt>
            <dd>
              <strong>{dualDate.formatted}</strong>
            </dd>
          </dl>
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <button type="button" onClick={handleCopy} className="btn btn-primary">
            📋 {isAm ? "የማረጋገጫ ሊንኩን ቅዳ" : "Copy Shareable Link"}
          </button>
          {copyMsg && (
            <span style={{ fontSize: "0.95rem", color: "#2E7D32", fontWeight: 500 }} aria-live="polite">
              {copyMsg}
            </span>
          )}
        </div>
      </section>
    </div>
  );
};
