import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Divider from "./Divider";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { logout } from "../store/userSlice";
import toast from "react-hot-toast";
import AxiosToastError from "../utils/AxiosToastError";
import { HiOutlineExternalLink } from "react-icons/hi";
import isAdmin from "../utils/isAdmin";

const UserMenu = ({ close }) => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.logout,
      });
      console.log("logout", response);
      if (response.data.success) {
        if (close) {
          close();
        }
        dispatch(logout());
        sessionStorage.clear();
        toast.success(response.data.message);
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      AxiosToastError(error);
    }
  };

  const handleClose = () => {
    if (close) {
      close();
    }
  };
  return (
    <div className="text-gray-800">
      <div className="font-semibold text-gray-900">My Account</div>
      <div className="text-sm flex items-center gap-2 text-gray-700">
        <span className="max-w-52 text-ellipsis line-clamp-1">
          {user.name || user.mobile}{" "}
          <span className="text-medium text-red-600 font-medium">
            {user.role === "ADMIN" ? "(Admin)" : ""}
          </span>
        </span>
        <Link
          onClick={handleClose}
          to={"/dashboard/profile"}
          className="hover:text-blue-600 text-gray-600"
        >
          <HiOutlineExternalLink size={15} />
        </Link>
      </div>

      <Divider />

      <div className="text-sm grid gap-1">
        {isAdmin(user.role) && (
          <Link
            onClick={handleClose}
            to={"/dashboard/admin"}
            className="px-2 hover:bg-orange-200 py-1 text-gray-700 hover:text-gray-900 rounded transition-colors"
          >
            Admin Dashboard
          </Link>
        )}

        {isAdmin(user.role) && (
          <Link
            onClick={handleClose}
            to={"/dashboard/orders"}
            className="px-2 hover:bg-orange-200 py-1 text-gray-700 hover:text-gray-900 rounded transition-colors"
          >
            Order Management
          </Link>
        )}

        {isAdmin(user.role) && (
          <Link
            onClick={handleClose}
            to={"/dashboard/category"}
            className="px-2 hover:bg-orange-200 py-1 text-gray-700 hover:text-gray-900 rounded transition-colors"
          >
            Category
          </Link>
        )}

        {isAdmin(user.role) && (
          <Link
            onClick={handleClose}
            to={"/dashboard/subcategory"}
            className="px-2 hover:bg-orange-200 py-1 text-gray-700 hover:text-gray-900 rounded transition-colors"
          >
            Sub Category
          </Link>
        )}

        {isAdmin(user.role) && (
          <Link
            onClick={handleClose}
            to={"/dashboard/upload-product"}
            className="px-2 hover:bg-orange-200 py-1 text-gray-700 hover:text-gray-900 rounded transition-colors"
          >
            Upload Product
          </Link>
        )}

        {isAdmin(user.role) && (
          <Link
            onClick={handleClose}
            to={"/dashboard/product"}
            className="px-2 hover:bg-orange-200 py-1 text-gray-700 hover:text-gray-900 rounded transition-colors"
          >
            Product
          </Link>
        )}

        <Link
          onClick={handleClose}
          to={"/dashboard/myorders"}
          className="px-2 hover:bg-orange-200 py-1 text-gray-700 hover:text-gray-900 rounded transition-colors"
        >
          My Orders
        </Link>

        <Link
          onClick={handleClose}
          to={"/dashboard/address"}
          className="px-2 hover:bg-orange-200 py-1 text-gray-700 hover:text-gray-900 rounded transition-colors"
        >
          Save Address
        </Link>

        <button
          onClick={handleLogout}
          className="text-left px-2 hover:bg-orange-200 py-1 text-gray-700 hover:text-gray-900 rounded transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default UserMenu;
