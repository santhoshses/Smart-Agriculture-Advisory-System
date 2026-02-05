import io
import json
import os
from pathlib import Path

import torch
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForImageClassification
from transformers.image_utils import ChannelDimension

APP_DIR = Path(__file__).resolve().parent
MODEL_DIR = (APP_DIR / "models" / "rice_model").resolve()
REMEDY_MAP_PATH = (APP_DIR / "remedy_map.json").resolve()

# Confidence threshold (fallback to Unknown)
CONF_THRESHOLD = float(os.getenv("CONF_THRESHOLD", "0.55"))

app = FastAPI(title="ML Inference Service (Rice Model)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"] ,
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": "rice_leaf_disease",
        "modelPath": str(MODEL_DIR),
        "confThreshold": CONF_THRESHOLD,
    }


def _load_remedy_map() -> dict:
    if not REMEDY_MAP_PATH.exists():
        # Keep service functional even if map is missing
        return {"unknown": "rice_unknown_basic"}
    with REMEDY_MAP_PATH.open("r", encoding="utf-8") as f:
        data = json.load(f)
    # Ensure fallback exists
    if "unknown" not in data:
        data["unknown"] = "rice_unknown_basic"
    return data


def _load_model_and_processor():
    if not MODEL_DIR.exists():
        raise FileNotFoundError(
            f"Rice model folder not found at {MODEL_DIR}. Run: ml-service/scripts/download_rice_model.ps1"
        )

    processor = AutoImageProcessor.from_pretrained(str(MODEL_DIR), local_files_only=True)
    model = AutoModelForImageClassification.from_pretrained(str(MODEL_DIR), local_files_only=True)
    model.eval()
    return model, processor


def _normalize_label_key(label: str) -> str:
    norm = str(label).strip().lower()
    norm = norm.replace(" ", "").replace("_", "")
    return norm


# Load once at startup (global cache)
try:
    MODEL, PROCESSOR = _load_model_and_processor()
except Exception:
    MODEL, PROCESSOR = None, None

REMEDY_MAP = _load_remedy_map()


@app.post("/predict-disease")
async def predict_disease(image: UploadFile = File(...)):
    # Keep contract EXACT:
    # { crop, disease, confidence, remedyKey }
    if MODEL is None or PROCESSOR is None:
        return JSONResponse(
            status_code=500,
            content={
                "error": "MODEL_LOAD_FAILED",
                "hint": "Ensure ml-service/models/rice_model exists. Run download_rice_model.ps1.",
            },
        )

    raw = await image.read()
    try:
        pil = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception:
        return JSONResponse(
            status_code=400,
            content={
                "error": "INVALID_IMAGE",
                "message": "Please upload a clear leaf image (jpg/png) and try again.",
            },
        )

    # Demo safety: prevent rare transformer processor failures on extremely small images.
    # (Real camera images are much larger, so this does not affect normal usage.)
    if pil.width < 32 or pil.height < 32:
        pil = pil.resize((224, 224))

    # Avoid channel-dimension ambiguity for some images (e.g., very small images)
    inputs = PROCESSOR(
        images=pil,
        return_tensors="pt",
        input_data_format=ChannelDimension.LAST,
    )

    with torch.no_grad():
        outputs = MODEL(**inputs)
        logits = outputs.logits
        probs = torch.softmax(logits, dim=-1)[0]
        conf, idx = torch.max(probs, dim=-1)

    confidence = float(conf.item())
    label = MODEL.config.id2label.get(int(idx.item()), "Unknown")
    norm_key = _normalize_label_key(label)

    # Confidence fallback
    if confidence < CONF_THRESHOLD:
        label = "Unknown"
        norm_key = "unknown"

    remedy_key = REMEDY_MAP.get(norm_key) or REMEDY_MAP.get("unknown") or "rice_unknown_basic"

    return {
        "crop": "rice",
        "disease": "Unknown" if label == "Unknown" else str(label),
        "confidence": confidence,
        "remedyKey": remedy_key,
    }
