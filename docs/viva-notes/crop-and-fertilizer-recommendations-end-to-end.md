# Crop + Fertilizer Recommendations (End-to-End) — From Input → Logic → API → UI

This explanation follows the real code paths in your project. I’ll describe **where the logic lives**, **what inputs are used**, **how rules are applied**, **how the backend formats the response**, and **how the frontend shows it**.

---

## 1) Where the recommendation logic lives (files/folders)
### Backend (main place where recommendations are generated)
- **Routes (API endpoints):**
  - `backend/src/routes/recommendationRoutes.js`
    - Handles `/recommendations/crop` and `/recommendations/fertilizer`
    - Fetches profile + latest soil test
    - Adds weather context for crop recommendation

- **Services (actual decision logic):**
  - Crop logic: `backend/src/services/cropRecommendationService.js`
  - Fertilizer logic: `backend/src/services/fertilizerGuidanceService.js`

- **Database models (inputs come from DB):**
  - Profile: `backend/src/models/FarmerProfile.js`
  - Soil report: `backend/src/models/SoilTest.js`
  - Location master (for weather lat/lon): `backend/src/models/Location.js`

- **Weather integration (used only in crop recommendation):**
  - Fetch forecast: `backend/src/services/weatherService.js`
  - Build alerts: `backend/src/services/weatherAlertService.js`

### Frontend (where results are displayed)
- Crop UI: `frontend/src/pages/CropRecommendationPage.jsx`
- Fertilizer UI: `frontend/src/pages/FertilizerGuidancePage.jsx`
- Soil input UI: `frontend/src/pages/SoilInputPage.jsx`
- Profile UI: `frontend/src/pages/ProfilePage.jsx`
- HTTP client: `frontend/src/api/client.js`

---

## 2) What inputs are used for recommendations

### Inputs saved by user (DB-stored)
1) **Profile inputs** (saved in `FarmerProfile`)
- `locationId` (required)
- optional: `seasonId`, `previousCropId`, `soilTypeId`

2) **Soil test inputs** (saved in `SoilTest`)
- `n`, `p`, `k`, `ph`

### Inputs derived by system
3) **Weather alerts** (only for crop recommendation)
- Uses location centroid: `Location.center.lat/lon`
- Fetches 7-day forecast from Open-Meteo
- Converts forecast → alerts (`heat`, `heavy_rain`, `rain_risk`)

### What is NOT used
- **Soil moisture is not used** as a direct input in current logic.
- No sensor data is stored.

---

## 3) End-to-end crop recommendation flow

### Step A — User prepares inputs (Profile + Soil test)
1) User sets profile in UI:
- Frontend page: `frontend/src/pages/ProfilePage.jsx`
- Backend API: `PUT /me/profile` (`backend/src/routes/meRoutes.js`)

2) User saves soil test:
- Frontend page: `frontend/src/pages/SoilInputPage.jsx`
- Backend API: `POST /soil-tests` (`backend/src/routes/soilTestRoutes.js`)

If soil test is not saved, crop recommendation will fail with:
- `400 Soil test is required`

### Step B — User requests crop recommendation
Frontend calls:
- `GET /recommendations/crop`
File: `frontend/src/pages/CropRecommendationPage.jsx`

Code reference:
```js
// frontend/src/pages/CropRecommendationPage.jsx
const data = await apiRequest(`/recommendations/crop?${qs.toString()}`);
setResult(data);
```

### Step C — Backend collects inputs
File: `backend/src/routes/recommendationRoutes.js`

What it does:
1) Requires login (`requireAuth`) → ensures we know which profile belongs to this farmer.
2) Loads farmer profile:
   - `FarmerProfile.findById(profileId).populate(locationId/seasonId/previousCropId)`
3) Fetches latest soil test:
   - `SoilTest.findOne({ profileId }).sort({ createdAt: -1 })`

Code reference (latest soil test):
```js
// backend/src/routes/recommendationRoutes.js
const latestSoil = await SoilTest.findOne({ profileId }).sort({ createdAt: -1 });
if (!latestSoil) return res.status(400).json({ error: "Soil test is required" });
```

### Step D — Weather integration (crop only)
Still inside `recommendationRoutes.js`:
1) Resolve lat/lon from `Location.center`
2) Call Open-Meteo:
   - `getSevenDayForecast({ lat, lon })` (`weatherService.js`)
