import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaPlane, FaHotel, FaSignOutAlt } from "react-icons/fa";

function SuperSideBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHotelActive = location.pathname.startsWith("/super/dashboard/hotel");

  const handleLogout = () => {
    // Add logout logic here (e.g., clear auth token)
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="bg-black w-64 h-screen flex flex-col justify-between shadow-lg font-poppins">
      {/* Header */}
      <div className="px-6 py-4 border-b border-red-800">
        <h2 className="text-xl font-semibold text-white">Super Admin</h2>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 pt-4">
        <ul className="space-y-2">
          <li>
            <Link
              to="/super/dashboard/hotel"
              className={`flex items-center px-6 py-3 text-white text-base font-medium transition-all duration-200 ${isHotelActive
                  ? "bg-red-600"
                  : "hover:bg-red-900 hover:shadow-md"
                }`}
              aria-label="Hotel Admin Dashboard"
            >
              <FaHotel className="mr-3 text-lg" />
              <span>Hotel Admin</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-6">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-6 py-3 text-white text-base font-medium bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Logout"
        >
          <FaSignOutAlt className="mr-3 text-lg" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default SuperSideBar;