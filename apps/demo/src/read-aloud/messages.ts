export type ReadAloudLocale = "en" | "am" | "om" | "ti" | "so" | string;

const ETHIOPIC_SCRIPT = /[\u1200-\u137F]/;

export function hasEthiopicScript(text: string): boolean {
  return ETHIOPIC_SCRIPT.test(text);
}

/** Normalises "am-ET", "am_ET", and "AM" to a comparable base code. */
export function baseLanguage(lang: string | null | undefined): string {
  return (lang || "").trim().toLowerCase().replace(/_/g, "-").split("-")[0];
}

export interface SpeechLabels {
  heading: (level: number) => string;
  link: string;
  currentPage: string;
  newTab: string;
  button: string;
  pressed: string;
  notPressed: string;
  disabled: string;
  image: string;
  list: string;
  listItems: (count: number) => string;
  listItem: (index: number, count: number) => string;
  formField: string;
  required: string;
  readOnly: string;
  checked: string;
  notChecked: string;
  currentValue: string;
  instructions: string;
  columnHeader: string;
  rowHeader: string;
  tableCell: string;
  tableCaption: string;
  card: string;
  quote: string;
  caption: string;
  summary: string;
  term: string;
  definition: string;
  fieldTypes: Record<string, string>;
}

const ENGLISH_SPEECH_LABELS: SpeechLabels = {
  heading: (level) => `Heading level ${level}`,
  link: "link",
  currentPage: "current page",
  newTab: "opens in a new tab",
  button: "button",
  pressed: "pressed",
  notPressed: "not pressed",
  disabled: "unavailable",
  image: "Image",
  list: "List",
  listItems: (count) => `${count} ${count === 1 ? "item" : "items"}`,
  listItem: (index, count) => `List item ${index} of ${count}`,
  formField: "Form field",
  required: "required",
  readOnly: "read only",
  checked: "checked",
  notChecked: "not checked",
  currentValue: "current value",
  instructions: "instructions",
  columnHeader: "column header",
  rowHeader: "row header",
  tableCell: "table cell",
  tableCaption: "Table caption",
  card: "Card",
  quote: "Quote",
  caption: "Caption",
  summary: "Summary",
  term: "Term",
  definition: "Definition",
  fieldTypes: {
    text: "text field",
    search: "search field",
    email: "email field",
    password: "password field",
    number: "number field",
    checkbox: "checkbox",
    radio: "radio button",
    range: "slider",
    date: "date field",
    "datetime-local": "date and time field",
    time: "time field",
    month: "month field",
    week: "week field",
    file: "file chooser",
    color: "color picker",
    url: "web address field",
    tel: "telephone field",
    textarea: "text area",
    select: "selection list",
  },
};

const AMHARIC_SPEECH_LABELS: SpeechLabels = {
  heading: (level) => `የርዕስ ደረጃ ${level}`,
  link: "አገናኝ",
  currentPage: "የአሁኑ ገጽ",
  newTab: "በአዲስ ትር ይከፈታል",
  button: "አዝራር",
  pressed: "ተጭኗል",
  notPressed: "አልተጫነም",
  disabled: "የተሰናከለ",
  image: "ምስል",
  list: "ዝርዝር",
  listItems: (count) => `${count} ንጥሎች`,
  listItem: (index, count) => `የዝርዝር ንጥል ${index} ከ${count}`,
  formField: "የቅጽ መስክ",
  required: "አስፈላጊ",
  readOnly: "ለንባብ ብቻ",
  checked: "ተመርጧል",
  notChecked: "አልተመረጠም",
  currentValue: "የአሁኑ ዋጋ",
  instructions: "መመሪያ",
  columnHeader: "የአምድ ርዕስ",
  rowHeader: "የረድፍ ርዕስ",
  tableCell: "የሰንጠረዥ ሕዋስ",
  tableCaption: "የሰንጠረዥ መግለጫ",
  card: "ካርድ",
  quote: "ጥቅስ",
  caption: "መግለጫ",
  summary: "ማጠቃለያ",
  term: "ቃል",
  definition: "ትርጓሜ",
  fieldTypes: {
    text: "የጽሑፍ መስክ",
    search: "የፍለጋ መስክ",
    email: "የኢሜይል መስክ",
    password: "የይለፍ ቃል መስክ",
    number: "የቁጥር መስክ",
    checkbox: "የመምረጫ ሳጥን",
    radio: "የራዲዮ አዝራር",
    range: "ማንሸራተቻ",
    date: "የቀን መስክ",
    "datetime-local": "የቀንና ሰዓት መስክ",
    time: "የሰዓት መስክ",
    month: "የወር መስክ",
    week: "የሳምንት መስክ",
    file: "የፋይል ምርጫ",
    color: "የቀለም ምርጫ",
    url: "የድረ-ገጽ አድራሻ መስክ",
    tel: "የስልክ ቁጥር መስክ",
    textarea: "የጽሑፍ አካባቢ",
    select: "የምርጫ ዝርዝር",
  },
};

