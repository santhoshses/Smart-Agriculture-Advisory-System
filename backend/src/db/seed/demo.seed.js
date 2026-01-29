const FarmerProfile = require("../../models/FarmerProfile");
const SoilTest = require("../../models/SoilTest");
const FarmerAccount = require("../../models/FarmerAccount");
const Location = require("../../models/Location");
const Season = require("../../models/Season");
const SoilType = require("../../models/SoilType");
const Crop = require("../../models/Crop");

async function getByCodeOrThrow(Model, code, label) {
  const doc = await Model.findOne({ code, active: true });
  if (!doc) throw new Error(`Missing ${label} seed for code: ${code}. Run npm run seed first.`);
  return doc;
}

async function createProfileIfMissing({ name, locationCode, seasonCode, soilTypeCode, previousCropCode }) {
  const location = await getByCodeOrThrow(Location, locationCode, "Location");
  const season = seasonCode ? await getByCodeOrThrow(Season, seasonCode, "Season") : null;
  const soilType = soilTypeCode ? await getByCodeOrThrow(SoilType, soilTypeCode, "SoilType") : null;
  const prevCrop = previousCropCode ? await getByCodeOrThrow(Crop, previousCropCode, "Crop") : null;

  // FarmerAccount name is the demo login identifier.
  let account = await FarmerAccount.findOne({ name });

  // If there is an existing legacy demo profile (from earlier seeds), re-use it.
  // Match by name and unlinked farmerId.
  if (!account) {
    const legacy = await FarmerProfile.findOne({ name, farmerId: { $exists: false } }).sort({ createdAt: -1 });
    if (legacy) {
      account = await FarmerAccount.create({ name, profileId: legacy._id });
      legacy.farmerId = account._id;
      // Also update canonical fields so the profile is in sync with latest master data
      legacy.locationId = location._id;
      legacy.seasonId = season?._id;
      legacy.soilTypeId = soilType?._id;
      legacy.previousCropId = prevCrop?._id;
      await legacy.save();
      return legacy;
    }
  }

  // If account exists, re-use its profile.
  if (account?.profileId) {
    const p = await FarmerProfile.findById(account.profileId);
    if (p) return p;
  }

  const profile = await FarmerProfile.create({
    farmerId: account?._id,
    name,
    locationId: location._id,
    ...(season ? { seasonId: season._id } : {}),
    ...(soilType ? { soilTypeId: soilType._id } : {}),
    ...(prevCrop ? { previousCropId: prevCrop._id } : {}),
  });

  if (!account) {
    account = await FarmerAccount.create({ name, profileId: profile._id });
  } else {
    account.profileId = profile._id;
    await account.save();
  }

  // Ensure reverse link is set
  if (!profile.farmerId) {
    profile.farmerId = account._id;
    await profile.save();
  }

  return profile;
}

async function seedDemoData() {
  // 3 demo profiles across districts + seasons
  const demoProfiles = [
    {
      name: "Demo Farmer 1",
      locationCode: "pb_ludhiana",
      seasonCode: "rabi",
      soilTypeCode: "loam",
      previousCropCode: "rice",
      soilTests: [
        { n: 35, p: 18, k: 22, ph: 7.2 },
        { n: 20, p: 12, k: 15, ph: 6.8 },
      ],
    },
    {
      name: "Demo Farmer 2",
      locationCode: "pb_amritsar",
      seasonCode: "kharif",
      soilTypeCode: "sandy_loam",
      previousCropCode: "wheat",
      soilTests: [{ n: 28, p: 16, k: 18, ph: 7.6 }],
    },
    {
      name: "Demo Farmer 3",
      locationCode: "pb_bathinda",
      seasonCode: "kharif",
      soilTypeCode: "clay_loam",
      previousCropCode: "cotton",
      soilTests: [{ n: 42, p: 24, k: 30, ph: 8.1 }],
    },
  ];

  const createdProfiles = [];
  let soilTestsCreated = 0;

  for (const p of demoProfiles) {
    const profile = await createProfileIfMissing(p);
    createdProfiles.push(profile);

    // Create soil tests if not already present (basic check)
    const existingCount = await SoilTest.countDocuments({ profileId: profile._id });
    if (existingCount > 0) continue;

    for (const st of p.soilTests || []) {
      await SoilTest.create({
        profileId: profile._id,
        n: st.n,
        p: st.p,
        k: st.k,
        ph: st.ph,
        testDate: new Date(),
      });
      soilTestsCreated += 1;
    }
  }

  return {
    profilesInsertedOrExisting: createdProfiles.length,
    soilTestsCreated,
  };
}

module.exports = { seedDemoData };
