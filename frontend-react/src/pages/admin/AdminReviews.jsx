import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = () => {
    setLoading(true);
    api
      .getReviews()
      .then((data) => {
        setReviews(data || []);
      })
      .catch((err) => {
        console.error('Error loading reviews:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert('Failed to delete review: ' + err.message);
    }
  };

  return (
    <section className="section active" id="reviews">
      <div className="section-header">
        <h2>Reviews Management</h2>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="reviewsTable">
            {loading ? (
              <tr>
                <td colSpan="5">Loading reviews...</td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan="5">No reviews found</td>
              </tr>
            ) : (
              reviews.map((rev) => (
                <tr key={rev._id}>
                  <td>{rev.name}</td>
                  <td style={{ color: '#ffb703' }}>
                    {'★'.repeat(rev.rating)}
                    {'☆'.repeat(Math.max(0, 5 - rev.rating))}
                  </td>
                  <td>{rev.review}</td>
                  <td>{new Date(rev.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="action-btn delete"
                        onClick={() => handleDelete(rev._id)}
                        title="Delete review"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
