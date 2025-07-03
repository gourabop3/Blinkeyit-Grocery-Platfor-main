import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiPackage, FiTruck, FiCheck, FiClock, FiSearch, FiMapPin } from "react-icons/fi";
import { MdCancel } from "react-icons/md";
import NoData from "../components/NoData";

const MyOrders = () => {
  const navigate = useNavigate();
  const orders = useSelector((state) => state.orders.order);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Mock data for demonstration since orders might be empty
  const mockOrders = [
    {
      _id: "1",
      orderId: "ORD001",
      products: [
        {
          productId: "p1",
          quantity: 2,
          product_details: {
            name: "Wireless Bluetooth Headphones",
            image: ["/api/placeholder/100/100"],
          },
        },
        {
          productId: "p2",
          quantity: 1,
          product_details: {
            name: "Smartphone Case",
            image: ["/api/placeholder/100/100"],
          },
        },
      ],
      totalAmt: 2999,
      order_status: "Processing",
      payment_status: "PAID",
      createdAt: "2024-01-15T10:30:00Z",
      delivery_address: {
        address_line: "123 Main St",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
      },
    },
    {
      _id: "2",
      orderId: "ORD002",
      products: [
        {
          productId: "p3",
          quantity: 1,
          product_details: {
            name: "Gaming Keyboard",
            image: ["/api/placeholder/100/100"],
          },
        },
      ],
      totalAmt: 5999,
      order_status: "Shipped",
      payment_status: "PAID",
      createdAt: "2024-01-14T15:45:00Z",
      delivery_address: {
        address_line: "456 Oak Ave",
        city: "Delhi",
        state: "Delhi",
        pincode: "110001",
      },
    },
    {
      _id: "3",
      orderId: "ORD003",
      products: [
        {
          productId: "p4",
          quantity: 3,
          product_details: {
            name: "Organic Coffee Beans",
            image: ["/api/placeholder/100/100"],
          },
        },
      ],
      totalAmt: 1497,
      order_status: "Delivered",
      payment_status: "PAID",
      createdAt: "2024-01-10T09:20:00Z",
      delivery_address: {
        address_line: "789 Pine St",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560001",
      },
    },
  ];

  useEffect(() => {
    // Always use actual orders, don't fallback to mock data
    const ordersToUse = orders || [];
    let filtered = ordersToUse;

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.order_status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (searchTerm) {
      filtered = filtered.filter((order) =>
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchTerm]);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "processing":
        return <FiClock className="text-yellow-600" />;
      case "shipped":
        return <FiTruck className="text-blue-600" />;
      case "delivered":
        return <FiCheck className="text-green-600" />;
      case "cancelled":
        return <MdCancel className="text-red-600" />;
      default:
        return <FiPackage className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const OrderDetailsModal = ({ order, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Order Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{order.orderId}</h3>
                <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  ₹{order.totalAmt.toLocaleString()}
                </p>
                <span
                  className={`inline-flex items-center px-2 py-1 text-sm font-medium rounded-full border ${getStatusColor(
                    order.order_status
                  )}`}
                >
                  {getStatusIcon(order.order_status)}
                  <span className="ml-1">{order.order_status}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold mb-3">Delivery Address</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>{order.delivery_address.address_line}</p>
              <p>
                {order.delivery_address.city}, {order.delivery_address.state}
              </p>
              <p>PIN: {order.delivery_address.pincode}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Products</h4>
            <div className="space-y-3">
              {order.products.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg"
                >
                  <img
                    src={product.product_details.image[0]}
                    alt={product.product_details.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h5 className="font-medium">{product.product_details.name}</h5>
                    <p className="text-gray-600">Quantity: {product.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  console.log("order Items", orders);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white shadow-sm border-b p-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600">Track and manage your orders</p>
      </div>

      {/* Filters */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Orders</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <NoData />
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <div
                key={order._id + index + "order"}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.order_status)}
                      <div>
                        <h3 className="font-semibold text-lg">{order.orderId}</h3>
                        <p className="text-gray-600 text-sm">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(
                        order.order_status
                      )}`}
                    >
                      {order.order_status}
                    </span>
                    <p className="text-xl font-bold text-green-600">
                      ₹{order.totalAmt.toLocaleString()}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderDetails(true);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {/* Products Preview */}
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-4 overflow-x-auto">
                    {order.products.slice(0, 3).map((product, productIndex) => (
                      <div
                        key={productIndex}
                        className="flex items-center space-x-3 min-w-0 flex-shrink-0"
                      >
                        <img
                          src={product.product_details.image[0]}
                          alt={product.product_details.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {product.product_details.name}
                          </p>
                          <p className="text-gray-600 text-xs">
                            Qty: {product.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.products.length > 3 && (
                      <div className="text-gray-500 text-sm">
                        +{order.products.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default MyOrders;
