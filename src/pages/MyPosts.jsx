import React, { useState, useEffect } from 'react';
import appWriteService from '../appwrite/config';
import Container from '../components/container/Container';
import PostCard from '../components/PostCard';
import { useSelector } from 'react-redux';
import "../styles/loader.css";
import "../styles/myposts.css";
import { Query } from 'appwrite';
import { Link } from 'react-router-dom';

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 4;
  const [isAnimating, setIsAnimating] = useState(false);
  const userData = useSelector(state => state.auth.userData);
  const userInfoData = useSelector(state => state.user.userData);


  useEffect(() => {
    const fetchPosts = async () => {
      const queries = [
        Query.equal("userId", userInfoData.userId)
      ];
      const postsData = await appWriteService.getPosts(queries);
      if (postsData) {
        setPosts(postsData);
      }
      setLoading(false);
    };

    fetchPosts();
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
            {/* <h2 className="loading-text">Loading your Posts...</h2> */}
          </div>
        </div>
      </Container>
    );
  }

  if (posts && posts.length === 0) {
    return (
      <div className='w-full py-8 '>
        <Container>
          <div className="flex items-center justify-center h-full ">
            <div className="relative bg-gray-800 text-white p-8 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 w-full max-w-md">
              <h1 className="text-2xl text-center mb-4">
                {`Please `}
                <Link to="/PoeticOdyssey/add-post" className="text-blue-400 underline hover:text-blue-300">
                  Add 
                </Link>
                {` a post to publish.`}
              </h1>           
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className='w-full py-8'>
      <Container>
        <div className="flex flex-wrap justify-center">
          {currentPosts.map((post) => (
            <div
              className={`p-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 ${isAnimating ? 'fly-away' : ''}`} 
              key={post.$id}
            >
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

export default MyPosts;
