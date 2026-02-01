/**
 * Rule-based crop recommendation (v2)
 *
 * Constraints:
 * - No ML
 * - Recommendations are computed dynamically (not stored in DB)
 * - Keep existing API compatibility:
 *   - each recommendation item MUST keep: { crop, score, reasons, warnings }
 *   - additional fields are safe (frontend shows `score`, `reasons`, `warnings`)
 *
 * Goal:
 * - Punjab-aware, explainable, and scalable rule engine.
 */

function normalizeSeason(season) {
  if (!season) return null;
  const s = String(season).trim().toLowerCase();
  if (s.includes("rabi")) return "rabi";
  if (s.includes("kharif")) return "kharif";
  if (s.includes("zaid")) return "zaid";
  return null;
}

function normalizeCropCode(crop) {
  if (!crop) return null;
  return String(crop).trim().toLowerCase();
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function requirementToMinN(requirement) {
  // Demo-friendly mapping (Punjab soils vary widely; this is just a rule baseline)
  if (requirement === "low") return 15;
  if (requirement === "medium") return 25;
  return 35; // high
}

// Crop configuration (Punjab-relevant)
// This makes the engine extensible: add crops by adding config, not new if/else blocks.
const CROP_CONFIG = {
  wheat: {
    cropCode: "wheat",
    displayName: "Wheat",
    season: "rabi",
    idealPhRange: [6.0, 8.0],
    nitrogenRequirement: "high",
    waterDemand: "medium",
    isLegume: false,
  },
  barley: {
    cropCode: "barley",
    displayName: "Barley",
    season: "rabi",
    idealPhRange: [6.0, 8.5],
    nitrogenRequirement: "medium",
    waterDemand: "low",
    isLegume: false,
  },
  mustard: {
    cropCode: "mustard",
    displayName: "Mustard",
    season: "rabi",
    idealPhRange: [5.8, 8.2],
    nitrogenRequirement: "medium",
    waterDemand: "low",
    isLegume: false,
  },
  rice: {
    cropCode: "rice",
    displayName: "Rice",
    season: "kharif",
    idealPhRange: [5.5, 8.5],
    nitrogenRequirement: "high",
    waterDemand: "high",
    isLegume: false,
  },
  maize: {
    cropCode: "maize",
    displayName: "Maize",
    season: "kharif",
    idealPhRange: [5.8, 8.0],
    nitrogenRequirement: "medium",
    waterDemand: "medium",
    isLegume: false,
  },
  cotton: {
    cropCode: "cotton",
    displayName: "Cotton",
    season: "kharif",
    idealPhRange: [6.0, 8.5],
    nitrogenRequirement: "medium",
    waterDemand: "medium",
    isLegume: false,
  },
  moong: {
    cropCode: "moong",
    displayName: "Moong (Green gram)",
    season: "kharif", // used as diversification/short-duration option
    idealPhRange: [6.0, 8.0],
    nitrogenRequirement: "low",
    waterDemand: "low",
    isLegume: true,
  },
  sunflower: {
    cropCode: "sunflower",
    displayName: "Sunflower",
    season: "kharif", // diversification crop
    idealPhRange: [6.0, 8.5],
    nitrogenRequirement: "medium",
    waterDemand: "low",
    isLegume: false,
  },
};

function evaluateCrop({ cropConfig, normSeason, prevCropCode, soil, weather }) {
  const reasons = [];
  const warnings = [];

  const n = Number(soil?.n);
  const p = Number(soil?.p);
  const k = Number(soil?.k);
  const ph = Number(soil?.ph);

  // Base score starts mid-range and is adjusted with explainable bonuses/penalties.
  let score = 50;

  // Season match
  if (!normSeason) {
    score -= 5;
    warnings.push("Season is not set; recommendation may be less accurate.");
  } else if (normSeason === cropConfig.season) {
    score += 15;
    reasons.push(`Season match: suitable for ${cropConfig.season.toUpperCase()}.`);
  } else {
    score -= 20;
    warnings.push(`Season mismatch: usually grown in ${cropConfig.season.toUpperCase()}.`);
  }

  // Soil pH suitability
  const [phMin, phMax] = cropConfig.idealPhRange;
  if (Number.isFinite(ph)) {
    if (ph >= phMin && ph <= phMax) {
      score += 10;
      reasons.push("Soil pH is suitable for this crop.");
    } else {
      const delta = ph < phMin ? phMin - ph : ph - phMax;
      const penalty = clamp(Math.round(delta * 6), 5, 15);
      score -= penalty;
      warnings.push(`Soil pH is outside ideal range (${phMin}–${phMax}); yield may reduce.`);
    }
  }

  // Nitrogen requirement vs soil nitrogen
  const minN = requirementToMinN(cropConfig.nitrogenRequirement);
  if (Number.isFinite(n)) {
    if (n >= minN) {
      score += 6;
      reasons.push(`Soil nitrogen level supports ${cropConfig.nitrogenRequirement} N requirement.`);
    } else {
      score -= 12;
      warnings.push(`Nitrogen appears low for this crop (needs ~${minN}+).`);
    }
  }

  // Simple rotation rule
  if (prevCropCode) {
    if (prevCropCode === cropConfig.cropCode) {
      score -= 15;
      warnings.push("Rotation warning: repeating the same crop continuously is risky.");
    } else {
      score += 5;
      reasons.push("Rotation check passed (not repeating the same crop).");
    }
  }

  // Reward legumes for diversification/soil improvement
  if (cropConfig.isLegume) {
    score += 8;
    reasons.push("Legume crop: can help improve soil nitrogen over time.");
  }

  // Punjab-specific water stress logic (very important for Rice)
  // We only have alerts (not full rainfall totals) in the current request payload.
  // So we use a conservative rule: heat + no rain alerts => likely water stress.
  const hasWeather = Boolean(weather && Array.isArray(weather.alerts));
  const hasHeavyRainAlert = hasWeather && weather.alerts.some((a) => a.type === "heavy_rain");
  const hasRainRiskAlert = hasWeather && weather.alerts.some((a) => a.type === "rain_risk");
  const hasHeatAlert = hasWeather && weather.alerts.some((a) => a.type === "heat");
  const likelyLowRain = hasWeather && hasHeatAlert && !hasHeavyRainAlert && !hasRainRiskAlert;

  if (hasWeather) {
    reasons.push("Weather considered (forecast alerts).");
  } else {
    warnings.push("Weather not available; water-stress checks may be missing.");
  }

  // Water demand penalties/bonuses
  if (cropConfig.waterDemand === "high") {
    // Punjab groundwater stress warning for water-intensive crops
    score -= 5;
    warnings.push("Punjab note: water-intensive crops may increase groundwater stress.");

    if (likelyLowRain) {
      score -= 15;
      warnings.push("Weather suggests heat + low rain risk; water-intensive crop may be risky.");
      warnings.push("Consider diversification options like maize/moong if suitable.");
    }

    if (hasRainRiskAlert) {
      score += 3;
      reasons.push("Forecast indicates rain chances which may support water-demanding crops.");
    }
  }

  if (cropConfig.waterDemand === "low" && likelyLowRain) {
    score += 6;
    reasons.push("Low water-demand crop is safer under possible dry/heat conditions.");
  }

  // Heavy rain generally complicates operations for most crops
  if (hasHeavyRainAlert) {
    score -= 5;
    warnings.push("Heavy rain alert: field operations and fertilizer timing may be affected.");
  }

  // Heat increases irrigation need for most crops
  if (hasHeatAlert) {
    score -= 3;
    warnings.push("Heat alert: plan irrigation and avoid midday operations.");
  }

  // Encourage diversification beyond wheat/rice (Punjab-aware)
  const isDiversification = !["wheat", "rice"].includes(cropConfig.cropCode);
  if (isDiversification) {
    score += 4;
    reasons.push("Diversification crop option (Punjab crop diversification encouragement).");
  }

  const finalScore = clamp(Math.round(score), 0, 100);

  return {
    crop: cropConfig.displayName,
    // Keep existing field name for UI compatibility
    score: finalScore,
    // Additional fields (safe for frontend; useful for explainability)
    finalScore,
    suitabilityPercentage: finalScore,
    reasons,
    whyThisCrop: reasons,
    warnings,
    meta: {
      cropCode: cropConfig.cropCode,
      season: cropConfig.season,
      idealPhRange: cropConfig.idealPhRange,
      nitrogenRequirement: cropConfig.nitrogenRequirement,
      waterDemand: cropConfig.waterDemand,
      isLegume: cropConfig.isLegume,
    },
  };
}

function recommendCrops({ season, previousCrop, soil, weather }) {
  const normSeason = normalizeSeason(season);
  const prevCropCode = normalizeCropCode(previousCrop);

  const n = Number(soil?.n);
  const p = Number(soil?.p);
  const k = Number(soil?.k);
  const ph = Number(soil?.ph);

  const hasValidSoil = Number.isFinite(n) && Number.isFinite(p) && Number.isFinite(k) && Number.isFinite(ph);
  if (!hasValidSoil) {
    return {
      recommendations: [],
      missingInputs: ["soil"],
      note: "Soil parameters (NPK and pH) are required for crop recommendation.",
    };
  }

  const evaluated = Object.values(CROP_CONFIG).map((cfg) =>
    evaluateCrop({ cropConfig: cfg, normSeason, prevCropCode, soil: { n, p, k, ph }, weather })
  );

  evaluated.sort((a, b) => b.finalScore - a.finalScore);

  // Explainability layer: why not top crop
  const top = evaluated[0];
  const whyNotTopCrops = {};
  for (const item of evaluated.slice(1, 6)) {
    // Keep it simple: summarize the first 1–2 warnings
    const msg = (item.warnings || []).slice(0, 2).join(" ") || "Lower overall suitability score.";
    whyNotTopCrops[item.crop] = msg;
  }

  const hasWeather = Boolean(weather && Array.isArray(weather.alerts));

  return {
    recommendations: evaluated,
    missingInputs: hasWeather ? [] : ["weather"],
    whyNotTopCrops,
    topRecommendation: top ? { crop: top.crop, suitabilityPercentage: top.suitabilityPercentage } : null,
  };
}

module.exports = { recommendCrops };
