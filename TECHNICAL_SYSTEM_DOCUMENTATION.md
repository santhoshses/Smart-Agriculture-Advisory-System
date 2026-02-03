# Technical System Documentation

## 1. Project Overview
### Problem statement
Farmers often make decisions (crop selection, basic fertilizer planning, disease response) with limited structured data support. This project provides a web application where a farmer can enter basic profile and soil test data and receive advisory outputs, along with weather forecast and a disease scan flow.

### Objective
Provide a Review-01 level “Smart Crop Advisory” demo system with:
- Farmer profile input
- Soil test input (N, P, K, pH)
- Rule-based crop recommendation
- Rule-based fertilizer guidance
- 7-day weather forecast + simple alerts
- Disease scan flow (image upload) integrated with a local ML service (currently stub)
- English + Punjabi UI

### Target users
Small and marginal farmers; low digital literacy considered.

### Real-world relevance
The project demonstrates how farm advisory workflows can be built using a web UI, a backend API, and external data sources (weather), with a placeholder for ML-based disease inference.

## 2. System Architecture
### Overall architecture (Frontend, Backend, ML, Database)
- **Frontend:** React (Vite) SPA in `frontend/`
- **Backend:** Node.js + Express REST API in `backend/`
- **Database:** MongoDB (via Mongoose models)
- **ML service:** Python FastAPI in `ml-service/` (stub inference)
- **External weather provider:** Open-Meteo public API (called by backend)

### Communication flow
- Frontend calls backend via HTTP REST.
- Backend reads/writes MongoDB.
- Backend calls ML service via HTTP.
- Backend calls Open-Meteo via HTTPS.

### Ports and protocols
- Frontend (dev): `http://127.0.0.1:5173/`
- Backend: `http://localhost:5000` (default `PORT=5000`)
- ML service: `http://127.0.0.1:8001` (default `ML_BASE_URL`)
- Protocols: REST/HTTP between services; HTTPS to Open-Meteo.

### Text-based architecture diagram (end-to-end)

This diagram reflects the **current implementation**, including Voice Bot and rule-based Chatbot.

```
┌───────────────────────────────────────────────┐
│                 User (Farmer)                 │
│   Uses UI in English/Punjabi + optional Voice │
└───────────────────────────────┬───────────────┘
                                │
                                │ Browser (Chrome recommended)
                                │
                                │ 1) SpeechRecognition (voice → text) [optional]
                                │ 2) SpeechSynthesis (text → voice) [optional]
                                v
┌───────────────────────────────────────────────┐
│           React Frontend (Vite Dev)           │
│                 http://127.0.0.1:5173         │
│  Pages: /login, /profile, /soil, /crop, ...   │
│  i18n: frontend/src/i18n (en + pa dictionaries)│
└───────────────────────────────┬───────────────┘
                                │
                                │ HTTP REST + JSON
                                │ Authorization: Bearer <token>
                                v
┌───────────────────────────────────────────────┐
│            Node/Express Backend API           │
│               http://localhost:5000           │
│  Routes: /me, /soil-tests, /recommendations,  │
│         /weather, /disease, /chat, /edge       │
└───────────────┬─────────────────────┬─────────┘
                │                     │
                │ Mongoose            │ HTTP (optional)
                v                     v
┌───────────────────────────────┐   ┌───────────────────────────────┐
│          MongoDB Database      │   │     ML Service (FastAPI stub)  │
│  smart_crop_advisory           │   │     http://127.0.0.1:8001      │
│  Stores: profiles, soil tests, │   │  Endpoint: POST /predict-disease│
│  sessions, masters (Location..)│   │  Returns deterministic JSON     │
└───────────────────────────────┘   └───────────────────────────────┘
                │
                │ HTTPS (internet required)
                v
┌───────────────────────────────────────────────┐
│            Open-Meteo Weather API             │
│        https://api.open-meteo.com/...         │
│  Backend normalizes forecast + builds alerts  │
└───────────────────────────────────────────────┘

Notes:
- Crop & fertilizer recommendations are computed in backend services (rule-based).
- Chatbot replies are template-based (rule-based). No AI/LLM.
- Voice audio is not uploaded/stored; only transcript text is used.
```

## 3. Frontend Details
### Framework used
- React 19
- React Router DOM 7
- Vite 5
- Custom CSS (`frontend/src/index.css`, `frontend/src/App.css`)
- Custom i18n provider (`frontend/src/i18n/I18nContext.jsx`, `translations.js`)

