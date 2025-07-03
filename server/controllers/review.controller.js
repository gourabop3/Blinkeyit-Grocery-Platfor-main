const ReviewModel = require("../models/review.model.js");
const ProductModel = require("../models/product.model.js");
const UserModel = require("../models/user.model.js");
const OrderModel = require("../models/order.model.js");
const { LoyaltyTransactionModel, LoyaltySummaryModel } = require("../models/loyalty.model.js");

// Create a new review
const createReviewController = async (request, response) => {
  try {
    const userId = request.userId;
    const { productId, rating, title, comment, images = [] } = request.body;

    if (!productId || !rating || !title || !comment) {
      return response.status(400).json({
        message: "Product ID, rating, title, and comment are required",
        error: true,
        success: false,
      });
    }

    if (rating < 1 || rating > 5) {
      return response.status(400).json({
        message: "Rating must be between 1 and 5",
        error: true,
        success: false,
      });
    }

    // Check if user already reviewed this product
    const existingReview = await ReviewModel.findOne({ userId, productId });
    if (existingReview) {
      return response.status(400).json({
        message: "You have already reviewed this product",
        error: true,
        success: false,
      });
    }

    // Check if user actually bought this product (for verified badge)
    const hasPurchased = await OrderModel.findOne({
      userId,
      "products.productId": productId,
      payment_status: { $in: ["PAID", "CASH ON DELIVERY"] },
    });

    const newReview = new ReviewModel({
      userId,
      productId,
      rating,
      title,
      comment,
      images,
      verified: !!hasPurchased,
      status: "approved", // Auto-approve for now, can add moderation later
    });

    const savedReview = await newReview.save();

    // Update product rating aggregation
    await updateProductRating(productId);

    // Update user activity
    await UserModel.findByIdAndUpdate(userId, {
      $inc: { "activity.reviewsWritten": 1 },
    });

    // Award loyalty points for writing review
    await awardLoyaltyPoints(userId, 50, "review", "Review written for product");

    // Populate user details for response
    const populatedReview = await ReviewModel.findById(savedReview._id)
      .populate("userId", "name avatar")
      .populate("productId", "name image");

    return response.json({
      message: "Review created successfully",
      error: false,
      success: true,
      data: populatedReview,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Get reviews for a product
const getProductReviewsController = async (request, response) => {
  try {
    const { productId } = request.params;
    const { page = 1, limit = 10, sort = "newest" } = request.query;

    let sortQuery = {};
    switch (sort) {
      case "newest":
        sortQuery = { createdAt: -1 };
        break;
      case "oldest":
        sortQuery = { createdAt: 1 };
        break;
      case "highest":
        sortQuery = { rating: -1, createdAt: -1 };
        break;
      case "lowest":
        sortQuery = { rating: 1, createdAt: -1 };
        break;
      case "helpful":
        sortQuery = { helpfulCount: -1, createdAt: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const reviews = await ReviewModel.find({
      productId,
      status: "approved",
    })
      .populate("userId", "name avatar")
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit));

    const totalReviews = await ReviewModel.countDocuments({
      productId,
      status: "approved",
    });

    // Get rating distribution
    const ratingStats = await ReviewModel.aggregate([
      { $match: { productId: productId, status: "approved" } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]);

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingStats.forEach((stat) => {
      ratingDistribution[stat._id] = stat.count;
    });

    return response.json({
      message: "Reviews fetched successfully",
      error: false,
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasNext: page * limit < totalReviews,
          hasPrev: page > 1,
        },
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Mark review as helpful
const markReviewHelpfulController = async (request, response) => {
  try {
    const userId = request.userId;
    const { reviewId } = request.params;
    const { isHelpful = true } = request.body;

    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      return response.status(404).json({
        message: "Review not found",
        error: true,
        success: false,
      });
    }

    // Check if user already marked this review
    const existingVote = review.helpful.find(
      (vote) => vote.userId.toString() === userId
    );

    if (existingVote) {
      // Update existing vote
      existingVote.isHelpful = isHelpful;
    } else {
      // Add new vote
      review.helpful.push({ userId, isHelpful });
    }

    // Recalculate helpful count
    review.helpfulCount = review.helpful.filter((vote) => vote.isHelpful).length;

    await review.save();

    return response.json({
      message: "Review marked successfully",
      error: false,
      success: true,
      data: {
        helpfulCount: review.helpfulCount,
        userVoted: isHelpful,
      },
    });
  } catch (error) {
    console.error("Error marking review helpful:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Get user's reviews
const getUserReviewsController = async (request, response) => {
  try {
    const userId = request.userId;
    const { page = 1, limit = 10 } = request.query;

    const skip = (page - 1) * limit;

    const reviews = await ReviewModel.find({ userId })
      .populate("productId", "name image price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalReviews = await ReviewModel.countDocuments({ userId });

    return response.json({
      message: "User reviews fetched successfully",
      error: false,
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasNext: page * limit < totalReviews,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Update product rating aggregation
const updateProductRating = async (productId) => {
  try {
    const reviews = await ReviewModel.find({
      productId,
      status: "approved",
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      ratingDistribution[review.rating]++;
    });

    await ProductModel.findByIdAndUpdate(productId, {
      "reviews.totalReviews": totalReviews,
      "reviews.averageRating": Math.round(averageRating * 10) / 10,
      "reviews.ratingDistribution": ratingDistribution,
    });

    console.log(`Updated ratings for product ${productId}: ${averageRating}/5 (${totalReviews} reviews)`);
  } catch (error) {
    console.error("Error updating product rating:", error);
  }
};

// Award loyalty points
const awardLoyaltyPoints = async (userId, points, source, description) => {
  try {
    // Create transaction
    const transaction = new LoyaltyTransactionModel({
      userId,
      points,
      type: "earned",
      source,
      description,
    });
    await transaction.save();

    // Update user loyalty summary
    await UserModel.findByIdAndUpdate(userId, {
      $inc: {
        "loyaltyProfile.currentPoints": points,
        "loyaltyProfile.totalEarned": points,
      },
    });

    console.log(`Awarded ${points} loyalty points to user ${userId} for ${source}`);
  } catch (error) {
    console.error("Error awarding loyalty points:", error);
  }
};

module.exports = {
  createReviewController,
  getProductReviewsController,
  markReviewHelpfulController,
  getUserReviewsController,
  updateProductRating,
};