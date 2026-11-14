import "@abugida/media-kit";
import { AccessibleJob } from "@abugida/lesson-schema";

let currentLocale: "en" | "am" = "en";

document.addEventListener("DOMContentLoaded", async () => {
  const player = document.getElementById("player");
  const langEn = document.getElementById("lang-toggle-en");
  const langAm = document.getElementById("lang-toggle-am");

  function setLanguage(locale: "en" | "am") {
    currentLocale = locale;
    if (player) {
      player.setAttribute("locale", locale);
    }
    if (langEn && langAm) {
      langEn.setAttribute("aria-pressed", locale === "en" ? "true" : "false");
      langAm.setAttribute("aria-pressed", locale === "am" ? "true" : "false");
    }

    const header = document.getElementById("lesson-header");
    const intro = document.getElementById("lesson-intro");
    if (header && intro) {
      if (locale === "am") {
        header.textContent = "የዲጂታል የሥራ ቦታ ክህሎቶች፡ መሠረታዊ";
        intro.textContent = "ለዲጂታል ሥራ አስፈላጊ የሆኑ መሣሪያዎችን እና የትብብር አሠራሮችን ይማሩ።";
      } else {
        header.textContent = "Digital Workplace Skills: Foundations";
        intro.textContent = "Master the essential tools and collaborative workflows for digital employment.";
      }
    }

    loadJobs();
  }

  if (langEn) langEn.addEventListener("click", () => setLanguage("en"));
  if (langAm) langAm.addEventListener("click", () => setLanguage("am"));

  async function loadJobs() {
    try {
      const res = await fetch("/jobs/jobs.json");
      if (!res.ok) return;
      const jobs: AccessibleJob[] = await res.json();
      const container = document.getElementById("job-cards-container");
      if (!container) return;
      container.innerHTML = "";

      for (const job of jobs) {
        const card = document.createElement("a11y-job-card");
        card.setAttribute("locale", currentLocale);
        card.setAttribute("job-data", JSON.stringify(job));
        container.appendChild(card);
      }
    } catch (e) {
      console.error("Failed to load jobs", e);
    }
  }

  loadJobs();

  // 3G Offline pack downloader
  const btnDownload = document.getElementById("btn-download-pack");
  const downloadStatus = document.getElementById("download-status");
  if (btnDownload && downloadStatus) {
    btnDownload.addEventListener("click", async () => {
      downloadStatus.style.display = "block";
      downloadStatus.textContent = currentLocale === "am" ? "ማውረድ ተጀምሯል..." : "Downloading 3G offline pack...";

      try {
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.register("/sw.js");
          await navigator.serviceWorker.ready;
          downloadStatus.textContent = currentLocale === "am" 
            ? "ፓኬጁ በተሳካ ሁኔታ ተቀምጧል! አሁን ኢንተርኔት ሳይኖር መጠቀም ይችላሉ።" 
            : "Offline pack downloaded! You can now access this lesson in airplane mode.";
        } else {
          downloadStatus.textContent = "Offline storage unavailable in this browser.";
        }
      } catch (err) {
        downloadStatus.textContent = `Download failed: ${err instanceof Error ? err.message : "Error"}`;
      }
    });
  }
});
