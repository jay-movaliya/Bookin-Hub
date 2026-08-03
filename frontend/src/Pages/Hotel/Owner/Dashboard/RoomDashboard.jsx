import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Bed,
  Building,
  DollarSign,
  Users,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Eye,
  Edit,
  Trash2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Tag,
  ShieldCheck
} from "lucide-react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

function HotelRoomManagement() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(null);
  const [currentRoom, setCurrentRoom] = useState({
    _id: null,
    hotel: "",
    room_type: "Deluxe",
    room_price_per_day: 0,
    room_images: [],
    newImages: [],
    status: "available",
    facilities: [],
    max_occupancy: 2,
    room_number: "",
    currentFacility: ""
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [statusFilter, setStatusFilter] = useState("all");

  const statusOptions = ["available", "booked", "maintenance"];
  const roomTypeOptions = ["Standard", "Deluxe", "Suite", "Executive", "Family"];

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop";
    if (imagePath.startsWith("http")) return imagePath;
    const cleanedPath = imagePath.replace(/^public[\\/]/, '');
    return `${import.meta.env.VITE_API_URL}/${cleanedPath.replace(/\\/g, '/')}`;
  };

  useEffect(() => {
    fetchHotels();
    fetchRooms();
    return () => {
      currentRoom.newImages?.forEach(img => URL.revokeObjectURL(img.preview));
    };
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/room/get-owner-rooms`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch rooms");
      const data = await response.json();
      setRooms(data.data || []);
    } catch (err) {
      console.error("Fetch Rooms Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHotels = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/get-owner-hotels`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch hotels");
      const data = await response.json();
      setHotels(data.data || []);
    } catch (err) {
      console.error("Error fetching hotels:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentRoom(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setCurrentRoom(prev => ({
      ...prev,
      newImages: [...(prev.newImages || []), ...newImages]
    }));
  };

  const handleRemoveImage = (index) => {
    setCurrentRoom(prev => {
      const newImages = [...prev.newImages];
      const removed = newImages.splice(index, 1);
      if (removed[0]?.preview && removed[0]?.file) {
        URL.revokeObjectURL(removed[0].preview);
      }
      return { ...prev, newImages };
    });
  };

  const handleAddFacility = () => {
    if (currentRoom.currentFacility.trim() !== "") {
      setCurrentRoom(prev => ({
        ...prev,
        facilities: [...prev.facilities, prev.currentFacility.trim()],
        currentFacility: ""
      }));
    }
  };

  const handleRemoveFacility = (index) => {
    setCurrentRoom(prev => {
      const newFacilities = [...prev.facilities];
      newFacilities.splice(index, 1);
      return { ...prev, facilities: newFacilities };
    });
  };

  const handleEditClick = (room) => {
    setCurrentRoom({
      _id: room._id,
      hotel: typeof room.hotel === 'object' ? room.hotel?._id : room.hotel,
      room_type: room.room_type || "Deluxe",
      room_price_per_day: room.room_price_per_day || 0,
      room_images: room.room_images || [],
      newImages: [],
      status: room.status || "available",
      facilities: room.facilities || [],
      max_occupancy: room.max_occupancy || 2,
      room_number: room.room_number || "",
      currentFacility: ""
    });
    setShowModal("update");
  };

  const handleAddOrUpdateRoom = async () => {
    if (!currentRoom.hotel) {
      Swal.fire({
        icon: "warning",
        title: "Hotel Required",
        text: "Please select a hotel for this room.",
        confirmButtonColor: "#b90538",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('hotel', currentRoom.hotel);
      formData.append('room_type', currentRoom.room_type);
      formData.append('room_price_per_day', currentRoom.room_price_per_day);
      formData.append('status', currentRoom.status);
      formData.append('max_occupancy', currentRoom.max_occupancy);
      formData.append('room_number', currentRoom.room_number);

      currentRoom.facilities.forEach((facility, index) => {
        formData.append(`facilities[${index}]`, facility);
      });

      if (showModal === "update" || showModal === "update-images") {
        formData.append('id', currentRoom._id);
        currentRoom.room_images?.forEach((img) => {
          formData.append('existingImages[]', img);
        });
      }

      currentRoom.newImages?.forEach((img) => {
        if (img.file) {
          formData.append('images', img.file);
        }
      });

      const endpoint = showModal === "update" ? "update" :
        showModal === "add" ? "create" : "update-images";

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/room/${endpoint}`, {
        method: "POST",
        credentials: "include",
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Operation failed");
      }

      await response.json();
      fetchRooms();
      setShowModal(null);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `Room ${showModal === "add" ? "added" : "updated"} successfully.`,
        confirmButtonColor: "#b90538",
      });

    } catch (err) {
      console.error("Error:", err);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.message,
        confirmButtonColor: "#b90538",
      });
    }
  };

  const handleDeleteRoom = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/room/delete`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currentRoom._id }),
      });

      if (!response.ok) throw new Error("Failed to delete room");

      fetchRooms();
      setShowModal(null);
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Room has been deleted successfully.",
        confirmButtonColor: "#b90538",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.message,
        confirmButtonColor: "#b90538",
      });
    }
  };

  const openImageModal = (room, index = 0) => {
    setCurrentRoom(room);
    setCurrentImageIndex(index);
    setShowModal("image-viewer");
  };

  const navigateImage = (direction) => {
    const imagesList = currentRoom.room_images || [];
    if (imagesList.length === 0) return;
    if (direction === 'prev') {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imagesList.length) % imagesList.length);
    } else {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imagesList.length);
    }
  };

  const getHotelName = (hotelId) => {
    if (!hotelId) return "Unassigned Hotel";
    if (typeof hotelId === 'object' && hotelId.name) return hotelId.name;
    const found = hotels.find(h => h._id === hotelId);
    return found ? found.name : "Hotel Property";
  };

  const filteredRooms = rooms.filter(r => {
    if (statusFilter === "all") return true;
    return r.status === statusFilter;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage) || 1;

  const availableCount = rooms.filter(r => r.status === "available").length;
  const bookedCount = rooms.filter(r => r.status === "booked").length;
  const maintenanceCount = rooms.filter(r => r.status === "maintenance").length;

  const avgPrice = rooms.length > 0
    ? Math.round(rooms.reduce((acc, curr) => acc + (curr.room_price_per_day || 0), 0) / rooms.length)
    : 0;

  return (
    <div className="min-h-screen bg-[#faf8ff] font-['Plus_Jakarta_Sans','Inter',sans-serif] text-[#131b2e] pb-12">
      <Helmet>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" />
      </Helmet>

      {/* Top Header */}
      <header className="min-h-[72px] py-3 pl-14 sm:px-6 md:px-10 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-30 shadow-xs flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-xl md:text-2xl font-extrabold text-[#131b2e] leading-tight truncate">
            Room Inventory Management
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
            Manage availability, daily rates, and room features for {rooms.length} registered rooms
          </p>
        </div>

        <button
          onClick={() => {
            setCurrentRoom({
              _id: null,
              hotel: hotels[0]?._id || "",
              room_type: "Deluxe",
              room_price_per_day: 1500,
              room_images: [],
              newImages: [],
              status: "available",
              facilities: ["WiFi", "AC"],
              max_occupancy: 2,
              room_number: "",
              currentFacility: ""
            });
            setShowModal("add");
          }}
          className="shrink-0 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-5 py-2 rounded-full shadow-md shadow-rose-500/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Plus size={15} />
          <span>Add Room</span>
        </button>
      </header>

      {/* Main Container */}
      <div className="p-6 md:p-10 max-w-[1280px] mx-auto space-y-8">

        {/* Dynamic Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Total Rooms */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-6 rounded-2xl shadow-sm space-y-2 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-rose-50 rounded-xl text-rose-500">
                <Bed size={22} />
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Total</span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Inventory</p>
            <h3 className="text-3xl font-extrabold text-[#131b2e]">{rooms.length} Rooms</h3>
          </div>

          {/* Available Rooms */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-6 rounded-2xl shadow-sm space-y-2 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500">
                <CheckCircle2 size={22} />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Ready</span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Available Now</p>
            <h3 className="text-3xl font-extrabold text-emerald-600">{availableCount}</h3>
          </div>

          {/* Booked Rooms */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-6 rounded-2xl shadow-sm space-y-2 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
                <Users size={22} />
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Occupied</span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Booked Stays</p>
            <h3 className="text-3xl font-extrabold text-blue-600">{bookedCount}</h3>
          </div>

          {/* Average Daily Rate */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-6 rounded-2xl shadow-sm space-y-2 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-purple-50 rounded-xl text-purple-500">
                <DollarSign size={22} />
              </div>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">Average Rate</span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Average Daily Price</p>
            <h3 className="text-3xl font-extrabold text-[#131b2e]">₹{avgPrice.toLocaleString("en-IN")}</h3>
          </div>

        </section>

        {/* Filter Bar & Grid Container */}
        <section className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full pb-1 scrollbar-none">
              {["all", "available", "booked", "maintenance"].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setCurrentPage(1);
                  }}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    statusFilter === st
                      ? "bg-[#b90538] text-white shadow-md shadow-rose-500/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st === "all" ? "All Rooms" : st}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label className="text-[11px] sm:text-xs text-slate-500 font-bold whitespace-nowrap">Rows per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="p-1.5 sm:p-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:border-[#b90538] cursor-pointer"
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
              </select>
            </div>
          </div>

          {/* Rooms Grid */}
          {loading ? (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#b90538] mx-auto"></div>
            </div>
          ) : currentRooms.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-medium space-y-3">
              <Bed size={48} className="mx-auto text-slate-300" />
              <p className="text-base font-bold text-slate-700">No Rooms Found</p>
              <p className="text-xs text-slate-400">Click "Add New Room" to add rooms to your property.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentRooms.map((room) => (
                <div
                  key={room._id}
                  className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      <img
                        src={getImageUrl(room.room_images?.[0])}
                        alt={room.room_type}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 bg-black/50 backdrop-blur-md text-white rounded-lg border border-white/20">
                          Room #{room.room_number || "N/A"}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 bg-rose-600 text-white rounded-lg">
                          {room.room_type}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-white">
                        <span className="text-xs font-extrabold px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/20">
                          {room.room_images?.length || 0} Photos
                        </span>
                        <button
                          onClick={() => openImageModal(room)}
                          className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full transition-colors text-white"
                          title="View Gallery"
                        >
                          <ImageIcon size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Room Details */}
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-base text-[#131b2e] leading-snug">
                            {room.room_type} Suite
                          </h4>
                          <p className="text-xs text-slate-500 font-bold flex items-center gap-1 mt-0.5">
                            <Building size={13} className="text-[#b90538]" />
                            <span>{getHotelName(room.hotel)}</span>
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                            room.status === "available"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : room.status === "booked"
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                          }`}
                        >
                          {room.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                          <Users size={14} className="text-slate-400" />
                          <span>Max {room.max_occupancy} Guests</span>
                        </div>
                        <div className="font-black text-rose-600 text-sm">
                          ₹{room.room_price_per_day?.toLocaleString("en-IN") || 0}<span className="text-[10px] text-slate-400 font-normal">/day</span>
                        </div>
                      </div>

                      {/* Facilities Chips */}
                      {room.facilities?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {room.facilities.map((fac, idx) => (
                            <span key={idx} className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md border border-rose-100">
                              {fac}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center gap-2">
                    <button
                      onClick={() => handleEditClick(room)}
                      className="w-1/2 py-2 bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Edit size={13} />
                      <span>Edit Room</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentRoom(room);
                        setShowModal("delete");
                      }}
                      className="w-1/2 py-2 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Trash2 size={13} />
                      <span>Delete Room</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-xs font-bold text-slate-500">
              <span>Page {currentPage} of {totalPages}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

        </section>

      </div>

      {/* Add / Edit Room Modal */}
      {(showModal === "add" || showModal === "update") && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#131b2e]">
                  {showModal === "add" ? "Add New Room" : "Update Room Details"}
                </h3>
                <p className="text-xs text-slate-400">Configure room pricing, status, and features</p>
              </div>
              <button
                onClick={() => setShowModal(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Hotel Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Hotel Property
                </label>
                <select
                  name="hotel"
                  value={currentRoom.hotel}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#b90538] cursor-pointer"
                >
                  <option value="">-- Choose Hotel --</option>
                  {hotels.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Room Type
                  </label>
                  <select
                    name="room_type"
                    value={currentRoom.room_type}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#b90538] cursor-pointer"
                  >
                    {roomTypeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Room Number / Code
                  </label>
                  <input
                    type="text"
                    name="room_number"
                    value={currentRoom.room_number}
                    onChange={handleInputChange}
                    placeholder="e.g. 101, 204B"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#b90538]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Price per Day (₹)
                  </label>
                  <input
                    type="number"
                    name="room_price_per_day"
                    value={currentRoom.room_price_per_day}
                    onChange={handleInputChange}
                    placeholder="1500"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#b90538]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Max Occupancy
                  </label>
                  <input
                    type="number"
                    name="max_occupancy"
                    value={currentRoom.max_occupancy}
                    onChange={handleInputChange}
                    placeholder="2"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#b90538]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={currentRoom.status}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#b90538] cursor-pointer capitalize"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Facilities Tag Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Facilities & Amenities
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    name="currentFacility"
                    value={currentRoom.currentFacility}
                    onChange={handleInputChange}
                    placeholder="e.g. WiFi, Sea View, Balcony"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#b90538]"
                  />
                  <button
                    type="button"
                    onClick={handleAddFacility}
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
                  >
                    Add
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {currentRoom.facilities.map((fac, idx) => (
                    <span key={idx} className="flex items-center gap-1 text-xs bg-rose-50 text-rose-700 px-3 py-1 rounded-full border border-rose-100 font-bold">
                      {fac}
                      <button type="button" onClick={() => handleRemoveFacility(idx)} className="hover:text-red-900">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Image Upload Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Room Photos
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700"
                />
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {currentRoom.newImages?.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                      <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(null)}
                className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddOrUpdateRoom}
                className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-500/20"
              >
                {showModal === "add" ? "Save Room" : "Update Room"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showModal === "delete" && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#131b2e]">Delete Room?</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Are you sure you want to delete <span className="font-bold text-slate-800">Room #{currentRoom.room_number || currentRoom.room_type}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(null)}
                className="w-1/2 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRoom}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery Viewer Modal */}
      {showModal === "image-viewer" && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/80 backdrop-blur-md z-50 p-4">
          <div className="relative max-w-3xl w-full flex flex-col items-center">
            <button
              onClick={() => setShowModal(null)}
              className="absolute -top-12 right-0 text-white p-2 rounded-full hover:bg-white/20"
            >
              <X size={24} />
            </button>

            {currentRoom.room_images?.length > 0 ? (
              <div className="relative w-full h-[60vh] flex items-center justify-center bg-black/40 rounded-3xl overflow-hidden">
                <img
                  src={getImageUrl(currentRoom.room_images[currentImageIndex])}
                  alt="Gallery"
                  className="max-h-full max-w-full object-contain"
                />
                
                {currentRoom.room_images.length > 1 && (
                  <>
                    <button
                      onClick={() => navigateImage("prev")}
                      className="absolute left-4 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => navigateImage("next")}
                      className="absolute right-4 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <p className="text-white font-medium">No photos uploaded for this room.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default HotelRoomManagement;