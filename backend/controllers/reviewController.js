const Review = require('../models/Review');

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Public
const createReview = async (req, res) => {
  try {
    const { name, rating, review } = req.body;
    
    if (!name || !rating || !review) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ message: 'Name must be between 2 and 100 characters' });
    }

    const parsedRating = Number(rating);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }

    if (typeof review !== 'string' || review.trim().length < 10 || review.trim().length > 1000) {
      return res.status(400).json({ message: 'Review must be between 10 and 1000 characters' });
    }
    
    const newReview = await Review.create({
      name: name.trim(),
      rating: parsedRating,
      review: review.trim(),
      isDemo: false
    });
    
    res.status(201).json(newReview);
  } catch (error) {
    res.status(400).json({
      message: 'Invalid review data',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Public (for demo - should be protected in production)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    await review.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

module.exports = {
  getReviews,
  createReview,
  deleteReview
};
