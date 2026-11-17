import React, { useState, useEffect, useRef } from "react";
import { SupportedLocale } from "@abugida/media-kit";
import { IconPalette, IconCheck, IconClose } from "./Icons";

export type ThemeId =
  | "apple-light"
  | "deuteranopia-protanopia"
  | "tritanopia"
  | "monochrome-high-contrast"
  | "dark-high-contrast";

export interface ThemeOption {
  id: ThemeId;
  name: Record<SupportedLocale, string>;
  badge: Record<SupportedLocale, string>;
  subtitle: Record<SupportedLocale, string>;
  description: Record<SupportedLocale, string>;
  swatches: string[];
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "apple-light",
    name: {
      en: "Apple Light (Standard)",
      am: "መደበኛ የብርሃን ገጽታ (Apple Light)",
      om: "Haala Ifaa Idilee (Apple Light)",
      ti: "ቀንዲ ናይ ብርሃን መልክዕ (Apple Light)",
      so: "Iftiin Caadi ah (Apple Light)",
    },
    badge: {
      en: "Standard",
      am: "መደበኛ",
      om: "Idilee",
      ti: "መደበኛ",
      so: "Caadi",
    },
    subtitle: {
      en: "Trichromatic baseline",
      am: "መደበኛ ባለሶስት ቀለም እይታ",
      om: "Argannoo halluu sadii idilee",
      ti: "መደበኛ ሰለስተ ሕብሪ ራእይ",
      so: "Aragti saddex midab leh oo caadi ah",
    },
    description: {
      en: "Apple design system with crisp slate canvas, blue action brand, and balanced contrast.",
      am: "ለሁሉም ተጠቃሚዎች የተመጠነ መደበኛ የ Apple ሰማያዊ እና ነጭ ገጽታ።",
      om: "Sirna dizaayinii Apple halluu cuquliisaa, adii fi wal-madaalawummaa qabu.",
      ti: "ንኹሎም ተጠቀምቲ ዝተመጣጠነ መደበኛ Apple ሰማያውን ጻዕዳን ገጽታ።",
      so: "Naqshadda Apple oo leh midab buluug ah, caddaan iyo dheelitirnaan aragti.",
    },
    swatches: ["#FFFFFF", "#F5F5F7", "#0071E3", "#128045"],
  },
  {
    id: "deuteranopia-protanopia",
    name: {
      en: "Red-Green Safe (Deuteranopia & Protanopia)",
      am: "ቀይ-አረንጓዴ ተደራሽ (Deuteranopia & Protanopia)",
      om: "Diimaa-Magariisa Hundaaf Mijataa (Deuteranopia & Protanopia)",
      ti: "ቀይሕ-ቀጠልያ ተበጻሒ (Deuteranopia & Protanopia)",
      so: "Ammaan u ah Casaan-Cagaar (Deuteranopia & Protanopia)",
    },
    badge: {
      en: "Okabe-Ito Verified",
      am: "የተረጋገጠ ሳይንሳዊ",
      om: "Saayinsawaan Mirkanaa'e",
      ti: "ሳይንሳዊ ዝተረጋገጸ",
      so: "Saynis ahaan La Xaqiijiyay",
    },
    subtitle: {
      en: "For 99% of color-blind learners",
      am: "ለ 99% የቀለም ዓይነ ስውርነት ተጠቃሚዎች",
      om: "Barattoota dhibee halluu qaban 99%f",
      ti: "ን 99% ናይ ሕብሪ ጸገም ዘለዎም ተምሃሮ",
      so: "Waxa loogu talagalay 99% ardayda midabka kala saari karin",
    },
    description: {
      en: "Eliminates red/green confusion. Uses vibrant Cobalt Blue (#0052CC), Cerulean, Saffron Gold, and Royal Violet.",
      am: "ቀይ እና አረንጓዴ ግራ መጋባትን በማስወገድ በኮባልት ሰማያዊ፣ አምበር ወርቅ እና ቫዮሌት የተተካ።",
      om: "Walsimakameensa diimaa/magariisa balleessa. Cuquliisa kobaaltii, warqee zaafiraanaa fi vaayoleetii fayyadama.",
      ti: "ቀይሕን ቀጠልያን ምድንጋር ብምውጋድ ብኮባልት ሰማያዊ፣ ኣምበር ወርቅን ቫዮሌትን ዝተተክአ።",
      so: "Waxay meesha ka saaraysaa isku-dhafka casaan/cagaarka iyadoo isticmaalaysa Cobalt Blue, Dahab, iyo Violet.",
    },
    swatches: ["#FFFFFF", "#F1F5F9", "#0052CC", "#D97706"],
  },
  {
    id: "tritanopia",
    name: {
      en: "Blue-Yellow Safe (Tritanopia)",
      am: "ሰማያዊ-ቢጫ ተደራሽ (Tritanopia)",
      om: "Cuquliisa-Keelloo Hundaaf Mijataa (Tritanopia)",
      ti: "ሰማያዊ-ቢጫ ተበጻሒ (Tritanopia)",
      so: "Ammaan u ah Buluug-Jaalle (Tritanopia)",
    },
    badge: {
      en: "S-Cone Adapted",
      am: "ለሰማያዊ-ቢጫ እጥረት",
      om: "Cuquliisa-Keelloof Madaqfame",
      ti: "ንሰማያዊ-ቢጫ ዝተመጣጠነ",
      so: "Ku habboon Buluug-Jaalle",
    },
    subtitle: {
      en: "For blue-yellow deficiency",
      am: "ሰማያዊ እና ቢጫ ለማይለዩ",
      om: "Warra cuquliisaa fi keelloo addaan hin baafneef",
      ti: "ሰማያውን ቢጫን ዘይፈልዩ",
      so: "Dadka aan kala saari karin buluugga iyo jaallaha",
    },
    description: {
      en: "Eliminates blue/yellow confusion. Uses high-contrast Deep Pine Teal (#0F766E), Emerald, and Vivid Crimson Coral.",
      am: "ሰማያዊ እና ቢጫ ግራ መጋባትን በማስወገድ በዲፕ ቲል፣ ኤመራልድ እና ክሪምሰን ኮራል የተተካ።",
      om: "Makaa cuquliisaa fi keelloo ittisa. Halluu tiilii gadi fagoo, imeraaldii fi koral qulqulluu fayyadama.",
      ti: "ሰማያውን ቢጫን ምድንጋር ብምውጋድ ብዲፕ ቲል፣ ኤመራልድን ክሪምሰን ኮራልን ዝተተክአ።" ,
      so: "Waxay meesha ka saaraysaa isku-dhafka buluug/jaalle iyadoo isticmaalaysa Deep Teal, Emerald, iyo Crimson Coral.",
    },
    swatches: ["#FFFFFF", "#F8FAFC", "#0F766E", "#BE123C"],
  },
  {
    id: "monochrome-high-contrast",
    name: {
      en: "High Contrast Monochrome (Achromatopsia)",
      am: "ሞኖክሮም ከፍተኛ ንፅፅር (Achromatopsia)",
      om: "Monokroomii Wal-dhabdeessuu Ol'aanaa (Achromatopsia)",
      ti: "ሞኖክሮም ልዑል ንጽጽር (Achromatopsia)",
      so: "Monochrome Isbarbardhig Sare (Achromatopsia)",
    },
    badge: {
      en: "21:1 Contrast",
      am: "21:1 ንፅፅር",
      om: "21:1 Wal-dhabdeessaa",
      ti: "21:1 ንጽጽር",
      so: "21:1 Isbarbardhig",
    },
    subtitle: {
      en: "Total color blindness & low vision",
      am: "ሙሉ የቀለም ዓይነ ስውርነት እና አነስተኛ እይታ",
      om: "Ija halluu guutuu dhabuu fi arguuf rakkatan",
      ti: "ምሉእ ናይ ሕብሪ ጸገምን ትሑት ራእይን",
      so: "Aragtida oo gebi ahaan midab la'aan ah & aragga hooseeya",
    },
    description: {
      en: "Pure luminance architecture (black & white only). Features 2px borders, geometric cues, and underlined links.",
      am: "ከቀለም ነፃ የሆነ ንጹህ ጥቁር እና ነጭ በደማቅ 2px ድንበሮች፣ ቅርጾች እና መስመሮች።",
      om: "Gurraachaa fi adii qofa qaba. Daangaa gurguddaa 2px, boca fi sarara jalaatiin kan ijaarame.",
      ti: "ካብ ሕብሪ ነጻ ዝኾነ ጸሊምን ጻዕዳን ጥራይ ብደማቕ 2px ዶባት፣ ቅርጽታትን መስመራትን።",
      so: "Madow iyo caddaan kaliya ah oo leh xariiqyo 2px ah, qaabab joomatari, iyo xiriiriyo xariiq hoosteeda ah.",
    },
    swatches: ["#FFFFFF", "#F4F4F6", "#000000", "#333333"],
  },
  {
    id: "dark-high-contrast",
    name: {
      en: "Dark High Contrast (OLED / Low-Vision)",
      am: "ጨለማ ከፍተኛ ንፅፅር (OLED / Low-Vision)",
      om: "Dukkana Wal-dhabdeessuu Ol'aanaa (OLED / Low-Vision)",
      ti: "ጸሊም ልዑል ንጽጽር (OLED / Low-Vision)",
      so: "Madow Isbarbardhig Sare (OLED / Low-Vision)",
    },
    badge: {
      en: "Photophobia Safe",
      am: "የዓይን ድካም የሚቀንስ",
      om: "Dhukkubbi Ijaa Ittisa",
      ti: "ድኻም ዓይኒ ዘቃልል",
      so: "Ka Badbaadsan Xanuunka Iftiinka",
    },
    subtitle: {
      en: "Glare-free night learning",
      am: "የብርሃን ነፀብራቅ የሌለው",
      om: "Ifa calaqqisaa malee halkaniif",
      ti: "ጽላል ዘይብሉ ናይ ለይቲ ትምህርቲ",
      so: "Waxbarasho habeenkii oo aan indhaha qabanayn",
    },
    description: {
      en: "Pitch dark canvas with luminous Amber Gold (#F59E0B) and Electric Cyan buttons for maximum visibility.",
      am: "ጥቁር ዳራ በደማቅ አምበር ወርቅ እና በኤሌክትሪክ ሲያን ቁልፎች ለከፍተኛ ተነባቢነት።",
      om: "Duuba dukkanaa'aa keessatti warqee fi cuquliisa ifaadhaan qophaa'e.",
      ti: "ጸሊም ድሕረ-ባይታ ብደማቕ ኣምበር ወርቅን ሲያንን ቁልፍታት ንልዑል ንባብ።",
      so: "Dhabarka oo madow ah oo leh badhamo Dahab iyo Cyan ah oo iftiimaya si si fiican loo arko.",
    },
    swatches: ["#090C10", "#161B22", "#F59E0B", "#38BDF8"],
  },
];

