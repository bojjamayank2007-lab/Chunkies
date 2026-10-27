import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginRequiredModal() {
  const { loginModalOpen, setLoginModalOpen } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!loginModalOpen) return null;

  const handleNavigate = (path) => {
    setLoginModalOpen(false);
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    navigate(`${path}?redirect=${redirect}`);
  };

  return (
    <div
      className="modal active"
      id="loginRequiredModal"
      onClick={(e) => {
        if (e.target.id === 'loginRequiredModal') setLoginModalOpen(false);
      }}
    >
      <div
        className="modal-content login-required-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="loginRequiredTitle"
      >
        <button
          type="button"
          className="modal-close"
          id="loginRequiredClose"
          aria-label="Close"
          onClick={() => setLoginModalOpen(false)}
        >
          <i className="fas fa-times"></i>
        </button>
        <h2 id="loginRequiredTitle">Login Required</h2>
        <p>Please login or create an account to add items to your cart.</p>
        <div className="login-required-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleNavigate('/login')}
          >
            Login
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleNavigate('/login')}
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
