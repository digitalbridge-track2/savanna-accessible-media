import React, { useState, useRef, useEffect } from "react";
import {
  IconPlay,
  IconSquare,
  IconFolder,
  IconCheck,
  IconCircleDot,
  IconClose,
  IconCopy,
  IconCloudUpload,
} from "../components/Icons";
import { toUnicodeBraille, toAsciiBraille, generateBRFDocument, SupportedLocale } from "@abugida/media-kit";

export interface StudioSegment {
  id: number;
  start: number;
  end: number;
  speaker: string;
  draftText: string;
  reviewedText: string;
  status: "draft" | "reviewed";
}

const AMHARIC_SAMPLE: StudioSegment[] = [
  {
    id: 1,
    start: 0,
    end: 4.5,
    speaker: "Instructor",
    draftText: "እንኳን ወደዚህ የሥልጠና ፕሮግራም በደህና መጡ",
    reviewedText: "እንኳን ወደ ዲጂታል የሥራ ቦታ ክህሎቶች መሠረታዊ ትምህርት በደህና መጡ።",
    status: "reviewed",
  },
  {
    id: 2,
    start: 4.5,
    end: 9.0,
    speaker: "Instructor",
    draftText: "ዛሬ ስለ ዲጂታል የሥራ ቦታ ክህሎቶች እንማራለን",
    reviewedText: "በዚህ ትምህርት የርቀት የሥራ ግንኙነትን እና ተደራሽ የሰነድ አዘገጃጀትን እንመለከታለን።",
    status: "reviewed",
  },
  {
    id: 3,
    start: 9.0,
    end: 14.2,
    speaker: "Instructor",
    draftText: "በተለያዩ ቡድኖች ውስጥ ሲሰሩ ግልጽ ርዕሶች አስፈላጊ ናቸው",
    reviewedText: "በተለያዩ ቡድኖች ውስጥ ሲሰሩ፣ ግልጽ ርዕሶች እና የምስል ገላጭ ጽሑፎች ወሳኝ ናቸው።",
    status: "draft",
  },
  {
    id: 4,
    start: 14.2,
    end: 19.5,
    speaker: "Instructor",
    draftText: "በማመልከቻው ገጽ ታችኛው ክፍል ያለውን ማስገቢያ ቁልፍ ይጫኑ",
    reviewedText: "በማመልከቻው ገጽ ታችኛው ክፍል በስተቀኝ የሚገኘውን የማመልከቻ ማስገቢያ ቁልፍ ልብ ይበሉ።",
    status: "draft",
  },
  {
    id: 5,
    start: 19.5,
    end: 25.0,
    speaker: "Instructor",
    draftText: "ሁሉም ሰው ተደራሽ መሣሪያዎችን የማግኘት መብት አለው",
    reviewedText: "ሁሉም ሰው በትምህርት እና በሥራ ቦታ ሙሉ በሙሉ ተደራሽ የሆኑ መሣሪያዎችን የማግኘት መብት አለው።",
    status: "draft",
  },
];

const OROMO_SAMPLE: StudioSegment[] = [
  {
    id: 1,
    start: 0,
    end: 4.5,
    speaker: "Instructor",
    draftText: "baga gara leenjii dandeettii bakka hojii diijitaalaa nagaan dhuftan",
    reviewedText: "Baga gara leenjii Dandeettii Bakka Hojii Diijitaalaa bu'uuraatti nagaan dhuftan.",
    status: "reviewed",
  },
  {
    id: 2,
    start: 4.5,
    end: 9.0,
    speaker: "Instructor",
    draftText: "barnoota kana keessatti qunnamtii fi sanadoota hundaaf mijatan ilaalla",
    reviewedText: "Barnoota kana keessatti qunnamtii yerootiin hin daangeffamne fi sanadoota hundaaf mijatan ilaalla.",
    status: "reviewed",
  },
  {
    id: 3,
    start: 9.0,
    end: 14.2,
    speaker: "Instructor",
    draftText: "gareewwan faffaca'an keessatti yeroo hojjatamu mata duree sirreeffamaa qabaachuun gaariidha",
    reviewedText: "Gareewwan faffaca'an keessatti yeroo hojjatamu, mata-dureewwan sirreeffaman fi barreeffamoonni suuraa ibsan baay'ee barbaachisoodha.",
    status: "draft",
  },
  {
    id: 4,
    start: 14.2,
    end: 19.5,
    speaker: "Instructor",
    draftText: "gara gadii mirgaatti qabduun iyyannoo galchuu qalbeeffadhaa",
    reviewedText: "Gara gadii mirgaatti qabduun iyyannoo galchuu akkamitti akka ifee mul'atu qalbeeffadhaa.",
    status: "draft",
  },
  {
    id: 5,
    start: 19.5,
    end: 25.0,
    speaker: "Instructor",
    draftText: "namni hundi meeshaalee hundaaf mijatan argachuuf mirga qaba",
    reviewedText: "Namni hundi barnootaa fi bakka hojiitti meeshaalee guutummaatti hundaaf mijatan argachuuf mirga qaba.",
    status: "draft",
  },
];

const TIGRIGNA_SAMPLE: StudioSegment[] = [
  {
    id: 1,
    start: 0,
    end: 4.5,
    speaker: "Instructor",
    draftText: "እንቋዕ ናብቲ ናይ ዲጂታል ስራሕ ቦታ መሰረታዊ ትምህርቲ ብደሓን መጻእኹም",
    reviewedText: "እንቋዕ ናብ መሰረታዊ ትምህርቲ ናይ ዲጂታል ስራሕ ቦታ ክእለታት ብደሓን መጻእኹም።",
    status: "reviewed",
  },
  {
    id: 2,
    start: 4.5,
    end: 9.0,
    speaker: "Instructor",
    draftText: "ኣብዚ ትምህርቲ እዚ ናይ ርክብን ሰነዳትን ኣዘጋጅኣ ክንምርምር ኢና",
    reviewedText: "ኣብዚ ትምህርቲ እዚ፣ ዘይቀጥታዊ ርክብን ተበጻሒ ምድላው ሰነዳትን ክንምርምር ኢና።",
    status: "reviewed",
  },
  {
    id: 3,
    start: 9.0,
    end: 14.2,
    speaker: "Instructor",
    draftText: "ኣብ ዝተፈላለዩ ጉጅለታት ክትሰርሑ ከለኹም ኣርእስታት ኣገዳሲ እዩ",
    reviewedText: "ኣብ ዝተፈላለዩ ጉጅለታት ክትሰርሑ ከለኹም፣ ቅርጺ ዘለዎም ኣርእስታትን መግለጺ ምስልታትን ኣዝዮም ኣገደስቲ እዮም።",
    status: "draft",
  },
  {
    id: 4,
    start: 14.2,
    end: 19.5,
    speaker: "Instructor",
    draftText: "ኣብቲ ናይ መመልከቲ ገጽ ዘሎ መመልከቲ መእተዊ ቁልፊ ኣስተውዕሉ",
    reviewedText: "ኣብቲ ናይ መመልከቲ ገጽ ታሕታይ ክፋል ብየማን ዘሎ መመልከቲ መእተዊ መጎተቲ ብኸመይ ተለልዩ ከምዘሎ ኣስተውዕሉ።",
    status: "draft",
  },
  {
    id: 5,
    start: 19.5,
    end: 25.0,
    speaker: "Instructor",
    draftText: "ነፍሲ ወከፍ ሰብ ተበጻሕቲ መሳርሒታት ናይ ምርካብ መሰል ኣለዎ",
    reviewedText: "ነፍሲ ወከፍ ሰብ ኣብ ትምህርትን ስራሕን ምሉእ ብምሉእ ተበጻሕቲ ዝኾኑ መሳርሒታት ናይ ምርካብ መሰል ኣለዎ።",
    status: "draft",
  },
];

const SOMALI_SAMPLE: StudioSegment[] = [
  {
    id: 1,
    start: 0,
    end: 4.5,
    speaker: "Instructor",
    draftText: "ku soo dhowow xirfadaha goobta shaqada dijitaalka",
    reviewedText: "Ku soo dhowow Xirfadaha Goobta Shaqada Dijitaalka: Aasaaska.",
    status: "reviewed",
  },
  {
    id: 2,
    start: 4.5,
    end: 9.0,
    speaker: "Instructor",
    draftText: "casharkan waxaan ku baari doonaa xiriirka iyo dukumentiyada",
    reviewedText: "Casharkan, waxaan ku baari doonaa xiriirka aan tooska ahayn iyo diyaarinta dukumentiyada la heli karo.",
    status: "reviewed",
  },
  {
    id: 3,
    start: 9.0,
    end: 14.2,
    speaker: "Instructor",
    draftText: "markaad kooxo la shaqaynayso cinwaannada habaysan ayaa muhiim ah",
    reviewedText: "Markaad ka shaqaynayso kooxo kala fog, cinwaannada habaysan iyo qoraallada sharaxaadda sawirrada ayaa muhiim ah.",
    status: "draft",
  },
  {
    id: 4,
    start: 14.2,
    end: 19.5,
    speaker: "Instructor",
    draftText: "u fiirso badhanka gudbinta ee hoose",
    reviewedText: "U fiirso sida badhanka gudbinta ee bogga codsiga loogu iftiimiyay xagga hoose ee midigta.",
    status: "draft",
  },
  {
    id: 5,
    start: 19.5,
    end: 25.0,
    speaker: "Instructor",
    draftText: "qof kastaa wuxuu xaq u leeyahay qalab la heli karo",
    reviewedText: "Qof kastaa wuxuu xaq u leeyahay qalab si buuxda loo wada heli karo xagga waxbarashada iyo shaqada.",
    status: "draft",
  },
];

