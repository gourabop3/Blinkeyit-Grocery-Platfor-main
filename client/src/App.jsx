import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import toast, { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import fetchUserDetails from "./utils/fetchUserDetails";
import { setUserDetails } from "./store/userSlice";
import {
  setAllCategory,
  setAllSubCategory,
  setLoadingCategory,
} from "./store/productSlice";
import { useDispatch, useSelector } from "react-redux";
import { handleAddItemCart } from "./store/cartSlice";
import { setAllAddress } from "./store/addressSlice";
import Axios from "./utils/Axios";
import SummaryApi from "./common/SummaryApi";
import GlobalProvider from "./provider/GlobalProvider";
import CartMobileLink from "./components/CartMobileLink";
import isAdmin from "./utils/isAdmin";

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchUser = async () => {
    const userData = await fetchUserDetails();
    if (userData.data) {
      dispatch(setUserDetails(userData.data));
    }
  };

  const fetchCategory = async () => {
    try {
      dispatch(setLoadingCategory(true));
      const response = await Axios({
        ...SummaryApi.getCategory,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(
          setAllCategory(
            responseData.data.sort((a, b) => a.name.localeCompare(b.name))
          )
        );
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to load categories.");
    } finally {
      dispatch(setLoadingCategory(false));
    }
  };

  const fetchSubCategory = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getSubCategory,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(
          setAllSubCategory(
            responseData.data.sort((a, b) => a.name.localeCompare(b.name))
          )
        );
      }
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
      toast.error("Failed to load subcategories.");
    } finally {
      dispatch(setLoadingCategory(false));
    }
  };

  //user add to cart
  const fetchCartItem = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getCartItem,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(handleAddItemCart(responseData.data));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAddress = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getAddress,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(setAllAddress(responseData.data));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchCategory();
    fetchSubCategory();
    fetchCartItem();
    fetchAddress();
  }, []);

  // Admin redirect logic
  useEffect(() => {
    // Only check if user is loaded and has role
    if (user && user.role && isAdmin(user.role)) {
      // List of paths that should redirect admin to admin panel
      const userOnlyPaths = ['/', '/search', '/cart', '/checkout'];
      const isUserOnlyPath = userOnlyPaths.some(path => 
        location.pathname === path || location.pathname.startsWith(path)
      );
      
      // If admin is on a user-only path and not already on admin routes
      if (isUserOnlyPath && !location.pathname.startsWith('/dashboard/admin')) {
        console.log('Admin user detected on user page, redirecting to admin dashboard');
        navigate('/dashboard/admin', { replace: true });
      }
    }
  }, [user, location.pathname, navigate]);

  return (
    <GlobalProvider>
      <Header />
      <main className="min-h-[78vh]">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
      {location.pathname !== "/checkout" && <CartMobileLink />}
    </GlobalProvider>
  );
};

export default App;
