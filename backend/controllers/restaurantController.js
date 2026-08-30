const Restaurant = require('../models/Restaurant');

// @desc    Get restaurant info
// @route   GET /api/restaurant
// @access  Public
const getRestaurantInfo = async (req, res) => {
  try {
    let restaurant = await Restaurant.findOne();
    
    if (!restaurant) {
      // Create default restaurant if none exists
      restaurant = await Restaurant.create({});
    }
    
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update restaurant info
// @route   PUT /api/restaurant
// @access  Public (for demo - should be protected in production)
const updateRestaurantInfo = async (req, res) => {
  try {
    let restaurant = await Restaurant.findOne();
    
    if (!restaurant) {
      restaurant = await Restaurant.create(req.body);
    } else {
      Object.assign(restaurant, req.body);
      await restaurant.save();
    }
    
    res.json(restaurant);
  } catch (error) {
    res.status(400).json({ message: 'Invalid restaurant data', error: error.message });
  }
};

module.exports = {
  getRestaurantInfo,
  updateRestaurantInfo
};
