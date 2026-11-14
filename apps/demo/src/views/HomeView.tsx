import React, { useEffect, useState } from "react";
import { AccessibleJob } from "@abugida/lesson-schema";
import { NavLink, useRouter } from "../router";
import { JobCardItem } from "../components/JobCardItem";

interface HomeViewProps {
  locale: "en" | "am";
}

export const HomeView: React.FC<HomeViewProps> = ({ locale }) => {
  const [jobs, setJobs] = useState<AccessibleJob[]>([]);
  const { navigate } = useRouter();
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
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "2rem", color: "var(--color-brand)", marginBottom: "0.75rem" }}>
          {isAm
            ? "ለሁሉም የሚሰራ ነገር ይገንቡ። ከዚያ ሁሉም ወደ ሥራ ይገባል።"
            : "Build what works for everyone. Then everyone gets to work."}
        </h2>
        <p style={{ fontSize: "1.2rem", maxWidth: "840px", color: "var(--color-ink)", lineHeight: 1.6 }}>
          {isAm
            ? "አቡጊዳ ሚዲያ ኪት ለትምህርት መድረኮች እና ለሥራ ማስታወቂያ ሰሌዳዎች ተደራሽ የሆኑ የድር ክፍሎችን ያቀርባል፡ በኪቦርድ ብቻ የሚሰሩ ተጫዋቾች፣ የአማርኛ እና የእንግሊዝኛ የትርጉም ጽሑፎች፣ የኢትዮጵያ ምልክት ቋንቋ መስኮት፣ የድምፅ ማብራሪያ፣ ዝቅተኛ ዳታ 3G ጥቅል እና 200% ማጉላትን የሚቋቋሙ የሥራ ካርዶች።"
            : "Abugida Media Kit provides embeddable web components for learning platforms and job boards: keyboard-operated media, customizable Amharic & English captions, synchronized Ethiopian Sign Language, audio descriptions, lightweight 3G offline packages, and 200% zoom-resilient career cards."}
        </p>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1.75rem", flexWrap: "wrap" }}>
          <NavLink to="/lesson" className="btn btn-primary">
            {isAm ? "ትምህርቱን ጀምር →" : "Open Accessible Lesson →"}
          </NavLink>
          <NavLink to="/studio" className="btn btn-outline">
            {isAm ? "የትርጉም ስቱዲዮ ክፈት" : "Open Transcript Studio"}
          </NavLink>
          <NavLink to="/embed" className="btn btn-secondary">
            {isAm ? "የስክሪፕት ታግ ምሳሌ" : "View Script Tag Embed"}
          </NavLink>
        </div>
      </section>

      {/* Adoption Levels Grid */}
      <section style={{ marginBottom: "3.5rem" }} aria-labelledby="heading-adoption">
        <h3 id="heading-adoption" style={{ fontSize: "1.4rem", color: "var(--color-ink)", marginBottom: "1.25rem" }}>
          {isAm ? "የማካተት እና የማዋሃድ ደረጃዎች" : "Adoption & Integration Levels"}
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div className="card">
            <span className="badge badge-brand" style={{ marginBottom: "0.75rem" }}>Level 1 Drop-in</span>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--color-brand)" }}>
              {isAm ? "ደረጃ 1፡ የስክሪፕት ታግ" : "Level 1: Script Tag"}
            </h4>
            <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--color-muted-ink)" }}>
              {isAm
                ? "በማንኛውም የድር ገጽ ወይም LMS (Savanna, Moodle) ላይ በአንድ መስመር HTML ኮድ በቀላሉ ይጫኑ።"
                : "Embed the player on any web page or LMS with a single line of HTML. Zero build steps."}
            </p>
            <div style={{ marginTop: "1rem" }}>
              <code style={{ fontSize: "0.85rem", background: "#ECEFF1", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                &lt;script src=".../a11y-media-kit.umd.js"&gt;
              </code>
            </div>
          </div>

          <div className="card">
            <span className="badge badge-accent" style={{ marginBottom: "0.75rem" }}>Level 2 Pipeline</span>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--color-brand)" }}>
              {isAm ? "ደረጃ 2፡ የ REST ኤፒአይ" : "Level 2: REST API"}
            </h4>
            <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--color-muted-ink)" }}>
              {isAm
                ? "የአካባቢ ፈጣን FastAPI የድምፅ ትርጉም አገልግሎት ከሙሉ OpenAPI Swagger ሰነዶች ጋር።"
                : "Local FastAPI transcription and manifest pipeline with full OpenAPI 3.0 documentation."}
            </p>
            <div style={{ marginTop: "1rem" }}>
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
                style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem", minHeight: "36px" }}
              >
                Swagger UI (/docs) ↗
              </a>
            </div>
          </div>

          <div className="card">
            <span className="badge badge-success" style={{ marginBottom: "0.75rem" }}>Level 3 Verified</span>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--color-brand)" }}>
              {isAm ? "ደረጃ 3፡ ክፍት ደረጃዎች" : "Level 3: Open Standards"}
            </h4>
            <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--color-muted-ink)" }}>
              {isAm
                ? "ከ schema.org/JobPosting፣ መደበኛ WebVTT ንዑስ ርዕሶች እና ከሳቫና LMS ጋር ተኳሃኝ።"
                : "Compatible with schema.org/JobPosting microdata, standard WebVTT subtitles, and Savanna LMS."}
            </p>
            <div style={{ marginTop: "1rem" }}>
              <NavLink
                to="/verify"
                className="btn btn-outline"
                style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem", minHeight: "36px" }}
              >
                {isAm ? "የምስክር ወረቀት አረጋግጥ" : "Verify Credential"}
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* Career Gateway Preview */}
      <section style={{ marginBottom: "3rem" }} aria-labelledby="heading-career-preview">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <h3 id="heading-career-preview" style={{ fontSize: "1.4rem", margin: 0, color: "var(--color-ink)" }}>
              {isAm ? "የሥራ መግቢያ በር፡ ክፍት የሥራ ዕድሎች" : "Career Gateway: Accessible Opportunities"}
            </h3>
            <p style={{ margin: "0.25rem 0 0 0", color: "var(--color-muted-ink)" }}>
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
          background: "#FFF8E1",
          borderLeft: "4px solid var(--color-accent)",
          padding: "1rem 1.25rem",
          borderRadius: "4px",
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
