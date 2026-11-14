from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(
    title="Abugida Transcript API",
    version="1.0.0",
    description="Local transcription, review, and WebVTT export service for Abugida Media Kit"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str
    version: str
    asr_adapter: str

class TranscriptSegment(BaseModel):
    id: int
    start_ms: int
    end_ms: int
    draft_text: str
    reviewed_text: Optional[str] = None
    speaker: Optional[str] = None
    review_status: str = "draft"

class TranscriptionJob(BaseModel):
    id: str
    status: str
    language_hint: Optional[str] = None
    segments: List[TranscriptSegment] = []

@app.get("/health", response_model=HealthResponse)
def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "asr_adapter": "local-fallback"
    }

@app.get("/v1/transcription-jobs/{job_id}", response_model=TranscriptionJob)
def get_job(job_id: str):
    return {
        "id": job_id,
        "status": "ready_for_review",
        "language_hint": "am",
        "segments": [
            {
                "id": 1,
                "start_ms": 0,
                "end_ms": 4000,
                "draft_text": "እንኳን ወደዚህ የሥልጠና ፕሮግራም በደህና መጡ",
                "reviewed_text": "እንኳን ወደዚህ የሥልጠና ፕሮግራም በደህና መጡ",
                "speaker": "Instructor",
                "review_status": "reviewed"
            },
            {
                "id": 2,
                "start_ms": 4000,
                "end_ms": 8000,
                "draft_text": "ዛሬ ስለ ዲጂታል የሥራ ቦታ ክህሎቶች እንማራለን",
                "reviewed_text": None,
                "speaker": "Instructor",
                "review_status": "draft"
            }
        ]
    }