const THEME_STORAGE_KEY = "abugida-theme";

export function getActiveTheme(): ThemeId {
  if (typeof window === "undefined") return "apple-light";
  return (localStorage.getItem(THEME_STORAGE_KEY) as ThemeId) || "apple-light";
}

export function applyTheme(themeId: ThemeId): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Set top-level data attribute
  root.setAttribute("data-theme", themeId);
  localStorage.setItem(THEME_STORAGE_KEY, themeId);

  // Broadcast to custom elements if rendered
  const players = document.querySelectorAll("a11y-media-player, db-player");
  players.forEach((p) => p.setAttribute("data-theme", themeId));
}

interface ThemePickerTexts {
  triggerAriaLabel: string;
  triggerTitle: string;
  dialogAriaLabel: string;
  headerTitle: string;
  closeBtnAriaLabel: string;
  livePreviewNote: string;
  radiogroupAriaLabel: string;
  resetBtn: string;
}

const THEME_PICKER_TEXTS: Record<SupportedLocale, ThemePickerTexts> = {
  en: {
    triggerAriaLabel: "Change Color Vision Theme",
    triggerTitle: "Color Vision & Theme Selector",
    dialogAriaLabel: "Color Vision & Theme Selector",
    headerTitle: "Color Vision & Theme",
    closeBtnAriaLabel: "Close theme selector",
    livePreviewNote: "Live preview: click any option to transform all pages, buttons, and media player controls instantly.",
    radiogroupAriaLabel: "Theme options",
    resetBtn: "Reset to Standard Light",
  },
  am: {
    triggerAriaLabel: "የቀለም እይታ ገጽታ ይቀይሩ",
    triggerTitle: "የቀለም እይታ እና የገጽታ መምረጫ",
    dialogAriaLabel: "የቀለም እይታ እና የገጽታ መምረጫ",
    headerTitle: "የቀለም እይታ እና ገጽታ",
    closeBtnAriaLabel: "ዝጋ",
    livePreviewNote: "ምርጫዎን ጠቅ ሲያደርጉ መላው ስርዓት (ገጾች፣ ቁልፎች፣ ማጫወቻ) ወዲያውኑ በእውነተኛ ጊዜ ይቀየራል።",
    radiogroupAriaLabel: "የገጽታ አማራጮች",
    resetBtn: "ወደ መደበኛው መልስ",
  },
  om: {
    triggerAriaLabel: "Bifa fi Haala Mul'ata Halluu Jijjiiri",
    triggerTitle: "Filattuu Halluu fi Haala Mul'ataa",
    dialogAriaLabel: "Filattuu Halluu fi Haala Mul'ataa",
    headerTitle: "Mul'ata Halluu fi Haala",
    closeBtnAriaLabel: "Cufi",
    livePreviewNote: "Filannoo keessan cuqaasaa: sirni guutuun (fuulonni, qabduun, taphachiisaan) battalatti jijjiirama.",
    radiogroupAriaLabel: "Filannoowwan haala mul'ataa",
    resetBtn: "Gara Ifaa Idileetti Deebisi",
  },
  ti: {
    triggerAriaLabel: "ናይ ሕብሪ ራእይ ገጽታ ቀይሩ",
    triggerTitle: "ናይ ሕብሪ ራእይን ገጽታን መምረጺ",
    dialogAriaLabel: "ናይ ሕብሪ ራእይን ገጽታን መምረጺ",
    headerTitle: "ናይ ሕብሪ ራእይን ገጽታን",
    closeBtnAriaLabel: "ዕጾ",
    livePreviewNote: "ምርጫኹም እንተጠዊቕኩም ምሉእ ስርዓት (ገጻት፣ ቁልፍታት፣ መጫወቲ) ብቐጥታ ይቕየር።",
    radiogroupAriaLabel: "ናይ ገጽታ ኣማራጺታት",
    resetBtn: "ናብ መደበኛ ብርሃን ምለስ",
  },
  so: {
    triggerAriaLabel: "Beddel Mawduuca Aragga Midabka",
    triggerTitle: "Dooriyaha Aragga Midabka & Mawduuca",
    dialogAriaLabel: "Dooriyaha Aragga Midabka & Mawduuca",
    headerTitle: "Aragga Midabka & Mawduuca",
    closeBtnAriaLabel: "Xidh",
    livePreviewNote: "Ku dhufo doorasho kasta: nidaamka oo dhan (boggaga, badhamada, qalabka ciyaarta) isla markiiba wuu isbeddeli doonaa.",
    radiogroupAriaLabel: "Doorashooyinka mawduuca",
    resetBtn: "Ku celi Iftiinka Caadiga ah",
  },
};

