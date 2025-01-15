import React from 'react';
import PoeticOdysseyLogoBg from '../images/PoeticOddyseyLogoBg.png';



const Logo = ({ width = '100px', className = '' }) => {
  // Define the animation styles for the logo
  const logoStyle = {
    width,
    height: 'auto',
    borderRadius: '50%',
    animation: 'pulse 2s infinite ease-in-out, float 3s infinite ease-in-out, glow 1.5s infinite alternate, rotate 6s infinite linear, skew 4s infinite alternate, scaleUpDown 5s infinite alternate, colorShift 3s infinite alternate', // Multiple animations
    boxShadow: '0 0 10px rgba(95, 33, 211, 0.6)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    transformOrigin: 'center',
    filter: 'brightness(1.5)', // Adding some extra brightness to the logo for effect
  };

  return (
    <>
      <style>{`
        /* Pulsing animation */
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        /* Floating animation */
        @keyframes float {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0);
          }
        }

        /* Glowing effect */
        @keyframes glow {
          0% {
            box-shadow: 0 0 20px rgba(95, 33, 211, 0.6), 0 0 40px rgba(95, 33, 211, 0.4);
          }
          50% {
            box-shadow: 0 0 25px rgba(95, 33, 211, 0.8), 0 0 50px rgba(95, 33, 211, 0.6);
          }
          100% {
            box-shadow: 0 0 20px rgba(95, 33, 211, 0.6), 0 0 40px rgba(95, 33, 211, 0.4);
          }
        }

        /* Rotation animation */
        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Skew animation */
        @keyframes skew {
          0% {
            transform: skewX(0deg) skewY(0deg);
          }
          50% {
            transform: skewX(15deg) skewY(15deg);
          }
          100% {
            transform: skewX(0deg) skewY(0deg);
          }
        }

        /* Scaling up and down */
        @keyframes scaleUpDown {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        
      `}</style>
      <img
        src={PoeticOdysseyLogoBg}
        style={logoStyle}
        className={className}
        alt="Poetic Odyssey Logo"
      />
    </>
  );
};

export default Logo;
