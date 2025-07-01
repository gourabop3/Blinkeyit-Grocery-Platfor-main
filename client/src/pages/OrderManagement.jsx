import React, { useEffect, useState } from "react";
import { useTable, usePagination, useGlobalFilter } from "@tanstack/react-table";
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiEdit,
  FiPackage,
} from "react-icons/fi";
import { MdPendingActions, MdLocalShipping, MdDone } from "react-icons/md";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import Loading from "../components/Loading";
import toast from "react-hot-toast";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mock data for demonstration
  const mockOrders = [
    {
      _id: "1",
      orderId: "ORD001",
      userId: { name: "John Doe", email: "john@example.com" },
      products: [
        {
          productId: "p1",
          quantity: 2,
          product_details: {
            name: "Wireless Headphones",
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
      userId: { name: "Jane Smith", email: "jane@example.com" },
      products: [
        {
          productId: "p2",
          quantity: 1,
          product_details: {
            name: "Smartphone",
            image: ["/api/placeholder/100/100"],
          },
        },
      ],
      totalAmt: 15999,
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
      userId: { name: "Bob Johnson", email: "bob@example.com" },
      products: [
        {
          productId: "p3",
          quantity: 3,
          product_details: {
            name: "Gaming Mouse",
            image: ["/api/placeholder/100/100"],
          },
        },
      ],
      totalAmt: 4497,
      order_status: "Delivered",
      payment_status: "PAID",
      createdAt: "2024-01-13T09:20:00Z",
      delivery_address: {
        address_line: "789 Pine St",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560001",
      },
    },
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        let filteredOrders = mockOrders;
        
        if (statusFilter !== "all") {
          filteredOrders = filteredOrders.filter(
            (order) => order.order_status.toLowerCase() === statusFilter.toLowerCase()
          );
        }
        
        if (searchTerm) {
          filteredOrders = filteredOrders.filter(
            (order) =>
              order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
              order.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              order.userId.email.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setOrders(filteredOrders);
        setTotalPages(Math.ceil(filteredOrders.length / 10));
        setLoading(false);
      }, 1000);
    } catch (error) {
      AxiosToastError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, searchTerm, page]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Simulate API call
      const updatedOrders = orders.map((order) =>
        order._id === orderId ? { ...order, order_status: newStatus } : order
      );
      setOrders(updatedOrders);
      toast.success("Order status updated successfully");
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CASH ON DELIVERY":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const OrderDetailsModal = ({ order, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Order Details - {order.orderId}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span> {order.userId.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {order.userId.email}
                </p>
                <p>
                  <span className="font-medium">Order Date:</span>{" "}
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Delivery Address</h3>
              <div className="space-y-1">
                <p>{order.delivery_address.address_line}</p>
                <p>
                  {order.delivery_address.city}, {order.delivery_address.state}
                </p>
                <p>PIN: {order.delivery_address.pincode}</p>
              </div>
            </div>
          </div>

          {/* Order Status and Payment */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Order Status</h3>
              <select
                value={order.order_status}
                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Payment Status</h3>
              <span
                className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getPaymentStatusColor(
                  order.payment_status
                )}`}
              >
                {order.payment_status}
              </span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Total Amount</h3>
              <p className="text-2xl font-bold text-green-600">
                ₹{order.totalAmt.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Products */}
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-3">Products</h3>
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
                    <h4 className="font-medium">{product.product_details.name}</h4>
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

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600">Manage all customer orders</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <FiDownload size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.userId.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.userId.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{order.totalAmt.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        order.order_status
                      )}`}
                    >
                      {order.order_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(
                        order.payment_status
                      )}`}
                    >
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderDetails(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <FiEye size={16} />
                    </button>
                    <select
                      value={order.order_status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="text-xs border rounded px-2 py-1"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {page} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
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

export default OrderManagement;