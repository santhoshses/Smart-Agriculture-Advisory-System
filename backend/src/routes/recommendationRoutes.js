const express = require("express");
const FarmerProfile = require("../models/FarmerProfile");
const SoilTest = require("../models/SoilTest");
const Location = require("../models/Location");
const { requireAuth } = require("../middleware/auth");
const { isValidObjectId } = require("../utils/validation");
const { recommendCrops } = require("../services/cropRecommendationService");
const { generateFertilizerGuidance } = require("../services/fertilizerGuidanceService");
const { getSevenDayForecast } = require("../services/weatherService");
const { buildAlertsFromForecastDays } = require("../services/weatherAlertService");

const router = express.Router();

// New UX flow requires auth (single profile per farmer)
router.use(requireAuth);

/**
 * Crop recommendation (rule-based v1)
 *
 * Input: profileId (required)
 * Behavior: loads latest soil test for that profile, applies rules, returns ranked list.
 */
router.get("/crop", async (req, res, next) => {
  try {
    // Prefer authenticated single-profile flow.
    // If profileId is not provided, use auth context.
    const effectiveProfileId = req.query.profileId || req.auth?.profileId;
    if (!effectiveProfileId) return res.status(400).json({ error: "profileId is required" });

    // Single-profile-per-farmer: prevent cross-profile access even if profile.farmerId is not set
    if (req.query.profileId && String(req.query.profileId) !== String(req.auth.profileId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const profile = await FarmerProfile.findById(effectiveProfileId)
      .populate("locationId")
      .populate("seasonId")
      .populate("previousCropId");
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    // Enforce ownership if auth is present
    if (req.auth?.farmerId && profile.farmerId && String(profile.farmerId) !== String(req.auth.farmerId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Optional location override
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

    const seasonCode = profile?.seasonId?.code || profile?.seasonText || null;
    const previousCropCode = profile?.previousCropId?.code || profile?.previousCropText || null;

    const latestSoil = await SoilTest.findOne({ profileId: effectiveProfileId }).sort({ createdAt: -1 });
    if (!latestSoil) {
      return res.status(400).json({
        error: "Soil test is required",
        missingInputs: ["soil"],
      });
    }

    // Weather integration (Review-01): use profile master location centroid.
    const resolved = effectiveLocation?.center
      ? {
          lat: effectiveLocation.center.lat,
          lon: effectiveLocation.center.lon,
          source: req.query.locationId ? "location_override" : "location_master",
        }
      : null;
    let weather = null;
    if (resolved) {
      const forecastData = await getSevenDayForecast({ lat: resolved.lat, lon: resolved.lon });
      const alerts = buildAlertsFromForecastDays(forecastData?.forecast?.days);
      weather = {
        location: { lat: resolved.lat, lon: resolved.lon, source: resolved.source },
        cached: forecastData.cached,
        alerts,
      };
    }

    const output = recommendCrops({
      season: seasonCode,
      previousCrop: previousCropCode,
      soil: {
        n: latestSoil.n,
        p: latestSoil.p,
        k: latestSoil.k,
        ph: latestSoil.ph,
      },
      weather,
    });

    return res.json({
      profileId: effectiveProfileId,
      used: {
        season: seasonCode,
        previousCrop: previousCropCode,
        soilTestId: latestSoil._id,
        location: effectiveLocation?.name?.en || profile.locationText || null,
        locationId: effectiveLocation?._id || null,
        locationOverride: Boolean(req.query.locationId),
        weather: weather,
      },
      ...output,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Fertilizer guidance (rule-based v1)
 *
 * Input:
 * - profileId (required)
 * - crop (optional): "wheat" | "rice" (free text allowed; normalized internally)
 * Behavior:
 * - loads latest soil test for that profile
 * - returns fertilizer guidance summary + schedule + safety notes
 */
router.get("/fertilizer", async (req, res, next) => {
  try {
    const { crop } = req.query;
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

    const latestSoil = await SoilTest.findOne({ profileId }).sort({ createdAt: -1 });
    if (!latestSoil) {
      return res.status(400).json({
        error: "Soil test is required",
        missingInputs: ["soil"],
      });
    }

    const output = generateFertilizerGuidance({
      crop,
      soil: {
        n: latestSoil.n,
        p: latestSoil.p,
        k: latestSoil.k,
        ph: latestSoil.ph,
      },
    });

    return res.json({
      profileId,
      used: {
        soilTestId: latestSoil._id,
        crop: crop || null,
        location: effectiveLocation?.name?.en || profile.locationText || null,
        locationId: effectiveLocation?._id || null,
        locationOverride: Boolean(req.query.locationId),
      },
      ...output,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
