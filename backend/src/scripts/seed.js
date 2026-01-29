// Seed script (dev/demo)
// Usage: node src/scripts/seed.js

const { connectToDatabase } = require("../db/connect");
const { seedLocations } = require("../db/seed/locations.seed");
const { seedDomainMasters } = require("../db/seed/domain.seed");

async function main() {
  await connectToDatabase();
  const loc = await seedLocations();
  const domain = await seedDomainMasters();
  console.log("Seeded locations:", loc);
  console.log("Seeded domain masters:", domain);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
