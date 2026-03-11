const express = require("express");
const router = express.Router();
const {registerValidaton, loginValidation} = require("../validators/userValidation.js")
const {body} = require("express-validator")

const createAccount = require("../controller/createAccount.js");
const moderate = require("../controller/moderate.js");
const verifyApi = require("../middleware/apiAuth.js");
const login = require("../controller/login.js")

router.post("/register", registerValidaton, createAccount);
router.post("/login", loginValidation , login)
router.post("/moderate", verifyApi, [
    body("text").isEmpty().isLength({ max:300})
] , moderate);

module.exports = router;