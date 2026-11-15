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
                  background: "#F1F5F9",
                  color: "#475569",
                  borderRadius: "var(--radius-pill)",
                  textTransform: "capitalize",
                  fontWeight: 600,
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
            background: "#FFFFFF",
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

      {job.applicationUrl && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.25rem" }}>
          <a
            href={job.applicationUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline"
            style={{
              fontSize: "12px",
              padding: "0.35rem 0.85rem",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            {isAm ? "ለሥራው አመልክት (Apply)" : "Apply for Role"} &rarr;
          </a>
        </div>
      )}
    </article>
  );
};