### Total number of screens/pages
11 screens/routes are defined (including Not Found).

### Screen-wise description
Routes (from `frontend/src/App.jsx`):
0. `/login` — Login (demo)
   - Select a seeded demo farmer; stores a token in `localStorage`.
1. `/` — Dashboard
   - Demo flow steps, quick actions, and edge status display.
2. `/profile` — Farmer Profile
   - Edit the current farmer’s single profile (requires auth).
3. `/soil` — Soil Input
   - Save a soil test for the current farmer’s profile (requires auth).
4. `/crop` — Crop Recommendation
   - Fetch crop recommendations for the current farmer (requires auth). Optional location override.
5. `/fertilizer` — Fertilizer Guidance
   - Fetch fertilizer guidance using latest soil test (requires auth). Optional crop string + location override.
6. `/disease` — Disease Detection
   - Upload a leaf image; show predicted disease and remedy text.
7. `/weather` — Weather
   - Fetch 7-day forecast + alerts for current farmer’s saved district (requires auth). Optional location override.
8. `/assistant` — Assistant
   - Guided navigation + voice mode (browser speech recognition). Can speak chatbot replies.
9. `/chat` — Chatbot
   - Text input; gets rule-based response.
10. `*` — Not Found
   - Basic 404 message.

### User flow (implemented)
Typical demo flow:
1) Login → 2) Update Profile → 3) Save Soil Test → 4) Crop Recommendation → 5) Fertilizer Guidance → optionally check Weather and Disease.

Note:
- The frontend enforces demo login for all routes except `/login`.
- Some backend endpoints are still public (e.g., `/chat`, `/edge/status`), but the current UI still requires login to reach those pages.

## 4. Backend Details
### Technology stack
- Node.js
- Express (v5)
- Mongoose (MongoDB ODM)
- Multer (file upload)
- CORS

### Folder structure
- `backend/src/server.js` — Express app, middleware, error handling, route mounting
- `backend/src/db/connect.js` — MongoDB connection
- `backend/src/models/` — Mongoose schemas
- `backend/src/routes/` — API routes
- `backend/src/services/` — advisory logic and integrations

### API design overview
- REST-style endpoints.
- JSON for most endpoints.
- Multipart/form-data for image upload (`/disease/predict`).

Validation notes (current):
- Backend performs basic allowlisting + validation for core CRUD endpoints (profiles, soil tests) and the single-profile endpoints (`/me/profile`).
- Invalid inputs return HTTP 400 with `{ error: "Validation error", details: [...] }`.

### Authentication/authorization
- Demo session-token authentication (no passwords / OTP).
  - `POST /login` issues a UUID token.
  - Token is stored in MongoDB `FarmerSession` (TTL expiry).
  - Client sends `Authorization: Bearer <token>`.
  - Single-profile-per-farmer enforced via `FarmerAccount.profileId`.

Notes:
- `/login` UI uses `GET /farmers/demo` to populate the farmer dropdown.
- Auth is enforced for: `/me/profile`, `/soil-tests`, `/recommendations/*`, `/weather/forecast/by-profile`.
- Other endpoints like `/locations`, `/seasons`, `/soil-types`, `/crops`, `/chat`, `/edge/status` are public.

## 5. API Specification
All endpoints are mounted from `backend/src/server.js`.

### 5.1 Health
**Endpoint:** `/health`
- **Method:** GET
- **Purpose:** Backend health check.
- **Input:** None
- **Output:** `{ "status": "ok" }`

### 5.2 Demo Auth
**Endpoint:** `/farmers/demo`
- **Method:** GET
- **Purpose:** List demo farmers for login dropdown.
- **Output:** array of `{ farmerId, name }`.

**Endpoint:** `/login`
- **Method:** POST
- **Purpose:** Demo login.
- **Input:** `{ name }`
- **Output:** `{ token, farmerId, profileId, expiresAt }`

### 5.3 Current Farmer Profile (single profile)
**Endpoint:** `/me/profile`
- **Method:** GET
- **Auth:** required
- **Purpose:** Fetch the logged-in farmer’s single profile.

**Endpoint:** `/me/profile`
- **Method:** PUT
- **Auth:** required
- **Purpose:** Update the logged-in farmer’s single profile.

### 5.4 Domain masters (dropdown sources)
These are used by the Profile screen.

**Endpoint:** `/locations`
- **Method:** GET
- **Purpose:** List active Punjab locations for dropdowns.

