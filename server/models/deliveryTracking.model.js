const mongoose = require("mongoose");

const deliveryTrackingSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    
    deliveryPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
      required: true,
    },
    
    // Delivery Status Timeline
    status: {
      type: String,
      enum: [
        "assigned",           // Partner assigned to order
        "pickup_started",     // Partner heading to store
        "picked_up",         // Items picked up from store
        "in_transit",        // On the way to customer
        "arrived",           // Reached customer location
        "delivered",         // Successfully delivered
        "failed",            // Delivery failed
        "returned",          // Returned to store
        "cancelled"          // Delivery cancelled
      ],
      default: "assigned",
    },
    
    // Timeline Events
    timeline: [{
      status: {
        type: String,
        enum: [
          "assigned", "pickup_started", "picked_up", 
          "in_transit", "arrived", "delivered", 
          "failed", "returned", "cancelled"
        ],
      },
      timestamp: { type: Date, default: Date.now },
      location: {
        latitude: Number,
        longitude: Number,
        address: String,
      },
      notes: String,
      imageProof: String, // URL to delivery proof image
    }],
    
    // Route Tracking
    route: [{
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      timestamp: { type: Date, default: Date.now },
      speed: Number, // km/h
      heading: Number, // degrees
      accuracy: Number, // meters
    }],
    
    // Location Points
    storeLocation: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: String,
      arrivalTime: Date,
      departureTime: Date,
    },
    
    customerLocation: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: String,
      arrivalTime: Date,
      deliveryTime: Date,
    },
    
    // Distance & Time Calculations
    metrics: {
      totalDistanceKm: { type: Number, default: 0 },
      storeToCustomerDistanceKm: { type: Number, default: 0 },
      estimatedDeliveryTime: Date, // Initial estimate
      actualPickupTime: Date,
      actualDeliveryTime: Date,
      totalDurationMinutes: { type: Number, default: 0 },
      delayMinutes: { type: Number, default: 0 }, // Positive if delayed
    },
    
    // Delivery Details
    deliveryDetails: {
      deliveryInstructions: String,
      contactlessDelivery: { type: Boolean, default: false },
      otp: String, // For OTP-based delivery
      otpVerified: { type: Boolean, default: false },
      signatureRequired: { type: Boolean, default: false },
      signature: String, // Base64 signature image
      deliveryProofImage: String, // URL to delivery proof
      customerFeedback: {
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        timestamp: Date,
      },
    },
    
    // Issues & Support
    issues: [{
      type: {
        type: String,
        enum: [
          "customer_not_available",
          "wrong_address",
          "payment_issue",
          "product_damaged",
          "vehicle_breakdown",
          "traffic_delay",
          "weather_issue",
          "customer_cancelled",
          "other"
        ],
      },
      description: String,
      reportedAt: { type: Date, default: Date.now },
      resolvedAt: Date,
      resolution: String,
      supportTicketId: String,
    }],
    
    // Real-time Updates
    lastLocationUpdate: {
      timestamp: { type: Date, default: Date.now },
      latitude: Number,
      longitude: Number,
      battery: Number, // Partner's device battery percentage
      networkStrength: String, // weak, medium, strong
    },
    
    // Delivery Attempt History
    deliveryAttempts: [{
      attemptNumber: Number,
      timestamp: Date,
      reason: String, // Why delivery failed
      nextAttemptScheduled: Date,
      customerContacted: Boolean,
    }],
    
    // Analytics Data
    analytics: {
      avgSpeed: Number, // km/h
      stopDuration: Number, // minutes stopped during delivery
      routeEfficiency: Number, // percentage (actual vs optimal route)
      customerSatisfaction: Number, // 1-5 rating
      onTimeDelivery: Boolean,
      weatherCondition: String,
      trafficCondition: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
deliveryTrackingSchema.index({ orderId: 1 });
deliveryTrackingSchema.index({ deliveryPartnerId: 1 });
deliveryTrackingSchema.index({ status: 1 });
deliveryTrackingSchema.index({ "lastLocationUpdate.timestamp": 1 });
deliveryTrackingSchema.index({ createdAt: 1 });

// Instance methods
deliveryTrackingSchema.methods.updateStatus = function(newStatus, location = null, notes = "", imageProof = "") {
  // Add to timeline
  const timelineEvent = {
    status: newStatus,
    timestamp: new Date(),
    notes,
    imageProof,
  };
  
  if (location) {
    timelineEvent.location = location;
  }
  
  this.timeline.push(timelineEvent);
  this.status = newStatus;
  
  return this.save();
};

deliveryTrackingSchema.methods.addLocationUpdate = function(latitude, longitude, speed = 0, heading = 0, accuracy = 10) {
  const locationUpdate = {
    latitude,
    longitude,
    timestamp: new Date(),
    speed,
    heading,
    accuracy,
  };
  
  this.route.push(locationUpdate);
  
  // Update last location
  this.lastLocationUpdate = {
    timestamp: new Date(),
    latitude,
    longitude,
  };
  
  return this.save();
};

deliveryTrackingSchema.methods.calculateDistance = function() {
  if (this.route.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 1; i < this.route.length; i++) {
    const prev = this.route[i - 1];
    const curr = this.route[i];
    
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = (curr.latitude - prev.latitude) * Math.PI / 180;
    const dLon = (curr.longitude - prev.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(prev.latitude * Math.PI / 180) * Math.cos(curr.latitude * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    totalDistance += distance;
  }
  
  this.metrics.totalDistanceKm = totalDistance;
  return totalDistance;
};

deliveryTrackingSchema.methods.reportIssue = function(issueType, description, supportTicketId = "") {
  this.issues.push({
    type: issueType,
    description,
    reportedAt: new Date(),
    supportTicketId,
  });
  
  return this.save();
};

deliveryTrackingSchema.methods.completeDelivery = function(customerFeedback = null, deliveryProof = "") {
  this.status = "delivered";
  this.metrics.actualDeliveryTime = new Date();
  
  if (deliveryProof) {
    this.deliveryDetails.deliveryProofImage = deliveryProof;
  }
  
  if (customerFeedback) {
    this.deliveryDetails.customerFeedback = {
      ...customerFeedback,
      timestamp: new Date(),
    };
  }
  
  // Calculate total duration
  const startTime = this.createdAt;
  const endTime = new Date();
  this.metrics.totalDurationMinutes = Math.round((endTime - startTime) / (1000 * 60));
  
  // Calculate delay if estimated time was set
  if (this.metrics.estimatedDeliveryTime) {
    const delay = (endTime - this.metrics.estimatedDeliveryTime) / (1000 * 60);
    this.metrics.delayMinutes = Math.round(delay);
    this.analytics.onTimeDelivery = delay <= 5; // Within 5 minutes is considered on time
  }
  
  // Add final timeline event
  this.timeline.push({
    status: "delivered",
    timestamp: new Date(),
    notes: "Order delivered successfully",
    imageProof: deliveryProof,
  });
  
  return this.save();
};

// Static methods
deliveryTrackingSchema.statics.getActiveDeliveries = function(deliveryPartnerId) {
  return this.find({
    deliveryPartnerId,
    status: { $nin: ["delivered", "failed", "returned", "cancelled"] },
  }).populate("orderId").sort({ createdAt: -1 });
};

deliveryTrackingSchema.statics.getDeliveryAnalytics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ["delivered", "failed"] },
      }
    },
    {
      $group: {
        _id: null,
        totalDeliveries: { $sum: 1 },
        successfulDeliveries: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
        avgDeliveryTime: { $avg: "$metrics.totalDurationMinutes" },
        avgDistance: { $avg: "$metrics.totalDistanceKm" },
        onTimeDeliveries: { $sum: { $cond: ["$analytics.onTimeDelivery", 1, 0] } },
      }
    }
  ]);
};

const DeliveryTrackingModel = mongoose.model("DeliveryTracking", deliveryTrackingSchema);

module.exports = DeliveryTrackingModel;