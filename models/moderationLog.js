const mongoose = require("mongoose");

const moderationLogSchema = mongoose.Schema({
    appId: { type: String, required: true },
    text: { type: String, required: true },
    label: { type: String, required: true },
    confidence: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ModerationLog", moderationLogSchema);