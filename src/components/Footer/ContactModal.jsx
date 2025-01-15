import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import emailjs from 'emailjs-com'; // Import EmailJS
import conf from '../../conf/conf';

const ContactModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        setError(null);
        setSuccess(false);

        const templateParams = {
            from_email: email,
            message: message,
            to_email: conf.emailJsToEmail
        };

        try {
            await emailjs.send(conf.emailJsServiceId, conf.emailJsTemplateId, templateParams, conf.emailJsUserId);
            setSuccess(true);
            setEmail('');
            setMessage('');
            setTimeout(onClose, 2000);
        } catch (err) {
            setError('Failed to send message. Please try again later.');
            console.error('Email send error:', err);
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setSuccess(false);
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Custom keyframes for glow and scale effect on close button
    const glowKeyframes = `
        @keyframes glow {
            0% {
                box-shadow: 0 0 5px rgba(255, 255, 255, 0.7), 0 0 15px rgba(255, 255, 255, 0.6);
            }
            50% {
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.9), 0 0 20px rgba(255, 255, 255, 0.8);
            }
            100% {
                box-shadow: 0 0 5px rgba(255, 255, 255, 0.7), 0 0 15px rgba(255, 255, 255, 0.6);
            }
        }
    `;

    // Modal and form styles
    const modalStyle = {
        fixed: 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 transition-opacity duration-300',
        content: 'bg-white bg-opacity-30 backdrop-blur-md rounded-lg p-8 shadow-lg w-11/12 max-w-md transform transition-all duration-500 ease-in-out scale-95 hover:scale-100 relative',
        title: 'text-3xl font-semibold mb-6 text-white text-center animate__animated animate__fadeIn animate__delay-1s',
        error: 'text-red-500 animate__animated animate__fadeIn animate__delay-1s',
        success: 'text-green-500 animate__animated animate__fadeIn animate__delay-1s',
        input: 'w-full p-4 border-2 border-gray-300 rounded-lg bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 transform hover:ring-4 hover:ring-blue-500 placeholder:text-gray-400 placeholder:opacity-70',
        button: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-6 rounded-full shadow-xl transform transition-all duration-300 hover:scale-110 hover:bg-gradient-to-l hover:shadow-2xl hover:ring-4 hover:ring-indigo-500',
        cancelButton: 'py-3 px-6 rounded-full border border-gray-300 text-white bg-gradient-to-r from-red-500 to-indigo-300 shadow-lg transition-opacity duration-300 hover:opacity-80 hover:ring-4 hover:ring-red-500',
        glowEffect: 'animation-glow 1.5s ease-in-out infinite alternate',
        closeButton: 'absolute top-4 right-4 w-10 h-10 bg-transparent border-2 border-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 hover:rotate-45 transition-all duration-300 hover:bg-white hover:text-black animate-pulse'
    };

    return createPortal(
        <>
            <style>{glowKeyframes}</style> {/* Add custom keyframes inside JSX */}
            <div className={modalStyle.fixed}>
                <div className={modalStyle.content} style={{ animation: 'fadeIn 0.5s ease forwards' }}>
                    {/* Cross Button */}
                    <div onClick={onClose} className={modalStyle.closeButton}>
                        <span className="text-xl font-bold">×</span>
                    </div>
                    <h2 className={modalStyle.title}>Contact Us</h2>
                    {error && <p className={modalStyle.error}>{error}</p>}
                    {success && <p className={modalStyle.success}>Message sent successfully! You'll receive an update via email.</p>}
                    <form onSubmit={handleSubmit} className="animate__animated animate__fadeIn animate__delay-2s">
                        <div className="mb-6">
                            <label className="block mb-2 text-white text-lg">Your Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`${modalStyle.input} ${modalStyle.glowEffect}`} // Glow effect applied
                                placeholder="Your email address"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block mb-2 text-white text-lg">Your Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className={`${modalStyle.input} ${modalStyle.glowEffect}`} // Glow effect applied
                                rows="4"
                                placeholder="Write your message here..."
                                required
                            ></textarea>
                        </div>
                        <div className="flex justify-between space-x-4">
                            <button
                                type="submit"
                                className={modalStyle.button}
                                disabled={sending}
                            >
                                {sending ? 'Sending...' : 'Send'}
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
                                className={modalStyle.cancelButton}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>,
        document.body
    );
};

export default ContactModal;
