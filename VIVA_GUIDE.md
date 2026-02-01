#+#+#+#+---------------------------------------------------------------------
# Viva / Oral Exam Preparation Guide (Fresher-Friendly)
Smart Agriculture Advisory System (Punjab Demo)

You don’t need to know farming or deep coding to explain this project.
Think of this project as a **simple advice app**:

- You enter **basic soil test numbers**.
- The system gives you **crop suggestions** and **basic fertilizer guidance**.
- It also shows **weather alerts**.

This guide is written for students who feel nervous in viva.
Read slowly. Practice answering in your own words.

---

## How to use this guide (1 minute)
- Start with **Question 1 and 2** (most important).
- Then learn 3–4 questions per day.
- You can say in viva: “This is a demo, rule-based system. It is explainable.”

---

# 1) Mandatory Viva Question (MOST IMPORTANT)

## 1. Viva Question
**How does the system decide which crop and fertilizer to recommend? (Explain the brain of the project)**

## 2. Very Simple Explanation (No Code, No Jargon)
- The user enters 4 soil numbers: **N, P, K, pH**.
- The system checks these numbers against simple “good / bad” rules.
- For crops: each crop starts with a score. Good matches add points. Bad matches subtract points.
- For fertilizer: the system labels N/P/K as **low / normal / high** and gives advice.

## 3. Real-World Analogy (if helpful)
Think of it like a **matchmaking score**:
- Each crop is a “candidate”.
- Your soil is the “profile”.
- The system gives points for good matches and removes points for risky matches.

## 4. Step-by-Step Technical Explanation (Beginner Friendly)

### A) Soil inputs (very simple)
- **N (Nitrogen)**: think “plant food part 1”.
- **P (Phosphorus)**: think “plant food part 2”.
- **K (Potassium)**: think “plant food part 3”.
- **pH**: think “how acidic or basic the soil is”.

Why user enters them:
- Because different crops like different soil conditions.
- The app needs *some* numbers to make a decision.

### B) Where data is stored
- When user saves the soil test, it is stored in **MongoDB** (database).
- Soil is stored in a collection called **SoilTest**.
- Profile info is stored in **FarmerProfile**:
  - season (Rabi/Kharif)
  - location (Punjab district)
  - previous crop

### C) Crop recommendation logic (core scoring idea)
The system checks 8 crops:
- wheat, rice, maize, barley, mustard, cotton, moong, sunflower

For each crop:
1) Start score at **50**
2) Add/subtract points using these rules:
   - Season match
   - pH in range
   - Nitrogen enough/not enough
   - Previous crop rotation rule
   - Legume bonus (legume = crop that can naturally improve soil over time)
   - Weather alerts (optional)
   - Diversification bonus (to encourage crops beyond wheat/rice)
3) Clamp final score between **0 and 100**
4) Sort crops by score (highest first)

#### Crop scoring blueprint (simple +/− points table)
This table is exactly the scoring logic used in the backend:

| Rule | When it happens | Points |
|---|---|---:|
| Base score | Always | +50 |
| Season match | user season == crop season | +15 |
| Season mismatch | user season != crop season | −20 |
| Season missing | season not set | −5 |
| pH in crop range | phMin ≤ pH ≤ phMax | +10 |
| pH out of range | penalty = clamp(round(distance × 6), 5, 15) | −(5 to 15) |
| Nitrogen enough | soil N ≥ crop minN | +6 |
| Nitrogen low | soil N < crop minN | −12 |
| Rotation good | previous crop != current crop | +5 |
| Rotation bad | previous crop == current crop | −15 |
| Legume bonus | crop is legume (only moong here) | +8 |
| Heavy rain alert | weather alert heavy_rain | −5 |
| Heat alert | weather alert heat | −3 |
| High water-demand base penalty | crop waterDemand == high (mainly rice) | −5 |
| High water + likely low rain | heat present AND no rain alerts | −15 |
| High water + rain risk | rain_risk alert exists | +3 |
| Low water bonus in likely low rain | low water crop AND likelyLowRain | +6 |
| Diversification bonus | crop is not wheat and not rice | +4 |
| Final clamp | always after scoring | clamp 0–100 |

