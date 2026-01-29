const FarmerSession = require("../models/FarmerSession");
const FarmerAccount = require("../models/FarmerAccount");

function parseBearerToken(req) {
  const h = req.headers?.authorization || req.headers?.Authorization;
  if (!h) return null;
  const s = String(h);
  const m = s.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

async function requireAuth(req, res, next) {
  try {
    const token = parseBearerToken(req);
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const session = await FarmerSession.findOne({ token });
    if (!session) return res.status(401).json({ error: "Unauthorized" });
    if (session.expiresAt && session.expiresAt.getTime() < Date.now()) {
      return res.status(401).json({ error: "Session expired" });
    }

    const farmer = await FarmerAccount.findById(session.farmerId);
    if (!farmer) return res.status(401).json({ error: "Unauthorized" });

    req.auth = {
      token,
      farmerId: farmer._id,
      profileId: farmer.profileId,
      farmerName: farmer.name,
    };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth };

