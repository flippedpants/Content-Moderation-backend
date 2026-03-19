const axios = require("axios");
const ModerationLog = require("../models/moderationLog.js");
const {validationResult} = require("express-validator")

const MODERATION_SERVICE_URL = process.env.MODERATION_SERVICE_URL;

const moderate = async (req, res) => {
  const result = validationResult(req)

  if(!result.isEmpty()){
    return res.status(400).json({errors:result.array()})
  }

  const { text } = req.body;
  const { appId } = req.appContext;

  try {
    const response = await axios.post(`${MODERATION_SERVICE_URL}/moderate`, {
      text: text,
    });

    const { flagged, labels, scores, confidence } = response.data;

    const newModerationLog = new ModerationLog({
      appId: appId,
      text: text,
      labels: labels,
      scores: scores,
      confidence: confidence,
      flagged: flagged,
    });

    await newModerationLog.save();

    res.json({
      text,
      flagged,
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
      error: "Moderation service is unavailable.",
    });
  }
};

module.exports = moderate;