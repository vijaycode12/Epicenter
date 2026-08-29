from io import BytesIO
from PIL import Image
from ultralytics import YOLO

from utils import format_detection_result

GENERAL_MODEL_PATH = "yolov8n.pt"
DISASTER_MODEL_PATH = "disaster_custom.pt"

#This is the minimum confidence value beyond this value it consider the YOLO AI
DISASTER_MIN_CONFIDENCE = 0.25


general_model = YOLO(GENERAL_MODEL_PATH)

disaster_model = YOLO(DISASTER_MODEL_PATH)


def run_detection(image_bytes):
    try:
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        raise ValueError(f"Could not decode image: {e}")

    disaster_class, disaster_confidence = _best_prediction(disaster_model, image)

    if disaster_class is not None and disaster_confidence >= DISASTER_MIN_CONFIDENCE:
        return format_detection_result(disaster_class, disaster_confidence, source="disaster")

    general_class, general_confidence = _best_prediction(general_model, image)

    if general_class is None:
        return format_detection_result(None, None)

    return format_detection_result(general_class, general_confidence, source="coco")


def _best_prediction(model, image):
    results = model.predict(image, verbose=False)
    result = results[0]

    if len(result.boxes) == 0:
        return None, None

    best_box = max(result.boxes, key=lambda b: float(b.conf[0]))
    class_id = int(best_box.cls[0])
    confidence = float(best_box.conf[0])
    return model.names[class_id], confidence