import React, { useState, useEffect } from "react";
import { formatDualDate } from "@abugida/media-kit";
import { IconCheck, IconAlert, IconLink, IconBadge, IconDownload } from "../components/Icons";

interface DemoCertificate {
  id: string;
  title: { en: string; am: string };
  issuer: string;
  issueDateISO: string;
  issueDateEthiopic: string;
  learnerDisplayName: string;
  skills?: string[];
  isDemonstrationData?: boolean;
}

const DEFAULT_REGISTRY: DemoCertificate[] = [
  {
    id: "CERT-DB-2026-0042",
    title: {
      en: "Digital Workplace Skills: Foundations",
      am: "የዲጂታል የሥራ ቦታ ክህሎቶች፡ መሠረታዊ",
    },
    issuer: "Savanna Learning Platform · Digital Bridge 2026",
    issueDateISO: "2026-11-14",
    issueDateEthiopic: "ህዳር 5፣ 2019 ዓ.ም",
    learnerDisplayName: "Demonstration Learner",
    skills: ["Digital Collaboration", "Accessibility Literacy"],
    isDemonstrationData: true,
  },
];

export const VerifyView: React.FC<{ locale: "en" | "am" }> = ({ locale }) => {
  const getInitialId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || params.get("certId") || "CERT-DB-2026-0042";
  };

  const [searchId, setSearchId] = useState(getInitialId);
  const [activeId, setActiveId] = useState(getInitialId);
  const [certificates, setCertificates] = useState<DemoCertificate[]>(DEFAULT_REGISTRY);
  const [copyMsg, setCopyMsg] = useState("");
  const [showOBv3, setShowOBv3] = useState(false);
  const isAm = locale === "am";

  useEffect(() => {
    fetch("/certificates/certificates.demo.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCertificates(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id") || params.get("certId") || "";
      if (id) {
        setActiveId(id);
        setSearchId(id);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = searchId.trim();
    setActiveId(trimmed);
    const newUrl = `${window.location.pathname}?id=${encodeURIComponent(trimmed)}`;
    window.history.pushState(null, "", newUrl);
  };

  const handleCopy = async () => {
    const shareableUrl = `${window.location.origin}/verify?id=${encodeURIComponent(activeId)}`;
    let success = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareableUrl);
        success = true;
      }
    } catch {
      // Fallback below
    }

    if (!success) {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = shareableUrl;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch {
        // Ignore fallback failure
      }
    }

    setCopyMsg(isAm ? "የማረጋገጫ ሊንኩ ተገልብጧል።" : "Verification link copied to clipboard.");
    setTimeout(() => setCopyMsg(""), 3500);
  };

  const getOBv3Payload = () => {
    if (!matchedCert) return null;
    return {
      "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json"
      ],
      "id": `urn:uuid:db-${matchedCert.id.toLowerCase()}`,
      "type": ["VerifiableCredential", "OpenBadgeCredential"],
      "issuer": {
        "id": "https://savanna.alxafrica.com/issuers/digital-bridge",
        "type": ["Profile"],
        "name": matchedCert.issuer,
        "url": "https://savanna.alxafrica.com"
      },
      "validFrom": `${matchedCert.issueDateISO}T00:00:00Z`,
      "name": matchedCert.title.en,
      "credentialSubject": {
        "id": "did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
        "type": ["AchievementSubject"],
        "name": matchedCert.learnerDisplayName,
        "achievement": {
          "id": `https://savanna.alxafrica.com/achievements/${matchedCert.id.toLowerCase()}`,
          "type": ["Achievement"],
          "name": matchedCert.title[locale] || matchedCert.title.en,
          "description": "Demonstrated competencies in accessible digital workflows, WCAG 2.2 AA compliance, and cross-platform collaboration.",
          "criteria": {
            "narrative": "Successfully completed all interactive lesson evaluations, verified transcript review, and demonstrated assistive technology proficiency."
          }
        }
      }
    };
  };

  const handleDownloadOBv3 = () => {
    const payload = getOBv3Payload();
    if (!payload) return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/ld+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${matchedCert?.id || "credential"}.openbadge.jsonld`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const matchedCert = certificates.find(
    (c) => c.id.trim().toLowerCase() === activeId.trim().toLowerCase()
  );

  const dualDate = matchedCert ? formatDualDate(matchedCert.issueDateISO) : null;

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "34px", color: "var(--color-ink)", marginBottom: "0.5rem", letterSpacing: "-0.011em" }}>
        {isAm ? "የምስክር ወረቀት ማረጋገጫ" : "Certificate Credential Verification"}
      </h2>
      <p style={{ margin: "0 0 1.75rem 0", color: "var(--color-muted-ink)", fontSize: "17px" }}>
        {isAm
          ? "ለቀጣሪዎች እና ለትምህርት ተቋማት ክፍት እና አስተማማኝ የማረጋገጫ መድረክ"
          : "Transparent, verifiable credentials for employers and educational institutions."}
      </p>

      <section className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--color-ink)", fontSize: "21px", letterSpacing: "-0.005em" }}>
          {isAm ? "የምስክር ወረቀት ሁኔታ" : "Credential Status"}
        </h3>
        <p style={{ margin: "0 0 1.25rem 0", color: "var(--color-muted-ink)", fontSize: "14px" }}>
          {isAm ? "በተረጋገጠው ማዕከላዊ መዝገብ ውስጥ የተገኘ ውጤት፡" : "Verification lookup in Savanna LMS demonstration registry:"}
        </p>

        {/* Verification Form */}
        <form
          onSubmit={handleVerify}
          style={{
            display: "flex",
            gap: "0.75rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
          aria-label={isAm ? "የምስክር ወረቀት መለያ መፈለጊያ" : "Credential lookup form"}
        >
          <label htmlFor="cert-id-input" style={{ fontWeight: 600, fontSize: "14px", width: "100%", color: "var(--color-ink)" }}>
            {isAm ? "የምስክር ወረቀት መለያ ቁጥር (Credential ID):" : "Credential ID:"}
          </label>
          <input
            id="cert-id-input"
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="e.g. CERT-DB-2026-0042"
            style={{
              flex: "1 1 240px",
              minHeight: "42px",
              padding: "0.5rem 1rem",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-pill)",
              fontSize: "14px",
              outline: "none",
              background: "#FFFFFF",
              color: "var(--color-ink)",
            }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ minHeight: "42px", padding: "0.5rem 1.4rem" }}
          >
            {isAm ? "አረጋግጥ" : "Verify"}
          </button>
        </form>

        {/* Lookup Result: Matched vs Not Found */}
        {matchedCert ? (
          <div
            style={{
              background: "#E8F8F0",
              border: "1px solid #B4E8CC",
              padding: "1.5rem",
              borderRadius: "var(--radius-card)",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <h4 style={{ margin: 0, color: "#128045", fontSize: "1.15rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <IconCheck size={20} />
                <span>{isAm ? "የተረጋገጠ ትክክለኛ ምስክር ወረቀት" : "Demonstrated Credential Verified"}</span>
              </h4>
              <span className="badge badge-success" style={{ borderRadius: "var(--radius-pill)" }}>
                {isAm ? "ትክክለኛ" : "Verified"}
              </span>
            </div>

            <dl
              style={{
                margin: 0,
                display: "grid",
                gridTemplateColumns: "minmax(140px, auto) 1fr",
                gap: "0.6rem 1rem",
                fontSize: "14px",
              }}
            >
              <dt><strong>{isAm ? "የመለያ ቁጥር:" : "Credential ID:"}</strong></dt>
              <dd><code>{matchedCert.id}</code></dd>

              <dt><strong>{isAm ? "ተቀባይ:" : "Recipient:"}</strong></dt>
              <dd>{isAm ? `${matchedCert.learnerDisplayName} (የማሳያ ሰልጣኝ)` : matchedCert.learnerDisplayName}</dd>

              <dt><strong>{isAm ? "የኮርሱ ርዕስ:" : "Course:"}</strong></dt>
              <dd>{matchedCert.title[locale] || matchedCert.title.en}</dd>

              <dt><strong>{isAm ? "ሰጪ ተቋም:" : "Issuer:"}</strong></dt>
              <dd>{matchedCert.issuer}</dd>

              <dt><strong>{isAm ? "የተሰጠበት ቀን:" : "Issue Date:"}</strong></dt>
              <dd>
                <strong>{dualDate ? dualDate.display : matchedCert.issueDateISO}</strong>
              </dd>
            </dl>
          </div>
        ) : (
          <div
            role="alert"
            style={{
              background: "#FFF5F5",
              border: "1px solid #FFD2D2",
              padding: "1.25rem 1.5rem",
              borderRadius: "var(--radius-card)",
              color: "#D70015",
              marginBottom: "1.5rem",
            }}
          >
            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.05rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <IconAlert size={18} />
              <span>{isAm ? "የምስክር ወረቀቱ አልተገኘም" : "Credential not found"}</span>
            </h4>
            <p style={{ margin: 0, fontSize: "14px" }}>
              {isAm
                ? `የመለያ ቁጥር "${activeId}" በሳቫና LMS ማሳያ መዝገብ ውስጥ አልተገኘም። እባክዎ መለያ ቁጥሩን ያረጋግጡ።`
                : `Credential not found in Savanna LMS demonstration registry for "${activeId}". Please check the ID and try again.`}
            </p>
          </div>
        )}

        {/* Actions: Shareable Link & Open Badges 3.0 W3C Standard Export */}
        {matchedCert && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleCopy}
                style={{ minHeight: "40px", display: "inline-flex", alignItems: "center", gap: "0.45rem" }}
              >
                <IconLink size={15} />
                <span>{isAm ? "የማረጋገጫ ሊንኩን ቅዳ" : "Copy Shareable Link"}</span>
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowOBv3(!showOBv3)}
                style={{ minHeight: "40px", display: "inline-flex", alignItems: "center", gap: "0.45rem" }}
                aria-expanded={showOBv3}
              >
                <IconBadge size={16} />
                <span>{isAm ? "Open Badges 3.0 ሜታዳታ" : "Open Badges 3.0 (OBv3)"}</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleDownloadOBv3}
                style={{ minHeight: "40px", display: "inline-flex", alignItems: "center", gap: "0.45rem" }}
              >
                <IconDownload size={16} />
                <span>{isAm ? "Open Badge አውርድ (.jsonld)" : "Download Open Badge (.jsonld)"}</span>
              </button>

              {copyMsg && (
                <span
                  role="status"
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#128045",
                    background: "#E8F8F0",
                    padding: "0.35rem 0.85rem",
                    borderRadius: "var(--radius-pill)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <IconCheck size={14} />
                  <span>{copyMsg}</span>
                </span>
              )}
            </div>

            {/* Level 3 Open Standard Inspector: W3C / 1EdTech Open Badges 3.0 */}
            {showOBv3 && (
              <div
                style={{
                  marginTop: "0.5rem",
                  padding: "1.25rem",
                  background: "#1E293B",
                  color: "#F8FAFC",
                  borderRadius: "var(--radius-card)",
                  fontSize: "13px",
                  overflowX: "auto",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <strong style={{ color: "#38BDF8" }}>
                    Level 3 Open Standard: 1EdTech / W3C Open Badges 3.0 (OBv3) Verifiable Credential
                  </strong>
                  <span style={{ fontSize: "11px", background: "rgba(56, 189, 248, 0.2)", color: "#38BDF8", padding: "2px 8px", borderRadius: "4px" }}>
                    Standard JSON-LD
                  </span>
                </div>
                <pre style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "12px", lineHeight: 1.5 }}>
                  {JSON.stringify(getOBv3Payload(), null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Demonstration Notice */}
      <aside
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border-subtle)",
          padding: "1.25rem 1.5rem",
          borderRadius: "var(--radius-card)",
          fontSize: "13px",
          color: "var(--color-muted-ink)",
        }}
      >
        <strong>{isAm ? "የክፍት ደረጃዎች ማስታወሻ፡" : "Open Standards Disclosure:"}</strong>{" "}
        {isAm
          ? "ይህ መድረክ ከ W3C Verifiable Credentials እና Schema.org ደረጃዎች ጋር ተኳሃኝ በሆነ መልኩ የተቀየሰ ነው። የምስክር ወረቀቱ በኢትዮጵያ ዘመን አቆጣጠር (ህዳር 5፣ 2019 ዓ.ም) እና በጎርጎሪዮሳዊ ቀን የተመዘገበ ነው።"
          : "Designed in accordance with W3C Verifiable Credentials and Schema.org open standards. Dates are synchronized between the Ethiopian calendar (Hidar 5, 2019 E.C.) and ISO 8601."}
      </aside>
    </div>
  );
};
