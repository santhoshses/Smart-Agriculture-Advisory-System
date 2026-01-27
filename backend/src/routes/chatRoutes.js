const express = require("express");
const { generateChatbotResponse } = require("../services/chatbotService");

const router = express.Router();

/**
 * Chat endpoint (Review-01 MVP)
 * Input: { message: string, language?: "en" | "pa" }
 * Output: { reply, intent, language }
 */
router.post("/", (req, res) => {
  const { message, language } = req.body || {};
  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: "message is required" });
  }

  const output = generateChatbotResponse({ message, language });
  return res.json(output);
});

module.exports = router;