**Endpoint:** `/seasons`
- **Method:** GET
- **Purpose:** List active seasons.

**Endpoint:** `/soil-types`
- **Method:** GET
- **Purpose:** List active soil types.

**Endpoint:** `/crops`
- **Method:** GET
- **Purpose:** List active crops.

### 5.5 Profiles (legacy CRUD; still present)
**Endpoint:** `/profiles`
- **Method:** POST
- **Purpose:** Create farmer profile.
- **Input (JSON):**
  - `locationId` (ObjectId string, required)
  - `name` (optional string)
  - `soilTypeId`, `previousCropId`, `seasonId` (optional ObjectId strings)
  - Legacy compatibility fields may exist in older records (`locationText`, `soilTypeText`, `previousCropText`, `seasonText`) but are not written by the current UI.
- **Output:** Created `FarmerProfile` document.

Notes:
- These legacy endpoints do **not** enforce demo login in the backend.
- The current UI uses `/me/profile` instead.

**Endpoint:** `/profiles`
- **Method:** GET
- **Purpose:** List profiles.
- **Input:** None
- **Output:** Array of `FarmerProfile` documents (sorted by `createdAt` desc), with `locationId` populated.

**Endpoint:** `/profiles/:id`
- **Method:** GET
- **Purpose:** Get profile by id.
- **Input:** URL param `id`
- **Output:** `FarmerProfile` document or `{ error: "Not found" }`.

**Endpoint:** `/profiles/:id`
- **Method:** PUT
- **Purpose:** Update profile by id.
- **Input:** URL param `id` + JSON body fields
- **Output:** Updated `FarmerProfile` or `{ error: "Not found" }`.

### 5.6 Soil Tests
**Endpoint:** `/soil-tests`
- **Auth:** required
- **Method:** POST
- **Purpose:** Create soil test record for the logged-in farmer’s profile.
- **Input (JSON):**
  - `n`, `p`, `k`, `ph` (numbers, required)
  - `testDate` (date, optional)
  - `profileId` (optional; if provided must match the logged-in farmer profile)

**Endpoint:** `/soil-tests`
- **Auth:** required
- **Method:** GET
- **Purpose:** List soil tests for the logged-in farmer’s profile.

**Endpoint:** `/soil-tests/:id`
- **Auth:** required
- **Method:** GET
- **Purpose:** Get a soil test by id (must belong to logged-in farmer).

### 5.7 Recommendations
**Endpoint:** `/recommendations/crop`
- **Method:** GET
- **Purpose:** Return rule-based crop recommendations for a profile.
- **Auth:** required
- **Input (query):** `locationId` (optional override)
- **Output (JSON):**
  - `profileId`
  - `used`: includes `soilTestId`, `location`, optional `weather` info
  - `recommendations`: array of `{ crop, score, reasons, warnings }`
  - `missingInputs`: array (may include `weather` when not available)

**Endpoint:** `/recommendations/fertilizer`
- **Method:** GET
- **Purpose:** Return fertilizer guidance using latest soil test.
- **Auth:** required
- **Input (query):**
  - `crop` (optional string)
  - `locationId` (optional override)
- **Output (JSON):**
  - `profileId`
  - `used`: includes `soilTestId` and `crop`
  - `guidance`: soil summary + schedule + safety notes
  - `missingInputs`

### 5.8 Weather
**Endpoint:** `/weather/forecast`
- **Method:** GET
- **Purpose:** Fetch and normalize 7-day forecast and generate simple alerts.
- **Input (query):** `lat` (number), `lon` (number)
- **Output (JSON):**
  - `location`, `timezone`, `forecast: { days: [...] }`, `cached`, `alerts: [...]`

**Endpoint:** `/weather/forecast/by-profile`
- **Method:** GET
- **Purpose:** Fetch 7-day forecast using the profile’s saved Punjab district (Location master).
- **Auth:** required
- **Input (query):** `locationId` (optional override)
- **Output (JSON):**
  - Same as `/weather/forecast` plus:
  - `used: { profileId, locationId, locationName, lat, lon, source }`

Note:
- `/weather/forecast` is public (requires `lat`/`lon`).
- `/weather/forecast/by-profile` is auth-protected and uses the logged-in farmer profile.

### 5.9 Disease
**Endpoint:** `/disease/predict`
- **Method:** POST
- **Purpose:** Upload an image and get disease prediction response from ML service + remedy text.
- **Input:** multipart/form-data with field `image`.
- **Output (JSON):**
  - ML fields (`crop`, `disease`, `confidence`, `remedyKey`)
  - `recommendation` (bilingual remedy object if remedyKey is known)

