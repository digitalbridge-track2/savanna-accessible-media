import React, { useState } from "react";
import { formatDualDate } from "@abugida/media-kit";

export const VerifyView: React.FC<{ locale: "en" | "am" }> = ({ locale }) => {
  const [copyMsg, setCopyMsg] = useState("");
  const isAm = locale === "am";

  const dualDate = formatDualDate("2026-11-14");

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
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
            borderLeft: "4px solid #166534",
            padding: "1.25rem",
            borderRadius: "6px",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <h4 style={{ margin: 0, color: "#166534", fontSize: "1.15rem", fontWeight: 700 }}>
              {isAm ? "የተረጋገጠ ትክክለኛ ምስክር ወረቀት" : "Demonstrated Credential Verified"}
            </h4>
            <span className="badge badge-success">
              {isAm ? "ትክክለኛ" : "Verified"}
            </span>
          </div>

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
            <dd>Savanna Learning Platform · Digital Bridge 2026</dd>

            <dt><strong>{isAm ? "የተሰጠበት ቀን:" : "Issue Date:"}</strong></dt>
            <dd>
              <strong>{dualDate.display}</strong>
            </dd>
          </dl>
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <button type="button" onClick={handleCopy} className="btn btn-primary">
            {isAm ? "የማረጋገጫ ሊንኩን ቅዳ" : "Copy Shareable Link"}
          </button>
          {copyMsg && (
            <span style={{ fontSize: "0.92rem", color: "#166534", fontWeight: 500 }} aria-live="polite">
              {copyMsg}
            </span>
          )}
        </div>
      </section>
    </div>
  );
};
