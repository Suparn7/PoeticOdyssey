import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { setUserData } from '../store/userSlice';
import userService from '../appwrite/userService';
import authService from '../appwrite/auth';
import logo from "../images/PoeticOddyseyLogoBg.png";
import conf from '../conf/conf';
import "../styles/loader.css"

// Importing FontAwesome icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPhone, faEnvelope, faCamera, faHeart, faBookmark, faBan, faFloppyDisk, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Container from './container/Container';
import service from '../appwrite/config';
import FollowDetailsModal from './UsersModal/FollowDetailsModal/FollowDetailsModal';

const Profile = () => {
    const dispatch = useDispatch();
    const userData = useSelector((state) => state.auth.userData);
    const userInfoData = useSelector((state) => state.user.userData);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(userInfoData?.name || '');
    const [bio, setBio] = useState(userInfoData?.bio || '');
    const [email, setEmail] = useState(userInfoData?.email || '');
    const [phone, setPhone] = useState(userInfoData?.phone || '');
    const [profilePic, setProfilePic] = useState(null);
    const [profilePicUrl, setProfilePicUrl] = useState(userInfoData?.profilePicUrl || logo);
    

    // State for the password modal
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [password, setPassword] = useState('');
    const [isPasswordCorrect, setIsPasswordCorrect] = useState(true);
    const profileId = useParams()
    const [isAuthUser, setIsAuthUser] = useState(true)
    const [isFollowing, setIsFollowing] = useState(false);
    const [modalType, setModalType] = useState(null); // 'followers' or 'following'
    const [followers, setFollowers] = useState(null); // 'followers' or 'following'
    const [following, setFollowing] = useState(null); // 'followers' or 'following'
    const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
    const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);
    const [isFollowingOrUnfollowing, setIsFollowingOrUnfollowing] = useState(false);
  

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Start loading
    
            try {
                if (profileId.slug && userInfoData.$id !== profileId.slug) {
                    setIsAuthUser(false)
                    // For someone else's profile, fetch their data
                    const userProfileDetails = await userService.getUserById(profileId.slug);
                    
                    setIsFollowing(await service.isFollowing(userInfoData.$id, profileId.slug))
                   
                    setName(userProfileDetails.name);
                    setBio(userProfileDetails.bio);
                    setEmail(userProfileDetails.email);
                    setPhone(userProfileDetails.phone);
                    setProfilePicUrl(userProfileDetails.profilePicUrl || logo); // Use the user's profile picture if available
                } else {
                    // For your own profile, use the userData from Redux
                    if (userInfoData) {
                        setIsAuthUser(true)
                        setName(userInfoData.name);
                        setBio(userInfoData.bio);
                        setEmail(userInfoData.email);
                        setPhone(userInfoData.phone);
                        setProfilePicUrl(userInfoData.profilePicUrl || logo); // Fallback to default logo if no profile pic
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false); // Hide loading after data is fetched
            }
        };
    
        fetchData();
    }, [profileId, userInfoData]); // Re-run if profileId or userInfoData changes
    

    const handleNameChange = (e) => setName(e.target.value);
    const handleBioChange = (e) => setBio(e.target.value);
    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePhoneChange = (e) => setPhone(e.target.value);
    
    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create a temporary URL for the selected image to preview it immediately
            const imageUrl = URL.createObjectURL(file);
            setProfilePic(file); // Save the file to state for upload
            setProfilePicUrl(imageUrl); // Set the temporary URL to show the new image
        }
    };

    const handleSaveClick = async () => {
        await saveProfile(); // Wait for the profile to be saved
        setIsEditing(false); // Set editing mode to false to close the modal in editing state
    };
    

    

    const saveProfile = async () => {
        try {
            // Check if the profile pic is being updated
            if (profilePic) {
                const imgDetails = await userService.uploadFile(profilePic);
                if (imgDetails) {
                    // Build the image URL
                    const imageUrl = `${conf.appwriteUrl}/storage/buckets/${imgDetails.bucketId}/files/${imgDetails.$id}/view?project=${conf.appwriteProjectId}`;

                    // Update user data in the Appwrite service (name, bio, email, phone, profilePicUrl)
                    await userService.updateUser(userInfoData.userId, { name, bio, profilePicUrl: imageUrl, email, phone });

                    // Update the user data in Redux with the new image URL
                    dispatch(setUserData({ ...userInfoData, profilePicUrl: imageUrl, name, bio, email, phone }));
                }
            } else {
                // No profile picture to update, just update other details (name, bio, email, phone)
                await userService.updateUser(userInfoData.userId, { name, bio, email, phone });

                // Dispatch updated user data to Redux
                dispatch(setUserData({ ...userInfoData, name, bio, email, phone }));
            }

            // If there's any change to email or name, update in the AuthService too
            if (email !== userInfoData.email || name !== userInfoData.name) {
                // Call the AuthService to update the email and name
                await authService.updateUserData(email, name, password, dispatch);
            }

            // Turn off editing mode after successful update
            setIsEditing(false);
        } catch (error) {
            console.error("Error saving profile:", error);
        }
    };

    const handleCancelClick = () => {
        setName(userInfoData?.name || '');
        setBio(userInfoData?.bio || '');
        setEmail(userInfoData?.email || '');
        setPhone(userInfoData?.phone || '');
        setProfilePicUrl(userInfoData?.profilePicUrl || logo);
        setIsEditing(false);

    };

    const handleFollowClick = async () => {
        try {
            setIsFollowingOrUnfollowing(true)
            // Assuming you have access to the current user ID and target user ID
            const currentUserId = userInfoData.$id; // Replace with actual current user ID
            const targetUserId = profileId?.slug;  // Replace with actual target user ID
    
            if (isFollowing) {
                // If currently following, unfollow the user
                const unfollowSuccess = await service.unfollowUser(currentUserId, targetUserId);
                if (unfollowSuccess) {
                    // Successfully unfollowed, update the state
                    setIsFollowing(false);
                } else {
                    console.log("Failed to unfollow");
                }
            } else {
                // If not following, follow the user
                const followSuccess = await service.followUser(currentUserId, targetUserId, dispatch);
                if (followSuccess) {
                    // Successfully followed, update the state
                    setIsFollowing(true);
                } else {
                    console.log("Failed to follow");
                }
            }
        } catch (error) {
            console.error("Error handling follow/unfollow action", error);
        }finally{
            setIsFollowingOrUnfollowing(false)
        }
    };

    const fetchFollowers = async () => {
        try {
            setIsLoadingFollowers(true);
            let followersData;
            if(profileId?.slug){
                followersData = await service.getFollowers(profileId.slug);
            }else{
                followersData = await service.getFollowers(userInfoData.$id);
            }
            

            if (!Array.isArray(followersData)) {
                throw new Error("Following data is not an array of user IDs.");
            }
    
            // Fetch all user info for the following users concurrently
            const userPromises = followersData.map(userId => userService.getUserById(userId));
            const usersInfo = await Promise.all(userPromises);

            setFollowers(usersInfo);
            setIsFollowModalOpen(true);
            setModalType("followers");
        } catch (error) {
            console.error("Error fetching followers", error);
        }finally{
            setIsLoadingFollowers(false);
        }
    };

    const fetchFollowing = async () => {
        try {
            setIsLoadingFollowing(true);
            let followingData;
            if(profileId?.slug){
                followingData = await service.getFollowing(profileId.slug); // You need to implement this service
            }else{
                followingData = await service.getFollowing(userInfoData.$id);
            }
            

            if (!Array.isArray(followingData)) {
                throw new Error("Following data is not an array of user IDs.");
            }
    
            // Fetch all user info for the following users concurrently
            const userPromises = followingData.map(userId => userService.getUserById(userId));
            const usersInfo = await Promise.all(userPromises);
            
            setFollowing(usersInfo);
            setIsFollowModalOpen(true);
            setModalType("following");
        } catch (error) {
            console.error("Error fetching following", error);
        }finally{
            setIsLoadingFollowing(false);
        }
    };

    const closeModal = () => {
        setIsFollowModalOpen(false);
        window.scrollTo(0, 0); // Scroll to the top of the page
    };
    
    const handleCancelConfirmModalClick = () => {
        setIsConfirmModalOpen(false)
        setPassword('')
        setIsPasswordCorrect(true)
    }

    if (loading || isLoadingFollowers || isLoadingFollowing) {
        return (
          <Container>
            <div className="loader-overlay">
              <div className="loader-container">
                <div className="loader"></div>
                {/* <h2 className="loading-text"></h2> */}
              </div>
            </div>
          </Container>
        );
      }

    if (!userInfoData) {
        return <div className="container mx-auto p-4">No user data found.</div>;
    }

    return (
        <div className="flex justify-center items-center min-h-screen ">
            <div className="rounded-lg shadow-xl p-6 w-11/12 max-w-lg overflow-x-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl relative"
            style={{
                background: "rgba(0, 0, 0, 0)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#ffffff",
              }}>
                
                {/* Edit Profile Button in the top-right corner */}
                {!isEditing && isAuthUser && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="absolute ml-0 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-lg flex items-center space-x-2 transform transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:animate-bounce"
                        style={{
                        position: "absolute",
                        top: "16px",
                        right: "10px",
                        background: "#ffcc00",
                        color: "#000",
                        fontWeight: "600",
                        padding: "5px 8px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 10px rgba(255, 255, 255, 0.3)",
                        transition: "transform 0.3s ease-in-out, background 0.3s ease-in-out",
                        }}
                    >
                        <FontAwesomeIcon icon={faEdit} className="text-2xl" />
                    </button>
                )}

                {/* Save Button */}
                {isEditing && isAuthUser && (
                    <div className="absolute top-4 right-4 flex items-center space-x-4">
                        <button
                            onClick={handleSaveClick}
                            className="ml-0 flex items-center justify-center text-white rounded-full shadow-lg transition duration-300 transform hover:scale-110 hover:shadow-2xl focus:outline-none hover:animate-bounce"
                            style={{
                                background: "linear-gradient(135deg, #4caf50, #81c784)",
                                color: "#fff",
                                padding: "10px",
                                borderRadius: "20%",
                                marginRight: "-8px",

                                boxShadow: "0 4px 10px rgba(255, 255, 255, 0.3)",
                                transition: "transform 0.3s ease-in-out",
                              }}
                        >
                            <FontAwesomeIcon icon={faFloppyDisk} className="text-2xl" />
                        </button>
                        <button
                            onClick={handleCancelClick}
                            className="ml-0 flex items-center justify-center text-white rounded-full shadow-lg transition duration-300 transform hover:scale-110 hover:shadow-2xl focus:outline-none hover:animate-bounce"
                            style={{
                                background: "#e53935",
                                color: "#fff",
                                padding: "10px",
                                borderRadius: "20%",
                                marginRight: '0px',
                                marginLeft: '10px',
                                boxShadow: "0 4px 10px rgba(255, 255, 255, 0.3)",
                                transition: "transform 0.3s ease-in-out",
                              }}
                        >
                            <FontAwesomeIcon icon={faBan} className="text-2xl" />
                        </button>
                    </div>
                )}

                {/* Profile Content */}


               

                {/* Profile Picture, Name, Bio, Contact Info Sections */}
                <div className="flex flex-col items-center space-y-6 w-full">

                    {/* Profile Picture with upload icon */}
                    <div className="relative">
                        <img
                            src={profilePicUrl}
                            alt="Profile"
                            className="w-32 h-32 rounded-full border-4 border-indigo-500 shadow-lg transform transition-transform duration-300 hover:scale-110 hover:rotate-6 hover:shadow-2xl hover:animate-spin-slow"
                        />
                        {isEditing && (
                            <label htmlFor="profilePicUpload" className="absolute bottom-0 right-0 bg-indigo-500 rounded-full p-2 cursor-pointer shadow-lg hover:opacity-100 transition-all duration-300 hover:scale-125">
                                <FontAwesomeIcon icon={faCamera} className="text-white text-xl" />
                            </label>
                        )}
                        <input
                            type="file"
                            id="profilePicUpload"
                            onChange={handleProfilePicChange}
                            className="hidden"
                        />
                    </div>

                    {/* Name Section - Moved Above Bio */}
                    <div className="text-center w-full mt-4">
                        {isEditing ? (
                            <input
                                type="text"
                                value={name}
                                onChange={handleNameChange}
                                className="text-2xl font-semibold text-gray-800 bg-transparent border-b-2 border-indigo-500 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full transform transition duration-300 hover:scale-105"
                                style={{
                                    fontSize: "24px",
                                    fontWeight: "bold",
                                    background: "transparent",
                                    padding: "4px",
                                    color: "white",
                                    width: "100%",
                                  }}
                            />
                        ) : (
                            <h1 className="text-3xl font-bold animate__animated animate__fadeIn">{name}</h1>
                        )}
                    </div>

                    {/* Bio Section below Name */}
                    <div className="w-full  border-indigo-500 rounded-lg p-4 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl  shadow-xl">
                        {isEditing ? (
                            <textarea
                                value={bio}
                                onChange={handleBioChange}
                                className="text-md border-indigo-500 bg-transparent border-2 focus:outline-none resize-none overflow-y-auto rounded-lg transition duration-300 hover:scale-105"
                                style={{ background: "rgba(0,0,0,0.3)", maxHeight: "150px",
                                    color: "#fff",
                                    width: "100%",
                                    height: "80px",
                                    padding: "8px",
                                    borderRadius: "8px", }} // Limit height and allow scrolling
                            />
                        ) : (
                            <div className="max-h-48 overflow-y-auto">
                                <p className="text-md break-words">
                                    {bio}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Follow Buttons Section */}
                    {!isEditing && (
                        <div className="flex space-x-4 mt-6">
                            {/* Follow Button */}
                            {!isAuthUser && (
                                <button
                                
                                    onClick={handleFollowClick}
                                    disabled={isFollowingOrUnfollowing}  // Disable button while action is in progress
                                    style={{
                                        background: isFollowing ? "#757575" : "#2196f3",
                                        color: "#fff",
                                        fontWeight: "600",
                                        padding: "8px 16px",
                                        borderRadius: "8px",
                                        marginRight: "2px",
                                        transition: "transform 0.3s ease-in-out",
                                        marginLeft: '5px'
                                      }}
                                >
                                    {isFollowingOrUnfollowing ? (
                                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25"/>
                                            <path d="M4 12a8 8 0 0116 0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" className="opacity-75"/>
                                        </svg>
                                    ) : (
                                        isFollowing ? 'Unfollow' : 'Follow'
                                    )}
                                </button>
                            )}

                            {/* Following Button */}
                            <button onClick={() => fetchFollowing()} 
                                style={{
                                    background: "#43a047",
                                    color: "#fff",
                                    fontWeight: "600",
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    marginRight: "2px",
                                    marginLeft: '5px'
                                  }}>
                                Following
                            </button>

                            {/* Followers Button */}
                            <button onClick={() => fetchFollowers()} 
                                style={{
                                    background: "#7b1fa2",
                                    color: "#fff",
                                    fontWeight: "600",
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    marginLeft: '5px'
                                  }}>
                                Followers
                            </button>
                        </div>
                    )}

                    {/* "Posts by Username" Button */}
                    {
                        !isAuthUser && (
                            <div className="mt-6">
                            <Link to={`/PoeticOdyssey/user-posts/${profileId.slug}`} className="w-full">
                                <button className="w-full bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-110 hover:bg-orange-600 hover:shadow-2xl hover:translate-y-1 hover:animate-pulse">
                                    Posts by {name}
                                </button>
                            </Link>
                        </div>
                        )
                    }
                    

                    {/* Modal for Followers/Following */}
                    <FollowDetailsModal
                        isOpen={isFollowModalOpen}
                        closeModal={closeModal}
                        modalType={modalType}
                        followers={followers}
                        following={following}
                    />
                    {/* Liked & Saved Posts (below Name) with Cool Animated Buttons */}
                    {!isEditing && isAuthUser && (
                        <div className="mt-6 flex space-x-6 w-full">
                            <Link to="/PoeticOdyssey/liked-posts" className="w-full">
                                <button className="ml-1 w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-110 hover:bg-red-700 hover:shadow-2xl hover:translate-y-1 hover:animate-pulse">
                                    <FontAwesomeIcon icon={faHeart} className="text-2xl mr-2" />
                                    Liked Posts
                                </button>
                            </Link>
                            <Link to="/PoeticOdyssey/saved-posts" className="w-full">
                                <button className="w-full mr-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-110 hover:bg-blue-700 hover:shadow-2xl hover:translate-y-1 hover:animate-pulse">
                                    <FontAwesomeIcon icon={faBookmark} className="text-2xl mr-2" />
                                    Saved Posts
                                </button>
                            </Link>
                        </div>
                    )}

                    {/* Contact Info Section */}
                    <div className="rounded-lg p-6 w-full mt-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-xl"
                    style={{ background: "rgba(0,0,0,0.3)"}}
                    >
                        <h2 className="text-xl font-semibold mb-4 animate__animated animate__fadeInUp">Contact Information</h2>

                        {/* Editable Email */}
                        {isEditing ? (
                            <div className="flex items-center space-x-2 mb-4 ">
                                <FontAwesomeIcon icon={faEnvelope} className="text-indigo-500 text-2xl" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    className="text-lg  bg-transparent border-2 border-indigo-500 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full rounded-lg transform transition duration-300 hover:scale-105"
                                />
                            </div>
                        ) : (
                            <p className="text-lg  flex items-center mb-4">
                                <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-indigo-500" />
                                {email}
                            </p>
                        )}

                        {/* Editable Phone */}
                        {isEditing ? (
                            <div className="flex items-center space-x-2 mb-4">
                                <FontAwesomeIcon icon={faPhone} className="text-indigo-500 text-2xl" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    className="text-lg  bg-transparent border-2 border-indigo-500 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full rounded-lg transform transition duration-300 hover:scale-105"
                                />
                            </div>
                        ) : phone && (
                            <p className="text-lg  flex items-center mb-4">
                                <FontAwesomeIcon icon={faPhone} className="mr-2 text-indigo-500" />
                                {phone}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Profile;