#### Worked example (don’t worry, just follow the points)
Example soil values:
- N=20, P=12, K=15, pH=6.8
- Season = Rabi
- Previous crop = Rice
- Weather = not available (so only warnings; no weather points)

**Wheat** config in this system:
- season rabi, pH 6.0–8.0, minN=35 (high)

Score calculation:
1) Start 50
2) Season match (rabi): +15 → 65
3) pH good (6.8 is inside 6.0–8.0): +10 → 75
4) Nitrogen low (20 < 35): −12 → 63
5) Rotation good (prev rice != wheat): +5 → 68
6) Diversification? wheat is excluded: +0 → 68
Final wheat score: **68**

**Barley** (diversification crop) config:
- season rabi, pH 6.0–8.5, minN=25 (medium)

Score calculation:
1) Start 50
2) Season match: +15 → 65
3) pH good: +10 → 75
4) Nitrogen low (20 < 25): −12 → 63
5) Rotation good (prev rice != barley): +5 → 68
6) Diversification bonus (not wheat/rice): +4 → 72
Final barley score: **72**

So barley can rank above wheat mainly because of the **+4 diversification bonus**.

### D) Fertilizer recommendation logic (simple)
- Fertilizer guidance is a separate part.
- It does **not** use scoring.
- It checks whether N, P, K are **low / normal / high** using fixed thresholds.
- Then it says:
  - If low → “add support”
  - If high → “reduce/avoid extra”

Threshold idea (no stress):
- The system has “cut-off numbers”.
- Below cut-off = low.
- Above cut-off = high.

Why no exact quantity:
- This is a demo and keeps advice safe.
- Exact dosing depends on crop stage, soil type, local government recommendations, and more.

### E) Code references (gentle)
You can say:
- Crop logic: `backend/src/services/cropRecommendationService.js`
- Fertilizer logic: `backend/src/services/fertilizerGuidanceService.js`
- Soil storage shape: `backend/src/models/SoilTest.js`

## 5. What Data Is Used? (Inputs & Outputs)
**Inputs:**
- From SoilTest: N, P, K, pH (latest saved)
- From FarmerProfile: season, previous crop, location
- Optional: weather alerts from Open-Meteo

**Outputs:**
- Crop: list of crops with `{ crop, score, reasons, warnings }`
- Fertilizer: guidance object with soil summary + low/normal/high + schedule + safety notes

## 6. Where This Logic Lives (File Name & Folder)
- Crop scoring: `backend/src/services/cropRecommendationService.js`
- Fertilizer thresholds + advice: `backend/src/services/fertilizerGuidanceService.js`
- Soil data model: `backend/src/models/SoilTest.js`
- API endpoints: `backend/src/routes/recommendationRoutes.js`

## 7. Tiny Code Snippet (Optional, 3–6 lines max, explained line-by-line)
From crop scoring (simplified):
```js
let score = 50;
if (normSeason === cropConfig.season) score += 15;
else score -= 20;
const finalScore = clamp(Math.round(score), 0, 100);
```
Line-by-line:
- Start with 50.
- Add points if season matches.
- Reduce points if season mismatches.
- Round and keep score between 0 and 100.

## 8. Why This Design Was Chosen (In Simple Words)
- Easy to explain in demo and viva.
- No machine learning needed.
- Rules are visible and predictable.
- Works even with small amount of data.

---

# 2) Mandatory Viva Question

## 1. Viva Question
**Explain the overall project architecture and folder structure.**

## 2. Very Simple Explanation (No Code, No Jargon)
- The project has 3 main parts:
  - **Frontend**: the website screens you click.
  - **Backend**: the server that contains rules and talks to database.
  - **Database**: stores soil tests and profiles.

## 3. Real-World Analogy (if helpful)
Think of a restaurant:
- Frontend = waiter taking your order (UI)
- Backend = kitchen cooking using rules (logic)
- Database = store room where ingredients are kept (data)

