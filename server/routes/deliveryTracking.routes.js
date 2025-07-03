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
const authToken = require("../middlewares/auth");

const deliveryTrackingRouter = express.Router();

// Apply authentication middleware to all routes
deliveryTrackingRouter.use(authToken);

// Customer/User routes
deliveryTrackingRouter.get("/order/:orderId", getTrackingByOrderController); // Get full tracking info
deliveryTrackingRouter.get("/order/:orderId/location", getLiveLocationController); // Get live location
deliveryTrackingRouter.get("/order/:orderId/timeline", getDeliveryTimelineController); // Get delivery timeline
deliveryTrackingRouter.post("/order/:orderId/issue", reportDeliveryIssueController); // Report delivery issue
deliveryTrackingRouter.post("/order/:orderId/feedback", submitDeliveryFeedbackController); // Submit feedback
deliveryTrackingRouter.post("/order/:orderId/verify-otp", verifyDeliveryOTPController); // Verify delivery OTP
deliveryTrackingRouter.post("/order/:orderId/cancel", cancelDeliveryController); // Cancel delivery

// Admin routes
deliveryTrackingRouter.get("/admin/active", getAllActiveDeliveriesController); // Get all active deliveries
deliveryTrackingRouter.get("/admin/analytics", getDeliveryAnalyticsController); // Get delivery analytics

module.exports = deliveryTrackingRouter;