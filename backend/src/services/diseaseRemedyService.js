/**
 * Disease remedy knowledge base (v1)
 *
 * Review-01 goal:
 * - Provide treatment recommendations in English + Punjabi (Gurmukhi)
 * - Keep it simple, explainable, and safe (no brand names, include escalation note)
 *
 * NOTE: These are demo-safe generic recommendations and are NOT official prescriptions.
 */

const remedies = {
  wheat_leaf_rust_basic: {
    en: {
      diseaseName: "Leaf rust (Wheat)",
      treatment:
        "Remove heavily infected leaves if possible. Use a recommended fungicide only as per local agriculture office guidance. Maintain field hygiene and avoid overhead irrigation when disease pressure is high.",
      prevention:
        "Use resistant varieties if available, avoid dense sowing, and monitor the crop regularly during humid weather.",
      whenToContactExpert:
        "If infection spreads quickly, affects large area, or you are unsure about chemical choice/dose, contact the local agriculture officer/KVK.",
      safety:
        "Wear gloves/mask when spraying. Do not exceed label dose. Keep chemicals away from children and animals.",
    },
    pa: {
      diseaseName: "ਪੱਤੇ ਦਾ ਰਸਟ (ਗੈਂਹੂੰ)",
      treatment:
        "ਜੇ ਸੰਭਵ ਹੋਵੇ ਤਾਂ ਬਹੁਤ ਪ੍ਰਭਾਵਿਤ ਪੱਤੇ ਹਟਾਓ। ਫੰਗੀਸਾਈਡ ਸਿਰਫ਼ ਸਥਾਨਕ ਖੇਤੀਬਾੜੀ ਦਫ਼ਤਰ ਦੀ ਸਲਾਹ ਮੁਤਾਬਕ ਹੀ ਵਰਤੋ। ਖੇਤ ਦੀ ਸਫਾਈ ਰੱਖੋ ਅਤੇ ਵੱਧ ਨਮੀ ਵਾਲੇ ਸਮੇਂ ਓਵਰਹੈੱਡ ਸਿੰਚਾਈ ਤੋਂ ਬਚੋ।",
      prevention:
        "ਜੇ ਮਿਲ ਸਕੇ ਤਾਂ ਰੋਗ-ਰੋਧੀ ਕਿਸਮਾਂ ਵਰਤੋ, ਬਹੁਤ ਘਣੀ ਬਿਜਾਈ ਤੋਂ ਬਚੋ, ਅਤੇ ਨਮੀ ਵਾਲੇ ਮੌਸਮ ਵਿੱਚ ਨਿਯਮਿਤ ਜਾਂਚ ਕਰੋ।",
      whenToContactExpert:
        "ਜੇ ਰੋਗ ਤੇਜ਼ੀ ਨਾਲ ਫੈਲ ਰਿਹਾ ਹੋਵੇ, ਵੱਡੇ ਖੇਤਰ ਨੂੰ ਪ੍ਰਭਾਵਿਤ ਕਰ ਰਿਹਾ ਹੋਵੇ, ਜਾਂ ਦਵਾਈ/ਮਾਤਰਾ ਬਾਰੇ ਸ਼ੱਕ ਹੋਵੇ ਤਾਂ ਸਥਾਨਕ ਖੇਤੀਬਾੜੀ ਅਧਿਕਾਰੀ/KVK ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
      safety:
        "ਛਿੜਕਾਅ ਸਮੇਂ ਦਸਤਾਨੇ/ਮਾਸਕ ਪਹਿਨੋ। ਲੇਬਲ ਵਾਲੀ ਮਾਤਰਾ ਤੋਂ ਵੱਧ ਨਾ ਵਰਤੋ। ਰਸਾਇਣ ਬੱਚਿਆਂ ਅਤੇ ਪਸ਼ੂਆਂ ਤੋਂ ਦੂਰ ਰੱਖੋ।",
    },
  },
};

function getRemedy(remedyKey) {
  if (!remedyKey) return null;
  return remedies[String(remedyKey)] || null;
}

module.exports = { getRemedy };

