const UserModel = require("../models/user.model.js");
const ProductModel = require("../models/product.model.js");
const OrderModel = require("../models/order.model.js");

const getDashboardStatsController = async (request, response) => {
  try {
    // Get total users count
    const totalUsers = await UserModel.countDocuments();
    
    // Get total products count
    const totalProducts = await ProductModel.countDocuments();
    
    // Get total orders count
    const totalOrders = await OrderModel.countDocuments();
    
    // Calculate total revenue
    const revenueAggregate = await OrderModel.aggregate([
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
      switch (status._id) {
        case "Processing":
          pendingOrders = status.count;
          break;
        case "Shipped":
          shippedOrders = status.count;
          break;
        case "Delivered":
          deliveredOrders = status.count;
          break;
      }
    });
    
    // Get recent orders (last 5)
    const recentOrders = await OrderModel.find()
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderId userId totalAmt order_status createdAt');
    
    const dashboardData = {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      recentOrders: recentOrders.map(order => ({
        _id: order._id,
        orderId: order.orderId,
        customerName: order.userId?.name || "Unknown Customer",
        totalAmt: order.totalAmt,
        order_status: order.order_status,
        createdAt: order.createdAt
      }))
    };

    return response.json({
      message: "Dashboard data fetched successfully",
      error: false,
      success: true,
      data: dashboardData
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false
    });
  }
};

module.exports = {
  getDashboardStatsController
};