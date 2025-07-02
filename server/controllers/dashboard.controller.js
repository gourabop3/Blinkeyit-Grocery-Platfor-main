const UserModel = require("../models/user.model.js");
const ProductModel = require("../models/product.model.js");
const OrderModel = require("../models/order.model.js");

const getDashboardStatsController = async (request, response) => {
  try {
    console.log("Dashboard API called by user:", request.userId);
    
    // Get total users count
    const totalUsers = await UserModel.countDocuments();
    
    // Get total products count
    const totalProducts = await ProductModel.countDocuments();
    
    // Get total orders count
    const totalOrders = await OrderModel.countDocuments();
    
    // Calculate total revenue
    const revenueAggregate = await OrderModel.aggregate([
      {
        $match: {
          order_status: { $ne: "Cancelled" } // Exclude cancelled orders from revenue
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmt" }
        }
      }
    ]);
    const totalRevenue = revenueAggregate.length > 0 ? revenueAggregate[0].totalRevenue : 0;
    
    // Get order status counts
    const orderStatusCounts = await OrderModel.aggregate([
      {
        $group: {
          _id: "$order_status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Initialize order status counts
    let pendingOrders = 0;
    let shippedOrders = 0;
    let deliveredOrders = 0;
    
    // Map the aggregated results
    orderStatusCounts.forEach(status => {
      if (status._id) {
        switch (status._id.toLowerCase()) {
          case "processing":
          case "pending":
            pendingOrders = status.count;
            break;
          case "shipped":
          case "shipping":
            shippedOrders = status.count;
            break;
          case "delivered":
          case "completed":
            deliveredOrders = status.count;
            break;
        }
      }
    });
    
    // Get recent orders (last 5)
    const recentOrders = await OrderModel.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderId userId totalAmt order_status createdAt')
      .lean(); // Use lean() for better performance
    
    const dashboardData = {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimal places
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      recentOrders: recentOrders.map(order => ({
        _id: order._id,
        orderId: order.orderId || order._id.toString(),
        customerName: order.userId?.name || order.userId?.email || "Unknown Customer",
        totalAmt: order.totalAmt || 0,
        order_status: order.order_status || "Unknown",
        createdAt: order.createdAt
      }))
    };

    console.log("Dashboard data prepared:", {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: dashboardData.totalRevenue,
      recentOrdersCount: recentOrders.length
    });

    return response.status(200).json({
      message: "Dashboard data fetched successfully",
      error: false,
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return response.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
      data: {
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        recentOrders: []
      }
    });
  }
};

module.exports = {
  getDashboardStatsController
};