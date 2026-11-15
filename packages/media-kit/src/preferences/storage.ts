export type CaptionTheme = "default" | "yellow-black" | "white-black" | "black-yellow" | "amber-gold";
export type CaptionSize = "small" | "medium" | "large" | "xlarge";
export type ESLPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left";
export type ESLSize = "small" | "medium" | "large";

export interface PlayerPreferences {
  captionLanguage: string; // "off" | "en" | "am"
  captionSize: CaptionSize;
  captionTheme: CaptionTheme;
  audioDescriptionEnabled: boolean;
  eslVisible: boolean;
  eslPosition: ESLPosition;
  eslSize: ESLSize;
  playbackRate: number;
  transcriptVisible?: boolean;
  transcriptWidth?: number;
  transcriptHeight?: number;
  eslWidth?: number;
  eslHeight?: number;
}

const STORAGE_KEY = "abugida_media_preferences";

export const DEFAULT_PREFERENCES: PlayerPreferences = {
  captionLanguage: "en",
  captionSize: "medium",
  captionTheme: "default",
  audioDescriptionEnabled: false,
  eslVisible: true,
  eslPosition: "bottom-right",
  eslSize: "medium",
  playbackRate: 1.0,
  transcriptVisible: true,
  transcriptWidth: 260,
  transcriptHeight: 400,
  eslWidth: 240,
  eslHeight: 180,
};

export function loadPreferences(): PlayerPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFERENCES };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(prefs: Partial<PlayerPreferences>): PlayerPreferences {
  try {
    const current = loadPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return { ...DEFAULT_PREFERENCES, ...prefs };
  }
}

export function resetPreferences(): PlayerPreferences {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  return { ...DEFAULT_PREFERENCES };
}
