const {body} = require("express-validator");

const emailValidationChain = () => body("email").trim().isEmpty().isEmail().normalizeEmail()
const passwordValidationChain = () => body("password").trim().isEmpty().isLength({min: 5})

const registerValidaton = [
    emailValidationChain(),
    passwordValidationChain(),
    body("name").trim().isEmpty(),
    body("plan").isEmpty,
]

const loginValidation = [
    emailValidationChain(),
    passwordValidationChain()
]

module.exports = {registerValidaton, loginValidation}