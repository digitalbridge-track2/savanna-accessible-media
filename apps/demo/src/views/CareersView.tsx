import React, { useEffect, useState, useMemo } from "react";
import { AccessibleJob } from "@abugida/lesson-schema";
import { SupportedLocale } from "@abugida/media-kit";
import { JobCardItem, resolveLocalized } from "../components/JobCardItem";
import { IconCheck, IconDownload, IconVolume } from "../components/Icons";

interface CareersViewProps {
  locale: SupportedLocale;
}

export const CareersView: React.FC<CareersViewProps> = ({ locale }) => {
  const [jobs, setJobs] = useState<AccessibleJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>("all");
  const [selectedAccommodation, setSelectedAccommodation] = useState<string>("all");
  const [filterCourseSkillsOnly, setFilterCourseSkillsOnly] = useState<boolean>(false);
  const [showJsonLdModal, setShowJsonLdModal] = useState(false);

  const isAm = locale === "am";

  useEffect(() => {
    fetch("/jobs/jobs.json")
      .then((res) => res.json())
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load jobs:", err);
        setLoading(false);
      });
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // 1. Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const title = resolveLocalized(job.title, locale).toLowerCase();
        const employer = job.employer.toLowerCase();
        const desc = resolveLocalized(job.description, locale).toLowerCase();
        const loc = resolveLocalized(job.location, locale).toLowerCase();
        if (!title.includes(q) && !employer.includes(q) && !desc.includes(q) && !loc.includes(q)) {
          return false;
        }
      }

      // 2. Work Mode filter
      if (selectedWorkMode !== "all") {
        if (job.workMode !== selectedWorkMode) return false;
      }

      // 3. Accommodation filter
      if (selectedAccommodation !== "all") {
        const hasMatchingAcc = job.accommodations?.some((acc) => {
          const accId = acc.id.toLowerCase();
          const label = resolveLocalized(acc.label, locale).toLowerCase();
          return accId.includes(selectedAccommodation) || label.includes(selectedAccommodation);
        });
        if (!hasMatchingAcc) return false;
      }

      // 4. Course Skills Match filter
      if (filterCourseSkillsOnly) {
        const matchesCourse = job.requiredSkills.includes("skill-a11y-literacy");
        if (!matchesCourse) return false;
      }

      return true;
    });
  }, [jobs, searchQuery, selectedWorkMode, selectedAccommodation, filterCourseSkillsOnly, locale]);

  const jsonLdContent = useMemo(() => {
    const list = jobs.map((job) => ({
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      "title": resolveLocalized(job.title, "en"),
      "description": resolveLocalized(job.description, "en"),
      "hiringOrganization": {
        "@type": "Organization",
        "name": job.employer,
      },
      "jobLocationType": job.workMode === "remote" ? "TELECOMMUTE" : undefined,
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": resolveLocalized(job.location, "en"),
          "addressCountry": "ET",
        },
      },
      "validThrough": job.applicationDeadline,
      "skills": job.requiredSkills.concat(job.helpfulSkills || []),
      "workplaceAccommodations": job.accommodations?.map((a) => ({
        "@type": "Accommodation",
        "name": resolveLocalized(a.label, "en"),
        "verificationStatus": a.source,
      })),
    }));
    return JSON.stringify(list, null, 2);
  }, [jobs]);

  const handleDownloadJsonLd = () => {
    const blob = new Blob([jsonLdContent], { type: "application/ld+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ethiopia-accessible-jobs.jsonld";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "1rem 0" }}>
      {/* Hero Header */}
      <section
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-card)",
          padding: "2rem",
          marginBottom: "2rem",
          boxShadow: "var(--shadow-subtle)",
        }}
        aria-labelledby="heading-career-gateway"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ maxWidth: "780px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span className="badge badge-brand" style={{ fontWeight: 600 }}>
                {isAm ? "ተደራሽ የሥራ ዕድሎች" : "Inclusive Employment Hub"}
              </span>
              <span className="badge badge-success">
                {isAm ? "የተረጋገጡ የሥራ ምቹነቶች" : "Verified Accommodations"}
              </span>
              <span className="badge badge-neutral">
                WCAG 1.4.10 Reflow Tested
              </span>
            </div>
            <h2
              id="heading-career-gateway"
              style={{
                margin: "0 0 0.5rem 0",
                fontSize: "1.85rem",
                fontWeight: 600,
                color: "var(--color-ink)",
                letterSpacing: "-0.015em",
              }}
            >
              {locale === "am"
                ? "የሥራ መግቢያ በር፡ ተደራሽ የቴክኖሎጂ እና የዲጂታል የሥራ ዕድሎች"
                : locale === "om"
                ? "Karra Hojii: Carraawwan Hojii Diijitaalaa fi Teeknooloojii Hundaaf Mijatoo"
                : locale === "ti"
                ? "ናይ ስራሕ ማዕጾ፡ ተበጻሕቲ ናይ ቴክኖሎጂን ዲጂታልን ናይ ስራሕ ዕድላት"
                : locale === "so"
                ? "Albaabka Shaqada: Fursadaha Farsamada iyo Dijitaalka ee La Heli Karo"
                : "Career Gateway: Accessible Digital & Tech Opportunities"}
            </h2>
            <p
              style={{
                margin: 0,
                color: "var(--color-muted-ink)",
                fontSize: "15px",
                lineHeight: 1.6,
              }}
            >
              {locale === "am"
                ? "ተማሪዎችን እና የዲጂታል ብሪጅ ተመራቂዎችን ከተረጋገጡ ተደራሽ የሥራ አካባቢዎች ጋር ያገናኛል። እያንዳንዱ የሥራ ካርድ የድምጽ ማጠቃለያ፣ በ200% ማጉላት የማይዛባ አቀማመጥ፣ እና በቀጥታ የተረጋገጠ ምስክር ወረቀት ማያያዣ አለው።"
                : locale === "om"
                ? "Barattoota dandeettii diijitaalaa qaban hojjechiistota haala mijataa qaban waliin walqunnamsiisa. Kaardiin hojii hundi gabaasa sagalee fi ragaa mirkanaa'e qaba."
                : locale === "ti"
                ? "ምስ ዝተረጋገጹ ናይ ስራሕ ምቹእነታት ዘለዎም ትካላት የራኽብ። ነፍሲ ወከፍ ናይ ስራሕ ካርድ ናይ ድምጺ ሓበሬታን ዝተረጋገጸ ምስክር ወረቐትን ኣለዎ።"
                : locale === "so"
                ? "Isku xidhka ardayda xirfadda leh iyo loo-shaqeeyayaasha bixiya adeegyada la xaqiijiyay. Kaadh kasta wuxuu leeyahay koobid maqal ah iyo shahaado la xaqiijin karo."
                : "Connecting skilled learners with inclusive Ethiopian employers providing verified workplace accommodations, 200% zoom reflow resilience, audio summaries, and verifiable certificate applications."}
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowJsonLdModal(true)}
              style={{ fontSize: "13px", padding: "0.45rem 0.95rem" }}
              aria-label="View schema.org JSON-LD structured data"
            >
              <span>schema.org JSON-LD</span>
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleDownloadJsonLd}
              style={{ fontSize: "13px", padding: "0.45rem 0.95rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
              title="Download all job postings in standard schema.org JSON-LD"
            >
              <IconDownload size={14} />
              <span>{isAm ? "JSON-LD አውርድ" : "Export JSON-LD"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Accessible Interactive Filter Toolbar */}
      <section
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-card)",
          padding: "1.25rem 1.5rem",
          marginBottom: "1.75rem",
          boxShadow: "var(--shadow-subtle)",
        }}
        aria-label={isAm ? "የሥራ ፍለጋ እና ማጣሪያዎች" : "Job Search & Filter Controls"}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-end" }}>
          {/* Keyword Search */}
          <div style={{ flex: "1 1 240px", minWidth: "220px" }}>
            <label
              htmlFor="job-search-input"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "0.35rem", color: "var(--color-ink)" }}
            >
              {isAm ? "በስም፣ በድርጅት ወይም በቁልፍ ቃል ፈልግ:" : "Search by title, employer, or keyword:"}
            </label>
            <input
              id="job-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAm ? "ለምሳሌ፡ QA Analyst፣ FinTech፣ Ethio Telecom..." : "e.g., QA Analyst, FinTech, Addis Ababa..."}
              style={{
                width: "100%",
                padding: "0.55rem 0.85rem",
                fontSize: "14px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface-elevated, #FFF)",
                color: "var(--color-ink)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Work Mode Select */}
          <div style={{ flex: "0 1 180px", minWidth: "160px" }}>
            <label
              htmlFor="filter-work-mode"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "0.35rem", color: "var(--color-ink)" }}
            >
              {isAm ? "የሥራ ሁኔታ:" : "Work Mode:"}
            </label>
            <select
              id="filter-work-mode"
              value={selectedWorkMode}
              onChange={(e) => setSelectedWorkMode(e.target.value)}
              style={{
                width: "100%",
                padding: "0.55rem 0.85rem",
                fontSize: "14px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface-elevated, #FFF)",
                color: "var(--color-ink)",
                minHeight: "38px",
              }}
            >
              <option value="all">{isAm ? "ሁሉም ሁኔታዎች (All)" : "All Work Modes"}</option>
              <option value="hybrid">{isAm ? "ድብልቅ (Hybrid)" : "Hybrid (Addis / Regional)"}</option>
              <option value="remote">{isAm ? "የርቀት (100% Remote)" : "100% Remote (Ethiopia)"}</option>
              <option value="onsite">{isAm ? "በቦታው (On-site)" : "On-site"}</option>
            </select>
          </div>

          {/* Accommodation Select */}
          <div style={{ flex: "0 1 230px", minWidth: "190px" }}>
            <label
              htmlFor="filter-acc"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "0.35rem", color: "var(--color-ink)" }}
            >
              {isAm ? "የተረጋገጠ ምቹነት:" : "Workplace Accommodation:"}
            </label>
            <select
              id="filter-acc"
              value={selectedAccommodation}
              onChange={(e) => setSelectedAccommodation(e.target.value)}
              style={{
                width: "100%",
                padding: "0.55rem 0.85rem",
                fontSize: "14px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface-elevated, #FFF)",
                color: "var(--color-ink)",
                minHeight: "38px",
              }}
            >
              <option value="all">{isAm ? "ሁሉም ምቹነቶች (All)" : "All Accommodations"}</option>
              <option value="screenreader">{isAm ? "የስክሪን አንባቢ ኮምፒውተሮች" : "Screen reader workstations"}</option>
              <option value="interpreter">{isAm ? "የምልክት ቋንቋ አስተርጓሚ" : "Sign language interpreters"}</option>
              <option value="flexible">{isAm ? "ተለዋዋጭ ሰዓት / የርቀት" : "Flexible hours / Remote"}</option>
              <option value="campus">{isAm ? "ደረጃ አልባ ተደራሽ ግቢ" : "Barrier-free accessible campus"}</option>
              <option value="keyboard">{isAm ? "በኪቦርድ የሚሰራ የልማት አካባቢ" : "Keyboard-first workflow"}</option>
            </select>
          </div>

          {/* Course Skill Match Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingBottom: "0.45rem" }}>
            <input
              id="filter-skill-match"
              type="checkbox"
              checked={filterCourseSkillsOnly}
              onChange={(e) => setFilterCourseSkillsOnly(e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "var(--color-brand)" }}
            />
            <label
              htmlFor="filter-skill-match"
              style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-ink)", cursor: "pointer" }}
            >
              {isAm ? "ከተማርኩት ችሎታ ጋር የሚስማሙ (Matches Course)" : "Matches Lesson Skills"}
            </label>
          </div>

          {/* Clear Filters */}
          {(searchQuery || selectedWorkMode !== "all" || selectedAccommodation !== "all" || filterCourseSkillsOnly) && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSearchQuery("");
                setSelectedWorkMode("all");
                setSelectedAccommodation("all");
                setFilterCourseSkillsOnly(false);
              }}
              style={{ fontSize: "13px", padding: "0.45rem 0.9rem", minHeight: "38px" }}
            >
              {isAm ? "ማጣሪያዎችን አጽዳ" : "Reset Filters"}
            </button>
          )}
        </div>

        {/* Live Status Announcer for Screen Readers */}
        <div
          role="status"
          aria-live="polite"
          style={{ marginTop: "0.75rem", fontSize: "13px", color: "var(--color-muted-ink)" }}
        >
          {loading ? (
            <span>{isAm ? "የሥራ ዕድሎች በመጫን ላይ ናቸው..." : "Loading accessible job postings..."}</span>
          ) : (
            <span>
              {isAm
                ? `${jobs.length} የሥራ ዕድሎች ውስጥ ${filteredJobs.length} ተገኝተዋል`
                : `Showing ${filteredJobs.length} of ${jobs.length} accessible opportunities`}
            </span>
          )}
        </div>
      </section>

      {/* Job Postings Grid (Reflow-safe, WCAG 1.4.10 tested) */}
      <section aria-labelledby="heading-job-results">
        <h3 id="heading-job-results" className="sr-only">
          {isAm ? "የተገኙ የሥራ ዝርዝሮች" : "Available Job Postings"}
        </h3>

        {filteredJobs.length === 0 && !loading && (
          <div
            className="card"
            style={{
              padding: "3rem 2rem",
              textAlign: "center",
              background: "var(--color-surface)",
              color: "var(--color-muted-ink)",
            }}
          >
            <p style={{ fontSize: "1.1rem", fontWeight: 500, margin: "0 0 0.5rem 0" }}>
              {isAm ? "ከተመረጡት ማጣሪያዎች ጋር የሚስማማ የሥራ ዕድል አልተገኘም" : "No opportunities match your filter criteria."}
            </p>
            <p style={{ fontSize: "14px", margin: "0 0 1rem 0" }}>
              {isAm ? "እባክዎ ፍለጋዎን ይቀይሩ ወይም ማጣሪያዎችን ያጽዱ።" : "Try clearing your search terms or selecting 'All' for work mode and accommodations."}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setSearchQuery("");
                setSelectedWorkMode("all");
                setSelectedAccommodation("all");
                setFilterCourseSkillsOnly(false);
              }}
            >
              {isAm ? "ሁሉንም የሥራ ዕድሎች አሳይ" : "View All Opportunities"}
            </button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {filteredJobs.map((job) => (
            <JobCardItem key={job.id} job={job} locale={locale} />
          ))}
        </div>
      </section>

      {/* JSON-LD Schema Modal */}
      {showJsonLdModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-schema-title"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 1000,
          }}
          onClick={() => setShowJsonLdModal(false)}
        >
          <div
            style={{
              background: "var(--color-surface)",
              color: "var(--color-ink)",
              borderRadius: "var(--radius-card)",
              maxWidth: "720px",
              width: "100%",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.3)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--color-border-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 id="modal-schema-title" style={{ margin: 0, fontSize: "1.15rem" }}>
                schema.org/JobPosting JSON-LD Export
              </h3>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowJsonLdModal(false)}
                style={{ padding: "0.25rem 0.6rem", minHeight: "32px", fontSize: "13px" }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "1.25rem 1.5rem", overflowY: "auto", flex: "1 1 auto" }}>
              <p style={{ margin: "0 0 1rem 0", fontSize: "13px", color: "var(--color-muted-ink)" }}>
                This standardized schema conforms to schema.org/JobPosting and allows assistive career search engines,
                NVDA/screen-reader aggregators, and national job banks to parse accommodation metadata.
              </p>
              <pre
                style={{
                  background: "#1E293B",
                  color: "#F8FAFC",
                  padding: "1rem",
                  borderRadius: "8px",
                  fontSize: "12px",
                  overflowX: "auto",
                  margin: 0,
                }}
              >
                <code>{jsonLdContent}</code>
              </pre>
            </div>
            <div
              style={{
                padding: "1rem 1.5rem",
                borderTop: "1px solid var(--color-border-subtle)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  navigator.clipboard.writeText(jsonLdContent);
                  alert(isAm ? "JSON-LD ወደ ቅንጥብ ሰሌዳ ተቀድቷል!" : "Copied JSON-LD to clipboard!");
                }}
              >
                {isAm ? "ኮፒ አድርግ" : "Copy to Clipboard"}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleDownloadJsonLd}
              >
                {isAm ? "ፋይሉን አውርድ (.jsonld)" : "Download File (.jsonld)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
