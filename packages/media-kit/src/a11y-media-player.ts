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
  VideoQuality,
  DEFAULT_PREFERENCES,
} from "./preferences/storage.js";
import { parseVTT, VTTCueItem, getThemeStyles } from "./captions/caption-manager.js";
import { MediaSyncController, SignStatus } from "./media/sync-controller.js";
import { TranscriptViewer, TranscriptSegmentData } from "./transcript/transcript-viewer.js";
import { LiveChatViewer, LiveChatMessageItem } from "./transcript/live-chat-viewer.js";
import { generateBRFDocument } from "./braille/braille-formatter.js";

const ICONS = {
  play: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
  restart: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>`,
  rewind: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>`,
  forward: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>`,
  cc: `<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-4a1 1 0 011-1h3a1 1 0 011 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1a1 1 0 01-1 1h-3a1 1 0 01-1-1v-4a1 1 0 011-1h3a1 1 0 011 1v1z"/></svg>`,
  sign: `<svg viewBox="0 0 32 20" width="28" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="1.5" y="1.5" width="29" height="17" rx="3.5" fill="rgba(255,255,255,0.06)"/><text x="16" y="14" text-anchor="middle" fill="currentColor" stroke="none" font-size="11" font-weight="bold" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" letter-spacing="0.5">ESL</text></svg>`,
  esl: `<svg viewBox="0 0 32 20" width="28" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="1.5" y="1.5" width="29" height="17" rx="3.5" fill="rgba(255,255,255,0.06)"/><text x="16" y="14" text-anchor="middle" fill="currentColor" stroke="none" font-size="11" font-weight="bold" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" letter-spacing="0.5">ESL</text></svg>`,
  ad: `<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M3 3.5h6.2c4.2 0 7.3 3 7.3 7.5s-3.1 7.5-7.3 7.5H3V3.5zm3.6 3.4v8.2h2.4c2.2 0 3.7-1.7 3.7-4.1s-1.5-4.1-3.7-4.1H6.6z"/><path d="M17.5 8.5c1 1.5 1 3.5 0 5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M20.5 6c2 2.7 2 7.3 0 10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  transcript: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`,
  faster: `<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M12 4a9 9 0 0 0-9 9c0 2.4 1 4.5 2.6 6.1l1.4-1.4A7 7 0 0 1 5 13a7 7 0 0 1 12.6-4.2l1.5-1.5A9 9 0 0 0 12 4z"/><path d="M12.5 12.9a1.5 1.5 0 0 0 1-1.4c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5a1.5 1.5 0 0 0 .5 1.1l3.2 3.2 1.1-1.1-2.8-1.8z"/><path d="M18 12v6M15 15h6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  slower: `<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M12 4a9 9 0 0 0-9 9c0 2.4 1 4.5 2.6 6.1l1.4-1.4A7 7 0 0 1 5 13a7 7 0 0 1 12.6-4.2l1.5-1.5A9 9 0 0 0 12 4z"/><path d="M11 11.5a1.5 1.5 0 0 0-1 1.4c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5a1.5 1.5 0 0 0-.5-1.1l-3.2-3.2-1.1 1.1 2.8 1.8z"/><rect x="15" y="14" width="6" height="2.2" rx="1"/></svg>`,
  prefs: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`,
  fullscreenEnter: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`,
  fullscreenExit: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`,
  volumeUnmuted: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
  volumeMuted: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`,
  shortcuts: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/></svg>`,
  quality: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm-8 11H9.5v-2h-2v2H6V9h1.5v2.5h2V9H11v6zm7-1c0 .55-.45 1-1 1h-4V9h4c.55 0 1 .45 1 1v4zm-1.5-3.5h-2v3h2v-3z"/></svg>`,
  lowData: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M4 18h2v3H4v-3zm4-4h2v7H8v-7zm4-4h2v11h-2v-11zm4-4h2v15h-2V6zm4-4h2v19h-2V2z"/></svg>`
};

export class A11yMediaPlayer extends HTMLElement {
  static get observedAttributes() {
    return ["manifest-src", "locale", "lang", "src", "captions", "sign", "describe", "api"];
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

  // Transcript & Live Chat Replay
  private transcriptViewer!: TranscriptViewer;
  private liveChatViewer!: LiveChatViewer;
  private liveChatMessages: LiveChatMessageItem[] = [];
  private activeLeftTab: "transcript" | "chat" = "transcript";

  // UI state
  private isPreferencesOpen = false;
  private isQualityMenuOpen = false;
  private currentQuality: VideoQuality = "auto";
  private qualityToastTimer: number | null = null;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.prefs = loadPreferences();
    this.currentQuality = this.prefs.videoQuality || "auto";
  }

  private onCaptionsUpdated = () => {
    this.initTracksAndTranscript();
  };

  connectedCallback() {
    this.activeLocale = (this.getAttribute("lang") as "en" | "am") || (this.getAttribute("locale") as "en" | "am") || "en";
    const manifestSrc = this.getAttribute("manifest-src");
    if (manifestSrc) {
      this.loadManifest(manifestSrc);
    } else if (this.getAttribute("src")) {
      this.initFromAttributes();
    }
    window.addEventListener("db-player:captions-updated", this.onCaptionsUpdated);
  }

  disconnectedCallback() {
    window.removeEventListener("db-player:captions-updated", this.onCaptionsUpdated);
    if (this.syncController) {
      this.syncController.destroy();
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      if (name === "locale" || name === "lang") {
        this.activeLocale = (newValue as "en" | "am") || "en";
        this.updateLocaleStrings();
      } else if (name === "manifest-src") {
        this.loadManifest(newValue);
      } else if (name === "src" || name === "captions" || name === "sign" || name === "describe") {
        if (!this.getAttribute("manifest-src")) {
          this.initFromAttributes();
        }
      }
    }
  }

  private initFromAttributes() {
    const src = this.getAttribute("src");
    if (!src) return;
    const lang = (this.getAttribute("lang") as "en" | "am") || (this.getAttribute("locale") as "en" | "am") || "en";
    this.activeLocale = lang;
    const captionsAttr = this.getAttribute("captions") || "";
    const signAttr = this.getAttribute("sign");
    const describeAttr = this.getAttribute("describe");

    const captionTracks = captionsAttr.split(",").map((c) => c.trim()).filter(Boolean).map((cPath) => {
      const isAm = cPath.includes(".am.") || cPath.endsWith("am.vtt") || cPath.includes("am");
      return {
        id: isAm ? "cap-am" : "cap-en",
        language: isAm ? "am" : "en",
        label: isAm ? "አማርኛ" : "English",
        src: cPath,
      };
    });

    this.manifest = {
      id: "lesson-player",
      version: "1.0.0",
      title: { en: "Lesson Video", am: "የትምህርት ቪዲዮ" },
      sources: [
        { id: "main-video", kind: "main", src, mimeType: "video/mp4" },
        ...(signAttr ? [{ id: "sign-video", kind: "sign" as const, src: signAttr, mimeType: "video/mp4" }] : []),
      ],
      captionTracks,
      audioDescription: describeAttr ? { src: describeAttr } : undefined,
    } as unknown as LessonManifest;

    this.render();
    this.initTracksAndTranscript();
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
        liveSession: rawManifest.liveSession
          ? {
              ...rawManifest.liveSession,
              chatSrc: rawManifest.liveSession.chatSrc ? resolveUrl(rawManifest.liveSession.chatSrc) : undefined,
            }
          : undefined,
      };

      if (this.manifest?.liveSession?.chatSrc) {
        try {
          const chatRes = await fetch(this.manifest.liveSession.chatSrc);
          if (chatRes.ok) {
            this.liveChatMessages = await chatRes.json();
            if (this.liveChatViewer) {
              this.liveChatViewer.setMessages(this.liveChatMessages);
            }
          }
        } catch (chatErr) {
          console.warn("Could not load live chat messages:", chatErr);
        }
      }

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

