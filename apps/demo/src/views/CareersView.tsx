import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { AccessibleJob } from "@abugida/lesson-schema";
import { SupportedLocale } from "@abugida/media-kit";
import { JobCardItem, resolveLocalized } from "../components/JobCardItem";
import {
  IconCheck,
  IconDownload,
  IconVolume,
  IconSearch,
  IconClose,
  IconChevronDown,
  IconShieldCheck,
  IconBriefcase
} from "../components/Icons";

interface CareersViewProps {
  locale: SupportedLocale;
}

interface CareersTexts {
  inclusiveHubBadge: string;
  verifiedAccommodationsBadge: string;
  exportJsonLdBtn: string;
  filterToolbarAriaLabel: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchAriaLabel: string;
  clearSearchAriaLabel: string;
  accLabel: string;
  accFilterAriaLabel: string;
  accAll: string;
  accScreenreader: string;
  accInterpreter: string;
  accFlexible: string;
  accCampus: string;
  accKeyboard: string;
  workModeLabel: string;
  workModeAriaLabel: string;
  resetFiltersAriaLabel: string;
  availableJobsHeading: string;
  noJobsFoundHeading: string;
  noJobsFoundSubtext: string;
  viewAllOpportunitiesBtn: string;
  jsonLdCopiedAlert: string;
  copyJsonLdBtn: string;
  downloadJsonLdBtn: string;
}

