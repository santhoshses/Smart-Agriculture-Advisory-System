import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { apiRequest } from "../api/client";
import { NavLink } from "react-router-dom";

function Icon({ name }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  };

  const stroke = "currentColor";
  const s = { stroke, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

  if (name === "profile") {
    return (
      <svg {...common}>
        <path {...s} d="M20 21a8 8 0 0 0-16 0" />
        <circle {...s} cx="12" cy="8" r="4" />
      </svg>
    );
  }

  if (name === "soil") {
    return (
      <svg {...common}>
        <path {...s} d="M4 20h16" />
        <path {...s} d="M6 20c0-4 3-8 6-8s6 4 6 8" />
        <path {...s} d="M12 12V4" />
        <path {...s} d="M8 6l4-2 4 2" />
      </svg>
    );
  }

  if (name === "crop") {
    return (
      <svg {...common}>
        <path {...s} d="M12 22V12" />
        <path {...s} d="M12 12c0-5-4-8-8-8 0 4 3 8 8 8Z" />
        <path {...s} d="M12 12c0-5 4-8 8-8 0 4-3 8-8 8Z" />
      </svg>
    );
  }

  if (name === "fertilizer") {
    return (
      <svg {...common}>
        <path {...s} d="M8 3h8l-1 5H9L8 3Z" />
        <path {...s} d="M7 8h10l2 13H5L7 8Z" />
        <path {...s} d="M9 12h6" />
        <path {...s} d="M9 16h6" />
      </svg>
    );
  }

  if (name === "weather") {
    return (
      <svg {...common}>
        <path {...s} d="M6 15a4 4 0 1 1 2-7.5A5 5 0 1 1 18 15H6Z" />
        <path {...s} d="M8 19h.01" />
        <path {...s} d="M12 19h.01" />
        <path {...s} d="M16 19h.01" />
      </svg>
    );
  }

  if (name === "disease") {
    return (
      <svg {...common}>
        <path {...s} d="M20 7c-4 0-8 4-8 8 4 0 8-4 8-8Z" />
        <path {...s} d="M4 7c4 0 8 4 8 8-4 0-8-4-8-8Z" />
        <path {...s} d="M12 15v7" />
      </svg>
    );
  }

  if (name === "chat") {
    return (
      <svg {...common}>
        <path {...s} d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
        <path {...s} d="M8 9h8" />
        <path {...s} d="M8 13h6" />
      </svg>
    );
  }

  return null;
}

export default function DashboardPage() {
  const { t } = useI18n();

  const [edge, setEdge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    apiRequest("/edge/status")
      .then((data) => {
        if (!alive) return;
        setEdge(data);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const quick = useMemo(
    () => [
      { to: "/profile", icon: "profile", title: t("dashActionProfile"), desc: t("dashFlow1Body") },
      { to: "/soil", icon: "soil", title: t("dashActionSoil"), desc: t("dashFlow2Body") },
      { to: "/crop", icon: "crop", title: t("dashActionCrop"), desc: t("dashFlow3Body") },
      { to: "/weather", icon: "weather", title: t("dashActionWeather"), desc: t("dashFlow5Body") },
      { to: "/disease", icon: "disease", title: t("dashActionDisease"), desc: t("pageDiseaseBody") },
      { to: "/chat", icon: "chat", title: t("dashActionChat"), desc: t("pageChatBody") },
    ],
    [t]
  );

  return (
    <div>
      <div className="hero">
        <h1 className="heroTitle">{t("dashHeroTitle")}</h1>
        <p className="heroSub">{t("dashHeroSub")}</p>

        <div className="heroMeta">
          <span className="pill">{t("dashPillBilingual")}</span>
          <span className="pill">{t("dashPillVoice")}</span>
          <span className="pill pillGreen">{t("dashPillEdge")}</span>
        </div>

        <h2 style={{ marginTop: 16 }}>{t("dashFlowTitle")}</h2>
        <div className="flow">
          <div className="flowStep">
            <div className="flowNum">1</div>
            <div className="flowLabel">{t("dashFlow1Title")}</div>
            <p className="flowHelp">{t("dashFlow1Body")}</p>
          </div>
          <div className="flowStep">
            <div className="flowNum">2</div>
            <div className="flowLabel">{t("dashFlow2Title")}</div>
            <p className="flowHelp">{t("dashFlow2Body")}</p>
          </div>
          <div className="flowStep">
            <div className="flowNum">3</div>
            <div className="flowLabel">{t("dashFlow3Title")}</div>
            <p className="flowHelp">{t("dashFlow3Body")}</p>
          </div>
          <div className="flowStep">
            <div className="flowNum">4</div>
            <div className="flowLabel">{t("dashFlow4Title")}</div>
            <p className="flowHelp">{t("dashFlow4Body")}</p>
          </div>
          <div className="flowStep">
            <div className="flowNum">5</div>
            <div className="flowLabel">{t("dashFlow5Title")}</div>
            <p className="flowHelp">{t("dashFlow5Body")}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="sectionTitle">{t("dashQuickTitle")}</h2>
        <div className="quickActions">
          {quick.map((q) => (
            <NavLink key={q.to} to={q.to} className="actionCard">
              <div className="actionTop">
                <span className="iconBox" aria-hidden>
                  <Icon name={q.icon} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className="actionTitle">{q.title}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                    {t("dashActionGo")}
                  </div>
                </div>
              </div>
              <p className="actionDesc">{q.desc}</p>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="sectionTitle">{t("edgeStatusTitle")}</h2>
        <p className="muted">{t("edgeStatusBody")}</p>

        {loading ? <div className="muted">{t("edgeStatusLoading")}</div> : null}

        {error ? (
          <div>
            <strong>{t("edgeStatusError")}</strong>
            <div className="muted">{String(error.message || error)}</div>
          </div>
        ) : null}

        {edge ? (
          <>
            <div style={{ marginTop: 10 }}>
              {edge?.services?.mlService?.reachable ? (
                <div><strong>{t("edgeMlReachable")}</strong></div>
              ) : (
                <div><strong>{t("edgeMlUnreachable")}</strong></div>
              )}
            </div>

            <details style={{ marginTop: 10 }}>
              <summary>{t("edgeShowDetails")}</summary>
              <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(edge, null, 2)}</pre>
            </details>
          </>
        ) : null}
      </div>
    </div>
  );
}
