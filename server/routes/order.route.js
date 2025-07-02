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
} = require("../controllers/order.controller.js");

router.post("/cash-on-delivery", auth, CashOnDeliveryOrderController);
router.post("/checkout", auth, paymentController);
router.post("/webhook", webhookStripe);
router.get("/order-list", auth, getOrderDetailsController);

// ===== Admin: get all orders =====
router.get("/all-orders", auth, admin, getAllOrdersController);

module.exports = router;
