import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import SearchPage from "../pages/SearchPage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import OtpVerification from "../pages/OtpVerification";
import ResetPassword from "../pages/ResetPassword";
import UserMenuMobile from "../pages/UserMenuMobile";
import Dashboard from "../layouts/Dashboard";
import Profile from "../pages/Profile";
import MyOrders from "../pages/MyOrders";
import Address from "../pages/Address";
import CategoryPage from "../pages/CategoryPage";
import SubCategoryPage from "../pages/SubCategoryPage";
import UploadProduct from "../pages/UploadProduct";
import ProductAdmin from "../pages/ProductAdmin";
import AdminPermision from "../layouts/AdminPermision";
import AdminLayout from "../layouts/AdminLayout";
import NewAdminDashboard from "../pages/NewAdminDashboard";
import OrderManagement from "../pages/OrderManagement";
import UserManagement from "../pages/UserManagement";
import AdminDiagnostic from "../pages/AdminDiagnostic";
import LiveDeliveriesMap from "../pages/LiveDeliveriesMap";
import ProductListPage from "../pages/ProductListPage";
import ProductDisplayPage from "../pages/ProductDisplayPage";
import CartMobile from "../pages/CartMobile";
import CheckoutPage from "../pages/CheckoutPage";
import Success from "../pages/Success";
import Cancel from "../pages/Cancel";
import VerifyEmail from "../pages/VerifyEmail";
import TrackOrder from "../pages/TrackOrder";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "verification-otp",
        element: <OtpVerification />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
      {
        path: "user",
        element: <UserMenuMobile />,
      },
      {
        path: "verify-email",
        element: <VerifyEmail />,
      },
      {
        path: "admin-diagnostic",
        element: <AdminDiagnostic />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
        children: [
          {
            path: "profile",
            element: <Profile />,
          },
          {
            path: "myorders",
            element: <MyOrders />,
          },
          {
            path: "address",
            element: <Address />,
          },
        ],
      },
      // Separate Admin Route - bypasses Dashboard layout
      {
        path: "dashboard/admin",
        element: (
          <AdminPermision>
            <AdminLayout />
          </AdminPermision>
        ),
        children: [
          {
            path: "",
            element: <NewAdminDashboard />,
          },
          {
            path: "orders",
            element: <OrderManagement />,
          },
          {
            path: "users",
            element: <UserManagement />,
          },
          {
            path: "category",
            element: <CategoryPage />,
          },
          {
            path: "subcategory",
            element: <SubCategoryPage />,
          },
          {
            path: "upload-product",
            element: <UploadProduct />,
          },
          {
            path: "product",
            element: <ProductAdmin />,
          },
          {
            path: "coupons",
            element: <div className="p-6"><h1 className="text-2xl font-bold">Coupon Management</h1><p className="text-gray-600">Coming soon...</p></div>,
          },
          {
            path: "analytics",
            element: <div className="p-6"><h1 className="text-2xl font-bold">Analytics</h1><p className="text-gray-600">Coming soon...</p></div>,
          },
          {
            path: "website-banners",
            element: <div className="p-6"><h1 className="text-2xl font-bold">Website Banners</h1><p className="text-gray-600">Coming soon...</p></div>,
          },
          {
            path: "app-banners",
            element: <div className="p-6"><h1 className="text-2xl font-bold">App Banners</h1><p className="text-gray-600">Coming soon...</p></div>,
          },
          {
            path: "delivery-partners",
            element: <div className="p-6"><h1 className="text-2xl font-bold">Delivery Partners</h1><p className="text-gray-600">Manage delivery partners...</p></div>,
          },
          {
            path: "delivery-tracking",
            element: <LiveDeliveriesMap />,
          },
        ],
      },
      {
        path: ":category",
        children: [
          {
            path: ":subCategory",
            element: <ProductListPage />,
          },
        ],
      },
      {
        path: "product/:product",
        element: <ProductDisplayPage />,
      },
      {
        path: "cart",
        element: <CartMobile />,
      },
      {
        path: "checkout",
        element: <CheckoutPage />,
      },
      {
        path: "success",
        element: <Success />,
      },
      {
        path: "cancel",
        element: <Cancel />,
      },
      {
        path: "track/:orderId",
        element: <TrackOrder />,
      },
    ],
  },
]);

export default router;
