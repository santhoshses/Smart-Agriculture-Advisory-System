const express = require("express");
const SoilTest = require("../models/SoilTest");
const FarmerProfile = require("../models/FarmerProfile");
const { pickObjectId, pickNumber, pickDate, isValidObjectId } = require("../utils/validation");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// New UX flow: soil tests are tied to the logged-in farmer's single profile.
router.use(requireAuth);

// Create soil test
router.post("/", async (req, res, next) => {
  try {
    const errors = [];

    // Single-profile flow: default to current profile
    const profileId = pickObjectId(req.body, "profileId", { required: false });
    const effectiveProfileId = profileId.value || req.auth?.profileId;
    if (!effectiveProfileId) errors.push("profileId is required");
    if (profileId.error) errors.push(profileId.error);

    if (profileId.value && String(profileId.value) !== String(req.auth.profileId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const n = pickNumber(req.body, "n", { required: true, min: 0 });
    const p = pickNumber(req.body, "p", { required: true, min: 0 });
    const k = pickNumber(req.body, "k", { required: true, min: 0 });
    const ph = pickNumber(req.body, "ph", { required: true, min: 0, max: 14 });
    const testDate = pickDate(req.body, "testDate", { required: false });

    for (const x of [n, p, k, ph, testDate]) {
      if (x.error) errors.push(x.error);
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation error", details: errors });
    }

    const profile = await FarmerProfile.findById(effectiveProfileId);
    if (!profile) {
      return res.status(400).json({ error: "Validation error", details: ["profileId is invalid"] });
    }

    if (req.auth?.farmerId && profile.farmerId && String(profile.farmerId) !== String(req.auth.farmerId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const created = await SoilTest.create({
      profileId: effectiveProfileId,
      n: n.value,
      p: p.value,
      k: k.value,
      ph: ph.value,
      ...(testDate.value ? { testDate: testDate.value } : {}),
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// List soil tests (optionally filter by profileId)
router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    const pid = req.query.profileId ? String(req.query.profileId) : String(req.auth.profileId);
    if (!isValidObjectId(pid)) {
      return res.status(400).json({ error: "Validation error", details: ["profileId must be a valid ObjectId"] });
    }
    filter.profileId = pid;

    // Prevent reading other farmers' soil tests
    if (String(pid) !== String(req.auth.profileId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const items = await SoilTest.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// Get soil test by id
router.get("/:id", async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Validation error", details: ["id must be a valid ObjectId"] });
    }
    const item = await SoilTest.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });

    if (String(item.profileId) !== String(req.auth.profileId)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
