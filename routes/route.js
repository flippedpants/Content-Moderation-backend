const express = require("express");
const router = express.Router();

const createAccount = require("../controller/createAccount.js");
const moderate = require("../controller/moderate.js");
const verifyApp = require("../middleware/auth.js");

router.post("/register", createAccount);
router.post("/moderate", verifyApp, moderate);

module.exports = router;