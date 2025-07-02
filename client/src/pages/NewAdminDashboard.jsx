import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiShoppingCart,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiRefreshCw,
} from "react-icons/fi";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import Loading from "../components/Loading";

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
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
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
        }));
        setLastUpdated(new Date());
      }
      setLoading(false);
    } catch (error) {
      AxiosToastError(error);
      // Use sample data if API fails
      setDashboardData(prev => ({
        ...prev,
        recentOrders: sampleRecentOrders,
        topProducts: sampleTopProducts,
        recentCustomers: sampleRecentCustomers,
      }));
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

  const StatCard = ({ icon: Icon, title, value, color, bgColor, iconBg }) => (
    <div className={`${bgColor} rounded-xl p-6 border border-gray-100 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`${iconBg} p-3 rounded-lg mr-4`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && dashboardData.recentOrders.length === 0) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Overview Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FiShoppingCart}
          title="Total Orders"
          value={dashboardData.totalOrders.toLocaleString()}
          color="text-blue-600"
          bgColor="bg-white"
          iconBg="bg-blue-100"
        />
        <StatCard
          icon={FiPackage}
          title="Total Products"
          value={dashboardData.totalProducts.toLocaleString()}
          color="text-green-600"
          bgColor="bg-white"
          iconBg="bg-green-100"
        />
        <StatCard
          icon={FiDollarSign}
          title="Total Revenue"
          value={`$${dashboardData.totalRevenue.toLocaleString()}.00`}
          color="text-purple-600"
          bgColor="bg-white"
          iconBg="bg-purple-100"
        />
        <StatCard
          icon={FiTrendingUp}
          title="Total Sales"
          value={dashboardData.totalSales.toLocaleString()}
          color="text-orange-600"
          bgColor="bg-white"
          iconBg="bg-orange-100"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <Link
              to="/dashboard/orders"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.recentOrders.length > 0 ? (
                dashboardData.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customerName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.orderId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.order_status === "Processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.order_status === "Shipped"
                            ? "bg-blue-100 text-blue-800"
                            : order.order_status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${order.totalAmt}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No recent orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid - Top Products and Recent Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.topProducts.length > 0 ? (
                dashboardData.topProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-48">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.sales} sales
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${product.revenue}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No product data</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Customers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Customers</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.recentCustomers.length > 0 ? (
                dashboardData.recentCustomers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {customer.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {customer.orders} orders
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${customer.spent}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No customer data</p>
              )}
            </div>
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

export default NewAdminDashboard;