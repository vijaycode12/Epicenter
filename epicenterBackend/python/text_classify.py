from transformers import pipeline

from utils import INCIDENT_TYPES, get_severity

MODEL_NAME = "typeform/distilbert-base-uncased-mnli"
MIN_CONFIDENCE = 0.35
CITIZEN_SELECTION_CONFIDENCE = 0.5

# Same lazy-loading reasoning as detect.py - the zero-shot pipeline
# takes real time to initialize, so it's deferred until first use
# rather than blocking the server from starting.
_classifier = None


def _get_classifier():
    global _classifier
    if _classifier is None:
        _classifier = pipeline("zero-shot-classification", model=MODEL_NAME)
    return _classifier


def run_classification(description, citizen_incident_type=None):
    has_description = bool(description and description.strip())
    has_citizen_type = bool(citizen_incident_type and citizen_incident_type.strip())

    if not has_description:
        if not has_citizen_type:
            raise ValueError("description must not be empty when no incident type is provided")
        return {
            "predictedType": citizen_incident_type,
            "confidence": CITIZEN_SELECTION_CONFIDENCE,
            "severity": get_severity(citizen_incident_type),
            "source": "citizen",
            "aiConfidence": None,
            "citizenConfidence": CITIZEN_SELECTION_CONFIDENCE,
            "aiRan": False,
        }

    result = _get_classifier()(description, candidate_labels=INCIDENT_TYPES)
    ai_label = result["labels"][0]
    ai_score = float(result["scores"][0])

    if not has_citizen_type:
        if ai_score < MIN_CONFIDENCE:
            return {"predictedType": None, "confidence": round(ai_score, 4), "severity": None, "source": "ai", "aiConfidence": round(ai_score, 4), "citizenConfidence": None, "aiRan": True}
        return {"predictedType": ai_label, "confidence": round(ai_score, 4), "severity": get_severity(ai_label), "source": "ai", "aiConfidence": round(ai_score, 4), "citizenConfidence": None, "aiRan": True}

    if ai_score >= CITIZEN_SELECTION_CONFIDENCE:
        return {"predictedType": ai_label, "confidence": round(ai_score, 4), "severity": get_severity(ai_label), "source": "ai", "aiConfidence": round(ai_score, 4), "citizenConfidence": CITIZEN_SELECTION_CONFIDENCE, "aiRan": True}

    return {"predictedType": citizen_incident_type, "confidence": CITIZEN_SELECTION_CONFIDENCE, "severity": get_severity(citizen_incident_type), "source": "citizen", "aiConfidence": round(ai_score, 4), "citizenConfidence": CITIZEN_SELECTION_CONFIDENCE, "aiRan": True}