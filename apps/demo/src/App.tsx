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
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: "8px",
            color: "#991B1B",
          }}
        >
          <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.3rem" }}>Application Error</h2>
          <p style={{ margin: "0 0 1.5rem 0", color: "#7F1D1D" }}>
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

      {/* Main Header */}
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
                margin: "0.25rem 0 0 0",
                color: "var(--color-muted-ink)",
                fontSize: "0.92rem",
              }}
            >
              {isAm
                ? "ትራክ 2፡ ተደራሽ የትምህርት ሚዲያ እና የሥራ መግቢያ በር · ዲጂታል ብሪጅ 2026"
                : "Track 2: Accessible Learning Media & Career Gateway · Digital Bridge 2026"}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            {/* Dual Calendar Badge */}
            <span
              className="badge badge-neutral"
              style={{ fontSize: "0.82rem", padding: "0.4rem 0.75rem" }}
              title="Ethiopian & Gregorian Dual Calendar"
            >
              {dualDate.display}
            </span>

            {/* Language Switcher */}
            <div
              style={{
                display: "inline-flex",
                background: "#F1F5F9",
                border: "1px solid var(--color-border)",
                padding: "2px",
                borderRadius: "6px",
              }}
              role="group"
              aria-label={isAm ? "ቋንቋ ይምረጡ" : "Select Language"}
            >
              <button
                type="button"
                onClick={() => handleLocaleChange("en")}
                style={{
                  padding: "0.35rem 0.8rem",
                  border: "none",
                  borderRadius: "4px",
                  background: locale === "en" ? "var(--color-brand)" : "transparent",
                  color: locale === "en" ? "#ffffff" : "#334155",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  minHeight: "34px",
                  transition: "background 0.12s ease, color 0.12s ease",
                }}
                aria-pressed={locale === "en"}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => handleLocaleChange("am")}
                style={{
                  padding: "0.35rem 0.8rem",
                  border: "none",
                  borderRadius: "4px",
                  background: locale === "am" ? "var(--color-brand)" : "transparent",
                  color: locale === "am" ? "#ffffff" : "#334155",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  minHeight: "34px",
                  transition: "background 0.12s ease, color 0.12s ease",
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

      {/* Accessible Footer */}
      <footer
        style={{
          marginTop: "4rem",
          paddingTop: "2rem",
          borderTop: "1px solid var(--color-border)",
          color: "var(--color-muted-ink)",
          fontSize: "0.88rem",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div>
          <strong>Abugida Media Kit (አቡጊዳ)</strong> · Digital Bridge Accessibility Hackathon 2026
          <div style={{ marginTop: "0.3rem", fontSize: "0.82rem", color: "var(--color-muted-ink)" }}>
            ALX Ethiopia · LIWAY · SNV · Mercy Corps · AAAPD · Tomorrow is Better
          </div>
        </div>

        <div style={{ display: "flex", gap: "1.25rem", alignItems: "center", flexWrap: "wrap" }}>
          <span className="badge badge-success">WCAG 2.2 AA Conformance</span>
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
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};
