# End-to-end Voice Bot Implementation (Smart Agriculture Assistance System)

This project’s **voice bot** is implemented as a **browser-based voice layer** on top of the existing web app.

It works in 4 stages:
1) **Voice capture (microphone permission + listening)**
2) **Speech → text** (browser Speech Recognition)
3) **Text processing** (rule-based keyword matching in frontend + rule-based chatbot in backend)
4) **Response back to user** (Text-to-Speech + optional page navigation)

## Introductory clarification (important for viva)
- The voice bot is **rule-based**.
- It supports **only predefined keywords/phrases** (listed in this document).
- If the spoken text does not match the known keywords, it goes to a **default/unknown** case.
- There is **no AI/LLM integration**, no server-side audio processing, and no audio storage.

---

## 1) How voice input is captured

### What happens
- The user clicks **Start listening** on the Assistant page.
- The browser asks for **microphone permission**.
- If allowed, the browser starts listening.

### Where in code
- UI entry point: `frontend/src/pages/AssistantPage.jsx`
- Voice hook: `frontend/src/voice/useVoiceCommands.js`

### Code example (UI triggers microphone)
```jsx
// frontend/src/pages/AssistantPage.jsx
const voice = useVoiceCommands({ language, onIntent, onTranscript });

<button type="button" onClick={voice.start}>
  Start listening
</button>
```

### APIs used
- No external voice library.
- Uses browser Web Speech APIs:
  - `window.SpeechRecognition` / `window.webkitSpeechRecognition`

---

## 2) How audio is converted to text (speech-to-text)

### What happens
- When listening starts, the browser converts speech to text.
- The result comes back in the `onresult` callback.
- The transcript is stored as `lastTranscript` and shown on the screen.

### Where in code
`frontend/src/voice/useVoiceCommands.js`

### Code example (SpeechRecognition → transcript)
```js
// frontend/src/voice/useVoiceCommands.js
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const rec = new SpeechRecognition();
rec.lang = language === "pa" ? "pa-IN" : "en-IN";

rec.onresult = (event) => {
  const transcript = event?.results?.[0]?.[0]?.transcript || "";
  setLastTranscript(transcript);
};

rec.start();
```

### Tools/services used
- **Tool**: Browser speech recognition engine
- **Service**: No backend service for speech-to-text
- **Storage**: No audio is stored by the backend (only the transcript text exists in memory)

---

## 3) How the transcribed text is processed (end-to-end)

When speech is converted to text, the transcript is processed in **two places**:

1) **Frontend keyword matching** (for quick navigation)
2) **Backend rule-based chatbot** (for a short spoken answer)

This is important for viva:
- The processing is **keyword-based**, not “understanding the meaning”.
- No NLP model and no AI reasoning is used.

### 3.1 Frontend: keyword matching for navigation

**Where**: `frontend/src/voice/useVoiceCommands.js` → `matchIntent()`

Frontend checks the transcript for a small set of keywords. If it matches, it produces an intent:
- `crop`
- `fertilizer`
- `disease`
- `weather`

Then `frontend/src/pages/AssistantPage.jsx`:
- speaks an acknowledgement (Text-to-Speech)
- navigates to a page like `/crop` or `/weather`

Code reference (intent matching):
```js
// frontend/src/voice/useVoiceCommands.js
if (t.includes("crop") || t.includes("recommend") || t.includes("ਫਸਲ") || t.includes("ਸਿਫ਼ਾਰ")) return "crop";
if (t.includes("fertil") || t.includes("urea") || t.includes("npk") || t.includes("ਖਾਦ")) return "fertilizer";
```

### 3.2 Backend: rule-based chatbot (limited Q&A)

**Where**:
- API endpoint: `backend/src/routes/chatRoutes.js` (`POST /chat`)
- Logic: `backend/src/services/chatbotService.js`

What it does:
- The frontend sends `{ message, language }`.
- Backend checks the message for known keywords.
- It returns a **fixed template reply** (English or Punjabi).

Key point:
- This chatbot is **rule-based**.
- It uses **predefined keywords + fixed templates**.
- It is **not AI** and **not an LLM**.

Backend code reference (idea):
```js
// backend/src/services/chatbotService.js
if (t.includes("weather") || t.includes("rain") || t.includes("ਮੌਸਮ")) return "weather";
return "unknown";
```

---