const OROMO_SPEECH_LABELS: SpeechLabels = {
  heading: (level) => `Sadarkaa mata-duree ${level}`,
  link: "geessituu",
  currentPage: "fuula ammaa",
  newTab: "tabii haaraatti banama",
  button: "qabduu",
  pressed: "cuqaafameera",
  notPressed: "hin cuqaafamne",
  disabled: "hin danda'amu",
  image: "Fakkii",
  list: "Tarree",
  listItems: (count) => `qabiyyoota ${count}`,
  listItem: (index, count) => `Qabiyyee tarree ${index} kan ${count}`,
  formField: "Dirree unkaa",
  required: "barbaachisaa",
  readOnly: "dubbisuuf qofa",
  checked: "filatameera",
  notChecked: "hin filatamne",
  currentValue: "gatii ammaa",
  instructions: "qajeelfama",
  columnHeader: "mata-duree tarjaa",
  rowHeader: "mata-duree sararaa",
  tableCell: "seelii gabatee",
  tableCaption: "Ibsa gabatee",
  card: "Kaardii",
  quote: "Waraabbii",
  caption: "Ibsa",
  summary: "Gabaasa",
  term: "Jecha",
  definition: "Hiika",
  fieldTypes: {
    text: "dirree barreeffamaa",
    search: "dirree barbaadaa",
    email: "dirree imeelii",
    password: "dirree jecha icciitii",
    number: "dirree lakkoofsaa",
    checkbox: "saanduqa filannoo",
    radio: "qabduu raadiyoo",
    range: "waliin-dhiibaa",
    date: "dirree guyyaa",
    "datetime-local": "dirree guyyaa fi sa'aatii",
    time: "dirree sa'aatii",
    month: "dirree ji'aa",
    week: "dirree torbanii",
    file: "filataa faayilii",
    color: "filataa bifa",
    url: "dirree teessoo weebii",
    tel: "dirree lakkoofsa bilbilaa",
    textarea: "bakka barreeffamaa",
    select: "tarree filannoo",
  },
};

const TIGRIGNA_SPEECH_LABELS: SpeechLabels = {
  heading: (level) => `ደረጃ ኣርእስቲ ${level}`,
  link: "መተሓላለፊ",
  currentPage: "ናይ ሕጂ ገጽ",
  newTab: "ብሓድሽ ታብ ይኽፈት",
  button: "መልጎም",
  pressed: "ተጸቒጡ",
  notPressed: "ኣይተጸቕጠን",
  disabled: "ዘይሰርሕ",
  image: "ስእሊ",
  list: "ዝርዝር",
  listItems: (count) => `${count} ንጥፍታት`,
  listItem: (index, count) => `ንጥፊ ዝርዝር ${index} ካብ ${count}`,
  formField: "መስመር ቅጥዒ",
  required: "ኣድላዪ",
  readOnly: "ንምንባብ ጥራይ",
  checked: "ተመሪጹ",
  notChecked: "ኣይተመርጸን",
  currentValue: "ናይ ሕጂ ዋጋ",
  instructions: "መመምርሒ",
  columnHeader: "ኣርእስቲ ዓምዲ",
  rowHeader: "ኣርእስቲ መስርዕ",
  tableCell: "ክፍሊ ሰሌዳ",
  tableCaption: "መግለጺ ሰሌዳ",
  card: "ካርድ",
  quote: "ጥቕሲ",
  caption: "መግለጺ",
  summary: "ጽሟቕ",
  term: "ቃል",
  definition: "ትርጉም",
  fieldTypes: {
    text: "መስመር ጽሑፍ",
    search: "መስመር ምድላይ",
    email: "መስመር ኢሜይል",
    password: "መስመር መሕለፊ ቃል",
    number: "መስመር ቍጽሪ",
    checkbox: "ሳጹን መምረጺ",
    radio: "ናይ ሬድዮ መልጎም",
    range: "መንሸራተቲ",
    date: "መስመር ዕለት",
    "datetime-local": "መስመር ዕለትን ሰዓትን",
    time: "መስመር ሰዓት",
    month: "መስመር ወርሒ",
    week: "መስመር ሰሙን",
    file: "መምረጺ ፋይል",
    color: "መምረጺ ሕብሪ",
    url: "መስመር መርበብ ሓበሬታ",
    tel: "መስመር ቍጽሪ ተሌፎን",
    textarea: "ቦታ ጽሑፍ",
    select: "ዝርዝር ምርጫ",
  },
};

