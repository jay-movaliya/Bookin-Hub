import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { FaHotel, FaMapMarkerAlt, FaArrowRight, FaUsers, FaGlobe, FaStar, FaChartLine, FaCalendarCheck, FaShieldAlt } from 'react-icons/fa';
import heroBg from '../assets/hero_bg.png';

const Home = () => {
  const navigate = useNavigate();
  const destinationsRef = useRef(null);

  const scrollToDestinations = () => {
    destinationsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const registrationOptions = [
    {
      id: 1,
      name: "Hotel Owner",
      icon: FaHotel,
      link: "/register/hotel/owner",
      desc: "List your property, manage rooms, and accept bookings from travelers across the platform.",
      perks: ["Owner dashboard", "Booking management", "Guest reviews & ratings"],
      cta: "Register as Hotel Owner",
      accent: "from-red-500 to-rose-400",
    },
  ];
  const options = [
    { id: 1, name: "Hotels", icon: FaHotel, link: "/booking/hotel" },
  ];

  const stats = [
    { id: 1, name: "Happy Travelers", value: "100K+", icon: FaUsers },
    { id: 2, name: "Destinations", value: "500+", icon: FaGlobe },
    { id: 3, name: "Hotels", value: "10K+", icon: FaHotel },
    { id: 4, name: "Satisfaction", value: "98%", icon: FaStar },
  ];

  const places = [
    {
      id: 1,
      name: "Bali, Indonesia",
      tag: "Tropical Escape",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: 2,
      name: "Paris, France",
      tag: "City of Lights",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: 3,
      name: "Santorini, Greece",
      tag: "Island Paradise",
      image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: 4,
      name: "Tokyo, Japan",
      tag: "Modern Metropolis",
      image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=800&auto=format&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-[Poppins] selection:bg-red-500/30 overflow-x-hidden relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-100/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/30 rounded-full blur-[120px] mix-blend-multiply animate-pulse delay-700"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-100/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse delay-1000"></div>
      </div>

      <div className="relative h-[90vh] flex items-center justify-center text-center px-6 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed transform scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url(${heroBg})` }}
        ></div>
        {/* Soft, bright gradient overlay instead of dark black overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-slate-900/15 to-slate-900/50 backdrop-blur-[0.5px]"></div>

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
            className="inline-block px-5 py-2 mb-6 rounded-full bg-white/90 border border-white/50 text-red-600 text-xs font-extrabold tracking-widest uppercase shadow-lg shadow-black/10 backdrop-blur-md"
          >
            ✨ Adventure Awaits
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-8 drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Discover Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">Extraordinary</span> Adventure
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-slate-100 font-semibold leading-relaxed max-w-2xl mx-auto mb-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
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
              onClick={() => navigate("/booking/hotel")}
              className="group bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold px-10 py-5 rounded-2xl shadow-[0_20px_40px_-12px_rgba(225,29,72,0.5)] transition-all transform hover:-translate-y-1 flex items-center gap-3 relative overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <FaHotel />
              <span>Book Hotels</span>
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={scrollToDestinations}
              className="px-8 py-5 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 text-white font-bold hover:bg-white/30 transition-all shadow-lg cursor-pointer"
            >
              Explore Destinations
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

      <div ref={destinationsRef} className="py-24 bg-white/40 backdrop-blur-sm scroll-mt-8">
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
            <button
              onClick={() => navigate("/booking/hotel")}
              className="text-red-500 font-bold flex items-center gap-2 hover:gap-4 transition-all pb-2 border-b-2 border-red-100 hover:border-red-500"
            >
              View All Destinations <FaArrowRight />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {places.map((place, index) => (
              <motion.div
                key={place.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate("/booking/hotel")}
                onKeyDown={(e) => e.key === "Enter" && navigate("/booking/hotel")}
                className="group relative h-[380px] rounded-[2.5rem] overflow-hidden shadow-2xl hover:shadow-red-500/20 transition-all duration-700 cursor-pointer"
                whileHover={{ y: -15 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <img
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  src={place.image}
                  alt={place.name}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 group-hover:from-red-950/80 transition-all duration-500"></div>

                <div className="absolute top-5 left-5">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-white/15 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/20">
                    {place.tag}
                  </span>
                </div>

                <div className="absolute bottom-0 p-8 w-full transform transition-transform duration-500">
                  <div className="flex items-center gap-2 text-red-300 mb-2 font-bold text-xs uppercase tracking-[0.2em]">
                    <FaMapMarkerAlt size={12} />
                    <span>Popular</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2 leading-tight">
                    {place.name}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/booking/hotel");
                    }}
                    className="h-0 overflow-hidden opacity-0 group-hover:h-12 group-hover:opacity-100 bg-white text-slate-900 font-bold px-6 rounded-xl transition-all duration-500 text-sm flex items-center justify-center gap-2 w-full"
                  >
                    Explore Stays <FaArrowRight size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>



      <div className="py-24 px-6 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-left"
            >
              <span className="inline-block px-4 py-1.5 mb-5 rounded-full bg-red-50 border border-red-100 text-red-600 text-xs font-bold tracking-widest uppercase">
                Partnership
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-5 tracking-tight leading-tight">
                Grow with <span className="text-red-500">Bookin-Hub</span>
              </h2>
              <p className="text-slate-500 text-lg font-medium leading-relaxed mb-8 max-w-lg">
                If you run a hotel property, Bookin-Hub gives you the tools to reach more guests and manage everything in one place.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: FaUsers, label: "100K+ travelers" },
                  { icon: FaChartLine, label: "Real-time analytics" },
                  { icon: FaShieldAlt, label: "Secure platform" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                      <item.icon size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-[2.5rem] overflow-hidden shadow-2xl h-72 lg:h-80"
            >
              <img
                src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=800&auto=format&fit=crop"
                alt="Hotel partnership"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-0 p-8">
                <div className="flex items-center gap-2 text-red-300 mb-2">
                  <FaCalendarCheck size={14} />
                  <span className="text-xs font-bold uppercase tracking-widest">Trusted by partners</span>
                </div>
                <p className="text-white font-bold text-xl leading-snug">
                  Start earning more with Bookin-Hub today
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto mt-12 group bg-gradient-to-br from-white to-slate-50/80 p-8 md:p-12 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.08)] transition-all duration-500 relative overflow-hidden border border-slate-100/80"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-left space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/20">
                    <FaHotel size={26} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                      Partner Program
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Hotel Owner Program</h3>
                  </div>
                </div>

                <p className="text-slate-500 font-medium leading-relaxed">
                  List your property, manage rooms, set pricing, and accept bookings from thousands of travelers across the platform.
                </p>

                <div className="flex flex-wrap gap-2.5 pt-2">
                  {["Owner Dashboard", "Booking Management", "Guest Reviews & Ratings"].map((perk) => (
                    <span key={perk} className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
                      <span className="w-4 h-4 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0 text-[9px] font-extrabold">✓</span>
                      {perk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-auto shrink-0">
                <button
                  onClick={() => navigate("/register/hotel/owner")}
                  className="w-full md:w-auto px-8 py-5 bg-slate-900 hover:bg-red-600 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 shadow-xl shadow-slate-900/10 hover:shadow-red-500/30 hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
                >
                  <span>Register as Hotel Owner</span>
                  <FaArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;
