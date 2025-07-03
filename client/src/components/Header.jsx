import React, { useEffect, useState } from "react";
// Logo will be replaced with Grocery logo - using inline SVG for now
const groceryLogoSVG = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjAwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8dGV4dCB4PSIxMCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI0OCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNGRjgwMDAiPkdyPC90ZXh0Pgo8dGV4dCB4PSI4NSIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI0OCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMyMkM1NUIiPm9jZXJ5PC90ZXh0Pgo8L3N2Zz4K`;
import Search from "./Search";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaRegCircleUser } from "react-icons/fa6";
import useMobile from "../hooks/useMobile";
import { BsCart4 } from "react-icons/bs";
import { useSelector } from "react-redux";
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";
import UserMenu from "./UserMenu";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import { useGlobalContext } from "../provider/GlobalProvider";
import DisplayCartItem from "./DisplayCartItem";
import isAdmin from "../utils/isAdmin";

const Header = () => {
  const [isMobile] = useMobile();
  const location = useLocation();
  const isSearchPage = location.pathname === "/search";
  const navigate = useNavigate();
  const user = useSelector((state) => state?.user);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const cartItem = useSelector((state) => state.cartItem.cart);
  const { totalPrice, totalQty } = useGlobalContext();
  const [openCartSection, setOpenCartSection] = useState(false);

  // Check if current user is admin
  const userIsAdmin = user && user.role && isAdmin(user.role);
  
  // Check if we're on admin routes
  const isAdminRoute = location.pathname.startsWith('/dashboard/admin');

  console.log("user: ", user);
  
  const redirectToLoginPage = () => {
    navigate("/login");
  };

  const handleCloseUserMenu = () => {
    setOpenUserMenu(false);
  };

  const handleMobileUser = () => {
    if (!user._id) {
      navigate("/login");
      return;
    }

    navigate("/user");
  };

  // If user is admin, show minimal header or completely hide header on admin routes
  if (userIsAdmin && isAdminRoute) {
    return null; // Hide header completely on admin routes for clean professional look
  }

  // For regular users or non-admin routes, show full header
  return (
    <header className="h-24 lg:h-20 lg:shadow-md sticky top-0 z-40 flex flex-col justify-center gap-1 bg-white">
      {!(isSearchPage && isMobile) && (
        <div className="container mx-auto flex items-center px-2 justify-between">
          {/**logo */}
          <div className="h-full">
            <Link to={"/"} className="h-full flex justify-center items-center">
              <img
                src={groceryLogoSVG}
                width={170}
                height={60}
                alt="Grocery logo"
                className="hidden lg:block"
              />
              <img
                src={groceryLogoSVG}
                width={120}
                height={60}
                alt="Grocery logo"
                className="lg:hidden"
              />
            </Link>
          </div>

          {/**Search - hide for admin users */}
          {!userIsAdmin && (
            <div className="hidden lg:block">
              <Search />
            </div>
          )}

          {/**login and my cart - hide cart for admin users */}
          <div className="">
            {/**user icons display in only mobile version**/}
            {!userIsAdmin && (
              <button
                className="text-neutral-600 lg:hidden flex items-center"
                onClick={handleMobileUser}
              >
                {user?._id ? (
                  <div
                    onClick={() => setOpenUserMenu((preve) => !preve)}
                    className="flex select-none items-center gap-1 cursor-pointer"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <FaRegCircleUser size={26} />
                    )}
                  </div>
                ) : (
                  <FaRegCircleUser size={26} />
                )}
              </button>
            )}

            {/**Desktop**/}
            <div className="hidden lg:flex items-center gap-10">
              {user?._id ? (
                <div className="relative">
                  {/* Show account dropdown only for non-admin users */}
                  {!userIsAdmin && (
                    <>
                      <div
                        onClick={() => setOpenUserMenu((preve) => !preve)}
                        className="flex select-none items-center gap-1 cursor-pointer"
                      >
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <FaRegCircleUser size={26} />
                        )}
                        <span className="text-sm font-medium">Account</span>
                        {openUserMenu ? (
                          <GoTriangleUp size={20} />
                        ) : (
                          <GoTriangleDown size={20} />
                        )}
                      </div>
                      {openUserMenu && (
                        <div className="absolute right-0 top-12">
                          <div className="bg-white rounded p-4 min-w-52 lg:shadow-lg">
                            <UserMenu close={handleCloseUserMenu} />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* For admin users, show minimal profile indicator */}
                  {userIsAdmin && (
                    <Link 
                      to="/dashboard/admin"
                      className="flex select-none items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt="Admin Profile"
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <FaRegCircleUser size={18} />
                      )}
                      <span className="text-sm font-medium">Admin Panel</span>
                    </Link>
                  )}
                </div>
              ) : (
                <button onClick={redirectToLoginPage} className="text-lg px-2">
                  Login
                </button>
              )}
              
              {/* Show cart only for non-admin users */}
              {!userIsAdmin && (
                <button
                  onClick={() => setOpenCartSection(true)}
                  className="flex items-center gap-2 bg-green-800 hover:bg-green-700 px-3 py-2 rounded text-white"
                >
                  <div className="animate-bounce">
                    <BsCart4 size={26} />
                  </div>
                  <div className="font-semibold text-sm">
                    {cartItem[0] ? (
                      <div>
                        <p>{totalQty} Items</p>
                        <p>{DisplayPriceInRupees(totalPrice)}</p>
                      </div>
                    ) : (
                      <p>My Cart</p>
                    )}
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hide mobile search for admin users */}
      {!userIsAdmin && (
        <div className="container mx-auto px-2 lg:hidden">
          <Search />
        </div>
      )}

      {/* Show cart modal only for non-admin users */}
      {!userIsAdmin && openCartSection && (
        <DisplayCartItem close={() => setOpenCartSection(false)} />
      )}
    </header>
  );
};

export default Header;
