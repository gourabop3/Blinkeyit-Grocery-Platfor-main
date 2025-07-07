const CouponModel = require("../models/coupon.model");
const OrderModel = require("../models/order.model");
const UserModel = require("../models/user.model");

// Create a new coupon (Admin only)
const createCouponController = async (request, response) => {
  try {
    const {
      code,
      title,
      description,
      type,
      value,
      maxDiscountAmount,
      minOrderAmount,
      maxOrderAmount,
      usageLimit,
      validFrom,
      validUntil,
      applicableProducts,
      applicableCategories,
      applicableSubCategories,
      applicableUsers,
      excludedUsers,
      firstOrderOnly,
      mobileAppOnly,
      campaign
    } = request.body;

    const userId = request.userId;

    // Validate required fields
    if (!code || !title || !type || value === undefined) {
      return response.status(400).json({
        message: "Code, title, type, and value are required",
        error: true,
        success: false,
      });
    }

    // Validate value based on type
    if (type === "percentage" && (value < 0 || value > 100)) {
      return response.status(400).json({
        message: "Percentage discount must be between 0 and 100",
        error: true,
        success: false,
      });
    }

    // Validate dates
    const fromDate = new Date(validFrom);
    const untilDate = new Date(validUntil);
    
    if (untilDate <= fromDate) {
      return response.status(400).json({
        message: "Valid until date must be after valid from date",
        error: true,
        success: false,
      });
    }

    // Check if coupon code already exists
    const existingCoupon = await CouponModel.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return response.status(400).json({
        message: "Coupon code already exists",
        error: true,
        success: false,
      });
    }

    const coupon = new CouponModel({
      code: code.toUpperCase(),
      title,
      description,
      type,
      value,
      maxDiscountAmount: type === "percentage" ? maxDiscountAmount : null,
      minOrderAmount: minOrderAmount || 0,
      maxOrderAmount,
      usageLimit: {
        total: usageLimit?.total || null,
        perUser: usageLimit?.perUser || 1,
      },
      validFrom: fromDate,
      validUntil: untilDate,
      applicableProducts: applicableProducts || [],
      applicableCategories: applicableCategories || [],
      applicableSubCategories: applicableSubCategories || [],
      applicableUsers: applicableUsers || [],
      excludedUsers: excludedUsers || [],
      firstOrderOnly: firstOrderOnly || false,
      mobileAppOnly: mobileAppOnly || false,
      campaign,
      createdBy: userId,
    });

    await coupon.save();

    return response.status(201).json({
      message: "Coupon created successfully",
      error: false,
      success: true,
      data: coupon,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Get all coupons with pagination (Admin only)
const getAllCouponsController = async (request, response) => {
  try {
    const { page = 1, limit = 20, status, type, search } = request.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    
    if (status === "active") {
      const now = new Date();
      filter.isActive = true;
      filter.validFrom = { $lte: now };
      filter.validUntil = { $gte: now };
    } else if (status === "inactive") {
      filter.isActive = false;
    } else if (status === "expired") {
      filter.validUntil = { $lt: new Date() };
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
      ];
    }

    const totalCoupons = await CouponModel.countDocuments(filter);
    const coupons = await CouponModel.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return response.json({
      message: "Coupons retrieved successfully",
      error: false,
      success: true,
      data: {
        coupons,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCoupons / limit),
          totalCoupons,
          hasNext: page * limit < totalCoupons,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Get active coupons for users
const getActiveCouponsController = async (request, response) => {
  try {
    const userId = request.userId;
    
    const coupons = await CouponModel.getUserCoupons(userId);

    return response.json({
      message: "Active coupons retrieved successfully",
      error: false,
      success: true,
      data: coupons,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Validate coupon code
const validateCouponController = async (request, response) => {
  try {
    const { code } = request.params;
    const { orderAmount, products } = request.body;
    const userId = request.userId;

    const coupon = await CouponModel.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return response.status(404).json({
        message: "Invalid coupon code",
        error: true,
        success: false,
      });
    }

    // Get user's order count for first-time user validation
    const userOrderCount = await OrderModel.countDocuments({ userId });

    // Validate coupon
    const validation = coupon.validateForOrder(userId, orderAmount, userOrderCount, products);
    
    if (!validation.valid) {
      return response.status(400).json({
        message: validation.message,
        error: true,
        success: false,
      });
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(orderAmount, products);

    return response.json({
      message: "Coupon is valid",
      error: false,
      success: true,
      data: {
        coupon: {
          _id: coupon._id,
          code: coupon.code,
          title: coupon.title,
          description: coupon.description,
          type: coupon.type,
          value: coupon.value,
        },
        discountAmount,
        finalAmount: orderAmount - discountAmount,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Apply coupon to order
const applyCouponController = async (request, response) => {
  try {
    const { code, orderId } = request.body;
    const userId = request.userId;

    const coupon = await CouponModel.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return response.status(404).json({
        message: "Invalid coupon code",
        error: true,
        success: false,
      });
    }

    const order = await OrderModel.findById(orderId);
    if (!order || order.userId.toString() !== userId) {
      return response.status(404).json({
        message: "Order not found",
        error: true,
        success: false,
      });
    }

    // Validate coupon
    const userOrderCount = await OrderModel.countDocuments({ userId });
    const validation = coupon.validateForOrder(userId, order.totalAmt, userOrderCount);
    
    if (!validation.valid) {
      return response.status(400).json({
        message: validation.message,
        error: true,
        success: false,
      });
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(order.totalAmt);
    
    // Apply coupon to order
    await coupon.applyToOrder(userId, orderId, discountAmount);
    
    // Update order with coupon information
    order.appliedCoupon = {
      couponId: coupon._id,
      code: coupon.code,
      discountAmount,
    };
    order.totalAmt = order.totalAmt - discountAmount;
    await order.save();

    return response.json({
      message: "Coupon applied successfully",
      error: false,
      success: true,
      data: {
        discountAmount,
        newTotal: order.totalAmt,
        coupon: {
          code: coupon.code,
          title: coupon.title,
        },
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Get coupon by ID (Admin only)
const getCouponByIdController = async (request, response) => {
  try {
    const { couponId } = request.params;

    const coupon = await CouponModel.findById(couponId)
      .populate("createdBy", "name email")
      .populate("applicableProducts", "name")
      .populate("applicableCategories", "name")
      .populate("applicableSubCategories", "name")
      .populate("usageHistory.userId", "name email")
      .populate("usageHistory.orderId", "orderId totalAmt");

    if (!coupon) {
      return response.status(404).json({
        message: "Coupon not found",
        error: true,
        success: false,
      });
    }

    return response.json({
      message: "Coupon retrieved successfully",
      error: false,
      success: true,
      data: coupon,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Update coupon (Admin only)
const updateCouponController = async (request, response) => {
  try {
    const { couponId } = request.params;
    const updateData = request.body;

    // Remove fields that shouldn't be updated
    delete updateData.usageCount;
    delete updateData.usageHistory;
    delete updateData.createdBy;

    // Validate dates if provided
    if (updateData.validFrom && updateData.validUntil) {
      const fromDate = new Date(updateData.validFrom);
      const untilDate = new Date(updateData.validUntil);
      
      if (untilDate <= fromDate) {
        return response.status(400).json({
          message: "Valid until date must be after valid from date",
          error: true,
          success: false,
        });
      }
    }

    const coupon = await CouponModel.findByIdAndUpdate(
      couponId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return response.status(404).json({
        message: "Coupon not found",
        error: true,
        success: false,
      });
    }

    return response.json({
      message: "Coupon updated successfully",
      error: false,
      success: true,
      data: coupon,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Delete coupon (Admin only)
const deleteCouponController = async (request, response) => {
  try {
    const { couponId } = request.params;

    const coupon = await CouponModel.findByIdAndDelete(couponId);

    if (!coupon) {
      return response.status(404).json({
        message: "Coupon not found",
        error: true,
        success: false,
      });
    }

    return response.json({
      message: "Coupon deleted successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Toggle coupon status (Admin only)
const toggleCouponStatusController = async (request, response) => {
  try {
    const { couponId } = request.params;

    const coupon = await CouponModel.findById(couponId);
    if (!coupon) {
      return response.status(404).json({
        message: "Coupon not found",
        error: true,
        success: false,
      });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return response.json({
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
      error: false,
      success: true,
      data: coupon,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Get coupon usage statistics (Admin only)
const getCouponStatsController = async (request, response) => {
  try {
    const { couponId } = request.params;

    const coupon = await CouponModel.findById(couponId)
      .populate("usageHistory.userId", "name email")
      .populate("usageHistory.orderId", "orderId totalAmt createdAt");

    if (!coupon) {
      return response.status(404).json({
        message: "Coupon not found",
        error: true,
        success: false,
      });
    }

    // Calculate statistics
    const totalDiscount = coupon.usageHistory.reduce((sum, usage) => sum + usage.discountAmount, 0);
    const uniqueUsers = [...new Set(coupon.usageHistory.map(usage => usage.userId._id.toString()))].length;
    
    const stats = {
      totalUsage: coupon.usageCount,
      totalDiscount,
      uniqueUsers,
      averageDiscount: coupon.usageCount > 0 ? totalDiscount / coupon.usageCount : 0,
      remainingUsage: coupon.usageLimit.total ? coupon.usageLimit.total - coupon.usageCount : "Unlimited",
      conversionRate: 0, // Would need to track coupon views to calculate this
    };

    return response.json({
      message: "Coupon statistics retrieved successfully",
      error: false,
      success: true,
      data: {
        coupon,
        statistics: stats,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Generate bulk coupons (Admin only)
const generateBulkCouponsController = async (request, response) => {
  try {
    const {
      baseCode,
      count,
      type,
      value,
      maxDiscountAmount,
      minOrderAmount,
      usageLimit,
      validFrom,
      validUntil,
      title,
      description
    } = request.body;

    const userId = request.userId;

    if (!baseCode || !count || !type || value === undefined) {
      return response.status(400).json({
        message: "Base code, count, type, and value are required",
        error: true,
        success: false,
      });
    }

    if (count > 1000) {
      return response.status(400).json({
        message: "Cannot generate more than 1000 coupons at once",
        error: true,
        success: false,
      });
    }

    const coupons = [];
    const fromDate = new Date(validFrom);
    const untilDate = new Date(validUntil);

    for (let i = 1; i <= count; i++) {
      const couponCode = `${baseCode}${i.toString().padStart(3, '0')}`;
      
      // Check if code already exists
      const existingCoupon = await CouponModel.findOne({ code: couponCode });
      if (!existingCoupon) {
        const coupon = new CouponModel({
          code: couponCode,
          title: title || `${baseCode} Coupon ${i}`,
          description: description || `Auto-generated coupon ${i}`,
          type,
          value,
          maxDiscountAmount: type === "percentage" ? maxDiscountAmount : null,
          minOrderAmount: minOrderAmount || 0,
          usageLimit: {
            total: usageLimit?.total || 1,
            perUser: usageLimit?.perUser || 1,
          },
          validFrom: fromDate,
          validUntil: untilDate,
          isAutoGenerated: true,
          createdBy: userId,
        });
        
        coupons.push(coupon);
      }
    }

    // Save all coupons
    await CouponModel.insertMany(coupons);

    return response.status(201).json({
      message: `${coupons.length} coupons generated successfully`,
      error: false,
      success: true,
      data: {
        generated: coupons.length,
        skipped: count - coupons.length,
        coupons: coupons.map(c => ({ code: c.code, _id: c._id })),
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

module.exports = {
  createCouponController,
  getAllCouponsController,
  getActiveCouponsController,
  validateCouponController,
  applyCouponController,
  getCouponByIdController,
  updateCouponController,
  deleteCouponController,
  toggleCouponStatusController,
  getCouponStatsController,
  generateBulkCouponsController,
};