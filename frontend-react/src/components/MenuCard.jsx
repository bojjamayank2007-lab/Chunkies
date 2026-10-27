import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

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

export default function MenuCard({ item }) {
  const { addToCart } = useCart();
  const [imageFailed, setImageFailed] = useState(false);

  if (!item) return null;

  const vegClass = item.isVeg ? 'veg' : 'non-veg';
  const vegLabel = item.isVeg ? 'VEG' : 'NON-VEG';
  const itemId = item._id || item.id;

  const handleAddToCart = () => {
    addToCart({
      id: itemId,
      name: item.name,
      price: Number(item.price),
      image: item.image,
    });
  };

  return (
    <div
      className="menu-card"
      data-category={item.category}
      data-price={item.price}
      data-popularity={item.popularity}
    >
      <div className="menu-card-image">
        {item.isFeatured && <div className="menu-card-badge">Featured</div>}
        <div className={`veg-indicator ${vegClass}`}>
          <span className="veg-dot"></span>
          <span className="veg-label">{vegLabel}</span>
        </div>
        {item.image && !imageFailed ? (
          <img
            src={item.image}
            alt={item.name}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <i className="fas fa-utensils"></i>
        )}
      </div>

      <div className="menu-card-content">
        <h3 className="menu-card-name">{item.name}</h3>
        <p className="menu-card-description">{item.description}</p>
        <div className="menu-card-footer">
          <span className="menu-card-price">₹{item.price}</span>
          <div className="menu-card-rating">
            {renderStars(item.rating || 5)}
            <span>({item.rating || 5})</span>
          </div>
        </div>
        <button
          type="button"
          className="add-to-cart"
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
