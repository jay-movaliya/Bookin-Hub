import React, { useEffect } from 'react';
import { Rocket, Shield, Clock, Globe } from 'lucide-react'; // Lucide icons
import { FaUsers, FaStar, FaQuoteLeft, FaRocket } from 'react-icons/fa'; // React Icons

const About = () => {
    // Fallback for Poppins font loading
    useEffect(() => {
        const link = document.createElement("link");
        link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap";
        link.rel = "stylesheet";
        document.head.appendChild(link);

        // Ensure font is applied after loading
        link.onload = () => {
            document.body.style.fontFamily = "'Poppins', sans-serif";
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-poppins relative overflow-hidden">
            {/* Background Structure */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="w-full h-full bg-[linear-gradient(to_right,#ff0000_1px,transparent_1px),linear-gradient(to_bottom,#ff0000_1px,transparent_1px)] bg-[size:50px_50px]"></div>
            </div>

            {/* Hero Section */}
            <div className="relative h-[70vh] bg-white overflow-hidden">
                {/* Background Image with Gradient Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://plus.unsplash.com/premium_photo-1663090742176-ffe82fcea1fc?q=80&w=2094&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                    }}
                >
                    <div className="absolute inset-0"></div>
                </div>

                {/* Subtle Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#ff0000_1px,transparent_1px)] bg-[size:40px_40px] animate-pulse-slow z-0"></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 max-w-5xl mx-auto">
                    {/* Logo/Title */}
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight animate-fade-in-up">
                        <span className="bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent drop-shadow-lg">
                            BookinHub
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="mt-6 text-xl md:text-3xl font-medium text-gray-700 max-w-3xl mx-auto leading-relaxed animate-fade-in-down">
                        Discover a Universe of Seamless Adventures
                    </p>

                    {/* Button */}
                    <button className="mt-10 bg-red-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:bg-red-700 hover:shadow-red-600/50 transition-all duration-500 transform hover:scale-105 flex items-center justify-center gap-3 group">
                        <FaRocket className="w-6 h-6 group-hover:animate-bounce" />
                        <span>Start Your Journey</span>
                    </button>

                    {/* Decorative Elements */}
                    <div className="mt-8 flex items-center justify-center gap-4 animate-fade-in animate-delay-300">
                        <div className="h-1 w-16 bg-red-600/40 rounded-full"></div>
                        <div className="h-3 w-3 bg-red-600 rounded-full animate-pulse"></div>
                        <div className="h-1 w-16 bg-red-600/40 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-28 relative z-10">
                {/* Mission Section */}
                <section className="flex flex-col items-center text-center">
                    <FaStar className="text-5xl text-red-600 mb-6 animate-pulse" />
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                        Our Mission
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-4xl leading-relaxed animate-fade-in font-medium">
                        At BookinHub, we’re committed to revolutionizing the way you travel. Our mission is to
                        provide a platform that’s intuitive, secure, and inspiring—transforming every journey
                        into a seamless and unforgettable experience.
                    </p>
                </section>

                {/* Features Section */}
                <section>
                    <div className="flex justify-center items-center mb-12">
                        <Rocket className="w-12 h-12 text-red-600 mr-4 animate-spin-slow" />
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Why Choose Us</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: <Globe className="w-10 h-10 text-red-600" />, title: 'Global Reach', desc: 'Access a world of opportunities effortlessly.' },
                            { icon: <FaStar className="w-10 h-10 text-red-600" />, title: 'Top-Tier Options', desc: 'Handpicked experiences for every traveler.' },
                            { icon: <Shield className="w-10 h-10 text-red-600" />, title: 'Trusted Security', desc: 'Book with confidence, every time.' },
                            { icon: <Clock className="w-10 h-10 text-red-600" />, title: '24/7 Support', desc: 'We’re here for you, anytime, anywhere.' },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="group bg-white p-6 rounded-2xl border border-red-100 shadow-lg hover:shadow-red-600/20 hover:bg-red-50/50 transition-all duration-500 transform hover:-translate-y-2"
                            >
                                <div className="mb-4 group-hover:animate-pulse">{feature.icon}</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 group-hover:text-gray-800">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Team Section */}
                <section className="flex flex-col items-center text-center">
                    <FaUsers className="text-5xl text-red-600 mb-6 animate-pulse" />
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                        Our Team
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-4xl leading-relaxed mb-8 animate-fade-in font-medium">
                        We’re a team of passionate innovators and travel enthusiasts, dedicated to making
                        your booking experience exceptional. Let us guide you to your next adventure.
                    </p>
                    <div className="relative bg-white p-6 rounded-2xl border border-red-200 shadow-xl max-w-2xl transform hover:scale-105 transition-all duration-300">
                        <FaQuoteLeft className="absolute -top-4 -left-4 text-3xl text-red-600 animate-spin-slow" />
                        <p className="text-red-600 font-semibold italic text-lg md:text-xl animate-glow">
                            "We create pathways to your dream destinations."
                        </p>
                        <FaQuoteLeft className="absolute -bottom-4 -right-4 text-3xl text-red-600 animate-spin-slow transform rotate-180" />
                    </div>
                </section>
            </div>

            {/* Call to Action */}
            <div className="bg-white py-16 text-center border-t border-red-100 shadow-[0_-10px_40px_-15px_rgba(220,38,38,0.1)]">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 animate-pulse">
                    Ready to Elevate Your Booking Experience?
                </h3>
                <button className="bg-red-600 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-xl hover:bg-red-700 hover:shadow-red-600/50 transition-all duration-500 transform hover:scale-110 flex items-center justify-center gap-2 mx-auto group">
                    <Rocket className="w-6 h-6 group-hover:animate-bounce" />
                    Launch Your Journey
                </button>
            </div>
        </div>
    );
};

export default About;