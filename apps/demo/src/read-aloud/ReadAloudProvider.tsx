import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  baseLanguage,
  getReadAloudUI,
  getSpeechErrorMessage,
  type ReadAloudLocale,
  type ReadAloudUI,
} from "./messages";
import {
  extractReadableContent,
  resolveReadableTarget,
  type ReadableContent,
} from "./content-extractor";
import {
  hasVoiceForLanguage,
  pickVoice,
  SpeechEngine,
  type SpeechSnapshot,
  type SpeechStatus,
  type SpeechVoiceLike,
} from "./speech-engine";

export interface ReadAloudSettings {
  enabled: boolean;
  hoverEnabled: boolean;
  keyboardEnabled: boolean;
  rate: number;
  pitch: number;
  volume: number;
  voiceURI: string | null;
}

export interface ReadAloudContextValue {
  supported: boolean;
  settings: ReadAloudSettings;
  status: SpeechStatus;
  statusText: string;
  voices: SpeechVoiceLike[];
  hasAmharicVoice: boolean;
  current: { text: string; lang: string } | null;
  notice: string;
  errorMessage: string;
  ui: ReadAloudUI;
  updateSettings: (patch: Partial<ReadAloudSettings>) => void;
  toggleEnabled: () => void;
  readCurrent: () => void;
  repeat: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  refreshVoices: () => void;
}

const STORAGE_KEY = "abugida_read_aloud_settings";
const HOVER_DELAY_MS = 700;
const DEDUPE_WINDOW_MS = 2200;
const HIGHLIGHT_ATTRIBUTE = "data-read-aloud-active";
const HIGHLIGHT_STYLE_ATTRIBUTE = "data-read-aloud-highlight";

const DEFAULT_SETTINGS: ReadAloudSettings = {
  enabled: false, // Strict WCAG 2.2 AA & screen-reader protection: zero unexpected audio or collision with NVDA/TalkBack on load
  hoverEnabled: true,
  keyboardEnabled: true,
  rate: 1,
  pitch: 1,
  volume: 1,
  voiceURI: null,
};

const SHADOW_HIGHLIGHT_CSS = `
[${HIGHLIGHT_ATTRIBUTE}="true"] {
  outline: 3px solid #8C6200 !important;
  outline-offset: 3px !important;
  box-shadow: 0 0 0 6px rgba(229, 168, 35, 0.32) !important;
  border-radius: 4px;
}
@media (forced-colors: active) {
  [${HIGHLIGHT_ATTRIBUTE}="true"] {
    outline: 3px solid Highlight !important;
    box-shadow: none !important;
  }
}
`;

const ReadAloudContext = createContext<ReadAloudContextValue | null>(null);

