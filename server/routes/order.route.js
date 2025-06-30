const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware.js");
const admin = require("../middlewares/admin.middleware.js");

const {
  CashOnDeliveryOrderController,
  getOrderDetailsController,
  getAllOrdersController, // ✅ Import new controller
  paymentController,
  webhookStripe,
} = require("../controllers/order.controller.js");

router.post("/cash-on-delivery", auth, CashOnDeliveryOrderController);
router.post("/checkout", auth, paymentController);
router.post("/webhook", webhookStripe);

// ✅ For normal user to see their own orders
router.get("/order-list", auth, getOrderDetailsController);

// ✅ For admin to see ALL orders
router.get("/admin/order-list", auth, admin, getAllOrdersController);

module.exports = router;