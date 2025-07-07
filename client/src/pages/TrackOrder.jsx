import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import SummaryApi, { baseURL } from '../common/SummaryApi';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';
import OrderTimeline from '../components/OrderTimeline';

const TrackOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { 
    joinOrderTracking, 
    leaveOrderTracking, 
    getDeliveryUpdate,
    requestDeliveryUpdate,
    isConnected,
    deliveryUpdates
  } = useSocket();

  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Status configuration for display
  const statusConfig = {
    assigned: { 
      label: 'Delivery Partner Assigned', 
      color: 'bg-blue-500', 
      icon: '👤',
      description: 'A delivery partner has been assigned to your order'
    },
    pickup_started: { 
      label: 'Heading to Store', 
      color: 'bg-yellow-500', 
      icon: '🏪',
      description: 'Delivery partner is heading to the store to collect your order'
    },
    picked_up: { 
      label: 'Order Collected', 
      color: 'bg-orange-500', 
      icon: '📦',
      description: 'Your order has been picked up from the store'
    },
    in_transit: { 
      label: 'Out for Delivery', 
      color: 'bg-purple-500', 
      icon: '🚚',
      description: 'Your order is on the way to your delivery address'
    },
    arrived: { 
      label: 'Delivery Partner Arrived', 
      color: 'bg-green-400', 
      icon: '📍',
      description: 'Delivery partner has arrived at your location'
    },
    delivered: { 
      label: 'Delivered Successfully', 
      color: 'bg-green-600', 
      icon: '✅',
      description: 'Your order has been delivered successfully'
    },
    failed: { 
      label: 'Delivery Failed', 
      color: 'bg-red-500', 
      icon: '❌',
      description: 'Delivery attempt failed'
    },
    cancelled: { 
      label: 'Delivery Cancelled', 
      color: 'bg-gray-500', 
      icon: '🚫',
      description: 'Delivery has been cancelled'
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

      return () => {
        leaveOrderTracking(orderId);
      };
    }
  }, [orderId, isConnected]);

  // Listen for real-time updates coming from context
  useEffect(() => {
    const deliveryUpdate = deliveryUpdates[orderId];
    if (deliveryUpdate) {
      setTrackingData(prev => ({
        ...prev,
        status: deliveryUpdate.status,
        deliveryPartnerId: deliveryUpdate.partner || prev?.deliveryPartnerId,
        liveUpdates: {
          ...prev?.liveUpdates,
          distanceToCustomer: deliveryUpdate.distanceToCustomer,
          estimatedArrival: deliveryUpdate.estimatedArrival,
          lastUpdate: deliveryUpdate.lastUpdate,
        }
      }));

      if (deliveryUpdate.status === 'arrived') {
        setShowOTPInput(true);
      }
    }
  }, [deliveryUpdates, orderId]);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(baseURL + SummaryApi.getDeliveryTracking.url.replace(':orderId', orderId), {
        method: SummaryApi.getDeliveryTracking.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setTrackingData(data.data);
        
        // Show OTP input if delivery partner has arrived
        if (data.data.status === 'arrived') {
          setShowOTPInput(true);
        }
      } else {
        setError(data.message || 'Failed to fetch tracking data');
      }
    } catch (err) {
      setError('Failed to fetch tracking data. Please check your connection.');
      console.error('Tracking fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async () => {
    if (!otp.trim() || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setOtpLoading(true);
      const response = await fetch(baseURL + SummaryApi.verifyDeliveryOTP.url.replace(':orderId', orderId), {
        method: SummaryApi.verifyDeliveryOTP.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp: otp.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('OTP verified successfully! Delivery confirmed.');
        setShowOTPInput(false);
        setOtp('');
        // Refresh tracking data to get updated status
        fetchTrackingData();
      } else {
        toast.error(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      toast.error('Failed to verify OTP. Please try again.');
      console.error('OTP verification error:', err);
    } finally {
      setOtpLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
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
            <div className="text-red-600 text-lg font-semibold mb-2">Unable to Load Tracking Data</div>
            <div className="text-red-500 mb-4">{error}</div>
            <button 
              onClick={fetchTrackingData}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
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
          <div className="text-gray-500 text-lg mb-4">No tracking information available for this order.</div>
          <button 
            onClick={() => navigate('/orders')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[trackingData.status] || statusConfig.assigned;

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/orders')}
            className="text-blue-600 hover:text-blue-700 flex items-center mb-4 font-medium"
          >
            ← Back to My Orders
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <div className="text-gray-600 flex items-center gap-4">
            <span>Order ID: <span className="font-mono font-semibold">{trackingData.orderId?.orderId}</span></span>
            <span>•</span>
            <span>Ordered on {formatDate(trackingData.orderId?.createdAt)}</span>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <StatusBadge status={trackingData.status} />
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            {isConnected ? 'Live Tracking' : 'Offline'}
          </div>
          {trackingData.liveUpdates?.distanceToCustomer && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              📍 {trackingData.liveUpdates.distanceToCustomer.toFixed(1)} km away
            </span>
          )}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            🕒 ETA {getEstimatedArrival()}
          </span>
        </div>

        {/* Current Status Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className={`w-16 h-16 ${currentStatus.color} rounded-xl flex items-center justify-center text-white text-2xl mr-6 shadow-lg`}>
                {currentStatus.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{currentStatus.label}</h2>
                <p className="text-gray-600 text-lg">{currentStatus.description}</p>
              </div>
            </div>
            {trackingData.liveUpdates?.estimatedArrival && (
              <div className="text-right">
                <div className="text-sm text-gray-500 font-medium">Estimated Delivery</div>
                <div className="text-xl font-bold text-gray-900">{getEstimatedArrival()}</div>
                <div className="text-sm text-gray-500">{formatDate(trackingData.liveUpdates.estimatedArrival)}</div>
              </div>
            )}
          </div>

          {/* Distance Info */}
          {trackingData.liveUpdates?.distanceToCustomer && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-600 font-semibold">Distance to Your Location</div>
                  <div className="text-3xl font-bold text-blue-900">
                    {trackingData.liveUpdates.distanceToCustomer.toFixed(1)} km
                  </div>
                  <div className="text-sm text-blue-700">Live tracking active</div>
                </div>
                <div className="text-blue-600 text-4xl">
                  📍
                </div>
              </div>
            </div>
          )}

          {/* OTP Verification Section */}
          {showOTPInput && trackingData.status === 'arrived' && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xl mr-4">
                  🔐
                </div>
                <div>
                  <h3 className="text-xl font-bold text-yellow-800">Verify Delivery OTP</h3>
                  <p className="text-yellow-700">Your delivery partner has arrived. Please verify the OTP to complete delivery.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="flex-1 px-4 py-3 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-center text-lg font-mono tracking-widest"
                  maxLength={6}
                  disabled={otpLoading}
                />
                <button
                  onClick={handleOTPSubmit}
                  disabled={otpLoading || otp.length !== 6}
                  className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delivery Partner Info */}
        {trackingData.deliveryPartnerId && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Delivery Partner</h3>
            <div className="flex items-center gap-6">
              {/* Avatar */}
              {trackingData.deliveryPartnerId.photoUrl ? (
                <img
                  src={trackingData.deliveryPartnerId.photoUrl}
                  alt="Delivery partner"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {trackingData.deliveryPartnerId.name?.charAt(0)?.toUpperCase() || '👤'}
                </div>
              )}

              <div className="flex-1">
                <div className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  {trackingData.deliveryPartnerId.name}
                  {trackingData.deliveryPartnerId.statistics?.avgRating && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
                      ⭐ {trackingData.deliveryPartnerId.statistics.avgRating.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="text-gray-600 mb-1">{trackingData.deliveryPartnerId.mobile}</div>
                {trackingData.deliveryPartnerId.vehicleDetails && (
                  <div className="text-sm text-gray-500 capitalize">
                    {trackingData.deliveryPartnerId.vehicleDetails.type} • {trackingData.deliveryPartnerId.vehicleDetails.plateNumber}
                  </div>
                )}
              </div>

              {/* Call button */}
              {trackingData.deliveryPartnerId.mobile && (
                <a
                  href={`tel:${trackingData.deliveryPartnerId.mobile}`}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                >
                  📞 Call Partner
                </a>
              )}
            </div>
          </div>
        )}

        {/* Delivery Timeline */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Delivery Timeline</h3>
          <OrderTimeline timeline={trackingData.timeline} currentStatus={trackingData.status} />
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 font-medium">Order Total</div>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{trackingData.orderId?.totalAmt?.toFixed(2) || '0.00'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Payment Status</div>
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  trackingData.orderId?.payment_status === 'PAID' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {trackingData.orderId?.payment_status || 'N/A'}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 font-medium">Delivery Address</div>
                <div className="font-semibold text-gray-900">
                  {trackingData.customerLocation?.address || 'Address not available'}
                </div>
              </div>
              {trackingData.deliveryDetails?.deliveryInstructions && (
                <div>
                  <div className="text-sm text-gray-500 font-medium">Delivery Instructions</div>
                  <div className="font-semibold text-gray-900">
                    {trackingData.deliveryDetails.deliveryInstructions}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Issues Section */}
        {trackingData.issues && trackingData.issues.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reported Issues</h3>
            <div className="space-y-4">
              {trackingData.issues.map((issue, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-red-800 capitalize mb-1">
                        {issue.type.replace('_', ' ')}
                      </div>
                      <div className="text-red-700">{issue.description}</div>
                    </div>
                    <div className="text-xs text-red-600">
                      {formatTime(issue.timestamp)}
                    </div>
                  </div>
                  {issue.supportTicketId && (
                    <div className="text-xs text-red-600 mt-2 font-mono">
                      Ticket: {issue.supportTicketId}
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