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
  FiShoppingCart,
} from "react-icons/fi";
import { MdDiscount } from "react-icons/md";
import { logout } from "../store/userSlice";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import toast from "react-hot-toast";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: FiHome,
      badge: null,
    },
    {
      name: "My Orders",
      href: "/dashboard/myorders",
      icon: FiShoppingCart,
      badge: null,
    },
    {
      name: "All Orders",
      href: "/admin/orders",
      icon: FiShoppingBag,
      badge: "New",
    },
    {
      name: "Customers",
      href: "/admin/users",
      icon: FiUsers,
      badge: null,
    },
    {
      name: "All Products",
      href: "/admin/product",
      icon: FiPackage,
      badge: null,
    },
    {
      name: "Create Product",
      href: "/admin/upload-product",
      icon: FiPlus,
      badge: null,
    },
    {
      name: "Categories",
      href: "/admin/category",
      icon: FiGrid,
      badge: null,
    },
    {
      name: "Sub-Categories",
      href: "/admin/subcategory",
      icon: FiLayers,
      badge: null,
    },
    {
      name: "Coupons",
      href: "/admin/coupons",
      icon: MdDiscount,
      badge: null,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: FiBarChart2,
      badge: "Pro",
    },
    {
      name: "Website Banners",
      href: "/admin/website-banners",
      icon: FiImage,
      badge: null,
    },
    {
      name: "App Banners",
      href: "/admin/app-banners",
      icon: FiSmartphone,
      badge: null,
    },
  ];

  const isActive = (href) => location.pathname === href;

  const handleLogout = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.logout,
      });
      
      if (response.data.success) {
        dispatch(logout());
        sessionStorage.clear();
        toast.success("Logged out successfully");
        navigate("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if API fails
      dispatch(logout());
      sessionStorage.clear();
      toast.success("Logged out successfully");
      navigate("/");
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-2xl backdrop-blur-xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
            <Link to="/admin" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <FiHome className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Admin Panel
                </span>
                <p className="text-xs text-slate-400">Management Hub</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200 lg:hidden"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-105"
                      : "text-slate-300 hover:bg-slate-800/50 hover:text-white hover:scale-105 hover:shadow-lg"
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className={`w-5 h-5 mr-3 ${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} transition-colors duration-200`} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                      item.badge === 'New' ? 'bg-green-500 text-white' :
                      item.badge === 'Pro' ? 'bg-purple-500 text-white' :
                      'bg-slate-600 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <FiUser className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user.name || "Admin User"}
                </p>
                <p className="text-xs text-slate-400">Administrator</p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-xs text-green-400">Online</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-red-300 hover:text-white hover:bg-red-600 rounded-xl transition-all duration-200 group"
            >
              <FiLogOut className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 lg:hidden"
              >
                <FiMenu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                  Welcome back, {user.name || "Admin"}!
                </h1>
                <p className="text-sm text-slate-500">Here's what's happening with your business today.</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="relative p-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200 group">
                <FiBell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              <button className="p-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200">
                <FiSettings className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <FiUser className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-indigo-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;