3) Build alerts:
   - `buildAlertsFromForecastDays(forecast.days)` (`weatherAlertService.js`)

This produces alerts like:
- heat → “High temperature expected…”
- heavy_rain → “Heavy rain expected…”

Important limitation (current implementation):
- If the weather API call fails, the backend currently does not fall back to “no weather”; it can return a **500 error** for `/recommendations/crop`.
- Weather fallback is implemented only in the service-level scoring rules when `weather` is `null`/missing, but the route currently always attempts a weather call when location exists.

### Step E — Crop scoring logic (rules + score-based)
File: `backend/src/services/cropRecommendationService.js`

**Core mechanism:**
- There is a predefined crop list `CROP_CONFIG` (wheat, rice, maize, etc.)
- For each crop, the service starts with a **base score = 50**
- Then it adjusts score using simple rules:
  1) **Season match**: +15 if matches, -20 if mismatch
  2) **pH suitability**: +10 if in range, else penalty with warnings
  3) **Nitrogen requirement**: if soil N low for that crop, -12 with warning
  4) **Rotation rule**: if previous crop is same, -15 warning, else +5
  5) **Legume bonus**: legumes get +8
  6) **Weather alerts** affect water-demand crops:
     - high water demand crops (like rice) get warnings/penalty during heat + low rain risk
     - heavy rain and heat add general warnings
  7) **Diversification bonus**: non-wheat/rice crops get +4

Then it:
- clamps score between 0–100
- sorts crops by score
- returns reasons + warnings per crop

Tiny code reference (showing base score pattern):
```js
// backend/src/services/cropRecommendationService.js
let score = 50;
if (normSeason === cropConfig.season) score += 15;
if (ph >= phMin && ph <= phMax) score += 10;
```

### Step F — Backend response format
The route returns JSON like:
- `profileId`
- `used` (what inputs were used: season, soilTestId, location, weather)
- `recommendations`: array of { crop, score, reasons, warnings }

Frontend uses `score`, `reasons`, `warnings`.

### Step G — UI display for crop recommendation
File: `frontend/src/pages/CropRecommendationPage.jsx`

How it displays:
- A **card** listing each crop
- Shows crop name + score chip
- Shows “Why recommended” list (reasons)
- Shows warnings as chips
- Shows a weather summary card (alerts count + lat/lon)

UI reference (score + reasons):
```jsx
// frontend/src/pages/CropRecommendationPage.jsx
<span className="chip chipOk">Score: {r.score}</span>
<ul>
  {r.reasons.slice(0,4).map(x => <li>{x}</li>)}
</ul>
```

---

## 4) End-to-end fertilizer recommendation flow

### Step A — User requests fertilizer guidance
Frontend calls:
- `GET /recommendations/fertilizer?crop=wheat`
File: `frontend/src/pages/FertilizerGuidancePage.jsx`

Code reference:
```js
// frontend/src/pages/FertilizerGuidancePage.jsx
const data = await apiRequest(`/recommendations/fertilizer?${qs.toString()}`);
setResult(data);
```

### Step B — Backend collects inputs
Same route file: `backend/src/routes/recommendationRoutes.js`

What it uses:
- Farmer profile (for ownership and optional location override)
- Latest soil test (N/P/K/pH)
- Optional `crop` query param

If soil test missing:
- `400 Soil test is required`

### Step C — Fertilizer logic (threshold-based, no quantity)
File: `backend/src/services/fertilizerGuidanceService.js`

**Core mechanism:**
1) Validate soil values exist (N/P/K/pH must be numbers)
2) Classify each nutrient using thresholds:
- N low < 25, high > 60
- P low < 15, high > 40
- K low < 15, high > 40
3) Build messages:
- If nutrient is low → add “support needed” message
- If nutrient is high → add “reduce/avoid” warning
4) Crop affects the **schedule text** (wheat vs rice vs generic)
5) pH affects safety notes (acidic/alkaline warnings)

Important: It does **not** recommend exact quantity/dose.
It returns guidance messages + schedule + safety notes.

