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

const DeliveryTrackingModel= require("../models/deliveryTracking.model");
const UserModel            = require("../models/user.model");
const OrderModel           = require("../models/order.model");

// ------------------------ shared state ---------------------
let io;
const connectedUsers    = new Map(); // userId    -> socketId
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
      if (userType === "customer") {
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
       Customer events
    ------------------------------------------------------ */
    if (socket.userType === "customer") {
      socket.on("request_delivery_update", async (orderId) => {
        try {
          const tracking = await DeliveryTrackingModel.findOne({ orderId });

          if (tracking) {
            socket.emit("delivery_update", {
              orderId,
              status         : tracking.status,
              timeline       : tracking.timeline,
              currentLocation: tracking.lastLocationUpdate,
              estimatedTime  : tracking.metrics.estimatedDeliveryTime
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
const emitToAdmins     = (event,   data)       =>  io?.emit(event, data);

module.exports = {
  initializeSocket,
  emitToOrder,
  emitToUser,
  emitToAdmins,
  getConnectedUsers   : () => connectedUsers,
  getOrderTracking    : () => orderTracking
};