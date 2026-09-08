// ========================================
// Admin Authentication
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('loginScreen');
    const adminApp = document.getElementById('adminApp');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const loginButton = document.getElementById('loginButton');

    if (!loginScreen || !adminApp || !loginForm) {
        console.error('Admin login elements not found.');
        return;
    }

    // Check existing session
    checkAdminSession();

    // Mobile sidebar navigation
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            if (sidebarOverlay) {
                sidebarOverlay.classList.toggle('active');
            }
        });

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            });
        }

        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                sidebar.classList.remove('active');
                if (sidebarOverlay) {
                    sidebarOverlay.classList.remove('active');
                }
            });
        });
    }

    // Login
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        loginError.textContent = '';

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            loginError.textContent = 'Please enter email and password.';
            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = 'Logging in...';

        try {
            await api.loginAdmin(email, password);

            showAdminApp();
            setupLogout();

        } catch (error) {
            console.error('Login error:', error);
            loginError.textContent = error.message || 'Invalid email or password';

        } finally {
            loginButton.disabled = false;
            loginButton.textContent = 'Login';
        }
    });
});

// ========================================
// Check Admin Session
// ========================================

async function checkAdminSession() {
    const loginScreen = document.getElementById('loginScreen');
    const adminApp = document.getElementById('adminApp');

    try {
        await api.getOrders();

        // Session valid
        loginScreen.style.display = 'none';
        adminApp.style.display = '';

        setupLogout();
        initializeAdminDashboard();

    } catch (error) {

        // Not logged in
        loginScreen.style.display = 'flex';
        adminApp.style.display = 'none';
    }
}


// ========================================
// Show Admin App
// ========================================

function showAdminApp() {
    const loginScreen = document.getElementById('loginScreen');
    const adminApp = document.getElementById('adminApp');

    if (loginScreen) {
        loginScreen.style.display = 'none';
    }

    if (adminApp) {
        adminApp.style.display = '';
    }

    initializeAdminDashboard();
}


// ========================================
// Logout
// ========================================

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');

    if (!logoutBtn) {
        console.warn('Logout button not found.');
        return;
    }

    // Prevent duplicate listeners
    if (logoutBtn.dataset.listenerAttached === 'true') {
        return;
    }

    logoutBtn.dataset.listenerAttached = 'true';

    logoutBtn.addEventListener('click', async () => {

        logoutBtn.disabled = true;
        logoutBtn.textContent = 'Logging out...';

        try {
            await api.logoutAdmin();

        } catch (error) {
            console.error('Logout error:', error);

        } finally {
            showLoginScreen();

            const loginForm = document.getElementById('loginForm');

            if (loginForm) {
                loginForm.reset();
            }

            logoutBtn.disabled = false;
            logoutBtn.textContent = 'Logout';
        }
    });
}


// ========================================
// Show Login Screen
// ========================================

function showLoginScreen() {
    const loginScreen = document.getElementById('loginScreen');
    const adminApp = document.getElementById('adminApp');

    if (loginScreen) {
        loginScreen.style.display = 'flex';
    }

    if (adminApp) {
        adminApp.style.display = 'none';
    }
}


// ========================================
// Admin Dashboard JavaScript
// ========================================
let allOrders = [];
let allMenuItems = [];
let allReviews = [];

// Navigation
function initializeAdminDashboard() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');
    const pageTitle = document.getElementById('pageTitle');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.dataset.section;

            // Update active states
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');

            // Update page title
            pageTitle.textContent = btn.querySelector('span').textContent;

            // Load data for the section
            if (sectionId === 'dashboard') loadDashboard();
            if (sectionId === 'orders') loadOrders();
            if (sectionId === 'menu') loadMenu();
            if (sectionId === 'reviews') loadReviews();
            if (sectionId === 'settings') loadSettings();
        });
    });

    // Load initial data
    loadDashboard();
}


function renderPopularItems(orders) {
    const table = document.getElementById('popularItemsTable');
    if (!table) return;

    const itemMap = {};

    orders.forEach(order => {
        (order.items || []).forEach(item => {
            const name = item.name || 'Unknown Item';
            if (!itemMap[name]) {
                itemMap[name] = { name, timesOrdered: 0, quantitySold: 0 };
            }
            itemMap[name].timesOrdered += 1;
            itemMap[name].quantitySold += Number(item.quantity) || 0;
        });
    });

    const popularItems = Object.values(itemMap)
        .sort((a, b) => b.quantitySold - a.quantitySold)
        .slice(0, 5);

    if (popularItems.length === 0) {
        table.innerHTML = '<tr><td colspan="3">No items ordered yet</td></tr>';
        return;
    }

    table.innerHTML = popularItems.map(item => `
        <tr>
            <td>${escapeHTML(item.name)}</td>
            <td>${escapeHTML(item.timesOrdered)}</td>
            <td>${escapeHTML(item.quantitySold)}</td>
        </tr>
    `).join('');
}


