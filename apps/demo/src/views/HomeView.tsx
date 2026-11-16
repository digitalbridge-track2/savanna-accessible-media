import { AccessibleJob } from "@abugida/lesson-schema";
import { SupportedLocale } from "@abugida/media-kit";
import React, { useEffect, useState } from "react";
import { IconExternal } from "../components/Icons";
import { JobCardItem } from "../components/JobCardItem";
import { NavLink } from "../router";

interface HomeViewProps {
  locale: SupportedLocale;
}

const HOME_TEXTS: Record<
  SupportedLocale,
  {
    heroTitle: string;
    heroDesc: string;
    openLesson: string;
    openStudio: string;
    scriptEmbed: string;
    adoptionHeading: string;
    l1Title: string;
    l1Desc: string;
    l1Btn: string;
    l2Title: string;
    l2Desc: string;
    l2Online: string;
    l2Offline: string;
    l3Title: string;
    l3Desc: string;
    l3Btn: string;
    careerHeading: string;
    careerDesc: string;
    noticeTitle: string;
    noticeDesc: string;
  }
> = {
  en: {
    heroTitle: "Build what works for everyone. Then everyone gets to work.",
    heroDesc:
      "Abugida Media Kit provides embeddable web components for learning platforms and job boards: keyboard-operated media, customizable subtitles in Ethiopian national languages, synchronized Ethiopian Sign Language, audio descriptions, lightweight 3G offline packages, and 200% zoom-resilient career cards.",
    openLesson: "Open Accessible Lesson",
    openStudio: "Open Caption Studio",
    scriptEmbed: "Script Tag Embed",
    adoptionHeading: "Adoption & Integration Levels",
    l1Title: "Level 1: Script Tag Drop-in",
    l1Desc:
      "Embed the player on any web page or LMS with a single line of HTML. Zero build steps required.",
    l1Btn: "View Embed Code",
    l2Title: "Level 2: REST API Pipeline",
    l2Desc:
      "Local FastAPI transcription and manifest pipeline with full OpenAPI 3.0 documentation.",
    l2Online: "API Online",
    l2Offline: "API Offline",
    l3Title: "Level 3: Open Standards & Credentials",
    l3Desc:
      "Compatible with schema.org/JobPosting microdata, standard WebVTT subtitles, and Savanna LMS.",
    l3Btn: "Verify Credential",
    careerHeading: "Career Gateway: Accessible Opportunities",
    careerDesc:
      "Opportunities with verified accommodation disclosures and 200% zoom reflow guarantee:",
    noticeTitle: "Demonstration Notice:",
    noticeDesc:
      "This demonstration environment uses mock fixtures and local test media. All credentials and job postings are strictly demonstration data.",
  },
  am: {
    heroTitle: "ለሁሉም የሚሰራ ነገር ይገንቡ። ከዚያ ሁሉም ወደ ሥራ ይገባል።",
    heroDesc:
      "አቡጊዳ ሚዲያ ኪት ለትምህርት መድረኮች እና ለሥራ ማስታወቂያ ሰሌዳዎች ተደራሽ የሆኑ የድር ክፍሎችን ያቀርባል፡ በኪቦርድ ብቻ የሚሰሩ ተጫዋቾች፣ በኢትዮጵያ ብሔራዊ ቋንቋዎች የተዘጋጁ የትርጉም ጽሑፎች፣ የኢትዮጵያ ምልክት ቋንቋ መስኮት፣ የድምፅ ማብራሪያ፣ ዝቅተኛ ዳታ 3G ጥቅል እና 200% ማጉላትን የሚቋቋሙ የሥራ ካርዶች።",
    openLesson: "ተደራሽ ትምህርቱን ይክፈቱ",
    openStudio: "የትርጉም ስቱዲዮ ይክፈቱ",
    scriptEmbed: "የስክሪፕት ታግ ማካተቻ",
    adoptionHeading: "የማካተት እና የማዋሃድ ደረጃዎች",
    l1Title: "ደረጃ 1፡ የስክሪፕት ታግ ማካተቻ",
    l1Desc:
      "በማንኛውም የድር ገጽ ወይም LMS (Savanna, Moodle) ላይ በአንድ መስመር HTML ኮድ በቀላሉ ይጫኑ። ምንም ተጨማሪ የግንባታ ቅድመ ሁኔታ የለውም።",
    l1Btn: "የማካተቻ ኮዱን ይመልከቱ",
    l2Title: "ደረጃ 2፡ የ REST ኤፒአይ ሰነዶች",
    l2Desc:
      "የአካባቢ ፈጣን FastAPI የድምፅ ትርጉም አገልግሎት ከሙሉ OpenAPI 3.0 Swagger ሰነዶች ጋር።",
    l2Online: "ኤፒአይ ኦንላይን",
    l2Offline: "ከመስመር ውጭ",
    l3Title: "ደረጃ 3፡ ክፍት ደረጃዎች እና ምስክር ወረቀት",
    l3Desc:
      "ከ schema.org/JobPosting ማይክሮዳታ፣ መደበኛ WebVTT ንዑስ ርዕሶች እና ከሳቫና LMS ማረጋገጫ ጋር ሙሉ ተኳሃኝ።",
    l3Btn: "የምስክር ወረቀት አረጋግጥ",
    careerHeading: "የሥራ መግቢያ በር፡ ክፍት የሥራ ዕድሎች",
    careerDesc: "200% ማጉላት እና የድምፅ ማጠቃለያ ያላቸው ክፍት የሥራ መደቦች፡",
    noticeTitle: "ማስታወሻ፡",
    noticeDesc:
      "ይህ የማሳያ አካባቢ የአካባቢ ሙከራ ፋይሎችን እና ምሳሌዎችን ይጠቀማል። ሁሉም ምስክር ወረቀቶች እና የሥራ ማስታወቂያዎች ለውድድሩ ማሳያ ብቻ የቀረቡ ናቸው።",
  },
  om: {
    heroTitle:
      "Waan hundaaf ta'u ijaaraa. Sana booda hunduu gara hojiitti gala.",
    heroDesc:
      "Abugida Media Kit meeshaalee weebii maxxanfamoo ta'an kanneen akka taaphachiisaa kiiboordiidhaan hojjetu, barreeffama afaanoota Itoophiyaa, Afaan Mallattoo Itoophiyaa, ibsa sagalee, kuusaa 3G fi kaardii hojii dhiyeessa.",
    openLesson: "Barnoota Hundaaf Mijataa Bani",
    openStudio: "Istuudiyoo Jechootaa Bani",
    scriptEmbed: "Koodii Maxxansaa",
    adoptionHeading: "Sadarkaalee Walitti Makuu fi Fayyadamaa",
    l1Title: "Sadarkaa 1: Maxxansa Koodii HTML",
    l1Desc:
      "Sarara HTML tokkoon fuula weebii ykn sirna LMS kamiyyuu irratti salphatti maxxansaa. Qophii dabalataa hin barbaadu.",
    l1Btn: "Koodii Maxxansaa Ilaali",
    l2Title: "Sadarkaa 2: Tajaajila REST API",
    l2Desc:
      "Tajaajila sagalee gara barreeffamaatti jijjiiruu FastAPI kan dokumantii OpenAPI 3.0 guutuu qabu.",
    l2Online: "API Hojjjechaa Jira",
    l2Offline: "API Cufameera",
    l3Title: "Sadarkaa 3: Ulaagaalee Banaa fi Waraqaa Ragaa",
    l3Desc:
      "Ulaagaalee schema.org/JobPosting, WebVTT fi sirna mirkaneessaa Savanna LMS waliin guutummaatti kan walta'u.",
    l3Btn: "Waraqaa Ragaa Mirkaneessi",
    careerHeading: "Karra Hojii: Carraawwan Hundaaf Mijatan",
    careerDesc:
      "Carraawwan hojii guddina 200% dandamatan fi ibsa sagalee qaban:",
    noticeTitle: "Hubachiisa:",
    noticeDesc:
      "Naannoon agarsiisaa kun qormaata fi faayiloota fakkeenyaa fayyadama. Waraqaan ragaa fi carraawwan hojii hunduu agarsiisaaf qofa kan qophaa'aniidha.",
  },
  ti: {
    heroTitle: "ንኹሉ ዝሰርሕ ነገር ህነጹ። ድሕሪኡ ኹሉ ናብ ስራሕ ይኣቱ።",
    heroDesc:
      "አቡጊዳ ሚዲያ ኪት ንትምህርቲ መድረኻትን ናይ ስራሕ ቦርድታትን ተበጻሕቲ ዌብ ኣካላት የቕርብ፡ ብኪቦርድ ዝሰርሕ፣ ብቋንቋታት ኢትዮጵያ ጽሑፍ ትርጉም፣ ምልክት ቋንቋ፣ ድምጺ መብርሂ፣ 3G ፓኬጅን ናይ ስራሕ ካርድታትን።",
    openLesson: "ተበጻሒ ትምህርቲ ኽፈት",
    openStudio: "ስቱዲዮ ትርጉም ኽፈት",
    scriptEmbed: "ናይ ስክሪፕት ታግ ምእታው",
    adoptionHeading: "ደረጃታት ምውህሃድን ምጥቃምን",
    l1Title: "ደረጃ 1፡ ናይ ስክሪፕት ታግ ምእታው",
    l1Desc:
      "ኣብ ዝኾነ ናይ ድህረ-ገጽ ወይ LMS (Savanna, Moodle) ብሓንቲ መስመር HTML ኮድ ብቐሊሉ ጽዓኑ። ተወሳኺ ህንጸት ኣየድልዮን።",
    l1Btn: "ናይ ምእታው ኮድ ርአ",
    l2Title: "ደረጃ 2፡ ናይ REST ኤፒአይ ሰነዳት",
    l2Desc:
      "ናይ ከባቢ ፈጣን FastAPI ናይ ድምጺ ትርጉም ኣገልግሎት ምስ ምሉእ OpenAPI 3.0 Swagger ሰነዳት።",
    l2Online: "ኤፒአይ ኦንላይን",
    l2Offline: "ካብ መስመር ወጻኢ",
    l3Title: "ደረጃ 3፡ ክፉት መዐቀኒታትን ምስክር ወረቐትን",
    l3Desc:
      "ምስ schema.org/JobPosting ማይክሮዳታ፣ መደበኛ WebVTT ንኡስ ኣርእስታትን ሳቫና LMS መረጋገጽን ምሉእ ብምሉእ ዝሰማማዕ።",
    l3Btn: "ምስክር ወረቐት ኣረጋግጽ",
    careerHeading: "ናይ ስራሕ መእተዊ ማዕጾ፡ ክፍቲ ናይ ስራሕ ዕድላት",
    careerDesc: "200% ምዕባይን ናይ ድምጺ ሓጺር መብርህን ዘለዎም ክፍቲ ናይ ስራሕ መደባት፡",
    noticeTitle: "መተሓሳሰቢ፡",
    noticeDesc:
      "እዚ ናይ መርኣያ ከባቢ ናይ ፈተነ ፋይላትን ኣብነታትን ይጥቀም። ኩሎም ምስክር ወረቐታትን ናይ ስራሕ ምልክታታትን ንመርኣያ ውድድር ጥራይ ዝቐረቡ እዮም።",
  },
  so: {
    heroTitle:
      "U dhis wax u shaqeeya qof kasta. Kadib qof walba wuxuu galaa shaqo.",
    heroDesc:
      "Abugida Media Kit wuxuu bixiyaa qalabka shabakadda ee lagu dhejin karo goobaha waxbarashada: muuqaal-gacmeedka kiiboodhka, qoraalada luqadaha Itoobiya, luqadda dhegoolaha, sharaxaadda codka, xirmada 3G, iyo kaadhadhka shaqada.",
    openLesson: "Fur Casharka La Heli Karo",
    openStudio: "Fur Istuudiyaha Qoraalka",
    scriptEmbed: "Koodhka Ku Dhejinta",
    adoptionHeading: "Heerarka Isku-dhafka iyo Isticmaalka",
    l1Title: "Heerka 1: Ku Dhejinta Koodhka HTML",
    l1Desc:
      "Ku dheji ciyaaryahanka bog kasta oo shabakad ah ama LMS adoo isticmaalaya hal xariiq oo HTML ah. Uma baahna tallaabooyin dhisid dheeraad ah.",
    l1Btn: "Eeg Koodhka Ku Dhejinta",
    l2Title: "Heerka 2: Khadka Adeegga REST API",
    l2Desc:
      "Adeegga qoraalka codka ee maxalliga ah ee FastAPI oo leh dukumentiyada buuxa ee OpenAPI 3.0.",
    l2Online: "API-ga Wuu Shaqaynayaa",
    l2Offline: "API-ga Wuu Dansan Yahay",
    l3Title: "Heerka 3: Halbeegyada Furan & Shahaadooyinka",
    l3Desc:
      "La jaanqaadi kara xogta schema.org/JobPosting, qoraallada WebVTT, iyo xaqiijinta Savanna LMS.",
    l3Btn: "Xaqiiji Shahaadada",
    careerHeading: "Albaabka Shaqada: Fursadaha La Heli Karo",
    careerDesc:
      "Fursadaha leh qoraalada la xaqiijiyay iyo dammaanadda weyneynta 200%:",
    noticeTitle: "Ogeysiis Muhiim ah:",
    noticeDesc:
      "Deegaankan tusaalaha ah wuxuu isticmaalaa xogta tijaabada ah. Dhammaan shahaadooyinka iyo xayeysiisyada shaqada waxaa loogu talagalay oo kaliya bandhigga tartanka.",
  },
};

