import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiStar, FiFilter } from 'react-icons/fi';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

const HotelSearchPage = () => {
  const [filters, setFilters] = useState({
    name: '',
    area: '',
    district: '',
  });

  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState({});
  const [showFilters, setShowFilters] = useState(false); // Filters hidden by default
  const navigate = useNavigate();

  const checkAuthOnPageLoad = (navigate, redirectPath = null) => {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'You need to be logged in to access this page',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Login Now',
        backdrop: 'rgba(0,0,0,0.4)'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login', { state: { from: redirectPath || window.location.pathname } });
        } else {
          navigate('/'); // Redirect to home if they cancel
        }
      });
      return false;
    }
    return true;
  };
  useEffect(() => {
    checkAuthOnPageLoad(navigate);
  }, [navigate]);

  useEffect(() => {
    // Initial fetch of all hotels
    handleSearch({ preventDefault: () => { } });
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    fade: true,
    cssEase: 'linear',
    arrows: false,
    adaptiveHeight: true,
    dotClass: "slick-dots !bottom-2",
    customPaging: () => (
      <div className="w-2 h-2 bg-gray-500 rounded-full mx-1 transition-all duration-300 hover:bg-red-500" />
    )
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonColor: '#ef4444',
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.area) params.append('area', filters.area);
      if (filters.district) params.append('district', filters.district);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/search?${params.toString()}`);

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message || 'Failed to fetch hotels');
      }

      const data = await response.json();
      setHotels(data.data);

      const loadingStates = {};
      data.data.forEach(hotel => {
        if (hotel.hotelImages) {
          hotel.hotelImages.forEach((_, index) => {
            loadingStates[`${hotel._id}-${index}`] = true;
          });
        }
      });
      setImageLoading(loadingStates);
    } catch (err) {
      showErrorAlert(err.message || 'Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleHotelClick = (hotelId) => {
    navigate(`/booking/hotel/${hotelId}`);
  };

  const getImageUrl = (imagePath) => {
    const cleanedPath = imagePath.replace(/^public[\\/]/, '');
    return `${import.meta.env.VITE_API_URL}/${cleanedPath.replace(/\\/g, '/')}`;
  };

  const handleImageLoad = (hotelId, index) => {
    setImageLoading(prev => ({
      ...prev,
      [`${hotelId}-${index}`]: false
    }));
  };

  const handleImageError = (hotelId, index) => {
    setImageLoading(prev => ({
      ...prev,
      [`${hotelId}-${index}`]: false
    }));
  };

  const resetFilters = () => {
    setFilters({
      name: '',
      area: '',
      district: '',
    });
    // Trigger search with empty filters
    setIsLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/hotel/search`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setHotels(data.data);
          // Set loading states for images...
          const loadingStates = {};
          data.data.forEach(hotel => {
            if (hotel.hotelImages) {
              hotel.hotelImages.forEach((_, index) => {
                loadingStates[`${hotel._id}-${index}`] = true;
              });
            }
          });
          setImageLoading(loadingStates);
        }
      })
      .catch(err => showErrorAlert(err.message))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="min-h-screen bg-gray-50 font-[Poppins] py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-[500px] h-[500px] bg-pink-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">Perfect Stay</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Find luxury hotels, budget stays, and everything in between with our curated selection.
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 mb-12 border border-white/50 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FiSearch className="text-red-500" /> Search Hotels
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300 font-medium"
            >
              <FiFilter className="text-red-500" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
          </div>

          <form onSubmit={handleSearch}>
            <div className={`grid grid-cols-1 gap-6 mb-6 ${showFilters ? 'block' : 'hidden'} transition-all duration-300 ease-in-out`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['name', 'area', 'district'].map(field => (
                  <div key={field} className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 capitalize tracking-wide">
                      {field}
                    </label>
                    <input
                      type="text"
                      name={field}
                      autoComplete='off'
                      value={filters[field]}
                      onChange={handleInputChange}
                      placeholder={`Enter ${field}`}
                      className="w-full rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 px-4 py-3 transition-all outline-none hover:border-gray-300"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/40 hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </>
                  ) : (
                    <>
                      <FiSearch className="text-xl" />
                      Search Hotels
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Search Button (shown when filters are hidden) */}
            <div className={`${!showFilters ? 'block' : 'hidden'}`}>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 text-lg"
              >
                <FiSearch className="text-xl" />
                {isLoading ? 'Searching...' : 'Search with Current Filters'}
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-32">
            <motion.div
              className="flex space-x-2 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="w-4 h-4 bg-red-500 rounded-full"
                  animate={{
                    y: ["0%", "-100%", "0%"],
                    scale: [1, 0.8, 1],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                    delay: index * 0.15,
                  }}
                />
              ))}
            </motion.div>
            <motion.p
              className="text-gray-500 font-medium text-lg animate-pulse"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Curating the best stays for you...
            </motion.p>
          </div>
        ) : hotels.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-8 px-2">
              <h2 className="text-2xl font-bold text-gray-800">
                <span className="text-red-500 text-3xl mr-2">{hotels.length}</span>
                {hotels.length === 1 ? 'Hotel' : 'Hotels'} Found
              </h2>
              <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                Sorted by: <span className="text-gray-900">Best Match</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotels.map(hotel => (
                <div
                  key={hotel._id}
                  className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-gray-300/50 transition-all duration-300 group border border-gray-100 hover:border-red-100 flex flex-col h-full transform hover:-translate-y-1"
                  onClick={() => handleHotelClick(hotel._id)}
                >
                  <div className="h-64 overflow-hidden relative">
                    {hotel.hotelImages && hotel.hotelImages.length > 0 ? (
                      <>
                        <Slider {...sliderSettings} className="h-full">
                          {hotel.hotelImages.map((image, index) => (
                            <div key={index} className="h-64 relative focus:outline-none">
                              {imageLoading[`${hotel._id}-${index}`] && (
                                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                                  <div className="animate-pulse flex space-x-4">
                                    <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                                  </div>
                                </div>
                              )}
                              <img
                                src={getImageUrl(image)}
                                alt={`${hotel.name} ${index + 1}`}
                                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${imageLoading[`${hotel._id}-${index}`] ? 'opacity-0' : 'opacity-100'}`}
                                onLoad={() => handleImageLoad(hotel._id, index)}
                                onError={() => handleImageError(hotel._id, index)}
                              />
                            </div>
                          ))}
                        </Slider>
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full flex items-center shadow-lg">
                          <FiStar className="text-yellow-500 mr-1 fill-yellow-500" />
                          <span>{hotel.averageRating ? hotel.averageRating.toFixed(1) : 'New'}</span>
                        </div>
                      </>
                    ) : (
                      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 font-medium">No images available</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-1">
                          {hotel.name}
                        </h3>
                      </div>

                      <div className="flex items-center text-gray-500 text-sm mb-3">
                        <FiMapPin className="mr-1.5 text-red-500 shrink-0" />
                        <span className="truncate">
                          {hotel.address?.area}, {hotel.address?.district}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">Price Range</p>
                          <p className="text-gray-900 font-bold text-lg">
                            ₹{hotel.minPrice || '0'} <span className="text-gray-400 text-sm font-normal">-</span> ₹{hotel.maxPrice || '0'}
                          </p>
                        </div>
                        <div className="flex items-center bg-green-50 px-3 py-1 rounded-lg border border-green-100">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          <span className="text-green-700 text-xs font-bold uppercase tracking-wider">Available</span>
                        </div>
                      </div>

                      <button
                        className="w-full py-3.5 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-gray-900/10 group-hover:shadow-gray-900/20 active:scale-[0.98]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHotelClick(hotel._id);
                        }}
                      >
                        View Details & Book
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          !isLoading && (
            <div className="text-center py-24 bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 max-w-2xl mx-auto">
              <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiSearch className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No hotels found</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">We couldn't find any hotels matching your search. Try different keywords or check a wider area.</p>
              <button
                onClick={resetFilters}
                className="px-8 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors shadow-lg"
              >
                Reset Filters
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default HotelSearchPage;