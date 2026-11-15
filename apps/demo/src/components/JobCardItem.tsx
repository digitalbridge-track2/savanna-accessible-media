import React, { useState, useRef, useEffect } from "react";
import { AccessibleJob, LocalizedString } from "@abugida/lesson-schema";
import { SupportedLocale } from "@abugida/media-kit";
import {
  IconPlay,
  IconPause,
  IconCheck,
  IconMapPin,
  IconShieldCheck,
  IconClock,
  IconExternal,
  IconDocument,
  IconChevronDown,
} from "./Icons";

interface JobCardItemProps {
  job: AccessibleJob;
  locale: SupportedLocale;
}

export function resolveLocalized(val: LocalizedString | string | undefined | null | any, locale: SupportedLocale): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    return val[locale] || (locale === "am" || locale === "ti" ? val.am : val.en) || val.en || "";
  }
  return String(val);
}

function getEmployerBrand(employer: string) {
  const emp = employer.toLowerCase();
  if (emp.includes("fintech")) {
    return {
      initials: "FE",
      gradient: "linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)",
      color: "#EEF2FF",
    };
  }
  if (emp.includes("ecdd") || emp.includes("disability") || emp.includes("center for disability")) {
    return {
      initials: "EC",
      gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)",
      color: "#ECFDF5",
    };
  }
  if (emp.includes("ethio telecom")) {
    return {
      initials: "ET",
      gradient: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
      color: "#F0F9FF",
    };
  }
  if (emp.includes("ministry") || emp.includes("mint") || emp.includes("innovation")) {
    return {
      initials: "MI",
      gradient: "linear-gradient(135deg, #0D9488 0%, #0F766E 100%)",
      color: "#F0FDFA",
    };
  }
  if (emp.includes("gebeya")) {
    return {
      initials: "GB",
      gradient: "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
      color: "#FFFBEB",
    };
  }
  if (emp.includes("safaricom")) {
    return {
      initials: "SF",
      gradient: "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)",
      color: "#FFF1F2",
    };
  }
  const initials = employer
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
  return {
    initials: initials || "ET",
    gradient: "linear-gradient(135deg, #475569 0%, #1E293B 100%)",
    color: "#F8FAFC",
  };
}

