import { useI18n } from "../i18n/I18nContext";
import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { NavLink } from "react-router-dom";

function WxIcon({ rainProb }) {
  const p = Number(rainProb);
  const isRain = Number.isFinite(p) && p >= 60;
  const isCloud = Number.isFinite(p) && p >= 25 && p < 60;

  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  };
  const s = { stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

  if (isRain) {
    return (
      <svg {...common}>
        <path {...s} d="M6 15a4 4 0 1 1 2-7.5A5 5 0 1 1 18 15H6Z" />
        <path {...s} d="M8 19l-1 2" />
        <path {...s} d="M12 19l-1 2" />
        <path {...s} d="M16 19l-1 2" />
      </svg>
    );
  }

  if (isCloud) {
    return (
      <svg {...common}>
        <path {...s} d="M6 15a4 4 0 1 1 2-7.5A5 5 0 1 1 18 15H6Z" />
      </svg>
    );
  }

  // Sun
  return (
    <svg {...common}>
      <circle {...s} cx="12" cy="12" r="4" />
      <path {...s} d="M12 2v2" />
      <path {...s} d="M12 20v2" />
      <path {...s} d="M4 12H2" />
      <path {...s} d="M22 12h-2" />
      <path {...s} d="M5 5l1.5 1.5" />
      <path {...s} d="M19 19l-1.5-1.5" />
      <path {...s} d="M19 5l-1.5 1.5" />
      <path {...s} d="M5 19l1.5-1.5" />
    </svg>
  );
}

export default function WeatherPage() {
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

  const fetchWeather = async () => {
    if (!profile?._id) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const qs = new URLSearchParams();
      if (overrideLocationId) qs.set("locationId", overrideLocationId);
      const data = await apiRequest(`/weather/forecast/by-profile?${qs.toString()}`);
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

  return (
    <div>
      <h1>{t("pageWeatherTitle")}</h1>
      <p>{t("pageWeatherBody")}</p>

      {profileError ? (
        <div className="card">
          <strong>{t("weatherErrorProfiles")}</strong>
          <div className="muted">{String(profileError.message || profileError)}</div>
        </div>
      ) : null}

      {!loadingProfile && !profile ? (
        <div className="card">
          <div className="muted">{t("weatherNoProfiles")}</div>
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
              {t("weatherSelectProfile")}: {profile?.name || profile?.locationId?.name?.en || "-"}
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

          <button className="btn" type="button" onClick={fetchWeather} disabled={loading || !profile?._id}>
            {loading ? "..." : t("weatherFetch")}
          </button>
        </div>
      </div>

      {error ? (
        <div className="card">
          <strong>{t("weatherError")}</strong>
          <div className="muted">{String(error.message || error)}</div>
          {error.data ? (
            <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(error.data, null, 2)}</pre>
          ) : null}
        </div>
      ) : null}

      {result ? (
        <>
          {result?.used?.locationName ? (
            <div className="card">
              <h2 className="sectionTitle">{t("weatherUsed")}</h2>
              <div className="chips">
                <span className="chip">{t("weatherDistrict")}: {result.used.locationName}</span>
                <span className="chip">Lat: {result.used.lat ?? "-"}</span>
                <span className="chip">Lon: {result.used.lon ?? "-"}</span>
              </div>
            </div>
          ) : null}

          <div className="card">
            <h2 className="sectionTitle">{t("weatherAlerts")}</h2>
            {Array.isArray(result.alerts) && result.alerts.length > 0 ? (
              <div className="chips">
                {result.alerts.map((a, idx) => (
                  <span key={`${a.date}-${a.type}-${idx}`} className={`chip ${a.severity === "high" ? "chipBad" : "chipWarn"}`}>
                    {a.date}: {a.message}
                  </span>
                ))}
              </div>
            ) : (
              <div className="muted">{t("weatherNoAlerts")}</div>
            )}
          </div>

          <div className="card">
            <h2 className="sectionTitle">{t("weatherCardsTitle")}</h2>
            <div className="forecastGrid">
              {(result.forecast?.days || []).map((d) => (
                <div key={d.date} className="forecastCard">
                  <div className="forecastTop">
                    <div>
                      <div className="forecastDate">{d.date}</div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        {t("weatherCardTemp")}: {d.tempMinC ?? "-"}° / {d.tempMaxC ?? "-"}°
                      </div>
                    </div>
                    <div className="wxIcon" aria-hidden>
                      <WxIcon rainProb={d.rainProbabilityMax} />
                    </div>
                  </div>

                  <div className="forecastRow">
                    <span>{t("weatherCardRain")}</span>
                    <strong>{d.rainProbabilityMax ?? "-"}%</strong>
                  </div>
                  <div className="forecastRow">
                    <span>{t("weatherCardRainMm")}</span>
                    <strong>{d.rainSumMm ?? "-"}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <details>
              <summary>{t("weatherForecast")}</summary>
              <div style={{ overflowX: "auto", marginTop: 10 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th align="left">{t("weatherTableDate")}</th>
                      <th align="left">{t("weatherTableMin")}</th>
                      <th align="left">{t("weatherTableMax")}</th>
                      <th align="left">{t("weatherTableRainProb")}</th>
                      <th align="left">{t("weatherTableRainMm")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(result.forecast?.days || []).map((d) => (
                      <tr key={d.date}>
                        <td>{d.date}</td>
                        <td>{d.tempMinC ?? "-"}</td>
                        <td>{d.tempMaxC ?? "-"}</td>
                        <td>{d.rainProbabilityMax ?? "-"}</td>
                        <td>{d.rainSumMm ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </div>

          <div className="card">
            <details>
              <summary>{t("commonRawJson")}</summary>
              <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(result, null, 2)}</pre>
            </details>
          </div>
        </>
      ) : null}
    </div>
  );
}