Notes:
- This endpoint is currently **not** auth-protected in the backend.
- It depends on the FastAPI service at `ML_BASE_URL` and returns HTTP 502 if the ML service is unreachable.

### 5.10 Chat
**Endpoint:** `/chat`
- **Method:** POST
- **Purpose:** Rule-based bilingual chatbot reply.
- **Input (JSON):** `{ message: string, language?: "en" | "pa" }`
- **Output (JSON):** `{ reply, intent, language, meta }`

### 5.11 Edge Status
**Endpoint:** `/edge/status`
- **Method:** GET
- **Purpose:** Check ML service reachability and return a demo “edge readiness” report.
- **Input:** None
- **Output:** JSON with `services.mlService` status and explanatory text.

## 6. Database Design
### Database type
MongoDB.

### Collection names / models
- `FarmerAccount` (demo farmers)
- `FarmerSession` (demo sessions; TTL)
- `FarmerProfile` (single profile per farmer)
- `SoilTest`
- `Location` (Punjab location master list)
- `Season` (master list)
- `SoilType` (master list)
- `Crop` (master list)

### Schema/models
#### FarmerAccount
File: `backend/src/models/FarmerAccount.js`
- `name`: String (required, unique)
- `email`: String (optional)
- `phone`: String (optional)
- `profileId`: ObjectId (ref `FarmerProfile`, required)

#### FarmerSession
File: `backend/src/models/FarmerSession.js`
- `token`: String (required, unique)
- `farmerId`: ObjectId (ref `FarmerAccount`, required)
- `expiresAt`: Date (required)
- TTL index on `expiresAt`

#### FarmerProfile
File: `backend/src/models/FarmerProfile.js`
- `farmerId`: ObjectId (ref `FarmerAccount`, unique+sparse; may be missing for legacy profiles)
- `name`: String
- `locationId`: ObjectId (ref `Location`, required)
- `locationText`: String (legacy/backward-compat; optional)
- `soilTypeId`: ObjectId (ref `SoilType`, optional)
- `seasonId`: ObjectId (ref `Season`, optional)
- `previousCropId`: ObjectId (ref `Crop`, optional)
- `soilTypeText`, `seasonText`, `previousCropText`: legacy strings (optional)
- timestamps: `createdAt`, `updatedAt`

#### Season
File: `backend/src/models/Season.js`
- `code`: String (unique)
- `name.en`, `name.pa`
- `active`: Boolean

#### SoilType
File: `backend/src/models/SoilType.js`
- `code`: String (unique)
- `name.en`, `name.pa`
- `active`: Boolean

#### Crop
File: `backend/src/models/Crop.js`
- `code`: String (unique)
- `name.en`, `name.pa`
- `active`: Boolean

#### Location
File: `backend/src/models/Location.js`
- `code`: String (unique)
- `state`: String (default `Punjab`)
- `type`: "district"
- `name.en`: String
- `name.pa`: String
- `center.lat`, `center.lon`: Number (district centroid)
- `active`: Boolean
- timestamps

#### SoilTest
File: `backend/src/models/SoilTest.js`
- `profileId`: ObjectId (ref `FarmerProfile`, required)
- `n`: Number (required, min 0)
- `p`: Number (required, min 0)
- `k`: Number (required, min 0)
- `ph`: Number (required, min 0, max 14)
- `testDate`: Date (optional)
- timestamps: `createdAt`, `updatedAt`

### Relationships
- One `FarmerAccount` → exactly one `FarmerProfile` (linked via `FarmerAccount.profileId`).
- One `FarmerAccount` → many `FarmerSession` records (active tokens).
- One `Location` → many `FarmerProfile` records (linked via `FarmerProfile.locationId`).
- One `Season` → many `FarmerProfile` records (linked via `FarmerProfile.seasonId`).
- One `SoilType` → many `FarmerProfile` records (linked via `FarmerProfile.soilTypeId`).
- One `Crop` → many `FarmerProfile` records (linked via `FarmerProfile.previousCropId`).
- One `FarmerProfile` → many `SoilTest` records (linked via `SoilTest.profileId`).

