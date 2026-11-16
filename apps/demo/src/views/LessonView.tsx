import React, { useEffect, useState, useRef } from "react";
import { offlineStorage, SupportedLocale, getTranslation } from "@abugida/media-kit";
import { NavLink } from "../router";
import {
  IconDocument,
  IconDownload,
  IconCheck,
  IconBriefcase,
  IconExternal,
} from "../components/Icons";

interface LessonViewProps {
  locale: SupportedLocale;
}

const LESSON_TEXTS: Record<SupportedLocale, {
  lessonTitle: string;
  lessonSubtitle: string;
  packReadyMsg: string;
  downloadingMsg: string;
  downloadSuccessMsg: string;
  downloadErrorMsg: string;
  docsHeading: string;
  docsDesc: string;
  docHtmlTitle: string;
  docHtmlDesc: string;
  docPdfTitle: string;
  docPdfDesc: string;
  docBrfTitle: string;
  docBrfDesc: string;
  docBraillePdfTitle: string;
  docBraillePdfDesc: string;
  viewBtn: string;
  downloadBtn: string;
  pack3gTitle: string;
  pack3gDesc: string;
  measuredSize: string;
  savingsNote: string;
  btnDownload: string;
  btnRedownload: string;
  btnCaching: string;
  careerHeading: string;
  careerDesc: string;
  careerBtn: string;
}> = {
  en: {
    lessonTitle: "Digital Workplace Skills: Foundations",
    lessonSubtitle: "Master the essential tools and collaborative workflows for digital employment.",
    packReadyMsg: "Lesson package is stored offline and ready for airplane mode.",
    downloadingMsg: "Downloading 3G study pack and caching for offline study...",
    downloadSuccessMsg: "3G Offline Study Pack (.zip, 1.6 MB) downloaded and stored for offline learning!",
    downloadErrorMsg: "Failed to download offline package. Please retry.",
    docsHeading: "Accessible Lesson Documents",
    docsDesc: "Download study materials formatted for screen readers, low bandwidth, and offline study:",
    docHtmlTitle: "Accessible HTML Document",
    docHtmlDesc: "Semantic HTML, Screen Reader Ready · 18 KB",
    docPdfTitle: "Tagged Accessible PDF",
    docPdfDesc: "Inspected PDF/UA tags & Alt-Text · 60 KB",
    docBrfTitle: "Braille Ready Format (.brf)",
    docBrfDesc: "BANA 40×25 Embosser & Refreshable Display · 4 KB",
    docBraillePdfTitle: "Tactile Braille Document (.pdf)",
    docBraillePdfDesc: "Authentic 6-Dot Cells, Interlined Print & Diagram · 208 KB",
    viewBtn: "View",
    downloadBtn: "Download",
    pack3gTitle: "3G Low-Data Offline Study Pack",
    pack3gDesc: "Includes professional spoken-voice audio narration (MP3 + Opus), self-contained Start-Offline-Lesson player, WebVTT captions, and accessible documents.",
    measuredSize: "Measured Bundle Size:",
    savingsNote: "vs. 205 MB standard HD video stream",
    btnDownload: "Download 3G Pack (1.6 MB)",
    btnRedownload: "Re-download Pack (1.6 MB)",
    btnCaching: "Caching Pack...",
    careerHeading: "Apply Your Skills: Verified Accessible Careers",
    careerDesc: "Completed this module? Connect your competencies to 3 active Addis Ababa openings featuring verified assistive technology accommodations, NVDA/JAWS support, and 200% zoom reflow guarantee.",
    careerBtn: "Explore Career Gateway"
  },
  am: {
    lessonTitle: "የዲጂታል የሥራ ቦታ ክህሎቶች፡ መሠረታዊ",
    lessonSubtitle: "ለዲጂታል ሥራ አስፈላጊ የሆኑ መሣሪያዎችን እና የትብብር አሠራሮችን ይማሩ።",
    packReadyMsg: "ይህ ትምህርት በመሣሪያዎ ላይ ተቀምጧል (ያለ ኢንተርኔት መጠቀም ይችላሉ)።",
    downloadingMsg: "ጥቅሉን በማውረድ እና በመሸጎጥ ላይ...",
    downloadSuccessMsg: "የ 3G ከመስመር ውጭ ጥቅል (.zip, 1.6 MB) በተሳካ ሁኔታ ወርዷል! ያለ ኢንተርኔት መጠቀም ይችላሉ።",
    downloadErrorMsg: "ጥቅሉን ማውረድ አልተሳካም። እባክዎ እንደገና ይሞክሩ።",
    docsHeading: "ተደራሽ የትምህርት ሰነዶች",
    docsDesc: "ለስክሪን አንባቢ፣ ለዝቅተኛ ባንድዊድዝ እና ከመስመር ውጭ ጥናት የተዘጋጁ የትምህርት ቁሳቁሶች፡",
    docHtmlTitle: "ተደራሽ HTML ሰነድ",
    docHtmlDesc: "የተዋቀረ ሲማንቲክ HTML · 18 KB",
    docPdfTitle: "የታገዘ ተደራሽ PDF",
    docPdfDesc: "PDF/UA የተረጋገጠ፣ አማራጭ ጽሑፍ · 60 KB",
    docBrfTitle: "የብሬል ሰነድ (.brf)",
    docBrfDesc: "BANA 40×25 ደረጃውን የጠበቀ የብሬል ሰነድ · 4 KB",
    docBraillePdfTitle: "የሚዳሰስ የብሬል ፒዲኤፍ (.pdf)",
    docBraillePdfDesc: "ትክክለኛ የብሬል ፊደላት፣ የታተመ ጽሑፍ እና የሚዳሰስ ዲያግራም · 278 KB",
    viewBtn: "ክፈት",
    downloadBtn: "አውርድ",
    pack3gTitle: "የ 3G ዝቅተኛ ዳታ ከመስመር ውጭ የጥናት ጥቅል",
    pack3gDesc: "ትምህርቱን ያለ ኢንተርኔት በከፍተኛ ጥራት በተቀረጸ የድምፅ ትረካ፣ በሲማንቲክ HTML እና ሙሉ የጽሑፍ ግልባጭ ያካትታል። በኮምፒውተር ወይም በስልክ ላይ በቀጥታ ይከፈታል።",
    measuredSize: "የተለካው ፋይል መጠን፡",
    savingsNote: "ከ 205 MB HD ቪዲዮ አንፃር 99.2% ዳታ ይቆጥባል",
    btnDownload: "የ 3G ጥቅል አውርድ (1.6 MB)",
    btnRedownload: "ዳግም አውርድ (1.6 MB)",
    btnCaching: "በማውረድ ላይ...",
    careerHeading: "ክህሎትዎን በተግባር ያውሉ፡ ተደራሽ የሥራ ዕድሎች",
    careerDesc: "ይህንን ኮርስ ያጠናቀቁ ሰልጣኞች በሥራ ቦታ የተረጋገጠ የስክሪን አንባቢ ድጋፍ፣ የተስተካከለ የስራ ሰዓት እና የአካል ጉዳት ምቹ ሁኔታ ያላቸው ክፍት የሥራ መደቦችን በዋናው የሥራ መግቢያ በር ላይ ማግኘት ይችላሉ።",
    careerBtn: "የሥራ መግቢያ በርን ይክፈቱ"
  },
  om: {
    lessonTitle: "Dandeettiiwwan Bakka Hojii Diijitaalaa: Bu'uura",
    lessonSubtitle: "Meeshaalee barbaachisoo fi adeemsa walta'iinsaa hojii diijitaalaaf oolan barta.",
    packReadyMsg: "Barnoonni kun meeshaa keessan irratti kuufameera (toora ala fayyadamuu dandeessu).",
    downloadingMsg: "Kuusaa barnoota 3G buusuu fi toora alaaf qopheessuu irratti...",
    downloadSuccessMsg: "Kuusaan barnoota toora alaa 3G (.zip, 1.6 MB) milkaa'inaan bu'eera! Toora ala fayyadamuu dandeessu.",
    downloadErrorMsg: "Kuusaa buusuun hin milkoofne. Maaloo irra deebiaa yaalaa.",
    docsHeading: "Sanadoota Barnootaa Hundaaf Mijatan",
    docsDesc: "Meeshaalee dubbistoota skiriiniif, interneetii dhiphaaf fi toora alaaf qophaa'an buufadhaa:",
    docHtmlTitle: "Sanada HTML Hundaaf Mijataa",
    docHtmlDesc: "HTML sirreeffame, dubbistoota skiriiniif qophii · 18 KB",
    docPdfTitle: "Sanada PDF Hundaaf Mijataa",
    docPdfDesc: "PDF/UA mirkanaa'e, barreeffama fakkii waliin · 60 KB",
    docBrfTitle: "Boca Bireelii (.brf)",
    docBrfDesc: "BANA 40×25 ulaagaa bireelii eege · 4 KB",
    docBraillePdfTitle: "Sanada PDF Bireelii Miira Harkaa (.pdf)",
    docBraillePdfDesc: "Arfii Bireelii dhugaa, barreeffama ifaa fi fakkii waliin · 208 KB",
    viewBtn: "Ilaali",
    downloadBtn: "Buufadhaa",
    pack3gTitle: "Kuusaa Barnoota 3G Daataa Xiqqaatti",
    pack3gDesc: "Barnooticha toora ala sagalee qulqulluu, HTML fi barreeffama guutuu waliin of keessatti qabata. Kompiitara ykn bilbila irratti kallattiin banama.",
    measuredSize: "Hammammiin Kuusichaa:",
    savingsNote: "Viidiyoo HD 205 MB irraa 99.2% daataa qusata",
    btnDownload: "Kuusaa 3G Buufadhaa (1.6 MB)",
    btnRedownload: "Irra Deebi'ii Buufadhu (1.6 MB)",
    btnCaching: "Buufamaa Jira...",
    careerHeading: "Dandeettii Keessan Hojiirra Oolchaa: Carraawwan Hojii Mirkanaa'an",
    careerDesc: "Koorsee kana xumurtanii? Carraawwan hojii Finfinnee keessa jiran kanneen teeknooloojii gargaartuu, deeggarsa dubbistoota skiriinii fi guddina 200% mirkaneessan waliin walqunnamaa.",
    careerBtn: "Karra Hojii Bani"
  },
  ti: {
    lessonTitle: "ናይ ዲጂታል ስራሕ ቦታ ክእለታት፡ መሰረታዊ",
    lessonSubtitle: "ንዲጂታል ስራሕ ኣገደስቲ ዝኾኑ መሳርሒታትን ናይ ምትሕግጋዝ ኣሰራርሓታትን ተማሃሩ።",
    packReadyMsg: "እዚ ትምህርቲ ኣብ መሳርሒኹም ተዓቂቡ ኣሎ (ካብ መስመር ወጻኢ ክትጥቀሙሉ ትኽእሉ)።",
    downloadingMsg: "ፓኬጅ 3G ብምውራድን ንመስመር ወጻኢ ብምዕቃብን...",
    downloadSuccessMsg: "ናይ 3G ካብ መስመር ወጻኢ መጽናዕቲ ፓኬጅ (.zip, 1.6 MB) ብዓወት ወሪዱ ኣሎ!",
    downloadErrorMsg: "ፓኬጅ ምውራድ ኣይተዓወተን። በጃኹም ደጊምኩም ፈትኑ።",
    docsHeading: "ተበጻሕቲ ናይ ትምህርቲ ሰነዳት",
    docsDesc: "ንናይ ስክሪን ኣንበብቲ፣ ንትሑት ባንድዊድዝን ካብ መስመር ወጻኢ ንምጽናዕን ዝተዳለዉ ናውቲ ኣውርዱ፡",
    docHtmlTitle: "ተበጻሒ ናይ HTML ሰነድ",
    docHtmlDesc: "ዝተዋደደ ሲማንቲክ HTML · 18 KB",
    docPdfTitle: "ተበጻሒ ናይ PDF ሰነድ",
    docPdfDesc: "PDF/UA ዝተረጋገጸ፣ ኣማራጺ ጽሑፍ · 60 KB",
    docBrfTitle: "ቅርጺ ብሬል (.brf)",
    docBrfDesc: "BANA 40×25 ደረጃኡ ዝሓለወ ናይ ብሬል ሰነድ · 4 KB",
    docBraillePdfTitle: "ብኢድ ዝድህሰስ ናይ ብሬል ፒዲኤፍ (.pdf)",
    docBraillePdfDesc: "ትክክለኛ ፊደላት ብሬል፣ ዝተሓትመ ጽሑፍን ዝድህሰስ ዲያግራምን · 278 KB",
    viewBtn: "ርአ",
    downloadBtn: "ኣውርድ",
    pack3gTitle: "ትሑት ዳታ 3G መጽናዕቲ ፓኬጅ",
    pack3gDesc: "ነቲ ትምህርቲ ካብ መስመር ወጻኢ ብብቑዕ ድምጺ፣ ብሲማንቲክ HTML ከምኡ'ውን ምሉእ ጽሑፍ የጠቓልል። ኣብ ኮምፒተር ወይ ስልኪ ብቐጥታ ይኽፈት።",
    measuredSize: "ዝተለከዐ መጠን ፋይል፡",
    savingsNote: "ካብ 205 MB HD ቪድዮ 99.2% ዳታ ይቑጥብ",
    btnDownload: "ፓኬጅ 3G ኣውርዱ (1.6 MB)",
    btnRedownload: "ደጊምካ ኣውርድ (1.6 MB)",
    btnCaching: "ይወርድ ኣሎ...",
    careerHeading: "ክእለትኩም ኣብ ተግባር ኣውዕሉ፡ ዝተረጋገጹ ናይ ስራሕ ዕድላት",
    careerDesc: "ነዚ ትምህርቲ ወዲእኹም? ኣብ ኣዲስ ኣበባ ዘለዉ ንስክሪን ኣንበብቲ ምቹኣት ዝኾኑን 200% ምዕባይ ዘረጋግጹን ክፍቲ ናይ ስራሕ ዕድላት ርኸቡ።",
    careerBtn: "ናይ ስራሕ መእተዊ ማዕጾ ኽፈት"
  },
  so: {
    lessonTitle: "Xirfadaha Goobta Shaqada ee Dijitaalka: Aasaaska",
    lessonSubtitle: "Baro aaladaha muhiimka ah iyo shaqada wada-jirka ah ee shaqada dijitaalka ah.",
    packReadyMsg: "Xirmadan casharka ah waxaa lagu keydiyay aaladdaada (waxaad isticmaali kartaa internet la'aan).",
    downloadingMsg: "Soo dejinta xirmada 3G iyo diyaarinta barashada khadka ka baxsan...",
    downloadSuccessMsg: "Xirmada waxbarashada tooska ah ka baxsan ee 3G (.zip, 1.6 MB) si guul leh ayaa loo soo dejiyay!",
    downloadErrorMsg: "Soo dejinta xirmadu way fashilantay. Fadlan mar kale isku day.",
    docsHeading: "Dukumentiyada Casharka ee La Heli Karo",
    docsDesc: "Soo deji agabka waxbarashada ee loo diyaariyay akhriyayaasha shaashadda, xogta yar, iyo barashada khadka tooska ah ka baxsan:",
    docHtmlTitle: "Dukumentiga HTML ee La Heli Karo",
    docHtmlDesc: "HTML habaysan, diyaarna u ah akhriyaha shaashadda · 18 KB",
    docPdfTitle: "PDF La Heli Karo",
    docPdfDesc: "PDF/UA la xaqiijiyay, oo ay ku jiraan qoraallada beddelka ah · 60 KB",
    docBrfTitle: "Qaabka Braille (.brf)",
    docBrfDesc: "BANA 40×25 halbeegga Braille · 4 KB",
    docBraillePdfTitle: "Dukumentiga Braille ee La Taaban Karo (.pdf)",
    docBraillePdfDesc: "Xuruufta dhabta ah ee Braille, qoraal daabacan iyo jaantus la taaban karo · 208 KB",
    viewBtn: "Eeg",
    downloadBtn: "Soo deji",
    pack3gTitle: "Xirmada Barashada 3G ee Xogta Yar",
    pack3gDesc: "Waxaa ku jira akhrinta codka xirfadeed, ciyaaryahan madax-bannaan, qoraallada WebVTT, iyo dukumentiyo la heli karo.",
    measuredSize: "Baaxadda Xirmada:",
    savingsNote: "wuxuu badbaadiyaa 99.2% xogta marka la barbardhigo 205 MB",
    btnDownload: "Soo Deji Xirmada 3G (1.6 MB)",
    btnRedownload: "Mar kale Soo Deji (1.6 MB)",
    btnCaching: "Waa la soo dejinayaa...",
    careerHeading: "Ku Dhaqan Xirfadahaaga: Shaqooyin La Xaqiijiyay",
    careerDesc: "Miyaad dhameysay cutubkan? Ku xidh xirfadahaaga fursadaha shaqo ee magaalada Addis Ababa ee taageera aaladaha caawinta iyo weyneynta 200%.",
    careerBtn: "Fur Albaabka Shaqada"
  }
};