Code reference (threshold classification):
```js
// backend/src/services/fertilizerGuidanceService.js
const nLevel = classifyLevel(n, 25, 60);
if (nLevel === "low") recommendedFertilizers.push("Nitrogen support needed...");
if (nLevel === "high") recommendedReductions.push("reduce or skip extra urea...");
```

### Step D — Backend response format
Route returns JSON like:
- `used.soilTestId`
- `guidance.soilSummary.levels` (low/normal/high)
- `guidance.npkGuidance` (simple list)
- `guidance.schedule` (steps)
- `guidance.safetyNotes`

### Step E — UI display for fertilizer guidance
File: `frontend/src/pages/FertilizerGuidancePage.jsx`

How it displays:
- A card with chips: Crop, N/P/K level, pH
- A “soil summary” section (bullet list)
- A “schedule” section (ordered list)
- A “safety notes” section (bullet list)

---

## 5) Worked examples (2–3 scenarios)
These are “worked-through” using the actual rules in code.

### Scenario 1 — Good pH, low nitrogen, heat risk (Punjab-style)
**Inputs**
- Season: Kharif
- Previous crop: wheat
- Soil: pH 6.5, N low, P normal, K normal
- Weather: heat alert present, no rain risk

**Crop recommendation (logic flow)**
- Rice (high water demand): gets season match, but gets warnings/penalty due to water stress risk (heat + low rain risk) + groundwater stress note.
- Maize (medium water): safer than rice in heat risk → gets fewer penalties.
- Moong (low water, legume): gets legume bonus + low-water bonus under likely low rain.

**Fertilizer guidance**
- N is low → guidance says “Nitrogen support needed…”
- P/K normal → no extra focus
- No exact quantity is returned.


### Scenario 2 — pH outside ideal, rotation risk
**Inputs**
- Season: Rabi
- Previous crop: wheat
- Soil: pH too high (alkaline), N medium, P medium, K medium
- Weather: not available

**Crop recommendation**
- Wheat: season match, but rotation penalty because previous crop is same.
- pH penalty affects crops whose ideal pH range is lower; warnings added.
- Weather missing triggers a warning “Weather not available…”.

**Fertilizer guidance**
- N/P/K normal → “balanced” type guidance.
- pH safety notes warn soil pH is outside normal range.


### Scenario 3 — Nutrient excess risk
**Inputs**
- Crop selected: wheat
- Soil: N high, P high, K normal, pH normal

**Crop recommendation**
- Crop scoring mostly depends on season/pH/weather/rotation; N high doesn’t increase score much; it mainly checks “is N enough” (so high is not a bonus). 

**Fertilizer guidance**
- N high → “reduce or skip extra urea doses” warning
- P high → “avoid extra DAP/SSP” warning
- K normal → no action

---

## 6) Missing/invalid input behavior (what happens)
### Missing soil test
- Backend returns:
  - `400 { error: "Soil test is required" }`
- Frontend shows an error card (and the API error JSON if available).

### Invalid numbers
- Soil test create route validates min/max.
- Example: pH > 14 → returns `400 Validation error`.

### Weather not available
- Crop recommendation still works.
- It returns `missingInputs: ["weather"]` and adds warnings like “Weather not available…”.

---

## 7) Assumptions built into the logic
- Thresholds and crop configs are **demo-friendly baseline rules**, not official scientific dosing.
- Weather integration uses **alerts**, not full agronomy models.
- Uses only **latest soil test**.
- Location is treated as district centroid; not village-level.

---

## 8) Gaps / limitations + what can be improved
### Accuracy/scientific depth
- Rules are simplified; real agronomy needs crop-stage, soil texture, irrigation source, rainfall totals, and local advisory tables.

### Scalability/maintainability
- Crop rules live inside `cropRecommendationService.js` as `CROP_CONFIG`.
  - Could be moved to a config file or DB for easier updates.

### Adaptability
- Could tune rules per region/district.
- Could add soil moisture and irrigation type.

### Future improvements (including ML, if you decide later)
- Add a configurable rules engine (admin-editable rules).
- Store recommendation history for analysis.
- Integrate more detailed weather features.
- (Optional future) Use data-driven/ML models — but that would require dataset + validation and should be explained carefully.

---

If you want, I can convert the worked examples into a **viva script** (2–3 minutes speaking) that a student can memorize and present confidently.
