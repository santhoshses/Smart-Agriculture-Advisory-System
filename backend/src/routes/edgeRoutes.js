const express = require("express");

const router = express.Router();

const ML_BASE_URL = process.env.ML_BASE_URL || "http://127.0.0.1:8001";

async function checkMlHealth({ timeoutMs = 1500 } = {}) {
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${ML_BASE_URL}/health`, {
      method: "GET",
      signal: controller.signal,
    });
    const latencyMs = Date.now() - started;
    const text = await res.text();
    return {
      reachable: res.ok,
      baseUrl: ML_BASE_URL,
      latencyMs,
      status: res.status,
      body: text,
    };
  } catch (e) {
    const latencyMs = Date.now() - started;
    return {
      reachable: false,
      baseUrl: ML_BASE_URL,
      latencyMs,
      error: String(e?.name || e) === "AbortError" ? "timeout" : String(e?.message || e),
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Edge status endpoint — Review-01 support
 *
 * Purpose:
 * - Provide a demo-friendly, auditable statement of what can run at the edge.
 * - Report whether ML service is reachable (local edge inference service).
 */
router.get("/status", async (req, res) => {
  const ml = await checkMlHealth();

  return res.json({
    timestamp: new Date().toISOString(),
    edge: {
      intent: "Edge computing readiness (Review-01)",
      whatRunsAtEdge: [
        "Backend advisory rules (crop/fertilizer) can run locally on a small PC/Raspberry Pi.",
        "Disease inference can run locally if ML service is hosted on the same edge device.",
      ],
      whatStillNeedsInternet: [
        "Weather forecast currently uses Open-Meteo API (internet required).",
      ],
    },
    services: {
      backend: { mode: "local", url: "http://localhost:5000" },
      mlService: ml,
      weather: { provider: "open-meteo", internetRequired: true },
    },
  });
});

module.exports = router;

