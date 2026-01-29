# Smart Crop Advisory System (Demo) — Setup Guide for Reviewers

## 0) What this project is (end-to-end, in simple words)
This is a **demo web application** for a **Smart Crop Advisory System** (Punjab only).

It shows how a farmer-friendly advisory flow can work with **structured inputs** (profile + soil test) and **clear outputs** (crop suggestion, fertilizer guidance, weather).

### What you can do in the app (end-to-end)
1) **Login** using a pre-created demo farmer
2) Update the farmer **Profile** (Punjab district, season, soil type, previous crop)
3) Enter a **Soil Test** (N, P, K, pH)
4) View **Crop Recommendation** (rule-based)
5) View **Fertilizer Guidance** (rule-based)
6) View **Weather Forecast + Alerts** (7-day)

> Optional: Disease detection exists, but it requires starting the separate Python ML stub service.

---

## 1) Before you start (very important)
This project has 2 parts running on your computer:
- a **Backend server** (stores data in a database and provides APIs)
- a **Frontend website** (the screens you click)

To run them, you need these installed.

### 1.1 What is Node.js and why do we need it?
**Node.js** is a program that lets your computer run JavaScript outside the browser.
We need Node.js because the **backend server** (and the frontend build tools) run using Node.js.

### 1.2 What is npm and why do we need it?
**npm** comes with Node.js. It downloads the project’s required libraries.
We use it to install dependencies and run commands like `npm run dev`.

### 1.3 What is MongoDB and why do we need it?
**MongoDB** is the database used by this project.
It stores things like farmer profile, soil tests, and dropdown master data (districts, seasons, crops).

### 1.4 Optional: Python (only for Disease Detection)
The disease feature calls a small **Python service** (currently a stub). If you do not start it, the rest of the app still works.

---

## 2) Step 1 — Download (clone) the project
If you already have the project folder, you can skip this.

1) Open **Terminal / Command Prompt / PowerShell**
2) Run:

```bash
git clone https://github.com/santhoshses/Smart-Agriculture-Advisory-System.git
```

3) Go into the project folder:

```bash
cd Smart-Agriculture-Advisory-System
```

---

## 3) Step 2 — Start MongoDB (database)
MongoDB must be running **before** you start the backend.

If MongoDB is not running:
- the backend will fail to start
- login dropdown and master-data dropdowns will not work

> If you installed MongoDB as a Windows Service, it usually starts automatically.

---

## 4) Step 3 — Backend setup (server)
The backend is inside the `backend/` folder.

1) Install backend dependencies:
```bash
cd backend
npm install
```

2) Seed the database (**required**, explained below):
```bash
npm run seed
npm run seed:demo
```

3) Start the backend server:
```bash
npm run dev
```

Backend should run at:
- **http://localhost:5000**

Quick check:
- Open this in your browser: **http://localhost:5000/health**
- You should see: `{ "status": "ok" }`

---

## 5) Step 4 — Frontend setup (website UI)
Open a **second terminal window** for the frontend.

1) Install frontend dependencies:
```bash
cd frontend
npm install
```

2) Start the frontend:
```bash
npm run dev
```

Frontend should run at:
- **http://127.0.0.1:5173/**

---

## 6) Step 5 — Login and run the end-to-end flow
1) Open **http://127.0.0.1:5173/** in your browser
2) You will be redirected to **/login**
3) Select a demo farmer (example: **Demo Farmer 1**) and login
4) Continue the flow:
   - Profile → Soil → Crop → Fertilizer → Weather

---

## 7) Environment variables (simple explanation)
### What is an environment variable?
An **environment variable** is a small **setting** you give to a program when you start it.
It tells the app things like:
- “Which port should I run on?”
- “Where is the database?”

### Do you need to set environment variables for this project?
Usually: **No.** This project has safe default values.

Only set them if:
- a port is already in use on your laptop
- MongoDB is running somewhere else
- you run the optional Python ML service on a different port

### Variables used by this project

#### Backend variables
| Variable | What it controls | Do I need to set it? | When would I change it? |
|---|---|---:|---|
| `PORT` | Backend server port | No | Change if port `5000` is already used. |
| `MONGODB_URI` | Where the backend finds MongoDB | No | Change if MongoDB is not on your computer or not on the default local address. |
| `ML_BASE_URL` | Where the backend finds the Python ML service | No | Change if you run the ML service on a different host/port. |

Defaults (if you do nothing):
- `PORT=5000`
- `MONGODB_URI=mongodb://127.0.0.1:27017/smart_crop_advisory`
- `ML_BASE_URL=http://127.0.0.1:8001`

#### Frontend variable
| Variable | What it controls | Do I need to set it? | When would I change it? |
|---|---|---:|---|
| `VITE_API_BASE_URL` | Where the website calls the backend API | No | Change if the backend is not running on `http://localhost:5000`. |

Default:
- `VITE_API_BASE_URL=http://localhost:5000`

PowerShell example (optional):
```powershell
$env:PORT = "5000"
$env:MONGODB_URI = "mongodb://127.0.0.1:27017/smart_crop_advisory"
$env:ML_BASE_URL = "http://127.0.0.1:8001"
```

---

## 8) Seeding the database (CRITICAL)
### What is “seeding”?
Seeding means: **pre-filling the database with required starting data**.

This project needs seeding because:
- the Profile screen uses dropdowns (Punjab districts, seasons, soil types, crops)
- the Login screen shows demo farmers

Without seeding:
- dropdown lists will be empty
- login will not show any farmer names

### Why are there TWO seed commands?
We intentionally separate data into 2 groups:

1) **Master data** (the dropdown lists)
   - Punjab districts
   - seasons
   - soil types
   - crops

2) **Demo data** (demo farmers and their linked profiles)
   - demo farmer accounts
   - one linked profile per farmer
   - (optional) demo soil tests

That is why you must run both commands (from `backend/`):
```bash
npm run seed
npm run seed:demo
```

### Is it safe to run seed again?
Yes. These seed scripts are designed to be **repeatable** (they do not keep duplicating data).

---

## 9) Optional: Start the ML service (only for Disease Detection)
If you want to demo **Disease Detection**, start the Python service.

1) Open a third terminal window:
```bash
cd ml-service
python -m venv .venv
```

2) Activate the virtual environment (PowerShell):
```powershell
\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, you can either:
- Open PowerShell as Administrator and run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, OR
- Use Command Prompt activation instead:
```bat
.venv\Scripts\activate
```

3) Install Python dependencies:
```bash
pip install -r requirements.txt
```

4) Run the service:
```bash
uvicorn app:app --host 127.0.0.1 --port 8001
```

Check:
- **http://127.0.0.1:8001/health** should return `{ "status": "ok" }`

---

## 10) Quick verification checklist (for invigilators)
- MongoDB is running
- Backend:
  - http://localhost:5000/health returns `{ "status": "ok" }`
- Frontend:
  - http://127.0.0.1:5173/ opens and redirects to `/login`
  - Login dropdown shows **Demo Farmer 1/2/3**

---

## 11) Demo walkthrough (short)
Suggested demo flow (safe and repeatable):
1) Login as **Demo Farmer 1**
2) Profile: set name to `Harpreet Singh (Demo)` → Save
3) Soil: N=18, P=12, K=15, pH=8.2 → Save
4) Crop Recommendation → Get recommendations
5) Fertilizer Guidance (crop: `wheat`) → Get guidance
6) Weather → Get forecast

Notes:
- Weather needs internet (Open-Meteo).
- Disease page needs the optional ML service running.
