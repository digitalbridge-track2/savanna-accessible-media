import React, { useState, useEffect } from "react";
import { formatDualDate, SupportedLocale, SUPPORTED_LANGUAGES, getTranslation } from "@abugida/media-kit";
import { useRouter, NavLink } from "./router";
import { HomeView } from "./views/HomeView";
import { LessonView } from "./views/LessonView";
import { CareersView } from "./views/CareersView";
import { StudioView } from "./views/StudioView";
import { VerifyView } from "./views/VerifyView";
import { EmbedView } from "./views/EmbedView";
import { ThemePicker } from "./components/ThemePicker";
import { IconGlobe } from "./components/Icons";

// Error Boundary to prevent any blank or white screens
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            maxWidth: "680px",
            margin: "4rem auto",
            padding: "2rem",
            background: "#FFF5F5",
            border: "1px solid #FFD2D2",
            borderRadius: "var(--radius-card)",
            color: "#D70015",
          }}
        >
          <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.3rem" }}>Application Error</h2>
          <p style={{ margin: "0 0 1.5rem 0", color: "#8E0000" }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = "/";
            }}
          >
            Return to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const AppContent: React.FC = () => {
  const { currentPath } = useRouter();
  const [locale, setLocale] = useState<SupportedLocale>(() => {
    return (localStorage.getItem("abugida-locale") as SupportedLocale) || "en";
  });

  const dualDate = formatDualDate("2026-11-14");

  const handleLocaleChange = (newLocale: SupportedLocale) => {
    setLocale(newLocale);
    localStorage.setItem("abugida-locale", newLocale);
  };

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("Service worker registration ignored:", err);
      });
    }
  }, []);

  return (
    <div className="site-container">
      {/* Skip to Content */}
      <a href="#main-content" className="skip-link">
        {getTranslation("skipLink", locale)}
      </a>

      {/* Main Header with Apple-style Layout & Refined Spacing */}
      <header className="site-header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1.25rem",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "1.75rem",
                fontWeight: 600,
                color: "var(--color-ink)",
                letterSpacing: "-0.015em",
              }}
            >
              {getTranslation("appTitle", locale)}
            </h1>
            <p
              style={{
                margin: "0.25rem 0 0 0",
                color: "var(--color-muted-ink)",
                fontSize: "0.94rem",
                fontWeight: 400,
              }}
            >
              {getTranslation("appSubtitle", locale)}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            {/* Dual Calendar Badge */}
            <span
              className="badge badge-neutral"
              style={{ fontSize: "13px", padding: "0.35rem 0.85rem", borderRadius: "var(--radius-pill)" }}
              title="Ethiopian & Gregorian Dual Calendar"
            >
              {dualDate.display}
            </span>

            {/* Ethiopian National & Global Language Switcher */}
            <div
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border-subtle)",
                padding: "2px 8px 2px 10px",
                borderRadius: "var(--radius-pill)",
                boxShadow: "var(--shadow-subtle)",
              }}
            >
              <span style={{ color: "var(--color-muted-ink)", display: "flex", alignItems: "center", marginRight: "6px" }} aria-hidden="true">
                <IconGlobe size={14} />
              </span>
              <label htmlFor="system-lang-select" className="sr-only">
                {getTranslation("selectLang", locale)}
              </label>
              <select
                id="system-lang-select"
                value={locale}
                onChange={(e) => handleLocaleChange(e.target.value as SupportedLocale)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--color-ink)",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                  padding: "0.35rem 0.5rem 0.35rem 0",
                  outline: "none",
                  fontFamily: "inherit",
                }}
                aria-label={getTranslation("selectLang", locale)}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Universal Color Vision Theme Changer */}
            <ThemePicker locale={locale} />
          </div>
        </div>

        {/* Clean Segmented Navigation */}
        <nav className="main-nav" aria-label={getTranslation("navHome", locale)}>
          <div className="nav-segmented">
            <NavLink to="/">{getTranslation("navHome", locale)}</NavLink>
            <NavLink to="/lesson">{getTranslation("navLesson", locale)}</NavLink>
            <NavLink to="/careers">{getTranslation("navCareers", locale)}</NavLink>
            <NavLink to="/studio">{getTranslation("navStudio", locale)}</NavLink>
            <NavLink to="/verify">{getTranslation("navVerify", locale)}</NavLink>
            <NavLink to="/embed">{getTranslation("navEmbed", locale)}</NavLink>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main id="main-content" style={{ minHeight: "65vh", outline: "none" }}>
        {currentPath === "/" && <HomeView locale={locale} />}
        {currentPath === "/lesson" && <LessonView locale={locale} />}
        {currentPath === "/careers" && <CareersView locale={locale} />}
        {currentPath === "/studio" && <StudioView locale={locale} />}
        {currentPath === "/verify" && <VerifyView locale={locale} />}
        {currentPath === "/embed" && <EmbedView locale={locale} />}
      </main>

      {/* Clean Footer */}
      <footer
        style={{
          marginTop: "4.5rem",
          paddingTop: "2rem",
          borderTop: "1px solid var(--color-border-subtle)",
          color: "var(--color-muted-ink)",
          fontSize: "13px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <p style={{ margin: 0 }}>
          {locale === "am"
            ? "© 2026 አቡጊዳ ሚዲያ ኪት (ትራክ 2) · ክፍት ድር ደረጃዎች እና የተደራሽነት መስፈርቶች (WCAG 2.2 AA) የተጠበቁ ናቸው።"
            : locale === "om"
            ? "© 2026 Abugida Media Kit (Tiraakii 2) · Ulaagaalee Weebii fi Qajeelfama WCAG 2.2 AA irratti kan ijaarame."
            : locale === "ti"
            ? "© 2026 አቡጊዳ ሚዲያ ኪት (ትራክ 2) · ክፉት ናይ ድህረ-ገጽ መመዘንታትን WCAG 2.2 AA ተበጻሕነትን ዝሓለወ።"
            : locale === "so"
            ? "© 2026 Abugida Media Kit (Qaybta 2) · Waxaa lagu dhisay Halbeegyada Shabakadda Furan & WCAG 2.2 AA."
            : "© 2026 Abugida Media Kit (Track 2) · Built on Open Web Standards & WCAG 2.2 Level AA."}
        </p>
        <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
          <a href="/verify?id=CERT-DB-2026-0042" style={{ color: "var(--color-link)" }}>
            {getTranslation("navVerify", locale)}
          </a>
          <a href="/lesson.en.html" style={{ color: "var(--color-link)" }}>
            {getTranslation("docHtmlTitle", locale)}
          </a>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};
