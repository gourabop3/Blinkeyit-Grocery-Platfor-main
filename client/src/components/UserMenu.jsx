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
    <div>
      <div className="font-semibold">My Account</div>
      <div className="text-sm flex items-center gap-2">
        <span className="max-w-52 text-ellipsis line-clamp-1">
          {user.name || user.mobile}{" "}
          <span className="text-medium text-red-600">
            {user.role === "ADMIN" ? "(Admin)" : ""}
          </span>
        </span>
        <Link
          onClick={handleClose}
          to={"/dashboard/profile"}
          className="hover:text-primary-200"
        >
          <HiOutlineExternalLink size={15} />
        </Link>
      </div>

      <Divider />

      <div className="text-sm grid gap-1">
        {/* Admin Section - Only show Admin Dashboard entry point */}
        {isAdmin(user.role) && (
          <Link
            onClick={handleClose}
            to={"/dashboard/admin"}
            className="px-2 hover:bg-orange-200 py-1 text-blue-600 font-medium"
          >
            Admin Dashboard
          </Link>
        )}

        {/* Add divider between admin and user sections if user is admin */}
        {isAdmin(user.role) && <Divider />}

        {/* User Section - Always visible for both admin and regular users */}
        <Link
          onClick={handleClose}
          to={"/dashboard/myorders"}
          className="px-2 hover:bg-orange-200 py-1"
        >
          My Orders
        </Link>

        <Link
          onClick={handleClose}
          to={"/dashboard/address"}
          className="px-2 hover:bg-orange-200 py-1"
        >
          Save Address
        </Link>

        <button
          onClick={handleLogout}
          className="text-left px-2 hover:bg-orange-200 py-1"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default UserMenu;
