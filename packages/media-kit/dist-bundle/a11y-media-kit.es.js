var Ze = Object.defineProperty;
var et = (h, i, e) => i in h ? Ze(h, i, { enumerable: !0, configurable: !0, writable: !0, value: e }) : h[i] = e;
var u = (h, i, e) => et(h, typeof i != "symbol" ? i + "" : i, e);
const Me = "abugida_media_preferences", z = {
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
function ze() {
  try {
    const h = localStorage.getItem(Me);
    if (!h) return { ...z };
    const i = JSON.parse(h);
    return { ...z, ...i };
  } catch {
    return { ...z };
  }
}
function S(h) {
  try {
    const e = { ...ze(), ...h };
    return localStorage.setItem(Me, JSON.stringify(e)), e;
  } catch {
    return { ...z, ...h };
  }
}
function tt() {
  try {
    localStorage.removeItem(Me);
  } catch {
  }
  return { ...z };
}
function Ne(h) {
  const i = [], e = h.split(/\r?\n/);
  let a = 0;
  for (; a < e.length && !e[a].includes("-->"); )
    a++;
  for (; a < e.length; ) {
    const t = e[a].trim();
    if (t.includes("-->")) {
      const s = t.split("-->").map((o) => o.trim().split(" ")[0]);
      if (s.length >= 2) {
        const o = Ke(s[0]), d = Ke(s[1]);
        a++;
        const l = [];
        for (; a < e.length && e[a].trim() !== ""; )
          l.push(e[a].trim()), a++;
        l.length > 0 && i.push({
          start: o,
          end: d,
          text: l.join(`
`)
        });
      }
    }
    a++;
  }
  return i;
}
function Ke(h) {
  const i = h.split(":");
  let e = 0, a = 0, t = 0;
  return i.length === 3 ? (e = parseFloat(i[0]), a = parseFloat(i[1]), t = parseFloat(i[2].replace(",", "."))) : i.length === 2 && (a = parseFloat(i[0]), t = parseFloat(i[1].replace(",", "."))), e * 3600 + a * 60 + t;
}
function it(h, i) {
  let e = "18px";
  i === "small" && (e = "14px"), i === "large" && (e = "24px"), i === "xlarge" && (e = "32px");
  let a = "#FFFFFF", t = "rgba(0, 0, 0, 0.85)", s = "none";
  return h === "yellow-black" ? (a = "#FFEB3B", t = "#000000", s = "2px solid #FFEB3B") : h === "white-black" ? (a = "#FFFFFF", t = "#000000", s = "2px solid #FFFFFF") : h === "black-yellow" ? (a = "#000000", t = "#FFEB3B", s = "2px solid #000000") : h === "amber-gold" && (a = "#FFD700", t = "#000000", s = "2px solid #FFD700"), `
    font-size: ${e};
    color: ${a};
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
class at {
  constructor(i, e) {
    u(this, "mainVideo");
    u(this, "signVideo", null);
    u(this, "driftThreshold");
    u(this, "isSyncing", !1);
    u(this, "onSignStatusChange");
    // Stored listener references for clean teardown
    u(this, "mainListeners", {});
    u(this, "signListeners", {});
    this.mainVideo = i, this.driftThreshold = (e == null ? void 0 : e.driftThreshold) ?? 0.25, this.onSignStatusChange = e == null ? void 0 : e.onSignStatusChange, this.setupMainListeners();
  }
  setSignVideo(i) {
    if (this.cleanupSignListeners(), this.signVideo = i, this.signVideo) {
      if (this.signVideo.muted = !0, this.signVideo.playsInline = !0, this.signVideo.playbackRate = this.mainVideo.playbackRate, !isNaN(this.mainVideo.currentTime) && this.mainVideo.currentTime > 0)
        try {
          this.signVideo.currentTime = this.mainVideo.currentTime;
        } catch {
        }
      this.setupSignListeners(), this.notifyStatus(this.signVideo.readyState >= 2 ? "ready" : "loading");
    } else
      this.notifyStatus("none");
  }
  notifyStatus(i) {
    this.onSignStatusChange && this.onSignStatusChange(i);
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
    for (const [i, e] of Object.entries(this.mainListeners))
      this.mainVideo.addEventListener(i, e);
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
      for (const [i, e] of Object.entries(this.signListeners))
        this.signVideo.addEventListener(i, e);
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
  async switchSource(i) {
    const e = !this.mainVideo.paused, a = this.mainVideo.currentTime, t = this.mainVideo.playbackRate;
    return this.mainVideo.src = i, this.mainVideo.load(), new Promise((s) => {
      const o = async () => {
        if (this.mainVideo.removeEventListener("loadedmetadata", o), this.mainVideo.currentTime = a, this.mainVideo.playbackRate = t, e)
          try {
            await this.mainVideo.play();
          } catch {
          }
        if (this.signVideo) {
          try {
            this.signVideo.currentTime = a;
          } catch {
          }
          e ? this.signVideo.play().catch(() => {
          }) : this.signVideo.pause();
        }
        s();
      };
      this.mainVideo.addEventListener("loadedmetadata", o);
    });
  }
  cleanupSignListeners() {
    if (this.signVideo)
      for (const [i, e] of Object.entries(this.signListeners))
        this.signVideo.removeEventListener(i, e);
    this.signListeners = {};
  }
  destroy() {
    for (const [i, e] of Object.entries(this.mainListeners))
      this.mainVideo.removeEventListener(i, e);
    this.mainListeners = {}, this.cleanupSignListeners(), this.signVideo = null;
  }
}
class st {
  constructor(i, e) {
    u(this, "segments", []);
    u(this, "container");
    u(this, "onSeekAndPlay");
    u(this, "onFollowChange");
    u(this, "currentActiveId", null);
    u(this, "searchQuery", "");
    u(this, "isFollowing", !0);
    u(this, "userPausedFollowing", !1);
    u(this, "locale", "en");
    u(this, "listElement", null);
    u(this, "followBtn", null);
    u(this, "statusElement", null);
    this.container = i, this.onSeekAndPlay = e.onSeekAndPlay, this.onFollowChange = e.onFollowChange, this.locale = e.locale || "en";
  }
  setLocale(i) {
    this.locale !== i && (this.locale = i, this.render());
  }
  setSegments(i) {
    this.segments = i.map((e) => ({
      ...e,
      start: Number(e.start) || 0,
      end: Number(e.end) || 0
    })).sort((e, a) => e.start - a.start), this.render();
  }
  getSegments() {
    return [...this.segments];
  }
  setSearchQuery(i) {
    this.searchQuery = i.toLowerCase().trim(), this.render();
  }
  getActiveSegment(i) {
    return this.segments.length && this.segments.find((e) => i >= e.start && i < e.end) || null;
  }
  updateActiveTime(i) {
    const e = this.getActiveSegment(i), a = e ? e.id : null;
    a !== this.currentActiveId && (this.currentActiveId = a, this.highlightSegment(a), this.isFollowing && a !== null && this.scrollToActiveCue(a));
  }
  highlightSegment(i) {
    if (!this.container) return;
    const e = this.container.querySelector(".transcript-item.active");
    if (e && e.classList.remove("active"), i !== null) {
      const a = this.container.querySelector(`[data-segment-id="${i}"]`);
      a && a.classList.add("active");
    }
  }
  scrollToActiveCue(i) {
    if (!this.listElement) return;
    const e = this.listElement.querySelector(`[data-segment-id="${i}"]`);
    if (!e) return;
    this.listElement.scrollTop;
    const a = this.listElement.clientHeight, t = e.offsetTop, s = e.clientHeight, o = t - a / 2 + s / 2;
    this.listElement.scrollTo({
      top: Math.max(0, o),
      behavior: "smooth"
    });
  }
  setFollowing(i) {
    this.setFollowingState(i, !0);
  }
  setFollowingState(i, e = !1) {
    var a;
    if (this.isFollowing = i, e && (this.userPausedFollowing = !i), (a = this.onFollowChange) == null || a.call(this, i), this.followBtn) {
      this.followBtn.setAttribute("aria-pressed", i ? "true" : "false");
      const t = this.locale === "am";
      i ? (this.followBtn.textContent = t ? "✓ በተከታታይ አንብብ" : "✓ Follow Playback", this.followBtn.setAttribute(
        "aria-label",
        t ? "የጽሑፍ ግልባጭ ተከታትሎ ማንበብ በርቷል" : "Follow playback active (Click to pause auto-scroll)"
      )) : (this.followBtn.textContent = t ? "↻ ተከታትሎ ማንበብ ቀጥል" : "↻ Resume Following", this.followBtn.setAttribute(
        "aria-label",
        t ? "ተከታትሎ ማንበብ ቆሟል፤ እንደገና ለማስጀመር ይጫኑ" : "Following paused (Click to resume auto-scroll)"
      ));
    }
    i && this.currentActiveId !== null && this.scrollToActiveCue(this.currentActiveId);
  }
  formatTime(i) {
    const e = Math.floor(i / 60), a = Math.floor(i % 60);
    return `${e.toString().padStart(2, "0")}:${a.toString().padStart(2, "0")}`;
  }
  render() {
    var a;
    const i = this.locale === "am", e = this.searchQuery ? this.segments.filter(
      (t) => t.text.toLowerCase().includes(this.searchQuery) || t.speaker && t.speaker.toLowerCase().includes(this.searchQuery) || t.visualDescription && t.visualDescription.toLowerCase().includes(this.searchQuery)
    ) : this.segments;
    if (this.container.innerHTML = `
      <div class="transcript-controls-row">
        <button 
          type="button" 
          id="btn-toggle-follow" 
          class="btn-follow ${this.isFollowing ? "active" : ""}" 
          aria-pressed="${this.isFollowing ? "true" : "false"}"
          aria-label="${this.isFollowing ? i ? "የጽሑፍ ግልባጭ ተከታትሎ ማንበብ በርቷል" : "Follow playback active (Click to pause auto-scroll)" : i ? "ተከታትሎ ማንበብ ቆሟል፤ እንደገና ለማስጀመር ይጫኑ" : "Following paused (Click to resume auto-scroll)"}">
          ${this.isFollowing ? i ? "✓ በተከታታይ አንብብ" : "✓ Follow Playback" : i ? "↻ ተከታትሎ ማንበብ ቀጥል" : "↻ Resume Following"}
        </button>
      </div>

      ${e.length === 0 ? `<p class="empty-msg" role="status">
              ${i ? "ምንም የሚዛመድ የጽሑፍ ግልባጭ አልተገኘም።" : "No transcript segments match your search."}
            </p>` : `
          <ul class="transcript-list" role="list" id="transcript-list-box" tabindex="0" aria-label="${i ? "የጽሑፍ ግልባጭ ዝርዝር" : "Transcript cues"}">
            ${e.map((t) => {
      const s = this.formatTime(t.start), o = t.id === this.currentActiveId, d = i ? `ከ ${s} ጀምሮ አጫውት` : `Play from ${s}`;
      return `
                <li class="transcript-item ${o ? "active" : ""}" data-segment-id="${t.id}">
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
                    ${t.visualDescription ? `<div class="visual-desc" aria-label="${i ? "ምስላዊ ማብራሪያ" : "Visual Description"}: ${this.escapeHtml(t.visualDescription)}">
                            <em>[${i ? "ምስላዊ" : "Visual"}: ${this.escapeHtml(t.visualDescription)}]</em>
                           </div>` : ""}
                  </div>
                </li>
              `;
    }).join("")}
          </ul>
        `}
    `, this.listElement = this.container.querySelector("#transcript-list-box"), this.followBtn = this.container.querySelector("#btn-toggle-follow"), (a = this.followBtn) == null || a.addEventListener("click", () => {
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
        const o = parseFloat(s.currentTarget.dataset.time || "0");
        this.onSeekAndPlay(o), s.currentTarget.focus();
      });
    });
  }
  escapeHtml(i) {
    return i.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
}
class rt {
  constructor(i, e) {
    u(this, "container");
    u(this, "messages", []);
    u(this, "locale", "en");
    u(this, "onSeekAndPlay");
    u(this, "currentTime", 0);
    u(this, "searchQuery", "");
    u(this, "isAutoScroll", !0);
    u(this, "isQuestionsOnly", !1);
    u(this, "listElement", null);
    u(this, "currentActiveId", null);
    this.container = i, this.locale = e.locale || "en", this.onSeekAndPlay = e.onSeekAndPlay;
  }
  setLocale(i) {
    this.locale !== i && (this.locale = i, this.render());
  }
  setMessages(i) {
    this.messages = [...i].sort((e, a) => e.timestamp - a.timestamp), this.render();
  }
  setSearchQuery(i) {
    this.searchQuery = i.toLowerCase().trim(), this.render();
  }
  setQuestionsOnly(i) {
    this.isQuestionsOnly !== i && (this.isQuestionsOnly = i, this.render());
  }
  setAutoScroll(i) {
    this.isAutoScroll = i;
  }
  updateTime(i) {
    this.currentTime = i;
    const e = this.messages.filter((s) => s.timestamp <= i), a = e.length > 0 ? e[e.length - 1] : null, t = a ? a.id : null;
    t !== this.currentActiveId && (this.currentActiveId = t, this.updateActiveStyles(), this.isAutoScroll && t && this.scrollToMessage(t));
  }
  updateActiveStyles() {
    if (!this.container) return;
    this.container.querySelectorAll(".chat-replay-item").forEach((e) => {
      const a = e.getAttribute("data-chat-id");
      Number(e.getAttribute("data-timestamp") || "0") <= this.currentTime ? (e.classList.add("is-delivered"), e.classList.remove("is-future")) : (e.classList.remove("is-delivered"), e.classList.add("is-future")), a === this.currentActiveId ? e.classList.add("is-active-latest") : e.classList.remove("is-active-latest");
    });
  }
  scrollToMessage(i) {
    if (!this.listElement) return;
    const e = this.listElement.querySelector(`[data-chat-id="${i}"]`);
    e && e.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  render() {
    const i = this.locale === "am";
    if (!this.messages.length) {
      this.container.innerHTML = `
        <div class="chat-empty-state" role="status" style="padding: 1.5rem; text-align: center; color: #64748B; font-size: 0.88rem;">
          ${i ? "የቀጥታ ውይይት መልዕክቶች አልተገኙም።" : "No live chat messages recorded for this session."}
        </div>
      `;
      return;
    }
    const e = this.messages.filter((t) => {
      const s = t.message.en.includes("?") || t.message.am.includes("?") || t.message.am.includes("፧");
      if (this.isQuestionsOnly && !s) return !1;
      if (!this.searchQuery) return !0;
      const o = (i ? t.message.am : t.message.en).toLowerCase(), d = t.sender.toLowerCase();
      return o.includes(this.searchQuery) || d.includes(this.searchQuery);
    });
    this.container.innerHTML = `
      <ol class="chat-replay-list" role="list" aria-label="${i ? "የቀጥታ ትምህርት ውይይት መልዕክቶች" : "Recorded live session chat messages"}" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.65rem;">
        ${e.map((t) => {
      const s = t.timestamp <= this.currentTime, o = t.id === this.currentActiveId, d = t.role === "instructor", l = t.role === "ta", c = t.message.en.includes("?") || t.message.am.includes("?") || t.message.am.includes("፧"), g = d ? i ? "አስተማሪ" : "Instructor" : l ? i ? "ረዳት" : "TA" : i ? "ተማሪ" : "Student", n = d ? "rgba(0, 113, 227, 0.12)" : l ? "rgba(16, 185, 129, 0.14)" : "var(--color-surface, #F1F5F9)", k = d ? "var(--color-brand, #0071E3)" : l ? "#059669" : "var(--color-muted-ink, #475569)", M = o ? "var(--color-brand, #0071E3)" : d ? "#0071E3" : l ? "#10B981" : "var(--color-border, #CBD5E1)", x = i ? t.message.am : t.message.en, I = i ? `ወደ ${t.timeDisplay} ይዝለሉ እና የ ${t.sender} ጥያቄ ያዳምጡ` : `Jump to ${t.timeDisplay} to hear discussion with ${t.sender}`;
      return `
              <li 
                class="chat-replay-item ${s ? "is-delivered" : "is-future"} ${o ? "is-active-latest" : ""}"
                data-chat-id="${t.id}"
                data-timestamp="${t.timestamp}"
                tabindex="0"
                role="button"
                aria-label="${I}"
                title="${I}"
                style="
                  display: flex;
                  flex-direction: column;
                  padding: 0.65rem 0.85rem;
                  border-radius: 6px;
                  background: ${o ? "var(--color-brand-subtle, #EFF6FF)" : "var(--color-surface-elevated, #FFFFFF)"};
                  border: 1px solid var(--color-border-subtle, #E2E8F0);
                  border-left: 3.5px solid ${M};
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
                      color: ${k};
                    ">${g}</span>
                    ${c ? `<span style="font-size: 0.68rem; font-weight: 600; background: rgba(217, 119, 6, 0.15); color: #B45309; padding: 1px 5px; border-radius: 4px;">❓ ${i ? "ጥያቄ" : "Question"}</span>` : ""}
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
                  ${x}
                </div>
              </li>
            `;
    }).join("")}
      </ol>
    `, this.listElement = this.container.querySelector(".chat-replay-list"), this.container.querySelectorAll(".chat-replay-item").forEach((t) => {
      const s = Number(t.getAttribute("data-timestamp") || "0"), o = () => {
        this.onSeekAndPlay(s);
      };
      t.addEventListener("click", o), t.addEventListener("keydown", (d) => {
        const l = d;
        (l.key === "Enter" || l.key === " ") && (l.preventDefault(), o());
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
}, _e = {
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
function Ue(h) {
  let i = "";
  for (let e = 0; e < h.length; e++) {
    const a = h[e];
    if (_e[a]) {
      i += _e[a];
      continue;
    }
    const t = a.toLowerCase();
    a >= "A" && a <= "Z" ? i += "⠠" + (We[t] || t) : a >= "0" && a <= "9" ? ((e === 0 || !/[0-9]/.test(h[e - 1])) && (i += "⠼"), i += {
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
    }[a] || a) : i += We[t] || a;
  }
  return i;
}
const ot = ` A1B'K2L@CIF/MSP"E3H9O6R^DJG>NTQ,*5<-U8V.%[$+X!&:;4\\0Z7(_?W]#Y=)`;
function nt(h) {
  const i = /[\u2800-\u28FF]/.test(h) ? h : Ue(h);
  let e = "";
  for (let a = 0; a < i.length; a++) {
    const t = i.charCodeAt(a);
    t >= 10240 && t <= 10303 ? e += ot[t - 10240] || " " : t === 32 || i[a] === " " ? e += " " : (i[a] === `
` || i[a], e += i[a]);
  }
  return e;
}
function Fe(h, i = 40) {
  const e = h.split(/\s+/), a = [];
  let t = "";
  for (const s of e)
    if (s)
      if ((t + (t ? " " : "") + s).length <= i)
        t += (t ? " " : "") + s;
      else if (t && a.push(t), s.length > i) {
        let o = s;
        for (; o.length > i; )
          a.push(o.slice(0, i)), o = o.slice(i);
        t = o;
      } else
        t = s;
  return t && a.push(t), a;
}
function lt(h) {
  const i = h.language === "am", e = [], a = 25, t = 40, s = "=".repeat(t);
  e.push(s), e.push(...Fe(h.title.toUpperCase(), t)), e.push("STANDARD: BANA 40X25 GRADE-1 EMBOSSER"), e.push(`LANGUAGE: ${i ? "AMHARIC" : "ENGLISH"}`), e.push(`DATE: ${h.date || "2026-11-14 (HIDAR 5, 2019 E.C.)"}`), e.push(s), e.push("");
  for (let c = 0; c < h.segments.length; c++) {
    const g = h.segments[c], n = c + 1, k = Math.floor(g.start / 60).toString().padStart(2, "0"), M = Math.floor(g.start % 60).toString().padStart(2, "0"), x = Math.floor(g.end / 60).toString().padStart(2, "0"), I = Math.floor(g.end % 60).toString().padStart(2, "0"), U = g.speaker || (i ? "አስተማሪ" : "Instructor");
    e.push(`[#${n} ${k}:${M}-${x}:${I} ${U}]`);
    const y = Ue(g.text);
    e.push(...Fe(y, t)), e.push(...Fe(`TEXT: ${g.text}`, t));
    const W = nt(y);
    e.push(...Fe(`EMBOSSER: ${W}`, t)), e.push("");
  }
  const o = [];
  let d = [], l = 1;
  for (let c = 0; c < e.length; c++)
    if (d.push(e[c]), d.length === a - 1 || c === e.length - 1) {
      const n = `P.${l}`.padStart(t, " ");
      d.push(n), o.push(d.join(`\r
`)), d = [], l++;
    }
  return o.join(`\r
\f\r
`);
}
const A = {
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
class Ge extends HTMLElement {
  constructor() {
    super();
    u(this, "shadow");
    u(this, "manifest", null);
    u(this, "activeLocale", "en");
    u(this, "prefs");
    // Media & sync
    u(this, "mainVideo");
    u(this, "signVideo", null);
    u(this, "syncController");
    u(this, "pendingSeekTime", null);
    // Captions
    u(this, "currentCues", []);
    u(this, "captionOverlay");
    // Transcript & Live Chat Replay
    u(this, "transcriptViewer");
    u(this, "liveChatViewer");
    u(this, "liveChatMessages", []);
    u(this, "activeLeftTab", "transcript");
    // UI state
    u(this, "isPreferencesOpen", !1);
    u(this, "isQualityMenuOpen", !1);
    u(this, "currentQuality", "auto");
    u(this, "qualityToastTimer", null);
    u(this, "onCaptionsUpdated", () => {
      this.initTracksAndTranscript();
    });
    this.shadow = this.attachShadow({ mode: "open" }), this.prefs = ze(), this.currentQuality = this.prefs.videoQuality || "auto";
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
  attributeChangedCallback(e, a, t) {
    a !== t && (e === "locale" || e === "lang" ? (this.activeLocale = t || "en", this.updateLocaleStrings()) : e === "manifest-src" ? this.loadManifest(t) : (e === "src" || e === "captions" || e === "sign" || e === "describe") && (this.getAttribute("manifest-src") || this.initFromAttributes()));
  }
  initFromAttributes() {
    const e = this.getAttribute("src");
    if (!e) return;
    const a = this.getAttribute("lang") || this.getAttribute("locale") || "en";
    this.activeLocale = a;
    const t = this.getAttribute("captions") || "", s = this.getAttribute("sign"), o = this.getAttribute("describe"), d = t.split(",").map((l) => l.trim()).filter(Boolean).map((l) => {
      const c = l.includes(".am.") || l.endsWith("am.vtt") || l.includes("am");
      return {
        id: c ? "cap-am" : "cap-en",
        language: c ? "am" : "en",
        label: c ? "አማርኛ" : "English",
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
      captionTracks: d,
      audioDescription: o ? { src: o } : void 0
    }, this.render(), this.initTracksAndTranscript();
  }
  async loadManifest(e) {
    var a, t;
    try {
      const s = await fetch(e);
      if (!s.ok) throw new Error(`HTTP error ${s.status}`);
      const o = await s.json();
      let d;
      try {
        d = new URL(e, window.location.href);
      } catch {
        d = new URL(window.location.href);
      }
      const l = (c) => {
        if (!c) return c;
        try {
          return new URL(c, d).href;
        } catch {
          return c;
        }
      };
      if (this.manifest = {
        ...o,
        poster: o.poster ? { ...o.poster, src: l(o.poster.src) } : void 0,
        sources: (o.sources || []).map((c) => ({
          ...c,
          src: l(c.src)
        })),
        captionTracks: (o.captionTracks || []).map((c) => ({
          ...c,
          src: l(c.src)
        })),
        transcript: o.transcript ? {
          ...o.transcript,
          src: l(o.transcript.src)
        } : o.transcript,
        liveSession: o.liveSession ? {
          ...o.liveSession,
          chatSrc: o.liveSession.chatSrc ? l(o.liveSession.chatSrc) : void 0
        } : void 0
      }, (t = (a = this.manifest) == null ? void 0 : a.liveSession) != null && t.chatSrc)
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
        const d = (JSON.parse(e).segments || []).map((l) => ({
          id: l.id,
          start: l.start_ms !== void 0 ? l.start_ms / 1e3 : l.start || 0,
          end: l.end_ms !== void 0 ? l.end_ms / 1e3 : l.end || 0,
          speaker: l.speaker,
          text: l.text || l.reviewedText || l.draft_text || l.draftText || "",
          visualDescription: l.visual_description || l.visualDescription
        }));
        this.transcriptViewer.setSegments(d);
        return;
      } catch (o) {
        console.warn("Could not parse custom transcript, falling back to localized transcript", o);
      }
    const a = `/lessons/digital-workplace/transcript.${this.activeLocale}.json`;
    let t = !1;
    try {
      const o = await fetch(a);
      if (o.ok) {
        const l = ((await o.json()).segments || []).map((c) => ({
          id: c.id,
          start: c.start_ms !== void 0 ? c.start_ms / 1e3 : c.start || 0,
          end: c.end_ms !== void 0 ? c.end_ms / 1e3 : c.end || 0,
          speaker: c.speaker,
          text: c.text || c.draft_text || "",
          visualDescription: c.visual_description || c.visualDescription
        }));
        this.transcriptViewer.setSegments(l), t = !0;
      }
    } catch {
    }
    if (!t && ((s = this.manifest.transcript) != null && s.src))
      try {
        const o = await fetch(this.manifest.transcript.src);
        if (o.ok) {
          const l = ((await o.json()).segments || []).map((c) => ({
            id: c.id,
            start: c.start_ms !== void 0 ? c.start_ms / 1e3 : c.start || 0,
            end: c.end_ms !== void 0 ? c.end_ms / 1e3 : c.end || 0,
            speaker: c.speaker,
            text: c.text || c.draft_text || "",
            visualDescription: c.visual_description || c.visualDescription
          }));
          this.transcriptViewer.setSegments(l);
        }
      } catch (o) {
        console.warn("Could not load external transcript file, using fallback cues", o);
      }
  }
  async switchTranscriptLanguage(e) {
    this.activeLocale = e, this.setAttribute("locale", e), this.transcriptViewer && this.transcriptViewer.setLocale(e);
    const a = this.shadow.getElementById("select-transcript-lang");
    a && a.value !== e && (a.value = e);
    const t = typeof localStorage < "u" ? localStorage.getItem(`db-player:custom-transcript:${e}`) : null;
    if (t)
      try {
        const o = (JSON.parse(t).segments || []).map((d) => ({
          id: d.id,
          start: d.start_ms !== void 0 ? d.start_ms / 1e3 : d.start || 0,
          end: d.end_ms !== void 0 ? d.end_ms / 1e3 : d.end || 0,
          speaker: d.speaker,
          text: d.text || d.reviewedText || d.draft_text || d.draftText || "",
          visualDescription: d.visual_description || d.visualDescription
        }));
        this.transcriptViewer.setSegments(o);
        return;
      } catch (s) {
        console.warn("Could not parse custom transcript for", e, s);
      }
    try {
      const s = await fetch(`/lessons/digital-workplace/transcript.${e}.json`);
      if (s.ok) {
        const d = ((await s.json()).segments || []).map((l) => ({
          id: l.id,
          start: l.start_ms !== void 0 ? l.start_ms / 1e3 : l.start || 0,
          end: l.end_ms !== void 0 ? l.end_ms / 1e3 : l.end || 0,
          speaker: l.speaker,
          text: l.text || l.draft_text || "",
          visualDescription: l.visual_description || l.visualDescription
        }));
        this.transcriptViewer.setSegments(d);
      }
    } catch (s) {
      console.warn("Could not load transcript for", e, s);
    }
    if (this.prefs.captionLanguage !== "off") {
      this.prefs.captionLanguage = e, S({ captionLanguage: e });
      const s = this.shadow.getElementById("btn-cc");
      s && (s.setAttribute("title", `Captions: ${e.toUpperCase()} (C)`), s.setAttribute("aria-label", `Captions: ${e.toUpperCase()} (C)`));
      const o = this.shadow.getElementById("select-cc-lang");
      o && (o.value = e), await this.loadCaptionTrack(e);
    }
  }
  async loadCaptionTrack(e) {
    if (!this.manifest || e === "off") {
      this.currentCues = [], this.updateCaptionDisplay();
      return;
    }
    const a = this.manifest.captionTracks.find((t) => t.language === e);
    if (!a) {
      this.currentCues = [], this.updateCaptionDisplay();
      return;
    }
    try {
      const t = typeof localStorage < "u" ? localStorage.getItem(`db-player:custom-vtt:${e}`) : null;
      if (t)
        this.currentCues = Ne(t);
      else {
        const s = await fetch(a.src);
        if (s.ok) {
          const o = await s.text();
          this.currentCues = Ne(o);
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
    const e = this.mainVideo.currentTime, a = this.currentCues.find((t) => e >= t.start && e <= t.end);
    a ? (this.captionOverlay.style.display = "block", this.captionOverlay.style.cssText = it(this.prefs.captionTheme, this.prefs.captionSize), this.captionOverlay.textContent = a.text) : this.captionOverlay.style.display = "none";
  }
  seekAndPlay(e) {
    if (isNaN(this.mainVideo.duration) || this.mainVideo.readyState < 1) {
      this.pendingSeekTime = e;
      const a = () => {
        this.mainVideo.removeEventListener("loadedmetadata", a), this.mainVideo.currentTime = e, this.mainVideo.play().catch(() => {
        }), this.pendingSeekTime = null;
      };
      this.mainVideo.addEventListener("loadedmetadata", a);
      return;
    }
    this.mainVideo.currentTime = e, this.mainVideo.play().catch((a) => {
      console.warn("Playback interrupted or prevented on seek:", a);
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
  resolveMainSource(e = this.currentQuality) {
    if (!this.manifest || !this.manifest.sources) return "";
    const a = this.manifest.sources.filter((s) => s.kind === "main");
    if (!a.length) return "";
    if (e === "auto") {
      const s = navigator.connection;
      if (s != null && s.saveData || (s == null ? void 0 : s.effectiveType) === "slow-2g" || (s == null ? void 0 : s.effectiveType) === "2g") {
        const d = a.find((l) => l.quality === "240p");
        if (d) return d.src;
      } else if ((s == null ? void 0 : s.effectiveType) === "3g") {
        const d = a.find((l) => l.quality === "360p");
        if (d) return d.src;
      }
      const o = a.find((d) => d.quality === "720p");
      return o ? o.src : a[0].src;
    }
    const t = a.find((s) => s.quality === e);
    return t ? t.src : a[0].src;
  }
  async applyQuality(e) {
    this.currentQuality = e, this.prefs.videoQuality = e, S({ videoQuality: e });
    const a = this.shadow.getElementById("quality-badge-text");
    a && (a.textContent = e === "auto" ? "Auto" : e), this.shadow.querySelectorAll(".quality-menu-item").forEach((c) => {
      const n = c.getAttribute("data-quality") === e;
      c.classList.toggle("selected", n), c.setAttribute("aria-checked", n ? "true" : "false");
      const k = c.querySelector(".quality-check");
      k && (k.textContent = n ? "✓" : "");
    });
    const s = this.shadow.getElementById("select-video-quality");
    s && s.value !== e && (s.value = e);
    const o = this.shadow.getElementById("quality-toast"), d = this.shadow.getElementById("quality-toast-text");
    if (o && d) {
      const c = this.activeLocale === "am", g = e === "auto" ? c ? "ጥራት፡ Auto (ተለዋዋጭ)" : "Quality: Auto (Adaptive)" : `${c ? "ጥራት፡ " : "Quality: "}${e}`;
      d.textContent = `⚡ ${g}`, o.style.display = "flex", o.style.opacity = "1", this.qualityToastTimer && clearTimeout(this.qualityToastTimer), this.qualityToastTimer = window.setTimeout(() => {
        o.style.opacity = "0", setTimeout(() => {
          o.style.opacity === "0" && (o.style.display = "none");
        }, 300);
      }, 2e3);
    }
    const l = this.resolveMainSource(e);
    if (l && this.mainVideo && !this.prefs.audioDescriptionEnabled)
      if (this.syncController)
        await this.syncController.switchSource(l);
      else {
        const c = !this.mainVideo.paused, g = this.mainVideo.currentTime, n = this.mainVideo.playbackRate;
        if (this.mainVideo.src = l, this.mainVideo.currentTime = g, this.mainVideo.playbackRate = n, c)
          try {
            await this.mainVideo.play();
          } catch {
          }
      }
  }
  render() {
    var g, n, k;
    const e = this.activeLocale === "am", a = this.manifest ? this.manifest.title[this.activeLocale] || this.manifest.title.en : "Media Player", t = this.resolveMainSource(this.currentQuality), s = (g = this.manifest) == null ? void 0 : g.sources.find((M) => M.kind === "sign"), o = this.prefs.transcriptWidth || z.transcriptWidth || 260, d = this.prefs.transcriptHeight || z.transcriptHeight || 400, l = this.prefs.eslWidth || z.eslWidth || 240, c = this.prefs.eslHeight || z.eslHeight || 180;
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

      <section class="player-component" aria-label="${a}">
        <div class="player-stage" id="player-stage">

          <!-- LEFT: Movable & Resizable Transcript Window (Outside of video frame) -->
          <div 
            class="window-panel transcript-window" 
            id="transcript-window"
            style="width: ${o}px; height: ${d}px; flex: 0 0 ${o}px; display: ${this.prefs.transcriptVisible !== !1 ? "flex" : "none"};"
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
          <div class="main-player-panel" id="player-container" tabindex="0" aria-label="${a} (Press ? for keyboard shortcuts)">
            <div class="video-viewport">
              <video 
                id="main-video" 
                class="main-video" 
                playsinline 
                preload="metadata"
                poster="${((k = (n = this.manifest) == null ? void 0 : n.poster) == null ? void 0 : k.src) || ""}"
                src="${t}">
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
                    <span id="play-icon" aria-hidden="true">${A.play}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-restart" aria-label="${e ? "እንደገና ጀምር (0 / Home)" : "Restart (0 / Home)"}" title="${e ? "እንደገና ጀምር (0 / Home)" : "Restart (0 / Home)"}">
                    <span aria-hidden="true">${A.restart}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-rewind" aria-label="${e ? "ወደኋላ 5 ሰከንድ (J / ←)" : "Rewind 5 seconds (J / ←)"}" title="${e ? "ወደኋላ 5 ሰከንድ (J / ←)" : "Rewind 5 seconds (J / ←)"}">
                    <span aria-hidden="true">${A.rewind}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-forward" aria-label="${e ? "ወደፊት 5 ሰከንድ (L / →)" : "Forward 5 seconds (L / →)"}" title="${e ? "ወደፊት 5 ሰከንድ (L / →)" : "Forward 5 seconds (L / →)"}">
                    <span aria-hidden="true">${A.forward}</span>
                  </button>
                </div>

                <!-- Center: Accessibility & Speed -->
                <div class="controls-cluster">
                  <button class="btn-ctrl" id="btn-cc" aria-pressed="${this.prefs.captionLanguage !== "off" ? "true" : "false"}" aria-label="${e ? "የትርጉም ጽሑፍ (C)" : "Captions (C)"}" title="${e ? "የትርጉም ጽሑፍ (C)" : "Captions (C)"}">
                    <span aria-hidden="true">${A.cc}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-esl" aria-pressed="${this.prefs.eslVisible ? "true" : "false"}" aria-label="${e ? "የኢትዮጵያ የምልክት ቋንቋ (ESL) (S)" : "Ethiopian Sign Language (ESL) (S)"}" title="${e ? "የኢትዮጵያ የምልክት ቋንቋ (ESL) (S)" : "Ethiopian Sign Language (ESL) (S)"}">
                    <span aria-hidden="true">${A.esl}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-ad" aria-pressed="${this.prefs.audioDescriptionEnabled ? "true" : "false"}" aria-label="${e ? "የድምጽ ማብራሪያ (D)" : "Audio Description (D)"}" title="${e ? "የድምጽ ማብራሪያ (D)" : "Audio Description (D)"}">
                    <span aria-hidden="true">${A.ad}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-transcript-toggle" aria-pressed="${this.prefs.transcriptVisible !== !1 ? "true" : "false"}" aria-label="${e ? "የጽሑፍ ግልባጭ ማሳያ (T)" : "Toggle Transcript (T)"}" title="${e ? "የጽሑፍ ግልባጭ ማሳያ (T)" : "Toggle Transcript (T)"}">
                    <span aria-hidden="true">${A.transcript}</span>
                  </button>

                  <span class="ctrl-divider" aria-hidden="true"></span>

                  <button class="btn-ctrl" id="btn-speed-faster" aria-label="${e ? "ፍጥነት ጨምር (>)" : "Increase speed (>)"}" title="${e ? "ፍጥነት ጨምር (>)" : "Increase speed (>)"}">
                    <span aria-hidden="true">${A.faster}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-speed-slower" aria-label="${e ? "ፍጥነት ቀንስ (<)" : "Decrease speed (<)"}" title="${e ? "ፍጥነት ቀንስ (<)" : "Decrease speed (<)"}">
                    <span aria-hidden="true">${A.slower}</span>
                  </button>

                  <span class="ctrl-divider" aria-hidden="true"></span>
                </div>

                <!-- Right: Settings, Fullscreen, Volume -->
                <div class="controls-cluster">
                  <button class="btn-ctrl btn-ctrl-quality" id="btn-quality" aria-expanded="false" aria-haspopup="menu" aria-label="${e ? "የቪዲዮ ጥራት" : "Video Quality"}" title="${e ? "የቪዲዮ ጥራት መቆጣጠሪያ (Auto / 720p / 360p / 240p)" : "Video Quality (Auto / 720p / 360p / 240p)"}">
                    <span aria-hidden="true">${A.quality}</span>
                    <span class="quality-badge-text" id="quality-badge-text">${this.currentQuality === "auto" ? "Auto" : this.currentQuality}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-shortcuts" aria-expanded="false" aria-label="${e ? "የኪቦርድ አቋራጮች (?)" : "Keyboard Shortcuts (?)"}" title="${e ? "የኪቦርድ አቋራጮች (?)" : "Keyboard Shortcuts (?)"}">
                    <span aria-hidden="true">${A.shortcuts}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-prefs" aria-expanded="false" aria-label="${e ? "የተደራሽነት ምርጫዎች" : "Accessibility Preferences"}" title="${e ? "የተደራሽነት ምርጫዎች" : "Accessibility Preferences"}">
                    <span aria-hidden="true">${A.prefs}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-fullscreen" aria-pressed="false" aria-label="${e ? "ሙሉ ማያ ገጽ (F)" : "Fullscreen (F)"}" title="${e ? "ሙሉ ማያ ገጽ (F)" : "Fullscreen (F)"}">
                    <span id="fullscreen-icon" aria-hidden="true">${A.fullscreenEnter}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-mute" aria-pressed="false" aria-label="${e ? "ድምጽ አጥፋ (M)" : "Mute (M)"}" title="${e ? "ድምጽ አጥፋ (M)" : "Mute (M)"}">
                    <span id="mute-icon" aria-hidden="true">${A.volumeUnmuted}</span>
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
              aria-label="${e ? "የቪዲዮ ጥራት" : "Video Quality"}">
              <div class="quality-menu-header">${e ? "የቪዲዮ ጥራት" : "QUALITY"}</div>
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
                  <span class="quality-name">240p <span class="quality-tag">${e ? "ዝቅተኛ" : "Low Data"}</span></span>
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
                  <span aria-hidden="true">${A.prefs}</span>
                  <span>${e ? "የተደራሽነት እና አቀማመጥ ምርጫዎች" : "Accessibility & Layout Settings"}</span>
                </div>
                <button type="button" class="btn-popover-close" id="btn-dismiss-prefs" aria-label="${e ? "ምርጫዎችን ዝጋ" : "Close settings"}" title="${e ? "ዝጋ" : "Close"}">✕</button>
              </div>

              <div class="popover-body">
                <div class="form-row">
                  <label for="select-video-quality">${e ? "የቪዲዮ ጥራት:" : "Video Quality:"}</label>
                  <select id="select-video-quality">
                    <option value="auto" ${this.currentQuality === "auto" ? "selected" : ""}>Auto (Adaptive)</option>
                    <option value="720p" ${this.currentQuality === "720p" ? "selected" : ""}>720p (HD)</option>
                    <option value="360p" ${this.currentQuality === "360p" ? "selected" : ""}>360p (SD - Standard)</option>
                    <option value="240p" ${this.currentQuality === "240p" ? "selected" : ""}>240p (${e ? "ዝቅተኛ ዳታ" : "Low Data / 3G"})</option>
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
          </div>

          <!-- RIGHT: Movable & Resizable Sign Language Window (Outside of video frame) -->
          <div 
            class="window-panel esl-window" 
            id="esl-window" 
            style="width: ${l}px; height: ${c}px; flex: 0 0 ${l}px; display: ${this.prefs.eslVisible && s ? "flex" : "none"};"
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

        <!-- Keyboard Shortcuts Modal Dialog -->
        <div class="dialog-backdrop" id="dialog-shortcuts" style="display: none;" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
          <div class="dialog-panel shortcuts-panel">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <h3 id="shortcuts-title" style="margin: 0; font-size: 1.15rem; font-weight: 600;">
                ⌨ ${e ? "የኪቦርድ አቋራጭ ቁልፎች" : "Keyboard Shortcuts Cheat-Sheet"}
              </h3>
              <button type="button" class="btn-close-modal" id="btn-close-shortcuts" aria-label="${e ? "ዝጋ" : "Close"}">✕</button>
            </div>
            <p style="margin: 0 0 1rem 0; font-size: 0.85rem; color: #64748B;">
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
            <div style="display: flex; justify-content: flex-end; margin-top: 1.5rem;">
              <button type="button" class="btn-dialog-action btn-dialog-save" id="btn-ok-shortcuts">
                ${e ? "ገባኝ" : "Got it"}
              </button>
            </div>
          </div>
        </div>
      </section>
    `, this.bindDOMElements(), this.attachEventListeners(), this.setupWindowInteractions();
  }
  bindDOMElements() {
    this.mainVideo = this.shadow.getElementById("main-video"), this.signVideo = this.shadow.getElementById("sign-video"), this.captionOverlay = this.shadow.getElementById("caption-overlay"), this.syncController = new at(this.mainVideo, {
      driftThreshold: 0.25,
      onSignStatusChange: (s) => {
        const o = this.shadow.getElementById("sign-status-indicator");
        o && (s === "loading" ? (o.style.display = "inline-block", o.textContent = this.activeLocale === "am" ? "በመጫን ላይ..." : "Loading...") : s === "error" ? (o.style.display = "inline-block", o.textContent = this.activeLocale === "am" ? "ምልክት ቋንቋ አልተገኘም" : "Sign Unavailable", o.style.background = "#FEF2F2", o.style.color = "#991B1B") : (o.style.display = "inline-block", o.textContent = "EthSL", o.style.background = "rgba(255,255,255,0.2)", o.style.color = "#FFF"));
      }
    }), this.signVideo && this.syncController.setSignVideo(this.signVideo);
    const e = this.shadow.getElementById("transcript-target"), a = this.shadow.getElementById("live-chat-target"), t = this.shadow.getElementById("cb-auto-scroll");
    this.transcriptViewer = new st(e, {
      locale: this.activeLocale,
      onSeekAndPlay: (s) => {
        this.seekAndPlay(s);
      },
      onFollowChange: (s) => {
        t && (t.checked = s);
      }
    }), a && (this.liveChatViewer = new rt(a, {
      locale: this.activeLocale,
      onSeekAndPlay: (s) => {
        this.seekAndPlay(s);
      }
    }), this.liveChatMessages.length && this.liveChatViewer.setMessages(this.liveChatMessages));
  }
  setupWindowInteractions() {
    const e = this.shadow.getElementById("player-stage");
    if (!e) return;
    const a = (t, s, o, d, l, c, g) => {
      const n = this.shadow.getElementById(t), k = this.shadow.getElementById(s), M = this.shadow.getElementById(o), x = this.shadow.getElementById(d), I = this.shadow.getElementById(l), U = c ? this.shadow.getElementById(c) : null;
      if (!n || !k || !M) return;
      let y = null, W = !1, _ = "corner", oe = 0, ne = 0, q = 0, le = 0, G = null;
      const C = (v) => {
        if (!W) return;
        const w = v.clientX - oe, m = v.clientY - ne;
        G !== null && cancelAnimationFrame(G), G = requestAnimationFrame(() => {
          let E = q, $ = le;
          _ === "corner" || _ === "right" ? E = Math.min(g.maxWidth, Math.max(g.minWidth, q + w)) : _ === "left" && (E = Math.min(g.maxWidth, Math.max(g.minWidth, q - w))), (_ === "corner" || _ === "bottom") && ($ = Math.min(g.maxHeight, Math.max(g.minHeight, le + m))), n.style.width = `${E}px`, n.style.height = `${$}px`, n.style.flex = `0 0 ${E}px`, y && (y.style.width = `${E}px`, y.style.height = `${$}px`, y.style.flex = `0 0 ${E}px`);
        });
      }, B = () => {
        W && (W = !1, n.classList.remove("is-resizing"), window.removeEventListener("pointermove", C), window.removeEventListener("pointerup", B), window.removeEventListener("pointercancel", B), G !== null && (cancelAnimationFrame(G), G = null), g.onSaveSize(n.offsetWidth, n.offsetHeight));
      }, T = (v, w) => {
        W = !0, _ = v, oe = w.clientX, ne = w.clientY, q = n.offsetWidth, le = n.offsetHeight, n.classList.add("is-resizing"), window.addEventListener("pointermove", C), window.addEventListener("pointerup", B), window.addEventListener("pointercancel", B), w.preventDefault(), w.stopPropagation();
      };
      M.addEventListener("pointerdown", (v) => T("corner", v)), x == null || x.addEventListener("pointerdown", (v) => T("bottom", v)), I == null || I.addEventListener("pointerdown", (v) => T("right", v)), U == null || U.addEventListener("pointerdown", (v) => T("left", v)), M.addEventListener("keydown", (v) => {
        let w = n.offsetWidth, m = n.offsetHeight, E = !1;
        v.key === "ArrowRight" ? (w = Math.min(g.maxWidth, w + 20), E = !0) : v.key === "ArrowLeft" ? (w = Math.max(g.minWidth, w - 20), E = !0) : v.key === "ArrowDown" ? (m = Math.min(g.maxHeight, m + 20), E = !0) : v.key === "ArrowUp" && (m = Math.max(g.minHeight, m - 20), E = !0), E && (v.preventDefault(), n.style.width = `${w}px`, n.style.height = `${m}px`, n.style.flex = `0 0 ${w}px`, y && (y.style.width = `${w}px`, y.style.height = `${m}px`, y.style.flex = `0 0 ${w}px`), g.onSaveSize(w, m));
      });
      let b = !1, D = 0, L = 0, te = 0, ie = 0, F = null;
      n.addEventListener("pointerdown", () => {
        if (n.classList.contains("floating")) {
          n.style.zIndex = "100";
          const v = t === "transcript-window" ? "esl-window" : "transcript-window", w = this.shadow.getElementById(v);
          w && w.classList.contains("floating") && (w.style.zIndex = "90");
        }
      });
      const J = (v) => {
        const w = v.clientX - D, m = v.clientY - L;
        !b && Math.hypot(w, m) > 4 && (b = !0, !y && n.parentNode && (y = document.createElement("div"), y.className = "window-placeholder", y.style.width = `${n.offsetWidth}px`, y.style.height = `${n.offsetHeight}px`, y.style.flex = n.style.flex || `0 0 ${n.offsetWidth}px`, n.parentNode.insertBefore(y, n)), n.classList.add("floating"), n.style.position = "absolute", n.style.zIndex = "100"), b && (F !== null && cancelAnimationFrame(F), F = requestAnimationFrame(() => {
          const E = te + w, $ = ie + m;
          n.style.left = `${E}px`, n.style.top = `${$}px`, n.style.right = "auto", n.style.bottom = "auto";
        }));
      }, Q = () => {
        b && (b = !1), window.removeEventListener("pointermove", J), window.removeEventListener("pointerup", Q), window.removeEventListener("pointercancel", Q), F !== null && (cancelAnimationFrame(F), F = null);
      };
      k.addEventListener("pointerdown", (v) => {
        if (v.target.tagName === "INPUT" || v.target.tagName === "SELECT")
          return;
        D = v.clientX, L = v.clientY;
        const w = e.getBoundingClientRect(), m = n.getBoundingClientRect();
        te = n.style.left ? parseFloat(n.style.left) : m.left - w.left, ie = n.style.top ? parseFloat(n.style.top) : m.top - w.top, b = !1, n.style.zIndex = "100";
        const E = t === "transcript-window" ? "esl-window" : "transcript-window", $ = this.shadow.getElementById(E);
        $ && $.classList.contains("floating") && ($.style.zIndex = "90"), window.addEventListener("pointermove", J), window.addEventListener("pointerup", Q), window.addEventListener("pointercancel", Q);
      }), k.addEventListener("keydown", (v) => {
        let w = !1;
        const m = 20;
        if (!n.classList.contains("floating")) {
          !y && n.parentNode && (y = document.createElement("div"), y.className = "window-placeholder", y.style.width = `${n.offsetWidth}px`, y.style.height = `${n.offsetHeight}px`, y.style.flex = n.style.flex || `0 0 ${n.offsetWidth}px`, n.parentNode.insertBefore(y, n));
          const ae = e.getBoundingClientRect(), ce = n.getBoundingClientRect();
          n.classList.add("floating"), n.style.position = "absolute", n.style.zIndex = "100", n.style.left = `${ce.left - ae.left}px`, n.style.top = `${ce.top - ae.top}px`;
        }
        let E = parseFloat(n.style.left) || 0, $ = parseFloat(n.style.top) || 0;
        v.key === "ArrowRight" ? (E += m, w = !0) : v.key === "ArrowLeft" ? (E -= m, w = !0) : v.key === "ArrowDown" ? ($ += m, w = !0) : v.key === "ArrowUp" && ($ -= m, w = !0), w && (v.preventDefault(), n.style.left = `${E}px`, n.style.top = `${$}px`);
      });
      const O = () => {
        n.classList.remove("floating"), n.style.position = "", n.style.left = "", n.style.top = "", n.style.right = "", n.style.bottom = "", n.style.zIndex = "", y && (y.remove(), y = null);
      };
      k.addEventListener("dblclick", O);
      const ge = (v) => {
        if (v === "split") {
          O();
          return;
        }
        n.classList.contains("floating") || (!y && n.parentNode && (y = document.createElement("div"), y.className = "window-placeholder", y.style.width = `${n.offsetWidth}px`, y.style.height = `${n.offsetHeight}px`, y.style.flex = n.style.flex || `0 0 ${n.offsetWidth}px`, n.parentNode.insertBefore(y, n)), n.classList.add("floating"), n.style.position = "absolute", n.style.zIndex = "100");
        const w = e.getBoundingClientRect(), m = n.offsetWidth || 280, E = n.offsetHeight || 210, $ = 16, ae = Math.max(0, w.width - m - $), ce = Math.max(0, w.height - E - $);
        v === "tr" ? (n.style.left = `${ae}px`, n.style.top = `${$}px`) : v === "br" && (n.style.left = `${ae}px`, n.style.top = `${ce}px`);
      };
      n.__reDock = O, n.__dockPreset = ge;
    };
    a(
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
          this.prefs.transcriptWidth = t, this.prefs.transcriptHeight = s, S({ transcriptWidth: t, transcriptHeight: s });
        }
      }
    ), a(
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
          this.prefs.eslWidth = t, this.prefs.eslHeight = s, S({ eslWidth: t, eslHeight: s });
        }
      }
    );
  }
  attachEventListeners() {
    var Ie, He, Pe, je, Re, qe, Qe, Oe;
    const e = this.shadow.getElementById("btn-play"), a = this.shadow.getElementById("play-icon"), t = this.shadow.getElementById("big-play-btn"), s = this.shadow.getElementById("btn-restart"), o = this.shadow.getElementById("btn-speed-faster"), d = this.shadow.getElementById("btn-speed-slower"), l = this.shadow.getElementById("speed-display"), c = this.shadow.getElementById("state-display"), g = this.shadow.getElementById("btn-fullscreen"), n = this.shadow.getElementById("fullscreen-icon"), k = this.shadow.getElementById("btn-mute"), M = this.shadow.getElementById("mute-icon"), x = this.shadow.getElementById("player-container"), I = this.shadow.getElementById("seek-scrubber"), U = this.shadow.getElementById("time-display"), y = () => {
      this.mainVideo.paused ? this.mainVideo.play() : this.mainVideo.pause();
    };
    e && e.addEventListener("click", y), t && t.addEventListener("click", y), this.mainVideo.addEventListener("click", y), this.mainVideo.addEventListener("play", () => {
      a && (a.innerHTML = A.pause), e == null || e.setAttribute("aria-label", this.activeLocale === "am" ? "አቁም (Space / K)" : "Pause (Space / K)"), e == null || e.setAttribute("title", this.activeLocale === "am" ? "አቁም (Space / K)" : "Pause (Space / K)"), t == null || t.classList.add("is-hidden"), c && (c.textContent = this.activeLocale === "am" ? "እየተጫወተ ነው" : "Playing");
    }), this.mainVideo.addEventListener("pause", () => {
      a && (a.innerHTML = A.play), e == null || e.setAttribute("aria-label", this.activeLocale === "am" ? "አጫውት (Space / K)" : "Play (Space / K)"), e == null || e.setAttribute("title", this.activeLocale === "am" ? "አጫውት (Space / K)" : "Play (Space / K)"), t == null || t.classList.remove("is-hidden"), c && (c.textContent = this.mainVideo.ended ? this.activeLocale === "am" ? "ተጠናቋል" : "End of track" : this.activeLocale === "am" ? "ቆሟል" : "Paused");
    }), this.mainVideo.addEventListener("ended", () => {
      a && (a.innerHTML = A.play), e == null || e.setAttribute("aria-label", this.activeLocale === "am" ? "አጫውት (Space / K)" : "Play (Space / K)"), e == null || e.setAttribute("title", this.activeLocale === "am" ? "አጫውት (Space / K)" : "Play (Space / K)"), t == null || t.classList.remove("is-hidden"), c && (c.textContent = this.activeLocale === "am" ? "ተጠናቋል" : "End of track"), this.dispatchEvent(
        new CustomEvent("db-player:complete", {
          bubbles: !0,
          composed: !0,
          detail: {}
        })
      );
    }), s == null || s.addEventListener("click", () => {
      this.mainVideo.currentTime = 0, this.mainVideo.play(), this.transcriptViewer.updateActiveTime(0);
    });
    const W = [0.5, 0.75, 1, 1.25, 1.5, 2], _ = () => {
      const r = this.mainVideo.playbackRate;
      l && (l.textContent = `Speed: ${r}x`);
    };
    o == null || o.addEventListener("click", () => {
      const r = this.mainVideo.playbackRate, p = W.filter((V) => V > r + 0.01), f = p.length > 0 ? p[0] : 2;
      this.mainVideo.playbackRate = f, _();
    }), d == null || d.addEventListener("click", () => {
      const r = this.mainVideo.playbackRate, p = W.filter((V) => V < r - 0.01), f = p.length > 0 ? p[p.length - 1] : 0.5;
      this.mainVideo.playbackRate = f, _();
    });
    const oe = () => !!(document.fullscreenElement || document.webkitFullscreenElement || this.shadow.fullscreenElement || x != null && x.classList.contains("is-fullscreen") || this.hasAttribute("data-fullscreen")), ne = async () => {
      try {
        oe() ? ((document.fullscreenElement || document.webkitFullscreenElement || this.shadow.fullscreenElement) && (document.exitFullscreen ? await document.exitFullscreen() : document.webkitExitFullscreen && await document.webkitExitFullscreen()), x == null || x.classList.remove("is-fullscreen"), this.removeAttribute("data-fullscreen"), q()) : x != null && x.requestFullscreen ? await x.requestFullscreen() : x != null && x.webkitRequestFullscreen ? await x.webkitRequestFullscreen() : (x == null || x.classList.add("is-fullscreen"), this.setAttribute("data-fullscreen", "true"), q());
      } catch (r) {
        console.warn("Fullscreen native request fell back to CSS:", r), (x == null ? void 0 : x.classList.contains("is-fullscreen")) ? (x == null || x.classList.remove("is-fullscreen"), this.removeAttribute("data-fullscreen")) : (x == null || x.classList.add("is-fullscreen"), this.setAttribute("data-fullscreen", "true")), q();
      }
    };
    g == null || g.addEventListener("click", ne);
    const q = () => {
      const r = oe();
      g == null || g.setAttribute("aria-pressed", r ? "true" : "false"), g == null || g.setAttribute(
        "aria-label",
        r ? this.activeLocale === "am" ? "ከሙሉ ማያ ገጽ ውጣ (F)" : "Exit Fullscreen (F)" : this.activeLocale === "am" ? "ሙሉ ማያ ገጽ (F)" : "Fullscreen (F)"
      ), g == null || g.setAttribute(
        "title",
        r ? this.activeLocale === "am" ? "ከሙሉ ማያ ገጽ ውጣ (F)" : "Exit Fullscreen (F)" : this.activeLocale === "am" ? "ሙሉ ማያ ገጽ (F)" : "Fullscreen (F)"
      ), n && (n.innerHTML = r ? A.fullscreenExit : A.fullscreenEnter);
    };
    document.addEventListener("fullscreenchange", q), document.addEventListener("webkitfullscreenchange", q);
    const le = () => {
      this.mainVideo.muted = !this.mainVideo.muted;
    };
    k == null || k.addEventListener("click", le);
    const G = () => {
      const r = this.mainVideo.muted;
      k == null || k.setAttribute("aria-pressed", r ? "true" : "false"), k == null || k.setAttribute(
        "aria-label",
        r ? this.activeLocale === "am" ? "ድምጽ አብራ (M)" : "Unmute (M)" : this.activeLocale === "am" ? "ድምጽ አጥፋ (M)" : "Mute (M)"
      ), k == null || k.setAttribute(
        "title",
        r ? this.activeLocale === "am" ? "ድምጽ አብራ (M)" : "Unmute (M)" : this.activeLocale === "am" ? "ድምጽ አጥፋ (M)" : "Mute (M)"
      ), M && (M.innerHTML = r ? A.volumeMuted : A.volumeUnmuted);
    };
    this.mainVideo.addEventListener("volumechange", G), this.mainVideo.addEventListener("timeupdate", () => {
      const r = this.mainVideo.currentTime, p = this.mainVideo.duration || 1;
      I && !I.matches(":active") && (I.value = (r / p * 100).toFixed(1)), U && (U.textContent = `${this.formatTime(r)} / ${this.formatTime(p)}`), this.updateCaptionDisplay(), this.transcriptViewer.updateActiveTime(r), this.liveChatViewer && this.liveChatViewer.updateTime(r), this.dispatchEvent(
        new CustomEvent("db-player:progress", {
          bubbles: !0,
          composed: !0,
          detail: {
            seconds: Math.floor(r),
            percent: Math.round(r / p * 100)
          }
        })
      );
    }), I.addEventListener("input", () => {
      const r = this.mainVideo.duration || 1;
      this.mainVideo.currentTime = parseFloat(I.value) / 100 * r;
    }), (Ie = this.shadow.getElementById("btn-rewind")) == null || Ie.addEventListener("click", () => {
      this.mainVideo.currentTime = Math.max(0, this.mainVideo.currentTime - 5);
    }), (He = this.shadow.getElementById("btn-forward")) == null || He.addEventListener("click", () => {
      this.mainVideo.currentTime = Math.min(this.mainVideo.duration || 1e3, this.mainVideo.currentTime + 5);
    });
    const C = this.shadow.getElementById("btn-ad");
    C == null || C.addEventListener("click", async () => {
      if (!this.manifest) return;
      this.prefs.audioDescriptionEnabled = !this.prefs.audioDescriptionEnabled, S({ audioDescriptionEnabled: this.prefs.audioDescriptionEnabled }), C.setAttribute("aria-pressed", this.prefs.audioDescriptionEnabled ? "true" : "false");
      const r = this.prefs.audioDescriptionEnabled ? "described" : "main", p = this.manifest.sources.find((f) => f.kind === r) || this.manifest.sources.find((f) => f.kind === "main");
      p && await this.syncController.switchSource(p.src);
    });
    const B = this.shadow.getElementById("btn-cc");
    B == null || B.addEventListener("click", async () => {
      const r = ["en", "am", "om", "ti", "so", "off"], p = (r.indexOf(this.prefs.captionLanguage) + 1) % r.length;
      this.prefs.captionLanguage = r[p], S({ captionLanguage: this.prefs.captionLanguage });
      const f = this.prefs.captionLanguage === "off";
      B.setAttribute("aria-pressed", f ? "false" : "true"), B.setAttribute("title", `Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`), B.setAttribute(
        "aria-label",
        `Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`
      );
      const V = this.shadow.getElementById("select-cc-lang");
      if (V && (V.value = this.prefs.captionLanguage), await this.loadCaptionTrack(this.prefs.captionLanguage), !f) {
        const R = this.shadow.getElementById("select-transcript-lang");
        R && R.value !== this.prefs.captionLanguage && (R.value = this.prefs.captionLanguage, await this.switchTranscriptLanguage(this.prefs.captionLanguage));
      }
    });
    const T = this.shadow.getElementById("btn-esl"), b = this.shadow.getElementById("esl-window");
    T == null || T.addEventListener("click", () => {
      this.prefs.eslVisible = !this.prefs.eslVisible, S({ eslVisible: this.prefs.eslVisible }), T.setAttribute("aria-pressed", this.prefs.eslVisible ? "true" : "false"), b && (b.style.display = this.prefs.eslVisible ? "flex" : "none");
    });
    const D = this.shadow.getElementById("btn-transcript-toggle"), L = this.shadow.getElementById("transcript-window");
    D == null || D.addEventListener("click", () => {
      const p = !((L == null ? void 0 : L.style.display) !== "none");
      this.prefs.transcriptVisible = p, S({ transcriptVisible: p }), D.setAttribute("aria-pressed", p ? "true" : "false"), L && (L.style.display = p ? "flex" : "none");
    });
    const te = this.shadow.getElementById("cb-auto-scroll");
    te == null || te.addEventListener("change", () => {
      this.transcriptViewer.setFollowing(te.checked);
    });
    const ie = this.shadow.getElementById("select-transcript-lang");
    ie == null || ie.addEventListener("change", async () => {
      const r = ie.value;
      await this.switchTranscriptLanguage(r);
    });
    const F = this.shadow.getElementById("btn-prefs"), J = this.shadow.getElementById("btn-transcript-prefs"), Q = this.shadow.getElementById("btn-esl-prefs"), O = this.shadow.getElementById("prefs-dialog"), ge = this.shadow.getElementById("btn-close-prefs"), v = this.shadow.getElementById("btn-dismiss-prefs"), w = this.shadow.getElementById("btn-reset-layout"), m = this.shadow.getElementById("btn-quality"), E = this.shadow.getElementById("quality-menu"), $ = () => {
      this.isQualityMenuOpen && (this.isQualityMenuOpen = !1, E && (E.style.display = "none"), m == null || m.classList.remove("is-active"), m == null || m.setAttribute("aria-expanded", "false"));
    }, ae = () => {
      de(), this.isQualityMenuOpen = !0, E && (E.style.display = "flex"), m == null || m.classList.add("is-active"), m == null || m.setAttribute("aria-expanded", "true");
      const r = this.shadow.querySelector(`.quality-menu-item[data-quality="${this.currentQuality}"]`) || this.shadow.querySelector(".quality-menu-item");
      r == null || r.focus();
    }, ce = () => {
      this.isQualityMenuOpen ? $() : ae();
    };
    m == null || m.addEventListener("click", (r) => {
      r.stopPropagation(), ce();
    }), this.shadow.querySelectorAll(".quality-menu-item").forEach((r) => {
      r.addEventListener("click", async () => {
        const p = r.getAttribute("data-quality");
        p && (await this.applyQuality(p), $(), m == null || m.focus());
      });
    });
    const H = this.shadow.getElementById("select-cc-lang"), N = this.shadow.getElementById("select-cc-size"), K = this.shadow.getElementById("select-cc-theme"), se = this.shadow.getElementById("select-video-quality"), X = this.shadow.getElementById("toggle-esl-visibility"), Y = this.shadow.getElementById("toggle-transcript-visibility"), Z = this.shadow.getElementById("toggle-ad-enabled"), de = () => {
      this.isPreferencesOpen && (this.isPreferencesOpen = !1, O && (O.style.display = "none"), F == null || F.classList.remove("is-active"), F == null || F.setAttribute("aria-expanded", "false"), F == null || F.focus());
    }, Se = () => {
      $(), this.isPreferencesOpen = !0, se && (se.value = this.currentQuality), H && (H.value = this.prefs.captionLanguage), N && (N.value = this.prefs.captionSize), K && (K.value = this.prefs.captionTheme), X && (X.value = this.prefs.eslVisible ? "show" : "hide"), Y && (Y.value = this.prefs.transcriptVisible !== !1 ? "show" : "hide"), Z && (Z.value = this.prefs.audioDescriptionEnabled ? "on" : "off"), O && (O.style.display = "flex"), F == null || F.classList.add("is-active"), F == null || F.setAttribute("aria-expanded", "true"), H == null || H.focus();
    }, Je = () => {
      this.isPreferencesOpen ? de() : Se();
    };
    F == null || F.addEventListener("click", Je), J == null || J.addEventListener("click", Se), Q == null || Q.addEventListener("click", Se), v == null || v.addEventListener("click", de), H == null || H.addEventListener("change", async () => {
      if (H.value !== this.prefs.captionLanguage) {
        if (this.prefs.captionLanguage = H.value, S({ captionLanguage: this.prefs.captionLanguage }), B) {
          const r = this.prefs.captionLanguage === "off";
          B.setAttribute("aria-pressed", r ? "false" : "true");
        }
        await this.loadCaptionTrack(this.prefs.captionLanguage);
      }
    }), N == null || N.addEventListener("change", () => {
      N.value !== this.prefs.captionSize && (this.prefs.captionSize = N.value, S({ captionSize: this.prefs.captionSize }), this.updateCaptionDisplay());
    }), K == null || K.addEventListener("change", () => {
      K.value !== this.prefs.captionTheme && (this.prefs.captionTheme = K.value, S({ captionTheme: this.prefs.captionTheme }), this.updateCaptionDisplay());
    }), X == null || X.addEventListener("change", () => {
      var f;
      const r = !!(this.signVideo || (f = this.manifest) != null && f.sources.some((V) => V.kind === "sign")), p = X.value === "show";
      this.prefs.eslVisible = p, S({ eslVisible: p }), T && T.setAttribute("aria-pressed", p ? "true" : "false"), b && (b.style.display = p && r ? "flex" : "none");
    }), Y == null || Y.addEventListener("change", () => {
      const r = Y.value === "show";
      this.prefs.transcriptVisible = r, S({ transcriptVisible: r }), D && D.setAttribute("aria-pressed", r ? "true" : "false"), L && (L.style.display = r ? "flex" : "none");
    }), Z == null || Z.addEventListener("change", () => {
      const r = Z.value === "on";
      this.prefs.audioDescriptionEnabled = r, S({ audioDescriptionEnabled: r }), C && C.setAttribute("aria-pressed", r ? "true" : "false");
    }), ge == null || ge.addEventListener("click", async () => {
      var p;
      if (H && H.value !== this.prefs.captionLanguage) {
        if (this.prefs.captionLanguage = H.value, S({ captionLanguage: this.prefs.captionLanguage }), B) {
          const f = this.prefs.captionLanguage === "off";
          B.setAttribute("aria-pressed", f ? "false" : "true");
        }
        await this.loadCaptionTrack(this.prefs.captionLanguage);
      }
      N && N.value !== this.prefs.captionSize && (this.prefs.captionSize = N.value, S({ captionSize: this.prefs.captionSize }), this.updateCaptionDisplay()), K && K.value !== this.prefs.captionTheme && (this.prefs.captionTheme = K.value, S({ captionTheme: this.prefs.captionTheme }), this.updateCaptionDisplay());
      const r = !!(this.signVideo || (p = this.manifest) != null && p.sources.some((f) => f.kind === "sign"));
      if (X) {
        const f = X.value === "show";
        this.prefs.eslVisible = f, S({ eslVisible: f }), T && T.setAttribute("aria-pressed", f ? "true" : "false"), b && (b.style.display = f && r ? "flex" : "none");
      }
      if (Y) {
        const f = Y.value === "show";
        this.prefs.transcriptVisible = f, S({ transcriptVisible: f }), D && D.setAttribute("aria-pressed", f ? "true" : "false"), L && (L.style.display = f ? "flex" : "none");
      }
      if (Z) {
        const f = Z.value === "on";
        this.prefs.audioDescriptionEnabled = f, S({ audioDescriptionEnabled: f }), C && C.setAttribute("aria-pressed", f ? "true" : "false");
      }
      de();
    });
    const Xe = (r) => {
      const p = r.composedPath();
      this.isPreferencesOpen && (O && p.includes(O) || F && p.includes(F) || J && p.includes(J) || Q && p.includes(Q) || de()), this.isQualityMenuOpen && (E && p.includes(E) || m && p.includes(m) || $());
    };
    window.addEventListener("pointerdown", Xe), se == null || se.addEventListener("change", async () => {
      se.value !== this.currentQuality && await this.applyQuality(se.value);
    }), w == null || w.addEventListener("click", () => {
      var ye, ue, Ee;
      tt(), this.prefs = ze();
      const r = this.shadow.getElementById("select-cc-lang"), p = this.shadow.getElementById("select-cc-size"), f = this.shadow.getElementById("select-cc-theme"), V = this.shadow.getElementById("select-video-quality"), R = this.shadow.getElementById("toggle-esl-visibility"), ee = this.shadow.getElementById("toggle-transcript-visibility"), ve = this.shadow.getElementById("toggle-ad-enabled");
      V && (V.value = "auto"), this.applyQuality("auto"), r && (r.value = this.prefs.captionLanguage), p && (p.value = this.prefs.captionSize), f && (f.value = this.prefs.captionTheme), R && (R.value = "show"), ee && (ee.value = "show"), ve && (ve.value = "off"), this.updateCaptionDisplay(), this.loadCaptionTrack(this.prefs.captionLanguage), L && ((ye = L.__reDock) == null || ye.call(L), L.classList.remove("floating"), L.style.position = "", L.style.left = "", L.style.top = "", L.style.right = "", L.style.bottom = "", L.style.zIndex = "", L.style.width = `${z.transcriptWidth}px`, L.style.height = `${z.transcriptHeight}px`, L.style.flex = `0 0 ${z.transcriptWidth}px`, L.style.display = "flex"), b && ((ue = b.__reDock) == null || ue.call(b), b.classList.remove("floating"), b.style.position = "", b.style.left = "", b.style.top = "", b.style.right = "", b.style.bottom = "", b.style.zIndex = "", b.style.width = `${z.eslWidth}px`, b.style.height = `${z.eslHeight}px`, b.style.flex = `0 0 ${z.eslWidth}px`, b.style.display = this.signVideo || (Ee = this.manifest) != null && Ee.sources.some((Ye) => Ye.kind === "sign") ? "flex" : "none"), T && T.setAttribute("aria-pressed", "true"), D && D.setAttribute("aria-pressed", "true"), C && C.setAttribute("aria-pressed", "false");
    }), (Pe = this.shadow.getElementById("select-cc-lang")) == null || Pe.addEventListener("change", async (r) => {
      const p = r.target.value;
      if (this.prefs.captionLanguage = p, S({ captionLanguage: this.prefs.captionLanguage }), B) {
        const f = this.prefs.captionLanguage === "off";
        B.setAttribute("aria-pressed", f ? "false" : "true"), B.setAttribute("title", `Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`), B.setAttribute(
          "aria-label",
          `Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`
        );
      }
      if (await this.loadCaptionTrack(this.prefs.captionLanguage), p !== "off") {
        const f = this.shadow.getElementById("select-transcript-lang");
        f && f.value !== p && (f.value = p, await this.switchTranscriptLanguage(p));
      }
    }), (je = this.shadow.getElementById("select-cc-size")) == null || je.addEventListener("change", (r) => {
      this.prefs.captionSize = r.target.value, S({ captionSize: this.prefs.captionSize }), this.updateCaptionDisplay();
    }), (Re = this.shadow.getElementById("select-cc-theme")) == null || Re.addEventListener("change", (r) => {
      this.prefs.captionTheme = r.target.value, S({ captionTheme: this.prefs.captionTheme }), this.updateCaptionDisplay();
    }), (qe = this.shadow.getElementById("toggle-esl-visibility")) == null || qe.addEventListener("change", (r) => {
      var V;
      const p = r.target.value === "show", f = !!(this.signVideo || (V = this.manifest) != null && V.sources.some((R) => R.kind === "sign"));
      this.prefs.eslVisible = p, S({ eslVisible: p }), T && T.setAttribute("aria-pressed", p ? "true" : "false"), b && (b.style.display = p && f ? "flex" : "none");
    }), (Qe = this.shadow.getElementById("toggle-transcript-visibility")) == null || Qe.addEventListener("change", (r) => {
      const p = r.target.value === "show";
      this.prefs.transcriptVisible = p, S({ transcriptVisible: p }), D && D.setAttribute("aria-pressed", p ? "true" : "false"), L && (L.style.display = p ? "flex" : "none");
    }), (Oe = this.shadow.getElementById("toggle-ad-enabled")) == null || Oe.addEventListener("change", (r) => {
      const p = r.target.value === "on";
      this.prefs.audioDescriptionEnabled = p, S({ audioDescriptionEnabled: p }), C && C.setAttribute("aria-pressed", p ? "true" : "false");
    });
    const we = this.shadow.getElementById("transcript-search");
    we == null || we.addEventListener("input", () => {
      this.transcriptViewer.setSearchQuery(we.value);
    });
    const xe = this.shadow.getElementById("live-chat-search");
    xe == null || xe.addEventListener("input", () => {
      this.liveChatViewer && this.liveChatViewer.setSearchQuery(xe.value);
    });
    const P = this.shadow.getElementById("tab-btn-transcript"), j = this.shadow.getElementById("tab-btn-chat"), ke = this.shadow.getElementById("transcript-view-panel"), Le = this.shadow.getElementById("live-chat-view-panel");
    P == null || P.addEventListener("click", () => {
      this.activeLeftTab = "transcript", P.classList.add("active"), P.setAttribute("aria-selected", "true"), j == null || j.classList.remove("active"), j == null || j.setAttribute("aria-selected", "false"), ke && (ke.style.display = "flex"), Le && (Le.style.display = "none");
    }), j == null || j.addEventListener("click", () => {
      this.activeLeftTab = "chat", j.classList.add("active"), j.setAttribute("aria-selected", "true"), P == null || P.classList.remove("active"), P == null || P.setAttribute("aria-selected", "false"), ke && (ke.style.display = "none"), Le && (Le.style.display = "flex"), this.liveChatViewer && this.liveChatViewer.updateTime(this.mainVideo.currentTime);
    });
    const $e = this.shadow.getElementById("btn-dock-tr"), Ae = this.shadow.getElementById("btn-dock-br"), Be = this.shadow.getElementById("btn-dock-split");
    $e == null || $e.addEventListener("click", () => {
      var r;
      return (r = b == null ? void 0 : b.__dockPreset) == null ? void 0 : r.call(b, "tr");
    }), Ae == null || Ae.addEventListener("click", () => {
      var r;
      return (r = b == null ? void 0 : b.__dockPreset) == null ? void 0 : r.call(b, "br");
    }), Be == null || Be.addEventListener("click", () => {
      var r;
      return (r = b == null ? void 0 : b.__dockPreset) == null ? void 0 : r.call(b, "split");
    });
    const Te = this.shadow.getElementById("btn-export-brf");
    Te == null || Te.addEventListener("click", () => {
      var ve, ye;
      const r = ((ve = this.transcriptViewer) == null ? void 0 : ve.getSegments()) || [], p = ((ye = this.manifest) == null ? void 0 : ye.title) && (this.manifest.title[this.activeLocale] || this.manifest.title.en) || "Lesson Transcript", f = lt({
        title: p,
        language: this.activeLocale === "am" || this.activeLocale === "ti" ? "am" : "en",
        segments: r.length > 0 ? r : this.currentCues.map((ue, Ee) => ({
          id: Ee,
          start: ue.start,
          end: ue.end,
          text: ue.text,
          speaker: this.activeLocale === "am" ? "አስተማሪ" : "Instructor"
        })),
        date: "2026-11-14"
      }), V = new Blob([f], { type: "text/plain;charset=us-ascii" }), R = URL.createObjectURL(V), ee = document.createElement("a");
      ee.href = R, ee.download = `lesson-transcript.${this.activeLocale}.brf`, document.body.appendChild(ee), ee.click(), document.body.removeChild(ee), URL.revokeObjectURL(R);
    });
    let fe = !1;
    const me = this.shadow.getElementById("btn-chat-questions-filter");
    me == null || me.addEventListener("click", () => {
      fe = !fe, me.setAttribute("aria-pressed", fe ? "true" : "false"), me.classList.toggle("active", fe), this.liveChatViewer && this.liveChatViewer.setQuestionsOnly(fe);
    });
    const re = this.shadow.getElementById("dialog-shortcuts"), pe = this.shadow.getElementById("btn-shortcuts"), he = this.shadow.getElementById("btn-close-shortcuts"), Ce = this.shadow.getElementById("btn-ok-shortcuts"), be = (r) => {
      const p = r !== void 0 ? r : (re == null ? void 0 : re.style.display) === "none";
      re && (re.style.display = p ? "flex" : "none"), p ? he == null || he.focus() : pe == null || pe.focus();
    };
    pe == null || pe.addEventListener("click", () => be(!0)), he == null || he.addEventListener("click", () => be(!1)), Ce == null || Ce.addEventListener("click", () => be(!1)), this.shadow.querySelectorAll(".btn-preset-pill").forEach((r) => {
      r.addEventListener("click", () => {
        const p = r.getAttribute("data-preset");
        if (p) {
          this.prefs.captionTheme = p;
          const f = this.shadow.getElementById("select-cc-theme");
          f && (f.value = p), S({ captionTheme: p }), this.updateCaptionDisplay();
        }
      });
    });
    const De = this.shadow.getElementById("player-container");
    De == null || De.addEventListener("keydown", (r) => {
      if (this.isQualityMenuOpen) {
        r.key === "Escape" && ($(), m == null || m.focus());
        return;
      }
      if (this.isPreferencesOpen) {
        r.key === "Escape" && de();
        return;
      }
      if (re && re.style.display === "flex") {
        r.key === "Escape" && be(!1);
        return;
      }
      if (!(r.target.tagName === "INPUT" || r.target.tagName === "SELECT"))
        switch (r.key) {
          case " ":
          case "k":
          case "K":
            r.preventDefault(), y();
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
            r.preventDefault(), le();
            break;
          case "f":
          case "F":
            r.preventDefault(), ne();
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
            r.preventDefault(), d == null || d.click();
            break;
          case "c":
          case "C":
            r.preventDefault(), B == null || B.click();
            break;
          case "s":
          case "S":
            r.preventDefault(), T == null || T.click();
            break;
          case "d":
          case "D":
            r.preventDefault(), C == null || C.click();
            break;
          case "t":
          case "T":
            r.preventDefault(), D == null || D.click();
            break;
          case "?":
          case "/":
            r.preventDefault(), be();
            break;
          case "Escape":
            oe() && (r.preventDefault(), ne());
            break;
        }
    });
  }
  updateLocaleStrings() {
    this.render(), this.initTracksAndTranscript(), this.liveChatViewer && (this.liveChatViewer.setLocale(this.activeLocale), this.liveChatViewer.setMessages(this.liveChatMessages));
  }
  formatTime(e) {
    const a = Math.floor(e / 60), t = Math.floor(e % 60);
    return `${a.toString().padStart(2, "0")}:${t.toString().padStart(2, "0")}`;
  }
}
customElements.get("a11y-media-player") || customElements.define("a11y-media-player", Ge);
if (!customElements.get("db-player")) {
  class h extends Ge {
  }
  customElements.define("db-player", h);
}
const ct = [
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
function dt(h) {
  const i = typeof h == "string" ? new Date(h) : h, e = i.getUTCFullYear(), a = i.getUTCMonth() + 1, t = i.getUTCDate(), s = Math.floor((14 - a) / 12), o = e + 4800 - s, d = a + 12 * s - 3, l = t + Math.floor((153 * d + 2) / 5) + 365 * o + Math.floor(o / 4) - Math.floor(o / 100) + Math.floor(o / 400) - 32045, c = (l - 1723856) % 1461, g = c % 365 + 365 * Math.floor(c / 1460), n = 4 * Math.floor((l - 1723856) / 1461) + Math.floor(c / 365) - Math.floor(c / 1460), k = Math.floor(g / 30) + 1, M = g % 30 + 1, x = ct[Math.min(k - 1, 12)];
  return {
    year: n,
    month: k,
    day: M,
    monthNameAmharic: x
  };
}
function pt(h) {
  const i = dt(h), e = `${i.monthNameAmharic} ${i.day}፣ ${i.year} ዓ.ም`;
  return {
    iso: h,
    ethiopic: e,
    display: `${h} (${e})`
  };
}
class ht extends HTMLElement {
  constructor() {
    super();
    u(this, "shadow");
    u(this, "job", null);
    u(this, "activeLocale", "en");
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
  attributeChangedCallback(e, a, t) {
    if (a !== t) {
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
    const e = this.activeLocale === "am", a = this.job.title[this.activeLocale] || this.job.title.en, t = this.job.location[this.activeLocale] || this.job.location.en, s = this.job.description[this.activeLocale] || this.job.description.en, o = this.job.applicationDeadline ? pt(this.job.applicationDeadline) : null, d = {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      title: a,
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
          <h4 id="job-title-${this.job.id}">${a}</h4>
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

        <p>${s}</p>

        <!-- Transparent Accommodations -->
        <div>
          <strong id="acc-heading-${this.job.id}">${e ? "የተረጋገጡ ማመቻቸቶች (Accommodations Offered):" : "Employer-Provided Accommodations:"}</strong>
          <ul class="tags-list" aria-labelledby="acc-heading-${this.job.id}">
            ${this.job.accommodations.map(
      (l) => `
              <li class="badge accommodation">
                <span aria-hidden="true">✓</span>
                <span>${l.label[this.activeLocale] || l.label.en}</span>
                <small style="opacity: 0.85;">(${l.source})</small>
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
    const e = this.shadow.getElementById("btn-share-cert"), a = this.shadow.getElementById("share-feedback");
    !e || !a || e.addEventListener("click", async () => {
      const t = `${window.location.origin}/verify.html?certId=CERT-DB-2026-0042`;
      if (navigator.share)
        try {
          await navigator.share({
            title: "Demonstrated Certificate — Savanna Platform",
            text: "Verified Certificate for Digital Workplace Skills: Foundations",
            url: t
          }), a.textContent = this.activeLocale === "am" ? "ተጋርቷል!" : "Link shared!";
          return;
        } catch {
        }
      try {
        await navigator.clipboard.writeText(t), a.textContent = this.activeLocale === "am" ? "የምስክር ወረቀት አገናኝ ተገልብጧል!" : "Certificate link copied to clipboard!";
      } catch {
        a.textContent = t;
      }
    });
  }
}
customElements.get("a11y-job-card") || customElements.define("a11y-job-card", ht);
const ut = "abugida-media", gt = 1;
class ft {
  constructor() {
    u(this, "db", null);
    u(this, "cacheName", "abugida-offline-v1");
  }
  async init() {
    if (!this.db)
      return new Promise((i, e) => {
        const a = indexedDB.open(ut, gt);
        a.onupgradeneeded = (t) => {
          const s = t.target.result;
          s.objectStoreNames.contains("preferences") || s.createObjectStore("preferences"), s.objectStoreNames.contains("progress") || s.createObjectStore("progress", { keyPath: "lessonId" }), s.objectStoreNames.contains("packages") || s.createObjectStore("packages", { keyPath: "packageKey" });
        }, a.onsuccess = (t) => {
          this.db = t.target.result, i();
        }, a.onerror = () => {
          console.warn("IndexedDB unavailable, falling back to memory/localStorage"), i();
        };
      });
  }
  // --- Progress Tracking (Local-first) ---
  async saveProgress(i) {
    if (await this.init(), !this.db) {
      try {
        localStorage.setItem(`progress_${i.lessonId}`, JSON.stringify(i));
      } catch {
      }
      return;
    }
    return new Promise((e) => {
      const a = this.db.transaction("progress", "readwrite");
      a.objectStore("progress").put(i), a.oncomplete = () => e(), a.onerror = () => e();
    });
  }
  async getProgress(i) {
    if (await this.init(), !this.db)
      try {
        const e = localStorage.getItem(`progress_${i}`);
        return e ? JSON.parse(e) : null;
      } catch {
        return null;
      }
    return new Promise((e) => {
      const s = this.db.transaction("progress", "readonly").objectStore("progress").get(i);
      s.onsuccess = () => e(s.result || null), s.onerror = () => e(null);
    });
  }
  // --- 3G Offline Package Download Engine ---
  async downloadPackage(i, e, a, t, s) {
    await this.init();
    const o = `${i}:${e}`;
    if (!("caches" in window))
      throw new Error("Cache Storage API is not supported in this browser.");
    try {
      const d = await caches.open(this.cacheName);
      let l = 0;
      const c = t.length;
      for (const g of t) {
        const n = await fetch(g);
        if (!n.ok)
          throw new Error(`Failed to fetch asset: ${g} (${n.status})`);
        await d.put(g, n.clone()), l++;
        const k = Math.round(l / c * 100);
        s(k, l, c);
      }
      return await this.savePackageRecord({
        packageKey: o,
        lessonId: i,
        packageId: e,
        packageName: a,
        status: "ready",
        totalBytes: 32e5,
        downloadedBytes: 32e5,
        timestamp: Date.now()
      }), !0;
    } catch (d) {
      throw await this.savePackageRecord({
        packageKey: o,
        lessonId: i,
        packageId: e,
        packageName: a,
        status: "error",
        totalBytes: 32e5,
        downloadedBytes: 0,
        timestamp: Date.now(),
        error: d instanceof Error ? d.message : "Download failed"
      }), d;
    }
  }
  async isPackageReady(i, e) {
    await this.init();
    const a = `${i}:${e}`, t = await this.getPackageRecord(a);
    return (t == null ? void 0 : t.status) === "ready";
  }
  async savePackageRecord(i) {
    if (this.db)
      return new Promise((e) => {
        const a = this.db.transaction("packages", "readwrite");
        a.objectStore("packages").put(i), a.oncomplete = () => e(), a.onerror = () => e();
      });
  }
  async getPackageRecord(i) {
    return this.db ? new Promise((e) => {
      const s = this.db.transaction("packages", "readonly").objectStore("packages").get(i);
      s.onsuccess = () => e(s.result || null), s.onerror = () => e(null);
    }) : null;
  }
}
const yt = new ft(), wt = [
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
], Ve = {
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
function xt(h, i) {
  return (Ve[i] || Ve.en)[h] || Ve.en[h] || h;
}
export {
  ht as A11yJobCard,
  Ge as A11yMediaPlayer,
  ot as BRAILLE_ASCII_TABLE,
  z as DEFAULT_PREFERENCES,
  _e as ETHIOPIC_BRAILLE_MAP,
  ct as ETHIOPIC_MONTHS,
  rt as LiveChatViewer,
  at as MediaSyncController,
  ft as OfflineStorageManager,
  wt as SUPPORTED_LANGUAGES,
  st as TranscriptViewer,
  Ve as UI_TRANSLATIONS,
  We as UNICODE_BRAILLE_MAP,
  pt as formatDualDate,
  lt as generateBRFDocument,
  it as getThemeStyles,
  xt as getTranslation,
  ze as loadPreferences,
  yt as offlineStorage,
  Ne as parseVTT,
  tt as resetPreferences,
  S as savePreferences,
  nt as toAsciiBraille,
  dt as toEthiopianDate,
  Ue as toUnicodeBraille,
  Fe as wrapBrailleLines
};
//# sourceMappingURL=a11y-media-kit.es.js.map
