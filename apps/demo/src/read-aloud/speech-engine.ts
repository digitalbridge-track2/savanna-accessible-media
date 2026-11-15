import { baseLanguage } from "./messages.ts";

export type SpeechStatus = "unsupported" | "idle" | "speaking" | "paused";

export interface SpeechSnapshot {
  supported: boolean;
  status: SpeechStatus;
  text: string;
  error: string | null;
}

export interface SpeechVoiceLike {
  voiceURI: string;
  name: string;
  lang: string;
  localService?: boolean;
  default?: boolean;
}

export interface SpeechSynthesisUtteranceLike {
  text: string;
  lang: string;
  rate: number;
  pitch: number;
  volume: number;
  voice: SpeechVoiceLike | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onpause: (() => void) | null;
  onresume: (() => void) | null;
}

export type UtteranceConstructor = new (text?: string) => SpeechSynthesisUtteranceLike;

export interface SpeechSynthesisLike {
  speaking: boolean;
  paused: boolean;
  getVoices(): SpeechVoiceLike[];
  speak(utterance: SpeechSynthesisUtteranceLike): void;
  cancel(): void;
  pause(): void;
  resume(): void;
  addEventListener?: (type: "voiceschanged", listener: () => void) => void;
  removeEventListener?: (type: "voiceschanged", listener: () => void) => void;
  onvoiceschanged?: (() => void) | null;
}

export interface SpeechWindowLike {
  speechSynthesis?: SpeechSynthesisLike | null;
  SpeechSynthesisUtterance?: UtteranceConstructor | null;
}

export interface SpeakRequest {
  text: string;
  lang: string;
  voice?: SpeechVoiceLike | null;
  rate: number;
  pitch: number;
  volume: number;
}

const DEFAULT_SNAPSHOT: SpeechSnapshot = {
  supported: false,
  status: "unsupported",
  text: "",
  error: null,
};

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function normaliseVoice(voice: SpeechVoiceLike): SpeechVoiceLike | null {
  const voiceURI = String(voice.voiceURI || voice.name || "").trim();
  const name = String(voice.name || voiceURI).trim();
  const lang = String(voice.lang || "").trim();
  if (!voiceURI || !name) return null;
  return {
    voiceURI,
    name,
    lang,
    localService: Boolean(voice.localService),
    default: Boolean(voice.default),
  };
}

export function voiceMatchesLanguage(voice: SpeechVoiceLike, lang: string): boolean {
  const base = baseLanguage(lang);
  return Boolean(base) && baseLanguage(voice.lang) === base;
}

export function pickVoice(
  voices: SpeechVoiceLike[],
  preferredVoiceURI: string | null | undefined,
  lang: string
): SpeechVoiceLike | null {
  const base = baseLanguage(lang);
  if (!base) return null;

  if (preferredVoiceURI) {
    const preferred = voices.find((voice) => voice.voiceURI === preferredVoiceURI);
    if (preferred && voiceMatchesLanguage(preferred, lang)) return preferred;
  }

  const candidates = voices.filter((voice) => voiceMatchesLanguage(voice, lang));
  if (candidates.length === 0) return null;
  return (
    candidates.find((voice) => voice.default) ||
    candidates.find((voice) => voice.localService) ||
    candidates[0]
  );
}

export function hasVoiceForLanguage(voices: SpeechVoiceLike[], lang: string): boolean {
  const base = baseLanguage(lang);
  return Boolean(base) && voices.some((voice) => baseLanguage(voice.lang) === base);
}

/**
 * Small wrapper around the Web Speech API. It owns at most one utterance and
 * treats the browser callbacks as untrusted, because cancel() and speak() can
 * fire late events from a previous utterance.
 */
export class SpeechEngine {
  _window: SpeechWindowLike | null;
  _synth: SpeechSynthesisLike | null;
  _Utterance: UtteranceConstructor | null;
  _supported: boolean;
  _current: SpeechSynthesisUtteranceLike | null;
  _token: number;
  _snapshot: SpeechSnapshot;
  _listeners: Set<(snapshot: SpeechSnapshot) => void>;
  _voiceListeners: Set<() => void>;
  _nativeVoices: Map<string, SpeechVoiceLike>;
  _voicesChangedHandler: () => void;
  _voiceListenerMode: "addEventListener" | "onvoiceschanged" | null;

  constructor(windowLike?: SpeechWindowLike | null) {
    const candidate =
      windowLike !== undefined
        ? windowLike
        : typeof window !== "undefined"
          ? (window as unknown as SpeechWindowLike)
          : null;

    this._window = candidate;
    this._synth = candidate?.speechSynthesis || null;
    this._Utterance = candidate?.SpeechSynthesisUtterance || null;
    this._supported = Boolean(this._synth && this._Utterance);
    this._current = null;
    this._token = 0;
    this._listeners = new Set();
    this._voiceListeners = new Set();
    this._nativeVoices = new Map();
    this._voicesChangedHandler = () => this.emitVoices();
    this._voiceListenerMode = null;
    this._snapshot = this._supported
      ? { ...DEFAULT_SNAPSHOT, supported: true, status: "idle" }
      : { ...DEFAULT_SNAPSHOT };

    this.attachVoiceListener();
  }

  attachVoiceListener(): void {
    if (!this._synth || this._voiceListenerMode) return;
    if (typeof this._synth.addEventListener === "function") {
      this._synth.addEventListener("voiceschanged", this._voicesChangedHandler);
      this._voiceListenerMode = "addEventListener";
      return;
    }
    this._synth.onvoiceschanged = this._voicesChangedHandler;
    this._voiceListenerMode = "onvoiceschanged";
  }

