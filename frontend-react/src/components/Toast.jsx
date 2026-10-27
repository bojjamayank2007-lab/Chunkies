import React from 'react';
import { useCart } from '../context/CartContext';

export default function Toast() {
  const { toastMessage } = useCart();
  if (!toastMessage) return null;

  return (
    <div
      className="cart-toast"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--success-color)',
        color: '#fff',
        padding: '12px 20px',
        borderRadius: '999px',
        zIndex: 5000,
        fontSize: '14px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        animation: 'toastIn 0.25s ease',
        maxWidth: '90vw',
        width: 'max-content',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      <i className="fas fa-check-circle"></i> {toastMessage}
    </div>
  );
}
