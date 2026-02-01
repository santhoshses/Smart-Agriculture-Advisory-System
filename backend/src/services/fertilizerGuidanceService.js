/**
 * Fertilizer guidance (v2)
 *
 * Constraints:
 * - No ML
 * - Do NOT store recommendations in DB
 * - Keep response API compatible:
 *   - return shape must still include { missingInputs, guidance }
 *   - guidance must still include: crop, soilSummary, npkGuidance, schedule, safetyNotes
 *   - additional fields are safe and help make it production-grade
 */

// Named constants (avoid magic numbers)
const N_THRESHOLDS = { low: 25, high: 60 };
const P_THRESHOLDS = { low: 15, high: 40 };
const K_THRESHOLDS = { low: 15, high: 40 };
const PH_SAFE_RANGE = { min: 5.5, max: 8.5 };

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
  if (c.includes("maize")) return "maize";
  if (c.includes("cotton")) return "cotton";
  if (c.includes("mustard")) return "mustard";
  if (c.includes("barley")) return "barley";
  if (c.includes("moong")) return "moong";
  if (c.includes("sunflower")) return "sunflower";
  return null;
}

function getBaseSchedule(normCrop) {
  // Very simple demo-friendly schedule (not a substitute for official recommendations)
  if (normCrop === "wheat") {
    return [
      "Basal dose (sowing): apply P and K + part of N as per soil test.",
      "Tillering stage: apply the next split of Nitrogen.",
      "Booting/early grain stage: final split of Nitrogen if recommended.",
      "Avoid applying just before heavy rain; irrigate lightly if needed.",
    ];
  }

  if (normCrop === "rice") {
    return [
      "Basal (transplanting/sowing): apply P and K + part of N as per soil test.",
      "Active tillering: apply the next split of Nitrogen.",
      "Panicle initiation: apply final split of Nitrogen if recommended.",
      "Avoid overuse; monitor leaf color and growth.",
    ];
  }

  if (normCrop === "maize") {
    return [
      "Basal (sowing): apply P and K + part of N as per soil test.",
      "Knee-high stage: apply the next split of Nitrogen.",
      "Tasseling/silking stage: final split of Nitrogen if recommended.",
      "Avoid applying just before heavy rain.",
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

  // pH-based safety logic (caution only; do not change fertilizer type)
  if (Number.isFinite(ph) && (ph < PH_SAFE_RANGE.min || ph > PH_SAFE_RANGE.max)) {
    notes.unshift("Soil pH is outside a typical range; nutrient availability can reduce.");
    if (ph < PH_SAFE_RANGE.min) {
      notes.unshift("pH is low (acidic). Consider lime advisory from local agriculture office.");
    }
    if (ph > PH_SAFE_RANGE.max) {
      notes.unshift("pH is high (alkaline). Consider gypsum advisory from local agriculture office.");
    }
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

  // NPK thresholds (demo-friendly)
  const nLevel = classifyLevel(n, N_THRESHOLDS.low, N_THRESHOLDS.high);
  const pLevel = classifyLevel(p, P_THRESHOLDS.low, P_THRESHOLDS.high);
  const kLevel = classifyLevel(k, K_THRESHOLDS.low, K_THRESHOLDS.high);

  const normCrop = normalizeCrop(crop);

  // Structured, crop-aware guidance (still safe and explainable)
  const nutrientsStatus = {
    n: nLevel === "normal" ? "adequate" : nLevel === "low" ? "low" : nLevel === "high" ? "excess" : "unknown",
    p: pLevel === "normal" ? "adequate" : pLevel === "low" ? "low" : pLevel === "high" ? "excess" : "unknown",
    k: kLevel === "normal" ? "adequate" : kLevel === "low" ? "low" : kLevel === "high" ? "excess" : "unknown",
  };

  const recommendedFertilizers = [];
  const recommendedReductions = [];
  const warnings = [];

  // Prevent over-fertilization
  if (nLevel === "high") {
    recommendedReductions.push("Nitrogen is high: reduce or skip extra urea doses.");
    warnings.push("Excess Nitrogen can cause lodging and increase pest/disease risk.");
  }
  if (pLevel === "high") {
    recommendedReductions.push("Phosphorus is high: avoid extra DAP/SSP this cycle.");
    warnings.push("Excess Phosphorus can increase runoff risk and is usually unnecessary.");
  }
  if (kLevel === "high") {
    recommendedReductions.push("Potassium is high: avoid extra potash unless advised.");
  }

  // Recommend additions when low
  if (nLevel === "low") recommendedFertilizers.push("Nitrogen support needed: consider urea-based split doses (as per soil test)." );
  if (pLevel === "low") recommendedFertilizers.push("Phosphorus support needed: consider DAP/SSP (as per soil test)." );
  if (kLevel === "low") recommendedFertilizers.push("Potassium support needed: consider MOP/potash (as per soil test)." );

  // Human-readable summary list (keeps existing UI behavior)
  const ratioHints = [];
  if (nLevel === "low") ratioHints.push("Increase Nitrogen focus (N seems low)." );
  if (pLevel === "low") ratioHints.push("Increase Phosphorus support (P seems low)." );
  if (kLevel === "low") ratioHints.push("Increase Potassium support (K seems low)." );
  if (nLevel === "high") ratioHints.push("Reduce Nitrogen inputs (N seems high)." );
  if (pLevel === "high") ratioHints.push("Reduce Phosphorus inputs (P seems high)." );
  if (kLevel === "high") ratioHints.push("Reduce Potassium inputs (K seems high)." );

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
      // New structured fields (safe additions)
      nutrientsStatus,
      recommendedFertilizers,
      recommendedReductions,
      warnings,
      npkGuidance: ratioHints,
      schedule,
      safetyNotes,
    },
  };
}

module.exports = { generateFertilizerGuidance };
