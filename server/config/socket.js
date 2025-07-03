const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const DeliveryPartnerModel = require("../models/deliveryPartner.model");
const DeliveryTrackingModel = require("../models/deliveryTracking.model");
const UserModel = require("../models/user.model");
const geolib = require("geolib");
const OrderModel = require("../models/order.model");

let io;
const connectedUsers = new Map(); // userId -> socketId
const connectedPartners = new Map(); // partnerId -> socketId
const orderTracking = new Map(); // orderId -> [socketIds of interested parties]

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const userType = socket.handshake.auth.userType; // 'customer', 'partner', or 'admin'
      
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.SECRET_KEY_JWT);
      
      if (userType === 'partner') {
        const partner = await DeliveryPartnerModel.findById(decoded.id);
        if (!partner) {
          return next(new Error("Authentication error: Partner not found"));
        }
        socket.userId = decoded.id;
        socket.userType = 'partner';
        socket.user = partner;
      } else if (userType === 'customer') {
        const user = await UserModel.findById(decoded.id);
        if (!user) {
          return next(new Error("Authentication error: User not found"));
        }
        socket.userId = decoded.id;
        socket.userType = 'customer';
        socket.user = user;
      } else if (userType === 'admin') {
        // Admin authentication logic
        socket.userId = decoded.id;
        socket.userType = 'admin';
      }
      
      next();
    } catch (error) {
      console.log("Socket authentication error:", error.message);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`${socket.userType} connected:`, socket.userId);

    // Store connection based on user type
    if (socket.userType === 'customer') {
      connectedUsers.set(socket.userId, socket.id);
    } else if (socket.userType === 'partner') {
      connectedPartners.set(socket.userId, socket.id);
      
      // Update partner's online status and socket ID
      DeliveryPartnerModel.findByIdAndUpdate(socket.userId, {
        socketId: socket.id,
        'availability.isOnline': true,
        'availability.lastSeen': new Date(),
      }).catch(console.error);
    }

    // Join room for order tracking
    socket.on("join_order_tracking", (orderId) => {
      socket.join(`order_${orderId}`);
      
      if (!orderTracking.has(orderId)) {
        orderTracking.set(orderId, new Set());
      }
      orderTracking.get(orderId).add(socket.id);
      
      console.log(`${socket.userType} joined order tracking:`, orderId);
    });

    // Leave order tracking
    socket.on("leave_order_tracking", (orderId) => {
      socket.leave(`order_${orderId}`);
      
      if (orderTracking.has(orderId)) {
        orderTracking.get(orderId).delete(socket.id);
        if (orderTracking.get(orderId).size === 0) {
          orderTracking.delete(orderId);
        }
      }
    });

    // Delivery Partner Events
    if (socket.userType === 'partner') {
      
      // Partner location update
      socket.on("location_update", async (data) => {
        try {
          const { latitude, longitude, speed, heading, accuracy, orderId } = data;
          
          // Update partner's current location
          await DeliveryPartnerModel.findByIdAndUpdate(socket.userId, {
            currentLocation: {
              latitude,
              longitude,
              lastUpdated: new Date(),
            },
          });

          // If partner is on an active delivery, update tracking
          if (orderId) {
            const tracking = await DeliveryTrackingModel.findOne({ orderId });
            if (tracking) {
              await tracking.addLocationUpdate(latitude, longitude, speed, heading, accuracy);
              
              // Calculate distance to customer
              let distanceKm = null;
              let eta = null;
              if (tracking.customerLocation && tracking.customerLocation.latitude) {
                const distM = geolib.getDistance(
                  { latitude, longitude },
                  { latitude: tracking.customerLocation.latitude, longitude: tracking.customerLocation.longitude }
                );
                distanceKm = distM / 1000;

                const speedKmh = speed || 30; // fallback 30 km/h
                eta = new Date(Date.now() + (distanceKm / speedKmh) * 3600 * 1000);

                tracking.metrics.distanceToCustomer = distanceKm;
                tracking.metrics.estimatedDeliveryTime = eta;
                await tracking.save();
              }

              // Broadcast location with extras to order room
              io.to(`order_${orderId}`).emit("delivery_location_update", {
                orderId,
                location: { latitude, longitude },
                timestamp: new Date(),
                speed,
                heading,
                distanceToCustomer: distanceKm,
                estimatedArrival: eta,
                route: tracking.route.map(p => [p.latitude, p.longitude])
              });

              // Additionally, notify all connected admin sockets so admin dashboard can display live updates
              io.sockets.sockets.forEach((s) => {
                if (s.userType === 'admin') {
                  s.emit('delivery_location_update', {
                    orderId,
                    location: { latitude, longitude },
                    timestamp: new Date(),
                    speed,
                    heading,
                    distanceToCustomer: distanceKm,
                    estimatedArrival: eta,
                    route: tracking.route.map(p => [p.latitude, p.longitude])
                  });
                }
              });
            }
          }
          
          socket.emit("location_update_ack", { success: true });
        } catch (error) {
          console.error("Location update error:", error);
          socket.emit("location_update_ack", { success: false, error: error.message });
        }
      });

      // Partner status update
      socket.on("status_update", async (data) => {
        try {
          const { orderId, status, notes, location, imageProof } = data;
          
          const tracking = await DeliveryTrackingModel.findOne({ orderId });
          if (tracking) {
            await tracking.updateStatus(status, location, notes, imageProof);
            
            // Broadcast status update to all tracking this order
            io.to(`order_${orderId}`).emit("delivery_status_update", {
              orderId,
              status,
              timestamp: new Date(),
              notes,
              location,
              partner: {
                name: socket.user.name,
                mobile: socket.user.mobile,
                vehicle: socket.user.vehicleDetails,
              },
            });
            
            // Notify connected admin sockets about status change
            io.sockets.sockets.forEach((s) => {
              if (s.userType === 'admin') {
                s.emit('delivery_status_update', {
                  orderId,
                  status,
                  timestamp: new Date(),
                  notes,
                  location,
                  partner: {
                    name: socket.user.name,
                    mobile: socket.user.mobile,
                    vehicle: socket.user.vehicleDetails,
                  },
                });
              }
            });

            // Also update the main Order document to keep order_status in sync
            let orderStatus = "Processing";

            switch (status) {
              case "assigned": orderStatus = "Assigned"; break;
              case "pickup_started": orderStatus = "Preparing"; break;
              case "picked_up": orderStatus = "Picked_up"; break;
              case "in_transit": orderStatus = "In_transit"; break;
              case "delivered": orderStatus = "Delivered"; break;
              case "failed": orderStatus = "Failed"; break;
              case "cancelled": orderStatus = "Cancelled"; break;
            }

            await OrderModel.findByIdAndUpdate(orderId, { order_status: orderStatus });
          }
          
          socket.emit("status_update_ack", { success: true });
        } catch (error) {
          console.error("Status update error:", error);
          socket.emit("status_update_ack", { success: false, error: error.message });
        }
      });

      // Partner availability toggle
      socket.on("toggle_availability", async (isOnDuty) => {
        try {
          await DeliveryPartnerModel.findByIdAndUpdate(socket.userId, {
            'availability.isOnDuty': isOnDuty,
            'availability.lastSeen': new Date(),
          });
          
          socket.emit("availability_updated", { isOnDuty });
          
          // Notify admin dashboard
          socket.broadcast.emit("partner_availability_changed", {
            partnerId: socket.userId,
            name: socket.user.name,
            isOnDuty,
          });
          
        } catch (error) {
          console.error("Availability update error:", error);
        }
      });

      // Report delivery issue
      socket.on("report_issue", async (data) => {
        try {
          const { orderId, issueType, description } = data;
          
          const tracking = await DeliveryTrackingModel.findOne({ orderId });
          if (tracking) {
            const supportTicketId = `TICKET-${Date.now()}`;
            await tracking.reportIssue(issueType, description, supportTicketId);
            
            // Notify customer and admin
            io.to(`order_${orderId}`).emit("delivery_issue_reported", {
              orderId,
              issueType,
              description,
              supportTicketId,
              timestamp: new Date(),
            });
          }
          
          socket.emit("issue_reported", { success: true });
        } catch (error) {
          console.error("Report issue error:", error);
          socket.emit("issue_reported", { success: false, error: error.message });
        }
      });
    }

    // Customer Events
    if (socket.userType === 'customer') {
      
      // Customer requests delivery update
      socket.on("request_delivery_update", async (orderId) => {
        try {
          const tracking = await DeliveryTrackingModel.findOne({ orderId })
            .populate("deliveryPartnerId", "name mobile vehicleDetails currentLocation");
          
          if (tracking) {
            socket.emit("delivery_update", {
              orderId,
              status: tracking.status,
              timeline: tracking.timeline,
              currentLocation: tracking.lastLocationUpdate,
              estimatedTime: tracking.metrics.estimatedDeliveryTime,
              partner: tracking.deliveryPartnerId,
            });
          }
        } catch (error) {
          console.error("Request delivery update error:", error);
        }
      });

      // Customer provides delivery feedback
      socket.on("delivery_feedback", async (data) => {
        try {
          const { orderId, rating, comment } = data;
          
          const tracking = await DeliveryTrackingModel.findOne({ orderId });
          if (tracking) {
            tracking.deliveryDetails.customerFeedback = {
              rating,
              comment,
              timestamp: new Date(),
            };
            await tracking.save();
            
            // Update partner's rating
            const partner = await DeliveryPartnerModel.findById(tracking.deliveryPartnerId);
            if (partner) {
              await partner.updateRating(rating);
            }
          }
          
          socket.emit("feedback_submitted", { success: true });
        } catch (error) {
          console.error("Delivery feedback error:", error);
          socket.emit("feedback_submitted", { success: false, error: error.message });
        }
      });
    }

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`${socket.userType} disconnected:`, socket.userId);
      
      if (socket.userType === 'customer') {
        connectedUsers.delete(socket.userId);
      } else if (socket.userType === 'partner') {
        connectedPartners.delete(socket.userId);
        
        // Update partner's offline status
        DeliveryPartnerModel.findByIdAndUpdate(socket.userId, {
          socketId: "",
          'availability.isOnline': false,
          'availability.lastSeen': new Date(),
        }).catch(console.error);
      }
      
      // Clean up order tracking
      orderTracking.forEach((socketIds, orderId) => {
        socketIds.delete(socket.id);
        if (socketIds.size === 0) {
          orderTracking.delete(orderId);
        }
      });
    });
  });

  return io;
};

// Helper functions to emit events from other parts of the application
const emitToOrder = (orderId, event, data) => {
  if (io) {
    io.to(`order_${orderId}`).emit(event, data);
  }
};

const emitToUser = (userId, event, data) => {
  if (io && connectedUsers.has(userId)) {
    const socketId = connectedUsers.get(userId);
    io.to(socketId).emit(event, data);
  }
};

const emitToPartner = (partnerId, event, data) => {
  if (io && connectedPartners.has(partnerId)) {
    const socketId = connectedPartners.get(partnerId);
    io.to(socketId).emit(event, data);
  }
};

const emitToAllPartners = (event, data) => {
  if (io) {
    connectedPartners.forEach((socketId) => {
      io.to(socketId).emit(event, data);
    });
  }
};

const emitToAdmins = (event, data) => {
  if (io) {
    io.emit(event, data); // For now, broadcast to all connected users
  }
};

module.exports = {
  initializeSocket,
  emitToOrder,
  emitToUser,
  emitToPartner,
  emitToAllPartners,
  emitToAdmins,
  getConnectedUsers: () => connectedUsers,
  getConnectedPartners: () => connectedPartners,
  getOrderTracking: () => orderTracking,
};