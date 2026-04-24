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
    <div className="bg-white w-72 h-screen flex flex-col justify-between shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-slate-100 font-poppins z-20 relative">
      {/* Header */}
      <div className="px-8 py-8 border-b border-slate-100 flex items-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20 mr-3">
          <FaHotel className="text-white text-xl" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Super <span className="text-red-500">Admin</span></h2>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 pt-8 px-4">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-4">Menu</div>
        <ul className="space-y-2">
          <li>
            <Link
              to="/super/dashboard/hotel"
              className={`flex items-center px-4 py-3.5 rounded-2xl text-base font-medium transition-all duration-300 ${isHotelActive
                ? "bg-red-50 text-red-600 shadow-[0_4px_20px_rgba(239,68,68,0.1)] border border-red-100/50"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              aria-label="Hotel Admin Dashboard"
            >
              <FaHotel className={`mr-4 text-xl ${isHotelActive ? 'text-red-500' : 'text-slate-400'}`} />
              <span className={`${isHotelActive ? 'text-black' : 'text-slate-400'}`}>Hotel Admin</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-6 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-4 py-3.5 text-slate-600 text-base font-medium hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-300 group border border-transparent hover:border-red-100"
          aria-label="Logout"
        >
          <FaSignOutAlt className="mr-3 text-xl text-slate-400 group-hover:text-red-500 transition-colors" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default SuperSideBar;