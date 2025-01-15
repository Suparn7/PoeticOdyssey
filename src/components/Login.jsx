import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import authService from "../appwrite/auth";
import Button from './Button';
import Logo from './Logo';
import Input from './Input';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { login as authLogin } from '../store/authSlice';
import '../styles/loader.css'; // Import your loader CSS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'; // Import the icons
import userService from '../appwrite/userService';
import { setUserData } from '../store/userSlice';

const Login = () => {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const { register, handleSubmit } = useForm();
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

    const login = async (data) => {
        setError("");
        setLoading(true);
        try {
            const session = await authService.login(data);
            if (session) {
                const userData = await authService.getCurrentUser();
                
                if (userData) {
                    const userDetails = await userService.getUserById(userData.$id);
                    dispatch(setUserData(userDetails));  // Set user data in the Redux store
                    dispatch(authLogin({ userData }));
                }
                navigate("/");
                window.scrollTo(0, 0); // Scroll to top on navigation
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex items-center justify-center w-full min-h-screen'>
            <div className='mx-auto w-full max-w-sm md:max-w-lg bg-white bg-opacity-10 rounded-xl shadow-lg p-6 md:p-10 border border-gray-200 transform transition-all duration-300 hover:scale-105'>
                <div className="mb-4 flex justify-center">
                    <span className="inline-block w-full max-w-[80px] md:max-w-[100px]">
                        <Logo width="100%" />
                    </span>
                </div>
                <h2 className="text-center text-2xl md:text-3xl font-bold leading-tight text-gray-200 transition-colors duration-300">Sign in to your account</h2>
                <p className="mt-2 text-center text-sm md:text-base text-gray-300 transition-colors duration-300">
                    Don&apos;t have an account?&nbsp;
                    <Link
                        to="/signup"
                        className="font-medium text-blue-400 hover:text-blue-600 transition-all duration-200 underline"
                    >
                        Sign Up
                    </Link>
                </p>
                {error && <p className="text-red-600 mt-8 text-center animate-pulse">{error}</p>}
                {loading ? (
                    <div className="loader-overlay">
                        <div className="loader-container">
                            <div className="loader"></div>
                            {/* <h2 className="loading-text">Logging in...</h2> */}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(login)} className='mt-6 md:mt-8'>
                        <div className='space-y-4 md:space-y-6'>
                            <Input
                                label="Email: "
                                placeholder="Enter your email"
                                type="email"
                                {...register("email", {
                                    required: true,
                                    validate: {
                                        matchPattern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                                        "Email address must be a valid address",
                                    }
                                })}
                                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="relative">
                                <Input
                                    label="Password: "
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    {...register("password", {
                                        required: true,
                                    })}
                                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 pr-10" // Add padding for the icon
                                />
                                <span 
                                    className="absolute right-3 top-1/2 transform -translate-y-1/6" // Center vertically
                                    onClick={() => setShowPassword((prev) => !prev)} // Toggle showPassword state
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} className={showPassword ? "text-teal-500" : "text-gray-500"} />
                                </span>
                            </div>
                            <div >
                            <Button
                                type="submit"
                                className="ml-0 w-full bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 rounded-md shadow-lg"
                            >
                                Sign in
                            </Button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
