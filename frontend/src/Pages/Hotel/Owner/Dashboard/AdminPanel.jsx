import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { Hotel, Bed, LogOut, Menu, BadgeCheck, CalendarDays, Sparkles } from "lucide-react";
import HotelDashboard from "./HotelDashboard.jsx";
import RoomDashboard from "./RoomDashboard.jsx";
import HotelBookingManagement from "./HotelBooking.jsx";
import HotelRatingManagement from "./HotelRatings.jsx";

const AdminPanel = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.removeItem("token");
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const menuItems = [
    { name: "Hotels", path: "/hotelowner/dashboard/hotel", icon: Hotel },
    { name: "Rooms", path: "/hotelowner/dashboard/room", icon: Bed },
    { name: "Bookings", path: "/hotelowner/dashboard/bookings", icon: CalendarDays },
    { name: "Reviews", path: "/hotelowner/dashboard/ratings", icon: BadgeCheck },
  ];

  useEffect(() => {
    if (location.pathname === "/hotelowner/dashboard" || location.pathname === "/hotelowner/dashboard/") {
      navigate("/hotelowner/dashboard/hotel", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="flex h-screen w-screen bg-[#faf8ff] font-['Plus_Jakarta_Sans','Inter',sans-serif] text-slate-800 overflow-hidden">
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-rose-600 text-white rounded-xl shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar Navigation */}
      <aside
        ref={sidebarRef}
        className={`w-64 bg-white/80 backdrop-blur-2xl border-r border-slate-200/80 flex flex-col shadow-xs transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative h-full z-40`}
      >
        {/* Brand Logo */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white font-black shadow-md shadow-rose-500/20">
            <Hotel size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-tight">
              Bookin<span className="text-rose-600">-Hub</span>
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Owner Portal</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-grow p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  handleLinkClick();
                }}
                className={`w-full flex items-center px-4 py-3 rounded-2xl text-xs transition-all cursor-pointer ${
                  isActive
                    ? "bg-rose-500/10 text-rose-600 border border-rose-500/20 font-extrabold shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 font-bold"
                }`}
              >
                <Icon className={`mr-3 ${isActive ? "text-rose-600" : "text-slate-400"}`} size={18} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer"
          >
            <LogOut className="mr-2" size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewer */}
      <main className="flex-grow bg-[#faf8ff] overflow-y-auto h-full">
        {location.pathname === "/hotelowner/dashboard/room" ? (
          <RoomDashboard />
        ) : location.pathname === "/hotelowner/dashboard/bookings" ? (
          <HotelBookingManagement />
        ) : location.pathname === "/hotelowner/dashboard/ratings" ? (
          <HotelRatingManagement />
        ) : (
          <HotelDashboard />
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
