// API Configuration
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5001/api'
    : '/api';

// Shared safe fetch helper
// 1. Accepts same arguments as fetch
// 2. Reads response.text() first
// 3. Tries JSON.parse(text). If it fails, returns { message: text }
// 4. Throws an Error with message when !response.ok
async function safeFetch(url, options = {}) {
    const response = await fetch(url, options);

    const text = await response.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = { message: text };
    }

    if (!response.ok) {
        const error = new Error(data.message || data.error || `Request failed with status ${response.status}`);
        error.status = response.status;
        throw error;
    }

    return data;
}

const adminFetch = async (url, options = {}) => {
    const response = await fetch(url, {
        ...options,
        credentials: 'include'
    });

    if (response.status === 401) {
        window.dispatchEvent(new Event('admin-session-expired'));
    }

    return response;
};

// API Functions
const api = {

    // 🔐 Admin Authentication
    loginAdmin: async (email, password) => {
        return safeFetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
    },

    logoutAdmin: async () => {
        return safeFetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    },

    // Menu
    getMenu: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString
            ? `${API_BASE_URL}/menu?${queryString}`
            : `${API_BASE_URL}/menu`;

        return safeFetch(url, { credentials: 'include' });
    },

    getMenuItemById: async (id) => {
        return safeFetch(`${API_BASE_URL}/menu/${id}`, { credentials: 'include' });
    },

    createMenuItem: async (data) => {
        return safeFetch(`${API_BASE_URL}/menu`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
    },

    updateMenuItem: async (id, data) => {
        return safeFetch(`${API_BASE_URL}/menu/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
    },

    deleteMenuItem: async (id) => {
        return safeFetch(`${API_BASE_URL}/menu/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
    },

    // Orders
    getOrders: async () => {
        return safeFetch(`${API_BASE_URL}/orders`, { credentials: 'include' });
    },

    getOrderById: async (id) => {
        return safeFetch(`${API_BASE_URL}/orders/${id}`, { credentials: 'include' });
    },

    createOrder: async (data) => {
        return safeFetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
    },

    verifyPayment: async (data) => {
        return safeFetch(`${API_BASE_URL}/orders/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    updateOrder: async (id, data) => {
        return safeFetch(`${API_BASE_URL}/orders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
    },

    deleteOrder: async (id) => {
        return safeFetch(`${API_BASE_URL}/orders/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
    },

    // Reviews
    getReviews: async () => {
        return safeFetch(`${API_BASE_URL}/reviews`, { credentials: 'include' });
    },

    createReview: async (data) => {
        return safeFetch(`${API_BASE_URL}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
    },

    deleteReview: async (id) => {
        return safeFetch(`${API_BASE_URL}/reviews/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
    },

    // Restaurant
    getRestaurant: async () => {
        return safeFetch(`${API_BASE_URL}/restaurant`, { credentials: 'include' });
    },

    updateRestaurant: async (data) => {
        return safeFetch(`${API_BASE_URL}/restaurant`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
    }
};