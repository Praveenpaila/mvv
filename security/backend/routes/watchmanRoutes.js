const express = require("express");
const router = express.Router();
const watchmanController = require("../controller/watchmanController");

router.post("/register", watchmanController.register);
router.post("/login", watchmanController.login);
router.post("/scan-qr", watchmanController.scanQR);

module.exports = router;
