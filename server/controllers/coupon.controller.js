const Coupon = require('../models/coupon.model');

/**
 * Admin: Create a new coupon
 * Body params:
 *  - code (string)
 *  - discountType ('percentage' | 'fixed')
 *  - discountValue (number)
 *  - minOrderValue (number, optional)
 *  - maxDiscount (number, optional)
 *  - expiresAt (Date ISO, optional)
 *  - usageLimit (number, optional)
 */
const createCouponController = async (req, res) => {
  try {
    const {
      code,
      discountType = 'percentage',
      discountValue,
      minOrderValue = 0,
      maxDiscount,
      expiresAt,
      usageLimit = 0,
    } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({
        message: 'code and discountValue are required',
        error: true,
        success: false,
      });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        message: 'Coupon code already exists',
        error: true,
        success: false,
      });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue) || 0,
      maxDiscount: maxDiscount !== undefined ? Number(maxDiscount) : undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      usageLimit: Number(usageLimit) || 0,
      createdBy: req.userId, // Provided by auth middleware
    });

    await coupon.save();

    return res.json({
      message: 'Coupon created successfully',
      data: coupon,
      error: false,
      success: true,
    });
  } catch (err) {
    console.error('createCoupon error:', err);
    return res.status(500).json({
      message: err.message || 'Server error',
      error: true,
      success: false,
    });
  }
};

/**
 * Validate / apply coupon for a given order total
 * Body params:
 *   - code (string)
 *   - orderTotal (number)
 * Returns discountAmount and newTotal
 */
const applyCouponController = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code || !orderTotal) {
      return res.status(400).json({
        message: 'code and orderTotal are required',
        error: true,
        success: false,
      });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) {
      return res.status(404).json({
        message: 'Invalid or inactive coupon code',
        error: true,
        success: false,
      });
    }

    // Check expiry
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({
        message: 'Coupon has expired',
        error: true,
        success: false,
      });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        message: 'Coupon usage limit reached',
        error: true,
        success: false,
      });
    }

    // Check min order value
    if (coupon.minOrderValue && orderTotal < coupon.minOrderValue) {
      return res.status(400).json({
        message: `Minimum order amount for this coupon is ${coupon.minOrderValue}`,
        error: true,
        success: false,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderTotal * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }

    const newTotal = orderTotal - discountAmount;

    return res.json({
      message: 'Coupon applied',
      data: {
        discountAmount,
        newTotal,
        couponId: coupon._id,
      },
      success: true,
      error: false,
    });
  } catch (err) {
    console.error('applyCoupon error:', err);
    return res.status(500).json({
      message: err.message || 'Server error',
      error: true,
      success: false,
    });
  }
};

/**
 * Admin: List coupons with pagination
 */
const listCouponsController = async (req, res) => {
  try {
    let { page = 1, limit = 10, search } = req.query;
    page = Number(page);
    limit = Number(limit);

    const query = search
      ? { code: { $regex: search, $options: 'i' } }
      : {};

    const skip = (page - 1) * limit;

    const [coupons, total] = await Promise.all([
      Coupon.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Coupon.countDocuments(query),
    ]);

    return res.json({
      message: 'Coupons list',
      data: coupons,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        page,
        limit,
      },
      success: true,
      error: false,
    });
  } catch (err) {
    console.error('listCoupons error:', err);
    return res.status(500).json({
      message: err.message || 'Server error',
      error: true,
      success: false,
    });
  }
};

/**
 * Admin: Update coupon
 */
const updateCouponController = async (req, res) => {
  try {
    const { couponId } = req.params;
    const payload = req.body;

    const coupon = await Coupon.findByIdAndUpdate(couponId, payload, {
      new: true,
    });

    if (!coupon) {
      return res.status(404).json({
        message: 'Coupon not found',
        error: true,
        success: false,
      });
    }

    return res.json({
      message: 'Coupon updated',
      data: coupon,
      success: true,
      error: false,
    });
  } catch (err) {
    console.error('updateCoupon error:', err);
    return res.status(500).json({
      message: err.message || 'Server error',
      error: true,
      success: false,
    });
  }
};

/**
 * Admin: Delete coupon
 */
const deleteCouponController = async (req, res) => {
  try {
    const { couponId } = req.params;

    const deleted = await Coupon.findByIdAndDelete(couponId);
    if (!deleted) {
      return res.status(404).json({
        message: 'Coupon not found',
        error: true,
        success: false,
      });
    }

    return res.json({
      message: 'Coupon deleted',
      success: true,
      error: false,
    });
  } catch (err) {
    console.error('deleteCoupon error:', err);
    return res.status(500).json({
      message: err.message || 'Server error',
      error: true,
      success: false,
    });
  }
};

module.exports = {
  createCouponController,
  applyCouponController,
  listCouponsController,
  updateCouponController,
  deleteCouponController,
};