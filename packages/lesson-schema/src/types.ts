export interface LocalizedString {
  en: string;
  am: string;
  om?: string;
  ti?: string;
  so?: string;
  [key: string]: string | undefined;
}

export type MediaSourceKind = "main" | "described" | "sign" | "audio-only";

export interface MediaSource {
  id: string;
  kind: MediaSourceKind;
  src: string;
  type: string;
  sizeBytes?: number;
  describes?: string;
  quality?: string;
  label?: string;
}

export interface CaptionTrack {
  id: string;
  language: "en" | "am" | string;
  src: string;
  label: string;
  status: "draft" | "reviewed";
}

export interface TranscriptReference {
  src: string;
  languages: string[];
}

export interface LessonDocument {
  id: string;
  format: "html" | "pdf" | "brf";
  src: string;
  title: string;
  language: string;
  sizeBytes?: number;
  tagged?: boolean;
}

export interface OfflinePackage {
  id: string;
  name: LocalizedString;
  sizeBytes: number;
  description?: string;
  items: string[];
}

export interface LessonSkill {
  id: string;
  name: LocalizedString;
}

export interface LiveChatMessage {
  id: string;
  timestamp: number;
  timeDisplay: string;
  sender: string;
  role: "instructor" | "student" | "ta";
  message: LocalizedString;
}

export interface LiveSessionData {
  sessionTitle: LocalizedString;
  chatSrc?: string;
  messages?: LiveChatMessage[];
}

export interface LessonManifest {
  schemaVersion: "1.0.0";
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  language: string;
  durationSeconds?: number;
  poster?: {
    src: string;
    alt: LocalizedString;
  };
  sources: MediaSource[];
  captionTracks: CaptionTrack[];
  transcript: TranscriptReference;
  documents: LessonDocument[];
  packages: OfflinePackage[];
  skills?: LessonSkill[];
  relatedJobIds?: string[];
  liveSession?: LiveSessionData;
}

export interface JobAccommodation {
  id: string;
  label: LocalizedString;
  source: string;
  verifiedDate?: string;
}

export interface JobAudioSummary {
  src: string;
  language: "en" | "am";
  type: string;
  durationSeconds: number;
  textEquivalent: LocalizedString | string;
  sizeBytes?: number;
}

export interface AccessibleJob {
  id: string;
  title: LocalizedString;
  employer: string;
  location: LocalizedString;
  workMode: "remote" | "hybrid" | "on-site";
  description: LocalizedString;
  requiredSkills: string[];
  helpfulSkills: string[];
  applicationDeadline?: string;
  applicationUrl: string;
  accommodations: JobAccommodation[];
  audioSummary: JobAudioSummary;
  certificateRef?: string;
  isDemonstrationData: boolean;
}

export interface DemonstrationCertificate {
  id: string;
  title: LocalizedString;
  issuer: string;
  issueDateISO: string;
  issueDateEthiopic?: string;
  canonicalVerificationUrl: string;
  learnerDisplayName: string;
  skills: string[];
  isDemonstrationData: boolean;
}
