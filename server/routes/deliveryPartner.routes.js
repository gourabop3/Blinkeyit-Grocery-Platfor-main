const express = require("express");
const {
  registerPartnerController,
  loginPartnerController,
  getPartnerProfileController,
  updatePartnerProfileController,
  updateLocationController,
  toggleAvailabilityController,
  getActiveOrdersController,
  acceptOrderController,
  updateDeliveryStatusController,
  completeDeliveryController,
  getPartnerEarningsController,
  getAllPartnersController,
  updatePartnerStatusController,
  autoAssignOrderController,
} = require("../controllers/deliveryPartner.controller");
const authToken = require("../middlewares/auth");

const deliveryPartnerRouter = express.Router();

// Public routes (no authentication required)
deliveryPartnerRouter.post("/register", registerPartnerController);
deliveryPartnerRouter.post("/login", loginPartnerController);

// Protected routes (authentication required)
deliveryPartnerRouter.use(authToken); // Apply auth middleware to all routes below

// Partner profile management
deliveryPartnerRouter.get("/profile", getPartnerProfileController);
deliveryPartnerRouter.put("/profile", updatePartnerProfileController);

// Location and availability
deliveryPartnerRouter.post("/location", updateLocationController);
deliveryPartnerRouter.post("/availability", toggleAvailabilityController);

// Order management
deliveryPartnerRouter.get("/orders/active", getActiveOrdersController);
deliveryPartnerRouter.post("/orders/accept", acceptOrderController);
deliveryPartnerRouter.post("/orders/status", updateDeliveryStatusController);
deliveryPartnerRouter.post("/orders/complete", completeDeliveryController);

// Earnings and analytics
deliveryPartnerRouter.get("/earnings", getPartnerEarningsController);

// Admin routes (additional authorization might be needed)
deliveryPartnerRouter.get("/admin/all", getAllPartnersController);
deliveryPartnerRouter.put("/admin/:partnerId/status", updatePartnerStatusController);
deliveryPartnerRouter.post("/admin/auto-assign", autoAssignOrderController);

module.exports = deliveryPartnerRouter;