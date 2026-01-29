import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, setAuthToken } from "../api/client";
import { useI18n } from "../i18n/I18nContext";

export default function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedName, setSelectedName] = useState("");
  const [error, setError] = useState(null);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    apiRequest("/farmers/demo")
      .then((items) => {
        if (!alive) return;
        const list = Array.isArray(items) ? items : [];
        setFarmers(list);
        if (list.length > 0) setSelectedName(list[0].name);
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

  const onLogin = async (e) => {
    e.preventDefault();
    if (!selectedName) return;
    setLoggingIn(true);
    setError(null);
    try {
      const res = await apiRequest("/login", { method: "POST", body: { name: selectedName } });
      setAuthToken(res.token);
      navigate("/profile", { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div>
      <h1>{t("pageLoginTitle")}</h1>
      <p>{t("pageLoginBody")}</p>

      {error ? (
        <div className="card">
          <strong>{t("loginError")}</strong>
          <div className="muted">{String(error.message || error)}</div>
        </div>
      ) : null}

      <form className="card" onSubmit={onLogin}>
        <div style={{ display: "grid", gap: 10 }}>
          <label>
            <div><strong>{t("loginSelectFarmer")}</strong></div>
            <select
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              disabled={loading || farmers.length === 0}
              required
            >
              {farmers.map((f) => (
                <option key={f.farmerId} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>

          <button className="btn" type="submit" disabled={loading || loggingIn || !selectedName}>
            {loggingIn ? "..." : t("loginButton")}
          </button>
        </div>
      </form>
    </div>
  );
}

