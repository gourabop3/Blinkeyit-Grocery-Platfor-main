const express = require("express");
const {
  createCouponController,
  getAllCouponsController,
  getActiveCouponsController,
  validateCouponController,
  applyCouponController,
  getCouponByIdController,
  updateCouponController,
  deleteCouponController,
  toggleCouponStatusController,
  getCouponStatsController,
  generateBulkCouponsController,
} = require("../controllers/coupon.controller");
const authToken = require("../middlewares/auth.middleware");
const adminAuth = require("../middlewares/admin.middleware");

const couponRouter = express.Router();

// Public routes (no authentication required)
// Get active coupons for display (limited info)
couponRouter.get("/public/active", getActiveCouponsController);

// User routes (authentication required)
couponRouter.use(authToken); // Apply auth middleware to all routes below

// User coupon routes
couponRouter.get("/user/available", getActiveCouponsController);
couponRouter.post("/validate/:code", validateCouponController);
couponRouter.post("/apply", applyCouponController);

// Admin routes (authentication + admin role required)
couponRouter.use(adminAuth); // Apply admin middleware to all routes below

// Admin CRUD operations
couponRouter.post("/", createCouponController);
couponRouter.get("/", getAllCouponsController);
couponRouter.get("/:couponId", getCouponByIdController);
couponRouter.put("/:couponId", updateCouponController);
couponRouter.delete("/:couponId", deleteCouponController);

// Admin management operations
couponRouter.patch("/:couponId/toggle-status", toggleCouponStatusController);
couponRouter.get("/:couponId/stats", getCouponStatsController);
couponRouter.post("/bulk-generate", generateBulkCouponsController);

module.exports = couponRouter;