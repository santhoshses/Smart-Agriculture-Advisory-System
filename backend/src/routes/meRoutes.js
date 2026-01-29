const express = require("express");

const FarmerProfile = require("../models/FarmerProfile");
const Location = require("../models/Location");
const Season = require("../models/Season");
const SoilType = require("../models/SoilType");
const Crop = require("../models/Crop");

const { requireAuth } = require("../middleware/auth");
const { pickObjectId, pickString, isValidObjectId } = require("../utils/validation");

const router = express.Router();

// Get current farmer's profile
router.get("/me/profile", requireAuth, async (req, res, next) => {
  try {
    const profileId = String(req.auth.profileId || "");
    if (!isValidObjectId(profileId)) return res.status(404).json({ error: "Profile not found" });

    const profile = await FarmerProfile.findById(profileId)
      .populate("locationId")
      .populate("seasonId")
      .populate("soilTypeId")
      .populate("previousCropId");
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    // Enforce ownership
    if (profile.farmerId && String(profile.farmerId) !== String(req.auth.farmerId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return res.json(profile);
  } catch (err) {
    next(err);
  }
});

// Update current farmer's profile
router.put("/me/profile", requireAuth, async (req, res, next) => {
  try {
    const profileId = String(req.auth.profileId || "");
    if (!isValidObjectId(profileId)) return res.status(404).json({ error: "Profile not found" });

    const existing = await FarmerProfile.findById(profileId);
    if (!existing) return res.status(404).json({ error: "Profile not found" });
    if (existing.farmerId && String(existing.farmerId) !== String(req.auth.farmerId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const errors = [];
    const update = {};

    const name = pickString(req.body, "name");
    if (name.error) errors.push(name.error);
    if (name.value !== undefined) update.name = name.value;

    const locationId = pickObjectId(req.body, "locationId", { required: false });
    const soilTypeId = pickObjectId(req.body, "soilTypeId", { required: false });
    const seasonId = pickObjectId(req.body, "seasonId", { required: false });
    const previousCropId = pickObjectId(req.body, "previousCropId", { required: false });

    for (const x of [locationId, soilTypeId, seasonId, previousCropId]) {
      if (x.error) errors.push(x.error);
    }

    if (errors.length > 0) return res.status(400).json({ error: "Validation error", details: errors });

    if (locationId.value !== undefined) {
      if (locationId.value === null) {
        return res.status(400).json({ error: "Validation error", details: ["locationId cannot be cleared"] });
      }
      const loc = await Location.findById(locationId.value);
      if (!loc) return res.status(400).json({ error: "Validation error", details: ["locationId is invalid"] });
      update.locationId = locationId.value;
    }

    if (soilTypeId.value !== undefined) {
      if (soilTypeId.value === null) {
        update.soilTypeId = undefined;
      } else {
        const st = await SoilType.findById(soilTypeId.value);
        if (!st) return res.status(400).json({ error: "Validation error", details: ["soilTypeId is invalid"] });
        update.soilTypeId = soilTypeId.value;
      }
    }

    if (seasonId.value !== undefined) {
      if (seasonId.value === null) {
        update.seasonId = undefined;
      } else {
        const s = await Season.findById(seasonId.value);
        if (!s) return res.status(400).json({ error: "Validation error", details: ["seasonId is invalid"] });
        update.seasonId = seasonId.value;
      }
    }

    if (previousCropId.value !== undefined) {
      if (previousCropId.value === null) {
        update.previousCropId = undefined;
      } else {
        const c = await Crop.findById(previousCropId.value);
        if (!c) return res.status(400).json({ error: "Validation error", details: ["previousCropId is invalid"] });
        update.previousCropId = previousCropId.value;
      }
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "Validation error", details: ["No valid fields provided"] });
    }

    const updated = await FarmerProfile.findByIdAndUpdate(profileId, update, { new: true, runValidators: true })
      .populate("locationId")
      .populate("seasonId")
      .populate("soilTypeId")
      .populate("previousCropId");

    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

