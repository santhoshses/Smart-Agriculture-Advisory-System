/**
 * Weather service (Open-Meteo)
 * Step 5.1 scope:
 * - Fetch 7-day forecast
 * - Normalize to a simple response shape
 * - Apply simple in-memory caching
 */

const DEFAULT_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Very small in-memory cache for local demo
const cache = new Map();

function cacheKey({ lat, lon }) {
  return `${lat.toFixed(4)},${lon.toFixed(4)}`;
}

async function fetchOpenMeteoDaily({ lat, lon }) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("timezone", "auto");
  url.searchParams.set(
    "daily",
    [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "rain_sum",
    ].join(",")
  );
  url.searchParams.set("forecast_days", "7");

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Open-Meteo error: ${res.status} ${text}`);
  }
  return res.json();
}

function normalizeDailyForecast(raw) {
  const d = raw?.daily;
  if (!d?.time) return { days: [] };

  const days = d.time.map((date, idx) => ({
    date,
    tempMaxC: d.temperature_2m_max?.[idx] ?? null,
    tempMinC: d.temperature_2m_min?.[idx] ?? null,
    rainProbabilityMax: d.precipitation_probability_max?.[idx] ?? null,
    rainSumMm: d.rain_sum?.[idx] ?? null,
  }));

  return { days };
}

async function getSevenDayForecast({ lat, lon, cacheTtlMs = DEFAULT_CACHE_TTL_MS }) {
  const now = Date.now();
  const key = cacheKey({ lat, lon });
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) {
    return { ...cached.value, cached: true };
  }

  const raw = await fetchOpenMeteoDaily({ lat, lon });
  const normalized = normalizeDailyForecast(raw);

  const value = {
    location: { lat, lon },
    timezone: raw.timezone ?? null,
    forecast: normalized,
    cached: false,
  };

  cache.set(key, { value, expiresAt: now + cacheTtlMs });
  return value;
}

module.exports = { getSevenDayForecast };

