const express = require("express");
const controller = require("../controller/auth");
const { admin } = require("../middleware/admin");
const { auth } = require("../middleware/auth");
const router = express.Router();
router.post("/login", controller.login);
router.post("/signup", controller.signup);
router.post("/admin/authorize-users", auth, admin, controller.authorize);
module.exports = router;
