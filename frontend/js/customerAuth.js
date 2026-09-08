const customerApiBase = `${API_BASE_URL}/auth/customer`;
window.isCustomerLoggedIn = false;
window.currentCustomer = null;

async function customerRequest(path, options = {}) {
    return safeFetch(`${customerApiBase}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        credentials: 'include'
    });
}

async function registerCustomer(customerData) {
    return customerRequest('/register', {
        method: 'POST',
        body: JSON.stringify(customerData)
    });
}

async function loginCustomer(email, password) {
    return customerRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
}

async function logoutCustomer() {
    return customerRequest('/logout', { method: 'POST' });
}

async function getCustomer() {
    try {
        const data = await safeFetch(`${customerApiBase}/me`, { credentials: 'include' });
        window.isCustomerLoggedIn = true;
        window.currentCustomer = data.customer;
        return data.customer;
    } catch (error) {
        if (error.status === 401 || error.status === 403) {
            window.isCustomerLoggedIn = false;
            window.currentCustomer = null;
            return null;
        }
        throw error;
    }
}

function getPostAuthRedirect() {
    const redirect = new URLSearchParams(window.location.search).get('redirect');
    if (!redirect) return 'customer-orders.html';

    try {
        const redirectUrl = new URL(redirect, window.location.origin);
        return redirectUrl.origin === window.location.origin
            ? `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`
            : 'customer-orders.html';
    } catch (error) {
        return 'customer-orders.html';
    }
}

function promptLoginForCart() {
    let modal = document.getElementById('loginRequiredModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'loginRequiredModal';
        modal.innerHTML = `
            <div class="modal-content login-required-modal-content" role="dialog" aria-modal="true" aria-labelledby="loginRequiredTitle">
                <button type="button" class="modal-close" id="loginRequiredClose" aria-label="Close">
                    <i class="fas fa-times"></i>
                </button>
                <h2 id="loginRequiredTitle">Login Required</h2>
                <p>Please login or create an account to add items to your cart.</p>
                <div class="login-required-actions">
                    <a class="btn btn-primary" id="loginRequiredLogin">Login</a>
                    <a class="btn btn-secondary" id="loginRequiredSignUp">Create Account</a>
                </div>
            </div>
        `;
        modal.addEventListener('click', event => {
            if (event.target === modal) modal.classList.remove('active');
        });
        document.body.appendChild(modal);

        const closeBtn = document.getElementById('loginRequiredClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => modal.classList.remove('active'));
        }
    }

    const redirect = encodeURIComponent(`${window.location.pathname}${window.location.search}${window.location.hash}`);
    const loginUrl = `customer-login.html?redirect=${redirect}`;
    document.getElementById('loginRequiredLogin').href = loginUrl;
    document.getElementById('loginRequiredSignUp').href = loginUrl;
    modal.classList.add('active');
}

async function fetchMyOrders() {
    return safeFetch(`${API_BASE_URL}/orders/my-orders`, { credentials: 'include' });
}

function setFormMessage(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.textContent = message;
    element.style.color = isError ? 'var(--primary-color)' : 'var(--success-color)';
}

function setupCustomerAuthForms() {
    const loginForm = document.getElementById('customerLoginForm');
    const registerForm = document.getElementById('customerRegisterForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(loginForm);
            setFormMessage('customerLoginMessage', 'Signing in...');

            try {
                const result = await loginCustomer(formData.get('email'), formData.get('password'));
                window.isCustomerLoggedIn = true;
                window.currentCustomer = result.customer;
                window.location.href = getPostAuthRedirect();
            } catch (error) {
                setFormMessage('customerLoginMessage', error.message, true);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(registerForm);
            setFormMessage('customerRegisterMessage', 'Creating your account...');

            try {
                const customerData = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    password: formData.get('password')
                };
                await registerCustomer(customerData);
                const result = await loginCustomer(customerData.email, customerData.password);
                window.isCustomerLoggedIn = true;
                window.currentCustomer = result.customer;
                window.location.href = getPostAuthRedirect();
            } catch (error) {
                setFormMessage('customerRegisterMessage', error.message, true);
            }
        });
    }
}


function renderOrderTimeline(status, orderType) {
    let steps = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed'];

    if (orderType === 'Delivery') {
        steps = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Completed'];
    }

    if (status === 'Cancelled') {
        return `
            <div class="order-timeline cancelled">
                <div class="timeline-message">Order Cancelled</div>
            </div>
        `;
    }

    const currentIndex = steps.indexOf(status);

    return `
        <div class="order-timeline">
            ${steps.map((step, index) => {
                const isCompleted = currentIndex !== -1 && index < currentIndex;
                const isCurrent = index === currentIndex;
                const stepClass = isCompleted ? 'completed' : isCurrent ? 'current' : '';
                return `
                    <div class="timeline-step ${stepClass}">
                        <div class="timeline-dot"></div>
                        <div class="timeline-label">${escapeHTML(step)}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}







function reorderOrder(orderId) {
    if (!window.isCustomerLoggedIn) {
        window.location.href = 'customer-login.html';
        return;
    }

    const orders = window.currentCustomerOrders || [];
    const order = orders.find(o => o._id === orderId || o.orderId === orderId);

    if (!order || !order.items || order.items.length === 0) {
        alert('This order cannot be reordered.');
        return;
    }

    try {
        const items = order.items.map(item => ({
            id: item.menuItem || item._id || '',
            name: item.name || '',
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1
        }));

        localStorage.setItem('chunkiesCart', JSON.stringify(items));
        window.location.href = 'cart.html';
    } catch (error) {
        alert('Failed to reorder. Please try again.');
    }
}


function renderOrderCard(order) {
    const orderId = escapeHTML(order.orderId || '');
    const orderDate = escapeHTML(new Date(order.createdAt).toLocaleDateString());
    const orderTime = escapeHTML(new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const orderType = escapeHTML(order.orderType || '');
    const status = escapeHTML(order.status || 'Pending');
    const statusClass = 'order-status-badge status-' + String(order.status || 'Pending').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const paymentMethod = escapeHTML(order.paymentMethod || 'COD');
    const paymentStatus = escapeHTML(order.paymentStatus || 'Pending');
    const paymentClass = 'order-status-badge payment-' + String(order.paymentStatus || 'Pending').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const deliveryAddress = order.address ? `<div class="order-info-line"><strong>Delivery Address:</strong> ${escapeHTML(order.address)}</div>` : '';
    const tableNumber = order.tableNumber ? `<div class="order-info-line"><strong>Table Number:</strong> ${escapeHTML(order.tableNumber)}</div>` : '';
    const itemsList = (order.items || []).map(item => {
        const itemName = escapeHTML(item.name || '');
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        return `
            <div class="order-item-row">
                <span class="order-item-name">${itemName} × ${quantity}</span>
                <span class="order-item-price">₹${escapeHTML((price * quantity).toFixed(2))}</span>
            </div>
        `;
    }).join('');
    const subtotal = Number(order.subtotal) || 0;
    const tax = Number(order.tax) || 0;
    const total = Number(order.total) || 0;

    return `
        <div class="order-card">
            <div class="order-card-header">
                <div>
                    <div class="order-card-id">${orderId}</div>
                    <div class="order-card-date">${orderDate} · ${orderTime}</div>
                </div>
                <span class="${statusClass}">${status}</span>
            </div>
            ${renderOrderTimeline(order.status, order.orderType)}
            <div class="order-info-line"><strong>Order Type:</strong> ${orderType}</div>
            <div class="order-info-line"><strong>Payment:</strong> ${paymentMethod} <span class="${paymentClass}">${paymentStatus}</span></div>
            ${deliveryAddress}
            ${tableNumber}
            <div class="order-items-list">
                ${itemsList || '<div class="order-info-line">No items</div>'}
            </div>
            <div class="order-summary-line"><span>Subtotal</span><span>₹${escapeHTML(subtotal.toFixed(2))}</span></div>
            <div class="order-summary-line"><span>Tax</span><span>₹${escapeHTML(tax.toFixed(2))}</span></div>
            <div class="order-summary-line order-summary-total"><span>Total</span><span>₹${escapeHTML(total.toFixed(2))}</span></div>
            <div class="order-card-actions">
                <button class="btn btn-primary btn-block" onclick="reorderOrder('${escapeHTML(order._id || '')}')">Reorder</button>
                <a class="btn btn-secondary btn-block" href="receipt.html?id=${escapeHTML(order._id || '')}">View Receipt</a>
            </div>
        </div>
    `;
}

async function loadCustomerOrders() {
    const customerName = document.getElementById('customerOrdersName');
    const ordersContainer = document.getElementById('customerOrdersList');
    const logoutButton = document.getElementById('customerLogoutButton');

    if (!ordersContainer) return;

    try {
        const customer = await getCustomer();
        if (!customer) {
            window.location.href = 'customer-login.html';
            return;
        }

        if (customerName) customerName.textContent = customer.name;
        const orders = await fetchMyOrders();
        window.currentCustomerOrders = orders;

        if (orders.length === 0) {
            ordersContainer.innerHTML = '<p class="empty-cart">You have not placed any orders yet.</p>';
            return;
        }

        ordersContainer.innerHTML = orders.map(order => renderOrderCard(order)).join('');
    } catch (error) {
        ordersContainer.innerHTML = `<p class="empty-cart">${escapeHTML(error.message)}</p>`;
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                await logoutCustomer();
            } finally {
                window.location.href = 'customer-login.html';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupCustomerAuthForms();
    loadCustomerOrders();
});
