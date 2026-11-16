import {
  baseLanguage,
  getSpeechLabels,
  hasEthiopicScript,
  type SpeechLabels,
} from "./messages";

export type ReadableKind =
  | "heading"
  | "paragraph"
  | "list"
  | "listitem"
  | "button"
  | "link"
  | "image"
  | "form-field"
  | "form-label"
  | "table-header"
  | "table-cell"
  | "table-caption"
  | "region"
  | "quote"
  | "caption"
  | "summary"
  | "term"
  | "definition";

export interface ReadableContent {
  element: HTMLElement;
  kind: ReadableKind;
  text: string;
  language: string;
  key: string;
}

const IGNORE_SELECTOR = "[data-read-aloud-ignore]";
const TEXT_NODE = 3;
const ELEMENT_NODE = 1;
const ETHIOPIC_CHAR = /[\u1200-\u137F]/;

const MAX_HEADING_LENGTH = 320;
const MAX_PARAGRAPH_LENGTH = 1200;
const MAX_LIST_ITEM_LENGTH = 600;
const MAX_TABLE_CELL_LENGTH = 420;
const MAX_FORM_FIELD_LENGTH = 420;
const MAX_REGION_LENGTH = 800;

const SKIPPED_TAGS = new Set([
  "script",
  "style",
  "noscript",
  "template",
  "audio",
  "video",
  "canvas",
  "iframe",
  "object",
  "embed",
]);

interface Classification {
  kind: ReadableKind;
  role: string;
  tag: string;
  inputType?: string;
}

interface CollectOptions {
  skipNestedLists?: boolean;
}

function tagName(element: Element): string {
  return element.tagName.toLowerCase();
}

function roleOf(element: Element): string {
  return (element.getAttribute("role") || "").trim().toLowerCase().split(/\s+/)[0] || "";
}

function composedParent(element: Element): Element | null {
  if (element.parentElement) return element.parentElement;
  const root = element.getRootNode() as ShadowRoot | Document;
  if (root && "host" in root && root.host) return root.host;
  return null;
}

function closestComposed(element: Element, selector: string): Element | null {
  let node: Element | null = element;
  while (node) {
    if (node.matches && node.matches(selector)) return node;
    node = composedParent(node);
  }
  return null;
}

function getElementByIdInRoot(element: Element, id: string): Element | null {
  const root = element.getRootNode() as Document | ShadowRoot;
  if ("getElementById" in root) {
    const found = root.getElementById(id);
    if (found) return found;
  }
  const foundInDocument = element.ownerDocument?.getElementById(id);
  return foundInDocument ?? null;
}

function isHiddenByStyle(element: Element): boolean {
  const view = element.ownerDocument?.defaultView;
  if (!view || typeof view.getComputedStyle !== "function") return false;
  try {
    const style = view.getComputedStyle(element);
    return (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.visibility === "collapse"
    );
  } catch {
    return false;
  }
}

export function isElementHidden(element: Element): boolean {
  let node: Element | null = element;
  while (node) {
    if (node.hasAttribute("hidden") || node.hasAttribute("inert")) return true;
    if (node.getAttribute("aria-hidden") === "true") return true;
    if (isHiddenByStyle(node)) return true;
    node = composedParent(node);
  }
  return false;
}

export function isIgnoredElement(element: Element): boolean {
  return Boolean(closestComposed(element, IGNORE_SELECTOR)) || isElementHidden(element);
}

/** Removes pictographs, arrows, and icon glyphs that do not help speech. */
export function cleanSpeechText(value: string): string {
  return value
    .replace(/[\u200B-\u200D\uFE0E\uFE0F]/g, "")
    .replace(/\p{Extended_Pictographic}/gu, " ")
    .replace(/[\u2190-\u21FF\u2300-\u23FF\u25A0-\u25FF\u2700-\u27BF\u2B00-\u2BFF]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[\s,;:|·•\-–—]+/, "")
    .replace(/[\s,;:|·•\-–—]+$/, "")
    .trim();
}

function hasMeaningfulText(value: string): boolean {
  return /[\p{L}\p{N}]/u.test(value);
}

