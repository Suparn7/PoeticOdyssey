import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import authService from '../appwrite/auth';
import userService from '../appwrite/userService'; // Import the UserService
import { setUserData } from '../store/userSlice';  // Import the action
//import bcrypt from 'bcrypt';  // Import bcryptjs for password hashing
import bcrypt from 'bcryptjs'
import Button from './Button';
import Logo from './Logo';
import Input from './Input';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import '../styles/loader.css'; // Import your loader CSS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'; // Import the icons
import service from '../appwrite/config';
import conf from '../conf/conf';


const Signup = () => {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const { register, handleSubmit, setValue } = useForm(); // Include setValue for manually updating form values
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

    const create = async (data) => {
        
        setError("");
        setLoading(true);
    
        try {
            // Step 1: Create account using authService
            const userData = await authService.createAccount(data);
            
            if (userData) {
                const userId = userData.userId;
    
                // Step 2: Hash the password (bcrypt is used here)
                const password = data.password;
                const passwordHash = await bcrypt.hash(password, 10); // Using bcrypt to hash password
    
                // Step 3: Handle profile picture upload (if any)
                let profilePicUrl = null;
    
                if (data.profilePic && data.profilePic[0]) {
                    // If profile picture is selected, upload the file using `uploadFile`
                    const file = await service.uploadFile(data.profilePic[0]);
                    var imageUrl = `${conf.appwriteUrl}/storage/buckets/${file.bucketId}/files/${file.$id}/view?project=${conf.appwriteProjectId}`
                    // Extract the file URL from the response
                    profilePicUrl = file?.$id ? imageUrl : null;
                }
        
                // Step 4: Create user document in the database
                const userCreated = await userService.createUser({
                    userId,
                    email: data.email,
                    phone: data.phone || "", // Optional phone number
                    passwordHash,
                    name: data.name,
                    profilePicUrl, // The URL of the uploaded file (if profilePic is provided)
                    bio: data.bio || "",  // Store the bio as well (assuming it's part of 'data')
                });
        
                // Step 5: After user creation, handle user login and navigation
                if (userCreated) {
                    const userDetails = await userService.getUserById(userId);
                    
                   if(userDetails){
                        dispatch(setUserData(userDetails));  // Set user data in the Redux store
                   }

                    const currentUser = await authService.getCurrentUser();
                    if (currentUser) {
                        dispatch(login({ userData: currentUser }));
                    }
                    navigate("/");
                    window.scrollTo(0, 0); // Scroll to top after navigation
                } else {
                    setError("There was an error creating your user profile.");
                }
            }
        } catch (error) {
            setError(error.message || "An error occurred during account creation.");
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
                <h2 className="text-center text-2xl md:text-3xl font-bold leading-tight text-gray-200 transition-colors duration-300">Sign up to create an account</h2>
                <p className="mt-2 text-center text-sm md:text-base text-gray-300 transition-colors duration-300">
                    Already have an account?&nbsp;
                    <Link
                        to="/login"
                        className="font-medium text-green-400 hover:text-green-600 transition-all duration-200 underline"
                    >
                        Sign In
                    </Link>
                </p>
                {error && <p className="text-red-600 mt-8 text-center animate-pulse">{error}</p>}
                {loading ? (
                    <div className="loader-overlay">
                        <div className="loader-container">
                            <div className="loader"></div>
                            {/* <h2 className="loading-text">Creating account...</h2> */}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(create)} className='mt-6 md:mt-8'>
                        <div className='space-y-4 md:space-y-6'>
                            <Input
                                label="Full Name: "
                                placeholder="Enter your full name"
                                {...register("name", { required: true })}
                                className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                            />
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
                                className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                            />
                            <Input
                                label="Phone (optional): "
                                placeholder="Enter your phone number"
                                type="text"
                                {...register("phone")}
                                className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                            />
                            <div className="relative">
                                <Input
                                    label="Password: "
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    {...register("password", { required: true })}
                                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500 pr-10" // Add padding for the icon
                                />
                                <span  
                                    className="absolute right-3 top-1/2 transform -translate-y-1/6" // Center vertically
                                    onClick={() => setShowPassword((prev) => !prev)} // Toggle showPassword state
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} className={showPassword ? "text-teal-500" : "text-gray-500"} />
                                    </span>
                            </div>

                            {/* Profile Picture */}
                            <div className="mb-4">
                                <label htmlFor="profilePic" className="block text-gray-200 mb-2">Profile Picture (optional)</label>
                                <input
                                    id="profilePic"
                                    type="file"
                                    {...register("profilePic")}
                                    className="w-full text-gray-700 bg-white border border-gray-300 rounded-md"
                                />
                            </div>

                            {/* Bio */}
                            <div className="mb-4">
                                <label htmlFor="bio" className="block text-gray-200 mb-2">Bio (optional)</label>
                                <textarea
                                    id="bio"
                                    {...register("bio")}
                                    placeholder="Tell us a little about yourself..."
                                    className="w-full text-gray-700 bg-white border border-gray-300 rounded-md"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="ml-0 w-full bg-green-500 text-white hover:bg-green-600 transition-all duration-200 py-2 rounded-md shadow-lg"
                            >
                                Create Account
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Signup;
