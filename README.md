# Smart Agriculture Advisory System (Demo) — Setup + Demo + Viva-Ready Notes

This repository contains a **demo web application** for a **Smart Agriculture Advisory System** (Punjab-focused).

It demonstrates an end-to-end flow:
- demo login (no password/OTP)
- profile + soil test capture (stored in MongoDB)
- **rule-based** crop recommendation
- **rule-based** fertilizer guidance
- **7-day weather forecast + simple alerts** (Open-Meteo)
- **disease detection using a pre-trained Rice leaf disease model** (Python FastAPI microservice)
- **Voice Assistant** (browser Speech-to-Text + Text-to-Speech for guided navigation)
- **Chatbot** (rule-based text Q&A; no AI/LLM)

---

## Project overview (what is implemented)

### What you can do in the app (end-to-end)
1) **Login** using a pre-created demo farmer (no password/OTP)
2) Update the farmer **Profile** (Punjab district, season, soil type, previous crop)
3) Enter a **Soil Test** (N, P, K, pH)
4) View **Crop Recommendation** (rule-based scoring + ranking)
5) View **Fertilizer Guidance** (rule-based deficiency detection + simple schedule)
6) View **Weather Forecast + Alerts** (7-day, Open-Meteo)
7) Use **Assistant page**:
   - guided navigation buttons
   - **Voice mode** (supported browsers only)
8) Use **Chatbot**:
   - ask a simple question (English/Punjabi)
   - get a rule-based template answer
9) Use **Disease Detection (Rice)**:
   - upload a rice leaf image
   - get predicted class + confidence
   - see bilingual, demo-safe remedy guidance

---

## High-level architecture (simple)
**Frontend (React)** → **Backend (Node/Express)** → **MongoDB**

Additional integrations:
- **Weather**: backend calls Open-Meteo and generates simple alerts.
- **Disease detection (Rice model)**: backend forwards image to local Python FastAPI inference service.
- **Voice assistant**: runs in the browser (SpeechRecognition + SpeechSynthesis). Backend is not used for voice.
- **Chatbot**: backend provides a small rule-based template endpoint (no LLM).

---

## Tech stack (actual)

### Frontend
- React 19 + Vite 5
- React Router DOM 7
- Manual i18n via `frontend/src/i18n/` (English + Punjabi)

### Backend
- Node.js + Express 5
- MongoDB + Mongoose
- Multer (image upload forwarding)

### ML inference service
- Python FastAPI + Uvicorn
- Hugging Face Transformers + PyTorch

---

## Known limitations (important for viva)
- **Crop recommendation is rule-based** (scoring blueprint). It is not ML.
- **Fertilizer guidance is rule-based** (threshold/deficiency classification). No dosage calculation.
- **Chatbot is rule-based** (predefined keywords + fixed templates). **No AI/LLM**.
- **Voice assistant is browser-based** (SpeechRecognition/SpeechSynthesis). No server-side audio storage.
- Weather requires internet (Open-Meteo).
- **Current behavior:** crop recommendation also fetches weather in the backend; if Open-Meteo is unreachable, `/recommendations/crop` can fail with a server error.
- Disease detection uses a **pre-trained Rice model** and returns **Unknown** when confidence is low.

---

## Viva notes / documentation
Student-friendly, implementation-aligned notes:
- Voice bot end-to-end: `docs/viva-notes/voice-bot-end-to-end.md`
- Database design end-to-end: `docs/viva-notes/database-design-end-to-end.md`
- Crop + fertilizer recommendations end-to-end: `docs/viva-notes/crop-and-fertilizer-recommendations-end-to-end.md`
- Disease detection end-to-end (Rice model): `docs/DISEASE_DETECTION_END_TO_END.md`
- Viva Q&A (full, viva-ready): `docs/viva-notes/viva-qna.md`
- Demo script (happy + non-happy): `docs/demo-flow/demo-flow.md`

---

## Prerequisites (install these first)
This project has 3 parts running on your computer:
- a **Backend server** (stores data in a database and provides APIs)
- a **Frontend website** (the screens you click)
- an **ML inference service** (Rice disease detection)

To run them, you need these installed.

### Install Node.js (includes npm)

**Recommended version:** Node.js **20 LTS** (or newer LTS).  
**Why:** Backend uses Express 5 and Mongoose 8, which work best on modern Node LTS.

**Download (official):** https://nodejs.org/en/download

**Install steps (Windows 10/11):**
1) Download **Node.js 20 LTS (Windows Installer .msi)**
2) Run the installer → keep default options
3) Ensure these are enabled:
   - “Add to PATH”
   - npm installation
4) Close and reopen Terminal / PowerShell
5) Verify:

```bash
node -v
npm -v
```

Expected:
- Node version should start with `v20.` (or another LTS version you installed)

---

### Install Git (for cloning/downloading the project)

**Recommended version:** Git **2.40+**

**Download (official):** https://git-scm.com/downloads