// Load Dashboard
async function loadDashboard() {
    try {
        const [orders, menuItems] = await Promise.all([
            api.getOrders(),
            api.getMenu()
        ]);

        allOrders = orders;
        allMenuItems = menuItems;

        // Calculate stats
        const today = new Date().toDateString();
        const todayOrders = orders.filter(order => new Date(order.createdAt).toDateString() === today);
        const pendingOrders = orders.filter(order => order.status === 'Pending');
        const completedOrders = orders.filter(order => order.status === 'Completed');
        const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

        const nonCancelledOrders = orders.filter(order => order.status !== 'Cancelled');
        const totalOrders = nonCancelledOrders.length;
        const onlineRevenue = nonCancelledOrders
            .filter(order => order.paymentMethod === 'Online' && order.paymentStatus === 'Paid')
            .reduce((sum, order) => sum + (Number(order.total) || 0), 0);
        const codRevenue = nonCancelledOrders
            .filter(order => order.paymentMethod === 'COD')
            .reduce((sum, order) => sum + (Number(order.total) || 0), 0);

        document.getElementById('todayOrders').textContent = todayOrders.length;
        document.getElementById('pendingOrders').textContent = pendingOrders.length;
        document.getElementById('completedOrders').textContent = completedOrders.length;
        document.getElementById('todayRevenue').textContent = `₹${todayRevenue}`;
        document.getElementById('totalMenuItems').textContent = menuItems.length;

        const totalOrdersEl = document.getElementById('totalOrders');
        if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
        const onlineRevenueEl = document.getElementById('onlineRevenue');
        if (onlineRevenueEl) onlineRevenueEl.textContent = `₹${onlineRevenue}`;
        const codRevenueEl = document.getElementById('codRevenue');
        if (codRevenueEl) codRevenueEl.textContent = `₹${codRevenue}`;

        renderPopularItems(orders);

        // Recent orders table
        const recentOrders = orders.slice(0, 5);
        document.getElementById('recentOrdersTable').innerHTML = recentOrders.map(order => {
            const safeStatus = escapeHTML(order.status);
            const statusClass = order.status
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z-]/g, '');

            return `
        <tr>
            <td>${escapeHTML(order.orderId)}</td>
            <td>${escapeHTML(order.customerName)}</td>
            <td>${escapeHTML(order.phone)}</td>
            <td>₹${escapeHTML(order.total)}</td>
            <td>
                <span class="status-badge status-${statusClass}">
                    ${safeStatus}
                </span>
            </td>
            <td>${escapeHTML(new Date(order.createdAt).toLocaleDateString())}</td>
        </tr>
    `;
        }).join('');
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load Orders
async function loadOrders() {
    try {
        const orders = await api.getOrders();
        allOrders = orders;

        document.getElementById('ordersTable').innerHTML = orders.map(order => {
            const statusClass = order.status
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z-]/g, '');

            const safeId = escapeHTML(order._id);
            const paymentMethod = escapeHTML(order.paymentMethod || 'COD');
            const paymentStatus = escapeHTML(order.paymentStatus || 'Pending');

            const statuses = order.orderType === 'Delivery'
                ? ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Completed', 'Cancelled']
                : ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

            const statusOptions = statuses.map(status => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>`).join('');

            return `
        <tr>
            <td>${escapeHTML(order.orderId)}</td>
            <td>${escapeHTML(order.customerName)}</td>
            <td>${escapeHTML(order.phone)}</td>
            <td>${escapeHTML(order.items.length)} items</td>
            <td>${escapeHTML(order.orderType)}</td>
            <td>₹${escapeHTML(order.total)}</td>

            <td>
                <select
                    class="status-select"
                    onchange="updateOrderStatus('${safeId}', this.value)"
                >
                    ${statusOptions}
                </select>
            </td>

            <td>
                <div>${paymentMethod}</div>
                <small>${paymentStatus}</small>
            </td>

            <td>
                ${escapeHTML(new Date(order.createdAt).toLocaleDateString())}
            </td>

            <td>
                <div class="action-buttons">
                    <button
                        class="action-btn"
                        onclick="viewOrder('${safeId}')"
                    >
                        <i class="fas fa-eye"></i>
                    </button>

                    <button
                        class="action-btn delete"
                        onclick="deleteOrder('${safeId}')"
                    >
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
        }).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('ordersTable').innerHTML = '<tr><td colspan="10">Failed to load orders</td></tr>';
    }
}

