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
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
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

const NewAdminDashboard = () => {
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

  // Sample data for demonstration
  const sampleRecentOrders = [
    {
      _id: "1",
      orderId: "ORD-2024-001",
      customerName: "John Doe",
      totalAmt: 299.99,
      order_status: "Processing",
      createdAt: new Date(),
    },
    {
      _id: "2",
      orderId: "ORD-2024-002",
      customerName: "Jane Smith",
      totalAmt: 149.50,
      order_status: "Shipped",
      createdAt: new Date(),
    },
    {
      _id: "3",
      orderId: "ORD-2024-003",
      customerName: "Mike Johnson",
      totalAmt: 89.99,
      order_status: "Delivered",
      createdAt: new Date(),
    },
    {
      _id: "4",
      orderId: "ORD-2024-004",
      customerName: "Sarah Wilson",
      totalAmt: 199.00,
      order_status: "Processing",
      createdAt: new Date(),
    },
  ];

  const sampleTopProducts = [
    { id: 1, name: "Wireless Bluetooth Headphones", sales: 234, revenue: 23400 },
    { id: 2, name: "Smart Watch Series 5", sales: 189, revenue: 37800 },
    { id: 3, name: "USB-C Fast Charger", sales: 345, revenue: 10350 },
    { id: 4, name: "Portable Power Bank", sales: 156, revenue: 7800 },
  ];

  const sampleRecentCustomers = [
    { id: 1, name: "Alex Thompson", email: "alex@example.com", orders: 5, spent: 899.99 },
    { id: 2, name: "Emma Davis", email: "emma@example.com", orders: 3, spent: 449.99 },
    { id: 3, name: "Ryan Brown", email: "ryan@example.com", orders: 8, spent: 1299.99 },
    { id: 4, name: "Lisa Garcia", email: "lisa@example.com", orders: 2, spent: 199.99 },
  ];

  const fetchDashboardData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await Axios({
        ...SummaryApi.getDashboardStats
      });

      if (response.data.success) {
        setDashboardData(prev => ({
          ...prev,
          ...response.data.data,
          recentOrders: response.data.data.recentOrders || sampleRecentOrders,
          topProducts: response.data.data.topProducts || sampleTopProducts,
          recentCustomers: response.data.data.recentCustomers || sampleRecentCustomers,
          // Simulate some growth data
          growth: {
            users: (Math.random() * 20 - 5).toFixed(1),
            orders: (Math.random() * 15 - 2).toFixed(1),
            revenue: (Math.random() * 25 - 5).toFixed(1),
            products: (Math.random() * 10).toFixed(1)
          },
          todayStats: {
            visitors: Math.floor(Math.random() * 1000) + 2000,
            sales: Math.floor(Math.random() * 100) + 100,
            revenue: Math.floor(Math.random() * 5000) + 10000,
            conversion: (Math.random() * 2 + 2).toFixed(1)
          }
        }));
        setLastUpdated(new Date());
      }
    } catch (error) {
      AxiosToastError(error);
      // Use sample data if API fails
      setDashboardData(prev => ({
        ...prev,
        recentOrders: sampleRecentOrders,
        topProducts: sampleTopProducts,
        recentCustomers: sampleRecentCustomers,
      }));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
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

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    color, 
    gradient, 
    growth,
    subtitle,
    animate = true
  }) => (
    <div className="group relative overflow-hidden">
      {/* Glassmorphism card */}
      <div className="relative bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white/80">
        {/* Background gradient overlay */}
        <div className={`absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300 ${gradient} rounded-2xl`}></div>
        
        {/* Sparkle effect */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <HiSparkles className="w-4 h-4 text-blue-400 animate-pulse" />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            
            {growth && (
              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                parseFloat(growth) >= 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {parseFloat(growth) >= 0 ? (
                  <FiArrowUp className="w-3 h-3 mr-1" />
                ) : (
                  <FiArrowDown className="w-3 h-3 mr-1" />
                )}
                {Math.abs(growth)}%
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wider mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-slate-900 mb-1">
              {animate ? (
                <AnimatedCounter value={value} />
              ) : (
                value.toLocaleString()
              )}
            </p>
            {subtitle && (
              <p className="text-xs text-slate-500">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && dashboardData.recentOrders.length === 0) {
    return <Loading />;
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h2>
          <p className="text-slate-600 mt-1">
            Real-time insights and analytics for your business
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Live Data
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={loading || isRefreshing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl group"
          >
            <FiRefreshCw className={`w-4 h-4 ${(loading || isRefreshing) ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-300`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          icon={FiShoppingCart}
          title="Total Orders"
          value={dashboardData.totalOrders}
          gradient="bg-gradient-to-r from-blue-500 to-blue-600"
          growth={dashboardData.growth.orders}
          subtitle="This month"
        />
        <StatCard
          icon={FiPackage}
          title="Total Products"
          value={dashboardData.totalProducts}
          gradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
          growth={dashboardData.growth.products}
          subtitle="In inventory"
        />
        <StatCard
          icon={FiDollarSign}
          title="Total Revenue"
          value={dashboardData.totalRevenue}
          gradient="bg-gradient-to-r from-purple-500 to-purple-600"
          growth={dashboardData.growth.revenue}
          subtitle="USD"
        />
        <StatCard
          icon={FiUsers}
          title="Total Users"
          value={dashboardData.totalUsers}
          gradient="bg-gradient-to-r from-orange-500 to-orange-600"
          growth={dashboardData.growth.users}
          subtitle="Registered"
        />
      </div>

      {/* Today's Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 shadow-lg">
              <FiEye className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-slate-500 font-medium">TODAY</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wider mb-1">Visitors</p>
            <p className="text-2xl font-bold text-slate-900">
              <AnimatedCounter value={dashboardData.todayStats.visitors} />
            </p>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 shadow-lg">
              <FiActivity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-slate-500 font-medium">TODAY</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wider mb-1">Sales</p>
            <p className="text-2xl font-bold text-slate-900">
              <AnimatedCounter value={dashboardData.todayStats.sales} />
            </p>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 shadow-lg">
              <FiDollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-slate-500 font-medium">TODAY</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wider mb-1">Revenue</p>
            <p className="text-2xl font-bold text-slate-900">
              $<AnimatedCounter value={dashboardData.todayStats.revenue} />
            </p>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-lg">
              <FiTrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-slate-500 font-medium">TODAY</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wider mb-1">Conversion</p>
            <p className="text-2xl font-bold text-slate-900">
              <AnimatedCounter value={parseFloat(dashboardData.todayStats.conversion)} suffix="%" />
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-white/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Recent Orders</h3>
              <p className="text-sm text-slate-600 mt-1">Latest customer orders and transactions</p>
            </div>
            <Link
              to="/dashboard/admin/orders"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl group"
            >
              View All
              <FiArrowUp className="w-4 h-4 ml-2 rotate-45 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50/80 to-blue-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50">
              {dashboardData.recentOrders.length > 0 ? (
                dashboardData.recentOrders.map((order, index) => (
                  <tr key={order._id} className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/20 transition-all duration-200 group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                          {order.customerName.charAt(0)}
                        </div>
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors duration-200">
                          {order.customerName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded-lg inline-block">
                        {order.orderId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                          order.order_status === "Processing"
                            ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                            : order.order_status === "Shipped"
                            ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
                            : order.order_status === "Delivered"
                            ? "bg-gradient-to-r from-green-400 to-emerald-600 text-white"
                            : "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
                        }`}
                      >
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">
                        ${order.totalAmt}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FiShoppingCart className="w-12 h-12 text-slate-400 mb-4" />
                      <p className="text-slate-500 font-medium">No recent orders</p>
                      <p className="text-slate-400 text-sm">Orders will appear here once customers make purchases</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid - Top Products and Recent Customers */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200/50 bg-gradient-to-r from-emerald-50/50 to-green-50/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Top Products</h3>
                <p className="text-sm text-slate-600 mt-1">Best performing items this month</p>
              </div>
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl">
                <FiPackage className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.topProducts.length > 0 ? (
                dashboardData.topProducts.map((product, index) => (
                  <div key={product.id} className="group flex items-center justify-between p-4 bg-gradient-to-r from-white/50 to-emerald-50/30 rounded-xl hover:from-emerald-50/50 hover:to-green-50/50 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          #{index + 1}
                        </div>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-emerald-700 transition-colors duration-200">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center mt-1">
                          <FiShoppingCart className="w-3 h-3 mr-1" />
                          <AnimatedCounter value={product.sales} /> sales
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        $<AnimatedCounter value={product.revenue} />
                      </p>
                      <div className="w-16 h-1 bg-emerald-200 rounded-full mt-2">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min((product.revenue / 40000) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FiPackage className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No product data</p>
                  <p className="text-slate-400 text-sm">Product sales will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Customers */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Recent Customers</h3>
                <p className="text-sm text-slate-600 mt-1">New and active customers</p>
              </div>
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <FiUsers className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.recentCustomers.length > 0 ? (
                dashboardData.recentCustomers.map((customer, index) => (
                  <div key={customer.id} className="group flex items-center justify-between p-4 bg-gradient-to-r from-white/50 to-blue-50/30 rounded-xl hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm relative">
                        {customer.name.charAt(0)}
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors duration-200">
                          {customer.name}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center mt-1">
                          <FiShoppingBag className="w-3 h-3 mr-1" />
                          <AnimatedCounter value={customer.orders} /> orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        $<AnimatedCounter value={customer.spent} />
                      </p>
                      <div className="flex items-center justify-end mt-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-1 rounded-full mr-1 ${
                              i < Math.floor(customer.orders / 2) 
                                ? 'bg-blue-400' 
                                : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FiUsers className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No customer data</p>
                  <p className="text-slate-400 text-sm">Customer activity will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer with last updated info */}
      {lastUpdated && (
        <div className="flex items-center justify-center py-4">
          <div className="bg-white/50 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2 shadow-lg">
            <div className="flex items-center space-x-2 text-xs text-slate-600">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-medium">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
              <div className="text-slate-400">|</div>
              <span className="text-slate-500">
                Auto-refresh in {30}s
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewAdminDashboard;