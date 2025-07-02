import React from 'react';
import { useSelector } from 'react-redux';

const AdminTest = () => {
  const user = useSelector(state => state.user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              🎉 Admin Panel Test - SUCCESS!
            </h1>
            <p className="text-lg text-gray-600 mt-4">
              If you can see this page, the modern admin routing is working!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-green-800 mb-3">✅ Route Status</h3>
              <ul className="space-y-2 text-green-700">
                <li>✓ React Router working</li>
                <li>✓ Component rendering</li>
                <li>✓ Tailwind CSS loaded</li>
                <li>✓ Redux state connected</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-blue-800 mb-3">👤 User Info</h3>
              <div className="text-blue-700">
                <p><strong>Name:</strong> {user?.name || 'Not logged in'}</p>
                <p><strong>Role:</strong> {user?.role || 'No role'}</p>
                <p><strong>Email:</strong> {user?.email || 'No email'}</p>
                <p><strong>Admin:</strong> {user?.role === 'ADMIN' ? '✅ Yes' : '❌ No'}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-purple-800 mb-4">🧪 Test Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-2xl">✓</span>
                </div>
                <p className="font-semibold text-green-800">Routing</p>
                <p className="text-sm text-green-600">Working</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-2xl">✓</span>
                </div>
                <p className="font-semibold text-green-800">Styling</p>
                <p className="text-sm text-green-600">Loaded</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-2xl">✓</span>
                </div>
                <p className="font-semibold text-green-800">State</p>
                <p className="text-sm text-green-600">Connected</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg text-gray-600 mb-4">
              The modern admin dashboard is ready! 🚀
            </p>
            <div className="space-x-4">
              <a 
                href="/admin" 
                className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
              >
                Go to Full Admin Dashboard
              </a>
              <a 
                href="/" 
                className="inline-block bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTest;