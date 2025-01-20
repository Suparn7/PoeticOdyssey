import React, { useState } from "react";
import "./FollowDetailsModal.css";
import { Link } from "react-router-dom";

const FollowDetailsModal = ({ isOpen, closeModal, modalType, followers, following }) => {
  if (!isOpen) return null;

  const list = modalType === "followers" ? followers : following;
  const isListEmpty = list.length === 0;

  // State to manage the number of users shown
  const [visibleCount, setVisibleCount] = useState(5);

  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 5);
  };

  return (
    <div className="follow-modal-overlay">
      <div className="follow-modal-container">
        <h3 className="follow-modal-title">
          {modalType === "followers" ? "Followers" : "Following"}
        </h3>
        {isListEmpty ? (
          <div className="empty-state-card">
            <p className="empty-state-text">{modalType === "followers" ? "No followers" : "Not following anyone"} yet!</p>
          </div>
        ) : (
          <ul className="follow-list">
            {list.slice(0, visibleCount).map((user, index) => (
              <Link to={`/PoeticOdyssey/profile/${user.$id}`} onClick={closeModal} key={index}>
                <li className="follow-item">
                  <img
                    src={user.profilePicUrl}
                    alt={user.name}
                    className="follow-user-image"
                  />
                  <span className="follow-user-name">{user.name}</span>
                </li>
              </Link>
            ))}
          </ul>
        )}
        {visibleCount < list.length && (
          <button className="show-more-btn" onClick={handleShowMore}>
            Show More
          </button>
        )}
        <button className="follow-modal-close-btn" onClick={closeModal}>
          Close
        </button>
      </div>
    </div>
  );
};

export default FollowDetailsModal;
