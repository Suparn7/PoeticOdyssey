import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faLinkedin, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faShareAlt } from '@fortawesome/free-solid-svg-icons';
import Button from './Button'; // Assuming this is a custom button component

const ShareButtons = ({ post }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { title, $id } = post;
  const encodePostTitle = encodeURIComponent(title);
  const postUrl = `https://easysharesuparn7.netlify.app/`;
  const encodePostUrl = encodeURIComponent(postUrl);

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodePostUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodePostTitle}&url=${encodePostUrl}`;
  const linkedinUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodePostUrl}&title=${encodePostTitle}`;
  const whatsappUrl = `https://wa.me/?text=${encodePostTitle}%20${encodePostUrl}`;

  const handleToggleShare = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="relative mt-4">
      {/* Share Button */}
      <Button
        onClick={handleToggleShare}
        className="p-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg hover:from-pink-500 hover:via-purple-600 hover:to-blue-400 transition duration-300 ease-in-out transform hover:scale-110"
      >
        <FontAwesomeIcon icon={faShareAlt} className="text-white text-2xl" />
      </Button>

      {/* Share Icons */}
      {isExpanded && (
        <div className="flex flex-wrap justify-center gap-4 animate-fadeIn">
          <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
            <Button className="p-3 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110">
              <FontAwesomeIcon icon={faFacebook} className="text-white text-xl sm:text-2xl" />
            </Button>
          </a>

          <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
            <Button className="p-3 bg-blue-400 rounded-full shadow-lg hover:bg-blue-500 transition-all duration-300 transform hover:scale-110">
              <FontAwesomeIcon icon={faTwitter} className="text-white text-xl sm:text-2xl" />
            </Button>
          </a>

          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
            <Button className="p-3 bg-blue-700 rounded-full shadow-lg hover:bg-blue-800 transition-all duration-300 transform hover:scale-110">
              <FontAwesomeIcon icon={faLinkedin} className="text-white text-xl sm:text-2xl" />
            </Button>
          </a>

          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button className="p-3 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-110">
              <FontAwesomeIcon icon={faWhatsapp} className="text-white text-xl sm:text-2xl" />
            </Button>
          </a>
        </div>
      )}
    </div>
  );
};

export default ShareButtons;
