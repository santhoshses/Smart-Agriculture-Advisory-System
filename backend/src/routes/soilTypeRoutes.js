const express = require("express");
const SoilType = require("../models/SoilType");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const items = await SoilType.find({ active: true }).sort({ "name.en": 1 });
    return res.json(items);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

