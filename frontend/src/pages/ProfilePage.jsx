import { useI18n } from "../i18n/I18nContext";
import { apiRequest } from "../api/client";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

export default function ProfilePage() {
  const { t, language } = useI18n();

  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [locationsError, setLocationsError] = useState(null);

  const [seasons, setSeasons] = useState([]);
  const [soilTypes, setSoilTypes] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loadingMasters, setLoadingMasters] = useState(true);
  const [mastersError, setMastersError] = useState(null);

  const [form, setForm] = useState({
    name: "",
    locationId: "",
    soilTypeId: "",
    previousCropId: "",
    seasonId: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoadingLocations(true);
    setLocationsError(null);
    apiRequest("/locations")
      .then((items) => {
        if (!alive) return;
        const list = Array.isArray(items) ? items : [];
        setLocations(list);
        // Default select first location to reduce empty-state friction.
        if (!form.locationId && list.length > 0) {
          setForm((prev) => ({ ...prev, locationId: list[0]._id }));
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load current profile (single-profile-per-farmer)
  useEffect(() => {
    let alive = true;
    apiRequest("/me/profile")
      .then((p) => {
        if (!alive) return;
        setSaved(p);
        setForm({
          name: p?.name || "",
          locationId: p?.locationId?._id || "",
          soilTypeId: p?.soilTypeId?._id || "",
          previousCropId: p?.previousCropId?._id || "",
          seasonId: p?.seasonId?._id || "",
        });
      })
      .catch((e) => {
        if (!alive) return;
        setError(e);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setLoadingMasters(true);
    setMastersError(null);
    Promise.all([
      apiRequest("/seasons"),
      apiRequest("/soil-types"),
      apiRequest("/crops"),
    ])
      .then(([s, st, c]) => {
        if (!alive) return;
        setSeasons(Array.isArray(s) ? s : []);
        setSoilTypes(Array.isArray(st) ? st : []);
        setCrops(Array.isArray(c) ? c : []);
      })
      .catch((e) => {
        if (!alive) return;
        setMastersError(e);
      })
      .finally(() => {
        if (!alive) return;
        setLoadingMasters(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        name: form.name || undefined,
        locationId: form.locationId,
        soilTypeId: form.soilTypeId || undefined,
        previousCropId: form.previousCropId || undefined,
        seasonId: form.seasonId || undefined,
      };
      const result = await apiRequest("/me/profile", { method: "PUT", body: payload });
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

      {locationsError ? (
        <div className="card">
          <strong>{t("profileLocationLoadError")}</strong>
          <div className="muted">{String(locationsError.message || locationsError)}</div>
        </div>
      ) : null}

      {mastersError ? (
        <div className="card">
          <strong>{t("profileMastersLoadError")}</strong>
          <div className="muted">{String(mastersError.message || mastersError)}</div>
        </div>
      ) : null}

      <form className="card" onSubmit={onSubmit}>
        <div style={{ display: "grid", gap: 10 }}>
          <label>
            <div><strong>{t("profileName")}</strong></div>
            <input name="name" value={form.name} onChange={onChange} />
          </label>

          <label>
            <div><strong>{t("profileLocation")}</strong></div>
            <select
              name="locationId"
              value={form.locationId}
              onChange={onChange}
              disabled={loadingLocations || locations.length === 0}
              required
            >
              {locations.map((l) => (
                <option key={l._id} value={l._id}>
                  {(l?.name && (language === "pa" ? l.name.pa : l.name.en)) || l?.name?.en || l.code}
                </option>
              ))}
            </select>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
              {t("profileLocationHelp")}
            </div>
          </label>

          <label>
            <div><strong>{t("profileSoilType")}</strong></div>
            <select
              name="soilTypeId"
              value={form.soilTypeId}
              onChange={onChange}
              disabled={loadingMasters}
            >
              <option value="">{t("commonOptionalNone")}</option>
              {soilTypes.map((x) => (
                <option key={x._id} value={x._id}>
                  {(x?.name && (language === "pa" ? x.name.pa : x.name.en)) || x?.name?.en || x.code}
                </option>
              ))}
            </select>
          </label>

          <label>
            <div><strong>{t("profilePreviousCrop")}</strong></div>
            <select
              name="previousCropId"
              value={form.previousCropId}
              onChange={onChange}
              disabled={loadingMasters}
            >
              <option value="">{t("commonOptionalNone")}</option>
              {crops.map((x) => (
                <option key={x._id} value={x._id}>
                  {(x?.name && (language === "pa" ? x.name.pa : x.name.en)) || x?.name?.en || x.code}
                </option>
              ))}
            </select>
          </label>

          <label>
            <div><strong>{t("profileSeason")}</strong></div>
            <select
              name="seasonId"
              value={form.seasonId}
              onChange={onChange}
              disabled={loadingMasters}
            >
              <option value="">{t("commonOptionalNone")}</option>
              {seasons.map((x) => (
                <option key={x._id} value={x._id}>
                  {(x?.name && (language === "pa" ? x.name.pa : x.name.en)) || x?.name?.en || x.code}
                </option>
              ))}
            </select>
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
              <p className="kvValue">{saved?.locationId?.name?.[language] || saved?.locationId?.name?.en || "-"}</p>
            </div>
            <div className="kv">
              <p className="kvLabel">{t("profileSeason")}</p>
              <p className="kvValue">{saved?.seasonId?.name?.[language] || saved?.seasonId?.name?.en || saved?.seasonText || "-"}</p>
            </div>
            <div className="kv">
              <p className="kvLabel">{t("profilePreviousCrop")}</p>
              <p className="kvValue">{saved?.previousCropId?.name?.[language] || saved?.previousCropId?.name?.en || saved?.previousCropText || "-"}</p>
            </div>
            <div className="kv">
              <p className="kvLabel">{t("profileSoilType")}</p>
              <p className="kvValue">{saved?.soilTypeId?.name?.[language] || saved?.soilTypeId?.name?.en || saved?.soilTypeText || "-"}</p>
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