function truncateSpeech(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  const slice = value.slice(0, Math.max(1, maxLength - 1));
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > maxLength * 0.55 ? slice.slice(0, lastSpace) : slice;
  return `${cut.replace(/[\s,;:.!?]+$/, "")}…`;
}

function collectTextFromIds(element: Element, ids: string | null): string {
  if (!ids) return "";
  const parts: string[] = [];
  for (const id of ids.split(/\s+/)) {
    const trimmed = id.trim();
    if (!trimmed) continue;
    const referenced = getElementByIdInRoot(element, trimmed);
    if (referenced) parts.push(cleanSpeechText(referenced.textContent || ""));
  }
  return cleanSpeechText(parts.join(" "));
}

/**
 * A deliberately small accessible-name approximation. It covers the patterns
 * used by this app and avoids layout-dependent text measurement.
 */
export function getAccessibleName(element: Element): string {
  const labelledBy = collectTextFromIds(element, element.getAttribute("aria-labelledby"));
  if (labelledBy) return labelledBy;

  const ariaLabel = cleanSpeechText(element.getAttribute("aria-label") || "");
  if (ariaLabel) return ariaLabel;

  const tag = tagName(element);
  if (tag === "img") {
    const alt = cleanSpeechText(element.getAttribute("alt") || "");
    if (alt) return alt;
  }

  if (tag === "svg") {
    const title = element.querySelector("title");
    const titleText = cleanSpeechText(title?.textContent || "");
    if (titleText) return titleText;
  }

  if (tag === "input") {
    const type = (element.getAttribute("type") || "text").toLowerCase();
    if (type === "submit" || type === "button" || type === "reset") {
      const value = cleanSpeechText((element as HTMLInputElement).value || "");
      if (value) return value;
    }
    if (type === "image") {
      const alt = cleanSpeechText(element.getAttribute("alt") || "");
      if (alt) return alt;
    }
  }

  const text = collectVisibleText(element);
  if (text) return text;

  const title = cleanSpeechText(element.getAttribute("title") || "");
  if (title) return title;

  if (tag === "input" || tag === "textarea") {
    return cleanSpeechText((element as HTMLInputElement).placeholder || "");
  }

  return "";
}

function collectVisibleText(root: Element, options: CollectOptions = {}): string {
  const parts: string[] = [];

  const walk = (node: Node): void => {
    if (node.nodeType === TEXT_NODE) {
      const text = cleanSpeechText(node.nodeValue || "");
      if (text) parts.push(text);
      return;
    }
    if (node.nodeType !== ELEMENT_NODE) return;

    const element = node as Element;
    const tag = tagName(element);
    if (SKIPPED_TAGS.has(tag)) return;

    if (element !== root) {
      if (
        element.hasAttribute("hidden") ||
        element.hasAttribute("inert") ||
        element.getAttribute("aria-hidden") === "true" ||
        closestComposed(element, IGNORE_SELECTOR) === element
      ) {
        return;
      }
      if (isHiddenByStyle(element)) return;
      if (options.skipNestedLists && (tag === "ul" || tag === "ol" || roleOf(element) === "list")) {
        return;
      }
    }

    if (tag === "img") {
      const alt = cleanSpeechText(element.getAttribute("alt") || "");
      if (alt) parts.push(alt);
      return;
    }

    if (tag === "svg") {
      const title = element.querySelector("title");
      const label =
        cleanSpeechText(element.getAttribute("aria-label") || "") ||
        cleanSpeechText(title?.textContent || "");
      if (label) parts.push(label);
      return;
    }

    if (tag === "br") {
      parts.push(" ");
      return;
    }

    for (const child of Array.from(element.childNodes)) walk(child);
  };

  walk(root);
  return cleanSpeechText(parts.join(" "));
}

function descriptionText(element: Element): string {
  const describedBy = collectTextFromIds(element, element.getAttribute("aria-describedby"));
  if (describedBy) return describedBy;
  return cleanSpeechText(element.getAttribute("aria-description") || "");
}

