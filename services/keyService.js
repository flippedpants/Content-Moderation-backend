const crypto = require("crypto");

const generateApiKey = () => {
    const rawKey = `dtx_live_${crypto.randomBytes(16).toString('hex')}`;
    const prefix = rawKey.substring(0, 13);
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');
    
    return { rawKey, prefix, hashedKey };
};

const hashApiKey = (rawKey) => {
    return crypto.createHash('sha256').update(rawKey).digest('hex');
};

module.exports = { generateApiKey, hashApiKey };
