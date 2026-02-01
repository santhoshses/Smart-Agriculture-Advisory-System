const mongoose = require("mongoose");

// Demo session store persisted in MongoDB.
// Token is treated like an API key for the demo.

const FarmerSessionSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "FarmerAccount", required: true, index: true },
    // TTL index is defined below using schema.index(..., { expireAfterSeconds: 0 })
    // so we do NOT also set `index: true` here (avoids duplicate-index warning).
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

FarmerSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("FarmerSession", FarmerSessionSchema);
