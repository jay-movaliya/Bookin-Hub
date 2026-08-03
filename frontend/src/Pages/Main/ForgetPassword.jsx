import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import Swal from "sweetalert2";

const ForgotPasswordMain = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Find Account, 2 = Verify & Reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/forgot-password`, { email });
      if (response.status === 200) {
        setStep(2);
        setErrorMessage("");
        Swal.fire({
          icon: 'success',
          title: 'OTP Sent',
          text: 'Please check your email for the verification code.',
          confirmButtonColor: '#ef4444',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to find account or send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      setErrorMessage("Please fill all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/reset-password`, {
        email,
        otp,
        newPassword
      });
      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Password Reset',
          text: 'Your password has been successfully reset! Please login.',
          confirmButtonColor: '#ef4444',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          navigate("/login");
        });
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Invalid OTP or failed to reset password.");
    } finally {
      setIsLoading(false);
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
        className="relative bg-white/70 backdrop-blur-xl border border-white/50 p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            {step === 1 ? 'Find Account' : 'Reset Password'}
          </h1>
          <p className="text-gray-500 text-sm">
            {step === 1 ? 'Enter your email to receive an OTP' : 'Enter the OTP and your new password'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
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
                  required
                />
              </div>
            </div>

            {errorMessage && <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">{errorMessage}</p>}

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? 'Sending...' : 'Send Verification Code'}</span>
              {!isLoading && <ArrowRight size={20} />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-gray-700 font-medium text-sm ml-1">Verification Code</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ShieldCheck size={20} className="text-gray-400 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Enter 4-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder-gray-400 tracking-widest font-mono"
                  required
                  maxLength={4}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-gray-700 font-medium text-sm ml-1">New Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder-gray-400"
                  required
                />
              </div>
            </div>

            {errorMessage && <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">{errorMessage}</p>}

            <button
              type="submit"
              disabled={isLoading || !otp || !newPassword}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Lock size={20} />
              <span>{isLoading ? 'Resetting...' : 'Reset Password'}</span>
            </button>
            <button
              onClick={() => {
                setStep(1);
                setErrorMessage("");
              }}
              type="button"
              className="w-full text-gray-500 text-sm mt-4 hover:text-red-500 hover:underline transition-colors"
            >
              Back to Email Input
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Remembered your password?{' '}
            <span
              onClick={() => navigate('/login')}
              className="text-red-500 font-semibold cursor-pointer hover:underline"
            >
              Back to Sign In
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordMain;
