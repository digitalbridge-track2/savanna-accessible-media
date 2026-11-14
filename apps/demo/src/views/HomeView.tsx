import React, { useEffect, useState } from "react";
import { AccessibleJob } from "@abugida/lesson-schema";
import { NavLink } from "../router";
import { JobCardItem } from "../components/JobCardItem";

interface HomeViewProps {
  locale: "en" | "am";
}

export const HomeView: React.FC<HomeViewProps> = ({ locale }) => {
  const [jobs, setJobs] = useState<AccessibleJob[]>([]);
  const isAm = locale === "am";

  useEffect(() => {
    fetch("/jobs/jobs.json")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setJobs(data))
      .catch((err) => console.warn("Failed to load jobs:", err));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{ marginBottom: "3.5rem" }}>
        <h2
          style={{
            fontSize: "2.2rem",
            fontWeight: 800,
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
            fontSize: "1.15rem",
            maxWidth: "72ch",
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
            {isAm ? "ትምህርቱን ጀምር →" : "Open Accessible Lesson →"}
          </NavLink>
          <NavLink to="/studio" className="btn btn-outline">
            {isAm ? "የትርጉም ስቱዲዮ ክፈት" : "Open Transcript Studio"}
          </NavLink>
          <NavLink to="/embed" className="btn btn-secondary">
            {isAm ? "የስክሪፕት ታግ ማካተቻ" : "View Script Tag Embed"}
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
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <span className="badge badge-brand" style={{ marginBottom: "0.75rem" }}>Level 1 Drop-in</span>
              <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.15rem", color: "var(--color-brand)" }}>
                {isAm ? "ደረጃ 1፡ የስክሪፕት ታግ" : "Level 1: Script Tag"}
              </h4>
              <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--color-muted-ink)", lineHeight: 1.55 }}>
                {isAm
                  ? "በማንኛውም የድር ገጽ ወይም LMS (Savanna, Moodle) ላይ በአንድ መስመር HTML ኮድ በቀላሉ ይጫኑ።"
                  : "Embed the player on any web page or LMS with a single line of HTML. Zero build steps."}
              </p>
            </div>
            <div style={{ marginTop: "1.25rem" }}>
              <NavLink
                to="/embed"
                className="btn btn-outline"
                style={{ fontSize: "0.85rem", padding: "0.4rem 0.85rem", minHeight: "38px" }}
              >
                {isAm ? "ኮዱን ይመልከቱ" : "View Embed Code"}
              </NavLink>
            </div>
          </div>

          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <span className="badge badge-accent" style={{ marginBottom: "0.75rem" }}>Level 2 Pipeline</span>
              <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.15rem", color: "var(--color-brand)" }}>
                {isAm ? "ደረጃ 2፡ የ REST ኤፒአይ" : "Level 2: REST API"}
              </h4>
              <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--color-muted-ink)", lineHeight: 1.55 }}>
                {isAm
                  ? "የአካባቢ ፈጣን FastAPI የድምፅ ትርጉም አገልግሎት ከሙሉ OpenAPI Swagger ሰነዶች ጋር።"
                  : "Local FastAPI transcription and manifest pipeline with full OpenAPI 3.0 documentation."}
              </p>
            </div>
            <div style={{ marginTop: "1.25rem" }}>
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
                style={{ fontSize: "0.85rem", padding: "0.4rem 0.85rem", minHeight: "38px" }}
              >
                OpenAPI Swagger (/docs) ↗
              </a>
            </div>
          </div>

          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <span className="badge badge-success" style={{ marginBottom: "0.75rem" }}>Level 3 Verified</span>
              <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.15rem", color: "var(--color-brand)" }}>
                {isAm ? "ደረጃ 3፡ ክፍት ደረጃዎች" : "Level 3: Open Standards"}
              </h4>
              <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--color-muted-ink)", lineHeight: 1.55 }}>
                {isAm
                  ? "ከ schema.org/JobPosting፣ መደበኛ WebVTT ንዑስ ርዕሶች እና ከሳቫና LMS ጋር ተኳሃኝ።"
                  : "Compatible with schema.org/JobPosting microdata, standard WebVTT subtitles, and Savanna LMS."}
              </p>
            </div>
            <div style={{ marginTop: "1.25rem" }}>
              <NavLink
                to="/verify"
                className="btn btn-outline"
                style={{ fontSize: "0.85rem", padding: "0.4rem 0.85rem", minHeight: "38px" }}
              >
                {isAm ? "የምስክር ወረቀት አረጋግጥ" : "Verify Credential"}
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* Career Gateway Preview */}
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
            ✓ WCAG 1.4.10 Reflow Tested
          </span>
        </div>

        <div id="job-cards-container">
          {jobs.map((job) => (
            <JobCardItem key={job.id} job={job} locale={locale} />
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <aside
        style={{
          background: "var(--color-accent-subtle)",
          borderLeft: "4px solid var(--color-accent)",
          padding: "1rem 1.25rem",
          borderRadius: "8px",
          fontSize: "0.9rem",
          color: "#4A3B00",
        }}
      >
        <strong>{isAm ? "ማስታወሻ፡" : "Notice:"}</strong>{" "}
        {isAm
          ? "ይህ የማሳያ አካባቢ የአካባቢ ሙከራ ፋይሎችን እና ምሳሌዎችን ይጠቀማል። ሁሉም ምስክር ወረቀቶች እና የሥራ ማስታወቂያዎች ለውድድሩ ማሳያ ብቻ የቀረቡ ናቸው።"
          : "This demonstration environment uses mock fixtures and local test media. All credentials and job postings are strictly demonstration data."}
      </aside>
    </div>
  );
};
