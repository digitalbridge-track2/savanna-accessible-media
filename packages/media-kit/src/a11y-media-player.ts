import { LessonManifest } from "@abugida/lesson-schema";
import {
  PlayerPreferences,
  loadPreferences,
  savePreferences,
  resetPreferences,
  CaptionSize,
  CaptionTheme,
  ESLPosition,
  ESLSize,
} from "./preferences/storage.js";
import { parseVTT, VTTCueItem, getThemeStyles } from "./captions/caption-manager.js";
import { MediaSyncController, SignStatus } from "./media/sync-controller.js";
import { TranscriptViewer, TranscriptSegmentData } from "./transcript/transcript-viewer.js";

export class A11yMediaPlayer extends HTMLElement {
  static get observedAttributes() {
    return ["manifest-src", "locale"];
  }

  private shadow: ShadowRoot;
  private manifest: LessonManifest | null = null;
  private activeLocale: "en" | "am" = "en";
  private prefs: PlayerPreferences;

  // Media & sync
  private mainVideo!: HTMLVideoElement;
  private signVideo: HTMLVideoElement | null = null;
  private syncController!: MediaSyncController;
  private pendingSeekTime: number | null = null;

  // Captions
  private currentCues: VTTCueItem[] = [];
  private captionOverlay!: HTMLElement;

  // Transcript
  private transcriptViewer!: TranscriptViewer;

