import React, { useState, useEffect } from "react";
import { formatDualDate } from "@abugida/media-kit";
import { useRouter, NavLink } from "./router";
import { HomeView } from "./views/HomeView";
import { LessonView } from "./views/LessonView";
import { StudioView } from "./views/StudioView";
import { VerifyView } from "./views/VerifyView";
import { EmbedView } from "./views/EmbedView";

export const App: React.FC = () => {
  const { currentPath } = useRouter();
  const [locale, setLocale] = useState<"en" | "am">(() => {
    return (localStorage.getItem("abugida-locale") as "en" | "am") || "en";
  });

  const isAm = locale === "am";
  const dualDate = formatDualDate(new Date(2026, 10, 14));

  const handleLocaleChange = (newLocale: "en" | "am") => {
    setLocale(newLocale);
    localStorage.setItem("abugida-locale", newLocale);
  };

  // Register service worker safely
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("Service worker registration ignored:", err);
      });
    }
  }, []);

  return (
    <div className="site-container">
      {/* Skip to Content for Keyboard and Screen Reader Accessibility */}
      <a href="#main-content" className="skip-link">
        {isAm ? "ወደ ዋናው ይዘት ዝለል" : "Skip to main content"}
      </a>

      {/* Main Header */}
      <header className="site-header" style={{ flexDirection: "column", alignItems: "stretch", gap: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.6rem", color: "var(--color-brand)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>Abugida Media Kit (አቡጊዳ)</span>
            </h1>
            <p style={{ margin: "0.25rem 0 0 0", color: "var(--color-muted-ink)", fontSize: "0.95rem" }}>
              {isAm
                ? "ትራክ 2፡ ተደራሽ የትምህርት ሚዲያ እና የሥራ መግቢያ በር &bull; ዲጂታል ብሪጅ 2026"
                : "Track 2: Accessible Learning Media & Career Gateway &bull; Digital Bridge 2026"}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            {/* Dual Calendar Pill */}
            <span
              className="badge badge-accent"
              style={{ fontSize: "0.85rem", padding: "0.35rem 0.75rem" }}
              title="Ethiopian & Gregorian Dual Calendar"
            >
              📅 {dualDate.formatted}
            </span>

            {/* Language Switcher */}
            <div style={{ display: "flex", gap: "0.25rem", background: "#ECEFF1", padding: "0.2rem", borderRadius: "6px" }}>
              <button
                type="button"
                onClick={() => handleLocaleChange("en")}
                style={{
                  padding: "0.4rem 0.8rem",
                  border: "none",
                  borderRadius: "4px",
                  background: locale === "en" ? "var(--color-brand)" : "transparent",
                  color: locale === "en" ? "#ffffff" : "var(--color-ink)",
                  fontWeight: 600,
                  cursor: "pointer",
                  minHeight: "36px",
                }}
                aria-pressed={locale === "en"}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => handleLocaleChange("am")}
                style={{
                  padding: "0.4rem 0.8rem",
                  border: "none",
                  borderRadius: "4px",
                  background: locale === "am" ? "var(--color-brand)" : "transparent",
                  color: locale === "am" ? "#ffffff" : "var(--color-ink)",
                  fontWeight: 600,
                  cursor: "pointer",
                  minHeight: "36px",
                }}
                aria-pressed={locale === "am"}
              >
                አማርኛ
              </button>
            </div>
          </div>
        </div>

        {/* Accessible Navigation Bar */}
        <nav className="main-nav" aria-label={isAm ? "ዋና አሰሳ" : "Main Navigation"} style={{ borderTop: "1px solid var(--color-border)", paddingTop: "0.75rem" }}>
          <ul style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", listStyle: "none", padding: 0, margin: 0 }}>
            <li>
              <NavLink to="/">{isAm ? "መነሻ (Home)" : "Home"}</NavLink>
            </li>
            <li>
              <NavLink to="/lesson">{isAm ? "ተደራሽ ትምህርት" : "Accessible Lesson"}</NavLink>
            </li>
            <li>
              <NavLink to="/studio">{isAm ? "የትርጉም ስቱዲዮ" : "Transcript Studio"}</NavLink>
            </li>
            <li>
              <NavLink to="/verify">{isAm ? "ምስክር ወረቀት አረጋግጥ" : "Verify Credential"}</NavLink>
            </li>
            <li>
              <NavLink to="/embed">{isAm ? "የስክሪፕት ታግ ማካተቻ" : "Script Tag Embed"}</NavLink>
            </li>
          </ul>
        </nav>
      </header>

      {/* Main Content Area */}
      <main id="main-content" style={{ minHeight: "60vh", outline: "none" }}>
        {currentPath === "/" && <HomeView locale={locale} />}
        {currentPath === "/lesson" && <LessonView locale={locale} />}
        {currentPath === "/studio" && <StudioView locale={locale} />}
        {currentPath === "/verify" && <VerifyView locale={locale} />}
        {currentPath === "/embed" && <EmbedView locale={locale} />}
      </main>

      {/* Accessible Site Footer */}
      <footer
        style={{
          marginTop: "4rem",
          paddingTop: "2rem",
          borderTop: "1px solid var(--color-border)",
          color: "var(--color-muted-ink)",
          fontSize: "0.9rem",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div>
          <strong>Abugida Media Kit (አቡጊዳ)</strong> &bull; Digital Bridge Accessibility Hackathon 2026
          <div style={{ marginTop: "0.25rem", fontSize: "0.85rem" }}>
            ALX Ethiopia &bull; LIWAY &bull; SNV &bull; Mercy Corps &bull; AAAPD &bull; Tomorrow is Better
          </div>
        </div>

        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <span>✓ WCAG 2.2 AA (0 Critical, 0 Serious)</span>
          <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" style={{ color: "var(--color-brand)", fontWeight: 500 }}>
            FastAPI OpenAPI Docs (/docs) ↗
          </a>
        </div>
      </footer>
    </div>
  );
};
