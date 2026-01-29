const express = require("express");
const FarmerProfile = require("../models/FarmerProfile");
const Location = require("../models/Location");
const Season = require("../models/Season");
const SoilType = require("../models/SoilType");
const Crop = require("../models/Crop");
const { pickObjectId, pickString, isValidObjectId } = require("../utils/validation");

const router = express.Router();

// Create profile
router.post("/", async (req, res, next) => {
  try {
    const errors = [];
    const name = pickString(req.body, "name").value;

    const loc = pickObjectId(req.body, "locationId", { required: true });
    if (loc.error) errors.push(loc.error);

    const soilTypeId = pickObjectId(req.body, "soilTypeId", { required: false });
    const seasonId = pickObjectId(req.body, "seasonId", { required: false });
    const previousCropId = pickObjectId(req.body, "previousCropId", { required: false });
    for (const x of [soilTypeId, seasonId, previousCropId]) {
      if (x.error) errors.push(x.error);
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation error", details: errors });
    }

    const location = await Location.findById(loc.value);
    if (!location) {
      return res.status(400).json({ error: "Validation error", details: ["locationId is invalid"] });
    }

    if (soilTypeId.value) {
      const st = await SoilType.findById(soilTypeId.value);
      if (!st) return res.status(400).json({ error: "Validation error", details: ["soilTypeId is invalid"] });
    }
    if (seasonId.value) {
      const s = await Season.findById(seasonId.value);
      if (!s) return res.status(400).json({ error: "Validation error", details: ["seasonId is invalid"] });
    }
    if (previousCropId.value) {
      const c = await Crop.findById(previousCropId.value);
      if (!c) return res.status(400).json({ error: "Validation error", details: ["previousCropId is invalid"] });
    }

    const created = await FarmerProfile.create({
      ...(name !== undefined ? { name } : {}),
      locationId: loc.value,
      ...(soilTypeId.value ? { soilTypeId: soilTypeId.value } : {}),
      ...(seasonId.value ? { seasonId: seasonId.value } : {}),
      ...(previousCropId.value ? { previousCropId: previousCropId.value } : {}),
    });

    const populated = await FarmerProfile.findById(created._id)
      .populate("locationId")
      .populate("seasonId")
      .populate("soilTypeId")
      .populate("previousCropId");
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

// List profiles
router.get("/", async (req, res, next) => {
  try {
    const items = await FarmerProfile.find()
      .populate("locationId")
      .populate("seasonId")
      .populate("soilTypeId")
      .populate("previousCropId")
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// Get profile by id
router.get("/:id", async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Validation error", details: ["id must be a valid ObjectId"] });
    }
    const item = await FarmerProfile.findById(req.params.id)
      .populate("locationId")
      .populate("seasonId")
      .populate("soilTypeId")
      .populate("previousCropId");
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// Update profile by id
router.put("/:id", async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Validation error", details: ["id must be a valid ObjectId"] });
    }

    const errors = [];
    const update = {};

    const name = pickString(req.body, "name");
    const loc = pickObjectId(req.body, "locationId", { required: false });

    const soilTypeId = pickObjectId(req.body, "soilTypeId", { required: false });
    const seasonId = pickObjectId(req.body, "seasonId", { required: false });
    const previousCropId = pickObjectId(req.body, "previousCropId", { required: false });

    if (name.error) errors.push(name.error);
    if (loc.error) errors.push(loc.error);

    for (const x of [soilTypeId, seasonId, previousCropId]) {
      if (x.error) errors.push(x.error);
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation error", details: errors });
    }

    if (name.value !== undefined) update.name = name.value;

    if (soilTypeId.value !== undefined) {
      if (soilTypeId.value === null) {
        update.soilTypeId = undefined;
      } else {
        const st = await SoilType.findById(soilTypeId.value);
        if (!st) {
          return res.status(400).json({ error: "Validation error", details: ["soilTypeId is invalid"] });
        }
        update.soilTypeId = soilTypeId.value;
      }
    }

    if (seasonId.value !== undefined) {
      if (seasonId.value === null) {
        update.seasonId = undefined;
      } else {
        const s = await Season.findById(seasonId.value);
        if (!s) {
          return res.status(400).json({ error: "Validation error", details: ["seasonId is invalid"] });
        }
        update.seasonId = seasonId.value;
      }
    }

    if (previousCropId.value !== undefined) {
      if (previousCropId.value === null) {
        update.previousCropId = undefined;
      } else {
        const c = await Crop.findById(previousCropId.value);
        if (!c) {
          return res.status(400).json({ error: "Validation error", details: ["previousCropId is invalid"] });
        }
        update.previousCropId = previousCropId.value;
      }
    }

    if (loc.value !== undefined) {
      const location = await Location.findById(loc.value);
      if (!location) {
        return res.status(400).json({ error: "Validation error", details: ["locationId is invalid"] });
      }
      update.locationId = loc.value;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "Validation error", details: ["No valid fields provided"] });
    }

    const updated = await FarmerProfile.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate("locationId")
      .populate("seasonId")
      .populate("soilTypeId")
      .populate("previousCropId");

    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
