var ae = Object.defineProperty;
var ne = (u, s, e) => s in u ? ae(u, s, { enumerable: !0, configurable: !0, writable: !0, value: e }) : u[s] = e;
var d = (u, s, e) => ne(u, typeof s != "symbol" ? s + "" : s, e);
const Z = "abugida_media_preferences", S = {
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
function G() {
  try {
    const u = localStorage.getItem(Z);
    if (!u) return { ...S };
    const s = JSON.parse(u);
    return { ...S, ...s };
  } catch {
    return { ...S };
  }
}
function I(u) {
  try {
    const e = { ...G(), ...u };
    return localStorage.setItem(Z, JSON.stringify(e)), e;
  } catch {
    return { ...S, ...u };
  }
}
function re() {
  try {
    localStorage.removeItem(Z);
  } catch {
  }
  return { ...S };
}
function oe(u) {
  const s = [], e = u.split(/\r?\n/);
  let i = 0;
  for (; i < e.length && !e[i].includes("-->"); )
    i++;
  for (; i < e.length; ) {
    const t = e[i].trim();
    if (t.includes("-->")) {
      const a = t.split("-->").map((o) => o.trim().split(" ")[0]);
      if (a.length >= 2) {
        const o = se(a[0]), h = se(a[1]);
        i++;
        const x = [];
        for (; i < e.length && e[i].trim() !== ""; )
          x.push(e[i].trim()), i++;
        x.length > 0 && s.push({
          start: o,
          end: h,
          text: x.join(`
`)
        });
      }
    }
    i++;
  }
  return s;
}
function se(u) {
  const s = u.split(":");
  let e = 0, i = 0, t = 0;
  return s.length === 3 ? (e = parseFloat(s[0]), i = parseFloat(s[1]), t = parseFloat(s[2].replace(",", "."))) : s.length === 2 && (i = parseFloat(s[0]), t = parseFloat(s[1].replace(",", "."))), e * 3600 + i * 60 + t;
}
function le(u, s) {
  let e = "18px";
  s === "small" && (e = "14px"), s === "large" && (e = "24px"), s === "xlarge" && (e = "32px");
  let i = "#FFFFFF", t = "rgba(0, 0, 0, 0.85)", a = "none";
  return u === "yellow-black" ? (i = "#FFEB3B", t = "#000000", a = "2px solid #FFEB3B") : u === "white-black" ? (i = "#FFFFFF", t = "#000000", a = "2px solid #FFFFFF") : u === "black-yellow" && (i = "#000000", t = "#FFEB3B", a = "2px solid #000000"), `
    font-size: ${e};
    color: ${i};
    background: ${t};
    border: ${a};
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
class ce {
  constructor(s, e) {
    d(this, "mainVideo");
    d(this, "signVideo", null);
    d(this, "driftThreshold");
    d(this, "isSyncing", !1);
    d(this, "onSignStatusChange");
    // Stored listener references for clean teardown
    d(this, "mainListeners", {});
    d(this, "signListeners", {});
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
    return this.mainVideo.src = s, this.mainVideo.load(), new Promise((a) => {
      const o = async () => {
        if (this.mainVideo.removeEventListener("loadedmetadata", o), this.mainVideo.currentTime = i, this.mainVideo.playbackRate = t, e)
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
        a();
      };
      this.mainVideo.addEventListener("loadedmetadata", o);
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
class de {
  constructor(s, e) {
    d(this, "segments", []);
    d(this, "container");
    d(this, "onSeekAndPlay");
    d(this, "onFollowChange");
    d(this, "currentActiveId", null);
    d(this, "searchQuery", "");
    d(this, "isFollowing", !0);
    d(this, "userPausedFollowing", !1);
    d(this, "locale", "en");
    d(this, "listElement", null);
    d(this, "followBtn", null);
    d(this, "statusElement", null);
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
    const i = this.listElement.clientHeight, t = e.offsetTop, a = e.clientHeight, o = t - i / 2 + a / 2;
    this.listElement.scrollTo({
      top: Math.max(0, o),
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
      const a = this.formatTime(t.start), o = t.id === this.currentActiveId, h = s ? `ከ ${a} ጀምሮ አጫውት` : `Play from ${a}`;
      return `
                <li class="transcript-item ${o ? "active" : ""}" data-segment-id="${t.id}">
                  <button 
                    type="button" 
                    class="btn-seek-time" 
                    data-time="${t.start}" 
                    aria-label="${h}">
                    ${a}
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
      this.listElement.addEventListener("wheel", t, { passive: !0 }), this.listElement.addEventListener("touchmove", t, { passive: !0 }), this.listElement.addEventListener("keydown", (a) => {
        ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(a.key) && t();
      });
    }
    this.container.querySelectorAll(".btn-seek-time").forEach((t) => {
      t.addEventListener("click", (a) => {
        const o = parseFloat(a.currentTarget.dataset.time || "0");
        this.onSeekAndPlay(o), a.currentTarget.focus();
      });
    });
  }
  escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
}
const E = {
  play: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',
  restart: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>',
  rewind: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>',
  forward: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>',
  cc: '<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-4a1 1 0 011-1h3a1 1 0 011 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1a1 1 0 01-1 1h-3a1 1 0 01-1-1v-4a1 1 0 011-1h3a1 1 0 011 1v1z"/></svg>',
  sign: '<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M21 9h-4.2l-1.3-3.9C15.2 4.4 14.5 4 13.7 4c-.7 0-1.4.3-1.8.9L10 8H6c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h6.8l5.8-2.5c.9-.4 1.4-1.3 1.4-2.3V11c0-1.1-.9-2-2-2zm-9 9H6v-7h4.5l2.1-3.2c.2-.3.6-.4.9-.4.3 0 .6.2.8.5l1.3 3.9v.2H12v6zm7-3.7l-5 2.1V11h6v3.3z"/></svg>',
  ad: '<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M4 4h5c4.42 0 8 3.58 8 8s-3.58 8-8 8H4V4zm5 13c2.76 0 5-2.24 5-5s-2.24-5-5-5H7v10h2zm10-9.8a7.96 7.96 0 010 9.6l1.5 1.5c3.5-3.5 3.5-9.1 0-12.6l-1.5 1.5zm-2.5 2.5a4.46 4.46 0 010 4.6l1.5 1.5c1.9-2.1 1.9-5.1 0-7.2l-1.5 1.1z"/></svg>',
  transcript: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',
  faster: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M21.5 14.5c0-.83-.67-1.5-1.5-1.5h-1.18c.43-.88.68-1.87.68-2.92 0-3.35-2.45-6.08-5.5-6.08-1.3 0-2.5.5-3.41 1.34L8.7 3.45a1.5 1.5 0 00-2.12 2.12l1.6 1.6C7.45 8.1 7 9.25 7 10.5c0 1.05.43 2.01 1.12 2.72L5.4 14.94A2 2 0 004 16.5C4 18.43 5.57 20 7.5 20h11c1.66 0 3-1.34 3-3 0-.91-.41-1.72-1.05-2.27.64-.32 1.05-.98 1.05-1.73zM14 6c1.93 0 3.5 1.79 3.5 4 0 .72-.18 1.4-.49 1.98l-3.92-3.92C13.36 6.8 13.67 6 14 6z"/></svg>',
  slower: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M19 13c-.55 0-1 .45-1 1 0 1.65-1.35 3-3 3H9c-1.65 0-3-1.35-3-3 0-.55-.45-1-1-1s-1 .45-1 1c0 2.42 1.72 4.44 4 4.9V20c0 .55.45 1 1 1s1-.45 1-1v-1.05c.32.03.66.05 1 .05s.68-.02 1-.05V20c0 .55.45 1 1 1s1-.45 1-1v-1.1c2.28-.46 4-2.48 4-4.9 0-.55-.45-1-1-1zm1.5-4c-.83 0-1.5.67-1.5 1.5 0 .28.08.53.21.75C17.7 10.5 15.98 10 14 10H10c-1.98 0-3.7.5-5.21 1.25.13-.22.21-.47.21-.75 0-.83-.67-1.5-1.5-1.5S2 9.67 2 10.5c0 .76.57 1.38 1.3 1.48C3.1 12.5 3 13 3 13.5c0 .35.03.69.08 1.03C2.45 14.89 2 15.64 2 16.5 2 17.6 2.9 18.5 4 18.5h.2c.4 1.2 1.44 2.1 2.7 2.38V21.5c0 .55.45 1 1 1s1-.45 1-1V21h6v.5c0 .55.45 1 1 1s1-.45 1-1v-.62c1.26-.28 2.3-1.18 2.7-2.38h.2c1.1 0 2-.9 2-2 0-.86-.45-1.61-1.08-1.97.05-.34.08-.68.08-1.03 0-.53-.1-1.04-.3-1.52.73-.1 1.3-.72 1.3-1.48 0-.83-.67-1.5-1.5-1.5zM12 7c3.86 0 7 3.14 7 6H5c0-2.86 3.14-6 7-6z"/></svg>',
  prefs: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
  fullscreenEnter: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
  fullscreenExit: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>',
  volumeUnmuted: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',
  volumeMuted: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>'
};
class he extends HTMLElement {
  constructor() {
    super();
    d(this, "shadow");
    d(this, "manifest", null);
    d(this, "activeLocale", "en");
    d(this, "prefs");
    // Media & sync
    d(this, "mainVideo");
    d(this, "signVideo", null);
    d(this, "syncController");
    d(this, "pendingSeekTime", null);
    // Captions
    d(this, "currentCues", []);
    d(this, "captionOverlay");
    // Transcript
    d(this, "transcriptViewer");
    // UI state
    d(this, "isPreferencesOpen", !1);
    this.shadow = this.attachShadow({ mode: "open" }), this.prefs = G();
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
      let a;
      try {
        a = new URL(e, window.location.href);
      } catch {
        a = new URL(window.location.href);
      }
      const o = (h) => {
        if (!h) return h;
        try {
          return new URL(h, a).href;
        } catch {
          return h;
        }
      };
      this.manifest = {
        ...t,
        poster: t.poster ? { ...t.poster, src: o(t.poster.src) } : void 0,
        sources: (t.sources || []).map((h) => ({
          ...h,
          src: o(h.src)
        })),
        captionTracks: (t.captionTracks || []).map((h) => ({
          ...h,
          src: o(h.src)
        })),
        transcript: t.transcript ? {
          ...t.transcript,
          src: o(t.transcript.src)
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
          const a = ((await i.json()).segments || []).map((o) => ({
            id: o.id,
            start: o.start_ms !== void 0 ? o.start_ms / 1e3 : o.start || 0,
            end: o.end_ms !== void 0 ? o.end_ms / 1e3 : o.end || 0,
            speaker: o.speaker,
            text: o.text || o.draft_text || "",
            visualDescription: o.visual_description || o.visualDescription
          }));
          this.transcriptViewer.setSegments(a);
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
        const a = await t.text();
        this.currentCues = oe(a);
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
    i ? (this.captionOverlay.style.display = "block", this.captionOverlay.style.cssText = le(this.prefs.captionTheme, this.prefs.captionSize), this.captionOverlay.textContent = i.text) : this.captionOverlay.style.display = "none";
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
    var p, n, m, T;
    const e = this.activeLocale === "am", i = this.manifest ? this.manifest.title[this.activeLocale] : "Media Player", t = (p = this.manifest) == null ? void 0 : p.sources.find((k) => k.kind === "main"), a = (n = this.manifest) == null ? void 0 : n.sources.find((k) => k.kind === "sign"), o = this.prefs.transcriptWidth || S.transcriptWidth || 350, h = this.prefs.transcriptHeight || S.transcriptHeight || 480, x = this.prefs.eslWidth || S.eslWidth || 340, L = this.prefs.eslHeight || S.eslHeight || 250;
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

      <section class="player-component" aria-label="${i}">
        <div class="player-stage" id="player-stage">

          <!-- LEFT: Movable & Resizable Transcript Window (Outside of video frame) -->
          <div 
            class="window-panel transcript-window" 
            id="transcript-window"
            style="width: ${o}px; height: ${h}px; flex: 0 0 ${o}px; display: ${this.prefs.transcriptVisible !== !1 ? "flex" : "none"};"
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
                poster="${((T = (m = this.manifest) == null ? void 0 : m.poster) == null ? void 0 : T.src) || ""}"
                src="${t ? t.src : ""}">
              </video>

              <!-- Big Play Button Overlay -->
              <button 
                type="button" 
                class="big-play-btn" 
                id="big-play-btn" 
                aria-label="${e ? "ቪዲዮውን አጫውት (Space / K)" : "Play video (Space / K)"}"
                title="${e ? "ቪዲዮውን አጫውት" : "Play video"}">
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
            <div class="controls-toolbar" role="toolbar" aria-label="${e ? "የቪዲዮ መቆጣጠሪያዎች" : "Video player controls"}">
              <!-- Scrubber -->
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
              </div>

              <!-- Controls Row -->
              <div class="controls-row">
                <!-- Left: Playback & Navigation -->
                <div class="controls-cluster">
                  <button class="btn-ctrl" id="btn-play" aria-label="${e ? "አጫውት (Space / K)" : "Play (Space / K)"}" title="${e ? "አጫውት (Space / K)" : "Play (Space / K)"}">
                    <span id="play-icon" aria-hidden="true">${E.play}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-restart" aria-label="${e ? "እንደገና ጀምር (0 / Home)" : "Restart (0 / Home)"}" title="${e ? "እንደገና ጀምር (0 / Home)" : "Restart (0 / Home)"}">
                    <span aria-hidden="true">${E.restart}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-rewind" aria-label="${e ? "ወደኋላ 5 ሰከንድ (J / ←)" : "Rewind 5 seconds (J / ←)"}" title="${e ? "ወደኋላ 5 ሰከንድ (J / ←)" : "Rewind 5 seconds (J / ←)"}">
                    <span aria-hidden="true">${E.rewind}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-forward" aria-label="${e ? "ወደፊት 5 ሰከንድ (L / →)" : "Forward 5 seconds (L / →)"}" title="${e ? "ወደፊት 5 ሰከንድ (L / →)" : "Forward 5 seconds (L / →)"}">
                    <span aria-hidden="true">${E.forward}</span>
                  </button>
                </div>

                <!-- Center: Accessibility & Speed -->
                <div class="controls-cluster">
                  <button class="btn-ctrl" id="btn-cc" aria-pressed="${this.prefs.captionLanguage !== "off" ? "true" : "false"}" aria-label="${e ? "የትርጉም ጽሑፍ (C)" : "Captions (C)"}" title="${e ? "የትርጉም ጽሑፍ (C)" : "Captions (C)"}">
                    <span aria-hidden="true">${E.cc}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-esl" aria-pressed="${this.prefs.eslVisible ? "true" : "false"}" aria-label="${e ? "የኢትዮጵያ የምልክት ቋንቋ (S)" : "Ethiopian Sign Language (S)"}" title="${e ? "የኢትዮጵያ የምልክት ቋንቋ (S)" : "Ethiopian Sign Language (S)"}">
                    <span aria-hidden="true">${E.sign}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-ad" aria-pressed="${this.prefs.audioDescriptionEnabled ? "true" : "false"}" aria-label="${e ? "የድምጽ ማብራሪያ (D)" : "Audio Description (D)"}" title="${e ? "የድምጽ ማብራሪያ (D)" : "Audio Description (D)"}">
                    <span aria-hidden="true">${E.ad}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-transcript-toggle" aria-pressed="${this.prefs.transcriptVisible !== !1 ? "true" : "false"}" aria-label="${e ? "የጽሑፍ ግልባጭ ማሳያ (T)" : "Toggle Transcript (T)"}" title="${e ? "የጽሑፍ ግልባጭ ማሳያ (T)" : "Toggle Transcript (T)"}">
                    <span aria-hidden="true">${E.transcript}</span>
                  </button>

                  <span class="ctrl-divider" aria-hidden="true"></span>

                  <button class="btn-ctrl" id="btn-speed-faster" aria-label="${e ? "ፍጥነት ጨምር (>)" : "Increase speed (>)"}" title="${e ? "ፍጥነት ጨምር (>)" : "Increase speed (>)"}">
                    <span aria-hidden="true">${E.faster}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-speed-slower" aria-label="${e ? "ፍጥነት ቀንስ (<)" : "Decrease speed (<)"}" title="${e ? "ፍጥነት ቀንስ (<)" : "Decrease speed (<)"}">
                    <span aria-hidden="true">${E.slower}</span>
                  </button>

                  <span class="ctrl-divider" aria-hidden="true"></span>
                </div>

                <!-- Right: Settings, Fullscreen, Volume -->
                <div class="controls-cluster">
                  <button class="btn-ctrl" id="btn-prefs" aria-expanded="false" aria-label="${e ? "የተደራሽነት ምርጫዎች" : "Accessibility Preferences"}" title="${e ? "የተደራሽነት ምርጫዎች" : "Accessibility Preferences"}">
                    <span aria-hidden="true">${E.prefs}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-fullscreen" aria-pressed="false" aria-label="${e ? "ሙሉ ማያ ገጽ (F)" : "Fullscreen (F)"}" title="${e ? "ሙሉ ማያ ገጽ (F)" : "Fullscreen (F)"}">
                    <span id="fullscreen-icon" aria-hidden="true">${E.fullscreenEnter}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-mute" aria-pressed="false" aria-label="${e ? "ድምጽ አጥፋ (M)" : "Mute (M)"}" title="${e ? "ድምጽ አጥፋ (M)" : "Mute (M)"}">
                    <span id="mute-icon" aria-hidden="true">${E.volumeUnmuted}</span>
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
            style="width: ${x}px; height: ${L}px; flex: 0 0 ${x}px; display: ${this.prefs.eslVisible && a ? "flex" : "none"};"
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
                src="${a ? a.src : ""}">
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
    this.mainVideo = this.shadow.getElementById("main-video"), this.signVideo = this.shadow.getElementById("sign-video"), this.captionOverlay = this.shadow.getElementById("caption-overlay"), this.syncController = new ce(this.mainVideo, {
      driftThreshold: 0.25,
      onSignStatusChange: (t) => {
        const a = this.shadow.getElementById("sign-status-indicator");
        a && (t === "loading" ? (a.style.display = "inline-block", a.textContent = this.activeLocale === "am" ? "በመጫን ላይ..." : "Loading...") : t === "error" ? (a.style.display = "inline-block", a.textContent = this.activeLocale === "am" ? "ምልክት ቋንቋ አልተገኘም" : "Sign Unavailable", a.style.background = "#FEF2F2", a.style.color = "#991B1B") : (a.style.display = "inline-block", a.textContent = "EthSL", a.style.background = "rgba(255,255,255,0.2)", a.style.color = "#FFF"));
      }
    }), this.signVideo && this.syncController.setSignVideo(this.signVideo);
    const e = this.shadow.getElementById("transcript-target"), i = this.shadow.getElementById("cb-auto-scroll");
    this.transcriptViewer = new de(e, {
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
    const i = (t, a, o, h, x, L, p) => {
      const n = this.shadow.getElementById(t), m = this.shadow.getElementById(a), T = this.shadow.getElementById(o), k = this.shadow.getElementById(h), D = this.shadow.getElementById(x), U = L ? this.shadow.getElementById(L) : null;
      if (!n || !m || !T) return;
      let g = null, R = !1, B = "corner", J = 0, q = 0, W = 0, K = 0, P = null;
      const M = (l) => {
        if (!R) return;
        const c = l.clientX - J, w = l.clientY - q;
        P !== null && cancelAnimationFrame(P), P = requestAnimationFrame(() => {
          let f = W, $ = K;
          B === "corner" || B === "right" ? f = Math.min(p.maxWidth, Math.max(p.minWidth, W + c)) : B === "left" && (f = Math.min(p.maxWidth, Math.max(p.minWidth, W - c))), (B === "corner" || B === "bottom") && ($ = Math.min(p.maxHeight, Math.max(p.minHeight, K + w))), n.style.width = `${f}px`, n.style.height = `${$}px`, n.style.flex = `0 0 ${f}px`, g && (g.style.width = `${f}px`, g.style.height = `${$}px`, g.style.flex = `0 0 ${f}px`);
        });
      }, F = () => {
        R && (R = !1, n.classList.remove("is-resizing"), window.removeEventListener("pointermove", M), window.removeEventListener("pointerup", F), window.removeEventListener("pointercancel", F), P !== null && (cancelAnimationFrame(P), P = null), p.onSaveSize(n.offsetWidth, n.offsetHeight));
      }, C = (l, c) => {
        R = !0, B = l, J = c.clientX, q = c.clientY, W = n.offsetWidth, K = n.offsetHeight, n.classList.add("is-resizing"), window.addEventListener("pointermove", M), window.addEventListener("pointerup", F), window.addEventListener("pointercancel", F), c.preventDefault(), c.stopPropagation();
      };
      T.addEventListener("pointerdown", (l) => C("corner", l)), k == null || k.addEventListener("pointerdown", (l) => C("bottom", l)), D == null || D.addEventListener("pointerdown", (l) => C("right", l)), U == null || U.addEventListener("pointerdown", (l) => C("left", l)), T.addEventListener("keydown", (l) => {
        let c = n.offsetWidth, w = n.offsetHeight, f = !1;
        l.key === "ArrowRight" ? (c = Math.min(p.maxWidth, c + 20), f = !0) : l.key === "ArrowLeft" ? (c = Math.max(p.minWidth, c - 20), f = !0) : l.key === "ArrowDown" ? (w = Math.min(p.maxHeight, w + 20), f = !0) : l.key === "ArrowUp" && (w = Math.max(p.minHeight, w - 20), f = !0), f && (l.preventDefault(), n.style.width = `${c}px`, n.style.height = `${w}px`, n.style.flex = `0 0 ${c}px`, g && (g.style.width = `${c}px`, g.style.height = `${w}px`, g.style.flex = `0 0 ${c}px`), p.onSaveSize(c, w));
      });
      let b = !1, V = 0, y = 0, N = 0, O = 0, A = null;
      n.addEventListener("pointerdown", () => {
        if (n.classList.contains("floating")) {
          n.style.zIndex = "100";
          const l = t === "transcript-window" ? "esl-window" : "transcript-window", c = this.shadow.getElementById(l);
          c && c.classList.contains("floating") && (c.style.zIndex = "90");
        }
      });
      const z = (l) => {
        const c = l.clientX - V, w = l.clientY - y;
        !b && Math.hypot(c, w) > 4 && (b = !0, !g && n.parentNode && (g = document.createElement("div"), g.className = "window-placeholder", g.style.width = `${n.offsetWidth}px`, g.style.height = `${n.offsetHeight}px`, g.style.flex = n.style.flex || `0 0 ${n.offsetWidth}px`, n.parentNode.insertBefore(g, n)), n.classList.add("floating"), n.style.position = "absolute", n.style.zIndex = "100"), b && (A !== null && cancelAnimationFrame(A), A = requestAnimationFrame(() => {
          const f = N + c, $ = O + w;
          n.style.left = `${f}px`, n.style.top = `${$}px`, n.style.right = "auto", n.style.bottom = "auto";
        }));
      }, j = () => {
        b && (b = !1), window.removeEventListener("pointermove", z), window.removeEventListener("pointerup", j), window.removeEventListener("pointercancel", j), A !== null && (cancelAnimationFrame(A), A = null);
      };
      m.addEventListener("pointerdown", (l) => {
        if (l.target.tagName === "INPUT" || l.target.tagName === "SELECT")
          return;
        V = l.clientX, y = l.clientY;
        const c = e.getBoundingClientRect(), w = n.getBoundingClientRect();
        N = n.style.left ? parseFloat(n.style.left) : w.left - c.left, O = n.style.top ? parseFloat(n.style.top) : w.top - c.top, b = !1, n.style.zIndex = "100";
        const f = t === "transcript-window" ? "esl-window" : "transcript-window", $ = this.shadow.getElementById(f);
        $ && $.classList.contains("floating") && ($.style.zIndex = "90"), window.addEventListener("pointermove", z), window.addEventListener("pointerup", j), window.addEventListener("pointercancel", j);
      }), m.addEventListener("keydown", (l) => {
        let c = !1;
        const w = 20;
        if (!n.classList.contains("floating")) {
          !g && n.parentNode && (g = document.createElement("div"), g.className = "window-placeholder", g.style.width = `${n.offsetWidth}px`, g.style.height = `${n.offsetHeight}px`, g.style.flex = n.style.flex || `0 0 ${n.offsetWidth}px`, n.parentNode.insertBefore(g, n));
          const Y = e.getBoundingClientRect(), Q = n.getBoundingClientRect();
          n.classList.add("floating"), n.style.position = "absolute", n.style.zIndex = "100", n.style.left = `${Q.left - Y.left}px`, n.style.top = `${Q.top - Y.top}px`;
        }
        let f = parseFloat(n.style.left) || 0, $ = parseFloat(n.style.top) || 0;
        l.key === "ArrowRight" ? (f += w, c = !0) : l.key === "ArrowLeft" ? (f -= w, c = !0) : l.key === "ArrowDown" ? ($ += w, c = !0) : l.key === "ArrowUp" && ($ -= w, c = !0), c && (l.preventDefault(), n.style.left = `${f}px`, n.style.top = `${$}px`);
      });
      const _ = () => {
        n.classList.remove("floating"), n.style.position = "", n.style.left = "", n.style.top = "", n.style.right = "", n.style.bottom = "", n.style.zIndex = "", g && (g.remove(), g = null);
      };
      m.addEventListener("dblclick", _), n.__reDock = _;
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
        onSaveSize: (t, a) => {
          this.prefs.transcriptWidth = t, this.prefs.transcriptHeight = a, I({ transcriptWidth: t, transcriptHeight: a });
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
        onSaveSize: (t, a) => {
          this.prefs.eslWidth = t, this.prefs.eslHeight = a, I({ eslWidth: t, eslHeight: a });
        }
      }
    );
  }
  attachEventListeners() {
    var Y, Q, ee, te, ie;
    const e = this.shadow.getElementById("btn-play"), i = this.shadow.getElementById("play-icon"), t = this.shadow.getElementById("big-play-btn"), a = this.shadow.getElementById("btn-restart"), o = this.shadow.getElementById("btn-speed-faster"), h = this.shadow.getElementById("btn-speed-slower"), x = this.shadow.getElementById("speed-display"), L = this.shadow.getElementById("state-display"), p = this.shadow.getElementById("btn-fullscreen"), n = this.shadow.getElementById("fullscreen-icon"), m = this.shadow.getElementById("btn-mute"), T = this.shadow.getElementById("mute-icon"), k = this.shadow.getElementById("player-container"), D = this.shadow.getElementById("seek-scrubber"), U = this.shadow.getElementById("time-display"), g = () => {
      this.mainVideo.paused ? this.mainVideo.play() : this.mainVideo.pause();
    };
    e && e.addEventListener("click", g), t && t.addEventListener("click", g), this.mainVideo.addEventListener("click", g), this.mainVideo.addEventListener("play", () => {
      i && (i.innerHTML = E.pause), e == null || e.setAttribute("aria-label", this.activeLocale === "am" ? "አቁም (Space / K)" : "Pause (Space / K)"), e == null || e.setAttribute("title", this.activeLocale === "am" ? "አቁም (Space / K)" : "Pause (Space / K)"), t == null || t.classList.add("is-hidden"), L && (L.textContent = this.activeLocale === "am" ? "እየተጫወተ ነው" : "Playing");
    }), this.mainVideo.addEventListener("pause", () => {
      i && (i.innerHTML = E.play), e == null || e.setAttribute("aria-label", this.activeLocale === "am" ? "አጫውት (Space / K)" : "Play (Space / K)"), e == null || e.setAttribute("title", this.activeLocale === "am" ? "አጫውት (Space / K)" : "Play (Space / K)"), t == null || t.classList.remove("is-hidden"), L && (L.textContent = this.mainVideo.ended ? this.activeLocale === "am" ? "ተጠናቋል" : "End of track" : this.activeLocale === "am" ? "ቆሟል" : "Paused");
    }), this.mainVideo.addEventListener("ended", () => {
      i && (i.innerHTML = E.play), e == null || e.setAttribute("aria-label", this.activeLocale === "am" ? "አጫውት (Space / K)" : "Play (Space / K)"), e == null || e.setAttribute("title", this.activeLocale === "am" ? "አጫውት (Space / K)" : "Play (Space / K)"), t == null || t.classList.remove("is-hidden"), L && (L.textContent = this.activeLocale === "am" ? "ተጠናቋል" : "End of track");
    }), a == null || a.addEventListener("click", () => {
      this.mainVideo.currentTime = 0, this.mainVideo.play(), this.transcriptViewer.updateActiveTime(0);
    });
    const R = [0.5, 0.75, 1, 1.25, 1.5, 2], B = () => {
      const r = this.mainVideo.playbackRate;
      x && (x.textContent = `Speed: ${r}x`);
    };
    o == null || o.addEventListener("click", () => {
      const r = this.mainVideo.playbackRate, v = R.filter((X) => X > r + 0.01), H = v.length > 0 ? v[0] : 2;
      this.mainVideo.playbackRate = H, B();
    }), h == null || h.addEventListener("click", () => {
      const r = this.mainVideo.playbackRate, v = R.filter((X) => X < r - 0.01), H = v.length > 0 ? v[v.length - 1] : 0.5;
      this.mainVideo.playbackRate = H, B();
    });
    const J = () => document.fullscreenElement === k || document.webkitFullscreenElement === k, q = async () => {
      try {
        J() ? document.exitFullscreen ? await document.exitFullscreen() : document.webkitExitFullscreen && await document.webkitExitFullscreen() : k != null && k.requestFullscreen ? await k.requestFullscreen() : k != null && k.webkitRequestFullscreen && await k.webkitRequestFullscreen();
      } catch (r) {
        console.warn("Fullscreen toggle failed:", r);
      }
    };
    p == null || p.addEventListener("click", q);
    const W = () => {
      const r = J();
      p == null || p.setAttribute("aria-pressed", r ? "true" : "false"), p == null || p.setAttribute(
        "aria-label",
        r ? this.activeLocale === "am" ? "ከሙሉ ማያ ገጽ ውጣ (F)" : "Exit Fullscreen (F)" : this.activeLocale === "am" ? "ሙሉ ማያ ገጽ (F)" : "Fullscreen (F)"
      ), p == null || p.setAttribute(
        "title",
        r ? this.activeLocale === "am" ? "ከሙሉ ማያ ገጽ ውጣ (F)" : "Exit Fullscreen (F)" : this.activeLocale === "am" ? "ሙሉ ማያ ገጽ (F)" : "Fullscreen (F)"
      ), n && (n.innerHTML = r ? E.fullscreenExit : E.fullscreenEnter);
    };
    document.addEventListener("fullscreenchange", W), document.addEventListener("webkitfullscreenchange", W);
    const K = () => {
      this.mainVideo.muted = !this.mainVideo.muted;
    };
    m == null || m.addEventListener("click", K);
    const P = () => {
      const r = this.mainVideo.muted;
      m == null || m.setAttribute("aria-pressed", r ? "true" : "false"), m == null || m.setAttribute(
        "aria-label",
        r ? this.activeLocale === "am" ? "ድምጽ አብራ (M)" : "Unmute (M)" : this.activeLocale === "am" ? "ድምጽ አጥፋ (M)" : "Mute (M)"
      ), m == null || m.setAttribute(
        "title",
        r ? this.activeLocale === "am" ? "ድምጽ አብራ (M)" : "Unmute (M)" : this.activeLocale === "am" ? "ድምጽ አጥፋ (M)" : "Mute (M)"
      ), T && (T.innerHTML = r ? E.volumeMuted : E.volumeUnmuted);
    };
    this.mainVideo.addEventListener("volumechange", P), this.mainVideo.addEventListener("timeupdate", () => {
      const r = this.mainVideo.currentTime, v = this.mainVideo.duration || 1;
      D && !D.matches(":active") && (D.value = (r / v * 100).toFixed(1)), U && (U.textContent = `${this.formatTime(r)} / ${this.formatTime(v)}`), this.updateCaptionDisplay(), this.transcriptViewer.updateActiveTime(r);
    }), D.addEventListener("input", () => {
      const r = this.mainVideo.duration || 1;
      this.mainVideo.currentTime = parseFloat(D.value) / 100 * r;
    }), (Y = this.shadow.getElementById("btn-rewind")) == null || Y.addEventListener("click", () => {
      this.mainVideo.currentTime = Math.max(0, this.mainVideo.currentTime - 5);
    }), (Q = this.shadow.getElementById("btn-forward")) == null || Q.addEventListener("click", () => {
      this.mainVideo.currentTime = Math.min(this.mainVideo.duration || 1e3, this.mainVideo.currentTime + 5);
    });
    const M = this.shadow.getElementById("btn-ad");
    M == null || M.addEventListener("click", async () => {
      if (!this.manifest) return;
      this.prefs.audioDescriptionEnabled = !this.prefs.audioDescriptionEnabled, I({ audioDescriptionEnabled: this.prefs.audioDescriptionEnabled }), M.setAttribute("aria-pressed", this.prefs.audioDescriptionEnabled ? "true" : "false");
      const r = this.prefs.audioDescriptionEnabled ? "described" : "main", v = this.manifest.sources.find((H) => H.kind === r) || this.manifest.sources.find((H) => H.kind === "main");
      v && await this.syncController.switchSource(v.src);
    });
    const F = this.shadow.getElementById("btn-cc");
    F == null || F.addEventListener("click", async () => {
      const r = ["en", "am", "off"], v = (r.indexOf(this.prefs.captionLanguage) + 1) % r.length;
      this.prefs.captionLanguage = r[v], I({ captionLanguage: this.prefs.captionLanguage });
      const H = this.prefs.captionLanguage === "off";
      F.setAttribute("aria-pressed", H ? "false" : "true"), F.setAttribute("title", `Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`), F.setAttribute(
        "aria-label",
        this.activeLocale === "am" ? `የትርጉም ጽሑፍ: ${this.prefs.captionLanguage.toUpperCase()} (C)` : `Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`
      ), await this.loadCaptionTrack(this.prefs.captionLanguage);
    });
    const C = this.shadow.getElementById("btn-esl"), b = this.shadow.getElementById("esl-window");
    C == null || C.addEventListener("click", () => {
      this.prefs.eslVisible = !this.prefs.eslVisible, I({ eslVisible: this.prefs.eslVisible }), C.setAttribute("aria-pressed", this.prefs.eslVisible ? "true" : "false"), b && (b.style.display = this.prefs.eslVisible ? "flex" : "none");
    });
    const V = this.shadow.getElementById("btn-transcript-toggle"), y = this.shadow.getElementById("transcript-window");
    V == null || V.addEventListener("click", () => {
      const v = !((y == null ? void 0 : y.style.display) !== "none");
      this.prefs.transcriptVisible = v, I({ transcriptVisible: v }), V.setAttribute("aria-pressed", v ? "true" : "false"), y && (y.style.display = v ? "flex" : "none");
    });
    const N = this.shadow.getElementById("cb-auto-scroll");
    N == null || N.addEventListener("change", () => {
      this.transcriptViewer.setFollowing(N.checked);
    });
    const O = this.shadow.getElementById("select-transcript-lang");
    O == null || O.addEventListener("change", () => {
      const r = O.value;
      this.setAttribute("locale", r);
    });
    const A = () => {
      var r;
      this.isPreferencesOpen = !0, l && (l.style.display = "flex"), (r = this.shadow.getElementById("select-cc-lang")) == null || r.focus();
    }, z = this.shadow.getElementById("btn-prefs"), j = this.shadow.getElementById("btn-transcript-prefs"), _ = this.shadow.getElementById("btn-esl-prefs"), l = this.shadow.getElementById("prefs-dialog"), c = this.shadow.getElementById("btn-close-prefs"), w = this.shadow.getElementById("btn-reset-layout");
    z == null || z.addEventListener("click", A), j == null || j.addEventListener("click", A), _ == null || _.addEventListener("click", A), c == null || c.addEventListener("click", () => {
      this.isPreferencesOpen = !1, l && (l.style.display = "none"), z == null || z.focus();
    }), w == null || w.addEventListener("click", () => {
      var r, v;
      re(), this.prefs = G(), y && ((r = y.__reDock) == null || r.call(y), y.classList.remove("floating"), y.style.position = "", y.style.left = "", y.style.top = "", y.style.right = "", y.style.bottom = "", y.style.zIndex = "", y.style.width = `${S.transcriptWidth}px`, y.style.height = `${S.transcriptHeight}px`, y.style.flex = `0 0 ${S.transcriptWidth}px`, y.style.display = "flex"), b && ((v = b.__reDock) == null || v.call(b), b.classList.remove("floating"), b.style.position = "", b.style.left = "", b.style.top = "", b.style.right = "", b.style.bottom = "", b.style.zIndex = "", b.style.width = `${S.eslWidth}px`, b.style.height = `${S.eslHeight}px`, b.style.flex = `0 0 ${S.eslWidth}px`, b.style.display = "flex"), C && C.setAttribute("aria-pressed", "true"), V && V.setAttribute("aria-pressed", "true");
    }), (ee = this.shadow.getElementById("select-cc-lang")) == null || ee.addEventListener("change", async (r) => {
      if (this.prefs.captionLanguage = r.target.value, I({ captionLanguage: this.prefs.captionLanguage }), F) {
        const v = this.prefs.captionLanguage === "off";
        F.setAttribute("aria-pressed", v ? "false" : "true"), F.setAttribute("title", `Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`), F.setAttribute(
          "aria-label",
          this.activeLocale === "am" ? `የትርጉም ጽሑፍ: ${this.prefs.captionLanguage.toUpperCase()} (C)` : `Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`
        );
      }
      await this.loadCaptionTrack(this.prefs.captionLanguage);
    }), (te = this.shadow.getElementById("select-cc-size")) == null || te.addEventListener("change", (r) => {
      this.prefs.captionSize = r.target.value, I({ captionSize: this.prefs.captionSize }), this.updateCaptionDisplay();
    }), (ie = this.shadow.getElementById("select-cc-theme")) == null || ie.addEventListener("change", (r) => {
      this.prefs.captionTheme = r.target.value, I({ captionTheme: this.prefs.captionTheme }), this.updateCaptionDisplay();
    });
    const f = this.shadow.getElementById("transcript-search");
    f == null || f.addEventListener("input", () => {
      this.transcriptViewer.setSearchQuery(f.value);
    });
    const $ = this.shadow.getElementById("player-container");
    $ == null || $.addEventListener("keydown", (r) => {
      if (this.isPreferencesOpen) {
        r.key === "Escape" && (this.isPreferencesOpen = !1, l && (l.style.display = "none"), z == null || z.focus());
        return;
      }
      if (!(r.target.tagName === "INPUT" || r.target.tagName === "SELECT"))
        switch (r.key) {
          case " ":
          case "k":
          case "K":
            r.preventDefault(), g();
            break;
          case "j":
          case "J":
          case "ArrowLeft":
            r.preventDefault(), this.mainVideo.currentTime = Math.max(0, this.mainVideo.currentTime - 5);
            break;
          case "l":
          case "L":
          case "ArrowRight":
            r.preventDefault(), this.mainVideo.currentTime = Math.min(this.mainVideo.duration || 1e3, this.mainVideo.currentTime + 5);
            break;
          case "m":
          case "M":
            r.preventDefault(), K();
            break;
          case "f":
          case "F":
            r.preventDefault(), q();
            break;
          case "0":
          case "Home":
            r.preventDefault(), this.mainVideo.currentTime = 0, this.mainVideo.play(), this.transcriptViewer.updateActiveTime(0);
            break;
          case ">":
          case ".":
            r.preventDefault(), o == null || o.click();
            break;
          case "<":
          case ",":
            r.preventDefault(), h == null || h.click();
            break;
          case "c":
          case "C":
            r.preventDefault(), F == null || F.click();
            break;
          case "s":
          case "S":
            r.preventDefault(), C == null || C.click();
            break;
          case "d":
          case "D":
            r.preventDefault(), M == null || M.click();
            break;
          case "t":
          case "T":
            r.preventDefault(), V == null || V.click();
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
customElements.get("a11y-media-player") || customElements.define("a11y-media-player", he);
const pe = [
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
function ue(u) {
  const s = typeof u == "string" ? new Date(u) : u, e = s.getUTCFullYear(), i = s.getUTCMonth() + 1, t = s.getUTCDate(), a = Math.floor((14 - i) / 12), o = e + 4800 - a, h = i + 12 * a - 3, x = t + Math.floor((153 * h + 2) / 5) + 365 * o + Math.floor(o / 4) - Math.floor(o / 100) + Math.floor(o / 400) - 32045, L = (x - 1723856) % 1461, p = L % 365 + 365 * Math.floor(L / 1460), n = 4 * Math.floor((x - 1723856) / 1461) + Math.floor(L / 365) - Math.floor(L / 1460), m = Math.floor(p / 30) + 1, T = p % 30 + 1, k = pe[Math.min(m - 1, 12)];
  return {
    year: n,
    month: m,
    day: T,
    monthNameAmharic: k
  };
}
function ge(u) {
  const s = ue(u), e = `${s.monthNameAmharic} ${s.day}፣ ${s.year} ዓ.ም`;
  return {
    iso: u,
    ethiopic: e,
    display: `${u} (${e})`
  };
}
class me extends HTMLElement {
  constructor() {
    super();
    d(this, "shadow");
    d(this, "job", null);
    d(this, "activeLocale", "en");
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
    const e = this.activeLocale === "am", i = this.job.title[this.activeLocale] || this.job.title.en, t = this.job.location[this.activeLocale] || this.job.location.en, a = this.job.description[this.activeLocale] || this.job.description.en, o = this.job.applicationDeadline ? ge(this.job.applicationDeadline) : null, h = {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      title: i,
      description: a,
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
        ${JSON.stringify(h)}
      <\/script>

      <article class="card" aria-labelledby="job-title-${this.job.id}">
        <header>
          <h4 id="job-title-${this.job.id}">${i}</h4>
          <div class="meta-line">
            <span><strong>${this.job.employer}</strong></span> &bull;
            <span>${t}</span> &bull;
            <span>${this.job.workMode.toUpperCase()}</span>
            ${o ? ` &bull; <span class="badge calendar" aria-label="Deadline: ${o.display}">📅 ${e ? "የማመልከቻ ማብቂያ፦" : "Deadline:"} ${o.display}</span>` : ""}
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

        <p>${a}</p>

        <!-- Transparent Accommodations -->
        <div>
          <strong id="acc-heading-${this.job.id}">${e ? "የተረጋገጡ ማመቻቸቶች (Accommodations Offered):" : "Employer-Provided Accommodations:"}</strong>
          <ul class="tags-list" aria-labelledby="acc-heading-${this.job.id}">
            ${this.job.accommodations.map(
      (x) => `
              <li class="badge accommodation">
                <span aria-hidden="true">✓</span>
                <span>${x.label[this.activeLocale] || x.label.en}</span>
                <small style="opacity: 0.85;">(${x.source})</small>
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
customElements.get("a11y-job-card") || customElements.define("a11y-job-card", me);
const fe = "abugida-media", be = 1;
class we {
  constructor() {
    d(this, "db", null);
    d(this, "cacheName", "abugida-offline-v1");
  }
  async init() {
    if (!this.db)
      return new Promise((s, e) => {
        const i = indexedDB.open(fe, be);
        i.onupgradeneeded = (t) => {
          const a = t.target.result;
          a.objectStoreNames.contains("preferences") || a.createObjectStore("preferences"), a.objectStoreNames.contains("progress") || a.createObjectStore("progress", { keyPath: "lessonId" }), a.objectStoreNames.contains("packages") || a.createObjectStore("packages", { keyPath: "packageKey" });
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
      const a = this.db.transaction("progress", "readonly").objectStore("progress").get(s);
      a.onsuccess = () => e(a.result || null), a.onerror = () => e(null);
    });
  }
  // --- 3G Offline Package Download Engine ---
  async downloadPackage(s, e, i, t, a) {
    await this.init();
    const o = `${s}:${e}`;
    if (!("caches" in window))
      throw new Error("Cache Storage API is not supported in this browser.");
    try {
      const h = await caches.open(this.cacheName);
      let x = 0;
      const L = t.length;
      for (const p of t) {
        const n = await fetch(p);
        if (!n.ok)
          throw new Error(`Failed to fetch asset: ${p} (${n.status})`);
        await h.put(p, n.clone()), x++;
        const m = Math.round(x / L * 100);
        a(m, x, L);
      }
      return await this.savePackageRecord({
        packageKey: o,
        lessonId: s,
        packageId: e,
        packageName: i,
        status: "ready",
        totalBytes: 32e5,
        downloadedBytes: 32e5,
        timestamp: Date.now()
      }), !0;
    } catch (h) {
      throw await this.savePackageRecord({
        packageKey: o,
        lessonId: s,
        packageId: e,
        packageName: i,
        status: "error",
        totalBytes: 32e5,
        downloadedBytes: 0,
        timestamp: Date.now(),
        error: h instanceof Error ? h.message : "Download failed"
      }), h;
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
      const a = this.db.transaction("packages", "readonly").objectStore("packages").get(s);
      a.onsuccess = () => e(a.result || null), a.onerror = () => e(null);
    }) : null;
  }
}
const ye = new we();
export {
  me as A11yJobCard,
  he as A11yMediaPlayer,
  S as DEFAULT_PREFERENCES,
  pe as ETHIOPIC_MONTHS,
  ce as MediaSyncController,
  we as OfflineStorageManager,
  de as TranscriptViewer,
  ge as formatDualDate,
  le as getThemeStyles,
  G as loadPreferences,
  ye as offlineStorage,
  oe as parseVTT,
  re as resetPreferences,
  I as savePreferences,
  ue as toEthiopianDate
};
//# sourceMappingURL=a11y-media-kit.es.js.map