// Update Order Status
async function updateOrderStatus(id, status) {
    try {
        await api.updateOrder(id, { status });
        alert('Order status updated successfully');
        loadOrders();
    } catch (error) {
        console.error('Error updating order:', error);
        alert('Failed to update order status');
    }
}

// View Order
async function viewOrder(id) {
    try {
        const order = await api.getOrderById(id);

        const modalContent = document.getElementById('orderModalContent');
        modalContent.innerHTML = `
    <div class="order-info">
        <p><strong>Order ID:</strong> ${escapeHTML(order.orderId)}</p>
        <p><strong>Customer:</strong> ${escapeHTML(order.customerName)}</p>
        <p><strong>Phone:</strong> ${escapeHTML(order.phone)}</p>
        <p><strong>Email:</strong> ${escapeHTML(order.email || 'N/A')}</p>
        <p><strong>Type:</strong> ${escapeHTML(order.orderType)}</p>
        <p><strong>Payment Method:</strong> ${escapeHTML(order.paymentMethod || 'COD')}</p>
        <p><strong>Payment Status:</strong> ${escapeHTML(order.paymentStatus || 'Pending')}</p>
        ${order.address ? `<p><strong>Address:</strong> ${escapeHTML(order.address)}</p>` : ''}
        ${order.tableNumber ? `<p><strong>Table:</strong> ${escapeHTML(order.tableNumber)}</p>` : ''}
        ${order.notes ? `<p><strong>Notes:</strong> ${escapeHTML(order.notes)}</p>` : ''}
    </div>
    
    <h4 style="margin: 20px 0 16px;">Items</h4>
    ${order.items.map(item => `
        <div class="order-detail-item">
            <div class="order-detail-info">
                <div class="order-detail-name">${escapeHTML(item.name)}</div>
                <div class="order-detail-qty">Quantity: ${escapeHTML(item.quantity)}</div>
            </div>
            <div class="order-detail-price">₹${escapeHTML(item.price * item.quantity)}</div>
        </div>
    `).join('')}
    
    <div class="order-summary">
        <div class="order-summary-row">
            <span>Subtotal</span>
            <span>₹${escapeHTML(order.subtotal)}</span>
        </div>
        <div class="order-summary-row">
            <span>Tax (5%)</span>
            <span>₹${escapeHTML(order.tax)}</span>
        </div>
        <div class="order-summary-row total">
            <span>Total</span>
            <span>₹${escapeHTML(order.total)}</span>
        </div>
    </div>
    
    <div style="margin-top: 24px;">
        <p>
            <strong>Status:</strong>
            <span class="status-badge status-${escapeHTML(
                order.status.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z-]/g, '')
            )}">
                ${escapeHTML(order.status)}
            </span>
        </p>
    </div>
`;

        document.getElementById('orderModal').classList.add('active');
    } catch (error) {
        console.error('Error viewing order:', error);
        alert('Failed to load order details');
    }
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
}

// Delete Order
async function deleteOrder(id) {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
        await api.deleteOrder(id);
        alert('Order deleted successfully');
        loadOrders();
    } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order');
    }
}

