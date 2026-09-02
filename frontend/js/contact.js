// Checkout form field toggling (form submission handled in cart.js)
function setupCheckoutFormFields() {
    const orderTypeSelect = document.getElementById('orderType');
    const addressGroup = document.getElementById('addressGroup');
    const tableGroup = document.getElementById('tableGroup');
    const addressInput = document.getElementById('address');
    const tableInput = document.getElementById('tableNumber');

    if (!orderTypeSelect) return;

    // Toggle fields based on order type
    orderTypeSelect.addEventListener('change', () => {
        const orderType = orderTypeSelect.value;

        if (addressGroup) {
            addressGroup.style.display = orderType === 'Delivery' ? 'block' : 'none';
        }

        if (tableGroup) {
            tableGroup.style.display = orderType === 'Dine-in' ? 'block' : 'none';
        }

        if (addressInput) {
            addressInput.required = orderType === 'Delivery';
        }

        if (tableInput) {
            tableInput.required = orderType === 'Dine-in';
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupCheckoutFormFields();
});
