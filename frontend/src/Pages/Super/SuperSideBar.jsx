import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { FaUserCheck, FaUserClock, FaHotel, FaSignOutAlt, FaBuilding, FaClock, FaMoneyBillWave } from "react-icons/fa";

function SuperSideBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isApprovedActive = location.pathname.startsWith("/super/dashboard/approved-hotel-owner");
  const isPendingActive = location.pathname.startsWith("/super/dashboard/pending-hotel-owner");
  const isApprovedHotelsActive = location.pathname.startsWith("/super/dashboard/approved-hotels");
  const isPendingHotelsActive = location.pathname.startsWith("/super/dashboard/pending-hotels");
  const isRefundPendingActive = location.pathname.startsWith("/super/dashboard/refund-pending");

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.removeItem("token");
    navigate("/");
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
      <nav className="flex-1 pt-6 px-4 space-y-6 overflow-y-auto">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-4">Owners Management</div>
          <ul className="space-y-1.5">
            <li>
              <Link
                to="/super/dashboard/approved-hotel-owner"
                className={`flex items-center px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${isApprovedActive
                  ? "bg-red-50 text-red-600 shadow-[0_4px_20px_rgba(239,68,68,0.1)] border border-red-100/50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                aria-label="Approved Hotel Owner"
              >
                <FaUserCheck className={`mr-3 text-lg ${isApprovedActive ? 'text-red-500' : 'text-slate-400'}`} />
                <span className={`${isApprovedActive ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>Approved Owners</span>
              </Link>
            </li>
            <li>
              <Link
                to="/super/dashboard/pending-hotel-owner"
                className={`flex items-center px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${isPendingActive
                  ? "bg-red-50 text-red-600 shadow-[0_4px_20px_rgba(239,68,68,0.1)] border border-red-100/50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                aria-label="Pending Hotel Owner"
              >
                <FaUserClock className={`mr-3 text-lg ${isPendingActive ? 'text-red-500' : 'text-slate-400'}`} />
                <span className={`${isPendingActive ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>Pending Owners</span>
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-4">Hotels Management</div>
          <ul className="space-y-1.5">
            <li>
              <Link
                to="/super/dashboard/approved-hotels"
                className={`flex items-center px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${isApprovedHotelsActive
                  ? "bg-red-50 text-red-600 shadow-[0_4px_20px_rgba(239,68,68,0.1)] border border-red-100/50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                aria-label="Approved Hotels"
              >
                <FaBuilding className={`mr-3 text-lg ${isApprovedHotelsActive ? 'text-red-500' : 'text-slate-400'}`} />
                <span className={`${isApprovedHotelsActive ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>Approved Hotels</span>
              </Link>
            </li>
            <li>
              <Link
                to="/super/dashboard/pending-hotels"
                className={`flex items-center px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${isPendingHotelsActive
                  ? "bg-red-50 text-red-600 shadow-[0_4px_20px_rgba(239,68,68,0.1)] border border-red-100/50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                aria-label="Pending Hotel Approvals"
              >
                <FaClock className={`mr-3 text-lg ${isPendingHotelsActive ? 'text-red-500' : 'text-slate-400'}`} />
                <span className={`${isPendingHotelsActive ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>Pending Hotels</span>
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-4">Financials</div>
          <ul className="space-y-1.5">
            <li>
              <Link
                to="/super/dashboard/refund-pending"
                className={`flex items-center px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${isRefundPendingActive
                  ? "bg-red-50 text-red-600 shadow-[0_4px_20px_rgba(239,68,68,0.1)] border border-red-100/50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                aria-label="Refund Pending"
              >
                <FaMoneyBillWave className={`mr-3 text-lg ${isRefundPendingActive ? 'text-red-500' : 'text-slate-400'}`} />
                <span className={`${isRefundPendingActive ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>Refund Pending</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-6 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-4 py-3.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-2xl transition-all duration-300 shadow-md shadow-red-600/20 cursor-pointer"
          aria-label="Logout"
        >
          <FaSignOutAlt className="mr-3 text-lg text-white" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default SuperSideBar;