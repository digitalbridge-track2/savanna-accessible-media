export interface LiveChatMessageItem {
  id: string;
  timestamp: number; // in seconds
  timeDisplay: string;
  sender: string;
  role: "instructor" | "student" | "ta";
  message: { en: string; am: string };
}

export interface LiveChatViewerOptions {
  locale?: "en" | "am";
  onSeekAndPlay: (time: number) => void;
}

export class LiveChatViewer {
  private container: HTMLElement;
  private messages: LiveChatMessageItem[] = [];
  private locale: "en" | "am" = "en";
  private onSeekAndPlay: (time: number) => void;
  private currentTime = 0;
  private searchQuery = "";
  private isAutoScroll = true;
  private isQuestionsOnly = false;
  private listElement: HTMLElement | null = null;
  private currentActiveId: string | null = null;

  constructor(container: HTMLElement, options: LiveChatViewerOptions) {
    this.container = container;
    this.locale = options.locale || "en";
    this.onSeekAndPlay = options.onSeekAndPlay;
  }

  setLocale(locale: "en" | "am") {
    if (this.locale !== locale) {
      this.locale = locale;
      this.render();
    }
  }

  setMessages(messages: LiveChatMessageItem[]) {
    this.messages = [...messages].sort((a, b) => a.timestamp - b.timestamp);
    this.render();
  }

  setSearchQuery(query: string) {
    this.searchQuery = query.toLowerCase().trim();
    this.render();
  }

  setQuestionsOnly(enabled: boolean) {
    if (this.isQuestionsOnly !== enabled) {
      this.isQuestionsOnly = enabled;
      this.render();
    }
  }

  setAutoScroll(enabled: boolean) {
    this.isAutoScroll = enabled;
  }

  updateTime(currentTime: number) {
    this.currentTime = currentTime;
    
    // Find latest message delivered at or before currentTime
    const delivered = this.messages.filter((m) => m.timestamp <= currentTime);
    const latest = delivered.length > 0 ? delivered[delivered.length - 1] : null;
    const latestId = latest ? latest.id : null;

    if (latestId !== this.currentActiveId) {
      this.currentActiveId = latestId;
      this.updateActiveStyles();
      if (this.isAutoScroll && latestId) {
        this.scrollToMessage(latestId);
      }
    }
  }

  private updateActiveStyles() {
    if (!this.container) return;
    const all = this.container.querySelectorAll(".chat-replay-item");
    all.forEach((el) => {
      const elId = el.getAttribute("data-chat-id");
      const msgTime = Number(el.getAttribute("data-timestamp") || "0");
      if (msgTime <= this.currentTime) {
        el.classList.add("is-delivered");
        el.classList.remove("is-future");
      } else {
        el.classList.remove("is-delivered");
        el.classList.add("is-future");
      }

      if (elId === this.currentActiveId) {
        el.classList.add("is-active-latest");
      } else {
        el.classList.remove("is-active-latest");
      }
    });
  }

