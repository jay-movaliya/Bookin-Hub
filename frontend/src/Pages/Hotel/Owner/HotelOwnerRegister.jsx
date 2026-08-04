import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { User, Mail, Lock, Phone, Building, ClipboardList, Hotel, Users, ShieldCheck, CheckCircle } from "lucide-react";
import Swal from "sweetalert2";

const HotelOwnerRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: User Registration, 2: OTP Verification, 3: Business Details

  // User details state
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    contact: "",
    gender: "",
    password: "",
  });

  // OTP state
  const [otp, setOtp] = useState("");

  // Business details state
  const [businessData, setBusinessData] = useState({
    businessName: "",
    businessRegNo: "",
  });

  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUserChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleBusinessChange = (e) => {
    setBusinessData({ ...businessData, [e.target.name]: e.target.value });
  };

  // STEP 1: Register User Account
  const handleUserRegister = async (e) => {
    e.preventDefault();
    const { name, email, contact, gender, password } = userData;

    if (!name || !email || !contact || !gender || !password) {
      setError("All user registration fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/register`,
        {
          name,
          email,
          contact: Number(contact),
          gender,
          password,
          type: "hotelOwner",
        }
      );

      if (response.data.statusCode === 201) {
        Swal.fire({
          icon: "success",
          title: "User Account Created",
          text: "An OTP has been sent to your email. Please verify to continue.",
          confirmButtonColor: "#ef4444",
        });
        setStep(2);
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Error occurred during user registration";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/verify-otp`,
        {
          email: userData.email,
          otp: Number(otp),
        }
      );

      if (response.data.statusCode === 200) {
        const token = response.data.data;
        Cookies.set("token", token);
        localStorage.setItem("token", token);

        try {
          const decoded = jwtDecode(token);
          const uid = decoded.user?._id || decoded._id;
          setUserId(uid);
        } catch (err) {
          console.error("Token decode error:", err);
        }

        Swal.fire({
          icon: "success",
          title: "OTP Verified!",
          text: "Please now complete your Hotel Owner business details.",
          confirmButtonColor: "#ef4444",
        });

        setStep(3);
      } else {
        setError(response.data.message || "Invalid OTP code");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Error verifying OTP";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Complete Hotel Owner Business Registration
  const handleBusinessRegister = async (e) => {
    e.preventDefault();
    const { businessName, businessRegNo } = businessData;

    if (!businessName || !businessRegNo) {
      setError("All business details fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/hotel/owner/register`,
        {
          userId,
          email: userData.email,
          businessName,
          businessRegNo,
        }
      );

      if (response.data.statusCode === 201) {
        if (response.data.data?.token) {
          const newToken = response.data.data.token;
          Cookies.set("token", newToken);
          localStorage.setItem("token", newToken);
        }

        Swal.fire({
          icon: "success",
          title: "Registration Complete!",
          text: "Your Hotel Owner account has been created. Awaiting admin approval.",
          confirmButtonColor: "#ef4444",
        }).then(() => {
          window.location.href = "/hotelowner/dashboard";
        });
      } else {
        setError(response.data.message || "Failed to complete business registration");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Error submitting business details";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100 font-[Poppins] p-4 relative overflow-hidden py-10">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-white/70 backdrop-blur-xl border border-white/50 p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            Partner with Us
          </h1>
          <p className="text-gray-500 text-sm">Register your hotel & manage bookings effortlessly.</p>

          {/* Stepper Header */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${step >= 1 ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600"}`}>
              <span>1</span> User Info
            </div>
            <div className="w-8 h-[2px] bg-gray-300"></div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${step >= 2 ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600"}`}>
              <span>2</span> OTP Verify
            </div>
            <div className="w-8 h-[2px] bg-gray-300"></div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${step >= 3 ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600"}`}>
              <span>3</span> Business Details
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm font-medium py-2 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {/* STEP 1: USER ACCOUNT REGISTRATION */}
        {step === 1 && (
          <form onSubmit={handleUserRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-gray-700 font-medium text-sm ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={20} className="text-gray-400 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter Full Name"
                  value={userData.name}
                  onChange={handleUserChange}
                  className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder-gray-400"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-gray-700 font-medium text-sm ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-gray-400 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={userData.email}
                  onChange={handleUserChange}
                  className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder-gray-400"
                />
              </div>
            </div>

            {/* Phone Number / Contact */}
            <div className="space-y-2">
              <label className="text-gray-700 font-medium text-sm ml-1">Phone Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={20} className="text-gray-400 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input
                  type="number"
                  name="contact"
                  placeholder="1234567890"
                  value={userData.contact}
                  onChange={handleUserChange}
                  className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder-gray-400 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="text-gray-700 font-medium text-sm ml-1">Gender</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users size={20} className="text-gray-400 group-focus-within:text-red-500 transition-colors" />
                </div>
                <select
                  name="gender"
                  value={userData.gender}
                  onChange={handleUserChange}
                  className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all appearance-none"
                >
                  <option value="" disabled className="text-gray-400">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-gray-700 font-medium text-sm ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={userData.password}
                  onChange={handleUserChange}
                  className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder-gray-400"
                />
              </div>
            </div>

            <div className="md:col-span-2 mt-4">
              <button
                type="submit"
                disabled={loading || !userData.name || !userData.email || !userData.contact || !userData.gender || !userData.password}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span>{loading ? "Creating User..." : "Next: Verify Email OTP"}</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="text-center">
              <ShieldCheck size={48} className="mx-auto text-red-500 mb-2" />
              <p className="text-sm text-gray-600">Enter the 4-digit code sent to <span className="font-semibold text-gray-900">{userData.email}</span></p>
            </div>

            <div className="space-y-2 max-w-xs mx-auto">
              <input
                type="text"
                placeholder="Enter 4-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full text-center text-2xl font-bold tracking-widest bg-gray-50/50 text-gray-900 border border-gray-300 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !otp}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span>{loading ? "Verifying..." : "Verify OTP & Continue"}</span>
            </button>
          </form>
        )}

        {/* STEP 3: HOTEL OWNER BUSINESS DETAILS */}
        {step === 3 && (
          <form onSubmit={handleBusinessRegister} className="space-y-6">
            <div className="text-center mb-4">
              <CheckCircle size={40} className="mx-auto text-green-500 mb-2" />
              <p className="text-sm text-gray-600">Account verified! Now enter your hotel business registration info.</p>
            </div>

            {/* Business Name */}
            <div className="space-y-2">
              <label className="text-gray-700 font-medium text-sm ml-1">Business Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building size={20} className="text-gray-400 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input
                  type="text"
                  name="businessName"
                  placeholder="Enter Business Name"
                  value={businessData.businessName}
                  onChange={handleBusinessChange}
                  className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder-gray-400"
                />
              </div>
            </div>

            {/* Business Registration Number */}
            <div className="space-y-2">
              <label className="text-gray-700 font-medium text-sm ml-1">Business Reg. No.</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ClipboardList size={20} className="text-gray-400 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input
                  type="text"
                  name="businessRegNo"
                  placeholder="Registration No."
                  value={businessData.businessRegNo}
                  onChange={handleBusinessChange}
                  className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder-gray-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !businessData.businessName || !businessData.businessRegNo}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Hotel size={20} />
              <span>{loading ? "Submitting Business Details..." : "Complete Hotel Registration"}</span>
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              className="text-red-500 font-semibold cursor-pointer hover:underline"
            >
              Login here
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default HotelOwnerRegister;