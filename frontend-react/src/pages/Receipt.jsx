import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Receipt() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id') || searchParams.get('orderId');
  const { isCustomerLoggedIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isCustomerLoggedIn) {
      navigate('/login');
      return;
    }

    if (!orderId) {
      setError('No order ID provided.');
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    Promise.all([api.getMyOrderById(orderId), api.getRestaurant()])
      .then(([orderData, restData]) => {
        if (!isMounted) return;
        setOrder(orderData);
        setRestaurant(restData);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load order receipt.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [orderId, isCustomerLoggedIn, authLoading, navigate]);

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>ORDER RECEIPT</h1>
          <p>Thank you for ordering with CHUNKIES</p>
        </div>
      </section>

      <section className="checkout-section">
        <div className="container" style={{ maxWidth: '650px', margin: '0 auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p>Loading receipt...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p className="error-message">{error}</p>
              <Link to="/orders" className="btn btn-secondary" style={{ marginTop: '16px' }}>
                Back to My Orders
              </Link>
            </div>
          ) : order ? (
            <>
              <div className="receipt-card" id="receiptContent">
                <div className="receipt-header">
                  <h2>{restaurant?.name || 'CHUNKIES'}</h2>
                  <p>{restaurant?.address?.fullAddress || 'Jogeshwari West, Mumbai'}</p>
                  <p>Phone: {restaurant?.phone || '090040 94979'}</p>
                </div>

                <div className="receipt-divider"></div>

                <div className="receipt-details">
                  <div className="receipt-line">
                    <strong>Order ID:</strong> {order.orderId}
                  </div>
                  <div className="receipt-line">
                    <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
                  </div>
                  <div className="receipt-line">
                    <strong>Customer:</strong> {order.customerName}
                  </div>
                  <div className="receipt-line">
                    <strong>Phone:</strong> {order.phone}
                  </div>
                  {order.email && (
                    <div className="receipt-line">
                      <strong>Email:</strong> {order.email}
                    </div>
                  )}
                  <div className="receipt-line">
                    <strong>Order Type:</strong> {order.orderType}
                  </div>
                  <div className="receipt-line">
                    <strong>Payment Method:</strong> {order.paymentMethod || 'COD'}
                  </div>
                  <div className="receipt-line">
                    <strong>Payment Status:</strong> {order.paymentStatus || 'Pending'}
                  </div>
                  {order.address && (
                    <div className="receipt-line">
                      <strong>Delivery Address:</strong> {order.address}
                    </div>
                  )}
                  {order.tableNumber && (
                    <div className="receipt-line">
                      <strong>Table Number:</strong> {order.tableNumber}
                    </div>
                  )}
                </div>

                <div className="receipt-divider"></div>

                <div className="receipt-items">
                  <h3>Items</h3>
                  {(order.items || []).map((item, idx) => (
                    <div className="receipt-item-row" key={idx}>
                      <div>
                        <div className="receipt-item-name">{item.name}</div>
                        <div className="receipt-item-qty">× {item.quantity}</div>
                      </div>
                      <div className="receipt-item-total">
                        ₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="receipt-divider"></div>

                <div className="receipt-totals">
                  <div className="receipt-total-row">
                    <span>Subtotal</span>
                    <span>₹{Number(order.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="receipt-total-row">
                    <span>Tax (5%)</span>
                    <span>₹{Number(order.tax || 0).toFixed(2)}</span>
                  </div>
                  <div className="receipt-total-row total">
                    <span>Total</span>
                    <span>₹{Number(order.total || 0).toFixed(2)}</span>
                  </div>
                </div>

                <div className="receipt-footer">
                  <p>Thank you for ordering with CHUNKIES!</p>
                </div>
              </div>

              <div className="receipt-actions" style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setTimeout(() => window.print(), 300)}
                >
                  <i className="fas fa-print"></i> Print / Download
                </button>
                <Link to="/orders" className="btn btn-secondary">
                  Back to My Orders
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </section>
    </>
  );
}
