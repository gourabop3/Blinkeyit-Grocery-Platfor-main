import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const DeliveryNotifications = () => {
  const { isConnected, deliveryUpdates } = useSocket();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Set up browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Global notification function for socket context
    window.showNotification = (title, body) => {
      // Show toast notification
      toast.success(`${title}: ${body}`, {
        duration: 5000,
        position: 'top-right',
      });

      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });

        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);
      }

      // Add to local notifications state
      setNotifications(prev => [
        {
          id: Date.now(),
          title,
          body,
          timestamp: new Date(),
        },
        ...prev.slice(0, 4) // Keep only last 5 notifications
      ]);
    };

    return () => {
      window.showNotification = null;
    };
  }, []);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isConnected && notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {/* Connection Status */}
      {isConnected && (
        <div className="bg-green-100 border border-green-200 rounded-lg p-3 mb-2 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-800 font-medium">
              Real-time tracking active
            </span>
          </div>
        </div>
      )}

      {/* Recent Notifications */}
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white border border-gray-200 rounded-lg p-3 mb-2 shadow-lg animate-slide-in"
        >
          <div className="flex items-start space-x-2">
            <div className="text-blue-500 text-lg">🚚</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-sm">
                {notification.title}
              </div>
              <div className="text-gray-600 text-xs mt-1">
                {notification.body}
              </div>
              <div className="text-gray-400 text-xs mt-1">
                {formatTime(notification.timestamp)}
              </div>
            </div>
            <button
              onClick={() => {
                setNotifications(prev => 
                  prev.filter(n => n.id !== notification.id)
                );
              }}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DeliveryNotifications;