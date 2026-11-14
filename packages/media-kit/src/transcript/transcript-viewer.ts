export interface TranscriptSegmentData {
  id: string | number;
  start: number; // in seconds
  end: number;   // in seconds
  speaker?: string;
  text: string;
  visualDescription?: string;
}

export class TranscriptViewer {
  private segments: TranscriptSegmentData[] = [];
  private container: HTMLElement;
  private onSeek: (time: number) => void;
  private currentActiveId: string | number | null = null;
  private searchQuery = "";

  constructor(container: HTMLElement, onSeek: (time: number) => void) {
    this.container = container;
    this.onSeek = onSeek;
  }

  setSegments(segments: TranscriptSegmentData[]) {
    this.segments = segments;
    this.render();
  }

  setSearchQuery(query: string) {
    this.searchQuery = query.toLowerCase().trim();
    this.render();
  }

  updateActiveTime(currentTime: number) {
    const active = this.segments.find((s) => currentTime >= s.start && currentTime <= s.end);
    if (active && active.id !== this.currentActiveId) {
      this.currentActiveId = active.id;
      this.highlightSegment(active.id);
    }
  }

  private highlightSegment(activeId: string | number) {
    const prev = this.container.querySelector(".transcript-item.active");
    if (prev) prev.classList.remove("active");

    const current = this.container.querySelector(`[data-segment-id="${activeId}"]`);
    if (current) {
      current.classList.add("active");
    }
  }

  private formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  render() {
    const filtered = this.searchQuery
      ? this.segments.filter((s) => s.text.toLowerCase().includes(this.searchQuery))
      : this.segments;

    if (filtered.length === 0) {
      this.container.innerHTML = `<p class="empty-msg">No transcript segments match your search.</p>`;
      return;
    }

    this.container.innerHTML = `
      <ul class="transcript-list" role="list">
        ${filtered
          .map((s) => {
            const timeStr = this.formatTime(s.start);
            return `
            <li class="transcript-item ${s.id === this.currentActiveId ? "active" : ""}" data-segment-id="${s.id}">
              <button 
                type="button" 
                class="btn-seek-time" 
                data-time="${s.start}" 
                aria-label="Play from ${timeStr}">
                ${timeStr}
              </button>
              <div class="segment-content">
                ${s.speaker ? `<strong class="speaker-label">${s.speaker}:</strong>` : ""}
                <span class="segment-text">${this.escapeHtml(s.text)}</span>
                ${
                  s.visualDescription
                    ? `<div class="visual-desc" aria-label="Visual Description: ${this.escapeHtml(s.visualDescription)}">
                        <em>[Visual: ${this.escapeHtml(s.visualDescription)}]</em>
                       </div>`
                    : ""
                }
              </div>
            </li>
          `;
          })
          .join("")}
      </ul>
    `;

    this.container.querySelectorAll(".btn-seek-time").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const time = parseFloat((e.currentTarget as HTMLElement).dataset.time || "0");
        this.onSeek(time);
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
