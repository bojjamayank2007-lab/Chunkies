const express = require('express');
const router = express.Router();

const {
  getOrders,
  getOrderById,
  createOrder,
  getMyOrders,
  getMyOrderById,
  verifyPayment,
  updateOrder,
  deleteOrder
} = require('../controllers/orderController');

const { protect } = require('../middleware/authMiddleware');
const { protectCustomer, optionalCustomerAuth } = require('../middleware/customerAuthMiddleware');

// Public: customers can place orders
router.post('/', optionalCustomerAuth, createOrder);
router.post('/verify-payment', verifyPayment);
router.get('/my-orders', protectCustomer, getMyOrders);

// Customer only: view a single one of their own orders
router.get('/my-orders/:id', protectCustomer, getMyOrderById);

// Admin only: view all orders
router.get('/', protect, getOrders);

// Admin only: view, update, and delete a specific order
router.get('/:id', protect, getOrderById);
router.put('/:id', protect, updateOrder);
router.delete('/:id', protect, deleteOrder);

module.exports = router;
