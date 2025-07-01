const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const morgan = require("morgan");
const helmet = require("helmet");

const userRouter = require("./routes/user.route");
const categoryRouter = require("./routes/category.route");
const uploadRouter = require("./routes/upload.route");
const subCategoryRouter = require("./routes/subCategory.route");
const productRouter = require("./routes/product.route");
const cartRouter = require("./routes/cart.route");
const addressRouter = require("./routes/address.route");
const orderRouter = require("./routes/order.route");

const PORT = process.env.PORT || 5000;

const connectDB = require("./config/mongoDB");
connectDB();

// app.use(cors());

const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"].filter(Boolean);
app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy: This origin is not allowed"), false);
    },
  })
);

// app.use(
//   cors({
//     credentials: true,
//     origin: "http://localhost:5173" || process.env.FRONTEND_URL,
//   })
// );

app.use(express.json());
app.use(cookieParser());
app.use(morgan());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
  // res.send("Blinkeyit Grocery Backend is running ✅", PORT);
  res.json({
    message: "Blinkeyit Grocery Backend is running ✅ : " + PORT,
  });
});

app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/file", uploadRouter);
app.use("/api/subcategory", subCategoryRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);
