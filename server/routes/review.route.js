const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware.js");
const {
  createReviewController,
  getProductReviewsController,
  markReviewHelpfulController,
  getUserReviewsController,
} = require("../controllers/review.controller.js");

// Review routes
router.post("/create", auth, createReviewController);
router.get("/product/:productId", getProductReviewsController);
router.post("/helpful/:reviewId", auth, markReviewHelpfulController);
router.get("/user/reviews", auth, getUserReviewsController);

module.exports = router;