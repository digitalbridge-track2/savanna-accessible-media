import { SupportedLocale } from "../localization/locales.js";

export interface TranscriptSegmentData {
  id: string | number;
  start: number; // in seconds
  end: number;   // in seconds
  speaker?: string;
  text: string;
  visualDescription?: string;
}

export interface TranscriptViewerOptions {
  locale?: string;
  onSeekAndPlay: (time: number) => void;
  onFollowChange?: (isFollowing: boolean) => void;
}

interface TranscriptTexts {
  followActive: string;
  followActiveAria: string;
  followResume: string;
  followResumeAria: string;
  noMatch: string;
  cuesListAria: string;
  playFrom: (timeStr: string) => string;
  visualDesc: string;
  visual: string;
}

const TRANSCRIPT_TEXTS: Record<SupportedLocale, TranscriptTexts> = {
  en: {
    followActive: "✓ Follow Playback",
    followActiveAria: "Follow playback active (Click to pause auto-scroll)",
    followResume: "↻ Resume Following",
    followResumeAria: "Following paused (Click to resume auto-scroll)",
    noMatch: "No transcript segments match your search.",
    cuesListAria: "Transcript cues",
    playFrom: (t) => `Play from ${t}`,
    visualDesc: "Visual Description",
    visual: "Visual",
  },
  am: {
    followActive: "✓ በተከታታይ አንብብ",
    followActiveAria: "የጽሑፍ ግልባጭ ተከታትሎ ማንበብ በርቷል",
    followResume: "↻ ተከታትሎ ማንበብ ቀጥል",
    followResumeAria: "ተከታትሎ ማንበብ ቆሟል፤ እንደገና ለማስጀመር ይጫኑ",
    noMatch: "ምንም የሚዛመድ የጽሑፍ ግልባጭ አልተገኘም።",
    cuesListAria: "የጽሑፍ ግልባጭ ዝርዝር",
    playFrom: (t) => `ከ ${t} ጀምሮ አጫውት`,
    visualDesc: "ምስላዊ ማብራሪያ",
    visual: "ምስላዊ",
  },
  om: {
    followActive: "✓ Hordofii Taphisiisaa",
    followActiveAria: "Hordofiin taphisiisaa banaadha (Isku-sochoosiinsa dhaabuuf cuqaasaa)",
    followResume: "↻ Hordofii Itti Fufi",
    followResumeAria: "Hordofiin dhaabbateera; deebisanii jalqabsiisuuf cuqaasaa",
    noMatch: "Kutaaleen barreeffama sagalee barbaaddan hin argamne.",
    cuesListAria: "Tarree kutaalee barreeffama sagalee",
    playFrom: (t) => `Yeroo ${t} irraa taphisiisi`,
    visualDesc: "Ibsa Mul'ataa",
    visual: "Mul'ata",
  },
  ti: {
    followActive: "✓ ተኸታቲልካ ኣንብብ",
    followActiveAria: "ናይ ጽሑፍ ትሕዝቶ ተኸታቲልካ ምንባብ በርሁ ኣሎ",
    followResume: "↻ ምኽታል ቀጽል",
    followResumeAria: "ተኸታቲልካ ምንባብ ቆይሙ ኣሎ፤ ንምጅማር ጠውቑ",
    noMatch: "ዝኾነ ዝሰማማዕ ናይ ጽሑፍ ትሕዝቶ ኣይተረኽበን።",
    cuesListAria: "ዝርዝር ናይ ጽሑፍ ትሕዝቶ",
    playFrom: (t) => `ካብ ${t} ጀሚርካ ኣጻውት`,
    visualDesc: "ምስላዊ መብርሂ",
    visual: "ምስላዊ",
  },
  so: {
    followActive: "✓ Raac Akhriska",
    followActiveAria: "Raacitaanka akhrisku wuu shaqaynayaa",
    followResume: "↻ Dib u bilow Raacitaanka",
    followResumeAria: "Raacitaanku wuu hakaday; riix si aad dib ugu bilowdo",
    noMatch: "Ma jiraan qaybo qoraal ah oo u dhigma raadintaada.",
    cuesListAria: "Liiska qoraalka",
    playFrom: (t) => `Ka daar ${t}`,
    visualDesc: "Sharaxaadda Muuqaalka",
    visual: "Muuqaal",
  },
};