export const HomeView: React.FC<HomeViewProps> = ({ locale }) => {
  const [jobs, setJobs] = useState<AccessibleJob[]>([]);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const t = HOME_TEXTS[locale] || HOME_TEXTS.en;

  useEffect(() => {
    // Fetch local demonstration jobs
    fetch("/jobs/jobs.json")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setJobs(data))
      .catch((err) => console.warn("Failed to load jobs:", err));

    const apiBaseUrl = import.meta.env.VITE_TRANSCRIPT_API_URL || "http://localhost:8000";
    // Check FastAPI health
    fetch(`${apiBaseUrl}/health`)
      .then((res) => res.ok)
      .then((online) => setApiOnline(online))
      .catch(() => setApiOnline(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{ marginBottom: "3.5rem" }}>
        <h2
          style={{
            fontSize: "44px",
            fontWeight: 600,
            color: "var(--color-ink)",
            margin: "0 0 1rem 0",
            lineHeight: 1.15,
            letterSpacing: "-0.015em",
          }}
        >
          {t.heroTitle}
        </h2>
        <p
          style={{
            fontSize: "19px",
            maxWidth: "68ch",
            color: "var(--color-muted-ink)",
            lineHeight: 1.5,
            marginBottom: "2rem",
          }}
        >
          {t.heroDesc}
        </p>

        <div
          style={{
            display: "flex",
            gap: "0.85rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <NavLink to="/lesson" className="btn btn-primary">
            {t.openLesson}
          </NavLink>
          <NavLink to="/studio" className="btn btn-outline">
            {t.openStudio}
          </NavLink>
          <NavLink to="/embed" className="btn btn-secondary">
            {t.scriptEmbed}
          </NavLink>
        </div>
      </section>

      {/* Adoption Levels Grid */}
      <section
        style={{ marginBottom: "4rem" }}
        aria-labelledby="heading-adoption"
      >
        <h3
          id="heading-adoption"
          style={{
            fontSize: "24px",
            fontWeight: 600,
            color: "var(--color-ink)",
            margin: "0 0 1.5rem 0",
            letterSpacing: "-0.008em",
          }}
        >
          {t.adoptionHeading}
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {/* Level 1 */}
          <div
            className="card"
            data-read-aloud="card"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                }}
              >
                <span className="badge badge-brand">Level 1</span>
              </div>
              <h4
                style={{
                  margin: "0 0 0.5rem 0",
                  fontSize: "1.15rem",
                  color: "var(--color-ink)",
                  fontWeight: 600,
                }}
              >
                {t.l1Title}
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "var(--color-muted-ink)",
                  lineHeight: 1.55,
                }}
              >
                {t.l1Desc}
              </p>
            </div>
            <div style={{ marginTop: "1.5rem" }}>
              <NavLink
                to="/embed"
                className="btn btn-outline"
                style={{
                  fontSize: "14px",
                  padding: "0.5rem 1rem",
                  minHeight: "38px",
                  width: "100%",
                }}
              >
                {t.l1Btn}
              </NavLink>
            </div>
          </div>

          {/* Level 2 */}
          <div
            className="card"
            data-read-aloud="card"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                }}
              >
                <span className="badge badge-brand">Level 2</span>
                {apiOnline !== null && (
                  <span
                    className={`badge ${apiOnline ? "badge-success" : "badge-neutral"}`}
                  >
                    {apiOnline ? t.l2Online : t.l2Offline}
                  </span>
                )}
              </div>
              <h4
                style={{
                  margin: "0 0 0.5rem 0",
                  fontSize: "1.15rem",
                  color: "var(--color-ink)",
                  fontWeight: 600,
                }}
              >
                {t.l2Title}
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "var(--color-muted-ink)",
                  lineHeight: 1.55,
                }}
              >
                {t.l2Desc}
              </p>
            </div>
            <div style={{ marginTop: "1.5rem" }}>
              <a
                href={import.meta.env.VITE_TRANSCRIPT_API_URL ? `${import.meta.env.VITE_TRANSCRIPT_API_URL}/docs` : "http://localhost:8000/docs"}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
                style={{
                  fontSize: "14px",
                  padding: "0.5rem 1rem",
                  minHeight: "38px",
                  width: "100%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.45rem",
                }}
              >
                <span>OpenAPI Swagger (/docs)</span>
                <IconExternal size={13} />
              </a>
            </div>
          </div>

          {/* Level 3 */}
          <div
            className="card"
            data-read-aloud="card"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                }}
              >
                <span className="badge badge-brand">Level 3</span>
              </div>
              <h4
                style={{
                  margin: "0 0 0.5rem 0",
                  fontSize: "1.15rem",
                  color: "var(--color-ink)",
                  fontWeight: 600,
                }}
              >
                {t.l3Title}
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "var(--color-muted-ink)",
                  lineHeight: 1.55,
                }}
              >
                {t.l3Desc}
              </p>
            </div>
            <div style={{ marginTop: "1.5rem" }}>
              <NavLink
                to="/verify"
                className="btn btn-outline"
                style={{
                  fontSize: "14px",
                  padding: "0.5rem 1rem",
                  minHeight: "38px",
                  width: "100%",
                }}
              >
                {t.l3Btn}
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* Career Gateway Section */}
      <section
        style={{ marginBottom: "3.5rem" }}
        aria-labelledby="heading-career-preview"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <h3
              id="heading-career-preview"
              style={{
                fontSize: "24px",
                fontWeight: 600,
                margin: "0 0 0.35rem 0",
                color: "var(--color-ink)",
                letterSpacing: "-0.008em",
              }}
            >
              {t.careerHeading}
            </h3>
            <p
              style={{
                margin: 0,
                color: "var(--color-muted-ink)",
                fontSize: "14px",
              }}
            >
              {t.careerDesc}
            </p>
          </div>
          <span className="badge badge-success">WCAG 1.4.10 Reflow Tested</span>
        </div>

        <div
          id="job-cards-container"
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {jobs.slice(0, 2).map((job) => (
            <JobCardItem key={job.id} job={job} locale={locale} />
          ))}
        </div>

        <div style={{ marginTop: "1.75rem", textAlign: "center" }}>
          <NavLink
            to="/careers"
            className="btn btn-primary"
            style={{
              padding: "0.65rem 1.6rem",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {locale === "am"
              ? `ሁሉንም ${jobs.length} የሥራ ዕድሎች በዝርዝር ማጣሪያዎች ይመልከቱ →`
              : locale === "om"
                ? `Carraawwan Hojii Hunda (${jobs.length}) Qorannoo Bal'aa Waliin Ilaalaa →`
                : locale === "ti"
                  ? `ንኹሎም ${jobs.length} ናይ ስራሕ ዕድላት ብዝርዝር ማጣረዪታት ርኣዩ →`
                  : locale === "so"
                    ? `Eeg Dhammaan ${jobs.length} Fursadaha Shaqo oo leh Shaandheeyeyaal Faahfaahsan →`
                    : `Explore All ${jobs.length} Accessible Opportunities with Detailed Filters →`}
          </NavLink>
        </div>
      </section>

      {/* Clean Professional Disclaimer */}
      <aside
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border-subtle)",
          padding: "1.25rem 1.5rem",
          borderRadius: "var(--radius-card)",
          fontSize: "13px",
          color: "var(--color-muted-ink)",
        }}
      >
        <strong style={{ color: "var(--color-ink)" }}>{t.noticeTitle}</strong>{" "}
        {t.noticeDesc}
      </aside>
    </div>
  );
};
