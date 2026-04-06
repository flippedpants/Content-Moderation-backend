const ApiKey = require("../models/apiKey.js");
const { generateApiKey } = require("../services/keyService.js");

const getKeys = async (req, res) => {
    try {
        const keys = await ApiKey.find({ appId: req.user.appId }).sort({ createdAt: -1 });
        res.json(keys.map(k => ({
            id: String(k._id),
            name: k.name,
            prefix: k.prefix,
            createdAt: k.createdAt,
            lastUsed: k.lastUsed,
            status: k.isActive ? 'active' : 'revoked'
        })));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const createNewKey = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: "Key name required" });

        const { rawKey, prefix, hashedKey } = generateApiKey();

        const newKey = new ApiKey({
            appId: req.user.appId,
            name: name,
            apiKeyHash: hashedKey,
            prefix: prefix,
            isActive: true
        });

        await newKey.save();

        res.status(201).json({
            id: String(newKey._id),
            name: newKey.name,
            rawKey,
            key: rawKey,
            prefix: newKey.prefix,
            createdAt: newKey.createdAt,
            status: "active"
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const revokeKey = async (req, res) => {
    try {
        const key = await ApiKey.findOne({ _id: req.params.id, appId: req.user.appId });
        if (!key) return res.status(404).json({ message: "Key not found" });

        key.isActive = false;
        await key.save();

        res.json({ message: "Key revoked successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = { getKeys, createNewKey, revokeKey };