export class TranscriptViewer {
  private segments: TranscriptSegmentData[] = [];
  private container: HTMLElement;
  private onSeekAndPlay: (time: number) => void;
  private onFollowChange?: (isFollowing: boolean) => void;
  private currentActiveId: string | number | null = null;
  private searchQuery = "";
  private isFollowing = true;
  private userPausedFollowing = false;
  private locale: string = "en";
  private listElement: HTMLElement | null = null;
  private followBtn: HTMLButtonElement | null = null;
  private statusElement: HTMLElement | null = null;

  constructor(container: HTMLElement, options: TranscriptViewerOptions) {
    this.container = container;
    this.onSeekAndPlay = options.onSeekAndPlay;
    this.onFollowChange = options.onFollowChange;
    this.locale = options.locale || "en";
  }

  setLocale(locale: string) {
    if (this.locale !== locale) {
      this.locale = locale;
      this.render();
    }
  }

  setSegments(segments: TranscriptSegmentData[]) {
    // Ensure all timestamps are numbers in seconds and sorted
    this.segments = segments
      .map((s) => ({
        ...s,
        start: Number(s.start) || 0,
        end: Number(s.end) || 0,
      }))
      .sort((a, b) => a.start - b.start);

    this.render();
  }

  getSegments(): TranscriptSegmentData[] {
    return [...this.segments];
  }

  setSearchQuery(query: string) {
    this.searchQuery = query.toLowerCase().trim();
    this.render();
  }

  public getActiveSegment(currentTime: number): TranscriptSegmentData | null {
    if (!this.segments.length) return null;
    return this.segments.find((s) => currentTime >= s.start && currentTime < s.end) || null;
  }

  updateActiveTime(currentTime: number) {
    const active = this.getActiveSegment(currentTime);
    const activeId = active ? active.id : null;

    if (activeId !== this.currentActiveId) {
      this.currentActiveId = activeId;
      this.highlightSegment(activeId);

      if (this.isFollowing && activeId !== null) {
        this.scrollToActiveCue(activeId);
      }
    }
  }

  private highlightSegment(activeId: string | number | null) {
    if (!this.container) return;

    const prev = this.container.querySelector(".transcript-item.active");
    if (prev) {
      prev.classList.remove("active");
    }

    if (activeId !== null) {
      const current = this.container.querySelector(`[data-segment-id="${activeId}"]`);
      if (current) {
        current.classList.add("active");
      }
    }
  }

