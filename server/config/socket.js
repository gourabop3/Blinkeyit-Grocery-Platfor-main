// config/socket.js
/* ----------------------------------------------------------
   Socket-IO server for Blinkeyit Grocery
   ----------------------------------------------------------
   Changes vs. your original:
   1. CORS now accepts the same origin list as Express.
   2. Optional pingInterval / pingTimeout for flaky mobile links.
   3. Minor safety checks (decoded.id guard, route map fallback).
----------------------------------------------------------- */

const { Server }           = require("socket.io");
const jwt                  = require("jsonwebtoken");
const geolib               = require("geolib");

const DeliveryPartnerModel = require("../models/deliveryPartner.model");
const DeliveryTrackingModel= require("../models/deliveryTracking.model");
const UserModel            = require("../models/user.model");
const OrderModel           = require("../models/order.model");

// ------------------------ shared state ---------------------
let io;
const connectedUsers    = new Map(); // userId    -> socketId
const connectedPartners = new Map(); // partnerId -> socketId
const orderTracking     = new Map(); // orderId   -> Set<socketId>

// ------------------------ helper ---------------------------
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:4173",
  "https://grocery-frontend-e2hz.onrender.com",
  process.env.FRONTEND_URL            // e.g. https://your-vercel.vercel.app
].filter(Boolean);