const CAREERS_TEXTS: Record<SupportedLocale, CareersTexts> = {
  en: {
    inclusiveHubBadge: "Inclusive Employment Hub",
    verifiedAccommodationsBadge: "Verified Accommodations",
    exportJsonLdBtn: "Export JSON-LD",
    filterToolbarAriaLabel: "Job Search & Filter Controls",
    searchLabel: "Search by title, employer, or keyword:",
    searchPlaceholder: "e.g., QA Analyst, FinTech, Addis Ababa...",
    searchAriaLabel: "Search jobs by keyword",
    clearSearchAriaLabel: "Clear search query",
    accLabel: "Workplace Accommodation:",
    accFilterAriaLabel: "Filter by workplace accommodation",
    accAll: "All Accommodations",
    accScreenreader: "Screen reader workstations",
    accInterpreter: "Sign language interpreters",
    accFlexible: "Flexible hours / Remote",
    accCampus: "Barrier-free campus",
    accKeyboard: "Keyboard-first workflow",
    workModeLabel: "Work Mode:",
    workModeAriaLabel: "Work Mode selection",
    resetFiltersAriaLabel: "Reset all active filters",
    availableJobsHeading: "Available Job Postings",
    noJobsFoundHeading: "No opportunities match your filter criteria.",
    noJobsFoundSubtext: "Try clearing your search terms or selecting 'All' for work mode and accommodations.",
    viewAllOpportunitiesBtn: "View All Opportunities",
    jsonLdCopiedAlert: "Copied JSON-LD to clipboard!",
    copyJsonLdBtn: "Copy to Clipboard",
    downloadJsonLdBtn: "Download File (.jsonld)",
  },
  am: {
    inclusiveHubBadge: "ተደራሽ የሥራ ዕድሎች",
    verifiedAccommodationsBadge: "የተረጋገጡ የሥራ ምቹነቶች",
    exportJsonLdBtn: "JSON-LD አውርድ",
    filterToolbarAriaLabel: "የሥራ ፍለጋ እና ማጣሪያዎች",
    searchLabel: "በስም፣ በድርጅት ወይም በቁልፍ ቃል ፈልግ:",
    searchPlaceholder: "ለምሳሌ፡ QA Analyst፣ FinTech፣ አዲስ አበባ...",
    searchAriaLabel: "በስም ወይም በቁልፍ ቃል ፈልግ",
    clearSearchAriaLabel: "የፍለጋ ጽሑፉን አጽዳ",
    accLabel: "የተረጋገጠ ምቹነት:",
    accFilterAriaLabel: "የሥራ ቦታ ተደራሽነት ምቹነት",
    accAll: "ሁሉም ምቹነቶች (All)",
    accScreenreader: "የስክሪን አንባቢ ኮምፒውተሮች",
    accInterpreter: "የምልክት ቋንቋ አስተርጓሚ",
    accFlexible: "ተለዋዋጭ ሰዓት / የርቀት",
    accCampus: "ደረጃ አልባ ተደራሽ ግቢ",
    accKeyboard: "በኪቦርድ የሚሰራ የልማት አካባቢ",
    workModeLabel: "የሥራ ሁኔታ:",
    workModeAriaLabel: "የሥራ ሁኔታ ማጣሪያ",
    resetFiltersAriaLabel: "ሁሉንም ማጣሪያዎች አጽዳ",
    availableJobsHeading: "የተገኙ የሥራ ዝርዝሮች",
    noJobsFoundHeading: "ከተመረጡት ማጣሪያዎች ጋር የሚስማማ የሥራ ዕድል አልተገኘም",
    noJobsFoundSubtext: "እባክዎ ፍለጋዎን ይቀይሩ ወይም ማጣሪያዎችን ያጽዱ።" ,
    viewAllOpportunitiesBtn: "ሁሉንም የሥራ ዕድሎች አሳይ",
    jsonLdCopiedAlert: "JSON-LD ወደ ቅንጥብ ሰሌዳ ተቀድቷል!",
    copyJsonLdBtn: "ኮፒ አድርግ",
    downloadJsonLdBtn: "ፋይሉን አውርድ (.jsonld)",
  },
  om: {
    inclusiveHubBadge: "Wiirtuu Hojii Hundaaf Mijataa",
    verifiedAccommodationsBadge: "Mijatummaa Mirkanaa'e",
    exportJsonLdBtn: "JSON-LD Buufadhaa",
    filterToolbarAriaLabel: "Barbaacha Hojii fi Qindaa'ina Filtaraa",
    searchLabel: "Mata duree, qacaraa ykn jecha ijoodhaan barbaadi:",
    searchPlaceholder: "fkn., QA Analyst, FinTech, Finfinnee...",
    searchAriaLabel: "Jecha ijoodhaan hojii barbaadi",
    clearSearchAriaLabel: "Barbaacha qulqulleessi",
    accLabel: "Mijatummaa Bakka Hojii:",
    accFilterAriaLabel: "Mijatummaa bakka hojiitiin filadhu",
    accAll: "Mijatummaa Hunda (All)",
    accScreenreader: "Kompiitara dubbisaa skiriinii",
    accInterpreter: "Turjumaana Afaan Mallattoo",
    accFlexible: "Sa'aatii jijjiiramaa / Fageenya",
    accCampus: "Mooraa gufuu maleessa",
    accKeyboard: "Hojii kiiboordiin dursu",
    workModeLabel: "Haala Hojii:",
    workModeAriaLabel: "Filannoo haala hojii",
    resetFiltersAriaLabel: "Filtaroota hunda qulqulleessi",
    availableJobsHeading: "Tarree Hojiiwwan Jiran",
    noJobsFoundHeading: "Ulaagaalee filattaniin carraan hojii walsimu hin argamne.",
    noJobsFoundSubtext: "Maaloo jecha barbaachaa jijjiiraa ykn filtaroota qulqulleessaa.",
    viewAllOpportunitiesBtn: "Carraawwan Hunda Agarsiisi",
    jsonLdCopiedAlert: "JSON-LD gara gabatee garagalchaatti garagalffameera!",
    copyJsonLdBtn: "Garagalchi",
    downloadJsonLdBtn: "Faayila Buufadhaa (.jsonld)",
  },
  ti: {
    inclusiveHubBadge: "ሓቛፊ ማእከል ስራሕ",
    verifiedAccommodationsBadge: "ዝተረጋገጹ ምቹእነታት",
    exportJsonLdBtn: "JSON-LD ኣውርድ",
    filterToolbarAriaLabel: "ምድላይ ስራሕን መቆጻጸሪ ማጣረይን",
    searchLabel: "ብኣርእስቲ፣ ብቀጣሪ ወይ ብመፍትሕ ቃል ድለዩ:",
    searchPlaceholder: "ንኣብነት፡ QA Analyst፣ FinTech፣ ኣዲስ ኣበባ...",
    searchAriaLabel: "ብመፍትሕ ቃል ስራሕ ድለዩ",
    clearSearchAriaLabel: "ጽሑፍ ምድላይ ኣጽሪ",
    accLabel: "ዝተረጋገጸ ምቹእነት:",
    accFilterAriaLabel: "ብምቹእነት ስራሕ ቦታ ኣጣሪ",
    accAll: "ኩሎም ምቹእነታት (All)",
    accScreenreader: "ኮምፒውተር ስክሪን ኣንባቢ",
    accInterpreter: "ኣስተርጓሚ ምልክት ቋንቋ",
    accFlexible: "ተለዋዋጢ ሰዓታት / ርሕቐት",
    accCampus: "ተበጻሒ ናጻ ግቢ",
    accKeyboard: "ቀዳምነት ኪቦርድ ዝህብ ኣሰራርሓ",
    workModeLabel: "ኩነታት ስራሕ:",
    workModeAriaLabel: "ምርጫ ኩነታት ስራሕ",
    resetFiltersAriaLabel: "ኩሎም ማጣረይቲ ኣጽሪ",
    availableJobsHeading: "ዝተረኽቡ ዝርዝራት ስራሕ",
    noJobsFoundHeading: "ምስ ዝተመረጹ ማጣረይቲ ዝሰማማዕ ናይ ስራሕ ዕድል ኣይተረኽበን።",
    noJobsFoundSubtext: "በጃኹም ቃላት ምድላይኩም ቀይሩ ወይ ማጣረይቲ ኣጽርዩ።",
    viewAllOpportunitiesBtn: "ኩሎም ናይ ስራሕ ዕድላት ኣርኢ",
    jsonLdCopiedAlert: "JSON-LD ተቐዲሑ ኣሎ!",
    copyJsonLdBtn: "ቅዳሕ",
    downloadJsonLdBtn: "ፋይል ኣውርድ (.jsonld)",
  },
  so: {
    inclusiveHubBadge: "Xarunta Shaqada loo Dhan Yahay",
    verifiedAccommodationsBadge: "Fursadaha La Xaqiijiyay",
    exportJsonLdBtn: "Soo deji JSON-LD",
    filterToolbarAriaLabel: "Raadinta Shaqada & Koontaroolada Shaandhada",
    searchLabel: "Ku raadi magac, loo-shaqeeye, ama erey muhiim ah:",
    searchPlaceholder: "tusaale, QA Analyst, FinTech, Addis Ababa...",
    searchAriaLabel: "Ku raadi shaqooyinka ereyga muhiimka ah",
    clearSearchAriaLabel: "Nadiifi qoraalka raadinta",
    accLabel: "Fursadda Goobta Shaqada:",
    accFilterAriaLabel: "Ku shaandhee fursadda goobta shaqada",
    accAll: "Dhammaan Fursadaha (All)",
    accScreenreader: "Kombiyuutarada akhriska shaashadda",
    accInterpreter: "Turjumaanka luqadda dhegoolaha",
    accFlexible: "Saacado dabacsan / Meel fog",
    accCampus: "Xarun aan carqalad lahayn",
    accKeyboard: "Habka shaqada ee kiiboodhka",
    workModeLabel: "Qaabka Shaqada:",
    workModeAriaLabel: "Xulashada qaabka shaqada",
    resetFiltersAriaLabel: "Dib u deji dhammaan shaandhooyinka",
    availableJobsHeading: "Liiska Shaqooyinka La Heli Karo",
    noJobsFoundHeading: "Ma jiraan fursado u dhigma shuruudahaaga.",
    noJobsFoundSubtext: "Fadlan isku day inaad beddesho ereyada raadinta ama aad nadiifiso shaandhada.",
    viewAllOpportunitiesBtn: "Eeg Dhammaan Fursadaha",
    jsonLdCopiedAlert: "JSON-LD waa la koobiyeeyay!",
    copyJsonLdBtn: "Koobiyee",
    downloadJsonLdBtn: "Soo deji Faylka (.jsonld)",
  },
};

