import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMapPin, FiDollarSign, FiStar, FiArrowLeft, FiUser, FiCalendar, FiCheck, FiWifi, FiTv, FiCoffee, FiWind, FiShield, FiPackage, FiTruck, FiClock, FiActivity, FiBriefcase, FiAperture } from 'react-icons/fi';
import { MdOutlinePool, MdOutlineRestaurant, MdOutlineLocalParking, MdOutlineFitnessCenter, MdOutlineSpa, MdOutlineElevator, MdOutlineRoomService, MdOutlineAirplanemodeActive, MdOutlineMeetingRoom } from 'react-icons/md';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'react-lottie';
import successAnimation from './success-animation.json';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const HotelDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
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
  const [userDetails, setUserDetails] = useState({
    id: "",
    name: "",
    email: "",
    contact: "",
  });

  // Animation options
  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: successAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  // Slider settings for hotel images
  const hotelSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: true,
    adaptiveHeight: true
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
          text: 'Failed to initialize page. Please try again.',
          confirmButtonColor: '#e53e3e',
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
          confirmButtonColor: '#e53e3e',
        }).then(() => navigate('/hotels'));
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
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setTotalAmount(diffDays * selectedRoom.room_price_per_day);
    }
  }, [bookingData.startDate, bookingData.endDate, selectedRoom]);

  const getImageUrl = (imagePath) => {
    const cleanedPath = imagePath.replace(/^public[\\/]/, '');
    return `${import.meta.env.VITE_API_URL}/${cleanedPath.replace(/\\/g, '/')}`;
  };

  const handleImageLoad = (index) => {
    setImageLoading(prev => ({ ...prev, [index]: false }));
  };

  const handleImageError = (index) => {
    setImageLoading(prev => ({ ...prev, [index]: false }));
  };

  const getAmenityIcon = (name) => {
    const amenityMap = {
      'wifi': <FiWifi />,
      'wi-fi': <FiWifi />,
      'ac': <FiWind />,
      'air conditioning': <FiWind />,
      'tv': <FiTv />,
      'television': <FiTv />,
      'parking': <MdOutlineLocalParking />,
      'free parking': <MdOutlineLocalParking />,
      'pool': <MdOutlinePool />,
      'swimming pool': <MdOutlinePool />,
      'gym': <MdOutlineFitnessCenter />,
      'fitness center': <MdOutlineFitnessCenter />,
      'spa': <MdOutlineSpa />,
      'restaurant': <MdOutlineRestaurant />,
      'breakfast': <FiCoffee />,
      'coffee': <FiCoffee />,
      'security': <FiShield />,
      'room service': <MdOutlineRoomService />,
      'elevator': <MdOutlineElevator />,
      'airport transfer': <MdOutlineAirplanemodeActive />,
      'workspace': <FiBriefcase />,
      'meeting room': <MdOutlineMeetingRoom />,
      'laundry': <FiPackage />,
      'shuttle': <FiTruck />,
      '24/7': <FiClock />,
    };

    const lowercaseName = name.toLowerCase();
    for (const key in amenityMap) {
      if (lowercaseName.includes(key)) return amenityMap[key];
    }
    return <FiCheck />;
  };

  const handleBookingModalOpen = (room) => {
    setSelectedRoom(room);
    setShowBookingModal(true);
    setBookingStep(1);
    setBookingData({
      startDate: '',
      endDate: '',
      guests: [{ name: '', age: '', aadhar: '' }],
      specialRequests: '',
    });
    setBookingConfirmed(false);
    setIsRoomAvailable(true);
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
    if (bookingData.guests.length < selectedRoom.max_occupancy) {
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

  const checkAvailability = async () => {
    if (!validateStep1()) return;

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
        handleNextStep();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Unavailable',
          text: 'Selected room is not available for these dates',
          confirmButtonColor: '#e53e3e',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to check availability. Please try again.',
        confirmButtonColor: '#e53e3e',
      });
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const validateStep1 = () => {
    if (!bookingData.startDate || !bookingData.endDate) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please select both check-in and check-out dates',
        confirmButtonColor: '#e53e3e',
      });
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(bookingData.startDate);

    if (startDate < today) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Check-in date cannot be in the past',
        confirmButtonColor: '#e53e3e',
      });
      return false;
    }

    if (new Date(bookingData.endDate) <= new Date(bookingData.startDate)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Check-out date must be after check-in date',
        confirmButtonColor: '#e53e3e',
      });
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    for (let guest of bookingData.guests) {
      if (!guest.name || !guest.age || !guest.aadhar) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Please fill all guest details',
          confirmButtonColor: '#e53e3e',
        });
        return false;
      }

      if (isNaN(guest.age) || guest.age < 1 || guest.age > 120) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Please enter valid age for all guests',
          confirmButtonColor: '#e53e3e',
        });
        return false;
      }

      if (guest.aadhar.length !== 12 || isNaN(guest.aadhar)) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Please enter valid 12-digit Aadhar number for all guests',
          confirmButtonColor: '#e53e3e',
        });
        return false;
      }
    }

    if (bookingData.guests.length > selectedRoom.max_occupancy) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Maximum occupancy for this room is ${selectedRoom.max_occupancy}`,
        confirmButtonColor: '#e53e3e',
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

      // Create booking first
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
      const bookingDataResponse = await bookingResponse.json();

      // Initialize Razorpay
      const razorpayLoaded = await initializeRazorpay();
      if (!razorpayLoaded) throw new Error('Razorpay SDK failed to load');

      // Create payment order
      const orderResponse = await axios.post(`${import.meta.env.VITE_API_URL}/create-order`, {
        amount: totalAmount * 100, // Convert to paise
      });

      if (!orderResponse.data.success) throw new Error('Order creation failed');

      // Razorpay options
      const options = {
        key: "rzp_test_v9MqYHIkxBNToL", // Replace with your Razorpay Key ID
        amount: orderResponse.data.order.amount,
        currency: "INR",
        order_id: orderResponse.data.order.id,
        name: "Booking Hub",
        description: `Booking for ${hotel.name} - ${selectedRoom.room_type}`,
        prefill: userDetails,
        theme: { color: "#3399cc" },
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
              title: 'Error',
              text: 'Payment verification failed. Please try again.',
              background: '#1a202c',
              color: '#f56565',
              confirmButtonColor: '#e53e3e',
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
        confirmButtonColor: '#e53e3e',
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const closeModal = () => {
    setShowBookingModal(false);
    if (bookingConfirmed) {
      // Optional: Redirect or refresh data after successful booking
      // navigate('/my-bookings');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-600 flex justify-center items-center">
        <p className="text-xl font-medium">Hotel not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-[Poppins] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-red-600 mb-6 transition-colors font-medium"
        >
          <FiArrowLeft className="mr-2" /> Back to search results
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100">
          <div className="h-[500px] relative group">
            {hotel.hotelImages && hotel.hotelImages.length > 0 ? (
              <Slider {...hotelSliderSettings} className="h-full hotel-slider">
                {hotel.hotelImages.map((image, index) => (
                  <div key={index} className="h-[500px] relative focus:outline-none">
                    {imageLoading[index] && (
                      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                        <div className="animate-pulse flex space-x-4">
                          <div className="rounded-full bg-gray-200 h-16 w-16"></div>
                        </div>
                      </div>
                    )}
                    <img
                      src={getImageUrl(image)}
                      alt={`${hotel.name} ${index + 1}`}
                      className={`w-full h-full object-cover transition-opacity duration-700 ${imageLoading[index] ? 'opacity-0' : 'opacity-100'}`}
                      onLoad={() => handleImageLoad(index)}
                      onError={() => handleImageError(index)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                  </div>
                ))}
              </Slider>
            ) : (
              <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 font-medium">No images available</span>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-8 z-10 text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-md">{hotel.name}</h1>
              <div className="flex items-center text-lg drop-shadow-sm">
                <FiMapPin className="mr-2 text-red-400" />
                <span>{hotel.address?.area}, {hotel.address?.district}, {hotel.address?.pincode}</span>
              </div>
            </div>
          </div>

          <div className="p-8 bg-white">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-gray-100 pb-8 mb-8">
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Price Range</span>
                  <div className="flex items-center text-gray-900 font-bold text-2xl">
                    <span>₹ {hotel.minPrice || 'N/A'}</span>
                    <span className="mx-2 text-gray-400">-</span>
                    <span>₹ {hotel.maxPrice || 'N/A'}</span>
                  </div>
                </div>

                {hotel.averageRating && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Rating</span>
                    <div className="flex items-center">
                      <div className="flex items-center bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                        <FiStar className="text-green-500 mr-2 fill-green-500" />
                        <span className="text-green-700 font-bold text-lg">{hotel.averageRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button
                className="mt-6 md:mt-0 px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transform hover:-translate-y-0.5 transition-all duration-200"
                onClick={() => rooms.length > 0 && handleBookingModalOpen(rooms[0])}
              >
                Book Your Stay Now
              </button>
            </div>

            <div className="flex gap-8 border-b border-gray-200 mb-8">
              {['overview', 'rooms', 'amenities'].map((tab) => (
                <button
                  key={tab}
                  className={`pb-4 px-2 font-semibold text-lg capitalize transition-all relative ${activeTab === tab
                    ? 'text-red-600'
                    : 'text-gray-500 hover:text-gray-800'
                    }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t-full"
                    />
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">About {hotel.name}</h2>
                <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">{hotel.description || 'No description available.'}</p>
              </div>
            )}

            {activeTab === 'rooms' && (
              <div className="animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Rooms</h2>
                {rooms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rooms.map(room => (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        key={room._id}
                        className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
                      >
                        {/* Room Images Slider */}
                        <div className="h-56 relative bg-gray-100">
                          {room.room_images && room.room_images.length > 0 ? (
                            <Slider {...roomSliderSettings} className="h-full">
                              {room.room_images.map((image, index) => (
                                <div key={index} className="h-56">
                                  <img
                                    src={getImageUrl(image)}
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
                            <h3 className="text-xl font-bold text-gray-900">{room.room_type}</h3>
                            <div className="bg-red-50 text-red-700 px-3 py-1 rounded-lg font-bold text-sm">
                              ₹{room.room_price_per_day} <span className="font-normal text-xs">/ night</span>
                            </div>
                          </div>

                          <p className="text-gray-600 mb-6 line-clamp-3 flex-grow">{room.description}</p>

                          <div className="mb-6">
                            <div className="flex flex-wrap gap-2">
                              {room.facilities.slice(0, 4).map((amenity, index) => (
                                <span key={index} className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-100/50">
                                  <span className="text-sm">{getAmenityIcon(amenity)}</span>
                                  {amenity}
                                </span>
                              ))}
                              {room.facilities.length > 4 && (
                                <span className="text-gray-400 text-xs font-medium py-1.5 px-1">+ {room.facilities.length - 4} more</span>
                              )}
                            </div>
                          </div>

                          <button
                            className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-lg shadow-gray-900/10 active:scale-[0.98]"
                            onClick={() => handleBookingModalOpen(room)}
                          >
                            Book This Room
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 font-medium">No rooms available for this hotel at the moment.</p>
                )}
              </div>
            )}

            {activeTab === 'amenities' && (
              <div className="animate-fadeIn">
                <div className="flex items-center gap-3 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Hotel Amenities</h2>
                  <div className="h-px flex-grow bg-gray-100"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {hotel.facilities && hotel.facilities.length > 0 ? (
                    hotel.facilities.map((amenity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
                      >
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-3 text-2xl group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                          {getAmenityIcon(amenity)}
                        </div>
                        <span className="text-gray-700 font-bold text-sm text-center group-hover:text-blue-700 transition-colors uppercase tracking-tight">{amenity}</span>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-gray-500 font-medium">No amenities listed for this hotel.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedRoom && (
          <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
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
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10 font-[Poppins]"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex justify-between items-center z-10">
                <h3 className="text-xl font-bold text-gray-900">
                  {bookingStep === 1 && 'Select Dates'}
                  {bookingStep === 2 && 'Guest Details'}
                  {bookingStep === 3 && bookingConfirmed ? 'Booking Confirmed' : 'Review & Pay'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                {/* Step 1: Date Selection */}
                {bookingStep === 1 && (
                  <div className="space-y-6">
                    {/* Room Images in Booking Modal */}
                    <div className="h-48 rounded-xl overflow-hidden shadow-sm">
                      {selectedRoom.room_images && selectedRoom.room_images.length > 0 ? (
                        <Slider {...roomSliderSettings} className="h-full">
                          {selectedRoom.room_images.map((image, index) => (
                            <div key={index} className="h-48">
                              <img
                                src={getImageUrl(image)}
                                alt={`${selectedRoom.room_type} ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </Slider>
                      ) : (
                        <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-400">No images available</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2 text-sm">Check-in Date</label>
                        <div className="relative">
                          <FiCalendar className="absolute left-4 top-3.5 text-red-500" />
                          <input
                            type="date"
                            name="startDate"
                            value={bookingData.startDate}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2 text-sm">Check-out Date</label>
                        <div className="relative">
                          <FiCalendar className="absolute left-4 top-3.5 text-red-500" />
                          <input
                            type="date"
                            name="endDate"
                            value={bookingData.endDate}
                            onChange={handleInputChange}
                            min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 p-5 rounded-xl">
                      <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                        <span className="w-1 h-6 bg-red-500 rounded-full mr-2"></span>
                        Room Details
                      </h4>
                      <div className="space-y-1">
                        <p className="text-gray-700 font-medium text-lg">{selectedRoom.room_type}</p>
                        <p className="text-gray-500 text-sm">Max Occupancy: {selectedRoom.max_occupancy} Guests</p>
                        <p className="text-red-500 font-bold text-lg mt-2">₹ {selectedRoom.room_price_per_day} <span className="text-gray-400 text-xs font-normal">/ night</span></p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Guest Details */}
                {bookingStep === 2 && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-bold text-gray-800">Guest Information</h4>
                        {bookingData.guests.length < selectedRoom.max_occupancy && (
                          <button
                            onClick={addGuest}
                            className="text-sm bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium transition-colors border border-red-100"
                          >
                            + Add Guest
                          </button>
                        )}
                      </div>

                      {bookingData.guests.map((guest, index) => (
                        <div key={index} className="mb-8 last:mb-0 border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                          <div className="flex justify-between items-center mb-4">
                            <h5 className="text-md font-bold text-gray-700 bg-gray-50 px-3 py-1 rounded-lg">Guest {index + 1}</h5>
                            {index > 0 && (
                              <button
                                onClick={() => removeGuest(index)}
                                className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                              <div className="relative">
                                <FiUser className="absolute left-3.5 top-3.5 text-gray-400" />
                                <input
                                  type="text"
                                  name="name"
                                  value={guest.name}
                                  onChange={(e) => handleGuestChange(index, e)}
                                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all placeholder-gray-400"
                                  placeholder="John Doe"
                                  required
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                              <input
                                type="number"
                                name="age"
                                min="1"
                                max="120"
                                value={guest.age}
                                onChange={(e) => handleGuestChange(index, e)}
                                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all placeholder-gray-400"
                                placeholder="25"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Number</label>
                              <input
                                type="text"
                                name="aadhar"
                                value={guest.aadhar}
                                onChange={(e) => handleGuestChange(index, e)}
                                maxLength="12"
                                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all placeholder-gray-400"
                                placeholder="1234 5678 9012"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="mt-8 pt-6 border-t border-gray-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests (Optional)</label>
                        <textarea
                          name="specialRequests"
                          value={bookingData.specialRequests}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all placeholder-gray-400 resize-none"
                          placeholder="Any special requirements..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Review & Confirmation */}
                {bookingStep === 3 && !bookingConfirmed && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <FiCheck className="mr-2 text-green-500" /> Booking Summary
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h5 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Stay Details</h5>
                          <div className="space-y-3">
                            <div className="flex justify-between border-b border-gray-200 pb-2 border-dashed">
                              <span className="text-gray-600 font-medium">Room</span>
                              <span className="text-gray-900 font-bold">{selectedRoom.room_type}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 pb-2 border-dashed">
                              <span className="text-gray-600 font-medium">Check-in</span>
                              <span className="text-gray-900 font-bold">{new Date(bookingData.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 pb-2 border-dashed">
                              <span className="text-gray-600 font-medium">Check-out</span>
                              <span className="text-gray-900 font-bold">{new Date(bookingData.endDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 pb-2 border-dashed">
                              <span className="text-gray-600 font-medium">Duration</span>
                              <span className="text-gray-900 font-bold">{Math.ceil((new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24))} Nights</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 font-medium">Guests</span>
                              <span className="text-gray-900 font-bold">{bookingData.guests.length}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Price Breakdown</h5>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-gray-700">
                              <span>Room Charges</span>
                              <span className="font-medium">₹ {selectedRoom.room_price_per_day * Math.ceil((new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24))}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-500 text-sm">
                              <span>Taxes & Fees</span>
                              <span>Included</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200 mt-2">
                              <span className="font-bold text-gray-900 text-lg">Total Amount</span>
                              <span className="font-bold text-red-600 text-2xl">₹ {totalAmount}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <h5 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Guest Details</h5>
                        <div className="flex flex-wrap gap-2">
                          {bookingData.guests.map((guest, index) => (
                            <div key={index} className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
                              <p className="text-gray-800 font-medium text-sm">
                                <span className="text-gray-400 mr-2">#{index + 1}</span>
                                {guest.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Confirmation */}
                {bookingStep === 3 && bookingConfirmed && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-8"
                  >
                    <div className="mb-6">
                      <Lottie options={defaultOptions} height={180} width={180} />
                    </div>
                    <h4 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h4>
                    <p className="text-gray-500 text-center mb-8 max-w-sm">
                      Your stay at <span className="font-semibold text-gray-800">{hotel.name}</span> is secured.
                      Check your email for details.
                    </p>

                    <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl w-full max-w-md shadow-sm">
                      <div className="flex justify-between mb-3 border-b border-gray-200 border-dashed pb-3">
                        <span className="text-gray-500">Booking ID</span>
                        <span className="text-gray-900 font-mono font-bold bg-white px-2 py-0.5 rounded border border-gray-200">#BK{Math.floor(Math.random() * 1000000)}</span>
                      </div>
                      <div className="flex justify-between mb-3">
                        <span className="text-gray-500">Room Type</span>
                        <span className="text-gray-900 font-medium">{selectedRoom.room_type}</span>
                      </div>
                      <div className="flex justify-between mb-3">
                        <span className="text-gray-500">Dates</span>
                        <span className="text-gray-900 font-medium">
                          {new Date(bookingData.startDate).toLocaleDateString()} - {new Date(bookingData.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-gray-200 mt-2">
                        <span className="text-gray-900 font-bold">Total Paid</span>
                        <span className="text-green-600 font-bold">₹ {totalAmount}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-5 flex justify-between items-center z-10 rounded-b-2xl">
                {bookingStep > 1 && bookingStep < 3 && (
                  <button
                    onClick={handlePrevStep}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                  >
                    Back
                  </button>
                )}

                {bookingStep === 1 && (
                  <button
                    onClick={checkAvailability}
                    disabled={isCheckingAvailability}
                    className={`ml-auto px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 flex items-center transition-all ${isCheckingAvailability ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                  >
                    {isCheckingAvailability ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Checking...
                      </>
                    ) : (
                      'Check Availability'
                    )}
                  </button>
                )}

                {bookingStep === 2 && (
                  <button
                    onClick={handleNextStep}
                    disabled={paymentLoading}
                    className={`ml-auto px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 flex items-center transition-all ${paymentLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                  >
                    {paymentLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Continue to Payment'
                    )}
                  </button>
                )}

                {bookingStep === 3 && !bookingConfirmed && (
                  <button
                    onClick={handlePayment}
                    disabled={paymentLoading}
                    className={`ml-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 flex items-center transition-all ${paymentLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                  >
                    <FiCheck className="mr-2" /> Confirm Booking
                  </button>
                )}

                {bookingConfirmed && (
                  <button
                    onClick={closeModal}
                    className="ml-auto px-8 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-colors"
                  >
                    Done
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HotelDetailsPage;