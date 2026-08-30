// Checkout form functionality
function setupCheckoutForm() {
    const checkoutForm = document.getElementById('checkoutForm');
    if (!checkoutForm) return;

    const orderTypeSelect = document.getElementById('orderType');
    const addressGroup = document.getElementById('addressGroup');
    const tableGroup = document.getElementById('tableGroup');
    const addressInput = document.getElementById('address');
    const tableInput = document.getElementById('tableNumber');

    // Toggle fields based on order type
    orderTypeSelect.addEventListener('change', () => {
        const orderType = orderTypeSelect.value;

        addressGroup.style.display =
            orderType === 'Delivery' ? 'block' : 'none';

        tableGroup.style.display =
            orderType === 'Dine-in' ? 'block' : 'none';

        if (orderType === 'Delivery') {
            addressInput.required = true;
            tableInput.required = false;
        } else if (orderType === 'Dine-in') {
            addressInput.required = false;
            tableInput.required = true;
        } else {
            addressInput.required = false;
            tableInput.required = false;
        }
    });

    // Form submission
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const cart =
            JSON.parse(localStorage.getItem('chunkiesCart')) || [];

        if (cart.length === 0) {
            alert('Your cart is empty. Please add items before checkout.');
            return;
        }

        const formData = new FormData(checkoutForm);

        // Calculate order totals
        const subtotal = cart.reduce((sum, item) => {
            return sum + (Number(item.price) * Number(item.quantity));
        }, 0);

        // 5% GST
        const tax = Number((subtotal * 0.05).toFixed(2));

        const total = Number((subtotal + tax).toFixed(2));

        const orderData = {
            customerName: formData.get('customerName'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            orderType: formData.get('orderType'),
            address: formData.get('address') || '',
            tableNumber: formData.get('tableNumber') || '',
            notes: formData.get('notes') || '',

            items: cart.map(item => ({
                menuItem: item.id,
                name: item.name,
                price: Number(item.price),
                quantity: Number(item.quantity)
            })),

            subtotal: Number(subtotal.toFixed(2)),
            tax: tax,
            total: total
        };

        console.log('ORDER DATA BEING SENT:', orderData);

        // Validation
        if (!orderData.customerName) {
            alert('Please enter your name');
            return;
        }

        if (!orderData.phone) {
            alert('Please enter your phone number');
            return;
        }

        if (!orderData.orderType) {
            alert('Please select an order type');
            return;
        }

        if (orderData.orderType === 'Delivery' && !orderData.address) {
            alert('Please enter delivery address');
            return;
        }

        if (orderData.orderType === 'Dine-in' && !orderData.tableNumber) {
            alert('Please enter table number');
            return;
        }

        try {
            const order = await api.createOrder(orderData);

            // Clear cart
            localStorage.removeItem('chunkiesCart');

            updateCartCount();
            renderCart();

            // Show success modal
            const successModal =
                document.getElementById('successModal');

            const successOrderId =
                document.getElementById('successOrderId');

            if (successModal && successOrderId) {
                successOrderId.textContent = order.orderId;
                successModal.classList.add('active');
            }

        } catch (error) {
            console.error('Error placing order:', error);
            alert(
                'Failed to place order. Please try again.'
            );
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupCheckoutForm();
});
