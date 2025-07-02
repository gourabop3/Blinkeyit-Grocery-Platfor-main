import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiShoppingCart,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiRefreshCw,
  FiUsers,
  FiEye,
  FiActivity,
} from "react-icons/fi";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import Loading from "../components/Loading";

const NewAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching dashboard data...");
      
      const response = await Axios({
        ...SummaryApi.getDashboardStats
      });

      console.log("Dashboard API response:", response.data);

      if (response.data.success) {
        setDashboardData(response.data.data);
        setLastUpdated(new Date());
        console.log("Dashboard data updated successfully");
      } else {
        throw new Error(response.data.message || "Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Dashboard API Error:", error);
      setError(error.response?.data?.message || error.message || "Failed to load dashboard data");
      AxiosToastError(error);
      
      // Set default values on error
      setDashboardData({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        recentOrders: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 30 seconds for real-time data
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ icon: Icon, title, value, color, bgColor, iconBg, trend }) => (
    <div className={`${bgColor} rounded-2xl p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`${iconBg} p-4 rounded-xl mr-4 shadow-md`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            {trend && (
              <p className="text-sm text-green-600 font-medium mt-1">
                +{trend}% from last month
              </p>
            )}
          </div>
        </div>
        <div className="hidden md:block">
          <div className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center opacity-20`}>
            <Icon className={`w-8 h-8 ${color}`} />
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && !lastUpdated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Dashboard Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-xl p-6 shadow-md">
          <div className="flex items-center">
            <FiActivity className="w-6 h-6 text-red-500 mr-3" />
            <div>
              <h3 className="text-red-800 font-semibold">System Alert</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard
          icon={FiUsers}
          title="Total Users"
          value={dashboardData.totalUsers.toLocaleString()}
          color="text-purple-600"
          bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
          iconBg="bg-purple-200"
          trend="12"
        />
        <StatCard
          icon={FiPackage}
          title="Total Products"
          value={dashboardData.totalProducts.toLocaleString()}
          color="text-green-600"
          bgColor="bg-gradient-to-br from-green-50 to-green-100"
          iconBg="bg-green-200"
          trend="8"
        />
        <StatCard
          icon={FiShoppingCart}
          title="Total Orders"
          value={dashboardData.totalOrders.toLocaleString()}
          color="text-blue-600"
          bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
          iconBg="bg-blue-200"
          trend="23"
        />
        <StatCard
          icon={FiDollarSign}
          title="Total Revenue"
          value={`$${(dashboardData.totalRevenue || 0).toLocaleString()}`}
          color="text-orange-600"
          bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
          iconBg="bg-orange-200"
          trend="15"
        />
      </div>

      {/* Order Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          icon={FiShoppingCart}
          title="Pending Orders"
          value={dashboardData.pendingOrders.toLocaleString()}
          color="text-yellow-600"
          bgColor="bg-gradient-to-br from-yellow-50 to-yellow-100"
          iconBg="bg-yellow-200"
        />
        <StatCard
          icon={FiTrendingUp}
          title="Shipped Orders"
          value={dashboardData.shippedOrders.toLocaleString()}
          color="text-indigo-600"
          bgColor="bg-gradient-to-br from-indigo-50 to-indigo-100"
          iconBg="bg-indigo-200"
        />
        <StatCard
          icon={FiPackage}
          title="Delivered Orders"
          value={dashboardData.deliveredOrders.toLocaleString()}
          color="text-emerald-600"
          bgColor="bg-gradient-to-br from-emerald-50 to-emerald-100"
          iconBg="bg-emerald-200"
        />
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
        <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Recent Orders</h3>
              <p className="text-gray-600 mt-1">Latest customer orders and their status</p>
            </div>
            <Link
              to="/dashboard/admin/orders"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl text-sm font-semibold"
            >
              <FiEye className="w-4 h-4" />
              View All Orders
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {dashboardData.recentOrders.length > 0 ? (
                dashboardData.recentOrders.map((order, index) => (
                  <tr key={order._id || index} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                          {(order.customerName || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {order.customerName || "Unknown Customer"}
                          </div>
                          <div className="text-xs text-gray-500">Customer</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900 bg-gray-100 px-3 py-1 rounded-lg inline-block">
                        {(order.orderId || order._id || '').slice(-8)}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span
                        className={`inline-flex px-4 py-2 text-xs font-bold rounded-full shadow-sm ${
                          order.order_status === "Processing"
                            ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800"
                            : order.order_status === "Shipped"
                            ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800"
                            : order.order_status === "Delivered"
                            ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
                            : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800"
                        }`}
                      >
                        {order.order_status || "Unknown"}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-lg font-bold text-gray-900">
                        ${(order.totalAmt || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FiPackage className="w-16 h-16 text-gray-300 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-500 mb-2">
                        {error ? "Unable to load orders" : "No recent orders"}
                      </h3>
                      <p className="text-gray-400">
                        {error ? "Please check your connection and try again" : "New orders will appear here"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer with last updated time */}
      {lastUpdated && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 bg-white rounded-full px-6 py-2 inline-block shadow-sm">
            Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refresh every 30 seconds
          </p>
        </div>
      )}
    </div>
  );
};

export default NewAdminDashboard;