import { useI18n } from "../i18n/I18nContext";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";
import { NavLink } from "react-router-dom";

export default function SoilInputPage() {
  const { t } = useI18n();

  const [profiles, setProfiles] = useState([]);
  const [profilesError, setProfilesError] = useState(null);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  const [profileId, setProfileId] = useState("");
  const [form, setForm] = useState({ n: "", p: "", k: "", ph: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);
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

  const canSubmit = useMemo(() => {
    return Boolean(profileId) && form.n !== "" && form.p !== "" && form.k !== "" && form.ph !== "";
  }, [profileId, form]);

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
        profileId,
        n: Number(form.n),
        p: Number(form.p),
        k: Number(form.k),
        ph: Number(form.ph),
      };
      const result = await apiRequest("/soil-tests", { method: "POST", body: payload });
      setSaved(result);
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1>{t("pageSoilTitle")}</h1>
      <p>{t("pageSoilBody")}</p>

      {profilesError ? (
        <div className="card">
          <strong>{t("soilErrorLoadProfiles")}</strong>
          <div className="muted">{String(profilesError.message || profilesError)}</div>
        </div>
      ) : null}

      {!loadingProfiles && profiles.length === 0 ? (
        <div className="card">
          <div className="muted">{t("soilNoProfiles")}</div>
        </div>
      ) : null}

      <form className="card" onSubmit={onSubmit}>
        <div style={{ display: "grid", gap: 10 }}>
          <label>
            <div><strong>{t("soilSelectProfile")}</strong></div>
            <select value={profileId} onChange={(e) => setProfileId(e.target.value)} disabled={loadingProfiles}>
              {profiles.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.location} ({p._id})
                </option>
              ))}
            </select>
          </label>

          <label>
            <div><strong>{t("soilN")}</strong></div>
            <input name="n" type="number" min="0" value={form.n} onChange={onChange} />
          </label>

          <label>
            <div><strong>{t("soilP")}</strong></div>
            <input name="p" type="number" min="0" value={form.p} onChange={onChange} />
          </label>

          <label>
            <div><strong>{t("soilK")}</strong></div>
            <input name="k" type="number" min="0" value={form.k} onChange={onChange} />
          </label>

          <label>
            <div><strong>{t("soilPH")}</strong></div>
            <input name="ph" type="number" min="0" max="14" step="0.1" value={form.ph} onChange={onChange} />
          </label>

          <button className="btn" type="submit" disabled={saving || !canSubmit}>
            {saving ? "..." : t("soilSave")}
          </button>
        </div>
      </form>

      {error ? (
        <div className="card">
          <strong>{t("soilErrorSave")}</strong>
          <div className="muted">{String(error.message || error)}</div>
        </div>
      ) : null}

      {saved ? (
        <div className="card">
          <h2 className="sectionTitle">{t("soilSaved")}</h2>

          <div className="resultGrid">
            <div className="kv">
              <p className="kvLabel">{t("soilN")}</p>
              <p className="kvValue">{Number.isFinite(saved.n) ? saved.n : "-"}</p>
            </div>
            <div className="kv">
              <p className="kvLabel">{t("soilP")}</p>
              <p className="kvValue">{Number.isFinite(saved.p) ? saved.p : "-"}</p>
            </div>
            <div className="kv">
              <p className="kvLabel">{t("soilK")}</p>
              <p className="kvValue">{Number.isFinite(saved.k) ? saved.k : "-"}</p>
            </div>
            <div className="kv">
              <p className="kvLabel">{t("soilPH")}</p>
              <p className="kvValue">{Number.isFinite(saved.ph) ? saved.ph : "-"}</p>
            </div>
          </div>

          <div className="ctaRow">
            <NavLink className="ctaLink" to="/crop">
              Next: {t("navCrop")}
            </NavLink>
            <NavLink className="ctaLink" to="/fertilizer">
              Next: {t("navFertilizer")}
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