  private scrollToMessage(id: string) {
    if (!this.listElement) return;
    const el = this.listElement.querySelector(`[data-chat-id="${id}"]`) as HTMLElement;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  render() {
    const isAm = this.locale === "am";

    if (!this.messages.length) {
      this.container.innerHTML = `
        <div class="chat-empty-state" role="status" style="padding: 1.5rem; text-align: center; color: #64748B; font-size: 0.88rem;">
          ${isAm ? "የቀጥታ ውይይት መልዕክቶች አልተገኙም።" : "No live chat messages recorded for this session."}
        </div>
      `;
      return;
    }

    const filtered = this.messages.filter((m) => {
      const isQuestion = m.message.en.includes("?") || m.message.am.includes("?") || m.message.am.includes("፧");
      if (this.isQuestionsOnly && !isQuestion) return false;

      if (!this.searchQuery) return true;
      const text = (isAm ? m.message.am : m.message.en).toLowerCase();
      const sender = m.sender.toLowerCase();
      return text.includes(this.searchQuery) || sender.includes(this.searchQuery);
    });

    this.container.innerHTML = `
      <ol class="chat-replay-list" role="list" aria-label="${isAm ? "የቀጥታ ትምህርት ውይይት መልዕክቶች" : "Recorded live session chat messages"}" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.65rem;">
        ${filtered
          .map((m) => {
            const isDelivered = m.timestamp <= this.currentTime;
            const isLatest = m.id === this.currentActiveId;
            const isInstructor = m.role === "instructor";
            const isTA = m.role === "ta";
            const isQuestion = m.message.en.includes("?") || m.message.am.includes("?") || m.message.am.includes("፧");
            
            const roleLabel = isInstructor
              ? (isAm ? "አስተማሪ" : "Instructor")
              : isTA
              ? (isAm ? "ረዳት" : "TA")
              : (isAm ? "ተማሪ" : "Student");
            
            const roleBg = isInstructor
              ? "rgba(0, 113, 227, 0.12)"
              : isTA
              ? "rgba(16, 185, 129, 0.14)"
              : "var(--color-surface, #F1F5F9)";
            
            const roleColor = isInstructor
              ? "var(--color-brand, #0071E3)"
              : isTA
              ? "#059669"
              : "var(--color-muted-ink, #475569)";

            const borderAccent = isLatest
              ? "var(--color-brand, #0071E3)"
              : isInstructor
              ? "#0071E3"
              : isTA
              ? "#10B981"
              : "var(--color-border, #CBD5E1)";

            const msgContent = isAm ? m.message.am : m.message.en;
            const seekLabel = isAm
              ? `ወደ ${m.timeDisplay} ይዝለሉ እና የ ${m.sender} ጥያቄ ያዳምጡ`
              : `Jump to ${m.timeDisplay} to hear discussion with ${m.sender}`;

            return `
              <li 
                class="chat-replay-item ${isDelivered ? "is-delivered" : "is-future"} ${isLatest ? "is-active-latest" : ""}"
                data-chat-id="${m.id}"
                data-timestamp="${m.timestamp}"
                tabindex="0"
                role="button"
                aria-label="${seekLabel}"
                title="${seekLabel}"
                style="
                  display: flex;
                  flex-direction: column;
                  padding: 0.65rem 0.85rem;
                  border-radius: 6px;
                  background: ${isLatest ? "var(--color-brand-subtle, #EFF6FF)" : "var(--color-surface-elevated, #FFFFFF)"};
                  border: 1px solid var(--color-border-subtle, #E2E8F0);
                  border-left: 3.5px solid ${borderAccent};
                  color: var(--color-ink, inherit);
                  cursor: pointer;
                  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
                  opacity: ${isDelivered ? "1" : "0.55"};
                ">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem; gap: 0.5rem;">
                  <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                    <span style="font-weight: 600; font-size: 0.82rem; color: var(--color-ink, #0F172A);">${m.sender}</span>
                    <span style="
                      font-size: 0.68rem;
                      font-weight: 700;
                      text-transform: uppercase;
                      padding: 1px 6px;
                      border-radius: 4px;
                      background: ${roleBg};
                      color: ${roleColor};
                    ">${roleLabel}</span>
                    ${isQuestion ? `<span style="font-size: 0.68rem; font-weight: 600; background: rgba(217, 119, 6, 0.15); color: #B45309; padding: 1px 5px; border-radius: 4px;">❓ ${isAm ? "ጥያቄ" : "Question"}</span>` : ""}
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
                    ▶ ${m.timeDisplay}
                  </span>
                </div>
                <div style="font-size: 0.85rem; line-height: 1.45; color: var(--color-ink, #334155);">
                  ${msgContent}
                </div>
              </li>
            `;
          })
          .join("")}
      </ol>
    `;

    this.listElement = this.container.querySelector(".chat-replay-list");

    // Add click and keydown seek listeners
    const items = this.container.querySelectorAll(".chat-replay-item");
    items.forEach((item) => {
      const ts = Number(item.getAttribute("data-timestamp") || "0");
      const handleTrigger = () => {
        this.onSeekAndPlay(ts);
      };

      item.addEventListener("click", handleTrigger);
      item.addEventListener("keydown", (e: Event) => {
        const ke = e as KeyboardEvent;
        if (ke.key === "Enter" || ke.key === " ") {
          ke.preventDefault();
          handleTrigger();
        }
      });
    });
  }
}
