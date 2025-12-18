const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware.js");
const admin = require("../middlewares/admin.middleware.js");
const rechargeProductController = require("../controllers/rechargeProduct.controller.js");

// Public routes
router.post("/get", rechargeProductController.getRechargeProductController);
router.get("/details/:id", rechargeProductController.getRechargeProductDetails);
router.post("/by-category", rechargeProductController.getRechargeProductByCategory);
router.post("/search", rechargeProductController.searchRechargeProduct);

// Admin routes (require authentication and admin role)
router.post("/create", auth, admin, rechargeProductController.createRechargeProductController);
router.put("/update", auth, admin, rechargeProductController.updateRechargeProductDetails);
router.delete("/delete", auth, admin, rechargeProductController.deleteRechargeProductDetails);

module.exports = router;

