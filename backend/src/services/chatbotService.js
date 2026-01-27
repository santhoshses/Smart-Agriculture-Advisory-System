/**
 * Chatbot service (MVP) — Review-01
 *
 * Goals:
 * - Accept text queries in English/Punjabi
 * - Return a bilingual, safe, rule-based response (no LLM)
 * - Keep outputs explainable and demo-friendly
 */

function normalize(text) {
  return String(text || "")
    .trim()
    .toLowerCase();
}

function detectIntent(text) {
  const t = normalize(text);

  // English intents
  if (t.includes("crop") || t.includes("recommend") || t.includes("which crop")) return "crop";
  if (t.includes("fertil") || t.includes("urea") || t.includes("npk")) return "fertilizer";
  if (t.includes("disease") || t.includes("leaf") || t.includes("spot") || t.includes("rust")) return "disease";
  if (t.includes("weather") || t.includes("rain") || t.includes("forecast")) return "weather";
  if (t.includes("hello") || t.includes("hi") || t.includes("help")) return "help";

  // Punjabi (Gurmukhi) intents — basic matching
  if (t.includes("ਫਸਲ") || t.includes("ਸਿਫ਼ਾਰ") || t.includes("ਕਿਹੜੀ ਫਸਲ")) return "crop";
  if (t.includes("ਖਾਦ") || t.includes("ਯੂਰੀਆ") || t.includes("ਐਨਪੀਕੇ") || t.includes("npk")) return "fertilizer";
  if (t.includes("ਬਿਮਾਰੀ") || t.includes("ਪੱਤਾ") || t.includes("ਦਾਗ") || t.includes("ਰਸਟ")) return "disease";
  if (t.includes("ਮੌਸਮ") || t.includes("ਬਰਸਾਤ") || t.includes("ਭਵਿੱਖ")) return "weather";
  if (t.includes("ਸਤ") || t.includes("ਨਮਸਤੇ") || t.includes("ਮਦਦ")) return "help";

  return "unknown";
}

function getResponseTemplates() {
  return {
    help: {
      en:
        "I can help with: crop recommendation, fertilizer guidance, disease detection, and weather. Ask a question like: 'recommend crop' or 'weather forecast'.",
      pa:
        "ਮੈਂ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ: ਫਸਲ ਸਿਫ਼ਾਰਿਸ਼, ਖਾਦ ਮਾਰਗਦਰਸ਼ਨ, ਬਿਮਾਰੀ ਪਛਾਣ, ਅਤੇ ਮੌਸਮ। ਉਦਾਹਰਨ: 'ਫਸਲ ਸਿਫ਼ਾਰਿਸ਼' ਜਾਂ 'ਮੌਸਮ ਭਵਿੱਖਬਾਣੀ' ਲਿਖੋ।",
    },
    crop: {
      en:
        "For crop recommendation, please save your Farmer Profile and Soil Test, then open the Crop Recommendation screen. The system will show ranked crops with reasons.",
      pa:
        "ਫਸਲ ਸਿਫ਼ਾਰਿਸ਼ ਲਈ ਪਹਿਲਾਂ ਕਿਸਾਨ ਪ੍ਰੋਫ਼ਾਈਲ ਅਤੇ ਮਿੱਟੀ ਜਾਂਚ ਸੇਵ ਕਰੋ, ਫਿਰ 'ਫਸਲ ਸਿਫ਼ਾਰਿਸ਼' ਪੰਨਾ ਖੋਲ੍ਹੋ। ਉੱਥੇ ਕਾਰਨ ਸਮੇਤ ਰੈਂਕ ਕੀਤੀਆਂ ਫਸਲਾਂ ਦਿਖਾਈਆਂ ਜਾਣਗੀਆਂ।",
    },
    fertilizer: {
      en:
        "For fertilizer guidance, please enter NPK/pH in Soil Input. Then open Fertilizer Guidance and (optionally) enter the crop name to get a schedule and safety notes.",
      pa:
        "ਖਾਦ ਮਾਰਗਦਰਸ਼ਨ ਲਈ ਮਿੱਟੀ ਇਨਪੁੱਟ ਵਿੱਚ NPK/pH ਭਰੋ। ਫਿਰ 'ਖਾਦ ਮਾਰਗਦਰਸ਼ਨ' ਪੰਨਾ ਖੋਲ੍ਹੋ ਅਤੇ (ਚੋਣਵਾਂ) ਫਸਲ ਦਾ ਨਾਂ ਲਿਖੋ ਤਾਂ ਸਮਾਂਸੂਚੀ ਅਤੇ ਸੁਰੱਖਿਆ ਨੋਟਸ ਮਿਲਣਗੇ।",
    },
    disease: {
      en:
        "For disease detection, upload a leaf image on the Disease Detection screen. You will get the disease name, confidence, and treatment recommendation.",
      pa:
        "ਬਿਮਾਰੀ ਪਛਾਣ ਲਈ 'ਬਿਮਾਰੀ ਪਛਾਣ' ਪੰਨੇ 'ਤੇ ਪੱਤੇ ਦੀ ਤਸਵੀਰ ਅੱਪਲੋਡ ਕਰੋ। ਤੁਹਾਨੂੰ ਬਿਮਾਰੀ ਦਾ ਨਾਂ, ਭਰੋਸਾ (confidence), ਅਤੇ ਇਲਾਜ ਦੀ ਸਿਫ਼ਾਰਿਸ਼ ਮਿਲੇਗੀ।",
    },
    weather: {
      en:
        "For weather, open the Weather screen to get a 7-day forecast and alerts. If you share your location coordinates, the forecast will be more accurate.",
      pa:
        "ਮੌਸਮ ਲਈ 'ਮੌਸਮ' ਪੰਨਾ ਖੋਲ੍ਹੋ ਤਾਂ 7 ਦਿਨਾਂ ਦੀ ਭਵਿੱਖਬਾਣੀ ਅਤੇ ਐਲਰਟ ਮਿਲਣਗੇ। ਜੇ ਤੁਸੀਂ ਅਕਸ਼ਾਂਸ/ਦੇਸ਼ਾਂਤਰ ਦਿਓ ਤਾਂ ਭਵਿੱਖਬਾਣੀ ਹੋਰ ਸਹੀ ਹੋਵੇਗੀ।",
    },
    unknown: {
      en:
        "Sorry, I couldn’t understand. Try: 'crop recommendation', 'fertilizer guidance', 'disease detection', or 'weather forecast'.",
      pa:
        "ਮਾਫ਼ ਕਰਨਾ, ਮੈਨੂੰ ਸਮਝ ਨਹੀਂ ਆਇਆ। ਕਿਰਪਾ ਕਰਕੇ ਇਹ ਕੋਸ਼ਿਸ਼ ਕਰੋ: 'ਫਸਲ ਸਿਫ਼ਾਰਿਸ਼', 'ਖਾਦ', 'ਬਿਮਾਰੀ', ਜਾਂ 'ਮੌਸਮ ਭਵਿੱਖਬਾਣੀ'।",
    },
  };
}

function generateChatbotResponse({ message, language }) {
  const intent = detectIntent(message);
  const templates = getResponseTemplates();
  const lang = language === "pa" ? "pa" : "en";
  const reply = templates[intent]?.[lang] || templates.unknown[lang];

  return {
    intent,
    language: lang,
    reply,
    meta: {
      mode: "rule-based-mvp",
    },
  };
}

module.exports = { generateChatbotResponse };

