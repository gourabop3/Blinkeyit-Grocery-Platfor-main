const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware.js");
const admin = require("../middlewares/admin.middleware.js");
const {
  CashOnDeliveryOrderController,
  getOrderDetailsController,
  paymentController,
  webhookStripe,
  getAllOrdersForAdmin,
  getDashboardStats,
  updateOrderStatus,
} = require("../controllers/order.controller.js");

router.post("/cash-on-delivery", auth, CashOnDeliveryOrderController);
router.post("/checkout", auth, paymentController);
router.post("/webhook", webhookStripe);
router.get("/order-list", auth, getOrderDetailsController);

// Admin routes
router.post("/admin/get-all-orders", auth, admin, getAllOrdersForAdmin);
router.get("/admin/dashboard-stats", auth, admin, getDashboardStats);
router.put("/admin/update-status", auth, admin, updateOrderStatus);

module.exports = router;
