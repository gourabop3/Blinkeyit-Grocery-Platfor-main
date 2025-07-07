import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import SummaryApi from "../../common/SummaryApi";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaToggleOn, 
  FaToggleOff, 
  FaEye, 
  FaSearch,
  FaFilter,
  FaCopy,
  FaDownload,
  FaChartBar,
  FaGift,
  FaPercentage,
  FaRupeeSign,
  FaShippingFast,
  FaUsers,
  FaCalendarAlt,
  FaTags
} from "react-icons/fa";
import moment from "moment";

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    search: "",
  });

  // Form data for create/edit
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    type: "percentage",
    value: "",
    maxDiscountAmount: "",
    minOrderAmount: "",
    maxOrderAmount: "",
    usageLimit: {
      total: "",
      perUser: 1,
    },
    validFrom: "",
    validUntil: "",
    firstOrderOnly: false,
    mobileAppOnly: false,
  });

  // Bulk generation data
  const [bulkData, setBulkData] = useState({
    baseCode: "",
    count: "",
    type: "percentage",
    value: "",
    title: "",
    description: "",
    validFrom: "",
    validUntil: "",
  });

  const couponTypes = [
    { value: "percentage", label: "Percentage", icon: FaPercentage },
    { value: "fixed", label: "Fixed Amount", icon: FaRupeeSign },
    { value: "free_shipping", label: "Free Shipping", icon: FaShippingFast },
    { value: "bogo", label: "Buy One Get One", icon: FaGift },
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "expired", label: "Expired" },
  ];

  useEffect(() => {
    fetchCoupons();
  }, [currentPage, filters]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...filters,
      });
      
      const response = await fetch(`${SummaryApi.getAllCoupons.url}?${queryParams}`, {
        method: SummaryApi.getAllCoupons.method,
        credentials: "include",
      });

      const result = await response.json();
      if (result.success) {
        setCoupons(result.data.coupons);
        setTotalPages(result.data.pagination.totalPages);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(SummaryApi.createCoupon.url, {
        method: SummaryApi.createCoupon.method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Coupon created successfully");
        setShowCreateModal(false);
        resetForm();
        fetchCoupons();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to create coupon");
    }
  };

  const handleUpdateCoupon = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${SummaryApi.updateCoupon.url}/${selectedCoupon._id}`, {
        method: SummaryApi.updateCoupon.method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Coupon updated successfully");
        setShowEditModal(false);
        resetForm();
        fetchCoupons();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to update coupon");
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    
    try {
      const response = await fetch(`${SummaryApi.deleteCoupon.url}/${couponId}`, {
        method: SummaryApi.deleteCoupon.method,
        credentials: "include",
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Coupon deleted successfully");
        fetchCoupons();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  const handleToggleStatus = async (couponId) => {
    try {
      const response = await fetch(`${SummaryApi.toggleCouponStatus.url}/${couponId}`, {
        method: SummaryApi.toggleCouponStatus.method,
        credentials: "include",
      });

      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        fetchCoupons();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to toggle coupon status");
    }
  };

  const fetchCouponStats = async (couponId) => {
    try {
      const response = await fetch(`${SummaryApi.getCouponStats.url}/${couponId}`, {
        method: SummaryApi.getCouponStats.method,
        credentials: "include",
      });

      const result = await response.json();
      if (result.success) {
        setSelectedCoupon(result.data);
        setShowStatsModal(true);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to fetch coupon statistics");
    }
  };

  const handleBulkGenerate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(SummaryApi.generateBulkCoupons.url, {
        method: SummaryApi.generateBulkCoupons.method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(bulkData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`${result.data.generated} coupons generated successfully`);
        setBulkData({
          baseCode: "",
          count: "",
          type: "percentage",
          value: "",
          title: "",
          description: "",
          validFrom: "",
          validUntil: "",
        });
        fetchCoupons();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to generate bulk coupons");
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      title: "",
      description: "",
      type: "percentage",
      value: "",
      maxDiscountAmount: "",
      minOrderAmount: "",
      maxOrderAmount: "",
      usageLimit: {
        total: "",
        perUser: 1,
      },
      validFrom: "",
      validUntil: "",
      firstOrderOnly: false,
      mobileAppOnly: false,
    });
    setSelectedCoupon(null);
  };

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied!");
  };

  const getStatusBadge = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);
    
    if (!coupon.isActive) {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Inactive</span>;
    }
    
    if (validUntil < now) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Expired</span>;
    }
    
    if (validFrom > now) {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Scheduled</span>;
    }
    
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>;
  };

  const getTypeIcon = (type) => {
    const typeConfig = couponTypes.find(t => t.value === type);
    const IconComponent = typeConfig?.icon || FaTags;
    return <IconComponent className="text-sm" />;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaTags className="text-blue-600" />
              Coupon Management
            </h1>
            <p className="text-gray-600 mt-1">Create and manage discount coupons</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus /> Create Coupon
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search coupons..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            {couponTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          
          <button
            onClick={() => setFilters({ status: "", type: "", search: "" })}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaFilter /> Clear Filters
          </button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center">
            <FaTags className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No coupons found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coupon Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{coupon.code}</span>
                          <button
                            onClick={() => copyCouponCode(coupon.code)}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <FaCopy />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{coupon.title}</p>
                        {coupon.description && (
                          <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                            {coupon.description}
                          </p>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(coupon.type)}
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {coupon.type === "percentage" 
                              ? `${coupon.value}%`
                              : `₹${coupon.value}`}
                          </span>
                          {coupon.maxDiscountAmount && (
                            <p className="text-xs text-gray-500">
                              Max: ₹{coupon.maxDiscountAmount}
                            </p>
                          )}
                          {coupon.minOrderAmount > 0 && (
                            <p className="text-xs text-gray-500">
                              Min: ₹{coupon.minOrderAmount}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="text-gray-900">
                          {coupon.usageCount} / {coupon.usageLimit.total || "∞"}
                        </span>
                        <p className="text-xs text-gray-500">
                          Per user: {coupon.usageLimit.perUser}
                        </p>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">
                          {moment(coupon.validFrom).format("MMM DD, YYYY")}
                        </p>
                        <p className="text-gray-600">
                          to {moment(coupon.validUntil).format("MMM DD, YYYY")}
                        </p>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      {getStatusBadge(coupon)}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fetchCouponStats(coupon._id)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="View Statistics"
                        >
                          <FaChartBar />
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedCoupon(coupon);
                            setFormData({
                              ...coupon,
                              validFrom: moment(coupon.validFrom).format("YYYY-MM-DD"),
                              validUntil: moment(coupon.validUntil).format("YYYY-MM-DD"),
                            });
                            setShowEditModal(true);
                          }}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Edit Coupon"
                        >
                          <FaEdit />
                        </button>
                        
                        <button
                          onClick={() => handleToggleStatus(coupon._id)}
                          className={`transition-colors ${
                            coupon.isActive ? "text-orange-600 hover:text-orange-800" : "text-green-600 hover:text-green-800"
                          }`}
                          title={coupon.isActive ? "Deactivate" : "Activate"}
                        >
                          {coupon.isActive ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                        
                        <button
                          onClick={() => handleDeleteCoupon(coupon._id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Coupon"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Coupon Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {showCreateModal ? "Create New Coupon" : "Edit Coupon"}
              </h2>
              
              <form onSubmit={showCreateModal ? handleCreateCoupon : handleUpdateCoupon}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Coupon Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {couponTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Value */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.type === "percentage" ? "Percentage (%)" : "Amount (₹)"} *
                    </label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max={formData.type === "percentage" ? "100" : undefined}
                      required
                    />
                  </div>
                  
                  {/* Max Discount Amount (for percentage) */}
                  {formData.type === "percentage" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Discount Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={formData.maxDiscountAmount}
                        onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  )}
                  
                  {/* Min Order Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Order Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                  
                  {/* Total Usage Limit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Usage Limit
                    </label>
                    <input
                      type="number"
                      value={formData.usageLimit.total}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        usageLimit: { ...formData.usageLimit, total: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                  
                  {/* Per User Limit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Per User Limit *
                    </label>
                    <input
                      type="number"
                      value={formData.usageLimit.perUser}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        usageLimit: { ...formData.usageLimit, perUser: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      required
                    />
                  </div>
                  
                  {/* Valid From */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valid From *
                    </label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  {/* Valid Until */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valid Until *
                    </label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                {/* Description */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
                
                {/* Checkboxes */}
                <div className="mt-4 flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.firstOrderOnly}
                      onChange={(e) => setFormData({ ...formData, firstOrderOnly: e.target.checked })}
                      className="mr-2"
                    />
                    First Order Only
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.mobileAppOnly}
                      onChange={(e) => setFormData({ ...formData, mobileAppOnly: e.target.checked })}
                      className="mr-2"
                    />
                    Mobile App Only
                  </label>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {showCreateModal ? "Create Coupon" : "Update Coupon"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStatsModal && selectedCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Coupon Statistics - {selectedCoupon.coupon.code}
                </h2>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total Usage</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {selectedCoupon.statistics.totalUsage}
                      </p>
                    </div>
                    <FaUsers className="text-blue-600 text-xl" />
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Total Discount</p>
                      <p className="text-2xl font-bold text-green-900">
                        ₹{selectedCoupon.statistics.totalDiscount.toFixed(2)}
                      </p>
                    </div>
                    <FaRupeeSign className="text-green-600 text-xl" />
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Unique Users</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {selectedCoupon.statistics.uniqueUsers}
                      </p>
                    </div>
                    <FaUsers className="text-purple-600 text-xl" />
                  </div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-medium">Avg Discount</p>
                      <p className="text-2xl font-bold text-orange-900">
                        ₹{selectedCoupon.statistics.averageDiscount.toFixed(2)}
                      </p>
                    </div>
                    <FaChartBar className="text-orange-600 text-xl" />
                  </div>
                </div>
              </div>
              
              {/* Usage History */}
              {selectedCoupon.coupon.usageHistory.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            User
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Order ID
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Discount
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedCoupon.coupon.usageHistory.map((usage, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {usage.userId.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {usage.userId.email}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {usage.orderId.orderId}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              ₹{usage.discountAmount.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {moment(usage.usedAt).format("MMM DD, YYYY HH:mm")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;