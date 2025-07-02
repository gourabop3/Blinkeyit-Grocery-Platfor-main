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
import Analytics from "../pages/Analytics";
import ModernAdminLayout from "../layouts/ModernAdminLayout";
import ModernAdminDashboard from "../pages/ModernAdminDashboard";
import ModernUserManagement from "../pages/ModernUserManagement";
import AdminPanelSelector from "../pages/AdminPanelSelector";
import ProductListPage from "../pages/ProductListPage";
import ProductDisplayPage from "../pages/ProductDisplayPage";
import CartMobile from "../pages/CartMobile";
import CheckoutPage from "../pages/CheckoutPage";
import Success from "../pages/Success";
import Cancel from "../pages/Cancel";
import VerifyEmail from "../pages/VerifyEmail";

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
        path: "admin-selector",
        element: (
          <AdminPermision>
            <AdminPanelSelector />
          </AdminPermision>
        ),
      },
      {
        path: "modern-admin",
        element: (
          <AdminPermision>
            <ModernAdminLayout />
          </AdminPermision>
        ),
        children: [
          {
            path: "",
            element: <ModernAdminDashboard />,
          },
          {
            path: "users",
            element: <ModernUserManagement />,
          },
          {
            path: "orders",
            element: <OrderManagement />,
          },
          {
            path: "products",
            element: <ProductAdmin />,
          },
          {
            path: "analytics",
            element: <Analytics />,
          },
          {
            path: "settings",
            element: <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p className="text-gray-600">System configuration coming soon...</p></div>,
          },
        ],
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
          {
            path: "admin",
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
                element: <Analytics />,
              },
              {
                path: "website-banners",
                element: <div className="p-6"><h1 className="text-2xl font-bold">Website Banners</h1><p className="text-gray-600">Coming soon...</p></div>,
              },
              {
                path: "app-banners",
                element: <div className="p-6"><h1 className="text-2xl font-bold">App Banners</h1><p className="text-gray-600">Coming soon...</p></div>,
              },
            ],
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
    ],
  },
]);

export default router;
