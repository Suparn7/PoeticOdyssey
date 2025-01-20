import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import appWriteService from '../appwrite/config';
import Container from '../components/container/Container';
import PostForm from '../components/post-form/PostForm';
import '../styles/loader.css'; // Import the CSS file for loader styles

const EditPost = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      const fetchPost = async () => {
        try {
          const fetchedPost = await appWriteService.getPost(slug);
          if (fetchedPost) {
            setPost(fetchedPost);
          } else {
            navigate("/PoeticOdyssey");
          }
        } catch (error) {
          console.error("Error fetching post:", error);
          navigate("/PoeticOdyssey");
        } finally {
          setLoading(false); // Set loading to false after fetching
        }
      };

      fetchPost();
    }
  }, [slug, navigate]);

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

  return (
    <div className='py-6'>
      <Container>
        <PostForm post={post} />
      </Container>
    </div>
  );
}

export default EditPost;
