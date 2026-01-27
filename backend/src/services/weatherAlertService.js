/**
 * Simple weather alerts (v1)
 * Step 5.2 scope:
 * - Very basic, explainable rules
 * - Alerts are derived from the 7-day forecast data
 */

function buildAlertsFromForecastDays(days) {
  const alerts = [];

  for (const d of days || []) {
    const date = d.date;
    const rainProb = Number(d.rainProbabilityMax);
    const rainSum = Number(d.rainSumMm);
    const tempMax = Number(d.tempMaxC);

    // Heavy rain / very high rain probability
    if (Number.isFinite(rainSum) && rainSum >= 20) {
      alerts.push({
        date,
        type: "heavy_rain",
        severity: "high",
        message: "Heavy rain expected. Avoid spraying and ensure drainage.",
        evidence: { rainSumMm: rainSum },
      });
      continue;
    }

    if (Number.isFinite(rainProb) && rainProb >= 80) {
      alerts.push({
        date,
        type: "rain_risk",
        severity: "medium",
        message: "High chance of rain. Plan fertilizer/spraying accordingly.",
        evidence: { rainProbabilityMax: rainProb },
      });
    }

    // Heat alert
    if (Number.isFinite(tempMax) && tempMax >= 35) {
      alerts.push({
        date,
        type: "heat",
        severity: "medium",
        message: "High temperature expected. Consider irrigation and avoid midday work.",
        evidence: { tempMaxC: tempMax },
      });
    }
  }

  return alerts;
}

module.exports = { buildAlertsFromForecastDays };

