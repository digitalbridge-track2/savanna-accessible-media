/**
 * Braille Formatter for Abugida Media Kit
 * Standard: BANA (Braille Authority of North America) / ICEB Specification:
 * - 40 cells per line max
 * - 25 lines per page max
 * - Page breaks separated by Form Feed (\x0c)
 * - ASCII Braille mapping for hardware embossers (Index, Romeo, Juliet)
 * - Unicode Braille patterns (U+2800..U+28FF) for refreshable display preview
 */

export const UNICODE_BRAILLE_MAP: Record<string, string> = {
  a: "⠁", b: "⠃", c: "⠉", d: "⠙", e: "⠑", f: "⠋", g: "⠛", h: "⠓", i: "⠊", j: "⠚",
  k: "⠅", l: "⠇", m: "⠍", n: "⠝", o: "⠕", p: "⠏", q: "⠟", r: "⠗", s: "⠎", t: "⠞",
  u: "⠥", v: "⠧", w: "⠺", x: "⠭", y: "⠽", z: "⠵",
  " ": " ", ".": "⠲", ",": "⠂", ";": "⠆", ":": "⠒", "!": "⠖", "?": "⠦",
  "-": "⠤", "(": "⠶", ")": "⠶", "\"": "⠦", "'": "⠄", "/": "⠌"
};

