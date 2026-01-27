const express = require("express");
const multer = require("multer");

const router = express.Router();

// Memory storage is enough for forwarding to ML service (stub)
const upload = multer({ storage: multer.memoryStorage() });

const ML_BASE_URL = process.env.ML_BASE_URL || "http://127.0.0.1:8001";
const { getRemedy } = require("../services/diseaseRemedyService");

router.post("/predict", upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "image is required" });

    const form = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    form.append("image", blob, req.file.originalname || "image.jpg");

    const response = await fetch(`${ML_BASE_URL}/predict-disease`, {
      method: "POST",
      body: form,
    });

    const text = await response.text();
    if (!response.ok) {
      return res.status(502).json({ error: "ML service error", details: text });
    }

    // Enrich ML response with treatment recommendations (Review-01 requirement)
    // If parsing fails, fall back to passthrough.
    try {
      const parsed = text ? JSON.parse(text) : {};
      const remedy = getRemedy(parsed?.remedyKey);
      return res.json({
        ...parsed,
        recommendation: remedy,
      });
    } catch {
      return res.type("application/json").send(text);
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