  // UI state
  private isPreferencesOpen = false;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.prefs = loadPreferences();
  }

  connectedCallback() {
    this.activeLocale = (this.getAttribute("locale") as "en" | "am") || "en";
    const manifestSrc = this.getAttribute("manifest-src");
    if (manifestSrc) {
      this.loadManifest(manifestSrc);
    }
  }

  disconnectedCallback() {
    if (this.syncController) {
      this.syncController.destroy();
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      if (name === "locale") {
        this.activeLocale = (newValue as "en" | "am") || "en";
        this.updateLocaleStrings();
      } else if (name === "manifest-src") {
        this.loadManifest(newValue);
      }
    }
  }

  private async loadManifest(src: string) {
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const rawManifest: LessonManifest = await res.json();

      // Resolve relative URLs in manifest against the manifest URL
      let baseUrl: URL;
      try {
        baseUrl = new URL(src, window.location.href);
      } catch {
        baseUrl = new URL(window.location.href);
      }

      const resolveUrl = (relOrAbs: string): string => {
        if (!relOrAbs) return relOrAbs;
        try {
          return new URL(relOrAbs, baseUrl).href;
        } catch {
          return relOrAbs;
        }
      };

      this.manifest = {
        ...rawManifest,
        poster: rawManifest.poster
          ? { ...rawManifest.poster, src: resolveUrl(rawManifest.poster.src) }
          : undefined,
        sources: (rawManifest.sources || []).map((s) => ({
          ...s,
          src: resolveUrl(s.src),
        })),
        captionTracks: (rawManifest.captionTracks || []).map((c) => ({
          ...c,
          src: resolveUrl(c.src),
        })),
        transcript: rawManifest.transcript
          ? {
              ...rawManifest.transcript,
              src: resolveUrl(rawManifest.transcript.src),
            }
          : rawManifest.transcript,
      };

      this.render();
      await this.initTracksAndTranscript();
    } catch (err) {
      this.renderError(err instanceof Error ? err.message : "Failed to load manifest");
    }
  }

  private async initTracksAndTranscript() {
    if (!this.manifest) return;

    // Load active caption track
    await this.loadCaptionTrack(this.prefs.captionLanguage);

    // Load transcript
    if (this.manifest.transcript?.src) {
      try {
        const res = await fetch(this.manifest.transcript.src);
        if (res.ok) {
          const data = await res.json();
          const segments: TranscriptSegmentData[] = (data.segments || []).map((seg: any) => ({
            id: seg.id,
            start: seg.start_ms !== undefined ? seg.start_ms / 1000 : seg.start || 0,
            end: seg.end_ms !== undefined ? seg.end_ms / 1000 : seg.end || 0,
            speaker: seg.speaker,
            text: seg.text || seg.draft_text || "",
            visualDescription: seg.visual_description || seg.visualDescription,
          }));
          this.transcriptViewer.setSegments(segments);
        }
      } catch (e) {
        console.warn("Could not load external transcript file, using fallback cues", e);
      }
    }
  }

  private async loadCaptionTrack(lang: string) {
    if (!this.manifest || lang === "off") {
      this.currentCues = [];
      this.updateCaptionDisplay();
      return;
    }

    const trackMeta = this.manifest.captionTracks.find((t) => t.language === lang);
    if (!trackMeta) {
      this.currentCues = [];
      this.updateCaptionDisplay();
      return;
    }

    try {
      const res = await fetch(trackMeta.src);
      if (res.ok) {
        const vttText = await res.text();
        this.currentCues = parseVTT(vttText);
      }
    } catch {
      this.currentCues = [];
    }
    this.updateCaptionDisplay();
  }

  private updateCaptionDisplay() {
    if (!this.captionOverlay || !this.mainVideo) return;
    if (this.prefs.captionLanguage === "off" || this.currentCues.length === 0) {
      this.captionOverlay.style.display = "none";
      return;
    }

    const t = this.mainVideo.currentTime;
    const activeCue = this.currentCues.find((c) => t >= c.start && t <= c.end);

    if (activeCue) {
      this.captionOverlay.style.display = "block";
      this.captionOverlay.style.cssText = getThemeStyles(this.prefs.captionTheme, this.prefs.captionSize);
      this.captionOverlay.textContent = activeCue.text;
    } else {
      this.captionOverlay.style.display = "none";
    }
  }

  private seekAndPlay(time: number) {
    if (isNaN(this.mainVideo.duration) || this.mainVideo.readyState < 1) {
      this.pendingSeekTime = time;
      const onMeta = () => {
        this.mainVideo.removeEventListener("loadedmetadata", onMeta);
        this.mainVideo.currentTime = time;
        this.mainVideo.play().catch(() => {});
        this.pendingSeekTime = null;
      };
      this.mainVideo.addEventListener("loadedmetadata", onMeta);
      return;
    }

    this.mainVideo.currentTime = time;
    this.mainVideo.play().catch((err) => {
      console.warn("Playback interrupted or prevented on seek:", err);
    });
  }

  private renderError(message: string) {
    this.shadow.innerHTML = `
      <style>
        :host { display: block; font-family: system-ui, sans-serif; }
        .error-card {
          padding: 1.5rem;
          background: #ffebee;
          color: #b71c1c;
          border-left: 4px solid #d32f2f;
          border-radius: 4px;
        }
      </style>
      <div class="error-card" role="alert">
        <strong>Error:</strong> ${message}
      </div>
    `;
  }

  private render() {
    const isAm = this.activeLocale === "am";
    const title = this.manifest ? this.manifest.title[this.activeLocale] : "Media Player";

    const mainSource = this.manifest?.sources.find((s) => s.kind === "main");
    const signSource = this.manifest?.sources.find((s) => s.kind === "sign");

    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          max-width: 100%;
          font-family: var(--font-body, system-ui, -apple-system, sans-serif);
          color: var(--color-ink, #14201B);
        }
        .player-root {
          background: #000;
          border-radius: 8px;
          position: relative;
          overflow: hidden;
          outline: none;
        }
        .player-root:focus-visible {
          outline: 3px solid var(--color-focus, #005FCC);
          outline-offset: 3px;
        }
        .video-viewport {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          background: #050505;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        video.main-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        /* Ethiopian Sign Language (EthSL) Window */
        .esl-window {
          position: absolute;
          background: #111;
          border: 2px solid #FFF;
          border-radius: 6px;
          overflow: hidden;
          z-index: 20;
          box-shadow: 0 4px 14px rgba(0,0,0,0.6);
          touch-action: none;
          transition: width 0.2s ease, top 0.2s ease, left 0.2s ease, right 0.2s ease, bottom 0.2s ease;
        }
        .esl-window.pos-top-right { top: 16px; right: 16px; bottom: auto; left: auto; }
        .esl-window.pos-top-left { top: 16px; left: 16px; bottom: auto; right: auto; }
        .esl-window.pos-bottom-right { bottom: 65px; right: 16px; top: auto; left: auto; }
        .esl-window.pos-bottom-left { bottom: 65px; left: 16px; top: auto; right: auto; }

        .esl-window.size-small { width: 22%; }
        .esl-window.size-medium { width: 30%; }
        .esl-window.size-large { width: 38%; }

        .esl-drag-bar {
          background: #1F2937;
          color: #F9FAFB;
          font-size: 0.75rem;
          padding: 3px 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: move;
          user-select: none;
          border-bottom: 1px solid rgba(255,255,255,0.2);
        }
        .esl-drag-bar:focus-visible {
          outline: 2px solid var(--color-focus, #005FCC);
        }

        video.sign-video {
          width: 100%;
          aspect-ratio: 16/9;
          display: block;
          object-fit: cover;
        }

        /* Status Badge for Secondary Sign Stream */
        .sign-status-pill {
          display: none;
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(0,0,0,0.75);
          color: #FFF;
          font-size: 0.75rem;
          padding: 2px 6px;
          border-radius: 4px;
          z-index: 25;
        }

        /* Captions overlay */
        .captions-container {
          position: absolute;
          bottom: 75px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          pointer-events: none;
          z-index: 15;
          padding: 0 1rem;
        }
        .captions-text {
          pointer-events: auto;
        }

        /* Controls Toolbar */
        .controls-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #14201B;
          color: #FFF;
          border-top: 1px solid #2A3B32;
        }
        .btn-ctrl {
          background: #2A3B32;
          color: #FFF;
          border: 1px solid #52615A;
          border-radius: 4px;
          padding: 0.5rem 0.8rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          min-height: 44px;
          min-width: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
        }
        .btn-ctrl:focus-visible {
          outline: 3px solid var(--color-accent, #F2C14E);
          outline-offset: 2px;
        }
        .btn-ctrl:hover {
          background: var(--color-brand, #0B5D4E);
        }
        .btn-ctrl[aria-pressed="true"] {
          background: var(--color-brand, #0B5D4E);
          border-color: var(--color-accent, #F2C14E);
        }
        .time-readout {
          font-size: 0.875rem;
          font-variant-numeric: tabular-nums;
          padding: 0 0.5rem;
          white-space: nowrap;
        }

        /* Progress Bar */
        .scrubber-container {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        input[type="range"].scrubber {
          flex: 1;
          height: 8px;
          accent-color: var(--color-accent, #F2C14E);
          cursor: pointer;
          min-height: 44px;
        }
        input[type="range"].scrubber:focus-visible {
          outline: 3px solid var(--color-accent, #F2C14E);
          outline-offset: 2px;
        }

        /* Preferences Modal Dialog */
        .dialog-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 1rem;
        }
        .dialog-panel {
          background: #FFF;
          color: #14201B;
          padding: 1.5rem;
          border-radius: 8px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        }
        .dialog-panel h3 {
          margin-top: 0;
          color: var(--color-brand, #0B5D4E);
        }
        .form-row {
          margin-bottom: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .form-row label {
          font-weight: bold;
          font-size: 0.9rem;
        }
        select {
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid #B7C2BB;
          font-size: 1rem;
          min-height: 44px;
        }

        /* Transcript area */
        .transcript-container {
          margin-top: 1.5rem;
          background: #FFF;
          border: 1px solid var(--color-border, #B7C2BB);
          border-radius: 8px;
          padding: 1.25rem;
        }
        .transcript-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .search-box {
          padding: 0.5rem 0.75rem;
          border: 1px solid #B7C2BB;
          border-radius: 4px;
          font-size: 0.9rem;
          min-width: 240px;
          min-height: 44px;
        }
        .transcript-controls-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 0.75rem;
        }
        .btn-follow {
          background: #F1F5F9;
          border: 1px solid var(--color-border, #B7C2BB);
          border-radius: 4px;
          padding: 0.4rem 0.9rem;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--color-ink, #14201B);
          cursor: pointer;
          min-height: 38px;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .btn-follow:hover {
          background: #E2E8F0;
        }
        .btn-follow[aria-pressed="true"] {
          background: #DCFCE7;
          border-color: #86EFAC;
          color: #166534;
        }
        .btn-follow:focus-visible {
          outline: 3px solid var(--color-focus, #005FCC);
          outline-offset: 2px;
        }
        .transcript-list {
          list-style: none;
          margin: 0;
          padding: 0;
          max-height: 380px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .transcript-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.5rem;
          border-radius: 4px;
          border-left: 3px solid transparent;
        }
        .transcript-item.active {
          background: #E8F5E9;
          border-left-color: var(--color-brand, #0B5D4E);
        }
        .btn-seek-time {
          background: #F7F8F5;
          border: 1px solid #B7C2BB;
          color: var(--color-brand, #0B5D4E);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.85rem;
          cursor: pointer;
          min-height: 44px;
          min-width: 50px;
        }
        .btn-seek-time:focus-visible {
          outline: 3px solid var(--color-focus, #005FCC);
        }
        .visual-desc {
          font-size: 0.875rem;
          color: #2E7D32;
          background: #E8F5E9;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          margin-top: 0.25rem;
        }

        /* 200% Zoom & Narrow Screen Reflow */
        @media (max-width: 640px) {
          .esl-window {
            position: static !important;
            width: 100% !important;
            max-width: 320px;
            margin: 1rem auto 0 auto;
            border: 2px solid var(--color-border);
            box-shadow: none;
          }
          .esl-drag-bar {
            display: none !important;
          }
        }
      </style>

      <section class="player-component" aria-label="${title}">
        <div class="player-root" id="player-container" tabindex="0" aria-label="${title} (Press ? for keyboard shortcuts)">
          <div class="video-viewport">
            <video 
              id="main-video" 
              class="main-video" 
              playsinline 
              preload="metadata"
              poster="${this.manifest?.poster?.src || ""}"
              src="${mainSource ? mainSource.src : ""}">
            </video>

            <!-- Movable & Resizable EthSL Window -->
            <div 
              class="esl-window pos-${this.prefs.eslPosition} size-${this.prefs.eslSize}" 
              id="esl-window" 
              style="display: ${this.prefs.eslVisible && signSource ? "block" : "none"};"
              aria-label="${isAm ? "የኢትዮጵያ የምልክት ቋንቋ መስኮት" : "Ethiopian Sign Language Window"}">
              <div class="esl-drag-bar" id="esl-drag-handle" tabindex="0" role="button" aria-label="${isAm ? "የምልክት ቋንቋ መስኮት መጎተቻ" : "Sign language window drag handle"}">
                <span>EthSL</span>
                <span aria-hidden="true">✥</span>
              </div>
              <video 
                id="sign-video" 
                class="sign-video" 
                muted 
                playsinline 
                preload="metadata"
                src="${signSource ? signSource.src : ""}">
              </video>
              <div class="sign-status-pill" id="sign-status-indicator" role="status"></div>
            </div>

            <!-- Custom Captions Overlay -->
            <div class="captions-container" aria-hidden="true">
              <div class="captions-text" id="caption-overlay" style="display: none;"></div>
            </div>
          </div>

          <!-- Controls Toolbar -->
          <div class="controls-toolbar" role="toolbar" aria-label="${isAm ? "የቪዲዮ መቆጣጠሪያዎች" : "Video player controls"}">
            <div class="scrubber-container">
              <label for="seek-scrubber" class="sr-only">${isAm ? "የቪዲዮ መገኛ አሞሌ" : "Seek video position"}</label>
              <input 
                type="range" 
                id="seek-scrubber" 
                class="scrubber" 
                min="0" 
                max="100" 
                value="0" 
                aria-label="${isAm ? "የቪዲዮ መገኛ አሞሌ" : "Video timeline position"}">
              <span class="time-readout" id="time-display">00:00 / 00:00</span>
            </div>

            <button class="btn-ctrl" id="btn-play" aria-label="${isAm ? "አጫውት (Space / K)" : "Play (Space / K)"}">
              <span id="play-icon" aria-hidden="true">▶</span>
              <span id="play-text">${isAm ? "አጫውት" : "Play"}</span>
            </button>

            <button class="btn-ctrl" id="btn-rewind" aria-label="${isAm ? "ወደኋላ 5 ሰከንድ (J)" : "Rewind 5 seconds (J)"}">
              ↺ 5s
            </button>

            <button class="btn-ctrl" id="btn-forward" aria-label="${isAm ? "ወደፊት 5 ሰከንድ (L)" : "Forward 5 seconds (L)"}">
              ↻ 5s
            </button>

            <button class="btn-ctrl" id="btn-ad" aria-pressed="${this.prefs.audioDescriptionEnabled ? "true" : "false"}" aria-label="${isAm ? "የድምጽ ማብራሪያ (D)" : "Audio Description (D)"}">
              AD
            </button>

            <button class="btn-ctrl" id="btn-cc" aria-expanded="false" aria-label="${isAm ? "የትርጉም ጽሑፍ (C)" : "Captions (C)"}">
              CC (${this.prefs.captionLanguage.toUpperCase()})
            </button>

            <button class="btn-ctrl" id="btn-esl" aria-pressed="${this.prefs.eslVisible ? "true" : "false"}" aria-label="${isAm ? "የኢትዮጵያ የምልክት ቋንቋ (S)" : "Ethiopian Sign Language (S)"}">
              EthSL
            </button>

            <button class="btn-ctrl" id="btn-prefs" aria-expanded="false" aria-label="${isAm ? "የተደራሽነት ምርጫዎች" : "Accessibility Preferences"}">
              ⚙ ${isAm ? "ምርጫዎች" : "Settings"}
            </button>
          </div>

          <!-- Preferences Modal -->
          <div class="dialog-backdrop" id="prefs-dialog" style="display: none;" role="dialog" aria-modal="true" aria-labelledby="prefs-title">
            <div class="dialog-panel">
              <h3 id="prefs-title">${isAm ? "የተደራሽነት ምርጫዎች" : "Accessibility & Caption Settings"}</h3>
              
              <div class="form-row">
                <label for="select-cc-lang">${isAm ? "የትርጉም ጽሑፍ ቋንቋ:" : "Caption Language:"}</label>
                <select id="select-cc-lang">
                  <option value="en" ${this.prefs.captionLanguage === "en" ? "selected" : ""}>English (Reviewed)</option>
                  <option value="am" ${this.prefs.captionLanguage === "am" ? "selected" : ""}>አማርኛ (የተገመገመ)</option>
                  <option value="off" ${this.prefs.captionLanguage === "off" ? "selected" : ""}>Off</option>
                </select>
              </div>

              <div class="form-row">
                <label for="select-cc-size">${isAm ? "የትርጉም ጽሑፍ መጠን:" : "Caption Font Size:"}</label>
                <select id="select-cc-size">
                  <option value="small" ${this.prefs.captionSize === "small" ? "selected" : ""}>Small (14px)</option>
                  <option value="medium" ${this.prefs.captionSize === "medium" ? "selected" : ""}>Medium (18px - Standard)</option>
                  <option value="large" ${this.prefs.captionSize === "large" ? "selected" : ""}>Large (24px)</option>
                  <option value="xlarge" ${this.prefs.captionSize === "xlarge" ? "selected" : ""}>Extra Large (32px)</option>
                </select>
              </div>

              <div class="form-row">
                <label for="select-cc-theme">${isAm ? "የንፅፅር ገጽታ:" : "Contrast Theme:"}</label>
                <select id="select-cc-theme">
                  <option value="default" ${this.prefs.captionTheme === "default" ? "selected" : ""}>White on Translucent Black</option>
                  <option value="yellow-black" ${this.prefs.captionTheme === "yellow-black" ? "selected" : ""}>High Contrast (Yellow on Black)</option>
                  <option value="white-black" ${this.prefs.captionTheme === "white-black" ? "selected" : ""}>High Contrast (White on Black)</option>
                  <option value="black-yellow" ${this.prefs.captionTheme === "black-yellow" ? "selected" : ""}>High Contrast (Black on Yellow)</option>
                </select>
              </div>

              <div class="form-row">
                <label for="select-esl-pos">${isAm ? "የምልክት ቋንቋ አቀማመጥ:" : "Sign Language Position:"}</label>
                <select id="select-esl-pos">
                  <option value="bottom-right" ${this.prefs.eslPosition === "bottom-right" ? "selected" : ""}>Bottom Right</option>
                  <option value="bottom-left" ${this.prefs.eslPosition === "bottom-left" ? "selected" : ""}>Bottom Left</option>
                  <option value="top-right" ${this.prefs.eslPosition === "top-right" ? "selected" : ""}>Top Right</option>
                  <option value="top-left" ${this.prefs.eslPosition === "top-left" ? "selected" : ""}>Top Left</option>
                </select>
              </div>

              <div class="form-row">
                <label for="select-esl-size">${isAm ? "የምልክት ቋንቋ መጠን:" : "Sign Language Size:"}</label>
                <select id="select-esl-size">
                  <option value="small" ${this.prefs.eslSize === "small" ? "selected" : ""}>Small (22%)</option>
                  <option value="medium" ${this.prefs.eslSize === "medium" ? "selected" : ""}>Medium (30%)</option>
                  <option value="large" ${this.prefs.eslSize === "large" ? "selected" : ""}>Large (38%)</option>
                </select>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
                <button type="button" class="btn-ctrl" id="btn-reset-layout" style="background: #475569;">
                  ↺ ${isAm ? "አቀማመጥን ዳግም አስጀምር" : "Reset Layout"}
                </button>
                <button type="button" class="btn-ctrl" id="btn-close-prefs" style="background: var(--color-brand, #0B5D4E);">
                  ${isAm ? "ተግብር እና ዝጋ" : "Save & Close"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Synchronized Transcript Section -->
        <section class="transcript-container" aria-label="${isAm ? "የተመሳሰለ የጽሑፍ ግልባጭ" : "Synchronized Interactive Transcript"}">
          <div class="transcript-header">
            <h3 style="margin: 0; color: var(--color-brand, #0B5D4E);">
              ${isAm ? "የትምህርቱ የጽሑፍ ግልባጭ" : "Lesson Transcript"}
            </h3>
            <input 
              type="search" 
              id="transcript-search" 
              class="search-box" 
              placeholder="${isAm ? "በጽሑፉ ውስጥ ይፈልጉ..." : "Search transcript..."}" 
              aria-label="${isAm ? "በጽሑፉ ውስጥ ይፈልጉ" : "Search transcript"}">
          </div>
          <div id="transcript-target"></div>
        </section>
      </section>
    `;

    this.bindDOMElements();
    this.attachEventListeners();
    this.setupESLDrag();
  }

  private bindDOMElements() {
    this.mainVideo = this.shadow.getElementById("main-video") as HTMLVideoElement;
    this.signVideo = this.shadow.getElementById("sign-video") as HTMLVideoElement;
    this.captionOverlay = this.shadow.getElementById("caption-overlay") as HTMLElement;

    this.syncController = new MediaSyncController(this.mainVideo, {
      driftThreshold: 0.25,
      onSignStatusChange: (status: SignStatus) => {
        const badge = this.shadow.getElementById("sign-status-indicator");
        if (badge) {
          if (status === "loading") {
            badge.style.display = "inline-block";
            badge.textContent = this.activeLocale === "am" ? "በመጫን ላይ..." : "Loading...";
          } else if (status === "error") {
            badge.style.display = "inline-block";
            badge.textContent = this.activeLocale === "am" ? "ምልክት ቋንቋ አልተገኘም" : "Sign Unavailable";
            badge.style.background = "#FEF2F2";
            badge.style.color = "#991B1B";
          } else {
            badge.style.display = "none";
          }
        }
      },
    });

    if (this.signVideo) {
      this.syncController.setSignVideo(this.signVideo);
    }

    const transcriptTarget = this.shadow.getElementById("transcript-target") as HTMLElement;
    this.transcriptViewer = new TranscriptViewer(transcriptTarget, {
      locale: this.activeLocale,
      onSeekAndPlay: (time) => {
        this.seekAndPlay(time);
      },
    });
  }

  private setupESLDrag() {
    const eslWindow = this.shadow.getElementById("esl-window") as HTMLElement;
    const dragHandle = this.shadow.getElementById("esl-drag-handle") as HTMLElement;
    const viewport = this.shadow.querySelector(".video-viewport") as HTMLElement;
    if (!eslWindow || !dragHandle || !viewport) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    dragHandle.addEventListener("pointerdown", (e) => {
      isDragging = true;
      dragHandle.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startY = e.clientY;

      const rect = eslWindow.getBoundingClientRect();
      const vpRect = viewport.getBoundingClientRect();
      initialLeft = rect.left - vpRect.left;
      initialTop = rect.top - vpRect.top;

      eslWindow.style.left = `${initialLeft}px`;
      eslWindow.style.top = `${initialTop}px`;
      eslWindow.style.right = "auto";
      eslWindow.style.bottom = "auto";
      e.preventDefault();
    });

    dragHandle.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const vpRect = viewport.getBoundingClientRect();
      const winRect = eslWindow.getBoundingClientRect();

      // Strict boundary clamping within video viewport
      const maxLeft = Math.max(0, vpRect.width - winRect.width);
      const maxTop = Math.max(0, vpRect.height - winRect.height);

      const newLeft = Math.min(Math.max(0, initialLeft + dx), maxLeft);
      const newTop = Math.min(Math.max(0, initialTop + dy), maxTop);

      eslWindow.style.left = `${newLeft}px`;
      eslWindow.style.top = `${newTop}px`;
    });

    const endDrag = (e: PointerEvent) => {
      if (isDragging) {
        isDragging = false;
        try {
          dragHandle.releasePointerCapture(e.pointerId);
        } catch {}
      }
    };

    dragHandle.addEventListener("pointerup", endDrag);
    dragHandle.addEventListener("pointercancel", endDrag);
  }

  private attachEventListeners() {
    const playBtn = this.shadow.getElementById("btn-play");
    const playIcon = this.shadow.getElementById("play-icon");
    const playText = this.shadow.getElementById("play-text");
    const scrubber = this.shadow.getElementById("seek-scrubber") as HTMLInputElement;
    const timeDisplay = this.shadow.getElementById("time-display");

    // Play / Pause toggle
    const togglePlay = () => {
      if (this.mainVideo.paused) {
        this.mainVideo.play();
      } else {
        this.mainVideo.pause();
      }
    };
    if (playBtn) playBtn.addEventListener("click", togglePlay);

    this.mainVideo.addEventListener("play", () => {
      if (playIcon && playText) {
        playIcon.textContent = "⏸";
        playText.textContent = this.activeLocale === "am" ? "አቁም" : "Pause";
      }
      playBtn?.setAttribute("aria-label", this.activeLocale === "am" ? "አቁም (Space)" : "Pause (Space)");
    });

    this.mainVideo.addEventListener("pause", () => {
      if (playIcon && playText) {
        playIcon.textContent = "▶";
        playText.textContent = this.activeLocale === "am" ? "አጫውት" : "Play";
      }
      playBtn?.setAttribute("aria-label", this.activeLocale === "am" ? "አጫውት (Space)" : "Play (Space)");
    });

    // Time update & Scrubber
    this.mainVideo.addEventListener("timeupdate", () => {
      const current = this.mainVideo.currentTime;
      const duration = this.mainVideo.duration || 1;
      if (scrubber && !scrubber.matches(":active")) {
        scrubber.value = ((current / duration) * 100).toFixed(1);
      }
      if (timeDisplay) {
        timeDisplay.textContent = `${this.formatTime(current)} / ${this.formatTime(duration)}`;
      }
      this.updateCaptionDisplay();
      this.transcriptViewer.updateActiveTime(current);
    });

    scrubber.addEventListener("input", () => {
      const duration = this.mainVideo.duration || 1;
      this.mainVideo.currentTime = (parseFloat(scrubber.value) / 100) * duration;
    });

    // Seek buttons
    this.shadow.getElementById("btn-rewind")?.addEventListener("click", () => {
      this.mainVideo.currentTime = Math.max(0, this.mainVideo.currentTime - 5);
    });
    this.shadow.getElementById("btn-forward")?.addEventListener("click", () => {
      this.mainVideo.currentTime = Math.min(this.mainVideo.duration || 1000, this.mainVideo.currentTime + 5);
    });

    // Audio Description Switch
    const btnAD = this.shadow.getElementById("btn-ad");
    btnAD?.addEventListener("click", async () => {
      if (!this.manifest) return;
      this.prefs.audioDescriptionEnabled = !this.prefs.audioDescriptionEnabled;
      savePreferences({ audioDescriptionEnabled: this.prefs.audioDescriptionEnabled });
      btnAD.setAttribute("aria-pressed", this.prefs.audioDescriptionEnabled ? "true" : "false");

      const targetKind = this.prefs.audioDescriptionEnabled ? "described" : "main";
      const source = this.manifest.sources.find((s) => s.kind === targetKind) || this.manifest.sources.find((s) => s.kind === "main");
      if (source) {
        await this.syncController.switchSource(source.src);
      }
    });

    // Captions Cycle
    const btnCC = this.shadow.getElementById("btn-cc");
    btnCC?.addEventListener("click", async () => {
      const order = ["en", "am", "off"];
      const nextIdx = (order.indexOf(this.prefs.captionLanguage) + 1) % order.length;
      this.prefs.captionLanguage = order[nextIdx];
      savePreferences({ captionLanguage: this.prefs.captionLanguage });
      btnCC.textContent = `CC (${this.prefs.captionLanguage.toUpperCase()})`;
      await this.loadCaptionTrack(this.prefs.captionLanguage);
    });

    // Sign Language Toggle
    const btnESL = this.shadow.getElementById("btn-esl");
    const eslWindow = this.shadow.getElementById("esl-window");
    btnESL?.addEventListener("click", () => {
      this.prefs.eslVisible = !this.prefs.eslVisible;
      savePreferences({ eslVisible: this.prefs.eslVisible });
      btnESL.setAttribute("aria-pressed", this.prefs.eslVisible ? "true" : "false");
      if (eslWindow) {
        eslWindow.style.display = this.prefs.eslVisible ? "block" : "none";
      }
    });

    // Preferences Dialog Open/Close
    const btnPrefs = this.shadow.getElementById("btn-prefs");
    const prefsDialog = this.shadow.getElementById("prefs-dialog");
    const btnClosePrefs = this.shadow.getElementById("btn-close-prefs");
    const btnResetLayout = this.shadow.getElementById("btn-reset-layout");

    btnPrefs?.addEventListener("click", () => {
      this.isPreferencesOpen = true;
      if (prefsDialog) prefsDialog.style.display = "flex";
      this.shadow.getElementById("select-cc-lang")?.focus();
    });

    btnClosePrefs?.addEventListener("click", () => {
      this.isPreferencesOpen = false;
      if (prefsDialog) prefsDialog.style.display = "none";
      btnPrefs?.focus();
    });

    // Reset Layout Button
    btnResetLayout?.addEventListener("click", () => {
      resetPreferences();
      this.prefs = loadPreferences();
      if (eslWindow) {
        eslWindow.style.left = "";
        eslWindow.style.top = "";
        eslWindow.style.right = "";
        eslWindow.style.bottom = "";
        eslWindow.className = `esl-window pos-${this.prefs.eslPosition} size-${this.prefs.eslSize}`;
      }
      const selectPos = this.shadow.getElementById("select-esl-pos") as HTMLSelectElement;
      const selectSize = this.shadow.getElementById("select-esl-size") as HTMLSelectElement;
      if (selectPos) selectPos.value = this.prefs.eslPosition;
      if (selectSize) selectSize.value = this.prefs.eslSize;
    });

    // Preference Form Inputs
    this.shadow.getElementById("select-cc-lang")?.addEventListener("change", async (e) => {
      this.prefs.captionLanguage = (e.target as HTMLSelectElement).value;
      savePreferences({ captionLanguage: this.prefs.captionLanguage });
      if (btnCC) btnCC.textContent = `CC (${this.prefs.captionLanguage.toUpperCase()})`;
      await this.loadCaptionTrack(this.prefs.captionLanguage);
    });

    this.shadow.getElementById("select-cc-size")?.addEventListener("change", (e) => {
      this.prefs.captionSize = (e.target as HTMLSelectElement).value as CaptionSize;
      savePreferences({ captionSize: this.prefs.captionSize });
      this.updateCaptionDisplay();
    });

    this.shadow.getElementById("select-cc-theme")?.addEventListener("change", (e) => {
      this.prefs.captionTheme = (e.target as HTMLSelectElement).value as CaptionTheme;
      savePreferences({ captionTheme: this.prefs.captionTheme });
      this.updateCaptionDisplay();
    });

    this.shadow.getElementById("select-esl-pos")?.addEventListener("change", (e) => {
      this.prefs.eslPosition = (e.target as HTMLSelectElement).value as ESLPosition;
      savePreferences({ eslPosition: this.prefs.eslPosition });
      if (eslWindow) {
        eslWindow.style.left = "";
        eslWindow.style.top = "";
        eslWindow.style.right = "";
        eslWindow.style.bottom = "";
        eslWindow.className = `esl-window pos-${this.prefs.eslPosition} size-${this.prefs.eslSize}`;
      }
    });

    this.shadow.getElementById("select-esl-size")?.addEventListener("change", (e) => {
      this.prefs.eslSize = (e.target as HTMLSelectElement).value as ESLSize;
      savePreferences({ eslSize: this.prefs.eslSize });
      if (eslWindow) {
        eslWindow.className = `esl-window pos-${this.prefs.eslPosition} size-${this.prefs.eslSize}`;
      }
    });

    // Transcript Search
    const searchInput = this.shadow.getElementById("transcript-search") as HTMLInputElement;
    searchInput?.addEventListener("input", () => {
      this.transcriptViewer.setSearchQuery(searchInput.value);
    });

    // Scoped Keyboard Hotkeys
    const playerRoot = this.shadow.getElementById("player-container");
    playerRoot?.addEventListener("keydown", (e) => {
      if (this.isPreferencesOpen) {
        if (e.key === "Escape") {
          this.isPreferencesOpen = false;
          if (prefsDialog) prefsDialog.style.display = "none";
          btnPrefs?.focus();
        }
        return;
      }

      // Ignore if focus is in a form input
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "SELECT") {
        return;
      }

      switch (e.key) {
        case " ":
        case "k":
        case "K":
          e.preventDefault();
          togglePlay();
          break;
        case "j":
        case "J":
        case "ArrowLeft":
          e.preventDefault();
          this.mainVideo.currentTime = Math.max(0, this.mainVideo.currentTime - 5);
          break;
        case "l":
        case "L":
        case "ArrowRight":
          e.preventDefault();
          this.mainVideo.currentTime = Math.min(this.mainVideo.duration || 1000, this.mainVideo.currentTime + 5);
          break;
        case "m":
        case "M":
          e.preventDefault();
          this.mainVideo.muted = !this.mainVideo.muted;
          break;
        case "c":
        case "C":
          e.preventDefault();
          btnCC?.click();
          break;
        case "s":
        case "S":
          e.preventDefault();
          btnESL?.click();
          break;
        case "d":
        case "D":
          e.preventDefault();
          btnAD?.click();
          break;
        case "+":
        case "=":
          e.preventDefault();
          this.cycleESLSize(1);
          break;
        case "-":
        case "_":
          e.preventDefault();
          this.cycleESLSize(-1);
          break;
      }
    });
  }

  private cycleESLSize(direction: number) {
    const sizes: ESLSize[] = ["small", "medium", "large"];
    let idx = sizes.indexOf(this.prefs.eslSize) + direction;
    if (idx < 0) idx = 0;
    if (idx >= sizes.length) idx = sizes.length - 1;
    this.prefs.eslSize = sizes[idx];
    savePreferences({ eslSize: this.prefs.eslSize });

    const eslWindow = this.shadow.getElementById("esl-window");
    if (eslWindow) {
      eslWindow.className = `esl-window pos-${this.prefs.eslPosition} size-${this.prefs.eslSize}`;
    }
  }

  private updateLocaleStrings() {
    this.render();
    this.initTracksAndTranscript();
  }

  private formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
}

if (!customElements.get("a11y-media-player")) {
  customElements.define("a11y-media-player", A11yMediaPlayer);
}
