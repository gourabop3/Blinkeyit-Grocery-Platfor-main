const mongoose = require("mongoose");

const rechargeProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    image: {
      type: [String],
      default: [],
    },
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        validate: {
          validator: function(v) {
            return mongoose.Types.ObjectId.isValid(v);
          },
          message: 'Invalid category ObjectId'
        }
      },
    ],
    subCategory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory",
        validate: {
          validator: function(v) {
            return mongoose.Types.ObjectId.isValid(v);
          },
          message: 'Invalid subCategory ObjectId'
        }
      },
    ],
    // Recharge/Bill specific fields
    type: {
      type: String,
      enum: ["mobile_recharge", "bill_payment", "ai_tool", "streaming", "other"],
      required: true,
    },
    provider: {
      type: String,
      default: "", // e.g., "Airtel", "Netflix", "ChatGPT Plus"
    },
    denomination: {
      type: Number,
      default: 0, // For recharge: amount, For bills: bill amount
    },
    price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
    },
    description: {
      type: String,
      default: "",
    },
    // Additional details for recharge/bills
    details: {
      validity: String, // e.g., "28 days", "1 month"
      data: String, // e.g., "2GB/day", "Unlimited"
      benefits: [String], // Array of benefits
      operator: String, // For mobile: "Airtel", "Jio", "Vi", "BSNL"
      circle: String, // For mobile: "Delhi", "Mumbai", etc.
    },
    publish: {
      type: Boolean,
      default: true,
    },
    // Popular/Featured flag
    isPopular: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // Usage statistics
    views: {
      type: Number,
      default: 0,
    },
    sales: {
      type: Number,
      default: 0,
    },
    // Tags for better search
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to clean up invalid ObjectIds
rechargeProductSchema.pre('save', function(next) {
  if (this.category && Array.isArray(this.category)) {
    this.category = this.category.filter(id => {
      if (typeof id === 'string' && !mongoose.Types.ObjectId.isValid(id)) {
        console.warn(`Removing invalid category ObjectId: ${id}`);
        return false;
      }
      return true;
    });
  }
  
  if (this.subCategory && Array.isArray(this.subCategory)) {
    this.subCategory = this.subCategory.filter(id => {
      if (typeof id === 'string' && !mongoose.Types.ObjectId.isValid(id)) {
        console.warn(`Removing invalid subCategory ObjectId: ${id}`);
        return false;
      }
      return true;
    });
  }
  
  next();
});

// Create text index for full-text search
rechargeProductSchema.index({ name: "text", description: "text", provider: "text" });
rechargeProductSchema.index({ type: 1 });
rechargeProductSchema.index({ publish: 1 });
rechargeProductSchema.index({ isPopular: 1 });
rechargeProductSchema.index({ isFeatured: 1 });

const RechargeProductModel = mongoose.model("RechargeProduct", rechargeProductSchema);

module.exports = RechargeProductModel;