## 4. Step-by-Step Technical Explanation (Beginner Friendly)
1) User opens the React website.
2) User submits forms (profile, soil test).
3) Frontend sends an HTTP request to backend.
4) Backend saves/reads data from MongoDB.
5) Backend applies rule logic (crop scoring, fertilizer classification).
6) Backend returns JSON.
7) Frontend shows results on screen.

### Folder structure (easy map)
- `frontend/` = user screens (React pages)
- `backend/` = server code
  - `backend/src/models/` = “data shapes” (MongoDB schemas)
  - `backend/src/routes/` = “API entry points” (URLs like `/soil-tests`)
  - `backend/src/services/` = “decision logic” (crop/fertilizer rules)
  - `backend/src/db/seed/` = demo data and master data
- `ml-service/` = optional Python service for disease demo (not used for crop scoring)

## 5. What Data Is Used? (Inputs & Outputs)
**Inputs:** form data from frontend.
**Outputs:** JSON results from backend.

## 6. Where This Logic Lives (File Name & Folder)
- Backend entry: `backend/src/server.js`
- Crop logic: `backend/src/services/cropRecommendationService.js`
- Fertilizer logic: `backend/src/services/fertilizerGuidanceService.js`
- React routes/pages: `frontend/src/pages/*`

## 7. Tiny Code Snippet (Optional, 3–6 lines max, explained line-by-line)
From backend server route mounting:
```js
app.use("/soil-tests", soilTestRoutes);
app.use("/recommendations", recommendationRoutes);
app.use("/weather", weatherRoutes);
```
Line-by-line:
- `/soil-tests` handles soil saving.
- `/recommendations` handles crop/fertilizer advice.
- `/weather` handles forecast/alerts.

## 8. Why This Design Was Chosen (In Simple Words)
- Clean separation.
- Easy to debug: UI problems vs backend problems vs DB problems.
- Easier for a team: different people can work on different folders.

---

# 3) Viva Question

## 1. Viva Question
**What are N, P, K, and pH in this app, and why are they required?**

## 2. Very Simple Explanation (No Code, No Jargon)
- They are 4 basic soil numbers.
- The app needs them to make a basic recommendation.

## 3. Real-World Analogy (if helpful)
Like a doctor needing basic vital signs (temperature, BP) before giving advice.

## 4. Step-by-Step Technical Explanation (Beginner Friendly)
- User enters the numbers in the Soil page.
- The backend validates they are numbers.
- Then it stores them and uses them for scoring and fertilizer guidance.

## 5. What Data Is Used? (Inputs & Outputs)
- Input: `{ n, p, k, ph }`
- Output: saved soil test record OR validation error.

## 6. Where This Logic Lives (File Name & Folder)
- UI form: `frontend/src/pages/SoilInputPage.jsx`
- Validation + save: `backend/src/routes/soilTestRoutes.js`
- Data shape: `backend/src/models/SoilTest.js`

## 7. Tiny Code Snippet (Optional, 3–6 lines max, explained line-by-line)
From soil save payload:
```js
const payload = {
  n: Number(form.n),
  p: Number(form.p),
  k: Number(form.k),
  ph: Number(form.ph),
};
```
Line-by-line:
- Converts user text input into numbers.
- Sends to backend.

## 8. Why This Design Was Chosen (In Simple Words)
- Keeps the demo simple.
- These 4 numbers are enough to show a working recommendation flow.

---

# 4) Viva Question

## 1. Viva Question
**How does soil data move from the UI to the database?**

## 2. Very Simple Explanation (No Code, No Jargon)
- User fills a form.
- Website sends it to server.
- Server saves it in database.

## 3. Real-World Analogy (if helpful)
Like filling a bank form → clerk checks it → stores it in bank system.

## 4. Step-by-Step Technical Explanation (Beginner Friendly)
1) Soil page takes N/P/K/pH.
2) Frontend calls `POST /soil-tests`.
3) Backend checks values.
4) Backend creates a new `SoilTest` record in MongoDB.
5) Backend returns the saved record.

## 5. What Data Is Used? (Inputs & Outputs)
- Input: `{n, p, k, ph}`
- Output: saved `SoilTest` JSON (includes `_id`, timestamps)