function fieldLabel(element: Element): string {
  const labelledBy = collectTextFromIds(element, element.getAttribute("aria-labelledby"));
  if (labelledBy) return labelledBy;

  const ariaLabel = cleanSpeechText(element.getAttribute("aria-label") || "");
  if (ariaLabel) return ariaLabel;

  const labels = (element as HTMLInputElement).labels;
  if (labels && labels.length > 0) {
    const joined = Array.from(labels)
      .map((label) => cleanSpeechText(label.textContent || ""))
      .filter(Boolean)
      .join(" ");
    if (joined) return joined;
  }

  const id = element.getAttribute("id");
  if (id) {
    const root = element.getRootNode() as Document | ShadowRoot;
    const candidates = Array.from(root.querySelectorAll("label"));
    const associated = candidates.find((label) => label.getAttribute("for") === id);
    if (associated) return cleanSpeechText(associated.textContent || "");
  }

  return cleanSpeechText(element.getAttribute("placeholder") || element.getAttribute("title") || "");
}

function directListItems(list: Element): Element[] {
  return Array.from(list.children).filter(
    (child) => tagName(child) === "li" || roleOf(child) === "listitem"
  );
}

function containingList(element: Element): Element | null {
  let node = composedParent(element);
  while (node) {
    if (tagName(node) === "ul" || tagName(node) === "ol" || roleOf(node) === "list") {
      return node;
    }
    node = composedParent(node);
  }
  return null;
}

function classifyElement(element: Element): Classification | null {
  const tag = tagName(element);
  const role = roleOf(element);
  const inputType = (element.getAttribute("type") || "text").toLowerCase();

  if (role === "heading" || /^h[1-6]$/.test(tag)) {
    return { kind: "heading", role, tag };
  }
  if (role === "img") {
    return { kind: "image", role, tag };
  }
  if (role === "button") {
    return { kind: "button", role, tag };
  }
  if (role === "link") {
    return { kind: "link", role, tag };
  }
  if (
    role === "checkbox" ||
    role === "radio" ||
    role === "switch" ||
    role === "slider" ||
    role === "spinbutton" ||
    role === "textbox" ||
    role === "searchbox" ||
    role === "combobox" ||
    role === "listbox"
  ) {
    return { kind: "form-field", role, tag, inputType };
  }
  if (tag === "a" && element.hasAttribute("href")) {
    return { kind: "link", role, tag };
  }
  if (tag === "button") {
    return { kind: "button", role, tag };
  }
  if (tag === "input") {
    if (inputType === "hidden") return null;
    if (inputType === "submit" || inputType === "button" || inputType === "reset" || inputType === "image") {
      return { kind: "button", role, tag, inputType };
    }
    return { kind: "form-field", role, tag, inputType };
  }
  if (tag === "select" || tag === "textarea") {
    return { kind: "form-field", role, tag, inputType };
  }
  if (tag === "img" || (tag === "svg" && Boolean(getAccessibleName(element)))) {
    return { kind: "image", role, tag };
  }
  if (tag === "label") {
    return { kind: "form-label", role, tag };
  }
  if (tag === "th" || role === "columnheader" || role === "rowheader") {
    return { kind: "table-header", role, tag };
  }
  if (tag === "td" || role === "cell" || role === "gridcell") {
    return { kind: "table-cell", role, tag };
  }
  if (tag === "caption") {
    return { kind: "table-caption", role, tag };
  }
  if (tag === "ul" || tag === "ol" || role === "list") {
    return { kind: "list", role, tag };
  }
  if (tag === "li" || role === "listitem") {
    return { kind: "listitem", role, tag };
  }
  if (tag === "p") {
    return { kind: "paragraph", role, tag };
  }
  if (tag === "blockquote") {
    return { kind: "quote", role, tag };
  }
  if (tag === "figcaption") {
    return { kind: "caption", role, tag };
  }
  if (tag === "summary") {
    return { kind: "summary", role, tag };
  }
  if (tag === "dt" || role === "term") {
    return { kind: "term", role, tag };
  }
  if (tag === "dd" || role === "definition") {
    return { kind: "definition", role, tag };
  }
  if (element.hasAttribute("data-read-aloud")) {
    return { kind: "region", role, tag };
  }
  return null;
}

