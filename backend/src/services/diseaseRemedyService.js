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

  // Rice disease remedies (v1) — demo-safe generic guidance
  rice_bacterial_blight_basic: {
    en: {
      diseaseName: "Bacterial blight (Rice)",
      treatment:
        "Remove and destroy heavily infected leaves if possible. Avoid excessive nitrogen and avoid overhead irrigation when disease pressure is high. Use a recommended bactericide only as per local agriculture office guidance.",
      prevention:
        "Use healthy seed/seedlings, maintain proper spacing for airflow, and avoid water stagnation. Keep field and bunds clean.",
      whenToContactExpert:
        "If symptoms spread fast or large area is affected, contact the local agriculture officer/KVK for the correct chemical choice and dose.",
      safety:
        "Follow label instructions. Wear gloves/mask when spraying. Keep chemicals away from children and animals.",
    },
    pa: {
      diseaseName: "ਬੈਕਟੀਰੀਅਲ ਬਲਾਈਟ (ਚੌਲ)",
      treatment:
        "ਜੇ ਸੰਭਵ ਹੋਵੇ ਤਾਂ ਬਹੁਤ ਪ੍ਰਭਾਵਿਤ ਪੱਤੇ ਹਟਾ ਕੇ ਨਸ਼ਟ ਕਰੋ। ਵਧੇਰੇ ਨਾਈਟ੍ਰੋਜਨ ਤੋਂ ਬਚੋ ਅਤੇ ਜ਼ਿਆਦਾ ਨਮੀ/ਓਵਰਹੈੱਡ ਸਿੰਚਾਈ ਤੋਂ ਬਚੋ। ਬੈਕਟੀਰੀਆ-ਰੋਧੀ ਦਵਾ ਸਿਰਫ਼ ਸਥਾਨਕ ਖੇਤੀਬਾੜੀ ਦਫ਼ਤਰ ਦੀ ਸਲਾਹ ਮੁਤਾਬਕ ਹੀ ਵਰਤੋ।",
      prevention:
        "ਸਿਹਤਮੰਦ ਬੀਜ/ਨਰਸਰੀ ਵਰਤੋ, ਹਵਾ ਲਈ ਠੀਕ ਅੰਤਰ ਰੱਖੋ, ਅਤੇ ਪਾਣੀ ਖੜ੍ਹਾ ਰਹਿਣ ਤੋਂ ਬਚੋ। ਖੇਤ ਅਤੇ ਮੇੜਾਂ ਸਾਫ਼ ਰੱਖੋ।",
      whenToContactExpert:
        "ਜੇ ਰੋਗ ਤੇਜ਼ੀ ਨਾਲ ਫੈਲ ਰਿਹਾ ਹੋਵੇ ਜਾਂ ਵੱਡੇ ਖੇਤਰ ਨੂੰ ਪ੍ਰਭਾਵਿਤ ਕਰ ਰਿਹਾ ਹੋਵੇ ਤਾਂ ਸਥਾਨਕ ਖੇਤੀਬਾੜੀ ਅਧਿਕਾਰੀ/KVK ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
      safety:
        "ਲੇਬਲ ਦੇ ਨਿਰਦੇਸ਼ ਮਾਨੋ। ਛਿੜਕਾਅ ਸਮੇਂ ਦਸਤਾਨੇ/ਮਾਸਕ ਪਹਿਨੋ। ਰਸਾਇਣ ਬੱਚਿਆਂ ਅਤੇ ਪਸ਼ੂਆਂ ਤੋਂ ਦੂਰ ਰੱਖੋ।",
    },
  },

  rice_blast_basic: {
    en: {
      diseaseName: "Blast (Rice)",
      treatment:
        "Avoid excess nitrogen and keep balanced fertilization. Remove heavily infected parts if possible. Use a recommended fungicide only as per local agriculture office guidance, especially if leaf/neck blast is severe.",
      prevention:
        "Use resistant varieties if available, maintain proper plant spacing, and avoid late evening overhead irrigation. Monitor during humid weather.",
      whenToContactExpert:
        "If neck blast is observed or yield risk is high, contact agriculture officer/KVK for immediate advice.",
      safety:
        "Use protective equipment while spraying. Do not exceed label dose. Keep spray away from water bodies.",
    },
    pa: {
      diseaseName: "ਬਲਾਸਟ (ਚੌਲ)",
      treatment:
        "ਵਧੇਰੇ ਨਾਈਟ੍ਰੋਜਨ ਤੋਂ ਬਚੋ ਅਤੇ ਸੰਤੁਲਿਤ ਖਾਦ ਵਰਤੋ। ਜੇ ਸੰਭਵ ਹੋਵੇ ਤਾਂ ਬਹੁਤ ਪ੍ਰਭਾਵਿਤ ਹਿੱਸੇ ਹਟਾਓ। ਫੰਗੀਸਾਈਡ ਸਿਰਫ਼ ਸਥਾਨਕ ਖੇਤੀਬਾੜੀ ਦਫ਼ਤਰ ਦੀ ਸਲਾਹ ਮੁਤਾਬਕ ਹੀ ਵਰਤੋ, ਖਾਸ ਕਰਕੇ ਜੇ ਰੋਗ ਜ਼ਿਆਦਾ ਹੋਵੇ।",
      prevention:
        "ਜੇ ਮਿਲ ਸਕੇ ਤਾਂ ਰੋਗ-ਰੋਧੀ ਕਿਸਮਾਂ ਵਰਤੋ, ਠੀਕ ਅੰਤਰ ਰੱਖੋ, ਅਤੇ ਦੇਰ ਸ਼ਾਮ ਓਵਰਹੈੱਡ ਸਿੰਚਾਈ ਤੋਂ ਬਚੋ। ਨਮੀ ਵਾਲੇ ਮੌਸਮ ਵਿੱਚ ਨਿਗਰਾਨੀ ਕਰੋ।",
      whenToContactExpert:
        "ਜੇ ਗੱਠ/ਗਲ੍ਹਾ ਬਲਾਸਟ ਦਿਖੇ ਜਾਂ ਪੈਦਾਵਾਰ ਨੂੰ ਖਤਰਾ ਹੋਵੇ ਤਾਂ ਤੁਰੰਤ ਸਥਾਨਕ ਖੇਤੀਬਾੜੀ ਅਧਿਕਾਰੀ/KVK ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
      safety:
        "ਛਿੜਕਾਅ ਸਮੇਂ ਸੁਰੱਖਿਆ ਕਿੱਟ ਵਰਤੋ। ਲੇਬਲ ਮਾਤਰਾ ਤੋਂ ਵੱਧ ਨਾ ਵਰਤੋ। ਪਾਣੀ ਵਾਲੀਆਂ ਜਗ੍ਹਾਂ ਤੋਂ ਛਿੜਕਾਅ ਦੂਰ ਰੱਖੋ।",
    },
  },

  rice_brown_spot_basic: {
    en: {
      diseaseName: "Brown spot (Rice)",
      treatment:
        "Improve field nutrition (avoid deficiency), and avoid prolonged leaf wetness. Remove heavily infected leaves if practical. Use a recommended fungicide only as per local guidance.",
      prevention:
        "Use quality seed, maintain balanced fertilization, and ensure proper drainage. Avoid dense planting.",
      whenToContactExpert:
        "If symptoms persist despite better nutrition/drainage, contact agriculture officer/KVK for confirmation.",
      safety:
        "Follow label instructions for any spray. Wear gloves/mask. Store chemicals safely.",
    },
    pa: {
      diseaseName: "ਬਰਾਊਨ ਸਪੌਟ (ਚੌਲ)",
      treatment:
        "ਖੇਤ ਦੀ ਪੋਸ਼ਣ ਹਾਲਤ ਸੁਧਾਰੋ (ਘਾਟ ਤੋਂ ਬਚੋ) ਅਤੇ ਪੱਤਿਆਂ 'ਤੇ ਲੰਮੇ ਸਮੇਂ ਤੱਕ ਨਮੀ ਰਹਿਣ ਤੋਂ ਬਚੋ। ਜੇ ਸੰਭਵ ਹੋਵੇ ਤਾਂ ਬਹੁਤ ਪ੍ਰਭਾਵਿਤ ਪੱਤੇ ਹਟਾਓ। ਫੰਗੀਸਾਈਡ ਸਿਰਫ਼ ਸਥਾਨਕ ਸਲਾਹ ਮੁਤਾਬਕ ਹੀ ਵਰਤੋ।",
      prevention:
        "ਉੱਚ ਗੁਣਵੱਤਾ ਵਾਲਾ ਬੀਜ ਵਰਤੋ, ਸੰਤੁਲਿਤ ਖਾਦ ਦਿਓ, ਅਤੇ ਨਿਕਾਸੀ ਠੀਕ ਰੱਖੋ। ਬਹੁਤ ਘਣੀ ਬਿਜਾਈ ਤੋਂ ਬਚੋ।",
      whenToContactExpert:
        "ਜੇ ਪੋਸ਼ਣ/ਨਿਕਾਸੀ ਸੁਧਾਰਣ ਤੋਂ ਬਾਅਦ ਵੀ ਲੱਛਣ ਰਹਿਣ ਤਾਂ ਸਥਾਨਕ ਖੇਤੀਬਾੜੀ ਅਧਿਕਾਰੀ/KVK ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
      safety:
        "ਕਿਸੇ ਵੀ ਛਿੜਕਾਅ ਲਈ ਲੇਬਲ ਨਿਰਦੇਸ਼ ਮਾਨੋ। ਦਸਤਾਨੇ/ਮਾਸਕ ਪਹਿਨੋ। ਰਸਾਇਣ ਸੁਰੱਖਿਅਤ ਢੰਗ ਨਾਲ ਸੰਭਾਲੋ।",
    },
  },

  rice_tungro_basic: {
    en: {
      diseaseName: "Tungro (Rice)",
      treatment:
        "Remove severely infected plants early to reduce spread. Manage insect vectors (leafhoppers) using safe, local recommendations. Avoid excess nitrogen.",
      prevention:
        "Use resistant varieties if available, control weeds around the field, and monitor for vector insects regularly.",
      whenToContactExpert:
        "If multiple patches appear or vector pressure is high, contact agriculture officer/KVK for integrated pest management advice.",
      safety:
        "If using insecticides, follow label dose and safety instructions. Avoid spraying near water bodies.",
    },
    pa: {
      diseaseName: "ਟੰਗਰੋ (ਚੌਲ)",
      treatment:
        "ਬਹੁਤ ਪ੍ਰਭਾਵਿਤ ਪੌਦੇ ਸ਼ੁਰੂ ਵਿੱਚ ਹੀ ਹਟਾਓ ਤਾਂ ਜੋ ਫੈਲਾਅ ਘੱਟ ਹੋਵੇ। ਵੈਕਟਰ ਕੀੜਿਆਂ (ਲੀਫਹੌਪਰ) ਦਾ ਪ੍ਰਬੰਧਨ ਸਥਾਨਕ ਸੁਰੱਖਿਅਤ ਸਿਫ਼ਾਰਿਸ਼ਾਂ ਮੁਤਾਬਕ ਕਰੋ। ਵਧੇਰੇ ਨਾਈਟ੍ਰੋਜਨ ਤੋਂ ਬਚੋ।",
      prevention:
        "ਜੇ ਮਿਲ ਸਕੇ ਤਾਂ ਰੋਗ-ਰੋਧੀ ਕਿਸਮਾਂ ਵਰਤੋ, ਖੇਤ ਦੇ ਆਲੇ-ਦੁਆਲੇ ਘਾਹ/ਝਾੜੀਆਂ ਕੰਟਰੋਲ ਕਰੋ, ਅਤੇ ਕੀੜਿਆਂ ਦੀ ਨਿਯਮਿਤ ਨਿਗਰਾਨੀ ਕਰੋ।",
      whenToContactExpert:
        "ਜੇ ਕਈ ਥਾਵਾਂ 'ਤੇ ਰੋਗ ਦਿਖੇ ਜਾਂ ਕੀੜਿਆਂ ਦਾ ਦਬਾਅ ਜ਼ਿਆਦਾ ਹੋਵੇ ਤਾਂ ਸਥਾਨਕ ਖੇਤੀਬਾੜੀ ਅਧਿਕਾਰੀ/KVK ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
      safety:
        "ਜੇ ਕੀਟਨਾਸ਼ਕ ਵਰਤ ਰਹੇ ਹੋ ਤਾਂ ਲੇਬਲ ਮਾਤਰਾ ਅਤੇ ਸੁਰੱਖਿਆ ਨਿਰਦੇਸ਼ ਮਾਨੋ। ਪਾਣੀ ਵਾਲੀਆਂ ਜਗ੍ਹਾਂ ਨੇੜੇ ਛਿੜਕਾਅ ਤੋਂ ਬਚੋ।",
    },
  },

  rice_healthy_basic: {
    en: {
      diseaseName: "Healthy (Rice)",
      treatment: "No disease detected. Continue regular monitoring and good field hygiene.",
      prevention:
        "Maintain balanced fertilization, proper spacing, and timely irrigation/drainage. Use certified seed if available.",
      whenToContactExpert:
        "If you still see symptoms in the field despite this result, consult a local expert for confirmation.",
      safety:
        "Avoid unnecessary pesticide sprays. Use chemicals only when advised and needed.",
    },
    pa: {
      diseaseName: "ਸਿਹਤਮੰਦ (ਚੌਲ)",
      treatment: "ਕੋਈ ਰੋਗ ਨਹੀਂ ਮਿਲਿਆ। ਨਿਯਮਿਤ ਨਿਗਰਾਨੀ ਅਤੇ ਖੇਤ ਦੀ ਸਫਾਈ ਜਾਰੀ ਰੱਖੋ।",
      prevention:
        "ਸੰਤੁਲਿਤ ਖਾਦ, ਠੀਕ ਅੰਤਰ, ਅਤੇ ਸਮੇਂ 'ਤੇ ਸਿੰਚਾਈ/ਨਿਕਾਸੀ ਰੱਖੋ। ਜੇ ਮਿਲ ਸਕੇ ਤਾਂ ਸਰਟੀਫਾਈਡ ਬੀਜ ਵਰਤੋ।",
      whenToContactExpert:
        "ਜੇ ਖੇਤ ਵਿੱਚ ਲੱਛਣ ਫਿਰ ਵੀ ਦਿਖ ਰਹੇ ਹੋਣ ਤਾਂ ਪੁਸ਼ਟੀ ਲਈ ਸਥਾਨਕ ਮਾਹਿਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।",
      safety:
        "ਬਿਨਾਂ ਲੋੜ ਦੇ ਦਵਾਈਆਂ ਦਾ ਛਿੜਕਾਅ ਨਾ ਕਰੋ। ਰਸਾਇਣ ਸਿਰਫ਼ ਸਲਾਹ ਅਤੇ ਜ਼ਰੂਰਤ ਮੁਤਾਬਕ ਹੀ ਵਰਤੋ।",
    },
  },

  rice_unknown_basic: {
    en: {
      diseaseName: "Unknown (Rice)",
      treatment:
        "The image could not be classified confidently. Retake a clear close-up photo of the affected leaf in good light and try again.",
      prevention:
        "Keep the field clean, avoid overwatering, and follow balanced fertilization. Monitor for pests and symptoms.",
      whenToContactExpert:
        "If the problem is spreading or severe, contact the local agriculture officer/KVK with the sample/photo.",
      safety:
        "Avoid spraying chemicals without confirmation. Use expert guidance for correct product and dose.",
    },
    pa: {
      diseaseName: "ਅਣਜਾਣ (ਚੌਲ)",
      treatment:
        "ਤਸਵੀਰ ਤੋਂ ਰੋਗ ਦੀ ਪਛਾਣ ਪੱਕੇ ਤੌਰ 'ਤੇ ਨਹੀਂ ਹੋ ਸਕੀ। ਚੰਗੀ ਰੌਸ਼ਨੀ ਵਿੱਚ ਪ੍ਰਭਾਵਿਤ ਪੱਤੇ ਦੀ ਸਾਫ਼ ਨੇੜੇ ਤੋਂ ਤਸਵੀਰ ਲੈ ਕੇ ਫਿਰ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
      prevention:
        "ਖੇਤ ਸਾਫ਼ ਰੱਖੋ, ਵੱਧ ਪਾਣੀ ਤੋਂ ਬਚੋ, ਅਤੇ ਸੰਤੁਲਿਤ ਖਾਦ ਦਿਓ। ਕੀੜਿਆਂ ਅਤੇ ਲੱਛਣਾਂ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ।",
      whenToContactExpert:
        "ਜੇ ਸਮੱਸਿਆ ਫੈਲ ਰਹੀ ਹੋਵੇ ਜਾਂ ਜ਼ਿਆਦਾ ਹੋਵੇ ਤਾਂ ਤਸਵੀਰ/ਨਮੂਨੇ ਨਾਲ ਸਥਾਨਕ ਖੇਤੀਬਾੜੀ ਅਧਿਕਾਰੀ/KVK ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
      safety:
        "ਬਿਨਾਂ ਪੁਸ਼ਟੀ ਦੇ ਰਸਾਇਣ ਨਾ ਛਿੜਕੋ। ਸਹੀ ਦਵਾ ਅਤੇ ਮਾਤਰਾ ਲਈ ਮਾਹਿਰ ਦੀ ਸਲਾਹ ਲਵੋ।",
    },
  },
};

function getRemedy(remedyKey) {
  if (!remedyKey) return null;
  return remedies[String(remedyKey)] || null;
}

module.exports = { getRemedy };
