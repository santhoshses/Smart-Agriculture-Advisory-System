# Architecture Lock & Component Responsibilities — Review-01

> **Step 0.2 deliverable (planning only)**
> Purpose: freeze the architecture boundaries so implementation stays modular and review-friendly.
> **No code belongs here.**

## 1) High-level architecture (locked)
The system is split into 5 parts:
1. **Frontend Web App (React)**
2. **Backend API / Orchestrator (Node.js + Express)**
3. **ML Inference Service (Python: FastAPI or Flask)**
4. **Database (MongoDB)**
5. **External Weather Provider (Public Weather API)**

This separation is intentional so that ML, weather, and UI can evolve independently.

---

## 2) Component responsibilities (what each part owns)

### 2.1 Frontend Web App (React)
**Owns**
- User experience and navigation (simple, mobile-friendly flows)
- Data entry forms: farmer profile, soil parameters, image upload
- Display of results: crop recommendations, fertilizer plan, disease result + treatment, weather dashboard
- Language toggle (English / Punjabi Gurmukhi)

**Does NOT own**
- Business rules (crop/fertilizer logic)
- ML inference logic
- Direct database access

**Edge/latency note**
- Frontend should remain lightweight; heavy processing stays in backend services.

---

### 2.2 Backend API / Orchestrator (Node.js + Express)
**Owns**
- Input validation and consistent error handling
- Orchestration of features (connect UI to DB, ML service, and weather)
- Business logic (v1):
  - crop recommendation (rule-based)
  - fertilizer guidance (rule-based)
- Persistence operations (via MongoDB)
- Mapping predicted disease → treatment recommendation text
- Weather normalization (convert external weather response into app-friendly output)

**Does NOT own**
- ML model internals (kept inside the Python service)
- UI rendering decisions

**Edge/latency note**
- Acts as the “near-user” coordinator and can apply caching where safe.

---

### 2.3 ML Inference Service (Python)
**Owns**
- Image preprocessing (as required by the model)
- Disease inference (either stub for Review-01 stability or real pre-trained model)
- Returning structured prediction results (disease label + confidence)

**Does NOT own**
- Treatment text content and multilingual phrasing (handled by the orchestrator + localization content)
- Storage of farmer profiles/history (handled by Node + MongoDB)

**Edge/latency note**
- Runs locally (same machine or local network) to satisfy “edge computing” interpretation for the review.

---

### 2.4 Database (MongoDB)
**Owns**
- Persistent storage for:
  - farmer profiles
  - soil test records
  - advisory results (crop/fertilizer)
  - disease scan history
  - optional weather cache

**Does NOT own**
- Business rules (no logic inside DB)
- Any ML computation

---

### 2.5 External Weather Provider (Public API)
**Owns**
- Supplying raw weather forecast data

**Does NOT own**
- Advisory rules, alerts, or app-specific summaries
- Any persistence or user-specific data

---

## 3) Non-functional expectations (for Review-01)
- **Reliability over completeness:** prefer stable flows over extra features
- **Explainability:** crop + fertilizer logic must be explainable (rule-based)
- **Usability:** minimal steps, clear language, bilingual output
- **Local demo readiness:** works on a laptop environment

---

## 4) Explicit hard boundaries (to avoid scope creep)
- No on-device/offline ML requirement for Review-01
- No model training from scratch
- No SMS/WhatsApp alerts
- No free-form chatbot (guided/template only in early phases)

---

## 5) Approval
- Prepared by: ____________________
- Reviewed by: ____________________
- Date: ____________________
- Approved to proceed to **Phase 1 (Step 1.1)**: Yes / No

