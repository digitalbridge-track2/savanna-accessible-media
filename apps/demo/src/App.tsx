import React, { useState, useEffect } from "react";
import { formatDualDate } from "@abugida/media-kit";
import { useRouter, NavLink } from "./router";
import { HomeView } from "./views/HomeView";
import { LessonView } from "./views/LessonView";
import { StudioView } from "./views/StudioView";
import { VerifyView } from "./views/VerifyView";
import { EmbedView } from "./views/EmbedView";

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
  const [locale, setLocale] = useState<"en" | "am">(() => {
    return (localStorage.getItem("abugida-locale") as "en" | "am") || "en";
  });

  const isAm = locale === "am";
  const dualDate = formatDualDate("2026-11-14");

  const handleLocaleChange = (newLocale: "en" | "am") => {
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
        {isAm ? "ወደ ዋናው ይዘት ዝለል" : "Skip to main content"}
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
              Abugida Media Kit (አቡጊዳ)
            </h1>
            <p
              style={{
                margin: "0.25rem 0 0 0",
                color: "var(--color-muted-ink)",
                fontSize: "0.94rem",
                fontWeight: 400,
              }}
            >
              {isAm
                ? "ተደራሽ የትምህርት ሚዲያ እና የሥራ መግቢያ በር · ዲጂታል ብሪጅ 2026"
                : "Accessible Learning Media & Career Gateway · Digital Bridge 2026"}
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

            {/* Language Switcher - Apple Segmented Pill */}
            <div
              style={{
                display: "inline-flex",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border-subtle)",
                padding: "3px",
                borderRadius: "var(--radius-pill)",
              }}
              role="group"
              aria-label={isAm ? "ቋንቋ ይምረጡ" : "Select Language"}
            >
              <button
                type="button"
                onClick={() => handleLocaleChange("en")}
                style={{
                  padding: "0.35rem 0.95rem",
                  border: "none",
                  borderRadius: "var(--radius-pill)",
                  background: locale === "en" ? "#FFFFFF" : "transparent",
                  color: locale === "en" ? "var(--color-ink)" : "var(--color-muted-ink)",
                  fontWeight: locale === "en" ? 600 : 500,
                  fontSize: "13px",
                  cursor: "pointer",
                  minHeight: "32px",
                  boxShadow: locale === "en" ? "0 2px 6px rgba(0, 0, 0, 0.08)" : "none",
                  transition: "background 0.16s ease, color 0.16s ease, box-shadow 0.16s ease",
                }}
                aria-pressed={locale === "en"}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => handleLocaleChange("am")}
                style={{
                  padding: "0.35rem 0.95rem",
                  border: "none",
                  borderRadius: "var(--radius-pill)",
                  background: locale === "am" ? "#FFFFFF" : "transparent",
                  color: locale === "am" ? "var(--color-ink)" : "var(--color-muted-ink)",
                  fontWeight: locale === "am" ? 600 : 500,
                  fontSize: "13px",
                  cursor: "pointer",
                  minHeight: "32px",
                  boxShadow: locale === "am" ? "0 2px 6px rgba(0, 0, 0, 0.08)" : "none",
                  transition: "background 0.16s ease, color 0.16s ease, box-shadow 0.16s ease",
                }}
                aria-pressed={locale === "am"}
              >
                አማርኛ
              </button>
            </div>
          </div>
        </div>

        {/* Clean Segmented Navigation */}
        <nav className="main-nav" aria-label={isAm ? "ዋና አሰሳ" : "Main Navigation"}>
          <div className="nav-segmented">
            <NavLink to="/">{isAm ? "መነሻ" : "Home"}</NavLink>
            <NavLink to="/lesson">{isAm ? "ተደራሽ ትምህርት" : "Accessible Lesson"}</NavLink>
            <NavLink to="/studio">{isAm ? "የትርጉም ስቱዲዮ" : "Transcript Studio"}</NavLink>
            <NavLink to="/verify">{isAm ? "ምስክር ወረቀት ማረጋገጫ" : "Verify Credential"}</NavLink>
            <NavLink to="/embed">{isAm ? "የስክሪፕት ታግ ማካተቻ" : "Script Tag Embed"}</NavLink>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main id="main-content" style={{ minHeight: "65vh", outline: "none" }}>
        {currentPath === "/" && <HomeView locale={locale} />}
        {currentPath === "/lesson" && <LessonView locale={locale} />}
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
          {isAm
            ? "© 2026 አቡጊዳ ሚዲያ ኪት (ትራክ 2) · ክፍት ድር ደረጃዎች እና የተደራሽነት መስፈርቶች (WCAG 2.2 AA) የተጠበቁ ናቸው።"
            : "© 2026 Abugida Media Kit (Track 2) · Built on Open Web Standards & WCAG 2.2 Level AA."}
        </p>
        <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
          <a href="/verify?id=CERT-DB-2026-0042" style={{ color: "var(--color-link)" }}>
            {isAm ? "ምስክር ወረቀት አረጋግጥ" : "Verify Certificate"}
          </a>
          <a href="/lesson.en.html" style={{ color: "var(--color-link)" }}>
            {isAm ? "ቀላል HTML ሰነድ" : "Accessible HTML Handout"}
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
