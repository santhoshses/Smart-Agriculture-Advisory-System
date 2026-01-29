import { useI18n } from "../i18n/I18nContext";
import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { NavLink } from "react-router-dom";

export default function FertilizerGuidancePage() {
  const { t } = useI18n();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [locationsError, setLocationsError] = useState(null);
  const [overrideLocationId, setOverrideLocationId] = useState("");

  const [crop, setCrop] = useState("wheat");
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

  const fetchGuidance = async () => {
    if (!profile?._id) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const qs = new URLSearchParams();
      if (crop) qs.set("crop", crop);
      if (overrideLocationId) qs.set("locationId", overrideLocationId);
      const data = await apiRequest(`/recommendations/fertilizer?${qs.toString()}`);
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
    return x?.name?.en || x?.code || "-";
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

      {profileError ? (
        <div className="card">
          <strong>{t("fertErrorProfiles")}</strong>
          <div className="muted">{String(profileError.message || profileError)}</div>
        </div>
      ) : null}

      {!loadingProfile && !profile ? (
        <div className="card">
          <div className="muted">{t("fertNoProfiles")}</div>
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
              {t("fertSelectProfile")}: {profile?.name || profile?.locationId?.name?.en || "-"}
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

          <label>
            <div><strong>{t("fertCropOptional")}</strong></div>
            <input value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="wheat / rice" />
          </label>

          <button className="btn" type="button" disabled={loading || !profile?._id} onClick={fetchGuidance}>
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
