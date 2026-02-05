# Disease Detection (Rice) — End-to-End (Current Implementation)

This document explains the **Rice-only** disease detection pipeline as implemented in this repository.

The goal is demo stability + safety:
- Use a **pre-trained image classifier** (no training in this project)
- Work with locally stored model files
- Return **Unknown** when the model is not confident
- Keep remedy text **generic** and encourage local expert guidance

---

## 1) Overview (Rice-only scope)
This project uses a Rice leaf disease model downloaded from Hugging Face:
- Repo ID: `prithivMLmods/Rice-Leaf-Disease`
- Local path (gitignored): `ml-service/models/rice_model/`

Supported classes (from `config.json` `id2label`):
1. Bacterialblight
2. Blast
3. Brownspot
4. Healthy
5. Tungro

Why Rice-only?
- The overall app is Punjab-focused, and Rice is a key crop in Kharif.
- Keeping scope small makes the demo and viva explanation easier.

---

## 2) End-to-end flow

### A) Frontend (`/disease` page)
1) User selects a leaf image.
2) Frontend sends a multipart upload:
   - `POST {VITE_API_BASE_URL}/disease/predict`
   - Form field: `image`

Source file:
- `frontend/src/pages/DiseaseDetectionPage.jsx`

### B) Backend API (`/disease/predict`)
1) Backend receives the image using Multer memory storage.
2) Backend forwards the same image to the ML service:
   - `POST {ML_BASE_URL}/predict-disease`
3) Backend receives ML JSON `{ crop, disease, confidence, remedyKey }`.
4) Backend enriches it with bilingual remedy text:
   - `recommendation = getRemedy(remedyKey)`

Source files:
- `backend/src/routes/diseaseRoutes.js`
- `backend/src/services/diseaseRemedyService.js`

### C) ML service (`/predict-disease`)
1) Receives multipart file field `image`.
2) Decodes image using Pillow (RGB) and preprocesses using Transformers `AutoImageProcessor`.
3) Runs CPU inference using `AutoModelForImageClassification`.
4) Softmax → top-1 label + confidence.
5) Applies confidence threshold (`CONF_THRESHOLD`, default `0.55`):
   - If low confidence: return `disease="Unknown"` and `remedyKey="rice_unknown_basic"`

Source file:
- `ml-service/app.py`

---

## 3) Request/response examples

### 3.1 ML service request
`POST http://localhost:8001/predict-disease`

Payload:
- `multipart/form-data`
- field: `image` (jpg/png)

### 3.2 ML service response (contract)
The ML service response is always exactly:
```json
{
  "crop": "rice",
  "disease": "Blast",
  "confidence": 0.91,
  "remedyKey": "rice_blast_basic"
}
```

Low-confidence fallback:
```json
{
  "crop": "rice",
  "disease": "Unknown",
  "confidence": 0.40,
  "remedyKey": "rice_unknown_basic"
}
```

### 3.3 Backend enriched response (what UI sees)
Backend returns ML fields + `recommendation`:
```json
{
  "crop": "rice",
  "disease": "Blast",
  "confidence": 0.91,
  "remedyKey": "rice_blast_basic",
  "recommendation": {
    "en": {
      "diseaseName": "Blast (Rice)",
      "treatment": "...",
      "prevention": "...",
      "whenToContactExpert": "...",
      "safety": "..."
    },
    "pa": {
      "diseaseName": "ਬਲਾਸਟ (ਚੌਲ)",
      "treatment": "...",
      "prevention": "...",
      "whenToContactExpert": "...",
      "safety": "..."
    }
  }
}
```

---

## 4) How to run locally

### 4.1 Download the model (one-time)
```powershell
cd ml-service\scripts
./download_rice_model.ps1
```

### 4.2 Run ML service
```powershell
cd ml-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app:app --host localhost --port 8001
```

Optional threshold:
```powershell
$env:CONF_THRESHOLD="0.55"
```

### 4.3 Run backend
```powershell
cd backend
npm install
npm run dev
```

### 4.4 Run frontend
```powershell
cd frontend
npm install
npm run dev
```

---

## 5) Troubleshooting

### INVALID_IMAGE (400)
Meaning:
- Uploaded file is not a valid/decodable image.

Fix:
- Upload a clear leaf image (jpg/png) and try again.

### MODEL_LOAD_FAILED (500)
Meaning:
- Model files are not available locally.

Fix:
- Ensure `ml-service/models/rice_model/` exists.
- Run `ml-service/scripts/download_rice_model.ps1`.

### Low confidence → Unknown
Meaning:
- Model is not confident or image quality is poor.

Fix:
- Retake a close-up photo in good light.
- If symptoms are severe, contact agriculture officer/KVK.

---

## 6) Supported classes + remedy mapping

The ML service uses label normalization for stable mapping:

Normalization:
- lowercase
- remove spaces
- remove underscores

Mapping file:
- `ml-service/remedy_map.json`

| Model label (disease) | Normalized key | remedyKey (backend lookup) |
|---|---|---|
| Bacterialblight | bacterialblight | rice_bacterial_blight_basic |
| Blast | blast | rice_blast_basic |
| Brownspot | brownspot | rice_brown_spot_basic |
| Healthy | healthy | rice_healthy_basic |
| Tungro | tungro | rice_tungro_basic |
| Unknown (fallback) | unknown | rice_unknown_basic |

---

## Safety note (demo)
The remedy texts are **generic guidance** for demo/viva.
They are **not official prescriptions**.
For final decisions, consult local agricultural experts.

