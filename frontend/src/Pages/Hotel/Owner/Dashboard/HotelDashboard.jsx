import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Building,
  Bed,
  Calendar,
  TrendingUp,
  DollarSign,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  ShieldCheck,
  Clock,
  UploadCloud,
  Wifi,
  Coffee,
  Tv,
  Utensils,
  Car,
  Dumbbell,
  Wind,
  CheckCircle2,
  Waves
} from "lucide-react";
import Swal from "sweetalert2";

function HotelManagement() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const [currentHotel, setCurrentHotel] = useState({
    _id: null,
    name: "",
    description: "",
    status: "available",
    images: [],
    hotelImages: [],
    amenities: [],
    currentAmenity: "",
    area: "",
    district: "",
    pincode: "",
    longitude: "",
    latitude: ""
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop";
    if (imagePath.startsWith("http")) return imagePath;
    const cleanedPath = imagePath.replace(/^public[\\/]/, '');
    return `${import.meta.env.VITE_API_URL}/${cleanedPath.replace(/\\/g, '/')}`;
  };

  const formatLocation = (hotel) => {
    if (!hotel) return "Location not specified";
    const area = hotel.address?.area || hotel.area || "";
    const district = hotel.address?.district || hotel.district || "";
    const pincode = hotel.address?.pincode || hotel.pincode || "";

    const parts = [area, district].filter(Boolean);
    const locString = parts.join(", ");
    if (pincode) {
      return locString ? `${locString} - ${pincode}` : `${pincode}`;
    }
    return locString || "Location not specified";
  };

  const getAmenityIcon = (name) => {
    if (!name) return <Sparkles size={11} className="shrink-0 text-blue-500" />;
    const lower = name.toLowerCase();
    if (lower.includes("wifi") || lower.includes("internet")) return <Wifi size={11} className="shrink-0 text-blue-500" />;
    if (lower.includes("pool") || lower.includes("swim")) return <Waves size={11} className="shrink-0 text-blue-500" />;
    if (lower.includes("parking") || lower.includes("garage") || lower.includes("car")) return <Car size={11} className="shrink-0 text-blue-500" />;
    if (lower.includes("food") || lower.includes("restaurant") || lower.includes("dine") || lower.includes("dining")) return <Utensils size={11} className="shrink-0 text-blue-500" />;
    if (lower.includes("coffee") || lower.includes("tea") || lower.includes("breakfast")) return <Coffee size={11} className="shrink-0 text-blue-500" />;
    if (lower.includes("gym") || lower.includes("fitness") || lower.includes("workout")) return <Dumbbell size={11} className="shrink-0 text-blue-500" />;
    if (lower.includes("ac") || lower.includes("air") || lower.includes("cool")) return <Wind size={11} className="shrink-0 text-blue-500" />;
    if (lower.includes("tv") || lower.includes("television")) return <Tv size={11} className="shrink-0 text-blue-500" />;
    if (lower.includes("spa") || lower.includes("massage") || lower.includes("wellness")) return <Sparkles size={11} className="shrink-0 text-blue-500" />;
    return <CheckCircle2 size={11} className="shrink-0 text-blue-500" />;
  };

  const truncateDescription = (text, length = 70) => {
    if (!text) return '';
    return text.length > length ? `${text.substring(0, length)}...` : text;
  };

  useEffect(() => {
    fetchHotels();
    fetchBookings();
    return () => {
      currentHotel.images?.forEach(img => URL.revokeObjectURL(img.preview));
    };
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
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
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.message,
        confirmButtonColor: "#b90538",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/booking/get-hotel-bookings`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentHotel(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setCurrentHotel(prev => ({
      ...prev,
      images: [...(prev.images || []), ...newImages]
    }));
  };

  const handleRemoveImage = (index) => {
    setCurrentHotel(prev => {
      const newImages = [...prev.images];
      const removed = newImages.splice(index, 1);
      if (removed[0]?.preview && removed[0]?.file) {
        URL.revokeObjectURL(removed[0].preview);
      }
      return { ...prev, images: newImages };
    });
  };

  const handleRemoveExistingHotelImage = (imagePath) => {
    setCurrentHotel(prev => ({
      ...prev,
      hotelImages: (prev.hotelImages || []).filter(img => img !== imagePath)
    }));
  };

  const handleAddAmenity = () => {
    if (currentHotel.currentAmenity?.trim()) {
      setCurrentHotel(prev => ({
        ...prev,
        amenities: [...(prev.amenities || []), prev.currentAmenity.trim()],
        currentAmenity: ""
      }));
    }
  };

  const handleRemoveAmenity = (index) => {
    setCurrentHotel(prev => {
      const newAmenities = [...(prev.amenities || [])];
      newAmenities.splice(index, 1);
      return { ...prev, amenities: newAmenities };
    });
  };

  const handleEditClick = (hotel) => {
    setCurrentHotel({
      _id: hotel._id,
      name: hotel.name || "",
      description: hotel.description || "",
      status: hotel.status || "available",
      amenities: hotel.amenities || [],
      currentAmenity: "",
      area: hotel.address?.area || hotel.area || "",
      district: hotel.address?.district || hotel.district || "",
      pincode: hotel.address?.pincode || hotel.pincode || "",
      longitude: hotel.address?.longitude || hotel.longitude || "0",
      latitude: hotel.address?.latitude || hotel.latitude || "0",
      images: [],
      hotelImages: hotel.hotelImages || []
    });
    setShowModal("update");
  };

  const handleAddOrUpdateHotel = async () => {
    try {
      const formData = new FormData();
      formData.append('name', currentHotel.name);
      formData.append('description', currentHotel.description);
      formData.append('status', currentHotel.status || 'available');
      formData.append('area', currentHotel.area);
      formData.append('district', currentHotel.district);
      formData.append('pincode', currentHotel.pincode);
      formData.append('longitude', currentHotel.longitude || "0");
      formData.append('latitude', currentHotel.latitude || "0");

      currentHotel.amenities?.forEach((amenity, index) => {
        formData.append(`amenities[${index}]`, amenity);
      });

      if (showModal === "update" || showModal === "update-images") {
        formData.append('id', currentHotel._id);
        currentHotel.hotelImages?.forEach((img) => {
          formData.append('existingImages[]', img);
        });

        currentHotel.images?.forEach((img) => {
          if (img.file) {
            formData.append('images', img.file);
          }
        });
      }

      if (showModal === "add") {
        currentHotel.images?.forEach((img) => {
          if (img.file) {
            formData.append('images', img.file);
          }
        });
      }

      const endpoint = showModal === "update" ? "update" :
        showModal === "add" ? "create" : "update-images";

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/${endpoint}`, {
        method: "POST",
        credentials: "include",
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Operation failed");
      }

      await response.json();
      fetchHotels();
      setShowModal(null);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `Hotel ${showModal === "add" ? "added" : "updated"} successfully.`,
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

  const handleDeleteHotel = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/delete`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currentHotel._id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Operation failed");
      }
      fetchHotels();
      setShowModal(null);
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Hotel has been deleted successfully.",
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

  const handleToggleHotelStatus = async (hotel) => {
    const newStatus = hotel.status === "maintenance" ? "available" : "maintenance";
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: hotel._id, status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update status");
      }

      fetchHotels();
      Swal.fire({
        icon: "success",
        title: "Status Updated!",
        text: `Hotel status changed to ${newStatus === "maintenance" ? "Under Maintenance" : "Available"}.`,
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

  const openImageModal = (hotel, index = 0) => {
    setCurrentHotel(hotel);
    setCurrentImageIndex(index);
    setShowModal("image-viewer");
  };

  const navigateImage = (direction) => {
    const imagesList = currentHotel.hotelImages || [];
    if (imagesList.length === 0) return;
    if (direction === 'prev') {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imagesList.length) % imagesList.length);
    } else {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imagesList.length);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHotels = hotels.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(hotels.length / itemsPerPage) || 1;

  // Real Dynamic Calculations
  const totalRevenue = bookings.reduce((sum, b) => {
    return b.bookingStatus !== 'cancelled' ? sum + (b.totalAmount || 0) : sum;
  }, 0);

  const activeBookingsCount = bookings.filter(b => b.bookingStatus === 'confirmed' || b.bookingStatus === 'pending').length;

  const totalCapacity = hotels.reduce((sum, h) => sum + (h.totalRooms || 5), 0);
  const occupancyPercentage = totalCapacity > 0
    ? Math.min(Math.round((activeBookingsCount / totalCapacity) * 100), 100)
    : 0;

  const recentBookingsList = bookings.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#faf8ff] font-['Plus_Jakarta_Sans','Inter',sans-serif] text-[#131b2e] pb-12">
      <Helmet>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" />
      </Helmet>

      {/* Header */}
      <header className="min-h-[72px] py-3 pl-14 sm:px-6 md:px-10 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-30 shadow-xs flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-xl md:text-2xl font-extrabold text-[#131b2e] leading-tight truncate">
            Welcome back, <span className="text-[#b90538]">{hotels[0]?.name || "Hotel Owner"}</span>
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
            Managing operations for {hotels.length} {hotels.length === 1 ? 'property' : 'properties'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setCurrentHotel({
                _id: null,
                name: "",
                description: "",
                images: [],
                hotelImages: [],
                area: "",
                district: "",
                pincode: "",
                longitude: "",
                latitude: ""
              });
              setShowModal("add");
            }}
            className="border border-slate-200 hover:border-[#b90538] text-[#131b2e] hover:text-[#b90538] text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-full transition-all flex items-center gap-1.5 bg-white cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Building size={15} className="shrink-0" />
            <span>Add Hotel</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="p-6 md:p-10 max-w-[1280px] mx-auto space-y-8">

        {/* Dynamic Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Revenue Card */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-6 rounded-2xl shadow-sm space-y-3 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-rose-50 rounded-xl text-rose-500">
                <DollarSign size={24} />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">+12.5%</span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Revenue</p>
            <h3 className="text-3xl font-extrabold text-[#131b2e]">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </h3>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500" style={{ width: `${Math.min(totalRevenue > 0 ? 80 : 10, 100)}%` }}></div>
            </div>
          </div>

          {/* Active Bookings Card */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-6 rounded-2xl shadow-sm space-y-3 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
                <Calendar size={24} />
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">Real-time</span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Active Bookings</p>
            <h3 className="text-3xl font-extrabold text-[#131b2e]">{activeBookingsCount}</h3>
            <p className="text-xs text-slate-400 font-medium">Total registered reservations</p>
          </div>

          {/* Occupancy Card */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-6 rounded-2xl shadow-sm space-y-3 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500">
                <Bed size={24} />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                <TrendingUp size={14} />
                <span>Optimal</span>
              </div>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Room Occupancy %</p>
            <h3 className="text-3xl font-extrabold text-[#131b2e]">{occupancyPercentage}%</h3>
            <p className="text-xs text-slate-400 font-medium">Based on total managed capacity</p>
          </div>

        </section>

        {/* Managed Hotels Grid */}
        <section className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-extrabold text-[#131b2e]">Your Managed Hotels ({hotels.length})</h3>
              <p className="text-xs text-slate-500 font-medium">View, edit, or manage rooms for your listed properties</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-500 font-bold">Rows per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="p-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:border-[#b90538] cursor-pointer"
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#b90538] mx-auto"></div>
            </div>
          ) : currentHotels.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-medium space-y-3">
              <Building size={48} className="mx-auto text-slate-300" />
              <p className="text-base font-bold text-slate-700">No Hotels Found</p>
              <p className="text-xs text-slate-400">Click "Add New Hotel" to register your property on Bookin-Hub.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentHotels.map((hotel) => (
                <div
                  key={hotel._id}
                  className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Hotel Cover Image */}
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      <img
                        src={getImageUrl(hotel.hotelImages?.[0])}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Status Badge Overlay */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border shadow-md backdrop-blur-md ${
                          hotel.status === 'blocked'
                            ? 'bg-rose-600 text-white border-rose-700'
                            : hotel.status === 'maintenance'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        }`}>
                          {hotel.status === 'blocked' ? 'Blocked by Admin' : hotel.status === 'maintenance' ? 'Under Maintenance' : 'Active'}
                        </span>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-white">
                        <span className="text-xs font-extrabold px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/20">
                          {hotel.hotelImages?.length || 0} Photos
                        </span>
                        <button
                          onClick={() => openImageModal(hotel)}
                          className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full transition-colors text-white"
                          title="View Gallery"
                        >
                          <ImageIcon size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Hotel Information */}
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-extrabold text-base text-[#131b2e] leading-snug">
                          {hotel.name}
                        </h4>
                        {hotel.isApproved ? (
                          <span className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0 ml-2">
                            <ShieldCheck size={12} className="mr-1 text-emerald-600" />
                            Verified
                          </span>
                        ) : (
                          <span className="flex items-center text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 shrink-0 ml-2">
                            <Clock size={12} className="mr-1 text-amber-600" />
                            Pending Approval
                          </span>
                        )}
                      </div>

                      {/* Fixed Location Display - No orphaned hyphens or commas */}
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                        <MapPin size={14} className="text-[#b90538] shrink-0" />
                        <span>{formatLocation(hotel)}</span>
                      </p>

                      {/* Hotel Amenities Chips */}
                      {hotel.amenities?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                            <span key={idx} className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100 flex items-center gap-1">
                              {getAmenityIcon(amenity)}
                              <span>{amenity}</span>
                            </span>
                          ))}
                          {hotel.amenities.length > 3 && (
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                              +{hotel.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center gap-2">
                    <button
                      onClick={() => navigate(`/booking/hotel/${hotel._id}`)}
                      className="px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:border-[#b90538] hover:text-[#b90538] rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                      title="View Details"
                    >
                      <Eye size={13} />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => handleEditClick(hotel)}
                      className="px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                      title="Edit Hotel"
                    >
                      <Edit size={13} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentHotel(hotel);
                        setShowModal("delete");
                      }}
                      className="px-3 py-2 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                      title="Delete Hotel"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
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

        {/* Recent Bookings & Highlight Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Real Dynamic Recent Bookings Table */}
          <section className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
            <div>
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white/50">
                <h4 className="font-extrabold text-base text-[#131b2e]">Recent Bookings</h4>
                <button
                  onClick={() => navigate("/hotelowner/dashboard/bookings")}
                  className="text-xs font-bold text-[#b90538] hover:underline"
                >
                  View All
                </button>
              </div>

              {recentBookingsList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">
                  No recent bookings recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-slate-400 text-xs uppercase tracking-wider bg-slate-50/50 font-bold border-b border-slate-100">
                        <th className="px-6 py-4">Guest Name</th>
                        <th className="px-6 py-4">Hotel & Room</th>
                        <th className="px-6 py-4">Dates</th>
                        <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs font-medium">
                      {recentBookingsList.map((b) => (
                        <tr key={b._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 font-bold flex items-center justify-center text-xs">
                                {(b.user?.name || b.personDetails?.[0]?.name || "Guest").slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-[#131b2e]">
                                  {b.user?.name || b.personDetails?.[0]?.name || "Guest"}
                                </p>
                                <p className="text-[10px] text-slate-400">{b.user?.email || ""}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-[#131b2e]">{b.hotel?.name || "Property"}</p>
                            <p className="text-[10px] text-slate-400">{b.room?.room_type || "Room"}</p>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {new Date(b.bookingStartDate || Date.now()).toLocaleDateString()} -{" "}
                            {new Date(b.bookingEndDate || Date.now()).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                                b.bookingStatus === "confirmed" || b.bookingStatus === "completed"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  : b.bookingStatus === "cancelled"
                                  ? "bg-rose-50 text-rose-600 border-rose-100"
                                  : "bg-amber-50 text-amber-600 border-amber-100"
                              }`}
                            >
                              {b.bookingStatus || "Confirmed"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* Insights & Real Property Card */}
          <aside className="space-y-6">
            <div className="bg-[#283044] text-white p-6 rounded-3xl relative overflow-hidden shadow-md">
              <div className="relative z-10 space-y-3">
                <p className="text-rose-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={14} />
                  Market Insights
                </p>
                <h4 className="text-lg font-bold">Demand Optimizing</h4>
                <p className="text-slate-300 text-xs leading-relaxed font-normal">
                  Maximize booking rates by adjusting weekend pricing across your managed properties.
                </p>
                <button
                  onClick={() => Swal.fire("Pricing Strategy", "Pricing rules updated.", "success")}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/20 transition-colors rounded-xl text-xs font-bold backdrop-blur-md border border-white/10 cursor-pointer"
                >
                  Optimize Pricing
                </button>
              </div>
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full blur-3xl opacity-30"></div>
            </div>

            {/* Featured Property Highlight */}
            {hotels[0] && (
              <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-4 rounded-3xl shadow-sm space-y-3">
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100">
                  <img
                    src={getImageUrl(hotels[0].hotelImages?.[0])}
                    alt={hotels[0].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                  <div>
                    <h5 className="font-bold text-sm text-[#131b2e]">{hotels[0].name}</h5>
                    <p className="text-xs text-slate-500">{formatLocation(hotels[0])}</p>
                  </div>
                  <span className="text-[#b90538]">
                    <ShieldCheck size={20} />
                  </span>
                </div>
              </div>
            )}
          </aside>

        </div>

      </div>

      {/* Add / Edit Hotel Modal */}
      {(showModal === "add" || showModal === "update") && (
        <div className="fixed inset-0 flex justify-center items-center bg-slate-900/60 backdrop-blur-md z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 max-h-[92vh] overflow-y-auto border border-slate-100">
            
            <div className="bg-slate-900 text-white -mx-6 -mt-6 md:-mx-8 md:-mt-8 p-6 md:p-8 rounded-t-3xl border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                  <Building className="w-5 h-5 text-rose-500 shrink-0" />
                  {showModal === "add" ? "Add New Hotel" : "Update Hotel Details"}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-normal">
                  Configure property information, operational status, and media
                </p>
              </div>
              <button
                onClick={() => setShowModal(null)}
                className="text-slate-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2.5 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    Hotel Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={currentHotel.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Royal Garden Inn"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-[#b90538] transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    Property Status
                  </label>
                  <select
                    name="status"
                    value={currentHotel.status || "available"}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-[#b90538] transition-all cursor-pointer font-bold"
                  >
                    <option value="available">Available (Active)</option>
                    <option value="maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    Area / Street
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={currentHotel.area}
                    onChange={handleInputChange}
                    placeholder="e.g. MG Road"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-[#b90538] transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    District / City
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={currentHotel.district}
                    onChange={handleInputChange}
                    placeholder="e.g. Bengaluru"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-[#b90538] transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={currentHotel.pincode}
                    onChange={handleInputChange}
                    placeholder="560001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-[#b90538] transition-all font-medium"
                  />
                </div>
              </div>

              {/* Hotel Amenities Tag Input */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Hotel Amenities & Services
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    name="currentAmenity"
                    value={currentHotel.currentAmenity || ""}
                    onChange={handleInputChange}
                    placeholder="e.g. Swimming Pool, Free WiFi, Restaurant, Parking, Gym"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-[#b90538] transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddAmenity}
                    className="px-4 py-2 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-black transition-colors shrink-0 cursor-pointer shadow-xs"
                  >
                    Add
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-1">
                  {currentHotel.amenities?.map((amenity, idx) => (
                    <span key={idx} className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100 font-extrabold shadow-2xs">
                      {getAmenityIcon(amenity)}
                      {amenity}
                      <button type="button" onClick={() => handleRemoveAmenity(idx)} className="hover:text-blue-900 transition-colors cursor-pointer">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  value={currentHotel.description}
                  onChange={handleInputChange}
                  placeholder="Describe unique amenities, view, and features..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-[#b90538] transition-all resize-none font-medium"
                ></textarea>
              </div>

              {/* Property Image Upload Box */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Property Gallery Photos
                  </label>
                  <span className="text-[11px] font-bold text-slate-400">
                    {(currentHotel.hotelImages?.length || 0) + (currentHotel.images?.length || 0)} Photos Selected
                  </span>
                </div>

                <label className="border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/20 hover:bg-rose-50/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group text-center shadow-2xs">
                  <div className="w-12 h-12 rounded-2xl bg-white text-[#b90538] flex items-center justify-center mb-2.5 group-hover:scale-110 transition-all duration-300 shadow-md shadow-rose-500/10 border border-rose-100">
                    <UploadCloud size={24} />
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    <span className="text-[#b90538] font-extrabold hover:underline">Click to browse photos</span> or drag & drop here
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                    Upload high-quality PNG, JPG, or WEBP photos
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                
                <div className="space-y-4 pt-2">
                  {currentHotel.hotelImages?.length > 0 && (
                    <div>
                      <p className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                        Existing Property Photos ({currentHotel.hotelImages.length})
                      </p>
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                        {currentHotel.hotelImages.map((img, idx) => (
                          <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
                            <img src={getImageUrl(img)} alt="Existing" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveExistingHotelImage(img)}
                                className="bg-rose-600 text-white rounded-full p-2 hover:bg-rose-700 transition-transform active:scale-95 shadow-md cursor-pointer"
                                title="Delete existing photo"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-md text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
                                Cover
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentHotel.images?.length > 0 && (
                    <div>
                      <p className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        New Uploads ({currentHotel.images.length})
                      </p>
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                        {currentHotel.images.map((img, idx) => (
                          <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-xs bg-emerald-50">
                            <img src={img.preview} alt="New Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="bg-rose-600 text-white rounded-full p-2 hover:bg-rose-700 transition-transform active:scale-95 shadow-md cursor-pointer"
                                title="Remove new photo"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100 flex justify-end items-center gap-3">
              <button
                type="button"
                onClick={() => setShowModal(null)}
                className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddOrUpdateHotel}
                className="px-7 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                {showModal === "add" ? "Save Hotel" : "Update Hotel Details"}
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
            <h3 className="text-lg font-bold text-[#131b2e]">Delete Hotel?</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Are you sure you want to delete <span className="font-bold text-slate-800">{currentHotel.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(null)}
                className="w-1/2 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteHotel}
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

            {currentHotel.hotelImages?.length > 0 ? (
              <div className="relative w-full h-[60vh] flex items-center justify-center bg-black/40 rounded-3xl overflow-hidden">
                <img
                  src={getImageUrl(currentHotel.hotelImages[currentImageIndex])}
                  alt="Gallery"
                  className="max-h-full max-w-full object-contain"
                />
                
                {currentHotel.hotelImages.length > 1 && (
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
              <p className="text-white font-medium">No images uploaded for this hotel.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default HotelManagement;