import { LessonManifest } from "@abugida/lesson-schema";

export class A11yMediaPlayer extends HTMLElement {
  static get observedAttributes() {
    return ["manifest-src", "locale"];
  }

  private shadow: ShadowRoot;
  private manifest: LessonManifest | null = null;
  private activeLocale: "en" | "am" = "en";

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.activeLocale = (this.getAttribute("locale") as "en" | "am") || "en";
    const manifestSrc = this.getAttribute("manifest-src");
    if (manifestSrc) {
      this.loadManifest(manifestSrc);
    } else {
      this.render();
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      if (name === "locale") {
        this.activeLocale = (newValue as "en" | "am") || "en";
        this.render();
      } else if (name === "manifest-src") {
        this.loadManifest(newValue);
      }
    }
  }

  private async loadManifest(src: string) {
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      this.manifest = await res.json();
      this.render();
    } catch (err) {
      this.renderError(err instanceof Error ? err.message : "Failed to load manifest");
    }
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

  private render() {
    const isAm = this.activeLocale === "am";
    const title = this.manifest ? this.manifest.title[this.activeLocale] : "Media Player";

    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          max-width: 100%;
          font-family: var(--font-body, system-ui, sans-serif);
          color: var(--color-ink, #14201B);
        }
        .player-container {
          background: #000;
          border-radius: 8px;
          position: relative;
          overflow: hidden;
          outline: none;
        }
        .player-container:focus-visible {
          outline: 3px solid #005FCC;
          outline-offset: 2px;
        }
        video {
          width: 100%;
          height: auto;
          display: block;
        }
        .esl-window {
          position: absolute;
          bottom: 70px;
          right: 16px;
          width: 25%;
          aspect-ratio: 16/9;
          background: #222;
          border: 2px solid #fff;
          border-radius: 4px;
          overflow: hidden;
          z-index: 10;
        }
        .controls-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: #14201B;
          color: #FFF;
        }
        button {
          background: #2A3B32;
          color: #FFF;
          border: 1px solid #52615A;
          border-radius: 4px;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          cursor: pointer;
          min-height: 44px;
          min-width: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        button:focus-visible {
          outline: 3px solid #F2C14E;
          outline-offset: 2px;
        }
        button:hover {
          background: #0B5D4E;
        }
        .time-display {
          font-size: 0.875rem;
          font-variant-numeric: tabular-nums;
          padding: 0 0.5rem;
        }
        .transcript-region {
          margin-top: 1.5rem;
          padding: 1rem;
          background: #FFF;
          border: 1px solid #B7C2BB;
          border-radius: 8px;
        }
      </style>

      <section class="player-wrapper" aria-label="${title}">
        <div class="player-container" tabindex="0">
          <video id="main-video" playsinline preload="metadata">
            ${
              this.manifest?.sources
                .filter((s) => s.kind === "main")
                .map((s) => `<source src="${s.src}" type="${s.type}">`)
                .join("") || ""
            }
            ${
              this.manifest?.captionTracks
                .map(
                  (c) =>
                    `<track kind="subtitles" src="${c.src}" srclang="${c.language}" label="${c.label}" ${
                      c.language === this.activeLocale ? "default" : ""
                    }>`
                )
                .join("") || ""
            }
          </video>

          <div class="esl-window" id="esl-box" aria-label="${isAm ? "የኢትዮጵያ የምልክት ቋንቋ መስኮት" : "Ethiopian Sign Language Window"}">
            <video id="sign-video" muted playsinline preload="metadata">
              ${
                this.manifest?.sources
                  .filter((s) => s.kind === "sign")
                  .map((s) => `<source src="${s.src}" type="${s.type}">`)
                  .join("") || ""
              }
            </video>
          </div>
        </div>

        <nav class="controls-toolbar" aria-label="${isAm ? "የቪዲዮ መቆጣጠሪያዎች" : "Playback Controls"}">
          <button id="btn-play" aria-label="${isAm ? "አጫውት / አቁም" : "Play / Pause"}">
            <span aria-hidden="true">▶</span> ${isAm ? "አጫውት" : "Play"}
          </button>
          <button id="btn-ad" aria-pressed="false" aria-label="${isAm ? "የድምጽ ማብራሪያ" : "Audio Description"}">
            AD
          </button>
          <button id="btn-cc" aria-expanded="false" aria-label="${isAm ? "የትርጉም ጽሑፍ" : "Captions"}">
            CC
          </button>
          <button id="btn-esl" aria-pressed="true" aria-label="${isAm ? "የምልክት ቋንቋ" : "Sign Language"}">
            EthSL
          </button>
          <span class="time-display" id="time-text">0:00 / 0:00</span>
        </nav>

        <section class="transcript-region" aria-label="${isAm ? "የጽሑፍ ግልባጭ" : "Synchronized Transcript"}">
          <h3>${isAm ? "የጽሑፍ ግልባጭ" : "Lesson Transcript"}</h3>
          <p id="transcript-body">${isAm ? "የጽሑፉ ግልባጭ እዚህ ይታያል..." : "Interactive transcript content will load here..."}</p>
        </section>
      </section>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners() {
    const playBtn = this.shadow.getElementById("btn-play");
    const video = this.shadow.getElementById("main-video") as HTMLVideoElement;
    const signVideo = this.shadow.getElementById("sign-video") as HTMLVideoElement;

    if (playBtn && video) {
      playBtn.addEventListener("click", () => {
        if (video.paused) {
          video.play();
          if (signVideo) signVideo.play();
          playBtn.innerHTML = `<span aria-hidden="true">⏸</span> ${this.activeLocale === "am" ? "አቁም" : "Pause"}`;
        } else {
          video.pause();
          if (signVideo) signVideo.pause();
          playBtn.innerHTML = `<span aria-hidden="true">▶</span> ${this.activeLocale === "am" ? "አጫውት" : "Play"}`;
        }
      });
    }

    const eslBtn = this.shadow.getElementById("btn-esl");
    const eslBox = this.shadow.getElementById("esl-box");
    if (eslBtn && eslBox) {
      eslBtn.addEventListener("click", () => {
        const isHidden = eslBox.style.display === "none";
        eslBox.style.display = isHidden ? "block" : "none";
        eslBtn.setAttribute("aria-pressed", isHidden ? "true" : "false");
      });
    }
  }
}

if (!customElements.get("a11y-media-player")) {
  customElements.define("a11y-media-player", A11yMediaPlayer);
}
