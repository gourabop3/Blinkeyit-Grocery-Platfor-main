import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { useEffect as useDebugEffect } from 'react';
import Axios from '../utils/Axios';
import SummaryApi, { baseURL } from '../common/SummaryApi';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [deliveryUpdates, setDeliveryUpdates] = useState({});
  const [liveDeliveries, setLiveDeliveries] = useState({});
  
  const user = useSelector((state) => state?.user);

  // Log Redux user state whenever it changes
  useDebugEffect(() => {
    console.log('[DEBUG][REDUX] user slice updated:', user);
  }, [user]);

  const token = sessionStorage.getItem('accesstoken') || localStorage.getItem('token');

  console.log('[DEBUG][TOKEN]', token ? 'Token present' : 'No token');

  // Helper: unified toast styling
  const showToast = (title, body, type = 'success') => {
    const message = `${title}${body ? ' – ' + body : ''}`;
    const baseOptions = {
      duration: 5000,
      position: 'top-right',
      style: {
        background: '#ffffff',
        color: '#111827',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 6px rgba(0,0,0,0.08)',
      },
      iconTheme: {
        primary: '#15803d', // Tailwind green-700
        secondary: '#ffffff',
      },
    };

    // Use toast variant based on type
    if (type === 'error') {
      toast.error(message, baseOptions);
    } else if (type === 'loading') {
      toast.loading(message, baseOptions);
    } else if (type === 'info') {
      toast(message, baseOptions);
    } else {
      toast.success(message, baseOptions);
    }
  };

  useEffect(() => {
    if (user && token) {
      console.log('[DEBUG][SOCKET] Initializing socket. App role:', user.role);
      // Map application roles to socket userType labels expected by backend
      const roleToUserType = {
        'ADMIN': 'admin',
        'USER': 'customer',
      };

      const userType = roleToUserType[user?.role] || 'customer';

      // Initialize socket connection
      const socketInstance = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000', {
        auth: {
          token: token,
          userType, // Expected values: 'customer', 'partner', or 'admin'
        },
        transports: ['websocket', 'polling'],
      });

      // Connection event handlers
      socketInstance.on('connect', () => {
        console.log('✅ Connected to delivery tracking server. Socket ID:', socketInstance.id);
        setIsConnected(true);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('❌ Disconnected from delivery tracking server. Reason:', reason);
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        setIsConnected(false);
      });

      // Delivery tracking events
      socketInstance.on('order_assigned', (data) => {
        console.log('🚚 Order assigned to delivery partner:', data);
        setDeliveryUpdates(prev => ({
          ...prev,
          [data.orderId]: {
            ...prev[data.orderId],
            status: 'assigned',
            partner: data.partner,
            estimatedDeliveryTime: data.estimatedDeliveryTime,
            otp: data.otp,
            lastUpdate: new Date(),
          }
        }));
        
        showToast('Order Assigned', 'Your order has been assigned to a delivery partner!', 'success');
      });

      socketInstance.on('delivery_status_update', (data) => {
        console.log('📱 Delivery status update:', data);
        setDeliveryUpdates(prev => ({
          ...prev,
          [data.orderId]: {
            ...prev[data.orderId],
            status: data.status,
            notes: data.notes,
            location: data.location,
            partner: data.partner,
            lastUpdate: new Date(),
          }
        }));

        // User-facing toast for key status updates
        const statusMessages = {
          picked_up: 'Order picked up from store',
          in_transit: 'Your order is on the way!',
          arrived: 'Delivery partner has arrived',
          delivered: 'Order delivered successfully!',
        };
        if (statusMessages[data.status]) {
          showToast('Delivery Update', statusMessages[data.status], 'info');
        }

        // Play sound for admins
        if(user && user.role && user.role.includes('admin')) {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(()=>{});
        }
      });

      socketInstance.on('delivery_location_update', (data) => {
        console.log('📍 Live location update:', data);
        setDeliveryUpdates(prev => ({
          ...prev,
          [data.orderId]: {
            ...prev[data.orderId],
            currentLocation: data.location,
            speed: data.speed,
            heading: data.heading,
            distanceToCustomer: data.distanceToCustomer,
            estimatedArrival: data.estimatedArrival,
            route: data.route,
            lastLocationUpdate: data.timestamp,
            storeLocation: data.storeLocation,
            customerLocation: data.customerLocation,
          }
        }));

        // Admin live deliveries map data
        setLiveDeliveries(prev => ({
          ...prev,
          [data.orderId]: {
            ...data,
            storeLocation: data.storeLocation,
            customerLocation: data.customerLocation,
          },
        }));
      });

      socketInstance.on('delivery_completed', (data) => {
        console.log('✅ Delivery completed:', data);
        setDeliveryUpdates(prev => ({
          ...prev,
          [data.orderId]: {
            ...prev[data.orderId],
            status: 'delivered',
            completedAt: data.completedAt,
            deliveryProof: data.deliveryProof,
            lastUpdate: new Date(),
          }
        }));

        showToast('Delivery Complete! 🎉', 'Your order has been delivered successfully!', 'success');
      });

      socketInstance.on('delivery_issue_reported', (data) => {
        console.log('⚠️ Delivery issue reported:', data);
        setDeliveryUpdates(prev => ({
          ...prev,
          [data.orderId]: {
            ...prev[data.orderId],
            issues: [...(prev[data.orderId]?.issues || []), {
              type: data.issueType,
              description: data.description,
              supportTicketId: data.supportTicketId,
              timestamp: data.timestamp,
            }],
            lastUpdate: new Date(),
          }
        }));

        showToast('Delivery Issue', data.description, 'error');
      });

      socketInstance.on('delivery_cancelled', (data) => {
        console.log('❌ Delivery cancelled:', data);
        setDeliveryUpdates(prev => ({
          ...prev,
          [data.orderId]: {
            ...prev[data.orderId],
            status: 'cancelled',
            cancelReason: data.reason,
            lastUpdate: new Date(),
          }
        }));

        showToast('Delivery Cancelled', data.reason, 'error');
      });

      socketInstance.on('otp_verified', (data) => {
        console.log('✅ OTP verified:', data);
        setDeliveryUpdates(prev => ({
          ...prev,
          [data.orderId]: {
            ...prev[data.orderId],
            otpVerified: true,
            lastUpdate: new Date(),
          }
        }));

        showToast('OTP Verified', 'Delivery OTP verified successfully', 'success');
      });

      socketInstance.on('delivery_update', (data) => {
        console.log('📦 Initial / requested delivery update:', data);
        setDeliveryUpdates(prev => ({
          ...prev,
          [data.orderId]: {
            ...prev[data.orderId],
            ...data, // merge all fields coming from server
            lastUpdate: new Date(),
          }
        }));
      });

      // Log every incoming event for debugging
      socketInstance.onAny((event, ...args) => {
        console.log('[SOCKET][EVENT]', event, args);
      });

      setSocket(socketInstance);

      // Cleanup on unmount
      return () => {
        socketInstance.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [user, token]);

  // Initial fetch of active deliveries for admin users
  useEffect(() => {
    const fetchActiveDeliveries = async () => {
      try {
        if (user?.role !== 'ADMIN') return;
        const response = await Axios({ ...SummaryApi.getAllActiveDeliveries });
        if (response.data.success) {
          const deliveriesArr = response.data.data.deliveries || [];
          const mapped = {};
          deliveriesArr.forEach(del => {
            if (del.lastLocationUpdate) {
              // Support both lat/lng and latitude/longitude naming
              const { latitude, longitude, lat, lng } = del.lastLocationUpdate;
              const latVal = latitude ?? lat;
              const lngVal = longitude ?? lng;
              if (typeof latVal === 'number' && typeof lngVal === 'number') {
                mapped[del.orderId?._id || del.orderId] = {
                  orderId: del.orderId?._id || del.orderId,
                  status: del.status,
                  location: {
                    latitude: latVal,
                    longitude: lngVal,
                  },
                  distanceToCustomer: del.metrics?.distanceToCustomer,
                  estimatedArrival: del.metrics?.estimatedDeliveryTime,
                  route: del.route?.map(pt => [pt.latitude ?? pt.lat, pt.longitude ?? pt.lng]) || [],
                };
              }
            }
          });
          setLiveDeliveries(mapped);
        }
      } catch (err) {
        console.error('[ADMIN] Failed to fetch active deliveries', err);
      }
    };

    fetchActiveDeliveries();
  }, [user]);

  // Helper functions
  const joinOrderTracking = (orderId) => {
    if (socket && isConnected) {
      socket.emit('join_order_tracking', orderId);
      console.log(`[SOCKET] emit join_order_tracking ->`, orderId);
    }
  };

  const leaveOrderTracking = (orderId) => {
    if (socket && isConnected) {
      socket.emit('leave_order_tracking', orderId);
      console.log(`[SOCKET] emit leave_order_tracking ->`, orderId);
    }
  };

  const requestDeliveryUpdate = (orderId) => {
    if (socket && isConnected) {
      socket.emit('request_delivery_update', orderId);
      console.log(`[SOCKET] emit request_delivery_update ->`, orderId);
    }
  };

  const submitDeliveryFeedback = (orderId, rating, comment) => {
    if (socket && isConnected) {
      socket.emit('delivery_feedback', { orderId, rating, comment });
      console.log(`⭐ Submitted feedback for order: ${orderId}`);
    }
  };

  const verifyDeliveryOTP = (orderId, otp) => {
    if (socket && isConnected) {
      socket.emit('verify_delivery_otp', { orderId, otp });
      console.log(`🔐 Verifying OTP for order: ${orderId}`);
    }
  };

  const getDeliveryUpdate = (orderId) => {
    return deliveryUpdates[orderId] || null;
  };

  const clearDeliveryUpdate = (orderId) => {
    setDeliveryUpdates(prev => {
      const newUpdates = { ...prev };
      delete newUpdates[orderId];
      return newUpdates;
    });
  };

  const value = {
    socket,
    isConnected,
    deliveryUpdates,
    liveDeliveries,
    joinOrderTracking,
    leaveOrderTracking,
    requestDeliveryUpdate,
    submitDeliveryFeedback,
    verifyDeliveryOTP,
    getDeliveryUpdate,
    clearDeliveryUpdate,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;