// Amharic Fidel Braille Transliteration Base (Ethiopian Braille Grade 1)
export const ETHIOPIC_BRAILLE_MAP: Record<string, string> = {
  // ሀ (h)
  "ሀ": "⠓⠁", "ሁ": "⠓⠥", "ሂ": "⠓⠊", "ሃ": "⠓⠜", "ሄ": "⠓⠑", "ህ": "⠓", "ሆ": "⠓⠕",
  // ለ (l)
  "ለ": "⠇⠁", "ሉ": "⠇⠥", "ሊ": "⠇⠊", "ላ": "⠇⠜", "ሌ": "⠇⠑", "ል": "⠇", "ሎ": "⠇⠕",
  // ሐ (h)
  "ሐ": "⠓⠁", "ሑ": "⠓⠥", "ሒ": "⠓⠊", "ሓ": "⠓⠜", "ሔ": "⠓⠑", "ሕ": "⠓", "ሖ": "⠓⠕",
  // መ (m)
  "መ": "⠍⠁", "ሙ": "⠍⠥", "ሚ": "⠍⠊", "ማ": "⠍⠜", "ሜ": "⠍⠑", "ም": "⠍", "ሞ": "⠍⠕",
  // ሠ (s)
  "ሠ": "⠎⠁", "ሡ": "⠎⠥", "ሢ": "⠎⠊", "ሣ": "⠎⠜", "ሤ": "⠎⠑", "ሥ": "⠎", "ሦ": "⠎⠕",
  // ረ (r)
  "ረ": "⠗⠁", "ሩ": "⠗⠥", "ሪ": "⠗⠊", "ራ": "⠗⠜", "ሬ": "⠗⠑", "ር": "⠗", "ሮ": "⠗⠕",
  // ሰ (s)
  "ሰ": "⠎⠁", "ሱ": "⠎⠥", "ሲ": "⠎⠊", "ሳ": "⠎⠜", "ሴ": "⠎⠑", "ስ": "⠎", "ሶ": "⠎⠕",
  // ሸ (sh)
  "ሸ": "⠩⠁", "ሹ": "⠩⠥", "ሺ": "⠩⠊", "ሻ": "⠩⠜", "ሼ": "⠩⠑", "ሽ": "⠩", "ሾ": "⠩⠕",
  // ቀ (q)
  "ቀ": "⠟⠁", "ቁ": "⠟⠥", "ቂ": "⠟⠊", "ቃ": "⠟⠜", "ቄ": "⠟⠑", "ቅ": "⠟", "ቆ": "⠟⠕",
  // በ (b)
  "በ": "⠃⠁", "ቡ": "⠃⠥", "ቢ": "⠃⠊", "ባ": "⠃⠜", "ቤ": "⠃⠑", "ብ": "⠃", "ቦ": "⠃⠕",
  // ቨ (v)
  "ቨ": "⠧⠁", "ቩ": "⠧⠥", "ቪ": "⠧⠊", "ቫ": "⠧⠜", "ቬ": "⠧⠑", "ቭ": "⠧", "ቮ": "⠧⠕",
  // ተ (t)
  "ተ": "⠞⠁", "ቱ": "⠞⠥", "ቲ": "⠞⠊", "ታ": "⠞⠜", "ቴ": "⠞⠑", "ት": "⠞", "ቶ": "⠞⠕",
  // ቸ (ch)
  "ቸ": "⠡⠁", "ቹ": "⠡⠥", "ቺ": "⠡⠊", "ቻ": "⠡⠜", "ቼ": "⠡⠑", "ች": "⠡", "ቾ": "⠡⠕",
  // ኀ (h)
  "ኀ": "⠭⠁", "ኁ": "⠭⠥", "ኂ": "⠭⠊", "ኃ": "⠭⠜", "ኄ": "⠭⠑", "ኅ": "⠭", "ኆ": "⠭⠕",
  // ነ (n)
  "ነ": "⠝⠁", "ኑ": "⠝⠥", "ኒ": "⠝⠊", "ና": "⠝⠜", "ኔ": "⠝⠑", "ን": "⠝", "ኖ": "⠝⠕",
  // ኘ (ny)
  "ኘ": "⠻⠁", "ኙ": "⠻⠥", "ኚ": "⠻⠊", "ኛ": "⠻⠜", "ኜ": "⠻⠑", "ኝ": "⠻", "ኞ": "⠻⠕",
  // አ (a)
  "አ": "⠁", "ኡ": "⠥", "ኢ": "⠊", "ኣ": "⠜", "ኤ": "⠑", "እ": "⠢", "ኦ": "⠕",
  // ከ (k)
  "ከ": "⠅⠁", "ኩ": "⠅⠥", "ኪ": "⠅⠊", "ካ": "⠅⠜", "ኬ": "⠅⠑", "ክ": "⠅", "ኮ": "⠅⠕",
  // ኸ (kh)
  "ኸ": "⠭⠁", "ኹ": "⠭⠥", "ኺ": "⠭⠊", "ኻ": "⠭⠜", "ኼ": "⠭⠑", "ኽ": "⠭", "ኾ": "⠭⠕",
  // ወ (w)
  "ወ": "⠺⠁", "ዉ": "⠺⠥", "ዊ": "⠺⠊", "ዋ": "⠺⠜", "ዌ": "⠺⠑", "ው": "⠺", "ዎ": "⠺⠕",
  // ዐ (a)
  "ዐ": "⠷⠁", "ዑ": "⠷⠥", "ዒ": "⠷⠊", "ዓ": "⠷⠜", "ዔ": "⠷⠑", "ዕ": "⠷", "ዖ": "⠷⠕",
  // ዘ (z)
  "ዘ": "⠵⠁", "ዙ": "⠵⠥", "ዚ": "⠵⠊", "ዛ": "⠵⠜", "ዜ": "⠵⠑", "ዝ": "⠵", "ዞ": "⠵⠕",
  // ዠ (zh)
  "ዠ": "⠮⠁", "ዡ": "⠮⠥", "ዢ": "⠮⠊", "ዣ": "⠮⠜", "ዤ": "⠮⠑", "ዥ": "⠮", "ዦ": "⠮⠕",
  // የ (y)
  "የ": "⠽⠁", "ዩ": "⠽⠥", "ዪ": "⠽⠊", "ያ": "⠽⠜", "ዬ": "⠽⠑", "ይ": "⠽", "ዮ": "⠽⠕",
  // ደ (d)
  "ደ": "⠙⠁", "ዱ": "⠙⠥", "ዲ": "⠙⠊", "ዳ": "⠙⠜", "ዴ": "⠙⠑", "ድ": "⠙", "ዶ": "⠙⠕",
  // ጀ (j)
  "ጀ": "⠚⠁", "ጁ": "⠚⠥", "ጂ": "⠚⠊", "ጃ": "⠚⠜", "ጄ": "⠚⠑", "ጅ": "⠚", "ጆ": "⠚⠕",
  // ገ (g)
  "ገ": "⠛⠁", "ጉ": "⠛⠥", "ጊ": "⠛⠊", "ጋ": "⠛⠜", "ጌ": "⠛⠑", "ግ": "⠛", "ጎ": "⠛⠕",
  // ጠ (t')
  "ጠ": "⠾⠁", "ጡ": "⠾⠥", "ጢ": "⠾⠊", "ጣ": "⠾⠜", "ጤ": "⠾⠑", "ጥ": "⠾", "ጦ": "⠾⠕",
  // ጨ (ch')
  "ጨ": "⠹⠁", "ጩ": "⠹⠥", "ጪ": "⠹⠊", "ጫ": "⠹⠜", "ጬ": "⠹⠑", "ጭ": "⠹", "ጮ": "⠹⠕",
  // ጰ (p')
  "ጰ": "⠯⠁", "ጱ": "⠯⠥", "ጲ": "⠯⠊", "ጳ": "⠯⠜", "ጴ": "⠯⠑", "ጵ": "⠯", "ጶ": "⠯⠕",
  // ጸ (ts')
  "ጸ": "⠪⠁", "ጹ": "⠪⠥", "ጺ": "⠪⠊", "ጻ": "⠪⠜", "ጼ": "⠪⠑", "ጽ": "⠪", "ጾ": "⠪⠕",
  // ፀ (ts')
  "ፀ": "⠪⠁", "ፁ": "⠪⠥", "ፂ": "⠪⠊", "ፃ": "⠪⠜", "ፄ": "⠪⠑", "ፅ": "⠪", "ፆ": "⠪⠕",
  // ፈ (f)
  "ፈ": "⠋⠁", "ፉ": "⠋⠥", "ፊ": "⠋⠊", "ፋ": "⠋⠜", "ፌ": "⠋⠑", "ፍ": "⠋", "ፎ": "⠋⠕",
  // ፐ (p)
  "ፐ": "⠏⠁", "ፑ": "⠏⠥", "ፒ": "⠏⠊", "ፓ": "⠏⠜", "ፔ": "⠏⠑", "ፕ": "⠏", "ፖ": "⠏⠕",
  // Labialized
  "ሏ": "⠇⠺⠜", "ሟ": "⠍⠺⠜", "ሯ": "⠗⠺⠜", "ሷ": "⠎⠺⠜", "ሿ": "⠩⠺⠜", "ቋ": "⠟⠺⠜",
  "ቧ": "⠃⠺⠜", "ቷ": "⠞⠺⠜", "ቿ": "⠡⠺⠜", "ኗ": "⠝⠺⠜", "ኟ": "⠻⠺⠜", "ኳ": "⠅⠺⠜",
  "ዟ": "⠵⠺⠜", "ዧ": "⠮⠺⠜", "ዷ": "⠙⠺⠜", "ጇ": "⠚⠺⠜", "ጧ": "⠾⠺⠜", "ጯ": "⠹⠺⠜",
  "ጷ": "⠯⠺⠜", "ጿ": "⠪⠺⠜", "ፏ": "⠋⠺⠜",
  // Numerals & Punctuation
  "፡": " ", "።": "⠲", "፣": "⠂", "፤": "⠆", "፥": "⠒", "፦": "⠒⠤", "፧": "⠦", "፨": "⠶",
  "፩": "⠼⠁", "፪": "⠼⠃", "፫": "⠼⠉", "፬": "⠼⠙", "፭": "⠼⠑",
  "፮": "⠼⠋", "፯": "⠼⠛", "፰": "⠼⠓", "፱": "⠼⠊", "፲": "⠼⠚"
};

