import { LessonManifest } from "./types.js";

export function validateLessonManifest(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof data !== "object" || data === null) {
    return { valid: false, errors: ["Manifest must be an object"] };
  }

  const manifest = data as Partial<LessonManifest>;

  if (manifest.schemaVersion !== "1.0.0") {
    errors.push("Invalid schemaVersion: expected '1.0.0'");
  }

  if (!manifest.id || typeof manifest.id !== "string") {
    errors.push("Missing or invalid field: 'id'");
  }

  if (!manifest.title || typeof manifest.title.en !== "string" || typeof manifest.title.am !== "string") {
    errors.push("Field 'title' must include localized strings for 'en' and 'am'");
  }

  if (!manifest.description || typeof manifest.description.en !== "string" || typeof manifest.description.am !== "string") {
    errors.push("Field 'description' must include localized strings for 'en' and 'am'");
  }

  if (!Array.isArray(manifest.sources) || manifest.sources.length === 0) {
    errors.push("Field 'sources' must be a non-empty array");
  } else {
    for (const [idx, s] of manifest.sources.entries()) {
      if (!s.id || !s.kind || !s.src || !s.type) {
        errors.push(`Source at index ${idx} is missing required fields (id, kind, src, type)`);
      }
    }
  }

  if (!Array.isArray(manifest.captionTracks) || manifest.captionTracks.length === 0) {
    errors.push("Field 'captionTracks' must contain at least one track");
  }

  if (!Array.isArray(manifest.documents) || manifest.documents.length === 0) {
    errors.push("Field 'documents' must contain at least one accessible document");
  }

  if (!Array.isArray(manifest.packages) || manifest.packages.length === 0) {
    errors.push("Field 'packages' must include at least the light offline package");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