function headingLevel(element: Element): number {
  const tag = tagName(element);
  const tagMatch = /^h([1-6])$/.exec(tag);
  if (tagMatch) return Number(tagMatch[1]);
  const ariaLevel = Number(element.getAttribute("aria-level"));
  return Number.isInteger(ariaLevel) && ariaLevel >= 1 && ariaLevel <= 6 ? ariaLevel : 2;
}

function extractButton(element: Element, labels: SpeechLabels): string {
  const name = getAccessibleName(element);
  if (!name) return "";
  const parts = [name, labels.button];
  const pressed = element.getAttribute("aria-pressed");
  if (pressed === "true") parts.push(labels.pressed);
  if (pressed === "false") parts.push(labels.notPressed);
  if (
    element.hasAttribute("disabled") ||
    element.getAttribute("aria-disabled") === "true"
  ) {
    parts.push(labels.disabled);
  }
  return parts.join(", ");
}

function extractLink(element: Element, labels: SpeechLabels): string {
  const name = getAccessibleName(element);
  if (!name) return "";
  const parts = [name, labels.link];
  if (element.getAttribute("target") === "_blank") parts.push(labels.newTab);
  if (element.getAttribute("aria-current") === "page") parts.push(labels.currentPage);
  if (element.getAttribute("aria-disabled") === "true") parts.push(labels.disabled);
  return parts.join(", ");
}

function extractImage(element: Element, labels: SpeechLabels): string {
  const name = getAccessibleName(element);
  if (!name) return "";
  const parts = [`${labels.image}: ${name}`];
  const interactive = closestComposed(element, "a[href], button");
  if (interactive && interactive !== element) {
    parts.push(tagName(interactive) === "a" ? labels.link : labels.button);
  }
  return parts.join(", ");
}

function extractFormField(element: Element, labels: SpeechLabels, inputType: string): string {
  const tag = tagName(element);
  const role = roleOf(element);
  let type = tag === "select" ? "select" : tag === "textarea" ? "textarea" : inputType;
  if (role === "checkbox" || role === "switch") type = "checkbox";
  if (role === "radio") type = "radio";
  if (role === "slider" || role === "spinbutton") type = "range";
  if (role === "searchbox") type = "search";
  if (role === "combobox" || role === "listbox") type = "select";
  if (role === "textbox") type = "text";

  const fieldType =
    type === "submit" || type === "button" || type === "reset"
      ? labels.button
      : labels.fieldTypes[type] || labels.fieldTypes.text;
  const label = fieldLabel(element);
  const parts: string[] = [];
  if (label) parts.push(label);
  parts.push(fieldType);

  const isChoice = type === "checkbox" || type === "radio";
  if (isChoice) {
    const checked =
      element.getAttribute("aria-checked") === "true" ||
      Boolean((element as HTMLInputElement).checked);
    parts.push(checked ? labels.checked : labels.notChecked);
  } else if (type === "range" && element.getAttribute("aria-valuenow")) {
    parts.push(`${labels.currentValue}: ${element.getAttribute("aria-valuenow")}`);
  } else if (tag === "select") {
    const selected = Array.from((element as HTMLSelectElement).options)
      .filter((option) => option.selected)
      .map((option) => cleanSpeechText(option.textContent || ""))
      .filter(Boolean);
    if (selected.length > 0) parts.push(`${labels.currentValue}: ${selected.join(", ")}`);
  } else if (type !== "password" && type !== "file") {
    const rawValue =
      tag === "textarea"
        ? (element as HTMLTextAreaElement).value
        : (element as HTMLInputElement).value;
    const value = cleanSpeechText(rawValue || "");
    if (value) parts.push(`${labels.currentValue}: ${value}`);
  }

  if (element.hasAttribute("required") || element.getAttribute("aria-required") === "true") {
    parts.push(labels.required);
  }
  if (element.hasAttribute("readonly") || element.getAttribute("aria-readonly") === "true") {
    parts.push(labels.readOnly);
  }
  if (
    element.hasAttribute("disabled") ||
    element.getAttribute("aria-disabled") === "true"
  ) {
    parts.push(labels.disabled);
  }

  const description = descriptionText(element);
  if (description) parts.push(`${labels.instructions}: ${description}`);

  return parts.join(", ");
}

