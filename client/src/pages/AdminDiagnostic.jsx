import React from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import isAdmin from "../utils/isAdmin";

const AdminDiagnostic = () => {
  const user = useSelector((state) => state.user);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">🔍 Admin Panel Diagnostic</h1>
          
          {/* Quick Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className={`p-4 rounded-lg ${user?._id ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'} border`}>
              <div className="text-lg font-semibold">{user?._id ? '✅' : '❌'} Authentication</div>
              <div className="text-sm">{user?._id ? 'Logged In' : 'Not Logged In'}</div>
            </div>
            <div className={`p-4 rounded-lg ${isAdmin(user?.role) ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'} border`}>
              <div className="text-lg font-semibold">{isAdmin(user?.role) ? '✅' : '❌'} Admin Role</div>
              <div className="text-sm">{user?.role || 'No Role'}</div>
            </div>
            <div className={`p-4 rounded-lg ${location.pathname.includes('/admin') ? 'bg-blue-100 border-blue-300' : 'bg-gray-100 border-gray-300'} border`}>
              <div className="text-lg font-semibold">📍 Current Route</div>
              <div className="text-sm">{location.pathname}</div>
            </div>
          </div>

          {/* Detailed Diagnostics */}
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-3">👤 User Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>User ID:</strong> {user?._id || '❌ Not found'}
                </div>
                <div>
                  <strong>Name:</strong> {user?.name || '❌ Not found'}
                </div>
                <div>
                  <strong>Email:</strong> {user?.email || '❌ Not found'}
                </div>
                <div>
                  <strong>Role:</strong> <code className="bg-white px-2 py-1 rounded">{user?.role || 'No role'}</code>
                </div>
              </div>
            </div>

            {/* Admin Access Check */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-3">🔐 Admin Access Check</h2>
              <div className="space-y-2">
                <div>
                  <strong>Required Role:</strong> <code className="bg-white px-2 py-1 rounded">ADMIN</code>
                </div>
                <div>
                  <strong>Current Role:</strong> <code className="bg-white px-2 py-1 rounded">{user?.role || 'undefined'}</code>
                </div>
                <div>
                  <strong>Admin Check Result:</strong> 
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm ${isAdmin(user?.role) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {isAdmin(user?.role) ? '✅ PASS' : '❌ FAIL'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Steps */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-3">⚡ Action Steps</h2>
              <div className="space-y-3">
                {!user?._id && (
                  <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded p-3">
                    <span>1. You need to log in first</span>
                    <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      Login
                    </Link>
                  </div>
                )}
                
                {user?._id && user?.role !== 'ADMIN' && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <span>2. Your account needs ADMIN role in database</span>
                    <div className="text-sm text-gray-600 mt-1">
                      Contact your database administrator to set your role to "ADMIN"
                    </div>
                  </div>
                )}
                
                {isAdmin(user?.role) && (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-3">
                    <span>3. ✅ You can access the admin panel!</span>
                    <Link to="/dashboard/admin" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                      Go to Admin Panel
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Route Testing */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-3">🛣️ Route Testing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link to="/dashboard" className="bg-blue-100 border border-blue-300 p-3 rounded text-center hover:bg-blue-200">
                  Test Dashboard Route
                </Link>
                <Link to="/dashboard/admin" className="bg-purple-100 border border-purple-300 p-3 rounded text-center hover:bg-purple-200">
                  Test Admin Route
                </Link>
                <Link to="/dashboard/profile" className="bg-gray-100 border border-gray-300 p-3 rounded text-center hover:bg-gray-200">
                  Test Profile Route
                </Link>
                <Link to="/" className="bg-green-100 border border-green-300 p-3 rounded text-center hover:bg-green-200">
                  Back to Home
                </Link>
              </div>
            </div>

            {/* Debug Information */}
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="text-xl font-semibold cursor-pointer">🐛 Debug Information (Click to expand)</summary>
              <div className="mt-3">
                <h3 className="font-semibold mb-2">Full User Object:</h3>
                <pre className="bg-white p-3 rounded text-xs overflow-auto border">
                  {JSON.stringify(user, null, 2)}
                </pre>
                <h3 className="font-semibold mb-2 mt-4">Location Object:</h3>
                <pre className="bg-white p-3 rounded text-xs overflow-auto border">
                  {JSON.stringify(location, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDiagnostic;