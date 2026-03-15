import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { FaHotel, FaCarAlt, FaMapMarkerAlt, FaArrowRight, FaCar, FaUsers, FaGlobe, FaStar } from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const registrationOptions = [
    { id: 1, name: "Hotel Owner", icon: FaHotel, link: "/register/hotel/owner" },
    { id: 3, name: "Cab Driver", icon: FaCar, link: "/booking/ridersignup" },
  ];
  const options = [
    { id: 1, name: "Hotels", icon: FaHotel, link: "/booking/hotel" },
    { id: 3, name: "Car Rentals", icon: FaCarAlt, link: "/booking/cab" },
  ];

  const stats = [
    { id: 1, name: "Happy Travelers", value: "100K+", icon: FaUsers },
    { id: 2, name: "Destinations", value: "500+", icon: FaGlobe },
    { id: 3, name: "Hotels", value: "10K+", icon: FaHotel },
    { id: 4, name: "Satisfaction", value: "98%", icon: FaStar },
  ];

  const places = [
    { id: 1, name: "Bali, Indonesia", image: "https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: 2, name: "Paris, France", image: "https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
    { id: 3, name: "Santorini, Greece", image: "https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: 4, name: "Tokyo, Japan", image: "https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-[Poppins] selection:bg-red-500/30 overflow-x-hidden relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-100/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/30 rounded-full blur-[120px] mix-blend-multiply animate-pulse delay-700"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-100/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse delay-1000"></div>
      </div>

      <div className="relative h-[90vh] flex items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555057918-9aadd809fb71?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-fixed opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-[#fafafa]"></div>

        <motion.div
          className="relative z-10 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-red-50 border border-red-100 text-red-600 text-sm font-bold tracking-wide uppercase"
          >
            Adventure Awaits
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Discover Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">Extraordinary</span> Adventure
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            From secluded beaches to vibrant metropolises, we curate experiences that linger in your heart forever.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={() => navigate("/login")}
              className="group bg-slate-900 text-white font-bold px-10 py-5 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all transform hover:-translate-y-1 flex items-center gap-3 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span>Start Planning</span>
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-10 py-5 rounded-2xl bg-white border border-slate-200 text-slate-900 font-bold hover:bg-slate-50 transition-colors shadow-sm">
              Learn More
            </button>
          </motion.div>
        </motion.div>
      </div>

      <div className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.id}
                className="group p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                  <stat.icon size={26} />
                </div>
                <h3 className="text-4xl font-extrabold text-slate-900 mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                  {stat.name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-24 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl text-left">
              <h2 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                Escape to <span className="text-red-600">Paradise</span>
              </h2>
              <p className="text-slate-600 text-lg font-medium">
                Our hand-picked selections of the most breathtaking destinations around the globe.
              </p>
            </div>
            <button className="text-red-500 font-bold flex items-center gap-2 hover:gap-4 transition-all pb-2 border-b-2 border-red-100 hover:border-red-500">
              View All Destinations <FaArrowRight />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {places.map((place, index) => (
              <motion.div
                key={place.id}
                className="group relative h-[380px] rounded-[2.5rem] overflow-hidden shadow-2xl hover:shadow-red-500/20 transition-all duration-700"
                whileHover={{ y: -15 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <img
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  src={place.image}
                  alt={place.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-red-900/80 transition-all duration-500"></div>

                <div className="absolute bottom-0 p-8 w-full transform transition-transform duration-500">
                  <div className="flex items-center gap-2 text-red-400 mb-2 font-bold text-xs uppercase tracking-[0.2em]">
                    <FaMapMarkerAlt size={12} />
                    <span>Popular</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2 leading-tight">
                    {place.name}
                  </h3>
                  <button className="h-0 overflow-hidden opacity-0 group-hover:h-12 group-hover:opacity-100 bg-white text-slate-900 font-bold px-6 rounded-xl transition-all duration-500 text-sm flex items-center justify-center gap-2 w-full">
                    Explore <FaArrowRight size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-10 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto rounded-[3.5rem] bg-slate-900 p-8 md:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>

          <div className="relative z-10 text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
              Plan Your <span className="text-red-500 tracking-tighter italic">Ideal</span> Trip
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium">
              Seamlessly book the finest accommodations and transportation tailored to your journey.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap justify-center gap-8">
            {options.map((option) => (
              <motion.div
                key={option.id}
                className="w-full sm:w-[350px] bg-white/5 backdrop-blur-xl border border-white/10 p-7 rounded-[2.5rem] hover:bg-white/10 transition-all duration-500 group"
              >
                <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mb-8 border border-red-500/20 group-hover:scale-110 transition-transform">
                  <option.icon className="h-10 w-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4">{option.name}</h3>
                <p className="text-slate-400 text-base leading-relaxed mb-8 font-medium">
                  Discover curated {option.name.toLowerCase()} that match your premium lifestyle and travel needs.
                </p>
                <a
                  href={option.link}
                  className="inline-flex items-center gap-3 text-red-500 font-bold text-lg hover:gap-5 transition-all"
                >
                  Book Now <FaArrowRight />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-24 px-6 bg-slate-50/80">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-16">
            <h2 className="text-4xl sm:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Grow with <span className="text-red-500">BookinHub</span>
            </h2>
            <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto">
              Partner with us to reach millions of travelers and transform your hospitality business.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-10">
            {registrationOptions.map((option) => (
              <motion.div
                key={option.id}
                className="w-full sm:w-[400px] bg-white p-8 rounded-[3.5rem] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 relative group overflow-hidden border border-slate-100"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-8 border border-red-100">
                    <option.icon size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">{option.name}</h3>
                  <p className="text-slate-500 text-lg mb-10 leading-relaxed font-medium">
                    Scale your operations and maximize bookings with our advanced management tools and global platform.
                  </p>
                  <a
                    href={option.link}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-red-600 transition-colors shadow-lg"
                  >
                    Partner with Us
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-20 relative overflow-hidden text-center bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className="text-3xl font-black text-slate-900 mb-4">Ready to Start Your Journey?</h2>
          <p className="text-slate-500 font-medium mb-10">Join over 100k+ global travelers using BookinHub to explore the world.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="text"
              placeholder="Enter your email"
              className="px-8 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 min-w-[300px] font-medium"
            />
            <button className="bg-red-600 text-white font-bold px-10 py-4 rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
