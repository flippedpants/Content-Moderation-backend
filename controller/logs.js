const ModerationLog = require("../models/moderationLog.js");

const getLogs = async (req, res) => {
    try {
        const logs = await ModerationLog.find({ appId: req.user.appId })
            .sort({ createdAt: -1 })
            .limit(100);
            
        const formattedLogs = logs.map(log => {
            // Reconstruct categories format to match frontend mock
            // the frontend expects all categories even if not flagged.
            // For simplicity, we just send what was flagged based on labels.
            const categories = ["toxic", "severe_toxic", "obscene", "threat", "insult", "identity_hate"].map(cat => ({
                category: cat,
                score: log.scores && log.scores.get(cat) ? log.scores.get(cat) : 0,
                flagged: log.labels.includes(cat)
            }));

            return {
                id: log._id,
                timestamp: log.createdAt,
                input: log.text,
                verdict: log.flagged ? "flagged" : "safe",
                confidence: log.confidence,
                latencyMs: 50, // Static for now, no latency stored in db
                apiKeyPrefix: "api_key", // We didn't store api key ID in logs, so we just return a placeholder
                categories: categories
            };
        });

        res.json(formattedLogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getLogs };
