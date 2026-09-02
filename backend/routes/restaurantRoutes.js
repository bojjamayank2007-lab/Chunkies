const express = require('express');
const router = express.Router();
const {
  getRestaurantInfo,
  updateRestaurantInfo
} = require('../controllers/restaurantController');

const { protect } = require('../middleware/authMiddleware');

// Public: customers can view restaurant info
router.get('/', getRestaurantInfo);

// Admin only: update restaurant info
router.put('/', protect, updateRestaurantInfo);

module.exports = router;