## 6. Where This Logic Lives (File Name & Folder)
- UI: `frontend/src/pages/SoilInputPage.jsx`
- API call helper: `frontend/src/api/client.js`
- Backend route: `backend/src/routes/soilTestRoutes.js`
- DB model: `backend/src/models/SoilTest.js`

## 7. Tiny Code Snippet (Optional, 3–6 lines max, explained line-by-line)
Backend creates the record:
```js
const created = await SoilTest.create({
  profileId: effectiveProfileId,
  n: n.value,
  p: p.value,
  k: k.value,
  ph: ph.value,
});
```
Line-by-line:
- Uses current profile.
- Saves the four soil numbers.

## 8. Why This Design Was Chosen (In Simple Words)
- History is possible: many soil tests per profile.
- Easy to always use the latest soil test.

---

# 5) Viva Question

## 1. Viva Question
**Why does the system use the *latest* soil test instead of asking every time?**

## 2. Very Simple Explanation (No Code, No Jargon)
- Latest soil test is the most recent and relevant.
- User doesn’t need to re-enter again.

## 3. Real-World Analogy (if helpful)
Doctor uses your newest lab report, not your old report from last year.

## 4. Step-by-Step Technical Explanation (Beginner Friendly)
- Backend runs a query that sorts soil tests by time.
- It picks the newest one.

## 5. What Data Is Used? (Inputs & Outputs)
- Input: profileId (from login token)
- Output: one SoilTest record (latest)

## 6. Where This Logic Lives (File Name & Folder)
- `backend/src/routes/recommendationRoutes.js`

## 7. Tiny Code Snippet (Optional, 3–6 lines max, explained line-by-line)
```js
const latestSoil = await SoilTest.findOne({ profileId })
  .sort({ createdAt: -1 });
```
Line-by-line:
- Find soil tests for that profile.
- Sort newest first.
- Take one record.

## 8. Why This Design Was Chosen (In Simple Words)
- Makes user experience easy.
- Supports multiple soil tests in future.

---

# 6) Viva Question

## 1. Viva Question
**Where are crop rules stored: database or code? Why?**

## 2. Very Simple Explanation (No Code, No Jargon)
- Crop “requirements” are stored inside backend code, not in database.
- This makes the demo stable and easy.

## 3. Real-World Analogy (if helpful)
Like a fixed checklist printed on paper instead of reading from internet every time.

## 4. Step-by-Step Technical Explanation (Beginner Friendly)
- Backend has a crop list with pH range, season, nitrogen requirement, water demand.
- The scoring function uses this list.

## 5. What Data Is Used? (Inputs & Outputs)
- Input: soil + season + previous crop + optional weather.
- Output: scored crop list.

## 6. Where This Logic Lives (File Name & Folder)
- `backend/src/services/cropRecommendationService.js` (`CROP_CONFIG`)

## 7. Tiny Code Snippet (Optional, 3–6 lines max, explained line-by-line)
```js
const CROP_CONFIG = {
  wheat: { season: "rabi", idealPhRange: [6.0, 8.0] },
  rice: { season: "kharif", idealPhRange: [5.5, 8.5] },
};
```
Line-by-line:
- A simple object that lists crop rules.

## 8. Why This Design Was Chosen (In Simple Words)
- Easy to explain in viva.
- No extra DB tables for crop requirements.
- Simple to add more crops later by adding config.

---

# 7) Viva Question

## 1. Viva Question
**How does the app rank crops?**

## 2. Very Simple Explanation (No Code, No Jargon)
- It gives a score to each crop.
- Higher score = shown first.

## 3. Real-World Analogy (if helpful)
Like sorting exam marks from highest to lowest.

## 4. Step-by-Step Technical Explanation (Beginner Friendly)
1) Evaluate each crop and compute `finalScore`.
2) Sort list by score in descending order.
3) Return full list.

## 5. What Data Is Used? (Inputs & Outputs)
- Input: 8 crop configs + user soil/profile context.
- Output: sorted array of recommendations.

## 6. Where This Logic Lives (File Name & Folder)
- `backend/src/services/cropRecommendationService.js`

