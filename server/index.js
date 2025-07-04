const express = require("express");
const http = require("http");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const morgan = require("morgan");
const helmet = require("helmet");

// Initialize Socket.io
const { initializeSocket } = require("./config/socket");

const userRouter = require("./routes/user.route");
const categoryRouter = require("./routes/category.route");
const uploadRouter = require("./routes/upload.route");
const subCategoryRouter = require("./routes/subCategory.route");
const productRouter = require("./routes/product.route");
const cartRouter = require("./routes/cart.route");
const addressRouter = require("./routes/address.route");
const orderRouter = require("./routes/order.route");
const dashboardRouter = require("./routes/dashboard.route");
// New interactive features
const reviewRouter = require("./routes/review.route");
const wishlistRouter = require("./routes/wishlist.route");
const loyaltyRouter = require("./routes/loyalty.route");
const couponRouter = require("./routes/coupon.route.js");
// Delivery system routes
const deliveryPartnerRouter = require("./routes/deliveryPartner.routes");
const deliveryTrackingRouter = require("./routes/deliveryTracking.routes");

const PORT = process.env.PORT || 5000;

const connectDB = require("./config/mongoDB");
connectDB();

// CORS Configuration - Handle multiple origins for development and production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', 
  'http://localhost:4173',
  'https://grocery-frontend-e2hz.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean); // Remove any undefined values

app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
    exposedHeaders: ['set-cookie']
  })
);

// Security middleware with updated configuration
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Blinkeyit Grocery Backend is running ✅",
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/file", uploadRouter);
app.use("/api/subcategory", subCategoryRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);
app.use("/api/dashboard", dashboardRouter);
// New interactive features
app.use("/api/review", reviewRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/loyalty", loyaltyRouter);
// Coupon system
app.use("/api/coupon", couponRouter);
// Delivery system routes
app.use("/api/delivery-partner", deliveryPartnerRouter);
app.use("/api/delivery-tracking", deliveryTrackingRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Create HTTP server and initialize Socket.io
const server = http.createServer(app);
const io = initializeSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`⚡ Socket.io server initialized for real-time delivery tracking`);
});
