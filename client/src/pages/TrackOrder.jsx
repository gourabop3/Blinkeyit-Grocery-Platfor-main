import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';

const TrackOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { 
    joinOrderTracking, 
    leaveOrderTracking, 
    getDeliveryUpdate, 
    requestDeliveryUpdate,
    isConnected 
  } = useSocket();

  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState('');

  // Status configuration for display
  const statusConfig = {
    assigned: { 
      label: 'Assigned', 
      color: 'bg-blue-500', 
      icon: '👤',
      description: 'Delivery partner assigned'
    },
    pickup_started: { 
      label: 'Heading to Store', 
      color: 'bg-yellow-500', 
      icon: '🏪',
      description: 'Partner is going to pickup your order'
    },
    picked_up: { 
      label: 'Picked Up', 
      color: 'bg-orange-500', 
      icon: '📦',
      description: 'Order picked up from store'
    },
    in_transit: { 
      label: 'On the Way', 
      color: 'bg-purple-500', 
      icon: '🚚',
      description: 'Your order is on the way!'
    },
    arrived: { 
      label: 'Arrived', 
      color: 'bg-green-400', 
      icon: '📍',
      description: 'Delivery partner has arrived'
    },
    delivered: { 
      label: 'Delivered', 
      color: 'bg-green-600', 
      icon: '✅',
      description: 'Order delivered successfully'
    },
    failed: { 
      label: 'Failed', 
      color: 'bg-red-500', 
      icon: '❌',
      description: 'Delivery failed'
    },
    cancelled: { 
      label: 'Cancelled', 
      color: 'bg-gray-500', 
      icon: '🚫',
      description: 'Delivery cancelled'
    }
  };

  useEffect(() => {
    if (orderId) {
      // Join order tracking room
      joinOrderTracking(orderId);
      
      // Fetch initial tracking data
      fetchTrackingData();
      
      // Request live updates
      requestDeliveryUpdate(orderId);

      // Set up polling for live location
      const locationInterval = setInterval(() => {
        if (isConnected) {
          fetchLiveLocation();
        }
      }, 10000); // Update every 10 seconds

      return () => {
        leaveOrderTracking(orderId);
        clearInterval(locationInterval);
      };
    }
  }, [orderId, isConnected]);

  // Listen for real-time updates
  useEffect(() => {
    const deliveryUpdate = getDeliveryUpdate(orderId);
    if (deliveryUpdate) {
      setTrackingData(prev => ({
        ...prev,
        status: deliveryUpdate.status,
        partner: deliveryUpdate.partner,
        estimatedDeliveryTime: deliveryUpdate.estimatedDeliveryTime,
        currentLocation: deliveryUpdate.currentLocation,
        lastUpdate: deliveryUpdate.lastUpdate,
      }));

      if (deliveryUpdate.status === 'arrived') {
        setShowOTPInput(true);
      }
    }
  }, [getDeliveryUpdate(orderId)]);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(SummaryApi.getDeliveryTracking.url.replace(':orderId', orderId), {
        method: SummaryApi.getDeliveryTracking.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setTrackingData(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch tracking data');
      console.error('Tracking fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveLocation = async () => {
    try {
      const response = await fetch(SummaryApi.getLiveLocation.url.replace(':orderId', orderId), {
        method: SummaryApi.getLiveLocation.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setLiveLocation(data.data);
      }
    } catch (err) {
      console.error('Live location fetch error:', err);
    }
  };

  const handleOTPSubmit = async () => {
    if (!otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }

    try {
      const response = await fetch(SummaryApi.verifyDeliveryOTP.url.replace(':orderId', orderId), {
        method: SummaryApi.verifyDeliveryOTP.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('OTP verified successfully!');
        setShowOTPInput(false);
        setOtp('');
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Failed to verify OTP');
      console.error('OTP verification error:', err);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getEstimatedArrival = () => {
    if (trackingData?.liveUpdates?.estimatedArrival) {
      return formatTime(trackingData.liveUpdates.estimatedArrival);
    }
    if (trackingData?.metrics?.estimatedDeliveryTime) {
      return formatTime(trackingData.metrics.estimatedDeliveryTime);
    }
    return 'Calculating...';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Tracking Data</div>
            <div className="text-red-500 mb-4">{error}</div>
            <button 
              onClick={fetchTrackingData}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-gray-500 text-lg">No tracking data available for this order.</div>
          <button 
            onClick={() => navigate('/orders')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[trackingData.status] || statusConfig.assigned;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/orders')}
            className="text-blue-600 hover:text-blue-700 flex items-center mb-4"
          >
            ← Back to Orders
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <div className="text-gray-600">
            Order ID: <span className="font-mono">{trackingData.orderId?.orderId}</span>
          </div>
        </div>

        {/* Connection Status */}
        <div className="mb-4">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {isConnected ? 'Live Tracking Active' : 'Connection Lost'}
          </div>
        </div>

        {/* Current Status Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className={`w-12 h-12 ${currentStatus.color} rounded-full flex items-center justify-center text-white text-xl mr-4`}>
                {currentStatus.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{currentStatus.label}</h2>
                <p className="text-gray-600">{currentStatus.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Estimated Arrival</div>
              <div className="text-lg font-semibold text-gray-900">{getEstimatedArrival()}</div>
            </div>
          </div>

          {/* Live Distance Info */}
          {trackingData.liveUpdates?.distanceToCustomer && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-600 font-medium">Distance Away</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {trackingData.liveUpdates.distanceToCustomer.toFixed(1)} km
                  </div>
                </div>
                <div className="text-blue-600">
                  📍
                </div>
              </div>
            </div>
          )}

          {/* OTP Input */}
          {showOTPInput && trackingData.status === 'arrived' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Verify Delivery OTP</h3>
              <p className="text-yellow-700 mb-3">Please provide the OTP to your delivery partner to complete the delivery.</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="flex-1 px-3 py-2 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  maxLength={6}
                />
                <button
                  onClick={handleOTPSubmit}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                >
                  Verify
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delivery Partner Info */}
        {trackingData.deliveryPartnerId && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Partner</h3>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 mr-4">
                👤
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{trackingData.deliveryPartnerId.name}</div>
                <div className="text-gray-600">{trackingData.deliveryPartnerId.mobile}</div>
                {trackingData.deliveryPartnerId.vehicleDetails && (
                  <div className="text-sm text-gray-500 capitalize">
                    {trackingData.deliveryPartnerId.vehicleDetails.type} • {trackingData.deliveryPartnerId.vehicleDetails.plateNumber}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center text-yellow-500">
                  ⭐ {trackingData.deliveryPartnerId.statistics?.avgRating?.toFixed(1) || 'New'}
                </div>
                <div className="text-sm text-gray-500">
                  {trackingData.deliveryPartnerId.statistics?.totalDeliveries || 0} deliveries
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Timeline */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Timeline</h3>
          <div className="space-y-4">
            {trackingData.timeline?.map((event, index) => {
              const eventStatus = statusConfig[event.status] || statusConfig.assigned;
              const isCompleted = index < trackingData.timeline.length - 1 || trackingData.status === event.status;
              
              return (
                <div key={index} className="flex items-start">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    isCompleted ? eventStatus.color + ' text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {eventStatus.icon}
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <div className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                      {eventStatus.label}
                    </div>
                    {event.notes && (
                      <div className="text-sm text-gray-600 mt-1">{event.notes}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(event.timestamp)} at {formatTime(event.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Order Total</div>
              <div className="font-semibold text-gray-900">
                ₹{trackingData.orderId?.totalAmt?.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Delivery Address</div>
              <div className="font-semibold text-gray-900">
                {trackingData.customerLocation?.address}
              </div>
            </div>
            {trackingData.deliveryDetails?.deliveryInstructions && (
              <div className="md:col-span-2">
                <div className="text-sm text-gray-500">Delivery Instructions</div>
                <div className="font-semibold text-gray-900">
                  {trackingData.deliveryDetails.deliveryInstructions}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Issues Section */}
        {trackingData.issues && trackingData.issues.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reported Issues</h3>
            <div className="space-y-3">
              {trackingData.issues.map((issue, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-red-800 capitalize">
                        {issue.type.replace('_', ' ')}
                      </div>
                      <div className="text-red-700 mt-1">{issue.description}</div>
                    </div>
                    <div className="text-xs text-red-600">
                      {formatTime(issue.timestamp)}
                    </div>
                  </div>
                  {issue.supportTicketId && (
                    <div className="text-xs text-red-600 mt-2">
                      Support Ticket: {issue.supportTicketId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TrackOrder;