## 4) Backend Chatbot Capabilities and Predefined Keywords

### 4.1 Logical categorization (how to explain in viva)

#### A) Voice inputs that trigger **page redirection** (Frontend)
These match the frontend keyword rules and will:
- speak an acknowledgement, and
- navigate to a feature page.

#### B) Voice inputs that trigger **spoken answers only** (Backend)
These are understood by the backend chatbot but **not** by the frontend navigation rules.
So the system will:
- not navigate anywhere,
- but it can still speak a chatbot reply.

#### C) Voice inputs that trigger **both navigation and spoken output** (Both)
For common commands like crop/fertilizer/weather (and most disease-related phrases), the system effectively does both:
- frontend acknowledgement + navigation
- backend chatbot reply (because the transcript is also sent to `/chat`)

#### D) Unsupported / unknown voice inputs
If nothing matches:
- no navigation happens,
- the app speaks a fallback response.

---

### 4.2 Comprehensive supported voice command table

The table below covers the **complete set of supported keyword variants** currently implemented in code.

Notes:
- **Handled by** means where the keyword is implemented:
  - *Frontend* = navigation intent matching (`useVoiceCommands.js`)
  - *Backend* = chatbot intent matching (`chatbotService.js`)
  - *Both* = exists in both places
- **System behavior** can include:
  - *Navigate* (page redirection)
  - *Speak* (Text-to-Speech)
  - or both

| Spoken keyword / phrase (examples) | Detected intent | Handled by | System behavior | Route (if navigate) | Example spoken output |
|---|---|---|---|---|---|
| **English**: `crop`, `recommend`  \\ **Punjabi**: `ਫਸਲ`, `ਸਿਫ਼ਾਰ` | `crop` | **Both** | **Speak + Navigate + Speak** (ack + go to page + chatbot reply) | `/crop` | “Heard: crop recommendation. Get crop recommendation.” (then chatbot: “For crop recommendation, please save your Farmer Profile…”) |
| **English**: `fertilizer`, `fertil`, `urea`, `npk`  \\ **Punjabi**: `ਖਾਦ`, `ਯੂਰੀਆ`, `ਐਨਪੀਕੇ`, `npk` | `fertilizer` | **Both** | **Speak + Navigate + Speak** | `/fertilizer` | “Heard: fertilizer… Fertilizer guidance.” (then chatbot gives guidance instructions) |
| **English**: `disease`, `leaf`  \\ **Punjabi**: `ਬਿਮਾਰੀ`, `ਪੱਤਾ` | `disease` | **Both** | **Speak + Navigate + Speak** (ack + go to page + chatbot reply) | `/disease` | “Heard: disease… Detect disease from image.” (then chatbot: “For disease detection, upload a leaf image…”) |
| **English**: `image`  \\ **Punjabi**: `ਤਸਵੀਰ` | `disease` | **Frontend only** | **Speak + Navigate** (ack + go to page) | `/disease` | “Heard: image… Detect disease from image.” *(backend chatbot may reply “unknown” if no other keyword is present)* |
| **English**: `weather`, `rain`, `forecast`  \\ **Punjabi**: `ਮੌਸਮ`, `ਬਰਸਾਤ`, `ਭਵਿੱਖ` | `weather` | **Both** | **Speak + Navigate + Speak** | `/weather` | “Heard: weather… View weather forecast.” |
| **English**: `help`, `hi`, `hello`  \\ **Punjabi**: `ਮਦਦ`, `ਨਮਸਤੇ`, `ਸਤ` | `help` | **Backend only** | **Speak only** (chatbot reply) | — | “I can help with: crop recommendation, fertilizer guidance…” |
| **English**: `which crop`  \\ **Punjabi**: `ਕਿਹੜੀ ਫਸਲ` | `crop` | **Backend only** | **Speak only** (chatbot reply) | — | “For crop recommendation, please save your Farmer Profile and Soil Test…” |
| **English**: `spot`, `rust`  \\ **Punjabi**: `ਦਾਗ`, `ਰਸਟ` | `disease` | **Backend only** | **Speak only** (chatbot reply) | — | “For disease detection, upload a leaf image…” |
| Anything else (example: “tell me market price”) | `unknown` | **Backend** (and Frontend fallback) | **No navigation + fallback speech** | — | Frontend: “I couldn’t understand…” + Backend: “Sorry, I couldn’t understand. Try: crop / fertilizer / …” |

