import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Send, ArrowRight, Globe, Clock } from 'lucide-react';
import { color, motion } from 'framer-motion';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Handle form input changes
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        setTimeout(() => {
            setIsSubmitting(false);
            setShowSuccess(true);
            setFormData({ name: '', email: '', subject: '', message: '' });

            // Hide success message after 3 seconds
            setTimeout(() => setShowSuccess(false), 3000);
        }, 1500);
    };

    // Load Poppins font
    useEffect(() => {
        const link = document.createElement("link");
        link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;800&display=swap";
        link.rel = "stylesheet";
        document.head.appendChild(link);

        document.body.style.fontFamily = "'Poppins', sans-serif";
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900 font-sans relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 opacity-10">
                    <div className="w-full h-full bg-[linear-gradient(to_right,#ff0000_1px,transparent_1px),linear-gradient(to_bottom,#ff0000_1px,transparent_1px)] bg-[size:50px_50px]"></div>
                </div>

                {/* Floating Red Particles */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-red-500/30"
                        initial={{
                            x: Math.random() * 100 + "%",
                            y: Math.random() * 100 + "%",
                            opacity: 0.2 + Math.random() * 0.3
                        }}
                        animate={{
                            x: [
                                Math.random() * 100 + "%",
                                Math.random() * 100 + "%",
                                Math.random() * 100 + "%"
                            ],
                            y: [
                                Math.random() * 100 + "%",
                                Math.random() * 100 + "%",
                                Math.random() * 100 + "%"
                            ],
                            opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{
                            duration: 15 + Math.random() * 20,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                ))}

                {/* Gradient Orbs */}
                <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-red-600/5 blur-3xl"></div>
                <div className="absolute -bottom-40 -right-20 w-96 h-96 rounded-full bg-red-600/5 blur-3xl"></div>
            </div>

            {/* Hero Section */}
            <motion.div
                className="relative h-[60vh] overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                {/* Background Image with Gradient Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-fixed"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')",
                    }}
                >
                    <div className="absolute "></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 max-w-5xl mx-auto">
                    <motion.h1
                        className="text-5xl md:text-7xl font-extrabold tracking-tight"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        <span className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 bg-clip-text text-transparent drop-shadow-lg">
                            Get in Touch
                        </span>
                    </motion.h1>

                    <motion.p
                        className="mt-6 text-xl md:text-2xl font-medium text-white max-w-3xl mx-auto leading-relaxed"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                    >
                        We're ready to make your travel dreams a reality
                    </motion.p>

                    <motion.div
                        className="mt-10 flex flex-wrap justify-center gap-3"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.6 }}
                    >
                        <a href="#contact-form" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-600/30">
                            Contact Us <ArrowRight className="w-4 h-4" />
                        </a>
                        <a href="#find-us" className="inline-flex items-center gap-2 bg-transparent border border-red-200 px-6 py-3 rounded-full font-semibold transition-all duration-300">
                            Find Our Locations <MapPin className="w-4 h-4" />
                        </a>
                    </motion.div>
                </div>

                {/* Divider */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1200 120"
                        preserveAspectRatio="none"
                        className="w-full h-20 text-gray-50 fill-current"
                    >
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C58.32,1.9,126.34,19.81,198.42,34.78S287.42,66.06,321.39,56.44Z"></path>
                    </svg>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24 relative z-10">
                {/* Contact Information Cards */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {contactMethods.map((method, index) => (
                        <motion.div
                            key={index}
                            className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl hover:shadow-red-600/10 group transition-all duration-300 hover:border-red-200 hover:-translate-y-1"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 * index }}
                        >
                            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4 group-hover:bg-red-100 transition-all duration-300">
                                <method.icon className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{method.title}</h3>
                            <p className="text-gray-600 mb-4">{method.description}</p>
                            {method.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-gray-700 mb-2 last:mb-0">
                                    {item}
                                </div>
                            ))}
                            {method.action && (
                                <a href={method.action.link} className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-medium mt-4 group-hover:underline">
                                    {method.action.text} <ArrowRight className="w-4 h-4" />
                                </a>
                            )}
                        </motion.div>
                    ))}
                </section>

                {/* Contact Form Section */}
                <section id="contact-form" className="flex flex-col lg:flex-row gap-12 scroll-mt-16">
                    {/* Form */}
                    <motion.div
                        className="flex-1 bg-white p-8 lg:p-10 rounded-2xl border border-gray-100 shadow-xl relative overflow-hidden"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-600/5 rounded-full blur-3xl -ml-10 -mb-10"></div>

                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                            Send Us a Message
                        </h2>

                        {showSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
                            >
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent Successfully!</h3>
                                <p className="text-gray-600">We'll get back to you as soon as possible.</p>
                            </motion.div>
                        ) : (
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full p-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all duration-300"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full p-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all duration-300"
                                            placeholder="john@example.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full p-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all duration-300"
                                        placeholder="How can we help you?"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="5"
                                        className="w-full p-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all duration-300"
                                        placeholder="Tell us about your travel plans..."
                                        required
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-4 rounded-lg font-semibold text-lg shadow-xl hover:shadow-red-600/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 relative overflow-hidden ${isSubmitting ? 'opacity-80' : ''}`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </motion.div>

                    {/* FAQ Section */}
                    <motion.div
                        className="flex-1 space-y-8"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                            Frequently Asked
                        </h2>

                        <div className="space-y-6">
                            {faqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="bg-white border border-gray-100 shadow-sm rounded-xl p-6 hover:border-red-200 transition-all duration-300 group"
                                >
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-all duration-300">{faq.question}</h3>
                                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6">
                            <a
                                href="#"
                                style={{ color: 'black' }}
                                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 px-6 py-3 rounded-full font-medium transition-all duration-300 border border-gray-200 shadow-sm"
                            >
                                View All FAQs <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </motion.div>
                </section>

                {/* Map Section */}
                <section id="find-us" className="scroll-mt-16">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                            Find Us
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Visit our offices around the world or connect with us virtually
                        </p>
                    </motion.div>

                    <motion.div
                        className="w-full h-96 bg-gray-50 rounded-2xl border border-gray-200 shadow-lg overflow-hidden relative"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        {/* Map Placeholder - Replace with actual map integration */}
                        <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1974&auto=format&fit=crop')" }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent"></div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="bg-white/95 backdrop-blur-md p-6 rounded-xl border border-gray-200 shadow-xl max-w-md w-full">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Headquarters</h3>
                                <p className="text-gray-600 mb-6">123 Travel Lane, Adventure City, CA 94103, USA</p>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Clock className="w-4 h-4 text-red-600" />
                                        <span>Mon-Fri: 9AM-6PM</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Phone className="w-4 h-4 text-red-600" />
                                        <span>+1 (555) 123-4567</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Mail className="w-4 h-4 text-red-600" />
                                        <span>info@bookinhub.com</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Globe className="w-4 h-4 text-red-600" />
                                        <span>www.bookinhub.com</span>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <a
                                        href="#"
                                        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300"
                                    >
                                        Get Directions <MapPin className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Office Locations */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                    >
                        {offices.map((office, index) => (
                            <div
                                key={index}
                                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:border-red-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{office.city}</h3>
                                <p className="text-gray-600 text-sm mb-3">{office.address}</p>
                                <a
                                    href="#"
                                    className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1 font-medium"
                                >
                                    View Details <ArrowRight className="w-3 h-3" />
                                </a>
                            </div>
                        ))}
                    </motion.div>
                </section>

                {/* CTA Section */}
                <motion.section
                    className="bg-gradient-to-r from-red-50 via-white to-red-50 rounded-3xl p-10 lg:p-16 text-center relative overflow-hidden border border-red-100 shadow-xl"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl"></div>

                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 relative z-10">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-10 relative z-10 font-medium">
                        Let our travel experts help you plan your perfect getaway. Contact us today!
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
                        <a
                            href="#contact-form"
                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-red-600/30 transition-all duration-300 transform hover:scale-105"
                        >
                            Contact Us Now
                        </a>
                        <a
                            href="#"
                            style={{ color: 'black' }}
                            className="bg-white hover:bg-gray-50 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 border border-red-200 shadow-sm"
                        >
                            View Destinations
                        </a>
                    </div>
                </motion.section>
            </div>

        </div>
    );
};

// Contact information data
const contactMethods = [
    {
        icon: Mail,
        title: "Email Us",
        description: "Our team is here to help you",
        items: [
            "support@bookinhub.com",
            "bookings@bookinhub.com"
        ],
        action: {
            text: "Send an email",
            link: "mailto:support@bookinhub.com"
        }
    },
    {
        icon: Phone,
        title: "Call Us",
        description: "Mon-Fri from 9AM to 6PM",
        items: [
            "+1 (555) 123-4567",
            "+1 (555) 987-6543"
        ],
        action: {
            text: "Call now",
            link: "tel:+15551234567"
        }
    },
    {
        icon: MapPin,
        title: "Visit Us",
        description: "Come say hello at our office",
        items: [
            "123 Travel Lane,",
            "Adventure City, CA 94103, USA"
        ],
        action: {
            text: "Get directions",
            link: "#find-us"
        }
    }
];

// FAQ data
const faqs = [
    {
        question: "How can I modify my booking?",
        answer: "You can modify your booking by logging into your account or contacting our customer support team directly. Changes are subject to availability and may incur additional fees."
    },
    {
        question: "What is your cancellation policy?",
        answer: "Our standard cancellation policy allows for a full refund if cancelled 48 hours before the scheduled departure. Specific packages may have different terms that are clearly stated during booking."
    }

];

// Office locations
const offices = [
    {
        city: "New York",
        address: "555 Madison Ave, New York, NY 10022"
    },
    {
        city: "London",
        address: "123 Oxford Street, London, UK W1D 2HG"
    },
    {
        city: "Tokyo",
        address: "1-1-2 Shibuya, Tokyo, Japan 150-0002"
    },
    {
        city: "Sydney",
        address: "42 Circular Quay, Sydney, NSW 2000"
    }
];

export default Contact;