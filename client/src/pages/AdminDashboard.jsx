import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiShoppingCart,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiRefreshCw,
  FiUsers,
  FiEye,
  FiArrowUp,
  FiArrowDown,
  FiActivity,
  FiShoppingBag,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import { MdPendingActions, MdLocalShipping, MdDone } from "react-icons/md";
import { AiOutlineShoppingCart } from "react-icons/ai";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import Loading from "../components/Loading";

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2000, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = countRef.current;
    const endValue = value;

    const timer = setInterval(() => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
      
      setCount(currentValue);
      countRef.current = currentValue;

      if (progress === 1) {
        clearInterval(timer);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <span className="font-bold">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 1247,
    totalProducts: 423,
    totalOrders: 1829,
    totalRevenue: 125000,
    totalSales: 2847,
    pendingOrders: 45,
    shippedOrders: 123,
    deliveredOrders: 1661,
    recentOrders: [],
    topProducts: [],
    recentCustomers: [],
    todayStats: {
      visitors: 2847,
      sales: 152,
      revenue: 12450,
      conversion: 3.2
    },
    growth: {
      users: 12.5,
      orders: 8.3,
      revenue: 15.2,
      products: 4.7
    }
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const response = await Axios({
        ...SummaryApi.getDashboardStats,
      });

      if (response?.data?.success) {
        setDashboardData(prev => ({
          ...prev,
          ...response.data.data
        }));
        setLastUpdated(new Date());
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    fetchDashboardData();
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
        </div>
      </div>

      <div className="relative p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <HiSparkles className="text-yellow-400 text-2xl animate-pulse" />
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-gray-300 text-lg">
              Welcome back! Here's what's happening with your store.
            </p>
            {lastUpdated && (
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <FiActivity className="text-green-400" />
                Last updated: {lastUpdated.toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            <FiRefreshCw className={`text-lg ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="group relative bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl transition-all duration-300 hover:transform hover:scale-105 hover:bg-white/15">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <FiUsers className="text-blue-400 text-2xl" />
                </div>
                <div className="flex items-center text-green-400 text-sm font-medium">
                  <FiArrowUp className="mr-1" />
                  +{dashboardData.growth.users}%
                </div>
              </div>
              <h3 className="text-gray-300 text-sm font-medium mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-white">
                <AnimatedCounter value={dashboardData.totalUsers} />
              </p>
              <p className="text-gray-400 text-xs mt-2">Active users this month</p>
            </div>
          </div>

          {/* Total Products */}
          <div className="group relative bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl transition-all duration-300 hover:transform hover:scale-105 hover:bg-white/15">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <FiPackage className="text-green-400 text-2xl" />
                </div>
                <div className="flex items-center text-green-400 text-sm font-medium">
                  <FiArrowUp className="mr-1" />
                  +{dashboardData.growth.products}%
                </div>
              </div>
              <h3 className="text-gray-300 text-sm font-medium mb-2">Total Products</h3>
              <p className="text-3xl font-bold text-white">
                <AnimatedCounter value={dashboardData.totalProducts} />
              </p>
              <p className="text-gray-400 text-xs mt-2">Products in inventory</p>
            </div>
          </div>

          {/* Total Orders */}
          <div className="group relative bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl transition-all duration-300 hover:transform hover:scale-105 hover:bg-white/15">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <FiShoppingCart className="text-purple-400 text-2xl" />
                </div>
                <div className="flex items-center text-green-400 text-sm font-medium">
                  <FiArrowUp className="mr-1" />
                  +{dashboardData.growth.orders}%
                </div>
              </div>
              <h3 className="text-gray-300 text-sm font-medium mb-2">Total Orders</h3>
              <p className="text-3xl font-bold text-white">
                <AnimatedCounter value={dashboardData.totalOrders} />
              </p>
              <p className="text-gray-400 text-xs mt-2">Orders processed</p>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="group relative bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl transition-all duration-300 hover:transform hover:scale-105 hover:bg-white/15">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <FiDollarSign className="text-orange-400 text-2xl" />
                </div>
                <div className="flex items-center text-green-400 text-sm font-medium">
                  <FiArrowUp className="mr-1" />
                  +{dashboardData.growth.revenue}%
                </div>
              </div>
              <h3 className="text-gray-300 text-sm font-medium mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-white">
                <AnimatedCounter value={dashboardData.totalRevenue} prefix="₹" />
              </p>
              <p className="text-gray-400 text-xs mt-2">Revenue this month</p>
            </div>
          </div>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FiEye className="text-blue-400 text-xl" />
              </div>
              <div>
                <h4 className="text-gray-300 text-sm">Today's Visitors</h4>
                <p className="text-2xl font-bold text-white">
                  <AnimatedCounter value={dashboardData.todayStats.visitors} />
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <FiShoppingBag className="text-green-400 text-xl" />
              </div>
              <div>
                <h4 className="text-gray-300 text-sm">Today's Sales</h4>
                <p className="text-2xl font-bold text-white">
                  <AnimatedCounter value={dashboardData.todayStats.sales} />
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <FiDollarSign className="text-purple-400 text-xl" />
              </div>
              <div>
                <h4 className="text-gray-300 text-sm">Today's Revenue</h4>
                <p className="text-2xl font-bold text-white">
                  <AnimatedCounter value={dashboardData.todayStats.revenue} prefix="₹" />
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <FiTrendingUp className="text-orange-400 text-xl" />
              </div>
              <div>
                <h4 className="text-gray-300 text-sm">Conversion Rate</h4>
                <p className="text-2xl font-bold text-white">
                  <AnimatedCounter value={dashboardData.todayStats.conversion} suffix="%" />
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Recent Orders</h3>
            <Link 
              to="/dashboard/order" 
              className="text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium"
            >
              View all →
            </Link>
          </div>
          
          {dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 text-gray-300 font-medium">Order ID</th>
                    <th className="text-left py-3 text-gray-300 font-medium">Customer</th>
                    <th className="text-left py-3 text-gray-300 font-medium">Status</th>
                    <th className="text-left py-3 text-gray-300 font-medium">Amount</th>
                    <th className="text-left py-3 text-gray-300 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentOrders.slice(0, 5).map((order, index) => (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 text-white font-medium">
                        #{order._id?.slice(-6)}
                      </td>
                      <td className="py-4 text-gray-300">
                        {order.delivery_address?.name || 'N/A'}
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.order_status === 'delivered' 
                            ? 'bg-green-500/20 text-green-400'
                            : order.order_status === 'shipped'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-orange-500/20 text-orange-400'
                        }`}>
                          {order.order_status}
                        </span>
                      </td>
                      <td className="py-4 text-white font-medium">
                        ₹{order.totalAmount?.toLocaleString()}
                      </td>
                      <td className="py-4 text-gray-300">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FiShoppingBag className="mx-auto text-gray-400 text-4xl mb-4" />
              <p className="text-gray-400">No recent orders found</p>
              <p className="text-gray-500 text-sm mt-2">Orders will appear here when customers start placing them.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;