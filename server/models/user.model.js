const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    avatar: {
      type: String,
      default: "",
    },
    mobile: {
      type: Number,
      default: null,
    },
    refresh_token: {
      type: String,
      default: "",
    },
    verify_email: {
      type: Boolean,
      default: false,
    },
    last_login_date: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
    },
    address_details: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
      },
    ],
    shopping_cart: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CartProduct",
      },
    ],
    orderHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    forgot_password_otp: {
      type: String,
      default: null,
    },
    forgot_password_expiry: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },
    // New interactive features
    preferences: {
      dietary: {
        type: [String],
        enum: ["vegan", "vegetarian", "gluten-free", "organic", "dairy-free", "low-fat", "sugar-free"],
        default: [],
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        orderUpdates: { type: Boolean, default: true },
        promotions: { type: Boolean, default: true },
        restockAlerts: { type: Boolean, default: false },
      },
      language: {
        type: String,
        default: "en",
      },
      currency: {
        type: String,
        default: "INR",
      },
    },
    loyaltyProfile: {
      currentPoints: { type: Number, default: 0 },
      totalEarned: { type: Number, default: 0 },
      totalRedeemed: { type: Number, default: 0 },
      tier: {
        type: String,
        enum: ["bronze", "silver", "gold", "platinum"],
        default: "bronze",
      },
      joinDate: { type: Date, default: Date.now },
    },
    referral: {
      code: {
        type: String,
        unique: true,
        sparse: true,
      },
      referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      referralCount: { type: Number, default: 0 },
      referralRewards: { type: Number, default: 0 },
    },
    activity: {
      lastLogin: { type: Date, default: null },
      loginCount: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 },
      reviewsWritten: { type: Number, default: 0 },
      wishlistItems: { type: Number, default: 0 },
    },
    deviceInfo: {
      fcmToken: { type: String, default: "" }, // For push notifications
      platform: { type: String, default: "" },
      lastDevice: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
