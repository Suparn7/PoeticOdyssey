import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faPhone, faLock, faEye, faEyeSlash, faUpload } from '@fortawesome/free-solid-svg-icons';
import Button from './Button';
import Logo from './Logo';
import authService from '../appwrite/auth';
import userService from '../appwrite/userService';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import { setUserData } from '../store/userSlice';
import bcrypt from 'bcryptjs';
import service from '../appwrite/config';
import conf from '../conf/conf';
import '../styles/loader.css';
import Container from './container/Container';


const Signup = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { register, handleSubmit, watch } = useForm();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [profilePicPreview, setProfilePicPreview] = useState(null);

    const profilePic = watch("profilePic");

    // Watch for changes in the profile picture input
    React.useEffect(() => {
        if (profilePic && profilePic[0]) {
            const file = profilePic[0];
            const reader = new FileReader();
            reader.onload = () => {
                setProfilePicPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setProfilePicPreview(null);
        }
    }, [profilePic]);

    const create = async (data) => {
        setError("");
        setLoading(true);
        try {
            const userData = await authService.createAccount(data);
            const userId = userData.userId;
            const passwordHash = await bcrypt.hash(data.password, 10);

            let profilePicUrl = null;
            if (data.profilePic && data.profilePic[0]) {
                const file = await service.uploadFile(data.profilePic[0]);
                profilePicUrl = `${conf.appwriteUrl}/storage/buckets/${file.bucketId}/files/${file.$id}/view?project=${conf.appwriteProjectId}`;
            }

            const userCreated = await userService.createUser({
                userId,
                email: data.email,
                phone: data.phone || "",
                passwordHash,
                name: data.name,
                profilePicUrl,
                bio: data.bio || "",
            });

            if (userCreated) {
                const userDetails = await userService.getUserById(userId);
                if (userDetails) dispatch(setUserData(userDetails));

                const currentUser = await authService.getCurrentUser();
                if (currentUser) dispatch(login({ userData: currentUser }));

                navigate("/");
                window.scrollTo(0, 0);
            } else {
                setError("There was an error creating your user profile.");
            }
        } catch (err) {
            setError(err.message || "An error occurred during account creation.");
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
            <div className="relative w-11/12 max-w-2xl bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-xl shadow-lg">
                <div className="text-center mb-6">
                    <Logo width="100px" />
                    <h2 className="text-3xl font-bold text-white mt-4">Create an Account</h2>
                    <p className="text-gray-300 ">
                            Already have an account?{' '}
                            <Link to="/login" className="text-green-400 underline hover:text-green-500">
                                Sign In
                            </Link>
                    </p>
                </div>

                {/* Static Error Message */}
                {error && (
                    <div className="w-full bg-red-700 bg-opacity-20 backdrop-blur-md rounded-lg p-4 text-red-200 text-center shadow-md mb-6">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center">
                        <div className="loader"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(create)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <input
                                    {...register("name", { required: true })}
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full bg-white bg-opacity-20 text-white rounded-lg py-3 px-10 focus:ring-2 focus:ring-green-400 outline-none"
                                />
                                <FontAwesomeIcon
                                    icon={faUser}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                                />
                            </div>
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
                        </div>

                        <div className="relative">
                            <input
                                {...register("phone")}
                                type="text"
                                placeholder="Phone (optional)"
                                className="w-full bg-white bg-opacity-20 text-white rounded-lg py-3 px-10 focus:ring-2 focus:ring-green-400 outline-none"
                            />
                            <FontAwesomeIcon
                                icon={faPhone}
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

                        {/* Profile Picture Upload with Preview */}
                        <div className="relative">
                            <label
                                htmlFor="profilePic"
                                className="flex items-center justify-center bg-white bg-opacity-20 text-gray-400 rounded-lg py-3 border border-dashed border-gray-400 cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faUpload} className="mr-2 text-white" />
                                Upload Profile Picture (optional)
                            </label>
                            <input
                                {...register("profilePic")}
                                id="profilePic"
                                type="file"
                                className="hidden"
                            />
                            {profilePicPreview && (
                                <img
                                    src={profilePicPreview}
                                    alt="Profile Preview"
                                    className="mt-4 w-20 h-20 rounded-full object-cover mx-auto"
                                />
                            )}
                        </div>

                        <textarea
                            {...register("bio")}
                            placeholder="Tell us a little about yourself..."
                            className="w-full bg-white bg-opacity-20 text-white rounded-lg py-3 px-4 focus:ring-2 focus:ring-green-400 outline-none"
                        />

                        <Button
                            type="submit"
                            className="ml-0 w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-400 transform hover:scale-105"
                        >
                            Create Account
                        </Button>
                        
                    </form>
                )}
            </div>
        </div>
    );
};

export default Signup;
