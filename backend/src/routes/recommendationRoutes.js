const express = require("express");
const FarmerProfile = require("../models/FarmerProfile");
const SoilTest = require("../models/SoilTest");
const { recommendCrops } = require("../services/cropRecommendationService");
const { generateFertilizerGuidance } = require("../services/fertilizerGuidanceService");
const { resolveLatLon } = require("../services/locationResolverService");
const { getSevenDayForecast } = require("../services/weatherService");
const { buildAlertsFromForecastDays } = require("../services/weatherAlertService");

const router = express.Router();

/**
 * Crop recommendation (rule-based v1)
 *
 * Input: profileId (required)
 * Behavior: loads latest soil test for that profile, applies rules, returns ranked list.
 */
router.get("/crop", async (req, res, next) => {
  try {
    const { profileId } = req.query;
    if (!profileId) return res.status(400).json({ error: "profileId is required" });

    const profile = await FarmerProfile.findById(profileId);
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    const latestSoil = await SoilTest.findOne({ profileId }).sort({ createdAt: -1 });
    if (!latestSoil) {
      return res.status(400).json({
        error: "Soil test is required",
        missingInputs: ["soil"],
      });
    }

    // Weather integration (Review-01): use profile location to resolve lat/lon, then fetch forecast + alerts.
    const resolved = resolveLatLon(profile.location);
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
      season: profile.season,
      previousCrop: profile.previousCrop,
      soil: {
        n: latestSoil.n,
        p: latestSoil.p,
        k: latestSoil.k,
        ph: latestSoil.ph,
      },
      weather,
    });

    return res.json({
      profileId,
      used: {
        season: profile.season || null,
        previousCrop: profile.previousCrop || null,
        soilTestId: latestSoil._id,
        location: profile.location || null,
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
    const { profileId, crop } = req.query;
    if (!profileId) return res.status(400).json({ error: "profileId is required" });

    const profile = await FarmerProfile.findById(profileId);
    if (!profile) return res.status(404).json({ error: "Profile not found" });

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
      },
      ...output,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
