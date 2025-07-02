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

// ===================== ADMIN - GET ALL ORDERS =====================
const getAllOrdersController = async (request, response) => {
  try {
    // Pagination & filtering params (sent via query string)
    let { page = 1, limit = 20, status = "all", search = "" } = request.query;

    page = Number(page) || 1;
    limit = Number(limit) || 20;

    const query = {};

    // Filter by order status if provided and not "all"
    if (status && status !== "all") {
      query.order_status = new RegExp(`^${status}$`, "i"); // case-insensitive exact match
    }

    // Basic search across orderId or user name/email
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { orderId: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;

    // Fetch orders with user & address populated
    const [orders, totalCount] = await Promise.all([
      OrderModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email")
        .populate("delivery_address"),
      OrderModel.countDocuments(query),
    ]);

    return response.json({
      message: "All orders list",
      data: orders,
      totalCount,
      totalPage: Math.ceil(totalCount / limit),
      page,
      limit,
      success: true,
      error: false,
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
};
