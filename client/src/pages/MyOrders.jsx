import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { 
  FiPackage, 
  FiTruck, 
  FiCheck, 
  FiClock, 
  FiSearch, 
  FiRefreshCw, 
  FiEye, 
  FiRepeat, 
  FiDownload,
  FiFilter,
  FiMapPin,
  FiCalendar,
  FiStar,
  FiHeart,
  FiShoppingCart
} from "react-icons/fi";
import { MdCancel, MdLocalShipping, MdLocationOn } from "react-icons/md";
import { HiSparkles } from "react-icons/hi";
import NoData from "../components/NoData";

const MyOrders = () => {
  const orders = useSelector((state) => state.orders.order);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [hoveredOrder, setHoveredOrder] = useState(null);
  const [animatingCards, setAnimatingCards] = useState(new Set());

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
    // Use mock data if no orders in state, otherwise use actual orders
    const ordersToUse = orders?.length > 0 ? orders : mockOrders;
    let filtered = ordersToUse;

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.order_status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (searchTerm) {
      filtered = filtered.filter((order) =>
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.products.some(product => 
          product.product_details.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "amount-high":
          return b.totalAmt - a.totalAmt;
        case "amount-low":
          return a.totalAmt - b.totalAmt;
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchTerm, sortBy]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleReorder = (order) => {
    setAnimatingCards(prev => new Set([...prev, order._id]));
    setTimeout(() => {
      setAnimatingCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(order._id);
        return newSet;
      });
    }, 600);
    // Add reorder logic here
  };

  const toggleLike = (productId) => {
    setLikedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const getOrderProgress = (status) => {
    const statuses = ["processing", "shipped", "delivered"];
    const currentIndex = statuses.indexOf(status.toLowerCase());
    return ((currentIndex + 1) / statuses.length) * 100;
  };

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

  const OrderTrackingStep = ({ status, isActive, isCompleted, icon, title, description }) => (
    <div className="flex items-center space-x-4">
      <div className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
        isCompleted ? 'bg-green-500 border-green-500 text-white' :
        isActive ? 'bg-blue-500 border-blue-500 text-white animate-pulse' :
        'bg-gray-100 border-gray-300 text-gray-400'
      }`}>
        {icon}
        {isCompleted && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
            <FiCheck className="w-2 h-2 text-white" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <h4 className={`font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
          {title}
        </h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );

  const OrderDetailsModal = ({ order, onClose }) => {
    const [activeTab, setActiveTab] = useState('tracking');
    
    const trackingSteps = [
      {
        status: 'processing',
        icon: <FiClock className="w-5 h-5" />,
        title: 'Order Processing',
        description: 'Your order is being prepared'
      },
      {
        status: 'shipped',
        icon: <FiTruck className="w-5 h-5" />,
        title: 'Shipped',
        description: 'Your order is on the way'
      },
      {
        status: 'delivered',
        icon: <FiCheck className="w-5 h-5" />,
        title: 'Delivered',
        description: 'Order delivered successfully'
      }
    ];

    const currentStatusIndex = trackingSteps.findIndex(step => 
      step.status.toLowerCase() === order.order_status.toLowerCase()
    );

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FiPackage className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{order.orderId}</h2>
                  <p className="text-blue-100">Placed on {formatDate(order.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-3xl font-bold">₹{order.totalAmt.toLocaleString()}</p>
                  <p className="text-blue-100">Total Amount</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                >
                  <FiEye className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'tracking', label: 'Order Tracking', icon: <MdLocalShipping /> },
                { id: 'products', label: 'Products', icon: <FiPackage /> },
                { id: 'address', label: 'Delivery Info', icon: <FiMapPin /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {activeTab === 'tracking' && (
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Order Progress</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">Live Tracking</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${getOrderProgress(order.order_status)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-6">
                  {trackingSteps.map((step, index) => (
                    <div key={step.status} className="relative">
                      <OrderTrackingStep
                        {...step}
                        isActive={index === currentStatusIndex}
                        isCompleted={index < currentStatusIndex}
                      />
                      {index < trackingSteps.length - 1 && (
                        <div className={`ml-6 w-0.5 h-8 mt-2 ${
                          index < currentStatusIndex ? 'bg-green-500' : 'bg-gray-200'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-4">
                {order.products.map((product, index) => (
                  <div
                    key={index}
                    className="group flex items-center space-x-4 bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl hover:shadow-md transition-all duration-300"
                  >
                    <div className="relative">
                      <img
                        src={product.product_details.image[0]}
                        alt={product.product_details.name}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                      <button
                        onClick={() => toggleLike(product.productId)}
                        className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                          likedProducts.has(product.productId)
                            ? 'bg-red-500 text-white scale-110'
                            : 'bg-white text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <FiHeart className="w-4 h-4" fill={likedProducts.has(product.productId) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {product.product_details.name}
                      </h5>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          Qty: {product.quantity}
                        </span>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <FiStar key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2">
                      <FiRepeat className="w-4 h-4" />
                      <span>Reorder</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'address' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <MdLocationOn className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Delivery Address</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-800 font-medium">{order.delivery_address.address_line}</p>
                    <p className="text-gray-600">{order.delivery_address.city}, {order.delivery_address.state}</p>
                    <p className="text-gray-600">PIN: {order.delivery_address.pincode}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiCalendar className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-800">Order Date</span>
                    </div>
                    <p className="text-gray-600">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiTruck className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-800">Payment Status</span>
                    </div>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                      {order.payment_status}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleReorder(order)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
              >
                <FiRepeat className="w-4 h-4" />
                <span>Reorder</span>
              </button>
              <button className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors">
                <FiDownload className="w-4 h-4" />
                <span>Download Invoice</span>
              </button>
            </div>
            <span className={`px-4 py-2 rounded-xl font-medium ${getStatusColor(order.order_status)}`}>
              {getStatusIcon(order.order_status)}
              <span className="ml-2">{order.order_status}</span>
            </span>
          </div>
        </div>
      </div>
    );
  };

  console.log("order Items", orders);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20 p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <FiPackage className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                My Orders
              </h1>
              <p className="text-gray-600 flex items-center space-x-2">
                <HiSparkles className="w-4 h-4 text-yellow-500" />
                <span>Track and manage your orders</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-green-50 px-4 py-2 rounded-xl">
              <span className="text-green-700 font-medium">{filteredOrders.length} Orders</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Filters */}
      <div className="p-6">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
              <FiFilter className="w-4 h-4" />
              <span>Filters & Search</span>
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <FiFilter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${showFilters ? 'block' : 'hidden md:grid'}`}>
            <div className="md:col-span-2">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders or products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Statuses</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-high">Amount: High to Low</option>
              <option value="amount-low">Amount: Low to High</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPackage className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
            <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 mx-auto">
              <FiShoppingCart className="w-4 h-4" />
              <span>Start Shopping</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order, index) => (
              <div
                key={order._id + index + "order"}
                className={`group bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 ${
                  animatingCards.has(order._id) ? 'animate-pulse scale-105' : ''
                } ${hoveredOrder === order._id ? 'scale-[1.02]' : ''}`}
                onMouseEnter={() => setHoveredOrder(order._id)}
                onMouseLeave={() => setHoveredOrder(null)}
              >
                {/* Order Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                  <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${getStatusColor(order.order_status).includes('green') ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                      getStatusColor(order.order_status).includes('blue') ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                      getStatusColor(order.order_status).includes('yellow') ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                      'bg-gradient-to-r from-gray-400 to-slate-500'
                    }`}>
                      <div className="text-white text-2xl">
                        {getStatusIcon(order.order_status)}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-800 group-hover:text-blue-600 transition-colors">
                        {order.orderId}
                      </h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <FiCalendar className="w-4 h-4" />
                          <span className="text-sm">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-600">
                          <FiPackage className="w-4 h-4" />
                          <span className="text-sm">{order.products.length} items</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        ₹{order.totalAmt.toLocaleString()}
                      </p>
                      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleReorder(order)}
                        className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all duration-200 hover:scale-110"
                        title="Reorder"
                      >
                        <FiRepeat className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetails(true);
                        }}
                        className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                      >
                        <FiEye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Order Progress</span>
                    <span className="text-sm text-gray-500">{Math.round(getOrderProgress(order.order_status))}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${getOrderProgress(order.order_status)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Products Preview */}
                <div className="border-t border-gray-100 pt-6">
                  <h4 className="font-medium text-gray-800 mb-4 flex items-center space-x-2">
                    <FiPackage className="w-4 h-4" />
                    <span>Products ({order.products.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {order.products.slice(0, 3).map((product, productIndex) => (
                      <div
                        key={productIndex}
                        className="group flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl hover:shadow-md transition-all duration-300"
                      >
                        <div className="relative">
                          <img
                            src={product.product_details.image[0]}
                            alt={product.product_details.name}
                            className="w-16 h-16 object-cover rounded-xl group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {product.quantity}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                            {product.product_details.name}
                          </p>
                          <p className="text-gray-600 text-sm">Qty: {product.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {order.products.length > 3 && (
                      <div className="flex items-center justify-center bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-dashed border-purple-200">
                        <div className="text-center">
                          <p className="text-purple-600 font-medium">+{order.products.length - 3} more</p>
                          <p className="text-purple-500 text-sm">items</p>
                        </div>
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

      {/* Add some CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MyOrders;
