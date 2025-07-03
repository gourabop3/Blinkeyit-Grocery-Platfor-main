const DeliveryTrackingModel = require("../models/deliveryTracking.model");
const OrderModel = require("../models/order.model");
const DeliveryPartnerModel = require("../models/deliveryPartner.model");
const { emitToOrder, emitToUser } = require("../config/socket");

// Mock data for testing when MongoDB is not available
const getMockTrackingData = (orderId) => {
  return {
    _id: orderId,
    orderId: {
      _id: orderId,
      orderId: `ORD-${Date.now()}`,
      totalAmt: 299.99,
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      deliveryOTP: {
        code: "123456",
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        verified: false
      }
    },
    status: "in_transit",
    deliveryPartnerId: {
      _id: "partner123",
      name: "John Doe",
      mobile: "+1234567890",
      vehicleDetails: {
        type: "bike",
        plateNumber: "ABC-123",
        brand: "Honda",
        model: "CB350"
      },
      currentLocation: {
        latitude: 40.7128,
        longitude: -74.0060,
        lastUpdated: new Date()
      },
      statistics: {
        avgRating: 4.5,
        totalDeliveries: 150
      },
      photoUrl: null
    },
    storeLocation: {
      latitude: 40.7589,
      longitude: -73.9851,
      address: "123 Store Street, NY"
    },
    customerLocation: {
      latitude: 40.7831,
      longitude: -73.9712,
      address: "456 Customer Ave, NY"
    },
    timeline: [
      {
        status: "assigned",
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        notes: "Delivery partner assigned"
      },
      {
        status: "pickup_started",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        notes: "Partner heading to store"
      },
      {
        status: "picked_up",
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        notes: "Order picked up from store"
      },
      {
        status: "in_transit",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        notes: "On the way to delivery location"
      }
    ],
    route: [
      { latitude: 40.7589, longitude: -73.9851, timestamp: new Date(Date.now() - 10 * 60 * 1000) },
      { latitude: 40.7634, longitude: -73.9776, timestamp: new Date(Date.now() - 8 * 60 * 1000) },
      { latitude: 40.7689, longitude: -73.9712, timestamp: new Date(Date.now() - 5 * 60 * 1000) },
      { latitude: 40.7728, longitude: -73.9654, timestamp: new Date(Date.now() - 2 * 60 * 1000) }
    ],
    lastLocationUpdate: {
      latitude: 40.7728,
      longitude: -73.9654,
      timestamp: new Date(),
      speed: 25,
      heading: 45,
      accuracy: 10
    },
    metrics: {
      estimatedDeliveryTime: new Date(Date.now() + 8 * 60 * 1000),
      distanceToCustomer: 1.2,
      totalDistanceKm: 5.4,
      totalDurationMinutes: 25
    },
    liveUpdates: {
      distanceToCustomer: 1.2,
      estimatedArrival: new Date(Date.now() + 8 * 60 * 1000),
      partnerLocation: {
        latitude: 40.7728,
        longitude: -73.9654,
        lastUpdated: new Date()
      }
    },
    deliveryDetails: {
      deliveryInstructions: "Ring the doorbell twice",
      customerFeedback: null
    },
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
    updatedAt: new Date()
  };
};

const getMockActiveDeliveries = () => {
  return [
    {
      _id: "delivery1",
      orderId: {
        _id: "order1",
        orderId: "ORD-001",
        totalAmt: 299.99,
        createdAt: new Date(Date.now() - 30 * 60 * 1000)
      },
      deliveryPartnerId: {
        _id: "partner1",
        name: "John Doe",
        mobile: "+1234567890",
        vehicleDetails: { type: "bike", plateNumber: "ABC-123" },
        currentLocation: {
          latitude: 40.7128,
          longitude: -74.0060,
          lastUpdated: new Date()
        }
      },
      status: "in_transit",
      lastLocationUpdate: {
        latitude: 40.7128,
        longitude: -74.0060,
        timestamp: new Date()
      },
      route: [
        [40.7589, -73.9851],
        [40.7634, -73.9776],
        [40.7689, -73.9712],
        [40.7128, -74.0060]
      ],
      metrics: {
        distanceToCustomer: 1.5,
        estimatedDeliveryTime: new Date(Date.now() + 10 * 60 * 1000)
      }
    },
    {
      _id: "delivery2",
      orderId: {
        _id: "order2", 
        orderId: "ORD-002",
        totalAmt: 450.50,
        createdAt: new Date(Date.now() - 45 * 60 * 1000)
      },
      deliveryPartnerId: {
        _id: "partner2",
        name: "Jane Smith",
        mobile: "+1987654321",
        vehicleDetails: { type: "scooter", plateNumber: "XYZ-456" },
        currentLocation: {
          latitude: 40.7831,
          longitude: -73.9712,
          lastUpdated: new Date()
        }
      },
      status: "pickup_started",
      lastLocationUpdate: {
        latitude: 40.7831,
        longitude: -73.9712,
        timestamp: new Date()
      },
      route: [
        [40.7589, -73.9851],
        [40.7831, -73.9712]
      ],
      metrics: {
        distanceToCustomer: 2.8,
        estimatedDeliveryTime: new Date(Date.now() + 15 * 60 * 1000)
      }
    }
  ];
};

