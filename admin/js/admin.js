// Admin Dashboard JavaScript
let allOrders = [];
let allMenuItems = [];
let allReviews = [];

// Navigation
document.addEventListener('DOMContentLoaded', () => {
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
});

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

        document.getElementById('todayOrders').textContent = todayOrders.length;
        document.getElementById('pendingOrders').textContent = pendingOrders.length;
        document.getElementById('completedOrders').textContent = completedOrders.length;
        document.getElementById('todayRevenue').textContent = `₹${todayRevenue}`;
        document.getElementById('totalMenuItems').textContent = menuItems.length;

        // Recent orders table
        const recentOrders = orders.slice(0, 5);
        document.getElementById('recentOrdersTable').innerHTML = recentOrders.map(order => `
            <tr>
                <td>${order.orderId}</td>
                <td>${order.customerName}</td>
                <td>${order.phone}</td>
                <td>₹${order.total}</td>
                <td><span class="status-badge status-${order.status.toLowerCase().replace(' ', '-')}">${order.status}</span></td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load Orders
async function loadOrders() {
    try {
        const orders = await api.getOrders();
        allOrders = orders;

        document.getElementById('ordersTable').innerHTML = orders.map(order => `
            <tr>
                <td>${order.orderId}</td>
                <td>${order.customerName}</td>
                <td>${order.phone}</td>
                <td>${order.items.length} items</td>
                <td>${order.orderType}</td>
                <td>₹${order.total}</td>
                <td>
                    <select class="status-select" onchange="updateOrderStatus('${order._id}', this.value)">
                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                        <option value="Ready" ${order.status === 'Ready' ? 'selected' : ''}>Ready</option>
                        <option value="Out for Delivery" ${order.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                        <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="viewOrder('${order._id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteOrder('${order._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('ordersTable').innerHTML = '<tr><td colspan="9">Failed to load orders</td></tr>';
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
                <p><strong>Order ID:</strong> ${order.orderId}</p>
                <p><strong>Customer:</strong> ${order.customerName}</p>
                <p><strong>Phone:</strong> ${order.phone}</p>
                <p><strong>Email:</strong> ${order.email || 'N/A'}</p>
                <p><strong>Type:</strong> ${order.orderType}</p>
                ${order.address ? `<p><strong>Address:</strong> ${order.address}</p>` : ''}
                ${order.tableNumber ? `<p><strong>Table:</strong> ${order.tableNumber}</p>` : ''}
                ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
            </div>
            
            <h4 style="margin: 20px 0 16px;">Items</h4>
            ${order.items.map(item => `
                <div class="order-detail-item">
                    <div class="order-detail-info">
                        <div class="order-detail-name">${item.name}</div>
                        <div class="order-detail-qty">Quantity: ${item.quantity}</div>
                    </div>
                    <div class="order-detail-price">₹${item.price * item.quantity}</div>
                </div>
            `).join('')}
            
            <div class="order-summary">
                <div class="order-summary-row">
                    <span>Subtotal</span>
                    <span>₹${order.subtotal}</span>
                </div>
                <div class="order-summary-row">
                    <span>Tax (5%)</span>
                    <span>₹${order.tax}</span>
                </div>
                <div class="order-summary-row total">
                    <span>Total</span>
                    <span>₹${order.total}</span>
                </div>
            </div>
            
            <div style="margin-top: 24px;">
                <p><strong>Status:</strong> <span class="status-badge status-${order.status.toLowerCase().replace(' ', '-')}">${order.status}</span></p>
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

        document.getElementById('menuTable').innerHTML = menuItems.map(item => `
            <tr>
                <td>
                    <div style="width: 48px; height: 48px; background: var(--bg-dark); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-utensils" style="color: var(--text-light);"></i>
                    </div>
                </td>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>₹${item.price}</td>
                <td>${item.isFeatured ? '✓' : '✗'}</td>
                <td>${item.isAvailable ? '✓' : '✗'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="editMenuItem('${item._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteMenuItem('${item._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
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

        document.getElementById('reviewsTable').innerHTML = reviews.map(review => `
            <tr>
                <td>${review.name}</td>
                <td>${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</td>
                <td>${review.review}</td>
                <td>${new Date(review.createdAt).toLocaleDateString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn delete" onclick="deleteReview('${review._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
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
