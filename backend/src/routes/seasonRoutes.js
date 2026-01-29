const express = require("express");
const Season = require("../models/Season");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const items = await Season.find({ active: true }).sort({ "name.en": 1 });
    return res.json(items);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

