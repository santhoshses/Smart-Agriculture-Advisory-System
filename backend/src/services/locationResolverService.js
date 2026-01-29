/**
 * Location resolver (legacy)
 *
 * NOTE: Gap #1 introduces a Location master collection.
 * For most flows we now prefer using `profile.locationId.center` (populated Location).
 * This file remains only as a fallback for older demo data or free-text inputs.
 */

const PUNJAB_LOCATIONS = {
  ludhiana: { lat: 30.9010, lon: 75.8573 },
  amritsar: { lat: 31.6340, lon: 74.8723 },
  jalandhar: { lat: 31.3260, lon: 75.5762 },
  patiala: { lat: 30.3398, lon: 76.3869 },
  bathinda: { lat: 30.2100, lon: 74.9455 },
  mohali: { lat: 30.7046, lon: 76.7179 },
  sas_nagar: { lat: 30.7046, lon: 76.7179 },
  sangrur: { lat: 30.2458, lon: 75.8421 },
  moga: { lat: 30.8165, lon: 75.1717 },
  fazilka: { lat: 30.4043, lon: 74.0280 },
  firozpur: { lat: 30.9166, lon: 74.6225 },
  faridkot: { lat: 30.6757, lon: 74.7539 },
  hoshiarpur: { lat: 31.5320, lon: 75.9115 },
  kapurthala: { lat: 31.3800, lon: 75.3846 },
  gurdaspur: { lat: 32.0419, lon: 75.4053 },
  pathankot: { lat: 32.2643, lon: 75.6421 },
  tarn_taran: { lat: 31.4517, lon: 74.9278 },
};

function normalizeKey(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .replace(/\s/g, "_");
}

/**
 * resolveLatLon
 * @param {string} locationText - e.g., "Ludhiana" or "Ludhiana district"
 */
function resolveLatLon(locationText) {
  const raw = String(locationText || "").trim();
  if (!raw) return null;

  // Try exact normalized match
  const key = normalizeKey(raw);
  if (PUNJAB_LOCATIONS[key]) return { ...PUNJAB_LOCATIONS[key], source: "punjab_lookup" };

  // Try matching by contained token (e.g., "Ludhiana district")
  const tokens = raw
    .toLowerCase()
    .split(/[^a-z\s]/g)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean);

  for (const t of tokens) {
    const tk = normalizeKey(t);
    if (PUNJAB_LOCATIONS[tk]) return { ...PUNJAB_LOCATIONS[tk], source: "punjab_lookup" };
  }

  return null;
}

module.exports = { resolveLatLon };
