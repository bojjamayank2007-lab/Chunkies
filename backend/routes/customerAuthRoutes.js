const express = require('express');
const router = express.Router();

const {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  getCurrentCustomer
} = require('../controllers/customerAuthController');
const { protectCustomer } = require('../middleware/customerAuthMiddleware');

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.post('/logout', logoutCustomer);
router.get('/me', protectCustomer, getCurrentCustomer);

module.exports = router;
