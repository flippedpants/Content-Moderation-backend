const bcrypt = require("bcryptjs");
const { verify } = require("jsonwebtoken");

const hashPassword = async(plainPassword) => {
    return await bcrypt.hash(plainPassword, process.env.SALT_ROUNDS);
}

const verifyPassword = async(plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {hashPassword, verifyPassword}