import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";
import { jwtDecode } from "jwt-decode";
import {
  User,
  Edit,
  Hotel,
  ChevronRight,
  X,
  Mail,
  Phone,
  Compass,
  ArrowUpRight
} from "lucide-react";
import { BASE_URL } from "../../../config";
import Swal from "sweetalert2";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [id, setuserId] = useState(null);
  const [userDetails, setUserDetails] = useState({
    id: "",
    name: "",
    email: "",
    contact: "",
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [selectedHotelBooking, setSelectedHotelBooking] = useState(null);
  const [user, setUser] = useState({
    name: "User",
    email: "",
    profilePic: "",
  });
  const [editedUser, setEditedUser] = useState(user);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const decoded = jwtDecode(token);
        setUserDetails({
          id: decoded.user._id,
          name: decoded.user.name,
          email: decoded.user.email,
          contact: decoded.user.contact,
        });
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    initializeUser();
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setuserId(decoded.user._id);
        setUser({
          name: decoded.user.name || "User",
          email: decoded.user.email || "",
          profilePic: decoded.user.profilePic || "",
        });
        setEditedUser({
          name: decoded.user.name || "User",
          email: decoded.user.email || "",
          profilePic: decoded.user.profilePic || "",
        });
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (id) {
      const fetchUserHotels = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`${BASE_URL}/api/booking/hotel`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Authorization": token ? `Bearer ${token}` : "",
            },
          });
          if (response.ok) {
            const data = await response.json();
            setHotels(data.data || data || []);
          }
        } catch (error) {
          console.error("Error fetching user hotels:", error);
        }
      };

      fetchUserHotels();
    }
  }, [id]);

  const handleProfileUpdate = () => {
    setUser(editedUser);
    setShowEditModal(false);
  };

  const handleViewHotelBooking = (booking) => {
    setSelectedHotelBooking(booking);
    setShowHotelModal(true);
  };

  const handleCancelBooking = async () => {
    if (!selectedHotelBooking) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/booking/cancel`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ bookingId: selectedHotelBooking._id }),
      });

      if (res.ok) {
        setHotels(
          hotels.map((booking) =>
            booking._id === selectedHotelBooking._id
              ? { ...booking, bookingStatus: "cancelled" }
              : booking
          )
        );
        setShowHotelModal(false);
        Swal.fire({
          icon: "success",
          title: "Cancelled",
          text: "Hotel booking cancelled successfully",
          confirmButtonColor: "#b90538",
        });
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  const CompactHotelCard = ({ booking, onViewDetails }) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-[#b90538] flex items-center justify-center border border-rose-100 font-bold">
              <Hotel size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#131b2e]">
                {booking.hotel?.name || "Grand Hotel"}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {booking.room?.room_type || "Deluxe Suite"}
              </p>
            </div>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
              booking.bookingStatus === "confirmed" || booking.bookingStatus === "completed"
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : booking.bookingStatus === "cancelled"
                ? "bg-rose-50 text-rose-600 border border-rose-100"
                : "bg-blue-50 text-blue-600 border border-blue-100"
            }`}
          >
            {booking.bookingStatus || "Confirmed"}
          </span>
        </div>

        <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs font-medium text-slate-600 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Dates</span>
            <span className="text-slate-800 font-bold text-[11px]">
              {new Date(booking.bookingStartDate || Date.now()).toLocaleDateString()} -{" "}
              {new Date(booking.bookingEndDate || Date.now() + 86400000).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Amount</span>
            <span className="text-[#b90538] font-black text-sm">
              ₹{booking.totalAmount?.toLocaleString("en-IN") || "2,500"}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onViewDetails}
        className="w-full py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
      >
        <span>View Booking Details</span>
        <ChevronRight size={14} />
      </button>
    </motion.div>
  );

  const EmptyState = ({ icon, message, actionText, action }) => (
    <div className="text-center py-12 bg-slate-50/60 rounded-2xl border border-slate-200/80 p-6 space-y-3">
      <div className="mx-auto text-[#b90538] bg-rose-50 w-14 h-14 rounded-2xl flex items-center justify-center border border-rose-100">
        {icon}
      </div>
      <h3 className="text-base font-bold text-[#131b2e]">{message}</h3>
      <p className="text-slate-500 text-xs max-w-xs mx-auto font-medium">
        Reserve your next stay with BookinHub in just a few clicks.
      </p>
      <button
        onClick={action}
        className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full font-bold text-xs shadow-md shadow-rose-500/20 hover:opacity-90 transition-all cursor-pointer"
      >
        {actionText}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf8ff] font-['Plus_Jakarta_Sans','Inter',sans-serif] text-[#131b2e] pb-16">
      <Helmet>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" />
      </Helmet>

      {/* Top Header */}
      <header className="min-h-[72px] py-3 px-4 sm:px-6 md:px-10 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-30 shadow-xs flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-xl md:text-2xl font-extrabold text-[#131b2e] leading-tight truncate">
            Welcome Back, <span className="text-[#b90538]">{user.name}</span>
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
            Manage your hotel stays and account profile
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate("/booking/hotel")}
            className="bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-5 py-2 rounded-full shadow-md shadow-rose-500/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Compass size={15} />
            <span>Book Hotel</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="p-6 md:p-10 max-w-[1280px] mx-auto space-y-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* User Profile Card & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Profile Info Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 p-0.5 shadow-sm">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    {user.profilePic ? (
                      <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={28} className="text-slate-400" />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#131b2e]">{user.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-[#b90538]" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-[#b90538]" />
                  <span>{userDetails.contact || "N/A"}</span>
                </div>
              </div>

              <button
                onClick={() => setShowEditModal(true)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit size={14} />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-[#131b2e] flex items-center gap-2 border-b border-slate-100 pb-3">
                <Compass size={18} className="text-[#b90538]" />
                <span>Quick Actions</span>
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => navigate("/booking/hotel")}
                  className="w-full p-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-all shadow-md flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Hotel size={16} />
                    <span>Find Hotel Stays</span>
                  </div>
                  <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Hotel Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm space-y-6">
              
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <Hotel size={20} className="text-[#b90538]" />
                <h3 className="font-extrabold text-base text-[#131b2e]">
                  Hotel Stays ({hotels.length})
                </h3>
              </div>

              <div>
                {hotels.length === 0 ? (
                  <EmptyState
                    icon={<Hotel size={32} />}
                    message="No Hotel Stays Booked Yet"
                    actionText="Explore Hotels Now"
                    action={() => navigate("/booking/hotel")}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hotels.map((booking) => (
                      <CompactHotelCard
                        key={booking._id}
                        booking={booking}
                        onViewDetails={() => handleViewHotelBooking(booking)}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-[#131b2e]">Edit Profile</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editedUser.name}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, name: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#b90538]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editedUser.email}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, email: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#b90538]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Profile Picture URL
                  </label>
                  <input
                    type="text"
                    value={editedUser.profilePic}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, profilePic: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#b90538]"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProfileUpdate}
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-500/20 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hotel Reservation Details Modal */}
      <AnimatePresence>
        {showHotelModal && selectedHotelBooking && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col space-y-6"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-[#131b2e]">Reservation Summary</h3>
                  <p className="text-xs text-slate-400">Hotel Booking Details</p>
                </div>
                <button
                  onClick={() => setShowHotelModal(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-y-auto p-6 space-y-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-extrabold text-base text-[#131b2e]">
                        {selectedHotelBooking.hotel?.name || "Grand Hotel"}
                      </p>
                      <p className="text-slate-400 mt-0.5">
                        {selectedHotelBooking.hotel?.address?.area || "City Center"}, {selectedHotelBooking.hotel?.address?.city || "City"}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                      {selectedHotelBooking.bookingStatus || "Confirmed"}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Check-In</p>
                      <p className="font-bold text-slate-800">
                        {new Date(selectedHotelBooking.bookingStartDate || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Check-Out</p>
                      <p className="font-bold text-slate-800">
                        {new Date(selectedHotelBooking.bookingEndDate || Date.now() + 86400000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-sm font-black">
                    <span>Total Amount</span>
                    <span className="text-[#b90538]">
                      ₹{selectedHotelBooking.totalAmount?.toLocaleString("en-IN") || "2,500"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <button
                  onClick={() => setShowHotelModal(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-white"
                >
                  Close
                </button>
                {selectedHotelBooking.bookingStatus?.toLowerCase() !== "cancelled" &&
                  selectedHotelBooking.bookingStatus?.toLowerCase() !== "completed" &&
                  new Date(selectedHotelBooking.bookingEndDate || Date.now()) > new Date() && (
                    <button
                      onClick={handleCancelBooking}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-600/20 cursor-pointer"
                    >
                      Cancel Reservation
                    </button>
                  )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default UserDashboard;