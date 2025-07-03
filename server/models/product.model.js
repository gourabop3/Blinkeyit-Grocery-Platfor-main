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
