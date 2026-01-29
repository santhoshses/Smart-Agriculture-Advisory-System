const Location = require("../../models/Location");

// Punjab districts (seed set)
// Lat/lon are district centroids (approx) suitable for weather forecast lookup.
const PUNJAB_DISTRICTS = [
  {
    code: "pb_ludhiana",
    name: { en: "Ludhiana", pa: "ਲੁਧਿਆਣਾ" },
    center: { lat: 30.901, lon: 75.8573 },
  },
  {
    code: "pb_amritsar",
    name: { en: "Amritsar", pa: "ਅੰਮ੍ਰਿਤਸਰ" },
    center: { lat: 31.634, lon: 74.8723 },
  },
  {
    code: "pb_jalandhar",
    name: { en: "Jalandhar", pa: "ਜਲੰਧਰ" },
    center: { lat: 31.326, lon: 75.5762 },
  },
  {
    code: "pb_patiala",
    name: { en: "Patiala", pa: "ਪਟਿਆਲਾ" },
    center: { lat: 30.3398, lon: 76.3869 },
  },
  {
    code: "pb_bathinda",
    name: { en: "Bathinda", pa: "ਬਠਿੰਡਾ" },
    center: { lat: 30.21, lon: 74.9455 },
  },
  {
    code: "pb_sas_nagar",
    name: { en: "SAS Nagar (Mohali)", pa: "ਐਸ.ਏ.ਐਸ. ਨਗਰ (ਮੋਹਾਲੀ)" },
    center: { lat: 30.7046, lon: 76.7179 },
  },
  {
    code: "pb_sangrur",
    name: { en: "Sangrur", pa: "ਸੰਗਰੂਰ" },
    center: { lat: 30.2458, lon: 75.8421 },
  },
  {
    code: "pb_moga",
    name: { en: "Moga", pa: "ਮੋਗਾ" },
    center: { lat: 30.8165, lon: 75.1717 },
  },
  {
    code: "pb_fazilka",
    name: { en: "Fazilka", pa: "ਫਾਜ਼ਿਲਕਾ" },
    center: { lat: 30.4043, lon: 74.028 },
  },
  {
    code: "pb_firozpur",
    name: { en: "Firozpur", pa: "ਫਿਰੋਜ਼ਪੁਰ" },
    center: { lat: 30.9166, lon: 74.6225 },
  },
  {
    code: "pb_faridkot",
    name: { en: "Faridkot", pa: "ਫਰੀਦਕੋਟ" },
    center: { lat: 30.6757, lon: 74.7539 },
  },
  {
    code: "pb_hoshiarpur",
    name: { en: "Hoshiarpur", pa: "ਹੋਸ਼ਿਆਰਪੁਰ" },
    center: { lat: 31.532, lon: 75.9115 },
  },
  {
    code: "pb_kapurthala",
    name: { en: "Kapurthala", pa: "ਕਪੂਰਥਲਾ" },
    center: { lat: 31.38, lon: 75.3846 },
  },
  {
    code: "pb_gurdaspur",
    name: { en: "Gurdaspur", pa: "ਗੁਰਦਾਸਪੁਰ" },
    center: { lat: 32.0419, lon: 75.4053 },
  },
  {
    code: "pb_pathankot",
    name: { en: "Pathankot", pa: "ਪਠਾਨਕੋਟ" },
    center: { lat: 32.2643, lon: 75.6421 },
  },
  {
    code: "pb_tarn_taran",
    name: { en: "Tarn Taran", pa: "ਤਰਨ ਤਾਰਨ" },
    center: { lat: 31.4517, lon: 74.9278 },
  },
];

async function seedLocations({ dryRun = false } = {}) {
  const ops = PUNJAB_DISTRICTS.map((x) => ({
    updateOne: {
      filter: { code: x.code },
      update: {
        $set: {
          ...x,
          state: "Punjab",
          type: "district",
          active: true,
        },
      },
      upsert: true,
    },
  }));

  if (dryRun) return { insertedOrUpdated: ops.length, dryRun: true };

  const r = await Location.bulkWrite(ops);
  const upserts = r.upsertedCount || 0;
  const modified = r.modifiedCount || 0;
  return { insertedOrUpdated: upserts + modified, upserts, modified };
}

module.exports = { seedLocations, PUNJAB_DISTRICTS };

