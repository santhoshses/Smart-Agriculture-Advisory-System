# End-to-end Voice Bot Implementation (Smart Agriculture Assistance System)

This project’s **voice bot** is implemented as a **browser-based voice layer** on top of the existing web app.

It works in 4 stages:
1) **Voice capture (microphone permission + listening)**
2) **Speech → text** (browser Speech Recognition)
3) **Text processing** (rule-based keyword matching in frontend)
4) **Response back to user** (Text-to-Speech + page navigation)

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

Important implementation note (current repo):
The Assistant page can:
- navigate using frontend keyword intents, and
- optionally send the transcript to a **rule-based backend chatbot** for a short spoken reply.

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

### 3.2 Backend chatbot (rule-based)

The backend exposes a small rule-based endpoint:
- `POST /chat` (JSON: `{ message, language }`)

The Assistant can use this to speak a short reply after navigation acknowledgement.

Key point:
- It is **rule-based** (keywords + templates).
- There is **no AI/LLM**.

---

## 4) Supported voice commands (keywords)

### 4.1 Logical categorization (how to explain in viva)

#### A) Voice inputs that trigger **page redirection** (Frontend)
These match the frontend keyword rules and will:
- speak an acknowledgement, and
- navigate to a feature page.

#### B) Voice inputs that trigger **spoken output + navigation** (Frontend)
In this repo, the supported voice commands are those that map to a page intent.
The Assistant speaks an acknowledgement and navigates.

#### D) Unsupported / unknown voice inputs
If nothing matches:
- no navigation happens,
- the app speaks a fallback response.

---

### 4.2 Comprehensive supported voice command table

The table below covers the **complete set of supported keyword variants** currently implemented in code.

Notes:
- **Handled by**: Frontend intent matching (`useVoiceCommands.js`)
- **System behavior** can include:
  - *Navigate* (page redirection)
  - *Speak* (Text-to-Speech)
  - or both

| Spoken keyword / phrase (examples) | Detected intent | Handled by | System behavior | Route (if navigate) | Example spoken output |
|---|---|---|---|---|---|
| **English**: `crop`, `recommend`  \\ **Punjabi**: `ਫਸਲ`, `ਸਿਫ਼ਾਰ` | `crop` | Frontend | **Speak + Navigate** | `/crop` | “Heard: crop recommendation. Crop recommendation.” |
| **English**: `fertilizer`, `fertil`, `urea`, `npk`  \\ **Punjabi**: `ਖਾਦ`, `ਯੂਰੀਆ`, `ਐਨਪੀਕੇ`, `npk` | `fertilizer` | Frontend | **Speak + Navigate** | `/fertilizer` | “Heard: fertilizer… Fertilizer guidance.” |
| **English**: `disease`, `leaf`, `image`  \\ **Punjabi**: `ਬਿਮਾਰੀ`, `ਪੱਤਾ`, `ਤਸਵੀਰ` | `disease` | Frontend | **Speak + Navigate** | `/disease` | “Heard: disease… Disease detection.” |
| **English**: `weather`, `rain`, `forecast`  \\ **Punjabi**: `ਮੌਸਮ`, `ਬਰਸਾਤ`, `ਭਵਿੱਖ` | `weather` | Frontend | **Speak + Navigate** | `/weather` | “Heard: weather… Weather forecast.” |
| Anything else (example: “tell me market price”) | *(no match)* | Frontend | **Fallback speech only** | — | “I couldn’t understand. Try crop / fertilizer / disease / weather.” |

---

### 4.3 Fallback behavior (when no keyword matches)

When the transcript does not match supported keywords:
1) **Frontend** does not navigate anywhere.
2) The Assistant page speaks a generic message like **“I couldn’t understand…”**.

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
- **Audio**: speaks acknowledgement (or fallback message)

---

## 6) Step-by-step working flow (simple)
1. User opens **Assistant page**.
2. User clicks **Start listening**.
3. Browser asks permission; user clicks **Allow**.
4. User speaks.
5. Browser converts speech → transcript text.
6. Frontend checks for navigation keywords and may navigate.
7. Frontend speaks the acknowledgement and navigates to the matched page.

---

## 7) Sample voice commands and expected outputs

### Example 1: Navigation + spoken output
**Input (English)**: “crop recommendation”
- Transcript: `crop recommendation`
- Frontend intent: `crop` → navigates to `/crop`

### Example 2: Unsupported input (no navigation)
**Input (English)**: “help”
- Frontend intent: *(no match)* → no navigation
- Assistant speaks fallback (e.g., “Try crop/fertilizer/disease/weather”)

### Example 3: Unknown input
**Input**: “tell me tomorrow market price”
- Frontend intent: *(no match)*
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
- It **does not** automatically fill numeric soil input fields (N, P, K, pH) from speech.

### Not a smart conversational AI
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
- Voice UI + TTS + navigation: `frontend/src/pages/AssistantPage.jsx`

---

## One-line viva-ready summary
The voice bot uses browser Speech Recognition to convert speech to text, then applies rule-based keyword matching for navigation and can also call a rule-based backend chatbot for a short reply, and finally speaks the response with browser Text-to-Speech—only predefined commands are supported, and everything else falls into an unknown/fallback case by design.
