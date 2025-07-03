const WishlistModel = require("../models/wishlist.model.js");
const ProductModel = require("../models/product.model.js");
const UserModel = require("../models/user.model.js");

// Add item to wishlist
const addToWishlistController = async (request, response) => {
  try {
    const userId = request.userId;
    const { productId, priority = "medium", notes = "" } = request.body;

    if (!productId) {
      return response.status(400).json({
        message: "Product ID is required",
        error: true,
        success: false,
      });
    }

    // Check if product exists
    const product = await ProductModel.findById(productId);
    if (!product) {
      return response.status(404).json({
        message: "Product not found",
        error: true,
        success: false,
      });
    }

    // Check if item already in wishlist
    const existingItem = await WishlistModel.findOne({ userId, productId });
    if (existingItem) {
      return response.status(400).json({
        message: "Product already in wishlist",
        error: true,
        success: false,
      });
    }

    const wishlistItem = new WishlistModel({
      userId,
      productId,
      priority,
      notes,
    });

    const savedItem = await wishlistItem.save();

    // Update user wishlist count
    await UserModel.findByIdAndUpdate(userId, {
      $inc: { "activity.wishlistItems": 1 },
    });

    // Populate product details for response
    const populatedItem = await WishlistModel.findById(savedItem._id)
      .populate("productId", "name image price discount reviews.averageRating stock");

    return response.json({
      message: "Product added to wishlist successfully",
      error: false,
      success: true,
      data: populatedItem,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Remove item from wishlist
const removeFromWishlistController = async (request, response) => {
  try {
    const userId = request.userId;
    const { productId } = request.params;

    const deletedItem = await WishlistModel.findOneAndDelete({
      userId,
      productId,
    });

    if (!deletedItem) {
      return response.status(404).json({
        message: "Product not found in wishlist",
        error: true,
        success: false,
      });
    }

    // Update user wishlist count
    await UserModel.findByIdAndUpdate(userId, {
      $inc: { "activity.wishlistItems": -1 },
    });

    return response.json({
      message: "Product removed from wishlist successfully",
      error: false,
      success: true,
      data: deletedItem,
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Get user's wishlist
const getWishlistController = async (request, response) => {
  try {
    const userId = request.userId;
    const { page = 1, limit = 20, sort = "newest" } = request.query;

    let sortQuery = {};
    switch (sort) {
      case "newest":
        sortQuery = { addedAt: -1 };
        break;
      case "oldest":
        sortQuery = { addedAt: 1 };
        break;
      case "priority":
        sortQuery = { priority: 1, addedAt: -1 };
        break;
      case "name":
        // Will need to sort by product name after populate
        sortQuery = { addedAt: -1 };
        break;
      default:
        sortQuery = { addedAt: -1 };
    }

    const skip = (page - 1) * limit;

    let wishlistQuery = WishlistModel.find({ userId })
      .populate({
        path: "productId",
        select: "name image price discount reviews.averageRating stock publish tags dietary brand",
        match: { publish: true }, // Only show published products
      })
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit));

    const wishlistItems = await wishlistQuery;

    // Filter out items where product is null (unpublished/deleted products)
    const validItems = wishlistItems.filter(item => item.productId !== null);

    // If sorting by name, do it manually after populate
    if (sort === "name") {
      validItems.sort((a, b) => 
        a.productId.name.localeCompare(b.productId.name)
      );
    }

    const totalItems = await WishlistModel.countDocuments({ userId });

    // Calculate wishlist statistics
    const stats = await getWishlistStats(userId);

    return response.json({
      message: "Wishlist fetched successfully",
      error: false,
      success: true,
      data: {
        items: validItems,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalItems / limit),
          totalItems,
          hasNext: page * limit < totalItems,
          hasPrev: page > 1,
        },
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Update wishlist item
const updateWishlistItemController = async (request, response) => {
  try {
    const userId = request.userId;
    const { productId } = request.params;
    const { priority, notes } = request.body;

    const updateData = {};
    if (priority) updateData.priority = priority;
    if (notes !== undefined) updateData.notes = notes;

    const updatedItem = await WishlistModel.findOneAndUpdate(
      { userId, productId },
      updateData,
      { new: true }
    ).populate("productId", "name image price discount reviews.averageRating stock");

    if (!updatedItem) {
      return response.status(404).json({
        message: "Product not found in wishlist",
        error: true,
        success: false,
      });
    }

    return response.json({
      message: "Wishlist item updated successfully",
      error: false,
      success: true,
      data: updatedItem,
    });
  } catch (error) {
    console.error("Error updating wishlist item:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Check if product is in wishlist
const checkWishlistController = async (request, response) => {
  try {
    const userId = request.userId;
    const { productId } = request.params;

    const wishlistItem = await WishlistModel.findOne({ userId, productId });

    return response.json({
      message: "Wishlist status checked",
      error: false,
      success: true,
      data: {
        inWishlist: !!wishlistItem,
        item: wishlistItem,
      },
    });
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Move all wishlist items to cart
const moveWishlistToCartController = async (request, response) => {
  try {
    const userId = request.userId;

    const wishlistItems = await WishlistModel.find({ userId })
      .populate("productId", "stock publish");

    if (wishlistItems.length === 0) {
      return response.status(400).json({
        message: "Wishlist is empty",
        error: true,
        success: false,
      });
    }

    const CartProductModel = require("../models/cartProduct.model.js");
    const addedItems = [];
    const failedItems = [];

    for (const item of wishlistItems) {
      if (!item.productId || !item.productId.publish || item.productId.stock <= 0) {
        failedItems.push({
          productId: item.productId?._id,
          reason: !item.productId ? "Product not found" : 
                  !item.productId.publish ? "Product not available" : 
                  "Out of stock"
        });
        continue;
      }

      try {
        // Check if already in cart
        const existingCartItem = await CartProductModel.findOne({
          userId,
          productId: item.productId._id,
        });

        if (!existingCartItem) {
          const cartItem = new CartProductModel({
            userId,
            productId: item.productId._id,
            quantity: 1,
          });
          await cartItem.save();
          addedItems.push(item.productId._id);
        }
      } catch (error) {
        failedItems.push({
          productId: item.productId._id,
          reason: "Failed to add to cart"
        });
      }
    }

    // Remove successfully added items from wishlist
    if (addedItems.length > 0) {
      await WishlistModel.deleteMany({
        userId,
        productId: { $in: addedItems },
      });

      // Update user wishlist count
      await UserModel.findByIdAndUpdate(userId, {
        $inc: { "activity.wishlistItems": -addedItems.length },
      });
    }

    return response.json({
      message: `${addedItems.length} items moved to cart successfully`,
      error: false,
      success: true,
      data: {
        addedCount: addedItems.length,
        failedCount: failedItems.length,
        failedItems,
      },
    });
  } catch (error) {
    console.error("Error moving wishlist to cart:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Get wishlist statistics
const getWishlistStats = async (userId) => {
  try {
    const stats = await WishlistModel.aggregate([
      { $match: { userId: userId } },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalValue: { $sum: "$product.price" },
          averagePrice: { $avg: "$product.price" },
          inStockItems: {
            $sum: { $cond: [{ $gt: ["$product.stock", 0] }, 1, 0] },
          },
          outOfStockItems: {
            $sum: { $cond: [{ $eq: ["$product.stock", 0] }, 1, 0] },
          },
        },
      },
    ]);

    return stats[0] || {
      totalItems: 0,
      totalValue: 0,
      averagePrice: 0,
      inStockItems: 0,
      outOfStockItems: 0,
    };
  } catch (error) {
    console.error("Error calculating wishlist stats:", error);
    return {
      totalItems: 0,
      totalValue: 0,
      averagePrice: 0,
      inStockItems: 0,
      outOfStockItems: 0,
    };
  }
};

module.exports = {
  addToWishlistController,
  removeFromWishlistController,
  getWishlistController,
  updateWishlistItemController,
  checkWishlistController,
  moveWishlistToCartController,
};