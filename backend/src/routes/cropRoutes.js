const express = require("express");
const Crop = require("../models/Crop");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const items = await Crop.find({ active: true }).sort({ "name.en": 1 });
    return res.json(items);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

