import React, { useEffect } from 'react';
import './NotificationToast.css'; // Ensure this CSS file is imported

const NotificationToast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); // Auto close after 3 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`notification ${type} absolute top-4 right-4 z-100`} onClick={onClose}>
            <span className="icon">
                {type === 'saved' && '💾'}
                {type === 'liked' && '❤️'}
                {type === 'success' && '✔️'}
                {type === 'error' && '❌'}
            </span>
            <span className="message">{message}</span>
        </div>
    );
};

export default NotificationToast;