function extractListItem(element: Element, labels: SpeechLabels): string {
  const list = containingList(element);
  const items = list ? directListItems(list) : [];
  const index = items.indexOf(element) + 1;
  const text = getAccessibleName(element) || collectVisibleText(element, { skipNestedLists: true });
  if (!text) return "";
  if (index > 0 && items.length > 0) {
    return `${labels.listItem(index, items.length)}: ${text}`;
  }
  return `${labels.list}: ${text}`;
}

function columnHeaderFor(cell: Element): string {
  const row = composedParent(cell);
  const table = closestComposed(cell, "table");
  if (!table || !row) return "";
  const cellIndex = (cell as HTMLTableCellElement).cellIndex;
  if (typeof cellIndex !== "number" || cellIndex < 0) return "";

  const headerRows = Array.from(table.querySelectorAll("thead tr, tr"));
  for (const headerRow of headerRows) {
    const candidate = (headerRow as HTMLTableRowElement).cells[cellIndex];
    if (candidate && candidate !== cell && tagName(candidate) === "th") {
      return getAccessibleName(candidate);
    }
  }
  return "";
}

function rowHeaderFor(cell: Element): string {
  const row = composedParent(cell);
  if (!row) return "";
  const headers = Array.from(row.children).filter(
    (child) =>
      tagName(child) === "th" &&
      (child.getAttribute("scope") === "row" || roleOf(child) === "rowheader")
  );
  return headers.length > 0 ? getAccessibleName(headers[0]) : "";
}

function extractTableCell(element: Element, labels: SpeechLabels): string {
  const text = getAccessibleName(element);
  if (!text) return "";
  const parts = [`${labels.tableCell}: ${text}`];
  const columnHeader = columnHeaderFor(element);
  if (columnHeader) parts.push(`${labels.columnHeader}: ${columnHeader}`);
  const rowHeader = rowHeaderFor(element);
  if (rowHeader) parts.push(`${labels.rowHeader}: ${rowHeader}`);
  return parts.join(", ");
}

function extractRegion(element: Element, labels: SpeechLabels): string {
  const text = collectVisibleText(element);
  if (!text) return "";
  const label = cleanSpeechText(element.getAttribute("data-read-aloud-label") || "");
  if (label) return `${label}: ${text}`;
  if (element.getAttribute("data-read-aloud") === "card") return `${labels.card}: ${text}`;
  return text;
}

