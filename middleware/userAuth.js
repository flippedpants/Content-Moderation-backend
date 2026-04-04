const { verifyToken } = require("../services/jwtService.js");
const User = require("../models/user.js");

const userAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided!" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "User not found!" });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token!" });
    }
};

module.exports = userAuth;
