# Smart Crop Advisory System (Demo) — Setup Guide for Students

## 1) What this project is (end-to-end, in simple words)
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

## 2) Prerequisites (install these first)
This project has 2 parts running on your computer:
- a **Backend server** (stores data in a database and provides APIs)
- a **Frontend website** (the screens you click)

To run them, you need these installed.

### 2.1 Install Node.js (includes npm)
**What it is (simple):** Node.js lets your computer run JavaScript programs.

**Why you need it here:**
- The backend server runs on Node.js
- The frontend dev server runs on Node.js

**Install (Windows):**
1) Download **Node.js LTS** from: https://nodejs.org/
2) Run the installer → keep default options
3) Verify installation:
```bash
node -v
npm -v
```

You should see version numbers.

### 2.2 Install Git (for downloading the project)
**What it is (simple):** Git is a tool to download code from GitHub.

**Install (Windows):**
1) Download Git from: https://git-scm.com/downloads
2) Run the installer → default options are OK
3) Verify:
```bash
git --version
```

### 2.3 Install MongoDB (database)
**What it is (simple):** MongoDB is where the app stores data (profiles, soil tests, dropdown lists).

**Install (Windows):**
1) Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2) Install it
3) Ensure MongoDB service is running

> If you are not sure, you can still continue; the backend will clearly fail if MongoDB is not running.

### 2.4 Optional: Install Python (only for Disease Detection)
If you want to demo **Disease Detection**, you need Python.

Download: https://www.python.org/downloads/

During installation, tick: **“Add Python to PATH”**.

Verify:
```bash
python --version
```

---

## 3) Quickstart (run the project in 6 steps)
If you just want to run the project quickly, follow this checklist:
1) Start MongoDB
2) Setup backend (`npm install`)
3) Seed database (`npm run seed` + `npm run seed:demo`)
4) Run backend (`npm run dev`)
5) Setup frontend (`npm install`)
6) Run frontend (`npm run dev`)

Then open: **http://localhost:5173/**

---

## 4) Step-by-step Setup

### 4.1 Download (clone) the project

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

### 4.2 Start MongoDB (database)
MongoDB must be running **before** you start the backend.

If MongoDB is not running:
- the backend will fail to start
- login dropdown and master-data dropdowns will not work

> If you installed MongoDB as a Windows Service, it usually starts automatically.

---

### 4.3 Backend setup (server)
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

### 4.4 Frontend setup (website UI)
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
- **http://localhost:5173/**

---

### 4.5 Login and run the end-to-end flow
1) Open **http://localhost:5173/** in your browser
2) You will be redirected to **/login**
3) Select a demo farmer (example: **Demo Farmer 1**) and login
4) Continue the flow:
   - Profile → Soil → Crop → Fertilizer → Weather

---

## 5) Environment variables (simple explanation)
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
- `MONGODB_URI=mongodb://localhost:27017/smart_crop_advisory`
- `ML_BASE_URL=http://localhost:8001`

#### Frontend variable
| Variable | What it controls | Do I need to set it? | When would I change it? |
|---|---|---:|---|
| `VITE_API_BASE_URL` | Where the website calls the backend API | No | Change if the backend is not running on `http://localhost:5000`. |

Default:
- `VITE_API_BASE_URL=http://localhost:5000`

PowerShell example (optional):
```powershell
$env:PORT = "5000"
$env:MONGODB_URI = "mongodb://localhost:27017/smart_crop_advisory"
$env:ML_BASE_URL = "http://localhost:8001"
```

---

## 6) Seeding the database (CRITICAL)
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

## 7) Optional: Start the ML service (only for Disease Detection)
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
uvicorn app:app --host localhost --port 8001
```

Check:
- **http://localhost:8001/health** should return `{ "status": "ok" }`

---

## 8) Quick verification checklist (for students)
- MongoDB is running
- Backend:
  - http://localhost:5000/health returns `{ "status": "ok" }`
- Frontend:
  - http://localhost:5173/ opens and redirects to `/login`
  - Login dropdown shows **Demo Farmer 1/2/3**

---

### Note about `localhost` vs `127.0.0.1`
Both usually mean “this same computer”.
If one does not work on your laptop, try the other.

---

## 9) Demo walkthrough (short)
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
