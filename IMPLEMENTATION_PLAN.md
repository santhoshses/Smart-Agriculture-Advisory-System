# Smart Crop Advisory System (Review-01) — Implementation Plan (Status-Aligned)

This document is kept **status-aligned with the current codebase**. The code is the source of truth.

Scope note:
- This plan focuses on the Review-01 demo system as implemented.
- Items are marked as ✅ Implemented, 🟡 Partially implemented, or ❌ Not implemented.

## 1) Goal (What we are building)
A **responsive web-based Smart Crop Advisory System** for small and marginal farmers that provides:
- Crop recommendations (rule-based) using farmer profile + soil parameters + season/location
- Fertilizer guidance (NPK/pH based + simple schedule)
- Disease identification from crop/leaf images (via a local Python ML inference service)
- Weather forecast + simple in-app alerts (7-day)
- Punjabi (Gurmukhi) + English language support
- Voice-guided interface (guided keywords)

## 2) System boundaries (What we will and won’t do)
### In scope for the overall project
- Frontend (React)
- Backend orchestration service (Node/Express)
- Database (MongoDB)
- Python ML inference service (FastAPI/Flask)
- Weather integration (public weather API)
- Localization (English + Punjabi Gurmukhi)
- Guided voice UI

### Explicitly out of scope for Review-01 demo
- Full offline/on-device ML inference
- Training a model from scratch
- SMS/WhatsApp alerting (in-app only)
- Advanced NLP chatbot (free-form) — use templates/guided flows first
- Complex user management and KYC (keep authentication optional/minimal)

Status note:
- A **demo authentication** flow is implemented (session-token, no OTP/password). It is not production authentication.

---

# Phase 0: Planning & Architecture Lock (status)

## Step 0.1 — Confirm demo scope and success criteria
**What will be built**
- A written scope checklist for Review-01: crop set (Punjab demo crop list), disease categories (3–5 per crop), and the exact user flows to demonstrate.

**Why this step exists**
- Prevent scope creep and ensure the demo is review-ready.

**Out of scope (this step)**
- Any code, dataset/model download, or UI development.

**Review / test before proceeding**
- Faculty/team agrees on:
  - 2–3 main demo flows
  - Inputs required (profile, soil, image)
  - Expected outputs to show

**Hard STOP point**
- STOP once demo flows and success criteria are written and approved.

**Status:** 🟡 Partially implemented
- Scope exists in the repository history and can be re-documented if needed.

### ⛔ STOP & REVIEW CHECKPOINT
**Manually verify**
- Scope is realistic for timeline
- All stakeholders agree on “what will be shown”

**STOP here**
- Do not proceed to Phase 1 until you approve the Review-01 scope.

---

## Step 0.2 — Lock architecture and responsibilities
**What will be built**
- A high-level architecture decision sheet:
  - React UI
  - Node/Express API (main orchestration)
  - Python ML service for inference
  - MongoDB for persistence
  - Weather API integration

**Why this step exists**
- Ensures clear ownership and separation (frontend vs backend vs ML service).

**Out of scope (this step)**
- Designing exact API routes or database schemas in detail.

**Review / test before proceeding**
- Confirm:
  - ML service runs locally (edge-style) for low latency
  - Weather still needs internet
  - Data that must be stored (profiles, soil tests, advisory results, disease scans)

**Hard STOP point**
- STOP once the architecture sheet is signed off.

**Status:** ✅ Implemented
- The current repo follows the described split: React frontend, Express backend, MongoDB, optional FastAPI ML stub, external weather.

### ⛔ STOP & REVIEW CHECKPOINT
**Manually verify**
- Everyone understands the 4 components and their responsibilities

**STOP here**
- Do not proceed until architecture responsibilities are approved.

---

# Phase 1: Frontend (status)

## Step 1.1 — Create UI navigation and empty pages
**What will be built**
- A responsive UI shell with navigation and placeholder pages:
  - Home/Dashboard
  - Farmer Profile
  - Soil Input (NPK/pH)
  - Crop Recommendation (placeholder)
  - Fertilizer Guidance (placeholder)
  - Disease Detection (image upload UI only, no prediction yet)
  - Weather (placeholder)
  - Language toggle (UI only)

**Why this step exists**
- Reviewers can see the product shape early.
- Allows fast iteration on user experience before backend complexity.

**Out of scope (this step)**
- No backend calls, no database, no ML integration.

**Review / test before proceeding**
- Manual UI verification:
  - Works on mobile screen size
  - Navigation works
  - Forms capture inputs (but don’t submit to backend)

**Hard STOP point**
- STOP when all pages exist and navigation works end-to-end.

**Status:** ✅ Implemented
- Pages exist and are wired to backend.
- Current routes include: `/login`, `/`, `/profile`, `/soil`, `/crop`, `/fertilizer`, `/weather`, `/disease`, `/assistant`, `/chat`.

