import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import isAdmin from "../utils/isAdmin";
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";

const Footer = () => {
  const user = useSelector((state) => state?.user);
  const location = useLocation();

  // Check if current user is admin and on admin routes
  const userIsAdmin = user && user.role && isAdmin(user.role);
  const isAdminRoute = location.pathname.startsWith('/dashboard/admin');

  // Hide footer for admin users on admin routes for clean professional look
  if (userIsAdmin && isAdminRoute) {
    return null;
  }

  return (
    <footer className="border-t bg-neutral-100 py-4">
      <div className="container mx-auto px-2 text-center text-sm text-neutral-600">
        <p>&copy; 2024 Blinkeyit. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
