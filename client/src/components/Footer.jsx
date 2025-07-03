import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import isAdmin from "../utils/isAdmin";
import { FaTelegramPlane, FaInstagram } from "react-icons/fa";
import { SiGmail } from "react-icons/si";

const Footer = () => {
  const user = useSelector((state) => state?.user);
  const location = useLocation();

  const userIsAdmin = user && user.role && isAdmin(user.role);
  const isAdminRoute = location.pathname.startsWith("/dashboard/admin");

  // Hide footer on admin dashboard pages
  if (userIsAdmin && isAdminRoute) return null;

  return (
  <footer className="border-t bg-neutral-100 py-4">
  <div className="container mx-auto px-2 text-center text-sm text-neutral-800">
    {/* Text: darker */}
    <p className="font-medium">&copy; 2025 Grocery. All rights reserved.</p>

    {/* Social icons */}
    <div className="mt-2 flex justify-center space-x-5 text-xl text-neutral-800">
      {/* Telegram */}
      <a
        href="https://t.me/gourabop"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Telegram"
      >
        <FaTelegramPlane className="hover:text-sky-600 transition-colors duration-200" />
      </a>

      {/* Instagram */}
      <a
        href="https://instagram.com/gourab_op_84"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
      >
        <FaInstagram className="hover:text-pink-600 transition-colors duration-200" />
      </a>

      {/* Gmail */}
      <a
        href="mailto:gourabmullick200@gmail.com"
        aria-label="Gmail"
      >
        <SiGmail className="hover:text-red-600 transition-colors duration-200" />
      </a>
    </div>
  </div>
</footer>
);
};


export default Footer;