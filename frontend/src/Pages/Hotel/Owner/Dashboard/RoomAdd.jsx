import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trash, Plus, Hash, Bed, DollarSign, CheckCircle, Image as RoomImages, Users, Info } from "lucide-react";

const RoomAdd = () => {
  const [formData, setFormData] = useState({
    hotel_id: "",
    room_type: "",
    room_price_per_day: "",
    status: "available", // Default status
    roomImages: [],
    facilities: "",
    max_occupancy: "",
    room_number: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, roomImages: [...formData.roomImages, ...files] });
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      roomImages: formData.roomImages.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    // Add your form submission logic here (e.g., API call)
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-black border-2 border-red-500 rounded-xl p-8 max-w-4xl w-full text-center shadow-red-500 shadow-lg"
      >
        <h1 className="text-4xl font-bold uppercase tracking-wide text-red-500 mb-2">
          Room <span className="text-white">Registration</span>
        </h1>
        <p className="text-gray-400 mb-6">Add room details & manage room bookings effortlessly.</p>

        <form onSubmit={handleSubmit}>
          {/* Grid Container for Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {[
              { name: "hotel_id", placeholder: "Hotel ID", icon: <Hash className="text-red-500 mr-3" /> },
              { name: "room_type", placeholder: "Room Type", icon: <Bed className="text-red-500 mr-3" /> },
              { name: "room_price_per_day", placeholder: "Price Per Day", type: "number", icon: <DollarSign className="text-red-500 mr-3" /> },
              { name: "status", placeholder: "Status", icon: <CheckCircle className="text-red-500 mr-3" /> },
              { name: "max_occupancy", placeholder: "Max Occupancy", type: "number", icon: <Users className="text-red-500 mr-3" /> },
              { name: "room_number", placeholder: "Room Number", icon: <Hash className="text-red-500 mr-3" /> },
            ].map(({ name, placeholder, type = "text", icon }) => (
              <div key={name}>
                <label className="text-sm font-semibold">{placeholder}</label>
                <div className="flex items-center bg-black border border-red-500 p-3 rounded-lg text-lg">
                  {icon}
                  <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={formData[name]}
                    onChange={handleInputChange}
                    className="w-full bg-black text-white focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Full-width Fields */}
          <div className="mt-6 space-y-5 text-left">
            {/* Facilities */}
            <div>
              <label className="text-sm font-semibold">Facilities</label>
              <div className="flex items-center bg-black border border-red-500 p-3 rounded-lg text-lg">
                <Info className="text-red-500 mr-3" />
                <textarea
                  name="facilities"
                  placeholder="Enter Facilities (comma-separated)"
                  value={formData.facilities}
                  onChange={handleInputChange}
                  className="w-full bg-black text-white focus:outline-none h-24"
                ></textarea>
              </div>
            </div>

            {/* Room Images Upload */}
            <div>
              <label className="text-sm font-semibold">Room Images</label>
              <div className="flex items-center bg-black border border-red-500 p-3 rounded-lg text-lg">
                <RoomImages className="text-red-500 mr-3" />
                <input
                  type="file"
                  multiple
                  onChange={handleImageUpload}
                  className="w-full bg-black text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Room Images Preview */}
            <div className="flex flex-wrap gap-2">
              {formData.roomImages.map((image, index) => (
                <div key={index} className="relative">
                  <img src={URL.createObjectURL(image)} alt="Room" className="w-20 h-20 object-cover rounded" />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 text-lg rounded-lg flex items-center justify-center space-x-2 mt-6"
          >
            <Plus size={22} />
            <span>Add Room</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default RoomAdd;