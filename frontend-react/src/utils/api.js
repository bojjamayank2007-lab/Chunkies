import axios from 'axios';

const PRODUCTION_API_URL = 'https://chunkies.onrender.com/api';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5001/api'
    : PRODUCTION_API_URL);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Shared token helpers
export function getAdminToken() {
  return localStorage.getItem('adminToken');
}

export function getCustomerToken() {
  return localStorage.getItem('customerToken');
}

// Request interceptor to attach customer or admin token
apiClient.interceptors.request.use(
  (config) => {
    const adminToken = getAdminToken();
    const customerToken = getCustomerToken();
    const url = config.url || '';

    // Determine authorization header
    if (url.includes('/auth/customer') || url.includes('/orders/my-orders')) {
      if (customerToken) {
        config.headers.Authorization = `Bearer ${customerToken}`;
      }
    } else if (url === '/orders' && config.method?.toLowerCase() === 'post') {
      // Customer placing an order
      if (customerToken) {
        config.headers.Authorization = `Bearer ${customerToken}`;
      }
    } else if (url.startsWith('/auth/login') || url.startsWith('/auth/logout')) {
      // Admin auth
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } else {
      // Default: prefer adminToken if present, then customerToken
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      } else if (customerToken) {
        config.headers.Authorization = `Bearer ${customerToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to unwrap data and normalize errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    return Promise.reject(customError);
  }
);

// Escape HTML helper for safe rendering if needed
export function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// API functions bundle
export const api = {
  // Admin Authentication
  loginAdmin: (email, password) => apiClient.post('/auth/login', { email, password }),
  logoutAdmin: () => apiClient.post('/auth/logout'),

  // Customer Authentication
  registerCustomer: (customerData) => apiClient.post('/auth/customer/register', customerData),
  loginCustomer: (email, password) => apiClient.post('/auth/customer/login', { email, password }),
  logoutCustomer: () => apiClient.post('/auth/customer/logout'),
  getCustomer: () => apiClient.get('/auth/customer/me'),

  // Menu
  getMenu: (params = {}) => apiClient.get('/menu', { params }),
  createMenuItem: (data) => apiClient.post('/menu', data),
  updateMenuItem: (id, data) => apiClient.put(`/menu/${id}`, data),
  deleteMenuItem: (id) => apiClient.delete(`/menu/${id}`),

  // Orders
  getOrders: () => apiClient.get('/orders'),
  getOrderById: (id) => apiClient.get(`/orders/${id}`),
  getMyOrderById: (id) => apiClient.get(`/orders/my-orders/${id}`),
  fetchMyOrders: () => apiClient.get('/orders/my-orders'),
  createOrder: (data) => apiClient.post('/orders', data),
  verifyPayment: (data) => apiClient.post('/orders/verify-payment', data),
  updateOrder: (id, data) => apiClient.put(`/orders/${id}`, data),
  deleteOrder: (id) => apiClient.delete(`/orders/${id}`),

  // Reviews
  getReviews: () => apiClient.get('/reviews'),
  createReview: (data) => apiClient.post('/reviews', data),
  deleteReview: (id) => apiClient.delete(`/reviews/${id}`),

  // Restaurant
  getRestaurant: () => apiClient.get('/restaurant'),
  updateRestaurant: (data) => apiClient.put('/restaurant', data),
};

export default api;
