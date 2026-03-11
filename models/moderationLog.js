const mongoose = require("mongoose");

const moderationLogSchema = mongoose.Schema({
    appId: { type: String, required: true },
    text: { type: String, required: true },
    labels: { type: [String], default: [] },
    scores: { type: Map, of: Number, default: {} },
    confidence: { type: Number, required: true },
    flagged: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ModerationLog", moderationLogSchema);