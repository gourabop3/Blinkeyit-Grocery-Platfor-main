const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    notes: {
      type: String,
      maxLength: 200,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
wishlistSchema.index({ userId: 1, addedAt: -1 });
wishlistSchema.index({ productId: 1 });

// Compound index to prevent duplicate items in wishlist
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

const WishlistModel = mongoose.model("Wishlist", wishlistSchema);

module.exports = WishlistModel;