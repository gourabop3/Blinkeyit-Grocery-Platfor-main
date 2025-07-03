const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    image: {
      type: [String], // Better than `type: Array`
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
    unit: {
      type: String,
      default: "",
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
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
    },
    description: {
      type: String,
      default: "",
    },
    more_details: {
      type: Object,
      default: {},
    },
    publish: {
      type: Boolean,
      default: true,
    },
    // Review and rating aggregation
    reviews: {
      totalReviews: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      ratingDistribution: {
        1: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        5: { type: Number, default: 0 },
      },
    },
    // Additional product metadata
    tags: {
      type: [String],
      default: [],
    },
    dietary: {
      type: [String],
      enum: ["vegan", "vegetarian", "gluten-free", "organic", "dairy-free", "low-fat", "sugar-free"],
      default: [],
    },
    brand: {
      type: String,
      default: "",
    },
    nutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
      sugar: { type: Number, default: 0 },
    },
    views: {
      type: Number,
      default: 0,
    },
    sales: {
      type: Number,
      default: 0,
    },
    lastRestocked: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to clean up invalid ObjectIds
productSchema.pre('save', function(next) {
  // Filter out invalid ObjectIds from category array
  if (this.category && Array.isArray(this.category)) {
    this.category = this.category.filter(id => {
      if (typeof id === 'string' && !mongoose.Types.ObjectId.isValid(id)) {
        console.warn(`Removing invalid category ObjectId: ${id}`);
        return false;
      }
      return true;
    });
  }
  
  // Filter out invalid ObjectIds from subCategory array
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

// 📝 Create text index for full-text search
productSchema.index({ name: "text", description: "text" });

const ProductModel = mongoose.model("Product", productSchema);

module.exports = ProductModel;
