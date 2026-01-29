const express = require("express");
const cors = require("cors");

const { connectToDatabase } = require("./db/connect");
const profileRoutes = require("./routes/profileRoutes");
const soilTestRoutes = require("./routes/soilTestRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const diseaseRoutes = require("./routes/diseaseRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const chatRoutes = require("./routes/chatRoutes");
const edgeRoutes = require("./routes/edgeRoutes");
const locationRoutes = require("./routes/locationRoutes");
const seasonRoutes = require("./routes/seasonRoutes");
const soilTypeRoutes = require("./routes/soilTypeRoutes");
const cropRoutes = require("./routes/cropRoutes");
const authRoutes = require("./routes/authRoutes");
const meRoutes = require("./routes/meRoutes");

const PORT = process.env.PORT || 5000;

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Simple request logger (minimal, review-friendly)
app.use((req, res, next) => {
  const started = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - started;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// CRUD routes (persistence only)
app.use("/", authRoutes);
app.use("/", meRoutes);
app.use("/locations", locationRoutes);
app.use("/seasons", seasonRoutes);
app.use("/soil-types", soilTypeRoutes);
app.use("/crops", cropRoutes);
app.use("/profiles", profileRoutes);
app.use("/soil-tests", soilTestRoutes);

// Advisory routes (Phase 3)
app.use("/recommendations", recommendationRoutes);

// Disease routes (Phase 4)
app.use("/disease", diseaseRoutes);

// Weather routes (Phase 5)
app.use("/weather", weatherRoutes);

// Chatbot routes (Review-01 requirement)
app.use("/chat", chatRoutes);

// Edge status routes (Review-01 reviewer comment: edge computing)
app.use("/edge", edgeRoutes);

// Not found handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Handle common “bad input” cases cleanly (useful for CRUD testing)
  const isJsonParseError =
    err instanceof SyntaxError && err.status === 400 && "body" in err;

  if (isJsonParseError) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  // Mongoose validation errors
  if (err && err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation error",
      details: Object.keys(err.errors || {}),
    });
  }

  // Mongoose invalid ObjectId, etc.
  if (err && err.name === "CastError") {
    return res.status(400).json({ error: "Invalid identifier" });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({ error: "Internal server error" });
});

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start backend (DB connection error)", err);
    process.exit(1);
  });
