import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { getCustomerToken, getAdminToken } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [adminToken, setAdminToken] = useState(() => getAdminToken());
  const [customerToken, setCustomerToken] = useState(() => getCustomerToken());
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(Boolean(getAdminToken()));
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Check customer user from API
  const checkUser = useCallback(async () => {
    const token = getCustomerToken();
    if (!token) {
      setUser(null);
      setCustomerToken(null);
      return null;
    }
    try {
      const data = await api.getCustomer();
      if (data && data.customer) {
        setUser(data.customer);
        return data.customer;
      }
      setUser(null);
      return null;
    } catch {
      setUser(null);
      localStorage.removeItem('customerToken');
      setCustomerToken(null);
      return null;
    }
  }, []);

  // Check admin session
  const checkAdmin = useCallback(async () => {
    const token = getAdminToken();
    if (!token) {
      setIsAdminLoggedIn(false);
      setAdminToken(null);
      return false;
    }
    try {
      await api.getOrders();
      setIsAdminLoggedIn(true);
      return true;
    } catch {
      setIsAdminLoggedIn(false);
      localStorage.removeItem('adminToken');
      setAdminToken(null);
      return false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function initAuth() {
      setLoading(true);
      await Promise.allSettled([checkUser(), checkAdmin()]);
      if (isMounted) setLoading(false);
    }
    initAuth();
    return () => {
      isMounted = false;
    };
  }, [checkUser, checkAdmin]);

  // Customer Login
  const login = async (email, password) => {
    const result = await api.loginCustomer(email, password);
    if (result.token) {
      localStorage.setItem('customerToken', result.token);
      setCustomerToken(result.token);
    }
    if (result.customer) {
      setUser(result.customer);
    } else {
      await checkUser();
    }
    return result;
  };

  // Customer Register
  const register = async (customerData) => {
    await api.registerCustomer(customerData);
    const loginResult = await api.loginCustomer(customerData.email, customerData.password);
    if (loginResult.token) {
      localStorage.setItem('customerToken', loginResult.token);
      setCustomerToken(loginResult.token);
    }
    if (loginResult.customer) {
      setUser(loginResult.customer);
    } else {
      await checkUser();
    }
    return loginResult;
  };

  // Customer Logout
  const logout = async () => {
    try {
      await api.logoutCustomer();
    } catch (e) {
      console.warn('Customer logout API error:', e);
    } finally {
      localStorage.removeItem('customerToken');
      setCustomerToken(null);
      setUser(null);
    }
  };

  // Admin Login
  const loginAdmin = async (email, password) => {
    const result = await api.loginAdmin(email, password);
    if (result.token) {
      localStorage.setItem('adminToken', result.token);
      setAdminToken(result.token);
    }
    setIsAdminLoggedIn(true);
    return result;
  };

  // Admin Logout
  const logoutAdmin = async () => {
    try {
      await api.logoutAdmin();
    } catch (e) {
      console.warn('Admin logout API error:', e);
    } finally {
      localStorage.removeItem('adminToken');
      setAdminToken(null);
      setIsAdminLoggedIn(false);
    }
  };

  const isCustomerLoggedIn = Boolean(user && customerToken);

  const value = {
    user,
    setUser,
    customerToken,
    isCustomerLoggedIn,
    login,
    register,
    logout,
    checkUser,
    adminToken,
    isAdminLoggedIn,
    loginAdmin,
    logoutAdmin,
    checkAdmin,
    loading,
    loginModalOpen,
    setLoginModalOpen,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
