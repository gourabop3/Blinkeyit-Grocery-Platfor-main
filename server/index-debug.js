const express = require("express");
const app = express();

console.log("1. Express app created");

const cors = require("cors");
const cookieParser = require("cookie-parser");

console.log("2. Basic imports loaded");

require("dotenv").config();

console.log("3. Environment loaded");

const PORT = process.env.PORT || 5000;

console.log("4. Port configured:", PORT);

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', 
  'http://localhost:4173',
  'https://grocery-frontend-e2hz.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

console.log("5. CORS origins configured");

app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
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

console.log("6. CORS middleware configured");

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

console.log("7. Basic middleware configured");

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Blinkeyit Grocery Backend is running ✅",
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

console.log("8. Test route configured");

// Try loading routes one by one
try {
  console.log("9. Loading user routes...");
  const userRouter = require("./routes/user.route");
  app.use("/api/user", userRouter);
  console.log("9. User routes loaded successfully");
  
  console.log("10. Loading category routes...");
  const categoryRouter = require("./routes/category.route");
  app.use("/api/category", categoryRouter);
  console.log("10. Category routes loaded successfully");
  
  console.log("11. Loading upload routes...");
  const uploadRouter = require("./routes/upload.route");
  app.use("/api/file", uploadRouter);
  console.log("11. Upload routes loaded successfully");
  
  console.log("12. Loading subcategory routes...");
  const subCategoryRouter = require("./routes/subCategory.route");
  app.use("/api/subcategory", subCategoryRouter);
  console.log("12. Subcategory routes loaded successfully");
  
  console.log("13. Loading product routes...");
  const productRouter = require("./routes/product.route");
  app.use("/api/product", productRouter);
  console.log("13. Product routes loaded successfully");
  
  console.log("14. Loading cart routes...");
  const cartRouter = require("./routes/cart.route");
  app.use("/api/cart", cartRouter);
  console.log("14. Cart routes loaded successfully");
  
  console.log("15. Loading address routes...");
  const addressRouter = require("./routes/address.route");
  app.use("/api/address", addressRouter);
  console.log("15. Address routes loaded successfully");
  
  console.log("16. Loading order routes...");
  const orderRouter = require("./routes/order.route");
  app.use("/api/order", orderRouter);
  console.log("16. Order routes loaded successfully");
  
  console.log("17. Loading dashboard routes...");
  const dashboardRouter = require("./routes/dashboard.route");
  app.use("/api/dashboard", dashboardRouter);
  console.log("17. Dashboard routes loaded successfully");
  
} catch (error) {
  console.error("❌ Error loading routes:", error.message);
  console.error("❌ Stack trace:", error.stack);
  process.exit(1);
}

console.log("18. All routes loaded successfully");

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

console.log("19. Server startup completed");