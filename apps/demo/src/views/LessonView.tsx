import React, { useEffect, useState, useRef } from "react";
import { AccessibleJob } from "@abugida/lesson-schema";
import { offlineStorage } from "@abugida/media-kit";
import { NavLink } from "../router";
import { JobCardItem } from "../components/JobCardItem";

interface LessonViewProps {
  locale: "en" | "am";
}

export const LessonView: React.FC<LessonViewProps> = ({ locale }) => {
  const [jobs, setJobs] = useState<AccessibleJob[]>([]);
  const [isPackReady, setIsPackReady] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState("");
  const playerRef = useRef<HTMLElement | null>(null);

  const isAm = locale === "am";

  useEffect(() => {
    // Check if offline pack is cached
    offlineStorage.isPackageReady("digital-workplace-01", "pkg-3g-light").then((ready) => {
      setIsPackReady(ready);
      if (ready) {
        setDownloadMsg(
          isAm
            ? "ይህ ትምህርት በመሣሪያዎ ላይ ተቀምጧል (ያለ ኢንተርኔት መጠቀም ይችላሉ)።"
            : "Lesson package is stored offline and ready for airplane mode."
        );
      }
    });

    // Fetch jobs
    fetch("/jobs/jobs.json")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setJobs(data))
      .catch((err) => console.warn("Failed to load jobs:", err));
  }, [isAm]);

  // Update locale attribute on player when locale changes
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setAttribute("locale", locale);
    }
  }, [locale]);

  const handleDownloadPack = async () => {
    setIsDownloading(true);
    setDownloadMsg(isAm ? "ጥቅሉን በማውረድ እና በመሸጎጥ ላይ..." : "Caching 3G study pack in offline storage...");

    try {
      const assetsToCache = [
        "/lessons/digital-workplace/lesson.json",
        "/lessons/digital-workplace/captions.en.vtt",
        "/lessons/digital-workplace/captions.am.vtt",
        "/lessons/digital-workplace/transcript.en.json",
        "/lessons/digital-workplace/documents/lesson.en.html",
        "/jobs/jobs.json",
        "/lessons/digital-workplace/media/lesson-audio.opus",
        "/lessons/digital-workplace/media/poster.webp",
      ];

      await offlineStorage.savePackage(
        "digital-workplace-01",
        "pkg-3g-light",
        assetsToCache,
        3.2 * 1024 * 1024
      );

      setIsPackReady(true);
      setDownloadMsg(
        isAm
          ? "የወረደው ጥቅል ተጠናቋል! ያለ ኢንተርኔት መጠቀም ይችላሉ።"
          : "Package cached successfully! 3.2 MB stored for offline study."
      );
    } catch (err) {
      console.error("Failed to cache offline pack:", err);
      setDownloadMsg(
        isAm ? "ጥቅሉን ማውረድ አልተሳካም። እባክዎ እንደገና ይሞክሩ።" : "Failed to cache offline package. Please retry."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div>
      {/* Lesson Header */}
      <header style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.8rem", color: "var(--color-brand)", margin: "0 0 0.5rem 0" }}>
          {isAm ? "የዲጂታል የሥራ ቦታ ክህሎቶች፡ መሠረታዊ" : "Digital Workplace Skills: Foundations"}
        </h2>
        <p style={{ margin: 0, color: "var(--color-muted-ink)", fontSize: "1.05rem" }}>
          {isAm
            ? "ለዲጂታል ሥራ አስፈላጊ የሆኑ መሣሪያዎችን እና የትብብር አሠራሮችን ይማሩ።"
            : "Master the essential tools and collaborative workflows for digital employment."}
        </p>
      </header>

      {/* Level 1 Custom Element Player */}
      <section style={{ marginBottom: "2.5rem" }} aria-label={isAm ? "የቪዲዮ ማጫወቻ ክፍል" : "Interactive Media Player Section"}>
        {/* @ts-ignore custom element */}
        <a11y-media-player
          ref={playerRef}
          id="player"
          manifest-src="/lessons/digital-workplace/lesson.json"
          locale={locale}
        />

        {/* Keyboard Shortcuts Reference Guide */}
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem 1.25rem",
            background: "#F8FAFC",
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            fontSize: "0.9rem",
          }}
        >
          <strong style={{ display: "block", marginBottom: "0.5rem", color: "var(--color-brand)" }}>
            {isAm ? "የኪቦርድ አቋራጭ ቁልፎች (Keyboard Controls):" : "Keyboard Shortcuts Reference:"}
          </strong>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
            <div><kbd>Space</kbd> / <kbd>k</kbd> : {isAm ? "አጫውት / አቁም" : "Play / Pause"}</div>
            <div><kbd>j</kbd> / <kbd>l</kbd> : {isAm ? "-10s / +10s ዝለል" : "-10s / +10s Seek"}</div>
            <div><kbd>m</kbd> : {isAm ? "ድምፅ አጥፋ / ክፈት" : "Mute / Unmute"}</div>
            <div><kbd>c</kbd> : {isAm ? "የትርጉም ጽሑፍ ቀይር" : "Cycle Captions"}</div>
            <div><kbd>s</kbd> : {isAm ? "የምልክት ቋንቋ መስኮት (ESL)" : "Toggle Sign Language"}</div>
            <div><kbd>v</kbd> : {isAm ? "የድምፅ ማብራሪያ (AD)" : "Audio Description Track"}</div>
          </div>
        </div>
      </section>

      {/* Accessible Documents */}
      <section
        style={{
          marginBottom: "2.5rem",
          padding: "1.5rem",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "8px",
        }}
        aria-labelledby="heading-docs"
      >
        <h3 id="heading-docs" style={{ margin: "0 0 0.5rem 0", color: "var(--color-brand)" }}>
          {isAm ? "ተደራሽ የትምህርት ሰነዶች" : "Accessible Lesson Documents"}
        </h3>
        <p style={{ margin: "0 0 1rem 0", color: "var(--color-muted-ink)" }}>
          {isAm
            ? "ለስክሪን አንባቢ፣ ለዝቅተኛ ባንድዊድዝ እና ከመስመር ውጭ ጥናት የተዘጋጁ የትምህርት ቁሳቁሶች፡"
            : "Download study materials formatted for screen readers, low bandwidth, and offline study:"}
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <li>
            <a href="/lessons/digital-workplace/documents/lesson.en.html" target="_blank" rel="noreferrer" style={{ fontWeight: 600 }}>
              {isAm ? "ተደራሽ HTML ሰነድ" : "Accessible HTML Document"}
            </a>{" "}
            <span style={{ color: "var(--color-muted-ink)", fontSize: "0.88rem" }}>
              ({isAm ? "የተዋቀረ ሲማንቲክ HTML፣ 18 KB" : "Semantic HTML, 18 KB"})
            </span>
          </li>
          <li>
            <a href="/lessons/digital-workplace/documents/lesson.en.tagged.pdf" download style={{ fontWeight: 600 }}>
              {isAm ? "የታገዘ ተደራሽ PDF (Tagged PDF)" : "Tagged Accessible PDF"}
            </a>{" "}
            <span style={{ color: "var(--color-muted-ink)", fontSize: "0.88rem" }}>
              ({isAm ? "የተረጋገጡ ታጎች፣ አማራጭ ጽሑፍ ያለው፣ 142 KB" : "Inspected tags, alternative text included, 142 KB"})
            </span>
          </li>
        </ul>
      </section>

      {/* 3G Low-Data Offline Study Pack */}
      <section
        style={{
          marginBottom: "3rem",
          padding: "1.5rem",
          background: "#F0FDF4",
          border: "1px solid #BBF7D0",
          borderRadius: "8px",
        }}
        aria-labelledby="heading-offline"
      >
        <h3 id="heading-offline" style={{ margin: "0 0 0.5rem 0", color: "#166534" }}>
          {isAm ? "የ 3G ዝቅተኛ ዳታ ከመስመር ውጭ የጥናት ጥቅል" : "3G Low-Data Offline Study Pack"}
        </h3>
        <p style={{ margin: "0 0 1rem 0", color: "#15803D" }}>
          {isAm
            ? "የሞባይል ዳታዎን ይቆጥቡ እና ያለ ኢንተርኔት ግንኙነት መማርዎን ይቀጥሉ፡"
            : "Save mobile data and continue learning without internet access:"}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <strong>{isAm ? "ቀላል ድምፅ + ጽሑፍ + HTML ጥቅል" : "Light Audio + Text + HTML Pack"}</strong> ·{" "}
            <span>{isAm ? "መጠኑ፡" : "Measured Size:"} <strong>3.2 MB</strong></span>
            <div style={{ fontSize: "0.85rem", color: "#15803D", marginTop: "0.25rem" }}>
              {isAm
                ? "የተጨመቀ 32kbps የድምፅ ትምህርት፣ ሲማንቲክ HTML እና ሙሉ የጽሑፍ ትርጉም ያካትታል። ከ 205MB HD ቪዲዮ 98.7% ዳታ ይቆጥባል።"
                : "Includes compressed 32kbps Opus audio, semantic HTML, and full transcript. Saves 98.7% bandwidth vs 205 MB HD video."}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleDownloadPack}
            disabled={isDownloading}
            style={{ minHeight: "42px" }}
          >
            {isDownloading
              ? (isAm ? "በማውረድ ላይ..." : "Caching Pack...")
              : isPackReady
              ? (isAm ? "ዳግም አውርድ (3.2 MB)" : "Re-download Pack (3.2 MB)")
              : (isAm ? "የ 3G ጥቅል አውርድ (3.2 MB)" : "Download 3G Pack (3.2 MB)")}
          </button>
        </div>

        {downloadMsg && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.5rem 0.75rem",
              background: "#DCFCE7",
              color: "#166534",
              borderRadius: "4px",
              fontWeight: 500,
              fontSize: "0.92rem",
            }}
            aria-live="polite"
          >
            {downloadMsg}
          </div>
        )}
      </section>

      {/* Career Gateway Section */}
      <section style={{ marginBottom: "2.5rem" }} aria-labelledby="heading-lesson-jobs">
        <h3 id="heading-lesson-jobs" style={{ fontSize: "1.35rem", color: "var(--color-ink)", marginBottom: "0.5rem" }}>
          {isAm ? "የሥራ መግቢያ በር፡ ተዛማጅ የሥራ ዕድሎች" : "Career Gateway: Related Opportunities"}
        </h3>
        <p style={{ margin: "0 0 1.25rem 0", color: "var(--color-muted-ink)" }}>
          {isAm
            ? "ከዚህ ሥርዓተ ትምህርት ጋር የሚጣጣሙ ድጋፎችን የሚያቀርቡ የሥራ መደቦች፡"
            : "These opportunities offer accommodations matching this course's curriculum:"}
        </p>

        <div>
          {jobs.map((job) => (
            <JobCardItem key={job.id} job={job} locale={locale} />
          ))}
        </div>
      </section>
    </div>
  );
};
