const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const DeliveryPartnerModel = require("../models/deliveryPartner.model");
const DeliveryTrackingModel = require("../models/deliveryTracking.model");
const OrderModel = require("../models/order.model");
const { emitToOrder, emitToPartner, emitToAllPartners } = require("../config/socket");
const geolib = require("geolib");

// Partner Registration
const registerPartnerController = async (request, response) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      vehicleType,
      plateNumber,
      serviceAreas,
      emergencyContact,
    } = request.body;

    // Check if partner already exists
    const existingPartner = await DeliveryPartnerModel.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingPartner) {
      return response.status(400).json({
        message: "Partner already exists with this email or mobile",
        error: true,
        success: false,
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newPartner = new DeliveryPartnerModel({
      name,
      email,
      mobile,
      password: hashPassword,
      vehicleDetails: {
        type: vehicleType,
        plateNumber: plateNumber.toUpperCase(),
      },
      serviceAreas: serviceAreas || [],
      emergencyContact,
    });

    const savedPartner = await newPartner.save();

    return response.status(201).json({
      message: "Partner registered successfully. Pending verification.",
      error: false,
      success: true,
      data: {
        id: savedPartner._id,
        name: savedPartner.name,
        email: savedPartner.email,
        status: savedPartner.status,
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

// Partner Login
const loginPartnerController = async (request, response) => {
  try {
    const { email, password } = request.body;

    const partner = await DeliveryPartnerModel.findOne({ email });

    if (!partner) {
      return response.status(400).json({
        message: "Partner not found",
        error: true,
        success: false,
      });
    }

    if (partner.status !== "approved") {
      return response.status(403).json({
        message: `Account ${partner.status}. Please contact admin.`,
        error: true,
        success: false,
      });
    }

    const checkPassword = await bcrypt.compare(password, partner.password);

    if (!checkPassword) {
      return response.status(400).json({
        message: "Invalid password",
        error: true,
        success: false,
      });
    }

    const tokenData = {
      id: partner._id,
      email: partner.email,
      userType: "partner",
    };

    const token = jwt.sign(tokenData, process.env.SECRET_KEY_JWT, {
      expiresIn: "8h",
    });

    // Update last seen
    partner.availability.lastSeen = new Date();
    await partner.save();

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    };

    return response.cookie("token", token, cookieOptions).json({
      message: "Login successful",
      error: false,
      success: true,
      data: {
        token,
        partner: {
          id: partner._id,
          name: partner.name,
          email: partner.email,
          mobile: partner.mobile,
          vehicleDetails: partner.vehicleDetails,
          availability: partner.availability,
          statistics: partner.statistics,
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

// Get Partner Profile
const getPartnerProfileController = async (request, response) => {
  try {
    const partnerId = request.userId; // from auth middleware

    const partner = await DeliveryPartnerModel.findById(partnerId).select(
      "-password"
    );

    if (!partner) {
      return response.status(404).json({
        message: "Partner not found",
        error: true,
        success: false,
      });
    }

    return response.json({
      message: "Partner profile",
      error: false,
      success: true,
      data: partner,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Update Partner Profile
const updatePartnerProfileController = async (request, response) => {
  try {
    const partnerId = request.userId;
    const updateData = { ...request.body };

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.password;
    delete updateData.status;
    delete updateData.statistics;
    delete updateData.socketId;

    const updatedPartner = await DeliveryPartnerModel.findByIdAndUpdate(
      partnerId,
      updateData,
      { new: true }
    ).select("-password");

    return response.json({
      message: "Profile updated successfully",
      error: false,
      success: true,
      data: updatedPartner,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Update Partner Location
const updateLocationController = async (request, response) => {
  try {
    const partnerId = request.userId;
    const { latitude, longitude, address } = request.body;

    const partner = await DeliveryPartnerModel.findById(partnerId);
    if (!partner) {
      return response.status(404).json({
        message: "Partner not found",
        error: true,
        success: false,
      });
    }

    await partner.updateLocation(latitude, longitude, address);

    return response.json({
      message: "Location updated successfully",
      error: false,
      success: true,
      data: {
        currentLocation: partner.currentLocation,
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

// Toggle Partner Availability
const toggleAvailabilityController = async (request, response) => {
  try {
    const partnerId = request.userId;
    const { isOnline, isOnDuty } = request.body;

    const partner = await DeliveryPartnerModel.findById(partnerId);
    if (!partner) {
      return response.status(404).json({
        message: "Partner not found",
        error: true,
        success: false,
      });
    }

    partner.availability.isOnline = isOnline !== undefined ? isOnline : partner.availability.isOnline;
    partner.availability.isOnDuty = isOnDuty !== undefined ? isOnDuty : partner.availability.isOnDuty;
    partner.availability.lastSeen = new Date();

    await partner.save();

    return response.json({
      message: "Availability updated successfully",
      error: false,
      success: true,
      data: {
        availability: partner.availability,
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

// Get Partner's Active Orders
const getActiveOrdersController = async (request, response) => {
  try {
    const partnerId = request.userId;

    const activeDeliveries = await DeliveryTrackingModel.getActiveDeliveries(partnerId);

    return response.json({
      message: "Active orders retrieved",
      error: false,
      success: true,
      data: activeDeliveries,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Accept Order Assignment
const acceptOrderController = async (request, response) => {
  try {
    const partnerId = request.userId;
    const { orderId } = request.body;

    const partner = await DeliveryPartnerModel.findById(partnerId);
    if (!partner || !partner.availability.isOnDuty) {
      return response.status(400).json({
        message: "Partner not available for delivery",
        error: true,
        success: false,
      });
    }

    const order = await OrderModel.findById(orderId).populate("delivery_address");
    if (!order) {
      return response.status(404).json({
        message: "Order not found",
        error: true,
        success: false,
      });
    }

    // Create delivery tracking
    const tracking = new DeliveryTrackingModel({
      orderId: order._id,
      deliveryPartnerId: partnerId,
      storeLocation: order.storeLocation,
      customerLocation: {
        latitude: order.delivery_address.coordinates?.[1] || 0,
        longitude: order.delivery_address.coordinates?.[0] || 0,
        address: `${order.delivery_address.address_line}, ${order.delivery_address.city}, ${order.delivery_address.pincode}`,
      },
      deliveryDetails: {
        deliveryInstructions: order.deliveryInstructions || "",
        contactlessDelivery: order.contactlessDelivery || false,
      },
    });

    // Calculate estimated delivery time (30-45 minutes from now)
    const estimatedTime = new Date();
    estimatedTime.setMinutes(estimatedTime.getMinutes() + 35);
    tracking.metrics.estimatedDeliveryTime = estimatedTime;

    await tracking.save();

    // Update order status
    order.assignedDeliveryPartner = partnerId;
    order.order_status = "Assigned";
    order.estimatedDeliveryTime = estimatedTime;
    await order.save();

    // Update partner status
    partner.availability.isOnDuty = false; // Partner is now busy
    partner.lastActiveOrder = orderId;
    await partner.save();

    // Emit real-time update
    emitToOrder(orderId, "order_assigned", {
      partner: {
        name: partner.name,
        mobile: partner.mobile,
        vehicleDetails: partner.vehicleDetails,
        currentLocation: partner.currentLocation,
      },
      estimatedDeliveryTime: estimatedTime,
    });

    return response.json({
      message: "Order accepted successfully",
      error: false,
      success: true,
      data: {
        tracking: tracking._id,
        estimatedDeliveryTime: estimatedTime,
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

// Update Delivery Status
const updateDeliveryStatusController = async (request, response) => {
  try {
    const partnerId = request.userId;
    const { orderId, status, notes, location, imageProof } = request.body;

    const tracking = await DeliveryTrackingModel.findOne({
      orderId,
      deliveryPartnerId: partnerId,
    });

    if (!tracking) {
      return response.status(404).json({
        message: "Delivery tracking not found",
        error: true,
        success: false,
      });
    }

    await tracking.updateStatus(status, location, notes, imageProof);

    // Update order status
    let orderStatus = "Processing";
    switch (status) {
      case "assigned": orderStatus = "Assigned"; break;
      case "pickup_started": orderStatus = "Preparing"; break;
      case "picked_up": orderStatus = "Picked_up"; break;
      case "in_transit": orderStatus = "In_transit"; break;
      case "delivered": orderStatus = "Delivered"; break;
      case "failed": orderStatus = "Failed"; break;
      case "cancelled": orderStatus = "Cancelled"; break;
    }

    await OrderModel.findByIdAndUpdate(orderId, { order_status: orderStatus });

    // If delivery is completed, update partner availability
    if (["delivered", "failed", "cancelled"].includes(status)) {
      const partner = await DeliveryPartnerModel.findById(partnerId);
      partner.availability.isOnDuty = true; // Available for new orders
      partner.lastActiveOrder = null;
      
      if (status === "delivered") {
        partner.statistics.totalDeliveries += 1;
        partner.statistics.successfulDeliveries += 1;
      }
      
      await partner.save();
    }

    // Emit real-time update
    emitToOrder(orderId, "delivery_status_update", {
      orderId,
      status,
      timestamp: new Date(),
      notes,
      location,
    });

    return response.json({
      message: "Delivery status updated successfully",
      error: false,
      success: true,
      data: tracking,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Complete Delivery
const completeDeliveryController = async (request, response) => {
  try {
    const partnerId = request.userId;
    const { orderId, deliveryProof, otp } = request.body;

    const tracking = await DeliveryTrackingModel.findOne({
      orderId,
      deliveryPartnerId: partnerId,
    });

    if (!tracking) {
      return response.status(404).json({
        message: "Delivery tracking not found",
        error: true,
        success: false,
      });
    }

    const order = await OrderModel.findById(orderId);
    
    // Verify OTP if required
    if (order.deliveryOTP && order.deliveryOTP.code) {
      if (!otp || order.deliveryOTP.code !== otp) {
        return response.status(400).json({
          message: "Invalid OTP",
          error: true,
          success: false,
        });
      }
      
      if (new Date() > order.deliveryOTP.expiresAt) {
        return response.status(400).json({
          message: "OTP expired",
          error: true,
          success: false,
        });
      }
      
      order.deliveryOTP.verified = true;
    }

    await tracking.completeDelivery(null, deliveryProof);

    // Update order
    order.order_status = "Delivered";
    order.actualDeliveryTime = new Date();
    await order.save();

    // Update partner statistics
    const partner = await DeliveryPartnerModel.findById(partnerId);
    partner.availability.isOnDuty = true;
    partner.lastActiveOrder = null;
    partner.statistics.totalDeliveries += 1;
    partner.statistics.successfulDeliveries += 1;
    await partner.save();

    // Emit completion event
    emitToOrder(orderId, "delivery_completed", {
      orderId,
      completedAt: new Date(),
      deliveryProof,
    });

    return response.json({
      message: "Delivery completed successfully",
      error: false,
      success: true,
      data: tracking,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Get Partner Earnings
const getPartnerEarningsController = async (request, response) => {
  try {
    const partnerId = request.userId;
    const { startDate, endDate } = request.query;

    const partner = await DeliveryPartnerModel.findById(partnerId);
    
    // Get completed deliveries for the period
    const matchQuery = {
      deliveryPartnerId: partnerId,
      status: "delivered",
    };

    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const deliveries = await DeliveryTrackingModel.find(matchQuery)
      .populate("orderId", "totalAmt deliveryCharges createdAt");

    let totalEarnings = 0;
    const deliveryDetails = deliveries.map(delivery => {
      const commission = delivery.orderId.deliveryCharges.total || 0;
      totalEarnings += commission;
      
      return {
        orderId: delivery.orderId._id,
        orderTotal: delivery.orderId.totalAmt,
        commission,
        deliveredAt: delivery.metrics.actualDeliveryTime,
        duration: delivery.metrics.totalDurationMinutes,
        distance: delivery.metrics.totalDistanceKm,
      };
    });

    return response.json({
      message: "Earnings retrieved successfully",
      error: false,
      success: true,
      data: {
        totalEarnings,
        totalDeliveries: deliveries.length,
        currentMonthEarnings: partner.statistics.currentMonthEarnings,
        deliveryDetails,
        statistics: partner.statistics,
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

// Admin: Get All Partners
const getAllPartnersController = async (request, response) => {
  try {
    const { page = 1, limit = 10, status, search } = request.query;
    
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }
    
    const skip = (page - 1) * limit;
    const totalPartners = await DeliveryPartnerModel.countDocuments(filter);
    
    const partners = await DeliveryPartnerModel.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    return response.json({
      message: "Partners retrieved successfully",
      error: false,
      success: true,
      data: {
        partners,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPartners / limit),
          totalPartners,
          hasNext: page * limit < totalPartners,
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

// Admin: Update Partner Status
const updatePartnerStatusController = async (request, response) => {
  try {
    const { partnerId } = request.params;
    const { status } = request.body;

    const partner = await DeliveryPartnerModel.findByIdAndUpdate(
      partnerId,
      { status },
      { new: true }
    ).select("-password");

    if (!partner) {
      return response.status(404).json({
        message: "Partner not found",
        error: true,
        success: false,
      });
    }

    // Notify partner about status change
    emitToPartner(partnerId, "status_updated", { status });

    return response.json({
      message: "Partner status updated successfully",
      error: false,
      success: true,
      data: partner,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Auto-assign order to nearest available partner
const autoAssignOrderController = async (request, response) => {
  try {
    const { orderId } = request.body;
    
    const order = await OrderModel.findById(orderId).populate("delivery_address");
    if (!order) {
      return response.status(404).json({
        message: "Order not found",
        error: true,
        success: false,
      });
    }

    // Get customer location
    const customerLat = order.delivery_address.coordinates?.[1] || 0;
    const customerLng = order.delivery_address.coordinates?.[0] || 0;

    // Find nearby available partners
    const nearbyPartners = await DeliveryPartnerModel.findNearbyPartners(
      customerLat,
      customerLng,
      10 // 10km radius
    );

    if (nearbyPartners.length === 0) {
      return response.status(400).json({
        message: "No delivery partners available in the area",
        error: true,
        success: false,
      });
    }

    // Select the best partner (highest rating, closest distance)
    const selectedPartner = nearbyPartners[0];

    // Generate OTP for secure delivery
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 30);

    // Update order with partner assignment
    order.assignedDeliveryPartner = selectedPartner._id;
    order.order_status = "Assigned";
    order.deliveryOTP = {
      code: otp,
      expiresAt: otpExpiry,
      verified: false,
    };

    // Calculate estimated delivery time
    const estimatedTime = new Date();
    estimatedTime.setMinutes(estimatedTime.getMinutes() + 35);
    order.estimatedDeliveryTime = estimatedTime;

    await order.save();

    // Create delivery tracking
    const tracking = new DeliveryTrackingModel({
      orderId: order._id,
      deliveryPartnerId: selectedPartner._id,
      storeLocation: order.storeLocation,
      customerLocation: {
        latitude: customerLat,
        longitude: customerLng,
        address: `${order.delivery_address.address_line}, ${order.delivery_address.city}`,
      },
      metrics: {
        estimatedDeliveryTime: estimatedTime,
      },
      deliveryDetails: {
        deliveryInstructions: order.deliveryInstructions || "",
        contactlessDelivery: order.contactlessDelivery || false,
        otp: otp,
      },
    });

    await tracking.save();

    // Update partner status
    selectedPartner.availability.isOnDuty = false;
    selectedPartner.lastActiveOrder = orderId;
    await selectedPartner.save();

    // Notify partner about new assignment
    emitToPartner(selectedPartner._id, "new_order_assigned", {
      orderId: order._id,
      orderDetails: order,
      estimatedDeliveryTime: estimatedTime,
      otp: otp,
    });

    // Notify customer about assignment
    emitToOrder(orderId, "order_assigned", {
      partner: {
        name: selectedPartner.name,
        mobile: selectedPartner.mobile,
        vehicleDetails: selectedPartner.vehicleDetails,
        rating: selectedPartner.statistics.avgRating,
      },
      estimatedDeliveryTime: estimatedTime,
      otp: otp,
    });

    return response.json({
      message: "Order assigned successfully",
      error: false,
      success: true,
      data: {
        partner: {
          id: selectedPartner._id,
          name: selectedPartner.name,
          mobile: selectedPartner.mobile,
          vehicleDetails: selectedPartner.vehicleDetails,
        },
        estimatedDeliveryTime: estimatedTime,
        trackingId: tracking._id,
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
};