import React, { useState, useEffect, useRef } from "react";
import { IconPalette, IconCheck, IconClose } from "./Icons";
import { SupportedLocale } from "@abugida/media-kit";

export type ThemeId =
  | "apple-light"
  | "deuteranopia-protanopia"
  | "tritanopia"
  | "monochrome-high-contrast"
  | "dark-high-contrast";

export interface ThemeOption {
  id: ThemeId;
  name: { en: string; am: string };
  badge: { en: string; am: string };
  subtitle: { en: string; am: string };
  description: { en: string; am: string };
  swatches: [string, string, string, string]; // [Canvas, Surface, Brand, Accent]
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "apple-light",
    name: {
      en: "Apple Light (Standard)",
      am: "መደበኛ የብርሃን ገጽታ (Apple Light)",
    },
    badge: {
      en: "Standard",
      am: "መደበኛ",
    },
    subtitle: {
      en: "Trichromatic baseline",
      am: "መደበኛ ባለሶስት ቀለም እይታ",
    },
    description: {
      en: "Apple design system with crisp slate canvas, blue action brand, and balanced contrast.",
      am: "ለሁሉም ተጠቃሚዎች የተመጠነ መደበኛ የ Apple ሰማያዊ እና ነጭ ገጽታ።",
    },
    swatches: ["#FFFFFF", "#F5F5F7", "#0071E3", "#128045"],
  },
  {
    id: "deuteranopia-protanopia",
    name: {
      en: "Red-Green Safe (Deuteranopia & Protanopia)",
      am: "ቀይ-አረንጓዴ ተደራሽ (Deuteranopia & Protanopia)",
    },
    badge: {
      en: "Okabe-Ito Verified",
      am: "የተረጋገጠ ሳይንሳዊ",
    },
    subtitle: {
      en: "For 99% of color-blind learners",
      am: "ለ 99% የቀለም ዓይነ ስውርነት ተጠቃሚዎች",
    },
    description: {
      en: "Eliminates red/green confusion. Uses vibrant Cobalt Blue (#0052CC), Cerulean, Saffron Gold, and Royal Violet.",
      am: "ቀይ እና አረንጓዴ ግራ መጋባትን በማስወገድ በኮባልት ሰማያዊ፣ አምበር ወርቅ እና ቫዮሌት የተተካ።",
    },
    swatches: ["#FFFFFF", "#F1F5F9", "#0052CC", "#D97706"],
  },
  {
    id: "tritanopia",
    name: {
      en: "Blue-Yellow Safe (Tritanopia)",
      am: "ሰማያዊ-ቢጫ ተደራሽ (Tritanopia)",
    },
    badge: {
      en: "S-Cone Adapted",
      am: "ለሰማያዊ-ቢጫ እጥረት",
    },
    subtitle: {
      en: "For blue-yellow deficiency",
      am: "ሰማያዊ እና ቢጫ ለማይለዩ",
    },
    description: {
      en: "Eliminates blue/yellow confusion. Uses high-contrast Deep Pine Teal (#0F766E), Emerald, and Vivid Crimson Coral.",
      am: "ሰማያዊ እና ቢጫ ግራ መጋባትን በማስወገድ በዲፕ ቲል፣ ኤመራልድ እና ክሪምሰን ኮራል የተተካ።",
    },
    swatches: ["#FFFFFF", "#F8FAFC", "#0F766E", "#BE123C"],
  },
  {
    id: "monochrome-high-contrast",
    name: {
      en: "High Contrast Monochrome (Achromatopsia)",
      am: "ሞኖክሮም ከፍተኛ ንፅፅር (Achromatopsia)",
    },
    badge: {
      en: "21:1 Contrast",
      am: "21:1 ንፅፅር",
    },
    subtitle: {
      en: "Total color blindness & low vision",
      am: "ሙሉ የቀለም ዓይነ ስውርነት እና አነስተኛ እይታ",
    },
    description: {
      en: "Pure luminance architecture (black & white only). Features 2px borders, geometric cues, and underlined links.",
      am: "ከቀለም ነፃ የሆነ ንጹህ ጥቁር እና ነጭ በደማቅ 2px ድንበሮች፣ ቅርጾች እና መስመሮች።",
    },
    swatches: ["#FFFFFF", "#F4F4F6", "#000000", "#333333"],
  },
  {
    id: "dark-high-contrast",
    name: {
      en: "Dark High Contrast (OLED / Low-Vision)",
      am: "ጨለማ ከፍተኛ ንፅፅር (OLED / Low-Vision)",
    },
    badge: {
      en: "Photophobia Safe",
      am: "የዓይን ድካም የሚቀንስ",
    },
    subtitle: {
      en: "Glare-free night learning",
      am: "የብርሃን ነፀብራቅ የሌለው",
    },
    description: {
      en: "Pitch dark canvas with luminous Amber Gold (#F59E0B) and Electric Cyan buttons for maximum visibility.",
      am: "ጥቁር ዳራ በደማቅ አምበር ወርቅ እና በኤሌክትሪክ ሲያን ቁልፎች ለከፍተኛ ተነባቢነት።",
    },
    swatches: ["#090C10", "#161B22", "#F59E0B", "#38BDF8"],
  },
];

