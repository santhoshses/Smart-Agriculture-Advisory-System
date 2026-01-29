import { useI18n } from "../i18n/I18nContext";
import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { NavLink } from "react-router-dom";

export default function CropRecommendationPage() {
  const { t } = useI18n();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [locationsError, setLocationsError] = useState(null);
  const [overrideLocationId, setOverrideLocationId] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoadingProfile(true);
    setProfileError(null);
    apiRequest("/me/profile")
      .then((p) => {
        if (!alive) return;
        setProfile(p);
      })
      .catch((e) => {
        if (!alive) return;
        setProfileError(e);
      })
      .finally(() => {
        if (!alive) return;
        setLoadingProfile(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setLoadingLocations(true);
    setLocationsError(null);
    apiRequest("/locations")
      .then((items) => {
        if (!alive) return;
        setLocations(Array.isArray(items) ? items : []);
      })
      .catch((e) => {
        if (!alive) return;
        setLocationsError(e);
      })
      .finally(() => {
        if (!alive) return;
        setLoadingLocations(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const fetchRecommendations = async () => {
    if (!profile?._id) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const qs = new URLSearchParams();
      if (overrideLocationId) qs.set("locationId", overrideLocationId);
      const data = await apiRequest(`/recommendations/crop?${qs.toString()}`);
      setResult(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const overrideLabel = () => {
    if (!overrideLocationId) return null;
    const x = locations.find((l) => l._id === overrideLocationId);
    const nm = x?.name?.en || x?.code || "-";
    return nm;
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

      {profileError ? (
        <div className="card">
          <strong>{t("cropErrorProfiles")}</strong>
          <div className="muted">{String(profileError.message || profileError)}</div>
        </div>
      ) : null}

      {!loadingProfile && !profile ? (
        <div className="card">
          <div className="muted">{t("cropNoProfiles")}</div>
          <div className="ctaRow" style={{ marginTop: 10 }}>
            <NavLink className="ctaLink" to="/profile">
              {t("commonGoToProfile")}
            </NavLink>
          </div>
        </div>
      ) : null}

      {locationsError ? (
        <div className="card">
          <strong>{t("profileLocationLoadError")}</strong>
          <div className="muted">{String(locationsError.message || locationsError)}</div>
        </div>
      ) : null}

      <div className="card">
        <div style={{ display: "grid", gap: 10 }}>
          <div className="chips">
            <span className="chip">
              {t("cropSelectProfile")}: {profile?.name || profile?.locationId?.name?.en || "-"}
            </span>
          </div>

          <label>
            <div><strong>{t("overrideLocationLabel")}</strong></div>
            <select
              value={overrideLocationId}
              onChange={(e) => setOverrideLocationId(e.target.value)}
              disabled={loadingLocations || locations.length === 0}
            >
              <option value="">{t("overrideLocationNone")}</option>
              {locations.map((l) => (
                <option key={l._id} value={l._id}>
                  {l?.name?.en || l.code}
                </option>
              ))}
            </select>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
              {t("overrideLocationHelp")}
            </div>
          </label>

          {overrideLocationId ? (
            <div className="chips">
              <span className="chip chipWarn">
                {t("overrideActive")}: {overrideLabel()}
              </span>
            </div>
          ) : null}

          <button className="btn" type="button" disabled={loading || !profile?._id} onClick={fetchRecommendations}>
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