  private scrollToActiveCue(activeId: string | number) {
    if (!this.listElement) return;

    const activeEl = this.listElement.querySelector(`[data-segment-id="${activeId}"]`) as HTMLElement;
    if (!activeEl) return;

    // Scroll ONLY the transcript container, never window / outer document
    const containerTop = this.listElement.scrollTop;
    const containerHeight = this.listElement.clientHeight;
    const elTop = activeEl.offsetTop;
    const elHeight = activeEl.clientHeight;

    const targetScroll = elTop - containerHeight / 2 + elHeight / 2;

    this.listElement.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: "smooth",
    });
  }

  public setFollowing(following: boolean) {
    this.setFollowingState(following, true);
  }

  private setFollowingState(following: boolean, triggeredByUser = false) {
    this.isFollowing = following;
    if (triggeredByUser) {
      this.userPausedFollowing = !following;
    }
    this.onFollowChange?.(following);

    if (this.followBtn) {
      this.followBtn.setAttribute("aria-pressed", following ? "true" : "false");
      const t = TRANSCRIPT_TEXTS[this.locale as SupportedLocale] || TRANSCRIPT_TEXTS.en;
      if (following) {
        this.followBtn.textContent = t.followActive;
        this.followBtn.setAttribute("aria-label", t.followActiveAria);
      } else {
        this.followBtn.textContent = t.followResume;
        this.followBtn.setAttribute("aria-label", t.followResumeAria);
      }
    }

    if (following && this.currentActiveId !== null) {
      this.scrollToActiveCue(this.currentActiveId);
    }
  }

  private formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  render() {
    const t = TRANSCRIPT_TEXTS[this.locale as SupportedLocale] || TRANSCRIPT_TEXTS.en;

    const filtered = this.searchQuery
      ? this.segments.filter(
          (s) =>
            s.text.toLowerCase().includes(this.searchQuery) ||
            (s.speaker && s.speaker.toLowerCase().includes(this.searchQuery)) ||
            (s.visualDescription && s.visualDescription.toLowerCase().includes(this.searchQuery))
        )
      : this.segments;

    this.container.innerHTML = `
      <div class="transcript-controls-row">
        <button 
          type="button" 
          id="btn-toggle-follow" 
          class="btn-follow ${this.isFollowing ? "active" : ""}" 
          aria-pressed="${this.isFollowing ? "true" : "false"}"
          aria-label="${this.isFollowing ? t.followActiveAria : t.followResumeAria}">
          ${this.isFollowing ? t.followActive : t.followResume}
        </button>
      </div>

      ${
        filtered.length === 0
          ? `<p class="empty-msg" role="status">
              ${t.noMatch}
            </p>`
          : `
          <ul class="transcript-list" role="list" id="transcript-list-box" tabindex="0" aria-label="${t.cuesListAria}">
            ${filtered
              .map((s) => {
                const timeStr = this.formatTime(s.start);
                const isActive = s.id === this.currentActiveId;
                const playLabel = t.playFrom(timeStr);

                return `
                <li class="transcript-item ${isActive ? "active" : ""}" data-segment-id="${s.id}">
                  <button 
                    type="button" 
                    class="btn-seek-time" 
                    data-time="${s.start}" 
                    aria-label="${playLabel}">
                    ${timeStr}
                  </button>
                  <div class="segment-content">
                    ${s.speaker ? `<strong class="speaker-label">${this.escapeHtml(s.speaker)}:</strong>` : ""}
                    <span class="segment-text">${this.escapeHtml(s.text)}</span>
                    ${
                      s.visualDescription
                        ? `<div class="visual-desc" aria-label="${t.visualDesc}: ${this.escapeHtml(s.visualDescription)}">
                            <em>[${t.visual}: ${this.escapeHtml(s.visualDescription)}]</em>
                           </div>`
                        : ""
                    }
                  </div>
                </li>
              `;
              })
              .join("")}
          </ul>
        `
      }
    `;

    this.listElement = this.container.querySelector("#transcript-list-box");
    this.followBtn = this.container.querySelector("#btn-toggle-follow");

    // Toggle follow button click
    this.followBtn?.addEventListener("click", () => {
      this.setFollowingState(!this.isFollowing, true);
    });

    // Detect manual scrolling on transcript list to avoid fighting the user
    if (this.listElement) {
      const handleUserScroll = () => {
        if (this.isFollowing) {
          // Pause auto-following immediately without moving focus
          this.setFollowingState(false, true);
        }
      };

      this.listElement.addEventListener("wheel", handleUserScroll, { passive: true });
      this.listElement.addEventListener("touchmove", handleUserScroll, { passive: true });
      this.listElement.addEventListener("keydown", (e) => {
        if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(e.key)) {
          handleUserScroll();
        }
      });
    }

    // Seek buttons click
    this.container.querySelectorAll(".btn-seek-time").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const time = parseFloat((e.currentTarget as HTMLElement).dataset.time || "0");
        this.onSeekAndPlay(time);
        // Explicitly keep keyboard focus on the activated button
        (e.currentTarget as HTMLElement).focus();
      });
    });
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
