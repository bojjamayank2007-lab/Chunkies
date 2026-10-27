import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MenuCard from '../components/MenuCard';
import api from '../utils/api';

function renderReviewStars(rating) {
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

export default function Home() {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [popularFilter, setPopularFilter] = useState('all');
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    let isMounted = true;

    api
      .getMenu()
      .then((items) => {
        if (!isMounted) return;
        setFeaturedItems(items || []);
      })
      .catch((err) => console.error('Menu load error:', err))
      .finally(() => {
        if (isMounted) setLoadingMenu(false);
      });

    api
      .getReviews()
      .then((revs) => {
        if (!isMounted) return;
        setReviews(revs || []);
      })
      .catch((err) => console.error('Reviews load error:', err))
      .finally(() => {
        if (isMounted) setLoadingReviews(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const displayedFeatured = featuredItems.filter((item) => {
    if (!item.isFeatured && popularFilter === 'all') {
      // If none explicitly featured, show top items
      return true;
    }
    if (popularFilter === 'all') return item.isFeatured;
    if (popularFilter === 'veg') return item.isVeg && (item.isFeatured || true);
    if (popularFilter === 'non-veg') return !item.isVeg && (item.isFeatured || true);
    return true;
  });

  const featuredToRender = displayedFeatured.length > 0 ? displayedFeatured.slice(0, 6) : featuredItems.slice(0, 6);

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              BIG FLAVOUR.
              <br />
              BIG CHUNKIES.
            </h1>
            <p className="hero-subtitle">
              Loaded burgers, crispy chicken, wraps and sides made for serious cravings.
            </p>

            <div className="hero-buttons">
              <Link to="/menu" className="btn btn-primary btn-lg">
                ORDER NOW
              </Link>
              <Link to="/menu" className="btn btn-secondary btn-lg">
                EXPLORE MENU
              </Link>
            </div>

            <div className="hero-badges">
              <div className="badge">
                <i className="fas fa-star"></i>
                <span>4.0 Google Rating</span>
              </div>
              <div className="badge">
                <i className="fas fa-users"></i>
                <span>500+ Reviews</span>
              </div>
              <div className="badge">
                <i className="fas fa-rupee-sign"></i>
                <span>₹200–₹400 Avg. Spend</span>
              </div>
            </div>
          </div>

          <div className="hero-image">
            <div className="hero-card floating">
              <div className="hero-card-badge">🔥 CUSTOMER FAVOURITE</div>
              <h3>Mexican Chicken Burger</h3>
              <p>Spicy chicken patty with Mexican spices</p>
              <span className="price">₹199</span>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Section */}
      <section className="promo">
        <div className="container">
          <div className="promo-content">
            <h2>CRAVING SOMETHING GOOD?</h2>
            <p>Your next favourite bite is waiting.</p>
            <Link to="/menu" className="btn btn-primary">
              ORDER NOW
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Menu Section */}
      <section className="featured-menu">
        <div className="container">
          <h2 className="section-title">POPULAR ITEMS</h2>
          <div className="popular-filter-bar">
            <button
              type="button"
              className={`popular-filter-btn ${popularFilter === 'all' ? 'active' : ''}`}
              onClick={() => setPopularFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`popular-filter-btn ${popularFilter === 'veg' ? 'active' : ''}`}
              onClick={() => setPopularFilter('veg')}
            >
              Veg
            </button>
            <button
              type="button"
              className={`popular-filter-btn ${popularFilter === 'non-veg' ? 'active' : ''}`}
              onClick={() => setPopularFilter('non-veg')}
            >
              Non-Veg
            </button>
          </div>

          {loadingMenu ? (
            <div className="loading" style={{ textAlign: 'center', padding: '40px 0' }}>
              Loading menu...
            </div>
          ) : featuredToRender.length === 0 ? (
            <p className="empty-cart" style={{ textAlign: 'center', padding: '40px 0' }}>
              No items found.
            </p>
          ) : (
            <div className="menu-grid" id="featuredMenu">
              {featuredToRender.map((item) => (
                <MenuCard key={item._id || item.id} item={item} />
              ))}
            </div>
          )}

          <div className="text-center" style={{ marginTop: '32px' }}>
            <Link to="/menu" className="btn btn-secondary">
              VIEW FULL MENU
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="reviews" id="reviews">
        <div className="container">
          <h2 className="section-title">WHAT PEOPLE SAY</h2>
          <div className="rating-summary">
            <div className="rating-large">
              <span className="rating-number">4.0</span>
              <span className="rating-total">/ 5</span>
            </div>
            <div className="rating-info">
              <p>566+ Google Reviews</p>
              <div className="stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star-half-alt"></i>
              </div>
            </div>
          </div>

          {loadingReviews ? (
            <div className="loading" style={{ textAlign: 'center', padding: '30px 0' }}>
              Loading reviews...
            </div>
          ) : (
            <div className="reviews-grid" id="reviewsGrid">
              {reviews.slice(0, 6).map((rev) => (
                <div className="review-card" key={rev._id || rev.id}>
                  <div className="review-header">
                    <div className="review-author">
                      <div className="review-avatar">
                        {(rev.name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div className="review-name">{rev.name}</div>
                    </div>
                    <div className="review-stars">
                      {renderReviewStars(rev.rating || 5)}
                    </div>
                  </div>
                  <p className="review-text">"{rev.review}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
