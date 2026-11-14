import { AccessibleJob } from "@abugida/lesson-schema";

export class A11yJobCard extends HTMLElement {
  static get observedAttributes() {
    return ["job-data", "locale"];
  }

  private shadow: ShadowRoot;
  private job: AccessibleJob | null = null;
  private activeLocale: "en" | "am" = "en";

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.activeLocale = (this.getAttribute("locale") as "en" | "am") || "en";
    const rawData = this.getAttribute("job-data");
    if (rawData) {
      try {
        this.job = JSON.parse(rawData);
      } catch {
        // Ignored or handled
      }
    }
    this.render();
  }

  setJob(job: AccessibleJob) {
    this.job = job;
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      if (name === "locale") {
        this.activeLocale = (newValue as "en" | "am") || "en";
        this.render();
      } else if (name === "job-data") {
        try {
          this.job = JSON.parse(newValue);
          this.render();
        } catch {
          // Ignored
        }
      }
    }
  }

  private render() {
    if (!this.job) {
      this.shadow.innerHTML = `<div class="job-placeholder">No job data supplied</div>`;
      return;
    }

    const isAm = this.activeLocale === "am";
    const title = this.job.title[this.activeLocale] || this.job.title.en;
    const location = this.job.location[this.activeLocale] || this.job.location.en;
    const description = this.job.description[this.activeLocale] || this.job.description.en;

    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          max-width: 100%;
          font-family: var(--font-body, system-ui, sans-serif);
          color: var(--color-ink, #14201B);
        }
        article.card {
          background: var(--color-surface, #FFFFFF);
          border: 1px solid var(--color-border, #B7C2BB);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-sizing: border-box;
        }
        header h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          color: var(--color-brand, #0B5D4E);
        }
        .meta-line {
          font-size: 0.95rem;
          color: var(--color-muted-ink, #52615A);
          margin-bottom: 1rem;
        }
        .audio-summary-block {
          background: #F7F8F5;
          padding: 0.75rem;
          border-radius: 6px;
          margin: 1rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        audio {
          width: 100%;
          min-height: 44px;
        }
        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          list-style: none;
          padding: 0;
          margin: 1rem 0;
        }
        .badge {
          background: #E8F5E9;
          color: #1B5E20;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          font-size: 0.85rem;
          border: 1px solid #A5D6A7;
        }
        .badge.accommodation {
          background: #E3F2FD;
          color: #0D47A1;
          border-color: #90CAF9;
        }
        .btn-apply {
          display: inline-block;
          background: var(--color-brand, #0B5D4E);
          color: #FFF;
          text-decoration: none;
          padding: 0.6rem 1.2rem;
          border-radius: 4px;
          font-weight: bold;
          min-height: 44px;
          line-height: 30px;
        }
        .btn-apply:focus-visible {
          outline: 3px solid #005FCC;
          outline-offset: 2px;
        }
      </style>

      <article class="card" aria-labelledby="job-title-${this.job.id}">
        <header>
          <h4 id="job-title-${this.job.id}">${title}</h4>
          <div class="meta-line">
            <span><strong>${this.job.employer}</strong></span> &bull;
            <span>${location}</span> &bull;
            <span>${this.job.workMode}</span>
          </div>
        </header>

        <section class="audio-summary-block" aria-label="${isAm ? "የሥራው አጭር የድምጽ ማብራሪያ" : "Audio Job Summary"}">
          <label for="audio-${this.job.id}">
            <strong>${isAm ? "የሥራው ማጠቃለያ በድምጽ ያዳምጡ" : "Listen to Job Summary"}</strong>
          </label>
          <audio id="audio-${this.job.id}" controls preload="none">
            <source src="${this.job.audioSummary.src}" type="${this.job.audioSummary.type}">
            ${isAm ? "አሳሽዎ ድምጽ አያጫውትም" : "Your browser does not support audio playback"}
          </audio>
        </section>

        <p>${description}</p>

        <div>
          <strong>${isAm ? "የሚሰጡ ማመቻቸቶች (Accommodations):" : "Offered Accommodations:"}</strong>
          <ul class="tags-list">
            ${this.job.accommodations
              .map(
                (acc) => `
              <li class="badge accommodation">
                ${acc.label[this.activeLocale] || acc.label.en}
                <small>(${acc.source})</small>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>

        <footer>
          <a href="${this.job.applicationUrl}" class="btn-apply" target="_blank" rel="noopener">
            ${isAm ? "ለዚህ ሥራ ያመልክቱ" : "Apply for Job"}
          </a>
        </footer>
      </article>
    `;
  }
}

if (!customElements.get("a11y-job-card")) {
  customElements.define("a11y-job-card", A11yJobCard);
}
