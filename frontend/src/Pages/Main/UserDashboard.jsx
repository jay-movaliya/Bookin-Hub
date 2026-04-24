import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import {
  CalendarDays,
  DollarSign,
  User,
  Edit,
  Bell,
  Hotel,
  Calendar,
  Car,
  Clock,
  MapPin,
  CreditCard,
  ShieldCheck,
  XCircle,
  CheckCircle2,
  ChevronRight,
  Navigation,
  Users,
  Bed,
  Star,
  X,
  Mail,
  Phone,
  ArrowRight,
  Camera,
} from "lucide-react";
import { BASE_URL } from "../../../config";



const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);

  const [hotels, setHotels] = useState([]);
  const [id, setuserId] = useState(null);
  const [cabs, setCabs] = useState([]);
  const [vehicleDetails, setVehicleDetails] = useState({
    rider_id: "",
    perKm_price: 0,
  });
  const [userDetails, setUserDetails] = useState({
    id: "",
    name: "",
    email: "",
    contact: "",
  });
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [key, setkey] = useState();
  const [selectedHotelBooking, setSelectedHotelBooking] = useState(null);
  const [activeTab, setActiveTab] = useState("cabs");
  const [user, setUser] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    profilePic: "",
  });

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
  }, []);

  const [editedUser, setEditedUser] = useState(user);

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (id, price, from, to) => {
    try {
      const razorpayLoaded = await initializeRazorpay();
      if (!razorpayLoaded) throw new Error("Razorpay SDK failed to load");

      const orderResponse = await axios.post(`${BASE_URL}/create-order`, {
        amount: price * 100,
      });

      if (!orderResponse.data.success) throw new Error("Order creation failed");

      const options = {
        key: "rzp_test_Y8cefy5g53d5Se",
        amount: orderResponse.data.order.amount,
        currency: "INR",
        order_id: orderResponse.data.order.id,
        name: "Booking Hub",
        description: `Booking for ${from} to ${to}`,
        prefill: userDetails,
        theme: { color: "#3399cc" },
        handler: async (response) => {
          try {
            const verificationResponse = await axios.post(
              `${BASE_URL}/verify-payment`,
              response
            );

            if (verificationResponse.data.success) {
              await axios.patch(`${BASE_URL}/update-payment-status/${id}`);

              try {
                await fetch(`${BASE_URL}/api/Rv/booking/paidbooking/${id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ payment_status: "paid" }),
                });
              } catch (error) {
                console.error("Error updating booking:", error);
              }

              navigate(`/userdashboard`, {
                state: { booking: bookingData },
              });
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            console.error("Verification error:", error);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  const dummyNotifications = [
    {
      id: 1,
      message: "Your cab booking has been confirmed",
      type: "success",
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: 2,
      message: "Special discount on hotel bookings this weekend",
      type: "info",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: 3,
      message: "Payment failed for your recent booking",
      type: "error",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      id: 4,
      message: "Your hotel booking is pending confirmation",
      type: "warning",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    },
  ];

  const dummyTransactions = [
    {
      id: 1,
      amount: 1250,
      status: "Paid",
      paymentMethod: "Credit Card",
      date: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: 2,
      amount: 3200,
      status: "Paid",
      paymentMethod: "UPI",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      id: 3,
      amount: 1800,
      status: "Failed",
      paymentMethod: "Debit Card",
      date: new Date(Date.now() - 1000 * 60 * 60 * 48),
    },
    {
      id: 4,
      amount: 2750,
      status: "Pending",
      paymentMethod: "Net Banking",
      date: new Date(Date.now() - 1000 * 60 * 60 * 72),
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setkey(decoded.user.key);
        setuserId(decoded.user._id);
        setUser({
          name: decoded.user.name || "User",
          email: decoded.user.email || "",
          profilePic: decoded.user.profilePic || "",
        });
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }

    setNotifications(dummyNotifications);
    setTransactions(dummyTransactions);

  }, []);

  useEffect(() => {
    if (id) {
      getCabBookings();
      getHotelBookings();
    }
  }, [id]);

  const getCabBookings = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/user/getbooking/${id}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setCabs(data);
      }
    } catch (error) {
      console.error("Error fetching cab bookings:", error);
    }
  };

  const getHotelBookings = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/booking/hotel`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        setHotels(data.data);
      }
    } catch (error) {
      console.error("Error fetching hotel bookings:", error);
    }
  };

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
      const res = await fetch(`${BASE_URL}/api/booking/cancel`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId: selectedHotelBooking._id }),
      });

      if (res.ok) {
        setHotels(
          hotels.map((booking) =>
            booking._id === selectedHotelBooking._id
              ? { ...booking, bookingStatus: "Cancelled" }
              : booking
          )
        );
        setShowHotelModal(false);
        setNotifications([
          {
            id: Date.now(),
            message: "Hotel booking cancelled successfully",
            type: "success",
            createdAt: new Date(),
          },
          ...notifications,
        ]);
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "confirmed":
      case "paid":
        return <CheckCircle2 className="text-green-500" size={14} />;
      case "pending":
        return <Clock className="text-yellow-500" size={14} />;
      case "cancelled":
      case "failed":
        return <XCircle className="text-red-500" size={14} />;
      default:
        return <ShieldCheck className="text-blue-500" size={14} />;
    }
  };

  const NotificationCard = ({ notification }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01, x: 5 }}
      className={`p-4 rounded-2xl flex items-start gap-4 mb-3 transition-all bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] relative overflow-hidden`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${notification.type === "success"
        ? "bg-green-500"
        : notification.type === "warning"
          ? "bg-yellow-500"
          : notification.type === "error"
            ? "bg-red-500"
            : "bg-blue-500"
        }`}></div>
      <div
        className={`p-2.5 rounded-xl shrink-0 ${notification.type === "success"
          ? "bg-green-50 text-green-600"
          : notification.type === "warning"
            ? "bg-yellow-50 text-yellow-600"
            : notification.type === "error"
              ? "bg-red-50 text-red-600"
              : "bg-blue-50 text-blue-600"
          }`}
      >
        <Bell size={18} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900 leading-tight">
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 mt-1.5 font-medium">
          {new Date(notification.createdAt).toLocaleString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
          })}
        </p>
      </div>
    </motion.div>
  );

  const TransactionCard = ({ transaction }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01, x: 5 }}
      className="p-4 bg-white rounded-2xl border border-gray-100 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] group mb-3"
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 group-hover:text-gray-600 group-hover:bg-gray-100 transition-colors">
            {getStatusIcon(transaction.status)}
          </div>
          <div>
            <span className="block font-bold text-gray-900 text-base">₹{transaction.amount}</span>
            <span className="text-xs text-gray-400 font-medium">{transaction.paymentMethod}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5">
            <div className={`w-2 h-2 rounded-full ${transaction.status === "Paid"
              ? "bg-green-500"
              : transaction.status === "Failed"
                ? "bg-red-500"
                : "bg-yellow-500"
              }`}></div>
            <span
              className={`text-xs font-bold ${transaction.status === "Paid"
                ? "text-green-600"
                : transaction.status === "Failed"
                  ? "text-red-600"
                  : "text-yellow-600"
                }`}
            >
              {transaction.status}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 font-medium">
            {new Date(transaction.date).toLocaleDateString()}
          </p>
        </div>
      </div>
    </motion.div>
  );

  const CompactCabCard = ({ booking, onViewDetails }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group relative overflow-hidden rounded-[1.5rem] bg-white border border-gray-100/80 hover:border-red-100 transition-all duration-500 shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
    >
      <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 transform group-hover:rotate-12 group-hover:scale-125">
        <Car size={100} className="text-gray-900" />
      </div>

      <div className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100 group-hover:bg-red-500 group-hover:text-white transition-all duration-300 shadow-sm">
              <Car className="text-red-500 group-hover:text-white transition-colors" size={26} />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-gray-900 mb-1 line-clamp-1">
                {booking.vehicle_id?.vehicle_type || "Premium Cab"}
              </h3>
              <p className="text-xs text-gray-500 flex items-center gap-1.5 font-medium bg-gray-50 w-fit px-2 py-1 rounded-md">
                <MapPin size={12} className="text-red-500" />
                <span className="max-w-[150px] truncate">
                  {booking.source_location?.address?.split(",")[0] || "Unknown"}
                </span>
                <span className="text-gray-300">→</span>
                <span className="max-w-[150px] truncate">
                  {booking.destination_location?.address?.split(",")[0] || "Unknown"}
                </span>
              </p>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${booking.status === "completed"
              ? "bg-green-50 border-green-200 text-green-600"
              : booking.status === "pending"
                ? "bg-yellow-50 border-yellow-200 text-yellow-600"
                : "bg-blue-50 border-blue-200 text-blue-600"
              }`}
          >
            {booking.status}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-50/80 rounded-xl p-3 flex items-center gap-3 border border-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all">
            <div className="p-1.5 bg-white rounded-lg shadow-sm text-gray-400">
              <Calendar size={14} />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {booking.pickup_time
                ? new Date(booking.pickup_time).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
          <div className="bg-gray-50/80 rounded-xl p-3 flex items-center gap-3 border border-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all">
            <div className="p-1.5 bg-white rounded-lg shadow-sm text-green-500">
              <DollarSign size={14} />
            </div>
            <span className="text-base font-bold text-gray-900">
              ₹{booking.vehicle_id?.perKm_price * 8 || "0"}
            </span>
          </div>
        </div>

        <div className="pt-2">
          {booking.status === "accepted" &&
            booking.payment_status === "unpaid" ? (
            <button
              className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2 group/btn"
              onClick={() =>
                handlePayment(
                  booking._id,
                  booking.vehicle_id.perKm_price,
                  booking.source_location.address,
                  booking.destination_location.address
                )
              }
            >
              Pay Now <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          ) : (
            <div className="w-full flex justify-between items-center px-2 py-2 bg-gray-50/50 rounded-xl border border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${booking.payment_status === "paid" ? "bg-green-500" : "bg-yellow-500"}`}></div>
                <span className={`text-xs font-bold ${booking.payment_status === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                  {booking.payment_status === "paid"
                    ? "Paid Online"
                    : "Pending"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const CompactHotelCard = ({ booking, onViewDetails }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group relative overflow-hidden rounded-[1.5rem] bg-white border border-gray-100/80 hover:border-red-100 transition-all duration-500 shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
    >
      <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 transform group-hover:-rotate-12 group-hover:scale-125">
        <Hotel size={100} className="text-gray-900" />
      </div>
      <div className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100 group-hover:bg-red-500 group-hover:text-white transition-all duration-300 shadow-sm">
              <Hotel className="text-red-500 group-hover:text-white transition-colors" size={26} />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-gray-900 mb-1 line-clamp-1">
                {booking.hotel?.name || "Premium Hotel"}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={`${i < (booking.hotel?.rating || 3)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-200"
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${booking.bookingStatus === "confirmed" ||
              booking.bookingStatus === "completed"
              ? "bg-green-50 border-green-200 text-green-600"
              : booking.bookingStatus === "cancelled"
                ? "bg-red-50 border-red-200 text-red-600"
                : "bg-blue-50 border-blue-200 text-blue-600"
              }`}
          >
            {booking.bookingStatus || "Pending"}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-50/80 rounded-xl p-3 flex items-center gap-3 border border-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all">
            <div className="p-1.5 bg-white rounded-lg shadow-sm text-gray-400">
              <Bed size={14} />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {booking.room?.room_type || "Deluxe"}
            </span>
          </div>
          <div className="bg-gray-50/80 rounded-xl p-3 flex items-center gap-3 border border-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all">
            <div className="p-1.5 bg-white rounded-lg shadow-sm text-gray-400">
              <span className="text-[10px] font-bold">INR</span>
            </div>
            <span className="text-base font-bold text-gray-900">
              ₹{booking.totalAmount || "0"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
            <Calendar size={14} className="text-gray-400" />
            <span>
              {new Date(booking.bookingStartDate).toLocaleDateString()} -{" "}
              {new Date(booking.bookingEndDate).toLocaleDateString()}
            </span>
          </div>
          <button
            onClick={onViewDetails}
            className="px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 transition-all flex items-center gap-2 group/btn"
          >
            Details <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );



  const EmptyState = ({ icon, message, actionText, action }) => (
    <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 backdrop-blur-sm">
      <div className="mx-auto text-gray-400 mb-6 bg-white w-24 h-24 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="scale-125">{icon}</div>
      </div>
      <p className="text-gray-600 mb-8 text-xl font-medium">{message}</p>
      <button
        onClick={action}
        className="px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition shadow-lg hover:shadow-xl font-bold text-sm tracking-wide transform hover:-translate-y-1 active:scale-95 duration-200"
      >
        {actionText}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-800 p-4 md:p-8 font-[Poppins] selection:bg-red-500/30 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-200/20 rounded-full blur-[120px] mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-200/20 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

      {/* Header with Key removed or moved */}
      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative mb-8 md:mb-12 rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-500/5 to-purple-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1.5 bg-gradient-to-br from-red-500 to-purple-600 shadow-lg shadow-red-500/20">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white">
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <User size={64} className="text-gray-300" />
                )}
              </div>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="absolute bottom-2 right-2 p-2.5 bg-white text-gray-700 rounded-full hover:text-red-600 transition shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-100 group-hover:scale-110 duration-300"
            >
              <Edit size={16} />
            </button>
          </div>

          <div className="text-center md:text-left flex-1 space-y-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 mb-2 tracking-tight">
                {user.name}
              </h1>
              <p className="text-gray-500 font-medium">Welcome back to your travel hub</p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm">
              <span className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm text-gray-600 font-medium hover:shadow-md transition-shadow cursor-default">
                <MapPin size={15} className="text-red-500" /> India
              </span>
              <span className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm text-gray-600 font-medium hover:shadow-md transition-shadow cursor-default">
                <Mail size={15} className="text-red-500" /> {user.email}
              </span>
              <span className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm text-gray-600 font-medium hover:shadow-md transition-shadow cursor-default">
                <Phone size={15} className="text-red-500" />{" "}
                {userDetails.contact || "N/A"}
              </span>
            </div>
          </div>

          <div className="flex gap-6 md:gap-10 bg-white/50 p-6 rounded-3xl border border-white/60 shadow-sm backdrop-blur-sm">
            <div className="text-center px-4">
              <p className="text-4xl font-black text-gray-900 tracking-tight">
                {cabs.length + hotels.length}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">
                Bookings
              </p>
            </div>
            <div className="w-px bg-gray-200/60 my-2"></div>
            <div className="text-center px-4">
              <p className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full mb-2 inline-block">Active</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                Status
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Notifications and Transactions */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white/60 backdrop-blur-md rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-gray-100/50 flex justify-between items-center bg-white/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-xl text-red-500">
                  <Bell size={20} />
                </div>
                Notifications
              </h2>
              <span className="text-xs font-bold text-gray-500 bg-gray-100/80 px-3 py-1.5 rounded-full border border-gray-200/50">
                Recent
              </span>
            </div>
            <div className="p-5">
              {notifications.slice(0, 4).map((notif) => (
                <NotificationCard key={notif.id} notification={notif} />
              ))}
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-gray-100/50 flex justify-between items-center bg-white/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-xl text-red-500">
                  <CreditCard size={20} />
                </div>
                Payment History
              </h2>
              <span className="text-xs font-bold text-gray-500 bg-gray-100/80 px-3 py-1.5 rounded-full border border-gray-200/50">
                Last 4
              </span>
            </div>
            <div className="p-5">
              {transactions.slice(0, 4).map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Bookings */}
        <div className="lg:col-span-2">
          <div className="bg-white/60 backdrop-blur-md rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 min-h-[600px] flex flex-col">
            <div className="flex border-b border-gray-100/50 p-2">
              <button
                className={`flex-1 py-4 font-bold flex items-center justify-center gap-2.5 transition-all relative rounded-xl ${activeTab === "cabs"
                  ? "text-red-600 bg-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                  }`}
                onClick={() => setActiveTab("cabs")}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${activeTab === 'cabs' ? 'bg-red-50 text-red-500' : 'bg-transparent'}`}>
                  <Car size={18} />
                </div>
                Cab
              </button>
              <button
                className={`flex-1 py-4 font-bold flex items-center justify-center gap-2.5 transition-all relative rounded-xl ${activeTab === "hotels"
                  ? "text-red-600 bg-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                  }`}
                onClick={() => setActiveTab("hotels")}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${activeTab === 'hotels' ? 'bg-red-50 text-red-500' : 'bg-transparent'}`}>
                  <Hotel size={18} />
                </div>
                Hotel
              </button>
            </div>

            <div className="p-6">
              {activeTab === "cabs" ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="text-red-500">Cab</span> Bookings
                  </h2>
                  {cabs.length === 0 ? (
                    <EmptyState
                      icon={<Car size={48} />}
                      message="No cab bookings yet"
                      actionText="Book a Cab Now"
                      action={() => (window.location.href = "/booking/cab")}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {cabs.map((booking) => (
                        <CompactCabCard
                          key={booking._id}
                          booking={booking}
                          onViewDetails={() => { }}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : activeTab === "hotels" ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="text-red-500">Hotel</span> Bookings
                  </h2>
                  {hotels.length === 0 ? (
                    <EmptyState
                      icon={<Hotel size={48} />}
                      message="No hotel bookings yet"
                      actionText="Book a Hotel Now"
                      action={() => (window.location.href = "/booking/hotel")}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {hotels.map((booking) => (
                        <CompactHotelCard
                          key={booking._id}
                          booking={booking}
                          onViewDetails={() => handleViewHotelBooking(booking)}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-[2rem] p-8 w-full max-w-lg border border-white/20 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Profile</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold text-sm mb-2 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={20} />
                    <input
                      type="text"
                      value={editedUser.name}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, name: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-gray-900 placeholder-gray-400 outline-none transition-all font-medium"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold text-sm mb-2 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={20} />
                    <input
                      type="email"
                      value={editedUser.email}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, email: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-gray-900 placeholder-gray-400 outline-none transition-all font-medium"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold text-sm mb-2 ml-1">
                    Profile Picture URL
                  </label>
                  <div className="relative group">
                    <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={20} />
                    <input
                      type="text"
                      value={editedUser.profilePic}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, profilePic: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-gray-900 placeholder-gray-400 outline-none transition-all font-medium"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-10">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition font-bold text-sm tracking-wide"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProfileUpdate}
                  className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all font-bold text-sm tracking-wide transform hover:-translate-y-0.5"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Hotel Booking Details Modal */}
      {showHotelModal && selectedHotelBooking && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-md z-50 p-4 transition-all">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[2rem] p-0 shadow-2xl max-w-4xl w-full border border-gray-100 max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
              <div>
                <h2 className="text-3xl font-black text-gray-900 mb-1">
                  Booking Details
                </h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <p className="text-gray-500 font-medium text-sm">Hotel Reservation</p>
                </div>
              </div>
              <button
                onClick={() => setShowHotelModal(false)}
                className="p-2.5 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-red-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 md:p-8 bg-white/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Hotel Information */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-xl text-red-500">
                      <Hotel size={20} />
                    </div>
                    Hotel Information
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1.5">Hotel Name</p>
                      <p className="text-gray-900 font-extrabold text-xl leading-tight">
                        {selectedHotelBooking.hotel?.name || "Premium Hotel"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1.5">Location</p>
                      <p className="text-gray-700 font-medium flex items-center gap-2 bg-gray-50 w-fit px-3 py-1.5 rounded-lg border border-gray-100 text-sm">
                        <MapPin size={16} className="text-red-500" />
                        {selectedHotelBooking.hotel?.address?.area ||
                          "City Center"}
                        ,{" "}
                        {selectedHotelBooking.hotel?.address?.city || "City"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1.5">Rating</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            className={`${i < (selectedHotelBooking.hotel?.rating || 3)
                              ? "text-yellow-400 fill-yellow-400 drop-shadow-sm"
                              : "text-gray-200"
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Summary */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-xl text-red-500">
                      <CalendarDays size={20} />
                    </div>
                    Booking Summary
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1.5">Booking ID</p>
                      <p className="text-gray-600 font-bold font-mono tracking-wider text-sm bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 inline-block">
                        #{selectedHotelBooking._id?.slice(-8).toUpperCase() || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1.5">Status</p>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${selectedHotelBooking.bookingStatus === 'confirmed' ? 'bg-green-50 border-green-200 text-green-700' :
                        selectedHotelBooking.bookingStatus === 'cancelled' ? 'bg-red-50 border-red-200 text-red-700' :
                          'bg-yellow-50 border-yellow-200 text-yellow-700'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${selectedHotelBooking.bookingStatus === 'confirmed' ? 'bg-green-500' :
                          selectedHotelBooking.bookingStatus === 'cancelled' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`}></div>
                        <span className="font-bold text-xs uppercase tracking-wider">
                          {selectedHotelBooking.bookingStatus || "Pending"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1.5">Booking Date</p>
                      <p className="text-gray-900 font-bold">
                        {new Date(
                          selectedHotelBooking.createdAt || Date.now()
                        ).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Room Details */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-xl text-red-500">
                      <Bed size={20} />
                    </div>
                    Room Details
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1.5">Room Type</p>
                      <p className="text-gray-900 font-bold text-lg">
                        {selectedHotelBooking.room?.room_type || "Deluxe Suite"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1.5">Guests</p>
                      <p className="text-gray-900 font-medium flex items-center gap-2">
                        <Users size={18} className="text-gray-400" />
                        {selectedHotelBooking.personDetails?.length || 1}{" "}
                        {selectedHotelBooking.personDetails?.length === 1
                          ? "Guest"
                          : "Guests"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Check-in</p>
                        <p className="text-gray-900 font-bold text-lg">
                          {new Date(
                            selectedHotelBooking.bookingStartDate
                          ).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                        </p>
                        <p className="text-xs text-gray-400 font-medium">
                          {selectedHotelBooking.room?.check_in || "12:00 PM"}
                        </p>
                      </div>
                      <div className="border-l border-gray-200 pl-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Check-out</p>
                        <p className="text-gray-900 font-bold text-lg">
                          {new Date(
                            selectedHotelBooking.bookingEndDate
                          ).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                        </p>
                        <p className="text-xs text-gray-400 font-medium">
                          {selectedHotelBooking.room?.check_out || "11:00 AM"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-xl text-red-500">
                      <CreditCard size={20} />
                    </div>
                    Payment Details
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1.5">Total Amount</p>
                      <p className="text-gray-900 font-black text-3xl tracking-tight">
                        ₹{selectedHotelBooking.totalAmount || "0"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Method</p>
                        <p className="text-gray-900 font-bold text-sm">
                          {selectedHotelBooking.paymentMethod || "Credit Card"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Status</p>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${selectedHotelBooking.paymentStatus === 'paid' ? 'bg-green-100 border-green-200 text-green-700' : 'bg-yellow-100 border-yellow-200 text-yellow-700'
                          }`}>
                          {selectedHotelBooking.paymentStatus || "Paid"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest Details */}
              {selectedHotelBooking.personDetails?.length > 0 && (
                <div className="mt-8 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-xl text-red-500">
                      <Users size={20} />
                    </div>
                    Guest Details
                  </h3>
                  <div className="overflow-hidden rounded-2xl border border-gray-100">
                    <table className="w-full">
                      <thead className="bg-gray-50/80">
                        <tr className="text-left">
                          <th className="py-4 px-6 text-gray-400 text-xs font-bold uppercase tracking-wider">Name</th>
                          <th className="py-4 px-6 text-gray-400 text-xs font-bold uppercase tracking-wider">Age</th>
                          <th className="py-4 px-6 text-gray-400 text-xs font-bold uppercase tracking-wider">Aadhar No.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedHotelBooking.personDetails.map((guest, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="py-4 px-6 text-gray-900 font-bold">
                              {guest.name || "N/A"}
                            </td>
                            <td className="py-4 px-6 text-gray-600 font-medium">
                              {guest.age || "N/A"}
                            </td>
                            <td className="py-4 px-6 text-gray-500 font-mono text-sm">
                              {guest.aadhar || "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4">
              <button
                onClick={() => setShowHotelModal(false)}
                className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-white hover:border-gray-300 transition font-bold text-sm tracking-wide shadow-sm"
              >
                Close Details
              </button>
              {selectedHotelBooking.bookingStatus?.toLowerCase() !==
                "cancelled" &&
                selectedHotelBooking.bookingStatus?.toLowerCase() !==
                "completed" && (
                  <button
                    onClick={handleCancelBooking}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-500 transition shadow-lg shadow-red-500/20 font-bold text-sm tracking-wide flex items-center gap-2 transform hover:-translate-y-0.5"
                  >
                    <XCircle size={18} /> Cancel Booking
                  </button>
                )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;