### ⛔ STOP & REVIEW CHECKPOINT
**Manually verify**
- Page flow matches the planned demo story
- UX is simple enough for low digital literacy

**STOP here**
- Proceed only after UI skeleton approval.

---

## Step 1.2 — Define UI data contracts (frontend-only)
**What will be built**
- A frontend “data shape” document describing what each screen needs (fields, validation rules, and display sections), without defining APIs.

**Why this step exists**
- Prevents mismatch later when backend is built.

**Out of scope (this step)**
- No API endpoints, no schemas, no storage.

**Review / test before proceeding**
- Validate:
  - All required inputs exist (location, soil, crop history)
  - Outputs have a place in UI (recommendations, schedule, treatment)

**Hard STOP point**
- STOP when UI data needs are fully listed and agreed.

**Status:** 🟡 Partially implemented
- Data contracts are described in `TECHNICAL_SYSTEM_DOCUMENTATION.md` Appendix B.

### ⛔ STOP & REVIEW CHECKPOINT
**Manually verify**
- UI fields are minimal and practical
- Output screens are understandable

**STOP here**
- Proceed only after you approve the UI data contracts.

---

# Phase 2: Backend + Database Foundations (status)

## Step 2.1 — Backend skeleton and health checks (internal)
**What will be built**
- A minimal backend service skeleton ready to grow into:
  - request validation
  - logging
  - error handling
  - environment separation (dev/local)

**Why this step exists**
- Provides a stable base for all later features.

**Out of scope (this step)**
- No business rules, no ML, no weather integration.

**Review / test before proceeding**
- Manual verification:
  - Service starts reliably
  - Basic request/response path works
  - Error handling is consistent

**Hard STOP point**
- STOP when backend skeleton is stable.

**Status:** ✅ Implemented
- `GET /health` exists.
- Central error handling exists in the Express app.

### ⛔ STOP & REVIEW CHECKPOINT
**Manually verify**
- Backend can run locally without special setup
- Logs and errors are readable for debugging

**STOP here**
- Proceed only after backend skeleton approval.

---

## Step 2.2 — Database modeling and persistence layer
**What will be built**
- MongoDB collections design (conceptual level):
  - farmer profile + master data references
  - soil test records
  - demo login sessions

Implementation note (current codebase):
- Crop recommendations and fertilizer guidance are **computed on demand** (not stored as “history tables”).
- Weather cache is **in-memory** inside the backend process (not stored in MongoDB).
- Disease scan results are **not persisted** (the UI shows the response only).

**Why this step exists**
- You need persistence before you can trust outputs across sessions.

**Out of scope (this step)**
- No recommendation logic, no ML prediction, no weather fetching.

**Review / test before proceeding**
- Manual verification:
  - Can create/read/update profile and soil test records
  - Data is stored consistently and can be retrieved

**Hard STOP point**
- STOP when CRUD for core records is stable.

**Status:** ✅ Implemented
- MongoDB models exist for `Location`, `Season`, `SoilType`, `Crop`, `FarmerProfile`, `SoilTest`.
- Demo auth models exist for `FarmerAccount` and `FarmerSession`.
- Seeds exist: `npm run seed` and `npm run seed:demo`.

### ⛔ STOP & REVIEW CHECKPOINT
**Manually verify**
- Data is saved and shown back correctly
- Input validation prevents missing/invalid NPK/pH

**STOP here**
- Proceed only after persistence is accepted.

---

# Phase 3: Core Advisory Logic (status)

## Step 3.1 — Implement rule engine for crop recommendation (v1)
**What will be built**
- A deterministic rule-based recommendation engine using:
  - location/season (basic)
  - soil NPK/pH ranges
  - previous crop history (simple rotation constraints)

**Why this step exists**
- Rule-based logic is explainable and review-friendly.

**Out of scope (this step)**
- No ML-based crop recommendation
- No complex agronomy optimization

**Review / test before proceeding**
- Test with sample inputs:
  - Low/high nitrogen cases
  - pH too low/high cases
  - Rotation constraints (avoid repeating same crop)
- Verify outputs are consistent and easy to explain.

**Hard STOP point**
- STOP when recommendation rules are documented and produce stable outputs.

**Status:** ✅ Implemented
- Rule engine implemented in `backend/src/services/cropRecommendationService.js`.
- Current crop scope (as implemented in `CROP_CONFIG`) includes **8 Punjab-relevant crops**:
  - wheat, rice, maize, cotton, barley, mustard, moong, sunflower

### ⛔ STOP & REVIEW CHECKPOINT
**Manually verify**
- Recommendations make basic agronomic sense
- Rules are documented for faculty review