**Install steps (Windows 10/11):**
1) Download **Git for Windows**
2) Run the installer
3) Keep defaults (important ones):
   - “Git from the command line and also from 3rd-party software”
   - Default editor can be anything
4) Close and reopen Terminal / PowerShell
5) Verify:

```bash
git --version
```

---

### Install MongoDB Community Server (database)

**Recommended version:** MongoDB Community Server **7.0+**

**Download (official):** https://www.mongodb.com/try/download/community

**Install steps (Windows 10/11):**
1) Choose:
   - **Version:** 7.0.x (latest available)
   - **Package:** MSI
   - **Platform:** Windows
2) Run the installer
3) Choose **Complete** setup
4) Keep “Install MongoDB as a Service” enabled (recommended for students)
5) Finish installation

**Verify MongoDB service is running:**
- Open **Services** → find **MongoDB Server** → Status should be *Running*

**Optional verification (MongoDB Shell):**
- Install MongoDB Shell from: https://www.mongodb.com/try/download/shell
- Then run:

```bash
mongosh
```

If MongoDB is not running:
- backend will fail to start
- login dropdown and master-data dropdowns will be empty

---

## Quickstart (run the project in 7 steps)
1) Start MongoDB
2) Setup backend (`npm install`)
3) Seed database (`npm run seed` + `npm run seed:demo`)
4) Run backend (`npm run dev`)
5) Setup + run ML service (model download + `uvicorn`)
6) Setup frontend (`npm install`)
7) Run frontend (`npm run dev`)

Then open: **http://localhost:5173/**

---

## Step-by-step Setup

### 1) Download (clone) the project
```bash
git clone https://github.com/santhoshses/Smart-Agriculture-Advisory-System.git
cd Smart-Agriculture-Advisory-System
```

### 2) Backend setup (server)
```bash
cd backend
npm install
npm run seed
npm run seed:demo
npm run dev
```

Backend runs at:
- **http://localhost:5000**

Health check:
- **http://localhost:5000/health** → `{ "status": "ok" }`

Edge readiness / ML reachability check:
- **http://localhost:5000/edge/status** → includes `services.mlService.reachable` and ML `/health` response

### 3) Frontend setup (website UI)
Open a **second terminal**:
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:
- **http://localhost:5173/**

---

## Environment variables (simple)

### Backend variables
| Variable | Purpose | Default |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/smart_crop_advisory` |
| `ML_BASE_URL` | ML service URL (Disease Detection) | `http://127.0.0.1:8001` |

### Frontend variable
| Variable | Purpose | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend base URL | `http://localhost:5000` |

---

## Seeding the database (CRITICAL)
This project requires seeding because:
- the Profile screen uses master dropdowns (locations, seasons, soil types, crops)
- the Login screen lists demo farmers

Run both (from `backend/`):
```bash
npm run seed
npm run seed:demo
```

---

## Start the ML service (Disease Detection)
Disease detection is part of the default demo flow. Start the Python inference service.

### 0) Install Python (first-time users)
**Supported Python:** Python **3.10+** (tested with Python 3.12 on Windows 11).

Download (official): https://www.python.org/downloads/

**Windows install steps:**
1) Download Python 3.x (Windows installer)
2) Run installer
3) IMPORTANT: tick **“Add python.exe to PATH”**
4) Finish install
5) Close and reopen PowerShell/Terminal

Verify:
```powershell
python --version
pip --version
```

If `python` is not recognized:
- Re-run Python installer and ensure “Add to PATH” is enabled.

### Important (read this first)
- The disease model is **NOT bundled** with this repo. It must be downloaded into:
  - `ml-service/models/rice_model/`
- **Downloading is a one-time step** (unless you delete that folder).
- The download is large (~2.5GB).
- Version compatibility matters:
  - `transformers==4.50.0` requires `huggingface_hub < 1.0`.
  - This project pins `huggingface_hub>=0.26.0,<1.0`.

Also important:
- Use the `ml-service/.venv` virtual environment so that your **global Python packages do not interfere**.

If your ML API returns:
- `MODEL_LOAD_FAILED` → model files are missing/corrupted OR Python deps are incompatible.

### A) One-time: Download the rice model (~2.5GB)
Open **PowerShell** (recommended) from the project root and run:

```powershell
PowerShell -ExecutionPolicy Bypass -File .\ml-service\scripts\download_rice_model.ps1
```

Expected result:
- It will create/fill: `ml-service/models/rice_model/`
- If the folder already contains `config.json` and `model.safetensors`, the script will **skip** downloading.

Why this script is safe:
- It uses its own small venv at `ml-service/.model_download_venv` to download from HuggingFace.
- It does **not** upgrade/downgrade your global Python packages.

### B) Create venv + install ML deps

```bash
cd ml-service
python -m venv .venv
```

Activate venv:
```powershell
# PowerShell: dot-source the activation script (required)
. .\.venv\Scripts\Activate.ps1
```

