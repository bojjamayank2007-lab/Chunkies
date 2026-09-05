// Navbar functionality
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navProfileAction = document.getElementById('navProfileAction');

    if (typeof getCustomer === 'function') {
        getCustomer()
            .then(customer => {
                if (customer && navProfileAction) {
                    const fullName = String(customer.name || '').trim() || 'Customer';
                    const customerEmail = String(customer.email || '').trim();

                    navProfileAction.innerHTML = `
                        <div class="profile-menu">
                            <button id="profileMenuBtn" class="profile-icon-btn" type="button" aria-label="Profile" aria-haspopup="true" aria-expanded="false">
                                <i class="fas fa-user-circle"></i>
                            </button>
                            <div class="profile-dropdown" id="profileDropdown">
                                <div class="profile-dropdown-header">
                                    <span class="profile-dropdown-name">${escapeHTML(fullName)}</span>
                                    ${customerEmail ? `<span class="profile-dropdown-email">${escapeHTML(customerEmail)}</span>` : ''}
                                </div>
                                <a class="profile-dropdown-item" href="customer-orders.html">
                                    <i class="fas fa-shopping-bag"></i> My Orders
                                </a>
                                <button id="profileLogoutBtn" class="profile-dropdown-item profile-dropdown-logout" type="button">Logout</button>
                            </div>
                        </div>
                    `;

                    const profileMenuBtn = document.getElementById('profileMenuBtn');
                    const profileDropdown = document.getElementById('profileDropdown');
                    const profileLogoutBtn = document.getElementById('profileLogoutBtn');

                    if (profileMenuBtn && profileDropdown) {
                        profileMenuBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const isActive = profileDropdown.classList.toggle('active');
                            profileMenuBtn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
                        });

                        // Close the dropdown when clicking outside of it
                        document.addEventListener('click', (e) => {
                            const menuRoot = profileMenuBtn.closest('.profile-menu');
                            if (menuRoot && !menuRoot.contains(e.target)) {
                                profileDropdown.classList.remove('active');
                                profileMenuBtn.setAttribute('aria-expanded', 'false');
                            }
                        });

                        // Close the dropdown with the Escape key
                        document.addEventListener('keydown', (e) => {
                            if (e.key === 'Escape') {
                                profileDropdown.classList.remove('active');
                                profileMenuBtn.setAttribute('aria-expanded', 'false');
                            }
                        });
                    }

                    if (profileLogoutBtn) {
                        profileLogoutBtn.addEventListener('click', async () => {
                            await logoutCustomer();
                            window.isCustomerLoggedIn = false;
                            window.currentCustomer = null;
                            window.location.reload();
                        });
                    }

                    // Mark this navbar area so mobile/tablet CSS can un-clip
                    // the absolutely positioned dropdown (see final-fixes.css).
                    // Applied only when the logged-in profile menu exists.
                    navProfileAction.classList.add('has-profile-menu');
                    const navActionsRoot = navProfileAction.closest('.nav-actions');
                    if (navActionsRoot) navActionsRoot.classList.add('has-profile-menu');
                } else if (navProfileAction) {
                    navProfileAction.innerHTML = '<a href="customer-login.html" class="btn btn-primary nav-login-btn">Login</a>';
                }
            })
            .catch(() => {
                if (navProfileAction) {
                    navProfileAction.innerHTML = '<a href="customer-login.html" class="btn btn-primary nav-login-btn">Login</a>';
                }
            });
    }

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking a link
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
});