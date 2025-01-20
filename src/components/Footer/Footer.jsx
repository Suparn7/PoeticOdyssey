import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Logo';
import ContactModal from './ContactModal'; // Import the modal component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons'; // Import FontAwesome Icons

function Footer() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Function to handle closing the modal and scrolling to the top
    const handleModalClose = () => {
        setIsModalOpen(false);
        window.scrollTo(0, 0); // Scroll to the top of the page
    };

    return (
        <section className="relative overflow-hidden mt-10 bg-opacity-40 backdrop-blur-md transition-all duration-500">
            <div className="relative z-10 mx-auto max-w-7xl px-4">
                <div className="flex flex-wrap justify-between">
                    {/* Logo Section */}
                    <div className="w-full p-4 md:w-1/3">
                        <div className="flex items-center justify-center mb-4">
                            <Logo width="100px" className="transition-all duration-500 ease-in-out transform hover:scale-110 animate-spin-slow" />
                            <span className="ml-4 text-2xl font-extrabold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 animate-bounce"></span>
                        </div>
                    </div>

                    {/* Follow Us Section */}
                    <div className="w-full p-4 md:w-1/3">
                        <h3 className="text-lg font-semibold text-white mb-4 text-center animate-bounce">Follow Us</h3>
                        <ul className="flex justify-center space-x-6">
                            <li className="relative">
                            <Link 
                                to="/" 
                                className="text-gray-400 hover:text-white transition duration-500 transform hover:scale-125 relative">
                                <FontAwesomeIcon 
                                icon={faFacebook} 
                                size="3x" 
                                className="border-4 border-transparent rounded-full p-3 transition-all duration-500 transform 
                                            hover:scale-110 hover:rotate-6 hover:border-blue-500 
                                            hover:shadow-2xl hover:text-blue-500 
                                            hover:animate-pulse hover:glow"
                                />
                            </Link>
                            </li>
                            <li className="relative">
                            <Link 
                                to="/" 
                                className="text-gray-400 hover:text-white transition duration-500 transform hover:scale-125 relative">
                                <FontAwesomeIcon 
                                icon={faTwitter} 
                                size="3x" 
                                className="border-4 border-transparent rounded-full p-3 transition-all duration-500 transform 
                                            hover:scale-110 hover:rotate-6 hover:border-blue-400 
                                            hover:shadow-2xl hover:text-blue-400 
                                            hover:animate-pulse hover:glow"
                                />
                            </Link>
                            </li>
                            <li className="relative">
                            <Link 
                                to="/" 
                                className="text-gray-400 hover:text-white transition duration-500 transform hover:scale-125 relative">
                                <FontAwesomeIcon 
                                icon={faInstagram} 
                                size="3x" 
                                className="border-4 border-transparent rounded-full p-3 transition-all duration-500 transform 
                                            hover:scale-110 hover:rotate-6 hover:border-pink-500 
                                            hover:shadow-2xl hover:text-pink-500 
                                            hover:animate-pulse hover:glow"
                                />
                            </Link>
                            </li>
                        </ul>
                        </div>




                    {/* Useful Links Section */}
                    <div className="w-full p-4 md:w-1/3">
                        <h3 className="text-lg font-semibold text-white mb-4 text-center animate-bounce">Useful Links</h3>
                        <ul className="text-center">
                            <li className="mb-2">
                                <Link to="/PoeticOdyssey" className="text-gray-400 hover:text-white transition duration-300 transform hover:scale-110">Terms & Conditions</Link>
                            </li>
                            <li className="mb-2">
                                <Link to="/PoeticOdyssey" className="text-gray-400 hover:text-white transition duration-300 transform hover:scale-110">Privacy Policy</Link>
                            </li>
                            <li>
                                <Link to="/PoeticOdyssey" className="text-gray-400 hover:text-white transition duration-300 transform hover:scale-110">Help Center</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Contact Us Button */}
                <div className="flex justify-center p-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className='ml-0 block text-center text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full shadow-xl transition-all duration-300 transform hover:bg-gradient-to-l hover:scale-105 hover:shadow-2xl px-6 py-3 animate-pulse'>
                        Contact Us
                    </button>
                </div>
            </div>
            
            {/* Modal for Contact Us */}
            <ContactModal isOpen={isModalOpen} onClose={handleModalClose} />

            {/* Copyright Section */}
            <div className="flex justify-center py-2">
                <p className="text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} Poetic Odyssey. All Rights Reserved.
                </p>
            </div>
        </section>
    );
}

export default Footer;
