import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";
import appWriteService from '../appwrite/config';
import authService from '../appwrite/auth';
import Button from '../components/Button';
import Container from '../components/container/Container';
import parse from 'html-react-parser';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faHeart, faBookmark,faTimes  } from '@fortawesome/free-solid-svg-icons';
import '../styles/loader.css';
import service from '../appwrite/config';
import NotificationToast from './NotificationModal/NotificationToast.jsx';
import buttonClick from "../audio/buttonClick.mp3"
import liked from "../audio/liked.mp3"
import saved from "../audio/saved.mp3"
import conf from '../conf/conf.js';
import ShareButtons from '../components/ShareButtons.jsx';
import { deletePost as deletePostAction } from '../store/postSlice.js'; 
import "../styles/post.css"
import userService from '../appwrite/userService.js';

const Post = () => {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageLoading, setImageLoading] = useState(true);
    const [fade, setFade] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState([]);
    const [showMoreComments, setShowMoreComments] = useState(false);
    const [author, setAuthor] = useState(''); // State for author
    const [authorLoading, setAuthorLoading] = useState(true); // State for author loading
    const [notification, setNotification] = useState({ message: '', type: '', visible: false });
    const [flyingComment, setFlyingComment] = useState('');
    const [likedByUser, setLikedByUser] = useState(false);
    const [savedByUser, setSavedByUser] = useState(false);
    const[likedByUsers, setLikedByUsers] = useState([]);
    const[likedByUsersDetails, setLikedByUsersDetails] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showMore, setShowMore] = useState(false);
    const [visibleUsers, setVisibleUsers] = useState(3);  // Initially show 3 users

    const { slug } = useParams();
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    const showNotification = (message, type) => {
        setNotification({ message, type, visible: true });
    };
    const handleShowModal = () => {
      setIsModalOpen(true);
    };
    const handleShowMore = () => {
      setVisibleUsers(prevVisible => prevVisible + 3);  // Show 3 more users each time
  };
  
    const handleCloseModal = () => {
      setIsModalOpen(false);
      setVisibleUsers(3)
    };
    
    const dispatch = useDispatch();

    const isAuthor = post && userData ? post.userId === userData.$id : false;

    useEffect(() => {
      const fetchPostAndUsers = async () => {
          if (slug) {
              setLoading(true);
              try {
                  // Fetch the post
                  const post = await appWriteService.getPost(slug);
                  if (post) {
                      setPost(post);
                      setLikedByUser(post.likedBy?.includes(userData?.$id));
                      setSavedByUser(post.savedBy?.includes(userData?.$id));
  
                      // Fetch the user who made the post
                      const authorDetails = await authService.fetchUserById(post.userId);
                      setAuthor(authorDetails?.name || 'Unknown User'); // Set author name
  
                      // Parse comments
                      const parsedComments = (post.comments || []).map(commentString => {
                          const parts = commentString.split('@@@');
                          return parts.length === 3 ? { userId: parts[0], text: parts[1], createdAt: parts[2] } : null;
                      }).filter(Boolean);
  
                      // Sort comments by createdAt in descending order
                      const sortedComments = parsedComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
                      // Set comments
                      setComments(sortedComments);
  
                      // Fetch user names for each comment
                      const commentsWithNames = await Promise.all(sortedComments.map(async (comment) => {
                          const commentUser = await authService.fetchUserById(comment.userId);
                          return {
                              ...comment,
                              userName: commentUser?.name || 'Unknown User',
                          };
                      }));
  
                      // Update state with comments that include user names
                      setComments(commentsWithNames);
  
                      // Fetch liked users' names
                      const likedByUserDetails = await Promise.all(
                          (post.likedBy || []).map(async (userId) => {
                              const user = await userService.getUserById(userId);
                              return user;
                          })
                      );
                      setLikedByUsers(likedByUserDetails);
                  } else {
                      navigate("/");
                  }
              } catch (error) {
                  console.error("Error fetching post or users:", error);
              } finally {
                  setTimeout(() => {
                      setLoading(false);
                      setFade(true);
                  }, 500);
              }
          }
      };
  
      fetchPostAndUsers();
  
      // Set up real-time subscription to listen for updates
      const unsubscribe = service.client.subscribe(
          `databases.${conf.appwriteDatabaseId}.collections.${conf.appwriteCollectionId}.documents`,
          async (response) => {
              if (response.events.some(event => event.includes('update'))) {
                  const updatedPost = response.payload; // This contains the updated post data
  
                  // Update comments in state
                  const updatedComments = (updatedPost.comments || []).map(commentString => {
                      const parts = commentString.split('@@@');
                      return parts.length === 3 ? { userId: parts[0], text: parts[1], createdAt: parts[2] } : null;
                  }).filter(Boolean);
  
                  const sortedComments = updatedComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                  setComments(sortedComments);
  
                  // Update liked users in state
                  const updatedLikedUsers = await Promise.all(
                      (updatedPost.likedBy || []).map(async (userId) => {
                          const user = await userService.getUserById(userId);
                          return user;
                      })
                  );
                  setLikedByUsers(updatedLikedUsers);
              }
          }
      );
  
      return () => {
          // Clean up the listener when the component unmounts or the slug changes
          unsubscribe();
      };
  }, [slug, navigate]);
  
  

    const deletePost = () => {
        appWriteService.deletePost(post.$id)
            .then(() => {
                appWriteService.deleteFile(post.featuredImage);
                // Dispatch the action to remove the post from the Redux store
                dispatch(deletePostAction(post.$id));
                navigate("/");
            });
    };

    const confirmDelete = () => {
        setShowConfirm(true);
    };

    const handleConfirmDelete = () => {
        deletePost();
        setShowConfirm(false);
    };

    const handleCancelDelete = () => {
        setShowConfirm(false);
    };

    // Preload sounds
    const likeSound = new Audio(liked);
    const saveSound = new Audio(saved); 

    const handleLike = async () => {
        if (!userData) return; 
        try {
            const action = likedByUser ? "unlikePost" : "likePost";
            await service[action](post.$id, userData.$id, dispatch);
            // showNotification("Post liked!", "success");
            setLikedByUser(!likedByUser);

            // Play like sound effect
            likeSound.currentTime = 0; // Reset sound to start
            likeSound.play();

            setPost({ ...post, likedBy: [...new Set([...post.likedBy, userData.$id])] });
        } catch (error) {
            console.error("Error liking post:", error);
            // showNotification("Failed to like post.", "error");
        }
    };

    const handleSave = async () => {
        if (!userData) return; 
        try {
            const action = savedByUser ? "unsavePost" : "savePost";
            await service[action](post.$id, userData.$id);

            setSavedByUser(!savedByUser);

            // Play save sound effect
            saveSound.currentTime = 0; // Reset sound to start
            saveSound.play();

            setPost({ ...post, savedBy: [...new Set([...post.savedBy, userData.$id])] });
        } catch (error) {
            console.error("Error saving post:", error);
            //showNotification("Failed to save post.", "error");
        }
    };

    const commentAddedAudio = new Audio(buttonClick);

    const handleCommentSubmit = async (e) => {
      e.preventDefault();

      if (!newComment.trim() || !userData) return;

      // Set the flying comment and its position
      setFlyingComment(newComment);
      commentAddedAudio.currentTime = 0
      commentAddedAudio.play();

      const comment = {
          userId: userData.$id,
          text: newComment,
          createdAt: new Date().toISOString()
      };

      // Calculate the position of the textarea
      const textarea = document.getElementById("commentTextarea"); // Assume your textarea has this ID
      const rect = textarea.getBoundingClientRect();

      // Set the flying comment position
      const flyingCommentElement = document.querySelector('.flying-comment');
      if (flyingCommentElement) {
          flyingCommentElement.style.top = `${rect.top + window.scrollY}px`; // Offset for scroll
          flyingCommentElement.style.left = `${rect.left + window.scrollX + textarea.offsetWidth / 2}px`; // Center it
      }

      // Simulate a delay for the comment submission
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulating a delay

      // Now actually add the comment
      await service.addComment(post.$id, comment, dispatch);
      
      // Fetch user details for the newly added comment
      const user = await authService.fetchUserById(comment.userId);
      const commentWithUserName = {
          ...comment,
          userName: user?.name || 'Unknown User'
      };

      
      
      setNewComment('');
      setFlyingComment(''); // Clear the flying comment after submission
    };

    const getCommentDate = (date) => {
      const now = new Date();
      const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
      if (diffInDays === 0) return "Today";
      if (diffInDays === 1) return "Yesterday";
      return date.toLocaleDateString(); // Fallback to the formatted date
    };

    const deleteComment = async (comment) => {
      try {
          await service.deleteComment(post.$id, comment.createdAt);

          // Update the comments state by filtering out the deleted comment and sorting again
          setComments((prevComments) => {
              const updatedComments = prevComments.filter((c) => c.createdAt !== comment.createdAt);
              return updatedComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          });
      } catch (error) {
          console.error("Error deleting comment:", error);
          alert("Failed to delete comment.");
      }
    };

    if (loading) {
        return (
            <Container>
                <div className="loader-overlay">
                    <div className="loader-container">
                        <div className="loader"></div>
                        {/* <h2 className="loading-text">Loading post...</h2> */}
                    </div>
                </div>
            </Container>
        );
    }

    return post ? (
      <div className="glowing-border-wrapper">
        <div className={`py-8 flex flex-col items-center justify-center ${fade ? 'fade-in' : 'fade-out'}`} style={{ color: '#fff' }}>
            {isAuthor && (
              <div className='absolute top-[-26px] flex space-x-3 z-10'>
              <Link to={`/edit-post/${post.$id}`}>
                <Button
                  className='flex items-center justify-center p-3 bg-gradient-to-r from-green-200 via-teal-500 to-teal-800 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-125 transition duration-300 transform hover:rotate-[360deg]'
                >
                  <FontAwesomeIcon icon={faEdit} className="text-white text-3xl animate-pulse" />
                </Button>
              </Link>
            
              <Button
                className='flex items-center justify-center p-3 bg-gradient-to-r from-red-500 via-orange-700 to-red-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-125 transition duration-300 transform hover:rotate-[360deg] '
                onClick={confirmDelete}
              >
                <FontAwesomeIcon icon={faTrash} className="text-white text-3xl animate-pulse" />
              </Button>
              </div>
            )}

            <Container className="relative z-10">
              <div
                className={`bg-white bg-opacity-30 backdrop-blur-lg border border-white rounded-lg shadow-lg p-4 max-w-3xl w-full mx-auto transition-transform duration-500 ${
                  fade ? 'animate-fadeIn' : ''
                }`}
              >
                {/* Stylish Author Display on the Left */}
                <div
                  className={`flex justify-center items-center text-left mb-2 p-1 bg-white bg-opacity-10 backdrop-blur-lg rounded-lg text-white bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg transition-transform duration-300 transform hover:bg-gradient-to-l hover:scale-105 hover:shadow-xl`}
                  style={{
                    padding: '10px 20px',
                  }}
                >
                  <span
                    className="text-lg font-bold text-white bg-clip-text"
                  >
                    Author: {author}
                  </span>
                </div>

                {/* Share Buttons */}
                <ShareButtons post={post} /> {/* Add the ShareButtons component here */}

                <div className="flex justify-center mt-4">
                  {imageLoading && <div className="loader"></div>}
                  <img
                    src={appWriteService.getFilePreview(post.featuredImage)}
                    alt={post.title}
                    className={`rounded-lg transition-transform duration-500 ease-in-out ${
                      imageLoading ? 'hidden' : 'scale-100'
                    } hover:scale-105`}
                    style={{ maxHeight: '300px', minWidth: '200px' }}
                    onLoad={() => setImageLoading(false)}
                  />
                </div>

                <h1 className="text-4xl font-bold text-yellow-300 my-4 text-center break-words shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105">
                   {post.title}
                </h1>

                <div
                  className="text-center px-4 text-gray-200 mt-2 comments-container shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105"
                  style={{
                    maxHeight: '300px',
                    overflowY: 'auto',
                    overflowX: 'hidden', // Prevent horizontal scrolling
                    padding: '10px',
                    border: '1px solid #ffffff',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    wordWrap: 'break-word'
                  }}
                >
                  {parse(post.content)}
                </div>

              {/* Liked by Section */}
              <div className="mt-4 relative">
                  <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-4 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105">
                      {likedByUsers && likedByUsers.length > 0 ? (
                          <>
                              <div className="flex flex-wrap items-center space-x-2">
                                  <div className="flex -space-x-2">
                                      {/* Ensure current user's image and name come first */}
                                      {[...likedByUsers]
                                          .sort((a, b) =>
                                              a.userId === userData.$id ? -1 : b.userId === userData.$id ? 1 : 0
                                          )
                                          .slice(0, 3)
                                          .map((user, index) => (
                                              <img
                                                  key={user.userId}
                                                  src={user.profilePicUrl}
                                                  alt={`${user.name}'s profile`}
                                                  className="w-8 h-8 rounded-full border-2 border-gray-700 transform hover:scale-110 transition-all duration-200 ease-in-out"
                                              />
                                          ))}
                                  </div>
                                  <div className="text-gray-300 text-sm flex-1">
                                      <span className="font-bold text-yellow-300">Liked by</span>{" "}
                                      {[...likedByUsers]
                                          .sort((a, b) =>
                                              a.userId === userData.$id ? -1 : b.userId === userData.$id ? 1 : 0
                                          )
                                          .slice(0, 1)
                                          .map((user) => (
                                              <span key={user.userId}>
                                                  {user.name}{" "}
                                                  {user.userId === userData.$id && "(You)"}
                                              </span>
                                          ))}
                                      {likedByUsers.length > 1 && (
                                          <>
                                              {" "}and{" "}
                                              <span
                                                  onClick={handleShowModal}
                                                  className="text-yellow-300 cursor-pointer hover:underline hover:text-yellow-400 transition-all duration-200 ease-in-out"
                                              >
                                                  {likedByUsers.length - 1} others
                                              </span>
                                          </>
                                      )}
                                  </div>
                              </div>
                          </>
                      ) : (
                          <div className="text-gray-400 text-sm">No likes yet. Be the first to like this!</div>
                      )}
                  </div>

                  {/* Modal */}
                  {isModalOpen && (
                      <div className="fixed top-80 left-0 w-full h-full bg-black bg-opacity-0 flex justify-center items-center z-50">
                          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-lg shadow-2xl w-80">
                              <div className="flex justify-between items-center mb-4">
                                  <h2 className="text-xl text-yellow-300">Liked By</h2>
                                  <FontAwesomeIcon
                                      icon={faTimes}
                                      onClick={handleCloseModal}
                                      className="relative top-0 text-yellow-300 cursor-pointer hover:text-yellow-400 transition-all duration-300 ease-in-out"
                                      size="lg"
                                  />
                              </div>
                              <ul className="text-sm text-gray-300 space-y-2">
                                  {[...likedByUsers]
                                      .sort((a, b) =>
                                          a.userId === userData.$id ? -1 : b.userId === userData.$id ? 1 : 0
                                      ).slice(0, visibleUsers)
                                      .map((user, index) => (
                                          <li
                                              key={index}
                                              className="flex items-center space-x-3 hover:text-yellow-300 cursor-pointer transform hover:scale-105 transition-all duration-200 ease-in-out"
                                          >
                                              <img
                                                  src={user.profilePicUrl}
                                                  alt={`${user.name}'s profile`}
                                                  className="w-8 h-8 rounded-full border-2 border-gray-700"
                                              />
                                              <Link
                                                  to={`/profile/${user.userId}`}
                                                  className="text-white"
                                              >
                                                  {user.name} {user.userId === userData.$id && "(You)"}
                                              </Link>
                                          </li>
                                      ))}
                              </ul>
                              {likedByUsers.length > visibleUsers && (
                                  <button
                                      onClick={handleShowMore}
                                      className="ml-0 mt-4 w-full py-2 bg-yellow-300 text-gray-800 rounded-lg hover:bg-yellow-400 transition-all duration-300 ease-in-out transform hover:scale-105"
                                  >
                                      Show More
                                  </button>
                              )}
                          </div>
                      </div>
                  )}
              </div>




              </div>
            </Container>

            <div className=" top-3 relative flex space-x-4 bg-gradient-to-br from-black via-gray-800 to-gray-900 bg-opacity-70 p-4 rounded-[2.5rem] shadow-xl border-2 border-gray-700 transition-all duration-500 hover:scale-105 hover:rotate-[1deg]">
                {/* Like Button */}
                <div className="relative">
                    <Button
                        onClick={handleLike}
                        className={`p-4 rounded-full transition-transform duration-300 hover:scale-125 ${
                            likedByUser
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                    >
                        <FontAwesomeIcon
                            icon={faHeart}
                            className={`text-white text-xl ${
                                likedByUser ? 'animate-bounce' : ''
                            }`}
                        />
                    </Button>
                    {likedByUser && (
                        <div className="absolute top-[-20px] left-[50%] transform -translate-x-[50%]">
                            {/* Heart Explosion Animation */}
                            <span className="block w-4 h-4 bg-red-500 rounded-full animate-heart-explode"></span>
                            <span className="block w-3 h-3 bg-red-400 rounded-full animate-heart-explode"></span>
                        </div>
                    )}
                </div>

                {/* Save Button */}
                <div className="relative">
                  <Button
                      onClick={handleSave}
                      className={`relative p-4 rounded-full transition-transform duration-300 hover:scale-125 cursor-pointer ${
                          savedByUser ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'
                      }`}
                  >
                      <FontAwesomeIcon
                          icon={faBookmark}
                          className={`text-white text-xl transition-transform ${
                              savedByUser ? 'animate-bookmark-slide' : ''
                          }`}
                      />
                  </Button>

                  {savedByUser && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                          {/* Sparkle Animation */}
                          <div className="relative">
                              <span className="absolute w-4 h-4 bg-yellow-400 rounded-full animate-sparkle top-0 left-[10%]"></span>
                              <span className="absolute w-3 h-3 bg-yellow-300 rounded-full animate-sparkle top-[50%] right-[10%]"></span>
                              <span className="absolute w-2 h-2 bg-yellow-200 rounded-full animate-sparkle bottom-0 left-[40%]"></span>
                          </div>
                      </div>
                  )}
                </div>

            </div>

            {/* Comment Section */}
            <Container className='mt-8 max-w-2xl mx-auto'>
                <h2 className="text-2xl font-bold text-yellow-300 text-center">Comments</h2>
                
                <form onSubmit={handleCommentSubmit} className="flex flex-col mt-4 p-4 bg-black bg-opacity-20 backdrop-blur-lg rounded-lg shadow-lg">
                  <textarea
                    id="commentTextarea"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="p-2 rounded-lg bg-gray-800 text-white resize-none h-24 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-700"
                  />

                  <div className="flex justify-center mt-2">
                    <Button 
                      type="submit" 
                      className="w-full text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full shadow-lg transition-transform duration-300 transform hover:bg-gradient-to-l hover:scale-105 hover:shadow-xl py-2"
                    >
                      Post
                    </Button>
                  </div>
                </form>


                {/* Divider */}
                <div className="my-4 border-b border-gray-600"></div>

                <div className="comments-container mt-4 space-y-4 relative">
                {flyingComment && (
                    <div className="flying-comment">
                        {flyingComment}
                    </div>
                )}
                {comments.length === 0 ? (
                    <div className="text-teal-50 text-center">No comments yet.</div>
                ) : (
                    comments.slice(0, showMoreComments ? comments.length : 3).map((comment, index) => (
                        <div key={index} className="relative animate-fadeIn break-words bg-white bg-opacity-30 backdrop-blur-lg border border-white rounded-lg shadow-lg p-4">
                            <div className="flex justify-between items-start">
                                <p className="text-gray-300 font-semibold">
                                    <strong>
                                        {comment.userName} {comment.userId === userData.$id && "(You)"}
                                    </strong>
                                </p>
                                {(isAuthor || userData.$id === comment.userId) && (
                                    <Button 
                                        onClick={() => deleteComment(comment)} 
                                        className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                )}
                            </div>
                            <span className="text-gray-400 text-sm">
                                {getCommentDate(new Date(comment.createdAt))}, {new Date(comment.createdAt).toLocaleTimeString()}
                            </span>
                            <p className="text-gray-300 mt-1 break-words">{comment.text}</p>
                        </div>
                    ))
                )}

                {comments.length > 3 && (
                    <Button onClick={() => setShowMoreComments(!showMoreComments)} className="ml-0 mt-2 bg-gray-600 text-white rounded p-2">
                        {showMoreComments ? "Show Less" : "Show More"}
                    </Button>
                )}
            </div>

            </Container>

            {/* Confirmation Modal */}
            {showConfirm && (
              <div className="absolute inset-0 top-[-463px] flex items-center justify-center z-20">
              <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 text-white rounded-lg p-8 shadow-2xl max-w-lg w-full z-60 transform transition-all animate-slideInLeft animate-popIn animate-glowingModal animate-tiltIn">
                  <h2 className="text-2xl font-extrabold mb-6 text-center text-yellow-400 animate-bounce animate-neonGlow">
                      Are you sure you want to delete this post?
                  </h2>
                  <div className="flex justify-center gap-6">
                      <Button
                          onClick={handleConfirmDelete}
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transform hover:scale-110 transition duration-300 ease-in-out animate-popIn animate-buttonGlow animate-neonPulse"
                      >
                          Yes, Delete
                      </Button>
          
                      <Button
                          onClick={handleCancelDelete}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transform hover:scale-110 transition duration-300 ease-in-out animate-popIn animate-buttonGlow animate-neonPulse"
                      >
                          No, Cancel
                      </Button>
                  </div>
              </div>
          </div>
          
          
            )}
        </div>
      </div>
        
    ) : null;
};



export default Post;
