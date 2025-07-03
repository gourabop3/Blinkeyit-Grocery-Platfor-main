const mongoose = require("mongoose");
const Stripe = require("../config/stripe.js");
const CartProductModel = require("../models/cartProduct.model.js");
const OrderModel = require("../models/order.model.js");
const UserModel = require("../models/user.model.js");
const ProductModel = require("../models/product.model.js");

// Direct cart clearing controller
const clearCartController = async (request, response) => {
  try {
    const userId = request.userId; // auth middleware
    
    console.log("Clearing cart for user:", userId);
    
    // Remove all cart items from database
    const removeCartItems = await CartProductModel.deleteMany({
      userId: userId,
    });
    
    // Update user's shopping cart array
    const updateInUser = await UserModel.updateOne(
      { _id: userId },
      { shopping_cart: [] }
    );
    
    console.log("Cart cleared successfully:", {
      removedItems: removeCartItems.deletedCount,
      userUpdated: updateInUser.modifiedCount
    });
    
    return response.json({
      message: "Cart cleared successfully",
      error: false,
      success: true,
      data: {
        removedItems: removeCartItems.deletedCount,
        userUpdated: updateInUser.modifiedCount > 0
      }
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

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

    console.log("Creating online payment order for user:", userId);
    console.log("Cart items:", list_items.length);

    const user = await UserModel.findById(userId);

    // Create order immediately (before Stripe session)
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
      paymentId: "", // Will be updated by webhook
      payment_status: "PENDING", // Initial status
      delivery_address: addressId,
      subTotalAmt,
      totalAmt,
    });

    const savedOrder = await orderDoc.save();
    console.log("Order created with ID:", savedOrder._id);

    const line_items = list_items.map((item) => {
      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: item.productId.name,
            images: item.productId.image,
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
        quantity: item.quantity,
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
        orderId: savedOrder._id.toString(), // Include the order ID in metadata
      },
      line_items: line_items,
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    };

    const session = await Stripe.checkout.sessions.create(params);

    // Update order with session ID
    await OrderModel.findByIdAndUpdate(savedOrder._id, {
      paymentId: session.id,
    });

    console.log("Stripe session created:", session.id);

    return response.status(200).json(session);
  } catch (error) {
    console.error("Error in payment controller:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Webhook handler - now just updates order status
const webhookStripe = async (request, response) => {
  try {
    const event = request.body;
    console.log("Stripe webhook event:", event.type);

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        const userId = session.metadata.userId;
        const orderId = session.metadata.orderId;
        
        console.log("Payment completed for user:", userId);
        console.log("Order ID from metadata:", orderId);
        
        if (orderId) {
          // Update existing order
          const updatedOrder = await OrderModel.findByIdAndUpdate(
            orderId,
            {
              payment_status: "PAID",
              paymentId: session.payment_intent || session.id,
            },
            { new: true }
          );
          
          if (updatedOrder) {
            console.log("Order updated successfully:", updatedOrder.orderId);
            
            // Decrement stock for ordered products
            try {
              const stockOps = updatedOrder.products.map((item) => ({
                updateOne: {
                  filter: { _id: item.productId },
                  update: { $inc: { stock: -item.quantity } },
                },
              }));
              
              if (stockOps.length) {
                await ProductModel.bulkWrite(stockOps, { ordered: false });
                console.log("Stock updated for", stockOps.length, "products");
              }
            } catch (stockErr) {
              console.error("Failed to update product stock:", stockErr.message);
            }
            
            // Clear cart
            try {
              const removeCartItems = await CartProductModel.deleteMany({
                userId: userId,
              });
              
              const updateInUser = await UserModel.findByIdAndUpdate(userId, {
                shopping_cart: [],
              });
              
              console.log("Cart cleared successfully:", {
                removedItems: removeCartItems.deletedCount,
                userUpdated: !!updateInUser
              });
            } catch (clearError) {
              console.error("Error clearing cart in webhook:", clearError);
            }
          } else {
            console.error("Order not found for ID:", orderId);
          }
        } else {
          console.error("No orderId in session metadata");
        }
        break;
        
      case "checkout.session.expired":
        // Handle expired sessions
        const expiredSession = event.data.object;
        const expiredOrderId = expiredSession.metadata.orderId;
        
        if (expiredOrderId) {
          await OrderModel.findByIdAndUpdate(expiredOrderId, {
            payment_status: "FAILED",
          });
          console.log("Order marked as failed due to expired session:", expiredOrderId);
        }
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    response.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    response.status(500).json({ error: "Webhook handler failed" });
  }
};

// Add a controller to manually verify and update order status
const verifyPaymentController = async (request, response) => {
  try {
    const { sessionId } = request.body;
    const userId = request.userId;
    
    console.log("Verifying payment for session:", sessionId);
    
    // Retrieve the session from Stripe
    const session = await Stripe.checkout.sessions.retrieve(sessionId);
    
    if (session && session.payment_status === "paid") {
      const orderId = session.metadata.orderId;
      
      if (orderId) {
        const updatedOrder = await OrderModel.findByIdAndUpdate(
          orderId,
          {
            payment_status: "PAID",
            paymentId: session.payment_intent || session.id,
          },
          { new: true }
        ).populate("delivery_address");
        
        console.log("Payment verified and order updated:", updatedOrder.orderId);
        
        return response.json({
          message: "Payment verified successfully",
          error: false,
          success: true,
          data: updatedOrder,
        });
      }
    }
    
    return response.status(400).json({
      message: "Payment verification failed",
      error: true,
      success: false,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

const getOrderDetailsController = async (request, response) => {
  try {
    const userId = request.userId; // order id

    const orderlist = await OrderModel.find({ userId: userId })
      .sort({ createdAt: -1 })
      .populate("delivery_address");

    console.log(`Found ${orderlist.length} orders for user ${userId}`);

    return response.json({
      message: "order list",
      data: orderlist,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
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
    
    console.log(`Admin fetched ${formattedOrders.length} orders (total: ${totalOrders})`);
    
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
  clearCartController,
  verifyPaymentController,
};
