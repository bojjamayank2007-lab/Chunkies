import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const STORAGE_KEY = 'chunkiesCart';

function loadInitialCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item) =>
          item &&
          typeof item.id === 'string' &&
          typeof item.name === 'string' &&
          typeof item.price === 'number' &&
          typeof item.quantity === 'number' &&
          item.quantity > 0
      );
    }
    return [];
  } catch (error) {
    console.error('Cart load error:', error);
    return [];
  }
}

export function CartProvider({ children }) {
  const { isCustomerLoggedIn, setLoginModalOpen } = useAuth();
  const [cart, setCart] = useState(loadInitialCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cart]);

  // Show floating toast
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage('');
    }, 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Add to cart
  const addToCart = useCallback(
    (itemOrId, nameArg, priceArg, imageArg) => {
      if (!isCustomerLoggedIn) {
        setLoginModalOpen(true);
        return false;
      }

      let id, name, price, image;
      if (typeof itemOrId === 'object' && itemOrId !== null) {
        id = itemOrId.id || itemOrId._id;
        name = itemOrId.name;
        price = Number(itemOrId.price) || 0;
        image = itemOrId.image || '';
      } else {
        id = itemOrId;
        name = nameArg;
        price = Number(priceArg) || 0;
        image = imageArg || '';
      }

      setCart((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === id);
        if (existingIndex > -1) {
          const next = [...prev];
          next[existingIndex] = {
            ...next[existingIndex],
            quantity: next[existingIndex].quantity + 1,
          };
          return next;
        }
        return [...prev, { id, name, price, quantity: 1, image }];
      });

      showToast(`${name} added to cart!`);
      return true;
    },
    [isCustomerLoggedIn, setLoginModalOpen, showToast]
  );

  // Remove from cart
  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Update quantity
  const updateQuantity = useCallback(
    (id, change) => {
      setCart((prev) => {
        const item = prev.find((i) => i.id === id);
        if (!item) return prev;
        const newQty = item.quantity + change;
        if (newQty <= 0) {
          return prev.filter((i) => i.id !== id);
        }
        return prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i));
      });
    },
    []
  );

  // Clear cart
  const clearCart = useCallback(() => {
    setCart([]);
    showToast('Cart cleared');
  }, [showToast]);

  // Open / close drawer
  const openCart = useCallback(() => {
    if (!isCustomerLoggedIn) {
      setLoginModalOpen(true);
      return;
    }
    setIsCartOpen(true);
  }, [isCustomerLoggedIn, setLoginModalOpen]);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  // Calculations
  const cartCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  const value = {
    cart,
    setCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    subtotal,
    tax,
    total,
    isCartOpen,
    openCart,
    closeCart,
    setIsCartOpen,
    toastMessage,
    showToast,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
