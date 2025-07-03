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
      required: true,
    },
    subTotalAmt: {
      type: Number,
      default: 0,
    },
    totalAmt: {
      type: Number,
      default: 0,
    },
    invoice_receipt: {
      type: String,
      default: "",
    },
    order_status: {
      type: String,
      enum: ["Processing", "Confirmed", "Preparing", "Ready", "Assigned", "Picked_up", "In_transit", "Delivered", "Cancelled", "Failed"],
      default: "Processing",
    },
    
    // Delivery Information
    assignedDeliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
    },
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
    
    // OTP for secure delivery
    deliveryOTP: {
      code: String,
      expiresAt: Date,
      verified: { type: Boolean, default: false },
    },
    
    // Store location for pickup
    storeLocation: {
      latitude: { type: Number, default: 28.6139 }, // Default to Delhi
      longitude: { type: Number, default: 77.2090 },
      address: { type: String, default: "Store Location" },
    },
    
    // Delivery fees and charges
    deliveryCharges: {
      baseFee: { type: Number, default: 0 },
      distanceFee: { type: Number, default: 0 },
      surgeCharge: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const OrderModel = mongoose.model("Order", orderSchema);

module.exports = OrderModel;