## 7. Tiny Code Snippet (Optional, 3–6 lines max, explained line-by-line)
```js
evaluated.sort((a, b) => b.finalScore - a.finalScore);
return { recommendations: evaluated };
```
Line-by-line:
- Sort higher score first.
- Return the list.

## 8. Why This Design Was Chosen (In Simple Words)
- Simple and explainable.
- Product owner can understand ranking quickly.

---

# 8) Viva Question

## 1. Viva Question
**How does season affect crop recommendation?**

## 2. Very Simple Explanation (No Code, No Jargon)
- Crops have a preferred season.
- If the user’s season matches, the crop gets more points.

## 3. Real-World Analogy (if helpful)
Like wearing a raincoat in rainy season: it “matches” the season.

## 4. Step-by-Step Technical Explanation (Beginner Friendly)
- The season string is normalized to `rabi`, `kharif`, or `zaid`.
- Then:
  - match: +15
  - mismatch: −20
  - missing: −5

## 5. What Data Is Used? (Inputs & Outputs)
- Input: season (from profile)
- Output: score change + reason/warning strings

## 6. Where This Logic Lives (File Name & Folder)
- `backend/src/services/cropRecommendationService.js`

## 7. Tiny Code Snippet (Optional, 3–6 lines max, explained line-by-line)
```js
if (!normSeason) score -= 5;
else if (normSeason === cropConfig.season) score += 15;
else score -= 20;
```
Line-by-line:
- Missing season reduces small.
- Match increases.
- Mismatch reduces bigger.

## 8. Why This Design Was Chosen (In Simple Words)
- Season is a strong factor.
- Easy to explain without complex agriculture details.

---

# 9) Viva Question

## 1. Viva Question
**How does pH affect crop scoring in this project?**

## 2. Very Simple Explanation (No Code, No Jargon)
- Each crop has a “safe pH range”.
- If pH is inside, score increases.
- If outside, score decreases based on how far it is.

## 3. Real-World Analogy (if helpful)
Like room temperature comfort:
- If it’s in comfortable range, you’re happy.
- If too hot/cold, comfort drops more as it goes further.

## 4. Step-by-Step Technical Explanation (Beginner Friendly)
- For each crop, get `phMin` and `phMax`.
- If `ph` is in range: +10.
- If out of range:
  - find distance from range.
  - penalty is around “distance × 6”, but always at least 5 and max 15.

## 5. What Data Is Used? (Inputs & Outputs)
- Input: soil `ph` + crop `idealPhRange`
- Output: +10 or −(5..15)

## 6. Where This Logic Lives (File Name & Folder)
- `backend/src/services/cropRecommendationService.js`

## 7. Tiny Code Snippet (Optional, 3–6 lines max, explained line-by-line)
```js
const delta = ph < phMin ? phMin - ph : ph - phMax;
const penalty = clamp(Math.round(delta * 6), 5, 15);
score -= penalty;
```
Line-by-line:
- Find how far pH is from allowed range.
- Convert that distance to a penalty.
- Subtract it from score.

## 8. Why This Design Was Chosen (In Simple Words)
- Still simple.
- Penalizes bigger mismatch more.

---

# 10) Viva Question

## 1. Viva Question
**How does Nitrogen (N) affect crop scoring?**

## 2. Very Simple Explanation (No Code, No Jargon)
- Each crop needs a minimum N level.
- If soil N is enough: +6.
- If not enough: −12.

## 3. Real-World Analogy (if helpful)
Like minimum battery needed to start a vehicle.

## 4. Step-by-Step Technical Explanation (Beginner Friendly)
- Crop requirement is one of: low/medium/high.
- It converts to minimum N:
  - low=15, medium=25, high=35
- Then checks soil N against that.

## 5. What Data Is Used? (Inputs & Outputs)
- Input: soil `n` + crop nitrogen requirement
- Output: +6 or −12

## 6. Where This Logic Lives (File Name & Folder)
- `backend/src/services/cropRecommendationService.js`

## 7. Tiny Code Snippet (Optional, 3–6 lines max, explained line-by-line)
```js
const minN = requirementToMinN(cropConfig.nitrogenRequirement);
if (n >= minN) score += 6;
else score -= 12;
```
Line-by-line:
- Compute min N.
- Add points if enough.
- Subtract points if low.

