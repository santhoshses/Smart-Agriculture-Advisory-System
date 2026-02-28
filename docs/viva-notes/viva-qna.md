# Viva Q&A (Demo + Implementation Aligned)

This file is a **viva-ready Q&A** for the **Smart Agriculture Advisory System** in this repository.

Scope reminder (truthful):
- **Crop recommendation + fertilizer guidance are rule-based** (not ML).
- **Disease detection uses a pre-trained Rice leaf disease model** (FastAPI microservice + local model files).
- **Weather forecast** uses Open-Meteo (internet required).
- **Voice assistant** uses browser Web Speech APIs (SpeechRecognition + SpeechSynthesis) for guided navigation.
- **Chatbot** is rule-based (keyword matching + fixed templates). No AI/LLM.

---

## 1) Architecture

### Q1. What is the overall architecture?
**Answer:**
It is a multi-component system:
- **Frontend:** React (Vite) SPA
- **Backend:** Node.js + Express REST API
- **Database:** MongoDB (Mongoose)
- **ML service:** Python FastAPI for disease inference (Rice model)
- **External API:** Open-Meteo for 7-day weather

Data flow (high level):
React UI → Express API → (MongoDB + Open-Meteo + ML FastAPI) → back to UI.

Ports (defaults):
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- ML service: `http://localhost:8001`

---

### Q2. Why did you split ML into a separate service?
**Answer:**
- Clear separation of concerns: backend handles orchestration + validation + DB; ML service handles preprocessing + inference.
- Independent runtime/dependencies (Python ML stack vs Node API stack).
- Easier to replace/upgrade the model later without touching the backend APIs.
- Matches real-world “ML microservice” integration patterns.

Implementation references:
- ML service: `ml-service/app.py`
- Backend forwarding: `backend/src/routes/diseaseRoutes.js`

---

## 2) Database design + seeding/master-data

### Q3. Why do you need seeding? What is master data here?
**Answer:**
The Profile UI uses dropdowns which depend on master collections:
- Locations (Punjab districts): `locations`
- Seasons: `seasons`
- Soil types: `soiltypes`
- Crops (for previous crop): `crops`

Without seed, dropdowns will be empty and demo login won’t work.

Seed scripts:
- Master seed: `backend/src/scripts/seed.js` → calls:
  - `backend/src/db/seed/locations.seed.js`
  - `backend/src/db/seed/domain.seed.js`
- Demo seed: `backend/src/scripts/seedDemo.js` → calls:
  - `backend/src/db/seed/demo.seed.js`

Commands:
```bash
cd backend
npm run seed
npm run seed:demo
```

---

### Q4. How does the login dropdown get populated?
**Answer:**
- Demo farmers are stored in MongoDB `FarmerAccount`.
- UI calls `GET /farmers/demo` to list names.
- Then UI calls `POST /login { name }` to receive a token.

Implementation references:
- Backend: `backend/src/routes/authRoutes.js`
- UI: `frontend/src/pages/LoginPage.jsx`

---

### Q5. What are the key collections and relationships?
**Answer (short):**
- `FarmerAccount` → exactly one `FarmerProfile` (via `profileId`)
- `FarmerProfile` → many `SoilTest` records
- Master data: `Location`, `Season`, `SoilType`, `Crop`

Why this design:
- Simple “single profile per farmer” demo flow
- Allows history of soil tests

---

## 3) API flow end-to-end

### Q6. Explain the full end-to-end flow from UI to DB and back.
**Answer:**
1) **Login:** UI → `POST /login` → token stored in localStorage
2) **Profile:** UI → `GET/PUT /me/profile` → saves references to master data (location/season/etc.)
3) **Soil test:** UI → `POST /soil-tests` → creates a `SoilTest` document
4) **Crop recommendation:** UI → `GET /recommendations/crop` → backend loads profile + latest soil test (+ weather if available) and returns ranked crops
5) **Fertilizer guidance:** UI → `GET /recommendations/fertilizer` → backend loads latest soil test and returns NPK levels + safe schedule
6) **Weather:** UI → `GET /weather/forecast/by-profile` → backend resolves lat/lon from Location master and calls Open-Meteo
7) **Disease:** UI → `POST /disease/predict` → backend forwards image to ML service and enriches with remedy text
8) **Chatbot:** UI → `POST /chat` → backend returns a template reply (rule-based)

Backend entrypoint:
- `backend/src/server.js` mounts all routes.

---

## 4) Voice assistant flow (STT/TTS + browser limitations)

### Q7. How does the voice assistant work?
**Answer:**
- Runs entirely in the browser using Web Speech APIs:
  - **SpeechRecognition**: voice → text
  - **SpeechSynthesis**: text → voice
- The transcript is matched to a small set of intents (crop/fertilizer/disease/weather).
- Based on the intent, the Assistant navigates to the page.

Implementation references:
- `frontend/src/pages/AssistantPage.jsx`
- `frontend/src/voice/useVoiceCommands.js`

---

### Q8. What are browser limitations for voice?
**Answer:**
- SpeechRecognition support is best in Chromium browsers.
- Microphone permission is required.
- Some browsers/devices may not support it or may block it on insecure contexts.
- No server-side audio storage; only transcript text is used.

---

## 5) ML integration (mandatory viva section)

### Q9. Which crop is supported by disease detection?
**Answer (implementation truth):**
**Rice only.**

Evidence:
- ML service health reports `model: "rice_leaf_disease"` and prediction returns `crop: "rice"`.
- Model labels come from `ml-service/models/rice_model/config.json`.

---

