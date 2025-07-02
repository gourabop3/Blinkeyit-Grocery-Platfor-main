import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { checkAuthToken, getAccessToken, isUserAuthenticated } from '../utils/checkAuthToken';

const MobileAuthDebugger = ({ showDebug = false }) => {
  const user = useSelector(state => state.user);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const updateDebugInfo = () => {
      const accessToken = getAccessToken();
      const hasToken = checkAuthToken();
      const isAuthenticated = isUserAuthenticated(user);
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      setDebugInfo({
        isMobile,
        hasToken,
        isAuthenticated,
        accessTokenExists: Boolean(accessToken),
        accessTokenLength: accessToken ? accessToken.length : 0,
        hasUserData: Boolean(user && (user._id || user.email)),
        userAgent: navigator.userAgent,
        sessionStorageAvailable: typeof(Storage) !== "undefined",
        refreshTokenExists: Boolean(sessionStorage.getItem("refreshToken")),
        timestamp: new Date().toLocaleTimeString()
      });
    };

    updateDebugInfo();
    
    // Update every 5 seconds if debug is enabled
    let interval;
    if (showDebug) {
      interval = setInterval(updateDebugInfo, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user, showDebug]);

  // Only show in development or when explicitly enabled
  if (!showDebug && process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs max-w-xs">
      <div className="font-bold mb-2">🔍 Auth Debug Info</div>
      
      <div className="space-y-1">
        <div className={`flex justify-between ${debugInfo.isMobile ? 'text-yellow-300' : 'text-gray-300'}`}>
          <span>Device:</span>
          <span>{debugInfo.isMobile ? 'Mobile' : 'Desktop'}</span>
        </div>
        
        <div className={`flex justify-between ${debugInfo.hasToken ? 'text-green-300' : 'text-red-300'}`}>
          <span>Has Token:</span>
          <span>{debugInfo.hasToken ? '✓' : '✗'}</span>
        </div>
        
        <div className={`flex justify-between ${debugInfo.isAuthenticated ? 'text-green-300' : 'text-red-300'}`}>
          <span>Authenticated:</span>
          <span>{debugInfo.isAuthenticated ? '✓' : '✗'}</span>
        </div>
        
        <div className={`flex justify-between ${debugInfo.hasUserData ? 'text-green-300' : 'text-red-300'}`}>
          <span>User Data:</span>
          <span>{debugInfo.hasUserData ? '✓' : '✗'}</span>
        </div>
        
        <div className={`flex justify-between ${debugInfo.sessionStorageAvailable ? 'text-green-300' : 'text-red-300'}`}>
          <span>Storage:</span>
          <span>{debugInfo.sessionStorageAvailable ? '✓' : '✗'}</span>
        </div>
        
        <div className="text-xs text-gray-400 mt-2">
          Token Length: {debugInfo.accessTokenLength}
        </div>
        
        <div className="text-xs text-gray-400">
          Updated: {debugInfo.timestamp}
        </div>
      </div>
    </div>
  );
};

export default MobileAuthDebugger;