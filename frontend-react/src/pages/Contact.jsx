import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function Contact() {
  const [restaurant, setRestaurant] = useState({
    name: 'CHUNKIES',
    phone: '090040 94979',
    openingHours: 'Open 24 Hours',
    address: '225, Swami Vivekanand Rd, Collectors Colony, Momin Nagar, Jogeshwari West, Mumbai, Maharashtra 400102',
    googleMapsUrl: 'https://maps.google.com/?q=Chunkies+Shop+Jogeshwari+West+Mumbai',
  });

  useEffect(() => {
    let isMounted = true;
    api
      .getRestaurant()
      .then((data) => {
        if (!isMounted || !data) return;
        setRestaurant((prev) => ({
          ...prev,
          name: data.name || prev.name,
          phone: data.phone || prev.phone,
          openingHours: data.openingHours || prev.openingHours,
          address: data.address?.fullAddress || prev.address,
          googleMapsUrl: data.googleMapsUrl || prev.googleMapsUrl,
        }));
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const cleanPhone = (restaurant.phone || '').replace(/\s/g, '');

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>COME GET YOUR CHUNKIES</h1>
          <p>We're here 24 hours for your cravings</p>
        </div>
      </section>

      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Location & Hours</h2>

              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <h3>Address</h3>
                  <p>{restaurant.address}</p>
                </div>
              </div>

              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <div>
                  <h3>Phone</h3>
                  <p>{restaurant.phone}</p>
                </div>
              </div>

              <div className="contact-item">
                <i className="fas fa-clock"></i>
                <div>
                  <h3>Hours</h3>
                  <p>{restaurant.openingHours}</p>
                </div>
              </div>

              <div className="contact-buttons">
                <a
                  href={restaurant.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <i className="fas fa-directions"></i> GET DIRECTIONS
                </a>
                <a href={`tel:${cleanPhone}`} className="btn btn-secondary">
                  <i className="fas fa-phone"></i> CALL NOW
                </a>
              </div>
            </div>

            <div className="contact-map">
              <div className="map-placeholder">
                <i className="fas fa-map-marked-alt"></i>
                <h3>VISIT US IN JOGESHWARI WEST</h3>
                <p>{restaurant.address}</p>
                <a
                  href={restaurant.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
