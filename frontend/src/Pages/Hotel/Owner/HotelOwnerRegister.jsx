import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { User, Mail, Lock, Building, ClipboardList, Hotel } from "lucide-react";

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
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm font-medium py-2 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                value={formData.name}
                onChange={handleChange}
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
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder-gray-400"
              />
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
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder-gray-400"
              />
            </div>
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
                value={formData.businessName}
                onChange={handleChange}
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
                value={formData.businessRegNo}
                onChange={handleChange}
                className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder-gray-400"
              />
            </div>
          </div>

          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              disabled={!formData.name || !formData.email || !formData.password || !formData.businessName || !formData.businessRegNo}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Hotel size={20} />
              <span>Complete Registration</span>
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login/hotel')}
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