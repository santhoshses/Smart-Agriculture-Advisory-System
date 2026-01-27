import { useI18n } from "../i18n/I18nContext";
import { apiRequest } from "../api/client";
import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function ProfilePage() {
  const { t } = useI18n();

  const [form, setForm] = useState({
    name: "",
    location: "",
    soilType: "",
    previousCrop: "",
    season: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaved(null);
    setSaving(true);
    try {
      const payload = {
        name: form.name || undefined,
        location: form.location,
        soilType: form.soilType || undefined,
        previousCrop: form.previousCrop || undefined,
        season: form.season || undefined,
      };
      const result = await apiRequest("/profiles", { method: "POST", body: payload });
      setSaved(result);
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1>{t("pageProfileTitle")}</h1>
      <p>{t("pageProfileBody")}</p>

      <form className="card" onSubmit={onSubmit}>
        <div style={{ display: "grid", gap: 10 }}>
          <label>
            <div><strong>{t("profileName")}</strong></div>
            <input name="name" value={form.name} onChange={onChange} />
          </label>

          <label>
            <div><strong>{t("profileLocation")}</strong></div>
            <input name="location" value={form.location} onChange={onChange} required />
          </label>

          <label>
            <div><strong>{t("profileSoilType")}</strong></div>
            <input name="soilType" value={form.soilType} onChange={onChange} />
          </label>

          <label>
            <div><strong>{t("profilePreviousCrop")}</strong></div>
            <input name="previousCrop" value={form.previousCrop} onChange={onChange} />
          </label>

          <label>
            <div><strong>{t("profileSeason")}</strong></div>
            <input name="season" value={form.season} onChange={onChange} />
          </label>

          <button className="btn" type="submit" disabled={saving}>
            {saving ? "..." : t("profileSave")}
          </button>
        </div>
      </form>

      {error ? (
        <div className="card">
          <strong>{t("profileError")}</strong>
          <div className="muted">{String(error.message || error)}</div>
        </div>
      ) : null}

      {saved ? (
        <div className="card">
          <h2 className="sectionTitle">{t("profileSaved")}</h2>

          <div className="resultGrid">
            <div className="kv">
              <p className="kvLabel">{t("profileLocation")}</p>
              <p className="kvValue">{saved.location || "-"}</p>
            </div>
            <div className="kv">
              <p className="kvLabel">{t("profileSeason")}</p>
              <p className="kvValue">{saved.season || "-"}</p>
            </div>
            <div className="kv">
              <p className="kvLabel">{t("profilePreviousCrop")}</p>
              <p className="kvValue">{saved.previousCrop || "-"}</p>
            </div>
            <div className="kv">
              <p className="kvLabel">{t("profileSoilType")}</p>
              <p className="kvValue">{saved.soilType || "-"}</p>
            </div>
          </div>

          <div className="ctaRow">
            <NavLink className="ctaLink" to="/soil">
              Next: {t("navSoil")}
            </NavLink>
            <NavLink className="ctaLink" to="/crop">
              Next: {t("navCrop")}
            </NavLink>
          </div>

          <details style={{ marginTop: 12 }}>
            <summary>Raw JSON</summary>
            <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(saved, null, 2)}</pre>
          </details>
        </div>
      ) : null}
    </div>
  );
}
