const { Router } = require("express");
const auth = require("../middlewares/auth.middleware.js");
const admin = require("../middlewares/admin.middleware.js");
const { getDashboardStatsController } = require("../controllers/dashboard.controller.js");

const router = Router();

router.get("/stats", auth, admin, getDashboardStatsController);

module.exports = router;