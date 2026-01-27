import { useI18n } from "../i18n/I18nContext";
import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { NavLink } from "react-router-dom";

export default function FertilizerGuidancePage() {
  const { t } = useI18n();

  const [profiles, setProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [profilesError, setProfilesError] = useState(null);
  const [profileId, setProfileId] = useState("");

  const [crop, setCrop] = useState("wheat");
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

  const fetchGuidance = async () => {
    if (!profileId) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const qs = new URLSearchParams({ profileId });
      if (crop) qs.set("crop", crop);
      const data = await apiRequest(`/recommendations/fertilizer?${qs.toString()}`);
      setResult(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const renderGuidance = () => {
    const g = result?.guidance;
    if (!g) return null;

    const levels = g.soilSummary?.levels || {};
    const chipClass = (lvl) => {
      if (lvl === "low") return "chipWarn";
      if (lvl === "high") return "chipBad";
      if (lvl === "normal") return "chipOk";
      return "";
    };

    return (
      <div className="card">
        <h2 className="sectionTitle">{t("fertResult")}</h2>

        <div className="chips" style={{ marginTop: 6 }}>
          <span className="chip">Crop: {g.crop || "-"}</span>
          <span className={`chip ${chipClass(levels.n)}`}>N: {levels.n || "-"}</span>
          <span className={`chip ${chipClass(levels.p)}`}>P: {levels.p || "-"}</span>
          <span className={`chip ${chipClass(levels.k)}`}>K: {levels.k || "-"}</span>
          <span className="chip">pH: {g.soilSummary?.ph ?? "-"}</span>
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          <div className="kv" style={{ padding: 14 }}>
            <div className="flowLabel">{t("fertSoilSummary")}</div>
            {Array.isArray(g.npkGuidance) && g.npkGuidance.length > 0 ? (
              <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                {g.npkGuidance.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            ) : (
              <div className="muted" style={{ marginTop: 8 }}>-</div>
            )}
          </div>

          <div className="kv" style={{ padding: 14 }}>
            <div className="flowLabel">{t("fertSchedule")}</div>
            {Array.isArray(g.schedule) && g.schedule.length > 0 ? (
              <ol style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                {g.schedule.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ol>
            ) : (
              <div className="muted" style={{ marginTop: 8 }}>-</div>
            )}
          </div>

          <div className="kv" style={{ padding: 14 }}>
            <div className="flowLabel">{t("fertSafety")}</div>
            {Array.isArray(g.safetyNotes) && g.safetyNotes.length > 0 ? (
              <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                {g.safetyNotes.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            ) : (
              <div className="muted" style={{ marginTop: 8 }}>-</div>
            )}
          </div>
        </div>

        <div className="ctaRow">
          <NavLink className="ctaLink" to="/weather">
            {t("commonView")}: {t("navWeather")}
          </NavLink>
          <NavLink className="ctaLink" to="/disease">
            {t("commonView")}: {t("navDisease")}
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
      <h1>{t("pageFertilizerTitle")}</h1>
      <p>{t("pageFertilizerBody")}</p>

      {profilesError ? (
        <div className="card">
          <strong>{t("fertErrorProfiles")}</strong>
          <div className="muted">{String(profilesError.message || profilesError)}</div>
        </div>
      ) : null}

      {!loadingProfiles && profiles.length === 0 ? (
        <div className="card">
          <div className="muted">{t("fertNoProfiles")}</div>
        </div>
      ) : null}

      <div className="card">
        <div style={{ display: "grid", gap: 10 }}>
          <label>
            <div><strong>{t("fertSelectProfile")}</strong></div>
            <select value={profileId} onChange={(e) => setProfileId(e.target.value)} disabled={loadingProfiles}>
              {profiles.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.location} ({p._id})
                </option>
              ))}
            </select>
          </label>

          <label>
            <div><strong>{t("fertCropOptional")}</strong></div>
            <input value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="wheat / rice" />
          </label>

          <button className="btn" type="button" disabled={loading || !profileId} onClick={fetchGuidance}>
            {loading ? "..." : t("fertFetch")}
          </button>
        </div>
      </div>

      {error ? (
        <div className="card">
          <strong>{t("fertErrorFetch")}</strong>
          <div className="muted">{String(error.message || error)}</div>
          {error.data ? (
            <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(error.data, null, 2)}</pre>
          ) : null}
        </div>
      ) : null}

      {result ? renderGuidance() : null}
    </div>
  );
}
