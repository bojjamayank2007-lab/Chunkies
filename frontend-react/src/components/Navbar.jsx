import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, isCustomerLoggedIn, logout } = useAuth();
  const { cartCount, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef(null);
  const navRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown and mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'HOME', to: '/' },
    { name: 'MENU', to: '/menu' },
    { name: 'ABOUT', to: '/about' },
    { name: 'REVIEWS', to: '/reviews' },
    { name: 'CONTACT', to: '/contact' },
  ];

  return (
    <nav
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      id="navbar"
      ref={navRef}
    >
      <div className="container">
        <div className="nav-brand">
          <Link to="/">CHUNKIES</Link>
          <span className="nav-brand-hindi">चंकीज़</span>
        </div>

        <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`} id="navMenu">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className={`nav-actions ${isCustomerLoggedIn ? 'has-profile-menu' : ''}`}>
          <div
            id="navProfileAction"
            className={`nav-profile-action ${isCustomerLoggedIn ? 'has-profile-menu' : ''}`}
            ref={profileRef}
          >
            {isCustomerLoggedIn && user ? (
              <div className="profile-menu">
                <button
                  id="profileMenuBtn"
                  className="profile-icon-btn"
                  type="button"
                  aria-label="Profile"
                  aria-haspopup="true"
                  aria-expanded={profileDropdownOpen}
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileDropdownOpen((prev) => !prev);
                  }}
                >
                  <i className="fas fa-user-circle"></i>
                </button>
                <div
                  className={`profile-dropdown ${profileDropdownOpen ? 'active' : ''}`}
                  id="profileDropdown"
                >
                  <div className="profile-dropdown-header">
                    <span className="profile-dropdown-name">
                      {user.name || 'Customer'}
                    </span>
                    {user.email && (
                      <span className="profile-dropdown-email">{user.email}</span>
                    )}
                  </div>
                  <Link
                    className="profile-dropdown-item"
                    to="/orders"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <i className="fas fa-shopping-bag"></i> My Orders
                  </Link>
                  <button
                    id="profileLogoutBtn"
                    className="profile-dropdown-item profile-dropdown-logout"
                    type="button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary nav-login-btn">
                Login
              </Link>
            )}
          </div>

          <button
            className="cart-btn"
            id="cartBtn"
            type="button"
            onClick={openCart}
            aria-label="View shopping cart"
          >
            <i className="fas fa-shopping-cart"></i>
            <span className="cart-count" id="cartCount">
              {cartCount}
            </span>
          </button>

          <button
            className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}
            id="hamburger"
            type="button"
            aria-label="Toggle mobile menu"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}
