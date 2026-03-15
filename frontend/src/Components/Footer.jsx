import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaHotel, FaCarAlt, FaEnvelope, FaPhone, FaFacebookF, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

// Import the logo (adjust the path based on your project structure)
import Logo from "../assets/logo.png"; // Replace with your actual logo path

const Footer = () => {
  return (
    <footer className="bg-black text-white py-16 px-6 sm:px-10 font-[Poppins]">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left"
      >
        {/* Brand & Description */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center md:justify-start">
            <img
              src={Logo}
              alt="Bookin Hub Logo"
              className="w-[200px] h-auto object-contain" // Increased size to w-[50px] for visibility
            />
          </div>
          <p className="text-gray-400 text-md mt-4 leading-relaxed max-w-xs mx-auto md:mx-0">
            Book your next cab or hotel with ease. Your journey starts here.
          </p>
          <motion.div
            className="mt-6 flex justify-center md:justify-start space-x-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <FaHotel className="text-red-500 text-2xl" />
            <FaCarAlt className="text-red-500 text-2xl" />
          </motion.div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-2xl font-semibold text-red-500 mb-6 relative after:block after:w-16 after:h-1 after:bg-red-500 after:mt-2 after:mx-auto md:after:mx-0 uppercase">
            Explore
          </h3>
          <ul className="space-y-4">
            {[
              { name: "Hotels", link: "/booking/hotel" },
              { name: "Cabs", link: "/booking/cab" },
              { name: "About", link: "/about" },
            ].map((item, index) => (
              <motion.li
                key={index}
                whileHover={{ scale: 1.1, x: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  to={item.link}
                  className="text-gray-400 hover:text-red-500 transition-all duration-300 text-lg"
                >
                  {item.name}
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-2xl font-semibold text-red-500 mb-6 relative after:block after:w-16 after:h-1 after:bg-red-500 after:mt-2 after:mx-auto md:after:mx-0 uppercase">
            Get in Touch
          </h3>
          <p className="text-gray-400 flex items-center justify-center md:justify-start space-x-3 text-lg hover:text-red-500 transition-all duration-300">
            <FaEnvelope className="text-red-500" /> <span>support@bookinhub.com</span>
          </p>
          <p className="text-gray-400 flex items-center justify-center md:justify-start space-x-3 text-lg mt-4 hover:text-red-500 transition-all duration-300">
            <FaPhone className="text-red-500" /> <span>+1 800 123 4567</span>
          </p>
          <Link
            to="/contact"
            className="mt-6 inline-block bg-red-500 text-white py-2 px-6 rounded-lg text-lg font-medium hover:bg-red-700 transition-all duration-300"
          >
            Contact Us
          </Link>
        </motion.div>
      </motion.div>

      {/* Social Media Icons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex justify-center space-x-8 mt-12"
      >
        {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedin].map((Icon, index) => (
          <motion.a
            key={index}
            href="#"
            className="text-gray-400 hover:text-red-500 transition-all duration-300"
            whileHover={{ scale: 1.2, rotate: 10 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <Icon size={28} />
          </motion.a>
        ))}
      </motion.div>

      {/* Copyright */}
      <p className="text-gray-500 text-center text-md mt-10">
        © {new Date().getFullYear()} Bookin Hub. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;