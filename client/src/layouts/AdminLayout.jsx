import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiHome,
  FiUsers,
  FiShoppingBag,
  FiPackage,
  FiPlus,
  FiGrid,
  FiLayers,
  FiBarChart3,
  FiImage,
  FiSmartphone,
  FiMenu,
  FiX,
  FiBell,
  FiSettings,
  FiUser,
} from "react-icons/fi";
import { MdDiscount } from "react-icons/md";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useSelector((state) => state.user);
  const location = useLocation();

  const navigation = [
    {
      name: "Admin Dashboard",
      href: "/dashboard/admin",
      icon: FiHome,
    },
    {
      name: "Customers",
      href: "/dashboard/users",
      icon: FiUsers,
    },
    {
      name: "Coupon Management",
      href: "/dashboard/coupons",
      icon: MdDiscount,
    },
    {
      name: "All Orders",
      href: "/dashboard/orders",
      icon: FiShoppingBag,
    },
    {
      name: "All Products",
      href: "/dashboard/product",
      icon: FiPackage,
    },
    {
      name: "Create Product",
      href: "/dashboard/upload-product",
      icon: FiPlus,
    },
    {
      name: "Categories",
      href: "/dashboard/category",
      icon: FiGrid,
    },
    {
      name: "Sub-Categories",
      href: "/dashboard/subcategory",
      icon: FiLayers,
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: FiBarChart3,
    },
    {
      name: "Website Banners",
      href: "/dashboard/website-banners",
      icon: FiImage,
    },
    {
      name: "App Banners",
      href: "/dashboard/app-banners",
      icon: FiSmartphone,
    },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <Link to="/dashboard/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FiHome className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">Admin Panel</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-gray-400 hover:text-white lg:hidden"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                    isActive(item.href)
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <FiUser className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name || "Admin"}
                </p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 lg:hidden"
              >
                <FiMenu className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <FiBell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <FiSettings className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <FiUser className="w-4 h-4" />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;