**STOP here**
- Proceed only after you approve the crop rules.

---

## Step 3.2 — Implement fertilizer guidance (v1)
**What will be built**
- Fertilizer guidance module that produces:
  - recommended NPK ratio suggestions
  - a simple application schedule (e.g., baseline + split doses)
  - safety notes (avoid overuse)

**Why this step exists**
- Fertilizer advice is a key value proposition and measurable output.

**Out of scope (this step)**
- No real-time soil sensor integration
- No brand-specific product recommendations

**Review / test before proceeding**
- Verify:
  - schedule is readable and actionable
  - output changes when NPK/pH changes
  - warnings show for extreme values

**Hard STOP point**
- STOP when fertilizer plan output is stable and understandable.

**Status:** ✅ Implemented
- Implemented in `backend/src/services/fertilizerGuidanceService.js`.
- Crop-specific schedules only for wheat/rice; other crop values fall back to a generic schedule.

### ⛔ STOP & REVIEW CHECKPOINT
**Manually verify**
- Fertilizer plan language is safe (no risky dosing)
- Output is deterministic and explainable

**STOP here**
- Proceed only after fertilizer logic approval.

---

# Phase 4: ML Disease Detection (status)

## Step 4.1 — ML service skeleton (stub-first)
**What will be built**
- A Python inference service interface that can accept an image and return a structured prediction.
- Start with a **stub response** if real model integration is risky.

**Why this step exists**
- Keeps system integration moving even if model is not ready.

**Out of scope (this step)**
- No model training
- No performance optimization

**Review / test before proceeding**
- Manual verification:
  - image upload reaches the ML service
  - response is received reliably
  - errors are handled gracefully (bad image, missing image)

**Hard STOP point**
- STOP when the end-to-end “upload → prediction response” pipeline works with stub.

**Status:** ✅ Implemented
- FastAPI stub exists in `ml-service/app.py`.
- Backend forwards uploads via `POST /disease/predict` to `ML_BASE_URL/predict-disease`.
- Backend enriches response with bilingual remedy text.

### ⛔ STOP & REVIEW CHECKPOINT
**Manually verify**
- UI shows a prediction result card without crashing
- Failure cases show friendly messages

**STOP here**
- Proceed only after stub-based integration is stable.

---

## Step 4.2 — Replace stub with pre-trained model (if ready)
**What will be built**
- Connect a pre-trained PlantVillage-style model to the inference service.
- Add basic image preprocessing and confidence reporting.

**Why this step exists**
- Enables real disease detection for the demo.

**Out of scope (this step)**
- No new dataset collection
- No training from scratch
- No advanced explainability (Grad-CAM etc.)

**Review / test before proceeding**
- Validate with a small set of known sample images:
  - 3–5 diseases per crop
  - ensure stable inference time locally

**Hard STOP point**
- STOP when model predictions are consistent enough for demo.

**Status:** ❌ Not implemented
- ML service remains a deterministic stub.

### ⛔ STOP & REVIEW CHECKPOINT
**Manually verify**
- Predicted disease labels match expected examples reasonably
- Treatment recommendations map correctly to predicted labels

**STOP here**
- Proceed only after model accuracy is acceptable for review.

---

# Phase 5: Weather Forecast + In-App Alerts (status)

## Step 5.1 — Weather data integration (normalized)
**What will be built**
- Weather module that fetches and displays:
  - 7-day forecast
  - key metrics currently implemented: max/min temperature, precipitation probability max, rain sum
- Include simple caching to avoid excessive calls.

**Why this step exists**
- Farmers need timely weather context to plan spraying and irrigation.

**Out of scope (this step)**
- No SMS/WhatsApp
- No hyper-local station data

**Review / test before proceeding**
- Verify:
  - forecast matches the selected location
  - UI renders clearly on mobile
  - fallback messaging when weather API is unavailable

**Hard STOP point**
- STOP when forecast view is stable and resilient.

**Status:** ✅ Implemented
- Implemented in `backend/src/services/weatherService.js` (Open-Meteo + in-memory cache).
- UI uses profile-based district centroid via `GET /weather/forecast/by-profile`.

### ⛔ STOP & REVIEW CHECKPOINT
**Manually verify**
- Location mapping works (city/lat-long)
- App does not break when weather provider fails

**STOP here**
- Proceed only after you approve weather dashboard behavior.

---

## Step 5.2 — Simple weather-based alerts (in-app)
**What will be built**
- Basic rule-based alerts, e.g.:
  - heavy rain risk
  - high temperature
  - humidity conditions that may increase disease risk (simple)

**Why this step exists**
- Adds visible “real-time advisory” value in the demo.

**Out of scope (this step)**
- No complex agronomic alert modeling
- No push notifications outside the app

