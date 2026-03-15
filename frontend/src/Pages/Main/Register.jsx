import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { User, Mail, Lock, Phone, Users, UserPlus } from "lucide-react";
import Swal from "sweetalert2";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const type = "customer";
  const [error, setError] = useState("");

  const showErrorAlert = (message) => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: message,
      confirmButtonColor: "#ef4444",
    });
  };

  const showSuccessAlert = (message) => {
    Swal.fire({
      icon: "success",
      title: "Success",
      text: message,
      confirmButtonColor: "#ef4444",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !gender || !contact || !email || !password) {
      setError("All fields are required");
      showErrorAlert("All fields are required");
      return;
    }

    const userData = { name, gender, contact, email, type, password };
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/register`,
        userData
      );
      if (response.data.statusCode === 201) {
        showSuccessAlert("Registration successful! Redirecting to OTP verification...");
        setTimeout(() => {
          navigate("/otp/" + email);
        }, 1500);
      } else {
        setError(response.data.message);
        showErrorAlert(response.data.message);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error occurred during registration";
      setError(errorMessage);
      showErrorAlert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100 font-[Poppins] p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-white/70 backdrop-blur-xl border border-white/50 p-6 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md sm:max-w-lg"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            Create Account
          </h1>
          <p className="text-gray-500 text-sm">Join us and start your journey</p>
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-6 font-medium bg-red-50 py-2 rounded-lg">{error}</p>}

        <form className="space-y-5">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-gray-700 font-medium text-sm ml-1">Full Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={20} className="text-gray-400 group-focus-within:text-red-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder-gray-400 sm:text-base"
              />
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-1">
            <label className="text-gray-700 font-medium text-sm ml-1">Gender</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users size={20} className="text-gray-400 group-focus-within:text-red-500 transition-colors" />
              </div>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all sm:text-base appearance-none"
              >
                <option value="" disabled className="text-gray-400">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-1">
            <label className="text-gray-700 font-medium text-sm ml-1">Phone Number</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={20} className="text-gray-400 group-focus-within:text-red-500 transition-colors" />
              </div>
              <input
                type="number"
                placeholder="1234567890"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder-gray-400 sm:text-base appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-appearance]:textfield"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-gray-700 font-medium text-sm ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={20} className="text-gray-400 group-focus-within:text-red-500 transition-colors" />
              </div>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder-gray-400 sm:text-base"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-gray-700 font-medium text-sm ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={20} className="text-gray-400 group-focus-within:text-red-500 transition-colors" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder-gray-400 sm:text-base"
              />
            </div>
          </div>

          {/* Register Button */}
          <button
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-4"
          >
            <UserPlus size={20} />
            <span>Create Account</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              className="text-red-500 font-semibold cursor-pointer hover:underline"
            >
              Sign In
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;