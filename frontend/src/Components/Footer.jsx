import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaEnvelope, FaPhone, FaFacebookF, FaTwitter, FaInstagram, FaLinkedin, FaBuilding, FaInfoCircle, FaPhoneAlt } from "react-icons/fa";
import logo from "../assets/logo.png";

const Footer = () => {
  return (
    <footer className="relative bg-[#070913] text-white pt-16 pb-10 px-6 sm:px-10 border-t border-white/10 font-['Plus_Jakarta_Sans','Inter',sans-serif] overflow-hidden">
      {/* Background Subtle Glow Overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-48 bg-gradient-to-b from-rose-500/10 via-rose-500/5 to-transparent blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 text-center md:text-left relative z-10"
      >
        {/* Brand & Description */}
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center transition-transform hover:scale-105 duration-200"
          >
            <img src={logo} alt="Logo" className="h-10 w-auto object-contain rounded-xl shadow-md" />
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto md:mx-0 font-medium">
            Your premier platform for discovering and reserving extraordinary hotel stays. Exceptional hospitality starts here.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-rose-500 uppercase tracking-widest relative inline-block after:block after:w-10 after:h-0.5 after:bg-rose-500 after:mt-1.5 after:mx-auto md:after:mx-0">
            Navigation
          </h3>
          <ul className="space-y-2.5 pt-1">
            {[
              { name: "Hotels & Stays", link: "/booking/hotel", icon: FaBuilding },
              { name: "About Us", link: "/about", icon: FaInfoCircle },
              { name: "Contact Support", link: "/contact", icon: FaPhoneAlt },
            ].map((item, index) => (
              <motion.li
                key={index}
                whileHover={{ x: 6 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center md:justify-start"
              >
                <Link
                  to={item.link}
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-bold flex items-center gap-2"
                >
                  <item.icon size={13} className="text-rose-400" />
                  <span>{item.name}</span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-rose-500 uppercase tracking-widest relative inline-block after:block after:w-10 after:h-0.5 after:bg-rose-500 after:mt-1.5 after:mx-auto md:after:mx-0">
            Get in Touch
          </h3>
          <div className="space-y-3 pt-1 text-sm font-medium text-gray-300">
            <a
              href="mailto:support@bookinhub.com"
              className="flex items-center justify-center md:justify-start gap-3 hover:text-white transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <FaEnvelope size={13} />
              </div>
              <span>support@bookinhub.com</span>
            </a>
            <a
              href="tel:+18001234567"
              className="flex items-center justify-center md:justify-start gap-3 hover:text-white transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <FaPhone size={13} />
              </div>
              <span>+1 800 123 4567</span>
            </a>
          </div>

          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white py-2.5 px-5 rounded-xl text-xs font-extrabold shadow-md shadow-rose-600/25 active:scale-95 transition-all"
            >
              <span>Need Assistance?</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Social Media Icons & Divider */}
      <div className="max-w-[1280px] mx-auto mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-center">
        <div className="flex items-center gap-3">
          {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedin].map((Icon, index) => (
            <motion.a
              key={index}
              href="#"
              whileHover={{ y: -3, scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-rose-500 hover:border-rose-500 flex items-center justify-center transition-all duration-300"
            >
              <Icon size={14} />
            </motion.a>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-gray-400 text-xs font-bold">
          © {new Date().getFullYear()}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;