const SOMALI_SPEECH_LABELS: SpeechLabels = {
  heading: (level) => `Heerka cinwaanka ${level}`,
  link: "xiriirin",
  currentPage: "bogga hadda",
  newTab: "wuxuu ka furmayaa tab cusub",
  button: "badhan",
  pressed: "la riixay",
  notPressed: "lama riixin",
  disabled: "ma heli karo",
  image: "Sawir",
  list: "Liis",
  listItems: (count) => `${count} waxyaabood`,
  listItem: (index, count) => `Sheyga ${index} ee ${count}`,
  formField: "Goobta foomka",
  required: "waajib ah",
  readOnly: "akhris kaliya",
  checked: "la doortay",
  notChecked: "aan la dooran",
  currentValue: "qiimaha hadda",
  instructions: "tilmaamo",
  columnHeader: "cinwaanka tiirka",
  rowHeader: "cinwaanka safka",
  tableCell: "qolka shaxda",
  tableCaption: "Qoraalka shaxda",
  card: "Kaar",
  quote: "Xigasho",
  caption: "Faahfaahin",
  summary: "Soo koobid",
  term: "Erey",
  definition: "Qeexitaan",
  fieldTypes: {
    text: "goobta qoraalka",
    search: "goobta raadinta",
    email: "goobta iimaylka",
    password: "goobta furaha sirta ah",
    number: "goobta lambarka",
    checkbox: "sanduuqa calaamadaynta",
    radio: "badhanka raadiyaha",
    range: "kala-bixiyaha",
    date: "goobta taariikhda",
    "datetime-local": "goobta taariikhda iyo waqtiga",
    time: "goobta waqtiga",
    month: "goobta bisha",
    week: "goobta toddobaadka",
    file: "dooriyaha faylka",
    color: "dooriyaha midabka",
    url: "goobta ciwaanka shabakadda",
    tel: "goobta lambarka taleefanka",
    textarea: "aagga qoraalka",
    select: "liiska doorashada",
  },
};

export function getSpeechLabels(lang: string): SpeechLabels {
  const base = baseLanguage(lang);
  switch (base) {
    case "am":
      return AMHARIC_SPEECH_LABELS;
    case "om":
      return OROMO_SPEECH_LABELS;
    case "ti":
      return TIGRIGNA_SPEECH_LABELS;
    case "so":
      return SOMALI_SPEECH_LABELS;
    case "en":
    default:
      return ENGLISH_SPEECH_LABELS;
  }
}

export interface ReadAloudUI {
  launcher: string;
  launcherStateOn: string;
  launcherStateOff: string;
  panelTitle: string;
  panelDescription: string;
  closePanel: string;
  unsupportedTitle: string;
  unsupportedBody: string;
  activationLegend: string;
  enabled: string;
  hoverEnabled: string;
  keyboardEnabled: string;
  screenReaderHint: string;
  playbackLegend: string;
  playCurrent: string;
  pause: string;
  resume: string;
  stop: string;
  repeat: string;
  speed: string;
  pitch: string;
  volume: string;
  voice: string;
  settingsLegend: string;
  voiceAutomatic: string;
  noVoices: string;
  amharicMissing: string;
  voiceLanguageHint: string;
  statusLegend: string;
  statusStopped: string;
  statusSpeaking: string;
  statusPaused: string;
  statusUnsupported: string;
  currentContent: string;
  shortcutHint: string;
  noContent: string;
  enabledAnnouncement: string;
  disabledAnnouncement: string;
  speechError: string;
  times: (value: string) => string;
  percent: (value: string) => string;
}

