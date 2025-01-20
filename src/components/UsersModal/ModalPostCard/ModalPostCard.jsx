import React, { useState, useEffect } from 'react';
import './modalPostCard.css'; // Import CSS for styling
import parse from "html-react-parser";
import appWriteService from '../../../appwrite/config';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const ModalPostCard = ({ post, onClick }) => {
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (post.featuredImage) {
      const lowQualityImage = `${appWriteService.getFilePreview(post.featuredImage)}&width=100&height=100`; 
      setImageSrc(lowQualityImage);
    }
  }, [post.featuredImage]);

  const handleImageLoad = () => {
    if (post.featuredImage) {
      const highQualityImage = appWriteService.getFilePreview(post.featuredImage); 
      setImageSrc(highQualityImage);
    }
  };

  // A helper function to fix content before parsing
  return (
    <div className="modal-post-card" onClick={onClick}>
      <div className="modal-post-card-image">
        {post.featuredImage ? (
          <img 
            src={imageSrc} 
            alt={post.title} 
            className="modal-post-card-img" 
            loading="lazy" 
          />
        ) : (
          <div className="modal-post-card-placeholder">No Image</div>
        )}
      </div>
      <div className="modal-post-card-content">
        <Link to={`/PoeticOdyssey/post/${post.$id}`} className="post-link">
          <h5 className="modal-post-card-title">{post.title}</h5>
        </Link>
        <div className="modal-post-card-excerpt">
          {parse(post.content.length > 20 ? `${post.content.substring(0, 20)}...` : post.content)}
        </div>
        <Link to={`/PoeticOdyssey/post/${post.$id}`} className="post-link">
          Read more
        </Link>
      </div>
    </div>
  );
};



export default ModalPostCard;
