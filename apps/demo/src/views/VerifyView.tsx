import React, { useState, useEffect } from "react";
import { formatDualDate, SupportedLocale } from "@abugida/media-kit";
import { generateQRSVG } from "../utils/qr-code";
import {
  IconCheck,
  IconAlert,
  IconLink,
  IconBadge,
  IconDownload,
  IconCopy,
  IconShare,
  IconExternal,
} from "../components/Icons";

export interface DemoCertificate {
  id: string;
  title: Record<string, string>;
  issuer: string;
  issueDateISO: string;
  issueDateEthiopic: string;
  learnerDisplayName: string;
  skills?: string[];
  isDemonstrationData?: boolean;
}

const DEFAULT_REGISTRY: DemoCertificate[] = [
  {
    id: "CERT-DB-2026-0042",
    title: {
      en: "Digital Workplace Skills: Foundations",
      am: "የዲጂታል የሥራ ቦታ ክህሎቶች፡ መሠረታዊ",
      om: "Dandeettiiwwan Bakka Hojii Diijitaalaa: Bu'uura",
      ti: "ናይ ዲጂታል ስራሕ ቦታ ክእለታት፡ መሰረታዊ",
      so: "Xirfadaha Goobta Shaqada ee Dijitaalka ah: Aasaaska",
    },
    issuer: "Savanna Learning Platform · Digital Bridge 2026",
    issueDateISO: "2026-11-14",
    issueDateEthiopic: "ህዳር 5፣ 2019 ዓ.ም",
    learnerDisplayName: "Demonstration Learner",
    skills: ["Digital Collaboration", "Accessibility Literacy", "Ethiopian Sign Language Basics"],
    isDemonstrationData: true,
  },
  {
    id: "CERT-DB-2026-0088",
    title: {
      en: "Inclusive Media & Assistive Technology Specialist",
      am: "አሳታፊ ሚዲያ እና አጋዥ ቴክኖሎጂ ስፔሻሊስት",
      om: "Ogeessa Miidiyaa Hunda Qaqqabaa fi Teeknooloojii Gargaarsaa",
      ti: "ስፔሻሊስት ሓቛፊ ሚዲያን ሓጋዚ ቴክኖሎጂን",
      so: "Khabiirka Warbaahinta loo wada siman yahay & Farsamada Caawinta",
    },
    issuer: "Savanna Learning Platform · Digital Bridge 2026",
    issueDateISO: "2026-11-14",
    issueDateEthiopic: "ህዳር 5፣ 2019 ዓ.ም",
    learnerDisplayName: "Abebe Bikila (Specialist Track)",
    skills: ["WCAG 2.2 AAA Audit", "WebVTT Synchronized Captions", "Assistive UX Co-Design"],
    isDemonstrationData: true,
  },
];

interface VerifyTexts {
  pageTitle: string;
  pageSubtitle: string;
  statusHeading: string;
  registryLookup: string;
  demoPresets: string;
  presetFoundations: string;
  presetSpecialist: string;
  formAriaLabel: string;
  credentialIdLabel: string;
  verifyBtn: string;
  verifiedHeading: string;
  verifiedBadge: string;
  labelId: string;
  labelRecipient: string;
  labelCourse: string;
  labelIssuer: string;
  labelIssueDate: string;
  labelSkills: string;
  notFoundHeading: string;
  notFoundMessage: (id: string) => string;
  permalinkHeading: string;
  permalinkBadge: string;
  permalinkDesc: string;
  permalinkAriaLabel: string;
  copyLinkBtn: string;
  shareBtn: string;
  shareTitle: string;
  openTabBtn: string;
  openTabTitle: string;
  copySuccess: string;
  qrHeading: string;
  qrDesc: string;
  qrAriaLabel: string;
  qrDownloadBtn: string;
  obv3Btn: string;
  obv3DownloadBtn: string;
  disclosureHeading: string;
  disclosureBody: string;
}

