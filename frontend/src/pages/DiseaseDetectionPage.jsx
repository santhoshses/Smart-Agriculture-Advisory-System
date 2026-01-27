import { useI18n } from "../i18n/I18nContext";
import { useState } from "react";
import { apiBaseUrl } from "../api/client";

export default function DiseaseDetectionPage() {
  const { t, language } = useI18n();

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onPredict = async () => {
    setError(null);
    setResult(null);
    if (!file) {
      setError(new Error(t("diseaseNoFile")));
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("image", file);

      const res = await fetch(`${apiBaseUrl}/disease/predict`, {
        method: "POST",
        body: form,
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        const msg = data?.error || t("diseaseError");
        const e = new Error(msg);
        e.data = data;
        throw e;
      }

      setResult(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const confidencePct =
    typeof result?.confidence === "number" && Number.isFinite(result.confidence)
      ? Math.max(0, Math.min(100, Math.round(result.confidence * 100)))
      : null;

  return (
    <div>
      <h1>{t("pageDiseaseTitle")}</h1>
      <p>{t("pageDiseaseBody")}</p>

      <div className="card">
        <label htmlFor="leafImage">
          <strong>{t("pageDiseaseLeafImage")}</strong>
        </label>
        <input
          id="leafImage"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            setFile(f);
            setResult(null);
            setError(null);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(f ? URL.createObjectURL(f) : null);
          }}
        />

        {file && previewUrl ? (
          <div className="imagePreview">
            <img src={previewUrl} alt={t("pageDiseaseLeafImage")} />
            <div className="imagePreviewMeta">
              <div style={{ minWidth: 0 }}>
                <div className="muted" style={{ fontSize: 12 }}>
                  {t("diseaseChosenFile")}
                </div>
                <div
                  style={{
                    fontWeight: 800,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {file.name}
                </div>
              </div>
              <span className="chip">{Math.round((file.size || 0) / 1024)} KB</span>
            </div>
          </div>
        ) : null}

        <button className="btn" type="button" onClick={onPredict} disabled={loading}>
          {loading ? t("diseaseUploading") : t("diseasePredict")}
        </button>

        {error ? (
          <div style={{ marginTop: 10 }}>
            <strong>{t("diseaseError")}</strong>
            <div className="muted">{String(error.message || error)}</div>
            {error.data ? (
              <details style={{ marginTop: 10 }}>
                <summary>{t("commonRawJson")}</summary>
                <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(error.data, null, 2)}</pre>
              </details>
            ) : null}
          </div>
        ) : null}
      </div>

      {result ? (
        <div className="card">
          <h2 className="sectionTitle">{t("diseaseResult")}</h2>

          <div className="resultGrid">
            <div className="kv">
              <p className="kvLabel">{t("diseaseDiseaseLabel")}</p>
              <p className="kvValue">{result.disease ?? "-"}</p>
            </div>
            <div className="kv">
              <p className="kvLabel">{t("diseaseConfidence")}</p>
              <p className="kvValue">{confidencePct !== null ? `${confidencePct}%` : "-"}</p>
              {confidencePct !== null ? (
                <div style={{ marginTop: 8 }}>
                  <div className="progressBar" aria-hidden>
                    <div className="progressFill" style={{ width: `${confidencePct}%` }} />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {result.recommendation ? (
            <div className="kv" style={{ marginTop: 12 }}>
              <div className="flowLabel">{t("diseaseTreatmentTitle")}</div>
              <ul style={{ margin: "10px 0 0", paddingLeft: 18 }}>
                <li>
                  <strong>{t("diseaseTreatment")}:</strong>{" "}
                  {result.recommendation?.[language]?.treatment || result.recommendation?.en?.treatment}
                </li>
                <li>
                  <strong>{t("diseasePrevention")}:</strong>{" "}
                  {result.recommendation?.[language]?.prevention || result.recommendation?.en?.prevention}
                </li>
                <li>
                  <strong>{t("diseaseWhenToContact")}:</strong>{" "}
                  {result.recommendation?.[language]?.whenToContactExpert ||
                    result.recommendation?.en?.whenToContactExpert}
                </li>
                <li>
                  <strong>{t("diseaseSafety")}:</strong>{" "}
                  {result.recommendation?.[language]?.safety || result.recommendation?.en?.safety}
                </li>
              </ul>
            </div>
          ) : null}

          <details style={{ marginTop: 12 }}>
            <summary>{t("commonRawJson")}</summary>
            <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      ) : null}
    </div>
  );
}