## 8. Why This Design Was Chosen (In Simple Words)
- Fast and explainable.
- Students can easily defend it in viva.

---

# 11) Viva Question

## 1. Viva Question
**How does previous crop affect recommendations (crop rotation rule)?**

## 2. Very Simple Explanation (No Code, No Jargon)
- If you repeat the same crop again and again, it can be risky.
- So the system reduces points if the crop is same as previous crop.

## 3. Real-World Analogy (if helpful)
Eating the same food daily: you may miss other nutrients.

## 4. Step-by-Step Technical Explanation (Beginner Friendly)
- If previous crop exists:
  - same crop: −15
  - different crop: +5

## 5. What Data Is Used? (Inputs & Outputs)
- Input: `previousCrop` from profile + current cropCode
- Output: score change + warning/reason

## 6. Where This Logic Lives (File Name & Folder)
- `backend/src/services/cropRecommendationService.js`
- Profile selection UI: `frontend/src/pages/ProfilePage.jsx`

## 7. Tiny Code Snippet (Optional, 3–6 lines max, explained line-by-line)
```js
if (prevCropCode === cropConfig.cropCode) score -= 15;
else score += 5;
```
Line-by-line:
- Same crop reduces score.
- Different crop increases score.

## 8. Why This Design Was Chosen (In Simple Words)
- Encourages better practice in a simple way.
- Adds explainable reasons/warnings.

---

# 12) Viva Question

## 1. Viva Question
**What is a legume bonus, and which crop gets it in this project?**

## 2. Very Simple Explanation (No Code, No Jargon)
- A legume is a crop that can help soil over time.
- In this project, **moong** is treated as a legume.
- It gets extra points.

## 3. Real-World Analogy (if helpful)
Like a student who not only scores well but also helps the class—extra credit.

## 4. Step-by-Step Technical Explanation (Beginner Friendly)
- Each crop has a flag: `isLegume` true/false.
- If true, score gets +8.

## 5. What Data Is Used? (Inputs & Outputs)
- Input: crop config flag `isLegume`
- Output: +8 and a reason string

## 6. Where This Logic Lives (File Name & Folder)
- Crop config: `backend/src/services/cropRecommendationService.js` (`CROP_CONFIG.moong.isLegume = true`)

## 7. Tiny Code Snippet (Optional, 3–6 lines max, explained line-by-line)
```js
if (cropConfig.isLegume) {
  score += 8;
}
```
Line-by-line:
- Check if crop is legume.
- Add bonus points.

## 8. Why This Design Was Chosen (In Simple Words)
- Encourages diversification.
- Adds explainable “why this crop” message.

---

# 13) Viva Question

## 1. Viva Question
**Why does the system give a “diversification bonus”?**

## 2. Very Simple Explanation (No Code, No Jargon)
- The project is Punjab-focused.
- Punjab often grows wheat/rice a lot.
- The system tries to encourage other crops by adding +4 points.

## 3. Real-World Analogy (if helpful)
Like suggesting different career options instead of only 2 popular choices.

## 4. Step-by-Step Technical Explanation (Beginner Friendly)
- If crop is not wheat and not rice, it gets +4.

## 5. What Data Is Used? (Inputs & Outputs)
- Input: current crop code
- Output: +4 score and a reason string

## 6. Where This Logic Lives (File Name & Folder)
- `backend/src/services/cropRecommendationService.js`

## 7. Tiny Code Snippet (Optional, 3–6 lines max, explained line-by-line)
```js
const isDiversification = !["wheat", "rice"].includes(cropConfig.cropCode);
if (isDiversification) score += 4;
```
Line-by-line:
- Check crop is not wheat/rice.
- Add bonus.

## 8. Why This Design Was Chosen (In Simple Words)
- Shows “Punjab-aware” behavior.
- Makes recommendations feel more thoughtful.

---

# 14) Viva Question

## 1. Viva Question
**How does weather affect crop recommendation, and why is it optional?**

