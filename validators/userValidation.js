const {body} = require("express-validator");

const emailValidationChain = () => body("email").trim().notEmpty().isEmail().normalizeEmail()
const passwordValidationChain = () => body("password").trim().notEmpty().isLength({min: 5})

const registerValidaton = [
    emailValidationChain(),
    passwordValidationChain(),
    body("name").trim().notEmpty(),
    body("plan").optional(),
]

const loginValidation = [
    emailValidationChain(),
    passwordValidationChain()
]

module.exports = {registerValidaton, loginValidation}