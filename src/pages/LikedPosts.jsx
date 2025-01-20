import React, { useState, useEffect } from 'react';
import appWriteService from '../appwrite/config';
import Container from '../components/container/Container';
import PostCard from '../components/PostCard';
import { useSelector } from 'react-redux';
import "../styles/loader.css";
import "../styles/likedPosts.css";

const LikedPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const userData = useSelector(state => state.auth.userData);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 4; // Number of posts per page
  const [isAnimating, setIsAnimating] = useState(false);


  useEffect(() => {
    const fetchLikedPosts = async () => {
      setLoading(true);
      const likedPostsData = await appWriteService.getLikedPosts(userData.$id);
      if (likedPostsData) {
        setPosts(likedPostsData.documents);
      }
      setLoading(false);
    };

    fetchLikedPosts();
  }, [userData]);

  // Only calculate pagination if posts have been fetched
  let currentPosts = [];
  let totalPages = 0;
  if (posts && posts.length > 0) {
    // Calculate the current posts to display
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
    window.scrollTo(0,0)
  };

  // Create an array of page numbers to display, limited to 5 for example
  const visiblePages = [];
  const maxPages = 5;
  let startPage = Math.max(currentPage - Math.floor(maxPages / 2), 1);
  let endPage = startPage + maxPages - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(endPage - maxPages + 1, 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    visiblePages.push(i);
  }
  if (loading) {
    return (
      <Container>
        <div className="loader-overlay">
          <div className="loader-container">
            <div className="loader"></div>
            {/* <h2 className="loading-text">Loading liked posts...</h2> */}
          </div>
        </div>
      </Container>
    );
  }

  if (posts.length === 0) {
    return (
      <Container>
        <div className="flex items-center justify-center h-60">
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 p-12 w-96 rounded-xl shadow-lg transform transition-all hover:scale-105 hover:shadow-2xl hover:rotate-2 animate-fadeIn">
          <h1 className="text-white text-2xl font-semibold text-center">
            No liked posts found.
          </h1>
        </div>
      </div>
      </Container>
    );
  }

  return (
    <div className='w-full py-8'>
      <Container>
        <div className="flex flex-wrap justify-center">
          {currentPosts.map((post) => (
            <div className="p-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/4" key={post.$id}>
              <PostCard {...post} />
            </div>
          ))}
        </div>

        {/* Pagination Buttons */}
        <div className="pagination">
          {currentPage > 1 && (
            <button 
              className="page-button" 
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Prev
            </button>
          )}
          
          {visiblePages.map((page) => (
            <button 
              key={page} 
              className={`page-button ${currentPage === page ? 'active' : ''}`} 
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          
          {currentPage < totalPages && (
            <button 
              className="page-button" 
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          )}
        </div>
      </Container>

      
    </div>
  );
};

export default LikedPosts;
