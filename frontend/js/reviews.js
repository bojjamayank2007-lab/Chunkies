// Reviews functionality
let selectedRating = 0;

// XSS protection helper
function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Render review card
function renderReviewCard(review) {
    const stars = renderStars(review.rating);
    const initial = escapeHTML(review.name.charAt(0).toUpperCase());

    return `
        <div class="review-card">
            <div class="review-header">
                <div class="review-author">
                    <div class="review-avatar">${initial}</div>
                    <div class="review-name">${escapeHTML(review.name)}</div>
                </div>
                <div class="review-stars">
                    ${stars}
                </div>
            </div>
            <p class="review-text">"${escapeHTML(review.review)}"</p>
        </div>
    `;
}

// Render stars


// Load reviews
async function loadReviews() {
    const reviewsGrid = document.getElementById('reviewsGrid');
    if (!reviewsGrid) return;

    try {
        const reviews = await api.getReviews();
        reviewsGrid.innerHTML = reviews.slice(0, 6).map(renderReviewCard).join('');
    } catch (error) {
        console.error('Error loading reviews:', error);
        reviewsGrid.innerHTML = '<p class="error-message">Failed to load reviews. Please try again later.</p>';
    }
}

// Setup review form
function setupReviewForm() {
    const reviewForm = document.querySelector('.review-form');
    if (!reviewForm) return;

    const ratingButtons = reviewForm.querySelectorAll('.rating-input button');
    const form = reviewForm.querySelector('form');
    let isSubmitting = false;

    // Rating selection
    ratingButtons.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            selectedRating = index + 1;
            ratingButtons.forEach((b, i) => {
                b.classList.toggle('active', i < selectedRating);
            });
        });
    });

    // Form submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (isSubmitting) return;

            const reviewNameInput = form.querySelector('#reviewName');
            const reviewTextInput = form.querySelector('#reviewText');
            const submitBtn = form.querySelector('button[type="submit"]');

            const name = reviewNameInput ? reviewNameInput.value.trim() : '';
            const review = reviewTextInput ? reviewTextInput.value.trim() : '';

            if (!name || !review || selectedRating === 0) {
                alert('Please fill in all fields and select a rating');
                return;
            }

            isSubmitting = true;
            if (submitBtn) submitBtn.disabled = true;

            try {
                await api.createReview({
                    name,
                    rating: selectedRating,
                    review
                });

                alert('Review submitted successfully!');
                form.reset();
                selectedRating = 0;
                ratingButtons.forEach(b => b.classList.remove('active'));
                loadReviews();
            } catch (error) {
                console.error('Error submitting review:', error);
                alert(error.message || 'Failed to submit review. Please try again.');
            } finally {
                isSubmitting = false;
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadReviews();
    setupReviewForm();
});
