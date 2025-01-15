import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import appWriteService from '../appwrite/config';
import Container from '../components/container/Container';
import PostCard from '../components/PostCard';
import '../styles/loader.css'; // Import the CSS file
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import "./home.css";
import UsersModal from '../components/UsersModal/UsersModal.jsx'; // Import the UsersModal component

const Home = () => {
  const authStatus = useSelector((state) => state.auth.status);
  const user = useSelector((state) => state.auth.userData); 
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false); // State for animation
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  // Ref for posts container to control the scrolling
  const postsContainerRef = useRef(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      if (authStatus) {
        try {
          const postsData = await appWriteService.getPosts([]);
          if (postsData) {
            setPosts(postsData);
          }
        } catch (error) {
          console.error('Error fetching posts:', error);
        }
      }
      setLoading(false);
    };
    fetchPosts();
  }, [authStatus]);

  // Pagination Logic
  let currentPosts = [];
  let totalPages = 0;
  if (posts && posts.length > 0) {
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
    totalPages = Math.ceil(posts.length / postsPerPage);
  }

  const handlePageChange = (pageNumber) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPage(pageNumber);
      setIsAnimating(false);
    }, 300);
  };

  // Handle scrolling to left and right
  const scrollLeft = () => {
    if (postsContainerRef.current) {
      postsContainerRef.current.scrollBy({
        left: -300, // Move 300px to the left
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    if (postsContainerRef.current) {
      postsContainerRef.current.scrollBy({
        left: 300, // Move 300px to the right
        behavior: 'smooth',
      });
    }
  };

  // Function to check if the left icon should be visible
  const checkScrollPosition = () => {
    const container = postsContainerRef.current;
    if (container) {
      // Check if we can scroll left
      const canScrollLeft = container.scrollLeft > 0;
      
      // Check if we can scroll right (i.e., if the user has reached the end)
      const canScrollRight = container.scrollLeft < container.scrollWidth - container.clientWidth;
      
      return { canScrollLeft, canScrollRight };
    }
    return { canScrollLeft: false, canScrollRight: false };
  };
  

  useEffect(() => {
    // Force re-render to check the left and right icon visibility
    const interval = setInterval(() => {
      const { canScrollLeft, canScrollRight } = checkScrollPosition();
      setLeftIconVisible(canScrollLeft); // Update the visibility of the left icon
      setRightIconVisible(canScrollRight); // Update the visibility of the right icon
    }, 100);
  
    return () => clearInterval(interval);
  }, [posts]); // Ensure the logic runs when posts change
  

  const [leftIconVisible, setLeftIconVisible] = useState(false);
  const [rightIconVisible, setRightIconVisible] = useState(true); // Initially visible
  

  if (loading) {
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

  if (!authStatus) {
    return (
      <div className='w-full py-8'>
        <Container>
          <div className="flex items-center justify-center h-full">
            <div className="relative bg-gray-800 text-white p-8 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 w-full max-w-md">
              <h1 className="text-2xl text-center mb-4">
                Please <Link to="/login" className="text-blue-400 underline hover:text-blue-300">Login</Link> to see or create a Post.
              </h1>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (authStatus && posts && posts.length === 0) {
    return (
      <div className='w-full py-8'>
        <Container>
          <div className="flex items-center justify-center h-full">
            <div className="relative bg-gray-800 text-white p-8 rounded-lg shadow-lg w-full max-w-md">
              <h1 className="text-2xl text-center mb-4">No posts available. Add a post to get started!</h1>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className='w-full py-8'>
      <Container>
        

        {/* Hero Section */}
        <div className="hero-section text-white">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to Our Blog, <span className="username-animated">{user?.name || "User"}</span></h1>
            <p className="text-xl">Dive into the latest articles, insights, and stories.</p>
          </div>
        </div>

        {/* Explore Posts Button */}
        <div className="text-center mt-10">
        <button onClick={() => setIsModalOpen(true)} className="ml-0  cta-button">
            View All Users
          </button>
          <Link to="/all-posts">
            <button className="explore-button ml-0 ">
              Explore All Posts
            </button>
          </Link>
        </div>

        {/* Small Posts Section */}
        <div className="small-posts-slider mt-12">
          <h2 className="text-3xl font-semibold mb-4 text-center">Recent Posts</h2>
          <div className="posts-container flex overflow-x-auto space-x-6 py-10 px-2" ref={postsContainerRef}>
            {posts.slice(posts.length - 10, posts.length - 5).map((post, index) => (
              <div key={index} className="post-card-container">
                <PostCard {...post} />
              </div>
            ))}
          </div>

          {/* Left Slide Icon */}
          {leftIconVisible && (
            <div
              className="slider-icon left"
              onClick={scrollLeft}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </div>
          )}

          {/* Right Slide Icon */}
          {rightIconVisible && (
            <div className="slider-icon right" onClick={scrollRight}>
              <FontAwesomeIcon icon={faChevronRight} />
            </div>
          )}
        </div>

        {/* Users Modal */}
        
        <UsersModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          loading={loading} // Pass loading state
        />
        
        {/* Call to Action Section */}
        <div className="cta-section text-center mt-24 animate__animated animate__fadeIn animate__delay-4s">
          <h2 className="text-3xl font-semibold mb-6">Want to Share Your Ideas?</h2>
          <p className="text-xl mb-6">Create your own post and share with the world.</p>
          <Link to="/add-post">
            <button onClick={() => window.scrollTo(0,0)} className="cta-button ml-0 break-words">
              Create a Post
            </button>
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default Home;