// -----------------------------------------------------------
//  Main initialiser
// -----------------------------------------------------------
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true
    },
    // keep sockets alive on shaky 4G
    pingInterval: 25_000, // client sends ping every 25 s
    pingTimeout : 60_000  // close if no pong for 60 s
  });

  // ---------------- authentication middleware --------------
  io.use(async (socket, next) => {
    try {
      const { token, userType } = socket.handshake.auth;

      if (!token) return next(new Error("Authentication error: No token"));

      const decoded = jwt.verify(token, process.env.SECRET_KEY_JWT);
      if (!decoded?.id) return next(new Error("Invalid token payload"));

      let userDoc;
      if (userType === "partner") {
        userDoc           = await DeliveryPartnerModel.findById(decoded.id);
        socket.userType   = "partner";
      } else if (userType === "customer") {
        userDoc           = await UserModel.findById(decoded.id);
        socket.userType   = "customer";
      } else {
        // treat everything else as admin
        socket.userType   = "admin";
      }

      if (userType !== "admin" && !userDoc)
        return next(new Error(`Authentication error: ${userType} not found`));

      socket.userId = decoded.id;
      socket.user   = userDoc;   // may be undefined for admin
      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      next(new Error("Authentication error"));
    }
  });

  // ---------------- connection handler ---------------------
  io.on("connection", (socket) => {
    console.log(`[SOCKET] ${socket.userType} ${socket.userId} connected (id ${socket.id})`);

    /* 1. Save socket id */
    if (socket.userType === "customer") {
      connectedUsers.set(socket.userId, socket.id);
    } else if (socket.userType === "partner") {
      connectedPartners.set(socket.userId, socket.id);

      // mark partner online
      DeliveryPartnerModel.findByIdAndUpdate(socket.userId, {
        socketId: socket.id,
        "availability.isOnline": true,
        "availability.lastSeen": new Date()
      }).catch(console.error);
    }

    /* 2. Order-tracking room joins */
    socket.on("join_order_tracking", (orderId) => {
      socket.join(`order_${orderId}`);

      if (!orderTracking.has(orderId))
        orderTracking.set(orderId, new Set());

      orderTracking.get(orderId).add(socket.id);
    });

    socket.on("leave_order_tracking", (orderId) => {
      socket.leave(`order_${orderId}`);

      if (orderTracking.has(orderId)) {
        const set = orderTracking.get(orderId);
        set.delete(socket.id);
        if (set.size === 0) orderTracking.delete(orderId);
      }
    });

    /* ------------------------------------------------------
       Only Delivery-Partner-specific events below
    ------------------------------------------------------ */
    if (socket.userType === "partner") {

      /** location_update */
      socket.on("location_update", async ({
        latitude, longitude, speed, heading, accuracy, orderId
      }) => {
        try {
          // 1. Persist partner position (realtime map)
          await DeliveryPartnerModel.findByIdAndUpdate(socket.userId, {
            currentLocation: { latitude, longitude, lastUpdated: new Date() }
          });

          // 2. If tied to an order track it
          if (orderId) {
            const tracking = await DeliveryTrackingModel.findOne({ orderId });
            if (tracking) {
              await tracking.addLocationUpdate(latitude, longitude, speed, heading, accuracy);

              /* ETA calc */
              let distanceKm = null, eta = null;
              if (tracking.customerLocation?.latitude) {
                const distM = geolib.getDistance(
                  { latitude, longitude },
                  {
                    latitude : tracking.customerLocation.latitude,
                    longitude: tracking.customerLocation.longitude
                  }
                );
                distanceKm = distM / 1000;
                const spd  = speed || 30; // km/h fallback
                eta        = new Date(Date.now() + (distanceKm / spd) * 3600 * 1000);

                tracking.metrics.distanceToCustomer    = distanceKm;
                tracking.metrics.estimatedDeliveryTime = eta;
                await tracking.save();
              }

              const payload = {
                orderId,
                location         : { latitude, longitude },
                timestamp        : new Date(),
                speed, heading,
                distanceToCustomer: distanceKm,
                estimatedArrival : eta,
                route            : (tracking.route || []).map(p => [p.latitude, p.longitude]),
                storeLocation    : tracking.storeLocation,
                customerLocation : tracking.customerLocation
              };

              io.to(`order_${orderId}`).emit("delivery_location_update", payload);

              // broadcast to admins only
              io.sockets.sockets.forEach(s => {
                if (s.userType === "admin") s.emit("delivery_location_update", payload);
              });
            }
          }

          socket.emit("location_update_ack", { success: true });
        } catch (err) {
          console.error("location_update error:", err);
          socket.emit("location_update_ack", { success: false, error: err.message });
        }
      });

      /** status_update */
      socket.on("status_update", async ({
        orderId, status, notes, location, imageProof
      }) => {
        try {
          const tracking = await DeliveryTrackingModel.findOne({ orderId });
          if (tracking) {
            await tracking.updateStatus(status, location, notes, imageProof);

            const payload = {
              orderId, status, notes, location,
              timestamp: new Date(),
              partner  : {
                name   : socket.user.name,
                mobile : socket.user.mobile,
                vehicle: socket.user.vehicleDetails
              }
            };

            io.to(`order_${orderId}`).emit("delivery_status_update", payload);

            io.sockets.sockets.forEach(s => {
              if (s.userType === "admin") s.emit("delivery_status_update", payload);
            });

            /* keep main Order in sync */
            const map = {
              assigned       : "Assigned",
              pickup_started : "Preparing",
              picked_up      : "Picked_up",
              in_transit     : "In_transit",
              delivered      : "Delivered",
              failed         : "Failed",
              cancelled      : "Cancelled"
            };
            await OrderModel.findByIdAndUpdate(orderId, {
              order_status: map[status] || "Processing"
            });
          }

          socket.emit("status_update_ack", { success: true });
        } catch (err) {
          console.error("status_update error:", err);
          socket.emit("status_update_ack", { success: false, error: err.message });
        }
      });

      /** toggle_availability */
      socket.on("toggle_availability", async (isOnDuty) => {
        try {
          await DeliveryPartnerModel.findByIdAndUpdate(socket.userId, {
            "availability.isOnDuty": isOnDuty,
            "availability.lastSeen": new Date()
          });

          socket.emit("availability_updated", { isOnDuty });
          socket.broadcast.emit("partner_availability_changed", {
            partnerId: socket.userId,
            name: socket.user.name,
            isOnDuty
          });
        } catch (err) {
          console.error("toggle_availability error:", err);
        }
      });

      /** report_issue */
      socket.on("report_issue", async ({ orderId, issueType, description }) => {
        try {
          const tracking = await DeliveryTrackingModel.findOne({ orderId });
          if (tracking) {
            const supportTicketId = `TICKET-${Date.now()}`;
            await tracking.reportIssue(issueType, description, supportTicketId);

            io.to(`order_${orderId}`).emit("delivery_issue_reported", {
              orderId, issueType, description, supportTicketId, timestamp: new Date()
            });
          }
          socket.emit("issue_reported", { success: true });
        } catch (err) {
          console.error("report_issue error:", err);
          socket.emit("issue_reported", { success: false, error: err.message });
        }
      });
    } // end-partner events


    /* ------------------------------------------------------
       Customer events
    ------------------------------------------------------ */
    if (socket.userType === "customer") {
      socket.on("request_delivery_update", async (orderId) => {
        try {
          const tracking = await DeliveryTrackingModel
            .findOne({ orderId })
            .populate("deliveryPartnerId", "name mobile vehicleDetails currentLocation");

          if (tracking) {
            socket.emit("delivery_update", {
              orderId,
              status         : tracking.status,
              timeline       : tracking.timeline,
              currentLocation: tracking.lastLocationUpdate,
              estimatedTime  : tracking.metrics.estimatedDeliveryTime,
              partner        : tracking.deliveryPartnerId
            });
          }
        } catch (err) { console.error("request_delivery_update:", err); }
      });

      socket.on("delivery_feedback", async ({ orderId, rating, comment }) => {
        try {
          const tracking = await DeliveryTrackingModel.findOne({ orderId });
          if (tracking) {
            tracking.deliveryDetails.customerFeedback = {
              rating, comment, timestamp: new Date()
            };
            await tracking.save();

            const partner = await DeliveryPartnerModel.findById(tracking.deliveryPartnerId);
            if (partner) await partner.updateRating(rating);
          }
          socket.emit("feedback_submitted", { success: true });
        } catch (err) {
          console.error("delivery_feedback error:", err);
          socket.emit("feedback_submitted", { success: false, error: err.message });
        }
      });
    }

    /* ---------------- handle disconnect ------------------- */
    socket.on("disconnect", () => {
      console.log(`[SOCKET] ${socket.userType} ${socket.userId} disconnected`);
      if (socket.userType === "customer") connectedUsers.delete(socket.userId);
      if (socket.userType === "partner") {
        connectedPartners.delete(socket.userId);
        DeliveryPartnerModel.findByIdAndUpdate(socket.userId, {
          socketId: "",
          "availability.isOnline": false,
          "availability.lastSeen": new Date()
        }).catch(console.error);
      }
      orderTracking.forEach((set, orderId) => {
        set.delete(socket.id);
        if (set.size === 0) orderTracking.delete(orderId);
      });
    });
  });

  return io;
};

/* ------- helpers for other modules ----------------------- */
const emitToOrder      = (orderId, event, data) =>  io?.to(`order_${orderId}`).emit(event, data);
const emitToUser       = (userId,  event, data) =>  io?.to(connectedUsers.get(userId)    ?? "").emit(event, data);
const emitToPartner    = (pid,     event, data) =>  io?.to(connectedPartners.get(pid)    ?? "").emit(event, data);
const emitToAllPartners= (event,   data)       =>  connectedPartners.forEach(id => io?.to(id).emit(event, data));
const emitToAdmins     = (event,   data)       =>  io?.emit(event, data);

module.exports = {
  initializeSocket,
  emitToOrder,
  emitToUser,
  emitToPartner,
  emitToAllPartners,
  emitToAdmins,
  getConnectedUsers   : () => connectedUsers,
  getConnectedPartners: () => connectedPartners,
  getOrderTracking    : () => orderTracking
};