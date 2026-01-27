/**
 * Fertilizer guidance (v1)
 *
 * Goals:
 * - Simple + explainable outputs for review
 * - No brand names; only guidance + safety notes
 * - Uses soil NPK + pH and optional crop
 */

function classifyLevel(value, low, high) {
  if (!Number.isFinite(value)) return "unknown";
  if (value < low) return "low";
  if (value > high) return "high";
  return "normal";
}

function normalizeCrop(crop) {
  if (!crop) return null;
  const c = String(crop).trim().toLowerCase();
  if (c.includes("wheat")) return "wheat";
  if (c.includes("rice")) return "rice";
  return null;
}

function getBaseSchedule(normCrop) {
  // Very simple demo-friendly schedule (not a substitute for official recommendations)
  if (normCrop === "wheat") {
    return [
      "Basal dose: apply at sowing (as per soil test).",
      "Top dressing: split nitrogen into 1–2 doses during early growth stages.",
      "Avoid applying before heavy rain; irrigate lightly if needed.",
    ];
  }

  if (normCrop === "rice") {
    return [
      "Basal dose: apply at transplanting/sowing (as per soil test).",
      "Split nitrogen: apply in 2–3 small doses during tillering and panicle initiation.",
      "Avoid overuse; monitor leaf color and growth.",
    ];
  }

  return [
    "Basal dose: apply at the beginning of the crop cycle (as per soil test).",
    "Split nitrogen into 2 doses if possible.",
    "Avoid applying before heavy rain; do not exceed safe limits.",
  ];
}

function getSafetyNotes(ph) {
  const notes = [
    "Do not over-apply fertilizers; excess use increases cost and harms soil.",
    "Prefer soil-test based decisions and local expert guidance for final dosing.",
    "Store fertilizers safely and keep away from children.",
  ];

  if (Number.isFinite(ph) && (ph < 5.5 || ph > 8.5)) {
    notes.unshift(
      "Soil pH is outside a typical range; consider pH correction guidance from local agriculture office."
    );
  }

  return notes;
}

function generateFertilizerGuidance({ soil, crop }) {
  const n = Number(soil?.n);
  const p = Number(soil?.p);
  const k = Number(soil?.k);
  const ph = Number(soil?.ph);

  const hasValidSoil =
    Number.isFinite(n) && Number.isFinite(p) && Number.isFinite(k) && Number.isFinite(ph);

  if (!hasValidSoil) {
    return {
      missingInputs: ["soil"],
      guidance: null,
      note: "Soil parameters (NPK and pH) are required for fertilizer guidance.",
    };
  }

  // Very simple NPK thresholds for demo categorization
  const nLevel = classifyLevel(n, 25, 60);
  const pLevel = classifyLevel(p, 15, 40);
  const kLevel = classifyLevel(k, 15, 40);

  const normCrop = normalizeCrop(crop);

  const ratioHints = [];
  if (nLevel === "low") ratioHints.push("Increase Nitrogen focus (N seems low)." );
  if (pLevel === "low") ratioHints.push("Increase Phosphorus support (P seems low)." );
  if (kLevel === "low") ratioHints.push("Increase Potassium support (K seems low)." );
  if (nLevel === "high") ratioHints.push("Avoid excess Nitrogen (N seems high)." );
  if (pLevel === "high") ratioHints.push("Avoid excess Phosphorus (P seems high)." );
  if (kLevel === "high") ratioHints.push("Avoid excess Potassium (K seems high)." );

  if (ratioHints.length === 0) {
    ratioHints.push("Soil NPK levels look balanced; follow a moderate, soil-test-based plan." );
  }

  const schedule = getBaseSchedule(normCrop);
  const safetyNotes = getSafetyNotes(ph);

  return {
    missingInputs: [],
    guidance: {
      crop: normCrop ? normCrop : null,
      soilSummary: {
        n,
        p,
        k,
        ph,
        levels: { n: nLevel, p: pLevel, k: kLevel },
      },
      npkGuidance: ratioHints,
      schedule,
      safetyNotes,
    },
  };
}

module.exports = { generateFertilizerGuidance };

