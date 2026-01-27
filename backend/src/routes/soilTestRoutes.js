const express = require("express");
const SoilTest = require("../models/SoilTest");

const router = express.Router();

// Create soil test
router.post("/", async (req, res, next) => {
  try {
    const created = await SoilTest.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// List soil tests (optionally filter by profileId)
router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.profileId) filter.profileId = req.query.profileId;

    const items = await SoilTest.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// Get soil test by id
router.get("/:id", async (req, res, next) => {
  try {
    const item = await SoilTest.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

