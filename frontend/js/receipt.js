document.addEventListener('DOMContentLoaded', async () => {
    try {
        const customer = await getCustomer();
        if (!customer) {
            window.location.href = 'customer-login.html';
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const orderId = params.get('id') || params.get('orderId');
        if (!orderId) {
            document.getElementById('receiptContent').innerHTML = '<p class="error-message">No order ID provided.</p>';
            return;
        }

        const [order, restaurant] = await Promise.all([
            api.getMyOrderById(orderId),
            api.getRestaurant()
        ]);

        const itemsHTML = order.items.map(item => `
            <div class="receipt-item-row">
                <div>
                    <div class="receipt-item-name">${escapeHTML(item.name)}</div>
                    <div class="receipt-item-qty">× ${escapeHTML(item.quantity)}</div>
                </div>
                <div class="receipt-item-total">₹${(Number(item.price) * Number(item.quantity)).toFixed(2)}</div>
            </div>
        `).join('');

        const addressHTML = order.address ? `<div class="receipt-line"><strong>Delivery Address:</strong> ${escapeHTML(order.address)}</div>` : '';
        const tableHTML = order.tableNumber ? `<div class="receipt-line"><strong>Table Number:</strong> ${escapeHTML(order.tableNumber)}</div>` : '';

        document.getElementById('receiptContent').innerHTML = `
            <div class="receipt-card">
                <div class="receipt-header">
                    <h2>${escapeHTML(restaurant.name || 'CHUNKIES')}</h2>
                    <p>${escapeHTML(restaurant.address?.fullAddress || '')}</p>
                    <p>Phone: ${escapeHTML(restaurant.phone || '')}</p>
                </div>

                <div class="receipt-divider"></div>

                <div class="receipt-details">
                    <div class="receipt-line"><strong>Order ID:</strong> ${escapeHTML(order.orderId)}</div>
                    <div class="receipt-line"><strong>Date:</strong> ${escapeHTML(new Date(order.createdAt).toLocaleString())}</div>
                    <div class="receipt-line"><strong>Customer:</strong> ${escapeHTML(order.customerName)}</div>
                    <div class="receipt-line"><strong>Phone:</strong> ${escapeHTML(order.phone)}</div>
                    ${order.email ? `<div class="receipt-line"><strong>Email:</strong> ${escapeHTML(order.email)}</div>` : ''}
                    <div class="receipt-line"><strong>Order Type:</strong> ${escapeHTML(order.orderType)}</div>
                    <div class="receipt-line"><strong>Payment Method:</strong> ${escapeHTML(order.paymentMethod)}</div>
                    <div class="receipt-line"><strong>Payment Status:</strong> ${escapeHTML(order.paymentStatus)}</div>
                    ${addressHTML}
                    ${tableHTML}
                </div>

                <div class="receipt-divider"></div>

                <div class="receipt-items">
                    <h3>Items</h3>
                    ${itemsHTML}
                </div>

                <div class="receipt-divider"></div>

                <div class="receipt-totals">
                    <div class="receipt-total-row"><span>Subtotal</span><span>₹${Number(order.subtotal).toFixed(2)}</span></div>
                    <div class="receipt-total-row"><span>Tax (5%)</span><span>₹${Number(order.tax).toFixed(2)}</span></div>
                    <div class="receipt-total-row total"><span>Total</span><span>₹${Number(order.total).toFixed(2)}</span></div>
                </div>

                <div class="receipt-footer">
                    <p>Thank you for ordering with CHUNKIES!</p>
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById('receiptContent').innerHTML = `<p class="error-message">${escapeHTML(error.message)}</p>`;
    }
});
