const express = require("express");
const router = express.Router();

const createAccount = require("../controller/createAccount.js");
const moderate = require("../controller/moderate.js");
const verifyApi = require("../middleware/apiAuth.js");
const login = require("../controller/login.js")

router.post("/register", createAccount);
router.post("/login", login)
router.post("/moderate", verifyApi, moderate);

module.exports = router;