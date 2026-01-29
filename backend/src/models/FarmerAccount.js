const mongoose = require("mongoose");

// Demo-friendly auth model (no passwords)
// Each farmer has exactly one profile.

const FarmerAccountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: "FarmerProfile", required: true },
  },
  { timestamps: true }
);

// Note: `unique: true` above already creates the unique index for name.

module.exports = mongoose.model("FarmerAccount", FarmerAccountSchema);
