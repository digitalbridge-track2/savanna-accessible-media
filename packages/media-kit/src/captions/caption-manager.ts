import { CaptionSize, CaptionTheme } from "../preferences/storage.js";

export interface VTTCueItem {
  start: number; // in seconds
  end: number;   // in seconds
  text: string;
}

export function parseVTT(vttText: string): VTTCueItem[] {
  const cues: VTTCueItem[] = [];
  const lines = vttText.split(/\r?\n/);
  let i = 0;

  // Skip WEBVTT header
  while (i < lines.length && !lines[i].includes("-->")) {
    i++;
  }

  while (i < lines.length) {
    const timeLine = lines[i].trim();
    if (timeLine.includes("-->")) {
      const parts = timeLine.split("-->").map((s) => s.trim().split(" ")[0]);
      if (parts.length >= 2) {
        const start = parseTimestamp(parts[0]);
        const end = parseTimestamp(parts[1]);
        i++;
        const textLines: string[] = [];
        while (i < lines.length && lines[i].trim() !== "") {
          textLines.push(lines[i].trim());
          i++;
        }
        if (textLines.length > 0) {
          cues.push({
            start,
            end,
            text: textLines.join("\n"),
          });
        }
      }
    }
    i++;
  }

  return cues;
}

function parseTimestamp(timeStr: string): number {
  const parts = timeStr.split(":");
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (parts.length === 3) {
    hours = parseFloat(parts[0]);
    minutes = parseFloat(parts[1]);
    seconds = parseFloat(parts[2].replace(",", "."));
  } else if (parts.length === 2) {
    minutes = parseFloat(parts[0]);
    seconds = parseFloat(parts[1].replace(",", "."));
  }

  return hours * 3600 + minutes * 60 + seconds;
}

export function getThemeStyles(theme: CaptionTheme, size: CaptionSize): string {
  let fontPixels = "18px";
  if (size === "small") fontPixels = "14px";
  if (size === "large") fontPixels = "24px";
  if (size === "xlarge") fontPixels = "32px";

  let color = "#FFFFFF";
  let background = "rgba(0, 0, 0, 0.85)";
  let border = "none";

  if (theme === "yellow-black") {
    color = "#FFEB3B";
    background = "#000000";
    border = "2px solid #FFEB3B";
  } else if (theme === "white-black") {
    color = "#FFFFFF";
    background = "#000000";
    border = "2px solid #FFFFFF";
  } else if (theme === "black-yellow") {
    color = "#000000";
    background = "#FFEB3B";
    border = "2px solid #000000";
  }

  return `
    font-size: ${fontPixels};
    color: ${color};
    background: ${background};
    border: ${border};
    line-height: 1.4;
    padding: 0.35rem 0.75rem;
    border-radius: 4px;
    max-width: 90%;
    margin: 0 auto;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    white-space: pre-line;
  `;
}
