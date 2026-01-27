const mongoose = require("mongoose");

const SoilTestSchema = new mongoose.Schema(
  {
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: "FarmerProfile", required: true },
    n: { type: Number, required: true, min: 0 },
    p: { type: Number, required: true, min: 0 },
    k: { type: Number, required: true, min: 0 },
    ph: { type: Number, required: true, min: 0, max: 14 },
    testDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SoilTest", SoilTestSchema);