const ENGLISH_UI: ReadAloudUI = {
  launcher: "Read aloud",
  launcherStateOn: "Read-aloud is on",
  launcherStateOff: "Read-aloud is off",
  panelTitle: "Read-aloud settings",
  panelDescription: "Hear page content by hovering with the mouse or moving with the keyboard.",
  closePanel: "Close read-aloud settings",
  unsupportedTitle: "Speech is not available in this browser",
  unsupportedBody:
    "This browser does not support the Web Speech API. The page remains fully accessible and readable with your usual assistive technology.",
  activationLegend: "Reading triggers",
  enabled: "Enable read-aloud",
  hoverEnabled: "Read when I hover with the mouse",
  keyboardEnabled: "Read when I focus with the keyboard",
  screenReaderHint:
    "Using a screen reader? Turn off keyboard-focus reading to avoid hearing two voices at once.",
  playbackLegend: "Speech controls",
  playCurrent: "Read current content",
  pause: "Pause",
  resume: "Resume",
  stop: "Stop speech",
  repeat: "Repeat",
  speed: "Reading speed",
  pitch: "Pitch",
  volume: "Volume",
  voice: "Voice",
  settingsLegend: "Speech settings",
  voiceAutomatic: "Automatic (match the content language)",
  noVoices: "No system voices have been detected yet.",
  amharicMissing:
    "No Amharic voice was found on this device. Amharic text will stay silent rather than being read with an unsuitable voice.",
  voiceLanguageHint:
    "Your chosen voice is used only when it matches the language of the content.",
  statusLegend: "Status",
  statusStopped: "Stopped",
  statusSpeaking: "Playing",
  statusPaused: "Paused",
  statusUnsupported: "Not supported",
  currentContent: "Current content",
  shortcutHint: "Keyboard shortcut: Alt or Option + Shift + R",
  noContent: "No readable content was found. Move to a heading, paragraph, link, button, or form field and try again.",
  enabledAnnouncement: "Read-aloud enabled.",
  disabledAnnouncement: "Read-aloud disabled.",
  speechError: "Speech could not start.",
  times: (value) => `${value} times`,
  percent: (value) => `${value} percent`,
};

const AMHARIC_UI: ReadAloudUI = {
  launcher: "በድምፅ አንብብ",
  launcherStateOn: "የድምፅ ንባብ በርቷል",
  launcherStateOff: "የድምፅ ንባብ ጠፍቷል",
  panelTitle: "የበድምፅ ንባብ ቅንብሮች",
  panelDescription: "በመዳፊት ሲያርፉ ወይም በኪቦርድ ሲያስሱ የገጹን ይዘት በድምፅ ያንብቡ።",
  closePanel: "የበድምፅ ንባብ ቅንብሮችን ዝጋ",
  unsupportedTitle: "በዚህ አሳሽ የድምፅ ንባብ አይገኝም",
  unsupportedBody:
    "ይህ አሳሽ የWeb Speech API ን አይደግፍም። ገጹ አሁንም በተለመደው የእርዳታ ቴክኖሎጂዎ ሙሉ በሙሉ ተደራሽ ነው።",
  activationLegend: "የንባብ ማስነሻዎች",
  enabled: "የድምፅ ንባብን አንቃ",
  hoverEnabled: "በመዳፊት ሲያርፉ አንብብ",
  keyboardEnabled: "በኪቦርድ ሲያስሱ አንብብ",
  screenReaderHint:
    "የስክሪን አንባቢ እየተጠቀሙ ከሆነ ሁለት ድምፆችን በአንድ ጊዜ ለማስወገድ የኪቦርድ ንባብን ያጥፉ።",
  playbackLegend: "የድምፅ ቁጥጥሮች",
  playCurrent: "የአሁኑን ይዘት አንብብ",
  pause: "ለጊዜው አቁም",
  resume: "ቀጥል",
  stop: "ድምፁን አቁም",
  repeat: "ድገም",
  speed: "የንባብ ፍጥነት",
  pitch: "የድምፅ ከፍታ",
  volume: "የድምፅ መጠን",
  voice: "ድምፅ",
  settingsLegend: "የድምፅ ቅንብሮች",
  voiceAutomatic: "ራስ-ሰር (ከይዘቱ ቋንቋ ጋር ይዛመዳል)",
  noVoices: "እስካሁን ምንም የስርዓት ድምፅ አልተገኘም።",
  amharicMissing:
    "በዚህ መሣሪያ ላይ የአማርኛ ድምፅ አልተገኘም። የአማርኛ ጽሑፍ ተስማሚ ባልሆነ ድምፅ ከመነበብ ይቆያል።",
  voiceLanguageHint: "የመረጡት ድምፅ ከይዘቱ ቋንቋ ጋር ሲስማማ ብቻ ይጠቀማል።",
  statusLegend: "ሁኔታ",
  statusStopped: "ቆሟል",
  statusSpeaking: "በመነበብ ላይ",
  statusPaused: "ለጊዜው ቆሟል",
  statusUnsupported: "አይደገፍም",
  currentContent: "የአሁኑ ይዘት",
  shortcutHint: "የኪቦርድ አቋራጭ፡ Alt ወይም Option + Shift + R",
  noContent: "ለማንበብ የሚረዳ ይዘት አልተገኘም። ወደ ርዕስ፣ አንቀጽ፣ አገናኝ፣ አዝራር ወይም የቅጽ መስክ ይሸጋገሩና እንደገና ይሞክሩ።",
  enabledAnnouncement: "የድምፅ ንባብ በርቷል።",
  disabledAnnouncement: "የድምፅ ንባብ ጠፍቷል።",
  speechError: "ድምፁ መጀመር አልቻለም።",
  times: (value) => `${value} እጥፍ`,
  percent: (value) => `${value} በመቶ`,
};

