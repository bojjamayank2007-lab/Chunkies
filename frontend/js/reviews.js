// Reviews functionality
let selectedRating = 0;

// Render review card
function renderReviewCard(review) {
    const stars = renderStars(review.rating);
    const initial = review.name.charAt(0).toUpperCase();

    return `
        <div class="review-card">
            <div class="review-header">
                <div class="review-author">
                    <div class="review-avatar">${initial}</div>
                    <div class="review-name">${review.name}</div>
                </div>
                <div class="review-stars">
                    ${stars}
                </div>
            </div>
            <p class="review-text">"${review.review}"</p>
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

    // Rating selection
    ratingButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
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
            
            const name = form.querySelector('#reviewName').value;
            const review = form.querySelector('#reviewText').value;

            if (!name || !review || selectedRating === 0) {
                alert('Please fill in all fields and select a rating');
                return;
            }

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
                alert('Failed to submit review. Please try again.');
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadReviews();
    setupReviewForm();
});
