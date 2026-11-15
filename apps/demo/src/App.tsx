import React, { useState, useEffect } from "react";
import { formatDualDate } from "@abugida/media-kit";
import { useRouter, NavLink } from "./router";
import { HomeView } from "./views/HomeView";
import { LessonView } from "./views/LessonView";
import { StudioView } from "./views/StudioView";
import { VerifyView } from "./views/VerifyView";
import { EmbedView } from "./views/EmbedView";
import { ReadAloudProvider } from "./read-aloud/ReadAloudProvider";
import { ReadAloudPanel } from "./read-aloud/ReadAloudPanel";

// Top-level Error Boundary to eliminate any possibility of a white screen
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
    console.error("ErrorBoundary caught an unhandled component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            maxWidth: "700px",
            margin: "4rem auto",
            padding: "2rem",
            background: "#FFF5F5",
            border: "2px solid #FEB2B2",
            borderRadius: "12px",
            color: "#9B2C2C",
          }}
        >
          <h2 style={{ margin: "0 0 1rem 0" }}>Application Error Recovered</h2>
          <p style={{ margin: "0 0 1.5rem 0", color: "#742A2A" }}>
            {this.state.error?.message || "An unexpected error occurred in the component tree."}
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

  // Register service worker safely
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("Service worker registration ignored:", err);
      });
    }
  }, []);

  return (
    <ReadAloudProvider locale={locale} routeKey={currentPath}>
      <div className="site-container">
        {/* Skip to Content for Keyboard and Screen Reader Accessibility */}
        <a href="#main-content" className="skip-link">
          {isAm ? "ወደ ዋናው ይዘት ዝለል" : "Skip to main content"}
        </a>

        {/* Main Header with Balanced Proportions */}
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
                  fontSize: "1.65rem",
                  fontWeight: 700,
                  color: "var(--color-brand)",
                  letterSpacing: "-0.01em",
                }}
              >
                Abugida Media Kit (አቡጊዳ)
              </h1>
              <p
                style={{
                  margin: "0.2rem 0 0 0",
                  color: "var(--color-muted-ink)",
                  fontSize: "0.95rem",
                }}
              >
                {isAm
                  ? "ትራክ 2፡ ተደራሽ የትምህርት ሚዲያ እና የሥራ መግቢያ በር &bull; ዲጂታል ብሪጅ 2026"
                  : "Track 2: Accessible Learning Media & Career Gateway &bull; Digital Bridge 2026"}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              {/* Dual Calendar Pill */}
              <span
                className="badge badge-accent"
                style={{ fontSize: "0.82rem", padding: "0.4rem 0.8rem" }}
                title="Ethiopian & Gregorian Dual Calendar"
              >
                📅 {dualDate.display}
              </span>

              {/* Segmented Language Switcher */}
              <div
                style={{
                  display: "inline-flex",
                  background: "#E5ECE8",
                  padding: "3px",
                  borderRadius: "8px",
                }}
                role="group"
                aria-label={isAm ? "ቋንቋ ይምረጡ" : "Choose Language"}
              >
                <button
                  type="button"
                  onClick={() => handleLocaleChange("en")}
                  style={{
                    padding: "0.35rem 0.75rem",
                    border: "none",
                    borderRadius: "6px",
                    background: locale === "en" ? "var(--color-brand)" : "transparent",
                    color: locale === "en" ? "#ffffff" : "var(--color-ink)",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    minHeight: "34px",
                    transition: "background 0.15s ease, color 0.15s ease",
                  }}
                  aria-pressed={locale === "en"}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => handleLocaleChange("am")}
                  style={{
                    padding: "0.35rem 0.75rem",
                    border: "none",
                    borderRadius: "6px",
                    background: locale === "am" ? "var(--color-brand)" : "transparent",
                    color: locale === "am" ? "#ffffff" : "var(--color-ink)",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    minHeight: "34px",
                    transition: "background 0.15s ease, color 0.15s ease",
                  }}
                  aria-pressed={locale === "am"}
                >
                  አማርኛ
                </button>
              </div>
            </div>
          </div>

          {/* Accessible Segmented Navigation Bar */}
          <nav className="main-nav" aria-label={isAm ? "ዋና አሰሳ" : "Main Navigation"}>
            <div className="nav-segmented">
              <NavLink to="/">{isAm ? "🏠 መነሻ" : "🏠 Home"}</NavLink>
              <NavLink to="/lesson">{isAm ? "📚 ተደራሽ ትምህርት" : "📚 Accessible Lesson"}</NavLink>
              <NavLink to="/studio">{isAm ? "🎙️ የትርጉም ስቱዲዮ" : "🎙️ Transcript Studio"}</NavLink>
              <NavLink to="/verify">{isAm ? "🎓 ምስክር ወረቀት" : "🎓 Verify Credential"}</NavLink>
              <NavLink to="/embed">{isAm ? "📦 የስክሪፕት ታግ" : "📦 Script Tag Embed"}</NavLink>
            </div>
          </nav>
        </header>

        {/* Main Content Area */}
        <main id="main-content" lang={locale} style={{ minHeight: "65vh", outline: "none" }}>
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
            <div style={{ marginTop: "0.3rem", fontSize: "0.85rem", color: "var(--color-muted-ink)" }}>
              ALX Ethiopia &bull; LIWAY &bull; SNV &bull; Mercy Corps &bull; AAAPD &bull; Tomorrow is Better
            </div>
          </div>

          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <span className="badge badge-success">✓ WCAG 2.2 AA Conformance</span>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--color-brand)", fontWeight: 600 }}
            >
              FastAPI OpenAPI Docs (/docs) ↗
            </a>
          </div>
        </footer>
      </div>
      <ReadAloudPanel locale={locale} />
    </ReadAloudProvider>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};
