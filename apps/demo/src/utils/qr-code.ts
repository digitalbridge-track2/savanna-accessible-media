/**
 * Self-contained, zero-dependency QR Code generator for Abugida Media Kit & Savanna LMS.
 * Generates valid, standards-compliant QR Code matrix and SVG for mobile camera scanning.
 * Standard: ISO/IEC 18004 Byte-Mode QR Code.
 */

// GF(256) Galois Field Tables with primitive polynomial 0x11D
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
let x = 1;
for (let i = 0; i < 255; i++) {
  EXP[i] = x;
  EXP[i + 255] = x;
  LOG[x] = i;
  x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
}

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
}

function getRsGeneratorPoly(ecCount: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < ecCount; i++) {
    const factor = new Uint8Array([1, EXP[i]]);
    const next = new Uint8Array(poly.length + 1);
    for (let j = 0; j < poly.length; j++) {
      for (let k = 0; k < factor.length; k++) {
        next[j + k] ^= gfMul(poly[j], factor[k]);
      }
    }
    poly = next;
  }
  return poly;
}

function calculateReedSolomon(data: Uint8Array, ecCount: number): Uint8Array {
  const gen = getRsGeneratorPoly(ecCount);
  const remainder = new Uint8Array(ecCount);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ remainder[0];
    remainder.copyWithin(0, 1);
    remainder[ecCount - 1] = 0;
    for (let j = 0; j < ecCount; j++) {
      remainder[j] ^= gfMul(gen[j + 1], factor);
    }
  }
  return remainder;
}

// QR Table: Version -> [size, totalCodewords, dataCodewords, ecCount, alignPos]
// Using Level L for high data density with reliable mobile camera scan
interface QRVersionSpec {
  version: number;
  size: number;
  totalCodewords: number;
  dataCodewords: number;
  ecCount: number;
  alignments: number[];
}

const QR_SPECS: QRVersionSpec[] = [
  { version: 1, size: 21, totalCodewords: 26, dataCodewords: 19, ecCount: 7, alignments: [] },
  { version: 2, size: 25, totalCodewords: 44, dataCodewords: 34, ecCount: 10, alignments: [6, 18] },
  { version: 3, size: 29, totalCodewords: 70, dataCodewords: 55, ecCount: 15, alignments: [6, 22] },
  { version: 4, size: 33, totalCodewords: 100, dataCodewords: 80, ecCount: 20, alignments: [6, 26] },
  { version: 5, size: 37, totalCodewords: 134, dataCodewords: 108, ecCount: 26, alignments: [6, 30] },
  { version: 6, size: 41, totalCodewords: 172, dataCodewords: 136, ecCount: 36, alignments: [6, 34] },
];

/**
 * Encodes text into a standard QR matrix (true = dark module, false = light module)
 */
