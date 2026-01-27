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
Small and marginal farmers; low digital literacy considered (see `REVIEW_1_SCOPE.md`).

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

### Text-based architecture diagram
```
React Frontend (5173)
  |
  | HTTP REST
  v
Node/Express Backend (5000)
  |\
  | \-- MongoDB (smart_crop_advisory)
  |
  |---- HTTP --> ML FastAPI (8001)
  |
  \---- HTTPS --> Open-Meteo API
```

## 3. Frontend Details
### Framework used
- React 19
- React Router DOM 7
- Vite 5
- Custom CSS (`frontend/src/index.css`, `frontend/src/App.css`)
- Custom i18n provider (`frontend/src/i18n/I18nContext.jsx`, `translations.js`)

### Total number of screens/pages
10 screens/routes are defined (including Not Found).

### Screen-wise description
Routes (from `frontend/src/App.jsx`):
1. `/` — Dashboard
   - Demo flow steps, quick actions, and edge status display.
2. `/profile` — Farmer Profile
   - Form to save a profile via backend.
3. `/soil` — Soil Input
   - Select a profile and save soil test values.
4. `/crop` — Crop Recommendation
   - Select profile and fetch crop recommendations.
5. `/fertilizer` — Fertilizer Guidance
   - Select profile and fetch fertilizer guidance (optional crop string).
6. `/disease` — Disease Detection
   - Upload a leaf image; show predicted disease and remedy text.
7. `/weather` — Weather
   - Input latitude/longitude and fetch 7-day forecast + alerts.
8. `/assistant` — Assistant
   - Guided navigation + voice mode; can speak chatbot replies.
9. `/chat` — Chatbot
   - Text input; gets rule-based response.
10. `*` — Not Found
   - Basic 404 message.

### User flow (implemented)
Typical demo flow (matches `REVIEW_1_SCOPE.md`):
1) Create farmer profile → 2) Enter soil test → 3) Get crop recommendation → 4) Get fertilizer guidance → optionally check weather and disease scan.

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

### Authentication/authorization
- None implemented in code.

## 5. API Specification
All endpoints are mounted from `backend/src/server.js`.

### 5.1 Health
**Endpoint:** `/health`
- **Method:** GET
- **Purpose:** Backend health check.
- **Input:** None
- **Output:** `{ "status": "ok" }`

### 5.2 Profiles
**Endpoint:** `/profiles`
- **Method:** POST
- **Purpose:** Create farmer profile.
- **Input (JSON):**
  - `location` (string, required)
  - `name`, `soilType`, `previousCrop`, `season` (optional strings)
- **Output:** Created `FarmerProfile` document.

**Endpoint:** `/profiles`
- **Method:** GET
- **Purpose:** List profiles.
- **Input:** None
- **Output:** Array of `FarmerProfile` documents (sorted by `createdAt` desc).

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

### 5.3 Soil Tests
**Endpoint:** `/soil-tests`
- **Method:** POST
- **Purpose:** Create soil test record.
- **Input (JSON):**
  - `profileId` (ObjectId string, required)
  - `n`, `p`, `k`, `ph` (numbers, required)
  - `testDate` (date, optional)
- **Output:** Created `SoilTest` document.

**Endpoint:** `/soil-tests`
- **Method:** GET
- **Purpose:** List soil tests; optionally filter by profile.
- **Input (query):** `profileId` (optional)
- **Output:** Array of `SoilTest` documents.

**Endpoint:** `/soil-tests/:id`
- **Method:** GET
- **Purpose:** Get soil test by id.
- **Input:** URL param `id`
- **Output:** `SoilTest` document or `{ error: "Not found" }`.

### 5.4 Recommendations
**Endpoint:** `/recommendations/crop`
- **Method:** GET
- **Purpose:** Return rule-based crop recommendations for a profile.
- **Input (query):** `profileId` (required)
- **Output (JSON):**
  - `profileId`
  - `used`: includes `soilTestId`, `location`, optional `weather` info
  - `recommendations`: array of `{ crop, score, reasons, warnings }`
  - `missingInputs`: array (may include `weather` when not available)

**Endpoint:** `/recommendations/fertilizer`
- **Method:** GET
- **Purpose:** Return fertilizer guidance using latest soil test.
- **Input (query):**
  - `profileId` (required)
  - `crop` (optional string)
- **Output (JSON):**
  - `profileId`
  - `used`: includes `soilTestId` and `crop`
  - `guidance`: soil summary + schedule + safety notes
  - `missingInputs`

