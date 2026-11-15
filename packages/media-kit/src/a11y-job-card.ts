import { AccessibleJob } from "@abugida/lesson-schema";
import { formatDualDate } from "./localization/ethiopian-calendar.js";

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
      } catch {}
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
        } catch {}
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
    const textEquivalent = typeof this.job.audioSummary?.textEquivalent === "object"
      ? ((this.job.audioSummary.textEquivalent as any)[this.activeLocale] || (this.job.audioSummary.textEquivalent as any).en || "")
      : this.job.audioSummary?.textEquivalent || "";

    // Dual-calendar formatting for application deadline
    const deadlineDual = this.job.applicationDeadline
      ? formatDualDate(this.job.applicationDeadline)
      : null;

    // schema.org/JobPosting JSON-LD
    const jsonLd = {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      "title": title,
      "description": description,
      "hiringOrganization": {
        "@type": "Organization",
        "name": this.job.employer
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": location,
          "addressCountry": "ET"
        }
      },
      "validThrough": this.job.applicationDeadline || "2026-12-31"
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
        ${JSON.stringify(jsonLd)}
      </script>

      <article class="card" aria-labelledby="job-title-${this.job.id}">
        <header>
          <h4 id="job-title-${this.job.id}">${title}</h4>
          <div class="meta-line">
            <span><strong>${this.job.employer}</strong></span> &bull;
            <span>${location}</span> &bull;
            <span>${this.job.workMode.toUpperCase()}</span>
            ${
              deadlineDual
                ? ` &bull; <span class="badge calendar" aria-label="Deadline: ${deadlineDual.display}">📅 ${isAm ? "የማመልከቻ ማብቂያ፦" : "Deadline:"} ${deadlineDual.display}</span>`
                : ""
            }
          </div>
        </header>

        <!-- Prerecorded Audio Summary with Accessible Controls -->
        <section class="audio-summary-block" aria-label="${isAm ? "የሥራው አጭር የድምጽ ማጠቃለያ" : "Prerecorded Audio Job Summary"}">
          <label for="audio-ctrl-${this.job.id}" style="font-weight: bold;">
            🎧 ${isAm ? "የሥራው ማጠቃለያ በድምጽ ያዳምጡ (Audio Summary):" : "Listen to Audio Job Summary:"}
          </label>
          <audio id="audio-ctrl-${this.job.id}" controls preload="none">
            <source src="${this.job.audioSummary.src}" type="${this.job.audioSummary.type}">
            ${isAm ? "አሳሽዎ ድምጽ አያጫውትም" : "Your browser does not support audio playback"}
          </audio>
          <div class="text-summary-box" aria-label="${isAm ? "የድምጹ አቻ ጽሑፍ" : "Equivalent text of audio summary"}">
            <strong>${isAm ? "የድምጽ አቻ ጽሑፍ:" : "Transcript of Summary:"}</strong>
            ${textEquivalent}
          </div>
        </section>

        <p>${description}</p>

        <!-- Transparent Accommodations -->
        <div>
          <strong id="acc-heading-${this.job.id}">${isAm ? "የተረጋገጡ ማመቻቸቶች (Accommodations Offered):" : "Employer-Provided Accommodations:"}</strong>
          <ul class="tags-list" aria-labelledby="acc-heading-${this.job.id}">
            ${this.job.accommodations
              .map(
                (acc) => `
              <li class="badge accommodation">
                <span aria-hidden="true">✓</span>
                <span>${acc.label[this.activeLocale] || acc.label.en}</span>
                <small style="opacity: 0.85;">(${acc.source})</small>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>

        <!-- Action Row -->
        <footer class="action-row">
          <a href="${this.job.applicationUrl}" class="btn-apply" target="_blank" rel="noopener">
            ${isAm ? "ለዚህ ሥራ ያመልክቱ" : "Apply on Job Portal"}
          </a>

          <button type="button" class="btn-secondary" id="btn-share-cert">
            🔗 ${isAm ? "የምስክር ወረቀት አገናኝ ያጋሩ" : "Share Verified Certificate Link"}
          </button>

          <span class="share-feedback" id="share-feedback" aria-live="polite"></span>
        </footer>
      </article>
    `;

    this.attachShareHandler();
  }

  private attachShareHandler() {
    const btnShare = this.shadow.getElementById("btn-share-cert");
    const feedback = this.shadow.getElementById("share-feedback");
    if (!btnShare || !feedback) return;

    btnShare.addEventListener("click", async () => {
      const verifyUrl = `${window.location.origin}/verify.html?certId=CERT-DB-2026-0042`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: "Demonstrated Certificate — Savanna Platform",
            text: "Verified Certificate for Digital Workplace Skills: Foundations",
            url: verifyUrl,
          });
          feedback.textContent = this.activeLocale === "am" ? "ተጋርቷል!" : "Link shared!";
          return;
        } catch {
          // Fallback to clipboard
        }
      }

      try {
        await navigator.clipboard.writeText(verifyUrl);
        feedback.textContent = this.activeLocale === "am" ? "የምስክር ወረቀት አገናኝ ተገልብጧል!" : "Certificate link copied to clipboard!";
      } catch {
        feedback.textContent = verifyUrl;
      }
    });
  }
}

if (!customElements.get("a11y-job-card")) {
  customElements.define("a11y-job-card", A11yJobCard);
}
