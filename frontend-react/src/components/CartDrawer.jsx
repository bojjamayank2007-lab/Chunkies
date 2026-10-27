import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
  } = useCart();
  const navigate = useNavigate();

  // Escape key closes drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  // Lock scroll when open
  useEffect(() => {
    if (isCartOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isCartOpen]);

  const handleCheckout = () => {
    closeCart();
    navigate('/cart');
  };

  return (
    <>
      <div
        className={`cart-overlay ${isCartOpen ? 'active' : ''}`}
        id="cartOverlay"
        onClick={closeCart}
      />
      <div
        className={`cart-drawer ${isCartOpen ? 'active' : ''}`}
        id="cartDrawer"
      >
        <div class="cart-content">
          <div className="cart-header">
            <h3>Your Cart</h3>
            <button className="cart-close" id="cartClose" onClick={closeCart} aria-label="Close cart">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="cart-items" id="cartItems">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>Your cart is empty</p>
                <Link
                  to="/menu"
                  className="btn btn-primary"
                  onClick={closeCart}
                  style={{ marginTop: '12px', display: 'inline-block' }}
                >
                  Add Items from Menu
                </Link>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-item-image">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <i
                        className="fas fa-utensils"
                        style={{ display: item.image ? 'none' : 'flex' }}
                      ></i>
                    </div>
                    <div className="cart-item-details">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">₹{item.price}</div>
                      <div className="cart-item-quantity">
                        <button
                          type="button"
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.id, -1)}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.id, 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="cart-item-remove"
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Remove item"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-secondary btn-block"
                  style={{ marginTop: '16px' }}
                  onClick={clearCart}
                >
                  Clear Cart
                </button>
              </>
            )}
          </div>

          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span id="cartTotal">₹{total}</span>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-block"
              disabled={cart.length === 0}
              onClick={handleCheckout}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