const VERIFY_TEXTS: Record<SupportedLocale, VerifyTexts> = {
  en: {
    pageTitle: "Certificate Credential Verification",
    pageSubtitle: "Transparent, verifiable credentials for employers, HR platforms, and educational institutions.",
    statusHeading: "Credential Status",
    registryLookup: "Verification lookup in Savanna LMS demonstration registry:",
    demoPresets: "Demo Presets:",
    presetFoundations: "CERT-DB-2026-0042 (Foundations)",
    presetSpecialist: "CERT-DB-2026-0088 (A11y Specialist)",
    formAriaLabel: "Credential lookup form",
    credentialIdLabel: "Credential ID:",
    verifyBtn: "Verify",
    verifiedHeading: "Demonstrated Credential Verified",
    verifiedBadge: "Verified",
    labelId: "Credential ID:",
    labelRecipient: "Recipient:",
    labelCourse: "Course:",
    labelIssuer: "Issuer:",
    labelIssueDate: "Issue Date:",
    labelSkills: "Verified Skills:",
    notFoundHeading: "Credential not found",
    notFoundMessage: (id: string) => `Credential not found in Savanna LMS demonstration registry for "${id}". Please check the ID and try again.`,
    permalinkHeading: "Shareable Verification Permalink",
    permalinkBadge: "Public Verification Endpoint · Zero Auth Required",
    permalinkDesc: "Permanent canonical link for resumes, LinkedIn certifications, job applications, and automated ATS credential crawlers.",
    permalinkAriaLabel: "Canonical Verification Permalink",
    copyLinkBtn: "Copy Link",
    shareBtn: "Share...",
    shareTitle: "Share credential link",
    openTabBtn: "Open Tab",
    openTabTitle: "Open verification link in new tab",
    copySuccess: "Shareable verification link copied! Ready for recruiters and LinkedIn.",
    qrHeading: "Scan to Verify on Mobile",
    qrDesc: "Employers and admissions officers can scan this QR code with any smartphone camera to instantly load the official cryptographic verification record.",
    qrAriaLabel: "Mobile Verification QR Code",
    qrDownloadBtn: "Download QR Code (SVG)",
    obv3Btn: "Open Badges 3.0 (OBv3)",
    obv3DownloadBtn: "Download Open Badge (.jsonld)",
    disclosureHeading: "Open Standards & Compliance Disclosure:",
    disclosureBody: "Engineered in accordance with W3C Verifiable Credentials 2.0, 1EdTech Open Badges 3.0, and Schema.org educational standards. Synchronized between the Ethiopian calendar (Hidar 5, 2019 E.C.) and ISO 8601.",
  },
  am: {
    pageTitle: "የምስክር ወረቀት ማረጋገጫ",
    pageSubtitle: "ለቀጣሪዎች እና ለትምህርት ተቋማት ክፍት እና አስተማማኝ የማረጋገጫ መድረክ",
    statusHeading: "የምስክር ወረቀት ሁኔታ",
    registryLookup: "በተረጋገጠው ማዕከላዊ መዝገብ ውስጥ የተገኘ ውጤት፡",
    demoPresets: "የናሙና መለያዎች፡",
    presetFoundations: "CERT-DB-2026-0042 (መሠረታዊ)",
    presetSpecialist: "CERT-DB-2026-0088 (ተደራሽነት ስፔሻሊስት)",
    formAriaLabel: "የምስክር ወረቀት መለያ መፈለጊያ",
    credentialIdLabel: "የምስክር ወረቀት መለያ ቁጥር (Credential ID):",
    verifyBtn: "አረጋግጥ",
    verifiedHeading: "የተረጋገጠ ትክክለኛ ምስክር ወረቀት",
    verifiedBadge: "ትክክለኛ",
    labelId: "የመለያ ቁጥር:",
    labelRecipient: "ተቀባይ:",
    labelCourse: "የኮርሱ ርዕስ:",
    labelIssuer: "ሰጪ ተቋም:",
    labelIssueDate: "የተሰጠበት ቀን:",
    labelSkills: "የተረጋገጡ ክህሎቶች:",
    notFoundHeading: "የምስክር ወረቀቱ አልተገኘም",
    notFoundMessage: (id: string) => `የመለያ ቁጥር "${id}" በሳቫና LMS ማሳያ መዝገብ ውስጥ አልተገኘም። እባክዎ መለያ ቁጥሩን ያረጋግጡ።`,
    permalinkHeading: "ቋሚ የማረጋገጫ ሊንክ (Shareable Verification Permalink)",
    permalinkBadge: "ይፋዊ የማረጋገጫ ነጥብ · ምንም መግቢያ አያስፈልግም",
    permalinkDesc: "ቀጣሪዎች፣ የ LinkedIn መገለጫዎች እና የትምህርት ተቋማት ይህንን ቋሚ ሊንክ በመጠቀም የምስክር ወረቀቱን ትክክለኛነት በቀጥታ ማረጋገጥ ይችላሉ።",
    permalinkAriaLabel: "የማረጋገጫ ቋሚ አድራሻ",
    copyLinkBtn: "ሊንኩን ቅዳ",
    shareBtn: "አጋራ...",
    shareTitle: "አጋራ",
    openTabBtn: "በአዲስ ገጽ",
    openTabTitle: "በአዲስ መስኮት ክፈት",
    copySuccess: "የማረጋገጫ ሊንኩ ተገልብጧል። ለቀጣሪዎች ወይም ለ LinkedIn ማጋራት ይችላሉ።",
    qrHeading: "በስማርትፎን ካሜራ በቀጥታ ያረጋግጡ",
    qrDesc: "ቀጣሪዎች ወይም ገምጋሚዎች የስልካቸውን ካሜራ በመጠቀም ይህንን የ QR ኮድ ስካን በማድረግ የማረጋገጫ ገጹን በቀጥታ መክፈት ይችላሉ።",
    qrAriaLabel: "የሞባይል ማረጋገጫ QR ኮድ",
    qrDownloadBtn: "QR ኮድ አውርድ (SVG)",
    obv3Btn: "Open Badges 3.0 ሜታዳታ",
    obv3DownloadBtn: "Open Badge አውርድ (.jsonld)",
    disclosureHeading: "የክፍት ደረጃዎች ማስታወሻ፡",
    disclosureBody: "ይህ መድረክ ከ W3C Verifiable Credentials፣ 1EdTech Open Badges 3.0 እና Schema.org ደረጃዎች ጋር ተኳሃኝ በሆነ መልኩ የተቀየሰ ነው። የምስክር ወረቀቱ በኢትዮጵያ ዘመን አቆጣጠር (ህዳር 5፣ 2019 ዓ.ም) እና በጎርጎሪዮሳዊ ቀን የተመዘገበ ነው።",
  },
  om: {
    pageTitle: "Mirkaneessa Waraqaa Ragaa",
    pageSubtitle: "Hojjechiistota, sarara qacarrii fi dhaabbilee barnootaatiif waraqaa ragaa ifaa fi mirkanaa'aa.",
    statusHeading: "Haala Waraqaa Ragaa",
    registryLookup: "Kuusaa agarsiisa Savanna LMS keessatti bu'aa barbaacha mirkanaa'e:",
    demoPresets: "Fakkeenya Eenyummeessaa:",
    presetFoundations: "CERT-DB-2026-0042 (Bu'uura)",
    presetSpecialist: "CERT-DB-2026-0088 (Ogeessa Qaqqabummaa)",
    formAriaLabel: "Unka barbaacha waraqaa ragaa",
    credentialIdLabel: "Lakkoofsa Eenyummeessaa (Credential ID):",
    verifyBtn: "Mirkaneessi",
    verifiedHeading: "Waraqaa Ragaa Agarsiisaa Mirkanaa'e",
    verifiedBadge: "Mirkanaa'eera",
    labelId: "Lakk. Eenyummeessaa:",
    labelRecipient: "Fudhataa:",
    labelCourse: "Koorsii:",
    labelIssuer: "Kenne:",
    labelIssueDate: "Guyyaa Kenname:",
    labelSkills: "Dandeettiiwwan Mirkanaa'an:",
    notFoundHeading: "Waraqaan ragaa hin argamne",
    notFoundMessage: (id: string) => `Lakkoofsi eenyummeessaa "${id}" galmee agarsiisa Savanna LMS keessatti hin argamne. Maaloo lakkoofsicha mirkaneessaa irra deebiaa yaalaa.`,
    permalinkHeading: "Geessituu Mirkaneessaa Qoodamu (Permalink)",
    permalinkBadge: "Qaphxii Mirkaneessaa Ummataa · Seensi Hin Barbaachisu",
    permalinkDesc: "Hojjechiistonni, pirofaayiliin LinkedIn fi dhaabbileen barnootaa geessituu dhaabbataa kana fayyadamuun dhugummaa waraqaa ragaa kallattiin mirkaneessuu danda'u.",
    permalinkAriaLabel: "Teessoo Dhaabbataa Mirkaneessaa",
    copyLinkBtn: "Geessituu Garagalchi",
    shareBtn: "Qoodi...",
    shareTitle: "Geessituu waraqaa ragaa qoodi",
    openTabBtn: "Mullata Haaraa",
    openTabTitle: "Geessituu mirkaneessaa tab haaraa keessatti bani",
    copySuccess: "Geessituun mirkaneessaa garagalffameera! Hojjechiistotaaf ykn LinkedIn irratti qooduuf qophiidha.",
    qrHeading: "Kaameeraa Mobaayilaan Kallattiin Mirkaneessaa",
    qrDesc: "Hojjechiistonni ykn qormaatonni kaameraa mobaayila isaanii fayyadamuun koodii QR kana iskaan gochuun galmee mirkaneessaa seera qabeessaa battalatti banuu danda'u.",
    qrAriaLabel: "Koodii QR Mirkaneessa Mobaayilaa",
    qrDownloadBtn: "Koodii QR Buufadhaa (SVG)",
    obv3Btn: "Open Badges 3.0 (OBv3)",
    obv3DownloadBtn: "Open Badge Buufadhaa (.jsonld)",
    disclosureHeading: "Hubachiisa Ulaagaalee Banaa fi Walta'iinsaa:",
    disclosureBody: "Sirni kun ulaagaalee W3C Verifiable Credentials 2.0, 1EdTech Open Badges 3.0 fi Schema.org waliin walta'ee kan ijaarameedha. Akka lakkoofsa Itoophiyaa (Sadaasa 5, 2019 A.L.I) fi ISO 8601 waliin kan walsimedha.",
  },
  ti: {
    pageTitle: "ምስክር ወረቐት መረጋገጺ",
    pageSubtitle: "ንቀጠርቲ፣ ንናይ HR መድረኻትን ንናይ ትምህርቲ ትካላትን ግሉጽን ዘተኣማምንን መረጋገጺ መድረኽ።",
    statusHeading: "ኩነታት ምስክር ወረቐት",
    registryLookup: "ኣብ ናይ ሳቫና LMS መርኣያ መዝገብ ዝተረኽበ ውጽኢት ምፍታሽ፡",
    demoPresets: "ናሙና መለለዪታት፡",
    presetFoundations: "CERT-DB-2026-0042 (መሰረታዊ)",
    presetSpecialist: "CERT-DB-2026-0088 (ስፔሻሊስት ተበጻሕነት)",
    formAriaLabel: "ቅጥዒ ምድላይ ምስክር ወረቐት",
    credentialIdLabel: "መለለዪ ቑጽሪ ምስክር ወረቐት (Credential ID):",
    verifyBtn: "ኣረጋግጽ",
    verifiedHeading: "ዝተረጋገጸ ናይ ብቕዓት ምስክር ወረቐት",
    verifiedBadge: "ዝተረጋገጸ",
    labelId: "መለለዪ ቑጽሪ:",
    labelRecipient: "ተቐባሊ:",
    labelCourse: "ኮርስ:",
    labelIssuer: "ወሃቢ ትካል:",
    labelIssueDate: "ዝተዋህበሉ ዕለት:",
    labelSkills: "ዝተረጋገጹ ክእለታት:",
    notFoundHeading: "ምስክር ወረቐት ኣይተረኽበን",
    notFoundMessage: (id: string) => `መለለዪ ቑጽሪ "${id}" ኣብ ናይ ሳቫና LMS መርኣያ መዝገብ ኣይተረኽበን። በጃኹም መለለዪ ቑጽርኹም ኣረጋጊጽኩም ደጊምኩም ፈትኑ።`,
    permalinkHeading: "ቀዋሚ መላገቢ መረጋገጺ (Shareable Verification Permalink)",
    permalinkBadge: "ህዝባዊ መረጋገጺ ነጥቢ · መእተዊ ዘይሓትት",
    permalinkDesc: "ቀጠርቲ፣ ናይ LinkedIn መገለጺታትን ናይ ትምህርቲ ትካላትን ነዚ ቀዋሚ መላገቢ ብምጥቃም ናይቲ ምስክር ወረቐት ሓቅነት ብቐጥታ ከረጋግጹ ይኽእሉ።",
    permalinkAriaLabel: "ቀዋሚ ኣድራሻ መረጋገጺ",
    copyLinkBtn: "መላገቢ ቅዳሕ",
    shareBtn: "ኣካፍል...",
    shareTitle: "መላገቢ ምስክር ወረቐት ኣካፍል",
    openTabBtn: "ሓድሽ ገጽ",
    openTabTitle: "መረጋገጺ መላገቢ ኣብ ሓድሽ መስኮት ክፈት",
    copySuccess: "ናይ መረጋገጺ መላገቢ ተቐዲሑ ኣሎ! ንቀጠርቲ ወይ ን LinkedIn ንምክፋል ድሉው እዩ።",
    qrHeading: "ብካሜራ ሞባይል ብቐጥታ ኣረጋግጹ",
    qrDesc: "ቀጠርቲ ወይ ገምገምቲ ናይ ሞባይሎም ካሜራ ብምጥቃም ነዚ ናይ QR ኮድ ስካን ብምግባር ናይ መረጋገጺ ገጽ ብቐጥታ ክኸፍቱ ይኽእሉ።",
    qrAriaLabel: "ናይ ሞባይል መረጋገጺ QR ኮድ",
    qrDownloadBtn: "QR ኮድ ኣውርድ (SVG)",
    obv3Btn: "Open Badges 3.0 ሜታዳታ",
    obv3DownloadBtn: "Open Badge ኣውርድ (.jsonld)",
    disclosureHeading: "ናይ ክፉታት ደረጃታት መተሓሳሰቢ፡",
    disclosureBody: "እዚ መድረኽ ምስ W3C Verifiable Credentials፣ 1EdTech Open Badges 3.0 ከምኡ’ውን Schema.org ዝሰማማዕ ኮይኑ ዝተነደፈ እዩ። እቲ ምስክር ወረቐት ብናይ ኢትዮጵያ ዘመን ኣቑጻጽራ (ሕዳር 5፣ 2019 ዓ.ም) ከምኡ'ውን ብ ISO 8601 ዝተመዝገበ እዩ።",
  },
  so: {
    pageTitle: "Xaqiijinta Shahaadada",
    pageSubtitle: "Shahaadooyin hufan oo la xaqiijin karo oo loogu talagalay loo-shaqeeyayaasha, goobaha shaqada, iyo xarumaha waxbarashada.",
    statusHeading: "Xaaladda Shahaadada",
    registryLookup: "Baaritaanka xaqiijinta ee diiwaanka tusaalaha Savanna LMS:",
    demoPresets: "Tusaalooyinka Aqoonsiga:",
    presetFoundations: "CERT-DB-2026-0042 (Aasaaska)",
    presetSpecialist: "CERT-DB-2026-0088 (Khabiirka Helitaanka)",
    formAriaLabel: "Foomka raadinta shahaadada",
    credentialIdLabel: "Aqoonsiga Shahaadada (Credential ID):",
    verifyBtn: "Xaqiiji",
    verifiedHeading: "Shahaado Tusaale ah oo La Xaqiijiyay",
    verifiedBadge: "La Xaqiijiyay",
    labelId: "Aqoonsiga:",
    labelRecipient: "Qaatilaha:",
    labelCourse: "Koorsada:",
    labelIssuer: "Bixiyaha:",
    labelIssueDate: "Taariikhda La Bixiyay:",
    labelSkills: "Xirfadaha La Xaqiijiyay:",
    notFoundHeading: "Shahaadada lama helin",
    notFoundMessage: (id: string) => `Aqoonsiga "${id}" lagama helin diiwaanka tusaalaha Savanna LMS. Fadlan hubi aqoonsiga oo mar kale isku day.`,
    permalinkHeading: "Xiriirka Xaqiijinta ee La Wadaagi Karo (Permalink)",
    permalinkBadge: "Goobta Xaqiijinta Dadweynaha · Looma Baahna Galid",
    permalinkDesc: "Loo-shaqeeyayaasha, astaamaha LinkedIn, iyo machadyada waxbarashadu waxay isticmaali karaan xiriirkan joogtada ah si ay si toos ah u xaqiijiyaan saxnimada shahaadada.",
    permalinkAriaLabel: "Cinwaanka Joogtada ah ee Xaqiijinta",
    copyLinkBtn: "Koobiyee Xiriirka",
    shareBtn: "La wadaag...",
    shareTitle: "La wadaag xiriirka shahaadada",
    openTabBtn: "Tab Cusub",
    openTabTitle: "Ka fur xiriirka xaqiijinta tab cusub",
    copySuccess: "Xiriirka xaqiijinta waa la koobiyeeyay! Diyaar u ah loo-shaqeeyayaasha iyo LinkedIn.",
    qrHeading: "Kaga Xaqiiji Toos Moobilka",
    qrDesc: "Loo-shaqeeyayaasha ama saraakiisha waxbarashadu waxay ku sawiri karaan koodkan QR kamarad kasta oo taleefan casri ah si ay isla markiiba u furaan diiwaanka rasmiga ah ee xaqiijinta.",
    qrAriaLabel: "Koodhka QR ee Xaqiijinta Moobilka",
    qrDownloadBtn: "Soo deji Koodhka QR (SVG)",
    obv3Btn: "Open Badges 3.0 (OBv3)",
    obv3DownloadBtn: "Soo deji Open Badge (.jsonld)",
    disclosureHeading: "Xogta Halbeegyada Furan & U hoggaansanaanta:",
    disclosureBody: "Waxaa loo dhisay si waafaqsan halbeegyada W3C Verifiable Credentials 2.0, 1EdTech Open Badges 3.0, iyo Schema.org. Waxay ku xiran tahay kalandarka Itoobiya (Hidar 5, 2019 E.C.) iyo taariikhda caalamiga ah ee ISO 8601.",
  },
};

