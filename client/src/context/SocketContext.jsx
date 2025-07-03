import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

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
  
  const user = useSelector((state) => state?.user?.user);
  const token = sessionStorage.getItem('accesstoken') || localStorage.getItem('token');

  useEffect(() => {
    if (user && token) {
      // Initialize socket connection
      const socketInstance = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000', {
        auth: {
          token: token,
          userType: 'customer', // Can be 'customer', 'partner', or 'admin'
        },
        transports: ['websocket', 'polling'],
      });

      // Connection event handlers
      socketInstance.on('connect', () => {
        console.log('✅ Connected to delivery tracking server');
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('❌ Disconnected from delivery tracking server');
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
        
        // Show notification
        if (window.showNotification) {
          window.showNotification('Order Assigned', 'Your order has been assigned to a delivery partner!');
        }
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

        // Show notification for important status updates
        const importantStatuses = ['picked_up', 'in_transit', 'arrived', 'delivered'];
        if (importantStatuses.includes(data.status) && window.showNotification) {
          const statusMessages = {
            picked_up: 'Order picked up from store',
            in_transit: 'Your order is on the way!',
            arrived: 'Delivery partner has arrived',
            delivered: 'Order delivered successfully!',
          };
          window.showNotification('Delivery Update', statusMessages[data.status] || 'Order status updated');
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
          }
        }));

        // Admin live deliveries map data
        setLiveDeliveries(prev => ({
          ...prev,
          [data.orderId]: data,
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

        if (window.showNotification) {
          window.showNotification('Delivery Complete! 🎉', 'Your order has been delivered successfully!');
        }
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

        if (window.showNotification) {
          window.showNotification('Delivery Issue', `Issue reported: ${data.description}`);
        }
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

        if (window.showNotification) {
          window.showNotification('Delivery Cancelled', `Reason: ${data.reason}`);
        }
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

      setSocket(socketInstance);

      // Cleanup on unmount
      return () => {
        socketInstance.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [user, token]);

  // Helper functions
  const joinOrderTracking = (orderId) => {
    if (socket && isConnected) {
      socket.emit('join_order_tracking', orderId);
      console.log(`👀 Joined tracking for order: ${orderId}`);
    }
  };

  const leaveOrderTracking = (orderId) => {
    if (socket && isConnected) {
      socket.emit('leave_order_tracking', orderId);
      console.log(`👋 Left tracking for order: ${orderId}`);
    }
  };

  const requestDeliveryUpdate = (orderId) => {
    if (socket && isConnected) {
      socket.emit('request_delivery_update', orderId);
      console.log(`🔄 Requested delivery update for order: ${orderId}`);
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