interface StudioSegment {
  id: number;
  start: number;
  end: number;
  speaker: string;
  draftText: string;
  reviewedText: string;
  status: "draft" | "reviewed";
}

let studioSegments: StudioSegment[] = [
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

document.addEventListener("DOMContentLoaded", () => {
  renderTable();

  // Export WebVTT
  document.getElementById("btn-export-vtt")?.addEventListener("click", () => {
    let vtt = "WEBVTT - Human Reviewed Captions\n\n";
    for (const seg of studioSegments) {
      const text = seg.reviewedText || seg.draftText;
      vtt += `${formatVTTTime(seg.start)} --> ${formatVTTTime(seg.end)}\n${text}\n\n`;
    }
    downloadFile(vtt, "captions.reviewed.vtt", "text/vtt;charset=utf-8");
  });

  // Export JSON
  document.getElementById("btn-export-json")?.addEventListener("click", () => {
    const jsonStr = JSON.stringify({ segments: studioSegments }, null, 2);
    downloadFile(jsonStr, "transcript.reviewed.json", "application/json");
  });

  // Export Braille (.brf)
  document.getElementById("btn-export-brf")?.addEventListener("click", () => {
    let brfText = "DIGITAL WORKPLACE SKILLS - BRAILLE TRANSCRIPT (GRADE 1)\n\n";
    for (const seg of studioSegments) {
      const clean = (seg.reviewedText || seg.draftText)
        .toUpperCase()
        .replace(/[^A-Z0-9 .,!?]/g, "");
      brfText += `${clean}\n`;
    }
    downloadFile(brfText, "lesson-transcript.brf", "text/plain");
  });
});

function renderTable() {
  const tbody = document.getElementById("segments-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  for (const seg of studioSegments) {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid var(--color-border)";

    tr.innerHTML = `
      <td style="padding: 0.75rem;"><code>${formatTime(seg.start)} - ${formatTime(seg.end)}</code></td>
      <td style="padding: 0.75rem;">${seg.speaker}</td>
      <td style="padding: 0.75rem; color: #555;">${seg.draftText}</td>
      <td style="padding: 0.75rem;">
        <input 
          type="text" 
          id="input-seg-${seg.id}" 
          value="${seg.reviewedText}" 
          style="width: 100%; padding: 0.4rem; border: 1px solid var(--color-border); border-radius: 4px;" 
          aria-label="Reviewed text for segment ${seg.id}">
      </td>
      <td style="padding: 0.75rem;">
        <button 
          type="button" 
          id="btn-status-${seg.id}" 
          style="background: ${seg.status === "reviewed" ? "#E8F5E9" : "#FFF8E1"}; color: ${seg.status === "reviewed" ? "#1B5E20" : "#F57F17"}; border: 1px solid ${seg.status === "reviewed" ? "#A5D6A7" : "#FFE082"}; padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.85rem; cursor: pointer;">
          ${seg.status === "reviewed" ? "✓ Reviewed" : "✎ Draft"}
        </button>
      </td>
    `;

    tbody.appendChild(tr);

    // Bind inputs
    const input = tr.querySelector(`#input-seg-${seg.id}`) as HTMLInputElement;
    input?.addEventListener("input", () => {
      seg.reviewedText = input.value;
    });

    const statusBtn = tr.querySelector(`#btn-status-${seg.id}`) as HTMLButtonElement;
    statusBtn?.addEventListener("click", () => {
      seg.status = seg.status === "reviewed" ? "draft" : "reviewed";
      renderTable();
    });
  }
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatVTTTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = (sec % 60).toFixed(3);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.padStart(6, "0")}`;
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
