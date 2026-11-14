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

const ICONS = {
  play: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
  restart: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>`,
  rewind: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>`,
  forward: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>`,
  cc: `<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-4a1 1 0 011-1h3a1 1 0 011 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1a1 1 0 01-1 1h-3a1 1 0 01-1-1v-4a1 1 0 011-1h3a1 1 0 011 1v1z"/></svg>`,
  sign: `<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M21 9h-4.2l-1.3-3.9C15.2 4.4 14.5 4 13.7 4c-.7 0-1.4.3-1.8.9L10 8H6c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h6.8l5.8-2.5c.9-.4 1.4-1.3 1.4-2.3V11c0-1.1-.9-2-2-2zm-9 9H6v-7h4.5l2.1-3.2c.2-.3.6-.4.9-.4.3 0 .6.2.8.5l1.3 3.9v.2H12v6zm7-3.7l-5 2.1V11h6v3.3z"/></svg>`,
  ad: `<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M4 4h5c4.42 0 8 3.58 8 8s-3.58 8-8 8H4V4zm5 13c2.76 0 5-2.24 5-5s-2.24-5-5-5H7v10h2zm10-9.8a7.96 7.96 0 010 9.6l1.5 1.5c3.5-3.5 3.5-9.1 0-12.6l-1.5 1.5zm-2.5 2.5a4.46 4.46 0 010 4.6l1.5 1.5c1.9-2.1 1.9-5.1 0-7.2l-1.5 1.1z"/></svg>`,
  transcript: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`,
  faster: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M21.5 14.5c0-.83-.67-1.5-1.5-1.5h-1.18c.43-.88.68-1.87.68-2.92 0-3.35-2.45-6.08-5.5-6.08-1.3 0-2.5.5-3.41 1.34L8.7 3.45a1.5 1.5 0 00-2.12 2.12l1.6 1.6C7.45 8.1 7 9.25 7 10.5c0 1.05.43 2.01 1.12 2.72L5.4 14.94A2 2 0 004 16.5C4 18.43 5.57 20 7.5 20h11c1.66 0 3-1.34 3-3 0-.91-.41-1.72-1.05-2.27.64-.32 1.05-.98 1.05-1.73zM14 6c1.93 0 3.5 1.79 3.5 4 0 .72-.18 1.4-.49 1.98l-3.92-3.92C13.36 6.8 13.67 6 14 6z"/></svg>`,
  slower: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M19 13c-.55 0-1 .45-1 1 0 1.65-1.35 3-3 3H9c-1.65 0-3-1.35-3-3 0-.55-.45-1-1-1s-1 .45-1 1c0 2.42 1.72 4.44 4 4.9V20c0 .55.45 1 1 1s1-.45 1-1v-1.05c.32.03.66.05 1 .05s.68-.02 1-.05V20c0 .55.45 1 1 1s1-.45 1-1v-1.1c2.28-.46 4-2.48 4-4.9 0-.55-.45-1-1-1zm1.5-4c-.83 0-1.5.67-1.5 1.5 0 .28.08.53.21.75C17.7 10.5 15.98 10 14 10H10c-1.98 0-3.7.5-5.21 1.25.13-.22.21-.47.21-.75 0-.83-.67-1.5-1.5-1.5S2 9.67 2 10.5c0 .76.57 1.38 1.3 1.48C3.1 12.5 3 13 3 13.5c0 .35.03.69.08 1.03C2.45 14.89 2 15.64 2 16.5 2 17.6 2.9 18.5 4 18.5h.2c.4 1.2 1.44 2.1 2.7 2.38V21.5c0 .55.45 1 1 1s1-.45 1-1V21h6v.5c0 .55.45 1 1 1s1-.45 1-1v-.62c1.26-.28 2.3-1.18 2.7-2.38h.2c1.1 0 2-.9 2-2 0-.86-.45-1.61-1.08-1.97.05-.34.08-.68.08-1.03 0-.53-.1-1.04-.3-1.52.73-.1 1.3-.72 1.3-1.48 0-.83-.67-1.5-1.5-1.5zM12 7c3.86 0 7 3.14 7 6H5c0-2.86 3.14-6 7-6z"/></svg>`,
  prefs: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`,
  fullscreenEnter: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`,
  fullscreenExit: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`,
  volumeUnmuted: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
  volumeMuted: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`
};

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

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
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
          display: block;
          visibility: hidden;
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
          outline: none !important;
          box-sizing: border-box;
          flex-shrink: 0;
          pointer-events: none;
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

        /* Center Main Player Panel - Horizontal Rectangular Cinema Proportion */
        .main-player-panel {
          flex: 2 1 680px;
          min-width: 480px;
          max-width: 880px;
          width: 100%;
          background: #111417;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
          position: relative;
          outline: none;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }
        .main-player-panel:focus-visible {
          outline: 3px solid var(--color-focus, #005FCC);
          outline-offset: 3px;
        }
        .main-player-panel:fullscreen,
        .main-player-panel:-webkit-full-screen {
          width: 100vw !important;
          height: 100vh !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
          border-radius: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          background: #000 !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          z-index: 999999 !important;
        }
        .video-viewport {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #050505;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .main-player-panel:fullscreen .video-viewport,
        .main-player-panel:-webkit-full-screen .video-viewport {
          flex: 1 1 auto !important;
          height: auto !important;
          max-height: calc(100vh - 84px) !important;
          width: 100% !important;
        }
        video.main-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          cursor: pointer;
        }

        /* Big Play Button Overlay */
        .big-play-btn {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 76px;
          height: 56px;
          background: rgba(0, 0, 0, 0.78);
          border: 2.5px solid #84CC16;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 12;
          transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.65);
          padding: 0;
          outline: none;
        }
        .big-play-btn:hover {
          transform: translate(-50%, -50%) scale(1.08);
          background: rgba(0, 0, 0, 0.92);
          border-color: #A3E635;
          box-shadow: 0 6px 26px rgba(132, 204, 22, 0.4);
        }
        .big-play-btn:focus-visible {
          outline: 3px solid var(--color-accent, #F2C14E);
          outline-offset: 3px;
        }
        .big-play-btn.is-hidden {
          display: none !important;
        }
        .big-play-svg {
          width: 30px;
          height: 30px;
          margin-left: 3px;
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

        /* Controls Toolbar (Able Player Inspired Modern Clean Layout) */
        .controls-toolbar {
          display: flex;
          flex-direction: column;
          background: #1F2428;
          color: #FFF;
          border-top: 1px solid #30363D;
          user-select: none;
          flex-shrink: 0;
        }
        .main-player-panel:fullscreen .controls-toolbar,
        .main-player-panel:-webkit-full-screen .controls-toolbar {
          flex-shrink: 0 !important;
          width: 100% !important;
        }
        .scrubber-container {
          width: 100%;
          display: flex;
          align-items: center;
          padding: 6px 12px 2px 12px;
          box-sizing: border-box;
        }
        input[type="range"].scrubber {
          flex: 1;
          width: 100%;
          height: 6px;
          accent-color: #FFFFFF;
          cursor: pointer;
          background: #4B5563;
          border-radius: 3px;
          outline: none;
          margin: 0;
          padding: 0;
          min-height: 20px;
          transition: height 0.1s ease;
        }
        input[type="range"].scrubber:hover {
          height: 8px;
        }
        input[type="range"].scrubber:focus-visible {
          outline: 2px solid var(--color-accent, #F2C14E);
          outline-offset: 2px;
        }
        .controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 3px 8px;
          gap: 2px;
          flex-wrap: nowrap;
          overflow-x: auto;
        }
        .controls-cluster {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .btn-ctrl {
          background: transparent;
          color: #F8F9FA;
          border: 1px solid transparent;
          border-radius: 4px;
          padding: 0;
          width: 36px;
          height: 36px;
          min-width: 36px;
          min-height: 36px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 0.12s ease, color 0.12s ease, border-color 0.12s ease;
          flex-shrink: 0;
          position: relative;
        }
        .btn-ctrl:hover {
          background: rgba(255, 255, 255, 0.18);
          color: #FFF;
        }
        .btn-ctrl:focus-visible {
          outline: 2px solid var(--color-accent, #F2C14E);
          outline-offset: 2px;
        }
        .btn-ctrl[aria-pressed="true"] {
          background: rgba(14, 165, 233, 0.25);
          color: #38BDF8;
          border-bottom: 2px solid var(--color-accent, #F2C14E);
        }
        .ctrl-divider {
          display: inline-block;
          width: 1px;
          height: 18px;
          background: rgba(255, 255, 255, 0.22);
          margin: 0 4px;
          flex-shrink: 0;
        }
        .status-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #111417;
          color: #E2E8F0;
          font-size: 0.76rem;
          font-family: monospace, system-ui, sans-serif;
          padding: 3px 12px 5px 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .status-item {
          white-space: nowrap;
        }
        .status-time {
          font-variant-numeric: tabular-nums;
          font-weight: 500;
          color: #F8FAFC;
        }
        .status-speed {
          color: #CBD5E1;
        }
        .status-state {
          font-style: italic;
          color: #94A3B8;
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

              <!-- Big Play Button Overlay -->
              <button 
                type="button" 
                class="big-play-btn" 
                id="big-play-btn" 
                aria-label="${isAm ? "ቪዲዮውን አጫውት (Space / K)" : "Play video (Space / K)"}"
                title="${isAm ? "ቪዲዮውን አጫውት" : "Play video"}">
                <svg viewBox="0 0 48 48" class="big-play-svg" aria-hidden="true">
                  <polygon points="18,12 36,24 18,36" fill="#FFFFFF"/>
                </svg>
              </button>

              <!-- Captions Overlay -->
              <div class="captions-container" aria-hidden="true">
                <div class="captions-text" id="caption-overlay" style="display: none;"></div>
              </div>
            </div>

            <!-- Controls Toolbar (Able Player Inspired Modern Clean Layout) -->
            <div class="controls-toolbar" role="toolbar" aria-label="${isAm ? "የቪዲዮ መቆጣጠሪያዎች" : "Video player controls"}">
              <!-- Scrubber -->
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
              </div>

              <!-- Controls Row -->
              <div class="controls-row">
                <!-- Left: Playback & Navigation -->
                <div class="controls-cluster">
                  <button class="btn-ctrl" id="btn-play" aria-label="${isAm ? "አጫውት (Space / K)" : "Play (Space / K)"}" title="${isAm ? "አጫውት (Space / K)" : "Play (Space / K)"}">
                    <span id="play-icon" aria-hidden="true">${ICONS.play}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-restart" aria-label="${isAm ? "እንደገና ጀምር (0 / Home)" : "Restart (0 / Home)"}" title="${isAm ? "እንደገና ጀምር (0 / Home)" : "Restart (0 / Home)"}">
                    <span aria-hidden="true">${ICONS.restart}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-rewind" aria-label="${isAm ? "ወደኋላ 5 ሰከንድ (J / ←)" : "Rewind 5 seconds (J / ←)"}" title="${isAm ? "ወደኋላ 5 ሰከንድ (J / ←)" : "Rewind 5 seconds (J / ←)"}">
                    <span aria-hidden="true">${ICONS.rewind}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-forward" aria-label="${isAm ? "ወደፊት 5 ሰከንድ (L / →)" : "Forward 5 seconds (L / →)"}" title="${isAm ? "ወደፊት 5 ሰከንድ (L / →)" : "Forward 5 seconds (L / →)"}">
                    <span aria-hidden="true">${ICONS.forward}</span>
                  </button>
                </div>

                <!-- Center: Accessibility & Speed -->
                <div class="controls-cluster">
                  <button class="btn-ctrl" id="btn-cc" aria-pressed="${this.prefs.captionLanguage !== "off" ? "true" : "false"}" aria-label="${isAm ? "የትርጉም ጽሑፍ (C)" : "Captions (C)"}" title="${isAm ? "የትርጉም ጽሑፍ (C)" : "Captions (C)"}">
                    <span aria-hidden="true">${ICONS.cc}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-esl" aria-pressed="${this.prefs.eslVisible ? "true" : "false"}" aria-label="${isAm ? "የኢትዮጵያ የምልክት ቋንቋ (S)" : "Ethiopian Sign Language (S)"}" title="${isAm ? "የኢትዮጵያ የምልክት ቋንቋ (S)" : "Ethiopian Sign Language (S)"}">
                    <span aria-hidden="true">${ICONS.sign}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-ad" aria-pressed="${this.prefs.audioDescriptionEnabled ? "true" : "false"}" aria-label="${isAm ? "የድምጽ ማብራሪያ (D)" : "Audio Description (D)"}" title="${isAm ? "የድምጽ ማብራሪያ (D)" : "Audio Description (D)"}">
                    <span aria-hidden="true">${ICONS.ad}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-transcript-toggle" aria-pressed="${this.prefs.transcriptVisible !== false ? "true" : "false"}" aria-label="${isAm ? "የጽሑፍ ግልባጭ ማሳያ (T)" : "Toggle Transcript (T)"}" title="${isAm ? "የጽሑፍ ግልባጭ ማሳያ (T)" : "Toggle Transcript (T)"}">
                    <span aria-hidden="true">${ICONS.transcript}</span>
                  </button>

                  <span class="ctrl-divider" aria-hidden="true"></span>

                  <button class="btn-ctrl" id="btn-speed-faster" aria-label="${isAm ? "ፍጥነት ጨምር (>)" : "Increase speed (>)"}" title="${isAm ? "ፍጥነት ጨምር (>)" : "Increase speed (>)"}">
                    <span aria-hidden="true">${ICONS.faster}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-speed-slower" aria-label="${isAm ? "ፍጥነት ቀንስ (<)" : "Decrease speed (<)"}" title="${isAm ? "ፍጥነት ቀንስ (<)" : "Decrease speed (<)"}">
                    <span aria-hidden="true">${ICONS.slower}</span>
                  </button>

                  <span class="ctrl-divider" aria-hidden="true"></span>
                </div>

                <!-- Right: Settings, Fullscreen, Volume -->
                <div class="controls-cluster">
                  <button class="btn-ctrl" id="btn-prefs" aria-expanded="false" aria-label="${isAm ? "የተደራሽነት ምርጫዎች" : "Accessibility Preferences"}" title="${isAm ? "የተደራሽነት ምርጫዎች" : "Accessibility Preferences"}">
                    <span aria-hidden="true">${ICONS.prefs}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-fullscreen" aria-pressed="false" aria-label="${isAm ? "ሙሉ ማያ ገጽ (F)" : "Fullscreen (F)"}" title="${isAm ? "ሙሉ ማያ ገጽ (F)" : "Fullscreen (F)"}">
                    <span id="fullscreen-icon" aria-hidden="true">${ICONS.fullscreenEnter}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-mute" aria-pressed="false" aria-label="${isAm ? "ድምጽ አጥፋ (M)" : "Mute (M)"}" title="${isAm ? "ድምጽ አጥፋ (M)" : "Mute (M)"}">
                    <span id="mute-icon" aria-hidden="true">${ICONS.volumeUnmuted}</span>
                  </button>
                </div>
              </div>

              <!-- Status Strip -->
              <div class="status-strip" aria-hidden="true">
                <span class="status-item status-time" id="time-display">00:00 / 00:00</span>
                <span class="status-item status-speed" id="speed-display">Speed: 1x</span>
                <span class="status-item status-state" id="state-display">Paused</span>
              </div>
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

      // --- Free Dragging & Floating Controller (Move in ANY direction, No visible borders) ---
      let isDragging = false;
      let dragStartX = 0;
      let dragStartY = 0;
      let initialLeft = 0;
      let initialTop = 0;
      let dragRaf: number | null = null;

      // Bring clicked floating window to the front
      winEl.addEventListener("pointerdown", () => {
        if (winEl.classList.contains("floating")) {
          winEl.style.zIndex = "100";
          const otherWinId = winId === "transcript-window" ? "esl-window" : "transcript-window";
          const otherWin = this.shadow.getElementById(otherWinId);
          if (otherWin && otherWin.classList.contains("floating")) {
            otherWin.style.zIndex = "90";
          }
        }
      });

      const onDragPointerMove = (e: PointerEvent) => {
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;

        if (!isDragging && Math.hypot(dx, dy) > 4) {
          isDragging = true;
          // Create in-flow invisible spacer so surrounding layout does not collapse
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
          winEl.style.zIndex = "100";
        }

        if (isDragging) {
          if (dragRaf !== null) cancelAnimationFrame(dragRaf);
          dragRaf = requestAnimationFrame(() => {
            // Unrestricted movement in ANY direction (up, down, left, right)
            const newLeft = initialLeft + dx;
            const newTop = initialTop + dy;

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
        initialLeft = winEl.style.left ? parseFloat(winEl.style.left) : (winRect.left - stageRect.left);
        initialTop = winEl.style.top ? parseFloat(winEl.style.top) : (winRect.top - stageRect.top);
        isDragging = false;

        // Bring current window to front
        winEl.style.zIndex = "100";
        const otherWinId = winId === "transcript-window" ? "esl-window" : "transcript-window";
        const otherWin = this.shadow.getElementById(otherWinId);
        if (otherWin && otherWin.classList.contains("floating")) {
          otherWin.style.zIndex = "90";
        }

        window.addEventListener("pointermove", onDragPointerMove);
        window.addEventListener("pointerup", onDragPointerUp);
        window.addEventListener("pointercancel", onDragPointerUp);
      });

      // Keyboard accessible moving in any direction (Arrow keys on drag handle)
      dragHandle.addEventListener("keydown", (e: KeyboardEvent) => {
        let changed = false;
        const step = 20;

        if (!winEl.classList.contains("floating")) {
          if (!placeholderEl && winEl.parentNode) {
            placeholderEl = document.createElement("div");
            placeholderEl.className = "window-placeholder";
            placeholderEl.style.width = `${winEl.offsetWidth}px`;
            placeholderEl.style.height = `${winEl.offsetHeight}px`;
            placeholderEl.style.flex = winEl.style.flex || `0 0 ${winEl.offsetWidth}px`;
            winEl.parentNode.insertBefore(placeholderEl, winEl);
          }
          const stageRect = stage.getBoundingClientRect();
          const winRect = winEl.getBoundingClientRect();
          winEl.classList.add("floating");
          winEl.style.position = "absolute";
          winEl.style.zIndex = "100";
          winEl.style.left = `${winRect.left - stageRect.left}px`;
          winEl.style.top = `${winRect.top - stageRect.top}px`;
        }

        let curLeft = parseFloat(winEl.style.left) || 0;
        let curTop = parseFloat(winEl.style.top) || 0;

        if (e.key === "ArrowRight") {
          curLeft += step;
          changed = true;
        } else if (e.key === "ArrowLeft") {
          curLeft -= step;
          changed = true;
        } else if (e.key === "ArrowDown") {
          curTop += step;
          changed = true;
        } else if (e.key === "ArrowUp") {
          curTop -= step;
          changed = true;
        }

        if (changed) {
          e.preventDefault();
          winEl.style.left = `${curLeft}px`;
          winEl.style.top = `${curTop}px`;
        }
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
    const bigPlayBtn = this.shadow.getElementById("big-play-btn");
    const restartBtn = this.shadow.getElementById("btn-restart");
    const speedFasterBtn = this.shadow.getElementById("btn-speed-faster");
    const speedSlowerBtn = this.shadow.getElementById("btn-speed-slower");
    const speedDisplay = this.shadow.getElementById("speed-display");
    const stateDisplay = this.shadow.getElementById("state-display");
    const fullscreenBtn = this.shadow.getElementById("btn-fullscreen");
    const fullscreenIcon = this.shadow.getElementById("fullscreen-icon");
    const muteBtn = this.shadow.getElementById("btn-mute");
    const muteIcon = this.shadow.getElementById("mute-icon");
    const playerContainer = this.shadow.getElementById("player-container");
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
    if (bigPlayBtn) bigPlayBtn.addEventListener("click", togglePlay);
    this.mainVideo.addEventListener("click", togglePlay);

    this.mainVideo.addEventListener("play", () => {
      if (playIcon) playIcon.innerHTML = ICONS.pause;
      playBtn?.setAttribute("aria-label", this.activeLocale === "am" ? "አቁም (Space / K)" : "Pause (Space / K)");
      playBtn?.setAttribute("title", this.activeLocale === "am" ? "አቁም (Space / K)" : "Pause (Space / K)");
      bigPlayBtn?.classList.add("is-hidden");
      if (stateDisplay) stateDisplay.textContent = this.activeLocale === "am" ? "እየተጫወተ ነው" : "Playing";
    });

    this.mainVideo.addEventListener("pause", () => {
      if (playIcon) playIcon.innerHTML = ICONS.play;
      playBtn?.setAttribute("aria-label", this.activeLocale === "am" ? "አጫውት (Space / K)" : "Play (Space / K)");
      playBtn?.setAttribute("title", this.activeLocale === "am" ? "አጫውት (Space / K)" : "Play (Space / K)");
      bigPlayBtn?.classList.remove("is-hidden");
      if (stateDisplay) {
        stateDisplay.textContent = this.mainVideo.ended
          ? (this.activeLocale === "am" ? "ተጠናቋል" : "End of track")
          : (this.activeLocale === "am" ? "ቆሟል" : "Paused");
      }
    });

    this.mainVideo.addEventListener("ended", () => {
      if (playIcon) playIcon.innerHTML = ICONS.play;
      playBtn?.setAttribute("aria-label", this.activeLocale === "am" ? "አጫውት (Space / K)" : "Play (Space / K)");
      playBtn?.setAttribute("title", this.activeLocale === "am" ? "አጫውት (Space / K)" : "Play (Space / K)");
      bigPlayBtn?.classList.remove("is-hidden");
      if (stateDisplay) stateDisplay.textContent = this.activeLocale === "am" ? "ተጠናቋል" : "End of track";
    });

    // Restart Video to Beginning
    restartBtn?.addEventListener("click", () => {
      this.mainVideo.currentTime = 0;
      this.mainVideo.play();
      this.transcriptViewer.updateActiveTime(0);
    });

    // Speed Controls (Faster / Slower)
    const SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const updateSpeedDisplay = () => {
      const rate = this.mainVideo.playbackRate;
      if (speedDisplay) {
        speedDisplay.textContent = `Speed: ${rate}x`;
      }
    };

    speedFasterBtn?.addEventListener("click", () => {
      const current = this.mainVideo.playbackRate;
      const higher = SPEEDS.filter((s) => s > current + 0.01);
      const next = higher.length > 0 ? higher[0] : 2.0;
      this.mainVideo.playbackRate = next;
      updateSpeedDisplay();
    });

    speedSlowerBtn?.addEventListener("click", () => {
      const current = this.mainVideo.playbackRate;
      const lower = SPEEDS.filter((s) => s < current - 0.01);
      const prev = lower.length > 0 ? lower[lower.length - 1] : 0.5;
      this.mainVideo.playbackRate = prev;
      updateSpeedDisplay();
    });

    // Fullscreen Toggle
    const isFullscreen = () => {
      return (
        document.fullscreenElement === playerContainer ||
        (document as any).webkitFullscreenElement === playerContainer
      );
    };

    const toggleFullscreen = async () => {
      try {
        if (!isFullscreen()) {
          if (playerContainer?.requestFullscreen) {
            await playerContainer.requestFullscreen();
          } else if ((playerContainer as any)?.webkitRequestFullscreen) {
            await (playerContainer as any).webkitRequestFullscreen();
          }
        } else {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if ((document as any).webkitExitFullscreen) {
            await (document as any).webkitExitFullscreen();
          }
        }
      } catch (err) {
        console.warn("Fullscreen toggle failed:", err);
      }
    };

    fullscreenBtn?.addEventListener("click", toggleFullscreen);

    const updateFullscreenState = () => {
      const active = isFullscreen();
      fullscreenBtn?.setAttribute("aria-pressed", active ? "true" : "false");
      fullscreenBtn?.setAttribute(
        "aria-label",
        active
          ? (this.activeLocale === "am" ? "ከሙሉ ማያ ገጽ ውጣ (F)" : "Exit Fullscreen (F)")
          : (this.activeLocale === "am" ? "ሙሉ ማያ ገጽ (F)" : "Fullscreen (F)")
      );
      fullscreenBtn?.setAttribute(
        "title",
        active
          ? (this.activeLocale === "am" ? "ከሙሉ ማያ ገጽ ውጣ (F)" : "Exit Fullscreen (F)")
          : (this.activeLocale === "am" ? "ሙሉ ማያ ገጽ (F)" : "Fullscreen (F)")
      );
      if (fullscreenIcon) {
        fullscreenIcon.innerHTML = active ? ICONS.fullscreenExit : ICONS.fullscreenEnter;
      }
    };

    document.addEventListener("fullscreenchange", updateFullscreenState);
    document.addEventListener("webkitfullscreenchange", updateFullscreenState);

    // Mute / Volume Toggle
    const toggleMute = () => {
      this.mainVideo.muted = !this.mainVideo.muted;
    };

    muteBtn?.addEventListener("click", toggleMute);

    const updateMuteState = () => {
      const isMuted = this.mainVideo.muted;
      muteBtn?.setAttribute("aria-pressed", isMuted ? "true" : "false");
      muteBtn?.setAttribute(
        "aria-label",
        isMuted
          ? (this.activeLocale === "am" ? "ድምጽ አብራ (M)" : "Unmute (M)")
          : (this.activeLocale === "am" ? "ድምጽ አጥፋ (M)" : "Mute (M)")
      );
      muteBtn?.setAttribute(
        "title",
        isMuted
          ? (this.activeLocale === "am" ? "ድምጽ አብራ (M)" : "Unmute (M)")
          : (this.activeLocale === "am" ? "ድምጽ አጥፋ (M)" : "Mute (M)")
      );
      if (muteIcon) {
        muteIcon.innerHTML = isMuted ? ICONS.volumeMuted : ICONS.volumeUnmuted;
      }
    };

    this.mainVideo.addEventListener("volumechange", updateMuteState);

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
      const isOff = this.prefs.captionLanguage === "off";
      btnCC.setAttribute("aria-pressed", isOff ? "false" : "true");
      btnCC.setAttribute("title", `Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`);
      btnCC.setAttribute(
        "aria-label",
        this.activeLocale === "am"
          ? `የትርጉም ጽሑፍ: ${this.prefs.captionLanguage.toUpperCase()} (C)`
          : `Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`
      );
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
      if (btnCC) {
        const isOff = this.prefs.captionLanguage === "off";
        btnCC.setAttribute("aria-pressed", isOff ? "false" : "true");
        btnCC.setAttribute("title", `Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`);
        btnCC.setAttribute(
          "aria-label",
          this.activeLocale === "am"
            ? `የትርጉም ጽሑፍ: ${this.prefs.captionLanguage.toUpperCase()} (C)`
            : `Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`
        );
      }
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
          toggleMute();
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "0":
        case "Home":
          e.preventDefault();
          this.mainVideo.currentTime = 0;
          this.mainVideo.play();
          this.transcriptViewer.updateActiveTime(0);
          break;
        case ">":
        case ".":
          e.preventDefault();
          speedFasterBtn?.click();
          break;
        case "<":
        case ",":
          e.preventDefault();
          speedSlowerBtn?.click();
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
