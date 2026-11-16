import React, { useEffect, useRef, useState } from "react";
import type { ReadAloudLocale } from "./messages";
import { useReadAloud } from "./ReadAloudProvider";

interface ReadAloudPanelProps {
  locale: ReadAloudLocale;
  /** Useful for hosts or tests that need the settings visible immediately. */
  initialOpen?: boolean;
}

export const ReadAloudPanel: React.FC<ReadAloudPanelProps> = ({
  locale,
  initialOpen = false,
}) => {
  const {
    supported,
    settings,
    status,
    statusText,
    voices,
    hasAmharicVoice,
    current,
    notice,
    errorMessage,
    ui,
    updateSettings,
    readCurrent,
    repeat,
    pause,
    resume,
    stop,
    refreshVoices,
  } = useReadAloud();

  const [open, setOpen] = useState(initialOpen);
  const launcherRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (open) refreshVoices();
  }, [open, refreshVoices]);

  const closePanel = () => {
    setOpen(false);
    launcherRef.current?.focus();
  };

  const handlePanelKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    closePanel();
  };

  const featureUnavailable = !supported || !settings.enabled;
  const canStop = status === "speaking" || status === "paused";
  const selectedVoiceURI =
    settings.voiceURI && voices.some((voice) => voice.voiceURI === settings.voiceURI)
      ? settings.voiceURI
      : "";

  const statusIcon =
    status === "speaking" ? "🔊" : status === "paused" ? "⏸" : status === "unsupported" ? "⚠" : "⏹";

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        className="ra-launcher"
        aria-expanded={open}
        aria-controls="read-aloud-panel"
        aria-keyshortcuts="Alt+Shift+R"
        title={`${settings.enabled ? ui.launcherStateOn : ui.launcherStateOff} (Alt+Shift+R)`}
        data-read-aloud-ignore=""
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">{settings.enabled ? (status === "speaking" ? "🔊" : "🎙️") : "🔇"}</span>
        <span>
          {ui.launcher}
          {!settings.enabled && (
            <span style={{ opacity: 0.85, fontSize: "0.82em", marginLeft: "4px" }}>
              ({locale === "am" || locale === "ti" ? "ጠፍቷል" : "Off"})
            </span>
          )}
        </span>
        <span className="sr-only">
          {settings.enabled ? ui.launcherStateOn : ui.launcherStateOff}
        </span>
      </button>

      {open && (
        <section
          id="read-aloud-panel"
          className="ra-panel"
          aria-labelledby="read-aloud-panel-title"
          data-read-aloud-ignore=""
          onKeyDown={handlePanelKeyDown}
          lang={locale}
        >
          <div className="ra-panel-header">
            <div>
              <h2 id="read-aloud-panel-title" className="ra-panel-title">
                {ui.panelTitle}
              </h2>
              <p className="ra-panel-description">{ui.panelDescription}</p>
            </div>
            <button
              type="button"
              className="ra-icon-button"
              aria-label={ui.closePanel}
              onClick={closePanel}
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>

          {!supported && (
            <div className="ra-unsupported">
              <strong>{ui.unsupportedTitle}</strong>
              <p>{ui.unsupportedBody}</p>
            </div>
          )}

          <fieldset className="ra-fieldset" disabled={!supported}>
            <legend>{ui.activationLegend}</legend>
            <label className="ra-check">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(event) => updateSettings({ enabled: event.target.checked })}
              />
              <span>{ui.enabled}</span>
            </label>
            <label className="ra-check">
              <input
                type="checkbox"
                checked={settings.hoverEnabled}
                onChange={(event) => updateSettings({ hoverEnabled: event.target.checked })}
              />
              <span>{ui.hoverEnabled}</span>
            </label>
            <label className="ra-check">
              <input
                type="checkbox"
                checked={settings.keyboardEnabled}
                onChange={(event) =>
                  updateSettings({ keyboardEnabled: event.target.checked })
                }
              />
              <span>{ui.keyboardEnabled}</span>
            </label>
            <p className="ra-hint">{ui.screenReaderHint}</p>
          </fieldset>

          <fieldset className="ra-fieldset" disabled={!supported}>
            <legend>{ui.playbackLegend}</legend>
            <div className="ra-button-grid">
              <button
                type="button"
                className="btn btn-primary ra-control"
                onClick={readCurrent}
                disabled={featureUnavailable}
              >
                <span aria-hidden="true">▶</span>
                <span>{ui.playCurrent}</span>
              </button>
              <button
                type="button"
                className="btn btn-outline ra-control"
                onClick={pause}
                disabled={featureUnavailable || status !== "speaking"}
              >
                <span aria-hidden="true">⏸</span>
                <span>{ui.pause}</span>
              </button>
              <button
                type="button"
                className="btn btn-outline ra-control"
                onClick={resume}
                disabled={featureUnavailable || status !== "paused"}
              >
                <span aria-hidden="true">▶</span>
                <span>{ui.resume}</span>
              </button>
              <button
                type="button"
                className="btn btn-outline ra-control ra-stop"
                onClick={stop}
                disabled={featureUnavailable || !canStop}
              >
                <span aria-hidden="true">⏹</span>
                <span>{ui.stop}</span>
              </button>
              <button
                type="button"
                className="btn btn-outline ra-control"
                onClick={repeat}
                disabled={featureUnavailable || !current}
              >
                <span aria-hidden="true">↻</span>
                <span>{ui.repeat}</span>
              </button>
            </div>
          </fieldset>

          <fieldset className="ra-fieldset" disabled={!supported}>
            <legend>{ui.settingsLegend}</legend>

            <div className="ra-field">
              <label htmlFor="ra-rate">
                {ui.speed}
                <span className="ra-range-value">{settings.rate.toFixed(1)}×</span>
              </label>
              <input
                id="ra-rate"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.rate}
                aria-valuetext={ui.times(settings.rate.toFixed(1))}
                onChange={(event) => updateSettings({ rate: Number(event.target.value) })}
              />
            </div>

            <div className="ra-field">
              <label htmlFor="ra-pitch">
                {ui.pitch}
                <span className="ra-range-value">{settings.pitch.toFixed(1)}</span>
              </label>
              <input
                id="ra-pitch"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.pitch}
                aria-valuetext={settings.pitch.toFixed(1)}
                onChange={(event) => updateSettings({ pitch: Number(event.target.value) })}
              />
            </div>

            <div className="ra-field">
              <label htmlFor="ra-volume">
                {ui.volume}
                <span className="ra-range-value">
                  {Math.round(settings.volume * 100)}%
                </span>
              </label>
              <input
                id="ra-volume"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                aria-valuetext={ui.percent(String(Math.round(settings.volume * 100)))}
                onChange={(event) => updateSettings({ volume: Number(event.target.value) })}
              />
            </div>

            <div className="ra-field">
              <label htmlFor="ra-voice">{ui.voice}</label>
              <select
                id="ra-voice"
                value={selectedVoiceURI}
                onChange={(event) =>
                  updateSettings({ voiceURI: event.target.value || null })
                }
                disabled={!supported || voices.length === 0}
              >
                <option value="">{ui.voiceAutomatic}</option>
                {voices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
              {supported && voices.length === 0 && (
                <p className="ra-hint">{ui.noVoices}</p>
              )}
              <p className="ra-hint">{ui.voiceLanguageHint}</p>
            </div>
          </fieldset>

          <div className="ra-status-block">
            <span className="ra-status-label">{ui.statusLegend}:</span>
            <span className="ra-status">
              <span aria-hidden="true">{statusIcon}</span> <strong>{statusText}</strong>
            </span>
          </div>

          {errorMessage && <p className="ra-error">{errorMessage}</p>}
          {notice && <p className="ra-notice">{notice}</p>}
          {voices.length > 0 && !hasAmharicVoice && notice !== ui.amharicMissing && (
            <p className="ra-notice">{ui.amharicMissing}</p>
          )}

          {current && (
            <div className="ra-current">
              <h3 className="ra-current-title">{ui.currentContent}</h3>
              <p lang={current.lang} dir="auto">
                {current.text}
              </p>
            </div>
          )}

          <p className="ra-shortcut">{ui.shortcutHint}</p>
        </section>
      )}
    </>
  );
};
