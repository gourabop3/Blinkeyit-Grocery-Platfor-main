import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiHome,
  FiUsers,
  FiShoppingBag,
  FiPackage,
  FiTrendingUp,
  FiSettings,
  FiMenu,
  FiX,
  FiBell,
  FiSearch,
  FiLogOut,
  FiChevronDown,
  FiGrid,
  FiBarChart3,
  FiShoppingCart,
  FiDollarSign,
  FiCalendar,
} from "react-icons/fi";

const ModernAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const user = useSelector((state) => state.user);
  const location = useLocation();

  const navigation = [
    {
      name: "Dashboard",
      href: "/modern-admin",
      icon: FiHome,
      description: "Overview & Analytics",
    },
    {
      name: "User Management",
      href: "/modern-admin/users",
      icon: FiUsers,
      description: "Manage customers",
    },
    {
      name: "Order Management",
      href: "/modern-admin/orders",
      icon: FiShoppingBag,
      description: "Track & manage orders",
    },
    {
      name: "Product Management",
      href: "/modern-admin/products",
      icon: FiPackage,
      description: "Manage inventory",
    },
    {
      name: "Analytics",
      href: "/modern-admin/analytics",
      icon: FiTrendingUp,
      description: "Business insights",
    },
    {
      name: "Settings",
      href: "/modern-admin/settings",
      icon: FiSettings,
      description: "System configuration",
    },
  ];

  const isActive = (href) => location.pathname === href;

  const quickStats = [
    { name: "Total Revenue", value: "$125,430", icon: FiDollarSign, color: "text-green-600", bg: "bg-green-100" },
    { name: "Total Orders", value: "1,247", icon: FiShoppingCart, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Total Users", value: "3,542", icon: FiUsers, color: "text-purple-600", bg: "bg-purple-100" },
    { name: "Products", value: "156", icon: FiPackage, color: "text-orange-600", bg: "bg-orange-100" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <Link to="/modern-admin" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FiGrid className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">TinkeyIT</h1>
                  <p className="text-xs text-gray-500">Modern Admin</p>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 lg:hidden rounded-lg hover:bg-gray-100"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Quick Overview</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickStats.map((stat, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-3">
                  <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-2`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <p className="text-xs text-gray-600">{stat.name}</p>
                  <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-6 space-y-2 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Navigation</h3>
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-4 ${isActive(item.href) ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className={`text-xs ${isActive(item.href) ? "text-blue-100" : "text-gray-500"}`}>
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-6 border-t border-gray-100">
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.name ? user.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">{user.name || "Admin"}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              
              {profileDropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                  <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <FiSettings className="w-4 h-4 mr-3" />
                    Settings
                  </Link>
                  <button className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <FiLogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-72 flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 lg:hidden rounded-lg hover:bg-gray-100"
              >
                <FiMenu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Good morning, {user.name || "Admin"}!
                </h1>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100">
                <FiBell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Calendar */}
              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100">
                <FiCalendar className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ModernAdminLayout;