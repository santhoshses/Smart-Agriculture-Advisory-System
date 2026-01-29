const mongoose = require("mongoose");

const SeasonSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    name: {
      en: { type: String, required: true, trim: true },
      pa: { type: String, trim: true },
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SeasonSchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model("Season", SeasonSchema);