### Sample record structure
FarmerProfile:
```json
{
  "_id": "<ObjectId>",
  "locationId": "<Location ObjectId>",
  "locationText": "<optional legacy string>",
  "name": "<optional>",
  "soilTypeId": "<optional SoilType ObjectId>",
  "previousCropId": "<optional Crop ObjectId>",
  "seasonId": "<optional Season ObjectId>",
  "createdAt": "<ISO date>",
  "updatedAt": "<ISO date>"
}
```

Location:
```json
{
  "_id": "<ObjectId>",
  "code": "pb_ludhiana",
  "state": "Punjab",
  "type": "district",
  "name": { "en": "Ludhiana", "pa": "ਲੁਧਿਆਣਾ" },
  "center": { "lat": 30.901, "lon": 75.8573 },
  "active": true
}
```
SoilTest:
```json
{
  "_id": "<ObjectId>",
  "profileId": "<FarmerProfile ObjectId>",
  "n": 40,
  "p": 20,
  "k": 25,
  "ph": 7.2,
  "createdAt": "<ISO date>",
  "updatedAt": "<ISO date>"
}
```

## 7. Machine Learning Module
### Current ML status
Stubbed (dummy output).

### Service architecture
- FastAPI app in `ml-service/app.py`.
- CORS enabled.
- Endpoints:
  - `GET /health`
  - `POST /predict-disease`

### Input/output format
- **Input:** multipart/form-data `image` file.
- **Output:**
```json
{
  "crop": "wheat",
  "disease": "leaf_rust",
  "confidence": 0.78,
  "remedyKey": "wheat_leaf_rust_basic"
}
```

### Predictions: real or dummy
Dummy/deterministic: always returns the same disease response.

### Limitations
- No model inference logic is present.
- No multiple disease classes are implemented.

### Voice bot / chatbot clarification (current implementation)
- The **Voice Bot** is browser-based and uses Web Speech APIs (SpeechRecognition + SpeechSynthesis).
- The **Chatbot** is rule-based (predefined keywords + fixed bilingual templates). There is **no AI/LLM**.

## 8. Data Flow (End-to-End)
### Step-by-step data movement
1. **UI → Backend (Login):** user selects demo farmer → `POST /login` → frontend stores token.
2. **UI → Backend (Profile):** UI loads/updates current profile via `GET /me/profile` and `PUT /me/profile`.
3. **UI → Backend (Soil):** UI submits N/P/K/pH → `POST /soil-tests` (auth required) → stored in MongoDB.
4. **UI → Backend (Crop recommendation):** UI calls `GET /recommendations/crop` (auth required).
   - Backend loads profile and latest soil test.
   - Backend uses `Location.center` lat/lon for the profile.
   - Backend optionally fetches weather forecast + builds alerts.
   - Backend returns rule-based crop recommendations.
5. **UI → Backend (Fertilizer guidance):** UI calls `GET /recommendations/fertilizer?crop=...` (auth required).
   - Backend loads latest soil test.
   - Backend returns rule-based fertilizer guidance.
6. **UI → Backend → ML → Backend → UI (Disease):** UI uploads image → `POST /disease/predict`.
   - Backend forwards the file to ML service `/predict-disease`.
   - ML returns stubbed prediction JSON.
   - Backend enriches with remedy text and returns to UI.
7. **UI → Backend → Open-Meteo (Weather):** UI calls `GET /weather/forecast/by-profile` (auth required).
   - Backend resolves district centroid via `Location.center`.
   - Backend calls Open-Meteo and returns normalized forecast + alerts.

Additional UI-supported flows:
- **Assistant voice navigation:** `/assistant` uses browser speech recognition to navigate (and optionally speaks chatbot responses).
- **Chatbot:** `/chat` is rule-based and bilingual.
- **Edge status:** `/edge/status` checks ML health (`/health` on the ML service).

## 9. Limitations
### Technical limitations
- Demo authentication only (session token; no real OTP/password).
- Weather caching is in-memory only.
- Location master data is currently limited to a seeded Punjab district list.

Notes:
- The current UI uses the **profile-based** weather flow (`/weather/forecast/by-profile`) and does not require manual lat/lon entry.
- Weather still depends on external internet connectivity (Open-Meteo).

### Scope limitations (Review-01)
- Crop recommendation scope is limited (rule-based, Punjab-focused, 8 crops).
- Fertilizer guidance is heuristic.
- Disease prediction is stubbed (deterministic output from ML service).

### Academic simplifications
- Deterministic rule-based logic is used for explainability.
- ML service exists mainly to demonstrate pipeline integration.