/**
 * Returns canonical, deployment-resilient verification URL.
 * Handles custom origins, reverse-proxy subpaths, hash routing, and clean URLs.
 */
export function getCanonicalShareableUrl(certId: string): string {
  if (typeof window === "undefined") {
    return `https://savanna.alxafrica.com/verify?id=${encodeURIComponent(certId)}`;
  }

  const loc = window.location;

  // file:// protocol fallback
  if (loc.protocol === "file:") {
    const fileBase = loc.href.split("#")[0].split("?")[0];
    return `${fileBase}#/verify?id=${encodeURIComponent(certId)}`;
  }

  // Determine base path (e.g. '/' or '/savanna-accessible-media')
  let basePath = loc.pathname;
  if (basePath.endsWith("/verify") || basePath.endsWith("/verify.html")) {
    basePath = basePath.replace(/\/verify(\.html)?$/, "");
  } else if (basePath.endsWith("/")) {
    basePath = basePath.slice(0, -1);
  }

  const isHashRouting = loc.hash && (loc.hash.includes("/verify") || loc.hash.includes("#/"));
  if (isHashRouting) {
    return `${loc.origin}${basePath}/#/verify?id=${encodeURIComponent(certId)}`;
  }

  return `${loc.origin}${basePath}/verify?id=${encodeURIComponent(certId)}`;
}

