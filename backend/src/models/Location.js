const mongoose = require("mongoose");

// Punjab Location master data
// Purpose: canonical set of districts (and later blocks/villages) for consistent UX + data quality.

const LocationSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    state: { type: String, required: true, default: "Punjab", trim: true },
    type: { type: String, required: true, enum: ["district"], default: "district" },
    name: {
      en: { type: String, required: true, trim: true },
      pa: { type: String, trim: true },
    },
    // Centroid used for weather lookup / resolver.
    center: {
      lat: { type: Number, required: true, min: -90, max: 90 },
      lon: { type: Number, required: true, min: -180, max: 180 },
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

LocationSchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model("Location", LocationSchema);
