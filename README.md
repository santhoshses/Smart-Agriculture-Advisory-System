# Project Setup Guide

This repository contains a **full-stack demo** for a “Smart Crop Advisory System”:
- **Frontend:** React (Vite)
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **ML service (optional):** FastAPI stub used by disease endpoint
- **Weather provider:** Open-Meteo (internet required)

The **code is the source of truth**. These steps match the currently implemented scripts and ports.

---

## 1) Prerequisites
- **Node.js:** v20.x recommended (Node 18+ required for the backend’s use of built-in `fetch`, `FormData`, `Blob`).
- **npm:** comes with Node.
- **MongoDB:** local MongoDB server.
- **Python 3.x:** only required if you want to run the `ml-service/`.
- **Internet connection:** required for weather (Open-Meteo).

## 2) Repository Structure
- `backend/` — Express API + MongoDB models + seeds.
- `frontend/` — React SPA (Vite).
- `ml-service/` — FastAPI **stub** for disease prediction.

> Note: the root `package.json` does not contain run scripts; run commands from `backend/` and `frontend/`.

---

## 3) Backend Setup (Node/Express)
```bash
cd backend
npm install
```

### 3.1 Environment variables (optional)
- `PORT` (default: `5000`)
- `MONGODB_URI` (default: `mongodb://127.0.0.1:27017/smart_crop_advisory`)
- `ML_BASE_URL` (default: `http://127.0.0.1:8001`)

PowerShell example:
```powershell
$env:MONGODB_URI = "mongodb://127.0.0.1:27017/smart_crop_advisory"
$env:ML_BASE_URL = "http://127.0.0.1:8001"
$env:PORT = "5000"
```

### 3.2 Database seeding (required)
The UI relies on seeded **master data** (Punjab districts, seasons, soil types, crops).

From `backend/`:
```bash
npm run seed
npm run seed:demo
```

What these do:
- `npm run seed` seeds:
  - Punjab districts (`Location`)
  - Domain masters (`Season`, `SoilType`, `Crop`)
- `npm run seed:demo` seeds demo farmer accounts and linked profiles.

> Note: demo soil tests are created only if none exist for that profile (seed is idempotent).

### 3.3 Start backend
```bash
npm run dev
```
Backend runs at: **http://localhost:5000**

Health check:
- `GET http://localhost:5000/health` → `{ "status": "ok" }`

---

## 4) Frontend Setup (React/Vite)
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://127.0.0.1:5173/**

### 4.1 Frontend environment variable (optional)
- `VITE_API_BASE_URL` (default: `http://localhost:5000`)

PowerShell example:
```powershell
$env:VITE_API_BASE_URL = "http://localhost:5000"
```

---

## 5) ML Service Setup (optional, stub)
The ML service is implemented as a **deterministic stub** (it always returns the same prediction). It is only required for:
- `POST /disease/predict`
- the dashboard “Edge status” ML reachability check

```bash
cd ml-service
python -m venv .venv
```

PowerShell activate:
```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Run on port 8001:
```bash
uvicorn app:app --host 127.0.0.1 --port 8001
```

Health check:
- `GET http://127.0.0.1:8001/health` → `{ "status": "ok" }`

---

## 6) Demo Login (Single-profile-per-farmer)
The current UI requires a demo session token.

1) Ensure seeds are done:
```bash
cd backend
npm run seed
npm run seed:demo
```

2) Start backend + frontend.

3) Open the UI. You will be redirected to `/login`.
   - Choose a seeded demo farmer (e.g., **Demo Farmer 1**).
   - The frontend stores a token in `localStorage` and attaches `Authorization: Bearer <token>` automatically.

---

## 7) Run Order (recommended)
1) **MongoDB**
2) **Backend** (`backend/`)
3) **ML service** (`ml-service/`) (optional)
4) **Frontend** (`frontend/`)

---

## 8) Troubleshooting
### 8.1 Port conflicts
- Backend: set `PORT`
- Frontend: `npm run dev -- --port 5173`
- ML: change `--port 8001`

### 8.2 Backend cannot connect to MongoDB
- Start MongoDB service
- Confirm `MONGODB_URI`

### 8.3 Login shows empty farmer list
- Ensure you ran both:
  - `npm run seed`
  - `npm run seed:demo`

### 8.4 Weather forecast fails
- Weather uses Open-Meteo (internet required)
- Try again (backend caches responses for ~10 minutes)

### 8.5 Disease prediction fails
- Start the ML service (`ml-service/`) and verify `http://127.0.0.1:8001/health`
- Verify backend env var `ML_BASE_URL` (defaults to `http://127.0.0.1:8001`)

---

## 9) Verification Checklist
- Backend: `GET http://localhost:5000/health`
- Frontend: open `http://127.0.0.1:5173/` → should redirect to `/login`
- After login:
  - `/profile` loads dropdown masters (district/season/soil/crop)
  - `/soil` saves NPK+pH
  - `/crop` returns recommendations
  - `/weather` returns 7-day forecast

---

## 10) Demo Walkthrough (Presenter-ready)
This is a demo script that matches the current implementation and seeded data.

### 10.1 Recommended demo account
From `backend/src/db/seed/demo.seed.js`:
- **Demo Farmer 1** (district: Ludhiana, season: Rabi, previous crop: Rice, soil type: Loam)

### 10.2 Suggested demo inputs
- Profile name: `Harpreet Singh (Demo)`
- Soil test:
  - N=18, P=12, K=15, pH=8.2

### 10.3 Demo flow
1) Open the UI → you will be redirected to `/login`.
2) Select **Demo Farmer 1** → **Login**.
3) Go to **Profile** (`/profile`): set name, confirm district/season/previous crop/soil type → **Save profile**.
4) Go to **Soil Input** (`/soil`): enter N/P/K/pH → **Save soil test**.
5) Go to **Crop Recommendation** (`/crop`): click **Get recommendations**.
   - Optional: use **Location override** to demonstrate scenario planning.
6) Go to **Fertilizer Guidance** (`/fertilizer`): crop `wheat` → **Get guidance**.
7) Go to **Weather** (`/weather`): **Get forecast**.

### 10.4 Live-demo cautions
- **Disease Detection** (`/disease`) depends on the ML service running at `ML_BASE_URL`.
- **Weather** depends on internet connectivity (Open-Meteo).
