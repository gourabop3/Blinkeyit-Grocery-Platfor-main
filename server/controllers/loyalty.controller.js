const { LoyaltyTransactionModel, LoyaltySummaryModel } = require("../models/loyalty.model.js");
const UserModel = require("../models/user.model.js");
const OrderModel = require("../models/order.model.js");

// Get user's loyalty summary
const getLoyaltySummaryController = async (request, response) => {
  try {
    const userId = request.userId;

    // Get or create loyalty summary
    let summary = await LoyaltySummaryModel.findOne({ userId });
    
    if (!summary) {
      summary = new LoyaltySummaryModel({ userId });
      await summary.save();
    }

    // Get recent transactions
    const recentTransactions = await LoyaltyTransactionModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("orderId", "orderId totalAmt");

    // Calculate tier progress
    const tierInfo = calculateTierInfo(summary.currentBalance, summary.lifetimeSpent);

    return response.json({
      message: "Loyalty summary fetched successfully",
      error: false,
      success: true,
      data: {
        summary: {
          ...summary.toObject(),
          ...tierInfo,
        },
        recentTransactions,
      },
    });
  } catch (error) {
    console.error("Error fetching loyalty summary:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Get loyalty transactions history
const getLoyaltyHistoryController = async (request, response) => {
  try {
    const userId = request.userId;
    const { page = 1, limit = 20, type, source } = request.query;

    const filter = { userId };
    if (type) filter.type = type;
    if (source) filter.source = source;

    const skip = (page - 1) * limit;

    const transactions = await LoyaltyTransactionModel.find(filter)
      .populate("orderId", "orderId totalAmt createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalTransactions = await LoyaltyTransactionModel.countDocuments(filter);

    return response.json({
      message: "Loyalty history fetched successfully",
      error: false,
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalTransactions / limit),
          totalTransactions,
          hasNext: page * limit < totalTransactions,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching loyalty history:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Redeem loyalty points
const redeemPointsController = async (request, response) => {
  try {
    const userId = request.userId;
    const { points, rewardType = "discount", description } = request.body;

    if (!points || points <= 0) {
      return response.status(400).json({
        message: "Valid points amount is required",
        error: true,
        success: false,
      });
    }

    // Check minimum redemption amount
    const MIN_REDEMPTION = 100;
    if (points < MIN_REDEMPTION) {
      return response.status(400).json({
        message: `Minimum redemption is ${MIN_REDEMPTION} points`,
        error: true,
        success: false,
      });
    }

    // Get user's current points
    const user = await UserModel.findById(userId);
    if (!user || user.loyaltyProfile.currentPoints < points) {
      return response.status(400).json({
        message: "Insufficient points balance",
        error: true,
        success: false,
      });
    }

    // Calculate redemption value (1 point = ₹0.1)
    const redemptionValue = Math.floor(points * 0.1);

    // Create redemption transaction
    const transaction = new LoyaltyTransactionModel({
      userId,
      points: -points, // Negative for redemption
      type: "redeemed",
      source: "redemption",
      description: description || `Redeemed ${points} points for ₹${redemptionValue} discount`,
    });

    await transaction.save();

    // Update user loyalty profile
    await UserModel.findByIdAndUpdate(userId, {
      $inc: {
        "loyaltyProfile.currentPoints": -points,
        "loyaltyProfile.totalRedeemed": points,
      },
    });

    // Generate discount coupon code
    const couponCode = generateCouponCode();
    
    return response.json({
      message: "Points redeemed successfully",
      error: false,
      success: true,
      data: {
        transaction,
        redemptionValue,
        couponCode,
        pointsRemaining: user.loyaltyProfile.currentPoints - points,
      },
    });
  } catch (error) {
    console.error("Error redeeming points:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Award points for purchase
const awardPurchasePointsController = async (orderId) => {
  try {
    const order = await OrderModel.findById(orderId).populate("userId");
    if (!order || !order.userId) return;

    const userId = order.userId._id;
    
    // Calculate points (1% of order value = points, minimum 10 points)
    const basePoints = Math.max(Math.floor(order.totalAmt * 0.01), 10);
    
    // Tier-based multiplier
    const user = await UserModel.findById(userId);
    const tierMultiplier = getTierMultiplier(user.loyaltyProfile.tier);
    const finalPoints = Math.floor(basePoints * tierMultiplier);

    // Create transaction
    const transaction = new LoyaltyTransactionModel({
      userId,
      points: finalPoints,
      type: "earned",
      source: "purchase",
      description: `Earned points for order ${order.orderId}`,
      orderId: order._id,
    });

    await transaction.save();

    // Update user loyalty profile
    await UserModel.findByIdAndUpdate(userId, {
      $inc: {
        "loyaltyProfile.currentPoints": finalPoints,
        "loyaltyProfile.totalEarned": finalPoints,
        "activity.totalSpent": order.totalAmt,
        "activity.totalOrders": 1,
      },
    });

    // Check for tier upgrade
    await checkTierUpgrade(userId);

    console.log(`Awarded ${finalPoints} points to user ${userId} for purchase`);
    return finalPoints;
  } catch (error) {
    console.error("Error awarding purchase points:", error);
  }
};

// Award referral points
const awardReferralPointsController = async (request, response) => {
  try {
    const userId = request.userId;
    const { referredUserId } = request.body;

    if (!referredUserId) {
      return response.status(400).json({
        message: "Referred user ID is required",
        error: true,
        success: false,
      });
    }

    // Check if referral is valid
    const referredUser = await UserModel.findById(referredUserId);
    if (!referredUser || referredUser.referral.referredBy.toString() !== userId) {
      return response.status(400).json({
        message: "Invalid referral",
        error: true,
        success: false,
      });
    }

    // Check if referral reward already given
    const existingReward = await LoyaltyTransactionModel.findOne({
      userId,
      source: "referral",
      referenceId: referredUserId,
    });

    if (existingReward) {
      return response.status(400).json({
        message: "Referral reward already awarded",
        error: true,
        success: false,
      });
    }

    const referralPoints = 500; // Points for successful referral

    // Award points to referrer
    const transaction = new LoyaltyTransactionModel({
      userId,
      points: referralPoints,
      type: "earned",
      source: "referral",
      description: `Referral bonus for inviting ${referredUser.name}`,
      referenceId: referredUserId,
    });

    await transaction.save();

    // Update referrer's points
    await UserModel.findByIdAndUpdate(userId, {
      $inc: {
        "loyaltyProfile.currentPoints": referralPoints,
        "loyaltyProfile.totalEarned": referralPoints,
        "referral.referralCount": 1,
        "referral.referralRewards": referralPoints,
      },
    });

    // Award welcome bonus to referred user
    const welcomePoints = 200;
    const welcomeTransaction = new LoyaltyTransactionModel({
      userId: referredUserId,
      points: welcomePoints,
      type: "earned",
      source: "signup_bonus",
      description: "Welcome bonus for joining through referral",
    });

    await welcomeTransaction.save();

    await UserModel.findByIdAndUpdate(referredUserId, {
      $inc: {
        "loyaltyProfile.currentPoints": welcomePoints,
        "loyaltyProfile.totalEarned": welcomePoints,
      },
    });

    return response.json({
      message: "Referral rewards awarded successfully",
      error: false,
      success: true,
      data: {
        referrerPoints: referralPoints,
        referredUserPoints: welcomePoints,
      },
    });
  } catch (error) {
    console.error("Error awarding referral points:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Helper functions
const calculateTierInfo = (currentPoints, lifetimeSpent) => {
  const tiers = {
    bronze: { minSpent: 0, minPoints: 0, benefits: "Basic rewards", multiplier: 1 },
    silver: { minSpent: 5000, minPoints: 1000, benefits: "5% extra points", multiplier: 1.05 },
    gold: { minSpent: 15000, minPoints: 3000, benefits: "10% extra points", multiplier: 1.1 },
    platinum: { minSpent: 50000, minPoints: 10000, benefits: "15% extra points + VIP support", multiplier: 1.15 },
  };

  let currentTier = "bronze";
  let nextTier = "silver";
  let progressToNext = 0;

  if (lifetimeSpent >= tiers.platinum.minSpent && currentPoints >= tiers.platinum.minPoints) {
    currentTier = "platinum";
    nextTier = null;
    progressToNext = 100;
  } else if (lifetimeSpent >= tiers.gold.minSpent && currentPoints >= tiers.gold.minPoints) {
    currentTier = "gold";
    nextTier = "platinum";
    progressToNext = (lifetimeSpent / tiers.platinum.minSpent) * 100;
  } else if (lifetimeSpent >= tiers.silver.minSpent && currentPoints >= tiers.silver.minPoints) {
    currentTier = "silver";
    nextTier = "gold";
    progressToNext = (lifetimeSpent / tiers.gold.minSpent) * 100;
  } else {
    nextTier = "silver";
    progressToNext = (lifetimeSpent / tiers.silver.minSpent) * 100;
  }

  return {
    currentTier,
    nextTier,
    progressToNext: Math.min(progressToNext, 100),
    tierBenefits: tiers[currentTier].benefits,
    pointsMultiplier: tiers[currentTier].multiplier,
  };
};

const getTierMultiplier = (tier) => {
  const multipliers = {
    bronze: 1,
    silver: 1.05,
    gold: 1.1,
    platinum: 1.15,
  };
  return multipliers[tier] || 1;
};

const checkTierUpgrade = async (userId) => {
  try {
    const user = await UserModel.findById(userId);
    const tierInfo = calculateTierInfo(
      user.loyaltyProfile.currentPoints,
      user.activity.totalSpent
    );

    if (tierInfo.currentTier !== user.loyaltyProfile.tier) {
      await UserModel.findByIdAndUpdate(userId, {
        "loyaltyProfile.tier": tierInfo.currentTier,
      });

      // Award tier upgrade bonus
      const bonusPoints = {
        silver: 100,
        gold: 250,
        platinum: 500,
      };

      if (bonusPoints[tierInfo.currentTier]) {
        const transaction = new LoyaltyTransactionModel({
          userId,
          points: bonusPoints[tierInfo.currentTier],
          type: "bonus",
          source: "tier_upgrade",
          description: `Tier upgrade bonus - Welcome to ${tierInfo.currentTier} tier!`,
        });

        await transaction.save();

        await UserModel.findByIdAndUpdate(userId, {
          $inc: {
            "loyaltyProfile.currentPoints": bonusPoints[tierInfo.currentTier],
            "loyaltyProfile.totalEarned": bonusPoints[tierInfo.currentTier],
          },
        });
      }

      console.log(`User ${userId} upgraded to ${tierInfo.currentTier} tier`);
    }
  } catch (error) {
    console.error("Error checking tier upgrade:", error);
  }
};

const generateCouponCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "GROCERY";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

module.exports = {
  getLoyaltySummaryController,
  getLoyaltyHistoryController,
  redeemPointsController,
  awardPurchasePointsController,
  awardReferralPointsController,
};