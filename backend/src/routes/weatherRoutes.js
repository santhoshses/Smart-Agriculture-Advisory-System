const express = require("express");
const { getSevenDayForecast } = require("../services/weatherService");
const { buildAlertsFromForecastDays } = require("../services/weatherAlertService");

const router = express.Router();

/**
 * Step 5.1 scope:
 * - Accepts lat/lon query params
 * - Returns normalized 7-day forecast
 */
router.get("/forecast", async (req, res, next) => {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({ error: "lat and lon are required (numbers)" });
    }

    const data = await getSevenDayForecast({ lat, lon });
    const alerts = buildAlertsFromForecastDays(data?.forecast?.days);
    return res.json({ ...data, alerts });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
