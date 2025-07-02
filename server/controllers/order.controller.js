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

    const payload = list_items.map((el) => {
      return {
        userId: userId,
        orderId: `ORD-${new mongoose.Types.ObjectId()}`,
        productId: el.productId._id,
        product_details: {
          name: el.productId.name,
          image: el.productId.image,
        },
        paymentId: "",
        payment_status: "CASH ON DELIVERY",
        delivery_address: addressId,
        subTotalAmt: subTotalAmt,
        totalAmt: totalAmt,
      };
    });

    const generatedOrder = await OrderModel.insertMany(payload);

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

    const user = await UserModel.findById(userId);

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
      },
      line_items: line_items,
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    };

    const session = await Stripe.checkout.sessions.create(params);

    return response.status(200).json(session);
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
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
  const productList = [];

  if (lineItems?.data?.length) {
    for (const item of lineItems.data) {
      const product = await Stripe.products.retrieve(item.price.product);

      const paylod = {
        userId: userId,
        orderId: `ORD-${new mongoose.Types.ObjectId()}`,
        productId: product.metadata.productId,
        product_details: {
          name: product.name,
          image: product.images,
        },
        paymentId: paymentId,
        payment_status: payment_status,
        delivery_address: addressId,
        subTotalAmt: Number(item.amount_total / 100),
        totalAmt: Number(item.amount_total / 100),
      };

      productList.push(paylod);
    }
  }

  return productList;
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
      const orderProduct = await getOrderProductItems({
        lineItems: lineItems,
        userId: userId,
        addressId: session.metadata.addressId,
        paymentId: session.payment_intent,
        payment_status: session.payment_status,
      });

      const order = await OrderModel.insertMany(orderProduct);

      console.log(order);
      if (Boolean(order[0])) {
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

// Get all orders for admin
const getAllOrdersForAdmin = async (request, response) => {
  try {
    const { page = 1, limit = 10, status, search } = request.body;
    
    let query = {};
    if (status && status !== 'all') {
      query.order_status = status;
    }
    
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [orders, totalCount] = await Promise.all([
      OrderModel.find(query)
        .populate('userId', 'name email')
        .populate('delivery_address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      OrderModel.countDocuments(query)
    ]);
    
    return response.json({
      message: "Orders fetched successfully",
      data: orders,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      error: false,
      success: true
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

// Get dashboard statistics
const getDashboardStats = async (request, response) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      totalRevenue,
      recentOrders
    ] = await Promise.all([
      UserModel.countDocuments(),
      ProductModel.countDocuments(),
      OrderModel.countDocuments(),
      OrderModel.countDocuments({ order_status: 'Processing' }),
      OrderModel.countDocuments({ order_status: 'Shipped' }),
      OrderModel.countDocuments({ order_status: 'Delivered' }),
      OrderModel.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmt' } } }
      ]),
      OrderModel.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);
    
    return response.json({
      message: "Dashboard stats fetched successfully",
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        pendingOrders,
        shippedOrders,
        deliveredOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders
      },
      error: false,
      success: true
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

// Update order status
const updateOrderStatus = async (request, response) => {
  try {
    const { orderId, status } = request.body;
    
    if (!orderId || !status) {
      return response.status(400).json({
        message: "Order ID and status are required",
        error: true,
        success: false
      });
    }
    
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      { order_status: status },
      { new: true }
    ).populate('userId', 'name email');
    
    if (!updatedOrder) {
      return response.status(404).json({
        message: "Order not found",
        error: true,
        success: false
      });
    }
    
    return response.json({
      message: "Order status updated successfully",
      data: updatedOrder,
      error: false,
      success: true
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

module.exports = {
  CashOnDeliveryOrderController,
  paymentController,
  webhookStripe,
  getOrderDetailsController,
  getAllOrdersForAdmin,
  getDashboardStats,
  updateOrderStatus,
};
