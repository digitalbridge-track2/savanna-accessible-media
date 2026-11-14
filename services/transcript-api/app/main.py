from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
import json

app = FastAPI(
    title="Abugida Accessible Media API",
    version="1.0.0",
    description="Level 2 REST API & Webhooks for Abugida Media Kit (Track 2: Accessible Learning Media)",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory webhook subscriptions and transcript cache
WEBHOOKS: List[Dict[str, str]] = []
DYNAMIC_TRANSCRIPTS: Dict[str, Dict[str, List["TranscriptSegment"]]] = {}

def parse_vtt_cues(vtt_text: str, default_speaker: str = "Instructor") -> List["TranscriptSegment"]:
    lines = vtt_text.strip().splitlines()
    segments = []
    current_start = 0
    current_end = 0
    current_text = []
    seg_id = 1

    def parse_ms(ts: str) -> int:
        parts = ts.strip().split(":")
        if len(parts) == 3:
            h, m, s = parts
            return int((float(h) * 3600 + float(m) * 60 + float(s)) * 1000)
        elif len(parts) == 2:
            m, s = parts
            return int((float(m) * 60 + float(s)) * 1000)
        return int(float(ts) * 1000)

    for line in lines:
        line_clean = line.strip()
        if "-->" in line_clean:
            if current_text:
                full_txt = "\n".join(current_text)
                segments.append(TranscriptSegment(
                    id=seg_id,
                    start_ms=current_start,
                    end_ms=current_end,
                    draft_text=full_txt,
                    reviewed_text=full_txt,
                    speaker=default_speaker,
                    review_status="reviewed"
                ))
                seg_id += 1
                current_text = []
            parts = line_clean.split("-->")
            start_str = parts[0].strip().split()[0]
            end_str = parts[1].strip().split()[0]
            current_start = parse_ms(start_str)
            current_end = parse_ms(end_str)
        elif line_clean and not line_clean.startswith("WEBVTT") and not line_clean.startswith("NOTE") and not line_clean.isdigit():
            current_text.append(line_clean)

    if current_text:
        full_txt = "\n".join(current_text)
        segments.append(TranscriptSegment(
            id=seg_id,
            start_ms=current_start,
            end_ms=current_end,
            draft_text=full_txt,
            reviewed_text=full_txt,
            speaker=default_speaker,
            review_status="reviewed"
        ))
    return segments

# --- Data Models ---
class HealthResponse(BaseModel):
    status: str
    version: str
    asr_adapter: str

class TrackItem(BaseModel):
    id: str
    kind: str
    src: str
    language: Optional[str] = None
    label: Optional[str] = None
    mimeType: Optional[str] = None

class LessonMetadataResponse(BaseModel):
    id: str
    title: Dict[str, str]
    sources: List[TrackItem]
    captionTracks: List[TrackItem]
    transcriptUrl: str
    audioDescriptionUrl: Optional[str] = None

class TranscriptSegment(BaseModel):
    id: int
    start_ms: int
    end_ms: int
    draft_text: str
    reviewed_text: Optional[str] = None
    speaker: Optional[str] = None
    review_status: str = "reviewed"

class TranscriptResponse(BaseModel):
    lessonId: str
    language: str
    segments: List[TranscriptSegment]

class OfflinePackResponse(BaseModel):
    lessonId: str
    packageId: str
    totalSizeMB: float
    downloadUrl: str
    cachedAssets: List[str]

class CaptionUploadRequest(BaseModel):
    language: str
    vttContent: str
    author: Optional[str] = "Demonstration Reviewer"

class CaptionUploadResponse(BaseModel):
    status: str
    lessonId: str
    language: str
    cuesCount: int
    message: str

class WebhookSubscribeRequest(BaseModel):
    targetUrl: str
    eventType: str = "lesson.completed"

class WebhookResponse(BaseModel):
    status: str
    subscriptionId: str
    targetUrl: str
    eventType: str

# --- Endpoints ---

@app.get("/health", response_model=HealthResponse, tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "asr_adapter": "local-fallback"
    }

@app.get("/api/v1/lessons/{lesson_id}", response_model=LessonMetadataResponse, tags=["Lessons"])
def get_lesson(lesson_id: str):
    if lesson_id not in ["digital-workplace-01", "default", "lesson-01"]:
        # Return fallback lesson for mock demonstration
        pass
    return {
        "id": lesson_id,
        "title": {
            "en": "Digital Workplace Skills: Foundations",
            "am": "የዲጂታል የሥራ ቦታ ክህሎቶች፡ መሠረታዊ"
        },
        "sources": [
            {
                "id": "src-main",
                "kind": "main",
                "src": "/lessons/digital-workplace/media/lesson-video.mp4",
                "mimeType": "video/mp4",
                "label": "Main Lesson Video"
            },
            {
                "id": "src-sign",
                "kind": "sign",
                "src": "/lessons/digital-workplace/media/sign-video.mp4",
                "mimeType": "video/mp4",
                "label": "Ethiopian Sign Language (EthSL)"
            }
        ],
        "captionTracks": [
            {
                "id": "cap-en",
                "kind": "captions",
                "src": "/lessons/digital-workplace/captions.en.vtt",
                "language": "en",
                "label": "English (Reviewed)"
            },
            {
                "id": "cap-am",
                "kind": "captions",
                "src": "/lessons/digital-workplace/captions.am.vtt",
                "language": "am",
                "label": "አማርኛ (የተገመገመ)"
            }
        ],
        "transcriptUrl": f"/api/v1/lessons/{lesson_id}/transcript?lang=en",
        "audioDescriptionUrl": "/lessons/digital-workplace/media/lesson-audio.opus"
    }

@app.get("/api/v1/lessons/{lesson_id}/transcript", response_model=TranscriptResponse, tags=["Lessons"])
def get_transcript(lesson_id: str, lang: str = "en"):
    # Return dynamically cached/updated transcript if available
    cached = DYNAMIC_TRANSCRIPTS.get(lesson_id, {}).get(lang)
    if cached:
        return {
            "lessonId": lesson_id,
            "language": lang,
            "segments": cached
        }

    if lang == "am":
        segments = [
            TranscriptSegment(id=1, start_ms=0, end_ms=4500, draft_text="እንኳን ወደዚህ የሥልጠና ፕሮግራም በደህና መጡ", reviewed_text="እንኳን ወደ ዲጂታል የሥራ ቦታ ክህሎቶች መሠረታዊ ትምህርት በደህና መጡ።", speaker="አስተማሪ"),
            TranscriptSegment(id=2, start_ms=4500, end_ms=9000, draft_text="ዛሬ ስለ ዲጂታል የሥራ ቦታ ክህሎቶች እንማራለን", reviewed_text="በዚህ ትምህርት የርቀት የሥራ ግንኙነትን እና ተደራሽ የሰነድ አዘገጃጀትን እንመለከታለን።", speaker="አስተማሪ")
        ]
    else:
        segments = [
            TranscriptSegment(id=1, start_ms=0, end_ms=4500, draft_text="Welcome to Digital Workplace Skills: Foundations.", reviewed_text="Welcome to Digital Workplace Skills: Foundations.", speaker="Instructor"),
            TranscriptSegment(id=2, start_ms=4500, end_ms=9000, draft_text="In this module, we explore core accessibility standards and digital collaboration.", reviewed_text="In this module, we explore core accessibility standards and digital collaboration.", speaker="Instructor")
        ]
    return {
        "lessonId": lesson_id,
        "language": lang,
        "segments": segments
    }

@app.get("/api/v1/lessons/{lesson_id}/offline-pack", response_model=OfflinePackResponse, tags=["Offline"])
def get_offline_pack(lesson_id: str):
    return {
        "lessonId": lesson_id,
        "packageId": "pkg-3g-light",
        "totalSizeMB": 3.2,
        "downloadUrl": f"/lessons/{lesson_id}/offline-bundle.zip",
        "cachedAssets": [
            "/lessons/digital-workplace/lesson.json",
            "/lessons/digital-workplace/captions.en.vtt",
            "/lessons/digital-workplace/captions.am.vtt",
            "/lessons/digital-workplace/transcript.en.json",
            "/lessons/digital-workplace/documents/lesson.en.html",
            "/jobs/jobs.json",
            "/lessons/digital-workplace/media/lesson-audio.opus",
            "/lessons/digital-workplace/media/poster.webp"
        ]
    }

@app.post("/api/v1/lessons/{lesson_id}/captions", response_model=CaptionUploadResponse, status_code=status.HTTP_201_CREATED, tags=["Captions"])
def upload_captions(lesson_id: str, payload: CaptionUploadRequest):
    cues_count = payload.vttContent.count("-->")
    if cues_count == 0 and "WEBVTT" not in payload.vttContent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid WebVTT format. Must contain WEBVTT header and cue timestamps."
        )

    # Parse and store in memory
    parsed = parse_vtt_cues(payload.vttContent, default_speaker=payload.author or "Instructor")
    if lesson_id not in DYNAMIC_TRANSCRIPTS:
        DYNAMIC_TRANSCRIPTS[lesson_id] = {}
    DYNAMIC_TRANSCRIPTS[lesson_id][payload.language] = parsed

    # Save to disk locations for live demo serving
    import pathlib
    target_paths = [
        pathlib.Path(f"apps/demo/public/lessons/digital-workplace/captions.{payload.language}.vtt"),
        pathlib.Path(f"apps/demo/dist/lessons/digital-workplace/captions.{payload.language}.vtt"),
        pathlib.Path(f"savanna/lessons/digital-workplace/captions.{payload.language}.vtt"),
    ]
    for p in target_paths:
        try:
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(payload.vttContent, encoding="utf-8")
        except Exception:
            pass

    return {
        "status": "success",
        "lessonId": lesson_id,
        "language": payload.language,
        "cuesCount": max(len(parsed), cues_count),
        "message": f"Caption track for {payload.language} successfully saved and published."
    }

@app.post("/api/v1/webhooks/subscribe", response_model=WebhookResponse, status_code=status.HTTP_201_CREATED, tags=["Webhooks"])
def subscribe_webhook(payload: WebhookSubscribeRequest):
    sub_id = f"sub-{len(WEBHOOKS) + 1}"
    WEBHOOKS.append({"id": sub_id, "url": payload.targetUrl, "eventType": payload.eventType})
    return {
        "status": "subscribed",
        "subscriptionId": sub_id,
        "targetUrl": payload.targetUrl,
        "eventType": payload.eventType
    }