### 5.5 Weather
**Endpoint:** `/weather/forecast`
- **Method:** GET
- **Purpose:** Fetch and normalize 7-day forecast and generate simple alerts.
- **Input (query):** `lat` (number), `lon` (number)
- **Output (JSON):**
  - `location`, `timezone`, `forecast: { days: [...] }`, `cached`, `alerts: [...]`

### 5.6 Disease
**Endpoint:** `/disease/predict`
- **Method:** POST
- **Purpose:** Upload an image and get disease prediction response from ML service + remedy text.
- **Input:** multipart/form-data with field `image`.
- **Output (JSON):**
  - ML fields (`crop`, `disease`, `confidence`, `remedyKey`)
  - `recommendation` (bilingual remedy object if remedyKey is known)

### 5.7 Chat
**Endpoint:** `/chat`
- **Method:** POST
- **Purpose:** Rule-based bilingual chatbot reply.
- **Input (JSON):** `{ message: string, language?: "en" | "pa" }`
- **Output (JSON):** `{ reply, intent, language, meta }`

### 5.8 Edge Status
**Endpoint:** `/edge/status`
- **Method:** GET
- **Purpose:** Check ML service reachability and return a demo “edge readiness” report.
- **Input:** None
- **Output:** JSON with `services.mlService` status and explanatory text.

## 6. Database Design
### Database type
MongoDB.

### Collection names / models
- `FarmerProfile` (collection name derived by Mongoose from model)
- `SoilTest`

### Schema/models
#### FarmerProfile
File: `backend/src/models/FarmerProfile.js`
- `name`: String
- `location`: String (required)
- `soilType`: String
- `previousCrop`: String
- `season`: String
- timestamps: `createdAt`, `updatedAt`

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
- One `FarmerProfile` → many `SoilTest` records (linked via `SoilTest.profileId`).

### Sample record structure
FarmerProfile:
```json
{
  "_id": "<ObjectId>",
  "location": "Ludhiana",
  "name": "<optional>",
  "soilType": "<optional>",
  "previousCrop": "<optional>",
  "season": "<optional>",
  "createdAt": "<ISO date>",
  "updatedAt": "<ISO date>"
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

## 8. Data Flow (End-to-End)
### Step-by-step data movement
1. **UI → Backend (Profile):** user submits profile form → `POST /profiles` → stored in MongoDB.
2. **UI → Backend (Soil):** user selects profile and submits N/P/K/pH → `POST /soil-tests` → stored in MongoDB.
3. **UI → Backend (Crop recommendation):** UI calls `GET /recommendations/crop?profileId=...`.
   - Backend loads profile and latest soil test.
   - Backend resolves location to lat/lon (Punjab lookup).
   - Backend optionally fetches weather forecast + builds alerts.
   - Backend returns rule-based crop recommendations.
4. **UI → Backend (Fertilizer guidance):** UI calls `GET /recommendations/fertilizer?profileId=...&crop=...`.
   - Backend loads latest soil test.
   - Backend returns rule-based fertilizer guidance.
5. **UI → Backend → ML → Backend → UI (Disease):** UI uploads image → `POST /disease/predict`.
   - Backend forwards the file to ML service `/predict-disease`.
   - ML returns stubbed prediction JSON.
   - Backend enriches with remedy text and returns to UI.
6. **UI → Backend → Open-Meteo (Weather):** UI calls `GET /weather/forecast?lat=...&lon=...`.
   - Backend calls Open-Meteo and returns normalized forecast + alerts.

## 9. Limitations
### Technical limitations
- No authentication/authorization.
- Weather caching is in-memory only.
- Location resolution is limited to a hardcoded Punjab mapping.

### Scope limitations (Review-01)
- Crop recommendation scope is limited (rule-based, Wheat/Rice).
- Fertilizer guidance is heuristic.
- Disease prediction is stubbed.

### Academic simplifications
- Deterministic rule-based logic is used for explainability.
- ML service exists mainly to demonstrate pipeline integration.

## 10. Future Enhancements (High-Level)
### Non-ML improvements
- Improve farmer location handling (beyond the current lookup table).
- Improve input validation and user guidance.
- Expand crop coverage beyond Wheat/Rice.

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
**Inputs:** name (optional), location (required), soil type (optional), previous crop (optional), season (optional/recommended).
**Validation:** location required.

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
**Inputs:** crop type (optional), leaf image (required).
**Outputs:** disease name, confidence, treatment recommendation, escalation/safety note; history later.

### B7) Weather Screen
**Requires:** location.
**Outputs:** 7-day forecast and alerts area (rule-based).

### B8) Language Toggle
Switch English (en) / Punjabi (pa) for labels and outputs; fallback to English if missing.