const OROMO_UI: ReadAloudUI = {
  launcher: "Sagaleen dubbisi",
  launcherStateOn: "Dubbisa sagalee banaadha",
  launcherStateOff: "Dubbisa sagalee cufaadha",
  panelTitle: "Qindaa'ina dubbisa sagalee",
  panelDescription: "Hantuutaan irra qabachuun ykn kiiboordiin socho'uun qabiyyee fuulaa dhaggeeffadhaa.",
  closePanel: "Qindaa'ina dubbisa sagalee cufaa",
  unsupportedTitle: "Dubbisi sagalee braawzarii kanaan hin danda'amu",
  unsupportedBody:
    "Braawzariin kun Web Speech API hin deeggaru. Fuulli kun teeknooloojii gargaarsaa keessaniin guutummaatti dubbifama.",
  activationLegend: "Ka'umsa dubbisaa",
  enabled: "Dubbisa sagalee dandeessisi",
  hoverEnabled: "Yeroon hantuutaan irra gahu dubbisi",
  keyboardEnabled: "Yeroon kiiboordiin xiyyeeffadhu dubbisi",
  screenReaderHint:
    "Dubbisaa iskiiriinii fayyadamaa jirtuu? Sagalee lama walirra dhaggeeffachuu dhiisuuf xiyyeeffannoo kiiboordii cufaa.",
  playbackLegend: "To'annoowwan sagalee",
  playCurrent: "Qabiyyee ammaa dubbisi",
  pause: "Yeroof dhaabi",
  resume: "Itti fufi",
  stop: "Sagalee dhaabi",
  repeat: "Irra deebi'i",
  speed: "Saffisa dubbisaa",
  pitch: "Olka'iinsa sagalee",
  volume: "Hanga sagalee",
  voice: "Sagalee",
  settingsLegend: "Qindaa'inoota sagalee",
  voiceAutomatic: "Ofumaan (afaan qabiyyee waliin walsima)",
  noVoices: "Sagaleen sirnaa ammayyuu hin argamne.",
  amharicMissing: "Sagaleen Afaan Oromoo meeshaa kana irratti hin argamne.",
  voiceLanguageHint: "Sagaleen filattan kan hojjetu yoo afaan qabiyyee waliin walsime qofa.",
  statusLegend: "Haala",
  statusStopped: "Dhaabbateera",
  statusSpeaking: "Dubbisaa jira",
  statusPaused: "Yeroof dhaabbateera",
  statusUnsupported: "Hin deeggaramu",
  currentContent: "Qabiyyee ammaa",
  shortcutHint: "Qaxxaamura kiiboordii: Alt ykn Option + Shift + R",
  noContent: "Qabiyyeen dubbifamu hin argamne. Mata-duree, keeyyata, geessituu, ykn qabduu irra gahuun yaalaa.",
  enabledAnnouncement: "Dubbisi sagalee hojii eegaleera.",
  disabledAnnouncement: "Dubbisi sagalee cufameera.",
  speechError: "Sagaleen jalqabamuu hin dandeenye.",
  times: (value) => `dacha ${value}`,
  percent: (value) => `dhibbantaa ${value}`,
};

