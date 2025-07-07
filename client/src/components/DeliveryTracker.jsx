import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const DeliveryTracker = ({ order }) => {
  const navigate = useNavigate();
  const { joinOrderTracking, getDeliveryUpdate, deliveryUpdates, isConnected } = useSocket();
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

  // Listen for incoming delivery updates for this order
  useEffect(() => {
    if (!order?._id) return;
    const update = deliveryUpdates[order._id];
    if (update) {
      setDeliveryStatus(update);
    }
  }, [deliveryUpdates, order?._id]);

  const getStatusDisplay = (status) => {
    const statusMap = {
      'Processing': { 
        label: 'Order Confirmed', 
        color: 'bg-blue-500', 
        icon: '✅', 
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-800'
      },
      'Confirmed': { 
        label: 'Order Confirmed', 
        color: 'bg-blue-500', 
        icon: '✅', 
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-800'
      },
      'Preparing': { 
        label: 'Preparing Your Order', 
        color: 'bg-yellow-500', 
        icon: '👨‍🍳', 
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-800'
      },
      'Ready': { 
        label: 'Ready for Pickup', 
        color: 'bg-orange-500', 
        icon: '📦', 
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-800'
      },
      'Assigned': { 
        label: 'Delivery Partner Assigned', 
        color: 'bg-purple-500', 
        icon: '�', 
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-800'
      },
      'Picked_up': { 
        label: 'Order Collected', 
        color: 'bg-indigo-500', 
        icon: '🏪', 
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-800'
      },
      'In_transit': { 
        label: 'Out for Delivery', 
        color: 'bg-blue-600', 
        icon: '🚚', 
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-800'
      },
      'Delivered': { 
        label: 'Delivered Successfully', 
        color: 'bg-green-600', 
        icon: '✅', 
        bgColor: 'bg-green-50',
        textColor: 'text-green-800'
      },
      'Cancelled': { 
        label: 'Order Cancelled', 
        color: 'bg-red-500', 
        icon: '❌', 
        bgColor: 'bg-red-50',
        textColor: 'text-red-800'
      },
      'Failed': { 
        label: 'Delivery Failed', 
        color: 'bg-red-600', 
        icon: '⚠️', 
        bgColor: 'bg-red-50',
        textColor: 'text-red-800'
      },
    };
    return statusMap[status] || statusMap['Processing'];
  };

  const canTrack = () => {
    const trackableStatuses = ['Assigned', 'Picked_up', 'In_transit'];
    return trackableStatuses.includes(order?.order_status);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const currentStatus = getStatusDisplay(order?.order_status);
  const hasLiveTracking = deliveryStatus && isConnected;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className={`${currentStatus.bgColor} px-6 py-4 border-b border-gray-100`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${currentStatus.color} rounded-full flex items-center justify-center text-white text-lg shadow-sm`}>
              {currentStatus.icon}
            </div>
            <div>
              <h4 className={`font-bold ${currentStatus.textColor} text-lg`}>
                {currentStatus.label}
              </h4>
              <p className={`text-sm ${currentStatus.textColor} opacity-80`}>
                {hasLiveTracking && deliveryStatus.lastUpdate
                  ? `Updated ${formatTime(deliveryStatus.lastUpdate)}`
                  : `Ordered on ${new Date(order?.createdAt).toLocaleDateString()}`
                }
              </p>
            </div>
          </div>
          
          {/* Live Status Indicator */}
          {isConnected && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Live</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Delivery Partner Info */}
        {deliveryStatus?.partner && (
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-gray-900 mb-3">Your Delivery Partner</h5>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {deliveryStatus.partner.name?.charAt(0)?.toUpperCase() || '👤'}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{deliveryStatus.partner.name}</div>
                  <div className="text-sm text-gray-600">{deliveryStatus.partner.mobile}</div>
                  {deliveryStatus.partner.vehicleDetails && (
                    <div className="text-xs text-gray-500 capitalize mt-1">
                      {deliveryStatus.partner.vehicleDetails.type} • {deliveryStatus.partner.vehicleDetails.plateNumber}
                    </div>
                  )}
                </div>
                {deliveryStatus.partner.rating && (
                  <div className="text-right">
                    <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      ⭐ {deliveryStatus.partner.rating.toFixed(1)}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Call Button */}
              {deliveryStatus.partner.mobile && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <a
                    href={`tel:${deliveryStatus.partner.mobile}`}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium text-center block"
                  >
                    📞 Call Delivery Partner
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Updates */}
        {hasLiveTracking && deliveryStatus.distanceToCustomer && (
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-gray-900 mb-3">Live Tracking</h5>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-blue-900">Distance from You</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {deliveryStatus.distanceToCustomer.toFixed(1)} km
                  </div>
                  <div className="text-xs text-blue-700">
                    {deliveryStatus.estimatedArrival && `ETA: ${formatTime(deliveryStatus.estimatedArrival)}`}
                  </div>
                </div>
                <div className="text-blue-600 text-3xl">📍</div>
              </div>
            </div>
          </div>
        )}

        {/* OTP Display */}
        {deliveryStatus?.otp && order?.order_status === 'In_transit' && (
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-gray-900 mb-3">Delivery Verification</h5>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white text-lg">
                  🔐
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-yellow-800">Your OTP</div>
                  <div className="text-2xl font-bold text-yellow-900 tracking-widest font-mono">
                    {deliveryStatus.otp}
                  </div>
                  <div className="text-xs text-yellow-700">
                    Share this with your delivery partner
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Track Order Button */}
        {canTrack() && (
          <div className="mb-4">
            <button
              onClick={() => navigate(`/track/${order._id}`)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              🔍 Track Live Location & Timeline
            </button>
          </div>
        )}

        {/* Order Summary */}
        <div className="border-t border-gray-100 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Order Total</span>
              <div className="font-semibold text-gray-900">₹{order?.totalAmt?.toFixed(2) || '0.00'}</div>
            </div>
            <div>
              <span className="text-gray-500">Payment</span>
              <div className={`font-semibold ${
                order?.payment_status === 'PAID' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {order?.payment_status || 'Pending'}
              </div>
            </div>
          </div>
        </div>

        {/* Issues */}
        {deliveryStatus?.issues && deliveryStatus.issues.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h5 className="text-sm font-semibold text-gray-900 mb-3">Issues Reported</h5>
            <div className="space-y-2">
              {deliveryStatus.issues.map((issue, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-sm text-red-800 font-medium capitalize">
                    {issue.type.replace('_', ' ')}
                  </div>
                  <div className="text-sm text-red-700">{issue.description}</div>
                  <div className="text-xs text-red-600 mt-1">
                    {new Date(issue.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryTracker;