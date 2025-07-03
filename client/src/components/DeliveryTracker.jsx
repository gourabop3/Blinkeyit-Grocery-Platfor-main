import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const DeliveryTracker = ({ order }) => {
  const navigate = useNavigate();
  const { joinOrderTracking, getDeliveryUpdate, isConnected } = useSocket();
  const [deliveryStatus, setDeliveryStatus] = useState(null);

  useEffect(() => {
    if (order && order._id) {
      // Join tracking for this order
      joinOrderTracking(order._id);
      
      // Get any existing delivery updates
      const update = getDeliveryUpdate(order._id);
      if (update) {
        setDeliveryStatus(update);
      }
    }
  }, [order, joinOrderTracking, getDeliveryUpdate, isConnected]);

  // Listen for real-time updates
  useEffect(() => {
    const update = getDeliveryUpdate(order?._id);
    if (update) {
      setDeliveryStatus(update);
    }
  }, [getDeliveryUpdate(order?._id)]);

  const getStatusDisplay = (status) => {
    const statusMap = {
      'Processing': { label: 'Order Confirmed', color: 'bg-blue-500', icon: '📋' },
      'Confirmed': { label: 'Order Confirmed', color: 'bg-blue-500', icon: '✅' },
      'Preparing': { label: 'Preparing Order', color: 'bg-yellow-500', icon: '👨‍🍳' },
      'Ready': { label: 'Ready for Pickup', color: 'bg-orange-500', icon: '📦' },
      'Assigned': { label: 'Driver Assigned', color: 'bg-purple-500', icon: '🚗' },
      'Picked_up': { label: 'Order Picked Up', color: 'bg-indigo-500', icon: '📋' },
      'In_transit': { label: 'On the Way', color: 'bg-blue-600', icon: '🚚' },
      'Delivered': { label: 'Delivered', color: 'bg-green-600', icon: '✅' },
      'Cancelled': { label: 'Cancelled', color: 'bg-red-500', icon: '❌' },
      'Failed': { label: 'Delivery Failed', color: 'bg-red-600', icon: '⚠️' },
    };
    return statusMap[status] || statusMap['Processing'];
  };

  const canTrack = () => {
    const trackableStatuses = ['Assigned', 'Picked_up', 'In_transit'];
    return trackableStatuses.includes(order?.order_status);
  };

  const currentStatus = getStatusDisplay(order?.order_status);
  const hasLiveTracking = deliveryStatus && isConnected;

  return (
    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 space-y-2 sm:space-y-0">
        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Delivery Status</h4>
        {isConnected && (
          <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full self-start sm:self-auto">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
            Live
          </span>
        )}
      </div>

      {/* Current Status */}
      <div className="flex items-center space-x-3 mb-4">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 ${currentStatus.color} rounded-full flex items-center justify-center text-white text-sm sm:text-lg`}>
          {currentStatus.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 text-sm sm:text-base">{currentStatus.label}</div>
          <div className="text-xs sm:text-sm text-gray-600">
            {hasLiveTracking && deliveryStatus.lastUpdate
              ? `Updated ${new Date(deliveryStatus.lastUpdate).toLocaleTimeString()}`
              : `Order placed ${new Date(order?.createdAt).toLocaleDateString()}`
            }
          </div>
        </div>
      </div>

      {/* Delivery Partner Info */}
      {deliveryStatus?.partner && (
        <div className="bg-white rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm">
              👤
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-xs sm:text-sm truncate">{deliveryStatus.partner.name}</div>
              <div className="text-xs text-gray-600">{deliveryStatus.partner.mobile}</div>
              {deliveryStatus.partner.vehicleDetails && (
                <div className="text-xs text-gray-500 capitalize">
                  {deliveryStatus.partner.vehicleDetails.type}
                </div>
              )}
            </div>
            {deliveryStatus.partner.rating && (
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-yellow-600">
                  ⭐ {deliveryStatus.partner.rating.toFixed(1)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Updates */}
      {hasLiveTracking && deliveryStatus.distanceToCustomer && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs sm:text-sm font-medium text-blue-900">Distance Away</div>
              <div className="text-base sm:text-lg font-bold text-blue-900">
                {deliveryStatus.distanceToCustomer.toFixed(1)} km
              </div>
            </div>
            <div className="text-blue-600 text-lg sm:text-2xl">📍</div>
          </div>
          {deliveryStatus.estimatedArrival && (
            <div className="text-xs text-blue-700 mt-1">
              ETA: {new Date(deliveryStatus.estimatedArrival).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}

      {/* OTP Display */}
      {deliveryStatus?.otp && order?.order_status === 'In_transit' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="text-xs sm:text-sm font-medium text-yellow-800 mb-1">Delivery OTP</div>
          <div className="text-lg sm:text-2xl font-bold text-yellow-900 tracking-widest">
            {deliveryStatus.otp}
          </div>
          <div className="text-xs text-yellow-700 mt-1">
            Share this OTP with your delivery partner
          </div>
        </div>
      )}

      {/* Track Order Button */}
      {canTrack() && (
        <button
          onClick={() => navigate(`/track/${order._id}`)}
          className="w-full bg-blue-600 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
        >
          Track Live Location 📍
        </button>
      )}

      {/* Issues */}
      {deliveryStatus?.issues && deliveryStatus.issues.length > 0 && (
        <div className="mt-4">
          <div className="text-xs sm:text-sm font-medium text-red-800 mb-2">Delivery Issues</div>
          {deliveryStatus.issues.map((issue, index) => (
            <div key={index} className="bg-red-50 border border-red-200 rounded p-2 mb-2">
              <div className="text-xs sm:text-sm text-red-800 capitalize">
                {issue.type.replace('_', ' ')}: {issue.description}
              </div>
              <div className="text-xs text-red-600">
                {new Date(issue.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryTracker;