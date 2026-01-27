import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { apiRequest } from "../api/client";

export default function ChatbotPage() {
  const { t, language } = useI18n();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState(null);
  const [lastQuestion, setLastQuestion] = useState(null);
  const [error, setError] = useState(null);

  const onSend = async (e) => {
    e.preventDefault();
    setError(null);
    setReply(null);

    const trimmed = String(message || "").trim();
    if (!trimmed) {
      setError(new Error(t("chatErrorEmpty")));
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest("/chat", {
        method: "POST",
        body: { message: trimmed, language },
      });
      setReply(data);
      setLastQuestion(trimmed);
    } catch (e2) {
      setError(e2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>{t("pageChatTitle")}</h1>
      <p className="muted">{t("pageChatBody")}</p>

      <form className="card" onSubmit={onSend}>
        <div style={{ display: "grid", gap: 10 }}>
          <label>
            <div><strong>{t("chatYourQuestion")}</strong></div>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("chatPlaceholder")}
            />
          </label>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "..." : t("chatSend")}
          </button>
        </div>
      </form>

      {error ? (
        <div className="card">
          <strong>{t("chatError")}</strong>
          <div className="muted">{String(error.message || error)}</div>
          {error.data ? (
            <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(error.data, null, 2)}</pre>
          ) : null}
        </div>
      ) : null}

      {reply ? (
        <div className="card">
          <h2 className="sectionTitle">{t("pageChatTitle")}</h2>

          <div className="chatWrap">
            <div className="bubbleRow">
              <div className="bubble bubbleUser">
                <div className="bubbleMeta">{t("chatYou")}</div>
                <div style={{ whiteSpace: "pre-wrap" }}>{lastQuestion}</div>
              </div>
            </div>
            <div className="bubbleRow">
              <div className="bubble bubbleBot">
                <div className="bubbleMeta">{t("chatBotReply")}</div>
                <div style={{ whiteSpace: "pre-wrap" }}>{reply.reply}</div>
              </div>
            </div>
          </div>

          <details style={{ marginTop: 10 }}>
            <summary>{t("commonRawJson")}</summary>
            <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(reply, null, 2)}</pre>
          </details>
        </div>
      ) : null}
    </div>
  );
}
