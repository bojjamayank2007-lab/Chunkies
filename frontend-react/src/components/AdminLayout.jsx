import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const {
    isAdminLoggedIn,
    loginAdmin,
    logoutAdmin,
    checkAdmin,
    loading: authLoading,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Re-verify session on mount
  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Login handler
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!email.trim() || !password) {
      setLoginError('Please enter email and password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      await loginAdmin(email.trim(), password);
    } catch (err) {
      setLoginError(err.message || 'Invalid email or password');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/admin');
  };

  // Determine current section title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin/orders') return 'Orders Management';
    if (path === '/admin/menu') return 'Menu Management';
    if (path === '/admin/reviews') return 'Reviews Management';
    if (path === '/admin/settings') return 'Restaurant Settings';
    return 'Dashboard';
  };

  // If initial auth check is in flight
  if (authLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--bg-dark)',
          color: 'var(--white)',
        }}
      >
        <p>Loading admin panel...</p>
      </div>
    );
  }

  // If not logged in, render the Admin Login Screen
  if (!isAdminLoggedIn) {
    return (
      <div className="login-screen" id="loginScreen" style={{ display: 'flex' }}>
        <div className="login-card">
          <div className="login-logo">
            <h1>CHUNKIES</h1>
            <p>Admin Dashboard</p>
          </div>

          <form id="loginForm" onSubmit={handleAdminLogin}>
            <div className="login-field">
              <label htmlFor="loginEmail">Email</label>
              <input
                type="email"
                id="loginEmail"
                placeholder="Admin email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="loginPassword">Password</label>
              <input
                type="password"
                id="loginPassword"
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {loginError && <p className="login-error">{loginError}</p>}

            <button type="submit" id="loginButton" disabled={isLoggingIn}>
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link
              to="/"
              style={{
                color: 'var(--text-light)',
                fontSize: '13px',
                textDecoration: 'none',
              }}
            >
              ← Back to Main Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container" id="adminApp">
      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        id="sidebarOverlay"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <h2>CHUNKIES</h2>
          <p>Admin Dashboard</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `nav-btn ${isActive ? 'active' : ''}`
            }
          >
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              `nav-btn ${isActive ? 'active' : ''}`
            }
          >
            <i className="fas fa-shopping-bag"></i>
            <span>Orders</span>
          </NavLink>

          <NavLink
            to="/admin/menu"
            className={({ isActive }) =>
              `nav-btn ${isActive ? 'active' : ''}`
            }
          >
            <i className="fas fa-utensils"></i>
            <span>Menu</span>
          </NavLink>

          <NavLink
            to="/admin/reviews"
            className={({ isActive }) =>
              `nav-btn ${isActive ? 'active' : ''}`
            }
          >
            <i className="fas fa-star"></i>
            <span>Reviews</span>
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `nav-btn ${isActive ? 'active' : ''}`
            }
          >
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </NavLink>
        </nav>

        <button
          id="logoutBtn"
          className="logout-btn"
          type="button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="admin-header">
          <button
            className="mobile-menu-btn"
            id="mobileMenuBtn"
            aria-label="Open navigation"
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            <i className="fas fa-bars"></i>
          </button>
          <h1 id="pageTitle">{getPageTitle()}</h1>
          <Link to="/" className="btn btn-secondary" target="_blank">
            <i className="fas fa-external-link-alt"></i> View Website
          </Link>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
