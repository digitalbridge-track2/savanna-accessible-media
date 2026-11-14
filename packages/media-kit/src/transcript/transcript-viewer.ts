export interface TranscriptSegmentData {
  id: string | number;
  start: number; // in seconds
  end: number;   // in seconds
  speaker?: string;
  text: string;
  visualDescription?: string;
}

export interface TranscriptViewerOptions {
  locale?: "en" | "am";
  onSeekAndPlay: (time: number) => void;
  onFollowChange?: (isFollowing: boolean) => void;
}

export class TranscriptViewer {
  private segments: TranscriptSegmentData[] = [];
  private container: HTMLElement;
  private onSeekAndPlay: (time: number) => void;
  private onFollowChange?: (isFollowing: boolean) => void;
  private currentActiveId: string | number | null = null;
  private searchQuery = "";
  private isFollowing = true;
  private userPausedFollowing = false;
  private locale: "en" | "am" = "en";
  private listElement: HTMLElement | null = null;
  private followBtn: HTMLButtonElement | null = null;
  private statusElement: HTMLElement | null = null;

  constructor(container: HTMLElement, options: TranscriptViewerOptions) {
    this.container = container;
    this.onSeekAndPlay = options.onSeekAndPlay;
    this.onFollowChange = options.onFollowChange;
    this.locale = options.locale || "en";
  }

  setLocale(locale: "en" | "am") {
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
      const isAm = this.locale === "am";
      if (following) {
        this.followBtn.textContent = isAm ? "✓ በተከታታይ አንብብ" : "✓ Follow Playback";
        this.followBtn.setAttribute(
          "aria-label",
          isAm ? "የጽሑፍ ግልባጭ ተከታትሎ ማንበብ በርቷል" : "Follow playback active (Click to pause auto-scroll)"
        );
      } else {
        this.followBtn.textContent = isAm ? "↻ ተከታትሎ ማንበብ ቀጥል" : "↻ Resume Following";
        this.followBtn.setAttribute(
          "aria-label",
          isAm ? "ተከታትሎ ማንበብ ቆሟል፤ እንደገና ለማስጀመር ይጫኑ" : "Following paused (Click to resume auto-scroll)"
        );
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
    const isAm = this.locale === "am";

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
          aria-label="${
            this.isFollowing
              ? isAm
                ? "የጽሑፍ ግልባጭ ተከታትሎ ማንበብ በርቷል"
                : "Follow playback active (Click to pause auto-scroll)"
              : isAm
              ? "ተከታትሎ ማንበብ ቆሟል፤ እንደገና ለማስጀመር ይጫኑ"
              : "Following paused (Click to resume auto-scroll)"
          }">
          ${
            this.isFollowing
              ? isAm
                ? "✓ በተከታታይ አንብብ"
                : "✓ Follow Playback"
              : isAm
              ? "↻ ተከታትሎ ማንበብ ቀጥል"
              : "↻ Resume Following"
          }
        </button>
      </div>

      ${
        filtered.length === 0
          ? `<p class="empty-msg" role="status">
              ${isAm ? "ምንም የሚዛመድ የጽሑፍ ግልባጭ አልተገኘም።" : "No transcript segments match your search."}
            </p>`
          : `
          <ul class="transcript-list" role="list" id="transcript-list-box" tabindex="0" aria-label="${isAm ? "የጽሑፍ ግልባጭ ዝርዝር" : "Transcript cues"}">
            ${filtered
              .map((s) => {
                const timeStr = this.formatTime(s.start);
                const isActive = s.id === this.currentActiveId;
                const playLabel = isAm
                  ? `ከ ${timeStr} ጀምሮ አጫውት`
                  : `Play from ${timeStr}`;

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
                        ? `<div class="visual-desc" aria-label="${isAm ? "ምስላዊ ማብራሪያ" : "Visual Description"}: ${this.escapeHtml(s.visualDescription)}">
                            <em>[${isAm ? "ምስላዊ" : "Visual"}: ${this.escapeHtml(s.visualDescription)}]</em>
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
