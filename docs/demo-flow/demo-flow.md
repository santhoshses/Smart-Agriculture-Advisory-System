# Demo Flow Script (Happy + Non-happy) — Smart Agriculture Advisory System

This is a **presenter script** for demoing the repository implementation.

Defaults used here match the code:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- ML service: `http://localhost:8001`

Disease detection model (source of truth: `ml-service/models/rice_model/config.json`):
- Hugging Face repo id: `prithivMLmods/Rice-Leaf-Disease`
- Architecture: `SiglipForImageClassification` (`model_type: siglip`)
- Scope: **Rice leaf disease detection only**
- Supported classes (EXACT labels):
  - `Bacterialblight`
  - `Blast`
  - `Brownspot`
  - `Healthy`
  - `Tungro`

---

## 0) Pre-demo checklist (5 minutes)

### A) MongoDB
- Ensure MongoDB service is running.
- What to explain to viva: “All profiles/soil tests/masters are stored in MongoDB and loaded via API.”

### B) Backend (Express)
1) In a terminal:
```bash
cd backend
npm install
npm run seed
npm run seed:demo
npm run dev
```
2) Health URL:
- `GET http://localhost:5000/health` → `{ "status": "ok" }`
3) ML reachability (edge status):
- `GET http://localhost:5000/edge/status`
  - check: `services.mlService.reachable`

### C) ML service (FastAPI inference)
1) One-time model download (PowerShell from repo root):
```powershell
PowerShell -ExecutionPolicy Bypass -File .\ml-service\scripts\download_rice_model.ps1
```
2) Start service:
```bash
cd ml-service
python -m venv .venv
.
# (activate your venv in PowerShell)
. .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app:app --host localhost --port 8001
```
3) Health URL:
- `GET http://localhost:8001/health`
  - check: `modelLoaded: true`

### D) Frontend (React)
1) In another terminal:
```bash
cd frontend
npm install
npm run dev
```
2) Open:
- `http://localhost:5173`

---

## 1) Happy path demo (end-to-end)

### Step 1 — Login
**Page:** `/login`

**What to click/type:**
- Select a demo farmer from dropdown (e.g., **Demo Farmer 1**)
- Click **Login**

**Expected output:**
- You are redirected to Profile page

**Explain to viva (1–2 lines):**
- “This is demo auth: backend creates a session token stored in MongoDB; UI sends `Authorization: Bearer <token>`.”

---

### Step 2 — Profile
**Page:** `/profile`

**What to click/type:**
- Choose a Punjab district (e.g., **Ludhiana**)
- (Optional) set:
  - Season: **Rabi** or **Kharif**
  - Previous crop: **Rice**
  - Soil type: **Loam**
- Click **Save**

**Expected output:**
- “Profile Saved” card shows selected district/season/crop/soil type

**Explain to viva:**
- “Dropdowns come from master collections seeded into MongoDB; we store ObjectId references in `FarmerProfile`.”

---

### Step 3 — Soil Test
**Page:** `/soil`

**Sample values to enter:**
- N: `20`
- P: `12`
- K: `15`
- pH: `6.8`

**What to click:**
- Click **Save Soil Test**

**Expected output:**
- “Soil Saved” card with the entered values

**Explain to viva:**
- “Soil test is stored as a `SoilTest` record linked to the profile; recommendations use the latest soil test.”

---

### Step 4 — Crop Recommendation
**Page:** `/crop`

**What to click/type:**
- Click **Get Recommendation** (or equivalent button on the page)

**Expected output:**
- A ranked list of crops with scores and reasons/warnings

**Explain to viva:**
- “Crop recommendation is rule-based scoring (not ML). Weather alerts are optionally included when available.”

---

### Step 5 — Fertilizer Guidance
**Page:** `/fertilizer`

**What to click/type:**
- (Optional) choose/enter crop if UI provides it
- Click **Generate Guidance**

**Expected output:**
- N/P/K levels (low/normal/high) + safe schedule + safety notes

**Explain to viva:**
- “This module is explainable thresholds; we avoid exact dosing to keep demo safe.”

---

### Step 6 — Weather Forecast
**Page:** `/weather`

**What to click/type:**
- Click **Fetch Weather**
- (Optional) select a location override from dropdown

**Expected output:**
- 7-day forecast cards + alerts chips

**Explain to viva:**
- “We use Open-Meteo; lat/lon is taken from the seeded district centroid in `Location.center`.”

---

### Step 7 — Assistant (Voice guided navigation)
**Page:** `/assistant`

**What to click/type:**
- Use the quick navigation buttons (Crop/Fertilizer/Disease/Weather)
- If supported, click **Start Voice** and say:
  - “Crop recommendation”
  - “Weather forecast”

