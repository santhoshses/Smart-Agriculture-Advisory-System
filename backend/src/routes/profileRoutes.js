const express = require("express");
const FarmerProfile = require("../models/FarmerProfile");

const router = express.Router();

// Create profile
router.post("/", async (req, res, next) => {
  try {
    const created = await FarmerProfile.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// List profiles
router.get("/", async (req, res, next) => {
  try {
    const items = await FarmerProfile.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// Get profile by id
router.get("/:id", async (req, res, next) => {
  try {
    const item = await FarmerProfile.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// Update profile by id
router.put("/:id", async (req, res, next) => {
  try {
    const updated = await FarmerProfile.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

