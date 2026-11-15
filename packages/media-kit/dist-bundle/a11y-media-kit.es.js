var Ge = Object.defineProperty;
var Je = (f, a, e) => a in f ? Ge(f, a, { enumerable: !0, configurable: !0, writable: !0, value: e }) : f[a] = e;
var g = (f, a, e) => Je(f, typeof a != "symbol" ? a + "" : a, e);
const Ve = "abugida_media_preferences", H = {
  captionLanguage: "en",
  captionSize: "medium",
  captionTheme: "default",
  videoQuality: "auto",
  audioDescriptionEnabled: !1,
  eslVisible: !0,
  eslPosition: "bottom-right",
  eslSize: "medium",
  playbackRate: 1,
  transcriptVisible: !0,
  transcriptWidth: 260,
  transcriptHeight: 400,
  eslWidth: 240,
  eslHeight: 180
};
function De() {
  try {
    const f = localStorage.getItem(Ve);
    if (!f) return { ...H };
    const a = JSON.parse(f);
    return { ...H, ...a };
  } catch {
    return { ...H };
  }
}
function C(f) {
  try {
    const e = { ...De(), ...f };
    return localStorage.setItem(Ve, JSON.stringify(e)), e;
  } catch {
    return { ...H, ...f };
  }
}
function Xe() {
  try {
    localStorage.removeItem(Ve);
  } catch {
  }
  return { ...H };
}
function Oe(f) {
  const a = [], e = f.split(/\r?\n/);
  let i = 0;
  for (; i < e.length && !e[i].includes("-->"); )
    i++;
  for (; i < e.length; ) {
    const t = e[i].trim();
    if (t.includes("-->")) {
      const s = t.split("-->").map((r) => r.trim().split(" ")[0]);
      if (s.length >= 2) {
        const r = Ne(s[0]), c = Ne(s[1]);
        i++;
        const l = [];
        for (; i < e.length && e[i].trim() !== ""; )
          l.push(e[i].trim()), i++;
        l.length > 0 && a.push({
          start: r,
          end: c,
          text: l.join(`
`)
        });
      }
    }
    i++;
  }
  return a;
}
function Ne(f) {
  const a = f.split(":");
  let e = 0, i = 0, t = 0;
  return a.length === 3 ? (e = parseFloat(a[0]), i = parseFloat(a[1]), t = parseFloat(a[2].replace(",", "."))) : a.length === 2 && (i = parseFloat(a[0]), t = parseFloat(a[1].replace(",", "."))), e * 3600 + i * 60 + t;
}
function Ye(f, a) {
  let e = "18px";
  a === "small" && (e = "14px"), a === "large" && (e = "24px"), a === "xlarge" && (e = "32px");
  let i = "#FFFFFF", t = "rgba(0, 0, 0, 0.85)", s = "none";
  return f === "yellow-black" ? (i = "#FFEB3B", t = "#000000", s = "2px solid #FFEB3B") : f === "white-black" ? (i = "#FFFFFF", t = "#000000", s = "2px solid #FFFFFF") : f === "black-yellow" ? (i = "#000000", t = "#FFEB3B", s = "2px solid #000000") : f === "amber-gold" && (i = "#FFD700", t = "#000000", s = "2px solid #FFD700"), `
    font-size: ${e};
    color: ${i};
    background: ${t};
    border: ${s};
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
class Ze {
  constructor(a, e) {
    g(this, "mainVideo");
    g(this, "signVideo", null);
    g(this, "driftThreshold");
    g(this, "isSyncing", !1);
    g(this, "onSignStatusChange");
    // Stored listener references for clean teardown
    g(this, "mainListeners", {});
    g(this, "signListeners", {});
    this.mainVideo = a, this.driftThreshold = (e == null ? void 0 : e.driftThreshold) ?? 0.25, this.onSignStatusChange = e == null ? void 0 : e.onSignStatusChange, this.setupMainListeners();
  }
  setSignVideo(a) {
    if (this.cleanupSignListeners(), this.signVideo = a, this.signVideo) {
      if (this.signVideo.muted = !0, this.signVideo.playsInline = !0, this.signVideo.playbackRate = this.mainVideo.playbackRate, !isNaN(this.mainVideo.currentTime) && this.mainVideo.currentTime > 0)
        try {
          this.signVideo.currentTime = this.mainVideo.currentTime;
        } catch {
        }
      this.setupSignListeners(), this.notifyStatus(this.signVideo.readyState >= 2 ? "ready" : "loading");
    } else
      this.notifyStatus("none");
  }
  notifyStatus(a) {
    this.onSignStatusChange && this.onSignStatusChange(a);
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
    for (const [a, e] of Object.entries(this.mainListeners))
      this.mainVideo.addEventListener(a, e);
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
      for (const [a, e] of Object.entries(this.signListeners))
        this.signVideo.addEventListener(a, e);
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
  async switchSource(a) {
    const e = !this.mainVideo.paused, i = isNaN(this.mainVideo.currentTime) ? 0 : this.mainVideo.currentTime, t = this.mainVideo.playbackRate || 1;
    return this.mainVideo.src = a, this.mainVideo.load(), new Promise((s) => {
      let r = !1;
      const c = async () => {
        if (!r) {
          r = !0, this.mainVideo.removeEventListener("loadedmetadata", c), this.mainVideo.removeEventListener("canplay", c), this.mainVideo.removeEventListener("error", c), clearTimeout(l);
          try {
            if (!isNaN(i) && i > 0 && (this.mainVideo.currentTime = i), this.mainVideo.playbackRate = t, e && await this.mainVideo.play().catch(() => {
            }), this.signVideo) {
              if (!isNaN(i) && i > 0)
                try {
                  this.signVideo.currentTime = i;
                } catch {
                }
              e ? this.signVideo.play().catch(() => {
              }) : this.signVideo.pause();
            }
          } catch {
          }
          s();
        }
      }, l = setTimeout(c, 600);
      this.mainVideo.addEventListener("loadedmetadata", c), this.mainVideo.addEventListener("canplay", c), this.mainVideo.addEventListener("error", c);
    });
  }
  cleanupSignListeners() {
    if (this.signVideo)
      for (const [a, e] of Object.entries(this.signListeners))
        this.signVideo.removeEventListener(a, e);
    this.signListeners = {};
  }
  destroy() {
    for (const [a, e] of Object.entries(this.mainListeners))
      this.mainVideo.removeEventListener(a, e);
    this.mainListeners = {}, this.cleanupSignListeners(), this.signVideo = null;
  }
}
class et {
  constructor(a, e) {
    g(this, "segments", []);
    g(this, "container");
    g(this, "onSeekAndPlay");
    g(this, "onFollowChange");
    g(this, "currentActiveId", null);
    g(this, "searchQuery", "");
    g(this, "isFollowing", !0);
    g(this, "userPausedFollowing", !1);
    g(this, "locale", "en");
    g(this, "listElement", null);
    g(this, "followBtn", null);
    g(this, "statusElement", null);
    this.container = a, this.onSeekAndPlay = e.onSeekAndPlay, this.onFollowChange = e.onFollowChange, this.locale = e.locale || "en";
  }
  setLocale(a) {
    this.locale !== a && (this.locale = a, this.render());
  }
  setSegments(a) {
    this.segments = a.map((e) => ({
      ...e,
      start: Number(e.start) || 0,
      end: Number(e.end) || 0
    })).sort((e, i) => e.start - i.start), this.render();
  }
  getSegments() {
    return [...this.segments];
  }
  setSearchQuery(a) {
    this.searchQuery = a.toLowerCase().trim(), this.render();
  }
  getActiveSegment(a) {
    return this.segments.length && this.segments.find((e) => a >= e.start && a < e.end) || null;
  }
  updateActiveTime(a) {
    const e = this.getActiveSegment(a), i = e ? e.id : null;
    i !== this.currentActiveId && (this.currentActiveId = i, this.highlightSegment(i), this.isFollowing && i !== null && this.scrollToActiveCue(i));
  }
  highlightSegment(a) {
    if (!this.container) return;
    const e = this.container.querySelector(".transcript-item.active");
    if (e && e.classList.remove("active"), a !== null) {
      const i = this.container.querySelector(`[data-segment-id="${a}"]`);
      i && i.classList.add("active");
    }
  }
  scrollToActiveCue(a) {
    if (!this.listElement) return;
    const e = this.listElement.querySelector(`[data-segment-id="${a}"]`);
    if (!e) return;
    this.listElement.scrollTop;
    const i = this.listElement.clientHeight, t = e.offsetTop, s = e.clientHeight, r = t - i / 2 + s / 2;
    this.listElement.scrollTo({
      top: Math.max(0, r),
      behavior: "smooth"
    });
  }
  setFollowing(a) {
    this.setFollowingState(a, !0);
  }
  setFollowingState(a, e = !1) {
    var i;
    if (this.isFollowing = a, e && (this.userPausedFollowing = !a), (i = this.onFollowChange) == null || i.call(this, a), this.followBtn) {
      this.followBtn.setAttribute("aria-pressed", a ? "true" : "false");
      const t = this.locale === "am";
      a ? (this.followBtn.textContent = t ? "✓ በተከታታይ አንብብ" : "✓ Follow Playback", this.followBtn.setAttribute(
        "aria-label",
        t ? "የጽሑፍ ግልባጭ ተከታትሎ ማንበብ በርቷል" : "Follow playback active (Click to pause auto-scroll)"
      )) : (this.followBtn.textContent = t ? "↻ ተከታትሎ ማንበብ ቀጥል" : "↻ Resume Following", this.followBtn.setAttribute(
        "aria-label",
        t ? "ተከታትሎ ማንበብ ቆሟል፤ እንደገና ለማስጀመር ይጫኑ" : "Following paused (Click to resume auto-scroll)"
      ));
    }
    a && this.currentActiveId !== null && this.scrollToActiveCue(this.currentActiveId);
  }
  formatTime(a) {
    const e = Math.floor(a / 60), i = Math.floor(a % 60);
    return `${e.toString().padStart(2, "0")}:${i.toString().padStart(2, "0")}`;
  }
  render() {
    var i;
    const a = this.locale === "am", e = this.searchQuery ? this.segments.filter(
      (t) => t.text.toLowerCase().includes(this.searchQuery) || t.speaker && t.speaker.toLowerCase().includes(this.searchQuery) || t.visualDescription && t.visualDescription.toLowerCase().includes(this.searchQuery)
    ) : this.segments;
    if (this.container.innerHTML = `
      <div class="transcript-controls-row">
        <button 
          type="button" 
          id="btn-toggle-follow" 
          class="btn-follow ${this.isFollowing ? "active" : ""}" 
          aria-pressed="${this.isFollowing ? "true" : "false"}"
          aria-label="${this.isFollowing ? a ? "የጽሑፍ ግልባጭ ተከታትሎ ማንበብ በርቷል" : "Follow playback active (Click to pause auto-scroll)" : a ? "ተከታትሎ ማንበብ ቆሟል፤ እንደገና ለማስጀመር ይጫኑ" : "Following paused (Click to resume auto-scroll)"}">
          ${this.isFollowing ? a ? "✓ በተከታታይ አንብብ" : "✓ Follow Playback" : a ? "↻ ተከታትሎ ማንበብ ቀጥል" : "↻ Resume Following"}
        </button>
      </div>

      ${e.length === 0 ? `<p class="empty-msg" role="status">
              ${a ? "ምንም የሚዛመድ የጽሑፍ ግልባጭ አልተገኘም።" : "No transcript segments match your search."}
            </p>` : `
          <ul class="transcript-list" role="list" id="transcript-list-box" tabindex="0" aria-label="${a ? "የጽሑፍ ግልባጭ ዝርዝር" : "Transcript cues"}">
            ${e.map((t) => {
      const s = this.formatTime(t.start), r = t.id === this.currentActiveId, c = a ? `ከ ${s} ጀምሮ አጫውት` : `Play from ${s}`;
      return `
                <li class="transcript-item ${r ? "active" : ""}" data-segment-id="${t.id}">
                  <button 
                    type="button" 
                    class="btn-seek-time" 
                    data-time="${t.start}" 
                    aria-label="${c}">
                    ${s}
                  </button>
                  <div class="segment-content">
                    ${t.speaker ? `<strong class="speaker-label">${this.escapeHtml(t.speaker)}:</strong>` : ""}
                    <span class="segment-text">${this.escapeHtml(t.text)}</span>
                    ${t.visualDescription ? `<div class="visual-desc" aria-label="${a ? "ምስላዊ ማብራሪያ" : "Visual Description"}: ${this.escapeHtml(t.visualDescription)}">
                            <em>[${a ? "ምስላዊ" : "Visual"}: ${this.escapeHtml(t.visualDescription)}]</em>
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
      this.listElement.addEventListener("wheel", t, { passive: !0 }), this.listElement.addEventListener("touchmove", t, { passive: !0 }), this.listElement.addEventListener("keydown", (s) => {
        ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(s.key) && t();
      });
    }
    this.container.querySelectorAll(".btn-seek-time").forEach((t) => {
      t.addEventListener("click", (s) => {
        const r = parseFloat(s.currentTarget.dataset.time || "0");
        this.onSeekAndPlay(r), s.currentTarget.focus();
      });
    });
  }
  escapeHtml(a) {
    return a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
}
class tt {
  constructor(a, e) {
    g(this, "container");
    g(this, "messages", []);
    g(this, "locale", "en");
    g(this, "onSeekAndPlay");
    g(this, "currentTime", 0);
    g(this, "searchQuery", "");
    g(this, "isAutoScroll", !0);
    g(this, "isQuestionsOnly", !1);
    g(this, "listElement", null);
    g(this, "currentActiveId", null);
    this.container = a, this.locale = e.locale || "en", this.onSeekAndPlay = e.onSeekAndPlay;
  }
  setLocale(a) {
    this.locale !== a && (this.locale = a, this.render());
  }
  setMessages(a) {
    this.messages = [...a].sort((e, i) => e.timestamp - i.timestamp), this.render();
  }
  setSearchQuery(a) {
    this.searchQuery = a.toLowerCase().trim(), this.render();
  }
  setQuestionsOnly(a) {
    this.isQuestionsOnly !== a && (this.isQuestionsOnly = a, this.render());
  }
  setAutoScroll(a) {
    this.isAutoScroll = a;
  }
  updateTime(a) {
    this.currentTime = a;
    const e = this.messages.filter((s) => s.timestamp <= a), i = e.length > 0 ? e[e.length - 1] : null, t = i ? i.id : null;
    t !== this.currentActiveId && (this.currentActiveId = t, this.updateActiveStyles(), this.isAutoScroll && t && this.scrollToMessage(t));
  }
  updateActiveStyles() {
    if (!this.container) return;
    this.container.querySelectorAll(".chat-replay-item").forEach((e) => {
      const i = e.getAttribute("data-chat-id");
      Number(e.getAttribute("data-timestamp") || "0") <= this.currentTime ? (e.classList.add("is-delivered"), e.classList.remove("is-future")) : (e.classList.remove("is-delivered"), e.classList.add("is-future")), i === this.currentActiveId ? e.classList.add("is-active-latest") : e.classList.remove("is-active-latest");
    });
  }
  scrollToMessage(a) {
    if (!this.listElement) return;
    const e = this.listElement.querySelector(`[data-chat-id="${a}"]`);
    e && e.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  render() {
    const a = this.locale === "am";
    if (!this.messages.length) {
      this.container.innerHTML = `
        <div class="chat-empty-state" role="status" style="padding: 1.5rem; text-align: center; color: #64748B; font-size: 0.88rem;">
          ${a ? "የቀጥታ ውይይት መልዕክቶች አልተገኙም።" : "No live chat messages recorded for this session."}
        </div>
      `;
      return;
    }
    const e = this.messages.filter((t) => {
      const s = t.message.en.includes("?") || t.message.am.includes("?") || t.message.am.includes("፧");
      if (this.isQuestionsOnly && !s) return !1;
      if (!this.searchQuery) return !0;
      const r = (a ? t.message.am : t.message.en).toLowerCase(), c = t.sender.toLowerCase();
      return r.includes(this.searchQuery) || c.includes(this.searchQuery);
    });
    this.container.innerHTML = `
      <ol class="chat-replay-list" role="list" aria-label="${a ? "የቀጥታ ትምህርት ውይይት መልዕክቶች" : "Recorded live session chat messages"}" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.65rem;">
        ${e.map((t) => {
      const s = t.timestamp <= this.currentTime, r = t.id === this.currentActiveId, c = t.role === "instructor", l = t.role === "ta", d = t.message.en.includes("?") || t.message.am.includes("?") || t.message.am.includes("፧"), m = c ? a ? "አስተማሪ" : "Instructor" : l ? a ? "ረዳት" : "TA" : a ? "ተማሪ" : "Student", n = c ? "rgba(0, 113, 227, 0.12)" : l ? "rgba(16, 185, 129, 0.14)" : "var(--color-surface, #F1F5F9)", E = c ? "var(--color-brand, #0071E3)" : l ? "#059669" : "var(--color-muted-ink, #475569)", v = r ? "var(--color-brand, #0071E3)" : c ? "#0071E3" : l ? "#10B981" : "var(--color-border, #CBD5E1)", y = a ? t.message.am : t.message.en, h = a ? `ወደ ${t.timeDisplay} ይዝለሉ እና የ ${t.sender} ጥያቄ ያዳምጡ` : `Jump to ${t.timeDisplay} to hear discussion with ${t.sender}`;
      return `
              <li 
                class="chat-replay-item ${s ? "is-delivered" : "is-future"} ${r ? "is-active-latest" : ""}"
                data-chat-id="${t.id}"
                data-timestamp="${t.timestamp}"
                tabindex="0"
                role="button"
                aria-label="${h}"
                title="${h}"
                style="
                  display: flex;
                  flex-direction: column;
                  padding: 0.65rem 0.85rem;
                  border-radius: 6px;
                  background: ${r ? "var(--color-brand-subtle, #EFF6FF)" : "var(--color-surface-elevated, #FFFFFF)"};
                  border: 1px solid var(--color-border-subtle, #E2E8F0);
                  border-left: 3.5px solid ${v};
                  color: var(--color-ink, inherit);
                  cursor: pointer;
                  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
                  opacity: ${s ? "1" : "0.55"};
                ">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem; gap: 0.5rem;">
                  <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                    <span style="font-weight: 600; font-size: 0.82rem; color: var(--color-ink, #0F172A);">${t.sender}</span>
                    <span style="
                      font-size: 0.68rem;
                      font-weight: 700;
                      text-transform: uppercase;
                      padding: 1px 6px;
                      border-radius: 4px;
                      background: ${n};
                      color: ${E};
                    ">${m}</span>
                    ${d ? `<span style="font-size: 0.68rem; font-weight: 600; background: rgba(217, 119, 6, 0.15); color: #B45309; padding: 1px 5px; border-radius: 4px;">❓ ${a ? "ጥያቄ" : "Question"}</span>` : ""}
                  </div>
                  <span 
                    class="btn-chat-timestamp" 
                    style="
                      font-family: monospace;
                      font-size: 0.75rem;
                      font-weight: 600;
                      color: var(--color-brand, #0071E3);
                      background: var(--color-surface, #F0F6FF);
                      padding: 2px 6px;
                      border-radius: 4px;
                      border: 1px solid var(--color-border, #BFDBFE);
                    ">
                    ▶ ${t.timeDisplay}
                  </span>
                </div>
                <div style="font-size: 0.85rem; line-height: 1.45; color: var(--color-ink, #334155);">
                  ${y}
                </div>
              </li>
            `;
    }).join("")}
      </ol>
    `, this.listElement = this.container.querySelector(".chat-replay-list"), this.container.querySelectorAll(".chat-replay-item").forEach((t) => {
      const s = Number(t.getAttribute("data-timestamp") || "0"), r = () => {
        this.onSeekAndPlay(s);
      };
      t.addEventListener("click", r), t.addEventListener("keydown", (c) => {
        const l = c;
        (l.key === "Enter" || l.key === " ") && (l.preventDefault(), r());
      });
    });
  }
}
const We = {
  a: "⠁",
  b: "⠃",
  c: "⠉",
  d: "⠙",
  e: "⠑",
  f: "⠋",
  g: "⠛",
  h: "⠓",
  i: "⠊",
  j: "⠚",
  k: "⠅",
  l: "⠇",
  m: "⠍",
  n: "⠝",
  o: "⠕",
  p: "⠏",
  q: "⠟",
  r: "⠗",
  s: "⠎",
  t: "⠞",
  u: "⠥",
  v: "⠧",
  w: "⠺",
  x: "⠭",
  y: "⠽",
  z: "⠵",
  " ": " ",
  ".": "⠲",
  ",": "⠂",
  ";": "⠆",
  ":": "⠒",
  "!": "⠖",
  "?": "⠦",
  "-": "⠤",
  "(": "⠶",
  ")": "⠶",
  '"': "⠦",
  "'": "⠄",
  "/": "⠌"
}, Qe = {
  // ሀ (h)
  ሀ: "⠓⠁",
  ሁ: "⠓⠥",
  ሂ: "⠓⠊",
  ሃ: "⠓⠜",
  ሄ: "⠓⠑",
  ህ: "⠓",
  ሆ: "⠓⠕",
  // ለ (l)
  ለ: "⠇⠁",
  ሉ: "⠇⠥",
  ሊ: "⠇⠊",
  ላ: "⠇⠜",
  ሌ: "⠇⠑",
  ል: "⠇",
  ሎ: "⠇⠕",
  // ሐ (h)
  ሐ: "⠓⠁",
  ሑ: "⠓⠥",
  ሒ: "⠓⠊",
  ሓ: "⠓⠜",
  ሔ: "⠓⠑",
  ሕ: "⠓",
  ሖ: "⠓⠕",
  // መ (m)
  መ: "⠍⠁",
  ሙ: "⠍⠥",
  ሚ: "⠍⠊",
  ማ: "⠍⠜",
  ሜ: "⠍⠑",
  ም: "⠍",
  ሞ: "⠍⠕",
  // ሠ (s)
  ሠ: "⠎⠁",
  ሡ: "⠎⠥",
  ሢ: "⠎⠊",
  ሣ: "⠎⠜",
  ሤ: "⠎⠑",
  ሥ: "⠎",
  ሦ: "⠎⠕",
  // ረ (r)
  ረ: "⠗⠁",
  ሩ: "⠗⠥",
  ሪ: "⠗⠊",
  ራ: "⠗⠜",
  ሬ: "⠗⠑",
  ር: "⠗",
  ሮ: "⠗⠕",
  // ሰ (s)
  ሰ: "⠎⠁",
  ሱ: "⠎⠥",
  ሲ: "⠎⠊",
  ሳ: "⠎⠜",
  ሴ: "⠎⠑",
  ስ: "⠎",
  ሶ: "⠎⠕",
  // ሸ (sh)
  ሸ: "⠩⠁",
  ሹ: "⠩⠥",
  ሺ: "⠩⠊",
  ሻ: "⠩⠜",
  ሼ: "⠩⠑",
  ሽ: "⠩",
  ሾ: "⠩⠕",
  // ቀ (q)
  ቀ: "⠟⠁",
  ቁ: "⠟⠥",
  ቂ: "⠟⠊",
  ቃ: "⠟⠜",
  ቄ: "⠟⠑",
  ቅ: "⠟",
  ቆ: "⠟⠕",
  // በ (b)
  በ: "⠃⠁",
  ቡ: "⠃⠥",
  ቢ: "⠃⠊",
  ባ: "⠃⠜",
  ቤ: "⠃⠑",
  ብ: "⠃",
  ቦ: "⠃⠕",
  // ቨ (v)
  ቨ: "⠧⠁",
  ቩ: "⠧⠥",
  ቪ: "⠧⠊",
  ቫ: "⠧⠜",
  ቬ: "⠧⠑",
  ቭ: "⠧",
  ቮ: "⠧⠕",
  // ተ (t)
  ተ: "⠞⠁",
  ቱ: "⠞⠥",
  ቲ: "⠞⠊",
  ታ: "⠞⠜",
  ቴ: "⠞⠑",
  ት: "⠞",
  ቶ: "⠞⠕",
  // ቸ (ch)
  ቸ: "⠡⠁",
  ቹ: "⠡⠥",
  ቺ: "⠡⠊",
  ቻ: "⠡⠜",
  ቼ: "⠡⠑",
  ች: "⠡",
  ቾ: "⠡⠕",
  // ኀ (h)
  ኀ: "⠭⠁",
  ኁ: "⠭⠥",
  ኂ: "⠭⠊",
  ኃ: "⠭⠜",
  ኄ: "⠭⠑",
  ኅ: "⠭",
  ኆ: "⠭⠕",
  // ነ (n)
  ነ: "⠝⠁",
  ኑ: "⠝⠥",
  ኒ: "⠝⠊",
  ና: "⠝⠜",
  ኔ: "⠝⠑",
  ን: "⠝",
  ኖ: "⠝⠕",
  // ኘ (ny)
  ኘ: "⠻⠁",
  ኙ: "⠻⠥",
  ኚ: "⠻⠊",
  ኛ: "⠻⠜",
  ኜ: "⠻⠑",
  ኝ: "⠻",
  ኞ: "⠻⠕",
  // አ (a)
  አ: "⠁",
  ኡ: "⠥",
  ኢ: "⠊",
  ኣ: "⠜",
  ኤ: "⠑",
  እ: "⠢",
  ኦ: "⠕",
  // ከ (k)
  ከ: "⠅⠁",
  ኩ: "⠅⠥",
  ኪ: "⠅⠊",
  ካ: "⠅⠜",
  ኬ: "⠅⠑",
  ክ: "⠅",
  ኮ: "⠅⠕",
  // ኸ (kh)
  ኸ: "⠭⠁",
  ኹ: "⠭⠥",
  ኺ: "⠭⠊",
  ኻ: "⠭⠜",
  ኼ: "⠭⠑",
  ኽ: "⠭",
  ኾ: "⠭⠕",
  // ወ (w)
  ወ: "⠺⠁",
  ዉ: "⠺⠥",
  ዊ: "⠺⠊",
  ዋ: "⠺⠜",
  ዌ: "⠺⠑",
  ው: "⠺",
  ዎ: "⠺⠕",
  // ዐ (a)
  ዐ: "⠷⠁",
  ዑ: "⠷⠥",
  ዒ: "⠷⠊",
  ዓ: "⠷⠜",
  ዔ: "⠷⠑",
  ዕ: "⠷",
  ዖ: "⠷⠕",
  // ዘ (z)
  ዘ: "⠵⠁",
  ዙ: "⠵⠥",
  ዚ: "⠵⠊",
  ዛ: "⠵⠜",
  ዜ: "⠵⠑",
  ዝ: "⠵",
  ዞ: "⠵⠕",
  // ዠ (zh)
  ዠ: "⠮⠁",
  ዡ: "⠮⠥",
  ዢ: "⠮⠊",
  ዣ: "⠮⠜",
  ዤ: "⠮⠑",
  ዥ: "⠮",
  ዦ: "⠮⠕",
  // የ (y)
  የ: "⠽⠁",
  ዩ: "⠽⠥",
  ዪ: "⠽⠊",
  ያ: "⠽⠜",
  ዬ: "⠽⠑",
  ይ: "⠽",
  ዮ: "⠽⠕",
  // ደ (d)
  ደ: "⠙⠁",
  ዱ: "⠙⠥",
  ዲ: "⠙⠊",
  ዳ: "⠙⠜",
  ዴ: "⠙⠑",
  ድ: "⠙",
  ዶ: "⠙⠕",
  // ጀ (j)
  ጀ: "⠚⠁",
  ጁ: "⠚⠥",
  ጂ: "⠚⠊",
  ጃ: "⠚⠜",
  ጄ: "⠚⠑",
  ጅ: "⠚",
  ጆ: "⠚⠕",
  // ገ (g)
  ገ: "⠛⠁",
  ጉ: "⠛⠥",
  ጊ: "⠛⠊",
  ጋ: "⠛⠜",
  ጌ: "⠛⠑",
  ግ: "⠛",
  ጎ: "⠛⠕",
  // ጠ (t')
  ጠ: "⠾⠁",
  ጡ: "⠾⠥",
  ጢ: "⠾⠊",
  ጣ: "⠾⠜",
  ጤ: "⠾⠑",
  ጥ: "⠾",
  ጦ: "⠾⠕",
  // ጨ (ch')
  ጨ: "⠹⠁",
  ጩ: "⠹⠥",
  ጪ: "⠹⠊",
  ጫ: "⠹⠜",
  ጬ: "⠹⠑",
  ጭ: "⠹",
  ጮ: "⠹⠕",
  // ጰ (p')
  ጰ: "⠯⠁",
  ጱ: "⠯⠥",
  ጲ: "⠯⠊",
  ጳ: "⠯⠜",
  ጴ: "⠯⠑",
  ጵ: "⠯",
  ጶ: "⠯⠕",
  // ጸ (ts')
  ጸ: "⠪⠁",
  ጹ: "⠪⠥",
  ጺ: "⠪⠊",
  ጻ: "⠪⠜",
  ጼ: "⠪⠑",
  ጽ: "⠪",
  ጾ: "⠪⠕",
  // ፀ (ts')
  ፀ: "⠪⠁",
  ፁ: "⠪⠥",
  ፂ: "⠪⠊",
  ፃ: "⠪⠜",
  ፄ: "⠪⠑",
  ፅ: "⠪",
  ፆ: "⠪⠕",
  // ፈ (f)
  ፈ: "⠋⠁",
  ፉ: "⠋⠥",
  ፊ: "⠋⠊",
  ፋ: "⠋⠜",
  ፌ: "⠋⠑",
  ፍ: "⠋",
  ፎ: "⠋⠕",
  // ፐ (p)
  ፐ: "⠏⠁",
  ፑ: "⠏⠥",
  ፒ: "⠏⠊",
  ፓ: "⠏⠜",
  ፔ: "⠏⠑",
  ፕ: "⠏",
  ፖ: "⠏⠕",
  // Labialized
  ሏ: "⠇⠺⠜",
  ሟ: "⠍⠺⠜",
  ሯ: "⠗⠺⠜",
  ሷ: "⠎⠺⠜",
  ሿ: "⠩⠺⠜",
  ቋ: "⠟⠺⠜",
  ቧ: "⠃⠺⠜",
  ቷ: "⠞⠺⠜",
  ቿ: "⠡⠺⠜",
  ኗ: "⠝⠺⠜",
  ኟ: "⠻⠺⠜",
  ኳ: "⠅⠺⠜",
  ዟ: "⠵⠺⠜",
  ዧ: "⠮⠺⠜",
  ዷ: "⠙⠺⠜",
  ጇ: "⠚⠺⠜",
  ጧ: "⠾⠺⠜",
  ጯ: "⠹⠺⠜",
  ጷ: "⠯⠺⠜",
  ጿ: "⠪⠺⠜",
  ፏ: "⠋⠺⠜",
  // Numerals & Punctuation
  "፡": " ",
  "።": "⠲",
  "፣": "⠂",
  "፤": "⠆",
  "፥": "⠒",
  "፦": "⠒⠤",
  "፧": "⠦",
  "፨": "⠶",
  "፩": "⠼⠁",
  "፪": "⠼⠃",
  "፫": "⠼⠉",
  "፬": "⠼⠙",
  "፭": "⠼⠑",
  "፮": "⠼⠋",
  "፯": "⠼⠛",
  "፰": "⠼⠓",
  "፱": "⠼⠊",
  "፲": "⠼⠚"
};
function Ke(f) {
  let a = "";
  for (let e = 0; e < f.length; e++) {
    const i = f[e];
    if (Qe[i]) {
      a += Qe[i];
      continue;
    }
    const t = i.toLowerCase();
    i >= "A" && i <= "Z" ? a += "⠠" + (We[t] || t) : i >= "0" && i <= "9" ? ((e === 0 || !/[0-9]/.test(f[e - 1])) && (a += "⠼"), a += {
      1: "⠁",
      2: "⠃",
      3: "⠉",
      4: "⠙",
      5: "⠑",
      6: "⠋",
      7: "⠛",
      8: "⠓",
      9: "⠊",
      0: "⠚"
    }[i] || i) : a += We[t] || i;
  }
  return a;
}
const it = ` A1B'K2L@CIF/MSP"E3H9O6R^DJG>NTQ,*5<-U8V.%[$+X!&:;4\\0Z7(_?W]#Y=)`;
function at(f) {
  const a = /[\u2800-\u28FF]/.test(f) ? f : Ke(f);
  let e = "";
  for (let i = 0; i < a.length; i++) {
    const t = a.charCodeAt(i);
    t >= 10240 && t <= 10303 ? e += it[t - 10240] || " " : t === 32 || a[i] === " " ? e += " " : (a[i] === `
` || a[i], e += a[i]);
  }
  return e;
}
function Le(f, a = 40) {
  const e = f.split(/\s+/), i = [];
  let t = "";
  for (const s of e)
    if (s)
      if ((t + (t ? " " : "") + s).length <= a)
        t += (t ? " " : "") + s;
      else if (t && i.push(t), s.length > a) {
        let r = s;
        for (; r.length > a; )
          i.push(r.slice(0, a)), r = r.slice(a);
        t = r;
      } else
        t = s;
  return t && i.push(t), i;
}
function st(f) {
  const a = f.language === "am", e = [], i = 25, t = 40, s = "=".repeat(t);
  e.push(s), e.push(...Le(f.title.toUpperCase(), t)), e.push("STANDARD: BANA 40X25 GRADE-1 EMBOSSER"), e.push(`LANGUAGE: ${a ? "AMHARIC" : "ENGLISH"}`), e.push(`DATE: ${f.date || "2026-11-14 (HIDAR 5, 2019 E.C.)"}`), e.push(s), e.push("");
  for (let d = 0; d < f.segments.length; d++) {
    const m = f.segments[d], n = d + 1, E = Math.floor(m.start / 60).toString().padStart(2, "0"), v = Math.floor(m.start % 60).toString().padStart(2, "0"), y = Math.floor(m.end / 60).toString().padStart(2, "0"), h = Math.floor(m.end % 60).toString().padStart(2, "0"), A = m.speaker || (a ? "አስተማሪ" : "Instructor");
    e.push(`[#${n} ${E}:${v}-${y}:${h} ${A}]`);
    const u = Ke(m.text);
    e.push(...Le(u, t)), e.push(...Le(`TEXT: ${m.text}`, t));
    const D = at(u);
    e.push(...Le(`EMBOSSER: ${D}`, t)), e.push("");
  }
  const r = [];
  let c = [], l = 1;
  for (let d = 0; d < e.length; d++)
    if (c.push(e[d]), c.length === i - 1 || d === e.length - 1) {
      const n = `P.${l}`.padStart(t, " ");
      c.push(n), r.push(c.join(`\r
`)), c = [], l++;
    }
  return r.join(`\r
\f\r
`);
}
const V = {
  play: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',
  restart: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>',
  rewind: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>',
  forward: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>',
  cc: '<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-4a1 1 0 011-1h3a1 1 0 011 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1a1 1 0 01-1 1h-3a1 1 0 01-1-1v-4a1 1 0 011-1h3a1 1 0 011 1v1z"/></svg>',
  esl: '<svg viewBox="0 0 32 20" width="28" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="1.5" y="1.5" width="29" height="17" rx="3.5" fill="rgba(255,255,255,0.06)"/><text x="16" y="14" text-anchor="middle" fill="currentColor" stroke="none" font-size="11" font-weight="bold" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" letter-spacing="0.5">ESL</text></svg>',
  ad: '<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M3 3.5h6.2c4.2 0 7.3 3 7.3 7.5s-3.1 7.5-7.3 7.5H3V3.5zm3.6 3.4v8.2h2.4c2.2 0 3.7-1.7 3.7-4.1s-1.5-4.1-3.7-4.1H6.6z"/><path d="M17.5 8.5c1 1.5 1 3.5 0 5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M20.5 6c2 2.7 2 7.3 0 10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
  transcript: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',
  faster: '<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M12 4a9 9 0 0 0-9 9c0 2.4 1 4.5 2.6 6.1l1.4-1.4A7 7 0 0 1 5 13a7 7 0 0 1 12.6-4.2l1.5-1.5A9 9 0 0 0 12 4z"/><path d="M12.5 12.9a1.5 1.5 0 0 0 1-1.4c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5a1.5 1.5 0 0 0 .5 1.1l3.2 3.2 1.1-1.1-2.8-1.8z"/><path d="M18 12v6M15 15h6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  slower: '<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M12 4a9 9 0 0 0-9 9c0 2.4 1 4.5 2.6 6.1l1.4-1.4A7 7 0 0 1 5 13a7 7 0 0 1 12.6-4.2l1.5-1.5A9 9 0 0 0 12 4z"/><path d="M11 11.5a1.5 1.5 0 0 0-1 1.4c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5a1.5 1.5 0 0 0-.5-1.1l-3.2-3.2-1.1 1.1 2.8 1.8z"/><rect x="15" y="14" width="6" height="2.2" rx="1"/></svg>',
  prefs: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
  fullscreenEnter: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
  fullscreenExit: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>',
  volumeUnmuted: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',
  volumeMuted: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>',
  shortcuts: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/></svg>',
  quality: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm-8 11H9.5v-2h-2v2H6V9h1.5v2.5h2V9H11v6zm7-1c0 .55-.45 1-1 1h-4V9h4c.55 0 1 .45 1 1v4zm-1.5-3.5h-2v3h2v-3z"/></svg>'
};
class Ue extends HTMLElement {
  constructor() {
    super();
    g(this, "shadow");
    g(this, "manifest", null);
    g(this, "activeLocale", "en");
    g(this, "prefs");
    // Media & sync
    g(this, "mainVideo");
    g(this, "signVideo", null);
    g(this, "syncController");
    g(this, "pendingSeekTime", null);
    // Captions
    g(this, "currentCues", []);
    g(this, "captionOverlay");
    // Transcript & Live Chat Replay
    g(this, "transcriptViewer");
    g(this, "liveChatViewer");
    g(this, "liveChatMessages", []);
    g(this, "activeLeftTab", "transcript");
    // UI state
    g(this, "isPreferencesOpen", !1);
    g(this, "isQualityMenuOpen", !1);
    g(this, "isShortcutsOpen", !1);
    g(this, "activePopover", null);
    g(this, "onOutsidePointerDown", null);
    g(this, "isAudioMode", !1);
    g(this, "currentQuality", "auto");
    g(this, "qualityToastTimer", null);
    g(this, "onCaptionsUpdated", () => {
      this.initTracksAndTranscript();
    });
    this.shadow = this.attachShadow({ mode: "open" }), this.prefs = De(), this.currentQuality = this.prefs.videoQuality || "auto";
  }
  static get observedAttributes() {
    return ["manifest-src", "locale", "lang", "src", "captions", "sign", "describe", "api"];
  }
  connectedCallback() {
    this.activeLocale = this.getAttribute("lang") || this.getAttribute("locale") || "en";
    const e = this.getAttribute("manifest-src");
    e ? this.loadManifest(e) : this.getAttribute("src") && this.initFromAttributes(), window.addEventListener("db-player:captions-updated", this.onCaptionsUpdated);
  }
  disconnectedCallback() {
    window.removeEventListener("db-player:captions-updated", this.onCaptionsUpdated), this.onOutsidePointerDown && (window.removeEventListener("pointerdown", this.onOutsidePointerDown), this.onOutsidePointerDown = null), this.syncController && this.syncController.destroy();
  }
  attributeChangedCallback(e, i, t) {
    i !== t && (e === "locale" || e === "lang" ? (this.activeLocale = t || "en", this.updateLocaleStrings()) : e === "manifest-src" ? this.loadManifest(t) : (e === "src" || e === "captions" || e === "sign" || e === "describe") && (this.getAttribute("manifest-src") || this.initFromAttributes()));
  }
  initFromAttributes() {
    const e = this.getAttribute("src");
    if (!e) return;
    const i = this.getAttribute("lang") || this.getAttribute("locale") || "en";
    this.activeLocale = i;
    const t = this.getAttribute("captions") || "", s = this.getAttribute("sign"), r = this.getAttribute("describe"), c = t.split(",").map((l) => l.trim()).filter(Boolean).map((l) => {
      const d = l.includes(".am.") || l.endsWith("am.vtt") || l.includes("am");
      return {
        id: d ? "cap-am" : "cap-en",
        language: d ? "am" : "en",
        label: d ? "አማርኛ" : "English",
        src: l
      };
    });
    this.manifest = {
      id: "lesson-player",
      version: "1.0.0",
      title: { en: "Lesson Video", am: "የትምህርት ቪዲዮ" },
      sources: [
        { id: "main-video", kind: "main", src: e, mimeType: "video/mp4" },
        ...s ? [{ id: "sign-video", kind: "sign", src: s, mimeType: "video/mp4" }] : []
      ],
      captionTracks: c,
      audioDescription: r ? { src: r } : void 0
    }, this.render(), this.initTracksAndTranscript();
  }
  async loadManifest(e) {
    var i, t;
    try {
      const s = await fetch(e);
      if (!s.ok) throw new Error(`HTTP error ${s.status}`);
      const r = await s.json();
      let c;
      try {
        c = new URL(e, window.location.href);
      } catch {
        c = new URL(window.location.href);
      }
      const l = (d) => {
        if (!d) return d;
        try {
          return new URL(d, c).href;
        } catch {
          return d;
        }
      };
      if (this.manifest = {
        ...r,
        poster: r.poster ? { ...r.poster, src: l(r.poster.src) } : void 0,
        sources: (r.sources || []).map((d) => ({
          ...d,
          src: l(d.src)
        })),
        captionTracks: (r.captionTracks || []).map((d) => ({
          ...d,
          src: l(d.src)
        })),
        transcript: r.transcript ? {
          ...r.transcript,
          src: l(r.transcript.src)
        } : r.transcript,
        liveSession: r.liveSession ? {
          ...r.liveSession,
          chatSrc: r.liveSession.chatSrc ? l(r.liveSession.chatSrc) : void 0
        } : void 0
      }, (t = (i = this.manifest) == null ? void 0 : i.liveSession) != null && t.chatSrc)
        try {
          const d = await fetch(this.manifest.liveSession.chatSrc);
          d.ok && (this.liveChatMessages = await d.json(), this.liveChatViewer && this.liveChatViewer.setMessages(this.liveChatMessages));
        } catch (d) {
          console.warn("Could not load live chat messages:", d);
        }
      this.render(), await this.initTracksAndTranscript();
    } catch (s) {
      this.renderError(s instanceof Error ? s.message : "Failed to load manifest");
    }
  }
  async initTracksAndTranscript() {
    var s;
    if (!this.manifest) return;
    await this.loadCaptionTrack(this.prefs.captionLanguage);
    const e = typeof localStorage < "u" ? localStorage.getItem(`db-player:custom-transcript:${this.activeLocale}`) : null;
    if (e)
      try {
        const c = (JSON.parse(e).segments || []).map((l) => ({
          id: l.id,
          start: l.start_ms !== void 0 ? l.start_ms / 1e3 : l.start || 0,
          end: l.end_ms !== void 0 ? l.end_ms / 1e3 : l.end || 0,
          speaker: l.speaker,
          text: l.text || l.reviewedText || l.draft_text || l.draftText || "",
          visualDescription: l.visual_description || l.visualDescription
        }));
        this.transcriptViewer.setSegments(c);
        return;
      } catch (r) {
        console.warn("Could not parse custom transcript, falling back to localized transcript", r);
      }
    const i = `/lessons/digital-workplace/transcript.${this.activeLocale}.json`;
    let t = !1;
    try {
      const r = await fetch(i);
      if (r.ok) {
        const l = ((await r.json()).segments || []).map((d) => ({
          id: d.id,
          start: d.start_ms !== void 0 ? d.start_ms / 1e3 : d.start || 0,
          end: d.end_ms !== void 0 ? d.end_ms / 1e3 : d.end || 0,
          speaker: d.speaker,
          text: d.text || d.draft_text || "",
          visualDescription: d.visual_description || d.visualDescription
        }));
        this.transcriptViewer.setSegments(l), t = !0;
      }
    } catch {
    }
    if (!t && ((s = this.manifest.transcript) != null && s.src))
      try {
        const r = await fetch(this.manifest.transcript.src);
        if (r.ok) {
          const l = ((await r.json()).segments || []).map((d) => ({
            id: d.id,
            start: d.start_ms !== void 0 ? d.start_ms / 1e3 : d.start || 0,
            end: d.end_ms !== void 0 ? d.end_ms / 1e3 : d.end || 0,
            speaker: d.speaker,
            text: d.text || d.draft_text || "",
            visualDescription: d.visual_description || d.visualDescription
          }));
          this.transcriptViewer.setSegments(l);
        }
      } catch (r) {
        console.warn("Could not load external transcript file, using fallback cues", r);
      }
  }
  async switchTranscriptLanguage(e) {
    this.activeLocale = e, this.setAttribute("locale", e), this.transcriptViewer && this.transcriptViewer.setLocale(e);
    const i = this.shadow.getElementById("select-transcript-lang");
    i && i.value !== e && (i.value = e);
    const t = typeof localStorage < "u" ? localStorage.getItem(`db-player:custom-transcript:${e}`) : null;
    if (t)
      try {
        const r = (JSON.parse(t).segments || []).map((c) => ({
          id: c.id,
          start: c.start_ms !== void 0 ? c.start_ms / 1e3 : c.start || 0,
          end: c.end_ms !== void 0 ? c.end_ms / 1e3 : c.end || 0,
          speaker: c.speaker,
          text: c.text || c.reviewedText || c.draft_text || c.draftText || "",
          visualDescription: c.visual_description || c.visualDescription
        }));
        this.transcriptViewer.setSegments(r);
        return;
      } catch (s) {
        console.warn("Could not parse custom transcript for", e, s);
      }
    try {
      const s = await fetch(`/lessons/digital-workplace/transcript.${e}.json`);
      if (s.ok) {
        const c = ((await s.json()).segments || []).map((l) => ({
          id: l.id,
          start: l.start_ms !== void 0 ? l.start_ms / 1e3 : l.start || 0,
          end: l.end_ms !== void 0 ? l.end_ms / 1e3 : l.end || 0,
          speaker: l.speaker,
          text: l.text || l.draft_text || "",
          visualDescription: l.visual_description || l.visualDescription
        }));
        this.transcriptViewer.setSegments(c);
      }
    } catch (s) {
      console.warn("Could not load transcript for", e, s);
    }
    if (this.prefs.captionLanguage !== "off") {
      this.prefs.captionLanguage = e, C({ captionLanguage: e });
      const s = this.shadow.getElementById("btn-cc");
      s && (s.setAttribute("title", `Captions: ${e.toUpperCase()} (C)`), s.setAttribute("aria-label", `Captions: ${e.toUpperCase()} (C)`));
      const r = this.shadow.getElementById("select-cc-lang");
      r && (r.value = e), await this.loadCaptionTrack(e);
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
      const t = typeof localStorage < "u" ? localStorage.getItem(`db-player:custom-vtt:${e}`) : null;
      if (t)
        this.currentCues = Oe(t);
      else {
        const s = await fetch(i.src);
        if (s.ok) {
          const r = await s.text();
          this.currentCues = Oe(r);
        }
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
    i ? (this.captionOverlay.style.display = "block", this.captionOverlay.style.cssText = Ye(this.prefs.captionTheme, this.prefs.captionSize), this.captionOverlay.textContent = i.text) : this.captionOverlay.style.display = "none";
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
  getAvailableStreams() {
    var l, d, m, n, E, v, y;
    const e = [], i = this.activeLocale === "am";
    if (!this.manifest || !this.manifest.sources)
      return [
        { id: "1080p", quality: "1080p", label: "1080p (Full HD)", tag: "FHD", kind: "video", format: "MP4", src: "" },
        { id: "720p", quality: "720p", label: "720p (HD)", tag: "HD", kind: "video", format: "MP4", src: "" },
        { id: "480p", quality: "480p", label: "480p (Standard)", tag: "SD", kind: "video", format: "MP4", src: "" },
        { id: "360p", quality: "360p", label: "360p (SD)", tag: "SD", kind: "video", format: "MP4", src: "" },
        { id: "240p", quality: "240p", label: "240p (Low Data)", tag: "Low Data", kind: "video", format: "MP4", src: "" }
      ];
    const t = (h) => {
      const A = h.match(/(\d+)/);
      return A ? parseInt(A[1], 10) : 0;
    }, r = [...this.manifest.sources.filter((h) => h.kind === "main")].sort((h, A) => t(A.quality || "") - t(h.quality || ""));
    for (const h of r) {
      const A = ((l = h.type) == null ? void 0 : l.includes("webm")) || h.src.endsWith(".webm") || h.quality === "webm", u = h.quality || "";
      let D = "";
      A ? D = "WebM" : u === "1080p" || t(u) >= 1080 ? D = "FHD" : u === "720p" || t(u) >= 720 ? D = "HD" : u === "480p" || u === "360p" ? D = "SD" : u === "240p" || t(u) <= 240 ? D = i ? "ዝቅተኛ" : "3G Data" : D = h.label || "", e.push({
        id: h.id,
        quality: A ? "webm" : u,
        label: h.label || `${u} (${A ? "WebM VP9" : "MP4"})`,
        tag: D,
        kind: "video",
        format: A ? "WebM (VP9)" : "MP4 (H.264)",
        src: h.src
      });
    }
    const c = this.manifest.sources.filter((h) => h.kind === "audio-only");
    for (const h of c) {
      let A = h.format || "Audio", u = "Audio", D = h.quality || "audio-opus";
      h.src.endsWith(".opus") || (d = h.type) != null && d.includes("opus") || h.id.includes("opus") ? (A = i ? "ኦፐስ ድምጽ (32kbps እጅግ ዝቅተኛ ዳታ)" : "Opus Audio (32kbps Low-Data)", u = "Opus", D = "audio-opus") : h.src.endsWith(".mp3") || (m = h.type) != null && m.includes("mpeg") || h.id.includes("mp3") ? (A = i ? "ኤምፒ3 ድምጽ (64kbps ዓለም አቀፍ)" : "MP3 Audio (64kbps Universal)", u = "MP3", D = "audio-mp3") : h.src.endsWith(".ogg") || (n = h.type) != null && n.includes("ogg") || h.id.includes("ogg") ? (A = i ? "ኦግ ቮርቢስ ድምጽ (Ogg Vorbis)" : "Ogg Vorbis Audio", u = "OGG", D = "audio-ogg") : h.src.endsWith(".wav") || (E = h.type) != null && E.includes("wav") || h.id.includes("wav") ? (A = i ? "ዋቭ ድምጽ (WAV Lossless PCM)" : "WAV Audio (Lossless PCM)", u = "WAV", D = "audio-wav") : (h.src.endsWith(".m4a") || (v = h.type) != null && v.includes("mp4") || (y = h.type) != null && y.includes("aac") || h.id.includes("m4a")) && (A = i ? "ኤኤሲ / ኤም4ኤ ድምጽ (AAC/M4A)" : "AAC / M4A Audio (Apple)", u = "M4A", D = "audio-m4a"), e.push({
        id: h.id,
        quality: D,
        label: h.label || A,
        tag: u,
        kind: "audio",
        format: A,
        src: h.src
      });
    }
    return e;
  }
  getAvailableQualities() {
    return this.getAvailableStreams().map((e) => ({
      quality: e.quality,
      label: e.label,
      tag: e.tag
    }));
  }
  resolveMainSource(e = this.currentQuality) {
    if (!this.manifest || !this.manifest.sources) return "";
    if (e.startsWith("audio-") || e === "audio") {
      const s = e.replace("audio-", "").toLowerCase(), r = this.manifest.sources.find(
        (l) => {
          var d;
          return l.kind === "audio-only" && (l.quality === e || l.src.toLowerCase().includes(s) || ((d = l.type) == null ? void 0 : d.toLowerCase().includes(s)) || l.id.toLowerCase().includes(s));
        }
      );
      if (r) return r.src;
      const c = this.manifest.sources.find((l) => l.kind === "audio-only");
      if (c) return c.src;
    }
    if (e === "webm") {
      const s = this.manifest.sources.find((r) => {
        var c;
        return ((c = r.type) == null ? void 0 : c.includes("webm")) || r.src.endsWith(".webm") || r.quality === "webm";
      });
      if (s) return s.src;
    }
    const i = this.manifest.sources.filter((s) => s.kind === "main");
    if (!i.length) return "";
    if (e === "auto") {
      const s = navigator.connection;
      if (s != null && s.saveData || (s == null ? void 0 : s.effectiveType) === "slow-2g" || (s == null ? void 0 : s.effectiveType) === "2g") {
        const l = i.find((d) => d.quality === "240p");
        if (l) return l.src;
      } else if ((s == null ? void 0 : s.effectiveType) === "3g") {
        const l = i.find((d) => d.quality === "360p") || i.find((d) => d.quality === "480p");
        if (l) return l.src;
      }
      const r = i.find((l) => l.quality === "1080p");
      if (r) return r.src;
      const c = i.find((l) => l.quality === "720p" && !l.src.endsWith(".webm"));
      return c ? c.src : i[0].src;
    }
    const t = i.find((s) => s.quality === e && !s.src.endsWith(".webm"));
    return t ? t.src : i[0].src;
  }
  async applyQuality(e) {
    this.currentQuality = e, this.prefs.videoQuality = e, C({ videoQuality: e });
    const i = this.resolveMainSource(e), t = /\.(opus|mp3|ogg|wav|m4a|aac|flac)($|\?)/i.test(i) || e.startsWith("audio-");
    this.isAudioMode = t;
    const s = e === "auto" ? "Auto" : e === "webm" ? "WebM" : e === "audio-opus" ? "Opus" : e === "audio-mp3" ? "MP3" : e === "audio-ogg" ? "OGG" : e === "audio-wav" ? "WAV" : e === "audio-m4a" ? "M4A" : e, r = this.shadow.getElementById("quality-badge-text");
    r && (r.textContent = s), this.shadow.querySelectorAll(".quality-menu-item").forEach((y) => {
      const A = y.getAttribute("data-quality") === e;
      y.classList.toggle("selected", A), y.setAttribute("aria-checked", A ? "true" : "false");
      const u = y.querySelector(".quality-check");
      u && (u.textContent = A ? "✓" : "");
    });
    const l = this.shadow.getElementById("select-video-quality");
    l && l.value !== e && (l.value = e);
    const d = this.shadow.getElementById("audio-mode-card"), m = this.shadow.getElementById("audio-mode-badge"), n = this.shadow.getElementById("audio-equalizer");
    d && (d.style.display = t ? "flex" : "none", m && (m.textContent = `🎵 ${s} Audio Stream • Active`), n && this.mainVideo && !this.mainVideo.paused && n.classList.add("playing"));
    const E = this.shadow.getElementById("quality-toast"), v = this.shadow.getElementById("quality-toast-text");
    if (E && v) {
      const y = this.activeLocale === "am", h = e === "auto" ? y ? "ጥራት፡ Auto (ተለዋዋጭ)" : "Quality: Auto (Adaptive)" : `${y ? "የሚዲያ ቅርጸት፡ " : "Format/Quality: "}${s}`;
      v.textContent = `⚡ ${h}`, E.style.display = "flex", E.style.opacity = "1", this.qualityToastTimer && clearTimeout(this.qualityToastTimer), this.qualityToastTimer = window.setTimeout(() => {
        E.style.opacity = "0", setTimeout(() => {
          E.style.opacity === "0" && (E.style.display = "none");
        }, 300);
      }, 1800);
    }
    if (i && this.mainVideo && !this.prefs.audioDescriptionEnabled)
      if (this.syncController)
        await this.syncController.switchSource(i);
      else {
        const y = !this.mainVideo.paused, h = this.mainVideo.currentTime, A = this.mainVideo.playbackRate;
        if (this.mainVideo.src = i, this.mainVideo.currentTime = h, this.mainVideo.playbackRate = A, y)
          try {
            await this.mainVideo.play();
          } catch {
          }
      }
  }
  render() {
    var m, n, E;
    const e = this.activeLocale === "am", i = this.manifest ? this.manifest.title[this.activeLocale] || this.manifest.title.en : "Media Player", t = this.resolveMainSource(this.currentQuality), s = (m = this.manifest) == null ? void 0 : m.sources.find((v) => v.kind === "sign"), r = this.prefs.transcriptWidth || H.transcriptWidth || 260, c = this.prefs.transcriptHeight || H.transcriptHeight || 400, l = this.prefs.eslWidth || H.eslWidth || 240, d = this.prefs.eslHeight || H.eslHeight || 180;
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

        /* Audio Mode Visualizer Card (Opus, MP3, WAV, OGG, M4A) */
        .audio-mode-card {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #0F172A 0%, #1E293B 55%, #0F2A24 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
          padding: 1.5rem;
          box-sizing: border-box;
          color: #F8FAFC;
        }
        .audio-mode-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.65rem;
          max-width: 480px;
        }
        .audio-mode-icon-circle {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.15);
          border: 2px solid rgba(16, 185, 129, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          box-shadow: 0 0 25px rgba(16, 185, 129, 0.25);
        }
        .audio-mode-title {
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #FFFFFF;
        }
        .audio-mode-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid rgba(16, 185, 129, 0.5);
          color: #6EE7B7;
          letter-spacing: 0.02em;
        }
        .audio-equalizer {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 28px;
          margin-top: 0.35rem;
        }
        .eq-bar {
          width: 5px;
          background: #10B981;
          border-radius: 3px;
          height: 6px;
          transition: height 0.15s ease;
        }
        .audio-equalizer.playing .eq-bar-1 { animation: eqPulse 0.6s ease-in-out infinite alternate; }
        .audio-equalizer.playing .eq-bar-2 { animation: eqPulse 0.8s ease-in-out 0.1s infinite alternate; }
        .audio-equalizer.playing .eq-bar-3 { animation: eqPulse 0.5s ease-in-out 0.2s infinite alternate; }
        .audio-equalizer.playing .eq-bar-4 { animation: eqPulse 0.9s ease-in-out 0.15s infinite alternate; }
        .audio-equalizer.playing .eq-bar-5 { animation: eqPulse 0.7s ease-in-out 0.05s infinite alternate; }
        .audio-equalizer.playing .eq-bar-6 { animation: eqPulse 0.85s ease-in-out 0.25s infinite alternate; }
        .audio-equalizer.playing .eq-bar-7 { animation: eqPulse 0.55s ease-in-out 0.1s infinite alternate; }
        .audio-equalizer.playing .eq-bar-8 { animation: eqPulse 0.75s ease-in-out 0.2s infinite alternate; }

        @keyframes eqPulse {
          0% { height: 5px; }
          100% { height: 26px; }
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
        #btn-shortcuts.is-active,
        #btn-quality.is-active {
          color: var(--color-brand, #0071E3);
          background: rgba(255, 255, 255, 0.25);
        }

        /* Keyboard Shortcuts Popover (Seamless Apple Flyout, Zero Dark Scrim) */
        .shortcuts-popover {
          position: absolute;
          bottom: 64px;
          right: 36px;
          width: 380px;
          max-width: calc(100% - 24px);
          max-height: min(480px, calc(100vh - 120px));
          background: var(--color-surface-elevated, #FFFFFF);
          color: var(--color-ink, #1D1D1F);
          border-radius: 14px;
          border: 1px solid var(--color-border, rgba(0, 0, 0, 0.12));
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.24), 0 2px 10px rgba(0, 0, 0, 0.08);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          z-index: 122;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-sizing: border-box;
          transform-origin: bottom right;
          animation: appleFlyoutIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        :host-context([data-theme="dark"]) .shortcuts-popover,
        :host-context([data-theme="black"]) .shortcuts-popover,
        :host-context([data-theme="monochrome"]) .shortcuts-popover {
          background: rgba(24, 24, 27, 0.95);
          border-color: rgba(255, 255, 255, 0.15);
          color: #F8FAFC;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
        }

        @media (max-width: 600px) {
          .prefs-popover {
            right: 8px;
            left: 8px;
            width: auto;
            max-width: none;
            bottom: 56px;
          }
          .shortcuts-popover {
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

      <section class="player-component" aria-label="${i}">
        <div class="player-stage" id="player-stage">

          <!-- LEFT: Movable & Resizable Transcript Window (Outside of video frame) -->
          <div 
            class="window-panel transcript-window" 
            id="transcript-window"
            style="width: ${r}px; height: ${c}px; flex: 0 0 ${r}px; display: ${this.prefs.transcriptVisible !== !1 ? "flex" : "none"};"
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
                  <option value="am" ${this.activeLocale === "am" ? "selected" : ""}>አማርኛ (Amharic)</option>
                  <option value="om" ${this.activeLocale === "om" ? "selected" : ""}>Afaan Oromoo (Oromo)</option>
                  <option value="ti" ${this.activeLocale === "ti" ? "selected" : ""}>ትግርኛ (Tigrigna)</option>
                  <option value="so" ${this.activeLocale === "so" ? "selected" : ""}>Af-Soomaali (Somali)</option>
                </select>
              </div>
            </div>

            <!-- Transcript & Live Chat Replay Body Content -->
            <div class="transcript-body" id="transcript-body">
              <!-- Left Panel Segmented View Tabs (Transcript | Live Chat Replay) -->
              <div class="left-panel-tabs" role="tablist" aria-label="${e ? "የትምህርት ይዘት እይታ" : "Session Content View"}">
                <button 
                  type="button" 
                  class="tab-btn ${this.activeLeftTab === "transcript" ? "active" : ""}" 
                  id="tab-btn-transcript" 
                  role="tab" 
                  aria-selected="${this.activeLeftTab === "transcript"}"
                  aria-controls="transcript-view-panel">
                  📄 ${e ? "የጽሑፍ ግልባጭ" : "Transcript"}
                </button>
                <button 
                  type="button" 
                  class="tab-btn ${this.activeLeftTab === "chat" ? "active" : ""}" 
                  id="tab-btn-chat" 
                  role="tab" 
                  aria-selected="${this.activeLeftTab === "chat"}"
                  aria-controls="live-chat-view-panel">
                  💬 ${e ? "የቀጥታ ውይይት ድጋሚ" : "Live Chat Replay"} <span class="tab-badge" id="chat-count-badge">${this.liveChatMessages.length || 10}</span>
                </button>
              </div>

              <!-- View 1: Lesson Transcript -->
              <div id="transcript-view-panel" style="display: ${this.activeLeftTab === "transcript" ? "flex" : "none"}; flex-direction: column; flex: 1; min-height: 0;">
                <div class="transcript-title-row" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <h3 class="transcript-title" style="margin: 0;">${e ? "የትምህርቱ የጽሑፍ ግልባጭ" : "Transcript"}</h3>
                    <button 
                      type="button" 
                      id="btn-export-brf" 
                      class="btn-tool-pill" 
                      aria-label="${e ? "የብሬል ሰነድ (.brf) አውርድ" : "Download Braille Ready Format (.brf)"}" 
                      title="${e ? "የብሬል ሰነድ (.brf) አውርድ (BANA 40x25)" : "Download Braille Ready Format (.brf) (BANA 40x25)"}">
                      ⠃⠗⠋ BRF
                    </button>
                  </div>
                  <input 
                    type="search" 
                    id="transcript-search" 
                    class="search-box" 
                    placeholder="${e ? "በጽሑፉ ውስጥ ይፈልጉ..." : "Search transcript..."}" 
                    aria-label="${e ? "በጽሑፉ ውስጥ ይፈልጉ" : "Search transcript"}">
                </div>
                <div id="transcript-target" class="transcript-scroll-area"></div>
              </div>

              <!-- View 2: Recorded Live Session Chat Replay -->
              <div id="live-chat-view-panel" style="display: ${this.activeLeftTab === "chat" ? "flex" : "none"}; flex-direction: column; flex: 1; min-height: 0;">
                <div class="transcript-title-row" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <h3 class="transcript-title" style="margin: 0;">${e ? "የቀጥታ ውይይት ድጋሚ" : "Live Chat Replay"}</h3>
                    <button 
                      type="button" 
                      id="btn-chat-questions-filter" 
                      class="btn-tool-pill" 
                      aria-pressed="false" 
                      aria-label="${e ? "ጥያቄዎችን ብቻ አሳይ" : "Filter Questions Only"}" 
                      title="${e ? "ጥያቄዎችን ብቻ አሳይ" : "Filter Questions Only"}">
                      ❓ ${e ? "ጥያቄዎች ብቻ" : "Questions Only"}
                    </button>
                  </div>
                  <input 
                    type="search" 
                    id="live-chat-search" 
                    class="search-box" 
                    placeholder="${e ? "በውይይት ውስጥ ይፈልጉ..." : "Search chat questions..."}" 
                    aria-label="${e ? "በቀጥታ ውይይት ውስጥ ይፈልጉ" : "Search live chat"}">
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
                poster="${((E = (n = this.manifest) == null ? void 0 : n.poster) == null ? void 0 : E.src) || ""}"
                src="${t}">
              </video>

              <!-- Audio-Only Visualizer Card (Opus, MP3, WAV, OGG, M4A) -->
              <div class="audio-mode-card" id="audio-mode-card" style="display: ${this.isAudioMode ? "flex" : "none"};">
                <div class="audio-mode-inner">
                  <div class="audio-mode-icon-circle">
                    <span class="audio-mode-icon" aria-hidden="true">🎵</span>
                  </div>
                  <div class="audio-mode-meta">
                    <div class="audio-mode-title">${i}</div>
                    <div class="audio-mode-badge" id="audio-mode-badge">${e ? "የድምጽ ሁነታ" : "High-Fidelity Audio Mode"}</div>
                  </div>
                  <div class="audio-equalizer ${this.mainVideo && !this.mainVideo.paused ? "playing" : ""}" aria-hidden="true" id="audio-equalizer">
                    <span class="eq-bar eq-bar-1"></span>
                    <span class="eq-bar eq-bar-2"></span>
                    <span class="eq-bar eq-bar-3"></span>
                    <span class="eq-bar eq-bar-4"></span>
                    <span class="eq-bar eq-bar-5"></span>
                    <span class="eq-bar eq-bar-6"></span>
                    <span class="eq-bar eq-bar-7"></span>
                    <span class="eq-bar eq-bar-8"></span>
                  </div>
                </div>
              </div>

              <!-- Video Quality Toast Indicator -->
              <div class="quality-toast" id="quality-toast" style="display: none;" role="status" aria-live="polite">
                <span id="quality-toast-text">⚡ Quality: Auto</span>
              </div>

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
                    <span id="play-icon" aria-hidden="true">${V.play}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-restart" aria-label="${e ? "እንደገና ጀምር (0 / Home)" : "Restart (0 / Home)"}" title="${e ? "እንደገና ጀምር (0 / Home)" : "Restart (0 / Home)"}">
                    <span aria-hidden="true">${V.restart}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-rewind" aria-label="${e ? "ወደኋላ 5 ሰከንድ (J / ←)" : "Rewind 5 seconds (J / ←)"}" title="${e ? "ወደኋላ 5 ሰከንድ (J / ←)" : "Rewind 5 seconds (J / ←)"}">
                    <span aria-hidden="true">${V.rewind}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-forward" aria-label="${e ? "ወደፊት 5 ሰከንድ (L / →)" : "Forward 5 seconds (L / →)"}" title="${e ? "ወደፊት 5 ሰከንድ (L / →)" : "Forward 5 seconds (L / →)"}">
                    <span aria-hidden="true">${V.forward}</span>
                  </button>
                </div>

                <!-- Center: Accessibility & Speed -->
                <div class="controls-cluster">
                  <button class="btn-ctrl" id="btn-cc" aria-pressed="${this.prefs.captionLanguage !== "off" ? "true" : "false"}" aria-label="${e ? "የትርጉም ጽሑፍ (C)" : "Captions (C)"}" title="${e ? "የትርጉም ጽሑፍ (C)" : "Captions (C)"}">
                    <span aria-hidden="true">${V.cc}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-esl" aria-pressed="${this.prefs.eslVisible ? "true" : "false"}" aria-label="${e ? "የኢትዮጵያ የምልክት ቋንቋ (ESL) (S)" : "Ethiopian Sign Language (ESL) (S)"}" title="${e ? "የኢትዮጵያ የምልክት ቋንቋ (ESL) (S)" : "Ethiopian Sign Language (ESL) (S)"}">
                    <span aria-hidden="true">${V.esl}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-ad" aria-pressed="${this.prefs.audioDescriptionEnabled ? "true" : "false"}" aria-label="${e ? "የድምጽ ማብራሪያ (D)" : "Audio Description (D)"}" title="${e ? "የድምጽ ማብራሪያ (D)" : "Audio Description (D)"}">
                    <span aria-hidden="true">${V.ad}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-transcript-toggle" aria-pressed="${this.prefs.transcriptVisible !== !1 ? "true" : "false"}" aria-label="${e ? "የጽሑፍ ግልባጭ ማሳያ (T)" : "Toggle Transcript (T)"}" title="${e ? "የጽሑፍ ግልባጭ ማሳያ (T)" : "Toggle Transcript (T)"}">
                    <span aria-hidden="true">${V.transcript}</span>
                  </button>

                  <span class="ctrl-divider" aria-hidden="true"></span>

                  <button class="btn-ctrl" id="btn-speed-faster" aria-label="${e ? "ፍጥነት ጨምር (>)" : "Increase speed (>)"}" title="${e ? "ፍጥነት ጨምር (>)" : "Increase speed (>)"}">
                    <span aria-hidden="true">${V.faster}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-speed-slower" aria-label="${e ? "ፍጥነት ቀንስ (<)" : "Decrease speed (<)"}" title="${e ? "ፍጥነት ቀንስ (<)" : "Decrease speed (<)"}">
                    <span aria-hidden="true">${V.slower}</span>
                  </button>

                  <span class="ctrl-divider" aria-hidden="true"></span>
                </div>

                <!-- Right: Settings, Fullscreen, Volume -->
                <div class="controls-cluster">
                  <button class="btn-ctrl btn-ctrl-quality" id="btn-quality" aria-expanded="false" aria-haspopup="menu" aria-label="${e ? "የቪዲዮ ጥራት" : "Video Quality"}" title="${e ? "የቪዲዮ ጥራት መቆጣጠሪያ (Auto / 720p / 360p / 240p)" : "Video Quality (Auto / 720p / 360p / 240p)"}">
                    <span aria-hidden="true">${V.quality}</span>
                    <span class="quality-badge-text" id="quality-badge-text">${this.currentQuality === "auto" ? "Auto" : this.currentQuality}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-shortcuts" aria-expanded="false" aria-label="${e ? "የኪቦርድ አቋራጮች (?)" : "Keyboard Shortcuts (?)"}" title="${e ? "የኪቦርድ አቋራጮች (?)" : "Keyboard Shortcuts (?)"}">
                    <span aria-hidden="true">${V.shortcuts}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-prefs" aria-expanded="false" aria-label="${e ? "የተደራሽነት ምርጫዎች" : "Accessibility Preferences"}" title="${e ? "የተደራሽነት ምርጫዎች" : "Accessibility Preferences"}">
                    <span aria-hidden="true">${V.prefs}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-fullscreen" aria-pressed="false" aria-label="${e ? "ሙሉ ማያ ገጽ (F)" : "Fullscreen (F)"}" title="${e ? "ሙሉ ማያ ገጽ (F)" : "Fullscreen (F)"}">
                    <span id="fullscreen-icon" aria-hidden="true">${V.fullscreenEnter}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-mute" aria-pressed="false" aria-label="${e ? "ድምጽ አጥፋ (M)" : "Mute (M)"}" title="${e ? "ድምጽ አጥፋ (M)" : "Mute (M)"}">
                    <span id="mute-icon" aria-hidden="true">${V.volumeUnmuted}</span>
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

            <!-- Video Quality & Audio Formats Popover Menu -->
            <div 
              class="quality-popover" 
              id="quality-menu" 
              style="display: none;" 
              role="menu" 
              aria-label="${e ? "የቪዲዮ ጥራት እና የሚዲያ ቅርጸቶች" : "Media Quality & Formats"}">
              <div class="quality-menu-header">${e ? "የቪዲዮ ጥራት" : "VIDEO QUALITY"}</div>
              <div class="quality-menu-list">
                <button type="button" class="quality-menu-item ${this.currentQuality === "auto" ? "selected" : ""}" data-quality="auto" role="menuitemradio" aria-checked="${this.currentQuality === "auto"}">
                  <span class="quality-check" aria-hidden="true">${this.currentQuality === "auto" ? "✓" : ""}</span>
                  <span class="quality-name">Auto (Adaptive)</span>
                </button>
                ${this.getAvailableStreams().filter((v) => v.kind === "video").map((v) => `
                <button type="button" class="quality-menu-item ${this.currentQuality === v.quality ? "selected" : ""}" data-quality="${v.quality}" role="menuitemradio" aria-checked="${this.currentQuality === v.quality}">
                  <span class="quality-check" aria-hidden="true">${this.currentQuality === v.quality ? "✓" : ""}</span>
                  <span class="quality-name">${v.label} ${v.tag ? `<span class="quality-tag">${v.tag}</span>` : ""}</span>
                </button>
                `).join("")}
              </div>

              <div class="quality-menu-header" style="margin-top: 6px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 6px;">
                ${e ? "የድምጽ ቅርጸቶች (ቀላል ዳታ)" : "AUDIO FORMATS (3G / LOW DATA)"}
              </div>
              <div class="quality-menu-list">
                ${this.getAvailableStreams().filter((v) => v.kind === "audio").map((v) => `
                <button type="button" class="quality-menu-item ${this.currentQuality === v.quality ? "selected" : ""}" data-quality="${v.quality}" role="menuitemradio" aria-checked="${this.currentQuality === v.quality}">
                  <span class="quality-check" aria-hidden="true">${this.currentQuality === v.quality ? "✓" : ""}</span>
                  <span class="quality-name">${v.label} ${v.tag ? `<span class="quality-tag" style="background: rgba(16,185,129,0.25); color: #6EE7B7;">${v.tag}</span>` : ""}</span>
                </button>
                `).join("")}
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
                  <span aria-hidden="true">${V.prefs}</span>
                  <span>${e ? "የተደራሽነት እና አቀማመጥ ምርጫዎች" : "Accessibility & Layout Settings"}</span>
                </div>
                <button type="button" class="btn-popover-close" id="btn-dismiss-prefs" aria-label="${e ? "ምርጫዎችን ዝጋ" : "Close settings"}" title="${e ? "ዝጋ" : "Close"}">✕</button>
              </div>

              <div class="popover-body">
                <div class="form-row">
                  <label for="select-video-quality">${e ? "የሚዲያ ቅርጸት እና ጥራት:" : "Media Format & Quality:"}</label>
                  <select id="select-video-quality">
                    <option value="auto" ${this.currentQuality === "auto" ? "selected" : ""}>Auto (Adaptive Network)</option>
                    <optgroup label="${e ? "የቪዲዮ ዥረቶች (Video Streams)" : "Video Streams"}">
                      ${this.getAvailableStreams().filter((v) => v.kind === "video").map((v) => `
                      <option value="${v.quality}" ${this.currentQuality === v.quality ? "selected" : ""}>${v.label}</option>
                      `).join("")}
                    </optgroup>
                    <optgroup label="${e ? "የድምጽ ቅርጸቶች (Audio Formats)" : "Audio Formats (3G / Low Data)"}">
                      ${this.getAvailableStreams().filter((v) => v.kind === "audio").map((v) => `
                      <option value="${v.quality}" ${this.currentQuality === v.quality ? "selected" : ""}>${v.label}</option>
                      `).join("")}
                    </optgroup>
                  </select>
                </div>

                <div class="form-row">
                  <label for="select-cc-lang">${e ? "የትርጉም ጽሑፍ ቋንቋ:" : "Caption Language:"}</label>
                  <select id="select-cc-lang">
                    <option value="en" ${this.prefs.captionLanguage === "en" ? "selected" : ""}>English (Reviewed)</option>
                    <option value="am" ${this.prefs.captionLanguage === "am" ? "selected" : ""}>አማርኛ (የተገመገመ)</option>
                    <option value="om" ${this.prefs.captionLanguage === "om" ? "selected" : ""}>Afaan Oromoo (Qophaa'e)</option>
                    <option value="ti" ${this.prefs.captionLanguage === "ti" ? "selected" : ""}>ትግርኛ (ዝተገምገመ)</option>
                    <option value="so" ${this.prefs.captionLanguage === "so" ? "selected" : ""}>Af-Soomaali (Dib loo eegay)</option>
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
                  <div class="preset-pill-group" role="group" aria-label="${e ? "ፈጣን የንፅፅር ገጽታዎች" : "Quick Caption Contrast Presets"}">
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
                  <label for="toggle-esl-visibility">${e ? "የምልክት ቋንቋ (ESL) ማሳያ:" : "Sign Language (ESL):"}</label>
                  <select id="toggle-esl-visibility">
                    <option value="show" ${this.prefs.eslVisible ? "selected" : ""}>${e ? "በጎን አሳይ (Visible)" : "Show on side"}</option>
                    <option value="hide" ${this.prefs.eslVisible ? "" : "selected"}>${e ? "ደብቅ (Hidden)" : "Hide"}</option>
                  </select>
                </div>

                <!-- Interactive Transcript Toggle -->
                <div class="form-row">
                  <label for="toggle-transcript-visibility">${e ? "የትምህርቱ የጽሑፍ ግልባጭ:" : "Interactive Transcript:"}</label>
                  <select id="toggle-transcript-visibility">
                    <option value="show" ${this.prefs.transcriptVisible !== !1 ? "selected" : ""}>${e ? "በጎን አሳይ (Visible)" : "Show on side"}</option>
                    <option value="hide" ${this.prefs.transcriptVisible === !1 ? "selected" : ""}>${e ? "ደብቅ (Hidden)" : "Hide"}</option>
                  </select>
                </div>

                <!-- Audio Description Toggle -->
                <div class="form-row">
                  <label for="toggle-ad-enabled">${e ? "የድምጽ ማብራሪያ (AD):" : "Audio Description (AD):"}</label>
                  <select id="toggle-ad-enabled">
                    <option value="on" ${this.prefs.audioDescriptionEnabled ? "selected" : ""}>${e ? "አብራ (Enabled)" : "Enabled"}</option>
                    <option value="off" ${this.prefs.audioDescriptionEnabled ? "" : "selected"}>${e ? "አጥፋ (Disabled)" : "Disabled"}</option>
                  </select>
                </div>
              </div>

              <div class="popover-footer">
                <button type="button" class="btn-popover-action btn-popover-reset" id="btn-reset-layout">
                  ↺ ${e ? "ዳግም አስጀምር" : "Reset Layout"}
                </button>
                <button type="button" class="btn-popover-action btn-popover-save" id="btn-close-prefs">
                  ${e ? "ተግብር እና ዝጋ" : "Done"}
                </button>
              </div>
            </div>

            <!-- Keyboard Shortcuts Popover (Flows smoothly from keyboard icon, zero dark scrim) -->
            <div 
              class="shortcuts-popover" 
              id="dialog-shortcuts" 
              style="display: none;" 
              role="dialog" 
              aria-modal="true" 
              aria-labelledby="shortcuts-title">
              <div class="popover-header">
                <div class="popover-title" id="shortcuts-title">
                  <span aria-hidden="true">${V.shortcuts}</span>
                  <span>${e ? "የኪቦርድ አቋራጭ ቁልፎች" : "Keyboard Shortcuts Cheat-Sheet"}</span>
                </div>
                <button type="button" class="btn-popover-close" id="btn-close-shortcuts" aria-label="${e ? "ዝጋ" : "Close"}" title="${e ? "ዝጋ" : "Close"}">✕</button>
              </div>

              <div class="popover-body">
                <p style="margin: 0 0 0.75rem 0; font-size: 0.8rem; color: var(--color-muted-ink, #64748B); line-height: 1.4;">
                  ${e ? "ይህ ማጫወቻ ሙሉ በሙሉ በኪቦርድ ብቻ የሚሰራ ሲሆን ለስክሪን አንባቢ ተጠቃሚዎች ምቹ ነው" : "Full accessible keyboard control optimized for screen reader users and power learners."}
                </p>
                <div class="shortcuts-grid">
                  <div class="shortcut-item"><kbd>Space</kbd> / <kbd>K</kbd> <span>${e ? "አጫውት / አቁም" : "Play / Pause"}</span></div>
                  <div class="shortcut-item"><kbd>J</kbd> <span>${e ? "5 ሰከንድ ወደኋላ መልስ" : "Seek back 5s"}</span></div>
                  <div class="shortcut-item"><kbd>L</kbd> <span>${e ? "5 ሰከንድ ወደፊት ውሰድ" : "Seek forward 5s"}</span></div>
                  <div class="shortcut-item"><kbd>M</kbd> <span>${e ? "ድምጽ አጥፋ / አብራ" : "Mute / Unmute"}</span></div>
                  <div class="shortcut-item"><kbd>F</kbd> <span>${e ? "ሙሉ ማያ ገጽ" : "Toggle Fullscreen"}</span></div>
                  <div class="shortcut-item"><kbd>C</kbd> <span>${e ? "የትርጉም ጽሑፍ (CC)" : "Toggle Captions"}</span></div>
                  <div class="shortcut-item"><kbd>S</kbd> <span>${e ? "የምልክት ቋንቋ (EthSL)" : "Toggle Sign Language"}</span></div>
                  <div class="shortcut-item"><kbd>T</kbd> <span>${e ? "የጽሑፍ ግልባጭ ማሳያ" : "Toggle Transcript"}</span></div>
                  <div class="shortcut-item"><kbd>D</kbd> <span>${e ? "የድምፅ ማብራሪያ (AD)" : "Toggle Audio Description"}</span></div>
                  <div class="shortcut-item"><kbd>&gt;</kbd> / <kbd>&lt;</kbd> <span>${e ? "ፍጥነት ጨምር / ቀንስ" : "Speed Faster / Slower"}</span></div>
                  <div class="shortcut-item"><kbd>0</kbd> / <kbd>Home</kbd> <span>${e ? "ከመጀመሪያ ጀምር" : "Restart from beginning"}</span></div>
                  <div class="shortcut-item"><kbd>?</kbd> <span>${e ? "ይህን መመሪያ አሳይ" : "Open this cheat-sheet"}</span></div>
                  <div class="shortcut-item"><kbd>Esc</kbd> <span>${e ? "መስኮት ዝጋ" : "Close dialogs / Fullscreen"}</span></div>
                </div>
              </div>

              <div class="popover-footer" style="justify-content: flex-end;">
                <button type="button" class="btn-popover-action btn-popover-save" id="btn-ok-shortcuts">
                  ${e ? "ገባኝ" : "Got it"}
                </button>
              </div>
            </div>
          </div>

          <!-- RIGHT: Movable & Resizable Sign Language Window (Outside of video frame) -->
          <div 
            class="window-panel esl-window" 
            id="esl-window" 
            style="width: ${l}px; height: ${d}px; flex: 0 0 ${l}px; display: ${this.prefs.eslVisible && s ? "flex" : "none"};"
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
              <div class="header-controls" style="display: flex; align-items: center; gap: 4px;">
                <div class="dock-presets-group" role="group" aria-label="${e ? "የምልክት ቋንቋ መስኮት መትከያ" : "Sign window docking presets"}">
                  <button type="button" class="btn-dock-preset" id="btn-dock-tr" title="${e ? "ወደ ቀኝ ከላይ ይቆልፉ" : "Dock Top-Right"}" aria-label="${e ? "ወደ ቀኝ ከላይ ይቆልፉ" : "Dock Top-Right"}">⬈</button>
                  <button type="button" class="btn-dock-preset" id="btn-dock-br" title="${e ? "ወደ ቀኝ ከታች ይቆልፉ" : "Dock Bottom-Right"}" aria-label="${e ? "ወደ ቀኝ ከታች ይቆልፉ" : "Dock Bottom-Right"}">⬊</button>
                  <button type="button" class="btn-dock-preset" id="btn-dock-split" title="${e ? "ጎን ለጎን እይታ" : "Dock Side-by-Side"}" aria-label="${e ? "ጎን ለጎን እይታ" : "Dock Side-by-Side"}">◧</button>
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
                src="${s ? s.src : ""}">
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
      </section>
    `, this.bindDOMElements(), this.attachEventListeners(), this.setupWindowInteractions();
  }
  bindDOMElements() {
    this.mainVideo = this.shadow.getElementById("main-video"), this.signVideo = this.shadow.getElementById("sign-video"), this.captionOverlay = this.shadow.getElementById("caption-overlay"), this.syncController = new Ze(this.mainVideo, {
      driftThreshold: 0.25,
      onSignStatusChange: (s) => {
        const r = this.shadow.getElementById("sign-status-indicator");
        r && (s === "loading" ? (r.style.display = "inline-block", r.textContent = this.activeLocale === "am" ? "በመጫን ላይ..." : "Loading...") : s === "error" ? (r.style.display = "inline-block", r.textContent = this.activeLocale === "am" ? "ምልክት ቋንቋ አልተገኘም" : "Sign Unavailable", r.style.background = "#FEF2F2", r.style.color = "#991B1B") : (r.style.display = "inline-block", r.textContent = "EthSL", r.style.background = "rgba(255,255,255,0.2)", r.style.color = "#FFF"));
      }
    }), this.signVideo && this.syncController.setSignVideo(this.signVideo);
    const e = this.shadow.getElementById("transcript-target"), i = this.shadow.getElementById("live-chat-target"), t = this.shadow.getElementById("cb-auto-scroll");
    this.transcriptViewer = new et(e, {
      locale: this.activeLocale,
      onSeekAndPlay: (s) => {
        this.seekAndPlay(s);
      },
      onFollowChange: (s) => {
        t && (t.checked = s);
      }
    }), i && (this.liveChatViewer = new tt(i, {
      locale: this.activeLocale,
      onSeekAndPlay: (s) => {
        this.seekAndPlay(s);
      }
    }), this.liveChatMessages.length && this.liveChatViewer.setMessages(this.liveChatMessages));
  }
  setupWindowInteractions() {
    const e = this.shadow.getElementById("player-stage");
    if (!e) return;
    const i = (t, s, r, c, l, d, m) => {
      const n = this.shadow.getElementById(t), E = this.shadow.getElementById(s), v = this.shadow.getElementById(r), y = this.shadow.getElementById(c), h = this.shadow.getElementById(l), A = d ? this.shadow.getElementById(d) : null;
      if (!n || !E || !v) return;
      let u = null, D = !1, X = "corner", le = 0, de = 0, _ = 0, ce = 0, ee = null;
      const P = (k) => {
        if (!D) return;
        const L = k.clientX - le, w = k.clientY - de;
        ee !== null && cancelAnimationFrame(ee), ee = requestAnimationFrame(() => {
          let $ = _, T = ce;
          X === "corner" || X === "right" ? $ = Math.min(m.maxWidth, Math.max(m.minWidth, _ + L)) : X === "left" && ($ = Math.min(m.maxWidth, Math.max(m.minWidth, _ - L))), (X === "corner" || X === "bottom") && (T = Math.min(m.maxHeight, Math.max(m.minHeight, ce + w))), n.style.width = `${$}px`, n.style.height = `${T}px`, n.style.flex = `0 0 ${$}px`, u && (u.style.width = `${$}px`, u.style.height = `${T}px`, u.style.flex = `0 0 ${$}px`);
        });
      }, z = () => {
        D && (D = !1, n.classList.remove("is-resizing"), window.removeEventListener("pointermove", P), window.removeEventListener("pointerup", z), window.removeEventListener("pointercancel", z), ee !== null && (cancelAnimationFrame(ee), ee = null), m.onSaveSize(n.offsetWidth, n.offsetHeight));
      }, M = (k, L) => {
        D = !0, X = k, le = L.clientX, de = L.clientY, _ = n.offsetWidth, ce = n.offsetHeight, n.classList.add("is-resizing"), window.addEventListener("pointermove", P), window.addEventListener("pointerup", z), window.addEventListener("pointercancel", z), L.preventDefault(), L.stopPropagation();
      };
      v.addEventListener("pointerdown", (k) => M("corner", k)), y == null || y.addEventListener("pointerdown", (k) => M("bottom", k)), h == null || h.addEventListener("pointerdown", (k) => M("right", k)), A == null || A.addEventListener("pointerdown", (k) => M("left", k)), v.addEventListener("keydown", (k) => {
        let L = n.offsetWidth, w = n.offsetHeight, $ = !1;
        k.key === "ArrowRight" ? (L = Math.min(m.maxWidth, L + 20), $ = !0) : k.key === "ArrowLeft" ? (L = Math.max(m.minWidth, L - 20), $ = !0) : k.key === "ArrowDown" ? (w = Math.min(m.maxHeight, w + 20), $ = !0) : k.key === "ArrowUp" && (w = Math.max(m.minHeight, w - 20), $ = !0), $ && (k.preventDefault(), n.style.width = `${L}px`, n.style.height = `${w}px`, n.style.flex = `0 0 ${L}px`, u && (u.style.width = `${L}px`, u.style.height = `${w}px`, u.style.flex = `0 0 ${L}px`), m.onSaveSize(L, w));
      });
      let x = !1, I = 0, B = 0, oe = 0, re = 0, F = null;
      n.addEventListener("pointerdown", () => {
        if (n.classList.contains("floating")) {
          n.style.zIndex = "100";
          const k = t === "transcript-window" ? "esl-window" : "transcript-window", L = this.shadow.getElementById(k);
          L && L.classList.contains("floating") && (L.style.zIndex = "90");
        }
      });
      const Y = (k) => {
        const L = k.clientX - I, w = k.clientY - B;
        !x && Math.hypot(L, w) > 4 && (x = !0, !u && n.parentNode && (u = document.createElement("div"), u.className = "window-placeholder", u.style.width = `${n.offsetWidth}px`, u.style.height = `${n.offsetHeight}px`, u.style.flex = n.style.flex || `0 0 ${n.offsetWidth}px`, n.parentNode.insertBefore(u, n)), n.classList.add("floating"), n.style.position = "absolute", n.style.zIndex = "100"), x && (F !== null && cancelAnimationFrame(F), F = requestAnimationFrame(() => {
          const $ = oe + L, T = re + w;
          n.style.left = `${$}px`, n.style.top = `${T}px`, n.style.right = "auto", n.style.bottom = "auto";
        }));
      }, N = () => {
        x && (x = !1), window.removeEventListener("pointermove", Y), window.removeEventListener("pointerup", N), window.removeEventListener("pointercancel", N), F !== null && (cancelAnimationFrame(F), F = null);
      };
      E.addEventListener("pointerdown", (k) => {
        if (k.target.tagName === "INPUT" || k.target.tagName === "SELECT")
          return;
        I = k.clientX, B = k.clientY;
        const L = e.getBoundingClientRect(), w = n.getBoundingClientRect();
        oe = n.style.left ? parseFloat(n.style.left) : w.left - L.left, re = n.style.top ? parseFloat(n.style.top) : w.top - L.top, x = !1, n.style.zIndex = "100";
        const $ = t === "transcript-window" ? "esl-window" : "transcript-window", T = this.shadow.getElementById($);
        T && T.classList.contains("floating") && (T.style.zIndex = "90"), window.addEventListener("pointermove", Y), window.addEventListener("pointerup", N), window.addEventListener("pointercancel", N);
      }), E.addEventListener("keydown", (k) => {
        let L = !1;
        const w = 20;
        if (!n.classList.contains("floating")) {
          !u && n.parentNode && (u = document.createElement("div"), u.className = "window-placeholder", u.style.width = `${n.offsetWidth}px`, u.style.height = `${n.offsetHeight}px`, u.style.flex = n.style.flex || `0 0 ${n.offsetWidth}px`, n.parentNode.insertBefore(u, n));
          const S = e.getBoundingClientRect(), W = n.getBoundingClientRect();
          n.classList.add("floating"), n.style.position = "absolute", n.style.zIndex = "100", n.style.left = `${W.left - S.left}px`, n.style.top = `${W.top - S.top}px`;
        }
        let $ = parseFloat(n.style.left) || 0, T = parseFloat(n.style.top) || 0;
        k.key === "ArrowRight" ? ($ += w, L = !0) : k.key === "ArrowLeft" ? ($ -= w, L = !0) : k.key === "ArrowDown" ? (T += w, L = !0) : k.key === "ArrowUp" && (T -= w, L = !0), L && (k.preventDefault(), n.style.left = `${$}px`, n.style.top = `${T}px`);
      });
      const O = () => {
        n.classList.remove("floating"), n.style.position = "", n.style.left = "", n.style.top = "", n.style.right = "", n.style.bottom = "", n.style.zIndex = "", u && (u.remove(), u = null);
      };
      E.addEventListener("dblclick", O);
      const ue = (k) => {
        if (k === "split") {
          O();
          return;
        }
        n.classList.contains("floating") || (!u && n.parentNode && (u = document.createElement("div"), u.className = "window-placeholder", u.style.width = `${n.offsetWidth}px`, u.style.height = `${n.offsetHeight}px`, u.style.flex = n.style.flex || `0 0 ${n.offsetWidth}px`, n.parentNode.insertBefore(u, n)), n.classList.add("floating"), n.style.position = "absolute", n.style.zIndex = "100");
        const L = e.getBoundingClientRect(), w = n.offsetWidth || 280, $ = n.offsetHeight || 210, T = 16, S = Math.max(0, L.width - w - T), W = Math.max(0, L.height - $ - T);
        k === "tr" ? (n.style.left = `${S}px`, n.style.top = `${T}px`) : k === "br" && (n.style.left = `${S}px`, n.style.top = `${W}px`);
      };
      n.__reDock = O, n.__dockPreset = ue;
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
        onSaveSize: (t, s) => {
          this.prefs.transcriptWidth = t, this.prefs.transcriptHeight = s, C({ transcriptWidth: t, transcriptHeight: s });
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
        onSaveSize: (t, s) => {
          this.prefs.eslWidth = t, this.prefs.eslHeight = s, C({ eslWidth: t, eslHeight: s });
        }
      }
    );
  }
  attachEventListeners() {
    var ze, Me, qe, Pe, Ie, He, je, Re;
    const e = this.shadow.getElementById("btn-play"), i = this.shadow.getElementById("play-icon"), t = this.shadow.getElementById("big-play-btn"), s = this.shadow.getElementById("btn-restart"), r = this.shadow.getElementById("btn-speed-faster"), c = this.shadow.getElementById("btn-speed-slower"), l = this.shadow.getElementById("speed-display"), d = this.shadow.getElementById("state-display"), m = this.shadow.getElementById("btn-fullscreen"), n = this.shadow.getElementById("fullscreen-icon"), E = this.shadow.getElementById("btn-mute"), v = this.shadow.getElementById("mute-icon"), y = this.shadow.getElementById("player-container"), h = this.shadow.getElementById("seek-scrubber"), A = this.shadow.getElementById("time-display"), u = () => {
      this.mainVideo.paused ? this.mainVideo.play() : this.mainVideo.pause();
    };
    e && e.addEventListener("click", u), t && t.addEventListener("click", u), this.mainVideo.addEventListener("click", u), this.mainVideo.addEventListener("play", () => {
      i && (i.innerHTML = V.pause), e == null || e.setAttribute("aria-label", this.activeLocale === "am" ? "አቁም (Space / K)" : "Pause (Space / K)"), e == null || e.setAttribute("title", this.activeLocale === "am" ? "አቁም (Space / K)" : "Pause (Space / K)"), t == null || t.classList.add("is-hidden"), d && (d.textContent = this.activeLocale === "am" ? "እየተጫወተ ነው" : "Playing");
      const o = this.shadow.getElementById("audio-equalizer");
      o && o.classList.add("playing");
    }), this.mainVideo.addEventListener("pause", () => {
      i && (i.innerHTML = V.play), e == null || e.setAttribute("aria-label", this.activeLocale === "am" ? "አጫውት (Space / K)" : "Play (Space / K)"), e == null || e.setAttribute("title", this.activeLocale === "am" ? "አጫውት (Space / K)" : "Play (Space / K)"), t == null || t.classList.remove("is-hidden"), d && (d.textContent = this.mainVideo.ended ? this.activeLocale === "am" ? "ተጠናቋል" : "End of track" : this.activeLocale === "am" ? "ቆሟል" : "Paused");
      const o = this.shadow.getElementById("audio-equalizer");
      o && o.classList.remove("playing");
    }), this.mainVideo.addEventListener("ended", () => {
      i && (i.innerHTML = V.play), e == null || e.setAttribute("aria-label", this.activeLocale === "am" ? "አጫውት (Space / K)" : "Play (Space / K)"), e == null || e.setAttribute("title", this.activeLocale === "am" ? "አጫውት (Space / K)" : "Play (Space / K)"), t == null || t.classList.remove("is-hidden"), d && (d.textContent = this.activeLocale === "am" ? "ተጠናቋል" : "End of track");
      const o = this.shadow.getElementById("audio-equalizer");
      o && o.classList.remove("playing"), this.dispatchEvent(
        new CustomEvent("db-player:complete", {
          bubbles: !0,
          composed: !0,
          detail: {}
        })
      );
    }), s == null || s.addEventListener("click", () => {
      this.mainVideo.currentTime = 0, this.mainVideo.play(), this.transcriptViewer.updateActiveTime(0);
    });
    const D = [0.5, 0.75, 1, 1.25, 1.5, 2], X = () => {
      const o = this.mainVideo.playbackRate;
      l && (l.textContent = `Speed: ${o}x`);
    };
    r == null || r.addEventListener("click", () => {
      const o = this.mainVideo.playbackRate, p = D.filter((q) => q > o + 0.01), b = p.length > 0 ? p[0] : 2;
      this.mainVideo.playbackRate = b, X();
    }), c == null || c.addEventListener("click", () => {
      const o = this.mainVideo.playbackRate, p = D.filter((q) => q < o - 0.01), b = p.length > 0 ? p[p.length - 1] : 0.5;
      this.mainVideo.playbackRate = b, X();
    });
    const le = () => !!(document.fullscreenElement || document.webkitFullscreenElement || this.shadow.fullscreenElement || y != null && y.classList.contains("is-fullscreen") || this.hasAttribute("data-fullscreen")), de = async () => {
      try {
        le() ? ((document.fullscreenElement || document.webkitFullscreenElement || this.shadow.fullscreenElement) && (document.exitFullscreen ? await document.exitFullscreen() : document.webkitExitFullscreen && await document.webkitExitFullscreen()), y == null || y.classList.remove("is-fullscreen"), this.removeAttribute("data-fullscreen"), _()) : y != null && y.requestFullscreen ? await y.requestFullscreen() : y != null && y.webkitRequestFullscreen ? await y.webkitRequestFullscreen() : (y == null || y.classList.add("is-fullscreen"), this.setAttribute("data-fullscreen", "true"), _());
      } catch (o) {
        console.warn("Fullscreen native request fell back to CSS:", o), (y == null ? void 0 : y.classList.contains("is-fullscreen")) ? (y == null || y.classList.remove("is-fullscreen"), this.removeAttribute("data-fullscreen")) : (y == null || y.classList.add("is-fullscreen"), this.setAttribute("data-fullscreen", "true")), _();
      }
    };
    m == null || m.addEventListener("click", de);
    const _ = () => {
      const o = le();
      m == null || m.setAttribute("aria-pressed", o ? "true" : "false"), m == null || m.setAttribute(
        "aria-label",
        o ? this.activeLocale === "am" ? "ከሙሉ ማያ ገጽ ውጣ (F)" : "Exit Fullscreen (F)" : this.activeLocale === "am" ? "ሙሉ ማያ ገጽ (F)" : "Fullscreen (F)"
      ), m == null || m.setAttribute(
        "title",
        o ? this.activeLocale === "am" ? "ከሙሉ ማያ ገጽ ውጣ (F)" : "Exit Fullscreen (F)" : this.activeLocale === "am" ? "ሙሉ ማያ ገጽ (F)" : "Fullscreen (F)"
      ), n && (n.innerHTML = o ? V.fullscreenExit : V.fullscreenEnter);
    };
    document.addEventListener("fullscreenchange", _), document.addEventListener("webkitfullscreenchange", _);
    const ce = () => {
      this.mainVideo.muted = !this.mainVideo.muted;
    };
    E == null || E.addEventListener("click", ce);
    const ee = () => {
      const o = this.mainVideo.muted;
      E == null || E.setAttribute("aria-pressed", o ? "true" : "false"), E == null || E.setAttribute(
        "aria-label",
        o ? this.activeLocale === "am" ? "ድምጽ አብራ (M)" : "Unmute (M)" : this.activeLocale === "am" ? "ድምጽ አጥፋ (M)" : "Mute (M)"
      ), E == null || E.setAttribute(
        "title",
        o ? this.activeLocale === "am" ? "ድምጽ አብራ (M)" : "Unmute (M)" : this.activeLocale === "am" ? "ድምጽ አጥፋ (M)" : "Mute (M)"
      ), v && (v.innerHTML = o ? V.volumeMuted : V.volumeUnmuted);
    };
    this.mainVideo.addEventListener("volumechange", ee), this.mainVideo.addEventListener("timeupdate", () => {
      const o = this.mainVideo.currentTime, p = this.mainVideo.duration || 1;
      h && !h.matches(":active") && (h.value = (o / p * 100).toFixed(1)), A && (A.textContent = `${this.formatTime(o)} / ${this.formatTime(p)}`), this.updateCaptionDisplay(), this.transcriptViewer.updateActiveTime(o), this.liveChatViewer && this.liveChatViewer.updateTime(o), this.dispatchEvent(
        new CustomEvent("db-player:progress", {
          bubbles: !0,
          composed: !0,
          detail: {
            seconds: Math.floor(o),
            percent: Math.round(o / p * 100)
          }
        })
      );
    }), h.addEventListener("input", () => {
      const o = this.mainVideo.duration || 1;
      this.mainVideo.currentTime = parseFloat(h.value) / 100 * o;
    }), (ze = this.shadow.getElementById("btn-rewind")) == null || ze.addEventListener("click", () => {
      this.mainVideo.currentTime = Math.max(0, this.mainVideo.currentTime - 5);
    }), (Me = this.shadow.getElementById("btn-forward")) == null || Me.addEventListener("click", () => {
      this.mainVideo.currentTime = Math.min(this.mainVideo.duration || 1e3, this.mainVideo.currentTime + 5);
    });
    const P = this.shadow.getElementById("btn-ad");
    P == null || P.addEventListener("click", async () => {
      if (!this.manifest) return;
      this.prefs.audioDescriptionEnabled = !this.prefs.audioDescriptionEnabled, C({ audioDescriptionEnabled: this.prefs.audioDescriptionEnabled }), P.setAttribute("aria-pressed", this.prefs.audioDescriptionEnabled ? "true" : "false");
      const o = this.prefs.audioDescriptionEnabled ? "described" : "main", p = this.manifest.sources.find((b) => b.kind === o) || this.manifest.sources.find((b) => b.kind === "main");
      p && await this.syncController.switchSource(p.src);
    });
    const z = this.shadow.getElementById("btn-cc");
    z == null || z.addEventListener("click", async () => {
      const o = ["en", "am", "om", "ti", "so", "off"], p = (o.indexOf(this.prefs.captionLanguage) + 1) % o.length;
      this.prefs.captionLanguage = o[p], C({ captionLanguage: this.prefs.captionLanguage });
      const b = this.prefs.captionLanguage === "off";
      z.setAttribute("aria-pressed", b ? "false" : "true"), z.setAttribute("title", `Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`), z.setAttribute(
        "aria-label",
        `Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`
      );
      const q = this.shadow.getElementById("select-cc-lang");
      if (q && (q.value = this.prefs.captionLanguage), await this.loadCaptionTrack(this.prefs.captionLanguage), !b) {
        const R = this.shadow.getElementById("select-transcript-lang");
        R && R.value !== this.prefs.captionLanguage && (R.value = this.prefs.captionLanguage, await this.switchTranscriptLanguage(this.prefs.captionLanguage));
      }
    });
    const M = this.shadow.getElementById("btn-esl"), x = this.shadow.getElementById("esl-window");
    M == null || M.addEventListener("click", () => {
      this.prefs.eslVisible = !this.prefs.eslVisible, C({ eslVisible: this.prefs.eslVisible }), M.setAttribute("aria-pressed", this.prefs.eslVisible ? "true" : "false"), x && (x.style.display = this.prefs.eslVisible ? "flex" : "none");
    });
    const I = this.shadow.getElementById("btn-transcript-toggle"), B = this.shadow.getElementById("transcript-window");
    I == null || I.addEventListener("click", () => {
      const p = !((B == null ? void 0 : B.style.display) !== "none");
      this.prefs.transcriptVisible = p, C({ transcriptVisible: p }), I.setAttribute("aria-pressed", p ? "true" : "false"), B && (B.style.display = p ? "flex" : "none");
    });
    const oe = this.shadow.getElementById("cb-auto-scroll");
    oe == null || oe.addEventListener("change", () => {
      this.transcriptViewer.setFollowing(oe.checked);
    });
    const re = this.shadow.getElementById("select-transcript-lang");
    re == null || re.addEventListener("change", async () => {
      const o = re.value;
      await this.switchTranscriptLanguage(o);
    });
    const F = this.shadow.getElementById("btn-prefs"), Y = this.shadow.getElementById("btn-transcript-prefs"), N = this.shadow.getElementById("btn-esl-prefs"), O = this.shadow.getElementById("prefs-dialog"), ue = this.shadow.getElementById("btn-close-prefs"), k = this.shadow.getElementById("btn-dismiss-prefs"), L = this.shadow.getElementById("btn-reset-layout"), w = this.shadow.getElementById("btn-quality"), $ = this.shadow.getElementById("quality-menu"), T = this.shadow.getElementById("dialog-shortcuts"), S = this.shadow.getElementById("btn-shortcuts"), W = this.shadow.getElementById("btn-close-shortcuts"), Ee = this.shadow.getElementById("btn-ok-shortcuts"), j = this.shadow.getElementById("select-cc-lang"), G = this.shadow.getElementById("select-cc-size"), J = this.shadow.getElementById("select-cc-theme"), ne = this.shadow.getElementById("select-video-quality"), te = this.shadow.getElementById("toggle-esl-visibility"), ie = this.shadow.getElementById("toggle-transcript-visibility"), ae = this.shadow.getElementById("toggle-ad-enabled"), Z = () => {
      $ && ($.style.display = "none"), T && (T.style.display = "none"), O && (O.style.display = "none"), w == null || w.classList.remove("is-active"), w == null || w.setAttribute("aria-expanded", "false"), S == null || S.classList.remove("is-active"), S == null || S.setAttribute("aria-expanded", "false"), F == null || F.classList.remove("is-active"), F == null || F.setAttribute("aria-expanded", "false"), this.activePopover = null, this.isQualityMenuOpen = !1, this.isPreferencesOpen = !1, this.isShortcutsOpen = !1;
    }, Fe = (o) => {
      if (Z(), o === "quality") {
        this.activePopover = "quality", this.isQualityMenuOpen = !0, $ && ($.style.display = "flex"), w == null || w.classList.add("is-active"), w == null || w.setAttribute("aria-expanded", "true");
        const p = this.shadow.querySelector(`.quality-menu-item[data-quality="${this.currentQuality}"]`) || this.shadow.querySelector(".quality-menu-item");
        p == null || p.focus();
      } else o === "shortcuts" ? (this.activePopover = "shortcuts", this.isShortcutsOpen = !0, T && (T.style.display = "flex"), S == null || S.classList.add("is-active"), S == null || S.setAttribute("aria-expanded", "true"), W == null || W.focus()) : o === "prefs" && (this.activePopover = "prefs", this.isPreferencesOpen = !0, ne && (ne.value = this.currentQuality), j && (j.value = this.prefs.captionLanguage), G && (G.value = this.prefs.captionSize), J && (J.value = this.prefs.captionTheme), te && (te.value = this.prefs.eslVisible ? "show" : "hide"), ie && (ie.value = this.prefs.transcriptVisible !== !1 ? "show" : "hide"), ae && (ae.value = this.prefs.audioDescriptionEnabled ? "on" : "off"), O && (O.style.display = "flex"), F == null || F.classList.add("is-active"), F == null || F.setAttribute("aria-expanded", "true"), j == null || j.focus());
    }, be = (o) => {
      this.activePopover === o ? Z() : Fe(o);
    }, se = (o) => o.stopPropagation();
    w == null || w.addEventListener("pointerdown", se), S == null || S.addEventListener("pointerdown", se), F == null || F.addEventListener("pointerdown", se), Y == null || Y.addEventListener("pointerdown", se), N == null || N.addEventListener("pointerdown", se), $ == null || $.addEventListener("pointerdown", se), T == null || T.addEventListener("pointerdown", se), O == null || O.addEventListener("pointerdown", se), w == null || w.addEventListener("click", (o) => {
      o.preventDefault(), o.stopPropagation(), be("quality");
    }), this.shadow.querySelectorAll(".quality-menu-item").forEach((o) => {
      o.addEventListener("click", (p) => {
        p.preventDefault(), p.stopPropagation();
        const b = o.getAttribute("data-quality");
        b && (Z(), w == null || w.focus(), this.applyQuality(b).catch((q) => console.warn("Quality apply error:", q)));
      });
    }), F == null || F.addEventListener("click", (o) => {
      o.preventDefault(), o.stopPropagation(), be("prefs");
    }), Y == null || Y.addEventListener("click", (o) => {
      o.stopPropagation(), Fe("prefs");
    }), N == null || N.addEventListener("click", (o) => {
      o.stopPropagation(), Fe("prefs");
    }), k == null || k.addEventListener("click", (o) => {
      o.stopPropagation(), Z(), F == null || F.focus();
    }), S == null || S.addEventListener("click", (o) => {
      o.preventDefault(), o.stopPropagation(), be("shortcuts");
    }), W == null || W.addEventListener("click", (o) => {
      o.preventDefault(), o.stopPropagation(), Z(), S == null || S.focus();
    }), Ee == null || Ee.addEventListener("click", (o) => {
      o.preventDefault(), o.stopPropagation(), Z(), S == null || S.focus();
    }), j == null || j.addEventListener("change", async () => {
      if (j.value !== this.prefs.captionLanguage) {
        if (this.prefs.captionLanguage = j.value, C({ captionLanguage: this.prefs.captionLanguage }), z) {
          const o = this.prefs.captionLanguage === "off";
          z.setAttribute("aria-pressed", o ? "false" : "true");
        }
        await this.loadCaptionTrack(this.prefs.captionLanguage);
      }
    }), G == null || G.addEventListener("change", () => {
      G.value !== this.prefs.captionSize && (this.prefs.captionSize = G.value, C({ captionSize: this.prefs.captionSize }), this.updateCaptionDisplay());
    }), J == null || J.addEventListener("change", () => {
      J.value !== this.prefs.captionTheme && (this.prefs.captionTheme = J.value, C({ captionTheme: this.prefs.captionTheme }), this.updateCaptionDisplay());
    }), te == null || te.addEventListener("change", () => {
      var b;
      const o = !!(this.signVideo || (b = this.manifest) != null && b.sources.some((q) => q.kind === "sign")), p = te.value === "show";
      this.prefs.eslVisible = p, C({ eslVisible: p }), M && M.setAttribute("aria-pressed", p ? "true" : "false"), x && (x.style.display = p && o ? "flex" : "none");
    }), ie == null || ie.addEventListener("change", () => {
      const o = ie.value === "show";
      this.prefs.transcriptVisible = o, C({ transcriptVisible: o }), I && I.setAttribute("aria-pressed", o ? "true" : "false"), B && (B.style.display = o ? "flex" : "none");
    }), ae == null || ae.addEventListener("change", () => {
      const o = ae.value === "on";
      this.prefs.audioDescriptionEnabled = o, C({ audioDescriptionEnabled: o }), P && P.setAttribute("aria-pressed", o ? "true" : "false");
    }), ue == null || ue.addEventListener("click", async () => {
      var p;
      if (j && j.value !== this.prefs.captionLanguage) {
        if (this.prefs.captionLanguage = j.value, C({ captionLanguage: this.prefs.captionLanguage }), z) {
          const b = this.prefs.captionLanguage === "off";
          z.setAttribute("aria-pressed", b ? "false" : "true");
        }
        await this.loadCaptionTrack(this.prefs.captionLanguage);
      }
      G && G.value !== this.prefs.captionSize && (this.prefs.captionSize = G.value, C({ captionSize: this.prefs.captionSize }), this.updateCaptionDisplay()), J && J.value !== this.prefs.captionTheme && (this.prefs.captionTheme = J.value, C({ captionTheme: this.prefs.captionTheme }), this.updateCaptionDisplay());
      const o = !!(this.signVideo || (p = this.manifest) != null && p.sources.some((b) => b.kind === "sign"));
      if (te) {
        const b = te.value === "show";
        this.prefs.eslVisible = b, C({ eslVisible: b }), M && M.setAttribute("aria-pressed", b ? "true" : "false"), x && (x.style.display = b && o ? "flex" : "none");
      }
      if (ie) {
        const b = ie.value === "show";
        this.prefs.transcriptVisible = b, C({ transcriptVisible: b }), I && I.setAttribute("aria-pressed", b ? "true" : "false"), B && (B.style.display = b ? "flex" : "none");
      }
      if (ae) {
        const b = ae.value === "on";
        this.prefs.audioDescriptionEnabled = b, C({ audioDescriptionEnabled: b }), P && P.setAttribute("aria-pressed", b ? "true" : "false");
      }
      Z(), F == null || F.focus();
    }), this.onOutsidePointerDown && window.removeEventListener("pointerdown", this.onOutsidePointerDown), this.onOutsidePointerDown = (o) => {
      if (this.activePopover === null) return;
      const p = o.composedPath(), b = (U) => U && p.includes(U), q = this.activePopover === "quality" ? $ : this.activePopover === "shortcuts" ? T : O, R = this.activePopover === "quality" ? w : this.activePopover === "shortcuts" ? S : F;
      !b(q) && !b(R) && Z();
    }, window.addEventListener("pointerdown", this.onOutsidePointerDown), ne == null || ne.addEventListener("change", async () => {
      ne.value !== this.currentQuality && await this.applyQuality(ne.value);
    }), L == null || L.addEventListener("click", () => {
      var me, pe, ke;
      Xe(), this.prefs = De();
      const o = this.shadow.getElementById("select-cc-lang"), p = this.shadow.getElementById("select-cc-size"), b = this.shadow.getElementById("select-cc-theme"), q = this.shadow.getElementById("select-video-quality"), R = this.shadow.getElementById("toggle-esl-visibility"), U = this.shadow.getElementById("toggle-transcript-visibility"), fe = this.shadow.getElementById("toggle-ad-enabled");
      q && (q.value = "auto"), this.applyQuality("auto"), o && (o.value = this.prefs.captionLanguage), p && (p.value = this.prefs.captionSize), b && (b.value = this.prefs.captionTheme), R && (R.value = "show"), U && (U.value = "show"), fe && (fe.value = "off"), this.updateCaptionDisplay(), this.loadCaptionTrack(this.prefs.captionLanguage), B && ((me = B.__reDock) == null || me.call(B), B.classList.remove("floating"), B.style.position = "", B.style.left = "", B.style.top = "", B.style.right = "", B.style.bottom = "", B.style.zIndex = "", B.style.width = `${H.transcriptWidth}px`, B.style.height = `${H.transcriptHeight}px`, B.style.flex = `0 0 ${H.transcriptWidth}px`, B.style.display = "flex"), x && ((pe = x.__reDock) == null || pe.call(x), x.classList.remove("floating"), x.style.position = "", x.style.left = "", x.style.top = "", x.style.right = "", x.style.bottom = "", x.style.zIndex = "", x.style.width = `${H.eslWidth}px`, x.style.height = `${H.eslHeight}px`, x.style.flex = `0 0 ${H.eslWidth}px`, x.style.display = this.signVideo || (ke = this.manifest) != null && ke.sources.some((_e) => _e.kind === "sign") ? "flex" : "none"), M && M.setAttribute("aria-pressed", "true"), I && I.setAttribute("aria-pressed", "true"), P && P.setAttribute("aria-pressed", "false");
    }), (qe = this.shadow.getElementById("select-cc-lang")) == null || qe.addEventListener("change", async (o) => {
      const p = o.target.value;
      if (this.prefs.captionLanguage = p, C({ captionLanguage: this.prefs.captionLanguage }), z) {
        const b = this.prefs.captionLanguage === "off";
        z.setAttribute("aria-pressed", b ? "false" : "true"), z.setAttribute("title", `Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`), z.setAttribute(
          "aria-label",
          `Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`
        );
      }
      if (await this.loadCaptionTrack(this.prefs.captionLanguage), p !== "off") {
        const b = this.shadow.getElementById("select-transcript-lang");
        b && b.value !== p && (b.value = p, await this.switchTranscriptLanguage(p));
      }
    }), (Pe = this.shadow.getElementById("select-cc-size")) == null || Pe.addEventListener("change", (o) => {
      this.prefs.captionSize = o.target.value, C({ captionSize: this.prefs.captionSize }), this.updateCaptionDisplay();
    }), (Ie = this.shadow.getElementById("select-cc-theme")) == null || Ie.addEventListener("change", (o) => {
      this.prefs.captionTheme = o.target.value, C({ captionTheme: this.prefs.captionTheme }), this.updateCaptionDisplay();
    }), (He = this.shadow.getElementById("toggle-esl-visibility")) == null || He.addEventListener("change", (o) => {
      var q;
      const p = o.target.value === "show", b = !!(this.signVideo || (q = this.manifest) != null && q.sources.some((R) => R.kind === "sign"));
      this.prefs.eslVisible = p, C({ eslVisible: p }), M && M.setAttribute("aria-pressed", p ? "true" : "false"), x && (x.style.display = p && b ? "flex" : "none");
    }), (je = this.shadow.getElementById("toggle-transcript-visibility")) == null || je.addEventListener("change", (o) => {
      const p = o.target.value === "show";
      this.prefs.transcriptVisible = p, C({ transcriptVisible: p }), I && I.setAttribute("aria-pressed", p ? "true" : "false"), B && (B.style.display = p ? "flex" : "none");
    }), (Re = this.shadow.getElementById("toggle-ad-enabled")) == null || Re.addEventListener("change", (o) => {
      const p = o.target.value === "on";
      this.prefs.audioDescriptionEnabled = p, C({ audioDescriptionEnabled: p }), P && P.setAttribute("aria-pressed", p ? "true" : "false");
    });
    const ve = this.shadow.getElementById("transcript-search");
    ve == null || ve.addEventListener("input", () => {
      this.transcriptViewer.setSearchQuery(ve.value);
    });
    const ye = this.shadow.getElementById("live-chat-search");
    ye == null || ye.addEventListener("input", () => {
      this.liveChatViewer && this.liveChatViewer.setSearchQuery(ye.value);
    });
    const Q = this.shadow.getElementById("tab-btn-transcript"), K = this.shadow.getElementById("tab-btn-chat"), we = this.shadow.getElementById("transcript-view-panel"), xe = this.shadow.getElementById("live-chat-view-panel");
    Q == null || Q.addEventListener("click", () => {
      this.activeLeftTab = "transcript", Q.classList.add("active"), Q.setAttribute("aria-selected", "true"), K == null || K.classList.remove("active"), K == null || K.setAttribute("aria-selected", "false"), we && (we.style.display = "flex"), xe && (xe.style.display = "none");
    }), K == null || K.addEventListener("click", () => {
      this.activeLeftTab = "chat", K.classList.add("active"), K.setAttribute("aria-selected", "true"), Q == null || Q.classList.remove("active"), Q == null || Q.setAttribute("aria-selected", "false"), we && (we.style.display = "none"), xe && (xe.style.display = "flex"), this.liveChatViewer && this.liveChatViewer.updateTime(this.mainVideo.currentTime);
    });
    const Se = this.shadow.getElementById("btn-dock-tr"), Ae = this.shadow.getElementById("btn-dock-br"), $e = this.shadow.getElementById("btn-dock-split");
    Se == null || Se.addEventListener("click", () => {
      var o;
      return (o = x == null ? void 0 : x.__dockPreset) == null ? void 0 : o.call(x, "tr");
    }), Ae == null || Ae.addEventListener("click", () => {
      var o;
      return (o = x == null ? void 0 : x.__dockPreset) == null ? void 0 : o.call(x, "br");
    }), $e == null || $e.addEventListener("click", () => {
      var o;
      return (o = x == null ? void 0 : x.__dockPreset) == null ? void 0 : o.call(x, "split");
    });
    const Be = this.shadow.getElementById("btn-export-brf");
    Be == null || Be.addEventListener("click", () => {
      var fe, me;
      const o = ((fe = this.transcriptViewer) == null ? void 0 : fe.getSegments()) || [], p = ((me = this.manifest) == null ? void 0 : me.title) && (this.manifest.title[this.activeLocale] || this.manifest.title.en) || "Lesson Transcript", b = st({
        title: p,
        language: this.activeLocale === "am" || this.activeLocale === "ti" ? "am" : "en",
        segments: o.length > 0 ? o : this.currentCues.map((pe, ke) => ({
          id: ke,
          start: pe.start,
          end: pe.end,
          text: pe.text,
          speaker: this.activeLocale === "am" ? "አስተማሪ" : "Instructor"
        })),
        date: "2026-11-14"
      }), q = new Blob([b], { type: "text/plain;charset=us-ascii" }), R = URL.createObjectURL(q), U = document.createElement("a");
      U.href = R, U.download = `lesson-transcript.${this.activeLocale}.brf`, document.body.appendChild(U), U.click(), document.body.removeChild(U), URL.revokeObjectURL(R);
    });
    let he = !1;
    const ge = this.shadow.getElementById("btn-chat-questions-filter");
    ge == null || ge.addEventListener("click", () => {
      he = !he, ge.setAttribute("aria-pressed", he ? "true" : "false"), ge.classList.toggle("active", he), this.liveChatViewer && this.liveChatViewer.setQuestionsOnly(he);
    }), this.shadow.querySelectorAll(".btn-preset-pill").forEach((o) => {
      o.addEventListener("click", () => {
        const p = o.getAttribute("data-preset");
        if (p) {
          this.prefs.captionTheme = p;
          const b = this.shadow.getElementById("select-cc-theme");
          b && (b.value = p), C({ captionTheme: p }), this.updateCaptionDisplay();
        }
      });
    });
    const Ce = this.shadow.getElementById("player-container");
    Ce == null || Ce.addEventListener("keydown", (o) => {
      if (o.key === "Escape" && this.activePopover !== null) {
        const p = this.activePopover;
        Z(), p === "quality" ? w == null || w.focus() : p === "shortcuts" ? S == null || S.focus() : p === "prefs" && (F == null || F.focus());
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
            o.preventDefault(), ce();
            break;
          case "f":
          case "F":
            o.preventDefault(), de();
            break;
          case "0":
          case "Home":
            o.preventDefault(), this.mainVideo.currentTime = 0, this.mainVideo.play(), this.transcriptViewer.updateActiveTime(0);
            break;
          case ">":
          case ".":
            o.preventDefault(), r == null || r.click();
            break;
          case "<":
          case ",":
            o.preventDefault(), c == null || c.click();
            break;
          case "c":
          case "C":
            o.preventDefault(), z == null || z.click();
            break;
          case "s":
          case "S":
            o.preventDefault(), M == null || M.click();
            break;
          case "d":
          case "D":
            o.preventDefault(), P == null || P.click();
            break;
          case "t":
          case "T":
            o.preventDefault(), I == null || I.click();
            break;
          case "?":
          case "/":
            o.preventDefault(), be("shortcuts");
            break;
          case "Escape":
            le() && (o.preventDefault(), de());
            break;
        }
    });
  }
  updateLocaleStrings() {
    this.render(), this.initTracksAndTranscript(), this.liveChatViewer && (this.liveChatViewer.setLocale(this.activeLocale), this.liveChatViewer.setMessages(this.liveChatMessages));
  }
  formatTime(e) {
    const i = Math.floor(e / 60), t = Math.floor(e % 60);
    return `${i.toString().padStart(2, "0")}:${t.toString().padStart(2, "0")}`;
  }
}
customElements.get("a11y-media-player") || customElements.define("a11y-media-player", Ue);
if (!customElements.get("db-player")) {
  class f extends Ue {
  }
  customElements.define("db-player", f);
}
const ot = [
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
function rt(f) {
  const a = typeof f == "string" ? new Date(f) : f, e = a.getUTCFullYear(), i = a.getUTCMonth() + 1, t = a.getUTCDate(), s = Math.floor((14 - i) / 12), r = e + 4800 - s, c = i + 12 * s - 3, l = t + Math.floor((153 * c + 2) / 5) + 365 * r + Math.floor(r / 4) - Math.floor(r / 100) + Math.floor(r / 400) - 32045, d = (l - 1723856) % 1461, m = d % 365 + 365 * Math.floor(d / 1460), n = 4 * Math.floor((l - 1723856) / 1461) + Math.floor(d / 365) - Math.floor(d / 1460), E = Math.floor(m / 30) + 1, v = m % 30 + 1, y = ot[Math.min(E - 1, 12)];
  return {
    year: n,
    month: E,
    day: v,
    monthNameAmharic: y
  };
}
function nt(f) {
  const a = rt(f), e = `${a.monthNameAmharic} ${a.day}፣ ${a.year} ዓ.ም`;
  return {
    iso: f,
    ethiopic: e,
    display: `${f} (${e})`
  };
}
class lt extends HTMLElement {
  constructor() {
    super();
    g(this, "shadow");
    g(this, "job", null);
    g(this, "activeLocale", "en");
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
    var d, m;
    if (!this.job) {
      this.shadow.innerHTML = '<div class="job-placeholder">No job data supplied</div>';
      return;
    }
    const e = this.activeLocale === "am", i = this.job.title[this.activeLocale] || this.job.title.en, t = this.job.location[this.activeLocale] || this.job.location.en, s = this.job.description[this.activeLocale] || this.job.description.en, r = typeof ((d = this.job.audioSummary) == null ? void 0 : d.textEquivalent) == "object" ? this.job.audioSummary.textEquivalent[this.activeLocale] || this.job.audioSummary.textEquivalent.en || "" : ((m = this.job.audioSummary) == null ? void 0 : m.textEquivalent) || "", c = this.job.applicationDeadline ? nt(this.job.applicationDeadline) : null, l = {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      title: i,
      description: s,
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
        ${JSON.stringify(l)}
      <\/script>

      <article class="card" aria-labelledby="job-title-${this.job.id}">
        <header>
          <h4 id="job-title-${this.job.id}">${i}</h4>
          <div class="meta-line">
            <span><strong>${this.job.employer}</strong></span> &bull;
            <span>${t}</span> &bull;
            <span>${this.job.workMode.toUpperCase()}</span>
            ${c ? ` &bull; <span class="badge calendar" aria-label="Deadline: ${c.display}">📅 ${e ? "የማመልከቻ ማብቂያ፦" : "Deadline:"} ${c.display}</span>` : ""}
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
            ${r}
          </div>
        </section>

        <p>${s}</p>

        <!-- Transparent Accommodations -->
        <div>
          <strong id="acc-heading-${this.job.id}">${e ? "የተረጋገጡ ማመቻቸቶች (Accommodations Offered):" : "Employer-Provided Accommodations:"}</strong>
          <ul class="tags-list" aria-labelledby="acc-heading-${this.job.id}">
            ${this.job.accommodations.map(
      (n) => `
              <li class="badge accommodation">
                <span aria-hidden="true">✓</span>
                <span>${n.label[this.activeLocale] || n.label.en}</span>
                <small style="opacity: 0.85;">(${n.source})</small>
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
customElements.get("a11y-job-card") || customElements.define("a11y-job-card", lt);
const dt = "abugida-media", ct = 1;
class pt {
  constructor() {
    g(this, "db", null);
    g(this, "cacheName", "abugida-offline-v1");
  }
  async init() {
    if (!this.db)
      return new Promise((a, e) => {
        const i = indexedDB.open(dt, ct);
        i.onupgradeneeded = (t) => {
          const s = t.target.result;
          s.objectStoreNames.contains("preferences") || s.createObjectStore("preferences"), s.objectStoreNames.contains("progress") || s.createObjectStore("progress", { keyPath: "lessonId" }), s.objectStoreNames.contains("packages") || s.createObjectStore("packages", { keyPath: "packageKey" });
        }, i.onsuccess = (t) => {
          this.db = t.target.result, a();
        }, i.onerror = () => {
          console.warn("IndexedDB unavailable, falling back to memory/localStorage"), a();
        };
      });
  }
  // --- Progress Tracking (Local-first) ---
  async saveProgress(a) {
    if (await this.init(), !this.db) {
      try {
        localStorage.setItem(`progress_${a.lessonId}`, JSON.stringify(a));
      } catch {
      }
      return;
    }
    return new Promise((e) => {
      const i = this.db.transaction("progress", "readwrite");
      i.objectStore("progress").put(a), i.oncomplete = () => e(), i.onerror = () => e();
    });
  }
  async getProgress(a) {
    if (await this.init(), !this.db)
      try {
        const e = localStorage.getItem(`progress_${a}`);
        return e ? JSON.parse(e) : null;
      } catch {
        return null;
      }
    return new Promise((e) => {
      const s = this.db.transaction("progress", "readonly").objectStore("progress").get(a);
      s.onsuccess = () => e(s.result || null), s.onerror = () => e(null);
    });
  }
  // --- 3G Offline Package Download Engine ---
  async downloadPackage(a, e, i, t, s) {
    await this.init();
    const r = `${a}:${e}`;
    if (!("caches" in window))
      throw new Error("Cache Storage API is not supported in this browser.");
    try {
      const c = await caches.open(this.cacheName);
      let l = 0;
      const d = t.length;
      for (const m of t) {
        const n = await fetch(m);
        if (!n.ok)
          throw new Error(`Failed to fetch asset: ${m} (${n.status})`);
        await c.put(m, n.clone()), l++;
        const E = Math.round(l / d * 100);
        s(E, l, d);
      }
      return await this.savePackageRecord({
        packageKey: r,
        lessonId: a,
        packageId: e,
        packageName: i,
        status: "ready",
        totalBytes: 32e5,
        downloadedBytes: 32e5,
        timestamp: Date.now()
      }), !0;
    } catch (c) {
      throw await this.savePackageRecord({
        packageKey: r,
        lessonId: a,
        packageId: e,
        packageName: i,
        status: "error",
        totalBytes: 32e5,
        downloadedBytes: 0,
        timestamp: Date.now(),
        error: c instanceof Error ? c.message : "Download failed"
      }), c;
    }
  }
  async isPackageReady(a, e) {
    await this.init();
    const i = `${a}:${e}`, t = await this.getPackageRecord(i);
    return (t == null ? void 0 : t.status) === "ready";
  }
  async savePackageRecord(a) {
    if (this.db)
      return new Promise((e) => {
        const i = this.db.transaction("packages", "readwrite");
        i.objectStore("packages").put(a), i.oncomplete = () => e(), i.onerror = () => e();
      });
  }
  async getPackageRecord(a) {
    return this.db ? new Promise((e) => {
      const s = this.db.transaction("packages", "readonly").objectStore("packages").get(a);
      s.onsuccess = () => e(s.result || null), s.onerror = () => e(null);
    }) : null;
  }
}
const ft = new pt(), mt = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    script: "Latin",
    region: "Global / Academic"
  },
  {
    code: "am",
    name: "Amharic",
    nativeName: "አማርኛ",
    script: "Ethiopic",
    region: "Federal / Nationwide"
  },
  {
    code: "om",
    name: "Afaan Oromoo",
    nativeName: "Afaan Oromoo",
    script: "Latin",
    region: "Oromia / Nationwide"
  },
  {
    code: "ti",
    name: "Tigrigna",
    nativeName: "ትግርኛ",
    script: "Ethiopic",
    region: "Tigray"
  },
  {
    code: "so",
    name: "Somali",
    nativeName: "Af-Soomaali",
    script: "Latin",
    region: "Somali Region"
  }
], Te = {
  en: {
    appTitle: "Abugida Media Kit (አቡጊዳ)",
    appSubtitle: "Accessible Learning Media & Career Gateway · Digital Bridge 2026",
    skipLink: "Skip to main content",
    navHome: "Home",
    navLesson: "Accessible Lesson",
    navCareers: "Career Gateway",
    navStudio: "Caption Studio",
    navVerify: "Verify Certificate",
    navEmbed: "Embed Widget",
    selectLang: "Select Language",
    play: "Play (k / Space)",
    pause: "Pause (k / Space)",
    rewind10: "Rewind 10s (j)",
    forward10: "Forward 10s (l)",
    captions: "Captions (C)",
    signLanguage: "Ethiopian Sign Language (ESL) (S)",
    audioDescription: "Audio Description (D)",
    transcript: "Transcript (T)",
    settings: "Accessibility & Layout Settings",
    videoQuality: "Video Quality",
    fullscreen: "Fullscreen (f)",
    mute: "Mute / Unmute (m)",
    speed: "Playback Speed",
    transcriptTitle: "Lesson Transcript",
    liveChatTitle: "Live Chat Replay",
    autoScroll: "Auto scroll",
    followActive: "✓ Follow Playback",
    followResume: "↻ Resume Following",
    searchCues: "Search transcript cues...",
    accessibleDocsHeading: "Accessible Lesson Documents",
    accessibleDocsDesc: "Download study materials formatted for screen readers, low bandwidth, and offline study:",
    docHtmlTitle: "Accessible HTML Document",
    docHtmlDesc: "Semantic HTML, Screen Reader Ready · 18 KB",
    docPdfTitle: "Tagged Accessible PDF",
    docPdfDesc: "Inspected PDF/UA tags & Alt-Text · 60 KB",
    docBrfTitle: "Braille Ready Format (.brf)",
    docBrfDesc: "BANA 40×25 Embosser & Refreshable Display · 4 KB",
    docBraillePdfTitle: "Tactile Braille Document (.pdf)",
    docBraillePdfDesc: "Authentic 6-Dot Cells, Interlined Print & Diagram · 208 KB",
    viewBtn: "View",
    downloadBtn: "Download",
    pack3gHeading: "Low-Bandwidth 3G Study Pack",
    careerHeading: "Apply Your Skills: Verified Accessible Careers",
    skillsTaught: "Skills Taught",
    knowledgeCheck: "Module Self-Assessment",
    verifiedBadge: "WCAG 2.2 AAA Ready",
    exportBrf: "Export Braille (.brf)",
    exportPdf: "Export Braille PDF (.pdf)",
    resetSettings: "Reset Layout & Settings"
  },
  am: {
    appTitle: "አቡጊዳ ሚዲያ ኪት (Abugida)",
    appSubtitle: "ተደራሽ የትምህርት ሚዲያ እና የሥራ መግቢያ በር · ዲጂታል ብሪጅ 2026",
    skipLink: "ወደ ዋናው ይዘት ዝለል",
    navHome: "ዋና ገጽ",
    navLesson: "ተደራሽ ትምህርት",
    navCareers: "የሥራ መግቢያ በር",
    navStudio: "የትርጉም ስቱዲዮ",
    navVerify: "ምስክር ወረቀት አረጋግጥ",
    navEmbed: "የተከተተ ማጫወቻ",
    selectLang: "ቋንቋ ይምረጡ",
    play: "አጫውት (k / Space)",
    pause: "አቁም (k / Space)",
    rewind10: "10 ሰከንድ ወደኋላ (j)",
    forward10: "10 ሰከንድ ወደፊት (l)",
    captions: "የትርጉም ጽሑፍ (C)",
    signLanguage: "የኢትዮጵያ የምልክት ቋንቋ (ESL) (S)",
    audioDescription: "የድምጽ ማብራሪያ (D)",
    transcript: "የጽሑፍ ግልባጭ (T)",
    settings: "የተደራሽነት እና አቀማመጥ ቅንብሮች",
    videoQuality: "የቪዲዮ ጥራት",
    fullscreen: "ሙሉ ማያ (f)",
    mute: "ድምጽ አጥፋ / አብራ (m)",
    speed: "የማጫወቻ ፍጥነት",
    transcriptTitle: "የትምህርቱ የጽሑፍ ግልባጭ",
    liveChatTitle: "የቀጥታ ውይይት ድጋሚ",
    autoScroll: "ራስ-አንብብ",
    followActive: "✓ በተከታታይ አንብብ",
    followResume: "↻ ተከታትሎ ማንበብ ቀጥል",
    searchCues: "የጽሑፍ ግልባጭ ፈልግ...",
    accessibleDocsHeading: "ተደራሽ የትምህርት ሰነዶች",
    accessibleDocsDesc: "ለስክሪን አንባቢ፣ ለዝቅተኛ ባንድዊድዝ እና ከመስመር ውጭ ጥናት የተዘጋጁ የትምህርት ቁሳቁሶች፡",
    docHtmlTitle: "ተደራሽ HTML ሰነድ",
    docHtmlDesc: "የተዋቀረ ሲማንቲክ HTML · 18 KB",
    docPdfTitle: "የታገዘ ተደራሽ PDF",
    docPdfDesc: "PDF/UA የተረጋገጠ፣ አማራጭ ጽሑፍ · 60 KB",
    docBrfTitle: "የብሬል ሰነድ (.brf)",
    docBrfDesc: "BANA 40×25 ደረጃውን የጠበቀ የብሬል ሰነድ · 4 KB",
    docBraillePdfTitle: "የሚዳሰስ የብሬል ፒዲኤፍ (.pdf)",
    docBraillePdfDesc: "ትክክለኛ የብሬል ፊደላት፣ የታተመ ጽሑፍ እና የሚዳሰስ ዲያግራም · 278 KB",
    viewBtn: "ክፈት",
    downloadBtn: "አውርድ",
    pack3gHeading: "ዝቅተኛ ዳታ 3ጂ የጥናት ጥቅል",
    careerHeading: "ክህሎትዎን በተግባር ይተግብሩ፡ የተረጋገጡ ተደራሽ የሥራ ዕድሎች",
    skillsTaught: "የተማሩት ክህሎቶች",
    knowledgeCheck: "የክፍሉ ራስን መገምገሚያ ጥያቄዎች",
    verifiedBadge: "WCAG 2.2 AAA የተረጋገጠ",
    exportBrf: "የብሬይል ፋይል አውርድ (.brf)",
    exportPdf: "የብሬይል ፒዲኤፍ አውርድ (.pdf)",
    resetSettings: "አቀማመጥ እና ቅንብሮችን ዳግም አስጀምር"
  },
  om: {
    appTitle: "Abugida Media Kit (አቡጊዳ)",
    appSubtitle: "Miidiyaa Barnootaa Hundaaf Mijataa fi Karra Hojii · Diijitaal Biriij 2026",
    skipLink: "Gara qabiyyee ijootitti darbi",
    navHome: "Fuula Duraa",
    navLesson: "Barnoota Hundaaf Mijataa",
    navCareers: "Karra Hojii",
    navStudio: "Istuudiyoo Jechootaa",
    navVerify: "Waraqaa Ragaa Mirkaneessi",
    navEmbed: "Miidiyaa Maxxanfame",
    selectLang: "Afaan Filadhaa",
    play: "Taphachiisi (k / Space)",
    pause: "Dhaabi (k / Space)",
    rewind10: "Daqiiqaa 10 duubatti (j)",
    forward10: "Daqiiqaa 10 fuulduratti (l)",
    captions: "Barreeffama Sagalee (C)",
    signLanguage: "Afaan Mallattoo Itoophiyaa (ESL) (S)",
    audioDescription: "Ibsa Sagalee (D)",
    transcript: "Barreeffama Guutuu (T)",
    settings: "Qindaa'ina Mijatummaa fi Boca",
    videoQuality: "Qulqullina Viidiyoo",
    fullscreen: "Skiriinii Guutuu (f)",
    mute: "Sagalee Cufi / Bani (m)",
    speed: "Saffisa Taphachuu",
    transcriptTitle: "Barreeffama Guutuu Barnootichaa",
    liveChatTitle: "Mariin Kallattii Irra Deebiin",
    autoScroll: "Ofumaan Sochoosi",
    followActive: "✓ Hordofaa Dubbisi",
    followResume: "↻ Hordofuu Itti Fufi",
    searchCues: "Barreeffama keessaa barbaadi...",
    accessibleDocsHeading: "Sanadoota Barnootaa Hundaaf Mijatan",
    accessibleDocsDesc: "Meeshaalee dubbistoota skiriiniif, interneetii dhiphaaf fi toora alaaf qophaa'an buufadhaa:",
    docHtmlTitle: "Sanada HTML Hundaaf Mijataa",
    docHtmlDesc: "HTML sirreeffame, dubbistoota skiriiniif qophii · 18 KB",
    docPdfTitle: "Sanada PDF Hundaaf Mijataa",
    docPdfDesc: "PDF/UA mirkanaa'e, barreeffama fakkii waliin · 60 KB",
    docBrfTitle: "Boca Bireelii (.brf)",
    docBrfDesc: "BANA 40×25 ulaagaa bireelii eege · 4 KB",
    docBraillePdfTitle: "Sanada PDF Bireelii Miira Harkaa (.pdf)",
    docBraillePdfDesc: "Arfii Bireelii dhugaa, barreeffama ifaa fi fakkii waliin · 208 KB",
    viewBtn: "Ilaali",
    downloadBtn: "Buufadhaa",
    pack3gHeading: "Kuusaa Barnoota 3G Daataa Xiqqaatti",
    careerHeading: "Dandeettii Keessan Hojiirra Oolchaa: Carraawwan Hojii Mirkanaa'an",
    skillsTaught: "Dandeettiiwwan Barataman",
    knowledgeCheck: "Of Madaallii Barnootichaa",
    verifiedBadge: "WCAG 2.2 AAA Mirkanaa'e",
    exportBrf: "Bireelii Buufadhaa (.brf)",
    exportPdf: "PDF Bireelii Buufadhaa (.pdf)",
    resetSettings: "Qindaa'ina fi Boca Deebisi"
  },
  ti: {
    appTitle: "አቡጊዳ ሚዲያ ኪት (Abugida)",
    appSubtitle: "ተበጻሒ ናይ ትምህርቲ ሚዲያን ናይ ስራሕ መእተዊ ማዕጾን · ዲጂታል ብሪጅ 2026",
    skipLink: "ናብቲ ዋና ትሕዝቶ ሕለፍ",
    navHome: "ቀንዲ ገጽ",
    navLesson: "ተበጻሒ ትምህርቲ",
    navCareers: "ናይ ስራሕ ማዕጾ",
    navStudio: "ስቱዲዮ ትርጉም",
    navVerify: "ምስክር ወረቐት ኣረጋግጽ",
    navEmbed: "ዝተሰኸተ መጫወቲ",
    selectLang: "ቋንቋ ምረጹ",
    play: "ኣጻውት (k / Space)",
    pause: "ኣዕርፍ (k / Space)",
    rewind10: "10 ካልኢት ንድሕሪት (j)",
    forward10: "10 ካልኢት ንቕድሚት (l)",
    captions: "ጽሑፍ ትርጉም (C)",
    signLanguage: "ናይ ኢትዮጵያ ምልክት ቋንቋ (ESL) (S)",
    audioDescription: "ናይ ድምጺ መብርሂ (D)",
    transcript: "ጽሑፍ ትሕዝቶ (T)",
    settings: "ናይ ተበጻሕነትን ኣቀማምጣን ቅጥዕታት",
    videoQuality: "ጽሬት ቪድዮ",
    fullscreen: "ምሉእ ስክሪን (f)",
    mute: "ድምጺ ኣጥፍእ / ኣብርህ (m)",
    speed: "ፍጥነት ምጽዋት",
    transcriptTitle: "ናይቲ ትምህርቲ ጽሑፍ ትሕዝቶ",
    liveChatTitle: "ናይ ቀጥታ ዝርርብ ድግጋመ",
    autoScroll: "ባዕሉ ዝንበብ",
    followActive: "✓ ተኸታቲልካ ኣንብብ",
    followResume: "↻ ምኽታል ቀጽል",
    searchCues: "ኣብቲ ጽሑፍ ድለ...",
    accessibleDocsHeading: "ተበጻሕቲ ናይ ትምህርቲ ሰነዳት",
    accessibleDocsDesc: "ንናይ ስክሪን ኣንበብቲ፣ ንትሑት ባንድዊድዝን ካብ መስመር ወጻኢ ንምጽናዕን ዝተዳለዉ ናውቲ ኣውርዱ፡",
    docHtmlTitle: "ተበጻሒ ናይ HTML ሰነድ",
    docHtmlDesc: "ዝተዋደደ ሲማንቲክ HTML · 18 KB",
    docPdfTitle: "ተበጻሒ ናይ PDF ሰነድ",
    docPdfDesc: "PDF/UA ዝተረጋገጸ፣ ኣማራጺ ጽሑፍ · 60 KB",
    docBrfTitle: "ቅርጺ ብሬል (.brf)",
    docBrfDesc: "BANA 40×25 ደረጃኡ ዝሓለወ ናይ ብሬል ሰነድ · 4 KB",
    docBraillePdfTitle: "ብኢድ ዝድህሰስ ናይ ብሬል ፒዲኤፍ (.pdf)",
    docBraillePdfDesc: "ትክክለኛ ፊደላት ብሬል፣ ዝተሓትመ ጽሑፍን ዝድህሰስ ዲያግራምን · 278 KB",
    viewBtn: "ርአ",
    downloadBtn: "ኣውርድ",
    pack3gHeading: "ትሑት ዳታ 3G መጽናዕቲ ፓኬጅ",
    careerHeading: "ክእለትኩም ኣብ ተግባር ኣውዕሉ፡ ዝተረጋገጹ ናይ ስራሕ ዕድላት",
    skillsTaught: "ዝተማሃርኩምዎም ክእለታት",
    knowledgeCheck: "ናይቲ ትምህርቲ ርእሰ-ገምጋም",
    verifiedBadge: "WCAG 2.2 AAA ዝተረጋገጸ",
    exportBrf: "ናይ ብሬይል ፋይል ኣውርድ (.brf)",
    exportPdf: "ናይ ብሬይል ፒዲኤፍ ኣውርድ (.pdf)",
    resetSettings: "ኣቀማምጣን ቅጥዕታትን ዳግማይ ጀምር"
  },
  so: {
    appTitle: "Abugida Media Kit (አቡጊዳ)",
    appSubtitle: "Warbaahinta Waxbarashada La Heli Karo & Albaabka Shaqada · Buundada Dijitaalka 2026",
    skipLink: "U gudub nuxurka guud",
    navHome: "Bogga Hore",
    navLesson: "Casharka La Heli Karo",
    navCareers: "Albaabka Shaqada",
    navStudio: "Istuudiyaha Qoraalka",
    navVerify: "Xaqiiji Shahaadada",
    navEmbed: "Qalabka Ciyaarta ee Maxalliga ah",
    selectLang: "Dooro Luqadda",
    play: "Daar (k / Space)",
    pause: "Jooji (k / Space)",
    rewind10: "Dib u noqo 10 ilbiriqsi (j)",
    forward10: "Horay u soco 10 ilbiriqsi (l)",
    captions: "Qoraalka Codka (C)",
    signLanguage: "Luqadda Dhegoolaha Itoobiya (ESL) (S)",
    audioDescription: "Sharaxaadda Codka (D)",
    transcript: "Qoraalka Buuxa (T)",
    settings: "Dejinta Helitaanka & Qaabka",
    videoQuality: "Tayada Muuqaalka",
    fullscreen: "Shaashad Buuxda (f)",
    mute: "Dami / Daar Codka (m)",
    speed: "Xawaaraha Daawashada",
    transcriptTitle: "Qoraalka Guud ee Casharka",
    liveChatTitle: "Dib-u-eegista Wada-hadalka Tooska ah",
    autoScroll: "Isku-wareeji",
    followActive: "✓ Raac Akhriska",
    followResume: "↻ Dib u bilow Raacitaanka",
    searchCues: "Ka raadi qoraalka...",
    accessibleDocsHeading: "Dukumentiyada Casharka ee La Heli Karo",
    accessibleDocsDesc: "Soo deji agabka waxbarashada ee loo diyaariyay akhriyayaasha shaashadda, xogta yar, iyo barashada khadka tooska ah ka baxsan:",
    docHtmlTitle: "Dukumentiga HTML ee La Heli Karo",
    docHtmlDesc: "HTML habaysan, diyaarna u ah akhriyaha shaashadda · 18 KB",
    docPdfTitle: "PDF La Heli Karo",
    docPdfDesc: "PDF/UA la xaqiijiyay, oo ay ku jiraan qoraallada beddelka ah · 60 KB",
    docBrfTitle: "Qaabka Braille (.brf)",
    docBrfDesc: "BANA 40×25 halbeegga Braille · 4 KB",
    docBraillePdfTitle: "Dukumentiga Braille ee La Taaban Karo (.pdf)",
    docBraillePdfDesc: "Xuruufta dhabta ah ee Braille, qoraal daabacan iyo jaantus la taaban karo · 208 KB",
    viewBtn: "Eeg",
    downloadBtn: "Soo deji",
    pack3gHeading: "Xirmada Barashada 3G ee Xogta Yar",
    careerHeading: "Ku Dhaqan Xirfadahaaga: Shaqooyin La Xaqiijiyay oo La Heli Karo",
    skillsTaught: "Xirfadaha La Bartay",
    knowledgeCheck: "Is-qiimaynta Qaybta",
    verifiedBadge: "WCAG 2.2 AAA La Xaqiijiyay",
    exportBrf: "Soo deji Braille (.brf)",
    exportPdf: "Soo deji PDF Braille (.pdf)",
    resetSettings: "Dib u deji Qaabka & Xulashooyinka"
  }
};
function bt(f, a) {
  return (Te[a] || Te.en)[f] || Te.en[f] || f;
}
export {
  lt as A11yJobCard,
  Ue as A11yMediaPlayer,
  it as BRAILLE_ASCII_TABLE,
  H as DEFAULT_PREFERENCES,
  Qe as ETHIOPIC_BRAILLE_MAP,
  ot as ETHIOPIC_MONTHS,
  tt as LiveChatViewer,
  Ze as MediaSyncController,
  pt as OfflineStorageManager,
  mt as SUPPORTED_LANGUAGES,
  et as TranscriptViewer,
  Te as UI_TRANSLATIONS,
  We as UNICODE_BRAILLE_MAP,
  nt as formatDualDate,
  st as generateBRFDocument,
  Ye as getThemeStyles,
  bt as getTranslation,
  De as loadPreferences,
  ft as offlineStorage,
  Oe as parseVTT,
  Xe as resetPreferences,
  C as savePreferences,
  at as toAsciiBraille,
  rt as toEthiopianDate,
  Ke as toUnicodeBraille,
  Le as wrapBrailleLines
};
//# sourceMappingURL=a11y-media-kit.es.js.map
