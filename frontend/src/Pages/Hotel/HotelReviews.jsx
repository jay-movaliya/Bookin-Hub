import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, CheckCircle, BedDouble, MapPin, CalendarDays, User, Mail, CreditCard 
} from "lucide-react";

export default function HotelReviewPage() {
  const [guests, setGuests] = useState([{ id: 1, name: "", email: "", age: "" }]);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  // Function to update guest details
  const updateGuest = (id, field, value) => {
    setGuests((prevGuests) =>
      prevGuests.map((guest) =>
        guest.id === id ? { ...guest, [field]: value } : guest
      )
    );
  };

  // Function to add a new guest
  const addGuest = () => {
    setGuests([...guests, { id: Date.now(), name: "", email: "", age: "" }]);
  };

  // Function to remove a guest
  const removeGuest = (id) => {
    setGuests(guests.filter((guest) => guest.id !== id));
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-black text-white font-[Poppins] p-6">
      <div className="w-full max-w-4xl bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl shadow-xl p-6">
        
        {/* Title */}
        <h1 className="text-4xl font-extrabold text-center mb-6 text-red-500 tracking-wide">Hotel Review</h1>

        {/* Hotel Details */}
        <div className="border border-[#222] bg-[#111] p-6 rounded-xl shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-red-400 flex items-center gap-2">
            <BedDouble size={22} /> Hotel Details
          </h2>
          <div className="grid grid-cols-2 gap-6 text-lg">
            {[ 
              ["Hotel Name", "The Grand Mumbai", MapPin],
              ["Location", "Mumbai Central", MapPin],
              ["Check-in", "2025-02-20", CalendarDays],
              ["Check-out", "2025-02-25", CalendarDays],
              ["Room Type", "Deluxe Suite", BedDouble],
              ["Guests", `${guests.length} Guest(s)`, User],
              ["Status", <span className="flex items-center gap-1 text-green-400"><CheckCircle size={18} /> Confirmed</span>, CheckCircle],
              ["Amount", "₹12,500", BedDouble],
            ].map(([label, value, Icon], index) => (
              <div key={index} className="flex items-center gap-3">
                <Icon size={20} className="text-red-500" />
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">{label}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guest Details */}
        <h2 className="text-2xl font-semibold mb-4 text-red-400 flex items-center gap-2">
          <User size={22} /> Guest Details
        </h2>

        {guests.map((guest, index) => (
          <div key={guest.id} className="border border-[#222] bg-[#111] p-4 rounded-lg shadow-sm mb-4">
            <div className="flex gap-3">
              {/* Name Field */}
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={guest.name}
                  onChange={(e) => updateGuest(guest.id, "name", e.target.value)}
                  className="w-full p-3 border border-[#333] bg-[#000] text-white rounded-md placeholder-gray-500 focus:border-red-500 outline-none"
                />
                <User className="absolute top-3 right-3 text-gray-400" size={18} />
              </div>

              {/* Email Field */}
              <div className="relative w-full">
                <input
                  type="email"
                  placeholder="Email"
                  value={guest.email}
                  onChange={(e) => updateGuest(guest.id, "email", e.target.value)}
                  className="w-full p-3 border border-[#333] bg-[#000] text-white rounded-md placeholder-gray-500 focus:border-red-500 outline-none"
                />
                <Mail className="absolute top-3 right-3 text-gray-400" size={18} />
              </div>

              {/* Age Field */}
              <div className="relative w-32">
                <input
                  type="text"
                  placeholder="Age"
                  value={guest.age}
                  onChange={(e) => updateGuest(guest.id, "age", e.target.value)}
                  className="w-full p-3 border border-[#333] bg-[#000] text-white rounded-md placeholder-gray-500 focus:border-red-500 outline-none"
                />
              </div>

              {/* Remove Guest Button */}
              {guests.length > 1 && (
                <button
                  className="bg-red-600 text-white p-3 rounded-md hover:bg-red-700 transition"
                  onClick={() => removeGuest(guest.id)}
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Add Guest Button */}
        <button
          className="w-44 bg-red-500 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-red-600 transition-all duration-300 text-lg font-semibold mt-4"
          onClick={addGuest}
        >
          <Plus size={22} />
          Add Guest
        </button>

        {/* Pay Now Button */}
        <button
          className="w-52 h-14 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg flex items-center justify-center gap-3 hover:scale-105 hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 active:scale-95 active:bg-green-600 text-lg font-semibold mt-6 mx-auto"
        >
          <CreditCard size={24} />
          Pay Now
        </button>
      </div>
    </div>
  );
}
