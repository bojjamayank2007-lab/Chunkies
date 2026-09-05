// Restaurant information loader
async function loadRestaurantInfo() {
    try {
        const restaurant = await api.getRestaurant();
        
        // Update navbar brand
        const navBrand = document.querySelector('.nav-brand a');
        const navBrandHindi = document.querySelector('.nav-brand-hindi');
        if (navBrand && restaurant.name) navBrand.textContent = restaurant.name;
        if (navBrandHindi && restaurant.nameHindi) navBrandHindi.textContent = restaurant.nameHindi;
        
        // Update footer brand
        const footerBrand = document.querySelector('.footer-brand h3');
        const footerHindi = document.querySelector('.footer-hindi');
        if (footerBrand && restaurant.name) footerBrand.textContent = restaurant.name;
        if (footerHindi && restaurant.nameHindi) footerHindi.textContent = restaurant.nameHindi;
        
        // Update footer contact info
        const footerContactPs = document.querySelectorAll('.footer-section:nth-child(3) p');
        const footerAddress = footerContactPs[0];
        const footerPhone = footerContactPs[1];
        const footerHours = footerContactPs[2];
        
        if (footerAddress && restaurant.address?.fullAddress) {
            footerAddress.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${restaurant.address.fullAddress}`;
        }
        if (footerPhone && restaurant.phone) {
            footerPhone.innerHTML = `<i class="fas fa-phone"></i> ${restaurant.phone}`;
        }
        if (footerHours && restaurant.openingHours) {
            footerHours.innerHTML = `<i class="fas fa-clock"></i> ${restaurant.openingHours}`;
        }
        
        // Update mobile call button
        const mobileCall = document.querySelector('.mobile-call');
        if (mobileCall && restaurant.phone) {
            mobileCall.href = `tel:${restaurant.phone.replace(/\s/g, '')}`;
        }
        
        // Update contact page specific elements
        const contactItems = document.querySelectorAll('.contact-item');
        const contactAddress = contactItems[0]?.querySelector('p');
        const contactPhone = contactItems[1]?.querySelector('p');
        const contactHours = contactItems[2]?.querySelector('p');
        const contactDirections = document.querySelector('.contact-buttons a:first-child');
        const contactCall = document.querySelector('.contact-buttons a:nth-child(2)');
        const mapPlaceholder = document.querySelector('.map-placeholder p');
        const mapLink = document.querySelector('.map-placeholder a');
        
        if (contactAddress && restaurant.address?.fullAddress) {
            const addressParts = restaurant.address.fullAddress.split(',').map(p => p.trim());
            contactAddress.innerHTML = addressParts.map(p => `${p}<br>`).join('').replace(/<br>$/, '');
        }
        if (contactPhone && restaurant.phone) {
            contactPhone.textContent = restaurant.phone;
        }
        if (contactHours && restaurant.openingHours) {
            contactHours.textContent = restaurant.openingHours;
        }
        if (contactDirections && restaurant.googleMapsUrl) {
            contactDirections.href = restaurant.googleMapsUrl;
        }
        if (contactCall && restaurant.phone) {
            contactCall.href = `tel:${restaurant.phone.replace(/\s/g, '')}`;
        }
        if (mapPlaceholder && restaurant.address?.fullAddress) {
            mapPlaceholder.textContent = restaurant.address.fullAddress;
        }
        if (mapLink && restaurant.googleMapsUrl) {
            mapLink.href = restaurant.googleMapsUrl;
        }
        
        // Update hero badges (if on homepage)
        const ratingBadge = document.querySelector('.hero-badges .badge:nth-child(1) span');
        const reviewsBadge = document.querySelector('.hero-badges .badge:nth-child(2) span');
        const priceBadge = document.querySelector('.hero-badges .badge:nth-child(3) span');
        
        if (ratingBadge && restaurant.rating) {
            ratingBadge.textContent = `${restaurant.rating} Google Rating`;
        }
        if (reviewsBadge && restaurant.reviewCount) {
            reviewsBadge.textContent = `${restaurant.reviewCount}+ Reviews`;
        }
        if (priceBadge && restaurant.priceRange) {
            priceBadge.textContent = restaurant.priceRange;
        }
        
        // Update reviews section (if on homepage)
        const ratingNumber = document.querySelector('.rating-number');
        const ratingInfo = document.querySelector('.rating-info p');
        
        if (ratingNumber && restaurant.rating) {
            ratingNumber.textContent = restaurant.rating;
        }
        if (ratingInfo && restaurant.reviewCount) {
            ratingInfo.textContent = `${restaurant.reviewCount}+ Google Reviews`;
        }
        
        // Update footer services
        const footerServices = document.querySelector('.footer-section:nth-child(4)');
        if (footerServices && restaurant.services && restaurant.services.length > 0) {
            footerServices.innerHTML = '<h4>Services</h4>' + 
                restaurant.services.map(service => `<p>${service}</p>`).join('');
        }
        
    } catch (error) {
        console.error('Error loading restaurant info:', error);
        // Silently fail - hardcoded values will remain as fallback
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', loadRestaurantInfo);