const ENGLISH_SAMPLE: StudioSegment[] = [
  {
    id: 1,
    start: 0,
    end: 4.5,
    speaker: "Instructor",
    draftText: "welcome to digital work place skills foundations",
    reviewedText: "Welcome to Digital Workplace Skills: Foundations.",
    status: "reviewed",
  },
  {
    id: 2,
    start: 4.5,
    end: 9.0,
    speaker: "Instructor",
    draftText: "in this lesson we will explore remote comms and documents",
    reviewedText: "In this lesson, we will explore asynchronous communication and accessible documentation.",
    status: "reviewed",
  },
  {
    id: 3,
    start: 9.0,
    end: 14.2,
    speaker: "Instructor",
    draftText: "when working across distributed teams structured headings are good",
    reviewedText: "When working across distributed teams, structured headings and alternative text are essential.",
    status: "draft",
  },
  {
    id: 4,
    start: 14.2,
    end: 19.5,
    speaker: "Instructor",
    draftText: "notice the submit button at the bottom right of the portal",
    reviewedText: "Notice how the submit button on the application portal is highlighted at the bottom-right.",
    status: "draft",
  },
  {
    id: 5,
    start: 19.5,
    end: 25.0,
    speaker: "Instructor",
    draftText: "everyone has the right to accessible tools in work and education",
    reviewedText: "Everyone has the right to fully accessible tools in education and employment.",
    status: "draft",
  },
];



function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);
  return `${mins}:${parseFloat(secs) < 10 ? "0" : ""}${secs}`;
}

