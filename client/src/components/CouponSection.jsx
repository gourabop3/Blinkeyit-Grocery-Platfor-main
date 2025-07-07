import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import SummaryApi from "../common/SummaryApi";
import { 
  FaTags, 
  FaPercentage, 
  FaRupeeSign, 
  FaShippingFast, 
  FaGift,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaCheck,
  FaCopy,
  FaSpinner
} from "react-icons/fa";
import moment from "moment";

const CouponSection = ({ 
  orderAmount = 0, 
  onCouponApply = () => {}, 
  appliedCoupon = null,
  cartItems = []
}) => {
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState("");

  useEffect(() => {
    if (showCoupons) {
      fetchAvailableCoupons();
    }
  }, [showCoupons]);

  const fetchAvailableCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch(SummaryApi.getActiveCoupons.url, {
        method: SummaryApi.getActiveCoupons.method,
        credentials: "include",
      });

      const result = await response.json();
      if (result.success) {
        setAvailableCoupons(result.data);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  const validateAndApplyCoupon = async (code) => {
    if (!code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      setValidatingCoupon(code);
      const response = await fetch(`${SummaryApi.validateCoupon.url}/${code}`, {
        method: SummaryApi.validateCoupon.method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          orderAmount,
          products: cartItems,
        }),
      });

      const result = await response.json();
      if (result.success) {
        onCouponApply(result.data);
        setCouponCode("");
        setShowCoupons(false);
        toast.success(`Coupon applied! You saved ₹${result.data.discountAmount}`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to apply coupon");
    } finally {
      setValidatingCoupon("");
    }
  };

  const removeCoupon = () => {
    onCouponApply(null);
    toast.success("Coupon removed");
  };

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    setCouponCode(code);
    toast.success("Coupon code copied!");
  };

  const getCouponIcon = (type) => {
    switch (type) {
      case "percentage":
        return <FaPercentage className="text-blue-500" />;
      case "fixed":
        return <FaRupeeSign className="text-green-500" />;
      case "free_shipping":
        return <FaShippingFast className="text-purple-500" />;
      case "bogo":
        return <FaGift className="text-orange-500" />;
      default:
        return <FaTags className="text-gray-500" />;
    }
  };

  const getCouponValue = (coupon) => {
    switch (coupon.type) {
      case "percentage":
        return `${coupon.value}% OFF`;
      case "fixed":
        return `₹${coupon.value} OFF`;
      case "free_shipping":
        return "FREE SHIPPING";
      case "bogo":
        return "BUY 1 GET 1";
      default:
        return "DISCOUNT";
    }
  };

  const isEligibleForCoupon = (coupon) => {
    return orderAmount >= coupon.minOrderAmount;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaTags className="text-blue-600" />
            <h3 className="font-semibold text-gray-900">Apply Coupon</h3>
          </div>
          {availableCoupons.length > 0 && (
            <button
              onClick={() => setShowCoupons(!showCoupons)}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
            >
              View Offers
              {showCoupons ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          )}
        </div>
      </div>

      {/* Applied Coupon Display */}
      {appliedCoupon && (
        <div className="p-4 bg-green-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-green-700">
                <FaCheck className="text-sm" />
                <span className="font-medium">{appliedCoupon.coupon.code}</span>
              </div>
              <span className="text-sm text-gray-600">
                You saved ₹{appliedCoupon.discountAmount}
              </span>
            </div>
            <button
              onClick={removeCoupon}
              className="text-red-500 hover:text-red-700 transition-colors"
              title="Remove coupon"
            >
              <FaTimes />
            </button>
          </div>
          <p className="text-sm text-green-600 mt-1">
            {appliedCoupon.coupon.title}
          </p>
        </div>
      )}

      {/* Coupon Input */}
      {!appliedCoupon && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  validateAndApplyCoupon(couponCode);
                }
              }}
            />
            <button
              onClick={() => validateAndApplyCoupon(couponCode)}
              disabled={!couponCode.trim() || validatingCoupon === couponCode}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {validatingCoupon === couponCode ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Applying...
                </>
              ) : (
                "Apply"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Available Coupons List */}
      {showCoupons && (
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <FaSpinner className="animate-spin text-blue-600 text-2xl mx-auto mb-2" />
              <p className="text-gray-600">Loading coupons...</p>
            </div>
          ) : availableCoupons.length === 0 ? (
            <div className="p-8 text-center">
              <FaTags className="text-gray-400 text-3xl mx-auto mb-2" />
              <p className="text-gray-600">No coupons available</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {availableCoupons.map((coupon) => {
                const isEligible = isEligibleForCoupon(coupon);
                const isValidating = validatingCoupon === coupon.code;
                
                return (
                  <div
                    key={coupon._id}
                    className={`p-4 transition-colors ${
                      !isEligible ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getCouponIcon(coupon.type)}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 text-lg">
                                {getCouponValue(coupon)}
                              </span>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                {coupon.code}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {coupon.title}
                            </p>
                          </div>
                        </div>
                        
                        {coupon.description && (
                          <p className="text-xs text-gray-500 mb-2">
                            {coupon.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          {coupon.minOrderAmount > 0 && (
                            <span>
                              Min order: ₹{coupon.minOrderAmount}
                            </span>
                          )}
                          {coupon.maxDiscountAmount && (
                            <span>
                              Max discount: ₹{coupon.maxDiscountAmount}
                            </span>
                          )}
                          <span>
                            Valid till: {moment(coupon.validUntil).format("MMM DD, YYYY")}
                          </span>
                          {coupon.usageLimit.perUser && (
                            <span>
                              Per user: {coupon.usageLimit.perUser} time{coupon.usageLimit.perUser > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        
                        {!isEligible && (
                          <p className="text-xs text-red-500 mt-2">
                            Add ₹{coupon.minOrderAmount - orderAmount} more to unlock this offer
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => copyCouponCode(coupon.code)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Copy code"
                        >
                          <FaCopy />
                        </button>
                        
                        {isEligible && (
                          <button
                            onClick={() => validateAndApplyCoupon(coupon.code)}
                            disabled={isValidating}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                          >
                            {isValidating ? (
                              <>
                                <FaSpinner className="animate-spin" />
                                Applying...
                              </>
                            ) : (
                              "Apply"
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CouponSection;