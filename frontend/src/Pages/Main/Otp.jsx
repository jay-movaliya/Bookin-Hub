import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { KeyRound, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

const OtpPage = () => {
    const { email } = useParams();
    const navigate = useNavigate();
    const [otp, setOtp] = useState(['', '', '', '']);
    const [isVerified, setIsVerified] = useState(false);

    const showErrorAlert = (message) => {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: message,
            confirmButtonColor: "#ef4444",
        });
    };

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (/[^0-9]/.test(value)) return; // Allow only numeric input

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < otp.length - 1) {
            document.getElementById(`otp-input-${index + 1}`).focus();
        }
    };

    const handleSubmit = async () => {
        let otpValue = otp.join('');
        if (otpValue.length !== 4) {
            showErrorAlert('Please enter a 4-digit OTP');
            return;
        }

        otpValue = parseInt(otpValue);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/user/verify-otp`,
                { email, otp: otpValue },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.data.message === "User verified successfully") {
                Cookies.set('token', response.data.data);
                localStorage.setItem("token", response.data.data);

                setIsVerified(true);

                // Navigate to home after animation
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            } else {
                showErrorAlert(response.data.message);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error occurred during OTP verification";
            console.error('Error occurred:', error.response || error);
            showErrorAlert(errorMessage);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100 font-[Poppins] p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            <AnimatePresence mode="wait">
                {isVerified ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                        className="relative bg-white/70 backdrop-blur-xl border border-white/50 p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-sm text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-6 shadow-sm"
                        >
                            <CheckCircle size={48} />
                        </motion.div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Verified!</h2>
                        <p className="text-gray-500">Redirecting you to the home page...</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="relative bg-white/70 backdrop-blur-xl border border-white/50 p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-sm text-center"
                    >
                        <div className="mb-8">
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4 shadow-sm">
                                <KeyRound size={32} />
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Verification</h2>
                            <p className="text-gray-500 text-sm">
                                Enter the 4-digit code sent to <br />
                                <span className="font-semibold text-gray-800">{email}</span>
                            </p>
                        </div>

                        <div className="flex justify-center gap-3 mb-8">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-input-${index}`}
                                    value={digit}
                                    onChange={(e) => handleChange(e, index)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Backspace' && !digit && index > 0) {
                                            document.getElementById(`otp-input-${index - 1}`).focus();
                                        }
                                    }}
                                    maxLength={1}
                                    className="w-14 h-14 bg-gray-50 text-gray-900 text-center text-2xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all shadow-sm"
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                        >
                            <KeyRound size={20} />
                            <span>Verify Code</span>
                        </button>

                        <div className="mt-6">
                            <p className="text-gray-500 text-sm">
                                Didn't receive code?{' '}
                                <span className="text-red-500 font-semibold cursor-pointer hover:underline">
                                    Resend
                                </span>
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OtpPage;