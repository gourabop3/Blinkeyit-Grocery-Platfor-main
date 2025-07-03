import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { useSocket } from '../context/SocketContext';

const AdminDebugPage = () => {
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState('');
  
  const user = useSelector((state) => state?.user);
  const { liveDeliveries, isConnected } = useSocket();

  useEffect(() => {
    // Get token from storage
    const token = sessionStorage.getItem('accesstoken') || localStorage.getItem('token');
    setAuthToken(token ? token.substring(0, 20) + '...' : 'No token found');
  }, []);

  const testAdminAPI = async () => {
    setLoading(true);
    setError(null);
    setApiResponse(null);

    try {
      console.log('🔍 Testing admin API call...');
      const response = await Axios({ ...SummaryApi.getAllActiveDeliveries });
      console.log('✅ API response received:', response.data);
      setApiResponse(response.data);
    } catch (err) {
      console.error('❌ API error:', err);
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearBrowserData = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Live Deliveries Debug</h1>
      
      {/* User Info */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">User Information</h2>
        <p><strong>Logged in:</strong> {user ? 'Yes' : 'No'}</p>
        <p><strong>User email:</strong> {user?.email || 'Not logged in'}</p>
        <p><strong>User role:</strong> {user?.role || 'No role'}</p>
        <p><strong>Auth token:</strong> {authToken}</p>
        <p><strong>Socket connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
      </div>

      {/* Socket Data */}
      <div className="bg-green-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Socket Context Data</h2>
        <p><strong>Live deliveries count:</strong> {Object.keys(liveDeliveries).length}</p>
        <pre className="bg-white p-2 rounded mt-2 text-sm overflow-auto max-h-40">
          {JSON.stringify(liveDeliveries, null, 2)}
        </pre>
      </div>

      {/* API Test */}
      <div className="bg-yellow-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">API Test</h2>
        <button 
          onClick={testAdminAPI}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Admin API'}
        </button>
        
        {apiResponse && (
          <div className="mt-4">
            <h3 className="font-semibold text-green-600">✅ API Response:</h3>
            <p><strong>Success:</strong> {apiResponse.success ? 'Yes' : 'No'}</p>
            <p><strong>Deliveries count:</strong> {apiResponse.data?.deliveries?.length || 0}</p>
            <pre className="bg-white p-2 rounded mt-2 text-sm overflow-auto max-h-60">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}
        
        {error && (
          <div className="mt-4">
            <h3 className="font-semibold text-red-600">❌ API Error:</h3>
            <pre className="bg-white p-2 rounded mt-2 text-sm overflow-auto max-h-40">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Debug Actions */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Debug Actions</h2>
        <div className="space-x-2">
          <button 
            onClick={clearBrowserData}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Clear Browser Data & Reload
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Reload Page
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-indigo-50 p-4 rounded-lg mt-6">
        <h2 className="text-lg font-semibold mb-2">Debug Instructions</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Check if you're logged in as admin (role should be "ADMIN")</li>
          <li>Verify auth token exists</li>
          <li>Test the API call - should return 1 delivery</li>
          <li>Check socket context data - should have live deliveries</li>
          <li>Open browser console and look for error messages</li>
          <li>If API fails with 401, try logging out and back in</li>
        </ol>
      </div>
    </div>
  );
};

export default AdminDebugPage;