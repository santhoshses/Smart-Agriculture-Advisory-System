// Demo seed script (dev/viva)
// Usage:
//   npm run seed        -> seeds master data
//   npm run seed:demo   -> seeds demo profiles + soil tests (requires master data)

const { connectToDatabase } = require("../db/connect");
const { seedDemoData } = require("../db/seed/demo.seed");

async function main() {
  await connectToDatabase();
  const result = await seedDemoData();
  console.log("Seeded demo data:", result);
  process.exit(0);
}

main().catch((err) => {
  console.error("Demo seed failed:", err);
  process.exit(1);
});

