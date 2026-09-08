const express = require('express');
const router = express.Router();

const {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  getCurrentCustomer
} = require('../controllers/customerAuthController');
const { protectCustomer, optionalCustomerAuth } = require('../middleware/customerAuthMiddleware');

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.post('/logout', logoutCustomer);
router.get('/me', optionalCustomerAuth, getCurrentCustomer);

module.exports = router;