export function toUnicodeBraille(text: string): string {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ETHIOPIC_BRAILLE_MAP[ch]) {
      out += ETHIOPIC_BRAILLE_MAP[ch];
      continue;
    }
    const lower = ch.toLowerCase();
    if (ch >= "A" && ch <= "Z") {
      out += "⠠" + (UNICODE_BRAILLE_MAP[lower] || lower);
    } else if (ch >= "0" && ch <= "9") {
      if (i === 0 || !/[0-9]/.test(text[i - 1])) out += "⠼";
      const digitMap: Record<string, string> = {
        "1": "⠁", "2": "⠃", "3": "⠉", "4": "⠙", "5": "⠑",
        "6": "⠋", "7": "⠛", "8": "⠓", "9": "⠊", "0": "⠚"
      };
      out += digitMap[ch] || ch;
    } else {
      out += UNICODE_BRAILLE_MAP[lower] || ch;
    }
  }
  return out;
}

// Standard 64-character North American Braille ASCII table for 6-dot cells (offset 0..63 from U+2800)
export const BRAILLE_ASCII_TABLE = " A1B'K2L@CIF/MSP\"E3H9O6R^DJG>NTQ,*5<-U8V.%[$+X!&:;4\\0Z7(_?W]#Y=)";

export function toAsciiBraille(text: string): string {
  const brailleCells = /[\u2800-\u28FF]/.test(text) ? text : toUnicodeBraille(text);
  let res = "";
  for (let i = 0; i < brailleCells.length; i++) {
    const code = brailleCells.charCodeAt(i);
    if (code >= 0x2800 && code <= 0x283F) {
      res += BRAILLE_ASCII_TABLE[code - 0x2800] || " ";
    } else if (code === 0x20 || brailleCells[i] === " ") {
      res += " ";
    } else if (brailleCells[i] === "\n" || brailleCells[i] === "\r") {
      res += brailleCells[i];
    } else {
      res += brailleCells[i];
    }
  }
  return res;
}

