import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import Cookies from "js-cookie";
import { Mail, Lock, LogIn } from "lucide-react";
import Swal from "sweetalert2";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage("Both email and password are required.");
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Both email and password are required!',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/login`, { email, password });
      if (response.data.message === "Login successful") {
        Swal.fire({
          icon: 'success',
          title: 'Welcome Back!',
          text: 'You have been logged in successfully.',
          confirmButtonColor: '#ef4444',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          Cookies.set("token", response.data.data);
          localStorage.setItem("token", response.data.data);
          window.location.href = "http://localhost:5173/";
        });
      }
    } catch (error) {
      if (error.response?.data?.message === "User not verified") {
        Swal.fire({
          icon: 'info',
          title: 'Account Not Verified',
          text: 'Redirecting to verification page...',
          confirmButtonColor: '#ef4444',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          navigate("/otp/" + email);
        });
      } else {
        setErrorMessage("Enter valid credentials");
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Please check your email and password and try again.',
          confirmButtonColor: '#ef4444',
        });
      }
    }
    setErrorMessage(""); // Clear error after attempt
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
        className="relative bg-white/70 backdrop-blur-xl border border-white/50 p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-500 text-sm">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
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
                className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder-gray-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-gray-700 font-medium text-sm">Password</label>
              <span onClick={() => navigate('/forgot-password')} className="text-red-500 text-xs font-semibold cursor-pointer hover:underline">
                Forgot Password?
              </span>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={20} className="text-gray-400 group-focus-within:text-red-500 transition-colors" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder-gray-400"
              />
            </div>
          </div>

          {errorMessage && <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">{errorMessage}</p>}

          <button
            type="submit"
            disabled={!email || !password}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <LogIn size={20} />
            <span>Sign In</span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Don't have an account?{' '}
            <span
              onClick={() => navigate('/register')}
              className="text-red-500 font-semibold cursor-pointer hover:underline"
            >
              Create Account
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login; 