// API Configuration
const API_BASE_URL = 'http://localhost:5001/api';

// API Functions
const api = {
    // Menu
    getMenu: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${API_BASE_URL}/menu?${queryString}` : `${API_BASE_URL}/menu`;
        const response = await fetch(url, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch menu');
        return response.json();
    },

    getMenuItemById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/menu/${id}`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch menu item');
        return response.json();
    },

    createMenuItem: async (data) => {
        const response = await fetch(`${API_BASE_URL}/menu`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create menu item');
        return response.json();
    },

    updateMenuItem: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update menu item');
        return response.json();
    },

    deleteMenuItem: async (id) => {
        const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to delete menu item');
        return response.json();
    },

    // Orders
    getOrders: async () => {
        const response = await fetch(`${API_BASE_URL}/orders`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch orders');
        return response.json();
    },

    getOrderById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch order');
        return response.json();
    },

    createOrder: async (data) => {
        console.log('ORDER DATA BEING SENT:', data);

        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Backend response:', response.status, errorText);

            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { message: errorText };
            }

            throw new Error(
                errorData.message || errorData.error || 'Failed to create order'
            );
        }

        return response.json();
    },
    updateOrder: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update order');
        return response.json();
    },

    deleteOrder: async (id) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to delete order');
        return response.json();
    },

    // Reviews
    getReviews: async () => {
        const response = await fetch(`${API_BASE_URL}/reviews`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch reviews');
        return response.json();
    },

    createReview: async (data) => {
        const response = await fetch(`${API_BASE_URL}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create review');
        return response.json();
    },

    deleteReview: async (id) => {
        const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to delete review');
        return response.json();
    },

    // Restaurant
    getRestaurant: async () => {
        const response = await fetch(`${API_BASE_URL}/restaurant`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch restaurant info');
        return response.json();
    },

    updateRestaurant: async (data) => {
        const response = await fetch(`${API_BASE_URL}/restaurant`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update restaurant info');
        return response.json();
    }
};
