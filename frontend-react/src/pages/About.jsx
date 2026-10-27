import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>WELCOME TO CHUNKIES</h1>
          <p>Big flavour. Big chunkies.</p>
        </div>
      </section>

      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>Your Go-To Spot for Serious Cravings</h2>
              <p>
                At CHUNKIES, we believe in big flavours and even bigger satisfaction.
                Located in the heart of Jogeshwari West, Mumbai, we're your destination
                for loaded burgers, crispy chicken, delicious wraps, and sides that hit
                the spot every time.
              </p>

              <p>
                Whether you're dining in, grabbing takeaway, or ordering delivery, we've
                got you covered with food that's made fresh and packed with flavour.
                From our signature Mexican Chicken Burger to our crispy Chicken
                Strips, every item on our menu is crafted to satisfy your cravings.
              </p>

              <p>
                We're open 24 hours, because hunger doesn't follow a schedule. Come
                visit us at Chunkies Shop on Swami Vivekanand Road, or order from the
                comfort of your home. Good food, great prices, and flavours that keep
                you coming back – that's the CHUNKIES promise.
              </p>

              <div className="about-highlights">
                <div className="highlight">
                  <i className="fas fa-utensils"></i>
                  <h3>Fast Food</h3>
                  <p>Quick, delicious, and satisfying</p>
                </div>
                <div className="highlight">
                  <i className="fas fa-fire"></i>
                  <h3>Big Flavours</h3>
                  <p>Bold tastes in every bite</p>
                </div>
                <div className="highlight">
                  <i className="fas fa-wallet"></i>
                  <h3>Affordable</h3>
                  <p>Great food at great prices</p>
                </div>
                <div className="highlight">
                  <i className="fas fa-clock"></i>
                  <h3>24 Hours</h3>
                  <p>Always open when you're hungry</p>
                </div>
              </div>

              <div style={{ marginTop: '36px', textAlign: 'center' }}>
                <Link to="/menu" className="btn btn-primary btn-lg" style={{ marginRight: '16px' }}>
                  EXPLORE OUR MENU
                </Link>
                <Link to="/contact" className="btn btn-secondary btn-lg">
                  FIND US
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
