import { useI18n } from "../i18n/I18nContext";
import { useState } from "react";
import { apiRequest } from "../api/client";

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

  const [lat, setLat] = useState("30.9010");
  const [lon, setLon] = useState("75.8573");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const qs = new URLSearchParams({ lat, lon });
      const data = await apiRequest(`/weather/forecast?${qs.toString()}`);
      setResult(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>{t("pageWeatherTitle")}</h1>
      <p>{t("pageWeatherBody")}</p>

      <div className="card">
        <div style={{ display: "grid", gap: 10 }}>
          <label>
            <div><strong>{t("weatherLat")}</strong></div>
            <input value={lat} onChange={(e) => setLat(e.target.value)} />
          </label>
          <label>
            <div><strong>{t("weatherLon")}</strong></div>
            <input value={lon} onChange={(e) => setLon(e.target.value)} />
          </label>
          <button className="btn" type="button" onClick={fetchWeather} disabled={loading}>
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
                    <span>mm</span>
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