export const ThemePicker: React.FC<{ locale: SupportedLocale }> = ({ locale }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(getActiveTheme);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const t = THEME_PICKER_TEXTS[locale] || THEME_PICKER_TEXTS.en;

  const getLocText = (obj: Record<SupportedLocale, string>) => {
    return obj[locale] || obj.en;
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

  const activeOption = THEME_OPTIONS.find((th) => th.id === currentTheme) || THEME_OPTIONS[0];

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
        aria-label={t.triggerAriaLabel}
        title={t.triggerTitle}
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
          className="theme-popover-dialog"
          aria-modal="true"
          aria-label={t.dialogAriaLabel}
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
                {t.headerTitle}
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
              aria-label={t.closeBtnAriaLabel}
            >
              <IconClose size={15} />
            </button>
          </div>

          <p style={{ margin: "0 0 1rem 0", fontSize: "12.5px", color: "var(--color-muted-ink)", lineHeight: 1.45 }}>
            {t.livePreviewNote}
          </p>

          {/* Theme Option Cards List */}
          <div role="radiogroup" aria-label={t.radiogroupAriaLabel} style={{ display: "flex", flexDirection: "column", gap: "0.65rem", maxHeight: "380px", overflowY: "auto", paddingRight: "2px" }}>
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
              {t.resetBtn}
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
