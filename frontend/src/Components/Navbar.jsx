import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  Home,
  Info,
  PhoneCall,
  CalendarCheck,
  Car,
  User,
  LogIn,
  UserPlus,
  LayoutDashboard,
  UserCircle,
  LogOut,
  Bed,
  Shield,
} from "lucide-react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRider, setIsRider] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    const ridertoken = localStorage.getItem("ridertoken");
    const usertoken = localStorage.getItem("token");

    if (ridertoken) {
      setIsRider(true);
      setIsLoggedIn(true);
    } else if (token) {
      setIsLoggedIn(true);
      setIsRider(false);

      // Check if user is admin
      try {
        const decoded = jwtDecode(token || usertoken);
        setIsAdmin(decoded.user?.type === 'admin');
        // Assuming your JWT has a 'role' field
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      setIsLoggedIn(false);
      setIsRider(false);
      setIsAdmin(false);
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("ridertoken");
    localStorage.removeItem("token");
    localStorage.removeItem("ridertoken");
    setIsLoggedIn(false);
    setIsRider(false);
    setIsAdmin(false);
    navigate("/");
  };

  return (
    <nav className="bg-black text-white px-4 py-3 flex justify-between items-center shadow-lg relative z-50">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center space-x-2"
      >
        <Link
          to="/"
          className="text-xl font-bold text-red-500 hover:scale-110 transition-transform duration-300"
        >
          <img src={logo} alt="Logo" className="w-35 " />
        </Link>
      </motion.div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Navigation Links */}
      <div
        className={`lg:flex flex-col lg:flex-row lg:space-x-6 text-base absolute lg:static top-0 left-0 w-full lg:w-auto bg-black lg:bg-transparent transition-transform duration-300 ${isMenuOpen
          ? "h-screen flex flex-col items-center pt-16"
          : "hidden lg:flex"
          }`}
      >
        <Link
          to="/"
          className="flex items-center space-x-2 p-3 hover:text-red-500 transition-all duration-300"
        >
          <Home size={18} /> <span>Home</span>
        </Link>

        {/* Dropdown */}
        <div className="relative group">
          <button className="flex items-center space-x-2 p-3 hover:text-red-500 transition-all duration-300">
            <CalendarCheck size={18} /> <span>Booking</span>
          </button>
          <div className="absolute hidden group-hover:block bg-black text-white mt-1 rounded-lg shadow-lg w-40 border border-red-500 transition-all duration-300">
            <Link
              to="/booking/hotel"
              className="flex items-center space-x-2 px-4 py-2 hover:bg-red-500 transition-all duration-300"
            >
              <Bed size={16} /> <span>Hotel</span>
            </Link>
            <Link
              to="/booking/cab"
              className="flex items-center space-x-2 px-4 py-2 hover:bg-red-500 transition-all duration-300"
            >
              <Car size={16} /> <span>Cab</span>
            </Link>
          </div>
        </div>

        <Link
          to="/about"
          className="flex items-center space-x-2 p-3 hover:text-red-500 transition-all duration-300"
        >
          <Info size={18} /> <span>About Us</span>
        </Link>
        <Link
          to="/contact"
          className="flex items-center space-x-2 p-3 hover:text-red-500 transition-all duration-300"
        >
          <PhoneCall size={18} /> <span>Contact Us</span>
        </Link>

        {/* Rider Dashboard Link - kept exactly as before */}
        {isRider && (
          <div className="relative group">
            <button className="flex items-center space-x-2 p-3 cursor-pointer hover:text-red-500 transition-all duration-300">
              <User size={18} />
            </button>
            <div className="absolute right-0 hidden group-hover:block bg-black text-white mt-1 rounded-lg shadow-lg w-40 border border-red-500 transition-all duration-300">
              <Link
                to="/booking/riderdashboard"
                className="flex items-center space-x-2 px-4 py-2 hover:bg-red-500 transition-all duration-300"
              >
                <LayoutDashboard size={16} /> <span>Dashboard</span>
              </Link>
              <Link
                to="/riderprofile"
                className="flex items-center space-x-2 px-4 py-2 hover:bg-red-500 transition-all duration-300"
              >
                <UserCircle size={16} /> <span>Profile</span>
              </Link>
            </div>
          </div>
        )}

        {/* Admin Dashboard Link */}
        {isAdmin && (
          <Link
            to="/super/dashboard/"
            className="flex items-center space-x-2 p-3 hover:text-red-500 transition-all duration-300"
          >
            <Shield size={18} /> <span>Admin Dashboard</span>
          </Link>
        )}

        {/* User Dashboard Link */}
        {isLoggedIn && !isRider && (
          <Link
            to="/userdashboard"
            className="flex items-center space-x-2 p-3 hover:text-red-500 transition-all duration-300"
          >
            <User size={18} /> <span>User Dashboard</span>
          </Link>
        )}

        {/* Authentication Links */}
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="cursor-pointer flex items-center space-x-2 bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 shadow-md"
          >
            <LogOut size={18} /> <span>Logout</span>
          </button>
        ) : (
          <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-3 items-center">
            <Link
              to="/login"
              className="flex items-center space-x-2 bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 shadow-md"
            >
              <LogIn size={18} /> <span>Login</span>
            </Link>
            <Link
              to="/register"
              className="flex items-center space-x-2 bg-red-500 text-black px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 shadow-md"
            >
              <UserPlus size={18} /> <span>Register</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;