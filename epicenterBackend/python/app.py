import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from detect import run_detection
from text_classify import run_classification

app = FastAPI(
    title="Epicenter AI Service",
    description="YOLOv8 (general + custom disaster model) + DistilBERT for the Epicenter disaster verification backend",
    version="1.0.0",
)


class DetectRequest(BaseModel):
    imageUrl: str


class DetectResponse(BaseModel):
    detectedClass: str | None
    confidence: float | None
    severity: str | None


class ClassifyTextRequest(BaseModel):
    description: str | None = None
    incidentType: str | None = None


class ClassifyTextResponse(BaseModel):
    predictedType: str | None
    confidence: float | None
    severity: str | None
    source: str | None = None
    aiConfidence: float | None = None
    citizenConfidence: float | None = None
    aiRan: bool | None = None


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/detect", response_model=DetectResponse)
async def detect_from_url(payload: DetectRequest):
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(payload.imageUrl)
            response.raise_for_status()
            image_bytes = response.content
    except httpx.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch image: {e}")

    try:
        result = run_detection(image_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {e}")

    return result


@app.post("/classify-text", response_model=ClassifyTextResponse)
async def classify_text(payload: ClassifyTextRequest):
    try:
        result = run_classification(payload.description, citizen_incident_type=payload.incidentType)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text classification failed: {e}")

    return result