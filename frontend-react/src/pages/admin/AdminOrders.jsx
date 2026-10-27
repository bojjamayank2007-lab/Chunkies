import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingOrder, setViewingOrder] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    api
      .getOrders()
      .then((data) => {
        setOrders(data || []);
      })
      .catch((err) => {
        console.error('Error loading orders:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateOrder(id, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      alert('Failed to update order status: ' + err.message);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await api.deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o._id !== id));
      if (viewingOrder && viewingOrder._id === id) {
        setViewingOrder(null);
      }
    } catch (err) {
      alert('Failed to delete order: ' + err.message);
    }
  };

  return (
    <section className="section active" id="orders">
      <div className="section-header">
        <h2>Orders Management</h2>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Items</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="ordersTable">
            {loading ? (
              <tr>
                <td colSpan="10">Loading orders...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="10">No orders found</td>
              </tr>
            ) : (
              orders.map((order) => {
                const statuses =
                  order.orderType === 'Delivery'
                    ? [
                        'Pending',
                        'Confirmed',
                        'Preparing',
                        'Ready',
                        'Out for Delivery',
                        'Completed',
                        'Cancelled',
                      ]
                    : ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

                return (
                  <tr key={order._id || order.orderId}>
                    <td>{order.orderId}</td>
                    <td>{order.customerName}</td>
                    <td>{order.phone}</td>
                    <td>{(order.items || []).length} items</td>
                    <td>{order.orderType}</td>
                    <td>₹{order.total}</td>
                    <td>
                      <select
                        className="status-select"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        {statuses.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div>{order.paymentMethod || 'COD'}</div>
                      <small style={{ color: 'var(--text-light)' }}>
                        {order.paymentStatus || 'Pending'}
                      </small>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="action-btn"
                          onClick={() => setViewingOrder(order)}
                          title="View order"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          type="button"
                          className="action-btn delete"
                          onClick={() => handleDeleteOrder(order._id)}
                          title="Delete order"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {viewingOrder && (
        <div className="modal active" id="orderModal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Order Details</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setViewingOrder(null)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div id="orderModalContent">
              <div className="order-info">
                <p>
                  <strong>Order ID:</strong> {viewingOrder.orderId}
                </p>
                <p>
                  <strong>Customer:</strong> {viewingOrder.customerName}
                </p>
                <p>
                  <strong>Phone:</strong> {viewingOrder.phone}
                </p>
                <p>
                  <strong>Email:</strong> {viewingOrder.email || 'N/A'}
                </p>
                <p>
                  <strong>Type:</strong> {viewingOrder.orderType}
                </p>
                <p>
                  <strong>Payment Method:</strong> {viewingOrder.paymentMethod || 'COD'}
                </p>
                <p>
                  <strong>Payment Status:</strong> {viewingOrder.paymentStatus || 'Pending'}
                </p>
                {viewingOrder.address && (
                  <p>
                    <strong>Address:</strong> {viewingOrder.address}
                  </p>
                )}
                {viewingOrder.tableNumber && (
                  <p>
                    <strong>Table:</strong> {viewingOrder.tableNumber}
                  </p>
                )}
                {viewingOrder.notes && (
                  <p>
                    <strong>Notes:</strong> {viewingOrder.notes}
                  </p>
                )}
              </div>

              <h4 style={{ margin: '20px 0 16px' }}>Items</h4>
              {(viewingOrder.items || []).map((item, idx) => (
                <div className="order-detail-item" key={idx}>
                  <div className="order-detail-info">
                    <div className="order-detail-name">{item.name}</div>
                    <div className="order-detail-qty">Quantity: {item.quantity}</div>
                  </div>
                  <div className="order-detail-price">
                    ₹{Number(item.price) * Number(item.quantity)}
                  </div>
                </div>
              ))}

              <div className="order-summary" style={{ marginTop: '20px' }}>
                <div className="order-summary-row">
                  <span>Subtotal</span>
                  <span>₹{viewingOrder.subtotal}</span>
                </div>
                <div className="order-summary-row">
                  <span>Tax (5%)</span>
                  <span>₹{viewingOrder.tax}</span>
                </div>
                <div className="order-summary-row total">
                  <span>Total</span>
                  <span>₹{viewingOrder.total}</span>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <p>
                  <strong>Status:</strong>{' '}
                  <span
                    className={`status-badge status-${String(viewingOrder.status || 'Pending')
                      .toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^a-z-]/g, '')}`}
                  >
                    {viewingOrder.status}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
