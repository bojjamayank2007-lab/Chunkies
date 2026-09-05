const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const {
  getReviews,
  createReview,
  deleteReview
} = require('../controllers/reviewController');

const { protect } = require('../middleware/authMiddleware');

// Dedicated rate limiter for review submissions: 5 submissions per 15 minutes per IP
const reviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many review submissions, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Public
router.get('/', getReviews);
router.post('/', reviewLimiter, createReview);

// Admin only
router.delete('/:id', protect, deleteReview);

module.exports = router;
