import React from 'react';
import './Modal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <i className="modal-close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimesCircle} />
        </i>
        {children}
      </div>
    </div>
  );
};

export default Modal;
