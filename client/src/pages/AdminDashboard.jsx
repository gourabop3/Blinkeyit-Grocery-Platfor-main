import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiShoppingBag,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiActivity,
  FiArrowUp,
  FiArrowDown,
  FiMoreVertical,
  FiCalendar,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiEye,
  FiEdit,
  FiTrash2,
  FiBell,
  FiSettings,
  FiSearch,
  FiShoppingCart,
  FiCreditCard,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";
import { 
  MdPendingActions, 
  MdLocalShipping, 
  MdDone,
  MdTrendingUp,
  MdTrendingDown,
  MdAnalytics,
  MdInventory,
} from "react-icons/md";
import { AiOutlineShoppingCart, AiFillStar } from "react-icons/ai";
import { BsGraphUp, BsGraphDown, BsPieChart } from "react-icons/bs";
import { HiOutlineDocumentReport } from "react-icons/hi";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import Loading from "../components/Loading";

const AdminDashboard = () => {
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
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getDashboardStats,
      });

      const { data: responseData } = response;

      if (responseData.success) {
        setDashboardData({
          totalUsers: responseData.data.totalUsers,
          totalProducts: responseData.data.totalProducts,
          totalOrders: responseData.data.totalOrders,
          totalRevenue: responseData.data.totalRevenue,
          pendingOrders: responseData.data.pendingOrders,
          shippedOrders: responseData.data.shippedOrders,
          deliveredOrders: responseData.data.deliveredOrders,
          recentOrders: responseData.data.recentOrders.map(order => ({
            _id: order._id,
            orderId: order.orderId,
            customerName: order.userId?.name || 'Unknown Customer',
            totalAmt: order.totalAmt,
            order_status: order.order_status,
            createdAt: order.createdAt,
          })),
        });
      }
    } catch (error) {
      AxiosToastError(error);
      // Fallback to some default data if API fails
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
  }, []);

  // Modern Metric Card Component
  const MetricCard = ({ icon: Icon, title, value, change, changeType, color, trend }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className="flex items-center space-x-1">
                {changeType === 'increase' ? (
                  <FiArrowUp className="w-4 h-4 text-green-500" />
                ) : (
                  <FiArrowDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {change}
                </span>
                <span className="text-sm text-gray-500">from last week</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <button className="p-1 hover:bg-gray-100 rounded-md">
            <FiMoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          {trend && (
            <div className="mt-2 w-16 h-8 bg-gray-50 rounded flex items-center justify-center">
              {changeType === 'increase' ? (
                <BsGraphUp className="w-3 h-3 text-green-500" />
              ) : (
                <BsGraphDown className="w-3 h-3 text-red-500" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Activity Feed Item Component
  const ActivityItem = ({ type, message, time, status }) => (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`p-2 rounded-full ${
        type === 'order' ? 'bg-blue-100' :
        type === 'product' ? 'bg-green-100' :
        type === 'user' ? 'bg-purple-100' : 'bg-orange-100'
      }`}>
        {type === 'order' && <FiShoppingCart className="w-4 h-4 text-blue-600" />}
        {type === 'product' && <FiPackage className="w-4 h-4 text-green-600" />}
        {type === 'user' && <FiUsers className="w-4 h-4 text-purple-600" />}
        {type === 'payment' && <FiCreditCard className="w-4 h-4 text-orange-600" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{message}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
      {status && (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          status === 'completed' ? 'bg-green-100 text-green-800' :
          status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status}
        </span>
      )}
    </div>
  );

  // Chart Placeholder Component
  const ChartPlaceholder = ({ title, type = 'line' }) => (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <FiFilter className="w-4 h-4 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <FiDownload className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
      <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <BsPieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Chart will display here</p>
          <p className="text-xs text-gray-400">Connect your analytics</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setTimeRange('7d')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    timeRange === '7d' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setTimeRange('30d')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    timeRange === '30d' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  30 Days
                </button>
                <button
                  onClick={() => setTimeRange('90d')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    timeRange === '90d' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  90 Days
                </button>
              </div>
              <button 
                onClick={fetchDashboardData}
                disabled={refreshing}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiRefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <FiBell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <FiSettings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            icon={FiDollarSign}
            title="Total Revenue"
            value={`₹${dashboardData.totalRevenue.toLocaleString()}`}
            change="+12.5%"
            changeType="increase"
            color="bg-emerald-500"
            trend={true}
          />
          <MetricCard
            icon={FiShoppingBag}
            title="Total Orders"
            value={dashboardData.totalOrders.toLocaleString()}
            change="+8.2%"
            changeType="increase"
            color="bg-blue-500"
            trend={true}
          />
          <MetricCard
            icon={FiUsers}
            title="Active Users"
            value={dashboardData.totalUsers.toLocaleString()}
            change="+5.4%"
            changeType="increase"
            color="bg-purple-500"
            trend={true}
          />
          <MetricCard
            icon={FiPackage}
            title="Total Products"
            value={dashboardData.totalProducts.toLocaleString()}
            change="+2.1%"
            changeType="increase"
            color="bg-orange-500"
            trend={true}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            icon={FiClock}
            title="Pending Orders"
            value={dashboardData.pendingOrders}
            change="-3.2%"
            changeType="decrease"
            color="bg-yellow-500"
          />
          <MetricCard
            icon={FiTruck}
            title="Shipped Orders"
            value={dashboardData.shippedOrders}
            change="+15.8%"
            changeType="increase"
            color="bg-indigo-500"
          />
          <MetricCard
            icon={FiCheckCircle}
            title="Delivered Orders"
            value={dashboardData.deliveredOrders}
            change="+9.7%"
            changeType="increase"
            color="bg-green-500"
          />
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartPlaceholder title="Revenue Analytics" />
          </div>
          <div>
            <ChartPlaceholder title="Order Distribution" type="pie" />
          </div>
        </div>

        {/* Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <Link to="/dashboard/activity" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6 space-y-1">
              <ActivityItem
                type="order"
                message="New order #12847 received from John Doe"
                time="2 minutes ago"
                status="pending"
              />
              <ActivityItem
                type="payment"
                message="Payment of ₹2,450 processed successfully"
                time="5 minutes ago"
                status="completed"
              />
              <ActivityItem
                type="product"
                message="Product 'iPhone 15' stock updated"
                time="12 minutes ago"
                status="completed"
              />
              <ActivityItem
                type="user"
                message="New user registration: jane.smith@email.com"
                time="18 minutes ago"
                status="completed"
              />
              <ActivityItem
                type="order"
                message="Order #12845 shipped to Mumbai"
                time="32 minutes ago"
                status="completed"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6 space-y-3">
              <Link
                to="/dashboard/product/add"
                className="flex items-center space-x-3 p-3 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200">
                  <FiPackage className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Add Product</p>
                  <p className="text-sm text-gray-500">Create new product listing</p>
                </div>
              </Link>
              
              <Link
                to="/dashboard/orders"
                className="flex items-center space-x-3 p-3 rounded-lg border-2 border-dashed border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group"
              >
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200">
                  <FiShoppingBag className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Orders</p>
                  <p className="text-sm text-gray-500">Manage customer orders</p>
                </div>
              </Link>

              <Link
                to="/dashboard/users"
                className="flex items-center space-x-3 p-3 rounded-lg border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
              >
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200">
                  <FiUsers className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">User Management</p>
                  <p className="text-sm text-gray-500">Manage user accounts</p>
                </div>
              </Link>

              <Link
                to="/dashboard/analytics"
                className="flex items-center space-x-3 p-3 rounded-lg border-2 border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all group"
              >
                <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200">
                  <MdAnalytics className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Analytics</p>
                  <p className="text-sm text-gray-500">View detailed reports</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <FiSearch className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <FiFilter className="w-4 h-4 text-gray-500" />
                </button>
                <Link
                  to="/dashboard/orders"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all
                </Link>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentOrders.length > 0 ? (
                  dashboardData.recentOrders.slice(0, 5).map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.orderId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.order_status === "Processing" ? "bg-yellow-100 text-yellow-800" :
                          order.order_status === "Shipped" ? "bg-blue-100 text-blue-800" :
                          order.order_status === "Delivered" ? "bg-green-100 text-green-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {order.order_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{order.totalAmt?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">
                            <FiEdit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <FiShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-sm">No recent orders found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;