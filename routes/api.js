const express = require("express");
const router = express.Router();
const userAuth = require("../middleware/userAuth.js");

const { getDashboardStats } = require("../controller/dashboard.js");
const { getKeys, createNewKey, revokeKey } = require("../controller/keys.js");
const { getLogs } = require("../controller/logs.js");

router.use(userAuth);

router.get("/dashboard", getDashboardStats);

router.get("/keys", getKeys);
router.post("/keys", createNewKey);
router.patch("/keys/:id/revoke", revokeKey);
router.delete("/keys/:id", revokeKey);

router.get("/logs", getLogs);

module.exports = router;
