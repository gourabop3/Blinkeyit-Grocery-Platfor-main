const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware.js");
const admin = require("../middlewares/admin.middleware.js");
const {
  CashOnDeliveryOrderController,
  getOrderDetailsController,
  paymentController,
  webhookStripe,
  getAllOrdersController,
  updateOrderStatusController,
  clearCartController,
} = require("../controllers/order.controller.js");

router.post("/cash-on-delivery", auth, CashOnDeliveryOrderController);
router.post("/checkout", auth, paymentController);
router.post("/webhook", webhookStripe);
router.get("/order-list", auth, getOrderDetailsController);
router.post("/clear-cart", auth, clearCartController);

// Admin order management routes
router.get("/admin/all-orders", auth, admin, getAllOrdersController);
router.put("/admin/update-status/:orderId", auth, admin, updateOrderStatusController);

module.exports = router;
