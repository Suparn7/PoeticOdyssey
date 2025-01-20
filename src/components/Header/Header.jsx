import React, { useState, useRef, useEffect } from 'react';
import Container from '../container/Container';
import Logo from '../Logo';
import { Link, useNavigate } from 'react-router-dom';
import LogoutBtn from './LogoutBtn';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import service from '../../appwrite/config';
import { addNotification, deleteNotification } from "../../store/notificationSlice"; 
import RealTimeNotificationService from '../../appwrite/RealTimeNotificationService';


const Header = () => {
    const authStatus = useSelector((state) => state.auth.status);
    const userData = useSelector((state) => state.auth.userData);
    //const notifications = useSelector((state) => state.notifications.notifications);
    const [notifications, setNotifications] = useState([]);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [menuVisible, setMenuVisible] = useState(false);
    const [notificationsVisible, setNotificationsVisible] = useState(false);
    const[notificationsVisibleForSmallScreen, setNotificationsVisibleForSmallScreen] = useState(false);
    const [deletingNotification, setDeletingNotification] = useState(null); 
    const [loading, setLoading] = useState(true); // To handle loading state if needed
    
    const menuRef = useRef(null);
    const notificationRef = useRef(null); 
    const notificationRefForSmScreen = useRef(null); 

    const notificationBellRef = useRef(null); // Ref for the notification bell
    const notificationBellRefForSmScreen = useRef(null); // Ref for the notification bell


    const navItems = [
        { name: "Home", slug: "/PoeticOdyssey", active: true },
        { name: "Login", slug: "/PoeticOdyssey/login", active: !authStatus },
        { name: "Signup", slug: "/PoeticOdyssey/signup", active: !authStatus },
        { name: "Add Post", slug: "/PoeticOdyssey/add-post", active: authStatus },
        { name: "My Posts", slug: "/PoeticOdyssey/my-posts", active: authStatus },
        { name: "Profile", slug: "/PoeticOdyssey/profile", active: authStatus },
        { name: "Chats", slug: "/PoeticOdyssey/chat", active: authStatus },
    ];

    const handleMenuToggle = () => {
        if(notificationsVisible) setNotificationsVisible(false)
        if(notificationsVisibleForSmallScreen) setNotificationsVisibleForSmallScreen(false)

        setMenuVisible((prev) => !prev);
    };

    const handleNotificationToggle = () => {
        // Close the menu modal
       setNotificationsVisible((prev) => !prev); // Toggle notifications modal
       
       if (menuVisible) setMenuVisible(false);
   }

   const handleNotificationToggleForSmallScreen = () => {
    // Close the menu modal
   setNotificationsVisibleForSmallScreen((prev) => !prev); // Toggle notifications modal
   if (menuVisible) setMenuVisible(false);
}

   const handleClickOutside = (event) => {
    // Close menu if clicked outside
    if (
      menuVisible &&
      menuRef.current &&
      !menuRef.current.contains(event.target)
    ) {
      setMenuVisible(false);
    }
    // Close notifications if clicked outside and not on the bell
    if (
      notificationsVisible &&
      notificationRef.current &&
      !notificationRef.current.contains(event.target) &&
      (!notificationBellRef.current || !notificationBellRef.current.contains(event.target))
    ) {
        setNotificationsVisible(false);
    }

    if (
        notificationsVisibleForSmallScreen &&
        notificationRefForSmScreen.current &&
        !notificationRefForSmScreen.current.contains(event.target) &&
        (!notificationBellRefForSmScreen.current || !notificationBellRefForSmScreen.current.contains(event.target))
      ) {
       setNotificationsVisibleForSmallScreen(false);
      }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
}, [menuVisible, notificationsVisible, notificationsVisibleForSmallScreen]);
  

    useEffect(() => {
        if (userData && userData.$id) {
            // Fetch notifications when the page first loads (on refresh or initial load)
            const fetchInitialNotifications = async () => {
                try {
                    // Fetch notifications for the logged-in user
                    const initialNotifications = await service.fetchNotifications(userData.$id);

                    // Set the notifications in the state
                    setNotifications(initialNotifications);
                    setLoading(false);  // Set loading to false once data is fetched
                } catch (error) {
                    console.error('Error fetching initial notifications:', error);
                    setLoading(false); // Set loading to false even if an error occurs
                }
            };

            fetchInitialNotifications();

            // Subscribe to real-time notifications
            const unsubscribe = RealTimeNotificationService.subscribeToNotifications(userData.$id, (newNotifications) => {
                setNotifications((prevNotifications) => [...prevNotifications, ...newNotifications]);
            });

            // Cleanup subscription on component unmount
            return () => unsubscribe();
        }
    }, [userData]);

    useEffect(() => {
        if (authStatus && userData && userData.$id) {
            // Subscribe only to notifications for the current user
            const unsubscribe = RealTimeNotificationService.subscribeToNotifications(userData.$id, (newNotifications) => {
                setNotifications(newNotifications); // Update the state with filtered notifications
            });
    
            // Cleanup subscription when component unmounts
            return () => unsubscribe();
        }
    }, [authStatus, userData]);
    
    
   

    const handleNavigation = (slug) => {
        navigate(slug);
        window.scrollTo(0, 0);
        setMenuVisible(false); 
        setNotificationsVisible(false);
    };

    const handleNotificationClick = (postId, fromUserId) => {
        if (postId !== "null") {
            navigate(`/PoeticOdyssey/post/${postId}`);
        } else {
            navigate(`/PoeticOdyssey/profile/${fromUserId}`);
        }
        setNotificationsVisible(false);
        setNotificationsVisibleForSmallScreen(false)
        setMenuVisible(false)
    };

    const handleDeleteNotification = async (notificationId) => {
        const userId = userData.$id;
        setDeletingNotification(notificationId);
        
        const result = await service.deleteNotification(userId, notificationId, dispatch);
        const updatedNotifications = notifications.filter(noti => {
            const parts = noti.split('|||');
            return parts[0] !== notificationId; // Compare the unique ID part of the notification
        });
        if(notifications.length === 0){
            setNotificationsVisible(false)
        }
        setNotifications(updatedNotifications)

        // if (result) {
        //     dispatch(deleteNotification(notificationId));
        // }
       

        setTimeout(() => setDeletingNotification(null), 1000);
    };

    const handleLogout = () => {
        setNotificationsVisible(false)
        setNotificationsVisibleForSmallScreen(false)
    }

    const notificationModalStyle = {
        position: 'absolute',
        right: 0,
        marginTop: '0.5rem',
        width: '20rem',  // Adjusted for small screens
        backdropFilter: 'blur(10px)',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        padding: '1rem',
        zIndex: 500,
        maxHeight: '70vh',  // Allow scrolling for smaller screens
        overflowY: 'auto',
        overflowX: 'hidden',
    };

    const styles = `
        .notification-container {
            max-height: 300px; /* Limit the height */
            overflow-y: auto;  /* Enable vertical scrolling */
            overflow-x: hidden; /* Prevent horizontal scrolling */
            padding: 10px;
            position: relative;
            scrollbar-width: none; /* Hide scrollbar for Firefox */
            -ms-overflow-style: none; /* Hide scrollbar for IE/Edge */
        }

        .notification-container::-webkit-scrollbar {
            display: none; /* Hide scrollbar for Chrome, Safari, and Edge */
        }
        .notification-container::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1); 
            border-radius: 10px;
        }
        .notification-container::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #6a11cb 0%, #2575fc 100%);
            border-radius: 10px; 
            transition: background 0.3s, transform 0.2s;
        }
        .notification-container::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #2575fc 0%, #6a11cb 100%);
            transform: scale(1.1); 
        }

        @keyframes slideOutRight {
            0% {
                transform: translateX(0); 
                opacity: 1;
            }
            100% {
                transform: translateX(100vw);
                opacity: 0;
            }
        }

        .notification-fade-out {
            animation: slideOutRight 6s ease-out forwards;
            position: absolute;
            width: 100%;
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    return (
        <header className='py-0 shadow-xl sticky top-0 z-50 bg-transparent bg-opacity-80 backdrop-blur-md transition-all duration-500 ease-in-out'>
            <Container>
                <nav className='flex items-center justify-between relative h-44'>
                    {/* Logo and Site Name */}
                    <div className='flex items-center space-x-6'>
                        <Link to="/PoeticOdyssey" className="flex items-center space-x-2">
                            <Logo 
                                width='100px' 
                                className='transition-all duration-700 ease-in-out transform hover:scale-110 relative top-2'
                            />
                            
                        </Link>
                    </div>

                   {/* Hamburger Icon for Small Screens */}
                    <div ref={menuRef} className="relative flex md:hidden items-center space-x-4">
                    {/* Notification Bell */}
                    {authStatus && (
                        <div className="relative">
                        <button
                            ref={notificationBellRefForSmScreen}
                            className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-full shadow-xl hover:scale-110 transition-transform duration-300"
                            onClick={handleNotificationToggleForSmallScreen}
                            aria-label="Toggle notifications"
                        >
                            <span className="text-2xl text-white">🔔</span>
                        </button>

                        {notifications.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1 animate-bounce">
                            {notifications.length}
                            </span>
                        )}
                        </div>
                    )}

                    {/* Notifications Modal */}
                    {notificationsVisibleForSmallScreen && (
                        <div
                        ref={notificationRefForSmScreen}
                        className="absolute min-w-80 bg-gray-800 bg-opacity-90 text-white rounded-lg shadow-lg p-4 top-full left-3/4 transform -translate-x-full mt-2 z-50 max-w-xs w-full"
                        >
                        {/* <button
                            onClick={() => setNotificationsVisibleForSmallScreen(false)}
                            className="absolute top-2 right-2 text-white text-sm bg-red-500 rounded-full p-1 hover:bg-red-700 transition-transform transform hover:scale-110"
                            aria-label="Close notifications"
                        >
                            ✖
                        </button> */}

                        <ul className="flex flex-col space-y-2">
                            {notifications.length > 0 ? (
                            notifications.map((notification, index) => {
                                const parts = notification.split("|||");
                                const notificationId = parts[0];
                                const notificationText = parts[1];
                                const postId = parts[parts.length - 3];
                                const fromUserId = parts[parts.length - 2];

                                return (
                                <li
                                    key={index}
                                    className="flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg px-4 py-2 shadow hover:scale-105 transition-transform duration-300"
                                >
                                    <span
                                    onClick={() => handleNotificationClick(postId, fromUserId)}
                                    className="flex-grow cursor-pointer"
                                    >
                                    {notificationText}
                                    </span>
                                    <button
                                    onClick={() => handleDeleteNotification(notificationId)}
                                    className="bg-red-600 text-white rounded-full px-2 py-1 hover:bg-red-700 transition-transform duration-300 hover:scale-110"
                                    aria-label="Delete notification"
                                    >
                                    🗑
                                    </button>
                                </li>
                                );
                            })
                            ) : (
                            <li className="text-center bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg px-4 py-2">
                                No notifications
                            </li>
                            )}
                        </ul>
                        </div>
                    )}

                    {/* Hamburger Menu */}
                    <button
                        className="flex items-center justify-center w-14 h-14 bg-gradient-to-l from-indigo-500 to-purple-600 rounded-full shadow-xl hover:scale-110 transition-transform duration-300"
                        onClick={handleMenuToggle}
                        aria-label="Toggle navigation"
                    >
                        ☰
                    </button>

                    {/* Menu Modal */}
                    {menuVisible && (
                        <div className="absolute right-0 mt-24 -top-3 bg-gray-800 bg-opacity-90 rounded-lg shadow-lg p-4 pr-9 z-50 max-w-xs">
                        <ul className="flex flex-col space-y-3">
                            {navItems.map(
                            (item, index) =>
                                item.active && (
                                <li key={index}>
                                    <button
                                    onClick={() => handleNavigation(item.slug)}
                                    className="w-full text-center text-white bg-gradient-to-l from-indigo-500 to-purple-600 rounded-lg shadow-lg px-4 py-2 hover:scale-105 transition-transform duration-300"
                                    >
                                    {item.name}
                                    </button>
                                </li>
                                )
                            )}
                            {authStatus && (
                            <li>
                                <LogoutBtn handleMenuToggle={handleMenuToggle}   />
                            </li>
                            )}
                        </ul>
                        </div>
                    )}
                    </div>


                    {/* Navigation Links and Notification Bell for Medium and Large Screens */}
                    <div className="hidden md:flex items-center space-x-6">
                    {/* Navigation Links */}
                    {navItems.map((item) =>
                        item.active ? (
                        <button
                            key={item.name}
                            onClick={() => handleNavigation(item.slug)}
                            className="text-white bg-gradient-to-r from-purple-600 to-indigo-800 rounded-full shadow-xl px-6 py-3 transition-all duration-500 ease-out hover:bg-gradient-to-l hover:scale-105 hover:rotate-3 animate-glow"
                        >
                            {item.name}
                        </button>
                        ) : null
                    )}

                    {/* Notifications Dropdown */}
                    {authStatus && (
                        <div className="relative" ref={notificationRef}>
                            <button
                                ref={notificationBellRef}
                                className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-full shadow-xl transform hover:scale-125 hover:rotate-12 transition-all duration-300 animate-pulse"
                                onClick={handleNotificationToggle}
                                aria-label="Toggle notifications"
                            >
                                <span className="text-2xl text-white">🔔</span>
                            </button>

                            {notifications.length > 0 && (
                                <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full px-2 py-1 animate-bounce">
                                {notifications.length}
                                </span>
                            )}

                            {notificationsVisible && (
                                <div ref={notificationRef}
                                className="absolute right-0 mt-2 w-96 bg-gray-800 text-white rounded-lg shadow-xl z-50 transition-transform duration-300 transform scale-100"
                                style={notificationModalStyle}
                                >
                                <ul className="notification-container flex flex-col space-y-2 p-4">
                                    {notifications.length > 0 ? (
                                    notifications.map((notification, index) => {
                                        const parts = notification.split('|||');
                                        const notificationId = parts[0];
                                        const notificationText = parts[1];
                                        const postId = parts[parts.length - 3];
                                        const fromUserId = parts[parts.length - 2];

                                        return (
                                        <li 
                                            key={index}
                                            className="notification-item bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg hover:bg-gradient-to-l hover:scale-105 transition-all duration-500 ease-out flex items-center justify-between px-4 py-2"
                                        >
                                            <span
                                            onClick={() => handleNotificationClick(postId, fromUserId)}
                                            className="flex-grow cursor-pointer"
                                            >
                                            {notificationText}
                                            </span>
                                            <button
                                            onClick={() => handleDeleteNotification(notificationId)}
                                            className="bg-gradient-to-r from-red-600 to-red-800 text-white ml-2 rounded-full px-4 py-2 transition-transform duration-300 hover:scale-110"
                                            aria-label="Delete notification"
                                            >
                                            <FontAwesomeIcon icon={faTrash} style={{ fontSize: '1.5rem' }} />
                                            </button>
                                        </li>
                                        );
                                    })
                                    ) : (
                                    <li className="text-white text-center bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg px-4 py-2 transition-transform duration-300 hover:scale-105">
                                        No notifications
                                    </li>
                                    )}
                                </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Logout Button */}
                    {authStatus && (
                        <LogoutBtn className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-full shadow-xl px-6 py-3 transition-all duration-500 ease-out hover:scale-105 hover:bg-red-700 animate-jump" />
                    )}
                    </div>

                </nav>
            </Container>
        </header>
    );
};

export default Header;