const TIGRIGNA_UI: ReadAloudUI = {
  launcher: "ብድምጺ ኣንብብ",
  launcherStateOn: "ናይ ድምጺ ንባብ በርሁ ኣሎ",
  launcherStateOff: "ናይ ድምጺ ንባብ ጠፊኡ ኣሎ",
  panelTitle: "ናይ ድምጺ ንባብ ቅጥዕታት",
  panelDescription: "ብኣንፊት ኣንቢርካ ወይ ብኪቦርድ ብምዝዋር ትሕዝቶ ናይቲ ገጽ ስማዕ።",
  closePanel: "ናይ ድምጺ ንባብ ቅጥዕታት ዕጾ",
  unsupportedTitle: "ኣብዚ መተሓላለፊ ድምጺ ኣይርከብን",
  unsupportedBody:
    "እዚ መተሓላለፊ Web Speech API ኣይድግፍን። እቲ ገጽ ብተለምዶ ቴክኖሎጂ ተበጻሒ እዩ።",
  activationLegend: "ናይ ንባብ መበገሲታት",
  enabled: "ናይ ድምጺ ንባብ ኣንቅሕ",
  hoverEnabled: "ብኣንፊት ክዓርፍ ከሎ ኣንብብ",
  keyboardEnabled: "ብኪቦርድ ክዘውር ከሎ ኣንብብ",
  screenReaderHint:
    "ናይ ስክሪን ኣንባቢ ትጥቀም እንተሊኻ ክልተ ድምጺ ንኸይስማዕ ናይ ኪቦርድ ንባብ ኣጥፍኦ።",
  playbackLegend: "ናይ ድምጺ ምቍጽጻር",
  playCurrent: "ናይ ሕጂ ትሕዝቶ ኣንብብ",
  pause: "ንግዜኡ ኣዕርፍ",
  resume: "ቀጽል",
  stop: "ድምጺ ኣቋርጽ",
  repeat: "ድገም",
  speed: "ፍጥነት ንባብ",
  pitch: "ልዕልና ድምጺ",
  volume: "መጠን ድምጺ",
  voice: "ድምጺ",
  settingsLegend: "ናይ ድምጺ ቅጥዕታት",
  voiceAutomatic: "ባዕላዊ (ምስ ቋንቋ ትሕዝቶ ዝሰማማዕ)",
  noVoices: "ክሳብ ሕጂ ዝተረኽበ ናይ ስርዓት ድምጺ የለን።",
  amharicMissing: "ኣብዚ መሳርሒ ናይ ትግርኛ ድምጺ ኣይተረኽበን።",
  voiceLanguageHint: "ዝመረጽካዮ ድምጺ ምስ ቋንቋ ትሕዝቶ ምስ ዝሰማማዕ ጥራይ እዩ ዝሰርሕ።",
  statusLegend: "ኩነታት",
  statusStopped: "ቆይሙ",
  statusSpeaking: "ይዛረብ ኣሎ",
  statusPaused: "ንግዜኡ ቆይሙ",
  statusUnsupported: "ኣይድገፍን",
  currentContent: "ናይ ሕጂ ትሕዝቶ",
  shortcutHint: "ናይ ኪቦርድ ኣቋራጭ፡ Alt ወይ Option + Shift + R",
  noContent: "ዝንበብ ትሕዝቶ ኣይተረኽበን። ናብ ኣርእስቲ፣ ዓንቀጽ፣ መተሓላለፊ ወይ መልጎም ኬድካ ደጊምካ ፈትን።",
  enabledAnnouncement: "ናይ ድምጺ ንባብ ተኸፊቱ።",
  disabledAnnouncement: "ናይ ድምጺ ንባብ ተዓጽዩ።",
  speechError: "ድምጺ ክጅምር ኣይከኣለን።",
  times: (value) => `${value} ዕጽፊ`,
  percent: (value) => `${value} ሚእታዊት`,
};