If activation is blocked by execution policy, run this in the **same PowerShell window** and retry:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Install deps:
```bash
pip install -r requirements.txt
```

Tip: If you previously ran the old download script and it installed an incompatible `huggingface_hub` version,
re-run the command above (it will install the pinned compatible versions from `requirements.txt`).

Run service:
```bash
uvicorn app:app --host localhost --port 8001
```

If you prefer to avoid activation, you can run directly:
```powershell
.\.venv\Scripts\uvicorn app:app --host localhost --port 8001
```

Check:
- **http://localhost:8001/health** → `{ "status": "ok" }`

Extra debug info from `/health`:
- `modelLoaded: true/false`
- `modelLoadError: ...` (shows the exact model load exception if any)

### Fresh clone checklist (no trial-and-error)
If you do **exactly** the steps above, a fresh machine should be able to run the ML service.

The only common reasons it can still fail are:
1) **No internet / blocked HuggingFace** → model download cannot complete.
2) **Not enough disk space** → model is ~2.5GB.
3) **Python not on PATH** → `python` command fails.

---

## Disease Detection (Pre-trained Rice Model)

This project includes a **Rice leaf disease detection** pipeline implemented as a separate Python FastAPI inference service.

### Model details (extracted from implementation)
Source of truth:
- Download script: `ml-service/scripts/download_rice_model.ps1`
- Model config: `ml-service/models/rice_model/config.json`
- ML API: `ml-service/app.py`

**Hugging Face model repo id (downloaded locally):**
- `prithivMLmods/Rice-Leaf-Disease`

**Model architecture (from `config.json`):**
- `SiglipForImageClassification` (Transformers `model_type: "siglip"`)

**Scope:**
- This model supports **ONLY rice leaf disease detection**.

**Supported classes (EXACT labels from `config.json` `id2label`):**
- `Bacterialblight`
- `Blast`
- `Brownspot`
- `Healthy`
- `Tungro`

### Input expectations
- Upload a **leaf image** (jpg/png preferred) using multipart form-data field name: `image`.
- The ML service converts input to **RGB**.
- Preprocessing uses the model’s image processor (from `preprocessor_config.json`):
  - resize to **224×224**
  - normalize/rescale
- If an image is extremely small (`< 32×32`), the service resizes it to `224×224` as a demo safety fallback.

### Output schema
ML service endpoint:
- `POST http://localhost:8001/predict-disease`

Response contract (from `ml-service/app.py`):
```json
{
  "crop": "rice",
  "disease": "Blast",
  "confidence": 0.91,
  "remedyKey": "rice_blast_basic"
}
```

Low-confidence fallback (threshold controlled by `CONF_THRESHOLD`, default `0.55`):
```json
{
  "crop": "rice",
  "disease": "Unknown",
  "confidence": 0.40,
  "remedyKey": "rice_unknown_basic"
}
```

Backend forwarding endpoint (what the UI calls):
- `POST http://localhost:5000/disease/predict` (multipart field `image`)

The backend enriches the ML output with bilingual remedy text (`recommendation`) using:
- `backend/src/services/diseaseRemedyService.js`

### Health + troubleshooting
Health endpoint:
- `GET http://localhost:8001/health`
  - includes `modelLoaded` and `modelLoadError` for debugging

Common errors:
- **ML service not running** → backend returns `502 { error: "ML_UNREACHABLE" }`
- **Model not downloaded/corrupted** → ML returns `500 { error: "MODEL_LOAD_FAILED" }`
- **Invalid image** → ML returns `400 { error: "INVALID_IMAGE" }`

---

## Viva-ready justification: Why a pre-trained model?

We used a **pre-trained** rice leaf disease classifier because:
- No verified labeled dataset was available for our **local scope/time**.
- Proper training requires data collection + annotation + **train/val/test split** + evaluation (confusion matrix/F1).
- Training requires compute (ideally GPU), time, and reproducibility controls.
- The project’s primary objective is **end-to-end integration** (web + API + DB + ML microservice), not research training.

## If viva asks: what did you try to train?

Repo evidence check (searched for: `training`, `finetune`, `resnet`, `mobilenet`, `efficientnet`, `vit`, `cnn`, `dataset`, `kaggle`, `ipynb`, `notebook`):
- No training notebooks/scripts are present in this repository.

Safe, truthful answer:
> We evaluated/considered possible training options like CNN-based classifiers (ResNet/EfficientNet), lightweight MobileNet for edge devices, and ViT-style architectures, but we did not proceed due to dataset + time + compute constraints.

---

## Folder structure (quick map)
- `frontend/` — React UI (pages in `frontend/src/pages/`)
- `backend/` — Express API (routes in `backend/src/routes/`, logic in `backend/src/services/`, models in `backend/src/models/`)
- `ml-service/` — FastAPI inference service for rice disease detection
- `docs/viva-notes/` — submission/viva-ready explanations aligned with the current implementation
