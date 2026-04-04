const mongoose = require("mongoose");

const apiKeySchema = new mongoose.Schema({
    appId: { type: String, required: true },
    name: { type: String, required: true },
    apiKeyHash: { type: String, required: true },
    prefix: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    lastUsed: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ApiKey", apiKeySchema);
