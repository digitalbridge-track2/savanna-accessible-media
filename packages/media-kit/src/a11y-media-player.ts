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
  DEFAULT_PREFERENCES,
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

    const transWidth = this.prefs.transcriptWidth || DEFAULT_PREFERENCES.transcriptWidth || 350;
    const transHeight = this.prefs.transcriptHeight || DEFAULT_PREFERENCES.transcriptHeight || 480;
    const eslWidth = this.prefs.eslWidth || DEFAULT_PREFERENCES.eslWidth || 340;
    const eslHeight = this.prefs.eslHeight || DEFAULT_PREFERENCES.eslHeight || 250;

    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          max-width: 100%;
          font-family: var(--font-body, system-ui, -apple-system, sans-serif);
          color: var(--color-ink, #14201B);
        }

        /* 3-Panel Flexible Stage (Transcript | Main Video | Sign Language) */
        .player-stage {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: center;
          gap: 1.25rem;
          position: relative;
          width: 100%;
          box-sizing: border-box;
        }

        /* Window Panels */
        .window-panel {
          position: relative;
          background: #FFF;
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-sizing: border-box;
          resize: both;
          transition: box-shadow 0.2s ease;
        }
        .window-panel.floating {
          box-shadow: 0 14px 34px rgba(0,0,0,0.28);
          border-color: #64748B;
        }
        .window-panel.is-resizing {
          user-select: none;
          transition: none !important;
        }
        .window-placeholder {
          border: 2px dashed #94A3B8;
          background: rgba(148, 163, 184, 0.08);
          border-radius: 6px;
          box-sizing: border-box;
          flex-shrink: 0;
          transition: none;
        }

        /* Window Header / Title Bar */
        .window-header {
          background: #2E343A;
          color: #F8F9FA;
          height: 38px;
          min-height: 38px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 0.5rem;
          gap: 0.5rem;
          user-select: none;
          border-bottom: 1px solid rgba(0,0,0,0.3);
          flex-shrink: 0;
        }
        .btn-window-opt {
          background: transparent;
          border: none;
          color: #F8F9FA;
          font-size: 1.1rem;
          cursor: pointer;
          padding: 0;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          line-height: 1;
        }
        .btn-window-opt:hover {
          background: rgba(255,255,255,0.18);
        }
        .btn-window-opt:focus-visible {
          outline: 2px solid var(--color-accent, #F2C14E);
        }
        .window-drag-handle {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: grab;
          height: 100%;
          padding: 0 0.5rem;
          color: #CBD5E1;
          font-size: 1.15rem;
          line-height: 1;
        }
        .window-drag-handle:active {
          cursor: grabbing;
        }
        .header-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .auto-scroll-label {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          font-weight: 500;
          color: #F8F9FA;
          cursor: pointer;
          user-select: none;
          white-space: nowrap;
        }
        .header-select {
          background: #FFF;
          color: #1E293B;
          border: 1px solid #94A3B8;
          border-radius: 4px;
          font-size: 0.78rem;
          padding: 2px 6px;
          height: 26px;
          cursor: pointer;
        }

        /* Bottom-Right Corner Resize Grip (Both Width & Height) */
        .window-resize-handle {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 24px;
          height: 24px;
          cursor: nwse-resize;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748B;
          user-select: none;
          z-index: 20;
          background: rgba(241, 245, 249, 0.9);
          border-top-left-radius: 4px;
          transition: color 0.15s ease, background 0.15s ease;
        }
        .window-resize-handle:hover,
        .window-resize-handle:focus-visible {
          color: #0F172A;
          background: #E2E8F0;
        }
        .window-resize-handle:focus-visible {
          outline: 2px solid var(--color-focus, #005FCC);
          outline-offset: -2px;
        }

        /* Bottom Edge Resize Handle (Height Up / Down) */
        .window-resize-edge-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 24px;
          height: 8px;
          cursor: ns-resize;
          z-index: 15;
          background: transparent;
        }
        .window-resize-edge-bottom:hover {
          background: rgba(14, 165, 233, 0.25);
        }

        /* Right Edge Resize Handle (Width Left / Right) */
        .window-resize-edge-right {
          position: absolute;
          top: 38px;
          right: 0;
          bottom: 24px;
          width: 8px;
          cursor: ew-resize;
          z-index: 15;
          background: transparent;
        }
        .window-resize-edge-right:hover {
          background: rgba(14, 165, 233, 0.25);
        }

        /* Left Edge Resize Handle (for Sign Window) */
        .window-resize-edge-left {
          position: absolute;
          top: 38px;
          left: 0;
          bottom: 24px;
          width: 8px;
          cursor: ew-resize;
          z-index: 15;
          background: transparent;
        }
        .window-resize-edge-left:hover {
          background: rgba(14, 165, 233, 0.25);
        }

        /* Center Main Player Panel */
        .main-player-panel {
          flex: 1 1 440px;
          min-width: 320px;
          max-width: 780px;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 18px rgba(0,0,0,0.2);
          position: relative;
          outline: none;
          box-sizing: border-box;
        }
        .main-player-panel:focus-visible {
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

        /* Custom Captions Overlay */
        .captions-container {
          position: absolute;
          bottom: 20px;
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

        /* LEFT: Resizable Transcript Window */
        .transcript-window {
          flex: 0 0 auto;
          min-width: 220px;
          max-width: 750px;
          min-height: 200px;
          max-height: 900px;
        }
        .transcript-body {
          flex: 1;
          min-height: 0;
          min-width: 0;
          display: flex;
          flex-direction: column;
          padding: 0.85rem 1rem 1rem 1rem;
          overflow: hidden;
          background: #FFF;
        }
        .transcript-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
          flex-shrink: 0;
        }
        .transcript-title {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 700;
          color: #0F172A;
        }
        .search-box {
          padding: 0.45rem 0.75rem;
          border: 1px solid #CBD5E1;
          border-radius: 4px;
          font-size: 0.88rem;
          min-width: 180px;
          min-height: 38px;
          flex: 1;
        }
        .transcript-scroll-area {
          flex: 1;
          min-height: 0;
          min-width: 0;
          overflow-y: auto;
        }

        /* RIGHT: Resizable Sign Language Window (Outside of video frame) */
        .esl-window {
          flex: 0 0 auto;
          min-width: 200px;
          max-width: 700px;
          min-height: 160px;
          max-height: 700px;
          background: #111;
        }
        .esl-video-body {
          flex: 1;
          min-height: 0;
          min-width: 0;
          position: relative;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        video.sign-video {
          width: 100%;
          height: 100%;
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          display: block;
        }
        .sign-status-pill {
          background: rgba(255,255,255,0.2);
          color: #FFF;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.3);
          display: inline-block;
        }

        /* Transcript cues, active highlight & visual descriptions */
        .transcript-controls-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 0.5rem;
        }
        .btn-follow {
          background: #F1F5F9;
          border: 1px solid #CBD5E1;
          border-radius: 4px;
          padding: 0.35rem 0.75rem;
          font-size: 0.82rem;
          font-weight: 600;
          color: #1E293B;
          cursor: pointer;
          min-height: 34px;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
        .btn-follow[aria-pressed="true"] {
          background: #DCFCE7;
          border-color: #86EFAC;
          color: #166534;
        }
        .transcript-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .transcript-item {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          padding: 0.5rem 0.65rem;
          border-radius: 4px;
          border: 1px solid transparent;
        }
        .transcript-item:hover {
          background: #F8FAFC;
        }
        .transcript-item.active {
          background: #F0FDF4;
          border-color: #86EFAC;
        }
        .btn-seek-time {
          background: #F8FAFC;
          border: 1px solid #CBD5E1;
          color: var(--color-brand, #0B5D4E);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.82rem;
          cursor: pointer;
          min-height: 36px;
          min-width: 50px;
        }
        .btn-seek-time:focus-visible {
          outline: 3px solid var(--color-focus, #005FCC);
        }
        .visual-desc {
          background: #FFF0F2;
          border: 1px solid #F5C2CB;
          border-radius: 4px;
          color: #721C24;
          padding: 0.45rem 0.75rem;
          margin: 0.35rem 0;
          font-style: italic;
          font-size: 0.88rem;
          line-height: 1.4;
        }

        /* Preferences Dialog */
        .dialog-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
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

        /* Responsive Reflow on Small Mobile Screens */
        @media (max-width: 680px) {
          .player-stage {
            flex-direction: column;
            align-items: stretch;
          }
          .main-player-panel, .transcript-window, .esl-window {
            max-width: 100%;
          }
          .main-player-panel {
            order: 1;
          }
          .esl-window {
            order: 2;
          }
          .transcript-window {
            order: 3;
          }
        }
      </style>

      <section class="player-component" aria-label="${title}">
        <div class="player-stage" id="player-stage">

          <!-- LEFT: Movable & Resizable Transcript Window (Outside of video frame) -->
          <div 
            class="window-panel transcript-window" 
            id="transcript-window"
            style="width: ${transWidth}px; height: ${transHeight}px; flex: 0 0 ${transWidth}px; display: ${this.prefs.transcriptVisible !== false ? "flex" : "none"};"
            aria-label="${isAm ? "የትምህርቱ የጽሑፍ ግልባጭ መስኮት" : "Lesson Transcript Window"}">
            
            <!-- Transcript Titlebar -->
            <div class="window-header" id="transcript-header">
              <button 
                type="button" 
                class="btn-window-opt" 
                id="btn-transcript-prefs" 
                aria-label="${isAm ? "የመስኮት አማራጮች" : "Window options"}" 
                title="${isAm ? "የመስኮት አማራጮች" : "Window options"}">
                ⚙
              </button>
              <div 
                class="window-drag-handle" 
                id="transcript-drag-handle" 
                tabindex="0" 
                role="button" 
                aria-label="${isAm ? "የጽሑፍ ግልባጭ መስኮት መጎተቻ" : "Transcript window drag handle"}"
                title="${isAm ? "ለመጎተት ይጫኑ፤ ወደቦታው ለመመለስ ሁለት ጊዜ ይጫኑ" : "Drag to move; double-click to re-dock"}">
                <span aria-hidden="true">═</span>
              </div>
              <div class="header-controls">
                <label class="auto-scroll-label" for="cb-auto-scroll">
                  <input type="checkbox" id="cb-auto-scroll" checked>
                  <span>${isAm ? "ራስ-አንብብ" : "Auto scroll"}</span>
                </label>
                <label for="select-transcript-lang" class="sr-only">${isAm ? "ቋንቋ" : "Language"}</label>
                <select id="select-transcript-lang" class="header-select" aria-label="${isAm ? "የጽሑፍ ግልባጭ ቋንቋ" : "Transcript Language"}">
                  <option value="en" ${this.activeLocale === "en" ? "selected" : ""}>English</option>
                  <option value="am" ${this.activeLocale === "am" ? "selected" : ""}>አማርኛ</option>
                </select>
              </div>
            </div>

            <!-- Transcript Body Content -->
            <div class="transcript-body" id="transcript-body">
              <div class="transcript-title-row">
                <h3 class="transcript-title">${isAm ? "የትምህርቱ የጽሑፍ ግልባጭ" : "Transcript"}</h3>
                <input 
                  type="search" 
                  id="transcript-search" 
                  class="search-box" 
                  placeholder="${isAm ? "በጽሑፉ ውስጥ ይፈልጉ..." : "Search transcript..."}" 
                  aria-label="${isAm ? "በጽሑፉ ውስጥ ይፈልጉ" : "Search transcript"}">
              </div>
              <div id="transcript-target" class="transcript-scroll-area"></div>
            </div>

            <!-- Resizing Handles (Corner 2D, Bottom Edge, Right Edge) -->
            <div 
              class="window-resize-handle" 
              id="transcript-resize-handle" 
              tabindex="0"
              role="separator" 
              aria-label="${isAm ? "የጽሑፍ ግልባጭ መስኮት ማስተካከያ (በቀስት ቁልፎች መጠን ይቀይሩ)" : "Resize transcript window (Use arrow keys or drag)"}" 
              title="${isAm ? "መጠኑን ለመቀየር ይጎትቱ ወይም የቀስት ቁልፎችን ይጠቀሙ" : "Drag to resize (or use Arrow keys)"}">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <path d="M13 1L1 13M13 6L6 13M13 11L11 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="window-resize-edge-bottom" id="transcript-resize-edge-bottom" aria-hidden="true" title="${isAm ? "ቁመቱን ለመቀየር ይጎትቱ" : "Drag to resize height"}"></div>
            <div class="window-resize-edge-right" id="transcript-resize-edge-right" aria-hidden="true" title="${isAm ? "ስፋቱን ለመቀየር ይጎትቱ" : "Drag to resize width"}"></div>
          </div>

          <!-- CENTER: Main Video Player & Controls -->
          <div class="main-player-panel" id="player-container" tabindex="0" aria-label="${title} (Press ? for keyboard shortcuts)">
            <div class="video-viewport">
              <video 
                id="main-video" 
                class="main-video" 
                playsinline 
                preload="metadata"
                poster="${this.manifest?.poster?.src || ""}"
                src="${mainSource ? mainSource.src : ""}">
              </video>

              <!-- Captions Overlay -->
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

              <button class="btn-ctrl" id="btn-transcript-toggle" aria-pressed="${this.prefs.transcriptVisible !== false ? "true" : "false"}" aria-label="${isAm ? "የጽሑፍ ግልባጭ ማሳያ" : "Toggle Transcript"}">
                📄 ${isAm ? "ግልባጭ" : "Transcript"}
              </button>

              <button class="btn-ctrl" id="btn-prefs" aria-expanded="false" aria-label="${isAm ? "የተደራሽነት ምርጫዎች" : "Accessibility Preferences"}">
                ⚙ ${isAm ? "ምርጫዎች" : "Settings"}
              </button>
            </div>
          </div>

          <!-- RIGHT: Movable & Resizable Sign Language Window (Outside of video frame) -->
          <div 
            class="window-panel esl-window" 
            id="esl-window" 
            style="width: ${eslWidth}px; height: ${eslHeight}px; flex: 0 0 ${eslWidth}px; display: ${this.prefs.eslVisible && signSource ? "flex" : "none"};"
            aria-label="${isAm ? "የኢትዮጵያ የምልክት ቋንቋ መስኮት" : "Ethiopian Sign Language Window"}">
            
            <!-- Sign Titlebar -->
            <div class="window-header" id="esl-header">
              <button 
                type="button" 
                class="btn-window-opt" 
                id="btn-esl-prefs" 
                aria-label="${isAm ? "የመስኮት አማራጮች" : "Window options"}" 
                title="${isAm ? "የመስኮት አማራጮች" : "Window options"}">
                ⚙
              </button>
              <div 
                class="window-drag-handle" 
                id="esl-drag-handle" 
                tabindex="0" 
                role="button" 
                aria-label="${isAm ? "የምልክት ቋንቋ መስኮት መጎተቻ" : "Sign language window drag handle"}"
                title="${isAm ? "ለመጎተት ይጫኑ፤ ወደቦታው ለመመለስ ሁለት ጊዜ ይጫኑ" : "Drag to move; double-click to re-dock"}">
                <span aria-hidden="true">═</span>
              </div>
              <div class="header-controls">
                <span class="sign-status-pill" id="sign-status-indicator" role="status">EthSL</span>
              </div>
            </div>

            <!-- Sign Video Body Content -->
            <div class="esl-video-body">
              <video 
                id="sign-video" 
                class="sign-video" 
                muted 
                playsinline 
                preload="metadata"
                src="${signSource ? signSource.src : ""}">
              </video>
            </div>

            <!-- Resizing Handles (Corner 2D, Bottom Edge, Right Edge, Left Edge) -->
            <div 
              class="window-resize-handle" 
              id="esl-resize-handle" 
              tabindex="0"
              role="separator" 
              aria-label="${isAm ? "የምልክት ቋንቋ መስኮት ማስተካከያ (በቀስት ቁልፎች መጠን ይቀይሩ)" : "Resize sign language window (Use arrow keys or drag)"}" 
              title="${isAm ? "መጠኑን ለመቀየር ይጎትቱ ወይም የቀስት ቁልፎችን ይጠቀሙ" : "Drag to resize (or use Arrow keys)"}">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <path d="M13 1L1 13M13 6L6 13M13 11L11 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="window-resize-edge-bottom" id="esl-resize-edge-bottom" aria-hidden="true" title="${isAm ? "ቁመቱን ለመቀየር ይጎትቱ" : "Drag to resize height"}"></div>
            <div class="window-resize-edge-right" id="esl-resize-edge-right" aria-hidden="true" title="${isAm ? "ስፋቱን ለመቀየር ይጎትቱ" : "Drag to resize width"}"></div>
            <div class="window-resize-edge-left" id="esl-resize-edge-left" aria-hidden="true" title="${isAm ? "ስፋቱን ለመቀየር ይጎትቱ" : "Drag to resize width"}"></div>
          </div>

        </div>

        <!-- Preferences Modal Dialog -->
        <div class="dialog-backdrop" id="prefs-dialog" style="display: none;" role="dialog" aria-modal="true" aria-labelledby="prefs-title">
          <div class="dialog-panel">
            <h3 id="prefs-title">${isAm ? "የተደራሽነት ምርጫዎች" : "Accessibility & Layout Settings"}</h3>
            
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
      </section>
    `;

    this.bindDOMElements();
    this.attachEventListeners();
    this.setupWindowInteractions();
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
            badge.style.display = "inline-block";
            badge.textContent = "EthSL";
            badge.style.background = "rgba(255,255,255,0.2)";
            badge.style.color = "#FFF";
          }
        }
      },
    });

    if (this.signVideo) {
      this.syncController.setSignVideo(this.signVideo);
    }

    const transcriptTarget = this.shadow.getElementById("transcript-target") as HTMLElement;
    const autoScrollCb = this.shadow.getElementById("cb-auto-scroll") as HTMLInputElement;

    this.transcriptViewer = new TranscriptViewer(transcriptTarget, {
      locale: this.activeLocale,
      onSeekAndPlay: (time) => {
        this.seekAndPlay(time);
      },
      onFollowChange: (isFollowing) => {
        if (autoScrollCb) {
          autoScrollCb.checked = isFollowing;
        }
      },
    });
  }

  private setupWindowInteractions() {
    const stage = this.shadow.getElementById("player-stage") as HTMLElement;
    if (!stage) return;

    // Helper for making a window panel smoothly draggable and resizable in 2D
    const initWindow = (
      winId: string,
      dragHandleId: string,
      resizeHandleId: string,
      edgeBottomId: string,
      edgeRightId: string,
      edgeLeftId: string | null,
      opts: {
        minWidth: number;
        maxWidth: number;
        minHeight: number;
        maxHeight: number;
        onSaveSize: (w: number, h: number) => void;
      }
    ) => {
      const winEl = this.shadow.getElementById(winId) as HTMLElement;
      const dragHandle = this.shadow.getElementById(dragHandleId) as HTMLElement;
      const resizeHandle = this.shadow.getElementById(resizeHandleId) as HTMLElement;
      const edgeBottom = this.shadow.getElementById(edgeBottomId) as HTMLElement | null;
      const edgeRight = this.shadow.getElementById(edgeRightId) as HTMLElement | null;
      const edgeLeft = edgeLeftId ? (this.shadow.getElementById(edgeLeftId) as HTMLElement | null) : null;
      if (!winEl || !dragHandle || !resizeHandle) return;

      let placeholderEl: HTMLElement | null = null;

      // --- Bidirectional 2D Resizing Controller (Up/Down & Left/Right) ---
      let isResizing = false;
      let resizeMode: "corner" | "bottom" | "right" | "left" = "corner";
      let startX = 0;
      let startY = 0;
      let startW = 0;
      let startH = 0;
      let resizeRaf: number | null = null;

      const onResizePointerMove = (e: PointerEvent) => {
        if (!isResizing) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (resizeRaf !== null) cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(() => {
          let newW = startW;
          let newH = startH;

          if (resizeMode === "corner" || resizeMode === "right") {
            newW = Math.min(opts.maxWidth, Math.max(opts.minWidth, startW + dx));
          } else if (resizeMode === "left") {
            newW = Math.min(opts.maxWidth, Math.max(opts.minWidth, startW - dx));
          }

          if (resizeMode === "corner" || resizeMode === "bottom") {
            newH = Math.min(opts.maxHeight, Math.max(opts.minHeight, startH + dy));
          }

          winEl.style.width = `${newW}px`;
          winEl.style.height = `${newH}px`;
          winEl.style.flex = `0 0 ${newW}px`;

          if (placeholderEl) {
            placeholderEl.style.width = `${newW}px`;
            placeholderEl.style.height = `${newH}px`;
            placeholderEl.style.flex = `0 0 ${newW}px`;
          }
        });
      };

      const onResizePointerUp = () => {
        if (isResizing) {
          isResizing = false;
          winEl.classList.remove("is-resizing");
          window.removeEventListener("pointermove", onResizePointerMove);
          window.removeEventListener("pointerup", onResizePointerUp);
          window.removeEventListener("pointercancel", onResizePointerUp);
          if (resizeRaf !== null) {
            cancelAnimationFrame(resizeRaf);
            resizeRaf = null;
          }
          opts.onSaveSize(winEl.offsetWidth, winEl.offsetHeight);
        }
      };

      const startResize = (mode: "corner" | "bottom" | "right" | "left", e: PointerEvent) => {
        isResizing = true;
        resizeMode = mode;
        startX = e.clientX;
        startY = e.clientY;
        startW = winEl.offsetWidth;
        startH = winEl.offsetHeight;
        winEl.classList.add("is-resizing");
        window.addEventListener("pointermove", onResizePointerMove);
        window.addEventListener("pointerup", onResizePointerUp);
        window.addEventListener("pointercancel", onResizePointerUp);
        e.preventDefault();
        e.stopPropagation();
      };

      resizeHandle.addEventListener("pointerdown", (e) => startResize("corner", e));
      edgeBottom?.addEventListener("pointerdown", (e) => startResize("bottom", e));
      edgeRight?.addEventListener("pointerdown", (e) => startResize("right", e));
      edgeLeft?.addEventListener("pointerdown", (e) => startResize("left", e));

      // Keyboard accessible resizing on the corner grip (Arrow keys)
      resizeHandle.addEventListener("keydown", (e: KeyboardEvent) => {
        let curW = winEl.offsetWidth;
        let curH = winEl.offsetHeight;
        let changed = false;

        if (e.key === "ArrowRight") {
          curW = Math.min(opts.maxWidth, curW + 20);
          changed = true;
        } else if (e.key === "ArrowLeft") {
          curW = Math.max(opts.minWidth, curW - 20);
          changed = true;
        } else if (e.key === "ArrowDown") {
          curH = Math.min(opts.maxHeight, curH + 20);
          changed = true;
        } else if (e.key === "ArrowUp") {
          curH = Math.max(opts.minHeight, curH - 20);
          changed = true;
        }

        if (changed) {
          e.preventDefault();
          winEl.style.width = `${curW}px`;
          winEl.style.height = `${curH}px`;
          winEl.style.flex = `0 0 ${curW}px`;
          if (placeholderEl) {
            placeholderEl.style.width = `${curW}px`;
            placeholderEl.style.height = `${curH}px`;
            placeholderEl.style.flex = `0 0 ${curW}px`;
          }
          opts.onSaveSize(curW, curH);
        }
      });

      // --- Stable Dragging & Floating Controller (With Ghost Placeholder) ---
      let isDragging = false;
      let dragStartX = 0;
      let dragStartY = 0;
      let initialLeft = 0;
      let initialTop = 0;
      let dragRaf: number | null = null;

      const onDragPointerMove = (e: PointerEvent) => {
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;

        if (!isDragging && Math.hypot(dx, dy) > 5) {
          isDragging = true;
          // Create in-flow placeholder so other panels never collapse or jump
          if (!placeholderEl && winEl.parentNode) {
            placeholderEl = document.createElement("div");
            placeholderEl.className = "window-placeholder";
            placeholderEl.style.width = `${winEl.offsetWidth}px`;
            placeholderEl.style.height = `${winEl.offsetHeight}px`;
            placeholderEl.style.flex = winEl.style.flex || `0 0 ${winEl.offsetWidth}px`;
            winEl.parentNode.insertBefore(placeholderEl, winEl);
          }
          winEl.classList.add("floating");
          winEl.style.position = "absolute";
          winEl.style.zIndex = "60";
        }

        if (isDragging) {
          if (dragRaf !== null) cancelAnimationFrame(dragRaf);
          dragRaf = requestAnimationFrame(() => {
            const stageRect = stage.getBoundingClientRect();
            const winRect = winEl.getBoundingClientRect();
            const maxLeft = Math.max(0, stageRect.width - winRect.width);
            const maxTop = Math.max(0, stageRect.height - 40);

            const newLeft = Math.min(maxLeft, Math.max(0, initialLeft + dx));
            const newTop = Math.min(maxTop, Math.max(0, initialTop + dy));

            winEl.style.left = `${newLeft}px`;
            winEl.style.top = `${newTop}px`;
            winEl.style.right = "auto";
            winEl.style.bottom = "auto";
          });
        }
      };

      const onDragPointerUp = () => {
        if (isDragging) {
          isDragging = false;
        }
        window.removeEventListener("pointermove", onDragPointerMove);
        window.removeEventListener("pointerup", onDragPointerUp);
        window.removeEventListener("pointercancel", onDragPointerUp);
        if (dragRaf !== null) {
          cancelAnimationFrame(dragRaf);
          dragRaf = null;
        }
      };

      dragHandle.addEventListener("pointerdown", (e) => {
        if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "SELECT") {
          return;
        }
        dragStartX = e.clientX;
        dragStartY = e.clientY;

        const stageRect = stage.getBoundingClientRect();
        const winRect = winEl.getBoundingClientRect();
        initialLeft = winRect.left - stageRect.left;
        initialTop = winRect.top - stageRect.top;
        isDragging = false;

        window.addEventListener("pointermove", onDragPointerMove);
        window.addEventListener("pointerup", onDragPointerUp);
        window.addEventListener("pointercancel", onDragPointerUp);
      });

      // Double-click on drag handle re-docks window cleanly to original stage slot
      const reDock = () => {
        winEl.classList.remove("floating");
        winEl.style.position = "";
        winEl.style.left = "";
        winEl.style.top = "";
        winEl.style.right = "";
        winEl.style.bottom = "";
        winEl.style.zIndex = "";
        if (placeholderEl) {
          placeholderEl.remove();
          placeholderEl = null;
        }
      };
      dragHandle.addEventListener("dblclick", reDock);

      // Store re-dock hook on element for Reset Layout button
      (winEl as any).__reDock = reDock;
    };

    // Initialize Transcript Window (220-750px width, 200-900px height)
    initWindow(
      "transcript-window",
      "transcript-drag-handle",
      "transcript-resize-handle",
      "transcript-resize-edge-bottom",
      "transcript-resize-edge-right",
      null,
      {
        minWidth: 220,
        maxWidth: 750,
        minHeight: 200,
        maxHeight: 900,
        onSaveSize: (w, h) => {
          this.prefs.transcriptWidth = w;
          this.prefs.transcriptHeight = h;
          savePreferences({ transcriptWidth: w, transcriptHeight: h });
        },
      }
    );

    // Initialize Sign Language Window (200-700px width, 160-700px height)
    initWindow(
      "esl-window",
      "esl-drag-handle",
      "esl-resize-handle",
      "esl-resize-edge-bottom",
      "esl-resize-edge-right",
      "esl-resize-edge-left",
      {
        minWidth: 200,
        maxWidth: 700,
        minHeight: 160,
        maxHeight: 700,
        onSaveSize: (w, h) => {
          this.prefs.eslWidth = w;
          this.prefs.eslHeight = h;
          savePreferences({ eslWidth: w, eslHeight: h });
        },
      }
    );
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

    // Rewind / Forward
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
        eslWindow.style.display = this.prefs.eslVisible ? "flex" : "none";
      }
    });

    // Transcript Toggle
    const btnTranscript = this.shadow.getElementById("btn-transcript-toggle");
    const transcriptWindow = this.shadow.getElementById("transcript-window");
    btnTranscript?.addEventListener("click", () => {
      const isVisible = transcriptWindow?.style.display !== "none";
      const nextState = !isVisible;
      this.prefs.transcriptVisible = nextState;
      savePreferences({ transcriptVisible: nextState });
      btnTranscript.setAttribute("aria-pressed", nextState ? "true" : "false");
      if (transcriptWindow) {
        transcriptWindow.style.display = nextState ? "flex" : "none";
      }
    });

    // Auto-scroll Checkbox in Transcript Header
    const cbAutoScroll = this.shadow.getElementById("cb-auto-scroll") as HTMLInputElement;
    cbAutoScroll?.addEventListener("change", () => {
      this.transcriptViewer.setFollowing(cbAutoScroll.checked);
    });

    // Language Select in Transcript Header
    const selectTranscriptLang = this.shadow.getElementById("select-transcript-lang") as HTMLSelectElement;
    selectTranscriptLang?.addEventListener("change", () => {
      const newLocale = selectTranscriptLang.value as "en" | "am";
      this.setAttribute("locale", newLocale);
    });

    // Window Options Buttons (Cog icons on Transcript and Sign headers)
    const openPrefs = () => {
      this.isPreferencesOpen = true;
      if (prefsDialog) prefsDialog.style.display = "flex";
      this.shadow.getElementById("select-cc-lang")?.focus();
    };

    const btnPrefs = this.shadow.getElementById("btn-prefs");
    const btnTranscriptPrefs = this.shadow.getElementById("btn-transcript-prefs");
    const btnEslPrefs = this.shadow.getElementById("btn-esl-prefs");
    const prefsDialog = this.shadow.getElementById("prefs-dialog");
    const btnClosePrefs = this.shadow.getElementById("btn-close-prefs");
    const btnResetLayout = this.shadow.getElementById("btn-reset-layout");

    btnPrefs?.addEventListener("click", openPrefs);
    btnTranscriptPrefs?.addEventListener("click", openPrefs);
    btnEslPrefs?.addEventListener("click", openPrefs);

    btnClosePrefs?.addEventListener("click", () => {
      this.isPreferencesOpen = false;
      if (prefsDialog) prefsDialog.style.display = "none";
      btnPrefs?.focus();
    });

    // Reset Layout Button (Restores side-by-side docked layout & default dimensions)
    btnResetLayout?.addEventListener("click", () => {
      resetPreferences();
      this.prefs = loadPreferences();

      // Reset Transcript Window
      if (transcriptWindow) {
        (transcriptWindow as any).__reDock?.();
        transcriptWindow.classList.remove("floating");
        transcriptWindow.style.position = "";
        transcriptWindow.style.left = "";
        transcriptWindow.style.top = "";
        transcriptWindow.style.right = "";
        transcriptWindow.style.bottom = "";
        transcriptWindow.style.zIndex = "";
        transcriptWindow.style.width = `${DEFAULT_PREFERENCES.transcriptWidth}px`;
        transcriptWindow.style.height = `${DEFAULT_PREFERENCES.transcriptHeight}px`;
        transcriptWindow.style.flex = `0 0 ${DEFAULT_PREFERENCES.transcriptWidth}px`;
        transcriptWindow.style.display = "flex";
      }

      // Reset Sign Language Window
      if (eslWindow) {
        (eslWindow as any).__reDock?.();
        eslWindow.classList.remove("floating");
        eslWindow.style.position = "";
        eslWindow.style.left = "";
        eslWindow.style.top = "";
        eslWindow.style.right = "";
        eslWindow.style.bottom = "";
        eslWindow.style.zIndex = "";
        eslWindow.style.width = `${DEFAULT_PREFERENCES.eslWidth}px`;
        eslWindow.style.height = `${DEFAULT_PREFERENCES.eslHeight}px`;
        eslWindow.style.flex = `0 0 ${DEFAULT_PREFERENCES.eslWidth}px`;
        eslWindow.style.display = "flex";
      }

      if (btnESL) btnESL.setAttribute("aria-pressed", "true");
      if (btnTranscript) btnTranscript.setAttribute("aria-pressed", "true");
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
        case "t":
        case "T":
          e.preventDefault();
          btnTranscript?.click();
          break;
      }
    });
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
