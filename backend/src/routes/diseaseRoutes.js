const express = require("express");
const multer = require("multer");

const router = express.Router();

// Memory storage is enough for forwarding to ML service (stub)
const upload = multer({ storage: multer.memoryStorage() });

const ML_BASE_URL = process.env.ML_BASE_URL || "http://127.0.0.1:8001";
const { getRemedy } = require("../services/diseaseRemedyService");

router.post("/predict", upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "NO_IMAGE_UPLOADED" });

    const form = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    form.append("image", blob, req.file.originalname || "image.jpg");

    let response;
    try {
      response = await fetch(`${ML_BASE_URL}/predict-disease`, {
        method: "POST",
        body: form,
      });
    } catch (e) {
      return res.status(502).json({
        error: "ML_UNREACHABLE",
        hint: "Start ml-service on port 8001 (uvicorn).",
      });
    }

    const text = await response.text();

    // If ML reports invalid image, pass through as 400 for a better UI message.
    if (response.status === 400) {
      try {
        const parsed = text ? JSON.parse(text) : {};
        if (parsed?.error === "INVALID_IMAGE") {
          return res.status(400).json(parsed);
        }
      } catch {
        // ignore
      }
    }

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
