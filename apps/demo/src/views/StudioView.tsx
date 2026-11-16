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

export const StudioView: React.FC<{ locale: SupportedLocale }> = ({ locale }) => {
  const isAm = locale === "am";
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
      setStatusMsg(isAm ? "ኦዲዮውን ማጫወት አልተቻለም።" : "Audio playback error.");
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
    setStatusMsg(isAm ? `${tag} ተካቷል።` : `Inserted ${tag}`);
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
    setStatusMsg(isAm ? `የተናጋሪ ስም (${speaker}) ተካቷል።` : `Set speaker prefix (${speaker})`);
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
    setStatusMsg(isAm ? `መስመር #${id} ተስተካክሎ ጸድቷል።` : `Cleaned formatting for cue #${id}.`);
  };

  const handleCopyDraft = (id: number) => {
    setSegments((prev) =>
      prev.map((seg) => (seg.id === id ? { ...seg, reviewedText: seg.draftText, status: "draft" } : seg))
    );
    setStatusMsg(isAm ? `መስመር #${id} ወደ ቀድሞ ረቂቅ ተመልሷል።` : `Reverted cue #${id} to original draft.`);
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
      draftText: isAm ? "አዲስ የተጨመረ ረቂቅ ጽሑፍ" : "New audio segment draft text",
      reviewedText: isAm ? "አዲስ የተጨመረ የተገመገመ ጽሑፍ" : "New audio segment reviewed text",
      status: "draft",
    };
    setSegments((prev) => [...prev, newCue]);
    setStatusMsg(isAm ? `አዲስ የትርጉም መስመር #${newId} ተጨምሯል።` : `New cue #${newId} added.`);

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
      setStatusMsg(isAm ? "ቢያንስ አንድ የትርጉም መስመር መኖር አለበት።" : "Cannot delete the last remaining cue.");
      return;
    }
    setSegments((prev) => prev.filter((s) => s.id !== id));
    setStatusMsg(isAm ? `የትርጉም መስመር #${id} ተሰርዟል።` : `Cue #${id} deleted.`);
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
        setStatusMsg(
          isAm
            ? `የWebVTT ፋይል (${file.name}) በተሳካ ሁኔታ ተጭኗል፤ ${parsed.length} መስመሮች ተገኝተዋል።`
            : `Loaded WebVTT file (${file.name}) with ${parsed.length} cues.`
        );
      }
    };
    reader.readAsText(file);
  };

  const generateVTT = (): string => {
    let vtt = `WEBVTT - Digital Workplace Skills (${isAm ? "አማርኛ የተገመገመ" : "English Human-Reviewed"})\n\n`;
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
    downloadFile(generateVTT(), isAm ? "captions.reviewed.am.vtt" : "captions.reviewed.en.vtt", "text/vtt;charset=utf-8");
    setStatusMsg(isAm ? "WebVTT ፋይል በተሳካ ሁኔታ ወርዷል።" : "Exported captions.reviewed.vtt successfully.");
  };

  const handleExportJSON = () => {
    const jsonOutput = {
      lessonId: "digital-workplace-01",
      language: isAm ? "am" : "en",
      title: isAm ? "የዲጂታል የሥራ ቦታ ክህሎቶች፡ መሠረታዊ" : "Digital Workplace Skills: Foundations",
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
        visualDescription: isAm ? "የስላይድ ማብራሪያ" : "Visual presentation slide",
      })),
    };
    const jsonStr = JSON.stringify(jsonOutput, null, 2);
    downloadFile(jsonStr, isAm ? "transcript.reviewed.am.json" : "transcript.reviewed.en.json", "application/json");
    setStatusMsg(isAm ? "የጽሑፍ ግልባጭ JSON በተሳካ ሁኔታ ወርዷል።" : "Exported transcript.reviewed.json successfully.");
  };

  const handleExportBRF = () => {
    const title = isAm
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
      language: isAm ? "am" : "en",
      date: isAm ? "2026-11-14 (ኅዳር 5, 2019 ዓ.ም.)" : "2026-11-14 (HIDAR 5, 2019 E.C.)",
      segments: segs,
    });

    downloadFile(brfDoc, isAm ? "lesson-transcript.am.brf" : "lesson-transcript.en.brf", "text/plain;charset=utf-8");
    setStatusMsg(isAm ? "ትክክለኛ የብሬይል ፊደላት የያዘ ፋይል (.brf) በተሳካ ሁኔታ ወርዷል።" : "Exported authentic Braille (.brf) document successfully.");
  };

  const handleExportBraillePDF = () => {
    const pdfPath = isAm
      ? "/lessons/digital-workplace/documents/lesson-braille.am.pdf"
      : "/lessons/digital-workplace/documents/lesson-braille.en.pdf";
    const link = document.createElement("a");
    link.href = pdfPath;
    link.download = isAm ? "lesson-braille.am.pdf" : "lesson-braille.en.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatusMsg(isAm ? "የሚዳሰስ የብሬል ፒዲኤፍ ሰነድ (.pdf) በተሳካ ሁኔታ ወርዷል።" : "Exported lesson-braille.pdf successfully.");
  };

  const handlePublishToAPI = async () => {
    setIsPublishing(true);
    setStatusMsg(isAm ? "ወደ Level 2 API እና ቀጥታ ማጫወቻው እየተላከ ነው..." : "Publishing reviewed captions to Level 2 API & live player...");

    const vttContent = generateVTT();
    const langKey = isAm ? "am" : "en";

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
    const apiBaseUrl = import.meta.env.VITE_TRANSCRIPT_API_URL || "http://localhost:8000";
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
      setStatusMsg(
        isAm
          ? `✓ ${data.cuesCount} መስመሮች ወደ Level 2 API (Port 8000) እና ቀጥታ ማጫወቻው በተሳካ ሁኔታ ተልከው ታትመዋል!`
          : `✓ Successfully published ${data.cuesCount} cues to Level 2 API (Port 8000) and live lesson player!`
      );
    } catch {
      setStatusMsg(
        isAm
          ? "✓ የትርጉም ጽሑፉ በመሣሪያው ላይ ተቀምጦ ለቀጥታ ማጫወቻው ዝግጁ ሆኗል (Level 2 API ኦፍላይን ነው)።"
          : "✓ Captions saved to browser storage for the live lesson player (Level 2 API server is currently unreachable)."
      );
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
          {isAm ? "የትርጉም ስቱዲዮ (Transcript Studio)" : "Transcript Studio"}
        </h2>
        <p style={{ margin: 0, color: "var(--color-muted-ink)", fontSize: "17px", lineHeight: 1.5 }}>
          {isAm
            ? "ሰው-በሂደቱ-ውስጥ (Human-in-the-loop) የትርጉም ጽሑፍ፣ የጊዜ ገደብ እና የድምፅ ማብራሪያ ማረጋገጫ መስመር"
            : "Human-in-the-loop verification pipeline for speech-to-text captions, timing alignment, and audio descriptions."}
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
        aria-label={isAm ? "የድምፅ ማጫወቻ እና የማረጋገጫ ሁኔታ" : "Audio Player & Review Progress"}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={playingSegmentId !== null ? handleStopAudio : () => handlePlaySegment(segments[0])}
            className="btn btn-primary"
            style={{ minWidth: "130px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            aria-label={playingSegmentId !== null ? (isAm ? "ድምፅ አቁም" : "Stop Audio") : (isAm ? "ሙሉ ትምህርት አጫውት" : "Play Lesson Audio")}
          >
            {playingSegmentId !== null ? (
              <><IconSquare size={13} /> <span>{isAm ? "አቁም" : "Stop Audio"}</span></>
            ) : (
              <><IconPlay size={13} /> <span>{isAm ? "ኦዲዮ አጫውት" : "Play Audio"}</span></>
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
              <span>{isAm ? "የተገመገመ" : "Reviewed Status"}</span>
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
              aria-label={isAm ? "የግምገማ እድገት" : "Review completion percentage"}
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
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => {
              setSegments(AMHARIC_SAMPLE);
              setStatusMsg(isAm ? "የአማርኛ ናሙና ተጭኗል።" : "Loaded Amharic lesson sample (5 cues).");
            }}
            className="btn btn-secondary"
            style={{ fontSize: "13px", padding: "0.45rem 0.95rem" }}
          >
            {isAm ? "የአማርኛ ናሙና ጫን" : "Load Amharic Sample"}
          </button>

          <button
            type="button"
            onClick={() => {
              setSegments(ENGLISH_SAMPLE);
              setStatusMsg(isAm ? "የእንግሊዝኛ ናሙና ተጭኗል።" : "Loaded English lesson sample (5 cues).");
            }}
            className="btn btn-secondary"
            style={{ fontSize: "13px", padding: "0.45rem 0.95rem" }}
          >
            {isAm ? "የእንግሊዝኛ ናሙና ጫን" : "Load English Sample"}
          </button>

          {/* VTT File Uploader */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".vtt"
            style={{ display: "none" }}
            onChange={handleFileUpload}
            aria-label={isAm ? "WebVTT ፋይል አስገባ" : "Upload WebVTT file"}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-outline"
            style={{ fontSize: "13px", padding: "0.45rem 0.95rem", display: "inline-flex", alignItems: "center", gap: "0.45rem" }}
          >
            <IconFolder size={15} />
            <span>{isAm ? "WebVTT ፋይል አስገባ (.vtt)" : "Import WebVTT File"}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddCue}
          className="btn btn-outline"
          style={{ fontSize: "13px", padding: "0.45rem 1rem", fontWeight: 600 }}
        >
          + {isAm ? "አዲስ መስመር ጨምር" : "Add New Cue"}
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
                    aria-label={`${isPlayingThis ? "Stop" : "Play"} snippet for cue ${idx + 1} from ${formatTime(seg.start)} to ${formatTime(seg.end)}`}
                  >
                    {isPlayingThis ? (
                      <><IconSquare size={12} /> <span>Stop</span></>
                    ) : (
                      <><IconPlay size={12} /> <span>Play Snippet</span></>
                    )}
                  </button>

                  {/* Timing Inputs with Nudge Controls */}
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "13px" }}>
                    <label htmlFor={`start-time-${seg.id}`} style={{ fontWeight: 600, color: "var(--color-muted-ink)" }}>
                      {isAm ? "መጀመሪያ:" : "Start:"}
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
                      {isAm ? "መጨረሻ:" : "End:"}
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
                      setStatusMsg(isAm ? `ተናጋሪ ወደ ${newSpeaker} ተቀይሯል።` : `Speaker changed to ${newSpeaker}.`);
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
                    <option value="Instructor">{isAm ? "አስተማሪ (Instructor)" : "Instructor"}</option>
                    <option value="Narrator">{isAm ? "ተራኪ (Narrator)" : "Narrator"}</option>
                    <option value="Presenter">{isAm ? "አቅራቢ (Presenter)" : "Presenter"}</option>
                    <option value="Student">{isAm ? "ተማሪ (Student)" : "Student"}</option>
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
                        <span>{isAm ? "የተረጋገጠ" : "Human Reviewed"}</span>
                      </span>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                        <IconCircleDot size={11} />
                        <span>{isAm ? "ረቂቅ ASR" : "Draft ASR"}</span>
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCue(seg.id)}
                    title={isAm ? "መስመር ሰርዝ" : "Delete cue"}
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
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(280px, 1fr) minmax(360px, 1.6fr)",
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
                        {isAm ? "የረቂቅ ASR ውጤት (የድምፅ ሞዴል)" : "Draft ASR Output (AI Generated)"}
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
                        <span>{isAm ? "ወደ አርታዒ ቅዳ" : "Copy to Editor"}</span>
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
                    {isAm ? "ያልተረጋገጠ አውቶማቲክ ረቂቅ" : "Unverified automated speech draft"}
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
                      {isAm ? "የተገመገመ እና የተስተካከለ ጽሑፍ (Human Reviewed Text)" : "Human Reviewed Text (Publication Ready)"}
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
                        onClick={() => handleInsertTag(seg.id, isAm ? "[የስላይድ ማብራሪያ]" : "[visual description]")}
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
                        {isAm ? "አጽዳ" : "Clean"}
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
                        ↺ {isAm ? "መልስ" : "Revert"}
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
                    placeholder={isAm ? "የተገመገመውን ጽሑፍ እዚህ በዝርዝር አንቀጽ ያስገቡ..." : "Enter the reviewed and verified caption text here as a paragraph..."}
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
                      {wordCount} {isAm ? "ቃላት" : "words"} · {charCount} {isAm ? "ፊደላት" : "characters"}
                    </span>
                    <span>
                      {charCount > 120 ? (
                        <span style={{ color: "#FF9500" }}>
                          ℹ {isAm ? "ረጅም መስመር (በስክሪን ላይ ሊከፈል ይችላል)" : "Long cue (will wrap on screen)"}
                        </span>
                      ) : (
                        <span style={{ color: "#34C759", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                          <IconCheck size={12} />
                          <span>{isAm ? "ምርጥ ርዝመት" : "Optimal length"}</span>
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
          {isAm ? "የተገመገሙ ፋይሎችን ማውጣት እና ማተም" : "Export & Publish Verified Captions"}
        </h3>
        <p style={{ margin: "0 0 1.5rem 0", color: "var(--color-muted-ink)", fontSize: "14px", lineHeight: 1.55 }}>
          {isAm
            ? "የሰው ማረጋገጫ የተጠናቀቀባቸውን የትርጉም ጽሑፎች ወደ ተለያዩ የተደራሽነት ቅርጸቶች ያውርዱ ወይም በቀጥታ ወደ Level 2 API በማስተላለፍ ትምህርቱን ያዘምኑ።"
            : "Download human-verified captions across standard accessibility formats (WebVTT, JSON, Braille) or publish directly to the Level 2 API to update the live lesson."}
        </p>

        <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            onClick={handleExportVTT}
            className="btn btn-primary"
            style={{ padding: "0.6rem 1.25rem", fontSize: "14px" }}
          >
            {isAm ? "የተረጋገጠ WebVTT አውርድ (.vtt)" : "Export Reviewed WebVTT (.vtt)"}
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="btn btn-outline"
            style={{ padding: "0.6rem 1.25rem", fontSize: "14px" }}
          >
            {isAm ? "የጽሑፍ ግልባጭ JSON አውርድ (.json)" : "Export Transcript JSON (.json)"}
          </button>

          <button
            type="button"
            onClick={handleExportBRF}
            className="btn btn-secondary"
            style={{ padding: "0.6rem 1.25rem", fontSize: "14px" }}
          >
            {isAm ? "የብሬይል ፋይል አውርድ (.brf)" : "Export Braille (.brf)"}
          </button>

          <button
            type="button"
            onClick={handleExportBraillePDF}
            className="btn btn-secondary"
            style={{ padding: "0.6rem 1.25rem", fontSize: "14px" }}
          >
            {isAm ? "የብሬይል ፒዲኤፍ አውርድ (.pdf)" : "Export Braille PDF (.pdf)"}
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
            <span>{isPublishing ? (isAm ? "እየታተመ..." : "Publishing...") : (isAm ? "ወደ Level 2 API ላክ" : "Publish to Lesson (API)")}</span>
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
                {isAm ? "በቀጥታ ማጫወቻው ተመልከት →" : "View in Lesson Player →"}
              </a>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
