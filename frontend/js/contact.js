// Checkout form field toggling (form submission handled in cart.js)
function setupCheckoutFormFields() {
    const orderTypeSelect = document.getElementById('orderType');
    const addressGroup = document.getElementById('addressGroup');
    const addressInput = document.getElementById('address');

    if (!orderTypeSelect) return;

    // Toggle fields based on order type
    orderTypeSelect.addEventListener('change', () => {
        const orderType = orderTypeSelect.value;

        if (addressGroup) {
            addressGroup.style.display = orderType === 'Delivery' ? 'block' : 'none';
        }

        if (addressInput) {
            addressInput.required = orderType === 'Delivery';
        }

        // Show Pay at Counter only for Dine-in
        const counterOption = document.getElementById('counterOption');
        const codOption = document.getElementById('codOption');
        const onlineOption = document.getElementById('onlineOption');

        if (counterOption) {
            counterOption.style.display = orderType === 'Dine-in' ? 'flex' : 'none';
        }

        if (codOption) {
            codOption.style.display = orderType === 'Dine-in' ? 'none' : 'flex';
        }

        // If switching away from Dine-in while Pay at Counter selected, fallback to COD
        if (orderType !== 'Dine-in') {
            const selected = document.querySelector('input[name="paymentMethod"]:checked');
            if (selected && selected.value === 'Pay at Counter') {
                const codRadio = codOption?.querySelector('input');
                if (codRadio) codRadio.checked = true;
                codOption?.classList.add('active');
                counterOption?.classList.remove('active');
                onlineOption?.classList.remove('active');
            }
        } else {
            // If Dine-in selected, default to Pay at Counter
            const counterRadio = counterOption?.querySelector('input');
            if (counterRadio) counterRadio.checked = true;
            counterOption?.classList.add('active');
            onlineOption?.classList.remove('active');
            codOption?.classList.remove('active');
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupCheckoutFormFields();
});
