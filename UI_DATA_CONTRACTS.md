# UI Data Contracts (Frontend-only) — Review-01

> **Step 1.2 deliverable**
> This document defines what data each UI screen must capture and display.
> It is frontend-focused and intentionally avoids API route details.

## Global UI rules (apply to all screens)
- Keep forms minimal and farmer-friendly.
- Provide clear labels and helper text.
- Validate inputs on the client for obvious errors (missing values, invalid ranges).
- Support bilingual display (English + Punjabi Gurmukhi):
  - UI labels must be translatable.
  - Advisory outputs must be translatable.
- Show safe error messages (no technical stack traces).

---

## 1) Dashboard Screen
### What the screen shows
- Quick entry points to:
  - Farmer Profile
  - Soil Input
  - Crop Recommendation
  - Fertilizer Guidance
  - Disease Detection
  - Weather
- “Recent activity” placeholders (later: last advisory, last disease scan, last soil test).

### Inputs
- None.

### Outputs / UI sections
- Navigation cards/links
- Recent activity list (placeholder in early stages)

### Validation / constraints
- Not applicable.

---

## 2) Farmer Profile Screen
### Inputs to capture
1. **Farmer name** (optional)
2. **Location** (required)
   - Minimum: village/city name OR district
   - Optional: coordinates if later supported
3. **Soil type** (optional)
   - Examples: Sandy, Loamy, Clay
4. **Previous crop** (optional)
   - Examples: Wheat, Rice
5. **Season** (optional but recommended)
   - Kharif / Rabi

### Outputs / UI sections
- Confirmation summary: “Saved profile details”
- Last updated timestamp (later)

### Validation / constraints
- Location: required; must not be empty

---

## 3) Soil Input Screen (NPK / pH)
### Inputs to capture
1. **Nitrogen (N)** (required)
2. **Phosphorus (P)** (required)
3. **Potassium (K)** (required)
4. **pH** (required)
5. **Test date** (optional)

### Outputs / UI sections
- Entered values summary
- Basic status hints (optional for UI only):
  - “Low / Normal / High” labels (based on ranges defined later)

### Validation / constraints
- N, P, K: must be numeric and non-negative
- pH: numeric and within realistic range (0–14)

---

## 4) Crop Recommendation Screen
### Inputs required (from user or previous screens)
- Must have:
  - Location (from Profile)
  - NPK + pH (from Soil Input)
- Optional:
  - Soil type
  - Previous crop
  - Season

### Outputs / UI sections
- **Recommended crops list** (ranked or grouped)
- For each recommended crop:
  - “Why recommended” (short rule explanation)
  - “Not recommended if…” (if applicable)
- A “Missing inputs” notice if profile/soil is incomplete

### Validation / constraints
- If required inputs are missing, show a friendly message and link user to the missing screen.

---

## 5) Fertilizer Guidance Screen
### Inputs required
- Must have:
  - NPK + pH (from Soil Input)
- Recommended:
  - Selected crop (user chooses from Crop Recommendation)

### Outputs / UI sections
- **Suggested NPK ratio guidance** (text summary)
- **Application schedule** (simple steps)
- **Safety notes** (avoid overuse)
- “Missing inputs” notice with links (if needed)

### Validation / constraints
- If crop not selected, allow a default “general guidance” placeholder OR require crop selection later (decision to be finalized in Phase 3).

---

## 6) Disease Detection Screen (Image)
### Inputs to capture
1. **Crop type** (optional but recommended)
   - Wheat / Rice
2. **Leaf image file** (required)
   - Accept common formats (jpg/png)

### Outputs / UI sections
- Uploaded image preview (later)
- **Disease result card**:
  - Disease name
  - Confidence (percentage)
  - Treatment recommendation
  - “When to contact expert” note (safety)
- History list (later): recent scans

### Validation / constraints
- Image must be selected
- Reject empty file selection

---

## 7) Weather Screen (7-day)
### Inputs required
- Location (from Profile)

### Outputs / UI sections
- 7-day forecast list/cards
  - temperature
  - humidity
  - rain probability / rainfall (as available)
- In-app alerts area (later):
  - heavy rain risk
  - high temperature
  - humidity risk (basic)

### Validation / constraints
- If location missing, show a message and link back to Profile.

---

## 8) Language Toggle (Global)
### Behavior
- User can switch between:
  - English (en)
  - Punjabi Gurmukhi (pa)

### Outputs impacted
- All navigation labels
- Screen headings
- Advisory summaries (crop, fertilizer, disease treatment, weather alerts)

### Constraints
- If a Punjabi translation is missing for a string, use English fallback but flag it for later completion.

---

## 9) STOP criteria for Step 1.2
This step is complete when:
- Each screen has a clear list of inputs and outputs
- Basic validation expectations are written
- No API details were added (kept frontend-only)

### ⛔ STOP & REVIEW CHECKPOINT
Manually verify:
1. The required fields list matches what you want for Review-01.
2. No screen requires advanced features beyond scope (e.g., chatbot, SMS alerts).
3. Missing-input handling is clear (links users to Profile/Soil).

**STOP here.** Proceed to Phase 2 only after explicit approval.