## 2. Very Simple Explanation (No Code, No Jargon)
- Weather can change risk.
- But internet may not be available.
- So the system can work even without weather.

Important clarification (as implemented today):
- The scoring service supports “no weather” cases, but the current `/recommendations/crop` route usually tries to fetch weather when a location is available.
- So if Open-Meteo is down, crop recommendation can fail for that request.

## 3. Real-World Analogy (if helpful)
Planning a trip:
- If you have weather forecast, you plan better.
- If not, you still go but more carefully.

## 4. Step-by-Step Technical Explanation (Beginner Friendly)
- Backend fetches 7-day forecast from Open-Meteo.
- It creates alerts:
  - `heat`, `rain_risk`, `heavy_rain`
- Scoring effects:
  - heat: −3
  - heavy rain: −5
  - high water crops (rice): extra rules (−5, −15, +3)
- If weather missing:
  - no penalty points
  - but a warning string is added

## 5. What Data Is Used? (Inputs & Outputs)
- Input: location centroid lat/lon + Open-Meteo response
- Output: `alerts[]` used in scoring and shown in response

## 6. Where This Logic Lives (File Name & Folder)
- Weather fetch: `backend/src/services/weatherService.js`
- Alerts creation: `backend/src/services/weatherAlertService.js`
- Crop scoring uses alerts: `backend/src/services/cropRecommendationService.js`

## 7. Tiny Code Snippet (Optional, 3–6 lines max, explained line-by-line)
```js
const hasHeatAlert = alerts.some((a) => a.type === "heat");
if (hasHeatAlert) score -= 3;
```
Line-by-line:
- Look for heat alert.
- Reduce score.

## 8. Why This Design Was Chosen (In Simple Words)
- Weather improves advice, but should not break the app.
- Keeps demo usable offline.

---

# 15) Viva Question

## 1. Viva Question
**How does the fertilizer guidance decide “low / normal / high”?**

## 2. Very Simple Explanation (No Code, No Jargon)
- It compares N, P, K values to fixed cut-offs.
- Below cut-off = low.
- Inside range = normal.
- Above cut-off = high.

## 3. Real-World Analogy (if helpful)
Like grading:
- below pass mark = fail
- between pass and distinction = pass
- above distinction mark = distinction

## 4. Step-by-Step Technical Explanation (Beginner Friendly)
- The backend has thresholds:
  - N low < 25, N high > 60
  - P low < 15, P high > 40
  - K low < 15, K high > 40
- Then it creates messages:
  - If low → recommend adding support.
  - If high → recommend reducing.

## 5. What Data Is Used? (Inputs & Outputs)
- Input: soil N/P/K/pH + optional crop string
- Output: guidance object with `levels: {n,p,k}` and advice lists

## 6. Where This Logic Lives (File Name & Folder)
- `backend/src/services/fertilizerGuidanceService.js`

## 7. Tiny Code Snippet (Optional, 3–6 lines max, explained line-by-line)
```js
if (value < low) return "low";
if (value > high) return "high";
return "normal";
```
Line-by-line:
- Simple 3-way classification.

## 8. Why This Design Was Chosen (In Simple Words)
- Safe and simple for demo.
- Easy for students to explain.

---

# 16) Viva Question

## 1. Viva Question
**Why are crop recommendation and fertilizer guidance separate features?**

## 2. Very Simple Explanation (No Code, No Jargon)
- Crop recommendation answers: “What crop fits my conditions?”
- Fertilizer guidance answers: “What nutrient seems low/high?”
- They solve different questions.

## 3. Real-World Analogy (if helpful)
Choosing a vehicle (car/bike) is different from choosing fuel plan (petrol/diesel/charging).

## 4. Step-by-Step Technical Explanation (Beginner Friendly)
- Crop uses scoring + ranking.
- Fertilizer uses threshold classification.
- Both use the same soil test data, but logic is different.

## 5. What Data Is Used? (Inputs & Outputs)
- Input: latest SoilTest; crop name optional for fertilizer schedule
- Output: crop list OR fertilizer guidance object

