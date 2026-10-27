import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';

// Customer Pages
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Reviews from './pages/Reviews';
import Receipt from './pages/Receipt';
import { Privacy, Terms, Refund } from './pages/Legal';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminMenu from './pages/admin/AdminMenu';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSettings from './pages/admin/AdminSettings';

// Helper component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// 404 Not Found Page
function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '72px', color: 'var(--primary-color)', marginBottom: '16px' }}>404</h1>
      <h2>Page Not Found</h2>
      <p style={{ color: 'var(--text-light)', margin: '16px 0 32px' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <Routes>
            {/* Customer Routes with Layout (Navbar, Footer, CartDrawer) */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="menu" element={<Menu />} />
              <Route path="cart" element={<Cart />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="login" element={<Login />} />
              <Route path="orders" element={<Orders />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="receipt" element={<Receipt />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />
              <Route path="refund" element={<Refund />} />
              {/* Legacy html redirects */}
              <Route path="index.html" element={<Navigate to="/" replace />} />
              <Route path="menu.html" element={<Navigate to="/menu" replace />} />
              <Route path="cart.html" element={<Navigate to="/cart" replace />} />
              <Route path="about.html" element={<Navigate to="/about" replace />} />
              <Route path="contact.html" element={<Navigate to="/contact" replace />} />
              <Route path="customer-login.html" element={<Navigate to="/login" replace />} />
              <Route path="customer-orders.html" element={<Navigate to="/orders" replace />} />
              <Route path="reviews.html" element={<Navigate to="/reviews" replace />} />
              <Route path="receipt.html" element={<Navigate to="/receipt" replace />} />
              <Route path="privacy.html" element={<Navigate to="/privacy" replace />} />
              <Route path="terms.html" element={<Navigate to="/terms" replace />} />
              <Route path="refund.html" element={<Navigate to="/refund" replace />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Admin Routes with AdminLayout (Sidebar, AdminHeader, Auth protection) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="menu" element={<AdminMenu />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