    // Load transcript: check for published custom transcript first
    const customTranscript = typeof localStorage !== "undefined" ? localStorage.getItem(`db-player:custom-transcript:${this.activeLocale}`) : null;
    if (customTranscript) {
      try {
        const data = JSON.parse(customTranscript);
        const segments: TranscriptSegmentData[] = (data.segments || []).map((seg: any) => ({
          id: seg.id,
          start: seg.start_ms !== undefined ? seg.start_ms / 1000 : seg.start || 0,
          end: seg.end_ms !== undefined ? seg.end_ms / 1000 : seg.end || 0,
          speaker: seg.speaker,
          text: seg.text || seg.reviewedText || seg.draft_text || seg.draftText || "",
          visualDescription: seg.visual_description || seg.visualDescription,
        }));
        this.transcriptViewer.setSegments(segments);
        return;
      } catch (e) {
        console.warn("Could not parse custom transcript, falling back to manifest src", e);
      }
    }

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
      // Check for user-published custom captions in localStorage first
      const customVtt = typeof localStorage !== "undefined" ? localStorage.getItem(`db-player:custom-vtt:${lang}`) : null;
      if (customVtt) {
        this.currentCues = parseVTT(customVtt);
      } else {
        const res = await fetch(trackMeta.src);
        if (res.ok) {
          const vttText = await res.text();
          this.currentCues = parseVTT(vttText);
        }
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

  private resolveMainSource(quality: VideoQuality = this.currentQuality): string {
    if (!this.manifest || !this.manifest.sources) return "";
    const mainSources = this.manifest.sources.filter((s) => s.kind === "main");
    if (!mainSources.length) return "";

    if (quality === "auto") {
      const conn = (navigator as unknown as { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
      if (conn?.saveData || conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g") {
        const q240 = mainSources.find((s) => s.quality === "240p");
        if (q240) return q240.src;
      } else if (conn?.effectiveType === "3g") {
        const q360 = mainSources.find((s) => s.quality === "360p");
        if (q360) return q360.src;
      }
      const q720 = mainSources.find((s) => s.quality === "720p");
      return q720 ? q720.src : mainSources[0].src;
    }

    const matched = mainSources.find((s) => s.quality === quality);
    if (matched) return matched.src;
    return mainSources[0].src;
  }

  private async applyQuality(quality: VideoQuality) {
    this.currentQuality = quality;
    this.prefs.videoQuality = quality;
    savePreferences({ videoQuality: quality });

    // Update button badge text
    const badgeText = this.shadow.getElementById("quality-badge-text");
    if (badgeText) {
      badgeText.textContent = quality === "auto" ? "Auto" : quality;
    }

    // Update checkmarks in quality popover
    const menuItems = this.shadow.querySelectorAll(".quality-menu-item");
    menuItems.forEach((item) => {
      const q = item.getAttribute("data-quality");
      const isSelected = q === quality;
      item.classList.toggle("selected", isSelected);
      item.setAttribute("aria-checked", isSelected ? "true" : "false");
      const checkEl = item.querySelector(".quality-check");
      if (checkEl) checkEl.textContent = isSelected ? "✓" : "";
    });

    // Update select-video-quality dropdown in settings popover
    const selectQuality = this.shadow.getElementById("select-video-quality") as HTMLSelectElement | null;
    if (selectQuality && selectQuality.value !== quality) {
      selectQuality.value = quality;
    }

    // Flash toast indicator
    const toast = this.shadow.getElementById("quality-toast");
    const toastText = this.shadow.getElementById("quality-toast-text");
    if (toast && toastText) {
      const isAm = this.activeLocale === "am";
      const qLabel = quality === "auto"
        ? (isAm ? "ጥራት፡ Auto (ተለዋዋጭ)" : "Quality: Auto (Adaptive)")
        : `${isAm ? "ጥራት፡ " : "Quality: "}${quality}`;
      toastText.textContent = `⚡ ${qLabel}`;
      toast.style.display = "flex";
      toast.style.opacity = "1";
      if (this.qualityToastTimer) clearTimeout(this.qualityToastTimer);
      this.qualityToastTimer = window.setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => {
          if (toast.style.opacity === "0") toast.style.display = "none";
        }, 300);
      }, 2000);
    }

    // Switch video stream seamlessly
    const newSrc = this.resolveMainSource(quality);
    if (newSrc && this.mainVideo) {
      if (!this.prefs.audioDescriptionEnabled) {
        if (this.syncController) {
          await this.syncController.switchSource(newSrc);
        } else {
          const wasPlaying = !this.mainVideo.paused;
          const curTime = this.mainVideo.currentTime;
          const curRate = this.mainVideo.playbackRate;
          this.mainVideo.src = newSrc;
          this.mainVideo.currentTime = curTime;
          this.mainVideo.playbackRate = curRate;
          if (wasPlaying) {
            try { await this.mainVideo.play(); } catch {}
          }
        }
      }
    }
  }

