import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import Swal from "sweetalert2";

export default function RateStay() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const ratingLabels = {
    1: "Terrible",
    2: "Poor",
    3: "Average",
    4: "Very Good",
    5: "Excellent!",
  };

  const submitRating = async () => {
    if (rating === 0) {
      Swal.fire({
        icon: "warning",
        title: "Rating Required",
        text: "Please select a star rating before submitting.",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/hotel-ratings/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookingId, rating, review }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit rating");
      }

      Swal.fire({
        icon: "success",
        title: "Thank You!",
        text: "Your feedback has been submitted successfully.",
        confirmButtonColor: "#ef4444",
        timer: 1800,
        showConfirmButton: false,
      }).then(() => {
        navigate("/rating-thank-you");
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: err.message || "Failed to submit rating",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSubmitting(false);
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
        className="relative bg-white/70 backdrop-blur-xl border border-white/50 p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md text-center"
      >
        <div className="mb-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-sm">
            <Star size={32} className="fill-red-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            Rate Your Stay
          </h1>
          <p className="text-gray-500 text-sm">
            We hope you enjoyed your stay! Please leave your rating and feedback.
          </p>
        </div>

        {/* Interactive Star Rating */}
        <div className="mb-6">
          <div className="flex justify-center items-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= (hoverRating || rating);
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform transform hover:scale-125 p-1"
                  aria-label={`Rate ${star} star`}
                >
                  <Star
                    size={36}
                    className={`transition-colors duration-200 ${
                      active
                        ? "text-amber-400 fill-amber-400 drop-shadow-md"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <p className="h-6 text-sm font-bold text-red-600">
            {ratingLabels[hoverRating || rating] || "Select Rating"}
          </p>
        </div>

        {/* Optional Review Input */}
        <div className="mb-6 text-left">
          <label
            htmlFor="review"
            className="text-gray-700 font-medium text-sm ml-1 mb-2 flex items-center gap-1.5"
          >
            <MessageSquare size={16} className="text-red-500" />
            <span>Optional Review</span>
          </label>
          <textarea
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full bg-gray-50/50 text-gray-900 border border-gray-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder-gray-400 text-sm resize-none"
            rows="4"
            placeholder="How was your room, service, or overall experience?"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={submitRating}
          disabled={rating === 0 || submitting}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Send size={18} />
          <span>{submitting ? "Submitting..." : "Submit Rating"}</span>
        </button>
      </motion.div>
    </div>
  );
}