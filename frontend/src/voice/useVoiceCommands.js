import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function getSpeechRecognition() {
  const w = window;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function normalize(text) {
  return String(text || "")
    .trim()
    .toLowerCase();
}

function matchIntent(text) {
  const t = normalize(text);

  // English keywords
  if (t.includes("crop") || t.includes("recommend")) return "crop";
  if (t.includes("fertil") || t.includes("urea") || t.includes("npk")) return "fertilizer";
  if (t.includes("disease") || t.includes("leaf") || t.includes("image")) return "disease";
  if (t.includes("weather") || t.includes("rain") || t.includes("forecast")) return "weather";

  // Punjabi keywords (Gurmukhi) — simple matching
  if (t.includes("ਫਸਲ") || t.includes("ਸਿਫ਼ਾਰ")) return "crop";
  if (t.includes("ਖਾਦ") || t.includes("ਯੂਰੀਆ") || t.includes("ਐਨਪੀਕੇ") || t.includes("npk")) return "fertilizer";
  if (t.includes("ਬਿਮਾਰੀ") || t.includes("ਪੱਤਾ") || t.includes("ਤਸਵੀਰ")) return "disease";
  if (t.includes("ਮੌਸਮ") || t.includes("ਬਰਸਾਤ") || t.includes("ਭਵਿੱਖ")) return "weather";

  return null;
}

export function useVoiceCommands({ language, onIntent, onTranscript }) {
  const SpeechRecognition = useMemo(getSpeechRecognition, []);
  const [supported, setSupported] = useState(Boolean(SpeechRecognition));
  const [listening, setListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);

  useEffect(() => {
    setSupported(Boolean(SpeechRecognition));
  }, [SpeechRecognition]);

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop?.();
    } catch {
      // ignore
    }
    setListening(false);
  }, []);

  const start = useCallback(() => {
    if (!SpeechRecognition) return;

    setError(null);

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = language === "pa" ? "pa-IN" : "en-IN";

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = (e) => {
      setError(e?.error || "voice_error");
      setListening(false);
    };
    rec.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || "";
      setLastTranscript(transcript);
      const intent = matchIntent(transcript);
      onIntent(intent, transcript);

      // Optional: allow caller to handle the raw transcript (e.g., chatbot)
      try {
        onTranscript?.(transcript);
      } catch {
        // ignore
      }
    };

    recognitionRef.current = rec;
    rec.start();
  }, [SpeechRecognition, language, onIntent]);

  useEffect(() => () => stop(), [stop]);

  return {
    supported,
    listening,
    lastTranscript,
    error,
    start,
    stop,
  };
}
