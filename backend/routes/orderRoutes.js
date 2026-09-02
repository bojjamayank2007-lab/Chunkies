const express = require('express');
const router = express.Router();

const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder
} = require('../controllers/orderController');

const { protect } = require('../middleware/authMiddleware');

// Public: customers can place orders
router.post('/', createOrder);

// Admin only: view all orders
router.get('/', protect, getOrders);

// Admin only: view, update, and delete a specific order
router.get('/:id', protect, getOrderById);
router.put('/:id', protect, updateOrder);
router.delete('/:id', protect, deleteOrder);

module.exports = router;
