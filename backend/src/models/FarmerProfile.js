const mongoose = require("mongoose");

const FarmerProfileSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    location: { type: String, trim: true, required: true },
    soilType: { type: String, trim: true },
    previousCrop: { type: String, trim: true },
    season: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FarmerProfile", FarmerProfileSchema);

