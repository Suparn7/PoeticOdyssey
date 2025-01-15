import React from 'react';

const NotFound = () => {
    const containerStyle = {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
    };

    const glassContainerStyle = {
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        borderRadius: '15px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        animation: 'slide-up 0.5s ease-in-out',
    };

    const headingStyle = {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        animation: 'fade-in 1s forwards',
        opacity: 0,
        animationDelay: '0.2s',
    };

    const paragraphStyle = {
        marginTop: '16px',
        fontSize: '1.25rem',
        animation: 'fade-in 1s forwards',
        opacity: 0,
        animationDelay: '0.4s',
    };

    return (
        <div style={containerStyle}>
            <style>
                {`
                    @keyframes slide-up {
                        from {
                            transform: translateY(20px);
                            opacity: 0;
                        }
                        to {
                            transform: translateY(0);
                            opacity: 1;
                        }
                    }
                    @keyframes fade-in {
                        to {
                            opacity: 1;
                        }
                    }
                    @media (max-width: 768px) {
                        h1 {
                            font-size: 2rem; // Responsive heading size
                        }
                        p {
                            font-size: 1rem; // Responsive paragraph size
                        }
                    }
                `}
            </style>
            <div style={glassContainerStyle}>
                <h1 style={headingStyle}>404 Not Found</h1>
                <p style={paragraphStyle}>Sorry, the page you are looking for does not exist.</p>
            </div>
        </div>
    );
};

export default NotFound;
