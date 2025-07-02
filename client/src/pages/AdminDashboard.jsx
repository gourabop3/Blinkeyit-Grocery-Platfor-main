import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiShoppingBag,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiBell,
  FiSettings,
  FiUser,
  FiChevronLeft,
  FiGrid,
  FiShoppingCart,
} from "react-icons/fi";
import { 
  MdDashboard,
  MdPeople,
  MdLocalOffer,
  MdShoppingCart,
  MdInventory2,
  MdAdd,
  MdCategory,
  MdSubdirectoryArrowRight,
  MdAnalytics,
  MdWebAsset,
  MdMobileFriendly,
} from "react-icons/md";
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
    totalSales: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

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
          totalSales: responseData.data.totalOrders, // Using orders as sales for now
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
        totalSales: 0,
        recentOrders: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Sidebar Menu Component
  const SidebarMenuItem = ({ icon: Icon, label, active = false, to = "#" }) => (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-colors ${
        active
          ? 'text-blue-400 bg-gray-800 border-r-2 border-blue-400'
          : 'text-gray-300 hover:text-white hover:bg-gray-800'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );

  // Metric Card Component (Simplified)
  const MetricCard = ({ icon: Icon, title, value, color, bgColor }) => (
    <div className={`${bgColor} border ${color} rounded-lg p-6`}>
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color.replace('border-', 'bg-')}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );



  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold">Admin Panel</h2>
          <button className="text-gray-400 hover:text-white">
            <FiChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4">
          <SidebarMenuItem icon={MdDashboard} label="Admin Dashboard" active={true} to="/dashboard/admin" />
          <SidebarMenuItem icon={MdPeople} label="Customers" to="/dashboard/users" />
          <SidebarMenuItem icon={MdLocalOffer} label="Coupon Management" to="/dashboard/coupons" />
          <SidebarMenuItem icon={MdShoppingCart} label="All Orders" to="/dashboard/orders" />
          <SidebarMenuItem icon={MdInventory2} label="All Products" to="/dashboard/product" />
          <SidebarMenuItem icon={MdAdd} label="Create Product" to="/dashboard/upload-product" />
          <SidebarMenuItem icon={MdCategory} label="Categories" to="/dashboard/category" />
          <SidebarMenuItem icon={MdSubdirectoryArrowRight} label="Sub-Categories" to="/dashboard/subcategory" />
          <SidebarMenuItem icon={MdAnalytics} label="Analytics" to="/dashboard/analytics" />
          <SidebarMenuItem icon={MdWebAsset} label="Website Banners" to="/dashboard/banners" />
          <SidebarMenuItem icon={MdMobileFriendly} label="App Banners" to="/dashboard/app-banners" />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Welcome, Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                <FiBell className="w-5 h-5" />
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <FiSettings className="w-5 h-5" />
              </button>
              <button className="flex items-center space-x-2 text-gray-700">
                <FiUser className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                icon={FiShoppingBag}
                title="Total Orders"
                value={dashboardData.totalOrders.toLocaleString()}
                color="border-blue-500"
                bgColor="bg-white"
              />
              <MetricCard
                icon={FiPackage}
                title="Total Products"
                value={dashboardData.totalProducts.toLocaleString()}
                color="border-green-500"
                bgColor="bg-white"
              />
              <MetricCard
                icon={FiDollarSign}
                title="Total Revenue"
                value={`$${dashboardData.totalRevenue.toLocaleString()}.00`}
                color="border-purple-500"
                bgColor="bg-white"
              />
              <MetricCard
                icon={FiTrendingUp}
                title="Total Sales"
                value={dashboardData.totalSales.toLocaleString()}
                color="border-orange-500"
                bgColor="bg-white"
              />
            </div>

            {/* Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                </div>
                <div className="p-6">
                  {dashboardData.recentOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-4 py-2 font-medium text-gray-600">CUSTOMER</th>
                            <th className="text-left px-4 py-2 font-medium text-gray-600">ORDER ID</th>
                            <th className="text-left px-4 py-2 font-medium text-gray-600">STATUS</th>
                            <th className="text-left px-4 py-2 font-medium text-gray-600">AMOUNT</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {dashboardData.recentOrders.slice(0, 5).map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-900">{order.customerName}</td>
                              <td className="px-4 py-3 text-gray-600">{order.orderId}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  order.order_status === "Processing" ? "bg-yellow-100 text-yellow-800" :
                                  order.order_status === "Shipped" ? "bg-blue-100 text-blue-800" :
                                  order.order_status === "Delivered" ? "bg-green-100 text-green-800" :
                                  "bg-gray-100 text-gray-800"
                                }`}>
                                  {order.order_status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-900">₹{order.totalAmt?.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No recent orders</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
                </div>
                <div className="p-6">
                  <div className="text-center py-8 text-gray-500">
                    <p>Product analytics will be displayed here</p>
                  </div>
                </div>
              </div>

              {/* Recent Customers */}
              <div className="bg-white rounded-lg shadow-sm border lg:col-span-2">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Customers</h3>
                </div>
                <div className="p-6">
                  <div className="text-center py-8 text-gray-500">
                    <p>Customer data will be displayed here</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;