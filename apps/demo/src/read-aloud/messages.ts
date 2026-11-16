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

export function getSpeechLabels(lang: string): SpeechLabels {
  const base = baseLanguage(lang);
  return base === "am" || base === "ti" ? AMHARIC_SPEECH_LABELS : ENGLISH_SPEECH_LABELS;
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

export function getReadAloudUI(locale: ReadAloudLocale): ReadAloudUI {
  return locale === "am" || locale === "ti" ? AMHARIC_UI : ENGLISH_UI;
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

export function getSpeechErrorMessage(locale: ReadAloudLocale, code: string | null): string {
  if (!code) return "";
  const isEthiopic = locale === "am" || locale === "ti";
  const map = isEthiopic ? SPEECH_ERRORS_AM : SPEECH_ERRORS_EN;
  return map[code] || (isEthiopic ? AMHARIC_UI.speechError : ENGLISH_UI.speechError);
}