  detachVoiceListener(): void {
    if (!this._synth || !this._voiceListenerMode) return;
    if (this._voiceListenerMode === "addEventListener") {
      this._synth.removeEventListener?.("voiceschanged", this._voicesChangedHandler);
    } else if (this._synth.onvoiceschanged === this._voicesChangedHandler) {
      this._synth.onvoiceschanged = null;
    }
    this._voiceListenerMode = null;
  }

  getSnapshot(): SpeechSnapshot {
    return this._snapshot;
  }

  get supported(): boolean {
    return this._supported;
  }

  subscribe(listener: (snapshot: SpeechSnapshot) => void): () => void {
    this._listeners.add(listener);
    listener(this._snapshot);
    return () => {
      this._listeners.delete(listener);
    };
  }

  onVoicesChanged(listener: () => void): () => void {
    this._voiceListeners.add(listener);
    listener();
    return () => {
      this._voiceListeners.delete(listener);
    };
  }

  getVoices(): SpeechVoiceLike[] {
    if (!this._synth) {
      this._nativeVoices.clear();
      return [];
    }
    try {
      const nativeVoices = new Map<string, SpeechVoiceLike>();
      const voices: SpeechVoiceLike[] = [];

      for (const rawVoice of this._synth.getVoices()) {
        const voice = normaliseVoice(rawVoice);
        if (!voice) continue;
        voices.push(voice);
        // Keep the browser's own object for utterance.voice. Plain objects are
        // not accepted by every speech engine.
        if (!nativeVoices.has(voice.voiceURI)) {
          nativeVoices.set(voice.voiceURI, rawVoice);
        }
      }

      this._nativeVoices = nativeVoices;
      return voices.sort((a, b) => {
        if (a.localService !== b.localService) return a.localService ? -1 : 1;
        if (a.lang !== b.lang) return a.lang.localeCompare(b.lang);
        return a.name.localeCompare(b.name);
      });
    } catch {
      this._nativeVoices.clear();
      return [];
    }
  }

  refreshVoices(): void {
    this.emitVoices();
  }

  emitVoices(): void {
    for (const listener of Array.from(this._voiceListeners)) listener();
  }

  setSnapshot(partial: Partial<SpeechSnapshot>): void {
    this._snapshot = { ...this._snapshot, ...partial };
    const snapshot = this._snapshot;
    for (const listener of Array.from(this._listeners)) listener(snapshot);
  }

  speak(request: SpeakRequest): boolean {
    if (!this._supported || !this._synth || !this._Utterance) return false;
    const text = request.text.trim();
    if (!text) return false;

    this._token += 1;
    const token = this._token;
    this._current = null;

    // Cancel any previous read-aloud utterance before starting the next one.
    try {
      this._synth.cancel();
    } catch {
      // A browser without a working cancel() may still accept the next speak().
    }

    let utterance: SpeechSynthesisUtteranceLike;
    try {
      utterance = new this._Utterance(text);
    } catch {
      this.setSnapshot({ status: "idle", text: "", error: "synthesis-failed" });
      return false;
    }

    utterance.text = text;
    utterance.lang = request.lang || "en";
    utterance.rate = clamp(request.rate, 0.5, 2);
    utterance.pitch = clamp(request.pitch, 0.5, 2);
    utterance.volume = clamp(request.volume, 0, 1);
    utterance.voice = request.voice
      ? this._nativeVoices.get(request.voice.voiceURI) || null
      : null;

    utterance.onstart = () => {
      if (token !== this._token) return;
      this.setSnapshot({ status: "speaking", text, error: null });
    };
    utterance.onend = () => {
      if (token !== this._token) return;
      this._current = null;
      this.setSnapshot({ status: "idle", text: "", error: null });
    };
    utterance.onerror = (event) => {
      if (token !== this._token) return;
      this._current = null;
      const code = (event && event.error) || "synthesis-failed";
      if (code === "interrupted" || code === "canceled") {
        this.setSnapshot({ status: "idle", text: "", error: null });
        return;
      }
      this.setSnapshot({ status: "idle", text: "", error: code });
    };
    utterance.onpause = () => {
      if (token !== this._token) return;
      this.setSnapshot({ status: "paused", text, error: null });
    };
    utterance.onresume = () => {
      if (token !== this._token) return;
      this.setSnapshot({ status: "speaking", text, error: null });
    };

    this._current = utterance;
    this.setSnapshot({ status: "speaking", text, error: null });

    try {
      this._synth.speak(utterance);
    } catch {
      this._current = null;
      this.setSnapshot({ status: "idle", text: "", error: "synthesis-failed" });
      return false;
    }
    return true;
  }

  pause(): boolean {
    if (!this._synth || !this._supported) return false;
    if (this._snapshot.status !== "speaking") return false;
    try {
      this._synth.pause();
    } catch {
      this.setSnapshot({ status: "idle", text: "", error: "synthesis-failed" });
      return false;
    }
    this.setSnapshot({ status: "paused", error: null });
    return true;
  }

  resume(): boolean {
    if (!this._synth || !this._supported) return false;
    if (this._snapshot.status !== "paused") return false;
    try {
      this._synth.resume();
    } catch {
      this.setSnapshot({ status: "idle", text: "", error: "synthesis-failed" });
      return false;
    }
    this.setSnapshot({ status: "speaking", error: null });
    return true;
  }

  stop(): void {
    if (!this._supported) return;
    this._token += 1;
    this._current = null;
    try {
      this._synth?.cancel();
    } catch {
      // Ignore: the UI still moves to a stopped state below.
    }
    this.setSnapshot({ status: "idle", text: "", error: null });
  }

  dispose(): void {
    this.stop();
    this.detachVoiceListener();
    this._listeners.clear();
    this._voiceListeners.clear();
    this._nativeVoices.clear();
    this._current = null;
    this._synth = null;
    this._Utterance = null;
    this._supported = false;
  }
}
