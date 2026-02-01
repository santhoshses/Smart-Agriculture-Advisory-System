# Smart Crop Advisory System (Demo) — Setup + Viva-Ready Notes

This repository contains a **demo web application** for a **Smart Agriculture Advisory System** (Punjab-focused).

It demonstrates a complete flow:
- user logs in (demo login)
- saves profile + soil test
- gets **rule-based** crop and fertilizer recommendations
- sees **7-day weather forecast + simple alerts**
- (optional) runs a disease detection pipeline using a **local Python stub ML service**

It also includes a **Voice Bot** (browser-based Speech-to-Text + Text-to-Speech) and a **rule-based chatbot** (no AI/LLM).

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
   - optional **Voice mode** (supported browsers only)
8) Use **Chatbot page** (text-based, rule-based templates)

> Optional: Disease detection exists, but it requires starting the separate Python ML **stub** service.

---

## High-level architecture (simple)
**Frontend (React)** → **Backend (Node/Express)** → **MongoDB**

Additional integrations:
- **Weather**: backend calls Open-Meteo and generates simple alerts.
- **Disease detection (optional)**: backend forwards image to local Python FastAPI service.
- **Voice bot**: runs in the browser (SpeechRecognition + SpeechSynthesis). Backend is only used for rule-based chatbot replies.

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

### Optional ML service (stub)
- Python FastAPI + Uvicorn

---

## Known limitations (important for viva)
- **Crop recommendation is rule-based** (scoring blueprint). It is not ML.
- **Fertilizer guidance is rule-based** (threshold/deficiency classification). No dosage calculation.
- **Chatbot is rule-based** (predefined keywords + fixed templates). **No AI/LLM**.
- **Voice bot is browser-based** (SpeechRecognition/SpeechSynthesis). No server-side audio storage.
- Weather requires internet (Open-Meteo).
- **Current behavior:** crop recommendation also fetches weather in the backend; if Open-Meteo is unreachable, `/recommendations/crop` can fail with a server error.
- Disease detection is optional and the Python service is a deterministic stub.

---

## Viva notes / documentation
Student-friendly, implementation-aligned notes:
- Voice bot end-to-end: `docs/viva-notes/voice-bot-end-to-end.md`
- Database design end-to-end: `docs/viva-notes/database-design-end-to-end.md`
- Crop + fertilizer recommendations end-to-end: `docs/viva-notes/crop-and-fertilizer-recommendations-end-to-end.md`

---

## Prerequisites (install these first)
This project has 2 main parts running on your computer:
- a **Backend server** (stores data in a database and provides APIs)
- a **Frontend website** (the screens you click)

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

## Quickstart (run the project in 6 steps)
1) Start MongoDB
2) Setup backend (`npm install`)
3) Seed database (`npm run seed` + `npm run seed:demo`)
4) Run backend (`npm run dev`)
5) Setup frontend (`npm install`)
6) Run frontend (`npm run dev`)

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
| `ML_BASE_URL` | ML service URL (optional disease) | `http://127.0.0.1:8001` |

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

## Optional: Start the ML service (only for Disease Detection)
If you want to demo **Disease Detection**, start the Python service.

```bash
cd ml-service
python -m venv .venv
```

Activate venv:
```powershell
\.venv\Scripts\Activate.ps1
```

Install deps:
```bash
pip install -r requirements.txt
```

Run service:
```bash
uvicorn app:app --host localhost --port 8001
```

Check:
- **http://localhost:8001/health** → `{ "status": "ok" }`

---

## Folder structure (quick map)
- `frontend/` — React UI (pages in `frontend/src/pages/`)
- `backend/` — Express API (routes in `backend/src/routes/`, logic in `backend/src/services/`, models in `backend/src/models/`)
- `ml-service/` — optional FastAPI stub for disease detection
- `docs/viva-notes/` — submission/viva-ready explanations aligned with the current implementation
