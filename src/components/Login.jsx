import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Button from './Button';
import Logo from './Logo';
import authService from "../appwrite/auth";
import userService from '../appwrite/userService';
import { useDispatch } from 'react-redux';
import { login as authLogin } from '../store/authSlice';
import { setUserData } from '../store/userSlice';
import '../styles/loader.css';
import Container from './container/Container';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { register, handleSubmit } = useForm();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const login = async (data) => {
        setError("");
        setLoading(true);
        try {
            const session = await authService.login(data);
            if (session) {
                const userData = await authService.getCurrentUser();
                if (userData) {
                    const userDetails = await userService.getUserById(userData.$id);
                    dispatch(setUserData(userDetails));
                    dispatch(authLogin({ userData }));
                }
                navigate("/");
                window.scrollTo(0, 0);
            }
        } catch (err) {
            setError(err.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
          <Container>
            <div className="loader-overlay">
              <div className="loader-container">
                <div className="loader"></div>
              </div>
            </div>
          </Container>
        );
      }

      
    return (
        <div className="flex items-center justify-center w-full min-h-screen">
            <div className="relative w-11/12 max-w-lg bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-xl shadow-lg">
                <div className="text-center mb-6">
                    <Logo width="100px" />
                </div>

                {error && (
                    <div className="mb-4 bg-red-700 bg-opacity-20 backdrop-blur-md rounded-lg p-4 text-red-200 text-center shadow-md">
                        {error}
                    </div>
                )}

                <h2 className="text-center text-3xl font-bold text-white mt-4">Sign In to Your Account</h2>
                <p className="text-gray-300 text-center mt-2">
                    Don’t have an account?{' '}
                    <Link to="/signup" className="text-green-400 underline hover:text-green-500">
                        Sign Up
                    </Link>
                </p>

                {loading ? (
                    <div className="flex justify-center">
                        <div className="loader"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(login)} className="space-y-6 mt-6">
                        <div className="relative">
                            <input
                                {...register("email", { required: true })}
                                type="email"
                                placeholder="Email"
                                className="w-full bg-white bg-opacity-20 text-white rounded-lg py-3 px-10 focus:ring-2 focus:ring-green-400 outline-none"
                            />
                            <FontAwesomeIcon
                                icon={faEnvelope}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                            />
                        </div>

                        <div className="relative">
                            <input
                                {...register("password", { required: true })}
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className="w-full bg-white bg-opacity-20 text-white rounded-lg py-3 px-10 focus:ring-2 focus:ring-green-400 outline-none"
                            />
                            <FontAwesomeIcon
                                icon={faLock}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                            />
                            <FontAwesomeIcon
                                icon={showPassword ? faEye : faEyeSlash}
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="ml-0 w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-400 transform hover:scale-105"
                        >
                            Sign In
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
