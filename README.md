# Project Setup Guide

## 1. Prerequisites
- **OS:** Windows 11 is used in this repository environment (project can run on other OS too, but commands below are Windows-friendly).
- **Node.js:** Required for frontend and backend. (This repo was run with Node **v20.x** in this environment.)
- **npm:** Comes with Node.js.
- **Python:** Required for the ML service. (Python 3.x; `requirements.txt` lists FastAPI + Uvicorn.)
- **MongoDB:** Local MongoDB server (community edition).

## 2. Repository Structure (Very Brief)
- `backend/` — Node.js + Express REST API (connects to MongoDB and calls ML/weather services).
- `frontend/` — React (Vite) web UI.
- `ml-service/` — Python FastAPI service for disease prediction (**currently a stub/dummy**).

## 3. Backend Setup
1. Open terminal in project root.
2. Go to backend:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. (Optional) Set environment variables:
   - `PORT` (default: `5000`)
   - `MONGODB_URI` (default: `mongodb://127.0.0.1:27017/smart_crop_advisory`)
   - `ML_BASE_URL` (default: `http://127.0.0.1:8001`)

   On Windows PowerShell (example):
   ```powershell
   $env:MONGODB_URI = "mongodb://127.0.0.1:27017/smart_crop_advisory"
   $env:ML_BASE_URL = "http://127.0.0.1:8001"
   $env:PORT = "5000"
   ```
5. Start backend:
   ```bash
   npm run dev
   ```
   Backend runs on: **http://localhost:5000**

## 4. Frontend Setup
1. Open a new terminal.
2. Go to frontend:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. (Optional) Set backend URL for frontend:
   - `VITE_API_BASE_URL` (default: `http://localhost:5000`)

   PowerShell example:
   ```powershell
   $env:VITE_API_BASE_URL = "http://localhost:5000"
   ```
5. Start frontend:
   ```bash
   npm run dev
   ```
   Frontend runs on: **http://127.0.0.1:5173/**

## 5. ML Service Setup (If Present)
**Important:** The ML service is **present**, but the prediction is **dummy/stub** (it always returns the same disease output).

1. Open a new terminal.
2. Go to ML service:
   ```bash
   cd ml-service
   ```
3. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv .venv
   ```
   Activate (PowerShell):
   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```
4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Start ML service (port **8001**):
   ```bash
   uvicorn app:app --host 127.0.0.1 --port 8001
   ```
   ML service health: **http://127.0.0.1:8001/health**

## 6. Database Setup
- **Database type:** MongoDB
- **Manual start needed:** Yes (you must start the MongoDB server locally).
- **Connection assumption:** Backend connects to:
  - Default: `mongodb://127.0.0.1:27017/smart_crop_advisory`
  - Or `MONGODB_URI` if provided.

## 7. Running Order
1. **MongoDB**
2. **Backend** (`backend/`)
3. **ML service** (`ml-service/`) (optional but needed for disease endpoint)
4. **Frontend** (`frontend/`)

## 8. Common Errors & Fixes
- **Port conflict (5173 / 5000 / 8001 already in use):**
  - Stop the process using the port, or change the port.
  - Backend: set `PORT`.
  - ML: change `--port` in uvicorn command.
  - Frontend: `npm run dev -- --port 5173` (or another port).

- **Backend cannot connect to MongoDB:**
  - Ensure MongoDB service is running.
  - Verify `MONGODB_URI`.

- **Disease prediction fails:**
  - Ensure ML service is running at `ML_BASE_URL` (default `http://127.0.0.1:8001`).
  - Check ML health: `http://127.0.0.1:8001/health`.

- **Frontend API errors:**
  - Ensure backend is running on `http://localhost:5000`.
  - If backend runs elsewhere, set `VITE_API_BASE_URL`.

## 9. Verification Checklist
- Backend health:
  - Open: `http://localhost:5000/health`
  - Expected: `{ "status": "ok" }`
- ML service health (if running):
  - Open: `http://127.0.0.1:8001/health`
  - Expected: `{ "status": "ok" }`
- Frontend loads:
  - Open: `http://127.0.0.1:5173/`
- Basic connectivity test:
  - On frontend Dashboard, “Edge status” should load (it checks ML reachability).