**Review / test before proceeding**
- Simulate weather scenarios and confirm alerts appear correctly.

**Hard STOP point**
- STOP when alert rules are stable and not spammy.

**Status:** ✅ Implemented
- Implemented in `backend/src/services/weatherAlertService.js`.
- Alert messages are currently returned in English.

### ⛔ STOP & REVIEW CHECKPOINT
**Manually verify**
- Alerts are actionable and not misleading
- UI shows alerts clearly

**STOP here**
- Proceed only after alert logic is accepted.

---

# Phase 6: Localization & Guided Assistant (status)

## Step 6.1 — Localization foundation (English + Punjabi Gurmukhi)
**What will be built**
- Language toggle across the application.
- Localized text for:
  - UI labels
  - recommendations
  - fertilizer schedule
  - disease treatment messages
  - weather alert messages

**Why this step exists**
- Addresses the review comment about language barrier.

**Out of scope (this step)**
- No free-form chatbot
- No advanced translation engine

**Review / test before proceeding**
- Manual verification:
  - all key screens switch languages
  - Punjabi text renders correctly (Gurmukhi)
  - no mixed-language broken strings

**Hard STOP point**
- STOP when all core screens are fully bilingual.

**Status:** 🟡 Partially implemented
- UI labels are bilingual (English + Punjabi) via `frontend/src/i18n/translations.js`.
- Advisory content strings are mixed:
  - Disease remedy content is bilingual.
  - Crop recommendation reasons/warnings are currently English.
  - Fertilizer schedule and guidance text are currently English.
  - Weather alert messages are currently English.

### ⛔ STOP & REVIEW CHECKPOINT
**Manually verify**
- Punjabi translations are accurate and farmer-friendly
- No critical content remains untranslated

**STOP here**
- Proceed only after language quality review.

---

## Step 6.2 — Guided “assistant” flow (template-based)
**What will be built**
- A guided assistant (not free chat) that:
  - asks user to choose tasks (crop advice / fertilizer / disease / weather)
  - routes to the right screen
  - summarizes results in the chosen language

**Why this step exists**
- Improves usability without needing risky NLP.

**Out of scope (this step)**
- No NLP intent classification
- No LLM integration

**Review / test before proceeding**
- Verify:
  - user can complete tasks through guided options
  - summaries are correct and localized

**Hard STOP point**
- STOP once guided assistant flow works end-to-end.

**Status:** ✅ Implemented
- Assistant page provides guided navigation buttons.
- Voice mode uses browser speech recognition and can also speak chatbot replies.

### ⛔ STOP & REVIEW CHECKPOINT
**Manually verify**
- Assistant reduces user effort (fewer clicks)
- Flow is understandable for low digital literacy

**STOP here**
- Proceed only after guided assistant acceptance.

---

# Phase 7: Voice Interface (status)

## Step 7.1 — Voice input/output using browser capabilities
**What will be built**
- A guided voice interface using browser speech features:
  - voice prompts in English/Punjabi
  - limited command set (guided)
  - voice reads out final advisory summaries

**Why this step exists**
- Directly addresses “low digital literacy → Voice Bot” review comment.

**Out of scope (this step)**
- No server-side ASR/TTS stack
- No open-ended voice chatbot
- No noisy-environment robustness guarantees

**Review / test before proceeding**
- Manual verification:
  - voice works in supported browsers
  - language switching works
  - fallback to text works if microphone permission denied

**Hard STOP point**
- STOP after voice works for 2–3 guided flows.

**Status:** ✅ Implemented
- Implemented in `frontend/src/pages/AssistantPage.jsx` + `frontend/src/voice/useVoiceCommands.js`.
- Works only in browsers that support SpeechRecognition.

### ⛔ STOP & REVIEW CHECKPOINT
**Manually verify**
- Voice mode does not block normal usage
- Prompts are short, clear, and bilingual

**STOP here**
- Proceed only after explicit approval because this adds UX complexity.

---

# Final Review-01 Demo Checklist (must be true before submission)
1. Demo login works: `/login` lists demo farmers and stores a token.
2. UI flows complete: Profile → Soil → Crop → Fertilizer → Weather.
3. Disease scan works end-to-end **only if** the ML service is running (stub) and returns remedy text.
4. Weather page shows 7-day forecast and alerts (internet required for Open-Meteo).
5. Data persistence: profile and soil tests are saved and visible.
6. Language toggle changes UI labels (advisory content is partially bilingual).
7. Demo script: repeatable with known sample inputs.

---

# Overall hard rule
After each **⛔ STOP & REVIEW CHECKPOINT**, the system must STOP and the next phase proceeds **only after user approval**.

Status note:
- The codebase has already progressed beyond the checkpoint flow; checkpoints are kept as a narrative structure, not as a current execution gate.
