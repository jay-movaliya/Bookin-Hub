import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiMapPin, FiStar, FiArrowLeft, FiUser, FiCalendar, FiCheck, FiWifi,
  FiTv, FiCoffee, FiWind, FiShield, FiPackage, FiTruck, FiClock, FiBriefcase, FiAlertTriangle
} from 'react-icons/fi';
import {
  MdOutlinePool, MdOutlineRestaurant, MdOutlineLocalParking, MdOutlineFitnessCenter,
  MdOutlineSpa, MdOutlineElevator, MdOutlineRoomService, MdOutlineAirplanemodeActive, MdOutlineMeetingRoom
} from 'react-icons/md';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'react-lottie';
import successAnimation from './success-animation.json';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const HotelDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState({});
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    guests: [{ name: '', age: '', aadhar: '' }],
    specialRequests: '',
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isRoomAvailable, setIsRoomAvailable] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState(false);
  const [userDetails, setUserDetails] = useState({
    id: "",
    name: "",
    email: "",
    contact: "",
  });

  const [roomBookings, setRoomBookings] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Lottie animation options
  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: successAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  // Slider settings for room images
  const roomSliderSettings = {
    dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false
  };

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const decoded = jwtDecode(token);
        setUserDetails({
          id: decoded.user._id,
          name: decoded.user.name,
          email: decoded.user.email,
          contact: decoded.user.contact,
        });

        await fetchHotelDetails();
      } catch (error) {
        console.error("Initialization error:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to initialize page. Please log in.',
          confirmButtonColor: '#ef4444',
        });
      }
    };

    const fetchHotelDetails = async () => {
      setIsLoading(true);
      try {
        const hotelResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/${id}`);
        if (!hotelResponse.ok) throw new Error('Failed to fetch hotel details');
        const hotelData = await hotelResponse.json();

        const roomsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/room/${id}`);
        if (!roomsResponse.ok) throw new Error('Failed to fetch rooms');
        const roomsData = await roomsResponse.json();

        try {
          const bookingsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/booking/hotel-room-bookings/${id}`);
          if (bookingsResponse.ok) {
            const bookingsData = await bookingsResponse.json();
            setRoomBookings(bookingsData.data || []);
          }
        } catch (bErr) {
          console.error("Error fetching room bookings:", bErr);
        }

        try {
          const reviewsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel-ratings/${id}`);
          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            setReviews(reviewsData.data || []);
          }
        } catch (rErr) {
          console.error("Error fetching reviews:", rErr);
        }

        setHotel(hotelData.data);
        setRooms(roomsData.data);

        const loadingStates = {};
        if (hotelData.data?.hotelImages) {
          hotelData.data.hotelImages.forEach((_, index) => {
            loadingStates[index] = true;
          });
        }
        setImageLoading(loadingStates);
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'Failed to load hotel details',
          confirmButtonColor: '#ef4444',
        }).then(() => navigate('/booking/hotel'));
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [id, navigate]);

  useEffect(() => {
    if (selectedRoom && bookingData.startDate && bookingData.endDate) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      setTotalAmount(diffDays * selectedRoom.room_price_per_day);
    }
  }, [bookingData.startDate, bookingData.endDate, selectedRoom]);

  const getAmenityIcon = (name) => {
    if (!name) return <FiCheck />;
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('wifi') || lowercaseName.includes('wi-fi')) return <FiWifi />;
    if (lowercaseName.includes('pool')) return <MdOutlinePool />;
    if (lowercaseName.includes('spa')) return <MdOutlineSpa />;
    if (lowercaseName.includes('gym') || lowercaseName.includes('fitness')) return <MdOutlineFitnessCenter />;
    if (lowercaseName.includes('restaurant') || lowercaseName.includes('food')) return <MdOutlineRestaurant />;
    if (lowercaseName.includes('bar') || lowercaseName.includes('lounge')) return <FiCoffee />;
    if (lowercaseName.includes('parking')) return <MdOutlineLocalParking />;
    if (lowercaseName.includes('ac') || lowercaseName.includes('air')) return <FiWind />;
    if (lowercaseName.includes('tv')) return <FiTv />;
    if (lowercaseName.includes('security')) return <FiShield />;
    if (lowercaseName.includes('room service')) return <MdOutlineRoomService />;
    if (lowercaseName.includes('elevator')) return <MdOutlineElevator />;
    if (lowercaseName.includes('airport')) return <MdOutlineAirplanemodeActive />;
    if (lowercaseName.includes('meeting')) return <MdOutlineMeetingRoom />;
    if (lowercaseName.includes('laundry')) return <FiPackage />;
    if (lowercaseName.includes('shuttle')) return <FiTruck />;
    if (lowercaseName.includes('24/7')) return <FiClock />;
    return <FiCheck />;
  };

  const handleBookingModalOpen = async (room) => {
    const selected = room || (rooms.length > 0 ? rooms[0] : null);
    if (!selected) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/booking/rooms/lock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ roomId: selected._id })
      });
      
      const data = await response.json();
      if (!data.success && response.status === 200) {
        Swal.fire({
          icon: 'error',
          title: 'Room Unavailable',
          text: 'This room is currently being booked by another customer. Please try again in 5 minutes.',
          confirmButtonColor: '#ef4444',
        });
        return; // Don't open the modal if someone else locked it!
      }
    } catch (error) {
       console.error("Failed to lock room", error);
    }

    setSelectedRoom(selected);
    setShowBookingModal(true);
    setBookingStep(1);
    setBookingConfirmed(false);
    setIsRoomAvailable(true);
  };

  const formatDateToYYYYMMDD = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseYYYYMMDDToDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length < 3) return null;
    const [year, month, day] = parts.map(Number);
    return new Date(year, month - 1, day);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handleGuestChange = (index, e) => {
    const { name, value } = e.target;
    const updatedGuests = [...bookingData.guests];
    updatedGuests[index][name] = value;
    setBookingData(prev => ({ ...prev, guests: updatedGuests }));
  };

  const addGuest = () => {
    if (selectedRoom && bookingData.guests.length < selectedRoom.max_occupancy) {
      setBookingData(prev => ({
        ...prev,
        guests: [...prev.guests, { name: '', age: '', aadhar: '' }]
      }));
    }
  };

  const removeGuest = (index) => {
    if (bookingData.guests.length > 1) {
      const updatedGuests = [...bookingData.guests];
      updatedGuests.splice(index, 1);
      setBookingData(prev => ({ ...prev, guests: updatedGuests }));
    }
  };

  const getRoomStatusInfo = (room) => {
    const isHotelBlocked = hotel && hotel.status === "blocked";
    if (isHotelBlocked) {
      return {
        status: "blocked",
        label: "Hotel License Suspended / Expired",
        badgeClass: "bg-rose-100 text-rose-900 border-rose-300 font-extrabold",
        isBookable: false,
        bookingText: "Hotel license suspended by administration",
        bookedRanges: [],
      };
    }

    const isHotelMaintenance = hotel && (hotel.status === "maintenance" || hotel.status === "under maintenance");
    if (isHotelMaintenance) {
      return {
        status: "maintenance",
        label: "Hotel Under Maintenance",
        badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
        isBookable: false,
        bookingText: null,
        bookedRanges: [],
      };
    }

    if (!room) {
      return {
        status: "available",
        label: "Available",
        badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
        isBookable: true,
        bookingText: null,
        bookedRanges: [],
      };
    }

    const roomStatus = (room.status || "").toLowerCase();
    const isMaintenance = roomStatus === "maintenance" || roomStatus === "under maintenance";

    if (isMaintenance) {
      return {
        status: "maintenance",
        label: "Under Maintenance",
        badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
        isBookable: false,
        bookingText: null,
        bookedRanges: [],
      };
    }

    if (room.isLocked && room.lockedByUserId !== userDetails.id) {
      return {
        status: "locked",
        label: "Temporarily Locked",
        badgeClass: "bg-orange-100 text-orange-800 border-orange-300 border",
        isBookable: false,
        bookingText: "Currently being booked by someone else",
        bookedRanges: [],
      };
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const activeBookings = roomBookings.filter(b => {
      const bRoomId = typeof b.room === 'object' ? b.room?._id : b.room;
      if (bRoomId !== room._id) return false;
      const bEnd = new Date(b.bookingEndDate);
      return bEnd >= todayStart && b.bookingStatus?.toLowerCase() !== "cancelled";
    });

    if (activeBookings.length > 0) {
      const sorted = [...activeBookings].sort((a, b) => new Date(a.bookingStartDate) - new Date(b.bookingStartDate));
      const currentOrNext = sorted[0];
      const startDateStr = new Date(currentOrNext.bookingStartDate).toLocaleDateString("en-GB");
      const endDateStr = new Date(currentOrNext.bookingEndDate).toLocaleDateString("en-GB");

      return {
        status: "booked",
        label: "Booked",
        badgeClass: "bg-rose-100 text-rose-800 border-rose-300",
        isBookable: true,
        bookingText: `Booked from ${startDateStr} to ${endDateStr}`,
        bookedRanges: sorted,
      };
    }

    return {
      status: "available",
      label: "Available",
      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
      isBookable: true,
      bookingText: null,
      bookedRanges: [],
    };
  };

  const validateStep1 = () => {
    if (!bookingData.startDate || !bookingData.endDate) {
      Swal.fire({
        icon: 'error',
        title: 'Dates Required',
        text: 'Please select both check-in and check-out dates',
        confirmButtonColor: '#ef4444',
      });
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(bookingData.startDate);
    const endDate = new Date(bookingData.endDate);

    if (startDate < today) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Date',
        text: 'Check-in date cannot be in the past',
        confirmButtonColor: '#ef4444',
      });
      return false;
    }

    if (endDate <= startDate) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Date',
        text: 'Check-out date must be after check-in date',
        confirmButtonColor: '#ef4444',
      });
      return false;
    }

    if (selectedRoom) {
      const statusInfo = getRoomStatusInfo(selectedRoom);
      for (let b of statusInfo.bookedRanges) {
        const bStart = new Date(b.bookingStartDate).getTime();
        const bEnd = new Date(b.bookingEndDate).getTime();
        const selStart = startDate.getTime();
        const selEnd = endDate.getTime();

        if (selStart < bEnd && selEnd > bStart) {
          const sDateStr = new Date(b.bookingStartDate).toLocaleDateString("en-GB");
          const eDateStr = new Date(b.bookingEndDate).toLocaleDateString("en-GB");
          Swal.fire({
            icon: 'error',
            title: 'Dates Overlap with Existing Booking',
            text: `This room is already booked from ${sDateStr} to ${eDateStr}. Please select dates outside this range.`,
            confirmButtonColor: '#ef4444',
          });
          return false;
        }
      }
    }

    return true;
  };

  const checkAvailability = async () => {
    if (hotel && hotel.status === "blocked") {
      Swal.fire({
        icon: 'error',
        title: 'Booking Unavailable',
        text: 'The operation license for this hotel has been suspended or expired by administration. Booking is currently disabled.',
        confirmButtonColor: '#ef4444',
      });
      return;
    }
    if (!validateStep1()) return;
    if (!selectedRoom && rooms.length > 0) {
      setSelectedRoom(rooms[0]);
    }
    if (!selectedRoom) {
      Swal.fire({
        icon: 'error',
        title: 'No Rooms',
        text: 'No available rooms found for this hotel.',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    setIsCheckingAvailability(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/booking/rooms/check-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({
          roomId: selectedRoom._id,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate
        })
      });

      if (!response.ok) throw new Error('Failed to check availability');

      const data = await response.json();
      setIsRoomAvailable(data.isAvailable);

      if (data.isAvailable) {
        setShowBookingModal(true);
        setBookingStep(2);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Room Unavailable',
          text: 'Selected room is not available for these dates',
          confirmButtonColor: '#ef4444',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to check availability. Please try again.',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const validateStep2 = () => {
    for (let guest of bookingData.guests) {
      if (!guest.name || !guest.age || !guest.aadhar) {
        Swal.fire({
          icon: 'error',
          title: 'Incomplete Details',
          text: 'Please fill all guest details',
          confirmButtonColor: '#ef4444',
        });
        return false;
      }

      if (isNaN(guest.age) || guest.age < 1 || guest.age > 120) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Age',
          text: 'Please enter a valid age for all guests',
          confirmButtonColor: '#ef4444',
        });
        return false;
      }

      if (guest.aadhar.length !== 12 || isNaN(guest.aadhar)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Aadhar',
          text: 'Please enter a valid 12-digit Aadhar number for all guests',
          confirmButtonColor: '#ef4444',
        });
        return false;
      }
    }

    if (selectedRoom && bookingData.guests.length > selectedRoom.max_occupancy) {
      Swal.fire({
        icon: 'error',
        title: 'Occupancy Limit',
        text: `Maximum occupancy for this room is ${selectedRoom.max_occupancy}`,
        confirmButtonColor: '#ef4444',
      });
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (bookingStep === 1 && !validateStep1()) return;
    if (bookingStep === 2 && !validateStep2()) return;
    setBookingStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setBookingStep(prev => prev - 1);
  };

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!validateStep2()) return;

    try {
      setPaymentLoading(true);

      const bookingResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({
          hotel: hotel._id,
          room: selectedRoom._id,
          bookingStartDate: bookingData.startDate,
          bookingEndDate: bookingData.endDate,
          personDetails: bookingData.guests,
          specialRequests: bookingData.specialRequests,
          totalAmount: totalAmount,
        })
      });

      if (!bookingResponse.ok) throw new Error('Booking creation failed');

      const bookingDataRes = await bookingResponse.json();
      const bookingId = bookingDataRes.data.bookingId;

      const razorpayLoaded = await initializeRazorpay();
      if (!razorpayLoaded) throw new Error('Razorpay SDK failed to load');

      const orderResponse = await axios.post(`${import.meta.env.VITE_API_URL}/create-order`, {
        amount: totalAmount * 100,
        bookingId: bookingId,
      });

      if (!orderResponse.data.success) throw new Error('Order creation failed');

      const options = {
        key: "rzp_test_v9MqYHIkxBNToL",
        amount: orderResponse.data.order.amount,
        currency: "INR",
        order_id: orderResponse.data.order.id,
        name: "Bookin-Hub",
        description: `Booking for ${hotel.name} - ${selectedRoom.room_type}`,
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.contact,
        },
        theme: {
          color: "#e11d48"
        },
        handler: async (response) => {
          try {
            const verificationResponse = await axios.post(
              `${import.meta.env.VITE_API_URL}/verify-payment`,
              response
            );
            if (verificationResponse.data.success) {
              setBookingConfirmed(true);
              setBookingStep(3);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            Swal.fire({
              icon: 'error',
              title: 'Verification Error',
              text: 'Payment verification failed. Please try again.',
              confirmButtonColor: '#ef4444',
            });
          }
        },
        modal: {
          ondismiss: () => setPaymentLoading(false),
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Payment processing failed. Please try again.',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const closeModal = () => {
    setShowBookingModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center font-[Poppins]">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-rose-500"></div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-600 flex justify-center items-center font-[Poppins]">
        <p className="text-xl font-medium">Hotel not found</p>
      </div>
    );
  }

  const hotelImages = hotel.hotelImages && hotel.hotelImages.length > 0
    ? hotel.hotelImages
    : [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80"
    ];

  return (
    <div className="bg-[#faf8ff] text-gray-900 min-h-screen pb-20 font-['Poppins']">
      <main className="max-w-[1280px] mx-auto pt-6 md:pt-10 px-4 md:px-8 space-y-8">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-rose-500 font-semibold transition-colors group"
        >
          <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Search</span>
        </button>

        {/* License Expired / Blocked Alert Banner */}
        {hotel.status === "blocked" && (
          <div className="bg-rose-50 border-2 border-rose-200/80 rounded-3xl p-6 flex items-start gap-4 shadow-sm">
            <FiAlertTriangle className="text-rose-600 text-3xl shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-lg text-rose-900 mb-1 flex items-center gap-2">
                <span>Hotel Operation License Suspended / Expired</span>
              </h3>
              <p className="text-sm text-rose-700 font-medium leading-relaxed">
                The official operating license for this property has been suspended or expired by administration. New room reservations and booking requests are currently disabled until further notice.
              </p>
            </div>
          </div>
        )}

        {/* Hero Gallery Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-[420px] md:h-[520px] rounded-3xl overflow-hidden shadow-lg border border-white/50 relative">
          {/* Main Hero Image */}
          <div
            onClick={() => setSelectedPhotoModal(true)}
            className="md:col-span-3 md:row-span-2 relative group cursor-pointer overflow-hidden bg-gray-900"
          >
            <img
              src={hotelImages[0]}
              alt={hotel.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-6 md:p-10">
              <div className="text-white">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="bg-rose-600/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md">
                    Top Rated Property
                  </span>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className="fill-amber-400 text-amber-400 text-sm" />
                    ))}
                  </div>
                  {hotel.averageRating && (
                    <span className="text-xs text-white/90 font-bold ml-1">
                      {hotel.averageRating.toFixed(1)} / 5
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
                  {hotel.name}
                </h1>
                <p className="text-white/90 text-sm md:text-base mt-2 flex items-center font-medium">
                  <FiMapPin className="mr-2 text-rose-400 text-lg" />
                  {hotel.address?.area}, {hotel.address?.district}, {hotel.address?.pincode}
                </p>
              </div>
            </div>
          </div>

          {/* Sub Image 1 */}
          <div
            onClick={() => setSelectedPhotoModal(true)}
            className="hidden md:block relative group cursor-pointer overflow-hidden bg-gray-900"
          >
            <img
              src={hotelImages[1] || hotelImages[0]}
              alt={`${hotel.name} Interior`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>

          {/* Sub Image 2 with overlay */}
          <div
            onClick={() => setSelectedPhotoModal(true)}
            className="hidden md:block relative group cursor-pointer overflow-hidden bg-gray-900"
          >
            <img
              src={hotelImages[2] || hotelImages[0]}
              alt={`${hotel.name} View`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white text-xs font-bold border border-white/60 px-4 py-2 rounded-full bg-black/30">
                View all photos ({hotelImages.length})
              </span>
            </div>
          </div>
        </section>

        {/* Main Layout Content */}
        <div className="space-y-10 pb-12">

          {/* Hotel Under Maintenance Alert Banner */}
          {hotel && (hotel.status === "maintenance" || hotel.status === "under maintenance") && (
            <div className="bg-amber-50/90 border-2 border-amber-300 p-5 rounded-3xl flex items-center gap-4 text-amber-900 shadow-md backdrop-blur-md">
              <FiAlertTriangle className="text-3xl text-amber-600 shrink-0" />
              <div>
                <h3 className="font-extrabold text-base">Hotel Under Maintenance</h3>
                <p className="text-xs text-amber-800 font-semibold mt-0.5">This property is currently undergoing maintenance. Room bookings are temporarily unavailable.</p>
              </div>
            </div>
          )}

          {/* About Property */}
          <section className="bg-white/70 backdrop-blur-2xl border border-white/50 p-8 rounded-3xl shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
              About this property
            </h2>
            <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line">
              {hotel.description || "Experience top-tier hospitality and luxurious comfort at this stunning property. Enjoy modern amenities, delicious dining options, and exceptional customer service throughout your stay."}
            </p>
          </section>

          {/* Amenities Bento Grid */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">
              Hotel Amenities & Features
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {((hotel.amenities && hotel.amenities.length > 0) ? hotel.amenities : (hotel.facilities && hotel.facilities.length > 0) ? hotel.facilities : null) ? (
                ((hotel.amenities && hotel.amenities.length > 0) ? hotel.amenities : hotel.facilities).map((amenity, index) => (
                  <div
                    key={index}
                    className="bg-white/70 backdrop-blur-md border border-gray-200/60 p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 hover:border-rose-300 hover:bg-rose-50/30 transition-all duration-300 group"
                  >
                    <span className="text-rose-500 text-3xl group-hover:scale-110 transition-transform">
                      {getAmenityIcon(amenity)}
                    </span>
                    <span className="text-xs font-bold text-gray-700 capitalize">
                      {amenity}
                    </span>
                  </div>
                ))
              ) : (
                [
                  { name: 'Free Wi-Fi', icon: <FiWifi /> },
                  { name: 'Swimming Pool', icon: <MdOutlinePool /> },
                  { name: 'Spa & Wellness', icon: <MdOutlineSpa /> },
                  { name: 'Fitness Center', icon: <MdOutlineFitnessCenter /> },
                  { name: 'Fine Dining', icon: <MdOutlineRestaurant /> },
                  { name: 'Free Parking', icon: <MdOutlineLocalParking /> },
                  { name: '24/7 Room Service', icon: <MdOutlineRoomService /> },
                  { name: 'Air Conditioning', icon: <FiWind /> },
                ].map((amenity, index) => (
                  <div
                    key={index}
                    className="bg-white/70 backdrop-blur-md border border-gray-200/60 p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 hover:border-rose-300 hover:bg-rose-50/30 transition-all duration-300 group"
                  >
                    <span className="text-rose-500 text-3xl group-hover:scale-110 transition-transform">
                      {amenity.icon}
                    </span>
                    <span className="text-xs font-bold text-gray-700">{amenity.name}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Room Types Listing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">
              Available Rooms
            </h2>
            {rooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rooms.map(room => {
                  const statusInfo = getRoomStatusInfo(room);
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      key={room._id}
                      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col relative"
                    >
                      {/* Status Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border shadow-md backdrop-blur-md ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      {/* Room Number Badge */}
                      {room.room_number && (
                        <div className="absolute top-3 right-3 z-10">
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-gray-900/80 text-white border border-white/20 shadow-md backdrop-blur-md">
                            Room {room.room_number}
                          </span>
                        </div>
                      )}

                      {/* Room Images Slider */}
                      <div className="h-56 relative bg-gray-100">
                        {room.room_images && room.room_images.length > 0 ? (
                          <Slider {...roomSliderSettings} className="h-full">
                            {room.room_images.map((image, index) => (
                              <div key={index} className="h-56">
                                <img
                                  src={image}
                                  alt={`${room.room_type} ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </Slider>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <span className="text-gray-400 font-medium">No images available</span>
                          </div>
                        )}
                      </div>

                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{room.room_type}</h3>
                            <p className="text-xs font-semibold text-gray-500 flex items-center gap-1 mt-1">
                              <FiUser className="text-rose-500 text-sm" />
                              <span>Capacity: <strong className="text-gray-800">{room.max_occupancy} Guests</strong></span>
                            </p>
                          </div>
                          <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg font-bold text-sm shrink-0">
                            ₹{room.room_price_per_day} <span className="font-normal text-xs">/ night</span>
                          </div>
                        </div>

                        {statusInfo.bookingText && (
                          <div className="mb-4 bg-rose-50/80 border border-rose-200 text-rose-800 p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                            <FiClock className="shrink-0 text-rose-600 text-sm" />
                            <span>{statusInfo.bookingText}</span>
                          </div>
                        )}

                        <p className="text-gray-600 mb-6 line-clamp-3 flex-grow">{room.description}</p>

                        <div className="mb-6">
                          <div className="flex flex-wrap gap-2">
                            {room.facilities && room.facilities.slice(0, 4).map((amenity, index) => (
                              <span key={index} className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-100/50">
                                <span className="text-sm">{getAmenityIcon(amenity)}</span>
                                {amenity}
                              </span>
                            ))}
                            {room.facilities && room.facilities.length > 4 && (
                              <span className="text-gray-400 text-xs font-medium py-1.5 px-1">+ {room.facilities.length - 4} more</span>
                            )}
                          </div>
                        </div>

                        {!statusInfo.isBookable ? (
                          <button
                            disabled
                            className="w-full py-3.5 bg-gray-200 text-gray-400 font-bold rounded-xl border border-gray-300 cursor-not-allowed text-sm"
                          >
                            {statusInfo.status === 'locked' ? 'Temporarily Locked' : (statusInfo.status === 'blocked' ? 'Unavailable' : 'Under Maintenance')}
                          </button>
                        ) : (
                          <button
                            className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-lg shadow-gray-900/10 active:scale-[0.98] text-sm cursor-pointer"
                            onClick={() => handleBookingModalOpen(room)}
                          >
                            Book This Room
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 font-medium">No rooms available for this hotel at the moment.</p>
            )}
          </section>

          {/* Guest Reviews Section */}
          <section className="bg-white/70 backdrop-blur-xl border border-gray-200/60 p-8 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Guest Reviews</h2>
                <p className="text-sm text-gray-500 mt-1">Based on verified guest experiences</p>
              </div>
              <div className="flex items-center bg-rose-50 border border-rose-100 p-4 rounded-2xl">
                <span className="text-3xl font-black text-rose-600 mr-3">{hotel?.averageRating || 5.0}</span>
                <div className="flex flex-col">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className={i < Math.round(hotel?.averageRating || 5) ? "fill-amber-400 text-amber-400 text-sm" : "text-gray-300 text-sm"} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-rose-700 mt-1">{hotel?.averageRating >= 4 ? "Excellent Rating" : (hotel?.averageRating >= 3 ? "Good Rating" : "Average Rating")}</span>
                </div>
              </div>
            </div>

            {reviews && reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review, index) => (
                  <div key={index} className="border border-gray-100 p-5 rounded-2xl bg-white/90 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-sm shrink-0">
                          {review.user?.profilePic ? (
                            <img src={review.user.profilePic} alt={review.user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{review.user?.name ? review.user.name.substring(0, 2).toUpperCase() : 'U'}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">{review.user?.name || "Guest"}</p>
                          <p className="text-xs text-gray-400">Verified Stay</p>
                        </div>
                      </div>
                      <div className="flex text-amber-400 text-xs shrink-0">
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} className={i < (review.rating || 5) ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 italic">
                      "{review.review || "No comments provided."}"
                    </p>
                    <div className="text-[10px] text-gray-400 mt-3 text-right">
                      {new Date(review.createdAt).toLocaleDateString("en-GB")}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-gray-500 font-medium">No reviews yet for this hotel.</p>
                <p className="text-sm text-gray-400 mt-1">Be the first to leave a review after your stay!</p>
              </div>
            )}
          </section>

        </div>

      </main>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedRoom && (
          <div className="fixed inset-0 flex justify-center items-center z-50 p-4 font-['Poppins']">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
                <h3 className="text-xl font-bold text-gray-900">
                  {bookingStep === 1 && 'Select Dates'}
                  {bookingStep === 2 && 'Guest Details'}
                  {bookingStep === 3 && (bookingConfirmed ? 'Booking Confirmed' : 'Review & Pay')}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">

                {/* Step 1: Dates */}
                {bookingStep === 1 && (() => {
                  const bookedIntervals = (getRoomStatusInfo(selectedRoom).bookedRanges || []).map(b => {
                    const s = parseYYYYMMDDToDate(b.bookingStartDate);
                    const e = parseYYYYMMDDToDate(b.bookingEndDate);
                    return { start: s, end: e };
                  });

                  return (
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <label className="block text-gray-700 font-medium mb-2 text-sm">Check-in Date</label>
                          <div className="relative">
                            <FiCalendar className="absolute left-4 top-3.5 text-rose-500 z-10 pointer-events-none" />
                            <DatePicker
                              selected={parseYYYYMMDDToDate(bookingData.startDate)}
                              onChange={(date) => {
                                const formatted = formatDateToYYYYMMDD(date);
                                setBookingData(prev => ({
                                  ...prev,
                                  startDate: formatted,
                                  endDate: prev.endDate && parseYYYYMMDDToDate(prev.endDate) <= date ? '' : prev.endDate
                                }));
                              }}
                              selectsStart
                              startDate={parseYYYYMMDDToDate(bookingData.startDate)}
                              endDate={parseYYYYMMDDToDate(bookingData.endDate)}
                              minDate={new Date()}
                              excludeDateIntervals={bookedIntervals}
                              dateFormat="dd/MM/yyyy"
                              placeholderText="Select Check-in Date"
                              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-rose-100 focus:border-rose-500 outline-none transition-all cursor-pointer font-semibold"
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="block text-gray-700 font-medium mb-2 text-sm">Check-out Date</label>
                          <div className="relative">
                            <FiCalendar className="absolute left-4 top-3.5 text-rose-500 z-10 pointer-events-none" />
                            <DatePicker
                              selected={parseYYYYMMDDToDate(bookingData.endDate)}
                              onChange={(date) => {
                                const formatted = formatDateToYYYYMMDD(date);
                                setBookingData(prev => ({ ...prev, endDate: formatted }));
                              }}
                              selectsEnd
                              startDate={parseYYYYMMDDToDate(bookingData.startDate)}
                              endDate={parseYYYYMMDDToDate(bookingData.endDate)}
                              minDate={bookingData.startDate ? parseYYYYMMDDToDate(bookingData.startDate) : new Date()}
                              excludeDateIntervals={bookedIntervals}
                              dateFormat="dd/MM/yyyy"
                              placeholderText="Select Check-out Date"
                              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-rose-100 focus:border-rose-500 outline-none transition-all cursor-pointer font-semibold"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-rose-50/50 border border-rose-100 p-5 rounded-2xl">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Selected Room Details</h4>
                        <p className="text-gray-700 font-semibold">{selectedRoom.room_type}</p>
                        <p className="text-gray-500 text-xs mt-1">Max Occupancy: {selectedRoom.max_occupancy} Guests</p>
                        <p className="text-rose-600 font-black text-xl mt-3">
                          ₹{selectedRoom.room_price_per_day} <span className="text-gray-400 text-xs font-normal">/ night</span>
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Step 2: Guests */}
                {bookingStep === 2 && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-bold text-gray-900">Guest Information</h4>
                      {bookingData.guests.length < selectedRoom.max_occupancy && (
                        <button
                          onClick={addGuest}
                          className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2 rounded-xl font-bold border border-rose-100 transition-colors"
                        >
                          + Add Guest
                        </button>
                      )}
                    </div>

                    {bookingData.guests.map((guest, index) => (
                      <div key={index} className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 space-y-4">
                        <div className="flex justify-between items-center">
                          <h5 className="text-xs font-bold text-gray-700 uppercase">Guest #{index + 1}</h5>
                          {index > 0 && (
                            <button
                              onClick={() => removeGuest(index)}
                              className="text-xs text-rose-500 hover:text-rose-700 font-bold"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Full Name</label>
                            <input
                              type="text"
                              name="name"
                              value={guest.name}
                              onChange={(e) => handleGuestChange(index, e)}
                              placeholder="John Doe"
                              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-rose-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Age</label>
                            <input
                              type="number"
                              name="age"
                              min="1"
                              max="120"
                              value={guest.age}
                              onChange={(e) => handleGuestChange(index, e)}
                              placeholder="25"
                              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-rose-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Aadhar Number (12 digits)</label>
                            <input
                              type="text"
                              name="aadhar"
                              maxLength="12"
                              value={guest.aadhar}
                              onChange={(e) => handleGuestChange(index, e)}
                              placeholder="123456789012"
                              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-rose-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Special Requests (Optional)</label>
                      <textarea
                        name="specialRequests"
                        value={bookingData.specialRequests}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Any special requirements..."
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Review */}
                {bookingStep === 3 && !bookingConfirmed && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                      <h4 className="text-lg font-bold text-gray-900 flex items-center">
                        <FiCheck className="mr-2 text-emerald-500" /> Booking Summary
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-2">
                          <p className="text-gray-500 text-xs font-bold uppercase">Stay Details</p>
                          <p><span className="text-gray-600 font-medium">Room:</span> <span className="font-bold text-gray-900">{selectedRoom.room_type}</span></p>
                          <p><span className="text-gray-600 font-medium">Check-In:</span> <span className="font-bold text-gray-900">{new Date(bookingData.startDate).toLocaleDateString()}</span></p>
                          <p><span className="text-gray-600 font-medium">Check-Out:</span> <span className="font-bold text-gray-900">{new Date(bookingData.endDate).toLocaleDateString()}</span></p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-gray-500 text-xs font-bold uppercase">Price Breakdown</p>
                          <p className="flex justify-between"><span>Room Charges:</span> <span className="font-bold">₹{totalAmount}</span></p>
                          <p className="flex justify-between text-xs text-gray-400"><span>Taxes & Fees:</span> <span>Included</span></p>
                          <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-black">
                            <span>Total Amount:</span>
                            <span className="text-rose-600">₹{totalAmount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3 Confirmed */}
                {bookingStep === 3 && bookingConfirmed && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-6 text-center"
                  >
                    <div className="mb-4">
                      <Lottie options={defaultOptions} height={160} width={160} />
                    </div>
                    <h4 className="text-2xl font-black text-gray-900 mb-2">Booking Confirmed!</h4>
                    <p className="text-gray-500 text-sm mb-6">
                      Your stay at <span className="font-bold text-gray-800">{hotel.name}</span> has been confirmed.
                    </p>

                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl w-full max-w-sm text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Booking ID:</span>
                        <span className="font-mono font-bold text-gray-900">#BK{Math.floor(Math.random() * 1000000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Paid:</span>
                        <span className="font-bold text-emerald-600">₹{totalAmount}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-5 flex justify-between items-center rounded-b-3xl">
                {bookingStep > 1 && bookingStep < 3 && (
                  <button
                    onClick={handlePrevStep}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors"
                  >
                    Back
                  </button>
                )}

                {bookingStep === 1 && (
                  <button
                    onClick={handleNextStep}
                    className="ml-auto px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-rose-500/20 active:scale-95 transition-all"
                  >
                    Continue
                  </button>
                )}

                {bookingStep === 2 && (
                  <button
                    onClick={handleNextStep}
                    className="ml-auto px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-rose-500/20 active:scale-95 transition-all"
                  >
                    Review Booking
                  </button>
                )}

                {bookingStep === 3 && !bookingConfirmed && (
                  <button
                    onClick={handlePayment}
                    disabled={paymentLoading}
                    className="ml-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center"
                  >
                    {paymentLoading ? 'Processing...' : 'Pay & Confirm'}
                  </button>
                )}

                {bookingConfirmed && (
                  <button
                    onClick={closeModal}
                    className="ml-auto px-8 py-3 bg-gray-900 hover:bg-black text-white font-bold text-sm rounded-xl shadow-md"
                  >
                    Close
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhotoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="relative max-w-4xl w-full">
              <button
                onClick={() => setSelectedPhotoModal(false)}
                className="absolute -top-12 right-0 text-white font-bold text-lg p-2"
              >
                Close ✕
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[80vh] overflow-y-auto p-2">
                {hotelImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${hotel.name} Photo ${idx + 1}`}
                    className="w-full h-64 object-cover rounded-2xl"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HotelDetailsPage;