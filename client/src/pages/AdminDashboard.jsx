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

  const StatCard = ({ icon: Icon, title, value, color, bgColor }) => (
    <div className={`${bgColor} rounded-lg p-6 shadow-sm border`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-full`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ icon: Icon, title, description, link, color }) => (
    <Link
      to={link}
      className="block p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center space-x-4">
        <div className={`${color} p-3 rounded-full`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening.</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={FiUsers}
          title="Total Users"
          value={dashboardData.totalUsers.toLocaleString()}
          color="bg-blue-500"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={FiPackage}
          title="Total Products"
          value={dashboardData.totalProducts.toLocaleString()}
          color="bg-green-500"
          bgColor="bg-green-50"
        />
        <StatCard
          icon={FiShoppingBag}
          title="Total Orders"
          value={dashboardData.totalOrders.toLocaleString()}
          color="bg-purple-500"
          bgColor="bg-purple-50"
        />
        <StatCard
          icon={FiDollarSign}
          title="Total Revenue"
          value={`₹${dashboardData.totalRevenue.toLocaleString()}`}
          color="bg-orange-500"
          bgColor="bg-orange-50"
        />
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={MdPendingActions}
          title="Pending Orders"
          value={dashboardData.pendingOrders}
          color="bg-yellow-500"
          bgColor="bg-yellow-50"
        />
        <StatCard
          icon={MdLocalShipping}
          title="Shipped Orders"
          value={dashboardData.shippedOrders}
          color="bg-blue-500"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={MdDone}
          title="Delivered Orders"
          value={dashboardData.deliveredOrders}
          color="bg-green-500"
          bgColor="bg-green-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <QuickActionCard
              icon={FiShoppingBag}
              title="Manage Orders"
              description="View and manage all customer orders"
              link="/dashboard/orders"
              color="bg-blue-500"
            />
            <QuickActionCard
              icon={FiPackage}
              title="Manage Products"
              description="Add, edit, or remove products"
              link="/dashboard/product"
              color="bg-green-500"
            />
            <QuickActionCard
              icon={AiOutlineShoppingCart}
              title="Categories"
              description="Manage product categories"
              link="/dashboard/category"
              color="bg-purple-500"
            />
            <QuickActionCard
              icon={FiUsers}
              title="User Management"
              description="View and manage users"
              link="/dashboard/users"
              color="bg-orange-500"
            />
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <Link
              to="/dashboard/orders"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {dashboardData.recentOrders.length > 0 ? (
              dashboardData.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.orderId}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.customerName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ₹{order.totalAmt}
                    </p>
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
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No recent orders
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;