const jwt = require("jsonwebtoken");

const generateToken = (paylaod) => {
    return jwt.sign(payload, process.env.JWT_KEY, {algorithm: "HS256", expiresIn: "2h"});
}

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_KEY, {algorithm: "HS256"});
}

module.exports = {generateToken, verifyToken}