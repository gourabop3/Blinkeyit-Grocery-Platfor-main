import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  FiHome,
  FiUsers,
  FiShoppingBag,
  FiPackage,
  FiPlus,
  FiGrid,
  FiLayers,
  FiBarChart2,
  FiImage,
  FiSmartphone,
  FiMenu,
  FiX,
  FiBell,
  FiSettings,
  FiUser,
  FiLogOut,
  FiTruck,
} from "react-icons/fi";
import { MdDiscount } from "react-icons/md";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { logout } from "../store/userSlice";
import toast from "react-hot-toast";
import AxiosToastError from "../utils/AxiosToastError";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.logout,
      });
      console.log("logout", response);
      if (response.data.success) {
        dispatch(logout());
        sessionStorage.clear();
        toast.success(response.data.message);
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      AxiosToastError(error);
    }
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard/admin",
      icon: FiHome,
    },
    {
      name: "Customers",
      href: "/dashboard/admin/users",
      icon: FiUsers,
    },
    {
      name: "Coupons",
      href: "/dashboard/admin/coupons",
      icon: MdDiscount,
    },
    {
      name: "Orders",
      href: "/dashboard/admin/orders",
      icon: FiShoppingBag,
    },
    {
      name: "Products",
      href: "/dashboard/admin/product",
      icon: FiPackage,
    },
    {
      name: "Add Product",
      href: "/dashboard/admin/upload-product",
      icon: FiPlus,
    },
    {
      name: "Categories",
      href: "/dashboard/admin/category",
      icon: FiGrid,
    },
    {
      name: "Sub-Categories",
      href: "/dashboard/admin/subcategory",
      icon: FiLayers,
    },
    {
      name: "Analytics",
      href: "/dashboard/admin/analytics",
      icon: FiBarChart2,
    },
    {
      name: "Web Banners",
      href: "/dashboard/admin/website-banners",
      icon: FiImage,
    },
    {
      name: "App Banners",
      href: "/dashboard/admin/app-banners",
      icon: FiSmartphone,
    },
    {
      name: "Live Delivery",
      href: "/dashboard/admin/delivery-tracking",
      icon: FiTruck,
    },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <Link to="/dashboard/admin" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiHome className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold">Admin Panel</span>
                <p className="text-xs text-slate-300">Management Console</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-slate-400 hover:text-white lg:hidden rounded-lg hover:bg-slate-700 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive(item.href) ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                  {item.name}
                  {isActive(item.href) && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-6 border-t border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <FiUser className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user.name || "Admin User"}
                </p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <FiLogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 lg:hidden rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiMenu className="w-6 h-6" />
              </button>
              <div className="hidden lg:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Welcome back, {user.name || "Admin"}
                </h1>
                <p className="text-sm text-gray-500">Manage your store with ease</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors relative">
                <FiBell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                <FiSettings className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-md">
                <FiUser className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;