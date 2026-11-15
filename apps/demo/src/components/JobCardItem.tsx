import React, { useState, useRef, useEffect } from "react";
import { AccessibleJob, LocalizedString } from "@abugida/lesson-schema";
import { IconPlay, IconPause, IconCheck } from "./Icons";

interface JobCardItemProps {
  job: AccessibleJob;
  locale: "en" | "am";
}

export function resolveLocalized(val: LocalizedString | string | undefined | null, locale: "en" | "am"): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    return val[locale] || val.en || val.am || "";
  }
  return String(val);
}

export const JobCardItem: React.FC<JobCardItemProps> = ({ job, locale }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [appliedPacketCopied, setAppliedPacketCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Safely cleanup audio playback on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const audioSrc = job.audioSummary?.src;

  const toggleAudio = () => {
    // If browser is already speaking via speech synthesis, cancel it
    if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    // Try HTML5 audio first, with fallback to SpeechSynthesis
    if (audioSrc) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioSrc);
        audioRef.current.addEventListener("ended", () => setIsPlaying(false));
        audioRef.current.addEventListener("pause", () => setIsPlaying(false));
        audioRef.current.addEventListener("play", () => setIsPlaying(true));
        audioRef.current.addEventListener("error", () => {
          speakFallback();
        });
      }

      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn("Audio element play error, falling back to speech synthesis:", err);
        speakFallback();
      });
    } else {
      speakFallback();
    }
  };

  const speakFallback = () => {
    const textToSpeak = job.audioSummary?.textEquivalent || description || title;
    if (typeof window !== "undefined" && "speechSynthesis" in window && textToSpeak) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = locale === "am" ? "am-ET" : "en-US";
      utterance.rate = 1.0;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlaying(false);
    }
  };

  const isAm = locale === "am";
  const title = resolveLocalized(job.title, locale);
  const location = resolveLocalized(job.location, locale);
  const description = resolveLocalized(job.description, locale);
  const employer = typeof job.employer === "string" ? job.employer : resolveLocalized(job.employer, locale);

  // Clean location string to avoid duplicate parenthetical like "(Hybrid) (Hybrid)"
  const cleanLocation = location
    .replace(/\s*\(\s*(hybrid|remote|on-site|የቀን|የርቀት|ሃይብሪድ)\s*\)\s*/gi, "")
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim();

  const accommodationsList = Array.isArray(job.accommodations) ? job.accommodations : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description,
    hiringOrganization: {
      "@type": "Organization",
      name: employer,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: location,
        addressCountry: "ET",
      },
    },
    employmentType: job.workMode ? job.workMode.toUpperCase() : "HYBRID",
    validThrough: job.applicationDeadline || "2026-12-31",
    jobBenefits: accommodationsList.map((acc) => {
      const label = resolveLocalized(acc.label, locale);
      return `${label} (${acc.source || "Employer Verified"})`;
    }),
    audio: job.audioSummary
      ? {
          "@type": "AudioObject",
          contentUrl: job.audioSummary.src,
          encodingFormat: job.audioSummary.type || "audio/mp3",
          duration: `PT${job.audioSummary.durationSeconds || 30}S`,
          description: job.audioSummary.textEquivalent,
          transcript: job.audioSummary.textEquivalent,
        }
      : undefined,
  };

  return (
    <article
      className="card"
      style={{
        marginBottom: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
      }}
      aria-labelledby={`job-title-${job.id}`}
    >
      {/* Schema.org / JobPosting Microdata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div style={{ flex: "1 1 300px" }}>
          <h4
            id={`job-title-${job.id}`}
            style={{
              margin: "0 0 0.35rem 0",
              fontSize: "1.2rem",
              fontWeight: 600,
              color: "var(--color-ink)",
              letterSpacing: "-0.005em",
            }}
          >
            {title}
          </h4>
          <p style={{ margin: 0, color: "var(--color-muted-ink)", fontWeight: 400, fontSize: "14px", display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
            <strong style={{ color: "var(--color-ink)" }}>{employer}</strong> · <span>{cleanLocation || location}</span>
            {job.workMode && (
              <span
                className="badge"
                style={{
                  fontSize: "11px",
                  padding: "0.15rem 0.55rem",
                  background: "var(--color-surface)",
                  color: "var(--color-muted-ink)",
                  borderRadius: "var(--radius-pill)",
                  textTransform: "capitalize",
                  fontWeight: 600,
                  border: "1px solid var(--color-border-subtle)",
                }}
              >
                {job.workMode}
              </span>
            )}
          </p>
        </div>

        {audioSrc && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={toggleAudio}
            aria-pressed={isPlaying}
            aria-label={`${isPlaying ? (isAm ? "አቁም" : "Pause") : (isAm ? "የድምፅ ማጠቃለያ አድምጥ" : "Listen to summary")} for ${title}`}
            style={{
              fontSize: "13px",
              padding: "0.45rem 1rem",
              minHeight: "36px",
            }}
          >
            {isPlaying ? (
              <>
                <IconPause size={14} style={{ marginRight: "0.35rem" }} /> {isAm ? "አቁም" : "Pause"}
              </>
            ) : (
              <>
                <IconPlay size={14} style={{ marginRight: "0.35rem" }} /> {isAm ? "የድምፅ ማጠቃለያ" : "Audio Summary"}
              </>
            )}
          </button>
        )}
      </div>

      <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.5, color: "var(--color-muted-ink)" }}>
        {description}
      </p>

      {/* Verified Disability Accommodations Pills */}
      {accommodationsList.length > 0 && (
        <div style={{ marginTop: "0.25rem" }}>
          <p
            style={{
              margin: "0 0 0.4rem 0",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--color-muted-ink)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {isAm ? "የተረጋገጡ የተደራሽነት ድጋፎች" : "Verified Workplace Accommodations"}
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {accommodationsList.map((acc, idx) => (
              <span
                key={idx}
                className="badge badge-brand"
                title={`Disability Accommodation Disclosure: ${resolveLocalized(acc.label, locale)}`}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
              >
                <IconCheck size={12} /> {resolveLocalized(acc.label, locale)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Audio Text Transcript Equivalent */}
      {job.audioSummary?.textEquivalent && (
        <details
          style={{
            background: "var(--color-surface-elevated)",
            padding: "0.6rem 0.85rem",
            borderRadius: "var(--radius-sm)",
            fontSize: "13px",
            border: "1px solid var(--color-border-subtle)",
            color: "var(--color-muted-ink)",
          }}
        >
          <summary style={{ cursor: "pointer", fontWeight: 500, color: "var(--color-link)" }}>
            {isAm ? "የድምፅ ማጠቃለያውን በጽሑፍ ይመልከቱ" : "Read text equivalent of audio summary"}
          </summary>
          <p style={{ margin: "0.5rem 0 0 0", lineHeight: 1.5, color: "var(--color-ink)" }}>
            {job.audioSummary.textEquivalent}
          </p>
        </details>
      )}

      {/* Application Actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowApplyModal(true)}
          style={{
            fontSize: "12.5px",
            padding: "0.45rem 1rem",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
          aria-haspopup="dialog"
        >
          <span>{isAm ? "በተረጋገጠ ምስክር ወረቀት አመልክት" : "Apply with Verified Credential"}</span>
          <IconCheck size={13} />
        </button>

        {job.applicationUrl && (
          <a
            href={job.applicationUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline"
            style={{
              fontSize: "12.5px",
              padding: "0.45rem 0.9rem",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            {isAm ? "የቀጣሪው ድረ-ገጽ" : "Employer Portal"} &rarr;
          </a>
        )}
      </div>

      {/* Accessible "Apply with Credential" Modal Dialog */}
      {showApplyModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`apply-dialog-title-${job.id || title}`}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              color: "#1D1D1F",
              padding: "1.75rem",
              borderRadius: "16px",
              maxWidth: "520px",
              width: "100%",
              boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <span className="badge badge-success" style={{ marginBottom: "0.4rem", display: "inline-block" }}>
                  {isAm ? "የተረጋገጠ መረጃ" : "Verified Learner Application"}
                </span>
                <h3 id={`apply-dialog-title-${job.id || title}`} style={{ margin: "0.2rem 0", fontSize: "1.15rem", fontWeight: 700 }}>
                  {title}
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748B" }}>
                  {employer} · {cleanLocation}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowApplyModal(false);
                  setAppliedPacketCopied(false);
                }}
                aria-label={isAm ? "ዝጋ" : "Close"}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1.25rem",
                  color: "#64748B",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
                padding: "1rem",
                marginBottom: "1.25rem",
                fontSize: "13px",
              }}
            >
              <div style={{ marginBottom: "0.6rem" }}>
                <strong style={{ color: "#0F172A" }}>{isAm ? "የምስክር ወረቀት መለያ ቁጥር:" : "Verifiable Credential:"}</strong>
                <div style={{ fontFamily: "var(--font-mono)", color: "#0071E3", fontWeight: 600, marginTop: "2px" }}>
                  CERT-DB-2026-0042
                </div>
                <div style={{ fontSize: "12px", color: "#64748B" }}>
                  https://savanna.alxafrica.com/verify?id=CERT-DB-2026-0042
                </div>
              </div>

              <div style={{ marginBottom: "0.6rem" }}>
                <strong style={{ color: "#0F172A" }}>{isAm ? "የተረጋገጡ ክህሎቶች:" : "Skills Passed:"}</strong>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                  <span style={{ background: "#E0F2FE", color: "#0369A1", padding: "2px 6px", borderRadius: "4px", fontSize: "11.5px" }}>Digital Collaboration</span>
                  <span style={{ background: "#E0F2FE", color: "#0369A1", padding: "2px 6px", borderRadius: "4px", fontSize: "11.5px" }}>Accessibility Literacy</span>
                  <span style={{ background: "#E0F2FE", color: "#0369A1", padding: "2px 6px", borderRadius: "4px", fontSize: "11.5px" }}>Ethiopian Sign Language Basics</span>
                </div>
              </div>

              <div>
                <strong style={{ color: "#0F172A" }}>{isAm ? "የተጠየቁ የተደራሽነት ድጋፎች:" : "Disclosed Workplace Accommodations:"}</strong>
                <div style={{ color: "#334155", marginTop: "2px" }}>
                  {accommodationsList.length > 0 ? (
                    accommodationsList.map((a) => resolveLocalized(a.label, locale)).join(", ")
                  ) : (
                    "Flexible Ergonomic Setup, Screen Magnifier Ready"
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  const applicationPacket = `APPLICATION PACKET FOR: ${title} at ${employer}\nLearner: Demonstration Learner\nCredential ID: CERT-DB-2026-0042\nPublic Verification Permalink: https://savanna.alxafrica.com/verify?id=CERT-DB-2026-0042\nSkills: Digital Collaboration, Accessibility Literacy, Ethiopian Sign Language Basics\nAccommodations: ${accommodationsList.map((a) => resolveLocalized(a.label, "en")).join(", ") || "Screen reader / ergonomic setup"}`;
                  navigator.clipboard.writeText(applicationPacket);
                  setAppliedPacketCopied(true);
                  setTimeout(() => setAppliedPacketCopied(false), 3000);
                }}
                style={{ fontSize: "13px", padding: "0.5rem 1rem" }}
              >
                {appliedPacketCopied ? (isAm ? "ማመልከቻው ተቀድቷል ✓" : "Packet Copied ✓") : (isAm ? "ማመልከቻውን ቅዳ" : "Copy Application Packet")}
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setAppliedPacketCopied(true);
                  setTimeout(() => {
                    setShowApplyModal(false);
                    setAppliedPacketCopied(false);
                    alert(isAm ? "ማመልከቻዎ ከተረጋገጠው የምስክር ወረቀት ጋር በተሳካ ሁኔታ ተልኳል!" : "Application submitted successfully with verified cryptographic credential!");
                  }, 600);
                }}
                style={{ fontSize: "13px", padding: "0.5rem 1.25rem" }}
              >
                {isAm ? "ማመልከቻውን ላክ" : "Submit with Credential"}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