export const CareersView: React.FC<CareersViewProps> = ({ locale }) => {
  const [jobs, setJobs] = useState<AccessibleJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>("all");
  const [selectedAccommodation, setSelectedAccommodation] = useState<string>("all");
  const [filterCourseSkillsOnly, setFilterCourseSkillsOnly] = useState<boolean>(false);
  const [showJsonLdModal, setShowJsonLdModal] = useState(false);
  const t = CAREERS_TEXTS[locale] || CAREERS_TEXTS.en;

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
        const employer = (typeof job.employer === "string" ? job.employer : resolveLocalized(job.employer, locale)).toLowerCase();
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
        const matchesCourse = job.requiredSkills.includes("skill-a11y-literacy") && job.requiredSkills.includes("skill-digital-collab");
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

  const workModes = [
    {
      id: "all",
      label: locale === "am" ? "ሁሉም (All)" : locale === "om" ? "Hunda (All)" : locale === "ti" ? "ኩሎም (All)" : locale === "so" ? "Dhammaan (All)" : "All Modes",
    },
    {
      id: "hybrid",
      label: locale === "am" ? "ድብልቅ" : locale === "om" ? "Makaa" : locale === "ti" ? "ሕውስዋስ" : locale === "so" ? "Isku-dhafan" : "Hybrid",
    },
    {
      id: "remote",
      label: locale === "am" ? "የርቀት" : locale === "om" ? "Fageenya" : locale === "ti" ? "ናይ ርሕቐት" : locale === "so" ? "Meel Fog" : "100% Remote",
    },
    {
      id: "onsite",
      label: locale === "am" ? "በቦታው" : locale === "om" ? "Bakka Hojii" : locale === "ti" ? "ኣብ ቦታኡ" : locale === "so" ? "Goobta" : "On-site",
    },
  ];

  const hasActiveFilters = Boolean(
    searchQuery || selectedWorkMode !== "all" || selectedAccommodation !== "all" || filterCourseSkillsOnly
  );

  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedWorkMode("all");
    setSelectedAccommodation("all");
    setFilterCourseSkillsOnly(false);
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
                {t.inclusiveHubBadge}
              </span>
              <span className="badge badge-success">
                {t.verifiedAccommodationsBadge}
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
              <span>{t.exportJsonLdBtn}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Accessible Interactive Filter Toolbar (Apple / Impeccable Design) */}
      <section
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-card)",
          padding: "1.25rem 1.5rem",
          marginBottom: "1.75rem",
          boxShadow: "var(--shadow-subtle)",
          display: "flex",
          flexDirection: "column",
          gap: "1.1rem",
        }}
        aria-label={t.filterToolbarAriaLabel}
      >
        {/* Tier 1: Search Input, Accommodation Custom Select & Skill Match Chip */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-end" }}>
          {/* Keyword Search with Embedded Icons */}
          <div style={{ flex: "1 1 260px", minWidth: "220px" }}>
            <label
              htmlFor="job-search-input"
              style={{
                display: "block",
                fontSize: "12.5px",
                fontWeight: 600,
                marginBottom: "0.35rem",
                color: "var(--color-ink)",
                letterSpacing: "-0.01em",
              }}
            >
              {t.searchLabel}
            </label>
            <div className="search-input-wrapper">
              <span
                style={{
                  position: "absolute",
                  left: "0.85rem",
                  color: "var(--color-muted-ink)",
                  display: "flex",
                  alignItems: "center",
                  pointerEvents: "none",
                }}
              >
                <IconSearch size={15} />
              </span>
              <input
                id="job-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="search-input-field"
                aria-label={t.searchAriaLabel}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label={t.clearSearchAriaLabel}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    background: "none",
                    border: "none",
                    padding: "2px",
                    color: "var(--color-muted-ink)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                  }}
                >
                  <IconClose size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Accommodation Custom Select */}
          <div style={{ flex: "0 1 250px", minWidth: "210px" }}>
            <label
              htmlFor="filter-acc"
              style={{
                display: "block",
                fontSize: "12.5px",
                fontWeight: 600,
                marginBottom: "0.35rem",
                color: "var(--color-ink)",
                letterSpacing: "-0.01em",
              }}
            >
              {t.accLabel}
            </label>
            <div className="custom-select-container">
              <span className="custom-select-icon-left">
                <IconShieldCheck size={15} />
              </span>
              <select
                id="filter-acc"
                value={selectedAccommodation}
                onChange={(e) => setSelectedAccommodation(e.target.value)}
                className="custom-select-field"
                aria-label={t.accFilterAriaLabel}
              >
                <option value="all">{t.accAll}</option>
                <option value="screenreader">{t.accScreenreader}</option>
                <option value="interpreter">{t.accInterpreter}</option>
                <option value="flexible">{t.accFlexible}</option>
                <option value="campus">{t.accCampus}</option>
                <option value="keyboard">{t.accKeyboard}</option>
              </select>
              <span className="custom-select-icon-right">
                <IconChevronDown size={14} />
              </span>
            </div>
          </div>

          {/* Tactile Switch Button: Matches Lesson Skills */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <span
              style={{
                display: "block",
                fontSize: "12.5px",
                fontWeight: 600,
                marginBottom: "0.35rem",
                color: "transparent",
                userSelect: "none",
              }}
              aria-hidden="true"
            >
              Skill Filter
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={filterCourseSkillsOnly}
              className={`tactile-toggle-chip ${filterCourseSkillsOnly ? "active" : ""}`}
              onClick={() => setFilterCourseSkillsOnly(!filterCourseSkillsOnly)}
              title="Filter opportunities aligned directly with the Abugida course learning outcomes"
            >
              {filterCourseSkillsOnly && <IconCheck size={13} style={{ marginRight: "2px", strokeWidth: "2.5" }} />}
              <span>
                {locale === "am"
                  ? "ከተማርኩት ችሎታ ጋር የሚስማሙ"
                  : locale === "om"
                  ? "Dandeettii Barnootaa Walsima"
                  : locale === "ti"
                  ? "ምስ ናይ ትምህርቲ ክእለት ዝሰማማዕ"
                  : locale === "so"
                  ? "U Dhigma Xirfadaha Casharka"
                  : "Matches Lesson Skills"}
              </span>
            </button>
          </div>
        </div>

        {/* Tier 2: Apple Segmented Control for Work Mode + Results Counter & Reset */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.85rem",
            paddingTop: "0.25rem",
            borderTop: "1px solid var(--color-border-subtle)",
          }}
        >
          {/* Apple Segmented Control for Work Mode */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--color-muted-ink)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {t.workModeLabel}
            </span>
            <div
              className="segmented-control-group"
              role="radiogroup"
              aria-label={t.workModeAriaLabel}
            >
              {workModes.map((mode) => {
                const isSelected = selectedWorkMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`segmented-pill-btn ${isSelected ? "active" : ""}`}
                    onClick={() => setSelectedWorkMode(mode.id)}
                  >
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Badge & Reset CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <div
              role="status"
              aria-live="polite"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                fontSize: "12.5px",
                fontWeight: 500,
                color: "var(--color-muted-ink)",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: filteredJobs.length > 0 ? "var(--color-brand)" : "var(--color-alert-ink, #D70015)",
                  display: "inline-block",
                }}
                aria-hidden="true"
              />
              {loading ? (
                <span>
                  {locale === "am"
                    ? "የሥራ ዕድሎች በመጫን ላይ ናቸው..."
                    : locale === "om"
                    ? "Carraawwan fe'amaa jiru..."
                    : locale === "ti"
                    ? "ናይ ስራሕ ዕድላት ይጽዓኑ ኣለዉ..."
                    : locale === "so"
                    ? "Fursadaha waa la soo dejinayaa..."
                    : "Loading accessible job postings..."}
                </span>
              ) : (
                <span>
                  {locale === "am"
                    ? `${jobs.length} የሥራ ዕድሎች ውስጥ ${filteredJobs.length} ተገኝተዋል`
                    : locale === "om"
                    ? `Carraawwan ${jobs.length} keessaa ${filteredJobs.length} mul'achaa jiru`
                    : locale === "ti"
                    ? `ካብ ${jobs.length} ናይ ስራሕ ዕድላት ${filteredJobs.length} ተረኺቦም`
                    : locale === "so"
                    ? `Waxaa la muujinayaa ${filteredJobs.length} ka mid ah ${jobs.length} fursadood`
                    : `Showing ${filteredJobs.length} of ${jobs.length} accessible opportunities`}
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetAllFilters}
                style={{
                  fontSize: "12px",
                  padding: "0.3rem 0.75rem",
                  borderRadius: "var(--radius-pill)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  minHeight: "30px",
                }}
                aria-label={t.resetFiltersAriaLabel}
              >
                <IconClose size={12} />
                <span>
                  {locale === "am"
                    ? "ማጣሪያዎችን አጽዳ"
                    : locale === "om"
                    ? "Filtaroota Qulqulleessi"
                    : locale === "ti"
                    ? "ማጣረይቲ ኣጽሪ"
                    : locale === "so"
                    ? "Dib u deji"
                    : "Reset Filters"}
                </span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Job Postings Grid (Reflow-safe, WCAG 1.4.10 tested) */}
      <section aria-labelledby="heading-job-results">
        <h3 id="heading-job-results" className="sr-only">
          {t.availableJobsHeading}
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
              {t.noJobsFoundHeading}
            </p>
            <p style={{ fontSize: "14px", margin: "0 0 1rem 0" }}>
              {t.noJobsFoundSubtext}
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
              {t.viewAllOpportunitiesBtn}
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
      {showJsonLdModal && typeof document !== "undefined" && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-schema-title"
          style={{
            position: "fixed",
            inset: 0,
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 99999,
          }}
          onClick={() => setShowJsonLdModal(false)}
        >
          <div
            style={{
              background: "var(--color-surface-elevated, #FFFFFF)",
              color: "var(--color-ink)",
              borderRadius: "var(--radius-card)",
              maxWidth: "720px",
              width: "100%",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.22), 0 4px 16px rgba(0, 0, 0, 0.08)",
              border: "1px solid var(--color-border)",
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
                  alert(t.jsonLdCopiedAlert);
                }}
              >
                {t.copyJsonLdBtn}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleDownloadJsonLd}
              >
                {t.downloadJsonLdBtn}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