const SOMALI_UI: ReadAloudUI = {
  launcher: "Cod ku akhri",
  launcherStateOn: "Akhriska codka waa daaran yahay",
  launcherStateOff: "Akhriska codka waa dansan yahay",
  panelTitle: "Dejinta akhriska codka",
  panelDescription: "Ku dhageyso nuxurka bogga adigoo dul-istaagaya jiirka ama ku dhex maraya kiiboodhka.",
  closePanel: "Xir dejinta akhriska codka",
  unsupportedTitle: "Hadalka lagama heli karo biraawsarkan",
  unsupportedBody:
    "Kala-bixiyahani ma taageero Web Speech API. Boggu wuxuu ku sii jiraa mid si buuxda loo heli karo.",
  activationLegend: "Kicinta akhriska",
  enabled: "Daar akhriska codka",
  hoverEnabled: "Akhri markaan jiirka dul-dhigo",
  keyboardEnabled: "Akhri markaan kiiboodhka ku dul-maro",
  screenReaderHint:
    "Ma isticmaalaysaa akhriyaha shaashadda? Demi akhriska kiiboodhka si aad uga fogaato laba cod hal mar.",
  playbackLegend: "Xakamaynta codka",
  playCurrent: "Akhri nuxurka hadda",
  pause: "Hakad",
  resume: "Sii wad",
  stop: "Jooji hadalka",
  repeat: "Ku celi",
  speed: "Xawaaraha akhriska",
  pitch: "Heerka codka",
  volume: "Dhumucda codka",
  voice: "Codka",
  settingsLegend: "Dejinta codka",
  voiceAutomatic: "Toos ah (u dhigma luqadda nuxurka)",
  noVoices: "Weli lama helin codadka nidaamka.",
  amharicMissing: "Lama helin cod Af-Soomaali ah qalabkan.",
  voiceLanguageHint: "Codka aad dooratay waxaa la isticmaalaa kaliya markuu u dhigmo luqadda nuxurka.",
  statusLegend: "Xaaladda",
  statusStopped: "Waa la joojiyay",
  statusSpeaking: "Wuu hadlayaa",
  statusPaused: "Waa la hakiyay",
  statusUnsupported: "Lama taageero",
  currentContent: "Nuxurka hadda",
  shortcutHint: "Furaha kiiboodhka: Alt ama Option + Shift + R",
  noContent: "Lama helin wax nuxur ah oo la akhrin karo. U gudub cinwaan, cutub, xiriirin, ama badhan.",
  enabledAnnouncement: "Akhriska codka waa la furay.",
  disabledAnnouncement: "Akhriska codka waa la xiray.",
  speechError: "Hadalku ma bilaaban karin.",
  times: (value) => `${value} jeer`,
  percent: (value) => `${value} boqolkiiba`,
};

export function getReadAloudUI(locale: ReadAloudLocale): ReadAloudUI {
  const base = baseLanguage(locale);
  switch (base) {
    case "am":
      return AMHARIC_UI;
    case "om":
      return OROMO_UI;
    case "ti":
      return TIGRIGNA_UI;
    case "so":
      return SOMALI_UI;
    case "en":
    default:
      return ENGLISH_UI;
  }
}

const SPEECH_ERRORS_EN: Record<string, string> = {
  "not-allowed": "The browser blocked speech. Press “Read current content” to start it with a direct action.",
  "audio-busy": "The audio device is busy. Close other audio and try again.",
  "audio-hardware": "No audio output device is available.",
  "language-unavailable": "No voice is installed for this language.",
  network: "A network voice was unavailable. Try a local system voice.",
  "voice-unavailable": "The selected voice is no longer available. Choose another voice.",
  "text-too-long": "This content is too long for the browser speech engine.",
  "invalid-argument": "The speech request was not valid.",
  "synthesis-failed": "The browser could not synthesize speech.",
  "synthesis-unavailable": "Speech synthesis is unavailable in this browser.",
};

const SPEECH_ERRORS_AM: Record<string, string> = {
  "not-allowed": "አሳሹ ድምፁን ከልክሏል። በቀጥታ ለመጀመር “የአሁኑን ይዘት አንብብ” የሚለውን ይጫኑ።",
  "audio-busy": "የድምፅ መሣሪያው ተይዟል። ሌሎች ድምፆችን ዘግተው እንደገና ይሞክሩ።",
  "audio-hardware": "የድምፅ ውጤት መሣሪያ አልተገኘም።",
  "language-unavailable": "ለዚህ ቋንቋ የተጫነ ድምፅ የለም።",
  network: "የኢንተርኔት ድምፅ አልተገኘም። የአካባቢ የስርዓት ድምፅ ይሞክሩ።",
  "voice-unavailable": "የተመረጠው ድምፅ ከእንግዲህ አይገኝም። ሌላ ድምፅ ይምረጡ።",
  "text-too-long": "ይህ ይዘት ለአሳሹ የድምፅ አንባቢ በጣም ረጅም ነው።",
  "invalid-argument": "የድምፅ ጥያቄው ትክክል አልነበረም።",
  "synthesis-failed": "አሳሹ ድምፁን ማዘጋጀት አልቻለም።",
  "synthesis-unavailable": "በዚህ አሳሽ የድምፅ አንባቢ አይገኝም።",
};

