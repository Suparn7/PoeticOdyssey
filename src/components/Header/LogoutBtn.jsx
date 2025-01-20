import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import authService from '../../appwrite/auth';
import { logout } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { clearUserData } from '../../store/userSlice';
import { clearNotification } from '../../store/notificationSlice';
import "../../styles/logout.css"

const LogoutBtn = ({handleMenuToggle}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false); // State for confirmation modal

    const logoutHandler = () => {
        setShowConfirm(true); // Show confirmation modal
        
    };

    const confirmLogout = async () => {
        await authService.logout();
        dispatch(logout());
        dispatch(clearUserData());
        dispatch(clearNotification()); // Clear notifications
        setShowConfirm(false); // Close confirmation modal

        //adding this check because menu toggle function is hit for hamburger icon toggle as well
        if(handleMenuToggle !== undefined) handleMenuToggle()
        navigate("/PoeticOdyssey/login");
    };

    const cancelLogout = () => {
        setShowConfirm(false); // Close confirmation modal
    };

    return (
        <div className="relative">
            {/* Confirmation Modal */}
            {showConfirm && (
               <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50 animate-glowBackground" style={{ top: '383px' }}>
               <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 text-white rounded-lg p-8 shadow-2xl max-w-lg w-10/12 z-60 transform transition-all animate-slideInLeft animate-popIn animate-glowingModal animate-tiltIn">
                   <h2 className="text-2xl font-extrabold mb-6 text-center text-yellow-400 animate-bounce animate-neonGlow">
                       Are you sure you want to logout?
                   </h2>
                   <div className="flex justify-center gap-6">
                       <button
                           onClick={confirmLogout}
                           className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transform hover:scale-110 transition duration-300 ease-in-out animate-popIn animate-buttonGlow animate-neonPulse"
                       >
                           Yes, Logout
                       </button>
           
                       <button
                           onClick={cancelLogout}
                           className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transform hover:scale-110 transition duration-300 ease-in-out animate-popIn animate-buttonGlow animate-neonPulse"
                       >
                           No, Stay
                       </button>
                   </div>
               </div>
           </div>
           
           
            )}

            {/* Logout Button */}
            <button
                className="inline-block w-full px-6 py-2 text-white bg-red-600 rounded-full shadow-lg transition duration-300 transform hover:bg-red-700 hover:scale-105 hover:shadow-xl"
                onClick={logoutHandler}
            >
                Logout
            </button>

            
        </div>
    );
}

export default LogoutBtn;
