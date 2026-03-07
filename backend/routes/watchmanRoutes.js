/**
 * Watchman (security) routes — same as security/backend/routes/watchmanRoutes.js
 * Mount at /api/watchman so security endpoints are: POST /api/watchman/register, /api/watchman/login, /api/watchman/scan-qr
 */
const express = require("express");
const router = express.Router();
const watchmanController = require("../controller/watchmanController");

router.post("/register", watchmanController.register);
router.post("/login", watchmanController.login);
router.post("/scan-qr", watchmanController.scanQR);

module.exports = router;
