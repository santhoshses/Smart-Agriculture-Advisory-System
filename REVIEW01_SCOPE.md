# Review-01 Scope & Success Criteria — Smart Crop Advisory System

> **Step 0.1 deliverable (planning only)**
> This document locks the Review-01 demo scope and defines clear success criteria.
> **No implementation belongs here.**

## A) Review-01 demo scope (locked)

### A1. Target users
- Small and marginal farmers
- Low digital literacy considered (simple UI flows)

### A2. Platform
- Responsive **Web application** (mobile-friendly)

### A3. Crops covered in Review-01
- Wheat
- Rice

### A4. Inputs to be supported in Review-01
1. Farmer profile data
   - Location
   - Soil type (if captured)
   - Previous crop history (simple)
2. Soil parameters
   - N, P, K values
   - pH value
3. Crop/leaf images
   - Upload image for disease detection
4. Language selection
   - English
   - Punjabi (Gurmukhi)
5. Weather
   - Location-based weather forecast (7-day)

### A5. Outputs to be demonstrated in Review-01
1. Crop recommendation
   - Rule-based, explainable output
2. Fertilizer guidance
   - NPK ratio guidance + simple schedule
3. Disease identification + treatment recommendation
   - From leaf image
   - ML integration may be real model or stub (must keep same user-visible flow)
4. Weather dashboard
   - 7-day forecast
   - Simple in-app alerts (if included in Review-01 demo)
5. Bilingual UI output
   - Core pages and advisory messages shown in English and Punjabi

### A6. “Edge computing” interpretation (for Review-01 explanation)
- Disease inference is performed by a **local Python ML service** (near-user execution) to reduce round-trip latency.
- Full offline/on-device inference is **not required** for Review-01.

## B) Explicitly out of scope for Review-01
- Training a custom ML model from scratch
- Full offline/on-device ML inference
- SMS/WhatsApp alerts (in-app only)
- Free-form NLP chatbot (use guided/template flow first)
- Complex authentication/KYC and production-grade security hardening
- Regional expansion beyond Punjabi (Gurmukhi) + English

## C) Success criteria (Review-01 acceptance)
Review-01 is considered successful if all items below are true:

### C1. End-to-end demo flows are repeatable
- Demo can be run on a local laptop without fragile manual steps
- Each flow completes without crashing

### C2. Minimum demo flows (choose 2–3)
Mark **exactly** which flows will be demonstrated:
- [ ] Flow 1: Profile + Soil → Crop recommendation → Fertilizer plan
- [ ] Flow 2: Leaf image → Disease result → Treatment recommendation
- [ ] Flow 3: Weather dashboard → 7-day forecast → In-app alert explanation
- [ ] Flow 4 (optional): Guided assistant summary in Punjabi/English

### C3. Data persistence evidence
- At least farmer profile + past results/history can be shown again after refresh/revisit.

### C4. Language barrier addressed
- Core pages and the displayed advisory text must be available in:
  - English
  - Punjabi (Gurmukhi)

## D) Demo script (fill and freeze for review)
> Keep this to **5–7 minutes**.

### D1. Pre-demo setup (what must be ready before starting)
- Sample farmer profile values ready
- Sample soil values ready (at least 2 sets to show difference in output)
- Sample disease images ready (at least 2)
- A chosen demo location for weather

### D2. Demo narration outline
1. Explain the problem (traditional guesswork, cost, yield impact)
2. Show Profile & Soil input
3. Show crop recommendation and why it was recommended
4. Show fertilizer plan and safety notes
5. Show disease detection (image) and treatment advisory
6. Show weather forecast and alert explanation
7. Switch language to Punjabi and re-show one output screen

### D3. “What we will say if asked” (review Q&A notes)
- Why rule-based recommendation first (explainable, deterministic)
- Why ML is via a local service (edge-style low latency)
- Future scope: voice UI, better NLP, expanded crops/diseases

## E) Approval
- Prepared by: ____________________
- Reviewed by: ____________________
- Date: ____________________
- Approved to proceed to **Step 0.2**:  Yes / No

