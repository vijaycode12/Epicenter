INCIDENT_TYPES = [
    "Building Collapse",
    "People Trapped or Injured",
    "Fire",
    "Gas or Chemical Leak",
    "Road or Bridge Damage",
    "Flooding",
    "Electrical Hazard",
    "Fallen Tree or Pole",
]

SEVERITY_MAP = {
    "building_collapse": "Critical",
    "people_trapped_or_injured": "Critical",
    "fire": "High",
    "gas_or_chemical_leak": "Critical",
    "road_or_bridge_damage": "Medium",
    "flooding": "Medium",
    "electrical_hazard": "High",
    "fallen_tree_or_pole": "Low",
}

COCO_TO_INCIDENT_TYPE = {
    "fire hydrant": "Fire",
    "truck": "Road or Bridge Damage",
}

#It maps to incident type from roboflow names
DISASTER_MODEL_TO_INCIDENT_TYPE = {
    "building-collapse": "Building Collapse",
    "people-trapped": "People Trapped or Injured",
    "fire": "Fire",
    "smoke": "Fire",     
    "gas-leak": "Gas or Chemical Leak",
    "road-damage": "Road or Bridge Damage",
    "flooding": "Flooding",
    "electrical": "Electrical Hazard",
    "fallen-tree": "Fallen Tree or Pole",
}

DEFAULT_SEVERITY = "Medium"


def _normalize_key(label):
    return label.lower().strip().replace(" ", "_")


def get_severity(label):
    if not label:
        return None
    return SEVERITY_MAP.get(_normalize_key(label))


def map_coco_class_to_incident_type(coco_class):
    if not coco_class:
        return None
    return COCO_TO_INCIDENT_TYPE.get(coco_class.lower().strip())


def map_disaster_class_to_incident_type(disaster_class):
    if not disaster_class:
        return None
    return DISASTER_MODEL_TO_INCIDENT_TYPE.get(disaster_class.lower().strip())


def format_detection_result(raw_class, confidence, source="coco"):
    if raw_class is None:
        return {"detectedClass": None, "confidence": None, "severity": None}

    if source == "disaster":
        mapped_type = map_disaster_class_to_incident_type(raw_class)
    else:
        mapped_type = map_coco_class_to_incident_type(raw_class)

    detected_label = mapped_type if mapped_type else raw_class
    severity = get_severity(mapped_type) if mapped_type else None

    return {
        "detectedClass": detected_label,
        "confidence": round(float(confidence), 4) if confidence is not None else None,
        "severity": severity,
    }