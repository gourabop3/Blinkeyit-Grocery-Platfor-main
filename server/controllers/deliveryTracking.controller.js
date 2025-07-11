const DeliveryTrackingModel = require("../models/deliveryTracking.model");
const OrderModel = require("../models/order.model");
const DeliveryPartnerModel = require("../models/deliveryPartner.model");
const { emitToOrder, emitToUser } = require("../config/socket");

// Get delivery tracking for an order
const getTrackingByOrderController = async (request, response) => {
  try {
    const { orderId } = request.params;
    const userId = request.userId; // This may be undefined for public access

    console.log('🔍 Delivery Tracking Request:', { orderId, userId: userId || 'public' });

    // First, find the order by orderId (user-facing) or _id (MongoDB ObjectId)
    let order;
    
    // Try to find by MongoDB ObjectId first
    if (orderId.match(/^[0-9a-fA-F]{24}$/)) {
      order = await OrderModel.findById(orderId)
        .populate("delivery_address")
        .populate("assignedDeliveryPartner", "name mobile vehicleDetails currentLocation statistics");
      console.log('📄 Found order by ObjectId:', order ? order.orderId : 'not found');
    }
    
    // If not found, try to find by user-facing orderId
    if (!order) {
      order = await OrderModel.findOne({ orderId: orderId })
        .populate("delivery_address")
        .populate("assignedDeliveryPartner", "name mobile vehicleDetails currentLocation statistics");
      console.log('📄 Found order by orderId field:', order ? order.orderId : 'not found');
    }
    
    if (!order) {
      console.log('❌ Order not found for:', orderId);
      return response.status(404).json({
        message: "Order not found",
        error: true,
        success: false,
      });
    }

    console.log('✅ Order found:', { 
      _id: order._id, 
      orderId: order.orderId, 
      status: order.order_status,
      assignedPartner: !!order.assignedDeliveryPartner 
    });

    // Verify user owns this order or is admin (only if user is logged in)
    if (userId) {
      if (order.userId.toString() !== userId && request.userRole !== 'admin') {
        console.log('🚫 Unauthorized access attempt:', { orderUserId: order.userId, requestUserId: userId });
        return response.status(403).json({
          message: "Unauthorized access to order tracking",
          error: true,
          success: false,
        });
      }
    }

    // Look for existing tracking record using the MongoDB _id
    let tracking = await DeliveryTrackingModel.findOne({ orderId: order._id })
      .populate("deliveryPartnerId", "name mobile vehicleDetails currentLocation statistics")
      .populate("orderId", "orderId totalAmt estimatedDeliveryTime deliveryOTP");

    console.log('📦 Existing tracking found:', !!tracking);

    // If no tracking record exists, create a basic one or return order-based tracking
    if (!tracking) {
      // Check if order has delivery partner assigned
      if (order.assignedDeliveryPartner) {
        console.log('🚚 Creating new tracking record for assigned order');
        // Create basic tracking record for assigned orders
        tracking = new DeliveryTrackingModel({
          orderId: order._id,
          deliveryPartnerId: order.assignedDeliveryPartner._id,
          status: "assigned",
          customerLocation: {
            latitude: order.delivery_address?.latitude || 28.6139,
            longitude: order.delivery_address?.longitude || 77.2090,
            address: order.delivery_address?.address_line || "Customer Address",
          },
          storeLocation: order.storeLocation || {
            latitude: 28.6139,
            longitude: 77.2090,
            address: "Store Location"
          },
          timeline: [{
            status: "assigned",
            timestamp: order.orderTracking?.assignmentTime || new Date(),
            notes: "Delivery partner assigned"
          }],
          metrics: {
            estimatedDeliveryTime: order.estimatedDeliveryTime || (order.getEstimatedDeliveryTime ? order.getEstimatedDeliveryTime() : new Date(Date.now() + 45 * 60000))
          }
        });
        await tracking.save();
        
        // Populate the tracking after saving
        tracking = await DeliveryTrackingModel.findById(tracking._id)
          .populate("deliveryPartnerId", "name mobile vehicleDetails currentLocation statistics")
          .populate("orderId", "orderId totalAmt estimatedDeliveryTime deliveryOTP");
        
        console.log('✅ New tracking record created:', tracking._id);
      } else {
        console.log('📋 Returning order-based tracking for unassigned order');
        // Return order-based tracking for unassigned orders
        return response.json({
          message: "Order tracking retrieved (no delivery partner assigned yet)",
          error: false,
          success: true,
          data: {
            orderId: order,
            deliveryPartnerId: null,
            status: order.order_status.toLowerCase().replace(/_/g, '_'),
            timeline: [
              {
                status: "processing",
                timestamp: order.createdAt,
                notes: "Order placed successfully"
              },
              ...(order.order_status !== "Processing" ? [{
                status: order.order_status.toLowerCase(),
                timestamp: order.updatedAt,
                notes: `Order status: ${order.order_status}`
              }] : [])
            ],
            customerLocation: {
              latitude: order.delivery_address?.latitude || 28.6139,
              longitude: order.delivery_address?.longitude || 77.2090,
              address: order.delivery_address?.address_line || "Customer Address",
            },
            storeLocation: order.storeLocation || {
              latitude: 28.6139,
              longitude: 77.2090,
              address: "Store Location"
            },
            metrics: {
              estimatedDeliveryTime: order.estimatedDeliveryTime || (order.getEstimatedDeliveryTime ? order.getEstimatedDeliveryTime() : new Date(Date.now() + 45 * 60000))
            },
            liveUpdates: {
              message: "Order is being prepared. Delivery partner will be assigned soon."
            }
          },
        });
      }
    }

    // Calculate live distance and ETA if partner location is available
    let liveUpdates = {};
    if (tracking.deliveryPartnerId && tracking.deliveryPartnerId.currentLocation) {
      const partnerLoc = tracking.deliveryPartnerId.currentLocation;
      const customerLoc = tracking.customerLocation;
      
      if (partnerLoc.latitude && partnerLoc.longitude) {
        // Calculate distance using Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = (customerLoc.latitude - partnerLoc.latitude) * Math.PI / 180;
        const dLon = (customerLoc.longitude - partnerLoc.longitude) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(partnerLoc.latitude * Math.PI / 180) * Math.cos(customerLoc.latitude * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distanceKm = R * c;
        
        // Estimate arrival time (assuming average speed of 25 km/h in city)
        const estimatedMinutes = Math.round((distanceKm / 25) * 60);
        const estimatedArrival = new Date();
        estimatedArrival.setMinutes(estimatedArrival.getMinutes() + estimatedMinutes);
        
        liveUpdates = {
          distanceToCustomer: Math.round(distanceKm * 100) / 100, // Round to 2 decimal places
          estimatedArrival,
          partnerLocation: {
            latitude: partnerLoc.latitude,
            longitude: partnerLoc.longitude,
            lastUpdated: partnerLoc.lastUpdated,
          },
        };
      }
    }

    console.log('🎯 Sending tracking response with status:', tracking.status);

    return response.json({
      message: "Delivery tracking retrieved successfully",
      error: false,
      success: true,
      data: {
        ...tracking.toObject(),
        liveUpdates,
      },
    });
  } catch (error) {
    console.error('❌ Delivery tracking error:', error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Get live location updates for tracking
const getLiveLocationController = async (request, response) => {
  try {
    const { orderId } = request.params;
    const userId = request.userId;

    if(userId) {
      const order = await OrderModel.findById(orderId);
      if (!order || order.userId.toString() !== userId) {
        return response.status(403).json({
          message: "Unauthorized access",
          error: true,
          success: false,
        });
      }
    }

    const tracking = await DeliveryTrackingModel.findOne({ orderId })
      .populate("deliveryPartnerId", "currentLocation");

    if (!tracking) {
      return response.status(404).json({
        message: "Delivery tracking not found",
        error: true,
        success: false,
      });
    }

    // Get recent route points (last 10 points)
    const recentRoute = tracking.route.slice(-10);
    
    return response.json({
      message: "Live location retrieved",
      error: false,
      success: true,
      data: {
        currentLocation: tracking.lastLocationUpdate,
        recentRoute,
        status: tracking.status,
        partnerLocation: tracking.deliveryPartnerId?.currentLocation,
        customerLocation: tracking.customerLocation,
        storeLocation: tracking.storeLocation,
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

// Get delivery timeline/history
const getDeliveryTimelineController = async (request, response) => {
  try {
    const { orderId } = request.params;
    const userId = request.userId;

    // Verify access
    const order = await OrderModel.findById(orderId);
    if (!order || (order.userId.toString() !== userId && request.userRole !== 'admin')) {
      return response.status(403).json({
        message: "Unauthorized access",
        error: true,
        success: false,
      });
    }

    const tracking = await DeliveryTrackingModel.findOne({ orderId })
      .select("timeline status metrics deliveryDetails.customerFeedback")
      .populate("deliveryPartnerId", "name mobile");

    if (!tracking) {
      return response.status(404).json({
        message: "Delivery tracking not found",
        error: true,
        success: false,
      });
    }

    return response.json({
      message: "Delivery timeline retrieved",
      error: false,
      success: true,
      data: {
        timeline: tracking.timeline,
        status: tracking.status,
        metrics: tracking.metrics,
        feedback: tracking.deliveryDetails.customerFeedback,
        partner: tracking.deliveryPartnerId,
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

// Report delivery issue (customer)
const reportDeliveryIssueController = async (request, response) => {
  try {
    const { orderId } = request.params;
    const { issueType, description } = request.body;
    const userId = request.userId;

    // Verify user owns this order
    const order = await OrderModel.findById(orderId);
    if (!order || order.userId.toString() !== userId) {
      return response.status(403).json({
        message: "Unauthorized access",
        error: true,
        success: false,
      });
    }

    const tracking = await DeliveryTrackingModel.findOne({ orderId });
    if (!tracking) {
      return response.status(404).json({
        message: "Delivery tracking not found",
        error: true,
        success: false,
      });
    }

    const supportTicketId = `ISSUE-${Date.now()}`;
    await tracking.reportIssue(issueType, description, supportTicketId);

    // Notify delivery partner and admin
    emitToOrder(orderId, "customer_reported_issue", {
      issueType,
      description,
      supportTicketId,
      timestamp: new Date(),
    });

    return response.json({
      message: "Issue reported successfully",
      error: false,
      success: true,
      data: {
        supportTicketId,
        issueType,
        description,
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

// Submit delivery feedback (customer)
const submitDeliveryFeedbackController = async (request, response) => {
  try {
    const { orderId } = request.params;
    const { rating, comment } = request.body;
    const userId = request.userId;

    // Verify user owns this order
    const order = await OrderModel.findById(orderId);
    if (!order || order.userId.toString() !== userId) {
      return response.status(403).json({
        message: "Unauthorized access",
        error: true,
        success: false,
      });
    }

    const tracking = await DeliveryTrackingModel.findOne({ orderId });
    if (!tracking) {
      return response.status(404).json({
        message: "Delivery tracking not found",
        error: true,
        success: false,
      });
    }

    if (tracking.status !== "delivered") {
      return response.status(400).json({
        message: "Can only provide feedback for delivered orders",
        error: true,
        success: false,
      });
    }

    // Update tracking with feedback
    tracking.deliveryDetails.customerFeedback = {
      rating,
      comment,
      timestamp: new Date(),
    };
    
    tracking.analytics.customerSatisfaction = rating;
    await tracking.save();

    // Update partner's rating
    const partner = await DeliveryPartnerModel.findById(tracking.deliveryPartnerId);
    if (partner) {
      await partner.updateRating(rating);
      
      // Add to partner's ratings array
      partner.ratings.push({
        orderId: tracking.orderId,
        customerId: userId,
        rating,
        comment,
        createdAt: new Date(),
      });
      await partner.save();
    }

    return response.json({
      message: "Feedback submitted successfully",
      error: false,
      success: true,
      data: {
        rating,
        comment,
        timestamp: new Date(),
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

// Verify delivery OTP
const verifyDeliveryOTPController = async (request, response) => {
  try {
    const { orderId } = request.params;
    const { otp } = request.body;
    const userId = request.userId;

    // Verify user owns this order
    const order = await OrderModel.findById(orderId);
    if (!order || order.userId.toString() !== userId) {
      return response.status(403).json({
        message: "Unauthorized access",
        error: true,
        success: false,
      });
    }

    // Use the enhanced OTP verification method from the order model
    const verificationResult = order.verifyDeliveryOTP(otp);
    
    if (!verificationResult.success) {
      return response.status(400).json({
        message: verificationResult.message,
        error: true,
        success: false,
      });
    }

    // Save the order with updated OTP status
    await order.save();

    // Update delivery tracking status to delivered if OTP is verified
    const tracking = await DeliveryTrackingModel.findOne({ orderId });
    if (tracking) {
      // Update tracking status to delivered
      await tracking.updateStatus("delivered", null, "OTP verified - delivery completed");
      
      // Update order status
      await order.updateOrderStatus("Delivered");

      // Emit real-time update
      emitToOrder(orderId, "delivery_completed", {
        orderId,
        status: "delivered",
        timestamp: new Date(),
        otpVerified: true,
      });
    }

    return response.json({
      message: "OTP verified successfully! Delivery completed.",
      error: false,
      success: true,
      data: {
        verified: true,
        orderId,
        status: "delivered",
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

// Get all active deliveries (admin)
const getAllActiveDeliveriesController = async (request, response) => {
  try {
    const { page = 1, limit = 20, status } = request.query;
    
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    } else {
      // Default to active deliveries
      filter.status = { $nin: ["delivered", "failed", "returned", "cancelled"] };
    }
    
    const skip = (page - 1) * limit;
    const totalDeliveries = await DeliveryTrackingModel.countDocuments(filter);
    
    const deliveries = await DeliveryTrackingModel.find(filter)
      .populate("orderId", "orderId totalAmt createdAt")
      .populate("deliveryPartnerId", "name mobile vehicleDetails currentLocation")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    return response.json({
      message: "Active deliveries retrieved",
      error: false,
      success: true,
      data: {
        deliveries,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalDeliveries / limit),
          totalDeliveries,
          hasNext: page * limit < totalDeliveries,
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

// Get delivery analytics (admin)
const getDeliveryAnalyticsController = async (request, response) => {
  try {
    const { startDate, endDate, partnerId } = request.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
    const end = endDate ? new Date(endDate) : new Date();
    
    const filter = {
      createdAt: { $gte: start, $lte: end },
    };
    
    if (partnerId) {
      filter.deliveryPartnerId = partnerId;
    }
    
    // Overall analytics
    const analytics = await DeliveryTrackingModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalDeliveries: { $sum: 1 },
          successfulDeliveries: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] }
          },
          failedDeliveries: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] }
          },
          avgDeliveryTime: { $avg: "$metrics.totalDurationMinutes" },
          avgDistance: { $avg: "$metrics.totalDistanceKm" },
          onTimeDeliveries: {
            $sum: { $cond: ["$analytics.onTimeDelivery", 1, 0] }
          },
          totalDistance: { $sum: "$metrics.totalDistanceKm" },
          avgRating: { $avg: "$analytics.customerSatisfaction" },
        }
      }
    ]);
    
    // Daily breakdown
    const dailyStats = await DeliveryTrackingModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          deliveries: { $sum: 1 },
          successful: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] }
          },
          avgTime: { $avg: "$metrics.totalDurationMinutes" },
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    
    // Status distribution
    const statusStats = await DeliveryTrackingModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        }
      }
    ]);
    
    // Top performing partners
    const topPartners = await DeliveryTrackingModel.aggregate([
      { 
        $match: { 
          ...filter, 
          status: "delivered" 
        } 
      },
      {
        $group: {
          _id: "$deliveryPartnerId",
          deliveries: { $sum: 1 },
          avgTime: { $avg: "$metrics.totalDurationMinutes" },
          avgRating: { $avg: "$analytics.customerSatisfaction" },
          onTimeRate: {
            $avg: { $cond: ["$analytics.onTimeDelivery", 1, 0] }
          },
        }
      },
      { $sort: { deliveries: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "deliverypartners",
          localField: "_id",
          foreignField: "_id",
          as: "partner"
        }
      },
      { $unwind: "$partner" },
      {
        $project: {
          name: "$partner.name",
          deliveries: 1,
          avgTime: 1,
          avgRating: 1,
          onTimeRate: 1,
        }
      }
    ]);
    
    return response.json({
      message: "Delivery analytics retrieved",
      error: false,
      success: true,
      data: {
        overview: analytics[0] || {},
        dailyStats,
        statusDistribution: statusStats,
        topPartners,
        period: { startDate: start, endDate: end },
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

// Emergency: Cancel delivery
const cancelDeliveryController = async (request, response) => {
  try {
    const { orderId } = request.params;
    const { reason } = request.body;
    const userId = request.userId;

    const tracking = await DeliveryTrackingModel.findOne({ orderId });
    if (!tracking) {
      return response.status(404).json({
        message: "Delivery tracking not found",
        error: true,
        success: false,
      });
    }

    // Only allow cancellation before pickup or by admin
    if (!["assigned", "pickup_started"].includes(tracking.status) && request.userRole !== 'admin') {
      return response.status(400).json({
        message: "Cannot cancel delivery at this stage",
        error: true,
        success: false,
      });
    }

    await tracking.updateStatus("cancelled", null, reason || "Delivery cancelled");

    // Update order status
    await OrderModel.findByIdAndUpdate(orderId, { order_status: "Cancelled" });

    // Make partner available again
    if (tracking.deliveryPartnerId) {
      await DeliveryPartnerModel.findByIdAndUpdate(tracking.deliveryPartnerId, {
        'availability.isOnDuty': true,
        lastActiveOrder: null,
      });
    }

    // Notify all parties
    emitToOrder(orderId, "delivery_cancelled", {
      orderId,
      reason: reason || "Delivery cancelled",
      timestamp: new Date(),
    });

    return response.json({
      message: "Delivery cancelled successfully",
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

module.exports = {
  getTrackingByOrderController,
  getLiveLocationController,
  getDeliveryTimelineController,
  reportDeliveryIssueController,
  submitDeliveryFeedbackController,
  verifyDeliveryOTPController,
  getAllActiveDeliveriesController,
  getDeliveryAnalyticsController,
  cancelDeliveryController,
};