var Q = Object.defineProperty;
var X = (p, s, e) => s in p ? Q(p, s, { enumerable: !0, configurable: !0, writable: !0, value: e }) : p[s] = e;
var l = (p, s, e) => X(p, typeof s != "symbol" ? s + "" : s, e);
const U = "abugida_media_preferences", k = {
  captionLanguage: "en",
  captionSize: "medium",
  captionTheme: "default",
  audioDescriptionEnabled: !1,
  eslVisible: !0,
  eslPosition: "bottom-right",
  eslSize: "medium",
  playbackRate: 1,
  transcriptVisible: !0,
  transcriptWidth: 350,
  transcriptHeight: 460,
  eslWidth: 340,
  eslHeight: 240
};
function O() {
  try {
    const p = localStorage.getItem(U);
    if (!p) return { ...k };
    const s = JSON.parse(p);
    return { ...k, ...s };
  } catch {
    return { ...k };
  }
}
function V(p) {
  try {
    const e = { ...O(), ...p };
    return localStorage.setItem(U, JSON.stringify(e)), e;
  } catch {
    return { ...k, ...p };
  }
}
function G() {
  try {
    localStorage.removeItem(U);
  } catch {
  }
  return { ...k };
}
function Z(p) {
  const s = [], e = p.split(/\r?\n/);
  let i = 0;
  for (; i < e.length && !e[i].includes("-->"); )
    i++;
  for (; i < e.length; ) {
    const t = e[i].trim();
    if (t.includes("-->")) {
      const n = t.split("-->").map((r) => r.trim().split(" ")[0]);
      if (n.length >= 2) {
        const r = K(n[0]), u = K(n[1]);
        i++;
        const f = [];
        for (; i < e.length && e[i].trim() !== ""; )
          f.push(e[i].trim()), i++;
        f.length > 0 && s.push({
          start: r,
          end: u,
          text: f.join(`
`)
        });
      }
    }
    i++;
  }
  return s;
}
function K(p) {
  const s = p.split(":");
  let e = 0, i = 0, t = 0;
  return s.length === 3 ? (e = parseFloat(s[0]), i = parseFloat(s[1]), t = parseFloat(s[2].replace(",", "."))) : s.length === 2 && (i = parseFloat(s[0]), t = parseFloat(s[1].replace(",", "."))), e * 3600 + i * 60 + t;
}
function ee(p, s) {
  let e = "18px";
  s === "small" && (e = "14px"), s === "large" && (e = "24px"), s === "xlarge" && (e = "32px");
  let i = "#FFFFFF", t = "rgba(0, 0, 0, 0.85)", n = "none";
  return p === "yellow-black" ? (i = "#FFEB3B", t = "#000000", n = "2px solid #FFEB3B") : p === "white-black" ? (i = "#FFFFFF", t = "#000000", n = "2px solid #FFFFFF") : p === "black-yellow" && (i = "#000000", t = "#FFEB3B", n = "2px solid #000000"), `
    font-size: ${e};
    color: ${i};
    background: ${t};
    border: ${n};
    line-height: 1.4;
    padding: 0.35rem 0.75rem;
    border-radius: 4px;
    max-width: 90%;
    margin: 0 auto;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    white-space: pre-line;
  `;
}
class te {
  constructor(s, e) {
    l(this, "mainVideo");
    l(this, "signVideo", null);
    l(this, "driftThreshold");
    l(this, "isSyncing", !1);
    l(this, "onSignStatusChange");
    // Stored listener references for clean teardown
    l(this, "mainListeners", {});
    l(this, "signListeners", {});
    this.mainVideo = s, this.driftThreshold = (e == null ? void 0 : e.driftThreshold) ?? 0.25, this.onSignStatusChange = e == null ? void 0 : e.onSignStatusChange, this.setupMainListeners();
  }
  setSignVideo(s) {
    if (this.cleanupSignListeners(), this.signVideo = s, this.signVideo) {
      if (this.signVideo.muted = !0, this.signVideo.playsInline = !0, this.signVideo.playbackRate = this.mainVideo.playbackRate, !isNaN(this.mainVideo.currentTime) && this.mainVideo.currentTime > 0)
        try {
          this.signVideo.currentTime = this.mainVideo.currentTime;
        } catch {
        }
      this.setupSignListeners(), this.notifyStatus(this.signVideo.readyState >= 2 ? "ready" : "loading");
    } else
      this.notifyStatus("none");
  }
  notifyStatus(s) {
    this.onSignStatusChange && this.onSignStatusChange(s);
  }
  setupMainListeners() {
    this.mainListeners.play = () => {
      this.signVideo && this.signVideo.paused && !this.mainVideo.paused && this.signVideo.play().catch(() => {
      });
    }, this.mainListeners.pause = () => {
      this.signVideo && !this.signVideo.paused && this.signVideo.pause();
    }, this.mainListeners.seeking = () => {
      this.signVideo && !isNaN(this.mainVideo.currentTime) && (this.signVideo.currentTime = this.mainVideo.currentTime);
    }, this.mainListeners.seeked = () => {
      this.signVideo && !isNaN(this.mainVideo.currentTime) && (this.signVideo.currentTime = this.mainVideo.currentTime, this.mainVideo.paused && !this.signVideo.paused && this.signVideo.pause());
    }, this.mainListeners.ratechange = () => {
      this.signVideo && (this.signVideo.playbackRate = this.mainVideo.playbackRate);
    }, this.mainListeners.timeupdate = () => {
      this.checkDrift();
    }, this.mainListeners.ended = () => {
      this.signVideo && !this.signVideo.paused && this.signVideo.pause();
    };
    for (const [s, e] of Object.entries(this.mainListeners))
      this.mainVideo.addEventListener(s, e);
  }
  setupSignListeners() {
    if (this.signVideo) {
      this.signListeners.waiting = () => {
        this.notifyStatus("loading");
      }, this.signListeners.canplay = () => {
        this.notifyStatus("ready"), !this.mainVideo.paused && this.signVideo && this.signVideo.paused && this.signVideo.play().catch(() => {
        });
      }, this.signListeners.playing = () => {
        this.notifyStatus("ready"), this.mainVideo.paused && this.signVideo && !this.signVideo.paused && this.signVideo.pause();
      }, this.signListeners.error = () => {
        console.warn("Secondary EthSL sign language video stream encountered an error."), this.notifyStatus("error");
      };
      for (const [s, e] of Object.entries(this.signListeners))
        this.signVideo.addEventListener(s, e);
    }
  }
  checkDrift() {
    if (!this.signVideo || this.isSyncing || this.signVideo.readyState < 2) return;
    if (Math.abs(this.mainVideo.currentTime - this.signVideo.currentTime) > this.driftThreshold) {
      this.isSyncing = !0;
      try {
        this.signVideo.currentTime = this.mainVideo.currentTime;
      } catch {
      }
      setTimeout(() => {
        this.isSyncing = !1;
      }, 50);
    }
  }
  /**
   * Switches media source (e.g. standard video <-> audio described video)
   * while preserving timestamp, playback rate, and play/pause state.
   */
  async switchSource(s) {
    const e = !this.mainVideo.paused, i = this.mainVideo.currentTime, t = this.mainVideo.playbackRate;
    return this.mainVideo.src = s, this.mainVideo.load(), new Promise((n) => {
      const r = async () => {
        if (this.mainVideo.removeEventListener("loadedmetadata", r), this.mainVideo.currentTime = i, this.mainVideo.playbackRate = t, e)
          try {
            await this.mainVideo.play();
          } catch {
          }
        if (this.signVideo) {
          try {
            this.signVideo.currentTime = i;
          } catch {
          }
          e ? this.signVideo.play().catch(() => {
          }) : this.signVideo.pause();
        }
        n();
      };
      this.mainVideo.addEventListener("loadedmetadata", r);
    });
  }
  cleanupSignListeners() {
    if (this.signVideo)
      for (const [s, e] of Object.entries(this.signListeners))
        this.signVideo.removeEventListener(s, e);
    this.signListeners = {};
  }
  destroy() {
    for (const [s, e] of Object.entries(this.mainListeners))
      this.mainVideo.removeEventListener(s, e);
    this.mainListeners = {}, this.cleanupSignListeners(), this.signVideo = null;
  }
}
class ie {
  constructor(s, e) {
    l(this, "segments", []);
    l(this, "container");
    l(this, "onSeekAndPlay");
    l(this, "onFollowChange");
    l(this, "currentActiveId", null);
    l(this, "searchQuery", "");
    l(this, "isFollowing", !0);
    l(this, "userPausedFollowing", !1);
    l(this, "locale", "en");
    l(this, "listElement", null);
    l(this, "followBtn", null);
    l(this, "statusElement", null);
    this.container = s, this.onSeekAndPlay = e.onSeekAndPlay, this.onFollowChange = e.onFollowChange, this.locale = e.locale || "en";
  }
  setLocale(s) {
    this.locale !== s && (this.locale = s, this.render());
  }
  setSegments(s) {
    this.segments = s.map((e) => ({
      ...e,
      start: Number(e.start) || 0,
      end: Number(e.end) || 0
    })).sort((e, i) => e.start - i.start), this.render();
  }
  setSearchQuery(s) {
    this.searchQuery = s.toLowerCase().trim(), this.render();
  }
  getActiveSegment(s) {
    return this.segments.length && this.segments.find((e) => s >= e.start && s < e.end) || null;
  }
  updateActiveTime(s) {
    const e = this.getActiveSegment(s), i = e ? e.id : null;
    i !== this.currentActiveId && (this.currentActiveId = i, this.highlightSegment(i), this.isFollowing && i !== null && this.scrollToActiveCue(i));
  }
  highlightSegment(s) {
    if (!this.container) return;
    const e = this.container.querySelector(".transcript-item.active");
    if (e && e.classList.remove("active"), s !== null) {
      const i = this.container.querySelector(`[data-segment-id="${s}"]`);
      i && i.classList.add("active");
    }
  }
  scrollToActiveCue(s) {
    if (!this.listElement) return;
    const e = this.listElement.querySelector(`[data-segment-id="${s}"]`);
    if (!e) return;
    this.listElement.scrollTop;
    const i = this.listElement.clientHeight, t = e.offsetTop, n = e.clientHeight, r = t - i / 2 + n / 2;
    this.listElement.scrollTo({
      top: Math.max(0, r),
      behavior: "smooth"
    });
  }
  setFollowing(s) {
    this.setFollowingState(s, !0);
  }
  setFollowingState(s, e = !1) {
    var i;
    if (this.isFollowing = s, e && (this.userPausedFollowing = !s), (i = this.onFollowChange) == null || i.call(this, s), this.followBtn) {
      this.followBtn.setAttribute("aria-pressed", s ? "true" : "false");
      const t = this.locale === "am";
      s ? (this.followBtn.textContent = t ? "✓ በተከታታይ አንብብ" : "✓ Follow Playback", this.followBtn.setAttribute(
        "aria-label",
        t ? "የጽሑፍ ግልባጭ ተከታትሎ ማንበብ በርቷል" : "Follow playback active (Click to pause auto-scroll)"
      )) : (this.followBtn.textContent = t ? "↻ ተከታትሎ ማንበብ ቀጥል" : "↻ Resume Following", this.followBtn.setAttribute(
        "aria-label",
        t ? "ተከታትሎ ማንበብ ቆሟል፤ እንደገና ለማስጀመር ይጫኑ" : "Following paused (Click to resume auto-scroll)"
      ));
    }
    s && this.currentActiveId !== null && this.scrollToActiveCue(this.currentActiveId);
  }
  formatTime(s) {
    const e = Math.floor(s / 60), i = Math.floor(s % 60);
    return `${e.toString().padStart(2, "0")}:${i.toString().padStart(2, "0")}`;
  }
  render() {
    var i;
    const s = this.locale === "am", e = this.searchQuery ? this.segments.filter(
      (t) => t.text.toLowerCase().includes(this.searchQuery) || t.speaker && t.speaker.toLowerCase().includes(this.searchQuery) || t.visualDescription && t.visualDescription.toLowerCase().includes(this.searchQuery)
    ) : this.segments;
    if (this.container.innerHTML = `
      <div class="transcript-controls-row">
        <button 
          type="button" 
          id="btn-toggle-follow" 
          class="btn-follow ${this.isFollowing ? "active" : ""}" 
          aria-pressed="${this.isFollowing ? "true" : "false"}"
          aria-label="${this.isFollowing ? s ? "የጽሑፍ ግልባጭ ተከታትሎ ማንበብ በርቷል" : "Follow playback active (Click to pause auto-scroll)" : s ? "ተከታትሎ ማንበብ ቆሟል፤ እንደገና ለማስጀመር ይጫኑ" : "Following paused (Click to resume auto-scroll)"}">
          ${this.isFollowing ? s ? "✓ በተከታታይ አንብብ" : "✓ Follow Playback" : s ? "↻ ተከታትሎ ማንበብ ቀጥል" : "↻ Resume Following"}
        </button>
      </div>

      ${e.length === 0 ? `<p class="empty-msg" role="status">
              ${s ? "ምንም የሚዛመድ የጽሑፍ ግልባጭ አልተገኘም።" : "No transcript segments match your search."}
            </p>` : `
          <ul class="transcript-list" role="list" id="transcript-list-box" tabindex="0" aria-label="${s ? "የጽሑፍ ግልባጭ ዝርዝር" : "Transcript cues"}">
            ${e.map((t) => {
      const n = this.formatTime(t.start), r = t.id === this.currentActiveId, u = s ? `ከ ${n} ጀምሮ አጫውት` : `Play from ${n}`;
      return `
                <li class="transcript-item ${r ? "active" : ""}" data-segment-id="${t.id}">
                  <button 
                    type="button" 
                    class="btn-seek-time" 
                    data-time="${t.start}" 
                    aria-label="${u}">
                    ${n}
                  </button>
                  <div class="segment-content">
                    ${t.speaker ? `<strong class="speaker-label">${this.escapeHtml(t.speaker)}:</strong>` : ""}
                    <span class="segment-text">${this.escapeHtml(t.text)}</span>
                    ${t.visualDescription ? `<div class="visual-desc" aria-label="${s ? "ምስላዊ ማብራሪያ" : "Visual Description"}: ${this.escapeHtml(t.visualDescription)}">
                            <em>[${s ? "ምስላዊ" : "Visual"}: ${this.escapeHtml(t.visualDescription)}]</em>
                           </div>` : ""}
                  </div>
                </li>
              `;
    }).join("")}
          </ul>
        `}
    `, this.listElement = this.container.querySelector("#transcript-list-box"), this.followBtn = this.container.querySelector("#btn-toggle-follow"), (i = this.followBtn) == null || i.addEventListener("click", () => {
      this.setFollowingState(!this.isFollowing, !0);
    }), this.listElement) {
      const t = () => {
        this.isFollowing && this.setFollowingState(!1, !0);
      };
      this.listElement.addEventListener("wheel", t, { passive: !0 }), this.listElement.addEventListener("touchmove", t, { passive: !0 }), this.listElement.addEventListener("keydown", (n) => {
        ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(n.key) && t();
      });
    }
    this.container.querySelectorAll(".btn-seek-time").forEach((t) => {
      t.addEventListener("click", (n) => {
        const r = parseFloat(n.currentTarget.dataset.time || "0");
        this.onSeekAndPlay(r), n.currentTarget.focus();
      });
    });
  }
  escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
}
class se extends HTMLElement {
  constructor() {
    super();
    l(this, "shadow");
    l(this, "manifest", null);
    l(this, "activeLocale", "en");
    l(this, "prefs");
    // Media & sync
    l(this, "mainVideo");
    l(this, "signVideo", null);
    l(this, "syncController");
    l(this, "pendingSeekTime", null);
    // Captions
    l(this, "currentCues", []);
    l(this, "captionOverlay");
    // Transcript
    l(this, "transcriptViewer");
    // UI state
    l(this, "isPreferencesOpen", !1);
    this.shadow = this.attachShadow({ mode: "open" }), this.prefs = O();
  }
  static get observedAttributes() {
    return ["manifest-src", "locale"];
  }
  connectedCallback() {
    this.activeLocale = this.getAttribute("locale") || "en";
    const e = this.getAttribute("manifest-src");
    e && this.loadManifest(e);
  }
  disconnectedCallback() {
    this.syncController && this.syncController.destroy();
  }
  attributeChangedCallback(e, i, t) {
    i !== t && (e === "locale" ? (this.activeLocale = t || "en", this.updateLocaleStrings()) : e === "manifest-src" && this.loadManifest(t));
  }
  async loadManifest(e) {
    try {
      const i = await fetch(e);
      if (!i.ok) throw new Error(`HTTP error ${i.status}`);
      const t = await i.json();
      let n;
      try {
        n = new URL(e, window.location.href);
      } catch {
        n = new URL(window.location.href);
      }
      const r = (u) => {
        if (!u) return u;
        try {
          return new URL(u, n).href;
        } catch {
          return u;
        }
      };
      this.manifest = {
        ...t,
        poster: t.poster ? { ...t.poster, src: r(t.poster.src) } : void 0,
        sources: (t.sources || []).map((u) => ({
          ...u,
          src: r(u.src)
        })),
        captionTracks: (t.captionTracks || []).map((u) => ({
          ...u,
          src: r(u.src)
        })),
        transcript: t.transcript ? {
          ...t.transcript,
          src: r(t.transcript.src)
        } : t.transcript
      }, this.render(), await this.initTracksAndTranscript();
    } catch (i) {
      this.renderError(i instanceof Error ? i.message : "Failed to load manifest");
    }
  }
  async initTracksAndTranscript() {
    var e;
    if (this.manifest && (await this.loadCaptionTrack(this.prefs.captionLanguage), (e = this.manifest.transcript) != null && e.src))
      try {
        const i = await fetch(this.manifest.transcript.src);
        if (i.ok) {
          const n = ((await i.json()).segments || []).map((r) => ({
            id: r.id,
            start: r.start_ms !== void 0 ? r.start_ms / 1e3 : r.start || 0,
            end: r.end_ms !== void 0 ? r.end_ms / 1e3 : r.end || 0,
            speaker: r.speaker,
            text: r.text || r.draft_text || "",
            visualDescription: r.visual_description || r.visualDescription
          }));
          this.transcriptViewer.setSegments(n);
        }
      } catch (i) {
        console.warn("Could not load external transcript file, using fallback cues", i);
      }
  }
  async loadCaptionTrack(e) {
    if (!this.manifest || e === "off") {
      this.currentCues = [], this.updateCaptionDisplay();
      return;
    }
    const i = this.manifest.captionTracks.find((t) => t.language === e);
    if (!i) {
      this.currentCues = [], this.updateCaptionDisplay();
      return;
    }
    try {
      const t = await fetch(i.src);
      if (t.ok) {
        const n = await t.text();
        this.currentCues = Z(n);
      }
    } catch {
      this.currentCues = [];
    }
    this.updateCaptionDisplay();
  }
  updateCaptionDisplay() {
    if (!this.captionOverlay || !this.mainVideo) return;
    if (this.prefs.captionLanguage === "off" || this.currentCues.length === 0) {
      this.captionOverlay.style.display = "none";
      return;
    }
    const e = this.mainVideo.currentTime, i = this.currentCues.find((t) => e >= t.start && e <= t.end);
    i ? (this.captionOverlay.style.display = "block", this.captionOverlay.style.cssText = ee(this.prefs.captionTheme, this.prefs.captionSize), this.captionOverlay.textContent = i.text) : this.captionOverlay.style.display = "none";
  }
  seekAndPlay(e) {
    if (isNaN(this.mainVideo.duration) || this.mainVideo.readyState < 1) {
      this.pendingSeekTime = e;
      const i = () => {
        this.mainVideo.removeEventListener("loadedmetadata", i), this.mainVideo.currentTime = e, this.mainVideo.play().catch(() => {
        }), this.pendingSeekTime = null;
      };
      this.mainVideo.addEventListener("loadedmetadata", i);
      return;
    }
    this.mainVideo.currentTime = e, this.mainVideo.play().catch((i) => {
      console.warn("Playback interrupted or prevented on seek:", i);
    });
  }
  renderError(e) {
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
        <strong>Error:</strong> ${e}
      </div>
    `;
  }
  render() {
    var g, a, y, m;
    const e = this.activeLocale === "am", i = this.manifest ? this.manifest.title[this.activeLocale] : "Media Player", t = (g = this.manifest) == null ? void 0 : g.sources.find((E) => E.kind === "main"), n = (a = this.manifest) == null ? void 0 : a.sources.find((E) => E.kind === "sign"), r = this.prefs.transcriptWidth || k.transcriptWidth || 350, u = this.prefs.transcriptHeight || k.transcriptHeight || 480, f = this.prefs.eslWidth || k.eslWidth || 340, b = this.prefs.eslHeight || k.eslHeight || 250;
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

      <section class="player-component" aria-label="${i}">
        <div class="player-stage" id="player-stage">

          <!-- LEFT: Movable & Resizable Transcript Window (Outside of video frame) -->
          <div 
            class="window-panel transcript-window" 
            id="transcript-window"
            style="width: ${r}px; height: ${u}px; flex: 0 0 ${r}px; display: ${this.prefs.transcriptVisible !== !1 ? "flex" : "none"};"
            aria-label="${e ? "የትምህርቱ የጽሑፍ ግልባጭ መስኮት" : "Lesson Transcript Window"}">
            
            <!-- Transcript Titlebar -->
            <div class="window-header" id="transcript-header">
              <button 
                type="button" 
                class="btn-window-opt" 
                id="btn-transcript-prefs" 
                aria-label="${e ? "የመስኮት አማራጮች" : "Window options"}" 
                title="${e ? "የመስኮት አማራጮች" : "Window options"}">
                ⚙
              </button>
              <div 
                class="window-drag-handle" 
                id="transcript-drag-handle" 
                tabindex="0" 
                role="button" 
                aria-label="${e ? "የጽሑፍ ግልባጭ መስኮት መጎተቻ" : "Transcript window drag handle"}"
                title="${e ? "ለመጎተት ይጫኑ፤ ወደቦታው ለመመለስ ሁለት ጊዜ ይጫኑ" : "Drag to move; double-click to re-dock"}">
                <span aria-hidden="true">═</span>
              </div>
              <div class="header-controls">
                <label class="auto-scroll-label" for="cb-auto-scroll">
                  <input type="checkbox" id="cb-auto-scroll" checked>
                  <span>${e ? "ራስ-አንብብ" : "Auto scroll"}</span>
                </label>
                <label for="select-transcript-lang" class="sr-only">${e ? "ቋንቋ" : "Language"}</label>
                <select id="select-transcript-lang" class="header-select" aria-label="${e ? "የጽሑፍ ግልባጭ ቋንቋ" : "Transcript Language"}">
                  <option value="en" ${this.activeLocale === "en" ? "selected" : ""}>English</option>
                  <option value="am" ${this.activeLocale === "am" ? "selected" : ""}>አማርኛ</option>
                </select>
              </div>
            </div>

            <!-- Transcript Body Content -->
            <div class="transcript-body" id="transcript-body">
              <div class="transcript-title-row">
                <h3 class="transcript-title">${e ? "የትምህርቱ የጽሑፍ ግልባጭ" : "Transcript"}</h3>
                <input 
                  type="search" 
                  id="transcript-search" 
                  class="search-box" 
                  placeholder="${e ? "በጽሑፉ ውስጥ ይፈልጉ..." : "Search transcript..."}" 
                  aria-label="${e ? "በጽሑፉ ውስጥ ይፈልጉ" : "Search transcript"}">
              </div>
              <div id="transcript-target" class="transcript-scroll-area"></div>
            </div>

            <!-- Resizing Handles (Corner 2D, Bottom Edge, Right Edge) -->
            <div 
              class="window-resize-handle" 
              id="transcript-resize-handle" 
              tabindex="0"
              role="separator" 
              aria-label="${e ? "የጽሑፍ ግልባጭ መስኮት ማስተካከያ (በቀስት ቁልፎች መጠን ይቀይሩ)" : "Resize transcript window (Use arrow keys or drag)"}" 
              title="${e ? "መጠኑን ለመቀየር ይጎትቱ ወይም የቀስት ቁልፎችን ይጠቀሙ" : "Drag to resize (or use Arrow keys)"}">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <path d="M13 1L1 13M13 6L6 13M13 11L11 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="window-resize-edge-bottom" id="transcript-resize-edge-bottom" aria-hidden="true" title="${e ? "ቁመቱን ለመቀየር ይጎትቱ" : "Drag to resize height"}"></div>
            <div class="window-resize-edge-right" id="transcript-resize-edge-right" aria-hidden="true" title="${e ? "ስፋቱን ለመቀየር ይጎትቱ" : "Drag to resize width"}"></div>
          </div>

          <!-- CENTER: Main Video Player & Controls -->
          <div class="main-player-panel" id="player-container" tabindex="0" aria-label="${i} (Press ? for keyboard shortcuts)">
            <div class="video-viewport">
              <video 
                id="main-video" 
                class="main-video" 
                playsinline 
                preload="metadata"
                poster="${((m = (y = this.manifest) == null ? void 0 : y.poster) == null ? void 0 : m.src) || ""}"
                src="${t ? t.src : ""}">
              </video>

              <!-- Captions Overlay -->
              <div class="captions-container" aria-hidden="true">
                <div class="captions-text" id="caption-overlay" style="display: none;"></div>
              </div>
            </div>

            <!-- Controls Toolbar -->
            <div class="controls-toolbar" role="toolbar" aria-label="${e ? "የቪዲዮ መቆጣጠሪያዎች" : "Video player controls"}">
              <div class="scrubber-container">
                <label for="seek-scrubber" class="sr-only">${e ? "የቪዲዮ መገኛ አሞሌ" : "Seek video position"}</label>
                <input 
                  type="range" 
                  id="seek-scrubber" 
                  class="scrubber" 
                  min="0" 
                  max="100" 
                  value="0" 
                  aria-label="${e ? "የቪዲዮ መገኛ አሞሌ" : "Video timeline position"}">
                <span class="time-readout" id="time-display">00:00 / 00:00</span>
              </div>

              <button class="btn-ctrl" id="btn-play" aria-label="${e ? "አጫውት (Space / K)" : "Play (Space / K)"}">
                <span id="play-icon" aria-hidden="true">▶</span>
                <span id="play-text">${e ? "አጫውት" : "Play"}</span>
              </button>

              <button class="btn-ctrl" id="btn-rewind" aria-label="${e ? "ወደኋላ 5 ሰከንድ (J)" : "Rewind 5 seconds (J)"}">
                ↺ 5s
              </button>

              <button class="btn-ctrl" id="btn-forward" aria-label="${e ? "ወደፊት 5 ሰከንድ (L)" : "Forward 5 seconds (L)"}">
                ↻ 5s
              </button>

              <button class="btn-ctrl" id="btn-ad" aria-pressed="${this.prefs.audioDescriptionEnabled ? "true" : "false"}" aria-label="${e ? "የድምጽ ማብራሪያ (D)" : "Audio Description (D)"}">
                AD
              </button>

              <button class="btn-ctrl" id="btn-cc" aria-expanded="false" aria-label="${e ? "የትርጉም ጽሑፍ (C)" : "Captions (C)"}">
                CC (${this.prefs.captionLanguage.toUpperCase()})
              </button>

              <button class="btn-ctrl" id="btn-esl" aria-pressed="${this.prefs.eslVisible ? "true" : "false"}" aria-label="${e ? "የኢትዮጵያ የምልክት ቋንቋ (S)" : "Ethiopian Sign Language (S)"}">
                EthSL
              </button>

              <button class="btn-ctrl" id="btn-transcript-toggle" aria-pressed="${this.prefs.transcriptVisible !== !1 ? "true" : "false"}" aria-label="${e ? "የጽሑፍ ግልባጭ ማሳያ" : "Toggle Transcript"}">
                📄 ${e ? "ግልባጭ" : "Transcript"}
              </button>

              <button class="btn-ctrl" id="btn-prefs" aria-expanded="false" aria-label="${e ? "የተደራሽነት ምርጫዎች" : "Accessibility Preferences"}">
                ⚙ ${e ? "ምርጫዎች" : "Settings"}
              </button>
            </div>
          </div>

          <!-- RIGHT: Movable & Resizable Sign Language Window (Outside of video frame) -->
          <div 
            class="window-panel esl-window" 
            id="esl-window" 
            style="width: ${f}px; height: ${b}px; flex: 0 0 ${f}px; display: ${this.prefs.eslVisible && n ? "flex" : "none"};"
            aria-label="${e ? "የኢትዮጵያ የምልክት ቋንቋ መስኮት" : "Ethiopian Sign Language Window"}">
            
            <!-- Sign Titlebar -->
            <div class="window-header" id="esl-header">
              <button 
                type="button" 
                class="btn-window-opt" 
                id="btn-esl-prefs" 
                aria-label="${e ? "የመስኮት አማራጮች" : "Window options"}" 
                title="${e ? "የመስኮት አማራጮች" : "Window options"}">
                ⚙
              </button>
              <div 
                class="window-drag-handle" 
                id="esl-drag-handle" 
                tabindex="0" 
                role="button" 
                aria-label="${e ? "የምልክት ቋንቋ መስኮት መጎተቻ" : "Sign language window drag handle"}"
                title="${e ? "ለመጎተት ይጫኑ፤ ወደቦታው ለመመለስ ሁለት ጊዜ ይጫኑ" : "Drag to move; double-click to re-dock"}">
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
                src="${n ? n.src : ""}">
              </video>
            </div>

            <!-- Resizing Handles (Corner 2D, Bottom Edge, Right Edge, Left Edge) -->
            <div 
              class="window-resize-handle" 
              id="esl-resize-handle" 
              tabindex="0"
              role="separator" 
              aria-label="${e ? "የምልክት ቋንቋ መስኮት ማስተካከያ (በቀስት ቁልፎች መጠን ይቀይሩ)" : "Resize sign language window (Use arrow keys or drag)"}" 
              title="${e ? "መጠኑን ለመቀየር ይጎትቱ ወይም የቀስት ቁልፎችን ይጠቀሙ" : "Drag to resize (or use Arrow keys)"}">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <path d="M13 1L1 13M13 6L6 13M13 11L11 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="window-resize-edge-bottom" id="esl-resize-edge-bottom" aria-hidden="true" title="${e ? "ቁመቱን ለመቀየር ይጎትቱ" : "Drag to resize height"}"></div>
            <div class="window-resize-edge-right" id="esl-resize-edge-right" aria-hidden="true" title="${e ? "ስፋቱን ለመቀየር ይጎትቱ" : "Drag to resize width"}"></div>
            <div class="window-resize-edge-left" id="esl-resize-edge-left" aria-hidden="true" title="${e ? "ስፋቱን ለመቀየር ይጎትቱ" : "Drag to resize width"}"></div>
          </div>

        </div>

        <!-- Preferences Modal Dialog -->
        <div class="dialog-backdrop" id="prefs-dialog" style="display: none;" role="dialog" aria-modal="true" aria-labelledby="prefs-title">
          <div class="dialog-panel">
            <h3 id="prefs-title">${e ? "የተደራሽነት ምርጫዎች" : "Accessibility & Layout Settings"}</h3>
            
            <div class="form-row">
              <label for="select-cc-lang">${e ? "የትርጉም ጽሑፍ ቋንቋ:" : "Caption Language:"}</label>
              <select id="select-cc-lang">
                <option value="en" ${this.prefs.captionLanguage === "en" ? "selected" : ""}>English (Reviewed)</option>
                <option value="am" ${this.prefs.captionLanguage === "am" ? "selected" : ""}>አማርኛ (የተገመገመ)</option>
                <option value="off" ${this.prefs.captionLanguage === "off" ? "selected" : ""}>Off</option>
              </select>
            </div>

            <div class="form-row">
              <label for="select-cc-size">${e ? "የትርጉም ጽሑፍ መጠን:" : "Caption Font Size:"}</label>
              <select id="select-cc-size">
                <option value="small" ${this.prefs.captionSize === "small" ? "selected" : ""}>Small (14px)</option>
                <option value="medium" ${this.prefs.captionSize === "medium" ? "selected" : ""}>Medium (18px - Standard)</option>
                <option value="large" ${this.prefs.captionSize === "large" ? "selected" : ""}>Large (24px)</option>
                <option value="xlarge" ${this.prefs.captionSize === "xlarge" ? "selected" : ""}>Extra Large (32px)</option>
              </select>
            </div>

            <div class="form-row">
              <label for="select-cc-theme">${e ? "የንፅፅር ገጽታ:" : "Contrast Theme:"}</label>
              <select id="select-cc-theme">
                <option value="default" ${this.prefs.captionTheme === "default" ? "selected" : ""}>White on Translucent Black</option>
                <option value="yellow-black" ${this.prefs.captionTheme === "yellow-black" ? "selected" : ""}>High Contrast (Yellow on Black)</option>
                <option value="white-black" ${this.prefs.captionTheme === "white-black" ? "selected" : ""}>High Contrast (White on Black)</option>
                <option value="black-yellow" ${this.prefs.captionTheme === "black-yellow" ? "selected" : ""}>High Contrast (Black on Yellow)</option>
              </select>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
              <button type="button" class="btn-ctrl" id="btn-reset-layout" style="background: #475569;">
                ↺ ${e ? "አቀማመጥን ዳግም አስጀምር" : "Reset Layout"}
              </button>
              <button type="button" class="btn-ctrl" id="btn-close-prefs" style="background: var(--color-brand, #0B5D4E);">
                ${e ? "ተግብር እና ዝጋ" : "Save & Close"}
              </button>
            </div>
          </div>
        </div>
      </section>
    `, this.bindDOMElements(), this.attachEventListeners(), this.setupWindowInteractions();
  }
  bindDOMElements() {
    this.mainVideo = this.shadow.getElementById("main-video"), this.signVideo = this.shadow.getElementById("sign-video"), this.captionOverlay = this.shadow.getElementById("caption-overlay"), this.syncController = new te(this.mainVideo, {
      driftThreshold: 0.25,
      onSignStatusChange: (t) => {
        const n = this.shadow.getElementById("sign-status-indicator");
        n && (t === "loading" ? (n.style.display = "inline-block", n.textContent = this.activeLocale === "am" ? "በመጫን ላይ..." : "Loading...") : t === "error" ? (n.style.display = "inline-block", n.textContent = this.activeLocale === "am" ? "ምልክት ቋንቋ አልተገኘም" : "Sign Unavailable", n.style.background = "#FEF2F2", n.style.color = "#991B1B") : (n.style.display = "inline-block", n.textContent = "EthSL", n.style.background = "rgba(255,255,255,0.2)", n.style.color = "#FFF"));
      }
    }), this.signVideo && this.syncController.setSignVideo(this.signVideo);
    const e = this.shadow.getElementById("transcript-target"), i = this.shadow.getElementById("cb-auto-scroll");
    this.transcriptViewer = new ie(e, {
      locale: this.activeLocale,
      onSeekAndPlay: (t) => {
        this.seekAndPlay(t);
      },
      onFollowChange: (t) => {
        i && (i.checked = t);
      }
    });
  }
  setupWindowInteractions() {
    const e = this.shadow.getElementById("player-stage");
    if (!e) return;
    const i = (t, n, r, u, f, b, g) => {
      const a = this.shadow.getElementById(t), y = this.shadow.getElementById(n), m = this.shadow.getElementById(r), E = this.shadow.getElementById(u), T = this.shadow.getElementById(f), A = b ? this.shadow.getElementById(b) : null;
      if (!a || !y || !m) return;
      let d = null, z = !1, $ = "corner", F = 0, I = 0, B = 0, D = 0, S = null;
      const R = (c) => {
        if (!z) return;
        const h = c.clientX - F, w = c.clientY - I;
        S !== null && cancelAnimationFrame(S), S = requestAnimationFrame(() => {
          let v = B, L = D;
          $ === "corner" || $ === "right" ? v = Math.min(g.maxWidth, Math.max(g.minWidth, B + h)) : $ === "left" && (v = Math.min(g.maxWidth, Math.max(g.minWidth, B - h))), ($ === "corner" || $ === "bottom") && (L = Math.min(g.maxHeight, Math.max(g.minHeight, D + w))), a.style.width = `${v}px`, a.style.height = `${L}px`, a.style.flex = `0 0 ${v}px`, d && (d.style.width = `${v}px`, d.style.height = `${L}px`, d.style.flex = `0 0 ${v}px`);
        });
      }, j = () => {
        z && (z = !1, a.classList.remove("is-resizing"), window.removeEventListener("pointermove", R), window.removeEventListener("pointerup", j), window.removeEventListener("pointercancel", j), S !== null && (cancelAnimationFrame(S), S = null), g.onSaveSize(a.offsetWidth, a.offsetHeight));
      }, M = (c, h) => {
        z = !0, $ = c, F = h.clientX, I = h.clientY, B = a.offsetWidth, D = a.offsetHeight, a.classList.add("is-resizing"), window.addEventListener("pointermove", R), window.addEventListener("pointerup", j), window.addEventListener("pointercancel", j), h.preventDefault(), h.stopPropagation();
      };
      m.addEventListener("pointerdown", (c) => M("corner", c)), E == null || E.addEventListener("pointerdown", (c) => M("bottom", c)), T == null || T.addEventListener("pointerdown", (c) => M("right", c)), A == null || A.addEventListener("pointerdown", (c) => M("left", c)), m.addEventListener("keydown", (c) => {
        let h = a.offsetWidth, w = a.offsetHeight, v = !1;
        c.key === "ArrowRight" ? (h = Math.min(g.maxWidth, h + 20), v = !0) : c.key === "ArrowLeft" ? (h = Math.max(g.minWidth, h - 20), v = !0) : c.key === "ArrowDown" ? (w = Math.min(g.maxHeight, w + 20), v = !0) : c.key === "ArrowUp" && (w = Math.max(g.minHeight, w - 20), v = !0), v && (c.preventDefault(), a.style.width = `${h}px`, a.style.height = `${w}px`, a.style.flex = `0 0 ${h}px`, d && (d.style.width = `${h}px`, d.style.height = `${w}px`, d.style.flex = `0 0 ${h}px`), g.onSaveSize(h, w));
      });
      let C = !1, W = 0, o = 0, x = 0, P = 0, H = null;
      a.addEventListener("pointerdown", () => {
        if (a.classList.contains("floating")) {
          a.style.zIndex = "100";
          const c = t === "transcript-window" ? "esl-window" : "transcript-window", h = this.shadow.getElementById(c);
          h && h.classList.contains("floating") && (h.style.zIndex = "90");
        }
      });
      const _ = (c) => {
        const h = c.clientX - W, w = c.clientY - o;
        !C && Math.hypot(h, w) > 4 && (C = !0, !d && a.parentNode && (d = document.createElement("div"), d.className = "window-placeholder", d.style.width = `${a.offsetWidth}px`, d.style.height = `${a.offsetHeight}px`, d.style.flex = a.style.flex || `0 0 ${a.offsetWidth}px`, a.parentNode.insertBefore(d, a)), a.classList.add("floating"), a.style.position = "absolute", a.style.zIndex = "100"), C && (H !== null && cancelAnimationFrame(H), H = requestAnimationFrame(() => {
          const v = x + h, L = P + w;
          a.style.left = `${v}px`, a.style.top = `${L}px`, a.style.right = "auto", a.style.bottom = "auto";
        }));
      }, N = () => {
        C && (C = !1), window.removeEventListener("pointermove", _), window.removeEventListener("pointerup", N), window.removeEventListener("pointercancel", N), H !== null && (cancelAnimationFrame(H), H = null);
      };
      y.addEventListener("pointerdown", (c) => {
        if (c.target.tagName === "INPUT" || c.target.tagName === "SELECT")
          return;
        W = c.clientX, o = c.clientY;
        const h = e.getBoundingClientRect(), w = a.getBoundingClientRect();
        x = a.style.left ? parseFloat(a.style.left) : w.left - h.left, P = a.style.top ? parseFloat(a.style.top) : w.top - h.top, C = !1, a.style.zIndex = "100";
        const v = t === "transcript-window" ? "esl-window" : "transcript-window", L = this.shadow.getElementById(v);
        L && L.classList.contains("floating") && (L.style.zIndex = "90"), window.addEventListener("pointermove", _), window.addEventListener("pointerup", N), window.addEventListener("pointercancel", N);
      }), y.addEventListener("keydown", (c) => {
        let h = !1;
        const w = 20;
        if (!a.classList.contains("floating")) {
          !d && a.parentNode && (d = document.createElement("div"), d.className = "window-placeholder", d.style.width = `${a.offsetWidth}px`, d.style.height = `${a.offsetHeight}px`, d.style.flex = a.style.flex || `0 0 ${a.offsetWidth}px`, a.parentNode.insertBefore(d, a));
          const q = e.getBoundingClientRect(), Y = a.getBoundingClientRect();
          a.classList.add("floating"), a.style.position = "absolute", a.style.zIndex = "100", a.style.left = `${Y.left - q.left}px`, a.style.top = `${Y.top - q.top}px`;
        }
        let v = parseFloat(a.style.left) || 0, L = parseFloat(a.style.top) || 0;
        c.key === "ArrowRight" ? (v += w, h = !0) : c.key === "ArrowLeft" ? (v -= w, h = !0) : c.key === "ArrowDown" ? (L += w, h = !0) : c.key === "ArrowUp" && (L -= w, h = !0), h && (c.preventDefault(), a.style.left = `${v}px`, a.style.top = `${L}px`);
      });
      const J = () => {
        a.classList.remove("floating"), a.style.position = "", a.style.left = "", a.style.top = "", a.style.right = "", a.style.bottom = "", a.style.zIndex = "", d && (d.remove(), d = null);
      };
      y.addEventListener("dblclick", J), a.__reDock = J;
    };
    i(
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
        onSaveSize: (t, n) => {
          this.prefs.transcriptWidth = t, this.prefs.transcriptHeight = n, V({ transcriptWidth: t, transcriptHeight: n });
        }
      }
    ), i(
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
        onSaveSize: (t, n) => {
          this.prefs.eslWidth = t, this.prefs.eslHeight = n, V({ eslWidth: t, eslHeight: n });
        }
      }
    );
  }
  attachEventListeners() {
    var R, j, M, C, W;
    const e = this.shadow.getElementById("btn-play"), i = this.shadow.getElementById("play-icon"), t = this.shadow.getElementById("play-text"), n = this.shadow.getElementById("seek-scrubber"), r = this.shadow.getElementById("time-display"), u = () => {
      this.mainVideo.paused ? this.mainVideo.play() : this.mainVideo.pause();
    };
    e && e.addEventListener("click", u), this.mainVideo.addEventListener("play", () => {
      i && t && (i.textContent = "⏸", t.textContent = this.activeLocale === "am" ? "አቁም" : "Pause"), e == null || e.setAttribute("aria-label", this.activeLocale === "am" ? "አቁም (Space)" : "Pause (Space)");
    }), this.mainVideo.addEventListener("pause", () => {
      i && t && (i.textContent = "▶", t.textContent = this.activeLocale === "am" ? "አጫውት" : "Play"), e == null || e.setAttribute("aria-label", this.activeLocale === "am" ? "አጫውት (Space)" : "Play (Space)");
    }), this.mainVideo.addEventListener("timeupdate", () => {
      const o = this.mainVideo.currentTime, x = this.mainVideo.duration || 1;
      n && !n.matches(":active") && (n.value = (o / x * 100).toFixed(1)), r && (r.textContent = `${this.formatTime(o)} / ${this.formatTime(x)}`), this.updateCaptionDisplay(), this.transcriptViewer.updateActiveTime(o);
    }), n.addEventListener("input", () => {
      const o = this.mainVideo.duration || 1;
      this.mainVideo.currentTime = parseFloat(n.value) / 100 * o;
    }), (R = this.shadow.getElementById("btn-rewind")) == null || R.addEventListener("click", () => {
      this.mainVideo.currentTime = Math.max(0, this.mainVideo.currentTime - 5);
    }), (j = this.shadow.getElementById("btn-forward")) == null || j.addEventListener("click", () => {
      this.mainVideo.currentTime = Math.min(this.mainVideo.duration || 1e3, this.mainVideo.currentTime + 5);
    });
    const f = this.shadow.getElementById("btn-ad");
    f == null || f.addEventListener("click", async () => {
      if (!this.manifest) return;
      this.prefs.audioDescriptionEnabled = !this.prefs.audioDescriptionEnabled, V({ audioDescriptionEnabled: this.prefs.audioDescriptionEnabled }), f.setAttribute("aria-pressed", this.prefs.audioDescriptionEnabled ? "true" : "false");
      const o = this.prefs.audioDescriptionEnabled ? "described" : "main", x = this.manifest.sources.find((P) => P.kind === o) || this.manifest.sources.find((P) => P.kind === "main");
      x && await this.syncController.switchSource(x.src);
    });
    const b = this.shadow.getElementById("btn-cc");
    b == null || b.addEventListener("click", async () => {
      const o = ["en", "am", "off"], x = (o.indexOf(this.prefs.captionLanguage) + 1) % o.length;
      this.prefs.captionLanguage = o[x], V({ captionLanguage: this.prefs.captionLanguage }), b.textContent = `CC (${this.prefs.captionLanguage.toUpperCase()})`, await this.loadCaptionTrack(this.prefs.captionLanguage);
    });
    const g = this.shadow.getElementById("btn-esl"), a = this.shadow.getElementById("esl-window");
    g == null || g.addEventListener("click", () => {
      this.prefs.eslVisible = !this.prefs.eslVisible, V({ eslVisible: this.prefs.eslVisible }), g.setAttribute("aria-pressed", this.prefs.eslVisible ? "true" : "false"), a && (a.style.display = this.prefs.eslVisible ? "flex" : "none");
    });
    const y = this.shadow.getElementById("btn-transcript-toggle"), m = this.shadow.getElementById("transcript-window");
    y == null || y.addEventListener("click", () => {
      const x = !((m == null ? void 0 : m.style.display) !== "none");
      this.prefs.transcriptVisible = x, V({ transcriptVisible: x }), y.setAttribute("aria-pressed", x ? "true" : "false"), m && (m.style.display = x ? "flex" : "none");
    });
    const E = this.shadow.getElementById("cb-auto-scroll");
    E == null || E.addEventListener("change", () => {
      this.transcriptViewer.setFollowing(E.checked);
    });
    const T = this.shadow.getElementById("select-transcript-lang");
    T == null || T.addEventListener("change", () => {
      const o = T.value;
      this.setAttribute("locale", o);
    });
    const A = () => {
      var o;
      this.isPreferencesOpen = !0, F && (F.style.display = "flex"), (o = this.shadow.getElementById("select-cc-lang")) == null || o.focus();
    }, d = this.shadow.getElementById("btn-prefs"), z = this.shadow.getElementById("btn-transcript-prefs"), $ = this.shadow.getElementById("btn-esl-prefs"), F = this.shadow.getElementById("prefs-dialog"), I = this.shadow.getElementById("btn-close-prefs"), B = this.shadow.getElementById("btn-reset-layout");
    d == null || d.addEventListener("click", A), z == null || z.addEventListener("click", A), $ == null || $.addEventListener("click", A), I == null || I.addEventListener("click", () => {
      this.isPreferencesOpen = !1, F && (F.style.display = "none"), d == null || d.focus();
    }), B == null || B.addEventListener("click", () => {
      var o, x;
      G(), this.prefs = O(), m && ((o = m.__reDock) == null || o.call(m), m.classList.remove("floating"), m.style.position = "", m.style.left = "", m.style.top = "", m.style.right = "", m.style.bottom = "", m.style.zIndex = "", m.style.width = `${k.transcriptWidth}px`, m.style.height = `${k.transcriptHeight}px`, m.style.flex = `0 0 ${k.transcriptWidth}px`, m.style.display = "flex"), a && ((x = a.__reDock) == null || x.call(a), a.classList.remove("floating"), a.style.position = "", a.style.left = "", a.style.top = "", a.style.right = "", a.style.bottom = "", a.style.zIndex = "", a.style.width = `${k.eslWidth}px`, a.style.height = `${k.eslHeight}px`, a.style.flex = `0 0 ${k.eslWidth}px`, a.style.display = "flex"), g && g.setAttribute("aria-pressed", "true"), y && y.setAttribute("aria-pressed", "true");
    }), (M = this.shadow.getElementById("select-cc-lang")) == null || M.addEventListener("change", async (o) => {
      this.prefs.captionLanguage = o.target.value, V({ captionLanguage: this.prefs.captionLanguage }), b && (b.textContent = `CC (${this.prefs.captionLanguage.toUpperCase()})`), await this.loadCaptionTrack(this.prefs.captionLanguage);
    }), (C = this.shadow.getElementById("select-cc-size")) == null || C.addEventListener("change", (o) => {
      this.prefs.captionSize = o.target.value, V({ captionSize: this.prefs.captionSize }), this.updateCaptionDisplay();
    }), (W = this.shadow.getElementById("select-cc-theme")) == null || W.addEventListener("change", (o) => {
      this.prefs.captionTheme = o.target.value, V({ captionTheme: this.prefs.captionTheme }), this.updateCaptionDisplay();
    });
    const D = this.shadow.getElementById("transcript-search");
    D == null || D.addEventListener("input", () => {
      this.transcriptViewer.setSearchQuery(D.value);
    });
    const S = this.shadow.getElementById("player-container");
    S == null || S.addEventListener("keydown", (o) => {
      if (this.isPreferencesOpen) {
        o.key === "Escape" && (this.isPreferencesOpen = !1, F && (F.style.display = "none"), d == null || d.focus());
        return;
      }
      if (!(o.target.tagName === "INPUT" || o.target.tagName === "SELECT"))
        switch (o.key) {
          case " ":
          case "k":
          case "K":
            o.preventDefault(), u();
            break;
          case "j":
          case "J":
          case "ArrowLeft":
            o.preventDefault(), this.mainVideo.currentTime = Math.max(0, this.mainVideo.currentTime - 5);
            break;
          case "l":
          case "L":
          case "ArrowRight":
            o.preventDefault(), this.mainVideo.currentTime = Math.min(this.mainVideo.duration || 1e3, this.mainVideo.currentTime + 5);
            break;
          case "m":
          case "M":
            o.preventDefault(), this.mainVideo.muted = !this.mainVideo.muted;
            break;
          case "c":
          case "C":
            o.preventDefault(), b == null || b.click();
            break;
          case "s":
          case "S":
            o.preventDefault(), g == null || g.click();
            break;
          case "d":
          case "D":
            o.preventDefault(), f == null || f.click();
            break;
          case "t":
          case "T":
            o.preventDefault(), y == null || y.click();
            break;
        }
    });
  }
  updateLocaleStrings() {
    this.render(), this.initTracksAndTranscript();
  }
  formatTime(e) {
    const i = Math.floor(e / 60), t = Math.floor(e % 60);
    return `${i.toString().padStart(2, "0")}:${t.toString().padStart(2, "0")}`;
  }
}
customElements.get("a11y-media-player") || customElements.define("a11y-media-player", se);
const ae = [
  "መስከረም",
  // Meskerem (1)
  "ጥቅምት",
  // Tikimt (2)
  "ህዳር",
  // Hidar (3)
  "ታኅሣሥ",
  // Tahsas (4)
  "ጥር",
  // Tir (5)
  "የካቲት",
  // Yekatit (6)
  "መጋቢት",
  // Megabit (7)
  "ሚያዝያ",
  // Miyazya (8)
  "ግንቦት",
  // Ginbot (9)
  "ሰኔ",
  // Sene (10)
  "ሐምሌ",
  // Hamle (11)
  "ነሐሴ",
  // Nehase (12)
  "ጳጉሜ"
  // Pagume (13)
];
function ne(p) {
  const s = typeof p == "string" ? new Date(p) : p, e = s.getUTCFullYear(), i = s.getUTCMonth() + 1, t = s.getUTCDate(), n = Math.floor((14 - i) / 12), r = e + 4800 - n, u = i + 12 * n - 3, f = t + Math.floor((153 * u + 2) / 5) + 365 * r + Math.floor(r / 4) - Math.floor(r / 100) + Math.floor(r / 400) - 32045, b = (f - 1723856) % 1461, g = b % 365 + 365 * Math.floor(b / 1460), a = 4 * Math.floor((f - 1723856) / 1461) + Math.floor(b / 365) - Math.floor(b / 1460), y = Math.floor(g / 30) + 1, m = g % 30 + 1, E = ae[Math.min(y - 1, 12)];
  return {
    year: a,
    month: y,
    day: m,
    monthNameAmharic: E
  };
}
function re(p) {
  const s = ne(p), e = `${s.monthNameAmharic} ${s.day}፣ ${s.year} ዓ.ም`;
  return {
    iso: p,
    ethiopic: e,
    display: `${p} (${e})`
  };
}
class oe extends HTMLElement {
  constructor() {
    super();
    l(this, "shadow");
    l(this, "job", null);
    l(this, "activeLocale", "en");
    this.shadow = this.attachShadow({ mode: "open" });
  }
  static get observedAttributes() {
    return ["job-data", "locale"];
  }
  connectedCallback() {
    this.activeLocale = this.getAttribute("locale") || "en";
    const e = this.getAttribute("job-data");
    if (e)
      try {
        this.job = JSON.parse(e);
      } catch {
      }
    this.render();
  }
  setJob(e) {
    this.job = e, this.render();
  }
  attributeChangedCallback(e, i, t) {
    if (i !== t) {
      if (e === "locale")
        this.activeLocale = t || "en", this.render();
      else if (e === "job-data")
        try {
          this.job = JSON.parse(t), this.render();
        } catch {
        }
    }
  }
  render() {
    if (!this.job) {
      this.shadow.innerHTML = '<div class="job-placeholder">No job data supplied</div>';
      return;
    }
    const e = this.activeLocale === "am", i = this.job.title[this.activeLocale] || this.job.title.en, t = this.job.location[this.activeLocale] || this.job.location.en, n = this.job.description[this.activeLocale] || this.job.description.en, r = this.job.applicationDeadline ? re(this.job.applicationDeadline) : null, u = {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      title: i,
      description: n,
      hiringOrganization: {
        "@type": "Organization",
        name: this.job.employer
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: t,
          addressCountry: "ET"
        }
      },
      validThrough: this.job.applicationDeadline || "2026-12-31"
    };
    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          max-width: 100%;
          font-family: var(--font-body, system-ui, -apple-system, sans-serif);
          color: var(--color-ink, #14201B);
        }
        /* 200% Zoom and Narrow Reflow */
        article.card {
          background: var(--color-surface, #FFFFFF);
          border: 1px solid var(--color-border, #B7C2BB);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-sizing: border-box;
          width: 100%;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        header h4 {
          margin: 0 0 0.5rem 0;
          font-size: clamp(1.15rem, 2.5vw, 1.45rem);
          color: var(--color-brand, #0B5D4E);
          line-height: 1.3;
        }
        .meta-line {
          font-size: 0.95rem;
          color: var(--color-muted-ink, #52615A);
          margin-bottom: 1.25rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
        }
        .audio-summary-block {
          background: #F7F8F5;
          border: 1px solid #B7C2BB;
          padding: 1rem;
          border-radius: 6px;
          margin: 1.25rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        audio {
          width: 100%;
          min-height: 48px;
        }
        .text-summary-box {
          font-size: 0.9rem;
          color: #333;
          background: #FFF;
          padding: 0.75rem;
          border-left: 3px solid var(--color-brand, #0B5D4E);
          border-radius: 4px;
        }
        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          list-style: none;
          padding: 0;
          margin: 0.75rem 0 1.25rem 0;
        }
        .badge {
          background: #E8F5E9;
          color: #1B5E20;
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
          font-size: 0.875rem;
          border: 1px solid #A5D6A7;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
        .badge.accommodation {
          background: #E3F2FD;
          color: #0D47A1;
          border-color: #90CAF9;
        }
        .badge.calendar {
          background: #FFF3E0;
          color: #E65100;
          border-color: #FFE0B2;
        }
        .action-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          align-items: center;
          margin-top: 1.5rem;
        }
        .btn-apply {
          background: var(--color-brand, #0B5D4E);
          color: #FFF;
          text-decoration: none;
          padding: 0.7rem 1.4rem;
          border-radius: 4px;
          font-weight: bold;
          font-size: 1rem;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .btn-apply:hover {
          background: var(--color-brand-hover, #08483D);
        }
        .btn-apply:focus-visible,
        .btn-secondary:focus-visible {
          outline: 3px solid var(--color-focus, #005FCC);
          outline-offset: 2px;
        }
        .btn-secondary {
          background: #FFF;
          color: var(--color-brand, #0B5D4E);
          border: 1px solid var(--color-brand, #0B5D4E);
          padding: 0.7rem 1.2rem;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .share-feedback {
          font-size: 0.875rem;
          color: #1B5E20;
          font-weight: bold;
        }
      </style>

      <!-- schema.org/JobPosting JSON-LD -->
      <script type="application/ld+json">
        ${JSON.stringify(u)}
      <\/script>

      <article class="card" aria-labelledby="job-title-${this.job.id}">
        <header>
          <h4 id="job-title-${this.job.id}">${i}</h4>
          <div class="meta-line">
            <span><strong>${this.job.employer}</strong></span> &bull;
            <span>${t}</span> &bull;
            <span>${this.job.workMode.toUpperCase()}</span>
            ${r ? ` &bull; <span class="badge calendar" aria-label="Deadline: ${r.display}">📅 ${e ? "የማመልከቻ ማብቂያ፦" : "Deadline:"} ${r.display}</span>` : ""}
          </div>
        </header>

        <!-- Prerecorded Audio Summary with Accessible Controls -->
        <section class="audio-summary-block" aria-label="${e ? "የሥራው አጭር የድምጽ ማጠቃለያ" : "Prerecorded Audio Job Summary"}">
          <label for="audio-ctrl-${this.job.id}" style="font-weight: bold;">
            🎧 ${e ? "የሥራው ማጠቃለያ በድምጽ ያዳምጡ (Audio Summary):" : "Listen to Audio Job Summary:"}
          </label>
          <audio id="audio-ctrl-${this.job.id}" controls preload="none">
            <source src="${this.job.audioSummary.src}" type="${this.job.audioSummary.type}">
            ${e ? "አሳሽዎ ድምጽ አያጫውትም" : "Your browser does not support audio playback"}
          </audio>
          <div class="text-summary-box" aria-label="${e ? "የድምጹ አቻ ጽሑፍ" : "Equivalent text of audio summary"}">
            <strong>${e ? "የድምጽ አቻ ጽሑፍ:" : "Transcript of Summary:"}</strong>
            ${this.job.audioSummary.textEquivalent}
          </div>
        </section>

        <p>${n}</p>

        <!-- Transparent Accommodations -->
        <div>
          <strong id="acc-heading-${this.job.id}">${e ? "የተረጋገጡ ማመቻቸቶች (Accommodations Offered):" : "Employer-Provided Accommodations:"}</strong>
          <ul class="tags-list" aria-labelledby="acc-heading-${this.job.id}">
            ${this.job.accommodations.map(
      (f) => `
              <li class="badge accommodation">
                <span aria-hidden="true">✓</span>
                <span>${f.label[this.activeLocale] || f.label.en}</span>
                <small style="opacity: 0.85;">(${f.source})</small>
              </li>
            `
    ).join("")}
          </ul>
        </div>

        <!-- Action Row -->
        <footer class="action-row">
          <a href="${this.job.applicationUrl}" class="btn-apply" target="_blank" rel="noopener">
            ${e ? "ለዚህ ሥራ ያመልክቱ" : "Apply on Job Portal"}
          </a>

          <button type="button" class="btn-secondary" id="btn-share-cert">
            🔗 ${e ? "የምስክር ወረቀት አገናኝ ያጋሩ" : "Share Verified Certificate Link"}
          </button>

          <span class="share-feedback" id="share-feedback" aria-live="polite"></span>
        </footer>
      </article>
    `, this.attachShareHandler();
  }
  attachShareHandler() {
    const e = this.shadow.getElementById("btn-share-cert"), i = this.shadow.getElementById("share-feedback");
    !e || !i || e.addEventListener("click", async () => {
      const t = `${window.location.origin}/verify.html?certId=CERT-DB-2026-0042`;
      if (navigator.share)
        try {
          await navigator.share({
            title: "Demonstrated Certificate — Savanna Platform",
            text: "Verified Certificate for Digital Workplace Skills: Foundations",
            url: t
          }), i.textContent = this.activeLocale === "am" ? "ተጋርቷል!" : "Link shared!";
          return;
        } catch {
        }
      try {
        await navigator.clipboard.writeText(t), i.textContent = this.activeLocale === "am" ? "የምስክር ወረቀት አገናኝ ተገልብጧል!" : "Certificate link copied to clipboard!";
      } catch {
        i.textContent = t;
      }
    });
  }
}
customElements.get("a11y-job-card") || customElements.define("a11y-job-card", oe);
const le = "abugida-media", de = 1;
class ce {
  constructor() {
    l(this, "db", null);
    l(this, "cacheName", "abugida-offline-v1");
  }
  async init() {
    if (!this.db)
      return new Promise((s, e) => {
        const i = indexedDB.open(le, de);
        i.onupgradeneeded = (t) => {
          const n = t.target.result;
          n.objectStoreNames.contains("preferences") || n.createObjectStore("preferences"), n.objectStoreNames.contains("progress") || n.createObjectStore("progress", { keyPath: "lessonId" }), n.objectStoreNames.contains("packages") || n.createObjectStore("packages", { keyPath: "packageKey" });
        }, i.onsuccess = (t) => {
          this.db = t.target.result, s();
        }, i.onerror = () => {
          console.warn("IndexedDB unavailable, falling back to memory/localStorage"), s();
        };
      });
  }
  // --- Progress Tracking (Local-first) ---
  async saveProgress(s) {
    if (await this.init(), !this.db) {
      try {
        localStorage.setItem(`progress_${s.lessonId}`, JSON.stringify(s));
      } catch {
      }
      return;
    }
    return new Promise((e) => {
      const i = this.db.transaction("progress", "readwrite");
      i.objectStore("progress").put(s), i.oncomplete = () => e(), i.onerror = () => e();
    });
  }
  async getProgress(s) {
    if (await this.init(), !this.db)
      try {
        const e = localStorage.getItem(`progress_${s}`);
        return e ? JSON.parse(e) : null;
      } catch {
        return null;
      }
    return new Promise((e) => {
      const n = this.db.transaction("progress", "readonly").objectStore("progress").get(s);
      n.onsuccess = () => e(n.result || null), n.onerror = () => e(null);
    });
  }
  // --- 3G Offline Package Download Engine ---
  async downloadPackage(s, e, i, t, n) {
    await this.init();
    const r = `${s}:${e}`;
    if (!("caches" in window))
      throw new Error("Cache Storage API is not supported in this browser.");
    try {
      const u = await caches.open(this.cacheName);
      let f = 0;
      const b = t.length;
      for (const g of t) {
        const a = await fetch(g);
        if (!a.ok)
          throw new Error(`Failed to fetch asset: ${g} (${a.status})`);
        await u.put(g, a.clone()), f++;
        const y = Math.round(f / b * 100);
        n(y, f, b);
      }
      return await this.savePackageRecord({
        packageKey: r,
        lessonId: s,
        packageId: e,
        packageName: i,
        status: "ready",
        totalBytes: 32e5,
        downloadedBytes: 32e5,
        timestamp: Date.now()
      }), !0;
    } catch (u) {
      throw await this.savePackageRecord({
        packageKey: r,
        lessonId: s,
        packageId: e,
        packageName: i,
        status: "error",
        totalBytes: 32e5,
        downloadedBytes: 0,
        timestamp: Date.now(),
        error: u instanceof Error ? u.message : "Download failed"
      }), u;
    }
  }
  async isPackageReady(s, e) {
    await this.init();
    const i = `${s}:${e}`, t = await this.getPackageRecord(i);
    return (t == null ? void 0 : t.status) === "ready";
  }
  async savePackageRecord(s) {
    if (this.db)
      return new Promise((e) => {
        const i = this.db.transaction("packages", "readwrite");
        i.objectStore("packages").put(s), i.oncomplete = () => e(), i.onerror = () => e();
      });
  }
  async getPackageRecord(s) {
    return this.db ? new Promise((e) => {
      const n = this.db.transaction("packages", "readonly").objectStore("packages").get(s);
      n.onsuccess = () => e(n.result || null), n.onerror = () => e(null);
    }) : null;
  }
}
const pe = new ce();
export {
  oe as A11yJobCard,
  se as A11yMediaPlayer,
  k as DEFAULT_PREFERENCES,
  ae as ETHIOPIC_MONTHS,
  te as MediaSyncController,
  ce as OfflineStorageManager,
  ie as TranscriptViewer,
  re as formatDualDate,
  ee as getThemeStyles,
  O as loadPreferences,
  pe as offlineStorage,
  Z as parseVTT,
  G as resetPreferences,
  V as savePreferences,
  ne as toEthiopianDate
};
//# sourceMappingURL=a11y-media-kit.es.js.map
