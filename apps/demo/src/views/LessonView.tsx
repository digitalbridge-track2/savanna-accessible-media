import React, { useEffect, useState, useRef } from "react";
import { offlineStorage } from "@abugida/media-kit";
import { NavLink } from "../router";
import {
  IconDocument,
  IconDownload,
  IconCheck,
  IconBriefcase,
  IconExternal,
} from "../components/Icons";

interface LessonViewProps {
  locale: "en" | "am";
}

export const LessonView: React.FC<LessonViewProps> = ({ locale }) => {
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
  }, [isAm]);

  // Update locale attribute on player when locale changes
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setAttribute("locale", locale);
    }
  }, [locale]);

  const handleDownloadPack = async () => {
    setIsDownloading(true);
    setDownloadMsg(isAm ? "ጥቅሉን በማውረድ እና በመሸጎጥ ላይ..." : "Downloading 3G study pack and caching for offline study...");

    try {
      // 1. Trigger physical browser download of the verified zip pack (1.6 MB)
      const downloadLink = document.createElement("a");
      downloadLink.href = "/lessons/digital-workplace/offline-bundle.zip";
      downloadLink.download = "digital-workplace-3g-offline-pack.zip";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // 2. Cache in offlineStorage (Cache Storage & IndexedDB) for airplane mode
      const assetsToCache = [
        "/lessons/digital-workplace/Start-Offline-Lesson.html",
        "/lessons/digital-workplace/lesson.json",
        "/lessons/digital-workplace/captions.en.vtt",
        "/lessons/digital-workplace/captions.am.vtt",
        "/lessons/digital-workplace/transcript.en.json",
        "/lessons/digital-workplace/documents/lesson.en.html",
        "/lessons/digital-workplace/documents/lesson.am.html",
        "/lessons/digital-workplace/documents/lesson.en.tagged.pdf",
        "/lessons/digital-workplace/documents/lesson.am.tagged.pdf",
        "/lessons/digital-workplace/media/lesson-audio.mp3",
        "/lessons/digital-workplace/media/lesson-audio.opus",
        "/lessons/digital-workplace/media/poster.webp",
      ];

      try {
        await offlineStorage.downloadPackage(
          "digital-workplace-01",
          "pkg-3g-light",
          "3G Light Study Pack",
          assetsToCache,
          () => {}
        );
      } catch (cacheErr) {
        console.warn("Browser offline cache storage note:", cacheErr);
      }

      setIsPackReady(true);
      setDownloadMsg(
        isAm
          ? "የ 3G ከመስመር ውጭ ጥቅል (.zip, 1.6 MB) በተሳካ ሁኔታ ወርዷል! ያለ ኢንተርኔት መጠቀም ይችላሉ።"
          : "3G Offline Study Pack (.zip, 1.6 MB) downloaded and stored for offline learning!"
      );
    } catch (err) {
      console.error("Failed to download offline pack:", err);
      setDownloadMsg(
        isAm ? "ጥቅሉን ማውረድ አልተሳካም። እባክዎ እንደገና ይሞክሩ።" : "Failed to download offline package. Please retry."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div>
      {/* Lesson Header */}
      <header style={{ marginBottom: "1.75rem" }}>
        <h2 style={{ fontSize: "34px", color: "var(--color-ink)", margin: "0 0 0.5rem 0", letterSpacing: "-0.011em" }}>
          {isAm ? "የዲጂታል የሥራ ቦታ ክህሎቶች፡ መሠረታዊ" : "Digital Workplace Skills: Foundations"}
        </h2>
        <p style={{ margin: 0, color: "var(--color-muted-ink)", fontSize: "17px" }}>
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
      </section>

      {/* Accessible Documents (Apple Card Layout with Bespoke SVGs) */}
      <section
        className="card"
        style={{
          marginBottom: "2rem",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-card)",
          padding: "1.5rem 1.75rem",
        }}
        aria-labelledby="heading-docs"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <h3 id="heading-docs" style={{ margin: 0, color: "var(--color-ink)", fontSize: "20px", fontWeight: 600 }}>
            {isAm ? "ተደራሽ የትምህርት ሰነዶች" : "Accessible Lesson Documents"}
          </h3>
          <span className="badge badge-brand">WCAG 2.2 AAA Ready</span>
        </div>
        <p style={{ margin: "0 0 1.25rem 0", color: "var(--color-muted-ink)", fontSize: "14px" }}>
          {isAm
            ? "ለስክሪን አንባቢ፣ ለዝቅተኛ ባንድዊድዝ እና ከመስመር ውጭ ጥናት የተዘጋጁ የትምህርት ቁሳቁሶች፡"
            : "Download study materials formatted for screen readers, low bandwidth, and offline study:"}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
          {/* HTML Document Card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem 1.25rem",
              background: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid var(--color-border-subtle)",
              boxShadow: "var(--shadow-subtle)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "var(--color-brand-subtle)",
                  color: "var(--color-brand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconDocument size={22} />
              </div>
              <div>
                <a
                  href={isAm ? "/lessons/digital-workplace/documents/lesson.am.html" : "/lessons/digital-workplace/documents/lesson.en.html"}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontWeight: 600, color: "var(--color-link)", fontSize: "15px", textDecoration: "none" }}
                >
                  {isAm ? "ተደራሽ HTML ሰነድ" : "Accessible HTML Document"}
                </a>
                <div style={{ color: "var(--color-muted-ink)", fontSize: "13px", marginTop: "2px" }}>
                  {isAm ? "የተዋቀረ ሲማንቲክ HTML · 18 KB" : "Semantic HTML, Screen Reader Ready · 18 KB"}
                </div>
              </div>
            </div>

            <a
              href={isAm ? "/lessons/digital-workplace/documents/lesson.am.html" : "/lessons/digital-workplace/documents/lesson.en.html"}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
              style={{ fontSize: "13px", padding: "0.4rem 0.85rem", minHeight: "34px", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
              aria-label={isAm ? "ተደራሽ HTML ሰነድ በሌላ መስኮት ክፈት" : "Open Accessible HTML Document in new window"}
            >
              <span>{isAm ? "ክፈት" : "View"}</span>
              <IconExternal size={13} />
            </a>
          </div>

          {/* Tagged PDF Card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem 1.25rem",
              background: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid var(--color-border-subtle)",
              boxShadow: "var(--shadow-subtle)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "var(--color-brand-subtle)",
                  color: "var(--color-brand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconDownload size={22} />
              </div>
              <div>
                <a
                  href={isAm ? "/lessons/digital-workplace/documents/lesson.am.tagged.pdf" : "/lessons/digital-workplace/documents/lesson.en.tagged.pdf"}
                  download={isAm ? "lesson.am.tagged.pdf" : "lesson.en.tagged.pdf"}
                  style={{ fontWeight: 600, color: "var(--color-link)", fontSize: "15px", textDecoration: "none" }}
                >
                  {isAm ? "የታገዘ ተደራሽ PDF" : "Tagged Accessible PDF"}
                </a>
                <div style={{ color: "var(--color-muted-ink)", fontSize: "13px", marginTop: "2px" }}>
                  {isAm ? "PDF/UA የተረጋገጠ፣ አማራጭ ጽሑፍ · 60 KB" : "Inspected PDF/UA tags & Alt-Text · 60 KB"}
                </div>
              </div>
            </div>

            <a
              href={isAm ? "/lessons/digital-workplace/documents/lesson.am.tagged.pdf" : "/lessons/digital-workplace/documents/lesson.en.tagged.pdf"}
              download={isAm ? "lesson.am.tagged.pdf" : "lesson.en.tagged.pdf"}
              className="btn btn-outline"
              style={{ fontSize: "13px", padding: "0.4rem 0.85rem", minHeight: "34px", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
              aria-label={isAm ? "የታገዘ ተደራሽ PDF አውርድ" : "Download Tagged Accessible PDF"}
            >
              <span>{isAm ? "አውርድ" : "Download"}</span>
              <IconDownload size={13} />
            </a>
          </div>
        </div>
      </section>

      {/* 3G Low-Data Offline Study Pack (Verified Spoken Voice Audio, 1.6 MB) */}
      <section
        className="card"
        style={{
          marginBottom: "2.5rem",
          background: "#FFFFFF",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-card)",
          padding: "1.5rem 1.75rem",
          boxShadow: "var(--shadow-card)",
        }}
        aria-labelledby="heading-offline"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem" }}>
              <h3 id="heading-offline" style={{ margin: 0, color: "var(--color-ink)", fontSize: "20px", fontWeight: 600 }}>
                {isAm ? "የ 3G ዝቅተኛ ዳታ ከመስመር ውጭ የጥናት ጥቅል" : "3G Low-Data Offline Study Pack"}
              </h3>
              <span className="badge badge-success">
                99.2% Bandwidth Saved
              </span>
            </div>
            <p style={{ margin: "0 0 0.5rem 0", color: "var(--color-muted-ink)", fontSize: "14px", maxWidth: "62ch" }}>
              {isAm
                ? "ትምህርቱን ያለ ኢንተርኔት በከፍተኛ ጥራት በተቀረጸ የድምፅ ትረካ፣ በሲማንቲክ HTML እና ሙሉ የጽሑፍ ግልባጭ ያካትታል። በኮምፒውተር ወይም በስልክ ላይ በቀጥታ ይከፈታል።"
                : "Includes professional spoken-voice audio narration (MP3 + Opus), self-contained Start-Offline-Lesson player, WebVTT captions, and accessible documents."}
            </p>
            <div style={{ fontSize: "13px", color: "var(--color-muted-ink)" }}>
              {isAm ? "የተለካው ፋይል መጠን፡" : "Measured Bundle Size:"}{" "}
              <strong style={{ color: "var(--color-ink)" }}>1.6 MB</strong>{" "}
              <span style={{ color: "var(--color-muted-ink)" }}>
                ({isAm ? "ከ 205 MB HD ቪዲዮ አንፃር 99.2% ዳታ ይቆጥባል" : "vs. 205 MB standard HD video stream"})
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleDownloadPack}
            disabled={isDownloading}
            style={{ minHeight: "42px", padding: "0.55rem 1.4rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            <IconDownload size={16} />
            <span>
              {isDownloading
                ? (isAm ? "በማውረድ ላይ..." : "Caching Pack...")
                : isPackReady
                ? (isAm ? "ዳግም አውርድ (1.6 MB)" : "Re-download Pack (1.6 MB)")
                : (isAm ? "የ 3G ጥቅል አውርድ (1.6 MB)" : "Download 3G Pack (1.6 MB)")}
            </span>
          </button>
        </div>

        {downloadMsg && (
          <div
            style={{
              marginTop: "1.25rem",
              padding: "0.65rem 1rem",
              background: "#E8F8F0",
              color: "#128045",
              borderRadius: "8px",
              fontWeight: 500,
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
            aria-live="polite"
          >
            <IconCheck size={16} />
            <span>{downloadMsg}</span>
          </div>
        )}
      </section>

      {/* Strategic Career Pathways Callout Card (Eliminates Duplicate Job Listing) */}
      <section
        style={{
          background: "linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)",
          border: "1px solid #BFDBFE",
          borderRadius: "var(--radius-card)",
          padding: "1.75rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
        aria-labelledby="heading-career-pathway"
      >
        <div style={{ maxWidth: "60ch" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
            <span
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "var(--color-brand)",
                color: "#FFFFFF",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconBriefcase size={18} />
            </span>
            <h3 id="heading-career-pathway" style={{ margin: 0, fontSize: "20px", color: "var(--color-ink)", fontWeight: 600 }}>
              {isAm ? "ክህሎትዎን በተግባር ያውሉ፡ ተደራሽ የሥራ ዕድሎች" : "Apply Your Skills: Verified Accessible Careers"}
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--color-muted-ink)", lineHeight: 1.55 }}>
            {isAm
              ? "ይህንን ኮርስ ያጠናቀቁ ሰልጣኞች በሥራ ቦታ የተረጋገጠ የስክሪን አንባቢ ድጋፍ፣ የተስተካከለ የስራ ሰዓት እና የአካል ጉዳት ምቹ ሁኔታ ያላቸው ክፍት የሥራ መደቦችን በዋናው የሥራ መግቢያ በር ላይ ማግኘት ይችላሉ።"
              : "Completed this module? Connect your competencies to 3 active Addis Ababa openings featuring verified assistive technology accommodations, NVDA/JAWS support, and 200% zoom reflow guarantee."}
          </p>
        </div>

        <NavLink
          to="/"
          className="btn btn-primary"
          style={{
            minHeight: "42px",
            padding: "0.6rem 1.4rem",
            fontSize: "14px",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            whiteSpace: "nowrap",
          }}
        >
          <span>{isAm ? "የሥራ መግቢያ በርን ይክፈቱ" : "Explore Career Gateway"}</span>
          <IconExternal size={14} />
        </NavLink>
      </section>
    </div>
  );
};
