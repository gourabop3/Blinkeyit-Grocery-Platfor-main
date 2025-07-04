const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.middleware.js');
const admin = require('../middlewares/admin.middleware.js');

const {
  createCouponController,
  applyCouponController,
  listCouponsController,
  updateCouponController,
  deleteCouponController,
} = require('../controllers/coupon.controller.js');

// Admin routes
router.post('/admin/create', auth, admin, createCouponController);
router.get('/admin/list', auth, admin, listCouponsController);
router.put('/admin/:couponId', auth, admin, updateCouponController);
router.delete('/admin/:couponId', auth, admin, deleteCouponController);

// Public (requires auth) route to apply coupon
router.post('/apply', auth, applyCouponController);

module.exports = router;