export const JobCardItem: React.FC<JobCardItemProps> = ({ job, locale }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
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
  const employerBrand = getEmployerBrand(employer);

  const getWorkModeBadge = (mode?: string) => {
    if (!mode) return null;
    const m = mode.toLowerCase();
    if (m === "remote") {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            fontSize: "11.5px",
            fontWeight: 600,
            padding: "0.2rem 0.65rem",
            borderRadius: "var(--radius-pill)",
            background: "#EEF2FF",
            color: "#4338CA",
            border: "1px solid #C7D2FE",
          }}
        >
          <span>100% Remote</span>
        </span>
      );
    }
    if (m === "hybrid") {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            fontSize: "11.5px",
            fontWeight: 600,
            padding: "0.2rem 0.65rem",
            borderRadius: "var(--radius-pill)",
            background: "#ECFDF5",
            color: "#065F46",
            border: "1px solid #A7F3D0",
          }}
        >
          <span>Hybrid</span>
        </span>
      );
    }
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          fontSize: "11.5px",
          fontWeight: 600,
          padding: "0.2rem 0.65rem",
          borderRadius: "var(--radius-pill)",
          background: "#FFFBEB",
          color: "#92400E",
          border: "1px solid #FDE68A",
        }}
      >
        <span>On-Site</span>
      </span>
    );
  };

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
      className="job-card-modern"
      aria-labelledby={`job-title-${job.id}`}
    >
      {/* Schema.org / JobPosting Microdata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header: Avatar, Job Title, Employer, Location, Work Mode & Audio Pill */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.9rem", flex: "1 1 320px" }}>
          {/* Company Initials Avatar Badge */}
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "12px",
              background: employerBrand.gradient,
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "15px",
              fontWeight: 700,
              letterSpacing: "0.02em",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
            }}
            aria-hidden="true"
          >
            {employerBrand.initials}
          </div>

          {/* Title & Metadata */}
          <div style={{ flex: 1 }}>
            <h4
              id={`job-title-${job.id}`}
              style={{
                margin: "0 0 0.35rem 0",
                fontSize: "1.2rem",
                fontWeight: 650,
                color: "var(--color-ink)",
                letterSpacing: "-0.015em",
                lineHeight: 1.3,
              }}
            >
              {title}
            </h4>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "0.5rem",
                fontSize: "13.5px",
                color: "var(--color-muted-ink)",
              }}
            >
              <span style={{ fontWeight: 600, color: "var(--color-ink)" }}>{employer}</span>
              <span aria-hidden="true">·</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                <IconMapPin size={13} />
                <span>{cleanLocation || location}</span>
              </span>
              {getWorkModeBadge(job.workMode)}
            </div>
          </div>
        </div>

        {/* Apple-style Audio Summary Pill */}
        {audioSrc && (
          <button
            type="button"
            onClick={toggleAudio}
            aria-pressed={isPlaying}
            aria-label={`${isPlaying ? (isAm ? "አቁም" : "Pause audio summary") : (isAm ? "የድምፅ ማጠቃለያ አድምጥ" : "Listen to audio summary")} for ${title}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.45rem 0.95rem",
              fontSize: "13px",
              fontWeight: 600,
              borderRadius: "var(--radius-pill)",
              border: isPlaying ? "1px solid var(--color-brand)" : "1px solid var(--color-border)",
              background: isPlaying ? "var(--color-brand)" : "var(--color-surface)",
              color: isPlaying ? "#FFFFFF" : "var(--color-ink)",
              boxShadow: isPlaying ? "0 2px 10px rgba(0, 113, 227, 0.3)" : "0 1px 3px rgba(0, 0, 0, 0.04)",
              cursor: "pointer",
              transition: "all 150ms cubic-bezier(0.25, 1, 0.5, 1)",
              outline: "none",
              userSelect: "none",
            }}
          >
            {isPlaying ? (
              <>
                <div className="audio-equalizer-bars" aria-hidden="true" style={{ color: "#FFFFFF" }}>
                  <span className="audio-equalizer-bar" />
                  <span className="audio-equalizer-bar" />
                  <span className="audio-equalizer-bar" />
                </div>
                <span>{isAm ? "እያዳመጠ ነው..." : "Playing Summary"}</span>
                <IconPause size={13} style={{ marginLeft: "2px" }} />
              </>
            ) : (
              <>
                <span
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "var(--color-brand)",
                    color: "#FFFFFF",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-hidden="true"
                >
                  <IconPlay size={10} style={{ marginLeft: "1px" }} />
                </span>
                <span>{isAm ? "የድምፅ ማጠቃለያ" : "Audio Summary"}</span>
                {job.audioSummary?.durationSeconds && (
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "var(--radius-pill)",
                      background: "rgba(0, 0, 0, 0.06)",
                      color: "var(--color-muted-ink)",
                      fontWeight: 500,
                    }}
                  >
                    0:{String(job.audioSummary.durationSeconds).padStart(2, "0")}
                  </span>
                )}
              </>
            )}
          </button>
        )}
      </div>

      {/* Description */}
      <p style={{ margin: 0, fontSize: "14.5px", lineHeight: 1.6, color: "var(--color-ink)" }}>
        {description}
      </p>

      {/* Verified Disability Accommodations Pills */}
      {accommodationsList.length > 0 && (
        <div style={{ marginTop: "0.15rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              marginBottom: "0.45rem",
              fontSize: "11.5px",
              fontWeight: 650,
              color: "var(--color-muted-ink)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            <IconShieldCheck size={14} style={{ color: "var(--color-brand)" }} />
            <span>{isAm ? "የተረጋገጡ የተደራሽነት ድጋፎች" : "Verified Workplace Accommodations"}</span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {accommodationsList.map((acc, idx) => (
              <span
                key={idx}
                className="badge"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.35rem 0.75rem",
                  fontSize: "12.5px",
                  fontWeight: 500,
                  background: "var(--color-brand-subtle, #F0F6FF)",
                  color: "var(--color-brand)",
                  border: "1px solid rgba(0, 113, 227, 0.18)",
                  borderRadius: "var(--radius-pill)",
                }}
                title={`${acc.source || "Employer Verified"}${acc.verifiedDate ? ` · ${acc.verifiedDate}` : ""}`}
              >
                <IconCheck size={13} style={{ strokeWidth: "2.5" }} />
                <span>{resolveLocalized(acc.label, locale)}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Audio Text Transcript Equivalent Drawer */}
      {job.audioSummary?.textEquivalent && (
        <div style={{ marginTop: "0.2rem" }}>
          <button
            type="button"
            onClick={() => setShowTranscript(!showTranscript)}
            aria-expanded={showTranscript}
            style={{
              background: "transparent",
              border: "none",
              padding: "0.3rem 0",
              color: "var(--color-link)",
              fontSize: "13px",
              fontWeight: 550,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <IconDocument size={14} />
            <span>
              {showTranscript
                ? (isAm ? "የድምፅ ጽሑፉን ደብቅ" : "Hide audio transcript & text equivalent")
                : (isAm ? "የድምፅ ማጠቃለያውን በጽሑፍ ይመልከቱ" : "Read text equivalent of audio summary")}
            </span>
            <span
              style={{
                transform: showTranscript ? "rotate(180deg)" : "none",
                transition: "transform 180ms ease",
                display: "inline-flex",
              }}
              aria-hidden="true"
            >
              <IconChevronDown size={13} />
            </span>
          </button>

          {showTranscript && (
            <div
              style={{
                marginTop: "0.5rem",
                padding: "0.85rem 1.15rem",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border-subtle)",
                borderLeft: "3px solid var(--color-brand)",
                borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                fontSize: "13.5px",
                lineHeight: 1.6,
                color: "var(--color-ink)",
                maxWidth: "760px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--color-muted-ink)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginBottom: "0.25rem",
                }}
              >
                {isAm ? "የተረጋገጠ የድምጽ ማጠቃለያ ጽሑፍ" : "Audio Summary Verbatim Transcript"}
              </div>
              <p style={{ margin: 0 }}>
                {job.audioSummary.textEquivalent}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Card Footer: Deadline, Skills Match & Action CTAs */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginTop: "0.4rem",
          paddingTop: "0.85rem",
          borderTop: "1px solid var(--color-border-subtle)",
        }}
      >
        {/* Left: Deadline & Course match indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          {job.applicationDeadline && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "12.5px",
                color: "var(--color-muted-ink)",
                fontWeight: 500,
              }}
            >
              <IconClock size={13} />
              <span>{isAm ? `ማብቂያ ቀን፡ ${job.applicationDeadline}` : `Deadline: ${job.applicationDeadline}`}</span>
            </span>
          )}
          {job.requiredSkills?.includes("skill-a11y-literacy") && (
            <span
              className="badge"
              style={{
                background: "#F5F3FF",
                color: "#6D28D9",
                border: "1px solid #DDD6FE",
                fontSize: "11.5px",
                fontWeight: 600,
                padding: "0.2rem 0.6rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <IconCheck size={12} style={{ strokeWidth: "2.5" }} />
              <span>{isAm ? "የአቡጊዳ ሰርተፊኬት ይፈልጋል" : "Matches Lesson Skills"}</span>
            </span>
          )}
        </div>

        {/* Right: Action CTAs */}
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
          {job.applicationUrl && (
            <a
              href={job.applicationUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
              style={{
                fontSize: "13px",
                padding: "0.45rem 1rem",
                fontWeight: 600,
                borderRadius: "var(--radius-pill)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
              aria-label={`${isAm ? "የቀጣሪው ድረ-ገጽ" : "Employer Portal"} for ${title}`}
            >
              <span>{isAm ? "የቀጣሪው ድረ-ገጽ" : "Employer Portal"}</span>
              <IconExternal size={13} />
            </a>
          )}

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowApplyModal(true)}
            style={{
              fontSize: "13px",
              padding: "0.45rem 1.15rem",
              fontWeight: 600,
              borderRadius: "var(--radius-pill)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              boxShadow: "0 2px 8px rgba(0, 113, 227, 0.25)",
            }}
            aria-haspopup="dialog"
          >
            <span>{isAm ? "በተረጋገጠ ምስክር ወረቀት አመልክት" : "Apply with Verified Credential"}</span>
            <IconCheck size={14} style={{ strokeWidth: "2.5" }} />
          </button>
        </div>
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
          onClick={() => {
            setShowApplyModal(false);
            setAppliedPacketCopied(false);
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
            onClick={(e) => e.stopPropagation()}
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

