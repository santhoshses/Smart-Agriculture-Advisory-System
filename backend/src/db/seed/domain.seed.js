const Season = require("../../models/Season");
const SoilType = require("../../models/SoilType");
const Crop = require("../../models/Crop");

const SEASONS = [
  { code: "kharif", name: { en: "Kharif", pa: "ਖਰੀਫ" } },
  { code: "rabi", name: { en: "Rabi", pa: "ਰਬੀ" } },
  { code: "zaid", name: { en: "Zaid", pa: "ਜ਼ਾਇਦ" } },
];

// Simple soil type set for Punjab demo
const SOIL_TYPES = [
  { code: "sandy", name: { en: "Sandy", pa: "ਰੇਤਲੀ" } },
  { code: "sandy_loam", name: { en: "Sandy loam", pa: "ਰੇਤਲੀ-ਦੋਅਬੀ" } },
  { code: "loam", name: { en: "Loam", pa: "ਦੋਅਬੀ" } },
  { code: "clay_loam", name: { en: "Clay loam", pa: "ਚਿਕਣੀ-ਦੋਅਬੀ" } },
  { code: "clay", name: { en: "Clay", pa: "ਚਿਕਣੀ" } },
];

// Crop catalog (for previous crop selection)
const CROPS = [
  { code: "wheat", name: { en: "Wheat", pa: "ਗੇਹੂੰ" } },
  { code: "rice", name: { en: "Rice", pa: "ਧਾਨ" } },
  { code: "maize", name: { en: "Maize", pa: "ਮੱਕੀ" } },
  { code: "cotton", name: { en: "Cotton", pa: "ਕਪਾਹ" } },
  { code: "sugarcane", name: { en: "Sugarcane", pa: "ਗੰਨਾ" } },
  { code: "mustard", name: { en: "Mustard", pa: "ਸਰੋਂ" } },
];

async function bulkUpsert(model, items) {
  const ops = items.map((x) => ({
    updateOne: {
      filter: { code: x.code },
      update: { $set: { ...x, active: true } },
      upsert: true,
    },
  }));
  const r = await model.bulkWrite(ops);
  const upserts = r.upsertedCount || 0;
  const modified = r.modifiedCount || 0;
  return { insertedOrUpdated: upserts + modified, upserts, modified };
}

async function seedDomainMasters() {
  const seasons = await bulkUpsert(Season, SEASONS);
  const soilTypes = await bulkUpsert(SoilType, SOIL_TYPES);
  const crops = await bulkUpsert(Crop, CROPS);
  return { seasons, soilTypes, crops };
}

module.exports = { seedDomainMasters, SEASONS, SOIL_TYPES, CROPS };

