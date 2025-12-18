const mongoose = require("mongoose");

const PaymentStatus = {
  PAID: "PAID",
  PENDING: "PENDING",
  COD: "CASH ON DELIVERY",
};

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: String,
      required: [true, "Provide orderId"],
      unique: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        product_details: {
          name: String,
          image: [String],
        },
      },
    ],
    paymentId: {
      type: String,
      default: "",
    },
    payment_status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    delivery_address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: false,
    },
    // Customer contact information (for online tools style checkout)
    customerInfo: {
      name: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
      phone: {
        type: String,
        required: false,
      },
    },
    subTotalAmt: {
      type: Number,
      default: 0,
    },
    totalAmt: {
      type: Number,
      default: 0,
    },
    
    // Coupon Information
    appliedCoupon: {
      couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
      },
      code: String,
      discountAmount: {
        type: Number,
        default: 0,
      },
      discountType: {
        type: String,
        enum: ["percentage", "fixed", "free_shipping", "bogo"],
      },
      appliedAt: {
        type: Date,
        default: Date.now,
      },
    },
    
    // Pricing breakdown
    pricing: {
      itemsTotal: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
      deliveryCharges: { type: Number, default: 0 },
      taxAmount: { type: Number, default: 0 },
      finalAmount: { type: Number, default: 0 },
    },
    
    invoice_receipt: {
      type: String,
      default: "",
    },
    order_status: {
      type: String,
      enum: [
        "Processing", 
        "Confirmed", 
        "Preparing", 
        "Ready", 
        "Assigned", 
        "Picked_up", 
        "In_transit", 
        "Arrived", 
        "Delivered", 
        "Cancelled", 
        "Failed"
      ],
      default: "Processing",
    },
    
    // Enhanced Delivery Information
    deliveryType: {
      type: String,
      enum: ["standard", "express", "scheduled"],
      default: "standard",
    },
    scheduledDeliveryTime: {
      type: Date,
    },
    estimatedDeliveryTime: {
      type: Date,
    },
    actualDeliveryTime: {
      type: Date,
    },
    deliveryInstructions: {
      type: String,
      default: "",
    },
    contactlessDelivery: {
      type: Boolean,
      default: false,
    },
    
    // Enhanced OTP System for secure delivery
    deliveryOTP: {
      code: {
        type: String,
        length: 6,
      },
      expiresAt: {
        type: Date,
      },
      verified: { 
        type: Boolean, 
        default: false 
      },
      attempts: {
        type: Number,
        default: 0,
        max: 3,
      },
      generatedAt: {
        type: Date,
      },
    },
    
    // Store location for pickup
    storeLocation: {
      latitude: { type: Number, default: 28.6139 }, // Default to Delhi
      longitude: { type: Number, default: 77.2090 },
      address: { type: String, default: "Store Location" },
      storeId: String,
    },
    
    // Enhanced delivery fees and charges
    deliveryCharges: {
      baseFee: { type: Number, default: 0 },
      distanceFee: { type: Number, default: 0 },
      surgeCharge: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },

    // Delivery Priority (for Flipkart-like features)
    deliveryPriority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },

    // Customer preferences
    customerPreferences: {
      callBeforeDelivery: { type: Boolean, default: true },
      smsUpdates: { type: Boolean, default: true },
      emailUpdates: { type: Boolean, default: true },
      preferredDeliveryTime: String, // "morning", "afternoon", "evening"
    },

    // Order tracking and analytics
    orderTracking: {
      preparationStartTime: Date,
      preparationEndTime: Date,
      assignmentTime: Date,
      pickupTime: Date,
      dispatchTime: Date,
      deliveryStartTime: Date,
      deliveryCompletionTime: Date,
    },

    // Customer feedback
    customerFeedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      deliveryRating: { type: Number, min: 1, max: 5 },
      partnerRating: { type: Number, min: 1, max: 5 },
      submittedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Generate OTP for delivery verification
orderSchema.methods.generateDeliveryOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 30); // OTP expires in 30 minutes
  
  this.deliveryOTP = {
    code: otp,
    expiresAt: expiresAt,
    verified: false,
    attempts: 0,
    generatedAt: new Date(),
  };
  
  return otp;
};

// Verify OTP
orderSchema.methods.verifyDeliveryOTP = function(inputOtp) {
  if (!this.deliveryOTP || !this.deliveryOTP.code) {
    return { success: false, message: "No OTP generated for this order" };
  }
  
  if (this.deliveryOTP.verified) {
    return { success: false, message: "OTP already verified" };
  }
  
  if (new Date() > this.deliveryOTP.expiresAt) {
    return { success: false, message: "OTP has expired" };
  }
  
  if (this.deliveryOTP.attempts >= 3) {
    return { success: false, message: "Maximum OTP attempts exceeded" };
  }
  
  this.deliveryOTP.attempts += 1;
  
  if (this.deliveryOTP.code !== inputOtp) {
    return { success: false, message: "Invalid OTP" };
  }
  
  this.deliveryOTP.verified = true;
  return { success: true, message: "OTP verified successfully" };
};