## 6. Where This Logic Lives (File Name & Folder)
- Crop: `backend/src/services/cropRecommendationService.js`
- Fertilizer: `backend/src/services/fertilizerGuidanceService.js`
- API: `backend/src/routes/recommendationRoutes.js`

## 7. Tiny Code Snippet (Optional, 3–6 lines max, explained line-by-line)
```js
router.get("/crop", async (req, res) => { /* crop */ });
router.get("/fertilizer", async (req, res) => { /* fertilizer */ });
```
Line-by-line:
- Two different endpoints.
- Clear separation.

## 8. Why This Design Was Chosen (In Simple Words)
- Easier to maintain and explain.
- Each feature can improve independently.

---

# 17) Viva Question

## 1. Viva Question
**What happens if soil data is missing and the user requests recommendations?**

## 2. Very Simple Explanation (No Code, No Jargon)
- The system cannot guess without soil numbers.
- It returns an error message saying soil test is required.

## 3. Real-World Analogy (if helpful)
Like asking a doctor for medicine without any symptoms or tests.

## 4. Step-by-Step Technical Explanation (Beginner Friendly)
- The backend first checks the latest soil test.
- If none exists:
  - it returns HTTP 400
  - response includes `missingInputs: ["soil"]`

## 5. What Data Is Used? (Inputs & Outputs)
- Input: profileId from login
- Output: error JSON with missing inputs

## 6. Where This Logic Lives (File Name & Folder)
- `backend/src/routes/recommendationRoutes.js`

## 7. Tiny Code Snippet (Optional, 3–6 lines max, explained line-by-line)
```js
if (!latestSoil) {
  return res.status(400).json({
    error: "Soil test is required",
    missingInputs: ["soil"],
  });
}
```
Line-by-line:
- If no soil test record, return error.
- Tell frontend what is missing.

## 8. Why This Design Was Chosen (In Simple Words)
- Prevents wrong advice.
- Clear message to the user.

---

# 18) Viva Question

## 1. Viva Question
**What are the biggest limitations of this system (and how can it be improved)?**

## 2. Very Simple Explanation (No Code, No Jargon)
- It is a demo.
- It uses simple rules.
- It gives guidance, not perfect real-world prescriptions.

## 3. Real-World Analogy (if helpful)
Like a training bicycle:
- Great for learning.
- Not the final racing bike.

## 4. Step-by-Step Technical Explanation (Beginner Friendly)
Current limitations:
- Crop scoring does not use P and K (only N and pH + other rules).
- Fertilizer guidance does not calculate exact fertilizer quantity (kg/acre).
- Crop requirements are hardcoded in code (not DB-managed).
- Weather is based on simple alerts (not detailed agronomy).
- Only 8 crops.

Possible improvements:
- Add P and K scoring.
- Add crop-specific fertilizer dose calculation (with local recommendations).
- Move crop requirements into database/config files.
- Add more crops and more soil inputs.
- Store recommendation history.

## 5. What Data Is Used? (Inputs & Outputs)
- Inputs today: N/P/K/pH + profile + optional weather.
- Outputs: explainable advice objects.

## 6. Where This Logic Lives (File Name & Folder)
- Crop logic: `backend/src/services/cropRecommendationService.js`
- Fertilizer logic: `backend/src/services/fertilizerGuidanceService.js`
- Overall documentation: `TECHNICAL_SYSTEM_DOCUMENTATION.md`

## 7. Tiny Code Snippet (Optional, 3–6 lines max, explained line-by-line)
Crop logic currently reads P and K but does not score them:
```js
const p = Number(soil?.p);
const k = Number(soil?.k);
// (no scoring rules use p/k today)
```
Line-by-line:
- P and K are read.
- But scoring rules don’t use them yet.

## 8. Why This Design Was Chosen (In Simple Words)
- For Review/demo, simplicity and explainability are more important.
- Less risk of giving wrong “exact” fertilizer dose.

---

## Final confidence note (for students)
If you get stuck in viva, say this calmly:
> “This is a rule-based demo system. It stores soil tests in MongoDB, then scores crops using clear +/− points, and gives fertilizer guidance by classifying N/P/K as low/normal/high.”
