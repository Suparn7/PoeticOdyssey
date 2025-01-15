import React from 'react';
import './modalProfileCard.css'; // New CSS for profile card

const ModalProfileCard = ({ user, onClose }) => {
  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal-content">
        <button onClick={onClose} className="close-profile-button">X</button>
        <div className="profile-header">
          <h2>{user.name}'s Profile</h2>
        </div>
        <div className="profile-body">
          <div className="profile-avatar">
            {user.profilePicUrl ? (
              <img src={user.profilePicUrl} alt={user.name} className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-placeholder">
                <span className="profile-avatar-icon">?</span>
              </div>
            )}
          </div>
          <div className="profile-details">
            <p><strong>Bio:</strong> {user.bio}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Location:</strong> {user.location}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalProfileCard;