// Calculate delivery charges based on distance and other factors
orderSchema.methods.calculateDeliveryCharges = function(distance = 0, isPeakTime = false) {
  const baseFee = 29; // Base delivery fee
  const distanceFee = distance > 5 ? (distance - 5) * 5 : 0; // ₹5 per km after 5km
  const surgeCharge = isPeakTime ? baseFee * 0.5 : 0; // 50% surge during peak times
  const serviceFee = 5; // Platform service fee
  
  this.deliveryCharges = {
    baseFee,
    distanceFee,
    surgeCharge,
    serviceFee,
    total: baseFee + distanceFee + surgeCharge + serviceFee,
  };
  
  return this.deliveryCharges.total;
};

// Update order status with timestamp tracking
orderSchema.methods.updateOrderStatus = function(newStatus) {
  const previousStatus = this.order_status;
  this.order_status = newStatus;
  
  // Update tracking timestamps
  const now = new Date();
  
  switch (newStatus) {
    case "Confirmed":
      if (!this.orderTracking.preparationStartTime) {
        this.orderTracking.preparationStartTime = now;
      }
      break;
    case "Preparing":
      this.orderTracking.preparationStartTime = now;
      break;
    case "Ready":
      this.orderTracking.preparationEndTime = now;
      break;
    case "Assigned":
      this.orderTracking.assignmentTime = now;
      // Generate OTP when delivery partner is assigned
      if (!this.deliveryOTP || !this.deliveryOTP.code) {
        this.generateDeliveryOTP();
      }
      break;
    case "Picked_up":
      this.orderTracking.pickupTime = now;
      this.orderTracking.dispatchTime = now;
      break;
    case "In_transit":
      this.orderTracking.deliveryStartTime = now;
      break;
    case "Delivered":
      this.orderTracking.deliveryCompletionTime = now;
      this.actualDeliveryTime = now;
      break;
  }
  
  return this.save();
};

// Get estimated delivery time based on order priority and distance
orderSchema.methods.getEstimatedDeliveryTime = function(distance = 5) {
  const now = new Date();
  let estimatedMinutes = 30; // Base time
  
  // Add time based on distance
  estimatedMinutes += distance * 3; // 3 minutes per km
  
  // Adjust based on priority
  switch (this.deliveryPriority) {
    case "urgent":
      estimatedMinutes = Math.max(15, estimatedMinutes * 0.5);
      break;
    case "high":
      estimatedMinutes = Math.max(20, estimatedMinutes * 0.7);
      break;
    case "low":
      estimatedMinutes = estimatedMinutes * 1.5;
      break;
  }
  
  // Add time based on order preparation
  if (this.order_status === "Processing" || this.order_status === "Confirmed") {
    estimatedMinutes += 15; // Preparation time
  }
  
  const estimatedTime = new Date(now.getTime() + estimatedMinutes * 60000);
  this.estimatedDeliveryTime = estimatedTime;
  
  return estimatedTime;
};

// Check if order is eligible for delivery
orderSchema.methods.isEligibleForDelivery = function() {
  const eligibleStatuses = ["Ready", "Assigned", "Picked_up", "In_transit"];
  return eligibleStatuses.includes(this.order_status);
};

// Get delivery time metrics
orderSchema.methods.getDeliveryMetrics = function() {
  if (!this.orderTracking.deliveryCompletionTime || !this.orderTracking.preparationStartTime) {
    return null;
  }
  
  const totalTime = this.orderTracking.deliveryCompletionTime - this.orderTracking.preparationStartTime;
  const preparationTime = this.orderTracking.preparationEndTime 
    ? this.orderTracking.preparationEndTime - this.orderTracking.preparationStartTime 
    : null;
  const deliveryTime = this.orderTracking.deliveryCompletionTime - this.orderTracking.deliveryStartTime;
  
  return {
    totalTimeMinutes: Math.round(totalTime / (1000 * 60)),
    preparationTimeMinutes: preparationTime ? Math.round(preparationTime / (1000 * 60)) : null,
    deliveryTimeMinutes: Math.round(deliveryTime / (1000 * 60)),
    isOnTime: this.estimatedDeliveryTime ? this.orderTracking.deliveryCompletionTime <= this.estimatedDeliveryTime : null,
  };
};

// Static method to get orders ready for delivery assignment
orderSchema.statics.getOrdersReadyForDelivery = function() {
  return this.find({
    order_status: "Ready"
  }).populate("delivery_address userId");
};

// Static method to get active delivery orders
orderSchema.statics.getActiveDeliveryOrders = function() {
  return this.find({
    order_status: { $in: ["Assigned", "Picked_up", "In_transit", "Arrived"] }
  }).populate("delivery_address userId");
};

// Indexes for better performance
orderSchema.index({ orderId: 1 });
orderSchema.index({ userId: 1 });
orderSchema.index({ order_status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ "deliveryOTP.expiresAt": 1 });

const OrderModel = mongoose.model("Order", orderSchema);

module.exports = OrderModel;
