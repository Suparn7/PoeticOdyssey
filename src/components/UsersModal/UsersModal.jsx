import React, { useState, useEffect } from 'react';
import userService from '../../appwrite/userService';
import appWriteService from '../../appwrite/config';
import ModalPostCard from '../UsersModal/ModalPostCard/ModalPostCard';
import './usersModal.css';
import { Query } from 'appwrite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faArrowLeft, faUser, faLocationDot  } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const UsersModal = ({ isOpen, onClose }) => {
  const user = useSelector((state) => state.auth.userData); 
  const userId = useState(user.$id)
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [fetchUserPosts, setFetchUserPosts] = useState(null);
  const [fetchUserProfile, setFetchUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleUsers, setVisibleUsers] = useState(5);
  const [visiblePosts, setVisiblePosts] = useState(3);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersData = await userService.getAllUsers();

        // Set users by filtering out the user with the specified userId
        setUsers(usersData.documents.filter((doc) => doc.$id !== userId[0]));

      } catch (error) {
        console.error('Error fetching users:', error);
      }
      setLoading(false);
    };

    if (isOpen) {
      fetchUsers();
      setVisiblePosts(3);
      setFetchUserPosts(null);
      setFetchUserProfile(null);
      setVisibleUsers(5);
      setPosts([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (fetchUserPosts) {
        setLoading(true);
        try {
          const queries = [Query.equal("userId", fetchUserPosts.$id)];
          const postsData = await appWriteService.getPosts(queries);
          setPosts(postsData);
        } catch (error) {
          console.error('Error fetching posts for user:', error);
        }
        setLoading(false);
      }
    };

    fetchPosts();
  }, [fetchUserPosts]);

  const handleShowMorePosts = () => {
    setVisiblePosts((prev) => prev + 3);
  };

  const handleViewPostsClick = (user) => {
    setFetchUserPosts(user);
  };

  const handleViewProfileClick = async (user) => {
    setFetchUserProfile(null);  // Reset profile data before fetching
    setLoading(true);
    try {
      const profileData = await userService.getUserById(user.$id); 
      setFetchUserProfile(profileData);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
    setLoading(false);
  };

  const handlePostClick = (post) => {
    
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCancel = () => {
    setSearchTerm('');
    onClose();
  };

  const handleBackToUsers = () => {
    setFetchUserPosts(null); // Go back to the users list
    setFetchUserProfile(null);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">
            {fetchUserPosts ? `Posts by ${fetchUserPosts.name}` : fetchUserProfile ? `Profile of ${fetchUserProfile.name}` : "ALL USERS"}
          </h3>

          <button onClick={handleCancel} className="close-button">
            <FontAwesomeIcon icon={faTimes} className="icon close-icon" />
          </button>
        </div>

        <div className="modal-body">
          {fetchUserPosts || fetchUserProfile ? (
            <button className="back-button" onClick={handleBackToUsers}>
              <FontAwesomeIcon icon={faArrowLeft} className="icon back-icon" /> Back to Users
            </button>
          ) : null}

          {!fetchUserPosts && !fetchUserProfile && (
            <input
              type="text"
              placeholder="Search by First Name"
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          )}

          {loading ? (
            <div className="loader"></div>
          ) : fetchUserPosts ? (
            <div className="user-posts-container">
              <div className="user-posts">
                {posts.length > 0 ? (
                  <div className="post-cards-grid">
                    {posts.slice(0, visiblePosts).map((post, index) => (
                      <ModalPostCard
                        key={index}
                        post={post}
                        onClick={() => handlePostClick(post)}
                      />
                    ))}
                  </div>
                ) : (
                  <p>No posts available for this user.</p>
                )}
                {visiblePosts < posts.length && (
                  <button className="show-more-button" onClick={handleShowMorePosts}>
                    Show More Posts by {fetchUserPosts.name}
                  </button>
                )}
              </div>
            </div>
          ) : fetchUserProfile ? (
            <div className="user-profile-container">
  <div className="profile-header">
  <div className="profile-body">
    {fetchUserProfile.profilePicUrl ? (
      <img
        src={fetchUserProfile.profilePicUrl}
        alt={fetchUserProfile.name}
        className="user-profile-pic"
      />
    ) : (
      <div className="user-avatar-placeholder">
        <FontAwesomeIcon icon={faUser} />
      </div>
    )}
    <p className="bio">{fetchUserProfile.bio}</p>
  </div>
    <h2>{fetchUserProfile.name}</h2>
    <p className="email">{fetchUserProfile.email}</p>
    <Link to={`profile/${fetchUserProfile.$id}`}>
        <button>
        View Complete Profile
        </button>
    </Link>
  </div>
  
</div>
          

          ) : (
            <div className="user-cards-container">
              {filteredUsers.slice(0, visibleUsers).map((user, index) => (
                <div key={index} className="user-card">
                  <div className="user-avatar-container">
                    {user?.profilePicUrl ? (
                      <img src={user.profilePicUrl} alt={user.name} className="user-avatar" />
                    ) : (
                      <div className="user-avatar-placeholder">
                        <FontAwesomeIcon icon={faUser} className="user-avatar-icon" />
                      </div>
                    )}
                  </div>

                  <div className="user-details">
                    <h4 className="user-name">{user.name}</h4>
                    <p className="user-bio">{user.bio}</p>
                    <div className="buttons-container">
                      <button
                        className="view-profile-btn"
                        onClick={() => handleViewProfileClick(user)}
                      >
                        View Profile
                      </button>
                      <button
                        className="view-posts-btn"
                        onClick={() => handleViewPostsClick(user)}
                      >
                        View Posts
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {visibleUsers < filteredUsers.length && (
                <button className="show-more-button" onClick={() => setVisibleUsers(visibleUsers + 5)}>
                  Show More Users
                </button>
              )}
            </div>

          )}
        </div>
      </div>
    </div>
  );
};

export default UsersModal;