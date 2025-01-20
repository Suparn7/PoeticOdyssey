import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import parse from 'html-react-parser';
import appWriteService from '../appwrite/config';
import authService from '../appwrite/auth';
import '../styles/loader.css'; // Import the CSS file for loader styles
import '../styles/PostCard.css'; // Import the new CSS file
import userService from '../appwrite/userService';

const PostCard = ({ $id, title, content, featuredImage, userId }) => {
  const [author, setAuthor] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [fadeOut, setFadeOut] = useState(false); // New state for fade out
  const [isDarkTheme, setIsDarkTheme] = useState(true); // State to manage theme for each card

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const user = await userService.getUserById(userId);
        setAuthor(user); // Set the author in state
      } catch (error) {
        console.error("Failed to fetch author:", error);
      } finally {
        setFadeOut(true); // Start fade out effect
        setTimeout(() => setLoading(false), 500); // Delay to allow fade out to complete
      }
    };

    fetchAuthor();
  }, [userId]);

  // Toggle the theme for this card
  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <>
      <div
        className={`post-card ${isDarkTheme ? 'post-card-dark' : 'post-card-light'}`}
      >
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`ml-0 theme-toggle-btn ${isDarkTheme ? 'theme-toggle-btn-dark' : 'theme-toggle-btn-light'}`}
        >
          🌙
        </button>

        {loading && (
          <div className={`loader-overlay ${fadeOut ? 'hidden' : ''}`}>
            <div className="loader-container">
              <div className="loader"></div>
              {/* <h2 className="loading-text">Loading post...</h2> */}
            </div>
          </div>
        )}
          {/* Image Container */}
          <div className="image-container">
            <img
              src={appWriteService.getFilePreview(featuredImage)}
              alt={title}
              className="featured-image"
            />
          </div>

          {/* Title */}
          <h2 className="post-title">{title}</h2>

          {/* Author */}
          <Link to={`/PoeticOdyssey/profile/${author.userId}`} className="profile-link">
            <div className="author">{author.name}</div>
          </Link>

          {/* Content */}
          <div className="content">
            {parse(content.length > 100 ? `${content.substring(0, 50)}...` : content)}
          </div>

          {/* Read More Link */}
          <Link
          to={`/PoeticOdyssey/post/${$id}`}
          >
            <div className="read-more">Read More</div>
          </Link>
      </div>
    </>
  );
};

export default PostCard;
