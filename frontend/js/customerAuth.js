const customerApiBase = `${API_BASE_URL}/auth/customer`;
window.isCustomerLoggedIn = false;
window.currentCustomer = null;

function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

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

        if (orders.length === 0) {
            ordersContainer.innerHTML = '<p class="empty-cart">You have not placed any orders yet.</p>';
            return;
        }

        ordersContainer.innerHTML = orders.map(order => `
            <div class="cart-item">
                <div class="cart-item-details">
                    <div class="cart-item-name">${escapeHTML(order.orderId)}</div>
                    <div class="cart-item-price">${escapeHTML(new Date(order.createdAt).toLocaleDateString())}</div>
                    <div>Type: ${escapeHTML(order.orderType)}</div>
                    <div>Status: ${escapeHTML(order.status)}</div>
                </div>
                <div class="cart-item-price">₹${escapeHTML(order.total)}</div>
            </div>
        `).join('');
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
