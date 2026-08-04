import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  Home,
  Info,
  PhoneCall,
  Bed,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Shield,
} from "lucide-react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'customer' | 'hotelOwner' | 'admin'
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = Cookies.get("token");
    const usertoken = localStorage.getItem("token");
    const activeToken = token || usertoken;

    if (activeToken) {
      try {
        const decoded = jwtDecode(activeToken);
        const type = decoded.user?.type || (decoded.hotel_owner ? "hotelOwner" : null) || decoded.type;

        if (type === "admin") {
          setUserRole("admin");
          setIsLoggedIn(true);
        } else if (type === "hotelOwner" || decoded.hotel_owner) {
          setUserRole("hotelOwner");
          setIsLoggedIn(true);
        } else if (decoded.user || type === "customer") {
          setUserRole("customer");
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        setIsLoggedIn(false);
        setUserRole(null);
      }
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserRole(null);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0a0c14] border-b border-white/10 shadow-xl font-['Plus_Jakarta_Sans','Inter',sans-serif] text-white transition-all duration-300">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-3.5 flex justify-between items-center">

        {/* Brand Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center"
        >
          <Link
            to="/"
            className="flex items-center transition-transform hover:scale-105 active:scale-95 duration-200"
          >
            <img src={logo} alt="Logo" className="h-10 w-auto object-contain rounded-lg" />
          </Link>
        </motion.div>

        {/* Mobile Hamburger Button */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/10"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Desktop & Mobile Menu Navigation */}
        <div
          className={`lg:flex items-center lg:space-x-1.5 text-xs font-bold transition-all duration-300 ${isMenuOpen
              ? "absolute top-full left-0 w-full bg-[#0a0c14] border-b border-white/10 p-6 flex flex-col space-y-3.5 shadow-2xl"
              : "hidden lg:flex"
            }`}
        >
          {/* Home Link */}
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${location.pathname === "/"
                ? "bg-[#b90538] text-white font-extrabold shadow-md shadow-rose-500/30"
                : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
          >
            <Home size={16} />
            <span>Home</span>
          </Link>

          {/* Hotels Link */}
          <Link
            to="/booking/hotel"
            onClick={() => setIsMenuOpen(false)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${location.pathname.startsWith("/booking/hotel")
                ? "bg-[#b90538] text-white font-extrabold shadow-md shadow-rose-500/30"
                : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
          >
            <Bed size={16} />
            <span>Hotels</span>
          </Link>

          {/* About Us */}
          <Link
            to="/about"
            onClick={() => setIsMenuOpen(false)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${location.pathname === "/about"
                ? "bg-[#b90538] text-white font-extrabold shadow-md shadow-rose-500/30"
                : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
          >
            <Info size={16} />
            <span>About Us</span>
          </Link>

          {/* Contact Us */}
          <Link
            to="/contact"
            onClick={() => setIsMenuOpen(false)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${location.pathname === "/contact"
                ? "bg-[#b90538] text-white font-extrabold shadow-md shadow-rose-500/30"
                : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
          >
            <PhoneCall size={16} />
            <span>Contact Us</span>
          </Link>

          {/* Conditional Dashboard Link */}
          {isLoggedIn && userRole === "admin" && (
            <Link
              to="/super/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${location.pathname.startsWith("/super/dashboard")
                  ? "bg-[#b90538] text-white font-extrabold shadow-md shadow-rose-500/30"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
            >
              <Shield size={16} />
              <span>Admin Dashboard</span>
            </Link>
          )}

          {isLoggedIn && userRole === "hotelOwner" && (
            <Link
              to="/hotelowner/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${location.pathname.startsWith("/hotelowner/dashboard")
                  ? "bg-[#b90538] text-white font-extrabold shadow-md shadow-rose-500/30"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
            >
              <User size={16} />
              <span>Owner Dashboard</span>
            </Link>
          )}

          {isLoggedIn && userRole === "customer" && (
            <Link
              to="/userdashboard"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${location.pathname === "/userdashboard"
                  ? "bg-[#b90538] text-white font-extrabold shadow-md shadow-rose-500/30"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
            >
              <User size={16} />
              <span>User Dashboard</span>
            </Link>
          )}

          {/* Action Buttons */}
          <div className="pt-2 lg:pt-0 lg:ml-4 flex items-center gap-2">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="px-5 py-2 rounded-full bg-[#b90538] hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/30 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="border-2 border-white/20 hover:border-white text-white font-extrabold text-xs px-5 py-2 rounded-full transition-all shadow-xs active:scale-95 flex items-center gap-1.5 hover:bg-white/10"
                >
                  <LogIn size={14} />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-gradient-to-r from-[#b90538] to-rose-600 hover:from-rose-700 hover:to-rose-800 text-white font-extrabold text-xs px-5 py-2 rounded-full shadow-md shadow-rose-500/30 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <UserPlus size={14} />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

        </div>

      </div>
    </nav>
  );
};

export default Navbar;