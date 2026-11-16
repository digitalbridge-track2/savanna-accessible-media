import React from "react";
import { SupportedLocale } from "@abugida/media-kit";
import { useReadAloud } from "../read-aloud/ReadAloudProvider";

interface VoiceGuideTopButtonProps {
  locale: SupportedLocale;
}

export const VoiceGuideTopButton: React.FC<VoiceGuideTopButtonProps> = ({ locale }) => {
  const { supported, settings, toggleEnabled, stop, status } = useReadAloud();

  if (!supported) return null;

  const isEnabled = settings.enabled;
  const isSpeaking = status === "speaking";

  const labels: Record<
    SupportedLocale,
    { start: string; active: string; mute: string; ariaLabel: string; shortcut: string }
  > = {
    en: {
      start: "Start Voice Guide",
      active: "Voice Guide Active",
      mute: "Mute",
      ariaLabel: isEnabled
        ? "Voice Guide is currently active. Click to mute and disable."
        : "Voice Guide is currently off. Click to start voice guide.",
      shortcut: "Alt+Shift+R",
    },
    am: {
      start: "የድምፅ መመሪያ ጀምር",
      active: "የድምፅ መመሪያ በርቷል",
      mute: "ድምፅ አጥፋ",
      ariaLabel: isEnabled
        ? "የድምፅ መመሪያ በርቷል። ለማጥፋት ይጫኑ።"
        : "የድምፅ መመሪያ ጠፍቷል። ለማስጀመር ይጫኑ።",
      shortcut: "Alt+Shift+R",
    },
    om: {
      start: "Qajeelcha Sagalee Jalqabi",
      active: "Qajeelchi Sagalee Hojjechaa Jira",
      mute: "Sagalee Cufi",
      ariaLabel: isEnabled
        ? "Qajeelchi sagalee banaadha. Cufuuf cuqaasaa."
        : "Qajeelchi sagalee cufaadha. Jalqabuuf cuqaasaa.",
      shortcut: "Alt+Shift+R",
    },
    ti: {
      start: "ናይ ድምጺ መምርሒ ጀምር",
      active: "ናይ ድምጺ መምርሒ በርሀ",
      mute: "ድምጺ ኣጥፍእ",
      ariaLabel: isEnabled
        ? "ናይ ድምጺ መምርሒ በርሀ። ንምጥፋእ ጠውቑ።"
        : "ናይ ድምጺ መምርሒ ጠፍአ። ንምጅማር ጠውቑ።",
      shortcut: "Alt+Shift+R",
    },
    so: {
      start: "Bilow Hagaha Codka",
      active: "Hagaha Codku Wuu Shidan Yahay",
      mute: "Aamus",
      ariaLabel: isEnabled
        ? "Hagaha codku wuu shidan yahay. Riix si aad u damiso."
        : "Hagaha codku wuu dansan yahay. Riix si aad u bilowdo.",
      shortcut: "Alt+Shift+R",
    },
  };

  const l = labels[locale] || labels.en;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSpeaking) {
      stop();
    }
    toggleEnabled();
  };

  const handleMuteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    stop();
    if (isEnabled) {
      toggleEnabled();
    }
  };

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
      }}
      data-read-aloud-ignore=""
    >
      <button
        type="button"
        id="top-voice-guide-btn"
        onClick={handleClick}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.45rem",
          padding: "0.32rem 0.85rem",
          borderRadius: "var(--radius-pill)",
          fontSize: "12.5px",
          fontWeight: 600,
          minHeight: "34px",
          cursor: "pointer",
          border: isEnabled ? "1.5px solid var(--color-brand)" : "1px solid var(--color-border)",
          background: isEnabled ? "var(--color-brand)" : "var(--color-surface)",
          color: isEnabled ? "#ffffff" : "var(--color-ink)",
          boxShadow: isEnabled ? "0 2px 6px rgba(11, 93, 78, 0.25)" : "none",
          transition: "background 0.15s ease, color 0.15s ease, border-color 0.15s ease",
        }}
        aria-pressed={isEnabled}
        aria-label={l.ariaLabel}
        title={`${l.ariaLabel} (${l.shortcut})`}
      >
        <span aria-hidden="true" style={{ fontSize: "14px" }}>
          {isEnabled ? (isSpeaking ? "🔊" : "🎙️") : "🔇"}
        </span>
        <span>{isEnabled ? l.active : l.start}</span>
        <span
          style={{
            fontSize: "10.5px",
            opacity: 0.85,
            padding: "1px 5px",
            borderRadius: "4px",
            background: isEnabled ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.06)",
            fontFamily: "monospace",
            marginLeft: "2px",
          }}
          aria-hidden="true"
        >
          {l.shortcut}
        </span>
      </button>

      {/* Immediate Quick Mute / Stop Action */}
      {isEnabled && (
        <button
          type="button"
          onClick={handleMuteClick}
          style={{
            background: "#FFF1F2",
            border: "1px solid #FECDD3",
            color: "#BE123C",
            borderRadius: "var(--radius-pill)",
            fontSize: "11.5px",
            fontWeight: 600,
            padding: "0.25rem 0.6rem",
            minHeight: "34px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
          aria-label={l.mute}
          title={l.mute}
        >
          <span aria-hidden="true">⏹</span>
          <span>{l.mute}</span>
        </button>
      )}
    </div>
  );
};
