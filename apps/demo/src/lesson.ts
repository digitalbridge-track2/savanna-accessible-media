import "@abugida/media-kit";
import { AccessibleJob } from "@abugida/lesson-schema";
import { offlineStorage } from "@abugida/media-kit";

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

  // Register service worker
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/sw.js");
    } catch (e) {
      console.warn("Service worker registration failed", e);
    }
  }

  // 3G Offline pack downloader with OfflineStorageManager
  const btnDownload = document.getElementById("btn-download-pack") as HTMLButtonElement;
  const downloadStatus = document.getElementById("download-status");

  // Check if already ready
  const isReady = await offlineStorage.isPackageReady("digital-workplace-01", "pkg-3g-light");
  if (isReady && downloadStatus) {
    downloadStatus.style.display = "block";
    downloadStatus.style.color = "#1B5E20";
    downloadStatus.textContent = currentLocale === "am" 
      ? "✓ ይህ ትምህርት በስልክዎ ላይ ተቀምጧል (ኢንተርኔት ሳይኖር መጠቀም ይችላሉ)።" 
      : "✓ Lesson package is stored offline and ready for airplane mode.";
    if (btnDownload) {
      btnDownload.textContent = currentLocale === "am" ? "ዳግም አውርድ" : "Re-download Package";
    }
  }

  if (btnDownload && downloadStatus) {
    btnDownload.addEventListener("click", async () => {
      downloadStatus.style.display = "block";
      downloadStatus.style.color = "#0B5D4E";
      btnDownload.disabled = true;

      const assetsToCache = [
        "/lessons/digital-workplace/lesson.json",
        "/lessons/digital-workplace/captions.en.vtt",
        "/lessons/digital-workplace/captions.am.vtt",
        "/lessons/digital-workplace/transcript.en.json",
        "/lessons/digital-workplace/documents/lesson.en.html",
        "/jobs/jobs.json",
        "/verify.html"
      ];

      try {
        await offlineStorage.downloadPackage(
          "digital-workplace-01",
          "pkg-3g-light",
          "3G Light Study Pack",
          assetsToCache,
          (pct) => {
            downloadStatus.textContent = currentLocale === "am" 
              ? `እያወረደ ነው... ${pct}%` 
              : `Downloading 3G package... ${pct}%`;
          }
        );

        downloadStatus.style.color = "#1B5E20";
        downloadStatus.textContent = currentLocale === "am" 
          ? "✓ ማውረድ ተጠናቋል! አሁን ኢንተርኔት አጥፍተው (Airplane Mode) መጠቀም ይችላሉ።" 
          : "✓ Download complete! You can now disconnect or use Airplane Mode.";
        btnDownload.disabled = false;
        btnDownload.textContent = currentLocale === "am" ? "ዳግም አውርድ" : "Re-download Package";
      } catch (err) {
        downloadStatus.style.color = "#D32F2F";
        downloadStatus.textContent = `Download failed: ${err instanceof Error ? err.message : "Error"}`;
        btnDownload.disabled = false;
      }
    });
  }
});