## 10. Future Enhancements (High-Level)
### Non-ML improvements
- Improve farmer location handling (beyond the current lookup table).
- Improve input validation and user guidance.
- Expand crop coverage beyond the current Punjab demo crop set.

### ML improvements
- Replace stubbed prediction with a real model.
- Add support for multiple crops/diseases.

---

## Appendix A: Architecture Lock & Component Responsibilities (Review-01)
_Source merged from former `ARCHITECTURE_LOCK.md`._

### A1) High-level architecture (locked)
The system is split into 5 parts:
1. **Frontend Web App (React)**
2. **Backend API / Orchestrator (Node.js + Express)**
3. **ML Inference Service (Python: FastAPI or Flask)**
4. **Database (MongoDB)**
5. **External Weather Provider (Public Weather API)**

This separation is intentional so that ML, weather, and UI can evolve independently.

### A2) Component responsibilities (what each part owns)

#### Frontend Web App (React)
**Owns**
- User experience and navigation (simple, mobile-friendly flows)
- Data entry forms: farmer profile, soil parameters, image upload
- Display of results: crop recommendations, fertilizer plan, disease result + treatment, weather dashboard
- Language toggle (English / Punjabi Gurmukhi)

**Does NOT own**
- Business rules (crop/fertilizer logic)
- ML inference logic
- Direct database access

#### Backend API / Orchestrator (Node.js + Express)
**Owns**
- Input validation and consistent error handling
- Orchestration of features (connect UI to DB, ML service, and weather)
- Business logic (v1): crop recommendation (rule-based), fertilizer guidance (rule-based)
- Persistence operations (via MongoDB)
- Mapping predicted disease → treatment recommendation text
- Weather normalization (convert external weather response into app-friendly output)

**Does NOT own**
- ML model internals (kept inside the Python service)
- UI rendering decisions

#### ML Inference Service (Python)
**Owns**
- Image preprocessing (as required by the model)
- Disease inference (either stub for Review-01 stability or real pre-trained model)
- Returning structured prediction results (disease label + confidence)

**Does NOT own**
- Treatment text content and multilingual phrasing
- Storage of farmer profiles/history

#### Database (MongoDB)
**Owns**
- Persistent storage for core records (profiles, soil tests) and optional future records (advisory history, disease scan history, weather cache)

**Does NOT own**
- Business rules
- ML computation

#### External Weather Provider (Public API)
**Owns**
- Supplying raw weather forecast data

### A3) Non-functional expectations (Review-01)
- Reliability over completeness
- Explainability (rule-based)
- Usability (minimal steps, bilingual)
- Local demo readiness

### A4) Explicit boundaries (avoid scope creep)
- No on-device/offline ML requirement for Review-01
- No training a model from scratch
- No SMS/WhatsApp alerts
- No free-form chatbot (guided/template only)

---

## Appendix B: UI Data Contracts (Frontend-only) — Review-01
_Source merged from former `UI_DATA_CONTRACTS.md`._

### B0) Global UI rules
- Keep forms minimal and farmer-friendly.
- Provide clear labels and helper text.
- Validate inputs on the client for obvious errors.
- Support bilingual display (English + Punjabi Gurmukhi).
- Show safe error messages (no technical stack traces).

### B1) Dashboard Screen
**Shows** quick entry points to Profile, Soil, Crop, Fertilizer, Disease, Weather, plus placeholders for recent activity.

### B2) Farmer Profile Screen
**Inputs:** name (optional), Punjab district (required), soil type (optional), previous crop (optional), season (optional/recommended).
**Validation:** locationId required.

### B3) Soil Input Screen (NPK / pH)
**Inputs:** N, P, K, pH (required), test date (optional).
**Validation:** N/P/K non-negative; pH within 0–14.

### B4) Crop Recommendation Screen
**Requires:** location + soil values.
**Outputs:** ranked recommendations with reasons and warnings; missing-input notice.

### B5) Fertilizer Guidance Screen
**Requires:** soil values.
**Recommended:** selected crop.
**Outputs:** NPK guidance, schedule, safety notes; missing-input notice.

### B6) Disease Detection Screen
**Inputs:** leaf image (required).
**Outputs:** disease name, confidence, treatment recommendation, escalation/safety note; history later.

### B7) Weather Screen
**Requires:** saved profile (district already selected during profile creation).
**Outputs:** 7-day forecast and alerts area (rule-based).

### B8) Language Toggle
Switch English (en) / Punjabi (pa) for labels and outputs; fallback to English if missing.
