const axios = require("axios");
const ModerationLog = require("../models/moderationLog.js");

const MODERATION_SERVICE_URL = process.env.MODERATION_SERVICE_URL || "http://localhost:8000";

const moderate = async (req, res) => {
  const { text } = req.body;
  const { appId } = req.appContext;

  if (!text) {
    return res.status(400).json({ error: "Text is required!" });
  }

  try {
    // Call the FastAPI moderation microservice
    const response = await axios.post(`${MODERATION_SERVICE_URL}/moderate`, {
      text: text,
    });

    const { flagged, labels, scores, label, confidence } = response.data;

    // Save moderation log to database
    const newModerationLog = new ModerationLog({
      appId: appId,
      text: text,
      label: label,
      labels: labels,
      scores: scores,
      confidence: confidence,
      flagged: flagged,
    });

    await newModerationLog.save();

    res.json({
      text,
      flagged,
      label,
      labels,
      scores,
      confidence,
    });
  } catch (err) {
    console.error("Moderation service error:", err.message);

    if (err.response) {
      return res.status(err.response.status).json({
        error: "Moderation service returned an error",
        detail: err.response.data,
      });
    }

    return res.status(503).json({
      error: "Moderation service is unavailable. Please try again later.",
    });
  }
};

module.exports = moderate;