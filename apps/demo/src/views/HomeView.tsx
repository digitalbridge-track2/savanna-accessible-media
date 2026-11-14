import React, { useEffect, useState } from "react";
import { AccessibleJob } from "@abugida/lesson-schema";
import { NavLink } from "../router";
import { JobCardItem } from "../components/JobCardItem";

interface HomeViewProps {
  locale: "en" | "am";
}

export const HomeView: React.FC<HomeViewProps> = ({ locale }) => {
  const [jobs, setJobs] = useState<AccessibleJob[]>([]);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const isAm = locale === "am";

  useEffect(() => {
    // Fetch local demonstration jobs
    fetch("/jobs/jobs.json")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setJobs(data))
      .catch((err) => console.warn("Failed to load jobs:", err));

    // Check FastAPI health
    fetch("http://localhost:8000/health")
      .then((res) => res.ok)
      .then((online) => setApiOnline(online))
      .catch(() => setApiOnline(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{ marginBottom: "3.5rem" }}>
        <h2
          style={{
            fontSize: "2.1rem",
            fontWeight: 700,
            color: "var(--color-brand)",
            margin: "0 0 1rem 0",
            lineHeight: 1.25,
            letterSpacing: "-0.015em",
          }}
        >
          {isAm
            ? "ለሁሉም የሚሰራ ነገር ይገንቡ። ከዚያ ሁሉም ወደ ሥራ ይገባል።"
            : "Build what works for everyone. Then everyone gets to work."}
        </h2>
        <p
          style={{
            fontSize: "1.1rem",
            maxWidth: "70ch",
            color: "var(--color-ink)",
            lineHeight: 1.65,
            marginBottom: "1.75rem",
          }}
        >
          {isAm
            ? "አቡጊዳ ሚዲያ ኪት ለትምህርት መድረኮች እና ለሥራ ማስታወቂያ ሰሌዳዎች ተደራሽ የሆኑ የድር ክፍሎችን ያቀርባል፡ በኪቦርድ ብቻ የሚሰሩ ተጫዋቾች፣ የአማርኛ እና የእንግሊዝኛ የትርጉም ጽሑፎች፣ የኢትዮጵያ ምልክት ቋንቋ መስኮት፣ የድምፅ ማብራሪያ፣ ዝቅተኛ ዳታ 3G ጥቅል እና 200% ማጉላትን የሚቋቋሙ የሥራ ካርዶች።"
            : "Abugida Media Kit provides embeddable web components for learning platforms and job boards: keyboard-operated media, customizable Amharic & English captions, synchronized Ethiopian Sign Language, audio descriptions, lightweight 3G offline packages, and 200% zoom-resilient career cards."}
        </p>

        <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap", alignItems: "center" }}>
          <NavLink to="/lesson" className="btn btn-primary">
            {isAm ? "ተደራሽ ትምህርቱን ይክፈቱ" : "Open Accessible Lesson"}
          </NavLink>
          <NavLink to="/studio" className="btn btn-outline">
            {isAm ? "የትርጉም ስቱዲዮ ይክፈቱ" : "Open Transcript Studio"}
          </NavLink>
          <NavLink to="/embed" className="btn btn-secondary">
            {isAm ? "የስክሪፕት ታግ ማካተቻ" : "Script Tag Embed"}
          </NavLink>
        </div>
      </section>

      {/* Adoption Levels Grid */}
      <section style={{ marginBottom: "4rem" }} aria-labelledby="heading-adoption">
        <h3
          id="heading-adoption"
          style={{
            fontSize: "1.35rem",
            fontWeight: 700,
            color: "var(--color-ink)",
            margin: "0 0 1.25rem 0",
          }}
        >
          {isAm ? "የማካተት እና የማዋሃድ ደረጃዎች" : "Adoption & Integration Levels"}
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {/* Level 1 */}
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span className="badge badge-brand">Level 1</span>
              </div>
              <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.15rem", color: "var(--color-brand)" }}>
                {isAm ? "ደረጃ 1፡ የስክሪፕት ታግ ማካተቻ" : "Level 1: Script Tag Drop-in"}
              </h4>
              <p style={{ margin: 0, fontSize: "0.93rem", color: "var(--color-muted-ink)", lineHeight: 1.55 }}>
                {isAm
                  ? "በማንኛውም የድር ገጽ ወይም LMS (Savanna, Moodle) ላይ በአንድ መስመር HTML ኮድ በቀላሉ ይጫኑ። ምንም ተጨማሪ የግንባታ ቅድመ ሁኔታ የለውም።"
                  : "Embed the player on any web page or LMS with a single line of HTML. Zero build steps required."}
              </p>
            </div>
            <div style={{ marginTop: "1.5rem" }}>
              <NavLink
                to="/embed"
                className="btn btn-outline"
                style={{ fontSize: "0.88rem", padding: "0.45rem 0.95rem", minHeight: "38px", width: "100%" }}
              >
                {isAm ? "የማካተቻ ኮዱን ይመልከቱ" : "View Embed Code"}
              </NavLink>
            </div>
          </div>

          {/* Level 2 */}
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span className="badge badge-brand">Level 2</span>
                {apiOnline !== null && (
                  <span className={`badge ${apiOnline ? "badge-success" : "badge-neutral"}`}>
                    {apiOnline ? (isAm ? "ኦንላይን" : "API Online") : (isAm ? "ከመስመር ውጭ" : "API Offline")}
                  </span>
                )}
              </div>
              <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.15rem", color: "var(--color-brand)" }}>
                {isAm ? "ደረጃ 2፡ የ REST ኤፒአይ ሰነዶች" : "Level 2: REST API Pipeline"}
              </h4>
              <p style={{ margin: 0, fontSize: "0.93rem", color: "var(--color-muted-ink)", lineHeight: 1.55 }}>
                {isAm
                  ? "የአካባቢ ፈጣን FastAPI የድምፅ ትርጉም አገልግሎት ከሙሉ OpenAPI 3.0 Swagger ሰነዶች ጋር።"
                  : "Local FastAPI transcription and manifest pipeline with full OpenAPI 3.0 documentation."}
              </p>
            </div>
            <div style={{ marginTop: "1.5rem" }}>
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
                style={{ fontSize: "0.88rem", padding: "0.45rem 0.95rem", minHeight: "38px", width: "100%" }}
              >
                OpenAPI Swagger (/docs) ↗
              </a>
            </div>
          </div>

          {/* Level 3 */}
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span className="badge badge-brand">Level 3</span>
              </div>
              <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.15rem", color: "var(--color-brand)" }}>
                {isAm ? "ደረጃ 3፡ ክፍት ደረጃዎች እና ምስክር ወረቀት" : "Level 3: Open Standards & Credentials"}
              </h4>
              <p style={{ margin: 0, fontSize: "0.93rem", color: "var(--color-muted-ink)", lineHeight: 1.55 }}>
                {isAm
                  ? "ከ schema.org/JobPosting ማይክሮዳታ፣ መደበኛ WebVTT ንዑስ ርዕሶች እና ከሳቫና LMS ማረጋገጫ ጋር ሙሉ ተኳሃኝ።"
                  : "Compatible with schema.org/JobPosting microdata, standard WebVTT subtitles, and Savanna LMS."}
              </p>
            </div>
            <div style={{ marginTop: "1.5rem" }}>
              <NavLink
                to="/verify"
                className="btn btn-outline"
                style={{ fontSize: "0.88rem", padding: "0.45rem 0.95rem", minHeight: "38px", width: "100%" }}
              >
                {isAm ? "የምስክር ወረቀት አረጋግጥ" : "Verify Credential"}
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* Career Gateway Section */}
      <section style={{ marginBottom: "3.5rem" }} aria-labelledby="heading-career-preview">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1.25rem",
          }}
        >
          <div>
            <h3
              id="heading-career-preview"
              style={{
                fontSize: "1.35rem",
                fontWeight: 700,
                margin: "0 0 0.35rem 0",
                color: "var(--color-ink)",
              }}
            >
              {isAm ? "የሥራ መግቢያ በር፡ ክፍት የሥራ ዕድሎች" : "Career Gateway: Accessible Opportunities"}
            </h3>
            <p style={{ margin: 0, color: "var(--color-muted-ink)", fontSize: "0.95rem" }}>
              {isAm
                ? "200% ማጉላት እና የድምፅ ማጠቃለያ ያላቸው ክፍት የሥራ መደቦች፡"
                : "Opportunities with verified accommodation disclosures and 200% zoom reflow guarantee:"}
            </p>
          </div>
          <span className="badge badge-success">
            WCAG 1.4.10 Reflow Tested
          </span>
        </div>

        <div id="job-cards-container">
          {jobs.map((job) => (
            <JobCardItem key={job.id} job={job} locale={locale} />
          ))}
        </div>
      </section>

      {/* Clean Professional Disclaimer */}
      <aside
        style={{
          background: "#F1F5F9",
          borderLeft: "4px solid var(--color-brand)",
          padding: "1rem 1.25rem",
          borderRadius: "6px",
          fontSize: "0.88rem",
          color: "#334155",
        }}
      >
        <strong>{isAm ? "ማስታወሻ፡" : "Demonstration Notice:"}</strong>{" "}
        {isAm
          ? "ይህ የማሳያ አካባቢ የአካባቢ ሙከራ ፋይሎችን እና ምሳሌዎችን ይጠቀማል። ሁሉም ምስክር ወረቀቶች እና የሥራ ማስታወቂያዎች ለውድድሩ ማሳያ ብቻ የቀረቡ ናቸው።"
          : "This demonstration environment uses mock fixtures and local test media. All credentials and job postings are strictly demonstration data."}
      </aside>
    </div>
  );
};
