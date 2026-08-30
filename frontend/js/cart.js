// Cart functionality
let cart = JSON.parse(localStorage.getItem('chunkiesCart')) || [];
let savedScrollY = 0;

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('chunkiesCart', JSON.stringify(cart));
    updateCartCount();
}

// Update cart count
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Add to cart
function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id,
            name,
            price,
            quantity: 1
        });
    }
    
    saveCart();
    renderCart();
    
    // Show notification
    showNotification(`${name} added to cart!`);
}

// Remove from cart
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
}

// Clear cart
function clearCart() {
    cart = [];
    saveCart();
    renderCart();
    showNotification('Cart cleared');
}

// Update quantity
function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            saveCart();
            renderCart();
        }
    }
}

// Calculate total
function calculateTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Render cart
function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutCartItems = document.getElementById('checkoutCartItems');
    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutTax = document.getElementById('checkoutTax');
    const checkoutTotal = document.getElementById('checkoutTotal');

    if (!cartItems && !checkoutCartItems) return;

    const cartHTML = cart.length === 0 
        ? '<p class="empty-cart">Your cart is empty</p>'
        : cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <i class="fas fa-utensils"></i>
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('') + (cart.length > 0 ? '<button class="btn btn-secondary btn-block" style="margin-top: 16px;" onclick="clearCart()">Clear Cart</button>' : '');

    if (cartItems) {
        cartItems.innerHTML = cartHTML;
    }

    if (checkoutCartItems) {
        checkoutCartItems.innerHTML = cartHTML;
    }

    const total = calculateTotal();
    const tax = Math.round(total * 0.05);
    const finalTotal = total + tax;

    if (cartTotal) {
        cartTotal.textContent = `₹${finalTotal}`;
    }

    if (checkoutSubtotal) {
        checkoutSubtotal.textContent = `₹${total}`;
    }

    if (checkoutTax) {
        checkoutTax.textContent = `₹${tax}`;
    }

    if (checkoutTotal) {
        checkoutTotal.textContent = `₹${finalTotal}`;
    }
}

// Lock page scroll
function lockPageScroll() {
    savedScrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    console.log('Cart opened — page scroll locked');
}

// Unlock page scroll
function unlockPageScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    window.scrollTo(0, savedScrollY);
    console.log('Cart closed — page scroll unlocked');
}

// Prevent background wheel events when cart is open
function preventBackgroundWheel(event) {
    const cartDrawer = document.getElementById('cartDrawer');
    const cartItems = document.getElementById('cartItems');
    
    if (!cartDrawer || !cartDrawer.classList.contains('active')) return;
    
    // Allow scrolling inside cart items
    if (cartItems && cartItems.contains(event.target)) return;
    
    // Prevent scrolling outside cart
    event.preventDefault();
}

// Cart drawer toggle
function setupCartDrawer() {
    const cartBtn = document.getElementById('cartBtn');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartClose = document.getElementById('cartClose');

    if (!cartBtn || !cartDrawer) return;

    cartBtn.addEventListener('click', () => {
        cartDrawer.classList.add('active');
        cartOverlay.classList.add('active');
        lockPageScroll();
        document.addEventListener('wheel', preventBackgroundWheel, { passive: false });
        console.log('Cart opened');
    });

    function closeCart() {
        cartDrawer.classList.remove('active');
        cartOverlay.classList.remove('active');
        unlockPageScroll();
        document.removeEventListener('wheel', preventBackgroundWheel);
        console.log('Cart closed');
    }

    if (cartClose) {
        cartClose.addEventListener('click', closeCart);
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }
    
    // Handle escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cartDrawer.classList.contains('active')) {
            closeCart();
        }
    });
    
    // Handle checkout button clicks using event delegation
    document.addEventListener('click', (event) => {
        const checkoutLink = event.target.closest('a[href="cart.html"]');
        if (checkoutLink) {
            console.log('Proceed to checkout clicked');
            
            // Check if cart is empty
            if (cart.length === 0) {
                event.preventDefault();
                alert('Your cart is empty. Please add items before checkout.');
                return;
            }
            
            // Cart is not empty, allow navigation
            console.log('Navigating to checkout with', cart.length, 'items');
        }
    });
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 20px;
        background-color: var(--success-color);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderCart();
    setupCartDrawer();
});
