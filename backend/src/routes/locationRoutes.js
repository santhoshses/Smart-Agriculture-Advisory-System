const express = require("express");
const Location = require("../models/Location");

const router = express.Router();

// List active Punjab locations (districts) for dropdowns
router.get("/", async (req, res, next) => {
  try {
    const items = await Location.find({ active: true }).sort({ "name.en": 1 });
    return res.json(items);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