---

### 4.3 Fallback behavior (when no keyword matches)

When the transcript does not match supported keywords:
1) **Frontend** does not navigate anywhere.
2) The Assistant page speaks a generic message like **“I couldn’t understand…”**.
3) The transcript is still sent to the backend `/chat` endpoint.
4) The backend returns an **unknown** template reply, which is also spoken.

Also important:
- There is **no data persistence** for these voice inputs.
- No logs/history are stored in the database.

---

### 4.4 Explicit limitations (viva-focused)
Please state these clearly in viva:
- There is **no conversational memory** (no history stored).
- No NLP model or AI reasoning is used.
- No LLM integration exists.
- The bot cannot answer outside the documented keyword set.

### 4.5 Closing confirmation
The commands documented in the table above represent **100% of the currently supported voice interactions** in this project.
Any other voice input is **intentionally unsupported by design**.

---

## 5) How the system responds back (audio output)

The system responds using **Text-to-Speech** in the browser.

### Where in code
`frontend/src/pages/AssistantPage.jsx`

### Code example (Text-to-Speech)
```js
// frontend/src/pages/AssistantPage.jsx
const synth = window.speechSynthesis;
const utter = new SpeechSynthesisUtterance(text);
utter.lang = language === "pa" ? "pa-IN" : "en-IN";
synth.cancel();
synth.speak(utter);
```

So output can be:
- **Screen**: shows last transcript
- **Audio**: speaks acknowledgement + chatbot reply

---

## 6) Step-by-step working flow (simple)
1. User opens **Assistant page**.
2. User clicks **Start listening**.
3. Browser asks permission; user clicks **Allow**.
4. User speaks.
5. Browser converts speech → transcript text.
6. Frontend checks for navigation keywords and may navigate.
7. In parallel, transcript is sent to backend `/chat`.
8. Backend returns a rule-based reply.
9. Frontend speaks the acknowledgement and/or chatbot reply.

---

## 7) Sample voice commands and expected outputs

### Example 1: Navigation + spoken output
**Input (English)**: “crop recommendation”
- Transcript: `crop recommendation`
- Frontend intent: `crop` → navigates to `/crop`
- Backend intent: `crop` → chatbot reply about saving Profile + Soil Test

### Example 2: Spoken answer only (no navigation)
**Input (English)**: “help”
- Frontend intent: *(no match)* → no navigation
- Backend intent: `help` → speaks what the bot supports

### Example 3: Unknown input
**Input**: “tell me tomorrow market price”
- Frontend intent: *(no match)*
- Backend intent: `unknown`
- Spoken fallback: “Sorry, I couldn’t understand…”

---

## 8) Limitations and current gaps (important for viva)

### Accuracy + noise
- Browser speech recognition can fail with:
  - accent variations
  - background noise
  - unclear pronunciation

### Browser support
- `SpeechRecognition` is not supported everywhere (often works best in Chrome).

### Language support limitations
- App supports English (`en-IN`) and Punjabi (`pa-IN`).
- Punjabi recognition quality may vary across devices.

### Not a full “voice form filling” bot
- Current voice feature is mainly for:
  - guided commands (navigation)
  - sending transcript to chatbot
- It **does not** automatically fill numeric soil input fields (N, P, K, pH) from speech.

### Not a smart conversational AI
- Backend chatbot is rule-based and template-based.
- There is **no LLM integration**.
- Complex free-form conversations will not be handled well.

### Scalability
- Keyword-based intent detection is easy but becomes harder to maintain when command list grows.
- For larger scale:
  - move keyword lists into a single config file
  - add automated tests for intent matching
  - optionally store chat history (if required)

---

## Key files (end-to-end)

### Frontend
- Voice capture + STT + intent: `frontend/src/voice/useVoiceCommands.js`
- Voice UI + TTS + navigation + chat call: `frontend/src/pages/AssistantPage.jsx`

### Backend
- Chat endpoint: `backend/src/routes/chatRoutes.js`
- Rule-based chatbot: `backend/src/services/chatbotService.js`

---

## One-line viva-ready summary
The voice bot uses browser Speech Recognition to convert speech to text, then applies rule-based keyword matching for navigation and a rule-based backend chatbot for short replies, and finally speaks the response with browser Text-to-Speech—only predefined commands are supported, and everything else falls into an unknown/fallback case by design.