**Expected output:**
- The app navigates to the matched page

**Explain to viva:**
- “Voice is client-side only; we do not send audio to server. It’s STT/TTS using Web Speech APIs.”

---

### Step 8 — Chatbot (rule-based)
**Page:** `/chat`

**What to click/type:**
1) Type a short question, e.g.:
   - English: `recommend crop`
   - Punjabi: `ਫਸਲ ਸਿਫ਼ਾਰਿਸ਼`
2) Click **Send**

**Expected output:**
- A rule-based template reply (no AI/LLM), guiding the user to the correct feature flow.

**Explain to viva:**
- “The chatbot is a small rule-based endpoint: `POST /chat`. It returns fixed templates based on keyword matching.”
- “We intentionally avoided LLMs for safety, explainability, and offline stability.”

---

### Step 9 — Disease Detection (ML demo)
**Page:** `/disease`

**What to say before demoing:**
- “Model used: pre-trained `prithivMLmods/Rice-Leaf-Disease` downloaded locally.”
- “Scope: Rice leaf disease detection only.”
- “Supported classes are fixed and come from the model config.”

**Supported classes (EXACT same as README):**
- `Bacterialblight`
- `Blast`
- `Brownspot`
- `Healthy`
- `Tungro`

**What to click/type:**
1) Click **Choose file**
2) Select a rice leaf image:
   - From repo: `test-images/blast.jpg` or `test-images/bacterial.png`
3) Click **Predict**

**Expected output:**
- Shows:
  - disease label (top-1)
  - confidence percentage
  - remedy guidance (English/Punjabi)

**Explain to viva:**
- “Frontend uploads the image to backend `/disease/predict`. Backend forwards it to ML `/predict-disease` and enriches with bilingual remedy text.”
- “If confidence < 0.55 (`CONF_THRESHOLD`), ML returns `Unknown` to avoid unsafe over-confident predictions.”

---

## 2) Non-happy scenarios (show at least 4)

### Scenario A — Weather API down / no internet
**How to simulate:**
- Disconnect internet OR block `api.open-meteo.com`.

**What to demo:**
- Open `/weather` → click **Fetch Weather**.

**Expected behavior (current implementation):**
- Request fails and UI shows an error.
- Also mention: `/recommendations/crop` can fail because it calls weather internally when a location is available.

**Explain to viva:**
- “Weather integration is an external dependency. A robust production version would fall back to ‘no weather’ scoring rather than failing.”

---

### Scenario B — ML service down (backend shows ML_UNREACHABLE)
**How to simulate:**
- Stop the ML service (`uvicorn`) or change `ML_BASE_URL` to a wrong port.

**What to demo:**
- Open `/disease` → upload an image → click **Predict**.

**Expected output:**
- Backend returns `502` with:
  - `error: "ML_UNREACHABLE"`
  - hint: start ml-service on port 8001

**Explain to viva:**
- “Backend cleanly reports ML dependency failure; the rest of the app remains usable.”

---

### Scenario C — Model missing/corrupted (MODEL_LOAD_FAILED)
**How to simulate:**
- Rename/delete `ml-service/models/rice_model/` (or run on a fresh machine without downloading).

**What to demo:**
- Visit `http://localhost:8001/health`.

**Expected output:**
- `modelLoaded: false`
- `modelLoadError` contains a Python exception string.

**Explain to viva:**
- “We expose model load status via `/health` to make demos/debugging fast.”

---

### Scenario D — MongoDB down
**How to simulate:**
- Stop MongoDB service.

**What to demo:**
- Restart backend (`npm run dev`).

**Expected behavior:**
- Backend fails to start (DB connection error).
- UI cannot login because `/farmers/demo` cannot load.

**Explain to viva:**
- “DB is a hard dependency for the demo because profile/soil data and demo farmers are stored in MongoDB.”

---

### Scenario E — Invalid soil input (validation)
**How to simulate:**
- On `/soil`, enter an invalid pH such as `20` (outside 0–14) or negative N.

**Expected behavior:**
- Browser input constraints may prevent some invalid values.
- If invalid data reaches backend, backend responds with:
  - HTTP `400`
  - `{ error: "Validation error", details: [...] }`

**Explain to viva:**
- “Validation is enforced server-side using allowlisted parsing helpers; we return consistent 400 errors.”

---

## 3) Optional closing (30 seconds)

Say:
> “Our goal was end-to-end integration: UI + API + DB + external weather + ML microservice, with explainable rule-based advisory logic and a safe pre-trained disease classifier for rice.”