export function generateQRMatrix(text: string): boolean[][] {
  const utf8 = new TextEncoder().encode(text);
  const dataLen = utf8.length;

  // Find smallest version that fits data (Byte mode overhead: 4 mode bits + 8 len bits = 1.5 bytes)
  const requiredDataBytes = dataLen + 3;
  const spec = QR_SPECS.find((s) => s.dataCodewords >= requiredDataBytes) || QR_SPECS[QR_SPECS.length - 1];

  // 1. Bitstream packing (Byte mode 0100 + Length + Data)
  const bits: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  };

  // Mode: 0100 (Byte mode)
  pushBits(4, 4);
  // Length (8 bits for V1-9)
  pushBits(dataLen, 8);
  // Characters
  for (let i = 0; i < dataLen; i++) {
    pushBits(utf8[i], 8);
  }

  // Terminator (up to 4 zeroes)
  const maxBits = spec.dataCodewords * 8;
  const termLen = Math.min(4, maxBits - bits.length);
  pushBits(0, termLen);

  // Pad to byte boundary
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  // Convert to bytes
  const dataBytes = new Uint8Array(spec.dataCodewords);
  for (let i = 0; i < bits.length / 8; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | bits[i * 8 + j];
    }
    dataBytes[i] = b;
  }

  // Pad with 0xEC and 0x11
  const pad = [0xec, 0x11];
  let padIdx = 0;
  for (let i = bits.length / 8; i < spec.dataCodewords; i++) {
    dataBytes[i] = pad[padIdx % 2];
    padIdx++;
  }

  // 2. Reed-Solomon Error Correction
  const ecBytes = calculateReedSolomon(dataBytes, spec.ecCount);

  // Combine data + EC into full codeword sequence
  const fullCodewords = new Uint8Array(spec.totalCodewords);
  fullCodewords.set(dataBytes, 0);
  fullCodewords.set(ecBytes, spec.dataCodewords);

  // 3. Construct Matrix
  const N = spec.size;
  const matrix: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));
  const isFunction: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));

  const setModule = (r: number, c: number, dark: boolean, func = true) => {
    if (r >= 0 && r < N && c >= 0 && c < N) {
      matrix[r][c] = dark;
      if (func) isFunction[r][c] = true;
    }
  };

  // A. Finder patterns (7x7) + Separators (8x8)
  const drawFinder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            const isDark = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
            setModule(nr, nc, isDark);
          } else {
            setModule(nr, nc, false);
          }
        }
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, N - 7);
  drawFinder(N - 7, 0);

  // B. Timing Patterns (Row 6 and Column 6)
  for (let i = 8; i < N - 8; i++) {
    const isDark = i % 2 === 0;
    setModule(6, i, isDark);
    setModule(i, 6, isDark);
  }

  // C. Alignment Pattern for Version >= 2
  if (spec.alignments.length > 0) {
    for (const r of spec.alignments) {
      for (const c of spec.alignments) {
        // Skip corners where finders exist
        if ((r === 6 && c === 6) || (r === 6 && c === spec.alignments[spec.alignments.length - 1]) || (r === spec.alignments[spec.alignments.length - 1] && c === 6)) {
          continue;
        }
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isDark = Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
            setModule(r + dr, c + dc, isDark);
          }
        }
      }
    }
  }

  // D. Dark Module at (8, 4*V + 9)
  setModule(4 * spec.version + 9, 8, true);

  // E. Reserve Format Information Area
  for (let i = 0; i <= 8; i++) {
    if (i !== 6) {
      isFunction[8][i] = true;
      isFunction[i][8] = true;
    }
  }
  for (let i = 0; i <= 7; i++) {
    isFunction[8][N - 1 - i] = true;
    isFunction[N - 1 - i][8] = true;
  }

  // 4. Place Data Bits with Mask 0 ((r + c) % 2 === 0)
  const fullBits: number[] = [];
  for (let i = 0; i < fullCodewords.length; i++) {
    for (let j = 7; j >= 0; j--) {
      fullBits.push((fullCodewords[i] >> j) & 1);
    }
  }

  let bitIdx = 0;
  let upwards = true;
  for (let rightCol = N - 1; rightCol > 0; rightCol -= 2) {
    if (rightCol === 6) rightCol = 5; // skip vertical timing column
    const rows = upwards
      ? Array.from({ length: N }, (_, i) => N - 1 - i)
      : Array.from({ length: N }, (_, i) => i);

    for (const r of rows) {
      for (let cOffset = 0; cOffset < 2; cOffset++) {
        const c = rightCol - cOffset;
        if (!isFunction[r][c]) {
          const bit = bitIdx < fullBits.length ? fullBits[bitIdx++] : 0;
          // Apply standard Mask 0: (r + c) % 2 === 0
          const mask = (r + c) % 2 === 0 ? 1 : 0;
          matrix[r][c] = (bit ^ mask) === 1;
        }
      }
    }
    upwards = !upwards;
  }

  // 5. Format Information (Level L + Mask 0 = 01 000 -> 0x77C4 with BCH 15,5)
  // Standard 15-bit format for (L, Mask 0) is 111011111000100 (0x77C4)
  const formatBits = [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0];
  // Place on Top-Left
  const coords1 = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5],
    [8, 7], [8, 8], [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]
  ];
  for (let i = 0; i < 15; i++) {
    matrix[coords1[i][0]][coords1[i][1]] = formatBits[i] === 1;
  }
  // Place on Top-Right & Bottom-Left
  for (let i = 0; i < 7; i++) {
    matrix[N - 1 - i][8] = formatBits[i] === 1;
  }
  for (let i = 0; i < 8; i++) {
    matrix[8][N - 8 + i] = formatBits[7 + i] === 1;
  }

  return matrix;
}

/**
 * Returns a standalone, responsive, high-contrast SVG representation of the QR code.
 */
export function generateQRSVG(text: string, size = 180, color = "#0F172A"): string {
  const matrix = generateQRMatrix(text);
  const n = matrix.length;
  const padding = 2;
  const total = n + padding * 2;

  let pathD = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (matrix[r][c]) {
        pathD += `M${c + padding},${r + padding}h1v1h-1z `;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${size}" height="${size}" shape-rendering="crispEdges" aria-label="QR Code for URL verification">
    <rect width="${total}" height="${total}" fill="#FFFFFF" rx="4" />
    <path d="${pathD.trim()}" fill="${color}" />
  </svg>`;
}