const SPEECH_ERRORS_OM: Record<string, string> = {
  "not-allowed": "Braawzariin dubbisa dhorkeera. Kallattiin jalqabuuf “Qabiyyee ammaa dubbisi” cuqaasaa.",
  "audio-busy": "Meeshaan sagalee qabameera. Sagaleewwan biroo cufaa irra deebiaa.",
  "audio-hardware": "Meeshaan sagalee baasu hin argamne.",
  "language-unavailable": "Afaan kanaaf sagaleen hin fe'amne.",
  network: "Sagaleen sararaa hin argamne. Sagalee sirna naannoo yaalaa.",
  "voice-unavailable": "Sagaleen filatame amma hin jiru. Sagalee biraa filadhaa.",
  "text-too-long": "Qabiyyeen kun dubbisaa braawzariitiif baay'ee dheerateera.",
  "invalid-argument": "Gaaffiin sagalee sirrii hin turre.",
  "synthesis-failed": "Braawzariin sagalee qindeessuu hin dandeenye.",
  "synthesis-unavailable": "Dubbisi sagalee braawzarii kanaan hin danda'amu.",
};

const SPEECH_ERRORS_TI: Record<string, string> = {
  "not-allowed": "እቲ መተሓላለፊ ድምጺ ከልኪሉዎ። ብቐጥታ ንምጅማር “ናይ ሕጂ ትሕዝቶ ኣንብብ” ዝብል ጠውቑ።",
  "audio-busy": "መሳርሒ ድምጺ ተታሒዙ ኣሎ። ካልኦት ድምጽታት ዓጺኹም ደጊምኩም ፈትኑ።",
  "audio-hardware": "መውጽኢ ድምጺ ኣይተረኽበን።",
  "language-unavailable": "ንዚ ቋንቋ ዝተተኸለ ድምጺ የለን።",
  network: "ናይ መርበብ ድምጺ ኣይተረኽበን። ናይ ከባቢ ድምጺ ፈትኑ።",
  "voice-unavailable": "ዝተመረጸ ድምጺ የለን። ካልእ ድምጺ ምረጹ።",
  "text-too-long": "እዚ ትሕዝቶ ንመተሓላለፊ ኣዝዩ ነዊሕ እዩ።",
  "invalid-argument": "ናይ ድምጺ ሕቶ ትክክል ኣይነበረን።",
  "synthesis-failed": "እቲ መተሓላለፊ ድምጺ ከዳልዎ ኣይከኣለን።",
  "synthesis-unavailable": "ኣብዚ መተሓላለፊ ድምጺ ኣይርከብን።",
};

const SPEECH_ERRORS_SO: Record<string, string> = {
  "not-allowed": "Kala-bixiyuhu wuu xannibay hadalka. Riix “Akhri nuxurka hadda” si aad toos ugu bilowdo.",
  "audio-busy": "Qalabka codka waa mashquul. Xir codadka kale oo isku day mar kale.",
  "audio-hardware": "Lama helin qalab codka soo saara.",
  "language-unavailable": "Lama rakibin cod luqaddan ah.",
  network: "Codka shabakadda lama helin. Isku day codka nidaamka maxalliga ah.",
  "voice-unavailable": "Codka la doortay hadda lama heli karo. Dooro cod kale.",
  "text-too-long": "Nuxurkani wuu ku dheer yahay matoorka hadalka ee kala-bixiyaha.",
  "invalid-argument": "Codsiga hadalka sax ma ahayn.",
  "synthesis-failed": "Kala-bixiyuhu ma soo saari karin hadal.",
  "synthesis-unavailable": "Isku-dhafka hadalka lagama heli karo biraawsarkan.",
};

export function getSpeechErrorMessage(locale: ReadAloudLocale, code: string | null): string {
  if (!code) return "";
  const base = baseLanguage(locale);
  let map = SPEECH_ERRORS_EN;
  let fallback = ENGLISH_UI.speechError;

  switch (base) {
    case "am":
      map = SPEECH_ERRORS_AM;
      fallback = AMHARIC_UI.speechError;
      break;
    case "om":
      map = SPEECH_ERRORS_OM;
      fallback = OROMO_UI.speechError;
      break;
    case "ti":
      map = SPEECH_ERRORS_TI;
      fallback = TIGRIGNA_UI.speechError;
      break;
    case "so":
      map = SPEECH_ERRORS_SO;
      fallback = SOMALI_UI.speechError;
      break;
    case "en":
    default:
      map = SPEECH_ERRORS_EN;
      fallback = ENGLISH_UI.speechError;
      break;
  }
  return map[code] || fallback;
}

