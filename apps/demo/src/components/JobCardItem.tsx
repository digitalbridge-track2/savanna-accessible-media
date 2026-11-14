import React, { useState, useRef, useEffect } from "react";
import { AccessibleJob, LocalizedString } from "@abugida/lesson-schema";

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
    if (!audioSrc) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(audioSrc);
      audioRef.current.addEventListener("ended", () => setIsPlaying(false));
      audioRef.current.addEventListener("pause", () => setIsPlaying(false));
      audioRef.current.addEventListener("play", () => setIsPlaying(true));
      audioRef.current.addEventListener("error", () => setIsPlaying(false));
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.warn("Audio playback prevented:", err);
        setIsPlaying(false);
      });
    }
  };

  const isAm = locale === "am";
  const title = resolveLocalized(job.title, locale);
  const location = resolveLocalized(job.location, locale);
  const description = resolveLocalized(job.description, locale);
  const employer = typeof job.employer === "string" ? job.employer : resolveLocalized(job.employer, locale);

  const accommodationsList = Array.isArray(job.accommodations) ? job.accommodations : [];

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
              fontSize: "1.15rem",
              fontWeight: 700,
              color: "var(--color-brand)",
            }}
          >
            {title}
          </h4>
          <p style={{ margin: 0, color: "var(--color-muted-ink)", fontWeight: 500, fontSize: "0.92rem" }}>
            <strong>{employer}</strong> · <span>{location}</span>{" "}
            {job.workMode && <span style={{ textTransform: "capitalize" }}>({job.workMode})</span>}
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
              fontSize: "0.85rem",
              padding: "0.4rem 0.85rem",
              minHeight: "38px",
              flexShrink: 0,
            }}
          >
            {isPlaying
              ? (isAm ? "ድምፁን አቁም" : "Pause Audio")
              : (isAm ? "የድምፅ ማጠቃለያ" : "Listen to Summary")}
          </button>
        )}
      </div>

      <p style={{ margin: 0, lineHeight: 1.6, color: "var(--color-ink)", fontSize: "0.95rem" }}>
        {description}
      </p>

      {/* Accommodations Disclosure */}
      {accommodationsList.length > 0 && (
        <div
          style={{
            background: "#F8FAFC",
            padding: "0.75rem 1rem",
            borderRadius: "6px",
            border: "1px solid var(--color-border)",
          }}
        >
          <strong
            style={{
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "var(--color-muted-ink)",
              display: "block",
              marginBottom: "0.4rem",
            }}
          >
            {isAm ? "የተረጋገጡ ድጋፎች (Accommodations):" : "Verified Accommodations Provided:"}
          </strong>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {accommodationsList.map((acc, index) => {
              const label = resolveLocalized(acc.label, locale);
              return (
                <span key={acc.id || index} className="badge badge-brand">
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Structured Microdata & Standards Indicator */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
          fontSize: "0.82rem",
          color: "var(--color-muted-ink)",
          paddingTop: "0.5rem",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <span>
          Format: <code>schema.org/JobPosting</code> JSON-LD
        </span>
        {job.applicationUrl && (
          <a
            href={job.applicationUrl}
            target="_blank"
            rel="noreferrer"
            style={{ fontWeight: 600, color: "var(--color-brand)" }}
          >
            {isAm ? "ያመልክቱ (Apply) ↗" : "Apply Now ↗"}
          </a>
        )}
      </div>
    </article>
  );
};