  private render() {
    const isAm = this.activeLocale === "am";
    const title = this.manifest ? this.manifest.title[this.activeLocale] : "Media Player";

    const activeMainSrc = this.resolveMainSource(this.currentQuality);
    const signSource = this.manifest?.sources.find((s) => s.kind === "sign");

    const transWidth = this.prefs.transcriptWidth || DEFAULT_PREFERENCES.transcriptWidth || 260;
    const transHeight = this.prefs.transcriptHeight || DEFAULT_PREFERENCES.transcriptHeight || 400;
    const eslWidth = this.prefs.eslWidth || DEFAULT_PREFERENCES.eslWidth || 240;
    const eslHeight = this.prefs.eslHeight || DEFAULT_PREFERENCES.eslHeight || 180;

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
          flex-wrap: nowrap;
          align-items: flex-start;
          justify-content: center;
          gap: 0.85rem;
          position: relative;
          width: 100%;
          box-sizing: border-box;
        }
        @media (max-width: 1120px) {
          .player-stage {
            flex-wrap: wrap;
          }
          .main-player-panel {
            min-width: 100% !important;
            max-width: 100% !important;
            order: 1;
          }
          #transcript-view-panel {
            order: 2;
            flex: 1 1 320px;
            max-width: 100%;
          }
          #sign-view-panel {
            order: 3;
            flex: 1 1 260px;
            max-width: 100%;
          }
        }

        /* Window Panels */
        .window-panel {
          position: relative;
          background: var(--color-surface-elevated, #FFF);
          border: 1px solid var(--color-border, #CBD5E1);
          border-radius: 6px;
          color: var(--color-ink, inherit);
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
          gap: 0.65rem;
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
        .auto-scroll-label input[type="checkbox"] {
          accent-color: var(--color-brand, #0071E3);
          cursor: pointer;
        }
        .header-select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-color: rgba(255, 255, 255, 0.12);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23CBD5E1' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
          color: #F8F9FA;
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          font-family: inherit;
          padding: 0 24px 0 10px;
          height: 28px;
          cursor: pointer;
          transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
          outline: none;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
        }
        .header-select:hover {
          background-color: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.38);
        }
        .header-select:focus-visible {
          outline: 2px solid var(--color-focus, #0071E3);
          outline-offset: 1px;
          border-color: transparent;
        }
        .header-select option {
          background: #23282E;
          color: #F8F9FA;
          padding: 6px 10px;
        }

        /* 1-Click Docking Presets for Floating Windows */
        .dock-presets-group {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          margin-right: 4px;
        }
        .btn-dock-preset {
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.22);
          color: #E2E8F0;
          font-size: 11px;
          line-height: 1;
          width: 22px;
          height: 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
          padding: 0;
        }
        .btn-dock-preset:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.45);
          transform: translateY(-1px);
        }
        .btn-dock-preset:focus-visible {
          outline: 2px solid var(--color-focus, #0071E3);
          outline-offset: 1px;
        }

        /* Tool Pill Buttons (e.g. BRF Download, Questions Filter) */
        .btn-tool-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #F1F5F9;
          border: 1px solid #CBD5E1;
          color: #1E293B;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.15s ease;
          line-height: 1;
          white-space: nowrap;
        }
        .btn-tool-pill:hover {
          background: #E2E8F0;
          border-color: #94A3B8;
        }
        .btn-tool-pill.active {
          background: var(--color-brand, #0071E3);
          border-color: var(--color-brand, #0071E3);
          color: #FFFFFF;
        }
        .btn-tool-pill:focus-visible {
          outline: 2px solid var(--color-focus, #0071E3);
          outline-offset: 1px;
        }

        /* Video Quality Popover Menu & Button */
        .quality-popover {
          position: absolute;
          bottom: 58px;
          right: 68px;
          min-width: 170px;
          background: rgba(24, 24, 27, 0.96);
          color: #F8FAFC;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5), 0 2px 10px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          z-index: 125;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 6px 0;
          box-sizing: border-box;
          transform-origin: bottom right;
          animation: appleFlyoutIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .quality-menu-header {
          padding: 6px 14px 6px 14px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #94A3B8;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 4px;
          user-select: none;
        }

        .quality-menu-list {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .quality-menu-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 8px 14px;
          background: transparent;
          border: none;
          color: #F1F5F9;
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
          text-align: left;
          gap: 8px;
          transition: background 0.12s ease, color 0.12s ease;
          box-sizing: border-box;
        }

        .quality-menu-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #FFFFFF;
        }

        .quality-menu-item:focus-visible {
          background: rgba(255, 255, 255, 0.15);
          outline: 2px solid var(--color-focus, #0071E3);
          outline-offset: -2px;
        }

        .quality-menu-item.selected {
          font-weight: 700;
          color: #FFFFFF;
        }

        .quality-check {
          width: 18px;
          color: #FFFFFF;
          font-size: 0.95rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          flex-shrink: 0;
          margin-right: 6px;
        }

        .quality-name {
          flex: 1 1 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }

        .quality-tag {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.14);
          color: #CBD5E1;
          letter-spacing: 0.02em;
        }

        .btn-ctrl.btn-ctrl-quality {
          width: auto !important;
          min-width: 52px;
          height: 30px;
          padding: 0 6px !important;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          border-radius: 4px;
        }
        .quality-badge-text {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 5px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.16);
          color: #FFFFFF;
          line-height: 1;
          letter-spacing: 0.02em;
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .btn-ctrl-quality.is-active {
          color: var(--color-brand, #38BDF8);
          background: rgba(255, 255, 255, 0.22);
        }

        /* Quality Toast Pill (Subtle on-screen indicator) */
        .quality-toast {
          position: absolute;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(56, 189, 248, 0.4);
          border-radius: 999px;
          padding: 6px 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 30;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          pointer-events: none;
          color: #F8FAFC;
          font-size: 0.82rem;
          font-weight: 600;
          animation: toastIn 0.2s ease-out;
          transition: opacity 0.3s ease;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translate(-50%, -6px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        /* 1-Click Caption Contrast Presets */
        .preset-pill-group {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 6px 0 10px 0;
        }
        .btn-preset-pill {
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-preset-pill:hover {
          filter: brightness(1.2);
          transform: translateY(-1px);
        }
        .btn-preset-pill:focus-visible {
          outline: 2px solid var(--color-focus, #0071E3);
          outline-offset: 1px;
        }

        /* Keyboard Shortcuts Dialog */
        .shortcuts-panel {
          max-width: 520px;
        }
        .shortcuts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 14px;
          margin-top: 1rem;
        }
        @media (max-width: 600px) {
          .shortcuts-grid {
            grid-template-columns: 1fr;
          }
        }
        .shortcut-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.84rem;
          color: #334155;
        }
        .shortcut-item kbd {
          display: inline-block;
          background: #F1F5F9;
          border: 1px solid #CBD5E1;
          border-bottom-width: 2px;
          border-radius: 4px;
          padding: 2px 7px;
          font-family: -apple-system, BlinkMacSystemFont, "SF Mono", monospace;
          font-size: 0.75rem;
          font-weight: 700;
          color: #0F172A;
          min-width: 20px;
          text-align: center;
        }
        .btn-close-modal {
          background: transparent;
          border: none;
          color: #64748B;
          font-size: 1.25rem;
          line-height: 1;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
        }
        .btn-close-modal:hover {
          background: #F1F5F9;
          color: #0F172A;
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

        /* Center Main Player Panel - Balanced Horizontal Cinema Proportion */
        .main-player-panel {
          flex: 3 1 760px;
          min-width: 480px;
          max-width: 980px;
          width: 100%;
          background: #111417;
          border-radius: 8px;
          overflow: visible;
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
        :host(:fullscreen) #player-container,
        :host(:-webkit-full-screen) #player-container,
        #player-container:fullscreen,
        #player-container:-webkit-full-screen,
        .main-player-panel:fullscreen,
        .main-player-panel:-webkit-full-screen,
        .main-player-panel.is-fullscreen,
        :host([data-fullscreen="true"]) #player-container {
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
          border-radius: 8px 8px 0 0;
        }
        #player-container:fullscreen .video-viewport,
        #player-container:-webkit-full-screen .video-viewport,
        .main-player-panel:fullscreen .video-viewport,
        .main-player-panel:-webkit-full-screen .video-viewport,
        .main-player-panel.is-fullscreen .video-viewport,
        :host([data-fullscreen="true"]) .video-viewport {
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
          border-radius: 0 0 8px 8px;
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
          padding: 4px 6px;
          gap: 2px;
          flex-wrap: nowrap;
          overflow-x: visible;
        }
        .controls-cluster {
          display: flex;
          align-items: center;
          gap: 1px;
        }
        .btn-ctrl {
          background: transparent;
          color: #F8F9FA;
          border: 1px solid transparent;
          border-radius: 4px;
          padding: 0;
          width: 30px;
          height: 30px;
          min-width: 30px;
          min-height: 30px;
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
        #btn-esl {
          width: 34px;
          min-width: 34px;
        }
        .ctrl-divider {
          display: inline-block;
          width: 1px;
          height: 18px;
          background: rgba(255, 255, 255, 0.22);
          margin: 0 2px;
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
          flex: 0 0 280px;
          min-width: 200px;
          max-width: 550px;
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
          background: var(--color-surface-elevated, #FFF);
          color: var(--color-ink, #0F172A);
        }
        .left-panel-tabs {
          display: flex;
          background: var(--color-surface, #F1F5F9);
          border: 1px solid var(--color-border-subtle, transparent);
          border-radius: 6px;
          padding: 3px;
          gap: 3px;
          margin-bottom: 0.75rem;
          user-select: none;
          flex-shrink: 0;
        }
        .tab-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.35rem 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
          border: none;
          background: transparent;
          color: var(--color-muted-ink, #475569);
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
        }
        .tab-btn:hover {
          color: var(--color-ink, #0F172A);
        }
        .tab-btn.active {
          background: var(--color-surface-elevated, #FFFFFF);
          color: var(--color-ink, #0F172A);
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }
        .tab-btn:focus-visible {
          outline: 2px solid var(--color-focus, #0071E3);
          outline-offset: 1px;
        }
        .tab-badge {
          background: #E2E8F0;
          color: #0F172A;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 980px;
        }
        .tab-btn.active .tab-badge {
          background: #DBEAFE;
          color: #1D4ED8;
        }
        .chat-replay-item:hover {
          background: #F8FAFC !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }
        .chat-replay-item:focus-visible {
          outline: 2px solid var(--color-focus, #0071E3) !important;
          outline-offset: 2px;
        }
        .live-chat-scroll-area {
          flex: 1;
          min-height: 0;
          min-width: 0;
          overflow-y: auto;
        }
        .live-chat-scroll-area::-webkit-scrollbar {
          width: 6px;
        }
        .live-chat-scroll-area::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.18);
          border-radius: 980px;
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
          color: var(--color-ink, #0F172A);
        }
        .search-box {
          padding: 0.45rem 0.75rem;
          background: var(--color-surface-elevated, #FFF);
          color: var(--color-ink, #0F172A);
          border: 1px solid var(--color-border, #CBD5E1);
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
        .transcript-scroll-area::-webkit-scrollbar {
          width: 6px;
        }
        .transcript-scroll-area::-webkit-scrollbar-track {
          background: transparent;
        }
        .transcript-scroll-area::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.18);
          border-radius: 980px;
        }
        .transcript-scroll-area::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.32);
        }

        /* RIGHT: Resizable Sign Language Window (Outside of video frame) */
        .esl-window {
          flex: 0 0 260px;
          min-width: 180px;
          max-width: 500px;
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
          background: var(--color-surface, #F1F5F9);
          border: 1px solid var(--color-border, #CBD5E1);
          border-radius: 4px;
          padding: 0.35rem 0.75rem;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--color-ink, #1E293B);
          cursor: pointer;
          min-height: 34px;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
        .btn-follow[aria-pressed="true"] {
          background: var(--color-brand-subtle, #DCFCE7);
          border-color: var(--color-brand, #86EFAC);
          color: var(--color-brand, #166534);
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
          color: var(--color-ink, inherit);
        }
        .transcript-item:hover {
          background: var(--color-surface, #F8FAFC);
        }
        .transcript-item.active {
          background: var(--color-brand-subtle, #F0FDF4);
          border-color: var(--color-brand, #86EFAC);
        }
        .btn-seek-time {
          background: var(--color-surface, #F8FAFC);
          border: 1px solid var(--color-border, #CBD5E1);
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

        /* Accessibility Preferences Popover Flyout (Flows smoothly from settings icon, zero dark scrim) */
        .prefs-popover {
          position: absolute;
          bottom: 64px;
          right: 12px;
          width: 360px;
          max-width: calc(100% - 24px);
          max-height: min(520px, calc(100vh - 100px));
          background: var(--color-surface-elevated, #FFFFFF);
          color: var(--color-ink, #1D1D1F);
          border-radius: 14px;
          border: 1px solid var(--color-border, rgba(0, 0, 0, 0.12));
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.24), 0 2px 10px rgba(0, 0, 0, 0.08);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          z-index: 120;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-sizing: border-box;
          transform-origin: bottom right;
          animation: appleFlyoutIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes appleFlyoutIn {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .popover-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.65rem 0.95rem;
          border-bottom: 1px solid var(--color-border-subtle, rgba(0, 0, 0, 0.08));
          background: rgba(0, 0, 0, 0.02);
          flex-shrink: 0;
        }
        .popover-title {
          font-size: 0.92rem;
          font-weight: 600;
          color: inherit;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .popover-title svg {
          width: 16px;
          height: 16px;
          color: var(--color-brand, #0071E3);
        }
        .btn-popover-close {
          background: transparent;
          border: none;
          color: var(--color-muted-ink, #64748B);
          width: 28px;
          height: 28px;
          border-radius: 999px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
          transition: background 0.15s ease, color 0.15s ease;
          padding: 0;
        }
        .btn-popover-close:hover {
          background: rgba(0, 0, 0, 0.08);
          color: var(--color-ink, #0F172A);
        }
        .btn-popover-close:focus-visible {
          outline: 2px solid var(--color-focus, #0071E3);
          outline-offset: 1px;
        }

        .popover-body {
          padding: 0.75rem 0.95rem;
          overflow-y: auto;
          flex: 1 1 auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
        }
        .popover-body .form-row {
          margin-bottom: 0.65rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .popover-body .form-row:last-child {
          margin-bottom: 0;
        }
        .popover-body label {
          font-weight: 600;
          font-size: 0.8rem;
          color: inherit;
        }
        .popover-body select {
          padding: 0.35rem 0.6rem;
          border-radius: 8px;
          border: 1px solid var(--color-border, #D2D2D7);
          background: var(--color-surface, #FFFFFF);
          color: var(--color-ink, #1D1D1F);
          font-size: 0.85rem;
          min-height: 36px;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .popover-body select:focus-visible {
          outline: 2px solid var(--color-focus, #0071E3);
          outline-offset: 1px;
        }

        .popover-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.55rem 0.95rem;
          border-top: 1px solid var(--color-border-subtle, rgba(0, 0, 0, 0.08));
          background: rgba(0, 0, 0, 0.02);
          gap: 0.5rem;
          flex-shrink: 0;
        }
        .btn-popover-action {
          padding: 0.45rem 0.9rem;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 6px;
          min-height: 36px;
          border: 1px solid transparent;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          transition: all 0.15s ease;
        }
        .btn-popover-action:focus-visible {
          outline: 2px solid var(--color-focus, #0071E3);
          outline-offset: 1px;
        }
        .btn-popover-reset {
          background: transparent;
          color: var(--color-muted-ink, #64748B);
          border-color: var(--color-border, #CBD5E1);
        }
        .btn-popover-reset:hover {
          background: rgba(0, 0, 0, 0.05);
          color: var(--color-ink, #1E293B);
        }
        .btn-popover-save {
          background: var(--color-brand, #0071E3);
          color: #FFFFFF;
        }
        .btn-popover-save:hover {
          filter: brightness(1.1);
        }

        #btn-prefs {
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), color 0.15s ease, background 0.15s ease;
        }
        #btn-prefs.is-active {
          transform: rotate(45deg);
          color: var(--color-brand, #0071E3);
          background: rgba(255, 255, 255, 0.25);
        }

        @media (max-width: 600px) {
          .prefs-popover {
            right: 8px;
            left: 8px;
            width: auto;
            max-width: none;
            bottom: 56px;
          }
          .quality-popover {
            right: 16px;
            bottom: 56px;
          }
        }

        /* Keyboard Shortcuts Modal Dialog (Soft accessible scrim) */
        .dialog-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .dialog-panel {
          background: #FFFFFF;
          color: #1D1D1F;
          padding: 1.75rem 2rem;
          border-radius: 16px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.28);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .dialog-panel h3 {
          margin-top: 0;
          color: #1D1D1F;
          font-size: 21px;
          letter-spacing: -0.005em;
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

        /* Dialog Action Buttons (Accessible, Un-squished) */
        .btn-dialog-action {
          padding: 0.6rem 1.25rem;
          font-size: 0.95rem;
          font-weight: 600;
          border-radius: 6px;
          min-height: 42px;
          border: 1px solid transparent;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          transition: background 0.15s ease, transform 0.1s ease;
          width: auto;
          min-width: 130px;
        }
        .btn-dialog-action:focus-visible {
          outline: 3px solid var(--color-accent, #F2C14E);
          outline-offset: 2px;
        }
        .btn-dialog-reset {
          background: #475569;
          color: #FFFFFF;
        }
        .btn-dialog-reset:hover {
          background: #334155;
        }
        .btn-dialog-save {
          background: var(--color-brand, #0B5D4E);
          color: #FFFFFF;
        }
        .btn-dialog-save:hover {
          background: #084338;
        }

        /* Responsive Reflow on Narrow Screens */
        @media (max-width: 980px) {
          .player-stage {
            flex-wrap: wrap;
            flex-direction: column;
            align-items: center;
          }
          .main-player-panel, .transcript-window, .esl-window {
            max-width: 100%;
            width: 100% !important;
            flex: 1 1 auto !important;
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

            <!-- Transcript & Live Chat Replay Body Content -->
            <div class="transcript-body" id="transcript-body">
              <!-- Left Panel Segmented View Tabs (Transcript | Live Chat Replay) -->
              <div class="left-panel-tabs" role="tablist" aria-label="${isAm ? "የትምህርት ይዘት እይታ" : "Session Content View"}">
                <button 
                  type="button" 
                  class="tab-btn ${this.activeLeftTab === "transcript" ? "active" : ""}" 
                  id="tab-btn-transcript" 
                  role="tab" 
                  aria-selected="${this.activeLeftTab === "transcript"}"
                  aria-controls="transcript-view-panel">
                  📄 ${isAm ? "የጽሑፍ ግልባጭ" : "Transcript"}
                </button>
                <button 
                  type="button" 
                  class="tab-btn ${this.activeLeftTab === "chat" ? "active" : ""}" 
                  id="tab-btn-chat" 
                  role="tab" 
                  aria-selected="${this.activeLeftTab === "chat"}"
                  aria-controls="live-chat-view-panel">
                  💬 ${isAm ? "የቀጥታ ውይይት ድጋሚ" : "Live Chat Replay"} <span class="tab-badge" id="chat-count-badge">${this.liveChatMessages.length || 10}</span>
                </button>
              </div>

              <!-- View 1: Lesson Transcript -->
              <div id="transcript-view-panel" style="display: ${this.activeLeftTab === "transcript" ? "flex" : "none"}; flex-direction: column; flex: 1; min-height: 0;">
                <div class="transcript-title-row" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <h3 class="transcript-title" style="margin: 0;">${isAm ? "የትምህርቱ የጽሑፍ ግልባጭ" : "Transcript"}</h3>
                    <button 
                      type="button" 
                      id="btn-export-brf" 
                      class="btn-tool-pill" 
                      aria-label="${isAm ? "የብሬል ሰነድ (.brf) አውርድ" : "Download Braille Ready Format (.brf)"}" 
                      title="${isAm ? "የብሬል ሰነድ (.brf) አውርድ (BANA 40x25)" : "Download Braille Ready Format (.brf) (BANA 40x25)"}">
                      ⠃⠗⠋ BRF
                    </button>
                  </div>
                  <input 
                    type="search" 
                    id="transcript-search" 
                    class="search-box" 
                    placeholder="${isAm ? "በጽሑፉ ውስጥ ይፈልጉ..." : "Search transcript..."}" 
                    aria-label="${isAm ? "በጽሑፉ ውስጥ ይፈልጉ" : "Search transcript"}">
                </div>
                <div id="transcript-target" class="transcript-scroll-area"></div>
              </div>

              <!-- View 2: Recorded Live Session Chat Replay -->
              <div id="live-chat-view-panel" style="display: ${this.activeLeftTab === "chat" ? "flex" : "none"}; flex-direction: column; flex: 1; min-height: 0;">
                <div class="transcript-title-row" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <h3 class="transcript-title" style="margin: 0;">${isAm ? "የቀጥታ ውይይት ድጋሚ" : "Live Chat Replay"}</h3>
                    <button 
                      type="button" 
                      id="btn-chat-questions-filter" 
                      class="btn-tool-pill" 
                      aria-pressed="false" 
                      aria-label="${isAm ? "ጥያቄዎችን ብቻ አሳይ" : "Filter Questions Only"}" 
                      title="${isAm ? "ጥያቄዎችን ብቻ አሳይ" : "Filter Questions Only"}">
                      ❓ ${isAm ? "ጥያቄዎች ብቻ" : "Questions Only"}
                    </button>
                  </div>
                  <input 
                    type="search" 
                    id="live-chat-search" 
                    class="search-box" 
                    placeholder="${isAm ? "በውይይት ውስጥ ይፈልጉ..." : "Search chat questions..."}" 
                    aria-label="${isAm ? "በቀጥታ ውይይት ውስጥ ይፈልጉ" : "Search live chat"}">
                </div>
                <div id="live-chat-target" class="live-chat-scroll-area"></div>
              </div>
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
                src="${activeMainSrc}">
              </video>

              <!-- Video Quality Toast Indicator -->
              <div class="quality-toast" id="quality-toast" style="display: none;" role="status" aria-live="polite">
                <span id="quality-toast-text">⚡ Quality: Auto</span>
              </div>

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

                  <button class="btn-ctrl" id="btn-esl" aria-pressed="${this.prefs.eslVisible ? "true" : "false"}" aria-label="${isAm ? "የኢትዮጵያ የምልክት ቋንቋ (ESL) (S)" : "Ethiopian Sign Language (ESL) (S)"}" title="${isAm ? "የኢትዮጵያ የምልክት ቋንቋ (ESL) (S)" : "Ethiopian Sign Language (ESL) (S)"}">
                    <span aria-hidden="true">${ICONS.esl}</span>
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
                  <button class="btn-ctrl btn-ctrl-quality" id="btn-quality" aria-expanded="false" aria-haspopup="menu" aria-label="${isAm ? "የቪዲዮ ጥራት" : "Video Quality"}" title="${isAm ? "የቪዲዮ ጥራት መቆጣጠሪያ (Auto / 720p / 360p / 240p)" : "Video Quality (Auto / 720p / 360p / 240p)"}">
                    <span aria-hidden="true">${ICONS.quality}</span>
                    <span class="quality-badge-text" id="quality-badge-text">${this.currentQuality === "auto" ? "Auto" : this.currentQuality}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-shortcuts" aria-expanded="false" aria-label="${isAm ? "የኪቦርድ አቋራጮች (?)" : "Keyboard Shortcuts (?)"}" title="${isAm ? "የኪቦርድ አቋራጮች (?)" : "Keyboard Shortcuts (?)"}">
                    <span aria-hidden="true">${ICONS.shortcuts}</span>
                  </button>

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

            <!-- Video Quality Popover Menu (Aligned with standard media players) -->
            <div 
              class="quality-popover" 
              id="quality-menu" 
              style="display: none;" 
              role="menu" 
              aria-label="${isAm ? "የቪዲዮ ጥራት" : "Video Quality"}">
              <div class="quality-menu-header">${isAm ? "የቪዲዮ ጥራት" : "QUALITY"}</div>
              <div class="quality-menu-list">
                <button type="button" class="quality-menu-item ${this.currentQuality === "auto" ? "selected" : ""}" data-quality="auto" role="menuitemradio" aria-checked="${this.currentQuality === "auto"}">
                  <span class="quality-check" aria-hidden="true">${this.currentQuality === "auto" ? "✓" : ""}</span>
                  <span class="quality-name">Auto</span>
                </button>
                <button type="button" class="quality-menu-item ${this.currentQuality === "720p" ? "selected" : ""}" data-quality="720p" role="menuitemradio" aria-checked="${this.currentQuality === "720p"}">
                  <span class="quality-check" aria-hidden="true">${this.currentQuality === "720p" ? "✓" : ""}</span>
                  <span class="quality-name">720p <span class="quality-tag">HD</span></span>
                </button>
                <button type="button" class="quality-menu-item ${this.currentQuality === "360p" ? "selected" : ""}" data-quality="360p" role="menuitemradio" aria-checked="${this.currentQuality === "360p"}">
                  <span class="quality-check" aria-hidden="true">${this.currentQuality === "360p" ? "✓" : ""}</span>
                  <span class="quality-name">360p <span class="quality-tag">SD</span></span>
                </button>
                <button type="button" class="quality-menu-item ${this.currentQuality === "240p" ? "selected" : ""}" data-quality="240p" role="menuitemradio" aria-checked="${this.currentQuality === "240p"}">
                  <span class="quality-check" aria-hidden="true">${this.currentQuality === "240p" ? "✓" : ""}</span>
                  <span class="quality-name">240p <span class="quality-tag">${isAm ? "ዝቅተኛ" : "Low Data"}</span></span>
                </button>
              </div>
            </div>

            <!-- Accessibility & Layout Settings Popover (Flows smoothly from settings icon, zero dark scrim) -->
            <div 
              class="prefs-popover" 
              id="prefs-dialog" 
              style="display: none;" 
              role="dialog" 
              aria-modal="true" 
              aria-labelledby="prefs-title">
              <div class="popover-header">
                <div class="popover-title" id="prefs-title">
                  <span aria-hidden="true">${ICONS.prefs}</span>
                  <span>${isAm ? "የተደራሽነት እና አቀማመጥ ምርጫዎች" : "Accessibility & Layout Settings"}</span>
                </div>
                <button type="button" class="btn-popover-close" id="btn-dismiss-prefs" aria-label="${isAm ? "ምርጫዎችን ዝጋ" : "Close settings"}" title="${isAm ? "ዝጋ" : "Close"}">✕</button>
              </div>

              <div class="popover-body">
                <div class="form-row">
                  <label for="select-video-quality">${isAm ? "የቪዲዮ ጥራት:" : "Video Quality:"}</label>
                  <select id="select-video-quality">
                    <option value="auto" ${this.currentQuality === "auto" ? "selected" : ""}>Auto (Adaptive)</option>
                    <option value="720p" ${this.currentQuality === "720p" ? "selected" : ""}>720p (HD)</option>
                    <option value="360p" ${this.currentQuality === "360p" ? "selected" : ""}>360p (SD - Standard)</option>
                    <option value="240p" ${this.currentQuality === "240p" ? "selected" : ""}>240p (${isAm ? "ዝቅተኛ ዳታ" : "Low Data / 3G"})</option>
                  </select>
                </div>

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
                  <div class="preset-pill-group" role="group" aria-label="${isAm ? "ፈጣን የንፅፅር ገጽታዎች" : "Quick Caption Contrast Presets"}">
                    <button type="button" class="btn-preset-pill" data-preset="yellow-black" style="background: #000; color: #FFFF00; border: 1px solid #FFFF00;">Yellow / Black</button>
                    <button type="button" class="btn-preset-pill" data-preset="white-black" style="background: #000; color: #FFF; border: 1px solid #FFF;">White / Black</button>
                    <button type="button" class="btn-preset-pill" data-preset="amber-gold" style="background: #111; color: #FFD700; border: 1px solid #FFD700;">OLED Amber</button>
                    <button type="button" class="btn-preset-pill" data-preset="default" style="background: rgba(28,28,30,0.85); color: #FFF; border: 1px solid rgba(255,255,255,0.3);">Apple Classic</button>
                  </div>
                  <select id="select-cc-theme">
                    <option value="default" ${this.prefs.captionTheme === "default" ? "selected" : ""}>White on Translucent Black</option>
                    <option value="yellow-black" ${this.prefs.captionTheme === "yellow-black" ? "selected" : ""}>High Contrast (Yellow on Black)</option>
                    <option value="white-black" ${this.prefs.captionTheme === "white-black" ? "selected" : ""}>High Contrast (White on Black)</option>
                    <option value="amber-gold" ${this.prefs.captionTheme === "amber-gold" ? "selected" : ""}>OLED Amber Gold (Amber on Black)</option>
                    <option value="black-yellow" ${this.prefs.captionTheme === "black-yellow" ? "selected" : ""}>High Contrast (Black on Yellow)</option>
                  </select>
                </div>

                <!-- Ethiopian Sign Language (ESL) Toggle -->
                <div class="form-row">
                  <label for="toggle-esl-visibility">${isAm ? "የምልክት ቋንቋ (ESL) ማሳያ:" : "Sign Language (ESL):"}</label>
                  <select id="toggle-esl-visibility">
                    <option value="show" ${this.prefs.eslVisible ? "selected" : ""}>${isAm ? "በጎን አሳይ (Visible)" : "Show on side"}</option>
                    <option value="hide" ${!this.prefs.eslVisible ? "selected" : ""}>${isAm ? "ደብቅ (Hidden)" : "Hide"}</option>
                  </select>
                </div>

                <!-- Interactive Transcript Toggle -->
                <div class="form-row">
                  <label for="toggle-transcript-visibility">${isAm ? "የትምህርቱ የጽሑፍ ግልባጭ:" : "Interactive Transcript:"}</label>
                  <select id="toggle-transcript-visibility">
                    <option value="show" ${this.prefs.transcriptVisible !== false ? "selected" : ""}>${isAm ? "በጎን አሳይ (Visible)" : "Show on side"}</option>
                    <option value="hide" ${this.prefs.transcriptVisible === false ? "selected" : ""}>${isAm ? "ደብቅ (Hidden)" : "Hide"}</option>
                  </select>
                </div>

                <!-- Audio Description Toggle -->
                <div class="form-row">
                  <label for="toggle-ad-enabled">${isAm ? "የድምጽ ማብራሪያ (AD):" : "Audio Description (AD):"}</label>
                  <select id="toggle-ad-enabled">
                    <option value="on" ${this.prefs.audioDescriptionEnabled ? "selected" : ""}>${isAm ? "አብራ (Enabled)" : "Enabled"}</option>
                    <option value="off" ${!this.prefs.audioDescriptionEnabled ? "selected" : ""}>${isAm ? "አጥፋ (Disabled)" : "Disabled"}</option>
                  </select>
                </div>
              </div>

              <div class="popover-footer">
                <button type="button" class="btn-popover-action btn-popover-reset" id="btn-reset-layout">
                  ↺ ${isAm ? "ዳግም አስጀምር" : "Reset Layout"}
                </button>
                <button type="button" class="btn-popover-action btn-popover-save" id="btn-close-prefs">
                  ${isAm ? "ተግብር እና ዝጋ" : "Done"}
                </button>
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
              <div class="header-controls" style="display: flex; align-items: center; gap: 4px;">
                <div class="dock-presets-group" role="group" aria-label="${isAm ? "የምልክት ቋንቋ መስኮት መትከያ" : "Sign window docking presets"}">
                  <button type="button" class="btn-dock-preset" id="btn-dock-tr" title="${isAm ? "ወደ ቀኝ ከላይ ይቆልፉ" : "Dock Top-Right"}" aria-label="${isAm ? "ወደ ቀኝ ከላይ ይቆልፉ" : "Dock Top-Right"}">⬈</button>
                  <button type="button" class="btn-dock-preset" id="btn-dock-br" title="${isAm ? "ወደ ቀኝ ከታች ይቆልፉ" : "Dock Bottom-Right"}" aria-label="${isAm ? "ወደ ቀኝ ከታች ይቆልፉ" : "Dock Bottom-Right"}">⬊</button>
                  <button type="button" class="btn-dock-preset" id="btn-dock-split" title="${isAm ? "ጎን ለጎን እይታ" : "Dock Side-by-Side"}" aria-label="${isAm ? "ጎን ለጎን እይታ" : "Dock Side-by-Side"}">◧</button>
                </div>
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

        <!-- Keyboard Shortcuts Modal Dialog -->
        <div class="dialog-backdrop" id="dialog-shortcuts" style="display: none;" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
          <div class="dialog-panel shortcuts-panel">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <h3 id="shortcuts-title" style="margin: 0; font-size: 1.15rem; font-weight: 600;">
                ⌨ ${isAm ? "የኪቦርድ አቋራጭ ቁልፎች" : "Keyboard Shortcuts Cheat-Sheet"}
              </h3>
              <button type="button" class="btn-close-modal" id="btn-close-shortcuts" aria-label="${isAm ? "ዝጋ" : "Close"}">✕</button>
            </div>
            <p style="margin: 0 0 1rem 0; font-size: 0.85rem; color: #64748B;">
              ${isAm ? "ይህ ማጫወቻ ሙሉ በሙሉ በኪቦርድ ብቻ የሚሰራ ሲሆን ለስክሪን አንባቢ ተጠቃሚዎች ምቹ ነው" : "Full accessible keyboard control optimized for screen reader users and power learners."}
            </p>
            <div class="shortcuts-grid">
              <div class="shortcut-item"><kbd>Space</kbd> / <kbd>K</kbd> <span>${isAm ? "አጫውት / አቁም" : "Play / Pause"}</span></div>
              <div class="shortcut-item"><kbd>J</kbd> <span>${isAm ? "5 ሰከንድ ወደኋላ መልስ" : "Seek back 5s"}</span></div>
              <div class="shortcut-item"><kbd>L</kbd> <span>${isAm ? "5 ሰከንድ ወደፊት ውሰድ" : "Seek forward 5s"}</span></div>
              <div class="shortcut-item"><kbd>M</kbd> <span>${isAm ? "ድምጽ አጥፋ / አብራ" : "Mute / Unmute"}</span></div>
              <div class="shortcut-item"><kbd>F</kbd> <span>${isAm ? "ሙሉ ማያ ገጽ" : "Toggle Fullscreen"}</span></div>
              <div class="shortcut-item"><kbd>C</kbd> <span>${isAm ? "የትርጉም ጽሑፍ (CC)" : "Toggle Captions"}</span></div>
              <div class="shortcut-item"><kbd>S</kbd> <span>${isAm ? "የምልክት ቋንቋ (EthSL)" : "Toggle Sign Language"}</span></div>
              <div class="shortcut-item"><kbd>T</kbd> <span>${isAm ? "የጽሑፍ ግልባጭ ማሳያ" : "Toggle Transcript"}</span></div>
              <div class="shortcut-item"><kbd>D</kbd> <span>${isAm ? "የድምፅ ማብራሪያ (AD)" : "Toggle Audio Description"}</span></div>
              <div class="shortcut-item"><kbd>&gt;</kbd> / <kbd>&lt;</kbd> <span>${isAm ? "ፍጥነት ጨምር / ቀንስ" : "Speed Faster / Slower"}</span></div>
              <div class="shortcut-item"><kbd>0</kbd> / <kbd>Home</kbd> <span>${isAm ? "ከመጀመሪያ ጀምር" : "Restart from beginning"}</span></div>
              <div class="shortcut-item"><kbd>?</kbd> <span>${isAm ? "ይህን መመሪያ አሳይ" : "Open this cheat-sheet"}</span></div>
              <div class="shortcut-item"><kbd>Esc</kbd> <span>${isAm ? "መስኮት ዝጋ" : "Close dialogs / Fullscreen"}</span></div>
            </div>
            <div style="display: flex; justify-content: flex-end; margin-top: 1.5rem;">
              <button type="button" class="btn-dialog-action btn-dialog-save" id="btn-ok-shortcuts">
                ${isAm ? "ገባኝ" : "Got it"}
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
    const liveChatTarget = this.shadow.getElementById("live-chat-target") as HTMLElement;
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

    if (liveChatTarget) {
      this.liveChatViewer = new LiveChatViewer(liveChatTarget, {
        locale: this.activeLocale,
        onSeekAndPlay: (time) => {
          this.seekAndPlay(time);
        },
      });
      if (this.liveChatMessages.length) {
        this.liveChatViewer.setMessages(this.liveChatMessages);
      }
    }
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

      // 1-Click Docking Presets for Top-Right, Bottom-Right, or Side-by-Side Split
      const dockPreset = (position: "tr" | "br" | "split") => {
        if (position === "split") {
          reDock();
          return;
        }
        if (!winEl.classList.contains("floating")) {
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
        const stageRect = stage.getBoundingClientRect();
        const winW = winEl.offsetWidth || 280;
        const winH = winEl.offsetHeight || 210;
        const margin = 16;
        const maxL = Math.max(0, stageRect.width - winW - margin);
        const maxT = Math.max(0, stageRect.height - winH - margin);

        if (position === "tr") {
          winEl.style.left = `${maxL}px`;
          winEl.style.top = `${margin}px`;
        } else if (position === "br") {
          winEl.style.left = `${maxL}px`;
          winEl.style.top = `${maxT}px`;
        }
      };

      // Store hooks on element for docking preset buttons and Reset Layout
      (winEl as any).__reDock = reDock;
      (winEl as any).__dockPreset = dockPreset;
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

      this.dispatchEvent(
        new CustomEvent("db-player:complete", {
          bubbles: true,
          composed: true,
          detail: {},
        })
      );
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

    // Fullscreen Toggle (Bi-directional enter & exit with robust fallback)
    const isFullscreen = () => {
      return Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (this.shadow as any).fullscreenElement ||
        playerContainer?.classList.contains("is-fullscreen") ||
        this.hasAttribute("data-fullscreen")
      );
    };

    const toggleFullscreen = async () => {
      try {
        if (!isFullscreen()) {
          if (playerContainer?.requestFullscreen) {
            await playerContainer.requestFullscreen();
          } else if ((playerContainer as any)?.webkitRequestFullscreen) {
            await (playerContainer as any).webkitRequestFullscreen();
          } else {
            // CSS Fullscreen fallback
            playerContainer?.classList.add("is-fullscreen");
            this.setAttribute("data-fullscreen", "true");
            updateFullscreenState();
          }
        } else {
          if (document.fullscreenElement || (document as any).webkitFullscreenElement || (this.shadow as any).fullscreenElement) {
            if (document.exitFullscreen) {
              await document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
              await (document as any).webkitExitFullscreen();
            }
          }
          playerContainer?.classList.remove("is-fullscreen");
          this.removeAttribute("data-fullscreen");
          updateFullscreenState();
        }
      } catch (err) {
        console.warn("Fullscreen native request fell back to CSS:", err);
        const wasFallback = playerContainer?.classList.contains("is-fullscreen");
        if (!wasFallback) {
          playerContainer?.classList.add("is-fullscreen");
          this.setAttribute("data-fullscreen", "true");
        } else {
          playerContainer?.classList.remove("is-fullscreen");
          this.removeAttribute("data-fullscreen");
        }
        updateFullscreenState();
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
      if (this.liveChatViewer) {
        this.liveChatViewer.updateTime(current);
      }

      this.dispatchEvent(
        new CustomEvent("db-player:progress", {
          bubbles: true,
          composed: true,
          detail: {
            seconds: Math.floor(current),
            percent: Math.round((current / duration) * 100),
          },
        })
      );
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

    // Accessibility Preferences & Quality Popovers Flyout (Smooth flow, zero dark scrim)
    const btnPrefs = this.shadow.getElementById("btn-prefs");
    const btnTranscriptPrefs = this.shadow.getElementById("btn-transcript-prefs");
    const btnEslPrefs = this.shadow.getElementById("btn-esl-prefs");
    const prefsDialog = this.shadow.getElementById("prefs-dialog");
    const btnClosePrefs = this.shadow.getElementById("btn-close-prefs");
    const btnDismissPrefs = this.shadow.getElementById("btn-dismiss-prefs");
    const btnResetLayout = this.shadow.getElementById("btn-reset-layout");

    const btnQuality = this.shadow.getElementById("btn-quality");
    const qualityMenu = this.shadow.getElementById("quality-menu");

    const closeQualityMenu = () => {
      if (!this.isQualityMenuOpen) return;
      this.isQualityMenuOpen = false;
      if (qualityMenu) qualityMenu.style.display = "none";
      btnQuality?.classList.remove("is-active");
      btnQuality?.setAttribute("aria-expanded", "false");
    };

    const openQualityMenu = () => {
      closePrefs();
      this.isQualityMenuOpen = true;
      if (qualityMenu) qualityMenu.style.display = "flex";
      btnQuality?.classList.add("is-active");
      btnQuality?.setAttribute("aria-expanded", "true");
      const activeItem = (this.shadow.querySelector(`.quality-menu-item[data-quality="${this.currentQuality}"]`) as HTMLElement)
        || (this.shadow.querySelector(".quality-menu-item") as HTMLElement);
      activeItem?.focus();
    };

    const toggleQualityMenu = () => {
      if (this.isQualityMenuOpen) {
        closeQualityMenu();
      } else {
        openQualityMenu();
      }
    };

    btnQuality?.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleQualityMenu();
    });

    const qualityBtns = this.shadow.querySelectorAll(".quality-menu-item");
    qualityBtns.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const q = btn.getAttribute("data-quality") as VideoQuality;
        if (q) {
          await this.applyQuality(q);
          closeQualityMenu();
          btnQuality?.focus();
        }
      });
    });

    const ccLangSelect = this.shadow.getElementById("select-cc-lang") as HTMLSelectElement | null;
    const ccSizeSelect = this.shadow.getElementById("select-cc-size") as HTMLSelectElement | null;
    const ccThemeSelect = this.shadow.getElementById("select-cc-theme") as HTMLSelectElement | null;
    const selectVideoQuality = this.shadow.getElementById("select-video-quality") as HTMLSelectElement | null;
    const toggleEslSelect = this.shadow.getElementById("toggle-esl-visibility") as HTMLSelectElement | null;
    const toggleTransSelect = this.shadow.getElementById("toggle-transcript-visibility") as HTMLSelectElement | null;
    const toggleAdSelect = this.shadow.getElementById("toggle-ad-enabled") as HTMLSelectElement | null;

    const closePrefs = () => {
      if (!this.isPreferencesOpen) return;
      this.isPreferencesOpen = false;
      if (prefsDialog) prefsDialog.style.display = "none";
      btnPrefs?.classList.remove("is-active");
      btnPrefs?.setAttribute("aria-expanded", "false");
      btnPrefs?.focus();
    };

    const openPrefs = () => {
      closeQualityMenu();
      this.isPreferencesOpen = true;

      if (selectVideoQuality) selectVideoQuality.value = this.currentQuality;
      if (ccLangSelect) ccLangSelect.value = this.prefs.captionLanguage;
      if (ccSizeSelect) ccSizeSelect.value = this.prefs.captionSize;
      if (ccThemeSelect) ccThemeSelect.value = this.prefs.captionTheme;
      if (toggleEslSelect) toggleEslSelect.value = this.prefs.eslVisible ? "show" : "hide";
      if (toggleTransSelect) toggleTransSelect.value = this.prefs.transcriptVisible !== false ? "show" : "hide";
      if (toggleAdSelect) toggleAdSelect.value = this.prefs.audioDescriptionEnabled ? "on" : "off";

      if (prefsDialog) prefsDialog.style.display = "flex";
      btnPrefs?.classList.add("is-active");
      btnPrefs?.setAttribute("aria-expanded", "true");
      ccLangSelect?.focus();
    };

    const togglePrefs = () => {
      if (this.isPreferencesOpen) {
        closePrefs();
      } else {
        openPrefs();
      }
    };

    btnPrefs?.addEventListener("click", togglePrefs);
    btnTranscriptPrefs?.addEventListener("click", openPrefs);
    btnEslPrefs?.addEventListener("click", openPrefs);
    btnDismissPrefs?.addEventListener("click", closePrefs);

    // Live Reactive Updates (Learners immediately see effects without dialog blocking)
    ccLangSelect?.addEventListener("change", async () => {
      if (ccLangSelect.value !== this.prefs.captionLanguage) {
        this.prefs.captionLanguage = ccLangSelect.value;
        savePreferences({ captionLanguage: this.prefs.captionLanguage });
        if (btnCC) {
          const isOff = this.prefs.captionLanguage === "off";
          btnCC.setAttribute("aria-pressed", isOff ? "false" : "true");
        }
        await this.loadCaptionTrack(this.prefs.captionLanguage);
      }
    });

    ccSizeSelect?.addEventListener("change", () => {
      if (ccSizeSelect.value !== this.prefs.captionSize) {
        this.prefs.captionSize = ccSizeSelect.value as CaptionSize;
        savePreferences({ captionSize: this.prefs.captionSize });
        this.updateCaptionDisplay();
      }
    });

    ccThemeSelect?.addEventListener("change", () => {
      if (ccThemeSelect.value !== this.prefs.captionTheme) {
        this.prefs.captionTheme = ccThemeSelect.value as CaptionTheme;
        savePreferences({ captionTheme: this.prefs.captionTheme });
        this.updateCaptionDisplay();
      }
    });

    toggleEslSelect?.addEventListener("change", () => {
      const hasSign = Boolean(this.signVideo || this.manifest?.sources.some((s) => s.kind === "sign"));
      const isVisible = toggleEslSelect.value === "show";
      this.prefs.eslVisible = isVisible;
      savePreferences({ eslVisible: isVisible });
      if (btnESL) btnESL.setAttribute("aria-pressed", isVisible ? "true" : "false");
      if (eslWindow) eslWindow.style.display = isVisible && hasSign ? "flex" : "none";
    });

    toggleTransSelect?.addEventListener("change", () => {
      const isVisible = toggleTransSelect.value === "show";
      this.prefs.transcriptVisible = isVisible;
      savePreferences({ transcriptVisible: isVisible });
      if (btnTranscript) btnTranscript.setAttribute("aria-pressed", isVisible ? "true" : "false");
      if (transcriptWindow) transcriptWindow.style.display = isVisible ? "flex" : "none";
    });

    toggleAdSelect?.addEventListener("change", () => {
      const isAd = toggleAdSelect.value === "on";
      this.prefs.audioDescriptionEnabled = isAd;
      savePreferences({ audioDescriptionEnabled: isAd });
      if (btnAD) btnAD.setAttribute("aria-pressed", isAd ? "true" : "false");
    });

    // Close button / "Done" saves any final state and closes smoothly
    btnClosePrefs?.addEventListener("click", async () => {
      if (ccLangSelect && ccLangSelect.value !== this.prefs.captionLanguage) {
        this.prefs.captionLanguage = ccLangSelect.value;
        savePreferences({ captionLanguage: this.prefs.captionLanguage });
        if (btnCC) {
          const isOff = this.prefs.captionLanguage === "off";
          btnCC.setAttribute("aria-pressed", isOff ? "false" : "true");
        }
        await this.loadCaptionTrack(this.prefs.captionLanguage);
      }
      if (ccSizeSelect && ccSizeSelect.value !== this.prefs.captionSize) {
        this.prefs.captionSize = ccSizeSelect.value as CaptionSize;
        savePreferences({ captionSize: this.prefs.captionSize });
        this.updateCaptionDisplay();
      }
      if (ccThemeSelect && ccThemeSelect.value !== this.prefs.captionTheme) {
        this.prefs.captionTheme = ccThemeSelect.value as CaptionTheme;
        savePreferences({ captionTheme: this.prefs.captionTheme });
        this.updateCaptionDisplay();
      }
      const hasSign = Boolean(this.signVideo || this.manifest?.sources.some((s) => s.kind === "sign"));
      if (toggleEslSelect) {
        const isVisible = toggleEslSelect.value === "show";
        this.prefs.eslVisible = isVisible;
        savePreferences({ eslVisible: isVisible });
        if (btnESL) btnESL.setAttribute("aria-pressed", isVisible ? "true" : "false");
        if (eslWindow) eslWindow.style.display = isVisible && hasSign ? "flex" : "none";
      }
      if (toggleTransSelect) {
        const isVisible = toggleTransSelect.value === "show";
        this.prefs.transcriptVisible = isVisible;
        savePreferences({ transcriptVisible: isVisible });
        if (btnTranscript) btnTranscript.setAttribute("aria-pressed", isVisible ? "true" : "false");
        if (transcriptWindow) transcriptWindow.style.display = isVisible ? "flex" : "none";
      }
      if (toggleAdSelect) {
        const isAd = toggleAdSelect.value === "on";
        this.prefs.audioDescriptionEnabled = isAd;
        savePreferences({ audioDescriptionEnabled: isAd });
        if (btnAD) btnAD.setAttribute("aria-pressed", isAd ? "true" : "false");
      }

      closePrefs();
    });

    // Dismiss Popovers When Clicking Outside
    const handleOutsideClick = (e: MouseEvent) => {
      const path = e.composedPath();
      if (this.isPreferencesOpen) {
        if (
          (prefsDialog && path.includes(prefsDialog)) ||
          (btnPrefs && path.includes(btnPrefs)) ||
          (btnTranscriptPrefs && path.includes(btnTranscriptPrefs)) ||
          (btnEslPrefs && path.includes(btnEslPrefs))
        ) {
          // Inside prefs
        } else {
          closePrefs();
        }
      }

      if (this.isQualityMenuOpen) {
        if (
          (qualityMenu && path.includes(qualityMenu)) ||
          (btnQuality && path.includes(btnQuality))
        ) {
          // Inside quality menu
        } else {
          closeQualityMenu();
        }
      }
    };
    window.addEventListener("pointerdown", handleOutsideClick);

    // Live Quality dropdown inside Preferences
    selectVideoQuality?.addEventListener("change", async () => {
      if (selectVideoQuality.value !== this.currentQuality) {
        await this.applyQuality(selectVideoQuality.value as VideoQuality);
      }
    });

    // Reset Layout Button (Restores side-by-side docked layout & default dimensions)
    btnResetLayout?.addEventListener("click", () => {
      resetPreferences();
      this.prefs = loadPreferences();

      // Reset select controls inside dialog
      const ccLangSelect = this.shadow.getElementById("select-cc-lang") as HTMLSelectElement | null;
      const ccSizeSelect = this.shadow.getElementById("select-cc-size") as HTMLSelectElement | null;
      const ccThemeSelect = this.shadow.getElementById("select-cc-theme") as HTMLSelectElement | null;
      const selectVideoQuality = this.shadow.getElementById("select-video-quality") as HTMLSelectElement | null;
      const toggleEslSelect = this.shadow.getElementById("toggle-esl-visibility") as HTMLSelectElement | null;
      const toggleTransSelect = this.shadow.getElementById("toggle-transcript-visibility") as HTMLSelectElement | null;
      const toggleAdSelect = this.shadow.getElementById("toggle-ad-enabled") as HTMLSelectElement | null;

      if (selectVideoQuality) selectVideoQuality.value = "auto";
      this.applyQuality("auto");

      if (ccLangSelect) ccLangSelect.value = this.prefs.captionLanguage;
      if (ccSizeSelect) ccSizeSelect.value = this.prefs.captionSize;
      if (ccThemeSelect) ccThemeSelect.value = this.prefs.captionTheme;
      if (toggleEslSelect) toggleEslSelect.value = "show";
      if (toggleTransSelect) toggleTransSelect.value = "show";
      if (toggleAdSelect) toggleAdSelect.value = "off";

      this.updateCaptionDisplay();
      this.loadCaptionTrack(this.prefs.captionLanguage);

      // Reset Transcript Window to Left Side
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

      // Reset Sign Language Window to Right Side
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
        eslWindow.style.display = Boolean(this.signVideo || this.manifest?.sources.some((s) => s.kind === "sign")) ? "flex" : "none";
      }

      if (btnESL) btnESL.setAttribute("aria-pressed", "true");
      if (btnTranscript) btnTranscript.setAttribute("aria-pressed", "true");
      if (btnAD) btnAD.setAttribute("aria-pressed", "false");
    });

    // Preference Form Live Inputs
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

    this.shadow.getElementById("toggle-esl-visibility")?.addEventListener("change", (e) => {
      const isVisible = (e.target as HTMLSelectElement).value === "show";
      const hasSign = Boolean(this.signVideo || this.manifest?.sources.some((s) => s.kind === "sign"));
      this.prefs.eslVisible = isVisible;
      savePreferences({ eslVisible: isVisible });
      if (btnESL) btnESL.setAttribute("aria-pressed", isVisible ? "true" : "false");
      if (eslWindow) eslWindow.style.display = isVisible && hasSign ? "flex" : "none";
    });

    this.shadow.getElementById("toggle-transcript-visibility")?.addEventListener("change", (e) => {
      const isVisible = (e.target as HTMLSelectElement).value === "show";
      this.prefs.transcriptVisible = isVisible;
      savePreferences({ transcriptVisible: isVisible });
      if (btnTranscript) btnTranscript.setAttribute("aria-pressed", isVisible ? "true" : "false");
      if (transcriptWindow) transcriptWindow.style.display = isVisible ? "flex" : "none";
    });

    this.shadow.getElementById("toggle-ad-enabled")?.addEventListener("change", (e) => {
      const isAd = (e.target as HTMLSelectElement).value === "on";
      this.prefs.audioDescriptionEnabled = isAd;
      savePreferences({ audioDescriptionEnabled: isAd });
      if (btnAD) btnAD.setAttribute("aria-pressed", isAd ? "true" : "false");
    });

    // Transcript Search
    const searchInput = this.shadow.getElementById("transcript-search") as HTMLInputElement;
    searchInput?.addEventListener("input", () => {
      this.transcriptViewer.setSearchQuery(searchInput.value);
    });

    // Live Chat Search
    const liveChatSearch = this.shadow.getElementById("live-chat-search") as HTMLInputElement;
    liveChatSearch?.addEventListener("input", () => {
      if (this.liveChatViewer) {
        this.liveChatViewer.setSearchQuery(liveChatSearch.value);
      }
    });

    // Left Panel Tabs (Transcript | Live Chat Replay)
    const tabTranscript = this.shadow.getElementById("tab-btn-transcript");
    const tabChat = this.shadow.getElementById("tab-btn-chat");
    const viewTranscript = this.shadow.getElementById("transcript-view-panel");
    const viewChat = this.shadow.getElementById("live-chat-view-panel");

    tabTranscript?.addEventListener("click", () => {
      this.activeLeftTab = "transcript";
      tabTranscript.classList.add("active");
      tabTranscript.setAttribute("aria-selected", "true");
      tabChat?.classList.remove("active");
      tabChat?.setAttribute("aria-selected", "false");
      if (viewTranscript) viewTranscript.style.display = "flex";
      if (viewChat) viewChat.style.display = "none";
    });

    tabChat?.addEventListener("click", () => {
      this.activeLeftTab = "chat";
      tabChat.classList.add("active");
      tabChat.setAttribute("aria-selected", "true");
      tabTranscript?.classList.remove("active");
      tabTranscript?.setAttribute("aria-selected", "false");
      if (viewTranscript) viewTranscript.style.display = "none";
      if (viewChat) viewChat.style.display = "flex";
      if (this.liveChatViewer) {
        this.liveChatViewer.updateTime(this.mainVideo.currentTime);
      }
    });

    // 1-Click Docking Presets for ESL Window
    const btnDockTr = this.shadow.getElementById("btn-dock-tr");
    const btnDockBr = this.shadow.getElementById("btn-dock-br");
    const btnDockSplit = this.shadow.getElementById("btn-dock-split");
    btnDockTr?.addEventListener("click", () => (eslWindow as any)?.__dockPreset?.("tr"));
    btnDockBr?.addEventListener("click", () => (eslWindow as any)?.__dockPreset?.("br"));
    btnDockSplit?.addEventListener("click", () => (eslWindow as any)?.__dockPreset?.("split"));

    // 1-Click BRF Embosser Export (.brf)
    const btnExportBrf = this.shadow.getElementById("btn-export-brf");
    btnExportBrf?.addEventListener("click", () => {
      const segments = this.transcriptViewer?.getSegments() || [];
      const title =
        (this.manifest?.title && (this.manifest.title[this.activeLocale] || this.manifest.title.en)) ||
        "Lesson Transcript";
      const brfContent = generateBRFDocument({
        title,
        language: this.activeLocale,
        segments:
          segments.length > 0
            ? segments
            : this.currentCues.map((c, i) => ({
                id: i,
                start: c.start,
                end: c.end,
                text: c.text,
                speaker: this.activeLocale === "am" ? "አስተማሪ" : "Instructor",
              })),
        date: "2026-11-14",
      });
      const blob = new Blob([brfContent], { type: "text/plain;charset=us-ascii" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lesson-transcript.${this.activeLocale}.brf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    // Recorded Live Chat Questions Only Filter
    let isQuestionsOnly = false;
    const btnChatFilter = this.shadow.getElementById("btn-chat-questions-filter");
    btnChatFilter?.addEventListener("click", () => {
      isQuestionsOnly = !isQuestionsOnly;
      btnChatFilter.setAttribute("aria-pressed", isQuestionsOnly ? "true" : "false");
      btnChatFilter.classList.toggle("active", isQuestionsOnly);
      if (this.liveChatViewer) {
        this.liveChatViewer.setQuestionsOnly(isQuestionsOnly);
      }
    });

    // Keyboard Shortcuts Cheat-Sheet Modal Dialog
    const dialogShortcuts = this.shadow.getElementById("dialog-shortcuts");
    const btnShortcuts = this.shadow.getElementById("btn-shortcuts");
    const btnCloseShortcuts = this.shadow.getElementById("btn-close-shortcuts");
    const btnOkShortcuts = this.shadow.getElementById("btn-ok-shortcuts");
    const toggleShortcutsModal = (show?: boolean) => {
      const open = show !== undefined ? show : dialogShortcuts?.style.display === "none";
      if (dialogShortcuts) dialogShortcuts.style.display = open ? "flex" : "none";
      if (open) btnCloseShortcuts?.focus();
      else btnShortcuts?.focus();
    };
    btnShortcuts?.addEventListener("click", () => toggleShortcutsModal(true));
    btnCloseShortcuts?.addEventListener("click", () => toggleShortcutsModal(false));
    btnOkShortcuts?.addEventListener("click", () => toggleShortcutsModal(false));

    // 1-Click Caption Preset Pills
    const presetBtns = this.shadow.querySelectorAll(".btn-preset-pill");
    presetBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const theme = btn.getAttribute("data-preset") as CaptionTheme;
        if (theme) {
          this.prefs.captionTheme = theme;
          const ccThemeSelect = this.shadow.getElementById("select-cc-theme") as HTMLSelectElement | null;
          if (ccThemeSelect) ccThemeSelect.value = theme;
          savePreferences({ captionTheme: theme });
          this.updateCaptionDisplay();
        }
      });
    });

    // Scoped Keyboard Hotkeys
    const playerRoot = this.shadow.getElementById("player-container");
    playerRoot?.addEventListener("keydown", (e) => {
      if (this.isQualityMenuOpen) {
        if (e.key === "Escape") {
          closeQualityMenu();
          btnQuality?.focus();
        }
        return;
      }
      if (this.isPreferencesOpen) {
        if (e.key === "Escape") {
          closePrefs();
        }
        return;
      }
      if (dialogShortcuts && dialogShortcuts.style.display === "flex") {
        if (e.key === "Escape") {
          toggleShortcutsModal(false);
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
        case "?":
        case "/":
          e.preventDefault();
          toggleShortcutsModal();
          break;
        case "Escape":
          if (isFullscreen()) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
      }
    });
  }

  private updateLocaleStrings() {
    this.render();
    this.initTracksAndTranscript();
    if (this.liveChatViewer) {
      this.liveChatViewer.setLocale(this.activeLocale);
      this.liveChatViewer.setMessages(this.liveChatMessages);
    }
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
if (!customElements.get("db-player")) {
  class DbPlayer extends A11yMediaPlayer {}
  customElements.define("db-player", DbPlayer);
}
