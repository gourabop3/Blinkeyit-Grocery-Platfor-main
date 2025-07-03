const mongoose = require("mongoose");

const loyaltyTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["earned", "redeemed", "expired", "bonus"],
      required: true,
    },
    source: {
      type: String,
      enum: [
        "purchase",
        "review",
        "referral",
        "signup_bonus",
        "birthday",
        "social_share",
        "redemption",
        "manual",
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    referenceId: {
      type: String,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: function() {
        // Points expire after 1 year
        return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      },
    },
    status: {
      type: String,
      enum: ["active", "expired", "used"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// User loyalty summary schema
const loyaltySummarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    totalEarned: {
      type: Number,
      default: 0,
    },
    totalRedeemed: {
      type: Number,
      default: 0,
    },
    currentBalance: {
      type: Number,
      default: 0,
    },
    tier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      default: "bronze",
    },
    nextTierPoints: {
      type: Number,
      default: 1000, // Points needed for next tier
    },
    lifetimeSpent: {
      type: Number,
      default: 0,
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
loyaltyTransactionSchema.index({ userId: 1, createdAt: -1 });
loyaltyTransactionSchema.index({ userId: 1, status: 1 });
loyaltyTransactionSchema.index({ expiryDate: 1, status: 1 });

const LoyaltyTransactionModel = mongoose.model("LoyaltyTransaction", loyaltyTransactionSchema);
const LoyaltySummaryModel = mongoose.model("LoyaltySummary", loyaltySummarySchema);

module.exports = {
  LoyaltyTransactionModel,
  LoyaltySummaryModel,
};