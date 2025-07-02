import React, { useEffect, useState } from "react";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
  FiPackage,
  FiEye,
  FiRefreshCw,
  FiCalendar,
  FiTarget,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import Loading from "../components/Loading";

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalRevenue: 0,
      totalOrders: 0,
      totalUsers: 0,
      totalProducts: 0,
      revenueGrowth: 0,
      orderGrowth: 0,
      userGrowth: 0,
      conversionRate: 0,
    },
    revenueChart: [],
    ordersChart: [],
    topProducts: [],
    orderStatusDistribution: [],
    userRegistrations: [],
    salesByCategory: [],
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7d");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Mock data for demonstration until backend analytics APIs are created
  const generateMockAnalytics = () => {
    const mockData = {
      overview: {
        totalRevenue: 125430,
        totalOrders: 1247,
        totalUsers: 3542,
        totalProducts: 156,
        revenueGrowth: 12.5,
        orderGrowth: 8.3,
        userGrowth: 15.2,
        conversionRate: 3.8,
      },
      revenueChart: [
        { date: "2024-01-15", revenue: 12500 },
        { date: "2024-01-16", revenue: 15200 },
        { date: "2024-01-17", revenue: 18700 },
        { date: "2024-01-18", revenue: 14200 },
        { date: "2024-01-19", revenue: 19800 },
        { date: "2024-01-20", revenue: 22100 },
        { date: "2024-01-21", revenue: 16900 },
      ],
      ordersChart: [
        { date: "2024-01-15", orders: 45 },
        { date: "2024-01-16", orders: 52 },
        { date: "2024-01-17", orders: 67 },
        { date: "2024-01-18", orders: 41 },
        { date: "2024-01-19", orders: 73 },
        { date: "2024-01-20", orders: 89 },
        { date: "2024-01-21", orders: 61 },
      ],
      topProducts: [
        { name: "Wireless Headphones", sales: 234, revenue: 46800 },
        { name: "Smartphone", sales: 156, revenue: 124800 },
        { name: "Gaming Mouse", sales: 98, revenue: 9800 },
        { name: "Laptop", sales: 45, revenue: 67500 },
        { name: "Tablet", sales: 67, revenue: 33500 },
      ],
      orderStatusDistribution: [
        { status: "Processing", count: 145, color: "#F59E0B" },
        { status: "Shipped", count: 234, color: "#3B82F6" },
        { status: "Delivered", count: 567, color: "#10B981" },
        { status: "Cancelled", count: 23, color: "#EF4444" },
      ],
      userRegistrations: [
        { date: "2024-01-15", users: 12 },
        { date: "2024-01-16", users: 18 },
        { date: "2024-01-17", users: 25 },
        { date: "2024-01-18", users: 15 },
        { date: "2024-01-19", users: 32 },
        { date: "2024-01-20", users: 28 },
        { date: "2024-01-21", users: 22 },
      ],
      salesByCategory: [
        { category: "Electronics", sales: 45600, percentage: 36.4 },
        { category: "Clothing", sales: 32100, percentage: 25.6 },
        { category: "Books", sales: 18900, percentage: 15.1 },
        { category: "Home & Garden", sales: 15200, percentage: 12.1 },
        { category: "Sports", sales: 13630, percentage: 10.8 },
      ],
    };
    return mockData;
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      console.log("Fetching analytics data for range:", dateRange);
      
      // For now, using mock data. Replace with real API calls when backend analytics endpoints are ready
      setTimeout(() => {
        const mockData = generateMockAnalytics();
        setAnalyticsData(mockData);
        setLastUpdated(new Date());
        setLoading(false);
      }, 1000);

      // TODO: Replace with real API calls
      /*
      const response = await Axios({
        url: `/api/analytics/dashboard`,
        method: "get",
        params: { range: dateRange },
      });

      if (response.data.success) {
        setAnalyticsData(response.data.data);
        setLastUpdated(new Date());
      }
      */
    } catch (error) {
      console.error("Analytics API Error:", error);
      AxiosToastError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const StatCard = ({ icon: Icon, title, value, growth, trend, color, bgColor }) => (
    <div className={`${bgColor} rounded-xl p-6 border border-gray-100 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`${color} p-3 rounded-lg mr-4`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {growth !== undefined && (
              <div className="flex items-center mt-2">
                {trend === "up" ? (
                  <FiTrendingUp className="w-4 h-4 text-green-600 mr-1" />
                ) : (
                  <FiTrendingDown className="w-4 h-4 text-red-600 mr-1" />
                )}
                <span className={`text-sm font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  {growth}%
                </span>
                <span className="text-gray-500 text-sm ml-1">vs last period</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && !lastUpdated) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive business insights and metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 3 Months</option>
            <option value="1y">Last Year</option>
          </select>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FiDollarSign}
          title="Total Revenue"
          value={`$${analyticsData.overview.totalRevenue.toLocaleString()}`}
          growth={analyticsData.overview.revenueGrowth}
          trend={analyticsData.overview.revenueGrowth >= 0 ? "up" : "down"}
          color="bg-green-600"
          bgColor="bg-white"
        />
        <StatCard
          icon={FiShoppingCart}
          title="Total Orders"
          value={analyticsData.overview.totalOrders.toLocaleString()}
          growth={analyticsData.overview.orderGrowth}
          trend={analyticsData.overview.orderGrowth >= 0 ? "up" : "down"}
          color="bg-blue-600"
          bgColor="bg-white"
        />
        <StatCard
          icon={FiUsers}
          title="Total Users"
          value={analyticsData.overview.totalUsers.toLocaleString()}
          growth={analyticsData.overview.userGrowth}
          trend={analyticsData.overview.userGrowth >= 0 ? "up" : "down"}
          color="bg-purple-600"
          bgColor="bg-white"
        />
        <StatCard
          icon={FiTarget}
          title="Conversion Rate"
          value={`${analyticsData.overview.conversionRate}%`}
          color="bg-orange-600"
          bgColor="bg-white"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.revenueChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="#10B981" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Orders Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.ordersChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.orderStatusDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="count"
                label={({ status, count }) => `${status}: ${count}`}
              >
                {analyticsData.orderStatusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* User Registrations */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">User Registrations</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.userRegistrations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
          <div className="space-y-4">
            {analyticsData.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-gray-500 text-sm">{product.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${product.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
          <div className="space-y-4">
            {analyticsData.salesByCategory.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{category.category}</span>
                  <span>${category.sales.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {lastUpdated && (
        <div className="text-xs text-gray-500 text-center">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default Analytics;