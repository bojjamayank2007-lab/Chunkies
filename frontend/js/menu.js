// Menu functionality
let allMenuItems = [];
let currentFilter = 'all';
let currentSearch = '';
let currentSort = 'default';
let featuredFilter = 'all';

// Render menu card
function renderMenuCard(item) {
    const vegClass = item.isVeg ? 'veg' : 'non-veg';
    const vegLabel = item.isVeg ? 'VEG' : 'NON-VEG';
    const featuredBadge = item.isFeatured ? '<div class="menu-card-badge">Featured</div>' : '';
    const stars = renderStars(item.rating);
    const safeDisplayName = escapeHTML(item.name || '');
    const safeDescription = escapeHTML(item.description || '');
    const safeImageUrl = escapeHTML(item.image || '');
    const safeAltText = escapeHTML(item.name || '');
    return `
        <div class="menu-card" data-category="${item.category}" data-price="${item.price}" data-popularity="${item.popularity}">
            <div class="menu-card-image">
                ${featuredBadge}
                <div class="veg-indicator ${vegClass}"><span class="veg-dot"></span><span class="veg-label">${vegLabel}</span></div>
                ${safeImageUrl ? `<img src="${safeImageUrl}" alt="${safeAltText}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><i class="fas fa-utensils" style="display: none;"></i>` : '<i class="fas fa-utensils"></i>'}
            </div>
            <div class="menu-card-content">
                <h3 class="menu-card-name">${safeDisplayName}</h3>
                <p class="menu-card-description">${safeDescription}</p>
                <div class="menu-card-footer">
                    <span class="menu-card-price">₹${item.price}</span>
                    <div class="menu-card-rating">
                        ${stars}
                        <span>(${item.rating})</span>
                    </div>
                </div>
                <button class="add-to-cart" data-id="${item._id}" data-name="${safeDisplayName}" data-price="${item.price}">
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





function applyFeaturedFilter() {
    const featuredMenu = document.getElementById('featuredMenu');
    if (!featuredMenu) return;

    let featuredItems = [];

    if (featuredFilter === 'all') {
        featuredItems = allMenuItems.filter(item => item.isFeatured);
    } else if (featuredFilter === 'veg') {
        featuredItems = allMenuItems.filter(item => item.isVeg);
    } else if (featuredFilter === 'non-veg') {
        featuredItems = allMenuItems.filter(item => !item.isVeg);
    }

    if (featuredItems.length === 0) {
        featuredMenu.innerHTML = '<p class="empty-cart">No items found.</p>';
        return;
    }

    featuredMenu.innerHTML = featuredItems.map(renderMenuCard).join('');
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
            applyFeaturedFilter();
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

// Setup popular filter buttons


function setupPopularFilters() {
    const buttons = document.querySelectorAll('.popular-filter-btn');
    if (!buttons.length) return;

    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            const filter = btn.dataset.popularFilter;
            if (!filter) return;

            featuredFilter = filter;

            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            applyFeaturedFilter();
        });
    });
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

// Event delegation for Add to Cart buttons
// Buttons are rendered dynamically by loadMenu()/applyFilters() (and the
// featured menu), so a delegated listener on the document matches
// .add-to-cart buttons at click time instead of using inline onclick.
function setupAddToCartDelegation() {
    document.addEventListener('click', (event) => {
        const addButton = event.target.closest('.add-to-cart');
        if (!addButton) return;

        const id = addButton.dataset.id;
        const name = addButton.dataset.name;
        const price = Number(addButton.dataset.price);

        if (id && name && !Number.isNaN(price)) {
            addToCart(id, name, price);
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadMenu();
    setupFilters();
    setupAddToCartDelegation();
    setupPopularFilters();
});
