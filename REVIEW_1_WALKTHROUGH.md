# Review 1 – Project Walkthrough

## 1. Project Introduction
This project is a “Smart Crop Advisory” web application. It is designed to help farmers record basic farm inputs (location, season, soil test values) and receive advisory outputs such as crop recommendation, fertilizer guidance, weather forecast alerts, and a disease scan flow using a leaf image.

## 2. What Has Been Completed (Review-1 Scope)
### Completed features (working modules)
- **Frontend UI** with navigation and bilingual language toggle (English + Punjabi).
- **Farmer Profile** screen: save farmer profile.
- **Soil Input** screen: save N/P/K and pH values linked to a profile.
- **Crop Recommendation** screen: fetch rule-based crop recommendations.
- **Fertilizer Guidance** screen: fetch rule-based fertilizer guidance.
- **Weather** screen: fetch 7-day forecast + show simple alerts.
- **Disease Detection** screen: upload image and receive a disease result (pipeline works; prediction is stub).
- **Chatbot + Assistant screens:** rule-based chatbot responses; assistant provides guided navigation and voice mode.

### Screens available
Dashboard, Profile, Soil Input, Crop Recommendation, Fertilizer Guidance, Disease Detection, Weather, Assistant, Chatbot.

### APIs implemented
- Profile APIs (`/profiles`)
- Soil test APIs (`/soil-tests`)
- Recommendation APIs (`/recommendations/crop`, `/recommendations/fertilizer`)
- Weather API (`/weather/forecast`)
- Disease upload API (`/disease/predict`)
- Chat API (`/chat`)
- Edge status API (`/edge/status`)

### Database integration status
- MongoDB integration is implemented.
- Farmer profiles and soil tests are stored in MongoDB.

## 3. Live Walkthrough Flow (How to Demonstrate)
Use this flow during Review-1 demonstration:

1) **Open Dashboard**
- Show the demo flow steps on the dashboard.
- Show that the app supports English/Punjabi toggle.

2) **Create Farmer Profile**
- Go to **Farmer Profile**.
- Enter location (example: Ludhiana) and optional season/previous crop.
- Click **Save profile**.
- Show that the profile is saved (screen displays saved details).

3) **Enter Soil Test Values**
- Go to **Soil Input**.
- Select the saved profile.
- Enter N, P, K, and pH values.
- Click **Save soil test**.
- Show that soil test record is saved.

4) **Get Crop Recommendation**
- Go to **Crop Recommendation**.
- Select the same profile.
- Click **Get recommendations**.
- Explain that this is a rule-based recommendation using the latest soil test.

5) **Get Fertilizer Guidance**
- Go to **Fertilizer Guidance**.
- Select the same profile.
- Optionally type crop name (example: wheat).
- Click **Get guidance**.
- Show soil level summary, schedule, and safety notes.

6) **Show Weather Forecast**
- Go to **Weather**.
- Use default lat/lon or enter another coordinate.
- Click **Get forecast**.
- Show the alerts and 7-day forecast.

7) **Show Disease Detection Flow (Optional in Review-1)**
- Go to **Disease Detection**.
- Upload a sample leaf image.
- Click **Predict disease**.
- Show that a result appears with confidence and treatment guidance.

8) **Show Bilingual Output**
- Toggle language to Punjabi and re-open any one output screen.

## 4. Current Architecture Snapshot
### Brief architecture
- **Frontend:** React web UI
- **Backend:** Node.js + Express API
- **Database:** MongoDB
- **ML service:** Python FastAPI

### What parts are active
- Backend + MongoDB persistence (profiles and soil tests).
- Weather integration via Open-Meteo.
- Disease upload pipeline.

### What parts are stubbed
- Disease prediction inside ML service is a stub (dummy output).

## 5. Work in Progress (Known Gaps)
- Crop recommendation is limited in scope (rule-based, limited crops).
- Location-to-lat/lon resolution for crop recommendation uses a limited lookup table.
- No user login/authentication.
- Disease prediction accuracy is not implemented (stub).

## 6. Planned for Next Review
- Improve input validation and user guidance.
- Expand rule sets and crop coverage.
- Improve location handling beyond a fixed lookup table.
- Improve how results and history are shown to the user.

## 7. ML Status Declaration
- For Review-1, the ML prediction is **not the focus**.
- The ML service is included to demonstrate an end-to-end pipeline (upload → service → response).
- A real trained model is planned for the final review stage.

## 8. Conclusion for Review Panel
This Review-1 implementation proves that the team has built a working full-stack system: a bilingual UI, a backend API, MongoDB persistence for core inputs, rule-based advisory outputs, and integrated services for weather and disease workflow. The system can be demonstrated end-to-end on a local machine.