// Get delivery tracking for an order
const getTrackingByOrderController = async (request, response) => {
  try {
    const { orderId } = request.params;
    const userId = request.userId;

    console.log(`[DEBUG] Getting tracking for order: ${orderId}`);

    try {
      // Try database first
      const order = await OrderModel.findById(orderId);
      if (!order) {
        console.log(`[DEBUG] Order not found in DB, using mock data for ${orderId}`);
        const mockData = getMockTrackingData(orderId);
        return response.json({
          message: "Delivery tracking retrieved successfully (Demo Mode)",
          error: false,
          success: true,
          data: mockData,
        });
      }

      if(userId) {
        if (order.userId.toString() !== userId && request.userRole !== 'admin') {
          return response.status(403).json({
            message: "Unauthorized access to order tracking",
            error: true,
            success: false,
          });
        }
      }

      const tracking = await DeliveryTrackingModel.findOne({ orderId })
        .populate("deliveryPartnerId", "name mobile vehicleDetails currentLocation statistics")
        .populate("orderId", "orderId totalAmt estimatedDeliveryTime deliveryOTP");

      if (!tracking) {
        console.log(`[DEBUG] No tracking found in DB, using mock data for ${orderId}`);
        const mockData = getMockTrackingData(orderId);
        return response.json({
          message: "Delivery tracking retrieved successfully (Demo Mode)",
          error: false,
          success: true,
          data: mockData,
        });
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

      return response.json({
        message: "Delivery tracking retrieved successfully",
        error: false,
        success: true,
        data: {
          ...tracking.toObject(),
          liveUpdates,
        },
      });

    } catch (dbError) {
      console.log(`[DEBUG] Database error, using mock data: ${dbError.message}`);
      const mockData = getMockTrackingData(orderId);
      return response.json({
        message: "Delivery tracking retrieved successfully (Demo Mode - DB Unavailable)",
        error: false,
        success: true,
        data: mockData,
      });
    }
  } catch (error) {
    console.error(`[ERROR] Tracking controller error:`, error);
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

    if (!order.deliveryOTP || !order.deliveryOTP.code) {
      return response.status(400).json({
        message: "No OTP required for this order",
        error: true,
        success: false,
      });
    }

    if (order.deliveryOTP.code !== otp) {
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

    // Mark OTP as verified
    order.deliveryOTP.verified = true;
    await order.save();

    // Notify delivery partner that OTP is verified
    emitToOrder(orderId, "otp_verified", {
      orderId,
      verified: true,
      timestamp: new Date(),
    });

    return response.json({
      message: "OTP verified successfully",
      error: false,
      success: true,
      data: {
        verified: true,
        orderId,
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
    
    console.log(`[DEBUG] Getting active deliveries for admin`);

    try {
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

    } catch (dbError) {
      console.log(`[DEBUG] Database error in admin deliveries, using mock data: ${dbError.message}`);
      
      // Return mock data when database is not available
      const mockDeliveries = getMockActiveDeliveries();
      
      return response.json({
        message: "Active deliveries retrieved (Demo Mode - DB Unavailable)",
        error: false,
        success: true,
        data: {
          deliveries: mockDeliveries,
          pagination: {
            currentPage: parseInt(page),
            totalPages: 1,
            totalDeliveries: mockDeliveries.length,
            hasNext: false,
            hasPrev: false,
          },
        },
      });
    }
  } catch (error) {
    console.error(`[ERROR] Active deliveries controller error:`, error);
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