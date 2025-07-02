import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiShoppingCart,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiRefreshCw,
  FiUsers,
  FiEye,
  FiArrowUpRight,
  FiArrowDownRight,
  FiCalendar,
  FiClock,
  FiMapPin,
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import Loading from "../components/Loading";

const ModernAdminDashboard = () => {
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

  // Enhanced mock data for better visualization
  const chartData = [
    { date: "Jan 15", revenue: 12500, orders: 45, users: 12 },
    { date: "Jan 16", revenue: 15200, orders: 52, users: 18 },
    { date: "Jan 17", revenue: 18700, orders: 67, users: 25 },
    { date: "Jan 18", revenue: 14200, orders: 41, users: 15 },
    { date: "Jan 19", revenue: 19800, orders: 73, users: 32 },
    { date: "Jan 20", revenue: 22100, orders: 89, users: 28 },
    { date: "Jan 21", revenue: 16900, orders: 61, users: 22 },
  ];

  const orderStatusData = [
    { name: "Processing", value: 145, color: "#F59E0B" },
    { name: "Shipped", value: 234, color: "#3B82F6" },
    { name: "Delivered", value: 567, color: "#10B981" },
    { name: "Cancelled", value: 23, color: "#EF4444" },
  ];

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

  const StatCard = ({ icon: Icon, title, value, change, trend, color, bgColor, gradient }) => (
    <div className={`${bgColor} ${gradient} rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className={`${color} p-3 rounded-xl shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            {change && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {trend === "up" ? (
                  <FiArrowUpRight className="w-3 h-3" />
                ) : (
                  <FiArrowDownRight className="w-3 h-3" />
                )}
                <span>{change}%</span>
              </div>
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ icon: Icon, title, description, href, color }) => (
    <Link
      to={href}
      className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className={`${color} p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
        <span>Get started</span>
        <FiArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </div>
    </Link>
  );

  if (loading && !lastUpdated) {
    return <Loading />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h1>
              <p className="text-blue-100 text-lg">Here's what's happening with your business today.</p>
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 disabled:opacity-50 transition-all duration-300 border border-white/30"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center">
            <div className="bg-red-100 rounded-full p-2 mr-4">
              <FiTrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800">Data Loading Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FiDollarSign}
          title="Total Revenue"
          value={`$${(dashboardData.totalRevenue || 125430).toLocaleString()}`}
          change={12.5}
          trend="up"
          color="bg-gradient-to-r from-green-500 to-emerald-600"
          bgColor="bg-white"
        />
        <StatCard
          icon={FiShoppingCart}
          title="Total Orders"
          value={(dashboardData.totalOrders || 1247).toLocaleString()}
          change={8.3}
          trend="up"
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          bgColor="bg-white"
        />
        <StatCard
          icon={FiUsers}
          title="Total Users"
          value={(dashboardData.totalUsers || 3542).toLocaleString()}
          change={15.2}
          trend="up"
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          bgColor="bg-white"
        />
        <StatCard
          icon={FiPackage}
          title="Total Products"
          value={(dashboardData.totalProducts || 156).toLocaleString()}
          change={5.1}
          trend="up"
          color="bg-gradient-to-r from-orange-500 to-orange-600"
          bgColor="bg-white"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart - Takes 2 columns */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Revenue Overview</h3>
              <p className="text-gray-600 text-sm">Daily revenue for the last 7 days</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Revenue</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
                formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} 
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                strokeWidth={3}
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Order Status</h3>
            <p className="text-gray-600 text-sm">Distribution of order statuses</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                stroke="none"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {orderStatusData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
          <div className="space-y-4">
            <QuickActionCard
              icon={FiUsers}
              title="Manage Users"
              description="View and manage customer accounts"
              href="/modern-admin/users"
              color="bg-gradient-to-r from-purple-500 to-purple-600"
            />
            <QuickActionCard
              icon={FiShoppingCart}
              title="View Orders"
              description="Track and update order status"
              href="/modern-admin/orders"
              color="bg-gradient-to-r from-blue-500 to-blue-600"
            />
            <QuickActionCard
              icon={FiTrendingUp}
              title="Analytics"
              description="Business insights and reports"
              href="/modern-admin/analytics"
              color="bg-gradient-to-r from-green-500 to-emerald-600"
            />
          </div>
        </div>

        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
              <p className="text-gray-600 text-sm">Latest customer orders</p>
            </div>
            <Link
              to="/modern-admin/orders"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              View All
              <FiArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {dashboardData.recentOrders.length > 0 ? (
              dashboardData.recentOrders.slice(0, 5).map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiShoppingCart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.customerName || "Unknown Customer"}</p>
                      <p className="text-sm text-gray-600">{order.orderId || order._id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${(order.totalAmt || 0).toFixed(2)}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      order.order_status === "Processing"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.order_status === "Shipped"
                        ? "bg-blue-100 text-blue-800"
                        : order.order_status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {order.order_status || "Unknown"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No recent orders</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {lastUpdated && (
        <div className="text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center">
            <FiClock className="w-3 h-3 mr-1" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default ModernAdminDashboard;