function numberInRange(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function sanitiseSettings(value: Partial<ReadAloudSettings> | null | undefined): ReadAloudSettings {
  return {
    enabled:
      typeof value?.enabled === "boolean" ? value.enabled : DEFAULT_SETTINGS.enabled,
    hoverEnabled:
      typeof value?.hoverEnabled === "boolean"
        ? value.hoverEnabled
        : DEFAULT_SETTINGS.hoverEnabled,
    keyboardEnabled:
      typeof value?.keyboardEnabled === "boolean"
        ? value.keyboardEnabled
        : DEFAULT_SETTINGS.keyboardEnabled,
    rate: numberInRange(value?.rate, 0.5, 2, DEFAULT_SETTINGS.rate),
    pitch: numberInRange(value?.pitch, 0.5, 2, DEFAULT_SETTINGS.pitch),
    volume: numberInRange(value?.volume, 0, 1, DEFAULT_SETTINGS.volume),
    voiceURI:
      typeof value?.voiceURI === "string" && value.voiceURI.trim()
        ? value.voiceURI
        : null,
  };
}

function loadSettings(): ReadAloudSettings {
  try {
    if (typeof localStorage === "undefined") return { ...DEFAULT_SETTINGS };
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return sanitiseSettings(JSON.parse(raw) as Partial<ReadAloudSettings>);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(settings: ReadAloudSettings): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Preferences are an enhancement; a blocked storage API must not break speech.
  }
}

function initialSnapshot(): SpeechSnapshot {
  const supported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;
  return {
    supported,
    status: supported ? "idle" : "unsupported",
    text: "",
    error: null,
  };
}

function eventElement(event: Event): Element | null {
  const path = typeof event.composedPath === "function" ? event.composedPath() : [];
  for (const node of path) {
    if (node && (node as Node).nodeType === 1) return node as Element;
  }
  const target = event.target as Node | null;
  return target && target.nodeType === 1 ? (target as Element) : null;
}

function deepActiveElement(): Element | null {
  let active: Element | null =
    typeof document !== "undefined" ? document.activeElement : null;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

function applyHighlight(element: HTMLElement, shadowRoots: Set<ShadowRoot>): void {
  element.setAttribute(HIGHLIGHT_ATTRIBUTE, "true");
  const root = element.getRootNode() as ShadowRoot | Document;
  if (root && "host" in root && root.nodeType === 11) {
    const shadow = root as ShadowRoot;
    shadowRoots.add(shadow);
    if (!shadow.querySelector(`style[${HIGHLIGHT_STYLE_ATTRIBUTE}]`)) {
      const style = element.ownerDocument.createElement("style");
      style.setAttribute(HIGHLIGHT_STYLE_ATTRIBUTE, "");
      style.textContent = SHADOW_HIGHLIGHT_CSS;
      shadow.appendChild(style);
    }
  }
}

function removeHighlight(element: HTMLElement | null): void {
  element?.removeAttribute(HIGHLIGHT_ATTRIBUTE);
}

export interface ReadAloudProviderProps {
  locale: ReadAloudLocale;
  routeKey?: string;
  children: React.ReactNode;
}

export const ReadAloudProvider: React.FC<ReadAloudProviderProps> = ({
  locale,
  routeKey,
  children,
}) => {
  const [settings, setSettings] = useState<ReadAloudSettings>(loadSettings);
  const [snapshot, setSnapshot] = useState<SpeechSnapshot>(initialSnapshot);
  const [voices, setVoices] = useState<SpeechVoiceLike[]>([]);
  const [current, setCurrent] = useState<{ text: string; lang: string } | null>(null);
  const [notice, setNotice] = useState("");
  const [liveMessage, setLiveMessage] = useState("");

  const engineRef = useRef<SpeechEngine | null>(null);
  const settingsRef = useRef(settings);
  const snapshotRef = useRef(snapshot);
  const voicesRef = useRef(voices);
  const localeRef = useRef(locale);
  const modalityRef = useRef<"keyboard" | "pointer">("pointer");
  const currentSourceRef = useRef<"hover" | "focus" | "manual" | null>(null);
  const lastTargetRef = useRef<ReadableContent | null>(null);
  const lastSpokenRef = useRef<{ element: HTMLElement; text: string; at: number } | null>(
    null
  );
  const lastFocusTargetRef = useRef<HTMLElement | null>(null);
  const hoverTargetRef = useRef<HTMLElement | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightRef = useRef<HTMLElement | null>(null);
  const highlightShadowRootsRef = useRef<Set<ShadowRoot>>(new Set());
  const noticeRef = useRef("");
  const lastRouteRef = useRef(routeKey);

  const ui = useMemo(() => getReadAloudUI(locale), [locale]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    snapshotRef.current = snapshot;
    if (snapshot.status === "idle") currentSourceRef.current = null;
  }, [snapshot]);

  useEffect(() => {
    voicesRef.current = voices;
  }, [voices]);

  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const clearHoverTimer = useCallback(() => {
    if (hoverTimerRef.current !== null) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  const clearHighlight = useCallback(() => {
    removeHighlight(highlightRef.current);
    highlightRef.current = null;
  }, []);

  const showNotice = useCallback((message: string) => {
    setNotice(message);
    if (noticeRef.current !== message) {
      noticeRef.current = message;
      setLiveMessage(message);
    }
  }, []);

  const clearNotice = useCallback(() => {
    setNotice("");
    noticeRef.current = "";
  }, []);

  useEffect(() => {
    const engine = new SpeechEngine();
    engineRef.current = engine;
    setSnapshot(engine.getSnapshot());
    setVoices(engine.getVoices());
    const unsubscribe = engine.subscribe(setSnapshot);
    const unsubscribeVoices = engine.onVoicesChanged(() => {
      setVoices(engine.getVoices());
    });
    return () => {
      unsubscribe();
      unsubscribeVoices();
      engine.dispose();
      if (engineRef.current === engine) engineRef.current = null;
    };
  }, []);

  const refreshVoices = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.refreshVoices();
    setVoices(engine.getVoices());
  }, []);

  const performRead = useCallback(
    (
      element: HTMLElement,
      source: "hover" | "focus" | "manual",
      force = false
    ): boolean => {
      const engine = engineRef.current;
      const activeSettings = settingsRef.current;
      if (!engine || !engine.supported || !activeSettings.enabled) return false;
      if (source === "hover" && !activeSettings.hoverEnabled) return false;
      if (source === "focus" && !activeSettings.keyboardEnabled) return false;
      if (!element.isConnected) return false;

      const content = extractReadableContent(element);
      if (!content) return false;

      const now = Date.now();
      const last = lastSpokenRef.current;
      const isActive =
        snapshotRef.current.status === "speaking" ||
        snapshotRef.current.status === "paused";
      if (
        !force &&
        last &&
        last.element === content.element &&
        last.text === content.text &&
        (isActive || now - last.at < DEDUPE_WINDOW_MS)
      ) {
        return false;
      }

      const voice = pickVoice(voicesRef.current, activeSettings.voiceURI, content.language);
      lastTargetRef.current = content;
      setCurrent({ text: content.text, lang: content.language });

      if (baseLanguage(content.language) === "am" && !voice) {
        showNotice(getReadAloudUI(localeRef.current).amharicMissing);
        return false;
      }

      clearNotice();
      currentSourceRef.current = source;
      const started = engine.speak({
        text: content.text,
        lang: voice?.lang || content.language,
        voice,
        rate: activeSettings.rate,
        pitch: activeSettings.pitch,
        volume: activeSettings.volume,
      });

      if (started) {
        lastSpokenRef.current = { element: content.element, text: content.text, at: now };
        removeHighlight(highlightRef.current);
        highlightRef.current = content.element;
        applyHighlight(content.element, highlightShadowRootsRef.current);
        snapshotRef.current = engine.getSnapshot();
      }
      return started;
    },
    [clearNotice, showNotice]
  );

  const stop = useCallback(() => {
    clearHoverTimer();
    currentSourceRef.current = null;
    engineRef.current?.stop();
    clearHighlight();
  }, [clearHoverTimer, clearHighlight]);

  const readCurrent = useCallback(() => {
    const lastTarget = lastTargetRef.current;
    if (lastTarget?.element.isConnected) {
      performRead(lastTarget.element, "manual", true);
      return;
    }

    const active = deepActiveElement();
    const activeContent = resolveReadableTarget(active);
    if (activeContent) {
      performRead(activeContent.element, "manual", true);
      return;
    }

    const fallback =
      document.querySelector<HTMLElement>("main h2, main h1, main h3, h2, h1");
    if (fallback && performRead(fallback, "manual", true)) return;
    showNotice(ui.noContent);
  }, [performRead, showNotice, ui.noContent]);

  const repeat = useCallback(() => {
    const lastTarget = lastTargetRef.current;
    if (lastTarget?.element.isConnected) {
      performRead(lastTarget.element, "manual", true);
      return;
    }
    readCurrent();
  }, [performRead, readCurrent]);

  const pause = useCallback(() => {
    engineRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    engineRef.current?.resume();
  }, []);

  const announceLive = useCallback((message: string) => {
    setLiveMessage(message);
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<ReadAloudSettings>) => {
      const previous = settingsRef.current;
      const next = sanitiseSettings({ ...previous, ...patch });
      settingsRef.current = next;
      setSettings(next);

      if (!next.enabled) {
        clearHoverTimer();
        hoverTargetRef.current = null;
        currentSourceRef.current = null;
        engineRef.current?.stop();
        clearHighlight();
      } else if (!next.hoverEnabled) {
        clearHoverTimer();
        hoverTargetRef.current = null;
        if (currentSourceRef.current === "hover") {
          currentSourceRef.current = null;
          engineRef.current?.stop();
          clearHighlight();
        }
      }
      if (!next.keyboardEnabled && currentSourceRef.current === "focus") {
        currentSourceRef.current = null;
        engineRef.current?.stop();
        clearHighlight();
      }
      if (typeof patch.enabled === "boolean" && patch.enabled !== previous.enabled) {
        announceLive(
          patch.enabled
            ? getReadAloudUI(localeRef.current).enabledAnnouncement
            : getReadAloudUI(localeRef.current).disabledAnnouncement
        );
      }
    },
    [announceLive, clearHoverTimer, clearHighlight]
  );

  const toggleEnabled = useCallback(() => {
    updateSettings({ enabled: !settingsRef.current.enabled });
  }, [updateSettings]);

  const cancelHover = useCallback(() => {
    clearHoverTimer();
    hoverTargetRef.current = null;
    if (currentSourceRef.current === "hover") {
      currentSourceRef.current = null;
      engineRef.current?.stop();
      clearHighlight();
    }
  }, [clearHoverTimer, clearHighlight]);

  useEffect(() => {
    if (lastRouteRef.current === routeKey) return;
    lastRouteRef.current = routeKey;
    clearHoverTimer();
    hoverTargetRef.current = null;
    lastFocusTargetRef.current = null;
    currentSourceRef.current = null;
    lastTargetRef.current = null;
    engineRef.current?.stop();
    clearHighlight();
    setCurrent(null);
  }, [routeKey, clearHoverTimer, clearHighlight]);

  useEffect(() => {
    if (!snapshot.error) return;
    announceLive(getSpeechErrorMessage(localeRef.current, snapshot.error));
  }, [snapshot.error, announceLive]);

  useEffect(() => {
    if (snapshot.status === "speaking" || snapshot.status === "paused") {
      const target = lastTargetRef.current?.element;
      if (target?.isConnected) {
        removeHighlight(highlightRef.current);
        highlightRef.current = target;
        applyHighlight(target, highlightShadowRootsRef.current);
      }
      return;
    }
    clearHighlight();
  }, [snapshot.status, clearHighlight]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      modalityRef.current = "keyboard";
      if (event.defaultPrevented || event.isComposing) return;
      if (
        event.altKey &&
        event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        (event.code === "KeyR" || event.key.toLowerCase() === "r")
      ) {
        event.preventDefault();
        toggleEnabled();
      }
    };

    const onPointerDown = () => {
      modalityRef.current = "pointer";
      clearHoverTimer();
    };

    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const activeSettings = settingsRef.current;
      if (!activeSettings.enabled || !activeSettings.hoverEnabled) {
        cancelHover();
        return;
      }

      const target = eventElement(event);
      const content = resolveReadableTarget(target);
      const next = content?.element ?? null;
      if (next === hoverTargetRef.current) return;

      hoverTargetRef.current = next;
      clearHoverTimer();

      if (currentSourceRef.current === "hover") {
        currentSourceRef.current = null;
        engineRef.current?.stop();
        clearHighlight();
      }

      if (!next) return;

      hoverTimerRef.current = setTimeout(() => {
        hoverTimerRef.current = null;
        if (hoverTargetRef.current !== next) return;
        const latest = settingsRef.current;
        if (!latest.enabled || !latest.hoverEnabled) return;
        performRead(next, "hover");
      }, HOVER_DELAY_MS);
    };

    const onPointerOut = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      if (!event.relatedTarget) cancelHover();
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = eventElement(event);
      const content = resolveReadableTarget(target);
      const next = content?.element ?? null;
      if (next === lastFocusTargetRef.current) return;
      lastFocusTargetRef.current = next;

      if (modalityRef.current !== "keyboard") return;
      const activeSettings = settingsRef.current;
      if (!next || !activeSettings.enabled || !activeSettings.keyboardEnabled) return;
      clearHoverTimer();
      performRead(next, "focus");
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") stop();
    };

    const onPageHide = () => stop();

    const onDocumentPointerLeave = () => cancelHover();

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointerover", onPointerOver, true);
    document.addEventListener("pointerout", onPointerOut, true);
    document.addEventListener("focusin", onFocusIn, true);
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.documentElement.addEventListener("pointerleave", onDocumentPointerLeave);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointerover", onPointerOver, true);
      document.removeEventListener("pointerout", onPointerOut, true);
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.documentElement.removeEventListener(
        "pointerleave",
        onDocumentPointerLeave
      );
      window.removeEventListener("pagehide", onPageHide);
      clearHoverTimer();
      clearHighlight();
    };
  }, [
    cancelHover,
    clearHoverTimer,
    clearHighlight,
    performRead,
    stop,
    toggleEnabled,
  ]);

  useEffect(() => {
    return () => {
      const shadowRoots = highlightShadowRootsRef.current;
      for (const root of shadowRoots) {
        root
          .querySelectorAll(`style[${HIGHLIGHT_STYLE_ATTRIBUTE}]`)
          .forEach((style) => style.remove());
      }
      shadowRoots.clear();
    };
  }, []);

  const hasAmharicVoice = hasVoiceForLanguage(voices, "am");
  const errorMessage = getSpeechErrorMessage(locale, snapshot.error);
  const statusText =
    snapshot.status === "speaking"
      ? ui.statusSpeaking
      : snapshot.status === "paused"
        ? ui.statusPaused
        : snapshot.status === "unsupported"
          ? ui.statusUnsupported
          : ui.statusStopped;

  const value = useMemo<ReadAloudContextValue>(
    () => ({
      supported: snapshot.supported,
      settings,
      status: snapshot.status,
      statusText,
      voices,
      hasAmharicVoice,
      current,
      notice,
      errorMessage,
      ui,
      updateSettings,
      toggleEnabled,
      readCurrent,
      repeat,
      pause,
      resume,
      stop,
      refreshVoices,
    }),
    [
      snapshot.supported,
      snapshot.status,
      settings,
      statusText,
      voices,
      hasAmharicVoice,
      current,
      notice,
      errorMessage,
      ui,
      updateSettings,
      toggleEnabled,
      readCurrent,
      repeat,
      pause,
      resume,
      stop,
      refreshVoices,
    ]
  );

  return (
    <ReadAloudContext.Provider value={value}>
      {children}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true" lang={locale}>
        {liveMessage}
      </div>
    </ReadAloudContext.Provider>
  );
};

export function useReadAloud(): ReadAloudContextValue {
  const context = useContext(ReadAloudContext);
  if (!context) {
    throw new Error("useReadAloud must be used inside ReadAloudProvider");
  }
  return context;
}
