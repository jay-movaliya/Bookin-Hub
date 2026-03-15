import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaHotel, FaUser, FaEnvelope, FaLock, FaBuilding, FaClipboardList } from "react-icons/fa";

const HotelOwnerRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    businessRegNo: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, businessName, businessRegNo } = formData;

    if (!name || !email || !password || !businessName || !businessRegNo) {
      setError("All fields are required");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/hotel/owner/register`,
        formData
      );

      if (response.data.statusCode === 201) {
        navigate(`/verify/${email}`); // Redirect to OTP verification page
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Error occurred during registration");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-[Poppins] p-6 py-12">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-100/50 rounded-full blur-[120px] mix-blend-multiply animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-[120px] mix-blend-multiply animate-pulse delay-700"></div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-2xl border border-slate-100 relative z-10 transition-all duration-300">

        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500 shadow-sm border border-red-100 group">
            <FaHotel className="text-4xl group-hover:scale-110 transition-transform duration-300" />
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Partner with <span className="text-red-500">Us</span>
          </h2>
          <p className="text-slate-500 font-medium">Register your hotel & manage bookings effortlessly.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm font-semibold p-4 rounded-xl mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
            <div className="relative group">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" />
              <input
                type="text"
                name="name"
                placeholder="Enter Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-slate-900 placeholder-slate-400 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
            <div className="relative group">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" />
              <input
                type="email"
                name="email"
                placeholder="Enter Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-slate-900 placeholder-slate-400 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
            <div className="relative group">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" />
              <input
                type="password"
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-slate-900 placeholder-slate-400 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Business Name */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Business Name</label>
            <div className="relative group">
              <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" />
              <input
                type="text"
                name="businessName"
                placeholder="Enter Business Name"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-slate-900 placeholder-slate-400 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Business Registration Number */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Business Reg. No.</label>
            <div className="relative group">
              <FaClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" />
              <input
                type="text"
                name="businessRegNo"
                placeholder="Registration No."
                value={formData.businessRegNo}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 text-slate-900 placeholder-slate-400 outline-none transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* Register Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 text-lg rounded-xl flex items-center justify-center gap-3 mt-8 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
        >
          <FaHotel /> <span>Complete Registration</span>
        </button>

        <p className="text-center text-slate-400 font-mediuJay$7016$m text-sm mt-6">
          Already have an account?{" "}
          <a
            href="http://localhost:5173/login/hotel"
            className="text-red-500 hover:text-red-600 font-bold hover:underline transition-all"
          >
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default HotelOwnerRegister;