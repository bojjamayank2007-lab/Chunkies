import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';

function renderOrderTimeline(status, orderType) {
  let steps = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed'];
  if (orderType === 'Delivery') {
    steps = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Completed'];
  }

  if (status === 'Cancelled') {
    return (
      <div className="order-timeline cancelled">
        <div className="timeline-message">Order Cancelled</div>
      </div>
    );
  }

  const currentIndex = steps.indexOf(status);

  return (
    <div className="order-timeline">
      {steps.map((step, idx) => {
        const isCompleted = currentIndex !== -1 && idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const stepClass = isCompleted ? 'completed' : isCurrent ? 'current' : '';
        return (
          <div key={step} className={`timeline-step ${stepClass}`}>
            <div className="timeline-dot"></div>
            <div className="timeline-label">{step}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function Orders() {
  const { user, isCustomerLoggedIn, logout, loading: authLoading } = useAuth();
  const { setCart } = useCart();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isCustomerLoggedIn) {
      navigate('/login?redirect=/orders');
      return;
    }

    if (isCustomerLoggedIn) {
      let isMounted = true;
      setLoadingOrders(true);

      api
        .fetchMyOrders()
        .then((data) => {
          if (!isMounted) return;
          setOrders(data || []);
        })
        .catch((err) => {
          if (!isMounted) return;
          setError(err.message || 'Failed to load orders.');
        })
        .finally(() => {
          if (isMounted) setLoadingOrders(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [authLoading, isCustomerLoggedIn, navigate]);

  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) {
      alert('This order cannot be reordered.');
      return;
    }
    const cartItems = order.items.map((item) => ({
      id: item.menuItem || item._id || '',
      name: item.name || '',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
    }));
    setCart(cartItems);
    navigate('/cart');
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  if (authLoading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <p>Checking authentication...</p>
      </div>
    );
  }

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>MY ORDERS</h1>
          <p>Track your CHUNKIES orders</p>
        </div>
      </section>

      <section className="checkout-section">
        <div className="container">
          <div className="order-summary" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0 }}>
                Welcome, <span id="customerOrdersName">{user?.name || 'Customer'}</span>
              </h2>
              <button
                type="button"
                className="btn btn-secondary"
                id="customerLogoutButton"
                onClick={handleSignOut}
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                SIGN OUT
              </button>
            </div>

            {loadingOrders ? (
              <div className="cart-items" id="customerOrdersList">
                <p className="empty-cart">Loading your orders...</p>
              </div>
            ) : error ? (
              <div className="cart-items" id="customerOrdersList">
                <p className="empty-cart" style={{ color: 'var(--primary-color)' }}>
                  {error}
                </p>
              </div>
            ) : orders.length === 0 ? (
              <div className="cart-items" id="customerOrdersList">
                <p className="empty-cart">You have not placed any orders yet.</p>
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <Link to="/menu" className="btn btn-primary">
                    Order from Menu
                  </Link>
                </div>
              </div>
            ) : (
              <div className="cart-items" id="customerOrdersList">
                {orders.map((order) => {
                  const statusClass = `order-status-badge status-${String(
                    order.status || 'Pending'
                  )
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')}`;

                  const paymentClass = `order-status-badge payment-${String(
                    order.paymentStatus || 'Pending'
                  )
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')}`;

                  const subtotal = Number(order.subtotal) || 0;
                  const tax = Number(order.tax) || 0;
                  const total = Number(order.total) || 0;

                  return (
                    <div className="order-card" key={order._id || order.orderId}>
                      <div className="order-card-header">
                        <div>
                          <div className="order-card-id">{order.orderId}</div>
                          <div className="order-card-date">
                            {new Date(order.createdAt).toLocaleDateString()} ·{' '}
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                        <span className={statusClass}>{order.status || 'Pending'}</span>
                      </div>

                      {renderOrderTimeline(order.status, order.orderType)}

                      <div className="order-info-line">
                        <strong>Order Type:</strong> {order.orderType}
                      </div>

                      <div className="order-info-line">
                        <strong>Payment:</strong> {order.paymentMethod || 'COD'}{' '}
                        <span className={paymentClass}>{order.paymentStatus || 'Pending'}</span>
                      </div>

                      {order.address && (
                        <div className="order-info-line">
                          <strong>Delivery Address:</strong> {order.address}
                        </div>
                      )}

                      {order.tableNumber && (
                        <div className="order-info-line">
                          <strong>Table Number:</strong> {order.tableNumber}
                        </div>
                      )}

                      <div className="order-items-list">
                        {(order.items || []).map((item, i) => (
                          <div className="order-item-row" key={i}>
                            <span className="order-item-name">
                              {item.name} × {item.quantity}
                            </span>
                            <span className="order-item-price">
                              ₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="order-summary-line">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="order-summary-line">
                        <span>Tax (5%)</span>
                        <span>₹{tax.toFixed(2)}</span>
                      </div>
                      <div className="order-summary-line order-summary-total">
                        <span>Total</span>
                        <span>₹{total.toFixed(2)}</span>
                      </div>

                      <div className="order-card-actions">
                        <button
                          type="button"
                          className="btn btn-primary btn-block"
                          onClick={() => handleReorder(order)}
                        >
                          Reorder
                        </button>
                        <Link
                          to={`/receipt?id=${encodeURIComponent(order._id)}`}
                          className="btn btn-secondary btn-block"
                        >
                          View Receipt
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
