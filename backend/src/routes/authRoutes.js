const express = require("express");
const crypto = require("crypto");

const FarmerAccount = require("../models/FarmerAccount");
const FarmerSession = require("../models/FarmerSession");

const router = express.Router();

// List demo farmers for login dropdown
router.get("/farmers/demo", async (req, res, next) => {
  try {
    const farmers = await FarmerAccount.find().select({ name: 1 }).sort({ name: 1 });
    return res.json(
      farmers.map((f) => ({
        farmerId: f._id,
        name: f.name,
      }))
    );
  } catch (err) {
    next(err);
  }
});

// Demo login: accepts { name } and returns a session token
router.post("/login", async (req, res, next) => {
  try {
    const name = String(req.body?.name || "").trim();
    if (!name) return res.status(400).json({ error: "name is required" });

    const farmer = await FarmerAccount.findOne({ name });
    if (!farmer) return res.status(404).json({ error: "Farmer not found" });
    if (!farmer.profileId) return res.status(400).json({ error: "Farmer has no profile" });

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await FarmerSession.create({ token, farmerId: farmer._id, expiresAt });

    return res.json({ token, farmerId: farmer._id, profileId: farmer.profileId, expiresAt });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

