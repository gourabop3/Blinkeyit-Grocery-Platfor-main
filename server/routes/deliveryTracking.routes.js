const express = require("express");
const {
  getTrackingByOrderController,
  getLiveLocationController,
  getDeliveryTimelineController,
  reportDeliveryIssueController,
  submitDeliveryFeedbackController,
  verifyDeliveryOTPController,
  getAllActiveDeliveriesController,
  getDeliveryAnalyticsController,
  cancelDeliveryController,
} = require("../controllers/deliveryTracking.controller");
const auth = require("../middlewares/auth.middleware.js");

const deliveryTrackingRouter = express.Router();

// Customer/User routes
deliveryTrackingRouter.get("/order/:orderId", getTrackingByOrderController); // Get full tracking info (public)
deliveryTrackingRouter.get("/order/:orderId/location", getLiveLocationController); // Get live location (public)
deliveryTrackingRouter.get("/order/:orderId/timeline", getDeliveryTimelineController); // Get delivery timeline (public)

// Protected operations – require auth
deliveryTrackingRouter.post("/order/:orderId/issue", auth, reportDeliveryIssueController); // Report delivery issue
deliveryTrackingRouter.post("/order/:orderId/feedback", auth, submitDeliveryFeedbackController); // Submit feedback
deliveryTrackingRouter.post("/order/:orderId/verify-otp", auth, verifyDeliveryOTPController); // Verify delivery OTP
deliveryTrackingRouter.post("/order/:orderId/cancel", auth, cancelDeliveryController); // Cancel delivery

// Admin routes
deliveryTrackingRouter.get("/admin/active", auth, getAllActiveDeliveriesController); // Get all active deliveries
deliveryTrackingRouter.get("/admin/analytics", auth, getDeliveryAnalyticsController); // Get delivery analytics

module.exports = deliveryTrackingRouter;