const mongoose = require("mongoose");
const Stripe = require("../config/stripe.js");
const CartProductModel = require("../models/cartProduct.model.js");
const OrderModel = require("../models/order.model.js");
const UserModel = require("../models/user.model.js");
const ProductModel = require("../models/product.model.js");

const CashOnDeliveryOrderController = async (request, response) => {
  try {
    const userId = request.userId; // auth middleware
    const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

    // Function to build bulkWrite operations for stock decrement
    const buildStockOps = (items) =>
      items.map((el) => ({
        updateOne: {
          filter: { _id: el.productId._id || el.productId },
          update: { $inc: { stock: -el.quantity || -1 } },
        },
      }));

    const orderId = `ORD-${new mongoose.Types.ObjectId()}`;

    const productsPayload = list_items.map((el) => ({
      productId: el.productId._id,
      quantity: el.quantity || 1,
      product_details: {
        name: el.productId.name,
        image: el.productId.image,
      },
    }));

    const orderDoc = new OrderModel({
      userId,
      orderId,
      products: productsPayload,
      paymentId: "",
      payment_status: "CASH ON DELIVERY",
      delivery_address: addressId,
      subTotalAmt,
      totalAmt,
    });

    const generatedOrder = await orderDoc.save();

    // 🔽 Decrement stock for ordered products
    try {
      const stockOps = buildStockOps(list_items);
      if (stockOps.length) await ProductModel.bulkWrite(stockOps, { ordered: false });
    } catch (stockErr) {
      console.error("Failed to update product stock:", stockErr.message);
    }

    ///remove from the cart
    const removeCartItems = await CartProductModel.deleteMany({
      userId: userId,
    });
    const updateInUser = await UserModel.updateOne(
      { _id: userId },
      { shopping_cart: [] }
    );

    return response.json({
      message: "Order successfully",
      error: false,
      success: true,
      data: generatedOrder,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

const pricewithDiscount = (price, dis = 1) => {
  const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100);
  const actualPrice = Number(price) - Number(discountAmout);
  return actualPrice;
};

const paymentController = async (request, response) => {
  try {
    const userId = request.userId; // auth middleware
    const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

    // Validate required fields
    if (!userId) {
      return response.status(401).json({
        message: "User authentication required",
        error: true,
        success: false,
      });
    }

    if (!list_items || !Array.isArray(list_items) || list_items.length === 0) {
      return response.status(400).json({
        message: "Cart items are required",
        error: true,
        success: false,
      });
    }

    if (!addressId) {
      return response.status(400).json({
        message: "Delivery address is required",
        error: true,
        success: false,
      });
    }

    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("❌ STRIPE_SECRET_KEY is missing in .env file");
      return response.status(500).json({
        message: "Payment system not configured",
        error: true,
        success: false,
      });
    }

    if (!process.env.FRONTEND_URL) {
      console.error("❌ FRONTEND_URL is missing in .env file");
      return response.status(500).json({
        message: "Frontend URL not configured",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    // Validate and prepare line items
    const line_items = list_items.map((item, index) => {
      if (!item.productId || !item.productId.name || !item.productId.price) {
        throw new Error(`Invalid product data at index ${index}`);
      }

      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: item.productId.name,
            images: item.productId.image || [],
            metadata: {
              productId: item.productId._id,
            },
          },
          unit_amount:
            pricewithDiscount(item.productId.price, item.productId.discount) *
            100,
        },
        adjustable_quantity: {
          enabled: true,
          minimum: 1,
        },
        quantity: item.quantity || 1,
      };
    });

    const params = {
      submit_type: "pay",
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      metadata: {
        userId: userId,
        addressId: addressId,
      },
      line_items: line_items,
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    };

    console.log("Creating Stripe checkout session for user:", userId);
    const session = await Stripe.checkout.sessions.create(params);
    console.log("✅ Stripe session created successfully:", session.id);

    return response.status(200).json(session);
  } catch (error) {
    console.error("❌ Payment Controller Error:", error.message);
    
    // Provide more specific error messages
    let errorMessage = "Payment processing failed";
    
    if (error.message.includes("Invalid product data")) {
      errorMessage = "Invalid product information in cart";
    } else if (error.type === "StripeInvalidRequestError") {
      errorMessage = "Invalid payment request. Please try again.";
    } else if (error.type === "StripeAuthenticationError") {
      errorMessage = "Payment system authentication failed";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return response.status(500).json({
      message: errorMessage,
      error: true,
      success: false,
    });
  }
};

const getOrderProductItems = async ({
  lineItems,
  userId,
  addressId,
  paymentId,
  payment_status,
}) => {
  const products = [];
  let subTotal = 0;

  if (lineItems?.data?.length) {
    for (const item of lineItems.data) {
      const product = await Stripe.products.retrieve(item.price.product);

      products.push({
        productId: product.metadata.productId,
        quantity: item.quantity,
        product_details: {
          name: product.name,
          image: product.images,
        },
      });

      subTotal += Number(item.amount_total / 100);
    }

    // After iterating, reduce stock in DB
    try {
      const stockOps = [];
      for (const li of lineItems.data) {
        const prod = await Stripe.products.retrieve(li.price.product);
        if (prod?.metadata?.productId) {
          stockOps.push({
            updateOne: {
              filter: { _id: prod.metadata.productId },
              update: { $inc: { stock: -li.quantity || -1 } },
            },
          });
        }
      }

      if (stockOps.length) await ProductModel.bulkWrite(stockOps, { ordered: false });
    } catch (e) {
      console.error("[Stripe] Failed to update stock:", e.message);
    }
  }

  const orderDoc = new OrderModel({
    userId,
    orderId: `ORD-${new mongoose.Types.ObjectId()}`,
    products,
    paymentId,
    payment_status,
    delivery_address: addressId,
    subTotalAmt: subTotal,
    totalAmt: subTotal,
  });

  await orderDoc.save();

  return orderDoc;
};

//http://localhost:8080/api/order/webhook
const webhookStripe = async (request, response) => {
  const event = request.body;
  const endPointSecret = process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY;

  console.log("event", event);

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      const lineItems = await Stripe.checkout.sessions.listLineItems(
        session.id
      );
      const userId = session.metadata.userId;
      const orderDoc = await getOrderProductItems({
        lineItems,
        userId,
        addressId: session.metadata.addressId,
        paymentId: session.payment_intent,
        payment_status: session.payment_status,
      });

      if (orderDoc) {
        const removeCartItems = await UserModel.findByIdAndUpdate(userId, {
          shopping_cart: [],
        });
        const removeCartProductDB = await CartProductModel.deleteMany({
          userId: userId,
        });
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({ received: true });
};

const getOrderDetailsController = async (request, response) => {
  try {
    const userId = request.userId; // order id

    const orderlist = await OrderModel.find({ userId: userId })
      .sort({ createdAt: -1 })
      .populate("delivery_address");

    return response.json({
      message: "order list",
      data: orderlist,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//get all orders for admin (with pagination and filtering)
const getAllOrdersController = async (request, response) => {
  try {
    const { page = 1, limit = 10, status, search } = request.query;
    
    // Build filter object
    const filter = {};
    
    if (status && status !== 'all') {
      filter.order_status = status;
    }
    
    const skip = (page - 1) * limit;
    
    // If search is provided, we need to search in user details
    let userFilter = {};
    if (search) {
      const searchUsers = await UserModel.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = searchUsers.map(user => user._id);
      
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { userId: { $in: userIds } }
      ];
    }
    
    // Get total count for pagination
    const totalOrders = await OrderModel.countDocuments(filter);
    
    // Get orders with pagination and populate user details
    const orders = await OrderModel.find(filter)
      .populate('userId', 'name email mobile')
      .populate('delivery_address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Format orders for frontend
    const formattedOrders = orders.map(order => ({
      ...order,
      customerName: order.userId?.name || "Unknown Customer",
      customerEmail: order.userId?.email || "Unknown Email"
    }));
    
    return response.json({
      message: "Orders fetched successfully",
      error: false,
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          hasNext: page * limit < totalOrders,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//update order status for admin
const updateOrderStatusController = async (request, response) => {
  try {
    const { orderId } = request.params;
    const { order_status } = request.body;
    
    if (!orderId) {
      return response.status(400).json({
        message: "Order ID is required",
        error: true,
        success: false,
      });
    }
    
    if (!order_status) {
      return response.status(400).json({
        message: "Order status is required",
        error: true,
        success: false,
      });
    }
    
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      { order_status },
      { new: true }
    ).populate('userId', 'name email');
    
    if (!updatedOrder) {
      return response.status(404).json({
        message: "Order not found",
        error: true,
        success: false,
      });
    }
    
    return response.json({
      message: "Order status updated successfully",
      error: false,
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

module.exports = {
  CashOnDeliveryOrderController,
  paymentController,
  webhookStripe,
  getOrderDetailsController,
  getAllOrdersController,
  updateOrderStatusController,
};
