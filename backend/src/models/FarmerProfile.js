const mongoose = require("mongoose");

const FarmerProfileSchema = new mongoose.Schema(
  {
    // Link back to the farmer account (single-profile-per-farmer).
    // sparse=true so legacy profiles without farmerId don't violate the unique constraint
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FarmerAccount",
      index: true,
      unique: true,
      sparse: true,
    },
    name: { type: String, trim: true },
    // Canonical Punjab location (district) reference.
    // NOTE: This replaces legacy free-text `location`.
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
      index: true,
    },
    // Backward-compatibility for older records (not used by new UI).
    locationText: { type: String, trim: true },

    // Canonical domain fields (Gap #5)
    soilTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "SoilType", index: true },
    seasonId: { type: mongoose.Schema.Types.ObjectId, ref: "Season", index: true },
    previousCropId: { type: mongoose.Schema.Types.ObjectId, ref: "Crop", index: true },

    // Legacy free-text fields (for older records only; new UI should not write these).
    soilTypeText: { type: String, trim: true },
    seasonText: { type: String, trim: true },
    previousCropText: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FarmerProfile", FarmerProfileSchema);
