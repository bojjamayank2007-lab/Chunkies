import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function Footer() {
  const [restaurant, setRestaurant] = useState({
    name: 'CHUNKIES',
    nameHindi: 'चंकीज़',
    phone: '090040 94979',
    openingHours: 'Open 24 Hours',
    address: 'Jogeshwari West, Mumbai',
  });

  useEffect(() => {
    let isMounted = true;
    api
      .getRestaurant()
      .then((data) => {
        if (!isMounted || !data) return;
        setRestaurant({
          name: data.name || 'CHUNKIES',
          nameHindi: data.nameHindi || 'चंकीज़',
          phone: data.phone || '090040 94979',
          openingHours: data.openingHours || 'Open 24 Hours',
          address: data.address?.fullAddress || 'Jogeshwari West, Mumbai',
        });
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>{restaurant.name}</h3>
            <p className="footer-hindi">{restaurant.nameHindi}</p>
            <p>Big flavour. Big chunkies.</p>
          </div>

          <div className="footer-section">
            <h4>Contact</h4>
            <p>
              <i className="fas fa-map-marker-alt"></i> {restaurant.address}
            </p>
            <p>
              <i className="fas fa-phone"></i> {restaurant.phone}
            </p>
            <p>
              <i className="fas fa-clock"></i> {restaurant.openingHours}
            </p>
          </div>

          <div className="footer-section quick-links-footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/menu">Menu</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section services-footer-section">
            <h4>Services</h4>
            <p>Dine-in</p>
            <p>Takeaway</p>
            <p>Delivery</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} CHUNKIES. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
