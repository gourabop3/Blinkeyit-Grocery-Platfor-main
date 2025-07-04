// If VITE_API_URL is not set (local dev), fall back to backend default localhost port.
export const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SummaryApi = {
  register: {
    url: "/api/user/register",
    method: "post",
  },
  login: {
    url: "/api/user/login",
    method: "post",
  },
  verifyEmail: {
    url: "/api/user/verify-email",
    method: "post",
  },
  forgot_password: {
    url: "/api/user/forgot-password",
    method: "put",
  },
  forgot_password_otp_verification: {
    url: "/api/user/verify-forgot-password-otp",
    method: "put",
  },
  resetPassword: {
    url: "/api/user/reset-password",
    method: "put",
  },
  refreshToken: {
    url: "/api/user/refresh-token",
    method: "post",
  },
  userDetails: {
    url: "/api/user/user-details",
    method: "get",
  },
  logout: {
    url: "/api/user/logout",
    method: "get",
  },
  uploadAvatar: {
    url: "/api/user/upload-avatar",
    method: "put",
  },
  updateUserDetails: {
    url: "/api/user/update-user",
    method: "put",
  },
  addCategory: {
    url: "/api/category/add-category",
    method: "post",
  },
  uploadImage: {
    url: "/api/file/upload",
    method: "post",
  },
  getCategory: {
    url: "/api/category/get",
    method: "post",
  },
  updateCategory: {
    url: "/api/category/update",
    method: "put",
  },
  deleteCategory: {
    url: "/api/category/delete",
    method: "delete",
  },
  createSubCategory: {
    url: "/api/subcategory/create",
    method: "post",
  },
  getSubCategory: {
    url: "/api/subcategory/get",
    method: "post",
  },
  updateSubCategory: {
    url: "/api/subcategory/update",
    method: "put",
  },
  deleteSubCategory: {
    url: "/api/subcategory/delete",
    method: "delete",
  },
  createProduct: {
    url: "/api/product/create",
    method: "post",
  },
  getProduct: {
    url: "/api/product/get",
    method: "post",
  },
  getProductByCategory: {
    url: "/api/product/get-product-by-category",
    method: "post",
  },
  getProductByCategoryAndSubCategory: {
    url: "/api/product/get-product-by-category-and-subcategory",
    method: "post",
  },
  getProductDetails: {
    url: "/api/product/get-product-details",
    method: "post",
  },
  updateProductDetails: {
    url: "/api/product/update-product-details",
    method: "put",
  },
  deleteProduct: {
    url: "/api/product/delete-product",
    method: "delete",
  },
  searchProduct: {
    url: "/api/product/search-product",
    method: "post",
  },
  addTocart: {
    url: "/api/cart/create",
    method: "post",
  },
  getCartItem: {
    url: "/api/cart/get",
    method: "get",
  },
  updateCartItemQty: {
    url: "/api/cart/update-qty",
    method: "put",
  },
  deleteCartItem: {
    url: "/api/cart/delete-cart-item",
    method: "delete",
  },
  createAddress: {
    url: "/api/address/create",
    method: "post",
  },
  getAddress: {
    url: "/api/address/get",
    method: "get",
  },
  updateAddress: {
    url: "/api/address/update",
    method: "put",
  },
  disableAddress: {
    url: "/api/address/disable",
    method: "delete",
  },
  CashOnDeliveryOrder: {
    url: "/api/order/cash-on-delivery",
    method: "post",
  },
      clearCart: {
        url: "/api/order/clear-cart",
        method: "post"
    },
    verifyPayment: {
        url: "/api/order/verify-payment",
        method: "post"
    },
    
    // Review APIs
    createReview: {
        url: "/api/review/create",
        method: "post"
    },
    getProductReviews: {
        url: "/api/review/product",
        method: "get"
    },
    markReviewHelpful: {
        url: "/api/review/helpful",
        method: "post"
    },
    getUserReviews: {
        url: "/api/review/user/reviews",
        method: "get"
    },

    // Wishlist APIs
    addToWishlist: {
        url: "/api/wishlist/add",
        method: "post"
    },
    removeFromWishlist: {
        url: "/api/wishlist/remove",
        method: "delete"
    },
    getWishlist: {
        url: "/api/wishlist",
        method: "get"
    },
    updateWishlistItem: {
        url: "/api/wishlist/update",
        method: "put"
    },
    checkWishlist: {
        url: "/api/wishlist/check",
        method: "get"
    },
    moveWishlistToCart: {
        url: "/api/wishlist/move-to-cart",
        method: "post"
    },

    // Loyalty APIs
    getLoyaltySummary: {
        url: "/api/loyalty/summary",
        method: "get"
    },
    getLoyaltyHistory: {
        url: "/api/loyalty/history",
        method: "get"
    },
    redeemPoints: {
        url: "/api/loyalty/redeem",
        method: "post"
    },
    awardReferralPoints: {
        url: "/api/loyalty/referral-reward",
        method: "post"
    },

    payment_url: {
    url: "/api/order/checkout",
    method: "post",
  },
  getOrderItems: {
    url: "/api/order/order-list",
    method: "get",
  },
  getDashboardStats: {
    url: "/api/dashboard/stats",
    method: "get",
  },
  // Admin User Management APIs
  getAllUsers: {
    url: "/api/user/admin/all-users",
    method: "get",
  },
  updateUserRole: {
    url: "/api/user/admin/update-user",
    method: "put",
  },
  deleteUser: {
    url: "/api/user/admin/delete-user",
    method: "delete",
  },
  // Admin Order Management APIs (using existing order endpoints)
  getAllOrders: {
    url: "/api/order/admin/all-orders",
    method: "get",
  },
  updateOrderStatus: {
    url: "/api/order/admin/update-status",
    method: "put",
  },

  // Delivery Tracking APIs
  getDeliveryTracking: {
    url: "/api/delivery-tracking/order/:orderId",
    method: "get",
  },
  getLiveLocation: {
    url: "/api/delivery-tracking/order/:orderId/location",
    method: "get",
  },
  getDeliveryTimeline: {
    url: "/api/delivery-tracking/order/:orderId/timeline",
    method: "get",
  },
  reportDeliveryIssue: {
    url: "/api/delivery-tracking/order/:orderId/issue",
    method: "post",
  },
  submitDeliveryFeedback: {
    url: "/api/delivery-tracking/order/:orderId/feedback",
    method: "post",
  },
  verifyDeliveryOTP: {
    url: "/api/delivery-tracking/order/:orderId/verify-otp",
    method: "post",
  },
  cancelDelivery: {
    url: "/api/delivery-tracking/order/:orderId/cancel",
    method: "post",
  },

  // Delivery Partner APIs
  registerDeliveryPartner: {
    url: "/api/delivery-partner/register",
    method: "post",
  },
  loginDeliveryPartner: {
    url: "/api/delivery-partner/login",
    method: "post",
  },
  getPartnerProfile: {
    url: "/api/delivery-partner/profile",
    method: "get",
  },
  updatePartnerProfile: {
    url: "/api/delivery-partner/profile",
    method: "put",
  },
  updatePartnerLocation: {
    url: "/api/delivery-partner/location",
    method: "post",
  },
  togglePartnerAvailability: {
    url: "/api/delivery-partner/availability",
    method: "post",
  },
  getActiveOrders: {
    url: "/api/delivery-partner/orders/active",
    method: "get",
  },
  acceptOrder: {
    url: "/api/delivery-partner/orders/accept",
    method: "post",
  },
  updateDeliveryStatus: {
    url: "/api/delivery-partner/orders/status",
    method: "post",
  },
  completeDelivery: {
    url: "/api/delivery-partner/orders/complete",
    method: "post",
  },
  getPartnerEarnings: {
    url: "/api/delivery-partner/earnings",
    method: "get",
  },

  // Admin Delivery Management APIs
  getAllDeliveryPartners: {
    url: "/api/delivery-partner/admin/all",
    method: "get",
  },
  updatePartnerStatus: {
    url: "/api/delivery-partner/admin/:partnerId/status",
    method: "put",
  },
  autoAssignOrder: {
    url: "/api/delivery-partner/admin/auto-assign",
    method: "post",
  },
  getAllActiveDeliveries: {
    url: "/api/delivery-tracking/admin/active",
    method: "get",
  },
  getDeliveryAnalytics: {
    url: "/api/delivery-tracking/admin/analytics",
    method: "get",
  },

  // Coupon APIs
  createCoupon: {
    url: "/api/coupon/admin/create",
    method: "post",
  },
  listCoupons: {
    url: "/api/coupon/admin/list",
    method: "get",
  },
  updateCoupon: {
    url: "/api/coupon/admin",
    method: "put", // will append "/:couponId" dynamically
  },
  deleteCoupon: {
    url: "/api/coupon/admin",
    method: "delete", // will append "/:couponId" dynamically
  },
  applyCoupon: {
    url: "/api/coupon/apply",
    method: "post",
  },
};

export default SummaryApi;