export const VerifyView: React.FC<{ locale: SupportedLocale }> = ({ locale }) => {
  const t = VERIFY_TEXTS[locale] || VERIFY_TEXTS.en;

  const getInitialId = (): string => {
    if (typeof window === "undefined") return "CERT-DB-2026-0042";

    // 1. Check standard URL query parameters (?id=... or ?certId=...)
    const searchParams = new URLSearchParams(window.location.search);
    const searchId = searchParams.get("id") || searchParams.get("certId");
    if (searchId) return searchId;

    // 2. Check hash routing query parameters (#/verify?id=...)
    if (window.location.hash.includes("?")) {
      const hashQuery = window.location.hash.split("?")[1];
      const hashParams = new URLSearchParams(hashQuery);
      const hashId = hashParams.get("id") || hashParams.get("certId");
      if (hashId) return hashId;
    }

    // 3. Check direct hash segment (#CERT-DB-...)
    if (window.location.hash.startsWith("#CERT-")) {
      return window.location.hash.replace("#", "");
    }

    return "CERT-DB-2026-0042";
  };

  const [searchId, setSearchId] = useState<string>(getInitialId);
  const [activeId, setActiveId] = useState<string>(getInitialId);
  const [certificates, setCertificates] = useState<DemoCertificate[]>(DEFAULT_REGISTRY);
  const [copyMsg, setCopyMsg] = useState("");
  const [showOBv3, setShowOBv3] = useState(false);

  // Fetch certificate registry if available
  useEffect(() => {
    fetch("/certificates/certificates.demo.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCertificates(data);
        }
      })
      .catch(() => {});
  }, []);

  // Listen for back/forward navigation
  useEffect(() => {
    const handleUrlChange = () => {
      const id = getInitialId();
      setActiveId(id);
      setSearchId(id);
    };

    window.addEventListener("popstate", handleUrlChange);
    window.addEventListener("hashchange", handleUrlChange);
    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      window.removeEventListener("hashchange", handleUrlChange);
    };
  }, []);

  // Synchronize browser address bar with current active credential ID
  useEffect(() => {
    if (typeof window !== "undefined" && window.history && activeId) {
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.get("id") !== activeId) {
          url.searchParams.set("id", activeId);
          window.history.replaceState({ certId: activeId }, "", url.toString());
        }
      } catch {
        // Fallback for custom or restricted environments
      }
    }
  }, [activeId]);

  const matchedCert = certificates.find(
    (c) => c.id.trim().toLowerCase() === activeId.trim().toLowerCase()
  );

  const dualDate = matchedCert ? formatDualDate(matchedCert.issueDateISO) : null;
  const canonicalUrl = getCanonicalShareableUrl(activeId);
  const qrSvgString = matchedCert ? generateQRSVG(canonicalUrl, 140) : "";

  const handleDownloadQR = () => {
    if (!qrSvgString) return;
    const blob = new Blob([qrSvgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `credential-qr-${activeId}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Injects Schema.org EducationalOccupationalCredential JSON-LD structured data into <head>
  useEffect(() => {
    if (!matchedCert) return;
    const scriptId = "schema-org-credential-jsonld";
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = scriptId;
      scriptTag.type = "application/ld+json";
      document.head.appendChild(scriptTag);
    }

    scriptTag.textContent = JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "EducationalOccupationalCredential",
        identifier: matchedCert.id,
        name: matchedCert.title[locale] || matchedCert.title.en,
        description:
          "Demonstrated competencies in accessible digital workflows, WCAG 2.2 AAA compliance, Ethiopian Sign Language integration, and cross-platform collaboration.",
        credentialCategory: "Certificate of Competence",
        educationalLevel: "Foundational & Assistive Technology Competence",
        recognizedBy: {
          "@type": "EducationalOrganization",
          name: matchedCert.issuer,
          url: "https://savanna.alxafrica.com",
        },
        dateCreated: matchedCert.issueDateISO,
        validFrom: matchedCert.issueDateISO,
        url: canonicalUrl,
      },
      null,
      2
    );

    return () => {
      const tag = document.getElementById(scriptId);
      if (tag) tag.remove();
    };
  }, [matchedCert, canonicalUrl, locale]);

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = searchId.trim();
    if (!trimmed) return;
    setActiveId(trimmed);
  };

  const handleSelectPreset = (presetId: string) => {
    setSearchId(presetId);
    setActiveId(presetId);
  };

  const handleCopyLink = async () => {
    let success = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(canonicalUrl);
        success = true;
      }
    } catch {
      // Fallback below
    }

    if (!success) {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = canonicalUrl;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch (err) {
        console.warn("Clipboard copy fallback failed:", err);
      }
    }

    setCopyMsg(t.copySuccess);
    setTimeout(() => setCopyMsg(""), 3500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: matchedCert
            ? `${matchedCert.title[locale] || matchedCert.title.en} — Verified Credential`
            : "Savanna LMS Verified Credential",
          text: `Verify official certificate (${activeId}) issued by ${matchedCert?.issuer || "Savanna Learning Platform"}.`,
          url: canonicalUrl,
        });
        return;
      } catch {
        // User cancelled or share failed, fallback to clipboard
      }
    }
    await handleCopyLink();
  };

  const getOBv3Payload = () => {
    if (!matchedCert) return null;
    return {
      "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json",
      ],
      id: `urn:uuid:db-${matchedCert.id.toLowerCase()}`,
      type: ["VerifiableCredential", "OpenBadgeCredential"],
      issuer: {
        id: "https://savanna.alxafrica.com/issuers/digital-bridge",
        type: ["Profile"],
        name: matchedCert.issuer,
        url: "https://savanna.alxafrica.com",
      },
      validFrom: `${matchedCert.issueDateISO}T00:00:00Z`,
      name: matchedCert.title[locale] || matchedCert.title.en,
      credentialSubject: {
        id: "did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
        type: ["AchievementSubject"],
        name: matchedCert.learnerDisplayName,
        achievement: {
          id: `https://savanna.alxafrica.com/achievements/${matchedCert.id.toLowerCase()}`,
          type: ["Achievement"],
          name: matchedCert.title[locale] || matchedCert.title.en,
          description:
            "Demonstrated competencies in accessible digital workflows, WCAG 2.2 AA compliance, and cross-platform collaboration.",
          criteria: {
            narrative:
              "Successfully completed all interactive lesson evaluations, verified transcript review, and demonstrated assistive technology proficiency.",
          },
        },
      },
    };
  };

  const handleDownloadOBv3 = () => {
    const payload = getOBv3Payload();
    if (!payload) return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/ld+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${matchedCert?.id || "credential"}.openbadge.jsonld`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "34px", color: "var(--color-ink)", marginBottom: "0.5rem", letterSpacing: "-0.011em" }}>
        {t.pageTitle}
      </h2>
      <p style={{ margin: "0 0 1.75rem 0", color: "var(--color-muted-ink)", fontSize: "17px" }}>
        {t.pageSubtitle}
      </p>

      {/* Main Verification Card */}
      <section className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h3 style={{ margin: "0 0 0.25rem 0", color: "var(--color-ink)", fontSize: "21px", letterSpacing: "-0.005em" }}>
              {t.statusHeading}
            </h3>
            <p style={{ margin: 0, color: "var(--color-muted-ink)", fontSize: "14px" }}>
              {t.registryLookup}
            </p>
          </div>
          <span className="badge badge-brand">
            W3C Verifiable Credentials
          </span>
        </div>

        {/* Quick Demo Certificate Presets */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", color: "var(--color-muted-ink)", fontWeight: 500 }}>
            {t.demoPresets}
          </span>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => handleSelectPreset("CERT-DB-2026-0042")}
            style={{
              fontSize: "12px",
              padding: "0.25rem 0.65rem",
              minHeight: "28px",
              borderColor: activeId === "CERT-DB-2026-0042" ? "var(--color-brand)" : undefined,
              background: activeId === "CERT-DB-2026-0042" ? "var(--color-brand-subtle)" : undefined,
            }}
          >
            {t.presetFoundations}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => handleSelectPreset("CERT-DB-2026-0088")}
            style={{
              fontSize: "12px",
              padding: "0.25rem 0.65rem",
              minHeight: "28px",
              borderColor: activeId === "CERT-DB-2026-0088" ? "var(--color-brand)" : undefined,
              background: activeId === "CERT-DB-2026-0088" ? "var(--color-brand-subtle)" : undefined,
            }}
          >
            {t.presetSpecialist}
          </button>
        </div>

        {/* Verification Form */}
        <form
          onSubmit={handleVerify}
          style={{
            display: "flex",
            gap: "0.75rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
          aria-label={t.formAriaLabel}
        >
          <label htmlFor="cert-id-input" style={{ fontWeight: 600, fontSize: "14px", width: "100%", color: "var(--color-ink)" }}>
            {t.credentialIdLabel}
          </label>
          <input
            id="cert-id-input"
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="e.g. CERT-DB-2026-0042"
            style={{
              flex: "1 1 260px",
              minHeight: "42px",
              padding: "0.5rem 1rem",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-pill)",
              fontSize: "14px",
              outline: "none",
              background: "var(--color-surface-elevated, #FFFFFF)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
            }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ minHeight: "42px", padding: "0.5rem 1.4rem" }}
          >
            {t.verifyBtn}
          </button>
        </form>

        {/* Lookup Result: Matched vs Not Found */}
        {matchedCert ? (
          <div
            style={{
              background: "#E8F8F0",
              border: "1px solid #B4E8CC",
              padding: "1.5rem",
              borderRadius: "var(--radius-card)",
              marginBottom: "1.75rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <h4 style={{ margin: 0, color: "#128045", fontSize: "1.15rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <IconCheck size={20} />
                <span>{t.verifiedHeading}</span>
              </h4>
              <span className="badge badge-success" style={{ borderRadius: "var(--radius-pill)" }}>
                {t.verifiedBadge}
              </span>
            </div>

            <dl
              className="verify-cred-dl"
              style={{
                margin: 0,
                fontSize: "14px",
              }}
            >
              <dt><strong>{t.labelId}</strong></dt>
              <dd><code>{matchedCert.id}</code></dd>

              <dt><strong>{t.labelRecipient}</strong></dt>
              <dd>{matchedCert.learnerDisplayName}</dd>

              <dt><strong>{t.labelCourse}</strong></dt>
              <dd>{matchedCert.title[locale] || matchedCert.title.en}</dd>

              <dt><strong>{t.labelIssuer}</strong></dt>
              <dd>{matchedCert.issuer}</dd>

              <dt><strong>{t.labelIssueDate}</strong></dt>
              <dd>
                <strong>{dualDate ? dualDate.display : matchedCert.issueDateISO}</strong>
              </dd>

              {matchedCert.skills && matchedCert.skills.length > 0 && (
                <>
                  <dt><strong>{t.labelSkills}</strong></dt>
                  <dd style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                    {matchedCert.skills.map((skill) => (
                      <span
                        key={skill}
                        style={{
                          background: "rgba(18, 128, 69, 0.12)",
                          color: "#128045",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: 500,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </dd>
                </>
              )}
            </dl>
          </div>
        ) : (
          <div
            role="alert"
            style={{
              background: "var(--color-alert-bg)",
              border: "1px solid var(--color-alert-border)",
              padding: "1.25rem 1.5rem",
              borderRadius: "var(--radius-card)",
              color: "var(--color-alert-ink)",
              marginBottom: "1.5rem",
            }}
          >
            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.05rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <IconAlert size={18} />
              <span>{t.notFoundHeading}</span>
            </h4>
            <p style={{ margin: 0, fontSize: "14px" }}>
              {t.notFoundMessage(activeId)}
            </p>
          </div>
        )}

        {/* Shareable Verification Permalink Section */}
        {matchedCert && (
          <section
            aria-labelledby="permalink-heading"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "var(--radius-card)",
              padding: "1.25rem 1.5rem",
              marginBottom: "1.75rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.65rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <h4 id="permalink-heading" style={{ margin: 0, fontSize: "15px", color: "var(--color-ink)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
                <IconLink size={16} />
                <span>{t.permalinkHeading}</span>
              </h4>
              <span style={{ fontSize: "11px", color: "var(--color-muted-ink)", background: "rgba(0,0,0,0.05)", padding: "2px 8px", borderRadius: "12px" }}>
                {t.permalinkBadge}
              </span>
            </div>

            <p style={{ margin: "0 0 0.85rem 0", fontSize: "13px", color: "var(--color-muted-ink)", lineHeight: 1.5 }}>
              {t.permalinkDesc}
            </p>

            {/* Read-only URL Bar & Action Buttons */}
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.75rem" }}>
              <input
                type="text"
                readOnly
                value={canonicalUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                style={{
                  flex: "1 1 280px",
                  background: "var(--color-surface-elevated, #FFFFFF)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  padding: "0.45rem 0.85rem",
                  fontSize: "12.5px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-ink)",
                  outline: "none",
                }}
                aria-label={t.permalinkAriaLabel}
              />

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCopyLink}
                style={{ minHeight: "36px", padding: "0.4rem 1rem", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
              >
                <IconCopy size={14} />
                <span>{t.copyLinkBtn}</span>
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={handleNativeShare}
                style={{ minHeight: "36px", padding: "0.4rem 0.9rem", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                title={t.shareTitle}
              >
                <IconShare size={14} />
                <span>{t.shareBtn}</span>
              </button>

              <a
                href={canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ minHeight: "36px", padding: "0.4rem 0.9rem", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "0.4rem", textDecoration: "none" }}
                title={t.openTabTitle}
              >
                <IconExternal size={14} />
                <span>{t.openTabBtn}</span>
              </a>
            </div>

            {/* Copy Notification Toast */}
            {copyMsg && (
              <div
                role="status"
                style={{
                  fontSize: "12.5px",
                  fontWeight: 500,
                  color: "#128045",
                  background: "#E8F8F0",
                  padding: "0.4rem 0.85rem",
                  borderRadius: "6px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <IconCheck size={14} />
                <span>{copyMsg}</span>
              </div>
            )}

            {/* Instant Mobile QR Code Verification Drawer */}
            <div
              style={{
                marginTop: "1.25rem",
                padding: "1rem",
                background: "var(--color-surface-elevated, #FFFFFF)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  background: "#FFFFFF",
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #E2E8F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                }}
                dangerouslySetInnerHTML={{ __html: qrSvgString }}
                aria-label={t.qrAriaLabel}
              />
              <div style={{ flex: "1 1 240px" }}>
                <h5 style={{ margin: "0 0 0.25rem 0", fontSize: "14px", fontWeight: 600, color: "var(--color-ink)" }}>
                  {t.qrHeading}
                </h5>
                <p style={{ margin: "0 0 0.75rem 0", fontSize: "13px", color: "var(--color-muted-ink)", lineHeight: 1.4 }}>
                  {t.qrDesc}
                </p>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleDownloadQR}
                  style={{ fontSize: "12px", padding: "0.35rem 0.85rem", minHeight: "32px", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                  aria-label={t.qrDownloadBtn}
                >
                  <IconDownload size={13} />
                  <span>{t.qrDownloadBtn}</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Standard Actions: Open Badges 3.0 & Download */}
        {matchedCert && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowOBv3(!showOBv3)}
                style={{ minHeight: "40px", display: "inline-flex", alignItems: "center", gap: "0.45rem" }}
                aria-expanded={showOBv3}
              >
                <IconBadge size={16} />
                <span>{t.obv3Btn}</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleDownloadOBv3}
                style={{ minHeight: "40px", display: "inline-flex", alignItems: "center", gap: "0.45rem" }}
              >
                <IconDownload size={16} />
                <span>{t.obv3DownloadBtn}</span>
              </button>
            </div>

            {/* Level 3 Open Standard Inspector: W3C / 1EdTech Open Badges 3.0 */}
            {showOBv3 && (
              <div
                style={{
                  marginTop: "0.5rem",
                  padding: "1.25rem",
                  background: "#131926",
                  color: "#F8FAFC",
                  borderRadius: "var(--radius-card)",
                  fontSize: "13px",
                  overflowX: "auto",
                  border: "1px solid #232B3E",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  <strong style={{ color: "#4D92FF" }}>
                    Level 3 Open Standard: 1EdTech / W3C Open Badges 3.0 (OBv3) Verifiable Credential
                  </strong>
                  <span style={{ fontSize: "11px", background: "rgba(77, 146, 255, 0.15)", color: "#7EC7D8", padding: "2px 8px", borderRadius: "4px" }}>
                    Standard JSON-LD
                  </span>
                </div>
                <pre style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "12px", lineHeight: 1.5, color: "#A6D854" }}>
                  {JSON.stringify(getOBv3Payload(), null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Demonstration Notice & Compliance Footer */}
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
        <strong>{t.disclosureHeading}</strong>{" "}
        {t.disclosureBody}
      </aside>
    </div>
  );
};
