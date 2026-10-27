import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function renderStars(rating = 0) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(<i key={i} className="fas fa-star"></i>);
    } else if (i - 0.5 <= rating) {
      stars.push(<i key={i} className="fas fa-star-half-alt"></i>);
    } else {
      stars.push(<i key={i} className="far fa-star"></i>);
    }
  }
  return stars;
}

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [selectedRating, setSelectedRating] = useState(5);
  const [name, setName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState({ text: '', isError: false });

  const fetchReviews = () => {
    setLoading(true);
    api
      .getReviews()
      .then((data) => {
        setReviews(data || []);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load reviews.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !reviewText.trim()) {
      setFormMsg({ text: 'Please fill in all fields.', isError: true });
      return;
    }

    setSubmitting(true);
    setFormMsg({ text: '', isError: false });

    try {
      await api.createReview({
        name: name.trim(),
        rating: selectedRating,
        review: reviewText.trim(),
      });
      setFormMsg({ text: 'Review submitted successfully! Thank you.', isError: false });
      setName('');
      setReviewText('');
      setSelectedRating(5);
      fetchReviews();
    } catch (err) {
      setFormMsg({ text: err.message || 'Failed to submit review.', isError: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>CUSTOMER REVIEWS</h1>
          <p>See what people are saying about CHUNKIES</p>
        </div>
      </section>

      <section className="reviews" id="reviews">
        <div className="container">
          <div className="rating-summary">
            <div className="rating-large">
              <span className="rating-number">4.0</span>
              <span className="rating-total">/ 5</span>
            </div>
            <div className="rating-info">
              <p>500+ Google Reviews</p>
              <div className="stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star-half-alt"></i>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading" style={{ textAlign: 'center', padding: '40px 0' }}>
              Loading reviews...
            </div>
          ) : error ? (
            <p className="error-message" style={{ textAlign: 'center', padding: '40px 0' }}>
              {error}
            </p>
          ) : (
            <div className="reviews-grid" id="reviewsGrid">
              {reviews.map((rev) => (
                <div className="review-card" key={rev._id || rev.id}>
                  <div className="review-header">
                    <div className="review-author">
                      <div className="review-avatar">
                        {(rev.name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div className="review-name">{rev.name}</div>
                    </div>
                    <div className="review-stars">{renderStars(rev.rating)}</div>
                  </div>
                  <p className="review-text">"{rev.review}"</p>
                </div>
              ))}
            </div>
          )}

          <div className="review-form">
            <h3>LEAVE A REVIEW</h3>
            <form onSubmit={handleFormSubmit}>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <button
                    key={starVal}
                    type="button"
                    className={starVal <= selectedRating ? 'active' : ''}
                    onClick={() => setSelectedRating(starVal)}
                    aria-label={`${starVal} star rating`}
                  >
                    <i className="fas fa-star"></i>
                  </button>
                ))}
              </div>

              <div className="form-group">
                <label htmlFor="reviewName">Your Name *</label>
                <input
                  type="text"
                  id="reviewName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reviewText">Your Review *</label>
                <textarea
                  id="reviewText"
                  rows="4"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                ></textarea>
              </div>

              {formMsg.text && (
                <p
                  style={{
                    color: formMsg.isError ? 'var(--primary-color)' : 'var(--success-color)',
                    marginBottom: '16px',
                    fontWeight: 500,
                  }}
                >
                  {formMsg.text}
                </p>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
