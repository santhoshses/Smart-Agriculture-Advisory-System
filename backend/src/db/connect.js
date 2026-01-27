const mongoose = require("mongoose");

const DEFAULT_URI = "mongodb://127.0.0.1:27017/smart_crop_advisory";

async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI || DEFAULT_URI;

  mongoose.set("strictQuery", true);

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
}

module.exports = { connectToDatabase };