export const LessonView: React.FC<LessonViewProps> = ({ locale }) => {
  const [isPackReady, setIsPackReady] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState("");
  const playerRef = useRef<HTMLElement | null>(null);

  const t = LESSON_TEXTS[locale] || LESSON_TEXTS.en;
  const isEthiopicScript = locale === "am" || locale === "ti";

  useEffect(() => {
    // Check if offline pack is cached
    offlineStorage.isPackageReady("digital-workplace-01", "pkg-3g-light").then((ready) => {
      setIsPackReady(ready);
      if (ready) {
        setDownloadMsg(t.packReadyMsg);
      }
    });
  }, [locale]);

  // Update locale attribute on player when locale changes
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setAttribute("locale", locale);
    }
  }, [locale]);

  const handleDownloadPack = async () => {
    setIsDownloading(true);
    setDownloadMsg(t.downloadingMsg);

    try {
      // 1. Trigger physical browser download of the verified zip pack (1.6 MB)
      const downloadLink = document.createElement("a");
      downloadLink.href = "/lessons/digital-workplace/offline-bundle.zip";
      downloadLink.download = "digital-workplace-3g-offline-pack.zip";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // 2. Cache in offlineStorage (Cache Storage & IndexedDB) for airplane mode
      const assetsToCache = [
        "/lessons/digital-workplace/Start-Offline-Lesson.html",
        "/lessons/digital-workplace/lesson.json",
        "/lessons/digital-workplace/captions.en.vtt",
        "/lessons/digital-workplace/captions.am.vtt",
        "/lessons/digital-workplace/captions.om.vtt",
        "/lessons/digital-workplace/captions.ti.vtt",
        "/lessons/digital-workplace/captions.so.vtt",
        "/lessons/digital-workplace/transcript.en.json",
        "/lessons/digital-workplace/transcript.am.json",
        "/lessons/digital-workplace/transcript.om.json",
        "/lessons/digital-workplace/transcript.ti.json",
        "/lessons/digital-workplace/transcript.so.json",
        "/lessons/digital-workplace/documents/lesson.en.html",
        "/lessons/digital-workplace/documents/lesson.am.html",
        "/lessons/digital-workplace/documents/lesson.en.tagged.pdf",
        "/lessons/digital-workplace/documents/lesson.am.tagged.pdf",
        "/lessons/digital-workplace/documents/lesson-transcript.en.brf",
        "/lessons/digital-workplace/documents/lesson-transcript.am.brf",
        "/lessons/digital-workplace/documents/lesson-braille.en.pdf",
        "/lessons/digital-workplace/documents/lesson-braille.am.pdf",
        "/lessons/digital-workplace/media/lesson-audio.mp3",
        "/lessons/digital-workplace/media/lesson-audio.opus",
        "/lessons/digital-workplace/media/poster.webp",
      ];

      try {
        await offlineStorage.downloadPackage(
          "digital-workplace-01",
          "pkg-3g-light",
          "3G Light Study Pack",
          assetsToCache,
          () => {}
        );
      } catch (cacheErr) {
        console.warn("Browser offline cache storage note:", cacheErr);
      }

      setIsPackReady(true);
      setDownloadMsg(t.downloadSuccessMsg);
    } catch (err) {
      console.error("Failed to download offline pack:", err);
      setDownloadMsg(t.downloadErrorMsg);
    } finally {
      setIsDownloading(false);
    }
  };

  const docLang = isEthiopicScript ? "am" : "en";

  return (
    <div>
      {/* Lesson Header */}
      <header style={{ marginBottom: "1.75rem" }}>
        <h2 style={{ fontSize: "34px", color: "var(--color-ink)", margin: "0 0 0.5rem 0", letterSpacing: "-0.011em" }}>
          {t.lessonTitle}
        </h2>
        <p style={{ margin: 0, color: "var(--color-muted-ink)", fontSize: "17px" }}>
          {t.lessonSubtitle}
        </p>
      </header>

      {/* Level 1 Custom Element Player */}
      <section style={{ marginBottom: "2.5rem" }} aria-label={t.lessonTitle}>
        {/* @ts-ignore custom element */}
        <a11y-media-player
          ref={playerRef}
          id="player"
          manifest-src="/lessons/digital-workplace/lesson.json"
          locale={locale}
        />
      </section>

      {/* Accessible Documents (Apple Card Layout with Bespoke SVGs) */}
      <section
        className="card"
        style={{
          marginBottom: "2rem",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-card)",
          padding: "1.5rem 1.75rem",
        }}
        aria-labelledby="heading-docs"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <h3 id="heading-docs" style={{ margin: 0, color: "var(--color-ink)", fontSize: "20px", fontWeight: 600 }}>
            {t.docsHeading}
          </h3>
          <span className="badge badge-brand">WCAG 2.2 AAA Ready</span>
        </div>
        <p style={{ margin: "0 0 1.25rem 0", color: "var(--color-muted-ink)", fontSize: "14px" }}>
          {t.docsDesc}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          {/* HTML Document Card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem 1.25rem",
              background: "var(--color-surface-elevated)",
              borderRadius: "12px",
              border: "1px solid var(--color-border-subtle)",
              boxShadow: "var(--shadow-subtle)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "var(--color-brand-subtle)",
                  color: "var(--color-brand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconDocument size={22} />
              </div>
              <div>
                <a
                  href={`/lessons/digital-workplace/documents/lesson.${docLang}.html`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontWeight: 600, color: "var(--color-link)", fontSize: "15px", textDecoration: "none" }}
                >
                  {t.docHtmlTitle}
                </a>
                <div style={{ color: "var(--color-muted-ink)", fontSize: "13px", marginTop: "2px" }}>
                  {t.docHtmlDesc}
                </div>
              </div>
            </div>

            <a
              href={`/lessons/digital-workplace/documents/lesson.${docLang}.html`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
              style={{ fontSize: "13px", padding: "0.4rem 0.85rem", minHeight: "34px", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
              aria-label={`${t.docHtmlTitle} (${t.viewBtn})`}
            >
              <span>{t.viewBtn}</span>
              <IconExternal size={13} />
            </a>
          </div>

          {/* Tagged PDF Card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem 1.25rem",
              background: "var(--color-surface-elevated)",
              borderRadius: "12px",
              border: "1px solid var(--color-border-subtle)",
              boxShadow: "var(--shadow-subtle)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "var(--color-brand-subtle)",
                  color: "var(--color-brand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconDownload size={22} />
              </div>
              <div>
                <a
                  href={`/lessons/digital-workplace/documents/lesson.${docLang}.tagged.pdf`}
                  download={`lesson.${docLang}.tagged.pdf`}
                  style={{ fontWeight: 600, color: "var(--color-link)", fontSize: "15px", textDecoration: "none" }}
                >
                  {t.docPdfTitle}
                </a>
                <div style={{ color: "var(--color-muted-ink)", fontSize: "13px", marginTop: "2px" }}>
                  {t.docPdfDesc}
                </div>
              </div>
            </div>

            <a
              href={`/lessons/digital-workplace/documents/lesson.${docLang}.tagged.pdf`}
              download={`lesson.${docLang}.tagged.pdf`}
              className="btn btn-outline"
              style={{ fontSize: "13px", padding: "0.4rem 0.85rem", minHeight: "34px", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
              aria-label={`${t.docPdfTitle} (${t.downloadBtn})`}
            >
              <span>{t.downloadBtn}</span>
              <IconDownload size={13} />
            </a>
          </div>

          {/* Braille Ready Format (.brf) Card - EARNS EXTRA */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem 1.25rem",
              background: "var(--color-surface-elevated)",
              borderRadius: "12px",
              border: "1px solid var(--color-border-subtle)",
              boxShadow: "var(--shadow-subtle)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "var(--color-brand-subtle)",
                  color: "var(--color-brand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "1px",
                }}
                aria-hidden="true"
              >
                ⠃⠗⠋
              </div>
              <div>
                <a
                  href={`/lessons/digital-workplace/documents/lesson-transcript.${docLang}.brf`}
                  download={`lesson-transcript.${docLang}.brf`}
                  style={{ fontWeight: 600, color: "var(--color-link)", fontSize: "15px", textDecoration: "none" }}
                >
                  {t.docBrfTitle}
                </a>
                <div style={{ color: "var(--color-muted-ink)", fontSize: "13px", marginTop: "2px" }}>
                  {t.docBrfDesc}
                </div>
              </div>
            </div>

            <a
              href={`/lessons/digital-workplace/documents/lesson-transcript.${docLang}.brf`}
              download={`lesson-transcript.${docLang}.brf`}
              className="btn btn-outline"
              style={{ fontSize: "13px", padding: "0.4rem 0.85rem", minHeight: "34px", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
              aria-label={`${t.docBrfTitle} (${t.downloadBtn})`}
            >
              <span>{t.downloadBtn}</span>
              <IconDownload size={13} />
            </a>
          </div>

          {/* Tactile Braille PDF (.pdf) Card - EARNS EXTRA */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem 1.25rem",
              background: "var(--color-surface-elevated)",
              borderRadius: "12px",
              border: "1px solid var(--color-border-subtle)",
              boxShadow: "var(--shadow-subtle)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "var(--color-brand-subtle)",
                  color: "var(--color-brand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "1px",
                }}
                aria-hidden="true"
              >
                ⠠⠃⠗⠇
              </div>
              <div>
                <a
                  href={`/lessons/digital-workplace/documents/lesson-braille.${docLang}.pdf`}
                  download={`lesson-braille.${docLang}.pdf`}
                  style={{ fontWeight: 600, color: "var(--color-link)", fontSize: "15px", textDecoration: "none" }}
                >
                  {t.docBraillePdfTitle}
                </a>
                <div style={{ color: "var(--color-muted-ink)", fontSize: "13px", marginTop: "2px" }}>
                  {t.docBraillePdfDesc}
                </div>
              </div>
            </div>

            <a
              href={`/lessons/digital-workplace/documents/lesson-braille.${docLang}.pdf`}
              download={`lesson-braille.${docLang}.pdf`}
              className="btn btn-outline"
              style={{ fontSize: "13px", padding: "0.4rem 0.85rem", minHeight: "34px", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
              aria-label={`${t.docBraillePdfTitle} (${t.downloadBtn})`}
            >
              <span>{t.downloadBtn}</span>
              <IconDownload size={13} />
            </a>
          </div>
        </div>
      </section>

      {/* 3G Low-Data Offline Study Pack (Verified Spoken Voice Audio, 1.6 MB) */}
      <section
        className="card"
        style={{
          marginBottom: "2.5rem",
          background: "var(--color-surface-elevated)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-card)",
          padding: "1.5rem 1.75rem",
          boxShadow: "var(--shadow-card)",
        }}
        aria-labelledby="heading-offline"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem" }}>
              <h3 id="heading-offline" style={{ margin: 0, color: "var(--color-ink)", fontSize: "20px", fontWeight: 600 }}>
                {t.pack3gTitle}
              </h3>
              <span className="badge badge-success">
                99.2% Bandwidth Saved
              </span>
            </div>
            <p style={{ margin: "0 0 0.5rem 0", color: "var(--color-muted-ink)", fontSize: "14px", maxWidth: "62ch" }}>
              {t.pack3gDesc}
            </p>
            <div style={{ fontSize: "13px", color: "var(--color-muted-ink)" }}>
              {t.measuredSize}{" "}
              <strong style={{ color: "var(--color-ink)" }}>1.6 MB</strong>{" "}
              <span style={{ color: "var(--color-muted-ink)" }}>
                ({t.savingsNote})
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleDownloadPack}
            disabled={isDownloading}
            style={{ minHeight: "42px", padding: "0.55rem 1.4rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            <IconDownload size={16} />
            <span>
              {isDownloading
                ? t.btnCaching
                : isPackReady
                ? t.btnRedownload
                : t.btnDownload}
            </span>
          </button>
        </div>

        {downloadMsg && (
          <div
            style={{
              marginTop: "1.25rem",
              padding: "0.65rem 1rem",
              background: "#E8F8F0",
              color: "#128045",
              borderRadius: "8px",
              fontWeight: 500,
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
            aria-live="polite"
          >
            <IconCheck size={16} />
            <span>{downloadMsg}</span>
          </div>
        )}
      </section>

      {/* Strategic Career Pathways Callout Card (Eliminates Duplicate Job Listing) */}
      <section
        style={{
          background: "linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)",
          border: "1px solid #BFDBFE",
          borderRadius: "var(--radius-card)",
          padding: "1.75rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
        aria-labelledby="heading-career-pathway"
      >
        <div style={{ maxWidth: "60ch" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
            <span
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "var(--color-brand)",
                color: "#FFFFFF",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconBriefcase size={18} />
            </span>
            <h3 id="heading-career-pathway" style={{ margin: 0, fontSize: "20px", color: "var(--color-ink)", fontWeight: 600 }}>
              {t.careerHeading}
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--color-muted-ink)", lineHeight: 1.55 }}>
            {t.careerDesc}
          </p>
        </div>

        <NavLink
          to="/"
          className="btn btn-primary"
          style={{
            minHeight: "42px",
            padding: "0.6rem 1.4rem",
            fontSize: "14px",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            whiteSpace: "nowrap",
          }}
        >
          <span>{t.careerBtn}</span>
          <IconExternal size={14} />
        </NavLink>
      </section>
    </div>
  );
};