function formatVTTTime(seconds: number): string {
  const totalMs = Math.max(0, Math.round(seconds * 1000));
  const hours = Math.floor(totalMs / 3600000);
  const mins = Math.floor((totalMs % 3600000) / 60000);
  const secs = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

function parseVTTContent(vttContent: string): StudioSegment[] {
  const lines = vttContent.split(/\r?\n/);
  const result: StudioSegment[] = [];
  let currentStart = 0;
  let currentEnd = 0;
  let currentText: string[] = [];
  let id = 1;

  function parseTime(t: string): number {
    const parts = t.trim().split(":");
    if (parts.length === 3) {
      return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
    } else if (parts.length === 2) {
      return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
    }
    return parseFloat(t) || 0;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes("-->")) {
      if (currentText.length > 0) {
        const full = currentText.join("\n");
        result.push({
          id: id++,
          start: currentStart,
          end: currentEnd,
          speaker: "Instructor",
          draftText: full,
          reviewedText: full,
          status: "reviewed",
        });
        currentText = [];
      }
      const [startPart, endPart] = line.split("-->").map((s) => s.trim().split(" ")[0]);
      currentStart = parseTime(startPart);
      currentEnd = parseTime(endPart);
    } else if (line && !line.startsWith("WEBVTT") && !line.startsWith("NOTE") && isNaN(Number(line))) {
      currentText.push(line);
    }
  }

  if (currentText.length > 0) {
    const full = currentText.join("\n");
    result.push({
      id: id++,
      start: currentStart,
      end: currentEnd,
      speaker: "Instructor",
      draftText: full,
      reviewedText: full,
      status: "reviewed",
    });
  }

  return result.length > 0 ? result : AMHARIC_SAMPLE;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getStudioSample(loc: SupportedLocale): StudioSegment[] {
  switch (loc) {
    case "am":
      return AMHARIC_SAMPLE;
    case "om":
      return OROMO_SAMPLE;
    case "ti":
      return TIGRIGNA_SAMPLE;
    case "so":
      return SOMALI_SAMPLE;
    case "en":
    default:
      return ENGLISH_SAMPLE;
  }
}

interface StudioTexts {
  title: string;
  subtitle: string;
  audioError: string;
  tagInserted: (tag: string) => string;
  speakerPrefixSet: (speaker: string) => string;
  cueCleaned: (id: number) => string;
  cueReverted: (id: number) => string;
  newDraftText: string;
  newReviewedText: string;
  cueAdded: (id: number) => string;
  cannotDeleteLast: string;
  cueDeleted: (id: number) => string;
  vttExported: string;
  jsonExported: string;
  brfExported: string;
  pdfExported: string;
  publishingMsg: string;
  publishSuccess: (cuesCount: number) => string;
  publishOfflineFallback: string;
  publishError: string;
  audioToolbarAriaLabel: string;
  playSegmentAria: (id: number) => string;
  stopSegmentAria: string;
  playLessonAria: string;
  playAudioBtn: string;
  stopAudioBtn: string;
  reviewedStatus: string;
  progressAria: string;
  sampleAm: string;
  sampleEn: string;
  sampleOm: string;
  sampleTi: string;
  sampleSo: string;
  sampleLoadedMsg: (langName: string) => string;
  importVttAria: string;
  importVttBtn: string;
  addNewCueBtn: string;
  startLabel: string;
  endLabel: string;
  speakerLabel: string;
  speakerOptions: {
    instructor: string;
    narrator: string;
    presenter: string;
    student: string;
  };
  humanReviewedBadge: string;
  draftAsrBadge: string;
  deleteCueTitle: string;
  draftAsrHeading: string;
  copyToEditorBtn: string;
  unverifiedAsrNote: string;
  reviewedTextHeading: string;
  visualDescTag: string;
  cleanBtn: string;
  revertBtn: string;
  editorPlaceholder: string;
  wordsLabel: string;
  charsLabel: string;
  longCueNote: string;
  optimalLengthNote: string;
  exportHeading: string;
  exportSubtitle: string;
  exportVttBtn: string;
  exportJsonBtn: string;
  exportBrfBtn: string;
  exportPdfBtn: string;
  publishBtn: string;
  publishingBtn: string;
  viewInPlayerBtn: string;
}

const STUDIO_TEXTS: Record<SupportedLocale, StudioTexts> = {
  en: {
    title: "Transcript Studio",
    subtitle: "Human-in-the-loop verification pipeline for speech-to-text captions, timing alignment, and audio descriptions.",
    audioError: "Audio playback error.",
    tagInserted: (tag) => `Inserted ${tag}`,
    speakerPrefixSet: (spk) => `Set speaker prefix (${spk})`,
    cueCleaned: (id) => `Cleaned formatting for cue #${id}.`,
    cueReverted: (id) => `Reverted cue #${id} to original draft.`,
    newDraftText: "New audio segment draft text",
    newReviewedText: "New audio segment reviewed text",
    cueAdded: (id) => `New cue #${id} added.`,
    cannotDeleteLast: "Cannot delete the last remaining cue.",
    cueDeleted: (id) => `Cue #${id} deleted.`,
    vttExported: "Exported captions.reviewed.vtt successfully.",
    jsonExported: "Exported transcript.reviewed.json successfully.",
    brfExported: "Exported authentic Braille (.brf) document successfully.",
    pdfExported: "Exported lesson-braille.pdf successfully.",
    publishingMsg: "Publishing reviewed captions to Level 2 API & live player...",
    publishSuccess: (count) => `✓ Successfully published ${count} cues to Level 2 API (Port 8000) and live lesson player!`,
    publishOfflineFallback: "✓ Captions saved to browser storage for the live lesson player (Level 2 API server is currently unreachable).",
    publishError: "Failed to publish captions.",
    audioToolbarAriaLabel: "Audio Player & Review Progress",
    playSegmentAria: (id) => `Play audio segment for cue #${id}`,
    stopSegmentAria: "Stop Audio",
    playLessonAria: "Play Lesson Audio",
    playAudioBtn: "Play Audio",
    stopAudioBtn: "Stop Audio",
    reviewedStatus: "Reviewed Status",
    progressAria: "Review completion percentage",
    sampleAm: "Load Amharic Sample",
    sampleEn: "Load English Sample",
    sampleOm: "Load Afaan Oromoo Sample",
    sampleTi: "Load Tigrigna Sample",
    sampleSo: "Load Somali Sample",
    sampleLoadedMsg: (lang) => `Loaded ${lang} lesson sample (5 cues).`,
    importVttAria: "Upload WebVTT file",
    importVttBtn: "Import WebVTT File (.vtt)",
    addNewCueBtn: "+ Add New Cue",
    startLabel: "Start:",
    endLabel: "End:",
    speakerLabel: "Speaker:",
    speakerOptions: {
      instructor: "Instructor",
      narrator: "Narrator",
      presenter: "Presenter",
      student: "Student",
    },
    humanReviewedBadge: "Human Reviewed",
    draftAsrBadge: "Draft ASR",
    deleteCueTitle: "Delete cue",
    draftAsrHeading: "Draft ASR Output (AI Generated)",
    copyToEditorBtn: "Copy to Editor",
    unverifiedAsrNote: "Unverified automated speech draft",
    reviewedTextHeading: "Human Reviewed Text (Publication Ready)",
    visualDescTag: "[visual description]",
    cleanBtn: "Clean",
    revertBtn: "Revert",
    editorPlaceholder: "Enter the reviewed and verified caption text here as a paragraph...",
    wordsLabel: "words",
    charsLabel: "characters",
    longCueNote: "Long cue (will wrap on screen)",
    optimalLengthNote: "Optimal length",
    exportHeading: "Export & Publish Verified Captions",
    exportSubtitle: "Download human-verified captions across standard accessibility formats (WebVTT, JSON, Braille) or publish directly to the Level 2 API to update the live lesson.",
    exportVttBtn: "Export Reviewed WebVTT (.vtt)",
    exportJsonBtn: "Export Transcript JSON (.json)",
    exportBrfBtn: "Export Braille (.brf)",
    exportPdfBtn: "Export Braille PDF (.pdf)",
    publishBtn: "Publish to Lesson (API)",
    publishingBtn: "Publishing...",
    viewInPlayerBtn: "View in Lesson Player →",
  },
  am: {
    title: "የትርጉም ስቱዲዮ (Transcript Studio)",
    subtitle: "ሰው-በሂደቱ-ውስጥ (Human-in-the-loop) የትርጉም ጽሑፍ፣ የጊዜ ገደብ እና የድምፅ ማብራሪያ ማረጋገጫ መስመር",
    audioError: "ኦዲዮውን ማጫወት አልተቻለም።",
    tagInserted: (tag) => `${tag} ተካቷል።`,
    speakerPrefixSet: (spk) => `የተናጋሪ ስም (${spk}) ተካቷል።`,
    cueCleaned: (id) => `መስመር #${id} ተስተካክሎ ጸድቷል።`,
    cueReverted: (id) => `መስመር #${id} ወደ ቀድሞ ረቂቅ ተመልሷል።`,
    newDraftText: "አዲስ የተጨመረ ረቂቅ ጽሑፍ",
    newReviewedText: "አዲስ የተጨመረ የተገመገመ ጽሑፍ",
    cueAdded: (id) => `አዲስ የትርጉም መስመር #${id} ተጨምሯል።`,
    cannotDeleteLast: "ቢያንስ አንድ የትርጉም መስመር መኖር አለበት።",
    cueDeleted: (id) => `የትርጉም መስመር #${id} ተሰርዟል።`,
    vttExported: "WebVTT ፋይል በተሳካ ሁኔታ ወርዷል።",
    jsonExported: "የጽሑፍ ግልባጭ JSON በተሳካ ሁኔታ ወርዷል።",
    brfExported: "ትክክለኛ የብሬይል ፊደላት የያዘ ፋይል (.brf) በተሳካ ሁኔታ ወርዷል።",
    pdfExported: "የሚዳሰስ የብሬል ፒዲኤፍ ሰነድ (.pdf) በተሳካ ሁኔታ ወርዷል።",
    publishingMsg: "ወደ Level 2 API እና ቀጥታ ማጫወቻው እየተላከ ነው...",
    publishSuccess: (count) => `✓ ${count} መስመሮች ወደ Level 2 API (Port 8000) እና ቀጥታ ማጫወቻው በተሳካ ሁኔታ ተልከው ታትመዋል!`,
    publishOfflineFallback: "✓ የትርጉም ጽሑፉ በመሣሪያው ላይ ተቀምጦ ለቀጥታ ማጫወቻው ዝግጁ ሆኗል (Level 2 API ኦፍላይን ነው)።",
    publishError: "ጽሑፉን ማተም አልተሳካም።",
    audioToolbarAriaLabel: "የድምፅ ማጫወቻ እና የማረጋገጫ ሁኔታ",
    playSegmentAria: (id) => `ለመስመር #${id} ድምፅ አጫውት`,
    stopSegmentAria: "ድምፅ አቁም",
    playLessonAria: "ሙሉ ትምህርት አጫውት",
    playAudioBtn: "ኦዲዮ አጫውት",
    stopAudioBtn: "አቁም",
    reviewedStatus: "የተገመገመ",
    progressAria: "የግምገማ እድገት",
    sampleAm: "የአማርኛ ናሙና ጫን",
    sampleEn: "የእንግሊዝኛ ናሙና ጫን",
    sampleOm: "የአፋን ኦሮሞ ናሙና ጫን",
    sampleTi: "የትግርኛ ናሙና ጫን",
    sampleSo: "የሶማሊኛ ናሙና ጫን",
    sampleLoadedMsg: (lang) => `${lang} ናሙና ተጭኗል።`,
    importVttAria: "WebVTT ፋይል አስገባ",
    importVttBtn: "WebVTT ፋይል አስገባ (.vtt)",
    addNewCueBtn: "+ አዲስ መስመር ጨምር",
    startLabel: "መጀመሪያ:",
    endLabel: "መጨረሻ:",
    speakerLabel: "ተናጋሪ:",
    speakerOptions: {
      instructor: "አስተማሪ (Instructor)",
      narrator: "ተራኪ (Narrator)",
      presenter: "አቅራቢ (Presenter)",
      student: "ተማሪ (Student)",
    },
    humanReviewedBadge: "የተረጋገጠ",
    draftAsrBadge: "ረቂቅ ASR",
    deleteCueTitle: "መስመር ሰርዝ",
    draftAsrHeading: "የረቂቅ ASR ውጤት (የድምፅ ሞዴል)",
    copyToEditorBtn: "ወደ አርታዒ ቅዳ",
    unverifiedAsrNote: "ያልተረጋገጠ አውቶማቲክ ረቂቅ",
    reviewedTextHeading: "የተገመገመ እና የተስተካከለ ጽሑፍ (Human Reviewed Text)",
    visualDescTag: "[የስላይድ ማብራሪያ]",
    cleanBtn: "አጽዳ",
    revertBtn: "መልስ",
    editorPlaceholder: "የተገመገመውን ጽሑፍ እዚህ በዝርዝር አንቀጽ ያስገቡ...",
    wordsLabel: "ቃላት",
    charsLabel: "ፊደላት",
    longCueNote: "ረጅም መስመር (በስክሪን ላይ ሊከፈል ይችላል)",
    optimalLengthNote: "ምርጥ ርዝመት",
    exportHeading: "የተገመገሙ ፋይሎችን ማውጣት እና ማተም",
    exportSubtitle: "የሰው ማረጋገጫ የተጠናቀቀባቸውን የትርጉም ጽሑፎች ወደ ተለያዩ የተደራሽነት ቅርጸቶች ያውርዱ ወይም በቀጥታ ወደ Level 2 API በማስተላለፍ ትምህርቱን ያዘምኑ።",
    exportVttBtn: "የተረጋገጠ WebVTT አውርድ (.vtt)",
    exportJsonBtn: "የጽሑፍ ግልባጭ JSON አውርድ (.json)",
    exportBrfBtn: "የብሬይል ፋይል አውርድ (.brf)",
    exportPdfBtn: "የብሬይል ፒዲኤፍ አውርድ (.pdf)",
    publishBtn: "ወደ Level 2 API ላክ",
    publishingBtn: "እየታተመ...",
    viewInPlayerBtn: "በቀጥታ ማጫወቻው ተመልከት →",
  },
  om: {
    title: "Istuudiyoo Jechootaa fi Sagalee (Transcript Studio)",
    subtitle: "Adeemsa mirkaneessaa sagalee gara barreeffamaatti jijjiiruu, walsimsiisa yeroo fi ibsa sagalee.",
    audioError: "Sagalee taphachiisuun hin danda'amne.",
    tagInserted: (tag) => `${tag} itti dabalameera.`,
    speakerPrefixSet: (spk) => `Maqaan dubbataa (${spk}) qindaa'eera.`,
    cueCleaned: (id) => `Qulqullinni sarara #${id} sirreeffameera.`,
    cueReverted: (id) => `Sararri #${id} gara waraqaa duraatti deebi'eera.`,
    newDraftText: "Barreeffama waraqaa sagalee haaraa",
    newReviewedText: "Barreeffama sakatta'amee qophaa'e",
    cueAdded: (id) => `Sararri jechootaa haaraan #${id} dabalameera.`,
    cannotDeleteLast: "Yoo xiqqaate sararri tokko jiraachuu qaba.",
    cueDeleted: (id) => `Sararri #${id} haqameera.`,
    vttExported: "Faayilli WebVTT milkaa'inaan bu'eera.",
    jsonExported: "JSON barreeffamaa milkaa'inaan bu'eera.",
    brfExported: "Sanadni Bireelii dhugaa (.brf) milkaa'inaan bu'eera.",
    pdfExported: "PDF Bireelii (.pdf) milkaa'inaan bu'eera.",
    publishingMsg: "Gara Level 2 API fi taphachiisaatti ergamaa jira...",
    publishSuccess: (count) => `✓ Sararoonni ${count} gara Level 2 API fi taphachiisaatti milkaa'inaan maxxanfamaniiru!`,
    publishOfflineFallback: "✓ Barreeffamni taphachiisaa barnootaatiif kuufameera (Level 2 API cufameera).",
    publishError: "Maxxansuun hin milkoofne.",
    audioToolbarAriaLabel: "Taphachiisaa Sagalee fi Haala Mirkaneessaa",
    playSegmentAria: (id) => `Sagalee sarara #${id} taphachiisi`,
    stopSegmentAria: "Sagalee Dhaabi",
    playLessonAria: "Sagalee Barnootaa Taphachiisi",
    playAudioBtn: "Sagalee Taphachiisi",
    stopAudioBtn: "Dhaabi",
    reviewedStatus: "Haala Sakatta'ame",
    progressAria: "Hammammii xumura sakatta'iinsaa",
    sampleAm: "Fakkeenya Amaaraa Fe'i",
    sampleEn: "Fakkeenya Ingilizii Fe'i",
    sampleOm: "Fakkeenya Afaan Oromoo Fe'i",
    sampleTi: "Fakkeenya Tigrignaa Fe'i",
    sampleSo: "Fakkeenya Somaalii Fe'i",
    sampleLoadedMsg: (lang) => `Fakkeenyi ${lang} fe'ameera (sararoota 5).`,
    importVttAria: "Faayila WebVTT ol-fe'i",
    importVttBtn: "Faayila WebVTT Galchi (.vtt)",
    addNewCueBtn: "+ Sarara Haaraa Dabali",
    startLabel: "Jalqaba:",
    endLabel: "Xumura:",
    speakerLabel: "Dubbataa:",
    speakerOptions: {
      instructor: "Barsiisaa (Instructor)",
      narrator: "Oodeessaa (Narrator)",
      presenter: "Dhiyeessaa (Presenter)",
      student: "Barataa (Student)",
    },
    humanReviewedBadge: "Mirkanaa'eera",
    draftAsrBadge: "Waraqaa ASR",
    deleteCueTitle: "Sarara haqi",
    draftAsrHeading: "Bu'aa Waraqaa ASR (AI kan uume)",
    copyToEditorBtn: "Gara Gulaalaatti Garagalchi",
    unverifiedAsrNote: "Waraqaa sagalee ofumaan qophaa'e kan hin mirkanoofne",
    reviewedTextHeading: "Barreeffama Namni Sakatta'e (Maxxansaaf Qophii)",
    visualDescTag: "[ibsa fakkii]",
    cleanBtn: "Qulqulleessi",
    revertBtn: "Deebisi",
    editorPlaceholder: "Barreeffama sakatta'amee mirkanaa'e asitti galchaa...",
    wordsLabel: "jechoota",
    charsLabel: "qubeewwan",
    longCueNote: "Sarara dheeraa (skiriinii irratti dacha'uu danda'a)",
    optimalLengthNote: "Dheerina filatamaa",
    exportHeading: "Faayiloota Mirkanaa'an Baasuu fi Maxxansuu",
    exportSubtitle: "Faayiloota WebVTT, JSON, Bireelii (.brf) buufadhaa ykn kallattiin taphachiisaa barnootaa irratti maxxansaa.",
    exportVttBtn: "WebVTT Mirkanaa'e Buufadhaa (.vtt)",
    exportJsonBtn: "JSON Barreeffamaa Buufadhaa (.json)",
    exportBrfBtn: "Bireelii Buufadhaa (.brf)",
    exportPdfBtn: "PDF Bireelii Buufadhaa (.pdf)",
    publishBtn: "Gara Level 2 API Ergi",
    publishingBtn: "Maxxanfamaa Jira...",
    viewInPlayerBtn: "Taphachiisaa keessatti ilaali →",
  },
  ti: {
    title: "ስቱዲዮ ትርጉምን ጽሑፍን (Transcript Studio)",
    subtitle: "ብሰብ ዝረጋገጽ ናይ ድምጺ ናብ ጽሑፍ ምቕያር፣ ናይ ግዜ ምዕሩይነትን ናይ ድምጺ መብርህን መስርሕ።",
    audioError: "ድምጺ ምጽዋት ኣይተኻእለን።",
    tagInserted: (tag) => `${tag} ተወሲኹ ኣሎ።`,
    speakerPrefixSet: (spk) => `ሽም ተዛራባይ (${spk}) ተቐሚጡ ኣሎ።`,
    cueCleaned: (id) => `ቅርጺ መስመር #${id} ጸሪዩ ኣሎ።`,
    cueReverted: (id) => `መስመር #${id} ናብ ናይ ቀደም ረቂቕ ተመሊሱ ኣሎ።`,
    newDraftText: "ሓድሽ ዝተወሰኸ ረቂቕ ጽሑፍ",
    newReviewedText: "ሓድሽ ዝተወሰኸ ዝተገምገመ ጽሑፍ",
    cueAdded: (id) => `ሓድሽ ናይ ትርጉም መስመር #${id} ተወሲኹ ኣሎ።`,
    cannotDeleteLast: "ብውሕዱ ሓደ ናይ ትርጉም መስመር ክህሉ ኣለዎ።",
    cueDeleted: (id) => `ናይ ትርጉም መስመር #${id} ተሰሪዙ ኣሎ።`,
    vttExported: "WebVTT ፋይል ብዓወት ወሪዱ ኣሎ።",
    jsonExported: "JSON ጽሑፍ ብዓወት ወሪዱ ኣሎ።",
    brfExported: "ናይ ብሬል ሰነድ (.brf) ብዓወት ወሪዱ ኣሎ።",
    pdfExported: "ናይ ብሬል ፒዲኤፍ (.pdf) ብዓወት ወሪዱ ኣሎ።",
    publishingMsg: "ናብ Level 2 APIን ቀጥታ መጫወትን ይለኣኽ ኣሎ...",
    publishSuccess: (count) => `✓ ${count} መስመራት ናብ Level 2 APIን ቀጥታ መጫወትን ብዓወት ተሓቲሞም ኣለዉ!`,
    publishOfflineFallback: "✓ ጽሑፍ ኣብ መሳርሒ ተዓቂቡ ንቐጥታ መጫወቲ ድሉው ኮይኑ ኣሎ (Level 2 API ኦፍላይን እዩ)።",
    publishError: "ምሕታም ኣይተዓወተን።",
    audioToolbarAriaLabel: "ናይ ድምጺ መጫወትን ኩነታት ምጽዳቕን",
    playSegmentAria: (id) => `ንመስመር #${id} ድምጺ ኣጻውት`,
    stopSegmentAria: "ድምጺ ኣዕርፍ",
    playLessonAria: "ምሉእ ትምህርቲ ኣጻውት",
    playAudioBtn: "ኦድዮ ኣጻውት",
    stopAudioBtn: "ኣዕርፍ",
    reviewedStatus: "ዝተገምገመ",
    progressAria: "ናይ ገምጋም ዕቤት",
    sampleAm: "ናይ ኣምሓርኛ ናሙና ጽዓን",
    sampleEn: "ናይ እንግሊዝኛ ናሙና ጽዓን",
    sampleOm: "ናይ ኦሮምኛ ናሙና ጽዓን",
    sampleTi: "ናይ ትግርኛ ናሙና ጽዓን",
    sampleSo: "ናይ ሶማሊኛ ናሙና ጽዓን",
    sampleLoadedMsg: (lang) => `ናይ ${lang} ናሙና ተጻዒኑ ኣሎ (5 መስመራት)።`,
    importVttAria: "WebVTT ፋይል ኣእቱ",
    importVttBtn: "WebVTT ፋይል ኣእቱ (.vtt)",
    addNewCueBtn: "+ ሓድሽ መስመር ወስኽ",
    startLabel: "መጀመርታ:",
    endLabel: "መወዳእታ:",
    speakerLabel: "ተዛራባይ:",
    speakerOptions: {
      instructor: "መምህር (Instructor)",
      narrator: "ተራኺ (Narrator)",
      presenter: "ኣቕራቢ (Presenter)",
      student: "ተምሃራይ (Student)",
    },
    humanReviewedBadge: "ዝተረጋገጸ",
    draftAsrBadge: "ረቂቕ ASR",
    deleteCueTitle: "መስመር ሰርዝ",
    draftAsrHeading: "ናይ ረቂቕ ASR ውጽኢት (ብAI ዝተዳለወ)",
    copyToEditorBtn: "ናብ ኣርታዒ ቅዳሕ",
    unverifiedAsrNote: "ዘይተረጋገጸ ኣውቶማቲክ ረቂቕ",
    reviewedTextHeading: "ዝተገምገመን ዝተኣረመን ጽሑፍ (Human Reviewed Text)",
    visualDescTag: "[ናይ ስላይድ መብርሂ]",
    cleanBtn: "ኣጽሪ",
    revertBtn: "ምለስ",
    editorPlaceholder: "ዝተገምገመ ጽሑፍ ኣብዚ ብዝርዝር ኣእቱ...",
    wordsLabel: "ቃላት",
    charsLabel: "ፊደላት",
    longCueNote: "ነዊሕ መስመር (ኣብ ስክሪን ክዕጸፍ ይኽእል)",
    optimalLengthNote: "ምርጡ ርዝመት",
    exportHeading: "ዝተገምገሙ ፋይላት ምውጻእን ምሕታምን",
    exportSubtitle: "ደረጃኦም ዝሓለዉ WebVTT፣ JSONን ብሬልን (.brf) ሰነዳት ኣውርዱ ወይ ብቐጥታ ኣብቲ ናይ ትምህርቲ መጫወቲ ሕተሙ።",
    exportVttBtn: "ዝተረጋገጸ WebVTT ኣውርድ (.vtt)",
    exportJsonBtn: "ናይ ጽሑፍ JSON ኣውርድ (.json)",
    exportBrfBtn: "ናይ ብሬይል ፋይል ኣውርድ (.brf)",
    exportPdfBtn: "ናይ ብሬይል ፒዲኤፍ ኣውርድ (.pdf)",
    publishBtn: "ናብ Level 2 API ልኣኽ",
    publishingBtn: "ይሕተም ኣሎ...",
    viewInPlayerBtn: "ኣብ መጫወቲ ርአ →",
  },
  so: {
    title: "Istuudiyaha Qoraalka & Codka (Transcript Studio)",
    subtitle: "Dhuumaha xaqiijinta ee qoraalka tooska ah ee codka, toosinta waqtiga, iyo sharaxaadda codka.",
    audioError: "Khalad ku yimid dib-u-ciyaaridda codka.",
    tagInserted: (tag) => `Waxaa la geliyay ${tag}.`,
    speakerPrefixSet: (spk) => `Hormuudka hadlaha (${spk}) waa la dejiyay.`,
    cueCleaned: (id) => `Habaynta khadka #${id} waa la nadiifiyay.`,
    cueReverted: (id) => `Khadka #${id} waxaa lagu celiyay qabyadii asalka ahayd.`,
    newDraftText: "Qoraalka qabyada ah ee qaybta codka cusub",
    newReviewedText: "Qoraalka dib loo eegay ee cusub",
    cueAdded: (id) => `Khadka cusub ee #${id} waa lagu daray.`,
    cannotDeleteLast: "Ugu yaraan hal khad waa inuu jiraa.",
    cueDeleted: (id) => `Khadka #${id} waa la tirtiray.`,
    vttExported: "Faylka WebVTT si guul leh ayaa loo soo dejiyay.",
    jsonExported: "Qoraalka JSON si guul leh ayaa loo soo dejiyay.",
    brfExported: "Dukumentiga Braille (.brf) si guul leh ayaa loo soo dejiyay.",
    pdfExported: "PDF Braille (.pdf) si guul leh ayaa loo soo dejiyay.",
    publishingMsg: "Waxaa loo dirayaa Level 2 API iyo ciyaaryahanka tooska ah...",
    publishSuccess: (count) => `✓ ${count} khad waxaa lagu daabacay Level 2 API iyo ciyaaryahanka tooska ah!`,
    publishOfflineFallback: "✓ Qoraalka waxaa lagu keydiyay browser-ka ciyaaryahanka casharka (Level 2 API ma shaqaynayo).",
    publishError: "Daabacaadda qoraalka way fashilantay.",
    audioToolbarAriaLabel: "Ciyaaryahanka Codka & Horumarka Xaqiijinta",
    playSegmentAria: (id) => `Daar codka khadka #${id}`,
    stopSegmentAria: "Jooji Codka",
    playLessonAria: "Daar Codka Casharka",
    playAudioBtn: "Daar Codka",
    stopAudioBtn: "Jooji",
    reviewedStatus: "Xaaladda La Eegay",
    progressAria: "Boqolkiiba dhammaadka dib-u-eegista",
    sampleAm: "Soo rar Tusaalaha Amxaariga",
    sampleEn: "Soo rar Tusaalaha Ingiriisiga",
    sampleOm: "Soo rar Tusaalaha Oromada",
    sampleTi: "Soo rar Tusaalaha Tigrinya",
    sampleSo: "Soo rar Tusaalaha Soomaaliga",
    sampleLoadedMsg: (lang) => `Tusaalaha ${lang} waa la soo raray (5 khad).`,
    importVttAria: "Soo geli faylka WebVTT",
    importVttBtn: "Soo geli Faylka WebVTT (.vtt)",
    addNewCueBtn: "+ Ku Dar Khad Cusub",
    startLabel: "Bilow:",
    endLabel: "Dhammaad:",
    speakerLabel: "Hadlaha:",
    speakerOptions: {
      instructor: "Macallin (Instructor)",
      narrator: "Sheekeeye (Narrator)",
      presenter: "Soo-jeediye (Presenter)",
      student: "Arday (Student)",
    },
    humanReviewedBadge: "Qof ayaa Dib u Eegay",
    draftAsrBadge: "Qabyo ASR",
    deleteCueTitle: "Tirtir khadka",
    draftAsrHeading: "Natiijada Qabyada ah ee ASR (Waxaa Soo Saaray AI)",
    copyToEditorBtn: "Nuuji Tafatiraha",
    unverifiedAsrNote: "Qoraal toos ah oo aan la xaqiijin",
    reviewedTextHeading: "Qoraalka Qofku Dib u Eegay (Diyaar u ah Daabacaadda)",
    visualDescTag: "[sharaxaadda muuqaalka]",
    cleanBtn: "Nadiifi",
    revertBtn: "Ku celi",
    editorPlaceholder: "Halkan ku qor qoraalka la hubiyay oo la xaqiijiyay...",
    wordsLabel: "ereyo",
    charsLabel: "xuruuf",
    longCueNote: "Khad dheer (wuxuu ku duubmi doonaa shaashadda)",
    optimalLengthNote: "Dhererka ugu fiican",
    exportHeading: "Soo Deji & Daabac Qoraallada La Xaqiijiyay",
    exportSubtitle: "Soo deji WebVTT tayo sare leh, JSON, dukumentiyada Braille (.brf), ama toos ugu daabac ciyaaryahanka casharka.",
    exportVttBtn: "Soo deji WebVTT La Xaqiijiyay (.vtt)",
    exportJsonBtn: "Soo deji Qoraalka JSON (.json)",
    exportBrfBtn: "Soo deji Braille (.brf)",
    exportPdfBtn: "Soo deji PDF Braille (.pdf)",
    publishBtn: "U Dir Level 2 API",
    publishingBtn: "Waa la daabacayaa...",
    viewInPlayerBtn: "Ku Eeg Ciyaaryahanka Casharka →",
  },
};

export const StudioView: React.FC<{ locale: SupportedLocale }> = ({ locale }) => {
  const t = STUDIO_TEXTS[locale] || STUDIO_TEXTS.en;
  const [segments, setSegments] = useState<StudioSegment[]>(() => getStudioSample(locale));
  const [statusMsg, setStatusMsg] = useState("");
  const [playingSegmentId, setPlayingSegmentId] = useState<number | null>(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(25);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState("Instructor");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Switch initial sample when language changes if segments match previous defaults
  useEffect(() => {
    setSegments(getStudioSample(locale));
  }, [locale]);

  // Audio time listener to handle segment-specific boundaries
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setAudioCurrentTime(audio.currentTime);
      if (playingSegmentId !== null) {
        const activeSeg = segments.find((s) => s.id === playingSegmentId);
        if (activeSeg && audio.currentTime >= activeSeg.end) {
          audio.pause();
          setPlayingSegmentId(null);
        }
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setPlayingSegmentId(null);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [playingSegmentId, segments]);

  const handlePlaySegment = (seg: StudioSegment) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingSegmentId === seg.id) {
      audio.pause();
      setPlayingSegmentId(null);
      return;
    }

    audio.currentTime = Math.max(0, seg.start);
    audio.play().then(() => {
      setPlayingSegmentId(seg.id);
    }).catch(() => {
      setStatusMsg(t.audioError);
    });
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingSegmentId(null);
    }
  };

  const handleTextChange = (id: number, newText: string) => {
    setSegments((prev) =>
      prev.map((seg) => (seg.id === id ? { ...seg, reviewedText: newText } : seg))
    );
  };

  const handleTimeChange = (id: number, field: "start" | "end", val: number) => {
    setSegments((prev) =>
      prev.map((seg) => {
        if (seg.id !== id) return seg;
        const updated = { ...seg, [field]: Math.max(0, val) };
        if (field === "start" && updated.start > updated.end) {
          updated.end = updated.start + 1;
        }
        return updated;
      })
    );
  };

  const handleNudgeTime = (id: number, delta: number) => {
    setSegments((prev) =>
      prev.map((seg) => {
        if (seg.id !== id) return seg;
        return {
          ...seg,
          start: Math.max(0, parseFloat((seg.start + delta).toFixed(2))),
          end: Math.max(0.5, parseFloat((seg.end + delta).toFixed(2))),
        };
      })
    );
  };

  const handleToggleStatus = (id: number) => {
    setSegments((prev) =>
      prev.map((seg) =>
        seg.id === id ? { ...seg, status: seg.status === "draft" ? "reviewed" : "draft" } : seg
      )
    );
  };

  // Basic editing tools for text manipulation with cursor placement & selection support
  const handleInsertTag = (id: number, tag: string) => {
    const textarea = document.getElementById(`reviewed-text-${id}`) as HTMLTextAreaElement | null;
    setSegments((prev) =>
      prev.map((seg) => {
        if (seg.id !== id) return seg;
        let current = seg.reviewedText;
        if (textarea && typeof textarea.selectionStart === "number" && typeof textarea.selectionEnd === "number") {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const before = current.substring(0, start);
          const after = current.substring(end);
          const needsSpaceBefore = before.length > 0 && !before.endsWith(" ");
          const needsSpaceAfter = after.length > 0 && !after.startsWith(" ");
          const next = `${before}${needsSpaceBefore ? " " : ""}${tag}${needsSpaceAfter ? " " : ""}${after}`;
          setTimeout(() => {
            textarea.focus();
            const newPos = start + tag.length + (needsSpaceBefore ? 1 : 0);
            textarea.setSelectionRange(newPos, newPos);
          }, 10);
          return { ...seg, reviewedText: next, status: "reviewed" };
        } else {
          const trimmed = current.trim();
          const next = trimmed ? `${trimmed} ${tag}` : tag;
          return { ...seg, reviewedText: next, status: "reviewed" };
        }
      })
    );
    setStatusMsg(t.tagInserted(tag));
  };

  const handleInsertSpeaker = (id: number, speaker: string) => {
    const prefix = `(${speaker}) `;
    setSegments((prev) =>
      prev.map((seg) => {
        if (seg.id !== id) return seg;
        // Clean any existing leading speaker prefix like (Instructor) or (Narrator)
        const cleaned = seg.reviewedText.replace(/^\([^)]+\)\s*/, "");
        return { ...seg, reviewedText: `${prefix}${cleaned}`, status: "reviewed" };
      })
    );
    setStatusMsg(t.speakerPrefixSet(speaker));
  };

  const handleCleanText = (id: number) => {
    setSegments((prev) =>
      prev.map((seg) => {
        if (seg.id !== id) return seg;
        let text = seg.reviewedText;
        // 1. Collapse multiple whitespace and trim ends
        text = text.replace(/[ \t]+/g, " ").trim();
        // 2. Remove duplicate punctuation (e.g. ".." or ",,")
        text = text.replace(/([.,!?፣፤።])\1+/g, "$1");
        // 3. Fix spaces before punctuation (e.g. "word ." -> "word.")
        text = text.replace(/\s+([.,!?;:፣፤።])/g, "$1");
        // 4. Ensure space after punctuation if followed by a letter or word
        text = text.replace(/([.,!?;:፣፤።])([A-Za-z\u1200-\u137F])/g, "$1 $2");
        // 5. Capitalize first letter of sentence
        if (text.length > 0) {
          text = text.charAt(0).toUpperCase() + text.slice(1);
        }
        return { ...seg, reviewedText: text, status: "reviewed" };
      })
    );
    setStatusMsg(t.cueCleaned(id));
  };

  const handleCopyDraft = (id: number) => {
    setSegments((prev) =>
      prev.map((seg) => (seg.id === id ? { ...seg, reviewedText: seg.draftText, status: "draft" } : seg))
    );
    setStatusMsg(t.cueReverted(id));
  };

  const handleAddCue = () => {
    const lastSeg = segments[segments.length - 1];
    const newStart = lastSeg ? parseFloat(lastSeg.end.toFixed(1)) : 0;
    const newEnd = parseFloat((newStart + 4.0).toFixed(1));
    const newId = (segments.length > 0 ? Math.max(...segments.map((s) => s.id)) : 0) + 1;
    const newCue: StudioSegment = {
      id: newId,
      start: newStart,
      end: newEnd,
      speaker: selectedSpeaker,
      draftText: t.newDraftText,
      reviewedText: t.newReviewedText,
      status: "draft",
    };
    setSegments((prev) => [...prev, newCue]);
    setStatusMsg(t.cueAdded(newId));

    // Smooth scroll to the newly added cue and focus its textarea
    setTimeout(() => {
      const el = document.getElementById(`reviewed-text-${newId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
    }, 100);
  };

  const handleDeleteCue = (id: number) => {
    if (segments.length <= 1) {
      setStatusMsg(t.cannotDeleteLast);
      return;
    }
    setSegments((prev) => prev.filter((s) => s.id !== id));
    setStatusMsg(t.cueDeleted(id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsed = parseVTTContent(content);
        setSegments(parsed);
        setStatusMsg(t.sampleLoadedMsg(file.name));
      }
    };
    reader.readAsText(file);
  };

  const generateVTT = (): string => {
    const langLabel = {
      en: "English Human-Reviewed",
      am: "አማርኛ የተገመገመ",
      om: "Afaan Oromoo Qorame",
      ti: "ትግርኛ ዝተገምገመ",
      so: "Af Soomaali Dib loo eegay",
    }[locale] || "Reviewed";
    let vtt = `WEBVTT - Digital Workplace Skills (${langLabel})\n\n`;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const text = seg.reviewedText || seg.draftText;
      vtt += `${i + 1}\n`;
      vtt += `${formatVTTTime(seg.start)} --> ${formatVTTTime(seg.end)}\n`;
      vtt += `${text}\n\n`;
    }
    return vtt;
  };

  const handleExportVTT = () => {
    downloadFile(generateVTT(), `captions.reviewed.${locale}.vtt`, "text/vtt;charset=utf-8");
    setStatusMsg(t.vttExported);
  };

  const handleExportJSON = () => {
    const jsonOutput = {
      lessonId: "digital-workplace-01",
      language: locale,
      title: t.title,
      exportedAt: new Date().toISOString(),
      reviewStatus: reviewedCount === segments.length ? "verified" : "partial_draft",
      segments: segments.map((seg) => ({
        id: seg.id,
        start: seg.start,
        end: seg.end,
        speaker: seg.speaker,
        text: seg.reviewedText || seg.draftText,
        draftText: seg.draftText,
        status: seg.status,
        visualDescription: t.visualDescTag,
      })),
    };
    const jsonStr = JSON.stringify(jsonOutput, null, 2);
    downloadFile(jsonStr, `transcript.reviewed.${locale}.json`, "application/json");
    setStatusMsg(t.jsonExported);
  };

  const handleExportBRF = () => {
    const title = locale === "am" || locale === "ti"
      ? "የዲጂታል የሥራ ቦታ ክህሎቶች፡ መሠረታዊ"
      : "DIGITAL WORKPLACE SKILLS: FOUNDATIONS";

    const segs = segments.map((seg) => ({
      start: seg.start,
      end: seg.end,
      speaker: seg.speaker,
      text: seg.reviewedText || seg.draftText,
    }));

    const brfDoc = generateBRFDocument({
      title,
      language: (locale === "am" || locale === "ti") ? "am" : "en",
      date: (locale === "am" || locale === "ti") ? "2026-11-14 (ኅዳር 5, 2019 ዓ.ም.)" : "2026-11-14 (HIDAR 5, 2019 E.C.)",
      segments: segs,
    });

    downloadFile(brfDoc, `lesson-transcript.${locale}.brf`, "text/plain;charset=utf-8");
    setStatusMsg(t.brfExported);
  };

  const handleExportBraillePDF = () => {
    const pdfPath = (locale === "am" || locale === "ti")
      ? "/lessons/digital-workplace/documents/lesson-braille.am.pdf"
      : "/lessons/digital-workplace/documents/lesson-braille.en.pdf";
    const link = document.createElement("a");
    link.href = pdfPath;
    link.download = `lesson-braille.${locale}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatusMsg(t.pdfExported);
  };

  const handlePublishToAPI = async () => {
    setIsPublishing(true);
    setStatusMsg(t.publishingMsg);

    const vttContent = generateVTT();
    const langKey = locale;

    // 1. Store in localStorage so live player on /lesson updates in real time
    try {
      localStorage.setItem(`db-player:custom-vtt:${langKey}`, vttContent);
      const jsonOutput = {
        lessonId: "digital-workplace-01",
        language: langKey,
        segments: segments.map((seg) => ({
          id: seg.id,
          start: seg.start,
          end: seg.end,
          speaker: seg.speaker,
          text: seg.reviewedText || seg.draftText,
          status: seg.status,
          visualDescription: "",
        })),
      };
      localStorage.setItem(`db-player:custom-transcript:${langKey}`, JSON.stringify(jsonOutput));
      window.dispatchEvent(new CustomEvent("db-player:captions-updated", {
        detail: { language: langKey, vttContent }
      }));
    } catch (err) {
      console.warn("Local storage update warning:", err);
    }

    // 2. Publish to FastAPI Level 2 service
    const apiBaseUrl = import.meta.env.VITE_TRANSCRIPT_API_URL !== undefined
      ? import.meta.env.VITE_TRANSCRIPT_API_URL
      : (import.meta.env.DEV ? "http://localhost:8000" : "");
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/lessons/digital-workplace-01/captions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: langKey,
          vttContent,
          author: "Human Reviewer (Studio)",
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setStatusMsg(t.publishSuccess(data.cuesCount));
    } catch {
      setStatusMsg(t.publishOfflineFallback);
    } finally {
      setIsPublishing(false);
    }
  };

  const reviewedCount = segments.filter((s) => s.status === "reviewed").length;
  const progressPercent = Math.round((reviewedCount / segments.length) * 100) || 0;

  return (
    <div style={{ maxWidth: "1180px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Hidden native audio element for synchronized snippet playback */}
      <audio
        ref={audioRef}
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/lessons/digital-workplace/media/lesson-audio.opus" type="audio/ogg; codecs=opus" />
        <source src="/lessons/digital-workplace/media/lesson.mp4" type="video/mp4" />
      </audio>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "36px", color: "var(--color-ink)", marginBottom: "0.5rem", letterSpacing: "-0.015em", fontWeight: 700 }}>
          {t.title}
        </h2>
        <p style={{ margin: 0, color: "var(--color-muted-ink)", fontSize: "17px", lineHeight: 1.5 }}>
          {t.subtitle}
        </p>
      </div>

      {/* Audio Player Bar & Review Progress */}
      <section
        className="card"
        style={{
          padding: "1.25rem 1.75rem",
          marginBottom: "2rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.25rem",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-card)",
        }}
        aria-label={t.audioToolbarAriaLabel}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={playingSegmentId !== null ? handleStopAudio : () => handlePlaySegment(segments[0])}
            className="btn btn-primary"
            style={{ minWidth: "130px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            aria-label={playingSegmentId !== null ? t.stopAudioBtn : t.playLessonAria}
          >
            {playingSegmentId !== null ? (
              <><IconSquare size={13} /> <span>{t.stopAudioBtn}</span></>
            ) : (
              <><IconPlay size={13} /> <span>{t.playAudioBtn}</span></>
            )}
          </button>

          <div style={{ fontSize: "14px", color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>
            <strong>{formatTime(audioCurrentTime)}</strong> / {formatTime(audioDuration)}
          </div>

          <span
            className="badge badge-brand"
            style={{ fontSize: "12px", padding: "0.3rem 0.75rem" }}
          >
            Source: lesson-audio.opus (24kbps Speech)
          </span>
        </div>

        {/* Review Completion Metric */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: "240px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "0.25rem", color: "var(--color-ink)", fontWeight: 600 }}>
              <span>{t.reviewedStatus}</span>
              <span>{reviewedCount}/{segments.length} ({progressPercent}%)</span>
            </div>
            <div
              style={{
                width: "100%",
                height: "8px",
                background: "var(--color-border-subtle)",
                borderRadius: "var(--radius-pill)",
                overflow: "hidden",
              }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t.progressAria}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: "100%",
                  background: progressPercent === 100 ? "#34C759" : "var(--color-brand)",
                  transition: "width 0.24s cubic-bezier(0.4, 0, 0.6, 1)",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Toolbar: Sample Selector, VTT Import, Add Cue */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.75rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => {
              setSegments(AMHARIC_SAMPLE);
              setStatusMsg(t.sampleLoadedMsg("አማርኛ (Amharic)"));
            }}
            className="btn btn-secondary"
            style={{ fontSize: "12px", padding: "0.4rem 0.75rem" }}
          >
            {t.sampleAm}
          </button>

          <button
            type="button"
            onClick={() => {
              setSegments(ENGLISH_SAMPLE);
              setStatusMsg(t.sampleLoadedMsg("English"));
            }}
            className="btn btn-secondary"
            style={{ fontSize: "12px", padding: "0.4rem 0.75rem" }}
          >
            {t.sampleEn}
          </button>

          <button
            type="button"
            onClick={() => {
              setSegments(OROMO_SAMPLE);
              setStatusMsg(t.sampleLoadedMsg("Afaan Oromoo"));
            }}
            className="btn btn-secondary"
            style={{ fontSize: "12px", padding: "0.4rem 0.75rem" }}
          >
            {t.sampleOm}
          </button>

          <button
            type="button"
            onClick={() => {
              setSegments(TIGRIGNA_SAMPLE);
              setStatusMsg(t.sampleLoadedMsg("ትግርኛ (Tigrinya)"));
            }}
            className="btn btn-secondary"
            style={{ fontSize: "12px", padding: "0.4rem 0.75rem" }}
          >
            {t.sampleTi}
          </button>

          <button
            type="button"
            onClick={() => {
              setSegments(SOMALI_SAMPLE);
              setStatusMsg(t.sampleLoadedMsg("Af Soomaali (Somali)"));
            }}
            className="btn btn-secondary"
            style={{ fontSize: "12px", padding: "0.4rem 0.75rem" }}
          >
            {t.sampleSo}
          </button>

          {/* VTT File Uploader */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".vtt"
            style={{ display: "none" }}
            onChange={handleFileUpload}
            aria-label={t.importVttAria}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-outline"
            style={{ fontSize: "12px", padding: "0.4rem 0.75rem", display: "inline-flex", alignItems: "center", gap: "0.45rem" }}
          >
            <IconFolder size={14} />
            <span>{t.importVttBtn}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddCue}
          className="btn btn-outline"
          style={{ fontSize: "13px", padding: "0.45rem 1rem", fontWeight: 600 }}
        >
          + {t.addNewCueBtn}
        </button>
      </div>

      {/* Main Cue Cards List - Spacious Paragraph Editing */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2.5rem" }}>
        {segments.map((seg, idx) => {
          const isPlayingThis = playingSegmentId === seg.id;
          const wordCount = (seg.reviewedText.trim().match(/\S+/g) || []).length;
          const charCount = seg.reviewedText.length;

          return (
            <article
              key={seg.id}
              className="card"
              style={{
                padding: "1.5rem",
                borderRadius: "var(--radius-card)",
                background: isPlayingThis ? "var(--color-brand-subtle)" : "var(--color-surface-elevated)",
                border: isPlayingThis ? "2px solid var(--color-brand)" : "1px solid var(--color-border)",
                boxShadow: isPlayingThis ? "0 8px 24px var(--color-brand-subtle)" : "var(--shadow-card)",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.6, 1)",
              }}
              aria-label={`Cue ${idx + 1}`}
            >
              {/* Card Header: Timing, Play, Speaker, Status, Delete */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                  paddingBottom: "1.1rem",
                  borderBottom: "1px solid var(--color-border-subtle)",
                  marginBottom: "1.25rem",
                }}
              >
                {/* Left: Cue ID, Play Button, Time Inputs */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "14px",
                      background: "var(--color-surface)",
                      color: "var(--color-ink)",
                      padding: "0.3rem 0.75rem",
                      borderRadius: "var(--radius-pill)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    #{idx + 1}
                  </span>

                  {/* Snippet Playback Button */}
                  <button
                    type="button"
                    onClick={() => handlePlaySegment(seg)}
                    className="btn"
                    style={{
                      background: isPlayingThis ? "#FF3B30" : "var(--color-brand)",
                      color: "#FFFFFF",
                      padding: "0.4rem 0.95rem",
                      fontSize: "13px",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.45rem",
                    }}
                    aria-label={isPlayingThis ? t.stopSegmentAria : t.playSegmentAria(idx + 1)}
                  >
                    {isPlayingThis ? (
                      <><IconSquare size={12} /> <span>{t.stopAudioBtn}</span></>
                    ) : (
                      <><IconPlay size={12} /> <span>{t.playAudioBtn}</span></>
                    )}
                  </button>

                  {/* Timing Inputs with Nudge Controls */}
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "13px" }}>
                    <label htmlFor={`start-time-${seg.id}`} style={{ fontWeight: 600, color: "var(--color-muted-ink)" }}>
                      {t.startLabel}
                    </label>
                    <input
                      id={`start-time-${seg.id}`}
                      type="number"
                      step="0.1"
                      min="0"
                      value={seg.start}
                      onChange={(e) => handleTimeChange(seg.id, "start", parseFloat(e.target.value) || 0)}
                      style={{
                        width: "68px",
                        padding: "0.35rem 0.5rem",
                        border: "1px solid var(--color-border)",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontFamily: "var(--font-mono)",
                        textAlign: "center",
                      }}
                      aria-label={`Start time in seconds for cue ${idx + 1}`}
                    />

                    <span style={{ color: "var(--color-muted-ink)" }}>→</span>

                    <label htmlFor={`end-time-${seg.id}`} style={{ fontWeight: 600, color: "var(--color-muted-ink)" }}>
                      {t.endLabel}
                    </label>
                    <input
                      id={`end-time-${seg.id}`}
                      type="number"
                      step="0.1"
                      min="0"
                      value={seg.end}
                      onChange={(e) => handleTimeChange(seg.id, "end", parseFloat(e.target.value) || 0)}
                      style={{
                        width: "68px",
                        padding: "0.35rem 0.5rem",
                        border: "1px solid var(--color-border)",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontFamily: "var(--font-mono)",
                        textAlign: "center",
                      }}
                      aria-label={`End time in seconds for cue ${idx + 1}`}
                    />

                    <span style={{ fontSize: "12px", color: "var(--color-muted-ink)" }}>
                      ({(seg.end - seg.start).toFixed(1)}s)
                    </span>

                    {/* Nudge Buttons */}
                    <div style={{ display: "inline-flex", gap: "2px", marginLeft: "4px" }}>
                      <button
                        type="button"
                        onClick={() => handleNudgeTime(seg.id, -0.2)}
                        title="Nudge earlier by 0.2s"
                        style={{ padding: "0.25rem 0.5rem", border: "1px solid var(--color-border)", borderRadius: "4px", background: "var(--color-surface-elevated)", color: "var(--color-ink)", cursor: "pointer", fontSize: "11px" }}
                        aria-label={`Nudge cue ${idx + 1} earlier by 0.2 seconds`}
                      >
                        −0.2s
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNudgeTime(seg.id, 0.2)}
                        title="Nudge later by 0.2s"
                        style={{ padding: "0.25rem 0.5rem", border: "1px solid var(--color-border)", borderRadius: "4px", background: "var(--color-surface-elevated)", color: "var(--color-ink)", cursor: "pointer", fontSize: "11px" }}
                        aria-label={`Nudge cue ${idx + 1} later by 0.2 seconds`}
                      >
                        +0.2s
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Speaker Tag, Status Pill, Delete Action */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <select
                    value={seg.speaker}
                    onChange={(e) => {
                      const newSpeaker = e.target.value;
                      setSelectedSpeaker(newSpeaker);
                      setSegments((prev) =>
                        prev.map((s) => {
                          if (s.id !== seg.id) return s;
                          let updatedText = s.reviewedText;
                          if (/^\([^)]+\)\s*/.test(updatedText)) {
                            updatedText = updatedText.replace(/^\([^)]+\)\s*/, `(${newSpeaker}) `);
                          }
                          return { ...s, speaker: newSpeaker, reviewedText: updatedText };
                        })
                      );
                      setStatusMsg(t.speakerPrefixSet(newSpeaker));
                    }}
                    style={{
                      padding: "0.35rem 0.65rem",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-pill)",
                      fontSize: "12px",
                      background: "var(--color-surface-elevated)",
                      color: "var(--color-ink)",
                      cursor: "pointer",
                    }}
                    aria-label={`Speaker for cue ${idx + 1}`}
                  >
                    <option value="Instructor">{t.speakerOptions.instructor}</option>
                    <option value="Narrator">{t.speakerOptions.narrator}</option>
                    <option value="Presenter">{t.speakerOptions.presenter}</option>
                    <option value="Student">{t.speakerOptions.student}</option>
                    {!["Instructor", "Narrator", "Presenter", "Student"].includes(seg.speaker) && (
                      <option value={seg.speaker}>{seg.speaker}</option>
                    )}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(seg.id)}
                    className={`badge ${seg.status === "reviewed" ? "badge-success" : "badge-neutral"}`}
                    style={{
                      border: "none",
                      cursor: "pointer",
                      padding: "0.4rem 0.95rem",
                      fontSize: "12px",
                      borderRadius: "var(--radius-pill)",
                      fontWeight: 600,
                    }}
                    aria-label={`Toggle reviewed status for cue ${idx + 1}`}
                  >
                    {seg.status === "reviewed" ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                        <IconCheck size={13} />
                        <span>{t.humanReviewedBadge}</span>
                      </span>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                        <IconCircleDot size={11} />
                        <span>{t.draftAsrBadge}</span>
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCue(seg.id)}
                    title={t.deleteCueTitle}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#8E8E93",
                      cursor: "pointer",
                      padding: "0.35rem 0.5rem",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "4px",
                    }}
                    aria-label={`Delete cue ${idx + 1}`}
                  >
                    <IconClose size={13} />
                  </button>
                </div>
              </div>

              {/* Card Body: Split Grid for Draft ASR Reference and Big Human Reviewed Editor */}
              <div
                className="studio-split-grid"
                style={{
                  display: "grid",
                  gap: "1.5rem",
                }}
              >
                {/* Left Column: Draft ASR Reference Box */}
                <div
                  style={{
                    padding: "1rem 1.25rem",
                    background: "var(--color-surface)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-border-subtle)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-muted-ink)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {t.draftAsrHeading}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyDraft(seg.id)}
                        aria-label={`Copy draft ASR text to editor for cue ${idx + 1}`}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--color-brand)",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          padding: 0,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                        }}
                      >
                        <IconCopy size={13} />
                        <span>{t.copyToEditorBtn}</span>
                      </button>
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        lineHeight: 1.6,
                        color: "var(--color-ink)",
                        fontStyle: "italic",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      "{seg.draftText}"
                    </p>
                  </div>

                  <div style={{ marginTop: "1rem", fontSize: "12px", color: "var(--color-muted-ink)" }}>
                    {t.unverifiedAsrNote}
                  </div>
                </div>

                {/* Right Column: Much Bigger Human Reviewed Text Editor & Editing Tools */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                    }}
                  >
                    <label
                      htmlFor={`reviewed-text-${seg.id}`}
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "var(--color-ink)",
                      }}
                    >
                      {t.reviewedTextHeading}
                    </label>

                    {/* Basic Editing Tools Toolbar */}
                    <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => handleInsertTag(seg.id, "[music]")}
                        style={{
                          padding: "0.2rem 0.55rem",
                          fontSize: "11px",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-pill)",
                          background: "var(--color-surface-elevated)",
                          color: "var(--color-ink)",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                        aria-label={`Insert music tag for cue ${idx + 1}`}
                      >
                        + [music]
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInsertTag(seg.id, t.visualDescTag)}
                        style={{
                          padding: "0.2rem 0.55rem",
                          fontSize: "11px",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-pill)",
                          background: "var(--color-surface-elevated)",
                          color: "var(--color-ink)",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                        aria-label={`Insert visual description tag for cue ${idx + 1}`}
                      >
                        + [visual]
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInsertSpeaker(seg.id, seg.speaker)}
                        style={{
                          padding: "0.2rem 0.55rem",
                          fontSize: "11px",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-pill)",
                          background: "var(--color-surface-elevated)",
                          color: "var(--color-ink)",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                        aria-label={`Insert speaker prefix for cue ${idx + 1}`}
                      >
                        + ({seg.speaker})
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCleanText(seg.id)}
                        style={{
                          padding: "0.2rem 0.55rem",
                          fontSize: "11px",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-pill)",
                          background: "var(--color-surface-elevated)",
                          color: "var(--color-ink)",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                        aria-label={`Clean formatting and punctuation for cue ${idx + 1}`}
                      >
                        {t.cleanBtn}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyDraft(seg.id)}
                        style={{
                          padding: "0.2rem 0.55rem",
                          fontSize: "11px",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-pill)",
                          background: "var(--color-surface-elevated)",
                          color: "var(--color-muted-ink)",
                          cursor: "pointer",
                        }}
                        aria-label={`Revert to draft ASR for cue ${idx + 1}`}
                      >
                        ↺ {t.revertBtn}
                      </button>
                    </div>
                  </div>

                  {/* Spacious Multi-line Paragraph Textarea */}
                  <textarea
                    id={`reviewed-text-${seg.id}`}
                    value={seg.reviewedText}
                    onChange={(e) => handleTextChange(seg.id, e.target.value)}
                    rows={4}
                    style={{
                      width: "100%",
                      minHeight: "105px",
                      padding: "0.85rem 1rem",
                      border: "1.5px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "15px",
                      lineHeight: "1.6",
                      fontFamily: "var(--font-body)",
                      color: "var(--color-ink)",
                      background: "var(--color-surface-elevated)",
                      resize: "vertical",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      boxSizing: "border-box",
                      outline: "none",
                      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    }}
                    aria-label={`Human reviewed text paragraph for cue ${idx + 1}`}
                    placeholder={t.editorPlaceholder}
                  />

                  {/* Live Word and Character Metrics */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "0.4rem",
                      fontSize: "12px",
                      color: "var(--color-muted-ink)",
                    }}
                  >
                    <span>
                      {wordCount} {t.wordsLabel} · {charCount} {t.charsLabel}
                    </span>
                    <span>
                      {charCount > 120 ? (
                        <span style={{ color: "#FF9500" }}>
                          ℹ {t.longCueNote}
                        </span>
                      ) : (
                        <span style={{ color: "#34C759", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                          <IconCheck size={12} />
                          <span>{t.optimalLengthNote}</span>
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Action Footer: Export & API Publish */}
      <section
        className="card"
        style={{
          padding: "1.75rem",
          background: "var(--color-surface)",
          borderRadius: "var(--radius-card)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "20px", color: "var(--color-ink)", fontWeight: 700 }}>
          {t.exportHeading}
        </h3>
        <p style={{ margin: "0 0 1.5rem 0", color: "var(--color-muted-ink)", fontSize: "14px", lineHeight: 1.55 }}>
          {t.exportSubtitle}
        </p>

        <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            onClick={handleExportVTT}
            className="btn btn-primary"
            style={{ padding: "0.6rem 1.25rem", fontSize: "14px" }}
          >
            {t.exportVttBtn}
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="btn btn-outline"
            style={{ padding: "0.6rem 1.25rem", fontSize: "14px" }}
          >
            {t.exportJsonBtn}
          </button>

          <button
            type="button"
            onClick={handleExportBRF}
            className="btn btn-secondary"
            style={{ padding: "0.6rem 1.25rem", fontSize: "14px" }}
          >
            {t.exportBrfBtn}
          </button>

          <button
            type="button"
            onClick={handleExportBraillePDF}
            className="btn btn-secondary"
            style={{ padding: "0.6rem 1.25rem", fontSize: "14px" }}
          >
            {t.exportPdfBtn}
          </button>

          <button
            type="button"
            onClick={handlePublishToAPI}
            disabled={isPublishing}
            className="btn"
            style={{
              padding: "0.6rem 1.25rem",
              fontSize: "14px",
              background: "var(--color-success-bg, #34C759)",
              color: "var(--color-success-ink, #FFFFFF)",
              border: "1px solid var(--color-success-border, transparent)",
              fontWeight: 600,
              cursor: isPublishing ? "wait" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <IconCloudUpload size={16} />
            <span>{isPublishing ? t.publishingBtn : t.publishBtn}</span>
          </button>
        </div>

        {statusMsg && (
          <div
            style={{
              marginTop: "1.25rem",
              padding: "0.75rem 1.25rem",
              background: statusMsg.includes("አልተገኘም") || statusMsg.includes("offline") || statusMsg.includes("unreachable") ? "var(--color-alert-bg)" : "var(--color-success-bg)",
              color: statusMsg.includes("አልተገኘም") || statusMsg.includes("offline") || statusMsg.includes("unreachable") ? "var(--color-alert-ink)" : "var(--color-success-ink)",
              border: statusMsg.includes("አልተገኘም") || statusMsg.includes("offline") || statusMsg.includes("unreachable") ? "1px solid var(--color-alert-border)" : "1px solid var(--color-success-border)",
              borderRadius: "var(--radius-pill)",
              fontWeight: 600,
              fontSize: "13px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.85rem",
              flexWrap: "wrap",
            }}
            role="status"
            aria-live="polite"
          >
            <span>{statusMsg}</span>
            {statusMsg.includes("✓") && (
              <a
                href="/lesson"
                style={{
                  color: "#0071E3",
                  fontWeight: 700,
                  textDecoration: "underline",
                  fontSize: "13px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                {t.viewInPlayerBtn}
              </a>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
