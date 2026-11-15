var tt = Object.defineProperty;
var it = (f, a, e) => a in f ? tt(f, a, { enumerable: !0, configurable: !0, writable: !0, value: e }) : f[a] = e;
var m = (f, a, e) => it(f, typeof a != "symbol" ? a + "" : a, e);
const Ve = "abugida_media_preferences", P = {
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
    if (!f) return { ...P };
    const a = JSON.parse(f);
    return { ...P, ...a };
  } catch {
    return { ...P };
  }
}
function T(f) {
  try {
    const e = { ...De(), ...f };
    return localStorage.setItem(Ve, JSON.stringify(e)), e;
  } catch {
    return { ...P, ...f };
  }
}
function at() {
  try {
    localStorage.removeItem(Ve);
  } catch {
  }
  return { ...P };
}
function Qe(f) {
  const a = [], e = f.split(/\r?\n/);
  let i = 0;
  for (; i < e.length && !e[i].includes("-->"); )
    i++;
  for (; i < e.length; ) {
    const t = e[i].trim();
    if (t.includes("-->")) {
      const s = t.split("-->").map((r) => r.trim().split(" ")[0]);
      if (s.length >= 2) {
        const r = Ne(s[0]), d = Ne(s[1]);
        i++;
        const n = [];
        for (; i < e.length && e[i].trim() !== ""; )
          n.push(e[i].trim()), i++;
        n.length > 0 && a.push({
          start: r,
          end: d,
          text: n.join(`
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
function st(f, a) {
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
class ot {
  constructor(a, e) {
    m(this, "mainVideo");
    m(this, "signVideo", null);
    m(this, "driftThreshold");
    m(this, "isSyncing", !1);
    m(this, "onSignStatusChange");
    // Stored listener references for clean teardown
    m(this, "mainListeners", {});
    m(this, "signListeners", {});
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
      const d = async () => {
        if (!r) {
          r = !0, this.mainVideo.removeEventListener("loadedmetadata", d), this.mainVideo.removeEventListener("canplay", d), this.mainVideo.removeEventListener("error", d), clearTimeout(n);
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
      }, n = setTimeout(d, 600);
      this.mainVideo.addEventListener("loadedmetadata", d), this.mainVideo.addEventListener("canplay", d), this.mainVideo.addEventListener("error", d);
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
class rt {
  constructor(a, e) {
    m(this, "segments", []);
    m(this, "container");
    m(this, "onSeekAndPlay");
    m(this, "onFollowChange");
    m(this, "currentActiveId", null);
    m(this, "searchQuery", "");
    m(this, "isFollowing", !0);
    m(this, "userPausedFollowing", !1);
    m(this, "locale", "en");
    m(this, "listElement", null);
    m(this, "followBtn", null);
    m(this, "statusElement", null);
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
      const s = this.formatTime(t.start), r = t.id === this.currentActiveId, d = a ? `ከ ${s} ጀምሮ አጫውት` : `Play from ${s}`;
      return `
                <li class="transcript-item ${r ? "active" : ""}" data-segment-id="${t.id}">
                  <button 
                    type="button" 
                    class="btn-seek-time" 
                    data-time="${t.start}" 
                    aria-label="${d}">
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
class nt {
  constructor(a, e) {
    m(this, "container");
    m(this, "messages", []);
    m(this, "locale", "en");
    m(this, "onSeekAndPlay");
    m(this, "currentTime", 0);
    m(this, "searchQuery", "");
    m(this, "isAutoScroll", !0);
    m(this, "isQuestionsOnly", !1);
    m(this, "listElement", null);
    m(this, "currentActiveId", null);
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
      const r = (a ? t.message.am : t.message.en).toLowerCase(), d = t.sender.toLowerCase();
      return r.includes(this.searchQuery) || d.includes(this.searchQuery);
    });
    this.container.innerHTML = `
      <ol class="chat-replay-list" role="list" aria-label="${a ? "የቀጥታ ትምህርት ውይይት መልዕክቶች" : "Recorded live session chat messages"}" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.65rem;">
        ${e.map((t) => {
      const s = t.timestamp <= this.currentTime, r = t.id === this.currentActiveId, d = t.role === "instructor", n = t.role === "ta", c = t.message.en.includes("?") || t.message.am.includes("?") || t.message.am.includes("፧"), b = d ? a ? "አስተማሪ" : "Instructor" : n ? a ? "ረዳት" : "TA" : a ? "ተማሪ" : "Student", l = d ? "rgba(0, 113, 227, 0.12)" : n ? "rgba(16, 185, 129, 0.14)" : "var(--color-surface, #F1F5F9)", E = d ? "var(--color-brand, #0071E3)" : n ? "#059669" : "var(--color-muted-ink, #475569)", v = r ? "var(--color-brand, #0071E3)" : d ? "#0071E3" : n ? "#10B981" : "var(--color-border, #CBD5E1)", y = a ? t.message.am : t.message.en, g = a ? `ወደ ${t.timeDisplay} ይዝለሉ እና የ ${t.sender} ጥያቄ ያዳምጡ` : `Jump to ${t.timeDisplay} to hear discussion with ${t.sender}`;
      return `
              <li 
                class="chat-replay-item ${s ? "is-delivered" : "is-future"} ${r ? "is-active-latest" : ""}"
                data-chat-id="${t.id}"
                data-timestamp="${t.timestamp}"
                tabindex="0"
                role="button"
                aria-label="${g}"
                title="${g}"
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
                      background: ${l};
                      color: ${E};
                    ">${b}</span>
                    ${c ? `<span style="font-size: 0.68rem; font-weight: 600; background: rgba(217, 119, 6, 0.15); color: #B45309; padding: 1px 5px; border-radius: 4px;">❓ ${a ? "ጥያቄ" : "Question"}</span>` : ""}
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
      t.addEventListener("click", r), t.addEventListener("keydown", (d) => {
        const n = d;
        (n.key === "Enter" || n.key === " ") && (n.preventDefault(), r());
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
}, Ke = {
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
function Ue(f) {
  let a = "";
  for (let e = 0; e < f.length; e++) {
    const i = f[e];
    if (Ke[i]) {
      a += Ke[i];
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
const lt = ` A1B'K2L@CIF/MSP"E3H9O6R^DJG>NTQ,*5<-U8V.%[$+X!&:;4\\0Z7(_?W]#Y=)`;
function ct(f) {
  const a = /[\u2800-\u28FF]/.test(f) ? f : Ue(f);
  let e = "";
  for (let i = 0; i < a.length; i++) {
    const t = a.charCodeAt(i);
    t >= 10240 && t <= 10303 ? e += lt[t - 10240] || " " : t === 32 || a[i] === " " ? e += " " : (a[i] === `
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
function dt(f) {
  const a = f.language === "am", e = [], i = 25, t = 40, s = "=".repeat(t);
  e.push(s), e.push(...Le(f.title.toUpperCase(), t)), e.push("STANDARD: BANA 40X25 GRADE-1 EMBOSSER"), e.push(`LANGUAGE: ${a ? "AMHARIC" : "ENGLISH"}`), e.push(`DATE: ${f.date || "2026-11-14 (HIDAR 5, 2019 E.C.)"}`), e.push(s), e.push("");
  for (let c = 0; c < f.segments.length; c++) {
    const b = f.segments[c], l = c + 1, E = Math.floor(b.start / 60).toString().padStart(2, "0"), v = Math.floor(b.start % 60).toString().padStart(2, "0"), y = Math.floor(b.end / 60).toString().padStart(2, "0"), g = Math.floor(b.end % 60).toString().padStart(2, "0"), F = b.speaker || (a ? "አስተማሪ" : "Instructor");
    e.push(`[#${l} ${E}:${v}-${y}:${g} ${F}]`);
    const u = Ue(b.text);
    e.push(...Le(u, t)), e.push(...Le(`TEXT: ${b.text}`, t));
    const C = ct(u);
    e.push(...Le(`EMBOSSER: ${C}`, t)), e.push("");
  }
  const r = [];
  let d = [], n = 1;
  for (let c = 0; c < e.length; c++)
    if (d.push(e[c]), d.length === i - 1 || c === e.length - 1) {
      const l = `P.${n}`.padStart(t, " ");
      d.push(l), r.push(d.join(`\r
`)), d = [], n++;
    }
  return r.join(`\r
\f\r
`);
}
const D = {
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
class _e extends HTMLElement {
  constructor() {
    super();
    m(this, "shadow");
    m(this, "manifest", null);
    m(this, "activeLocale", "en");
    m(this, "prefs");
    // Media & sync
    m(this, "mainVideo");
    m(this, "signVideo", null);
    m(this, "syncController");
    m(this, "pendingSeekTime", null);
    // Captions
    m(this, "currentCues", []);
    m(this, "captionOverlay");
    // Transcript & Live Chat Replay
    m(this, "transcriptViewer");
    m(this, "liveChatViewer");
    m(this, "liveChatMessages", []);
    m(this, "activeLeftTab", "transcript");
    // UI state
    m(this, "isPreferencesOpen", !1);
    m(this, "isQualityMenuOpen", !1);
    m(this, "isShortcutsOpen", !1);
    m(this, "isAudioMode", !1);
    m(this, "currentQuality", "auto");
    m(this, "qualityToastTimer", null);
    m(this, "onCaptionsUpdated", () => {
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
    window.removeEventListener("db-player:captions-updated", this.onCaptionsUpdated), this.syncController && this.syncController.destroy();
  }
  attributeChangedCallback(e, i, t) {
    i !== t && (e === "locale" || e === "lang" ? (this.activeLocale = t || "en", this.updateLocaleStrings()) : e === "manifest-src" ? this.loadManifest(t) : (e === "src" || e === "captions" || e === "sign" || e === "describe") && (this.getAttribute("manifest-src") || this.initFromAttributes()));
  }
  initFromAttributes() {
    const e = this.getAttribute("src");
    if (!e) return;
    const i = this.getAttribute("lang") || this.getAttribute("locale") || "en";
    this.activeLocale = i;
    const t = this.getAttribute("captions") || "", s = this.getAttribute("sign"), r = this.getAttribute("describe"), d = t.split(",").map((n) => n.trim()).filter(Boolean).map((n) => {
      const c = n.includes(".am.") || n.endsWith("am.vtt") || n.includes("am");
      return {
        id: c ? "cap-am" : "cap-en",
        language: c ? "am" : "en",
        label: c ? "አማርኛ" : "English",
        src: n
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
      captionTracks: d,
      audioDescription: r ? { src: r } : void 0
    }, this.render(), this.initTracksAndTranscript();
  }
  async loadManifest(e) {
    var i, t;
    try {
      const s = await fetch(e);
      if (!s.ok) throw new Error(`HTTP error ${s.status}`);
      const r = await s.json();
      let d;
      try {
        d = new URL(e, window.location.href);
      } catch {
        d = new URL(window.location.href);
      }
      const n = (c) => {
        if (!c) return c;
        try {
          return new URL(c, d).href;
        } catch {
          return c;
        }
      };
      if (this.manifest = {
        ...r,
        poster: r.poster ? { ...r.poster, src: n(r.poster.src) } : void 0,
        sources: (r.sources || []).map((c) => ({
          ...c,
          src: n(c.src)
        })),
        captionTracks: (r.captionTracks || []).map((c) => ({
          ...c,
          src: n(c.src)
        })),
        transcript: r.transcript ? {
          ...r.transcript,
          src: n(r.transcript.src)
        } : r.transcript,
        liveSession: r.liveSession ? {
          ...r.liveSession,
          chatSrc: r.liveSession.chatSrc ? n(r.liveSession.chatSrc) : void 0
        } : void 0
      }, (t = (i = this.manifest) == null ? void 0 : i.liveSession) != null && t.chatSrc)
        try {
          const c = await fetch(this.manifest.liveSession.chatSrc);
          c.ok && (this.liveChatMessages = await c.json(), this.liveChatViewer && this.liveChatViewer.setMessages(this.liveChatMessages));
        } catch (c) {
          console.warn("Could not load live chat messages:", c);
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
        const d = (JSON.parse(e).segments || []).map((n) => ({
          id: n.id,
          start: n.start_ms !== void 0 ? n.start_ms / 1e3 : n.start || 0,
          end: n.end_ms !== void 0 ? n.end_ms / 1e3 : n.end || 0,
          speaker: n.speaker,
          text: n.text || n.reviewedText || n.draft_text || n.draftText || "",
          visualDescription: n.visual_description || n.visualDescription
        }));
        this.transcriptViewer.setSegments(d);
        return;
      } catch (r) {
        console.warn("Could not parse custom transcript, falling back to localized transcript", r);
      }
    const i = `/lessons/digital-workplace/transcript.${this.activeLocale}.json`;
    let t = !1;
    try {
      const r = await fetch(i);
      if (r.ok) {
        const n = ((await r.json()).segments || []).map((c) => ({
          id: c.id,
          start: c.start_ms !== void 0 ? c.start_ms / 1e3 : c.start || 0,
          end: c.end_ms !== void 0 ? c.end_ms / 1e3 : c.end || 0,
          speaker: c.speaker,
          text: c.text || c.draft_text || "",
          visualDescription: c.visual_description || c.visualDescription
        }));
        this.transcriptViewer.setSegments(n), t = !0;
      }
    } catch {
    }
    if (!t && ((s = this.manifest.transcript) != null && s.src))
      try {
        const r = await fetch(this.manifest.transcript.src);
        if (r.ok) {
          const n = ((await r.json()).segments || []).map((c) => ({
            id: c.id,
            start: c.start_ms !== void 0 ? c.start_ms / 1e3 : c.start || 0,
            end: c.end_ms !== void 0 ? c.end_ms / 1e3 : c.end || 0,
            speaker: c.speaker,
            text: c.text || c.draft_text || "",
            visualDescription: c.visual_description || c.visualDescription
          }));
          this.transcriptViewer.setSegments(n);
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
        const r = (JSON.parse(t).segments || []).map((d) => ({
          id: d.id,
          start: d.start_ms !== void 0 ? d.start_ms / 1e3 : d.start || 0,
          end: d.end_ms !== void 0 ? d.end_ms / 1e3 : d.end || 0,
          speaker: d.speaker,
          text: d.text || d.reviewedText || d.draft_text || d.draftText || "",
          visualDescription: d.visual_description || d.visualDescription
        }));
        this.transcriptViewer.setSegments(r);
        return;
      } catch (s) {
        console.warn("Could not parse custom transcript for", e, s);
      }
    try {
      const s = await fetch(`/lessons/digital-workplace/transcript.${e}.json`);
      if (s.ok) {
        const d = ((await s.json()).segments || []).map((n) => ({
          id: n.id,
          start: n.start_ms !== void 0 ? n.start_ms / 1e3 : n.start || 0,
          end: n.end_ms !== void 0 ? n.end_ms / 1e3 : n.end || 0,
          speaker: n.speaker,
          text: n.text || n.draft_text || "",
          visualDescription: n.visual_description || n.visualDescription
        }));
        this.transcriptViewer.setSegments(d);
      }
    } catch (s) {
      console.warn("Could not load transcript for", e, s);
    }
    if (this.prefs.captionLanguage !== "off") {
      this.prefs.captionLanguage = e, T({ captionLanguage: e });
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
        this.currentCues = Qe(t);
      else {
        const s = await fetch(i.src);
        if (s.ok) {
          const r = await s.text();
          this.currentCues = Qe(r);
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
    i ? (this.captionOverlay.style.display = "block", this.captionOverlay.style.cssText = st(this.prefs.captionTheme, this.prefs.captionSize), this.captionOverlay.textContent = i.text) : this.captionOverlay.style.display = "none";
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
    var n, c, b, l, E, v, y;
    const e = [], i = this.activeLocale === "am";
    if (!this.manifest || !this.manifest.sources)
      return [
        { id: "1080p", quality: "1080p", label: "1080p (Full HD)", tag: "FHD", kind: "video", format: "MP4", src: "" },
        { id: "720p", quality: "720p", label: "720p (HD)", tag: "HD", kind: "video", format: "MP4", src: "" },
        { id: "480p", quality: "480p", label: "480p (Standard)", tag: "SD", kind: "video", format: "MP4", src: "" },
        { id: "360p", quality: "360p", label: "360p (SD)", tag: "SD", kind: "video", format: "MP4", src: "" },
        { id: "240p", quality: "240p", label: "240p (Low Data)", tag: "Low Data", kind: "video", format: "MP4", src: "" }
      ];
    const t = (g) => {
      const F = g.match(/(\d+)/);
      return F ? parseInt(F[1], 10) : 0;
    }, r = [...this.manifest.sources.filter((g) => g.kind === "main")].sort((g, F) => t(F.quality || "") - t(g.quality || ""));
    for (const g of r) {
      const F = ((n = g.type) == null ? void 0 : n.includes("webm")) || g.src.endsWith(".webm") || g.quality === "webm", u = g.quality || "";
      let C = "";
      F ? C = "WebM" : u === "1080p" || t(u) >= 1080 ? C = "FHD" : u === "720p" || t(u) >= 720 ? C = "HD" : u === "480p" || u === "360p" ? C = "SD" : u === "240p" || t(u) <= 240 ? C = i ? "ዝቅተኛ" : "3G Data" : C = g.label || "", e.push({
        id: g.id,
        quality: F ? "webm" : u,
        label: g.label || `${u} (${F ? "WebM VP9" : "MP4"})`,
        tag: C,
        kind: "video",
        format: F ? "WebM (VP9)" : "MP4 (H.264)",
        src: g.src
      });
    }
    const d = this.manifest.sources.filter((g) => g.kind === "audio-only");
    for (const g of d) {
      let F = g.format || "Audio", u = "Audio", C = g.quality || "audio-opus";
      g.src.endsWith(".opus") || (c = g.type) != null && c.includes("opus") || g.id.includes("opus") ? (F = i ? "ኦፐስ ድምጽ (32kbps እጅግ ዝቅተኛ ዳታ)" : "Opus Audio (32kbps Low-Data)", u = "Opus", C = "audio-opus") : g.src.endsWith(".mp3") || (b = g.type) != null && b.includes("mpeg") || g.id.includes("mp3") ? (F = i ? "ኤምፒ3 ድምጽ (64kbps ዓለም አቀፍ)" : "MP3 Audio (64kbps Universal)", u = "MP3", C = "audio-mp3") : g.src.endsWith(".ogg") || (l = g.type) != null && l.includes("ogg") || g.id.includes("ogg") ? (F = i ? "ኦግ ቮርቢስ ድምጽ (Ogg Vorbis)" : "Ogg Vorbis Audio", u = "OGG", C = "audio-ogg") : g.src.endsWith(".wav") || (E = g.type) != null && E.includes("wav") || g.id.includes("wav") ? (F = i ? "ዋቭ ድምጽ (WAV Lossless PCM)" : "WAV Audio (Lossless PCM)", u = "WAV", C = "audio-wav") : (g.src.endsWith(".m4a") || (v = g.type) != null && v.includes("mp4") || (y = g.type) != null && y.includes("aac") || g.id.includes("m4a")) && (F = i ? "ኤኤሲ / ኤም4ኤ ድምጽ (AAC/M4A)" : "AAC / M4A Audio (Apple)", u = "M4A", C = "audio-m4a"), e.push({
        id: g.id,
        quality: C,
        label: g.label || F,
        tag: u,
        kind: "audio",
        format: F,
        src: g.src
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
        (n) => {
          var c;
          return n.kind === "audio-only" && (n.quality === e || n.src.toLowerCase().includes(s) || ((c = n.type) == null ? void 0 : c.toLowerCase().includes(s)) || n.id.toLowerCase().includes(s));
        }
      );
      if (r) return r.src;
      const d = this.manifest.sources.find((n) => n.kind === "audio-only");
      if (d) return d.src;
    }
    if (e === "webm") {
      const s = this.manifest.sources.find((r) => {
        var d;
        return ((d = r.type) == null ? void 0 : d.includes("webm")) || r.src.endsWith(".webm") || r.quality === "webm";
      });
      if (s) return s.src;
    }
    const i = this.manifest.sources.filter((s) => s.kind === "main");
    if (!i.length) return "";
    if (e === "auto") {
      const s = navigator.connection;
      if (s != null && s.saveData || (s == null ? void 0 : s.effectiveType) === "slow-2g" || (s == null ? void 0 : s.effectiveType) === "2g") {
        const n = i.find((c) => c.quality === "240p");
        if (n) return n.src;
      } else if ((s == null ? void 0 : s.effectiveType) === "3g") {
        const n = i.find((c) => c.quality === "360p") || i.find((c) => c.quality === "480p");
        if (n) return n.src;
      }
      const r = i.find((n) => n.quality === "1080p");
      if (r) return r.src;
      const d = i.find((n) => n.quality === "720p" && !n.src.endsWith(".webm"));
      return d ? d.src : i[0].src;
    }
    const t = i.find((s) => s.quality === e && !s.src.endsWith(".webm"));
    return t ? t.src : i[0].src;
  }
  async applyQuality(e) {
    this.currentQuality = e, this.prefs.videoQuality = e, T({ videoQuality: e });
    const i = this.resolveMainSource(e), t = /\.(opus|mp3|ogg|wav|m4a|aac|flac)($|\?)/i.test(i) || e.startsWith("audio-");
    this.isAudioMode = t;
    const s = e === "auto" ? "Auto" : e === "webm" ? "WebM" : e === "audio-opus" ? "Opus" : e === "audio-mp3" ? "MP3" : e === "audio-ogg" ? "OGG" : e === "audio-wav" ? "WAV" : e === "audio-m4a" ? "M4A" : e, r = this.shadow.getElementById("quality-badge-text");
    r && (r.textContent = s), this.shadow.querySelectorAll(".quality-menu-item").forEach((y) => {
      const F = y.getAttribute("data-quality") === e;
      y.classList.toggle("selected", F), y.setAttribute("aria-checked", F ? "true" : "false");
      const u = y.querySelector(".quality-check");
      u && (u.textContent = F ? "✓" : "");
    });
    const n = this.shadow.getElementById("select-video-quality");
    n && n.value !== e && (n.value = e);
    const c = this.shadow.getElementById("audio-mode-card"), b = this.shadow.getElementById("audio-mode-badge"), l = this.shadow.getElementById("audio-equalizer");
    c && (c.style.display = t ? "flex" : "none", b && (b.textContent = `🎵 ${s} Audio Stream • Active`), l && this.mainVideo && !this.mainVideo.paused && l.classList.add("playing"));
    const E = this.shadow.getElementById("quality-toast"), v = this.shadow.getElementById("quality-toast-text");
    if (E && v) {
      const y = this.activeLocale === "am", g = e === "auto" ? y ? "ጥራት፡ Auto (ተለዋዋጭ)" : "Quality: Auto (Adaptive)" : `${y ? "የሚዲያ ቅርጸት፡ " : "Format/Quality: "}${s}`;
      v.textContent = `⚡ ${g}`, E.style.display = "flex", E.style.opacity = "1", this.qualityToastTimer && clearTimeout(this.qualityToastTimer), this.qualityToastTimer = window.setTimeout(() => {
        E.style.opacity = "0", setTimeout(() => {
          E.style.opacity === "0" && (E.style.display = "none");
        }, 300);
      }, 1800);
    }
    if (i && this.mainVideo && !this.prefs.audioDescriptionEnabled)
      if (this.syncController)
        await this.syncController.switchSource(i);
      else {
        const y = !this.mainVideo.paused, g = this.mainVideo.currentTime, F = this.mainVideo.playbackRate;
        if (this.mainVideo.src = i, this.mainVideo.currentTime = g, this.mainVideo.playbackRate = F, y)
          try {
            await this.mainVideo.play();
          } catch {
          }
      }
  }
  render() {
    var b, l, E;
    const e = this.activeLocale === "am", i = this.manifest ? this.manifest.title[this.activeLocale] || this.manifest.title.en : "Media Player", t = this.resolveMainSource(this.currentQuality), s = (b = this.manifest) == null ? void 0 : b.sources.find((v) => v.kind === "sign"), r = this.prefs.transcriptWidth || P.transcriptWidth || 260, d = this.prefs.transcriptHeight || P.transcriptHeight || 400, n = this.prefs.eslWidth || P.eslWidth || 240, c = this.prefs.eslHeight || P.eslHeight || 180;
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
            style="width: ${r}px; height: ${d}px; flex: 0 0 ${r}px; display: ${this.prefs.transcriptVisible !== !1 ? "flex" : "none"};"
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
                poster="${((E = (l = this.manifest) == null ? void 0 : l.poster) == null ? void 0 : E.src) || ""}"
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
                    <span id="play-icon" aria-hidden="true">${D.play}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-restart" aria-label="${e ? "እንደገና ጀምር (0 / Home)" : "Restart (0 / Home)"}" title="${e ? "እንደገና ጀምር (0 / Home)" : "Restart (0 / Home)"}">
                    <span aria-hidden="true">${D.restart}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-rewind" aria-label="${e ? "ወደኋላ 5 ሰከንድ (J / ←)" : "Rewind 5 seconds (J / ←)"}" title="${e ? "ወደኋላ 5 ሰከንድ (J / ←)" : "Rewind 5 seconds (J / ←)"}">
                    <span aria-hidden="true">${D.rewind}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-forward" aria-label="${e ? "ወደፊት 5 ሰከንድ (L / →)" : "Forward 5 seconds (L / →)"}" title="${e ? "ወደፊት 5 ሰከንድ (L / →)" : "Forward 5 seconds (L / →)"}">
                    <span aria-hidden="true">${D.forward}</span>
                  </button>
                </div>

                <!-- Center: Accessibility & Speed -->
                <div class="controls-cluster">
                  <button class="btn-ctrl" id="btn-cc" aria-pressed="${this.prefs.captionLanguage !== "off" ? "true" : "false"}" aria-label="${e ? "የትርጉም ጽሑፍ (C)" : "Captions (C)"}" title="${e ? "የትርጉም ጽሑፍ (C)" : "Captions (C)"}">
                    <span aria-hidden="true">${D.cc}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-esl" aria-pressed="${this.prefs.eslVisible ? "true" : "false"}" aria-label="${e ? "የኢትዮጵያ የምልክት ቋንቋ (ESL) (S)" : "Ethiopian Sign Language (ESL) (S)"}" title="${e ? "የኢትዮጵያ የምልክት ቋንቋ (ESL) (S)" : "Ethiopian Sign Language (ESL) (S)"}">
                    <span aria-hidden="true">${D.esl}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-ad" aria-pressed="${this.prefs.audioDescriptionEnabled ? "true" : "false"}" aria-label="${e ? "የድምጽ ማብራሪያ (D)" : "Audio Description (D)"}" title="${e ? "የድምጽ ማብራሪያ (D)" : "Audio Description (D)"}">
                    <span aria-hidden="true">${D.ad}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-transcript-toggle" aria-pressed="${this.prefs.transcriptVisible !== !1 ? "true" : "false"}" aria-label="${e ? "የጽሑፍ ግልባጭ ማሳያ (T)" : "Toggle Transcript (T)"}" title="${e ? "የጽሑፍ ግልባጭ ማሳያ (T)" : "Toggle Transcript (T)"}">
                    <span aria-hidden="true">${D.transcript}</span>
                  </button>

                  <span class="ctrl-divider" aria-hidden="true"></span>

                  <button class="btn-ctrl" id="btn-speed-faster" aria-label="${e ? "ፍጥነት ጨምር (>)" : "Increase speed (>)"}" title="${e ? "ፍጥነት ጨምር (>)" : "Increase speed (>)"}">
                    <span aria-hidden="true">${D.faster}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-speed-slower" aria-label="${e ? "ፍጥነት ቀንስ (<)" : "Decrease speed (<)"}" title="${e ? "ፍጥነት ቀንስ (<)" : "Decrease speed (<)"}">
                    <span aria-hidden="true">${D.slower}</span>
                  </button>

                  <span class="ctrl-divider" aria-hidden="true"></span>
                </div>

                <!-- Right: Settings, Fullscreen, Volume -->
                <div class="controls-cluster">
                  <button class="btn-ctrl btn-ctrl-quality" id="btn-quality" aria-expanded="false" aria-haspopup="menu" aria-label="${e ? "የቪዲዮ ጥራት" : "Video Quality"}" title="${e ? "የቪዲዮ ጥራት መቆጣጠሪያ (Auto / 720p / 360p / 240p)" : "Video Quality (Auto / 720p / 360p / 240p)"}">
                    <span aria-hidden="true">${D.quality}</span>
                    <span class="quality-badge-text" id="quality-badge-text">${this.currentQuality === "auto" ? "Auto" : this.currentQuality}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-shortcuts" aria-expanded="false" aria-label="${e ? "የኪቦርድ አቋራጮች (?)" : "Keyboard Shortcuts (?)"}" title="${e ? "የኪቦርድ አቋራጮች (?)" : "Keyboard Shortcuts (?)"}">
                    <span aria-hidden="true">${D.shortcuts}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-prefs" aria-expanded="false" aria-label="${e ? "የተደራሽነት ምርጫዎች" : "Accessibility Preferences"}" title="${e ? "የተደራሽነት ምርጫዎች" : "Accessibility Preferences"}">
                    <span aria-hidden="true">${D.prefs}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-fullscreen" aria-pressed="false" aria-label="${e ? "ሙሉ ማያ ገጽ (F)" : "Fullscreen (F)"}" title="${e ? "ሙሉ ማያ ገጽ (F)" : "Fullscreen (F)"}">
                    <span id="fullscreen-icon" aria-hidden="true">${D.fullscreenEnter}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-mute" aria-pressed="false" aria-label="${e ? "ድምጽ አጥፋ (M)" : "Mute (M)"}" title="${e ? "ድምጽ አጥፋ (M)" : "Mute (M)"}">
                    <span id="mute-icon" aria-hidden="true">${D.volumeUnmuted}</span>
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
                  <span aria-hidden="true">${D.prefs}</span>
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
                  <span aria-hidden="true">${D.shortcuts}</span>
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
            style="width: ${n}px; height: ${c}px; flex: 0 0 ${n}px; display: ${this.prefs.eslVisible && s ? "flex" : "none"};"
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
    this.mainVideo = this.shadow.getElementById("main-video"), this.signVideo = this.shadow.getElementById("sign-video"), this.captionOverlay = this.shadow.getElementById("caption-overlay"), this.syncController = new ot(this.mainVideo, {
      driftThreshold: 0.25,
      onSignStatusChange: (s) => {
        const r = this.shadow.getElementById("sign-status-indicator");
        r && (s === "loading" ? (r.style.display = "inline-block", r.textContent = this.activeLocale === "am" ? "በመጫን ላይ..." : "Loading...") : s === "error" ? (r.style.display = "inline-block", r.textContent = this.activeLocale === "am" ? "ምልክት ቋንቋ አልተገኘም" : "Sign Unavailable", r.style.background = "#FEF2F2", r.style.color = "#991B1B") : (r.style.display = "inline-block", r.textContent = "EthSL", r.style.background = "rgba(255,255,255,0.2)", r.style.color = "#FFF"));
      }
    }), this.signVideo && this.syncController.setSignVideo(this.signVideo);
    const e = this.shadow.getElementById("transcript-target"), i = this.shadow.getElementById("live-chat-target"), t = this.shadow.getElementById("cb-auto-scroll");
    this.transcriptViewer = new rt(e, {
      locale: this.activeLocale,
      onSeekAndPlay: (s) => {
        this.seekAndPlay(s);
      },
      onFollowChange: (s) => {
        t && (t.checked = s);
      }
    }), i && (this.liveChatViewer = new nt(i, {
      locale: this.activeLocale,
      onSeekAndPlay: (s) => {
        this.seekAndPlay(s);
      }
    }), this.liveChatMessages.length && this.liveChatViewer.setMessages(this.liveChatMessages));
  }
  setupWindowInteractions() {
    const e = this.shadow.getElementById("player-stage");
    if (!e) return;
    const i = (t, s, r, d, n, c, b) => {
      const l = this.shadow.getElementById(t), E = this.shadow.getElementById(s), v = this.shadow.getElementById(r), y = this.shadow.getElementById(d), g = this.shadow.getElementById(n), F = c ? this.shadow.getElementById(c) : null;
      if (!l || !E || !v) return;
      let u = null, C = !1, _ = "corner", le = 0, ce = 0, W = 0, de = 0, X = null;
      const I = (k) => {
        if (!C) return;
        const L = k.clientX - le, x = k.clientY - ce;
        X !== null && cancelAnimationFrame(X), X = requestAnimationFrame(() => {
          let B = W, V = de;
          _ === "corner" || _ === "right" ? B = Math.min(b.maxWidth, Math.max(b.minWidth, W + L)) : _ === "left" && (B = Math.min(b.maxWidth, Math.max(b.minWidth, W - L))), (_ === "corner" || _ === "bottom") && (V = Math.min(b.maxHeight, Math.max(b.minHeight, de + x))), l.style.width = `${B}px`, l.style.height = `${V}px`, l.style.flex = `0 0 ${B}px`, u && (u.style.width = `${B}px`, u.style.height = `${V}px`, u.style.flex = `0 0 ${B}px`);
        });
      }, z = () => {
        C && (C = !1, l.classList.remove("is-resizing"), window.removeEventListener("pointermove", I), window.removeEventListener("pointerup", z), window.removeEventListener("pointercancel", z), X !== null && (cancelAnimationFrame(X), X = null), b.onSaveSize(l.offsetWidth, l.offsetHeight));
      }, q = (k, L) => {
        C = !0, _ = k, le = L.clientX, ce = L.clientY, W = l.offsetWidth, de = l.offsetHeight, l.classList.add("is-resizing"), window.addEventListener("pointermove", I), window.addEventListener("pointerup", z), window.addEventListener("pointercancel", z), L.preventDefault(), L.stopPropagation();
      };
      v.addEventListener("pointerdown", (k) => q("corner", k)), y == null || y.addEventListener("pointerdown", (k) => q("bottom", k)), g == null || g.addEventListener("pointerdown", (k) => q("right", k)), F == null || F.addEventListener("pointerdown", (k) => q("left", k)), v.addEventListener("keydown", (k) => {
        let L = l.offsetWidth, x = l.offsetHeight, B = !1;
        k.key === "ArrowRight" ? (L = Math.min(b.maxWidth, L + 20), B = !0) : k.key === "ArrowLeft" ? (L = Math.max(b.minWidth, L - 20), B = !0) : k.key === "ArrowDown" ? (x = Math.min(b.maxHeight, x + 20), B = !0) : k.key === "ArrowUp" && (x = Math.max(b.minHeight, x - 20), B = !0), B && (k.preventDefault(), l.style.width = `${L}px`, l.style.height = `${x}px`, l.style.flex = `0 0 ${L}px`, u && (u.style.width = `${L}px`, u.style.height = `${x}px`, u.style.flex = `0 0 ${L}px`), b.onSaveSize(L, x));
      });
      let w = !1, H = 0, A = 0, ie = 0, ae = 0, $ = null;
      l.addEventListener("pointerdown", () => {
        if (l.classList.contains("floating")) {
          l.style.zIndex = "100";
          const k = t === "transcript-window" ? "esl-window" : "transcript-window", L = this.shadow.getElementById(k);
          L && L.classList.contains("floating") && (L.style.zIndex = "90");
        }
      });
      const se = (k) => {
        const L = k.clientX - H, x = k.clientY - A;
        !w && Math.hypot(L, x) > 4 && (w = !0, !u && l.parentNode && (u = document.createElement("div"), u.className = "window-placeholder", u.style.width = `${l.offsetWidth}px`, u.style.height = `${l.offsetHeight}px`, u.style.flex = l.style.flex || `0 0 ${l.offsetWidth}px`, l.parentNode.insertBefore(u, l)), l.classList.add("floating"), l.style.position = "absolute", l.style.zIndex = "100"), w && ($ !== null && cancelAnimationFrame($), $ = requestAnimationFrame(() => {
          const B = ie + L, V = ae + x;
          l.style.left = `${B}px`, l.style.top = `${V}px`, l.style.right = "auto", l.style.bottom = "auto";
        }));
      }, G = () => {
        w && (w = !1), window.removeEventListener("pointermove", se), window.removeEventListener("pointerup", G), window.removeEventListener("pointercancel", G), $ !== null && (cancelAnimationFrame($), $ = null);
      };
      E.addEventListener("pointerdown", (k) => {
        if (k.target.tagName === "INPUT" || k.target.tagName === "SELECT")
          return;
        H = k.clientX, A = k.clientY;
        const L = e.getBoundingClientRect(), x = l.getBoundingClientRect();
        ie = l.style.left ? parseFloat(l.style.left) : x.left - L.left, ae = l.style.top ? parseFloat(l.style.top) : x.top - L.top, w = !1, l.style.zIndex = "100";
        const B = t === "transcript-window" ? "esl-window" : "transcript-window", V = this.shadow.getElementById(B);
        V && V.classList.contains("floating") && (V.style.zIndex = "90"), window.addEventListener("pointermove", se), window.addEventListener("pointerup", G), window.addEventListener("pointercancel", G);
      }), E.addEventListener("keydown", (k) => {
        let L = !1;
        const x = 20;
        if (!l.classList.contains("floating")) {
          !u && l.parentNode && (u = document.createElement("div"), u.className = "window-placeholder", u.style.width = `${l.offsetWidth}px`, u.style.height = `${l.offsetHeight}px`, u.style.flex = l.style.flex || `0 0 ${l.offsetWidth}px`, l.parentNode.insertBefore(u, l));
          const S = e.getBoundingClientRect(), R = l.getBoundingClientRect();
          l.classList.add("floating"), l.style.position = "absolute", l.style.zIndex = "100", l.style.left = `${R.left - S.left}px`, l.style.top = `${R.top - S.top}px`;
        }
        let B = parseFloat(l.style.left) || 0, V = parseFloat(l.style.top) || 0;
        k.key === "ArrowRight" ? (B += x, L = !0) : k.key === "ArrowLeft" ? (B -= x, L = !0) : k.key === "ArrowDown" ? (V += x, L = !0) : k.key === "ArrowUp" && (V -= x, L = !0), L && (k.preventDefault(), l.style.left = `${B}px`, l.style.top = `${V}px`);
      });
      const J = () => {
        l.classList.remove("floating"), l.style.position = "", l.style.left = "", l.style.top = "", l.style.right = "", l.style.bottom = "", l.style.zIndex = "", u && (u.remove(), u = null);
      };
      E.addEventListener("dblclick", J);
      const he = (k) => {
        if (k === "split") {
          J();
          return;
        }
        l.classList.contains("floating") || (!u && l.parentNode && (u = document.createElement("div"), u.className = "window-placeholder", u.style.width = `${l.offsetWidth}px`, u.style.height = `${l.offsetHeight}px`, u.style.flex = l.style.flex || `0 0 ${l.offsetWidth}px`, l.parentNode.insertBefore(u, l)), l.classList.add("floating"), l.style.position = "absolute", l.style.zIndex = "100");
        const L = e.getBoundingClientRect(), x = l.offsetWidth || 280, B = l.offsetHeight || 210, V = 16, S = Math.max(0, L.width - x - V), R = Math.max(0, L.height - B - V);
        k === "tr" ? (l.style.left = `${S}px`, l.style.top = `${V}px`) : k === "br" && (l.style.left = `${S}px`, l.style.top = `${R}px`);
      };
      l.__reDock = J, l.__dockPreset = he;
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
          this.prefs.transcriptWidth = t, this.prefs.transcriptHeight = s, T({ transcriptWidth: t, transcriptHeight: s });
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
          this.prefs.eslWidth = t, this.prefs.eslHeight = s, T({ eslWidth: t, eslHeight: s });
        }
      }
    );
  }
  attachEventListeners() {
    var Me, qe, Ie, He, Pe, je, Re, Oe;
    const e = this.shadow.getElementById("btn-play"), i = this.shadow.getElementById("play-icon"), t = this.shadow.getElementById("big-play-btn"), s = this.shadow.getElementById("btn-restart"), r = this.shadow.getElementById("btn-speed-faster"), d = this.shadow.getElementById("btn-speed-slower"), n = this.shadow.getElementById("speed-display"), c = this.shadow.getElementById("state-display"), b = this.shadow.getElementById("btn-fullscreen"), l = this.shadow.getElementById("fullscreen-icon"), E = this.shadow.getElementById("btn-mute"), v = this.shadow.getElementById("mute-icon"), y = this.shadow.getElementById("player-container"), g = this.shadow.getElementById("seek-scrubber"), F = this.shadow.getElementById("time-display"), u = () => {
      this.mainVideo.paused ? this.mainVideo.play() : this.mainVideo.pause();
    };
    e && e.addEventListener("click", u), t && t.addEventListener("click", u), this.mainVideo.addEventListener("click", u), this.mainVideo.addEventListener("play", () => {
      i && (i.innerHTML = D.pause), e == null || e.setAttribute("aria-label", this.activeLocale === "am" ? "አቁም (Space / K)" : "Pause (Space / K)"), e == null || e.setAttribute("title", this.activeLocale === "am" ? "አቁም (Space / K)" : "Pause (Space / K)"), t == null || t.classList.add("is-hidden"), c && (c.textContent = this.activeLocale === "am" ? "እየተጫወተ ነው" : "Playing");
      const o = this.shadow.getElementById("audio-equalizer");
      o && o.classList.add("playing");
    }), this.mainVideo.addEventListener("pause", () => {
      i && (i.innerHTML = D.play), e == null || e.setAttribute("aria-label", this.activeLocale === "am" ? "አጫውት (Space / K)" : "Play (Space / K)"), e == null || e.setAttribute("title", this.activeLocale === "am" ? "አጫውት (Space / K)" : "Play (Space / K)"), t == null || t.classList.remove("is-hidden"), c && (c.textContent = this.mainVideo.ended ? this.activeLocale === "am" ? "ተጠናቋል" : "End of track" : this.activeLocale === "am" ? "ቆሟል" : "Paused");
      const o = this.shadow.getElementById("audio-equalizer");
      o && o.classList.remove("playing");
    }), this.mainVideo.addEventListener("ended", () => {
      i && (i.innerHTML = D.play), e == null || e.setAttribute("aria-label", this.activeLocale === "am" ? "አጫውት (Space / K)" : "Play (Space / K)"), e == null || e.setAttribute("title", this.activeLocale === "am" ? "አጫውት (Space / K)" : "Play (Space / K)"), t == null || t.classList.remove("is-hidden"), c && (c.textContent = this.activeLocale === "am" ? "ተጠናቋል" : "End of track");
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
    const C = [0.5, 0.75, 1, 1.25, 1.5, 2], _ = () => {
      const o = this.mainVideo.playbackRate;
      n && (n.textContent = `Speed: ${o}x`);
    };
    r == null || r.addEventListener("click", () => {
      const o = this.mainVideo.playbackRate, p = C.filter((M) => M > o + 0.01), h = p.length > 0 ? p[0] : 2;
      this.mainVideo.playbackRate = h, _();
    }), d == null || d.addEventListener("click", () => {
      const o = this.mainVideo.playbackRate, p = C.filter((M) => M < o - 0.01), h = p.length > 0 ? p[p.length - 1] : 0.5;
      this.mainVideo.playbackRate = h, _();
    });
    const le = () => !!(document.fullscreenElement || document.webkitFullscreenElement || this.shadow.fullscreenElement || y != null && y.classList.contains("is-fullscreen") || this.hasAttribute("data-fullscreen")), ce = async () => {
      try {
        le() ? ((document.fullscreenElement || document.webkitFullscreenElement || this.shadow.fullscreenElement) && (document.exitFullscreen ? await document.exitFullscreen() : document.webkitExitFullscreen && await document.webkitExitFullscreen()), y == null || y.classList.remove("is-fullscreen"), this.removeAttribute("data-fullscreen"), W()) : y != null && y.requestFullscreen ? await y.requestFullscreen() : y != null && y.webkitRequestFullscreen ? await y.webkitRequestFullscreen() : (y == null || y.classList.add("is-fullscreen"), this.setAttribute("data-fullscreen", "true"), W());
      } catch (o) {
        console.warn("Fullscreen native request fell back to CSS:", o), (y == null ? void 0 : y.classList.contains("is-fullscreen")) ? (y == null || y.classList.remove("is-fullscreen"), this.removeAttribute("data-fullscreen")) : (y == null || y.classList.add("is-fullscreen"), this.setAttribute("data-fullscreen", "true")), W();
      }
    };
    b == null || b.addEventListener("click", ce);
    const W = () => {
      const o = le();
      b == null || b.setAttribute("aria-pressed", o ? "true" : "false"), b == null || b.setAttribute(
        "aria-label",
        o ? this.activeLocale === "am" ? "ከሙሉ ማያ ገጽ ውጣ (F)" : "Exit Fullscreen (F)" : this.activeLocale === "am" ? "ሙሉ ማያ ገጽ (F)" : "Fullscreen (F)"
      ), b == null || b.setAttribute(
        "title",
        o ? this.activeLocale === "am" ? "ከሙሉ ማያ ገጽ ውጣ (F)" : "Exit Fullscreen (F)" : this.activeLocale === "am" ? "ሙሉ ማያ ገጽ (F)" : "Fullscreen (F)"
      ), l && (l.innerHTML = o ? D.fullscreenExit : D.fullscreenEnter);
    };
    document.addEventListener("fullscreenchange", W), document.addEventListener("webkitfullscreenchange", W);
    const de = () => {
      this.mainVideo.muted = !this.mainVideo.muted;
    };
    E == null || E.addEventListener("click", de);
    const X = () => {
      const o = this.mainVideo.muted;
      E == null || E.setAttribute("aria-pressed", o ? "true" : "false"), E == null || E.setAttribute(
        "aria-label",
        o ? this.activeLocale === "am" ? "ድምጽ አብራ (M)" : "Unmute (M)" : this.activeLocale === "am" ? "ድምጽ አጥፋ (M)" : "Mute (M)"
      ), E == null || E.setAttribute(
        "title",
        o ? this.activeLocale === "am" ? "ድምጽ አብራ (M)" : "Unmute (M)" : this.activeLocale === "am" ? "ድምጽ አጥፋ (M)" : "Mute (M)"
      ), v && (v.innerHTML = o ? D.volumeMuted : D.volumeUnmuted);
    };
    this.mainVideo.addEventListener("volumechange", X), this.mainVideo.addEventListener("timeupdate", () => {
      const o = this.mainVideo.currentTime, p = this.mainVideo.duration || 1;
      g && !g.matches(":active") && (g.value = (o / p * 100).toFixed(1)), F && (F.textContent = `${this.formatTime(o)} / ${this.formatTime(p)}`), this.updateCaptionDisplay(), this.transcriptViewer.updateActiveTime(o), this.liveChatViewer && this.liveChatViewer.updateTime(o), this.dispatchEvent(
        new CustomEvent("db-player:progress", {
          bubbles: !0,
          composed: !0,
          detail: {
            seconds: Math.floor(o),
            percent: Math.round(o / p * 100)
          }
        })
      );
    }), g.addEventListener("input", () => {
      const o = this.mainVideo.duration || 1;
      this.mainVideo.currentTime = parseFloat(g.value) / 100 * o;
    }), (Me = this.shadow.getElementById("btn-rewind")) == null || Me.addEventListener("click", () => {
      this.mainVideo.currentTime = Math.max(0, this.mainVideo.currentTime - 5);
    }), (qe = this.shadow.getElementById("btn-forward")) == null || qe.addEventListener("click", () => {
      this.mainVideo.currentTime = Math.min(this.mainVideo.duration || 1e3, this.mainVideo.currentTime + 5);
    });
    const I = this.shadow.getElementById("btn-ad");
    I == null || I.addEventListener("click", async () => {
      if (!this.manifest) return;
      this.prefs.audioDescriptionEnabled = !this.prefs.audioDescriptionEnabled, T({ audioDescriptionEnabled: this.prefs.audioDescriptionEnabled }), I.setAttribute("aria-pressed", this.prefs.audioDescriptionEnabled ? "true" : "false");
      const o = this.prefs.audioDescriptionEnabled ? "described" : "main", p = this.manifest.sources.find((h) => h.kind === o) || this.manifest.sources.find((h) => h.kind === "main");
      p && await this.syncController.switchSource(p.src);
    });
    const z = this.shadow.getElementById("btn-cc");
    z == null || z.addEventListener("click", async () => {
      const o = ["en", "am", "om", "ti", "so", "off"], p = (o.indexOf(this.prefs.captionLanguage) + 1) % o.length;
      this.prefs.captionLanguage = o[p], T({ captionLanguage: this.prefs.captionLanguage });
      const h = this.prefs.captionLanguage === "off";
      z.setAttribute("aria-pressed", h ? "false" : "true"), z.setAttribute("title", `Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`), z.setAttribute(
        "aria-label",
        `Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`
      );
      const M = this.shadow.getElementById("select-cc-lang");
      if (M && (M.value = this.prefs.captionLanguage), await this.loadCaptionTrack(this.prefs.captionLanguage), !h) {
        const N = this.shadow.getElementById("select-transcript-lang");
        N && N.value !== this.prefs.captionLanguage && (N.value = this.prefs.captionLanguage, await this.switchTranscriptLanguage(this.prefs.captionLanguage));
      }
    });
    const q = this.shadow.getElementById("btn-esl"), w = this.shadow.getElementById("esl-window");
    q == null || q.addEventListener("click", () => {
      this.prefs.eslVisible = !this.prefs.eslVisible, T({ eslVisible: this.prefs.eslVisible }), q.setAttribute("aria-pressed", this.prefs.eslVisible ? "true" : "false"), w && (w.style.display = this.prefs.eslVisible ? "flex" : "none");
    });
    const H = this.shadow.getElementById("btn-transcript-toggle"), A = this.shadow.getElementById("transcript-window");
    H == null || H.addEventListener("click", () => {
      const p = !((A == null ? void 0 : A.style.display) !== "none");
      this.prefs.transcriptVisible = p, T({ transcriptVisible: p }), H.setAttribute("aria-pressed", p ? "true" : "false"), A && (A.style.display = p ? "flex" : "none");
    });
    const ie = this.shadow.getElementById("cb-auto-scroll");
    ie == null || ie.addEventListener("change", () => {
      this.transcriptViewer.setFollowing(ie.checked);
    });
    const ae = this.shadow.getElementById("select-transcript-lang");
    ae == null || ae.addEventListener("change", async () => {
      const o = ae.value;
      await this.switchTranscriptLanguage(o);
    });
    const $ = this.shadow.getElementById("btn-prefs"), se = this.shadow.getElementById("btn-transcript-prefs"), G = this.shadow.getElementById("btn-esl-prefs"), J = this.shadow.getElementById("prefs-dialog"), he = this.shadow.getElementById("btn-close-prefs"), k = this.shadow.getElementById("btn-dismiss-prefs"), L = this.shadow.getElementById("btn-reset-layout"), x = this.shadow.getElementById("btn-quality"), B = this.shadow.getElementById("quality-menu"), V = this.shadow.getElementById("dialog-shortcuts"), S = this.shadow.getElementById("btn-shortcuts"), R = this.shadow.getElementById("btn-close-shortcuts"), Ee = this.shadow.getElementById("btn-ok-shortcuts"), pe = () => {
      this.isQualityMenuOpen && (this.isQualityMenuOpen = !1, B && (B.style.display = "none"), x == null || x.classList.remove("is-active"), x == null || x.setAttribute("aria-expanded", "false"));
    }, Ge = () => {
      re(), ne(), this.isQualityMenuOpen = !0, B && (B.style.display = "flex"), x == null || x.classList.add("is-active"), x == null || x.setAttribute("aria-expanded", "true");
      const o = this.shadow.querySelector(`.quality-menu-item[data-quality="${this.currentQuality}"]`) || this.shadow.querySelector(".quality-menu-item");
      o == null || o.focus();
    }, Je = () => {
      this.isQualityMenuOpen ? pe() : Ge();
    };
    x == null || x.addEventListener("click", (o) => {
      o.preventDefault(), o.stopPropagation(), Je();
    }), this.shadow.querySelectorAll(".quality-menu-item").forEach((o) => {
      o.addEventListener("click", (p) => {
        p.preventDefault(), p.stopPropagation();
        const h = o.getAttribute("data-quality");
        h && (pe(), x == null || x.focus(), this.applyQuality(h).catch((M) => console.warn("Quality apply error:", M)));
      });
    });
    const j = this.shadow.getElementById("select-cc-lang"), K = this.shadow.getElementById("select-cc-size"), U = this.shadow.getElementById("select-cc-theme"), oe = this.shadow.getElementById("select-video-quality"), Y = this.shadow.getElementById("toggle-esl-visibility"), Z = this.shadow.getElementById("toggle-transcript-visibility"), ee = this.shadow.getElementById("toggle-ad-enabled"), re = () => {
      this.isPreferencesOpen && (this.isPreferencesOpen = !1, J && (J.style.display = "none"), $ == null || $.classList.remove("is-active"), $ == null || $.setAttribute("aria-expanded", "false"));
    }, Fe = () => {
      pe(), ne(), this.isPreferencesOpen = !0, oe && (oe.value = this.currentQuality), j && (j.value = this.prefs.captionLanguage), K && (K.value = this.prefs.captionSize), U && (U.value = this.prefs.captionTheme), Y && (Y.value = this.prefs.eslVisible ? "show" : "hide"), Z && (Z.value = this.prefs.transcriptVisible !== !1 ? "show" : "hide"), ee && (ee.value = this.prefs.audioDescriptionEnabled ? "on" : "off"), J && (J.style.display = "flex"), $ == null || $.classList.add("is-active"), $ == null || $.setAttribute("aria-expanded", "true"), j == null || j.focus();
    }, Xe = () => {
      this.isPreferencesOpen ? re() : Fe();
    };
    $ == null || $.addEventListener("click", (o) => {
      o.preventDefault(), o.stopPropagation(), Xe();
    }), se == null || se.addEventListener("click", (o) => {
      o.stopPropagation(), Fe();
    }), G == null || G.addEventListener("click", (o) => {
      o.stopPropagation(), Fe();
    }), k == null || k.addEventListener("click", (o) => {
      o.stopPropagation(), re(), $ == null || $.focus();
    });
    const ne = () => {
      this.isShortcutsOpen && (this.isShortcutsOpen = !1, V && (V.style.display = "none"), S == null || S.classList.remove("is-active"), S == null || S.setAttribute("aria-expanded", "false"));
    }, Ye = () => {
      pe(), re(), this.isShortcutsOpen = !0, V && (V.style.display = "flex"), S == null || S.classList.add("is-active"), S == null || S.setAttribute("aria-expanded", "true"), R == null || R.focus();
    }, ze = () => {
      this.isShortcutsOpen ? ne() : Ye();
    };
    S == null || S.addEventListener("click", (o) => {
      o.preventDefault(), o.stopPropagation(), ze();
    }), R == null || R.addEventListener("click", (o) => {
      o.preventDefault(), o.stopPropagation(), ne(), S == null || S.focus();
    }), Ee == null || Ee.addEventListener("click", (o) => {
      o.preventDefault(), o.stopPropagation(), ne(), S == null || S.focus();
    }), j == null || j.addEventListener("change", async () => {
      if (j.value !== this.prefs.captionLanguage) {
        if (this.prefs.captionLanguage = j.value, T({ captionLanguage: this.prefs.captionLanguage }), z) {
          const o = this.prefs.captionLanguage === "off";
          z.setAttribute("aria-pressed", o ? "false" : "true");
        }
        await this.loadCaptionTrack(this.prefs.captionLanguage);
      }
    }), K == null || K.addEventListener("change", () => {
      K.value !== this.prefs.captionSize && (this.prefs.captionSize = K.value, T({ captionSize: this.prefs.captionSize }), this.updateCaptionDisplay());
    }), U == null || U.addEventListener("change", () => {
      U.value !== this.prefs.captionTheme && (this.prefs.captionTheme = U.value, T({ captionTheme: this.prefs.captionTheme }), this.updateCaptionDisplay());
    }), Y == null || Y.addEventListener("change", () => {
      var h;
      const o = !!(this.signVideo || (h = this.manifest) != null && h.sources.some((M) => M.kind === "sign")), p = Y.value === "show";
      this.prefs.eslVisible = p, T({ eslVisible: p }), q && q.setAttribute("aria-pressed", p ? "true" : "false"), w && (w.style.display = p && o ? "flex" : "none");
    }), Z == null || Z.addEventListener("change", () => {
      const o = Z.value === "show";
      this.prefs.transcriptVisible = o, T({ transcriptVisible: o }), H && H.setAttribute("aria-pressed", o ? "true" : "false"), A && (A.style.display = o ? "flex" : "none");
    }), ee == null || ee.addEventListener("change", () => {
      const o = ee.value === "on";
      this.prefs.audioDescriptionEnabled = o, T({ audioDescriptionEnabled: o }), I && I.setAttribute("aria-pressed", o ? "true" : "false");
    }), he == null || he.addEventListener("click", async () => {
      var p;
      if (j && j.value !== this.prefs.captionLanguage) {
        if (this.prefs.captionLanguage = j.value, T({ captionLanguage: this.prefs.captionLanguage }), z) {
          const h = this.prefs.captionLanguage === "off";
          z.setAttribute("aria-pressed", h ? "false" : "true");
        }
        await this.loadCaptionTrack(this.prefs.captionLanguage);
      }
      K && K.value !== this.prefs.captionSize && (this.prefs.captionSize = K.value, T({ captionSize: this.prefs.captionSize }), this.updateCaptionDisplay()), U && U.value !== this.prefs.captionTheme && (this.prefs.captionTheme = U.value, T({ captionTheme: this.prefs.captionTheme }), this.updateCaptionDisplay());
      const o = !!(this.signVideo || (p = this.manifest) != null && p.sources.some((h) => h.kind === "sign"));
      if (Y) {
        const h = Y.value === "show";
        this.prefs.eslVisible = h, T({ eslVisible: h }), q && q.setAttribute("aria-pressed", h ? "true" : "false"), w && (w.style.display = h && o ? "flex" : "none");
      }
      if (Z) {
        const h = Z.value === "show";
        this.prefs.transcriptVisible = h, T({ transcriptVisible: h }), H && H.setAttribute("aria-pressed", h ? "true" : "false"), A && (A.style.display = h ? "flex" : "none");
      }
      if (ee) {
        const h = ee.value === "on";
        this.prefs.audioDescriptionEnabled = h, T({ audioDescriptionEnabled: h }), I && I.setAttribute("aria-pressed", h ? "true" : "false");
      }
      re();
    });
    const Ze = (o) => {
      const p = o.composedPath(), h = (M) => M && (p.includes(M) || M.contains(o.target));
      this.isPreferencesOpen && !h(J) && !h($) && !h(se) && !h(G) && re(), this.isQualityMenuOpen && !h(B) && !h(x) && pe(), this.isShortcutsOpen && !h(V) && !h(S) && ne();
    };
    window.addEventListener("pointerdown", Ze), oe == null || oe.addEventListener("change", async () => {
      oe.value !== this.currentQuality && await this.applyQuality(oe.value);
    }), L == null || L.addEventListener("click", () => {
      var be, ue, ke;
      at(), this.prefs = De();
      const o = this.shadow.getElementById("select-cc-lang"), p = this.shadow.getElementById("select-cc-size"), h = this.shadow.getElementById("select-cc-theme"), M = this.shadow.getElementById("select-video-quality"), N = this.shadow.getElementById("toggle-esl-visibility"), te = this.shadow.getElementById("toggle-transcript-visibility"), me = this.shadow.getElementById("toggle-ad-enabled");
      M && (M.value = "auto"), this.applyQuality("auto"), o && (o.value = this.prefs.captionLanguage), p && (p.value = this.prefs.captionSize), h && (h.value = this.prefs.captionTheme), N && (N.value = "show"), te && (te.value = "show"), me && (me.value = "off"), this.updateCaptionDisplay(), this.loadCaptionTrack(this.prefs.captionLanguage), A && ((be = A.__reDock) == null || be.call(A), A.classList.remove("floating"), A.style.position = "", A.style.left = "", A.style.top = "", A.style.right = "", A.style.bottom = "", A.style.zIndex = "", A.style.width = `${P.transcriptWidth}px`, A.style.height = `${P.transcriptHeight}px`, A.style.flex = `0 0 ${P.transcriptWidth}px`, A.style.display = "flex"), w && ((ue = w.__reDock) == null || ue.call(w), w.classList.remove("floating"), w.style.position = "", w.style.left = "", w.style.top = "", w.style.right = "", w.style.bottom = "", w.style.zIndex = "", w.style.width = `${P.eslWidth}px`, w.style.height = `${P.eslHeight}px`, w.style.flex = `0 0 ${P.eslWidth}px`, w.style.display = this.signVideo || (ke = this.manifest) != null && ke.sources.some((et) => et.kind === "sign") ? "flex" : "none"), q && q.setAttribute("aria-pressed", "true"), H && H.setAttribute("aria-pressed", "true"), I && I.setAttribute("aria-pressed", "false");
    }), (Ie = this.shadow.getElementById("select-cc-lang")) == null || Ie.addEventListener("change", async (o) => {
      const p = o.target.value;
      if (this.prefs.captionLanguage = p, T({ captionLanguage: this.prefs.captionLanguage }), z) {
        const h = this.prefs.captionLanguage === "off";
        z.setAttribute("aria-pressed", h ? "false" : "true"), z.setAttribute("title", `Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`), z.setAttribute(
          "aria-label",
          `Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`
        );
      }
      if (await this.loadCaptionTrack(this.prefs.captionLanguage), p !== "off") {
        const h = this.shadow.getElementById("select-transcript-lang");
        h && h.value !== p && (h.value = p, await this.switchTranscriptLanguage(p));
      }
    }), (He = this.shadow.getElementById("select-cc-size")) == null || He.addEventListener("change", (o) => {
      this.prefs.captionSize = o.target.value, T({ captionSize: this.prefs.captionSize }), this.updateCaptionDisplay();
    }), (Pe = this.shadow.getElementById("select-cc-theme")) == null || Pe.addEventListener("change", (o) => {
      this.prefs.captionTheme = o.target.value, T({ captionTheme: this.prefs.captionTheme }), this.updateCaptionDisplay();
    }), (je = this.shadow.getElementById("toggle-esl-visibility")) == null || je.addEventListener("change", (o) => {
      var M;
      const p = o.target.value === "show", h = !!(this.signVideo || (M = this.manifest) != null && M.sources.some((N) => N.kind === "sign"));
      this.prefs.eslVisible = p, T({ eslVisible: p }), q && q.setAttribute("aria-pressed", p ? "true" : "false"), w && (w.style.display = p && h ? "flex" : "none");
    }), (Re = this.shadow.getElementById("toggle-transcript-visibility")) == null || Re.addEventListener("change", (o) => {
      const p = o.target.value === "show";
      this.prefs.transcriptVisible = p, T({ transcriptVisible: p }), H && H.setAttribute("aria-pressed", p ? "true" : "false"), A && (A.style.display = p ? "flex" : "none");
    }), (Oe = this.shadow.getElementById("toggle-ad-enabled")) == null || Oe.addEventListener("change", (o) => {
      const p = o.target.value === "on";
      this.prefs.audioDescriptionEnabled = p, T({ audioDescriptionEnabled: p }), I && I.setAttribute("aria-pressed", p ? "true" : "false");
    });
    const ve = this.shadow.getElementById("transcript-search");
    ve == null || ve.addEventListener("input", () => {
      this.transcriptViewer.setSearchQuery(ve.value);
    });
    const ye = this.shadow.getElementById("live-chat-search");
    ye == null || ye.addEventListener("input", () => {
      this.liveChatViewer && this.liveChatViewer.setSearchQuery(ye.value);
    });
    const O = this.shadow.getElementById("tab-btn-transcript"), Q = this.shadow.getElementById("tab-btn-chat"), we = this.shadow.getElementById("transcript-view-panel"), xe = this.shadow.getElementById("live-chat-view-panel");
    O == null || O.addEventListener("click", () => {
      this.activeLeftTab = "transcript", O.classList.add("active"), O.setAttribute("aria-selected", "true"), Q == null || Q.classList.remove("active"), Q == null || Q.setAttribute("aria-selected", "false"), we && (we.style.display = "flex"), xe && (xe.style.display = "none");
    }), Q == null || Q.addEventListener("click", () => {
      this.activeLeftTab = "chat", Q.classList.add("active"), Q.setAttribute("aria-selected", "true"), O == null || O.classList.remove("active"), O == null || O.setAttribute("aria-selected", "false"), we && (we.style.display = "none"), xe && (xe.style.display = "flex"), this.liveChatViewer && this.liveChatViewer.updateTime(this.mainVideo.currentTime);
    });
    const Se = this.shadow.getElementById("btn-dock-tr"), Ae = this.shadow.getElementById("btn-dock-br"), $e = this.shadow.getElementById("btn-dock-split");
    Se == null || Se.addEventListener("click", () => {
      var o;
      return (o = w == null ? void 0 : w.__dockPreset) == null ? void 0 : o.call(w, "tr");
    }), Ae == null || Ae.addEventListener("click", () => {
      var o;
      return (o = w == null ? void 0 : w.__dockPreset) == null ? void 0 : o.call(w, "br");
    }), $e == null || $e.addEventListener("click", () => {
      var o;
      return (o = w == null ? void 0 : w.__dockPreset) == null ? void 0 : o.call(w, "split");
    });
    const Be = this.shadow.getElementById("btn-export-brf");
    Be == null || Be.addEventListener("click", () => {
      var me, be;
      const o = ((me = this.transcriptViewer) == null ? void 0 : me.getSegments()) || [], p = ((be = this.manifest) == null ? void 0 : be.title) && (this.manifest.title[this.activeLocale] || this.manifest.title.en) || "Lesson Transcript", h = dt({
        title: p,
        language: this.activeLocale === "am" || this.activeLocale === "ti" ? "am" : "en",
        segments: o.length > 0 ? o : this.currentCues.map((ue, ke) => ({
          id: ke,
          start: ue.start,
          end: ue.end,
          text: ue.text,
          speaker: this.activeLocale === "am" ? "አስተማሪ" : "Instructor"
        })),
        date: "2026-11-14"
      }), M = new Blob([h], { type: "text/plain;charset=us-ascii" }), N = URL.createObjectURL(M), te = document.createElement("a");
      te.href = N, te.download = `lesson-transcript.${this.activeLocale}.brf`, document.body.appendChild(te), te.click(), document.body.removeChild(te), URL.revokeObjectURL(N);
    });
    let ge = !1;
    const fe = this.shadow.getElementById("btn-chat-questions-filter");
    fe == null || fe.addEventListener("click", () => {
      ge = !ge, fe.setAttribute("aria-pressed", ge ? "true" : "false"), fe.classList.toggle("active", ge), this.liveChatViewer && this.liveChatViewer.setQuestionsOnly(ge);
    }), this.shadow.querySelectorAll(".btn-preset-pill").forEach((o) => {
      o.addEventListener("click", () => {
        const p = o.getAttribute("data-preset");
        if (p) {
          this.prefs.captionTheme = p;
          const h = this.shadow.getElementById("select-cc-theme");
          h && (h.value = p), T({ captionTheme: p }), this.updateCaptionDisplay();
        }
      });
    });
    const Te = this.shadow.getElementById("player-container");
    Te == null || Te.addEventListener("keydown", (o) => {
      if (o.key === "Escape") {
        if (this.isQualityMenuOpen) {
          pe(), x == null || x.focus();
          return;
        }
        if (this.isShortcutsOpen) {
          ne(), S == null || S.focus();
          return;
        }
        if (this.isPreferencesOpen) {
          re(), $ == null || $.focus();
          return;
        }
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
            o.preventDefault(), de();
            break;
          case "f":
          case "F":
            o.preventDefault(), ce();
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
            o.preventDefault(), d == null || d.click();
            break;
          case "c":
          case "C":
            o.preventDefault(), z == null || z.click();
            break;
          case "s":
          case "S":
            o.preventDefault(), q == null || q.click();
            break;
          case "d":
          case "D":
            o.preventDefault(), I == null || I.click();
            break;
          case "t":
          case "T":
            o.preventDefault(), H == null || H.click();
            break;
          case "?":
          case "/":
            o.preventDefault(), ze();
            break;
          case "Escape":
            le() && (o.preventDefault(), ce());
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
customElements.get("a11y-media-player") || customElements.define("a11y-media-player", _e);
if (!customElements.get("db-player")) {
  class f extends _e {
  }
  customElements.define("db-player", f);
}
const pt = [
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
function ut(f) {
  const a = typeof f == "string" ? new Date(f) : f, e = a.getUTCFullYear(), i = a.getUTCMonth() + 1, t = a.getUTCDate(), s = Math.floor((14 - i) / 12), r = e + 4800 - s, d = i + 12 * s - 3, n = t + Math.floor((153 * d + 2) / 5) + 365 * r + Math.floor(r / 4) - Math.floor(r / 100) + Math.floor(r / 400) - 32045, c = (n - 1723856) % 1461, b = c % 365 + 365 * Math.floor(c / 1460), l = 4 * Math.floor((n - 1723856) / 1461) + Math.floor(c / 365) - Math.floor(c / 1460), E = Math.floor(b / 30) + 1, v = b % 30 + 1, y = pt[Math.min(E - 1, 12)];
  return {
    year: l,
    month: E,
    day: v,
    monthNameAmharic: y
  };
}
function ht(f) {
  const a = ut(f), e = `${a.monthNameAmharic} ${a.day}፣ ${a.year} ዓ.ም`;
  return {
    iso: f,
    ethiopic: e,
    display: `${f} (${e})`
  };
}
class gt extends HTMLElement {
  constructor() {
    super();
    m(this, "shadow");
    m(this, "job", null);
    m(this, "activeLocale", "en");
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
    const e = this.activeLocale === "am", i = this.job.title[this.activeLocale] || this.job.title.en, t = this.job.location[this.activeLocale] || this.job.location.en, s = this.job.description[this.activeLocale] || this.job.description.en, r = this.job.applicationDeadline ? ht(this.job.applicationDeadline) : null, d = {
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
        ${JSON.stringify(d)}
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
customElements.get("a11y-job-card") || customElements.define("a11y-job-card", gt);
const ft = "abugida-media", mt = 1;
class bt {
  constructor() {
    m(this, "db", null);
    m(this, "cacheName", "abugida-offline-v1");
  }
  async init() {
    if (!this.db)
      return new Promise((a, e) => {
        const i = indexedDB.open(ft, mt);
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
      const d = await caches.open(this.cacheName);
      let n = 0;
      const c = t.length;
      for (const b of t) {
        const l = await fetch(b);
        if (!l.ok)
          throw new Error(`Failed to fetch asset: ${b} (${l.status})`);
        await d.put(b, l.clone()), n++;
        const E = Math.round(n / c * 100);
        s(E, n, c);
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
    } catch (d) {
      throw await this.savePackageRecord({
        packageKey: r,
        lessonId: a,
        packageId: e,
        packageName: i,
        status: "error",
        totalBytes: 32e5,
        downloadedBytes: 0,
        timestamp: Date.now(),
        error: d instanceof Error ? d.message : "Download failed"
      }), d;
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
const xt = new bt(), kt = [
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
], Ce = {
  en: {
    appTitle: "Abugida Media Kit (አቡጊዳ)",
    appSubtitle: "Accessible Learning Media & Career Gateway · Digital Bridge 2026",
    skipLink: "Skip to main content",
    navHome: "Home",
    navLesson: "Accessible Lesson",
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
function Lt(f, a) {
  return (Ce[a] || Ce.en)[f] || Ce.en[f] || f;
}
export {
  gt as A11yJobCard,
  _e as A11yMediaPlayer,
  lt as BRAILLE_ASCII_TABLE,
  P as DEFAULT_PREFERENCES,
  Ke as ETHIOPIC_BRAILLE_MAP,
  pt as ETHIOPIC_MONTHS,
  nt as LiveChatViewer,
  ot as MediaSyncController,
  bt as OfflineStorageManager,
  kt as SUPPORTED_LANGUAGES,
  rt as TranscriptViewer,
  Ce as UI_TRANSLATIONS,
  We as UNICODE_BRAILLE_MAP,
  ht as formatDualDate,
  dt as generateBRFDocument,
  st as getThemeStyles,
  Lt as getTranslation,
  De as loadPreferences,
  xt as offlineStorage,
  Qe as parseVTT,
  at as resetPreferences,
  T as savePreferences,
  ct as toAsciiBraille,
  ut as toEthiopianDate,
  Ue as toUnicodeBraille,
  Le as wrapBrailleLines
};
//# sourceMappingURL=a11y-media-kit.es.js.map
