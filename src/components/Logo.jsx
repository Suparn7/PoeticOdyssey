import React from 'react';
import logo from '../images/Logo.png';

const Logo = ({ width = "100%" }) => {
  // Define the animation styles
  const logoStyle = {
    width,
    borderRadius: '50%',
    maxWidth: '100%',
    height: 'auto',
    animation: 'revolve 4s linear infinite', // Adjust duration as needed
  };

  // Add the keyframes for the animation directly in the component
  const styleSheet = document.styleSheets[0];
  styleSheet.insertRule(`
    @keyframes revolve {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `, styleSheet.cssRules.length);

  return (
    <img 
      src={logo} 
      style={logoStyle} 
      alt='logo placeholder' 
    />
  );
}

export default Logo;
