import React, { useState } from "react";

interface StudioSegment {
  id: number;
  start: number;
  end: number;
  speaker: string;
  draftText: string;
  reviewedText: string;
  status: "draft" | "reviewed";
}

const INITIAL_SEGMENTS: StudioSegment[] = [
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
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function formatVTTTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `00:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}.${ms < 10 ? "00" : ms < 100 ? "0" : ""}${ms}`;
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

export const StudioView: React.FC<{ locale: "en" | "am" }> = ({ locale }) => {
  const [segments, setSegments] = useState<StudioSegment[]>(INITIAL_SEGMENTS);
  const [statusMsg, setStatusMsg] = useState("");
  const isAm = locale === "am";

  const handleTextChange = (id: number, newText: string) => {
    setSegments((prev) =>
      prev.map((seg) => (seg.id === id ? { ...seg, reviewedText: newText } : seg))
    );
  };

  const handleToggleStatus = (id: number) => {
    setSegments((prev) =>
      prev.map((seg) =>
        seg.id === id ? { ...seg, status: seg.status === "draft" ? "reviewed" : "draft" } : seg
      )
    );
  };

  const handleExportVTT = () => {
    let vtt = "WEBVTT - Human Reviewed Captions\n\n";
    for (const seg of segments) {
      const text = seg.reviewedText || seg.draftText;
      vtt += `${formatVTTTime(seg.start)} --> ${formatVTTTime(seg.end)}\n${text}\n\n`;
    }
    downloadFile(vtt, "captions.reviewed.vtt", "text/vtt;charset=utf-8");
    setStatusMsg(isAm ? "WebVTT ፋይል በተሳካ ሁኔታ ወርዷል።" : "Exported captions.reviewed.vtt successfully.");
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify({ segments }, null, 2);
    downloadFile(jsonStr, "transcript.reviewed.json", "application/json");
    setStatusMsg(isAm ? "የጽሑፍ ግልባጭ JSON በተሳካ ሁኔታ ወርዷል።" : "Exported transcript.reviewed.json successfully.");
  };

  const handleExportBRF = () => {
    let brfText = "DIGITAL WORKPLACE SKILLS - BRAILLE TRANSCRIPT (GRADE 1)\n\n";
    for (const seg of segments) {
      const clean = (seg.reviewedText || seg.draftText)
        .toUpperCase()
        .replace(/[^A-Z0-9 .,!?]/g, "");
      brfText += `${clean}\n`;
    }
    downloadFile(brfText, "lesson-transcript.brf", "text/plain");
    setStatusMsg(isAm ? "የብሬይል ፋይል (.brf) በተሳካ ሁኔታ ወርዷል።" : "Exported lesson-transcript.brf successfully.");
  };

  return (
    <div>
      <h2 style={{ fontSize: "34px", color: "var(--color-ink)", marginBottom: "0.5rem", letterSpacing: "-0.011em" }}>
        {isAm ? "የትርጉም ስቱዲዮ (Transcript Studio)" : "Transcript Studio"}
      </h2>
      <p style={{ margin: "0 0 1.75rem 0", color: "var(--color-muted-ink)", fontSize: "17px" }}>
        {isAm
          ? "ሰው-በሂደቱ-ውስጥ (Human-in-the-loop) የትርጉም ጽሑፍ እና የድምፅ ማብራሪያ ማረጋገጫ መስመር"
          : "Human-in-the-loop review pipeline for captions, subtitles, and audio description."}
      </p>

      <section className="card" style={{ marginBottom: "2.5rem" }}>
        <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--color-ink)", fontSize: "21px", letterSpacing: "-0.005em" }}>
          {isAm ? "የማረጋገጥ እና የማረም ሂደት" : "Review & Edit Pipeline"}
        </h3>
        <p style={{ margin: "0 0 1.5rem 0", color: "var(--color-muted-ink)", fontSize: "14px", lineHeight: 1.55 }}>
          {isAm
            ? "በሰው ተቆጣጣሪ እስኪረጋገጥ ድረስ አውቶማቲክ የድምፅ ትርጉሞች (ASR) 'ረቂቅ' (Draft) ተብለው ይቆያሉ። እርማቶችን በቀጥታ በሰንጠረዡ ውስጥ ያድርጉ፣ ከዚያም የተረጋገጠውን ፋይል ያውርዱ።"
            : "AI and automated ASR outputs remain flagged as Draft until verified by a human reviewer. Edit corrections directly in the table below, then export your verified WebVTT, JSON, or Braille files."}
        </p>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px", fontSize: "14px" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "var(--color-ink)" }}>{isAm ? "የጊዜ ገደብ" : "Time Range"}</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "var(--color-ink)" }}>{isAm ? "ተናጋሪ" : "Speaker"}</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "var(--color-ink)" }}>{isAm ? "የረቂቅ ASR ውጤት" : "Draft ASR Output"}</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "var(--color-ink)" }}>{isAm ? "የተረጋገጠ ጽሑፍ" : "Human Reviewed Text"}</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "var(--color-ink)" }}>{isAm ? "ሁኔታ" : "Status"}</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((seg) => (
                <tr key={seg.id} style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                  <td style={{ padding: "0.85rem 1rem", whiteSpace: "nowrap" }}>
                    <code>{formatTime(seg.start)} - {formatTime(seg.end)}</code>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", fontWeight: 500, color: "var(--color-ink)" }}>{seg.speaker}</td>
                  <td style={{ padding: "0.85rem 1rem", color: "var(--color-muted-ink)" }}>{seg.draftText}</td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <input
                      type="text"
                      value={seg.reviewedText}
                      onChange={(e) => handleTextChange(seg.id, e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.5rem 0.85rem",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "14px",
                        outline: "none",
                        background: "#FFFFFF",
                        color: "var(--color-ink)",
                      }}
                      aria-label={`${isAm ? "የተስተካከለ ጽሑፍ ለ" : "Reviewed text for segment"} ${seg.id}`}
                    />
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(seg.id)}
                      className={`badge ${seg.status === "reviewed" ? "badge-success" : "badge-neutral"}`}
                      style={{ border: "none", cursor: "pointer", padding: "0.35rem 0.85rem", fontSize: "12px", borderRadius: "var(--radius-pill)" }}
                      aria-label={`${isAm ? "ሁኔታን ቀይር" : "Toggle status for segment"} ${seg.id}`}
                    >
                      {seg.status === "reviewed" ? (isAm ? "✓ የተረጋገጠ" : "✓ Reviewed") : (isAm ? "● ረቂቅ" : "● Draft")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Export Buttons */}
        <div style={{ marginTop: "2rem", display: "flex", gap: "0.85rem", flexWrap: "wrap", alignItems: "center" }}>
          <button type="button" onClick={handleExportVTT} className="btn btn-primary">
            {isAm ? "የተረጋገጠ WebVTT አውርድ (.vtt)" : "Export Reviewed WebVTT (.vtt)"}
          </button>
          <button type="button" onClick={handleExportJSON} className="btn btn-outline">
            {isAm ? "የጽሑፍ ግልባጭ JSON አውርድ (.json)" : "Export Transcript JSON (.json)"}
          </button>
          <button type="button" onClick={handleExportBRF} className="btn btn-secondary">
            {isAm ? "የብሬይል ፋይል አውርድ (.brf)" : "Export Braille (.brf)"}
          </button>
        </div>

        {statusMsg && (
          <div
            style={{
              marginTop: "1.25rem",
              padding: "0.6rem 1rem",
              background: "#E8F8F0",
              color: "#128045",
              borderRadius: "var(--radius-pill)",
              fontWeight: 500,
              fontSize: "13px",
              display: "inline-block",
            }}
            aria-live="polite"
          >
            ✓ {statusMsg}
          </div>
        )}
      </section>
    </div>
  );
};
