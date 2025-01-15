import React from 'react';

const Button = ({
    children, 
    type = "button",
    bgColor = "bg-blue-600",
    textColor = "text-white",
    className = "",
    ...props
}) => {
  return (
    <button 
      type={type}
      className={`px-4 py-2 rounded-lg text-sm md:text-base ${bgColor} ${textColor} ${className} transition-transform duration-200 hover:scale-105`} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