// Load Menu
async function loadMenu() {
    try {
        const menuItems = await api.getMenu();
        allMenuItems = menuItems;

        document.getElementById('menuTable').innerHTML = menuItems.map(item => {
            const safeId = escapeHTML(item._id);

            return `
            <tr>
                <td>
                    <div style="width: 48px; height: 48px; background: var(--bg-dark); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-utensils" style="color: var(--text-light);"></i>
                    </div>
                </td>
                <td>${escapeHTML(item.name)}</td>
                <td>${escapeHTML(item.category)}</td>
                <td>₹${escapeHTML(item.price)}</td>
                <td>${item.isFeatured ? '✓' : '✗'}</td>
                <td>${item.isAvailable ? '✓' : '✗'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="editMenuItem('${safeId}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteMenuItem('${safeId}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        }).join('');
    } catch (error) {
        console.error('Error loading menu:', error);
        document.getElementById('menuTable').innerHTML = '<tr><td colspan="7">Failed to load menu</td></tr>';
    }
}

// Menu Modal
function openMenuModal() {
    document.getElementById('menuModalTitle').textContent = 'Add Menu Item';
    document.getElementById('menuForm').reset();
    document.getElementById('menuItemId').value = '';
    document.getElementById('menuItemAvailable').checked = true;
    document.getElementById('menuModal').classList.add('active');
}

function closeMenuModal() {
    document.getElementById('menuModal').classList.remove('active');
}

// Edit Menu Item
function editMenuItem(id) {
    const item = allMenuItems.find(i => i._id === id);
    if (!item) return;

    document.getElementById('menuModalTitle').textContent = 'Edit Menu Item';
    document.getElementById('menuItemId').value = item._id;
    document.getElementById('menuItemName').value = item.name;
    document.getElementById('menuItemDescription').value = item.description;
    document.getElementById('menuItemPrice').value = item.price;
    document.getElementById('menuItemCategory').value = item.category;
    document.getElementById('menuItemImage').value = item.image || '';
    document.getElementById('menuItemVeg').checked = item.isVeg;
    document.getElementById('menuItemFeatured').checked = item.isFeatured;
    document.getElementById('menuItemAvailable').checked = item.isAvailable;

    document.getElementById('menuModal').classList.add('active');
}

// Menu Form Submit
document.getElementById('menuForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('menuItemId').value;
    const menuItemData = {
        name: document.getElementById('menuItemName').value,
        description: document.getElementById('menuItemDescription').value,
        price: parseFloat(document.getElementById('menuItemPrice').value),
        category: document.getElementById('menuItemCategory').value,
        image: document.getElementById('menuItemImage').value,
        isVeg: document.getElementById('menuItemVeg').checked,
        isFeatured: document.getElementById('menuItemFeatured').checked,
        isAvailable: document.getElementById('menuItemAvailable').checked
    };

    try {
        if (id) {
            await api.updateMenuItem(id, menuItemData);
            alert('Menu item updated successfully');
        } else {
            await api.createMenuItem(menuItemData);
            alert('Menu item created successfully');
        }

        closeMenuModal();
        loadMenu();
    } catch (error) {
        console.error('Error saving menu item:', error);
        alert('Failed to save menu item');
    }
});

// Delete Menu Item
async function deleteMenuItem(id) {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
        await api.deleteMenuItem(id);
        alert('Menu item deleted successfully');
        loadMenu();
    } catch (error) {
        console.error('Error deleting menu item:', error);
        alert('Failed to delete menu item');
    }
}

// Load Reviews
async function loadReviews() {
    try {
        const reviews = await api.getReviews();
        allReviews = reviews;

        document.getElementById('reviewsTable').innerHTML = reviews.map(review => {
            const safeId = escapeHTML(review._id);

            return `
            <tr>
                <td>${escapeHTML(review.name)}</td>
                <td>${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</td>
                <td>${escapeHTML(review.review)}</td>
                <td>${new Date(review.createdAt).toLocaleDateString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn delete" onclick="deleteReview('${safeId}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        }).join('');
    } catch (error) {
        console.error('Error loading reviews:', error);
        document.getElementById('reviewsTable').innerHTML = '<tr><td colspan="5">Failed to load reviews</td></tr>';
    }
}

// Delete Review
async function deleteReview(id) {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
        await api.deleteReview(id);
        alert('Review deleted successfully');
        loadReviews();
    } catch (error) {
        console.error('Error deleting review:', error);
        alert('Failed to delete review');
    }
}

// Load Settings
async function loadSettings() {
    try {
        const restaurant = await api.getRestaurant();

        document.getElementById('restaurantName').value = restaurant.name || '';
        document.getElementById('restaurantPhone').value = restaurant.phone || '';
        document.getElementById('restaurantEmail').value = restaurant.email || '';
        document.getElementById('restaurantAddress').value = restaurant.address?.fullAddress || '';
        document.getElementById('restaurantHours').value = restaurant.openingHours || '';
        document.getElementById('restaurantPriceRange').value = restaurant.priceRange || '';
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Settings Form Submit
document.getElementById('settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const settingsData = {
        name: document.getElementById('restaurantName').value,
        phone: document.getElementById('restaurantPhone').value,
        email: document.getElementById('restaurantEmail').value,
        address: {
            fullAddress: document.getElementById('restaurantAddress').value
        },
        openingHours: document.getElementById('restaurantHours').value,
        priceRange: document.getElementById('restaurantPriceRange').value
    };

    try {
        await api.updateRestaurant(settingsData);
        alert('Settings saved successfully');
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Failed to save settings');
    }
});
