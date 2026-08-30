const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Public (for demo - should be protected in production)
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
// @access  Public (for demo - should be protected in production)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
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
    
    if (!customerName || !phone || !items || !orderType || items.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Calculate actual total from database prices
    let subtotal = 0;
    const validatedItems = [];
    
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      
      if (!menuItem || !menuItem.isAvailable) {
        return res.status(400).json({ message: `Menu item ${item.name} is not available` });
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
      customerName,
      phone,
      email,
      items: validatedItems,
      orderType,
      address: orderType === 'Delivery' ? address : undefined,
      tableNumber: orderType === 'Dine-in' ? tableNumber : undefined,
      subtotal,
      tax,
      total,
      notes
    });
    
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: 'Invalid order data', error: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Public (for demo - should be protected in production)
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (req.body.status) {
      order.status = req.body.status;
    }
    
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: 'Invalid order data', error: error.message });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Public (for demo - should be protected in production)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
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
