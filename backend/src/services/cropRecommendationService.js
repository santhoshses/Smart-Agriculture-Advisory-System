/**
 * Rule-based crop recommendation (v1)
 *
 * Goals:
 * - Deterministic output
 * - Explainable reasons suitable for review/viva
 * - Limited scope: Wheat/Rice only
 */

function normalizeSeason(season) {
  if (!season) return null;
  const s = String(season).trim().toLowerCase();
  if (s.includes("rabi")) return "rabi";
  if (s.includes("kharif")) return "kharif";
  return null;
}

function recommendCrops({ season, previousCrop, soil, weather }) {
  const results = [];
  const normSeason = normalizeSeason(season);
  const prev = previousCrop ? String(previousCrop).trim().toLowerCase() : null;

  const n = Number(soil?.n);
  const p = Number(soil?.p);
  const k = Number(soil?.k);
  const ph = Number(soil?.ph);

  const hasValidSoil =
    Number.isFinite(n) && Number.isFinite(p) && Number.isFinite(k) && Number.isFinite(ph);

  // Basic guard
  if (!hasValidSoil) {
    return {
      recommendations: [],
      missingInputs: ["soil"],
      note: "Soil parameters (NPK and pH) are required for crop recommendation.",
    };
  }

  // Very simple ranges (demo-friendly; can be refined later)
  const phOk = ph >= 5.5 && ph <= 8.5;

  // Weather context (optional)
  const hasWeather = Boolean(weather && Array.isArray(weather.alerts));
  const hasHeavyRainAlert = hasWeather && weather.alerts.some((a) => a.type === "heavy_rain");
  const hasHeatAlert = hasWeather && weather.alerts.some((a) => a.type === "heat");

  // If season is provided by the user/profile, we should strongly prefer matching crops.
  // This keeps demo results intuitive (e.g., Rabi -> Wheat, Kharif -> Rice).
  const seasonMismatchPenalty = 3;

  // Wheat rules (Rabi)
  {
    const reasons = [];
    const warnings = [];
    let score = 0;

    if (!normSeason || normSeason === "rabi") {
      score += 2;
      reasons.push("Suitable for Rabi season.");
    } else {
      score -= seasonMismatchPenalty;
      warnings.push("Wheat is usually recommended in Rabi season.");
    }

    if (!prev || prev !== "wheat") {
      score += 1;
      reasons.push("Crop rotation check passed (not repeating Wheat).");
    } else {
      score -= 2;
      warnings.push("Avoid repeating Wheat continuously (rotation).");
    }

    if (phOk) {
      score += 1;
      reasons.push("Soil pH is within a workable range.");
    } else {
      score -= 1;
      warnings.push("Soil pH is outside typical range; yield may reduce.");
    }

    if (n < 20) warnings.push("Nitrogen appears low; Wheat may need nitrogen management.");

    if (hasHeavyRainAlert) {
      score -= 1;
      warnings.push("Weather alert: heavy rain risk may increase disease/lodging risk.");
      reasons.push("Weather considered (forecast alerts)." );
    }

    if (hasHeatAlert) {
      score -= 1;
      warnings.push("Weather alert: heat risk may require irrigation planning.");
      reasons.push("Weather considered (forecast alerts)." );
    }
    if (score > 0) {
      results.push({ crop: "Wheat", score, reasons, warnings });
    }
  }

  // Rice rules (Kharif)
  {
    const reasons = [];
    const warnings = [];
    let score = 0;

    if (!normSeason || normSeason === "kharif") {
      score += 2;
      reasons.push("Suitable for Kharif season.");
    } else {
      score -= seasonMismatchPenalty;
      warnings.push("Rice is usually recommended in Kharif season.");
    }

    // Simple rotation idea: avoid repeating Rice
    if (!prev || prev !== "rice") {
      score += 1;
      reasons.push("Crop rotation check passed (not repeating Rice).");
    } else {
      score -= 2;
      warnings.push("Avoid repeating Rice continuously (rotation).");
    }

    if (phOk) {
      score += 1;
      reasons.push("Soil pH is within a workable range.");
    } else {
      score -= 1;
      warnings.push("Soil pH is outside typical range; yield may reduce.");
    }

    // Rice is often nutrient intensive; very light guidance for demo
    if (n < 25) warnings.push("Nitrogen appears low; Rice may need nitrogen management.");

    if (hasHeavyRainAlert) {
      score -= 1;
      warnings.push("Weather alert: heavy rain may affect field operations and fertilizer timing.");
      reasons.push("Weather considered (forecast alerts)." );
    }

    if (hasHeatAlert) {
      score -= 1;
      warnings.push("Weather alert: heat risk may increase water requirement.");
      reasons.push("Weather considered (forecast alerts)." );
    }
    if (score > 0) {
      results.push({ crop: "Rice", score, reasons, warnings });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return {
    recommendations: results,
    missingInputs: hasWeather ? [] : ["weather"],
  };
}

module.exports = { recommendCrops };
