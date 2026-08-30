const express = require('express');
const router = express.Router();
const {
  getRestaurantInfo,
  updateRestaurantInfo
} = require('../controllers/restaurantController');

router.route('/')
  .get(getRestaurantInfo)
  .put(updateRestaurantInfo);

module.exports = router;