/** Returns a spoken representation for a known readable element, or null. */
export function extractReadableContent(element: Element): ReadableContent | null {
  if (!element || element.nodeType !== ELEMENT_NODE) return null;
  if (isIgnoredElement(element)) return null;

  const classification = classifyElement(element);
  if (!classification) return null;

  const languageSample =
    cleanSpeechText(element.textContent || "") || getAccessibleName(element);
  const language = resolveContentLanguage(element, languageSample);
  const labels = getSpeechLabels(language);
  let text = "";
  let maxLength = MAX_PARAGRAPH_LENGTH;

  switch (classification.kind) {
    case "heading": {
      const name = getAccessibleName(element);
      if (!name) return null;
      text = `${labels.heading(headingLevel(element))}: ${name}`;
      maxLength = MAX_HEADING_LENGTH;
      break;
    }
    case "paragraph":
      text = getAccessibleName(element);
      break;
    case "list": {
      const count = directListItems(element).length;
      if (count === 0) return null;
      const listName = cleanSpeechText(element.getAttribute("aria-label") || "");
      text = `${labels.list}${listName ? `: ${listName}` : ""}, ${labels.listItems(count)}`;
      break;
    }
    case "listitem":
      text = extractListItem(element, labels);
      maxLength = MAX_LIST_ITEM_LENGTH;
      break;
    case "button":
      text = extractButton(element, labels);
      break;
    case "link":
      text = extractLink(element, labels);
      break;
    case "image":
      text = extractImage(element, labels);
      break;
    case "form-field":
      text = extractFormField(element, labels, classification.inputType || "text");
      maxLength = MAX_FORM_FIELD_LENGTH;
      break;
    case "form-label":
      text = getAccessibleName(element);
      break;
    case "table-header": {
      const name = getAccessibleName(element);
      if (!name) return null;
      const isRow =
        element.getAttribute("scope") === "row" || roleOf(element) === "rowheader";
      text = `${isRow ? labels.rowHeader : labels.columnHeader}: ${name}`;
      maxLength = MAX_TABLE_CELL_LENGTH;
      break;
    }
    case "table-cell":
      text = extractTableCell(element, labels);
      maxLength = MAX_TABLE_CELL_LENGTH;
      break;
    case "table-caption": {
      const name = getAccessibleName(element);
      if (!name) return null;
      text = `${labels.tableCaption}: ${name}`;
      break;
    }
    case "region":
      text = extractRegion(element, labels);
      maxLength = MAX_REGION_LENGTH;
      break;
    case "quote": {
      const name = getAccessibleName(element);
      if (!name) return null;
      text = `${labels.quote}: ${name}`;
      break;
    }
    case "caption": {
      const name = getAccessibleName(element);
      if (!name) return null;
      text = `${labels.caption}: ${name}`;
      break;
    }
    case "summary": {
      const name = getAccessibleName(element);
      if (!name) return null;
      text = `${labels.summary}: ${name}`;
      break;
    }
    case "term": {
      const name = getAccessibleName(element);
      if (!name) return null;
      text = `${labels.term}: ${name}`;
      break;
    }
    case "definition": {
      const name = getAccessibleName(element);
      if (!name) return null;
      text = `${labels.definition}: ${name}`;
      break;
    }
    default:
      return null;
  }

  const cleaned = truncateSpeech(cleanSpeechText(text), maxLength);
  if (!hasMeaningfulText(cleaned)) return null;

  return {
    element: element as HTMLElement,
    kind: classification.kind,
    text: cleaned,
    language,
    key: `${classification.kind}:${language}:${cleaned}`,
  };
}

/**
 * Walks from the deepest event target outwards. The nearest meaningful element
 * wins, so a link inside a paragraph is read as a link and a paragraph inside a
 * card is read as a paragraph.
 */
export function resolveReadableTarget(start: Node | null): ReadableContent | null {
  if (!start) return null;
  let element: Element | null =
    start.nodeType === ELEMENT_NODE ? (start as Element) : start.parentElement;

  if (element && closestComposed(element, IGNORE_SELECTOR)) return null;

  while (element) {
    if (closestComposed(element, IGNORE_SELECTOR)) return null;
    const content = extractReadableContent(element);
    if (content) return content;
    element = composedParent(element);
  }
  return null;
}

/**
 * A short English word inside an Amharic paragraph should not flip the voice,
 * so only treat text as Amharic when most of its letters are Ethiopic.
 */
function isPredominantlyEthiopic(text: string): boolean {
  const letters = text.match(/\p{L}/gu);
  if (!letters || letters.length === 0) return false;
  let ethiopic = 0;
  for (const letter of letters) {
    if (ETHIOPIC_CHAR.test(letter)) ethiopic += 1;
  }
  return ethiopic / letters.length >= 0.5;
}

/**
 * Prefers an explicit language, but lets a clearly Ethiopic string override an
 * inherited non-Amharic lang (for example, Amharic content inside an English
 * `<main>`). The document language is deliberately last so Amharic text in an
 * otherwise English page still gets an Amharic voice.
 */
export function resolveContentLanguage(element: Element, text = ""): string {
  let node: Element | null = element;
  const documentElement = element.ownerDocument?.documentElement;
  let nearestLanguage = "";
  while (node) {
    if (node !== documentElement) {
      const lang = node.getAttribute("lang");
      if (lang && lang.trim()) {
        nearestLanguage = lang.trim();
        break;
      }
    }
    node = composedParent(node);
  }

  const ethiopic = hasEthiopicScript(text) && isPredominantlyEthiopic(text);
  if (ethiopic && baseLanguage(nearestLanguage) !== "am") return "am";
  if (nearestLanguage) return nearestLanguage;
  if (hasEthiopicScript(text)) return "am";
  const documentLanguage = documentElement?.getAttribute("lang") || "";
  return documentLanguage.trim() || "en";
}
