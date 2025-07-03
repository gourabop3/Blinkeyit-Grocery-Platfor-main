const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware.js");
const {
  getLoyaltySummaryController,
  getLoyaltyHistoryController,
  redeemPointsController,
  awardReferralPointsController,
} = require("../controllers/loyalty.controller.js");

// Loyalty routes
router.get("/summary", auth, getLoyaltySummaryController);
router.get("/history", auth, getLoyaltyHistoryController);
router.post("/redeem", auth, redeemPointsController);
router.post("/referral-reward", auth, awardReferralPointsController);

module.exports = router;