import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import { useVoiceCommands } from "../voice/useVoiceCommands";
import { apiRequest } from "../api/client";

export default function AssistantPage() {
  const navigate = useNavigate();
  const { t, language } = useI18n();

  const speak = (text) => {
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = language === "pa" ? "pa-IN" : "en-IN";
      synth.cancel();
      synth.speak(utter);
    } catch {
      // ignore
    }
  };

  const onIntent = (intent, transcript) => {
    if (!intent) {
      speak(t("voiceNoMatch"));
      return;
    }

    const map = {
      crop: { path: "/crop", label: t("assistantCrop") },
      fertilizer: { path: "/fertilizer", label: t("assistantFertilizer") },
      disease: { path: "/disease", label: t("assistantDisease") },
      weather: { path: "/weather", label: t("assistantWeather") },
    };

    const target = map[intent];
    if (!target) {
      speak(t("voiceNoMatch"));
      return;
    }

    // Speak a short acknowledgement, then navigate
    speak(`${t("voiceHeard")}: ${transcript}. ${target.label}.`);
    navigate(target.path);
  };

  const onTranscript = async (transcript) => {
    const msg = String(transcript || "").trim();
    if (!msg) return;

    try {
      const res = await apiRequest("/chat", {
        method: "POST",
        body: { message: msg, language },
      });
      if (res?.reply) {
        speak(res.reply);
      }
    } catch {
      // Keep voice experience resilient; avoid technical errors in speech.
      speak(t("chatError"));
    }
  };

  const voice = useVoiceCommands({ language, onIntent, onTranscript });

  return (
    <div>
      <h1>{t("pageAssistantTitle")}</h1>
      <p className="muted">{t("pageAssistantBody")}</p>

      <div className="card">
        <h2 className="sectionTitle">{t("pageAssistantChoose")}</h2>
        <div className="grid">
          <button className="btn" type="button" onClick={() => navigate("/crop")}
          >
            {t("assistantCrop")}
          </button>
          <button className="btn" type="button" onClick={() => navigate("/fertilizer")}
          >
            {t("assistantFertilizer")}
          </button>
          <button className="btn" type="button" onClick={() => navigate("/disease")}
          >
            {t("assistantDisease")}
          </button>
          <button className="btn" type="button" onClick={() => navigate("/weather")}
          >
            {t("assistantWeather")}
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="sectionTitle">{t("voiceTitle")}</h2>
        <p className="muted">{t("voiceBody")}</p>

        {!voice.supported ? (
          <p className="muted">{t("voiceNotSupported")}</p>
        ) : (
          <div>
            <div className="grid">
              {!voice.listening ? (
                <button className="btn" type="button" onClick={voice.start}>
                  {t("voiceStart")}
                </button>
              ) : (
                <button className="btn" type="button" onClick={voice.stop}>
                  {t("voiceStop")}
                </button>
              )}

              <div className="muted" style={{ alignSelf: "center" }}>
                {voice.lastTranscript ? (
                  <span>
                    {t("voiceHeard")}: <strong>{voice.lastTranscript}</strong>
                  </span>
                ) : (
                  <span />
                )}
              </div>
            </div>

            {voice.error ? (
              <p className="muted">Error: {String(voice.error)} (allow microphone permission)</p>
            ) : null}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="sectionTitle">{t("pageAssistantSummaryTitle")}</h2>
        <p className="muted">{t("pageAssistantSummaryBody")}</p>
        <ul>
          <li>{t("assistantSummaryProfile")}</li>
          <li>{t("assistantSummarySoil")}</li>
          <li>{t("assistantSummaryDisease")}</li>
          <li>{t("assistantSummaryWeather")}</li>
        </ul>
      </div>
    </div>
  );
}