/**
 * Wraps text into lines with a maximum cell width (default 40 cells for BANA embosser standard)
 */
export function wrapBrailleLines(text: string, maxCells = 40): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (!word) continue;
    if ((currentLine + (currentLine ? " " : "") + word).length <= maxCells) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      if (currentLine) lines.push(currentLine);
      if (word.length > maxCells) {
        // Chunk oversize word
        let remainder = word;
        while (remainder.length > maxCells) {
          lines.push(remainder.slice(0, maxCells));
          remainder = remainder.slice(maxCells);
        }
        currentLine = remainder;
      } else {
        currentLine = word;
      }
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export interface BRFSegment {
  start: number;
  end: number;
  speaker?: string;
  text: string;
}

export interface BRFOptions {
  title: string;
  lessonId?: string;
  language: "en" | "am";
  date?: string;
  segments: BRFSegment[];
}

/**
 * Generates an official BANA/ICEB formatted .brf (Braille Ready Format) document:
 * - 40 columns x 25 lines
 * - Page numbers in top-right
 * - Form Feed (\x0c) page boundaries
 */
export function generateBRFDocument(opts: BRFOptions): string {
  const isAm = opts.language === "am";
  const lines: string[] = [];
  const maxLinesPerPage = 25;
  const maxCells = 40;

  // Title header block (Page 1)
  const sep = "=".repeat(maxCells);
  lines.push(sep);
  lines.push(...wrapBrailleLines(opts.title.toUpperCase(), maxCells));
  lines.push(`STANDARD: BANA 40X25 GRADE-1 EMBOSSER`);
  lines.push(`LANGUAGE: ${isAm ? "AMHARIC" : "ENGLISH"}`);
  lines.push(`DATE: ${opts.date || "2026-11-14 (HIDAR 5, 2019 E.C.)"}`);
  lines.push(sep);
  lines.push("");

  // Process segments
  for (let idx = 0; idx < opts.segments.length; idx++) {
    const seg = opts.segments[idx];
    const cueNum = idx + 1;
    const startM = Math.floor(seg.start / 60).toString().padStart(2, "0");
    const startS = Math.floor(seg.start % 60).toString().padStart(2, "0");
    const endM = Math.floor(seg.end / 60).toString().padStart(2, "0");
    const endS = Math.floor(seg.end % 60).toString().padStart(2, "0");
    const speaker = seg.speaker || (isAm ? "አስተማሪ" : "Instructor");

    lines.push(`[#${cueNum} ${startM}:${startS}-${endM}:${endS} ${speaker}]`);
    
    // Genuine Unicode Braille Patterns for refreshable braille displays & visual inspection
    const unicodeBraille = toUnicodeBraille(seg.text);
    lines.push(...wrapBrailleLines(unicodeBraille, maxCells));

    // Interlined print line for sighted educators & transcribers
    lines.push(...wrapBrailleLines(`TEXT: ${seg.text}`, maxCells));

    // Hardware embosser line (BANA 40x25 ASCII Braille)
    const asciiBraille = toAsciiBraille(unicodeBraille);
    lines.push(...wrapBrailleLines(`EMBOSSER: ${asciiBraille}`, maxCells));
    lines.push("");
  }

  // Paginate with 25 lines per page and Form Feed (\x0c)
  const pages: string[] = [];
  let currentPageLines: string[] = [];
  let pageNum = 1;

  for (let i = 0; i < lines.length; i++) {
    currentPageLines.push(lines[i]);
    if (currentPageLines.length === maxLinesPerPage - 1 || i === lines.length - 1) {
      // Top or bottom page number
      const numStr = `P.${pageNum}`;
      const paddedNum = numStr.padStart(maxCells, " ");
      currentPageLines.push(paddedNum);

      pages.push(currentPageLines.join("\r\n"));
      currentPageLines = [];
      pageNum++;
    }
  }

  // Join pages with standard Form Feed (\x0c)
  return pages.join("\r\n\x0c\r\n");
}
