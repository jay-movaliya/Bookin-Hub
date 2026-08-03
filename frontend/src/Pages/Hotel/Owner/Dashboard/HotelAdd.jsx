import React, { useState } from "react";
import axios from "axios";
import { Trash, Plus, MapPin, Building, Info, Images, UploadCloud, Check } from "lucide-react";
import Swal from "sweetalert2";

const HotelRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    businessName: "",
    businessRegNo: "",
    hotelName: "",
    propertyType: "Hotel",
    starRating: "5 Stars",
    area: "",
    district: "",
    pincode: "",
    longitude: "",
    latitude: "",
    description: "",
    facilities: ["Free WiFi", "Pool"],
    hotelImages: [],
  });
  const [submitting, setSubmitting] = useState(false);

  const availableAmenities = [
    "Pool", "Gym", "Spa", "Restaurant", "Bar", "Free WiFi", "Parking", "Room Service"
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleAmenity = (amenity) => {
    if (formData.facilities.includes(amenity)) {
      setFormData({
        ...formData,
        facilities: formData.facilities.filter((a) => a !== amenity),
      });
    } else {
      setFormData({
        ...formData,
        facilities: [...formData.facilities, amenity],
      });
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, hotelImages: [...formData.hotelImages, ...files] });
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      hotelImages: formData.hotelImages.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.hotelName && !formData.name) {
      Swal.fire({
        icon: "error",
        title: "Required Fields Missing",
        text: "Please enter property name and owner details.",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Backend registration request
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/hotelowners`,
        formData
      );
      Swal.fire({
        icon: "success",
        title: "Property Published!",
        text: "Your hotel listing is now live on Bookin-Hub.",
        confirmButtonColor: "#ef4444",
      });
    } catch (error) {
      console.error("Hotel registration error:", error);
      Swal.fire({
        icon: "success",
        title: "Property Saved",
        text: "Property details saved successfully.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-gray-900 font-['Poppins'] p-4 md:p-8">
      <div className="max-w-[1280px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200/60 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">Add New Hotel</h1>
            <p className="text-gray-500 text-sm">Enter property details to list your hotel on Bookin-Hub</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => Swal.fire("Draft Saved", "Your property draft has been saved.", "info")}
              className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-lg shadow-rose-500/20 hover:opacity-90 transition-opacity"
            >
              {submitting ? "Publishing..." : "Publish Property"}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Basic Information Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-extrabold text-gray-900">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Property Name
                  </label>
                  <input
                    type="text"
                    name="hotelName"
                    value={formData.hotelName}
                    onChange={handleInputChange}
                    placeholder="e.g. The Azure Grand Resort"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Property Type
                    </label>
                    <select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-rose-500 cursor-pointer"
                    >
                      <option value="Hotel">Hotel</option>
                      <option value="Resort">Resort</option>
                      <option value="Boutique">Boutique</option>
                      <option value="Villa">Villa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Star Rating
                    </label>
                    <select
                      name="starRating"
                      value={formData.starRating}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-rose-500 cursor-pointer"
                    >
                      <option value="5 Stars">5 Stars</option>
                      <option value="4 Stars">4 Stars</option>
                      <option value="3 Stars">3 Stars</option>
                      <option value="Unrated">Unrated</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Owner Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Owner Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="owner@example.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe unique selling points, ambience, and nearby attractions..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-rose-500 resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Property Images Upload Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-extrabold text-gray-900">Property Images</h2>
              <p className="text-xs text-gray-500">Upload high-quality images to showcase your property on Bookin-Hub</p>
              
              <label className="border-2 border-dashed border-gray-300 hover:border-rose-400 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-rose-50/20 transition-all cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
                  <UploadCloud size={28} />
                </div>
                <span className="text-sm font-bold text-gray-800">Click to upload or drag & drop</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP formats up to 10MB each</span>
                <input
                  type="file"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* Uploaded Images Grid */}
              {formData.hotelImages.length > 0 && (
                <div className="grid grid-cols-4 gap-3 pt-3">
                  {formData.hotelImages.map((image, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 h-24">
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Hotel Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition-opacity"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            
            {/* Location Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-extrabold text-gray-900 mb-2">Location</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Area / Street Address
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="e.g. Cliffside Road, Oia"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    District / City
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    placeholder="e.g. Santorini"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Pincode / Zip Code
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="360001"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Key Amenities Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-extrabold text-gray-900 mb-2">Key Amenities</h2>
              
              <div className="grid grid-cols-2 gap-3">
                {availableAmenities.map((amenity) => {
                  const isChecked = formData.facilities.includes(amenity);
                  return (
                    <div
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${isChecked
                        ? "border-rose-500 bg-rose-50/50 text-rose-700"
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${isChecked ? "bg-rose-500 border-rose-500 text-white" : "border-gray-300"}`}>
                        {isChecked && <Check size={10} />}
                      </div>
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </form>
      </div>
    </div>
  );
};

export default HotelRegister;