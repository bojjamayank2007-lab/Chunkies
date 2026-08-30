// Menu functionality
let allMenuItems = [];
let currentFilter = 'all';
let currentSearch = '';
let currentSort = 'default';

// Render menu card
function renderMenuCard(item) {
    const vegIcon = item.isVeg ? '🟢' : '🔴';
    const vegClass = item.isVeg ? 'veg' : 'non-veg';
    const featuredBadge = item.isFeatured ? '<div class="menu-card-badge">Featured</div>' : '';
    const stars = renderStars(item.rating);
    const imageUrl = item.image || '';

    return `
        <div class="menu-card" data-category="${item.category}" data-price="${item.price}" data-popularity="${item.popularity}">
            <div class="menu-card-image">
                ${featuredBadge}
                <div class="veg-indicator ${vegClass}">${vegIcon}</div>
                ${imageUrl ? `<img src="${imageUrl}" alt="${item.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><i class="fas fa-utensils" style="display: none;"></i>` : '<i class="fas fa-utensils"></i>'}
            </div>
            <div class="menu-card-content">
                <h3 class="menu-card-name">${item.name}</h3>
                <p class="menu-card-description">${item.description}</p>
                <div class="menu-card-footer">
                    <span class="menu-card-price">₹${item.price}</span>
                    <div class="menu-card-rating">
                        ${stars}
                        <span>(${item.rating})</span>
                    </div>
                </div>
                <button class="add-to-cart" onclick="addToCart('${item._id}', '${item.name}', ${item.price})">
                    Add to Cart
                </button>
            </div>
        </div>
    `;
}

// Render stars
function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Load menu
async function loadMenu() {
    const menuGrid = document.getElementById('menuGrid');
    const featuredMenu = document.getElementById('featuredMenu');

    if (!menuGrid && !featuredMenu) return;

    try {
        allMenuItems = await api.getMenu();

        if (menuGrid) {
            applyFilters();
        }

        if (featuredMenu) {
            const featuredItems = allMenuItems.filter(item => item.isFeatured).slice(0, 4);
            featuredMenu.innerHTML = featuredItems.map(renderMenuCard).join('');
        }
    } catch (error) {
        console.error('Error loading menu:', error);
        if (menuGrid) menuGrid.innerHTML = '<p class="error-message">Failed to load menu. Please try again later.</p>';
        if (featuredMenu) featuredMenu.innerHTML = '<p class="error-message">Failed to load menu. Please try again later.</p>';
    }
}

// Apply filters
function applyFilters() {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) return;

    let filteredItems = [...allMenuItems];

    // Category filter
    if (currentFilter !== 'all') {
        filteredItems = filteredItems.filter(item => item.category === currentFilter);
    }

    // Search filter
    if (currentSearch) {
        const searchLower = currentSearch.toLowerCase();
        filteredItems = filteredItems.filter(item =>
            item.name.toLowerCase().includes(searchLower) ||
            item.description.toLowerCase().includes(searchLower)
        );
    }

    // Sort
    switch (currentSort) {
        case 'price-low':
            filteredItems.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredItems.sort((a, b) => b.price - a.price);
            break;
        case 'popularity':
            filteredItems.sort((a, b) => b.popularity - a.popularity);
            break;
    }

    if (filteredItems.length === 0) {
        menuGrid.innerHTML = '<p class="empty-cart">No items found matching your criteria.</p>';
    } else {
        menuGrid.innerHTML = filteredItems.map(renderMenuCard).join('');
    }
}

// Setup filters
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');

    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.category;
                applyFilters();
            });
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value;
            applyFilters();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            applyFilters();
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadMenu();
    setupFilters();
});
