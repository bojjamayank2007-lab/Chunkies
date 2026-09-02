const express = require('express');
const router = express.Router();

const {
  getReviews,
  createReview,
  deleteReview
} = require('../controllers/reviewController');

const { protect } = require('../middleware/authMiddleware');

// Public
router.get('/', getReviews);
router.post('/', createReview);

// Admin only
router.delete('/:id', protect, deleteReview);

module.exports = router;
