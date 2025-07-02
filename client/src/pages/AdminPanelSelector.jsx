import React from "react";
import { Link } from "react-router-dom";
import {
  FiGrid,
  FiMonitor,
  FiArrowRight,
  FiSettings,
  FiStar,
  FiZap,
  FiTrendingUp,
  FiShield,
} from "react-icons/fi";

const AdminPanelSelector = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FiGrid className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            TinkeyIT Admin Panel
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your preferred admin interface. Both panels provide full functionality with different user experiences.
          </p>
        </div>

        {/* Panel Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Classic Admin Panel */}
          <Link
            to="/dashboard/admin"
            className="group bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiSettings className="w-8 h-8 text-white" />
              </div>
              <div className="flex items-center text-gray-400 group-hover:text-blue-600 transition-colors">
                <span className="text-sm font-medium mr-2">Enter</span>
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
              Classic Admin Panel
            </h3>
            <p className="text-gray-600 mb-6">
              Traditional admin interface with familiar layout and comprehensive functionality. Perfect for detailed management tasks.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <FiShield className="w-4 h-4 mr-3 text-blue-600" />
                <span>Full feature set</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FiGrid className="w-4 h-4 mr-3 text-blue-600" />
                <span>Classic sidebar navigation</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FiSettings className="w-4 h-4 mr-3 text-blue-600" />
                <span>Comprehensive management tools</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Status</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Stable
                </span>
              </div>
            </div>
          </Link>

          {/* Modern Admin Panel */}
          <Link
            to="/modern-admin"
            className="group bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-8 shadow-xl border border-blue-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border border-white/30">
                  <FiMonitor className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center">
                  <div className="flex items-center bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold mr-3">
                    <FiStar className="w-3 h-3 mr-1" />
                    NEW
                  </div>
                  <div className="flex items-center text-blue-100 group-hover:text-white transition-colors">
                    <span className="text-sm font-medium mr-2">Enter</span>
                    <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-3 group-hover:text-white transition-colors">
                Modern Admin Panel
              </h3>
              <p className="text-blue-100 mb-6">
                Next-generation admin interface with modern design, enhanced UX, and powerful analytics. Built for efficiency and elegance.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-blue-100">
                  <FiZap className="w-4 h-4 mr-3 text-yellow-400" />
                  <span>Lightning-fast performance</span>
                </div>
                <div className="flex items-center text-sm text-blue-100">
                  <FiTrendingUp className="w-4 h-4 mr-3 text-yellow-400" />
                  <span>Advanced analytics & insights</span>
                </div>
                <div className="flex items-center text-sm text-blue-100">
                  <FiMonitor className="w-4 h-4 mr-3 text-yellow-400" />
                  <span>Modern card-based UI</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-200">Status</span>
                  <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold">
                    ✨ Latest
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Comparison */}
        <div className="mt-16 bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Feature Comparison</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FiShield className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Same Functionality</h4>
              <p className="text-gray-600 text-sm">Both panels provide identical backend functionality and data access</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FiZap className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Real-time Data</h4>
              <p className="text-gray-600 text-sm">Live dashboard updates and real-time analytics in both interfaces</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FiTrendingUp className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Enhanced UX</h4>
              <p className="text-gray-600 text-sm">Modern panel features improved user experience and visual design</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            You can switch between panels anytime. Your preferences and data remain synchronized.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanelSelector;