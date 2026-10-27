import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import LoginRequiredModal from './LoginRequiredModal';
import Toast from './Toast';

export default function Layout() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 200px)', flex: '1 0 auto' }}>
        <Outlet />
      </main>
      <Footer />

      {/* Global customer modals & drawers */}
      <CartDrawer />
      <LoginRequiredModal />
      <Toast />
    </>
  );
}
