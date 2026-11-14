export interface EthiopianDate {
  year: number;
  month: number;
  day: number;
  monthNameAmharic: string;
}

export const ETHIOPIC_MONTHS = [
  "መስከረም", // Meskerem (1)
  "ጥቅምት",   // Tikimt (2)
  "ህዳር",    // Hidar (3)
  "ታኅሣሥ",   // Tahsas (4)
  "ጥር",     // Tir (5)
  "የካቲት",   // Yekatit (6)
  "መጋቢት",   // Megabit (7)
  "ሚያዝያ",   // Miyazya (8)
  "ግንቦት",   // Ginbot (9)
  "ሰኔ",     // Sene (10)
  "ሐምሌ",    // Hamle (11)
  "ነሐሴ",    // Nehase (12)
  "ጳጉሜ",    // Pagume (13)
];

/**
 * Converts a Gregorian Date to Ethiopian Calendar using Julian Day Number.
 */
export function toEthiopianDate(gregorian: Date | string): EthiopianDate {
  const date = typeof gregorian === "string" ? new Date(gregorian) : gregorian;
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  // Calculate Julian Day Number
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jdn =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  // Ethiopian calendar conversion from JDN
  const r = (jdn - 1723856) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const ethYear = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const ethMonth = Math.floor(n / 30) + 1;
  const ethDay = (n % 30) + 1;

  const monthName = ETHIOPIC_MONTHS[Math.min(ethMonth - 1, 12)];

  return {
    year: ethYear,
    month: ethMonth,
    day: ethDay,
    monthNameAmharic: monthName,
  };
}

/**
 * Formats a dual-calendar presentation while preserving the canonical ISO date.
 * Example output: "2026-11-14 (ህዳር 5፣ 2019 ዓ.ም)"
 */
export function formatDualDate(isoDateStr: string): { iso: string; ethiopic: string; display: string } {
  const eth = toEthiopianDate(isoDateStr);
  const ethiopicStr = `${eth.monthNameAmharic} ${eth.day}፣ ${eth.year} ዓ.ም`;
  return {
    iso: isoDateStr,
    ethiopic: ethiopicStr,
    display: `${isoDateStr} (${ethiopicStr})`,
  };
}
