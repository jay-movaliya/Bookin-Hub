import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaKey } from "react-icons/fa";

const VerifyHotelOwnerOtp = () => {
  const { email } = useParams(); // Get email from URL params
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleOtpSubmit = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== 4) {
      setError("Please enter a 4-digit OTP");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/hotel/owner/verify-otp`,
        { email, otp: parseInt(otpValue) }
      );

      if (response.data.message === "Hotel Owner verified successfully") {
        alert("OTP Verified Successfully!");
        navigate("/dashboard"); // Redirect to dashboard after success
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error.response || error);
      setError("Invalid OTP, please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-[Poppins] p-6">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-[120px] mix-blend-multiply animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-100/50 rounded-full blur-[120px] mix-blend-multiply animate-pulse delay-700"></div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-md border border-slate-100 relative z-10 text-center">

        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500 shadow-sm border border-red-100">
          <FaKey className="text-3xl" />
        </div>

        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">Verification</h2>
        <p className="text-slate-500 font-medium mb-8">Enter the 4-digit code sent to <br /><span className="text-slate-900 font-bold">{email}</span></p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm font-semibold p-3 rounded-xl mb-6 border border-red-100">
            {error}
          </div>
        )}

        <div className="flex justify-center gap-4 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              value={digit}
              onChange={(e) => handleOtpChange(e, index)}
              maxLength={1}
              className="w-16 h-16 bg-slate-50 text-slate-900 text-center text-3xl font-bold border-2 border-slate-200 rounded-2xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all shadow-sm"
            />
          ))}
        </div>

        <button
          onClick={handleOtpSubmit}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 text-lg rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
        >
          <FaKey /> <span>Verify Account</span>
        </button>

        <p className="text-slate-400 text-sm font-medium mt-6">
          Didn't receive the code? <span className="text-red-500 font-bold cursor-pointer hover:underline">Resend</span>
        </p>
      </div>
    </div>
  );
};

export default VerifyHotelOwnerOtp;