### Q10. Which diseases/classes are supported?
**Answer (EXACT labels from `config.json` `id2label`):**
- `Bacterialblight`
- `Blast`
- `Brownspot`
- `Healthy`
- `Tungro`

---

### Q11. What is the ML model name / Hugging Face repo id / architecture?
**Answer (extracted from repo):**
- Hugging Face repo id used by download script:
  - `prithivMLmods/Rice-Leaf-Disease` (`ml-service/scripts/download_rice_model.ps1`)
- Architecture from model `config.json`:
  - `SiglipForImageClassification` (`model_type: "siglip"`)

---

### Q12. Where is the model stored and how is it loaded?
**Answer:**
- Stored locally at:
  - `ml-service/models/rice_model/`
- Loaded at ML service startup using Transformers:
  - `AutoImageProcessor.from_pretrained(MODEL_DIR, local_files_only=True)`
  - `AutoModelForImageClassification.from_pretrained(MODEL_DIR, local_files_only=True)`

This design avoids downloading at runtime and keeps demo stable.

---

### Q13. What is the model input and output?
**Answer:**
Input:
- `POST /predict-disease` with `multipart/form-data` field `image`
- Image is converted to RGB and resized by the processor to `224×224`.

Output contract (from `ml-service/app.py`):
```json
{
  "crop": "rice",
  "disease": "Blast",
  "confidence": 0.91,
  "remedyKey": "rice_blast_basic"
}
```

If confidence < `CONF_THRESHOLD` (default `0.55`), the ML service returns:
- `disease: "Unknown"`
- `remedyKey: "rice_unknown_basic"`

---

### Q14. How does backend connect ML output to remedy text?
**Answer:**
- ML service returns `remedyKey`.
- Backend uses `getRemedy(remedyKey)` to attach bilingual recommendation content.

Implementation references:
- Remedy map used by ML service: `ml-service/remedy_map.json`
- Remedy content in backend: `backend/src/services/diseaseRemedyService.js`
- Backend forwarding: `backend/src/routes/diseaseRoutes.js`

---

### Q15. How do you handle ML errors?
**Answer (as implemented):**
- If ML service is down/unreachable:
  - backend returns `502 { error: "ML_UNREACHABLE" }`
- If model is missing/cannot load:
  - ML returns `500 { error: "MODEL_LOAD_FAILED" }`
- If uploaded file is not a valid image:
  - ML returns `400 { error: "INVALID_IMAGE" }`

---

### Q16. Why pre-trained model? Why not train?
**Answer:**
- We did not have a verified labeled dataset for our local scope/time.
- Proper training requires:
  - data collection + annotation
  - train/val/test split
  - evaluation metrics (confusion matrix, precision/recall/F1)
  - reproducibility controls (seed, tracked experiments)
- It also needs compute (ideally GPU) and time.
- This project’s objective is end-to-end **integration** (web + API + DB + ML microservice), not research training.

---

### Q17. If the panel asks “what did you try to train?”
**Answer (safe and truthful for this repo):**
This repository contains **no training notebooks/scripts**.

So we answer:
> We evaluated/considered training options like CNN-based classifiers (ResNet/EfficientNet), lightweight MobileNet for edge, and ViT-style models, but we did not proceed due to dataset + time + compute constraints.

---

## 6) Weather integration + alerts logic

### Q18. Which weather provider is used and what endpoints exist?
**Answer:**
- Provider: Open-Meteo (public API)
- Backend endpoints:
  - `GET /weather/forecast?lat=...&lon=...` (public)
  - `GET /weather/forecast/by-profile` (auth, derives lat/lon from profile location)

Implementation references:
- `backend/src/routes/weatherRoutes.js`
- `backend/src/services/weatherService.js`

---

### Q19. How are weather alerts generated?
**Answer:**
Alerts are derived from normalized daily forecast using simple rules:
- heavy rain: `rainSumMm >= 20` → severity high
- rain risk: `rainProbabilityMax >= 80` → severity medium
- heat: `tempMaxC >= 35` → severity medium

Implementation reference:
- `backend/src/services/weatherAlertService.js`

---

## 7) Failure scenarios (viva-friendly)

### Q20. What happens if MongoDB is down?
**Answer:**
- Backend fails to start because DB connection is required at boot.
- UI won’t be able to login/profile/soil, because those read/write DB.

Evidence:
- `backend/src/server.js` connects to DB before `app.listen(...)`.

---

### Q21. What happens if Open-Meteo is down?
**Answer:**
- Weather pages will error when calling `/weather/forecast/...`.
- Crop recommendation can also fail because `/recommendations/crop` attempts a weather fetch when a location is available.

Suggested improvement (you can mention):
- Wrap weather fetch in try/catch and continue without weather (return `missingInputs: ["weather"]`).

---

### Q22. What happens if ML service is down?
**Answer:**
- Backend returns `502` with `error: "ML_UNREACHABLE"`.
- UI shows the error message on the Disease Detection page.

---

### Q23. What happens for invalid soil input?
**Answer:**
- UI uses numeric inputs with min/max constraints.
- Backend validates:
  - N/P/K must be numbers and `>= 0`
  - pH must be between `0` and `14`
- If invalid, backend returns `400 { error: "Validation error", details: [...] }`.

Implementation reference:
- `backend/src/routes/soilTestRoutes.js`
- `backend/src/utils/validation.js`

---

## 8) Chatbot (rule-based)

### Q24. Is there an AI chatbot / LLM used?
**Answer:**
No. The chatbot is **rule-based** with keyword matching and fixed templates.

Endpoint:
- `POST /chat` on backend (`http://localhost:5000/chat`)

Why rule-based:
- Safer and easier to explain in viva
- No prompt injection / hallucination risk in a student demo


