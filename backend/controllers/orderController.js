const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const mongoose = require('mongoose');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Admin only
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Admin only
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  try {
    const { customerName, phone, email, items, orderType, address, tableNumber, notes } = req.body;

    // Customer name validation
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return res.status(400).json({ message: 'Valid customer name is required (minimum 2 characters)' });
    }

    // Phone validation (10 digits)
    if (!phone || !/^[0-9]{10}$/.test(phone.trim())) {
      return res.status(400).json({ message: 'Valid 10-digit phone number is required' });
    }

    // Email validation (if provided)
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
    }

    // Order type validation
    const validOrderTypes = ['Dine-in', 'Takeaway', 'Delivery'];
    if (!orderType || !validOrderTypes.includes(orderType)) {
      return res.status(400).json({ message: 'Valid order type is required (Dine-in, Takeaway, or Delivery)' });
    }

    // Order type-specific validation
    if (orderType === 'Delivery' && (!address || typeof address !== 'string' || address.trim().length < 5)) {
      return res.status(400).json({ message: 'Delivery address is required (minimum 5 characters)' });
    }

    if (orderType === 'Dine-in' && (!tableNumber || typeof tableNumber !== 'string' || tableNumber.trim().length === 0)) {
      return res.status(400).json({ message: 'Table number is required for Dine-in orders' });
    }

    // Items validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    // Calculate actual total from database prices
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      // ObjectId validation for menu item
      if (!mongoose.Types.ObjectId.isValid(item.menuItem)) {
        return res.status(400).json({ message: `Invalid menu item ID for ${item.name || 'item'}` });
      }

      const menuItem = await MenuItem.findById(item.menuItem);

      if (!menuItem) {
        return res.status(400).json({ message: `Menu item ${item.name || 'item'} not found` });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({ message: `Menu item ${menuItem.name} is not available` });
      }

      // Quantity validation
      // Quantity validation
      if (
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 50
      ) {
        return res.status(400).json({
          message: `Invalid quantity for ${menuItem.name}. Quantity must be between 1 and 50.`
        });
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity
      });
    }

    const tax = Math.round(subtotal * 0.05); // 5% tax
    const total = subtotal + tax;

    const order = await Order.create({
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : undefined,
      items: validatedItems,
      orderType,
      address: orderType === 'Delivery' ? address.trim() : undefined,
      tableNumber: orderType === 'Dine-in' ? tableNumber.trim() : undefined,
      subtotal,
      tax,
      total,
      notes: notes ? notes.trim() : undefined
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: 'Invalid order data', error: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Admin only
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Status validation if provided
    if (status) {
      const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Completed', 'Cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid order status' });
      }
      order.status = status;
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: 'Invalid order data', error: error.message });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Admin only
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.deleteOne();
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder
};
