import React, { useState, useRef, useEffect } from "react";
import { AccessibleJob } from "@abugida/lesson-schema";

interface JobCardItemProps {
  job: AccessibleJob;
  locale: "en" | "am";
}

export const JobCardItem: React.FC<JobCardItemProps> = ({ job, locale }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop audio playback when unmounting (e.g. navigating away)
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) {
      if (!job.audioSummary?.audioSrc) return;
      audioRef.current = new Audio(job.audioSummary.audioSrc);
      audioRef.current.addEventListener("ended", () => setIsPlaying(false));
      audioRef.current.addEventListener("pause", () => setIsPlaying(false));
      audioRef.current.addEventListener("play", () => setIsPlaying(true));
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.warn("Audio play prevented:", err);
        setIsPlaying(false);
      });
    }
  };

  const isAm = locale === "am";
  const title = isAm && job.titleAm ? job.titleAm : job.title;
  const employer = isAm && job.employerAm ? job.employerAm : job.employer;
  const description = isAm && job.descriptionAm ? job.descriptionAm : job.description;

  return (
    <article
      className="card"
      style={{
        marginBottom: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
      aria-labelledby={`job-title-${job.id}`}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h4 id={`job-title-${job.id}`} style={{ margin: "0 0 0.25rem 0", fontSize: "1.2rem", color: "var(--color-brand)" }}>
            {title}
          </h4>
          <p style={{ margin: 0, color: "var(--color-muted-ink)", fontWeight: 500 }}>
            {employer} &bull; <span>{job.location}</span> ({job.jobLocationType})
          </p>
        </div>

        {job.audioSummary?.audioSrc && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={toggleAudio}
            aria-pressed={isPlaying}
            aria-label={`${isPlaying ? (isAm ? "አቁም" : "Pause") : (isAm ? "የድምፅ ማጠቃለያ አድምጥ" : "Listen to audio summary")} for ${title}`}
            style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem", minHeight: "40px" }}
          >
            {isPlaying ? "⏸ " + (isAm ? "አቁም" : "Pause Audio") : "🔊 " + (isAm ? "የድምፅ ማጠቃለያ" : "Audio Summary")}
          </button>
        )}
      </div>

      <p style={{ margin: 0, lineHeight: 1.5, color: "var(--color-ink)" }}>
        {description}
      </p>

      {/* Accommodations Disclosure */}
      {job.accommodations && (
        <div style={{ background: "#F4F7F5", padding: "0.85rem", borderRadius: "6px" }}>
          <strong style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--color-muted-ink)" }}>
            {isAm ? "የተዘጋጁ ድጋፎች (Accommodations):" : "Verified Accommodations Provided:"}
          </strong>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
            {job.accommodations.screenReaderFriendly && (
              <span className="badge badge-brand">
                ✓ {isAm ? "ለስክሪን አንባቢ ምቹ" : "Screen Reader Friendly"}
              </span>
            )}
            {job.accommodations.flexibleHours && (
              <span className="badge badge-brand">
                ✓ {isAm ? "ተለዋዋጭ የሥራ ሰዓት" : "Flexible Hours"}
              </span>
            )}
            {job.accommodations.quietEnvironment && (
              <span className="badge badge-brand">
                ✓ {isAm ? "ጸጥ ያለ የሥራ ቦታ" : "Quiet Environment"}
              </span>
            )}
            {job.accommodations.remoteAvailable && (
              <span className="badge badge-brand">
                ✓ {isAm ? "የርቀት ሥራ ዕድል" : "Remote Available"}
              </span>
            )}
            {job.accommodations.additionalNotes && (
              <span className="badge badge-accent">
                ℹ {job.accommodations.additionalNotes}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Structured data indicator */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "var(--color-muted-ink)", paddingTop: "0.5rem", borderTop: "1px solid var(--color-border)" }}>
        <span>
          🏷️ <code>schema.org/JobPosting</code> JSON-LD
        </span>
        {job.requiredCertificates && job.requiredCertificates.length > 0 && (
          <span>
            🎓 {isAm ? "የሚፈለግ ምስክር ወረቀት:" : "Matching Credential:"} <strong>{job.requiredCertificates[0]}</strong>
          </span>
        )}
      </div>
    </article>
  );
};
