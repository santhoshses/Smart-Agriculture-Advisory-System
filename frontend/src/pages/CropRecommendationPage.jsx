import { useI18n } from "../i18n/I18nContext";
import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { NavLink } from "react-router-dom";

export default function CropRecommendationPage() {
  const { t } = useI18n();

  const [profiles, setProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [profilesError, setProfilesError] = useState(null);
  const [profileId, setProfileId] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoadingProfiles(true);
    setProfilesError(null);
    apiRequest("/profiles")
      .then((items) => {
        if (!alive) return;
        setProfiles(Array.isArray(items) ? items : []);
        if (Array.isArray(items) && items.length > 0) setProfileId(items[0]._id);
      })
      .catch((e) => {
        if (!alive) return;
        setProfilesError(e);
      })
      .finally(() => {
        if (!alive) return;
        setLoadingProfiles(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const fetchRecommendations = async () => {
    if (!profileId) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await apiRequest(`/recommendations/crop?profileId=${encodeURIComponent(profileId)}`);
      setResult(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const renderWeatherSummary = () => {
    const w = result?.used?.weather;
    if (!w) return null;
    const alertsCount = Array.isArray(w.alerts) ? w.alerts.length : 0;
    return (
      <div className="card">
        <h2 className="sectionTitle">{t("cropWeatherUsed")}</h2>
        <div className="chips">
          <span className={`chip ${alertsCount > 0 ? "chipWarn" : "chipOk"}`}>
            {t("cropAlerts")}: {alertsCount}
          </span>
          <span className="chip">Lat: {w.location?.lat ?? "-"}</span>
          <span className="chip">Lon: {w.location?.lon ?? "-"}</span>
        </div>
      </div>
    );
  };

  const renderRecommendations = () => {
    const items = Array.isArray(result?.recommendations) ? result.recommendations : [];
    if (items.length === 0) {
      return (
        <div className="card">
          <div className="muted">{t("cropNone")}</div>
        </div>
      );
    }

    return (
      <div className="card">
        <h2 className="sectionTitle">{t("cropResult")}</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((r, idx) => (
            <div key={`${r.crop}-${idx}`} className="kv" style={{ padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 900, fontSize: 16 }}>{r.crop}</div>
                <span className="chip chipOk">{t("cropScore")}: {r.score}</span>
              </div>

              {Array.isArray(r.reasons) && r.reasons.length > 0 ? (
                <div style={{ marginTop: 10 }}>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>{t("cropWhy")}</div>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {r.reasons.slice(0, 4).map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {Array.isArray(r.warnings) && r.warnings.length > 0 ? (
                <div style={{ marginTop: 10 }}>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>{t("cropWarnings")}</div>
                  <div className="chips">
                    {r.warnings.slice(0, 4).map((w, i) => (
                      <span key={i} className="chip chipWarn">{w}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="ctaRow">
          <NavLink className="ctaLink" to="/fertilizer">
            {t("commonNext")}: {t("navFertilizer")}
          </NavLink>
          <NavLink className="ctaLink" to="/weather">
            {t("commonView")}: {t("navWeather")}
          </NavLink>
        </div>

        <details style={{ marginTop: 12 }}>
          <summary>{t("commonRawJson")}</summary>
          <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(result, null, 2)}</pre>
        </details>
      </div>
    );
  };

  return (
    <div>
      <h1>{t("pageCropTitle")}</h1>
      <p>{t("pageCropBody")}</p>

      {profilesError ? (
        <div className="card">
          <strong>{t("cropErrorProfiles")}</strong>
          <div className="muted">{String(profilesError.message || profilesError)}</div>
        </div>
      ) : null}

      {!loadingProfiles && profiles.length === 0 ? (
        <div className="card">
          <div className="muted">{t("cropNoProfiles")}</div>
        </div>
      ) : null}

      <div className="card">
        <div style={{ display: "grid", gap: 10 }}>
          <label>
            <div><strong>{t("cropSelectProfile")}</strong></div>
            <select value={profileId} onChange={(e) => setProfileId(e.target.value)} disabled={loadingProfiles}>
              {profiles.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.location} ({p._id})
                </option>
              ))}
            </select>
          </label>

          <button className="btn" type="button" disabled={loading || !profileId} onClick={fetchRecommendations}>
            {loading ? "..." : t("cropFetch")}
          </button>
        </div>
      </div>

      {error ? (
        <div className="card">
          <strong>{t("cropErrorFetch")}</strong>
          <div className="muted">{String(error.message || error)}</div>
          {error.data ? (
            <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(error.data, null, 2)}</pre>
          ) : null}
        </div>
      ) : null}

      {result ? (
        <>
          {renderWeatherSummary()}
          {renderRecommendations()}
        </>
      ) : null}
    </div>
  );
}