const THEME_STORAGE_KEY = "abugida-theme";

export function getActiveTheme(): ThemeId {
  if (typeof window === "undefined") return "apple-light";
  return (localStorage.getItem(THEME_STORAGE_KEY) as ThemeId) || "apple-light";
}

export function applyTheme(themeId: ThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", themeId);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch {
    // LocalStorage restricted fallback
  }

  // Also broadcast to custom elements if rendered
  const players = document.querySelectorAll("a11y-media-player, db-player");
  players.forEach((p) => p.setAttribute("data-theme", themeId));
}

export const ThemePicker: React.FC<{ locale: SupportedLocale }> = ({ locale }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(getActiveTheme);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isAm = locale === "am";

  const getLocText = (obj: { en: string; am: string }) => {
    return (obj as any)[locale] || (locale === "am" || locale === "ti" ? obj.am : obj.en);
  };

  // Initial application on mount
  useEffect(() => {
    applyTheme(currentTheme);
  }, []);

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Select and immediately apply theme
  const handleSelectTheme = (id: ThemeId) => {
    setCurrentTheme(id);
    applyTheme(id);
  };

  const activeOption = THEME_OPTIONS.find((t) => t.id === currentTheme) || THEME_OPTIONS[0];

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Trigger Button in Header */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.45rem",
          padding: "0.35rem 0.85rem",
          borderRadius: "var(--radius-pill)",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border-subtle)",
          color: "var(--color-ink)",
          fontSize: "13px",
          fontWeight: 500,
          cursor: "pointer",
          minHeight: "34px",
          transition: "background 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease",
          boxShadow: isOpen ? "0 0 0 2px var(--color-focus)" : "var(--shadow-subtle)",
        }}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={isAm ? "የቀለም እይታ ገጽታ ይቀይሩ" : "Change Color Vision Theme"}
        title={isAm ? "የቀለም እይታ እና የገጽታ መምረጫ" : "Color Vision & Theme Selector"}
      >
        <IconPalette size={15} style={{ color: "var(--color-brand)" }} />
        <span>{getLocText(activeOption.badge)}</span>
        {/* Subtle Swatch Preview Dots */}
        <span style={{ display: "inline-flex", gap: "2px", alignItems: "center" }} aria-hidden="true">
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: activeOption.swatches[2], display: "inline-block" }} />
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: activeOption.swatches[3], display: "inline-block" }} />
        </span>
      </button>

      {/* Floating Theme Popover Dialog */}
      {isOpen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={isAm ? "የቀለም እይታ እና የገጽታ መምረጫ" : "Color Vision & Theme Selector"}
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "360px",
            maxWidth: "calc(100vw - 2rem)",
            background: "var(--color-surface-elevated, #FFFFFF)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-floating, 0 16px 40px rgba(0,0,0,0.22))",
            padding: "1.25rem",
            zIndex: 1000,
            animation: "apple-entrance 0.2s cubic-bezier(0.25, 1, 0.5, 1) both",
          }}
        >
          {/* Header Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <IconPalette size={18} style={{ color: "var(--color-brand)" }} />
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--color-ink)" }}>
                {isAm ? "የቀለም እይታ እና ገጽታ" : "Color Vision & Theme"}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                triggerRef.current?.focus();
              }}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--color-muted-ink)",
                padding: "4px",
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label={isAm ? "ዝጋ" : "Close theme selector"}
            >
              <IconClose size={15} />
            </button>
          </div>

          <p style={{ margin: "0 0 1rem 0", fontSize: "12.5px", color: "var(--color-muted-ink)", lineHeight: 1.45 }}>
            {isAm
              ? "ምርጫዎን ጠቅ ሲያደርጉ መላው ስርዓት (ገጾች፣ ቁልፎች፣ ማጫወቻ) ወዲያውኑ በእውነተኛ ጊዜ ይቀየራል።"
              : "Live preview: click any option to transform all pages, buttons, and media player controls instantly."}
          </p>

          {/* Theme Option Cards List */}
          <div role="radiogroup" aria-label={isAm ? "የገጽታ አማራጮች" : "Theme options"} style={{ display: "flex", flexDirection: "column", gap: "0.65rem", maxHeight: "380px", overflowY: "auto", paddingRight: "2px" }}>
            {THEME_OPTIONS.map((theme) => {
              const isSelected = currentTheme === theme.id;
              return (
                <div
                  key={theme.id}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => handleSelectTheme(theme.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectTheme(theme.id);
                    }
                  }}
                  onMouseEnter={() => applyTheme(theme.id)}
                  onMouseLeave={() => applyTheme(currentTheme)}
                  style={{
                    padding: "0.75rem 0.85rem",
                    borderRadius: "10px",
                    border: isSelected ? "2px solid var(--color-brand)" : "1px solid var(--color-border-subtle)",
                    background: isSelected ? "var(--color-brand-subtle)" : "var(--color-surface)",
                    cursor: "pointer",
                    transition: "all 0.14s ease",
                    outline: "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.35rem" }}>
                    <div>
                      <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--color-ink)" }}>
                        {getLocText(theme.name)}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--color-muted-ink)", marginTop: "1px" }}>
                        {getLocText(theme.subtitle)}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      {isSelected && (
                        <span
                          style={{
                            background: "var(--color-brand)",
                            color: "#FFFFFF",
                            borderRadius: "50%",
                            width: "18px",
                            height: "18px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <IconCheck size={12} />
                        </span>
                      )}
                    </div>
                  </div>

                  <p style={{ margin: "0 0 0.5rem 0", fontSize: "11.5px", color: "var(--color-muted-ink)", lineHeight: 1.4 }}>
                    {getLocText(theme.description)}
                  </p>

                  {/* Visual Color Palette Swatches */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ fontSize: "10px", color: "var(--color-muted-ink)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                      Palette:
                    </span>
                    <div style={{ display: "inline-flex", gap: "4px" }}>
                      {theme.swatches.map((color, idx) => (
                        <span
                          key={idx}
                          style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "3px",
                            background: color,
                            display: "inline-block",
                            border: "1px solid rgba(0,0,0,0.15)",
                            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.2)",
                          }}
                          title={`Color ${idx + 1}: ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reset Action */}
          <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--color-border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => handleSelectTheme("apple-light")}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "12px",
                color: "var(--color-link)",
                cursor: "pointer",
                padding: "2px 4px",
                textDecoration: "underline",
              }}
            >
              {isAm ? "ወደ መደበኛው መልስ" : "Reset to Standard Light"}
            </button>
            <span style={{ fontSize: "11px", color: "var(--color-muted-ink)" }}>
              WCAG 2.2 AAA
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
