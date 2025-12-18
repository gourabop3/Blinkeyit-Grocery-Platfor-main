import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiShoppingCart,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiRefreshCw,
  FiUsers,
  FiEye,
  FiActivity,
  FiTruck,
  FiMapPin,
  FiClock,
  FiUser,
  FiPhone,
  FiStar,
  FiFilter,
  FiDownload,
  FiSettings,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import Loading from "../components/Loading";
import toast from "react-hot-toast";

const NewAdminDashboard = () => {
  const navigate = useNavigate();
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
  const [deliveryData, setDeliveryData] = useState({
    activeDeliveries: [],
    deliveryAnalytics: null,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');

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

  const fetchDeliveryData = async () => {
    try {
      // Fetch active deliveries
      const deliveriesResponse = await Axios({
        ...SummaryApi.getAllActiveDeliveries
      });

      // Fetch delivery analytics
      const analyticsResponse = await Axios({
        ...SummaryApi.getDeliveryAnalytics
      });

      setDeliveryData({
        activeDeliveries: deliveriesResponse.data.success ? deliveriesResponse.data.data.deliveries : [],
        deliveryAnalytics: analyticsResponse.data.success ? analyticsResponse.data.data : null,
      });
    } catch (error) {
      console.error("Delivery data fetch error:", error);
    }
  };


  useEffect(() => {
    fetchDashboardData();
    fetchDeliveryData();
    
    // Set up auto-refresh every 30 seconds for real-time data
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchDeliveryData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ icon: Icon, title, value, color, bgColor, iconBg, trend, onClick }) => (
    <div 
      className={`${bgColor} rounded-2xl p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
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


  const ActiveDeliveryCard = ({ delivery }) => {
    const getStatusColor = (status) => {
      const colors = {
        assigned: 'bg-blue-100 text-blue-800',
        pickup_started: 'bg-yellow-100 text-yellow-800',
        picked_up: 'bg-orange-100 text-orange-800',
        in_transit: 'bg-purple-100 text-purple-800',
        arrived: 'bg-green-100 text-green-800',
        delivered: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        cancelled: 'bg-gray-100 text-gray-800',
      };
      return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
      <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-semibold text-gray-900">
              #{delivery.orderId?.orderId?.slice(-6) || 'N/A'}
            </div>
            <div className="text-sm text-gray-500">
              ₹{delivery.orderId?.totalAmt?.toFixed(2) || '0.00'}
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
            {delivery.status?.replace('_', ' ')?.toUpperCase()}
          </div>
        </div>

        {delivery.deliveryPartnerId && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <FiUser className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">{delivery.deliveryPartnerId.name}</span>
              <FiPhone className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">{delivery.deliveryPartnerId.mobile}</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Distance:</span>
            <span className="font-medium">
              {delivery.liveUpdates?.distanceToCustomer 
                ? `${delivery.liveUpdates.distanceToCustomer.toFixed(1)} km`
                : 'Calculating...'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">ETA:</span>
            <span className="font-medium">
              {delivery.metrics?.estimatedDeliveryTime 
                ? new Date(delivery.metrics.estimatedDeliveryTime).toLocaleTimeString()
                : 'N/A'}
            </span>
          </div>
        </div>

        <div className="mt-3 flex space-x-2">
          <button
            onClick={() => navigate(`/track/${delivery.orderId._id}`)}
            className="flex-1 py-1 px-2 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
          >
            🔍 Track
          </button>
          <button
            onClick={() => navigate(`/dashboard/admin/orders`)}
            className="flex-1 py-1 px-2 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition-colors"
          >
            📋 Manage
          </button>
        </div>
      </div>
    );
  };

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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive delivery management system</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Tab Navigation */}
          <div className="flex bg-white rounded-lg shadow-sm border">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('deliveries')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'deliveries'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Live Deliveries
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                false
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
            </button>
          </div>
          
          <button
            onClick={() => {
              fetchDashboardData();
              fetchDeliveryData();
            }}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
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

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
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
              onClick={() => navigate('/dashboard/admin/orders')}
            />
            <StatCard
              icon={FiDollarSign}
              title="Total Revenue"
              value={`₹${(dashboardData.totalRevenue || 0).toLocaleString()}`}
              color="text-orange-600"
              bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
              iconBg="bg-orange-200"
              trend="15"
            />
          </div>

          {/* Delivery Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard
              icon={FiTruck}
              title="Active Deliveries"
              value={deliveryData.activeDeliveries.length}
              color="text-blue-600"
              bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
              iconBg="bg-blue-200"
              onClick={() => setActiveTab('deliveries')}
            />
            <StatCard
              icon={FiCheckCircle}
              title="Success Rate"
              value={deliveryData.deliveryAnalytics?.successRate ? `${deliveryData.deliveryAnalytics.successRate.toFixed(1)}%` : 'N/A'}
              color="text-emerald-600"
              bgColor="bg-gradient-to-br from-emerald-50 to-emerald-100"
              iconBg="bg-emerald-200"
            />
            <StatCard
              icon={FiClock}
              title="Avg Delivery Time"
              value={deliveryData.deliveryAnalytics?.avgDeliveryTime ? `${Math.round(deliveryData.deliveryAnalytics.avgDeliveryTime)} min` : 'N/A'}
              color="text-indigo-600"
              bgColor="bg-gradient-to-br from-indigo-50 to-indigo-100"
              iconBg="bg-indigo-200"
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
                  Manage All Orders
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
                            ₹{(order.totalAmt || 0).toFixed(2)}
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
        </>
      )}

      {/* Live Deliveries Tab */}
      {activeTab === 'deliveries' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Live Delivery Tracking</h2>
            <div className="flex items-center gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Deliveries</option>
                <option value="assigned">Assigned</option>
                <option value="pickup_started">Pickup Started</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="arrived">Arrived</option>
              </select>
              <button
                onClick={() => navigate('/dashboard/admin/orders')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Manage Orders
              </button>
            </div>
          </div>

          {deliveryData.activeDeliveries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deliveryData.activeDeliveries
                .filter(delivery => filterStatus === 'all' || delivery.status === filterStatus)
                .map((delivery) => (
                  <ActiveDeliveryCard key={delivery._id} delivery={delivery} />
                ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center">
              <FiTruck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500 mb-2">No Active Deliveries</h3>
              <p className="text-gray-400">Active deliveries will appear here</p>
            </div>
          )}
        </div>
      )}


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