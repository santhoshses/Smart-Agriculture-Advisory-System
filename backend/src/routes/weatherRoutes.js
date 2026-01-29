const express = require("express");
const FarmerProfile = require("../models/FarmerProfile");
const Location = require("../models/Location");
const { getSevenDayForecast } = require("../services/weatherService");
const { buildAlertsFromForecastDays } = require("../services/weatherAlertService");
const { requireAuth } = require("../middleware/auth");
const { isValidObjectId } = require("../utils/validation");

const router = express.Router();

/**
 * Step 5.1 scope:
 * - Accepts lat/lon query params
 * - Returns normalized 7-day forecast
 */
router.get("/forecast", async (req, res, next) => {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({ error: "lat and lon are required (numbers)" });
    }

    const data = await getSevenDayForecast({ lat, lon });
    const alerts = buildAlertsFromForecastDays(data?.forecast?.days);
    return res.json({ ...data, alerts });
  } catch (err) {
    next(err);
  }
});

/**
 * Weather forecast (profile-based)
 * Gap #2 scope:
 * - Accepts profileId
 * - Derives lat/lon from profile.locationId.center (Location master)
 * - Returns forecast + alerts with a "used" section
 */
router.get("/forecast/by-profile", requireAuth, async (req, res, next) => {
  try {
    // New UX flow: auth + default to current profile.
    const profileId = req.query.profileId || req.auth?.profileId;
    if (!profileId) return res.status(400).json({ error: "profileId is required" });

    if (req.query.profileId && String(req.query.profileId) !== String(req.auth.profileId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const profile = await FarmerProfile.findById(profileId).populate("locationId");
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    if (req.auth?.farmerId && profile.farmerId && String(profile.farmerId) !== String(req.auth.farmerId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    let effectiveLocation = profile.locationId;
    if (req.query.locationId) {
      const id = String(req.query.locationId);
      if (!isValidObjectId(id)) {
        return res.status(400).json({ error: "Validation error", details: ["locationId must be a valid ObjectId"] });
      }
      const override = await Location.findById(id);
      if (!override) {
        return res.status(400).json({ error: "Validation error", details: ["locationId is invalid"] });
      }
      effectiveLocation = override;
    }

    const center = effectiveLocation?.center;
    const lat = Number(center?.lat);
    const lon = Number(center?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({
        error: "Profile location is missing coordinates",
        details: { profileId, locationId: profile.locationId?._id || null },
      });
    }

    const data = await getSevenDayForecast({ lat, lon });
    const alerts = buildAlertsFromForecastDays(data?.forecast?.days);
    return res.json({
      ...data,
      alerts,
      used: {
        profileId,
        locationId: effectiveLocation?._id || null,
        locationName: effectiveLocation?.name?.en || null,
        lat,
        lon,
        source: req.query.locationId ? "location_override" : "location_master",
        locationOverride: Boolean(req.query.locationId),
      },
    });
  } catch (err) {
    next(err);
  }
});

// Note: /forecast remains public (lat/lon), but /forecast/by-profile is auth-protected.

module.exports = router;
