import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal, tax, total } = useCart();
  const { user, isCustomerLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    orderType: '',
    address: '',
    notes: '',
    paymentMethod: 'COD',
  });

  const [placingOrder, setPlacingOrder] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Prefill user details if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || user.name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodSelect = (method) => {
    setFormData((prev) => ({ ...prev, paymentMethod: method }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (cart.length === 0) {
      setErrorMessage('Your cart is empty. Please add items before checkout.');
      return;
    }

    if (!formData.customerName.trim() || !formData.phone.trim() || !formData.orderType) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (formData.orderType === 'Delivery' && !formData.address.trim()) {
      setErrorMessage('Please provide a delivery address.');
      return;
    }

    setPlacingOrder(true);

    const orderPayload = {
      customerName: formData.customerName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      items: cart.map((item) => ({
        menuItem: item.id,
        name: item.name,
        quantity: item.quantity,
      })),
      orderType: formData.orderType,
      address: formData.orderType === 'Delivery' ? formData.address.trim() : undefined,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes.trim() || undefined,
    };

    try {
      const response = await api.createOrder(orderPayload);

      // Handle Cash on Delivery or Pay at Counter
      if (formData.paymentMethod === 'COD' || formData.paymentMethod === 'Pay at Counter') {
        clearCart();
        setSuccessOrder({
          id: response._id,
          orderId: response.orderId || 'N/A',
          paymentStatus:
            formData.paymentMethod === 'COD'
              ? 'Pending — Cash on Delivery'
              : 'Pending — Pay at Counter',
        });
        return;
      }

      // Online payment via Razorpay
      if (formData.paymentMethod === 'Online') {
        if (!response.razorpayOrderId || !window.Razorpay) {
          throw new Error('Payment gateway is currently unavailable. Please choose Cash on Delivery.');
        }

        const razorpayOptions = {
          key: response.keyId,
          amount: response.total * 100,
          currency: 'INR',
          name: 'CHUNKIES',
          description: `Order ${response.orderId}`,
          order_id: response.razorpayOrderId,
          handler: async (paymentResponse) => {
            try {
              await api.verifyPayment({
                orderId: response._id,
                paymentId: paymentResponse.razorpay_payment_id,
                razorpayOrderId: paymentResponse.razorpay_order_id,
                signature: paymentResponse.razorpay_signature,
              });

              clearCart();
              setSuccessOrder({
                id: response._id,
                orderId: response.orderId || 'N/A',
                paymentStatus: 'Paid',
              });
            } catch (err) {
              setErrorMessage('Payment verification failed: ' + err.message);
            }
          },
          prefill: {
            name: formData.customerName,
            email: formData.email,
            contact: formData.phone,
          },
        };

        const razorpayInstance = new window.Razorpay(razorpayOptions);
        razorpayInstance.on('payment.failed', (errResp) => {
          setErrorMessage('Payment failed: ' + (errResp.error?.description || 'Transaction cancelled'));
        });
        razorpayInstance.open();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <>
      {/* Header */}
      <section className="page-header">
        <div className="container">
          <h1>CHECKOUT</h1>
          <p>Complete your order</p>
        </div>
      </section>

      {/* Main Checkout Section */}
      <section className="checkout-section">
        <div className="container">
          <div className="checkout-grid">
            {/* Order Summary */}
            <div className="order-summary">
              <h2>Your Order</h2>
              <div className="cart-items" id="checkoutCartItems">
                {cart.length === 0 ? (
                  <div className="empty-cart">
                    <p>Your cart is empty</p>
                    <Link to="/menu" className="btn btn-primary" style={{ marginTop: '12px', display: 'inline-block' }}>
                      Add Items from Menu
                    </Link>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div className="cart-item-image">
                        <i className="fas fa-utensils"></i>
                      </div>
                      <div className="cart-item-details">
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-item-price">₹{item.price}</div>
                        <div className="cart-item-quantity">
                          <button
                            type="button"
                            className="quantity-btn"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            className="quantity-btn"
                            onClick={() => updateQuantity(item.id, 1)}
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
                  ))
                )}
              </div>

              <div className="order-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span id="checkoutSubtotal">₹{subtotal}</span>
                </div>
                <div className="total-row">
                  <span>Tax (5%)</span>
                  <span id="checkoutTax">₹{tax}</span>
                </div>
                <div className="total-row total">
                  <span>Total</span>
                  <span id="checkoutTotal">₹{total}</span>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="checkout-form">
              <h2>Delivery Details</h2>

              {!isCustomerLoggedIn && (
                <div
                  style={{
                    backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    border: '1px solid var(--primary-color)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontSize: '14px',
                  }}
                >
                  <p style={{ margin: 0 }}>
                    Already have an account?{' '}
                    <Link to="/login?redirect=/cart" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
                      Sign in for faster checkout
                    </Link>
                  </p>
                </div>
              )}

              {errorMessage && (
                <div
                  style={{
                    backgroundColor: 'rgba(244, 67, 54, 0.15)',
                    border: '1px solid var(--error-color)',
                    color: '#ff7b72',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontSize: '14px',
                  }}
                >
                  {errorMessage}
                </div>
              )}

              <form id="checkoutForm" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="customerName">Full Name *</label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Mobile Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    pattern="[0-9]{10}"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="orderType">Order Type *</label>
                  <select
                    id="orderType"
                    name="orderType"
                    value={formData.orderType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select order type</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Takeaway">Takeaway</option>
                    <option value="Dine-in">Dine-in</option>
                  </select>
                </div>

                {formData.orderType === 'Delivery' && (
                  <div className="form-group" id="addressGroup">
                    <label htmlFor="address">Delivery Address *</label>
                    <textarea
                      id="address"
                      name="address"
                      rows="3"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="notes">Special Instructions</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows="2"
                    placeholder="Any special requests?"
                    value={formData.notes}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Payment Method</label>
                  <div className="payment-method-group">
                    <label
                      className={`payment-method-option ${formData.paymentMethod === 'COD' ? 'active' : ''}`}
                      id="codOption"
                      onClick={() => handlePaymentMethodSelect('COD')}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={formData.paymentMethod === 'COD'}
                        onChange={() => {}}
                      />
                      <i className="fas fa-money-bill-wave"></i>
                      <span>Cash on Delivery</span>
                    </label>

                    <label
                      className={`payment-method-option ${formData.paymentMethod === 'Online' ? 'active' : ''}`}
                      id="onlineOption"
                      onClick={() => handlePaymentMethodSelect('Online')}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Online"
                        checked={formData.paymentMethod === 'Online'}
                        onChange={() => {}}
                      />
                      <i className="fas fa-credit-card"></i>
                      <span>Pay Online</span>
                    </label>

                    {formData.orderType !== 'Delivery' && (
                      <label
                        className={`payment-method-option ${formData.paymentMethod === 'Pay at Counter' ? 'active' : ''}`}
                        id="counterOption"
                        onClick={() => handlePaymentMethodSelect('Pay at Counter')}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="Pay at Counter"
                          checked={formData.paymentMethod === 'Pay at Counter'}
                          onChange={() => {}}
                        />
                        <i className="fas fa-store"></i>
                        <span>Pay at Counter</span>
                      </label>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-lg"
                  disabled={placingOrder || cart.length === 0}
                  style={{
                    opacity: placingOrder || cart.length === 0 ? 0.6 : 1,
                    cursor: placingOrder || cart.length === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  {placingOrder ? 'PLACING ORDER...' : 'PLACE ORDER'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Order Success Modal */}
      {successOrder && (
        <div className="modal active" id="successModal">
          <div className="modal-content">
            <div className="modal-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2>ORDER PLACED SUCCESSFULLY!</h2>
            <p>Your order has been received.</p>
            <p className="order-id">
              Order ID: <span id="successOrderId">{successOrder.orderId}</span>
            </p>
            <p className="order-message">
              Payment Status: <span id="successPaymentStatus">{successOrder.paymentStatus}</span>
            </p>
            <p className="order-message">We'll prepare your order right away!</p>
            <div className="success-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/')}
              >
                BACK TO HOME
              </button>
              <Link
                to={`/receipt?id=${encodeURIComponent(successOrder.id)}`}
                className="btn btn-secondary"
                id="viewReceiptLink"
              >
                VIEW RECEIPT
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
