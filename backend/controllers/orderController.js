const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const mongoose = require('mongoose');
const { validatePaymentVerification } = require('razorpay/dist/utils/razorpay-utils');
const { sendOrderConfirmation, sendEmail } = require('../utils/emailService');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Admin only
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
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
    res.status(500).json({
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  try {
    const { customerName, phone, email, items, orderType, address, tableNumber, notes, paymentMethod = 'COD' } = req.body;
    const customerId = req.customer?.id || null;

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

    if (!['COD', 'Online', 'Pay at Counter'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Payment method must be COD, Online, or Pay at Counter' });
    }

    // Order type-specific validation
    if (orderType === 'Delivery' && (!address || typeof address !== 'string' || address.trim().length < 5)) {
      return res.status(400).json({ message: 'Delivery address is required (minimum 5 characters)' });
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

    const order = new Order({
      customerName: customerName.trim(),
      customerId,
      phone: phone.trim(),
      email: email ? email.trim() : undefined,
      items: validatedItems,
      orderType,
      address: orderType === 'Delivery' ? address.trim() : undefined,
      subtotal,
      tax,
      total,
      paymentMethod,
      notes: notes ? notes.trim() : undefined
    });

    await order.validate();

    let razorpayOrder;
    if (paymentMethod === 'Online') {
      razorpayOrder = await req.app.locals.razorpay.orders.create({
        amount: total * 100,
        currency: 'INR',
        receipt: order.orderId
      });

      order.razorpayOrderId = razorpayOrder.id;
    } else {
      order.paymentStatus = 'Pending';
    }

    await order.save();

    // Send email notification (async, non-blocking)
    sendOrderConfirmation(order.toObject()).catch(err => console.error('Order email error:', err.message));

    const orderResponse = {
      ...order.toObject(),
      paymentMethod
    };

    if (paymentMethod === 'Online') {
      orderResponse.razorpayOrderId = razorpayOrder.id;
      orderResponse.total = total;
      orderResponse.keyId = process.env.RAZORPAY_KEY_ID;
    }

    res.status(201).json(orderResponse);
  } catch (error) {
    res.status(400).json({
      message: 'Invalid order data',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// @desc    Get orders for the authenticated customer
// @route   GET /api/orders/my-orders
// @access  Customer only
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.customer.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// @desc    Get single order for the authenticated customer
// @route   GET /api/orders/my-orders/:id
// @access  Customer only
const getMyOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const order = await Order.findOne({
      _id: id,
      customerId: req.customer.id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// @desc    Verify Razorpay payment and mark order as paid
// @route   POST /api/orders/verify-payment
// @access  Public
const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, razorpayOrderId, signature } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    if (!paymentId || !razorpayOrderId || !signature) {
      return res.status(400).json({ message: 'Payment verification details are required' });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentMethod !== 'Online') {
      return res.status(400).json({ message: 'Payment verification is only available for online orders' });
    }

    if (order.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({ message: 'Razorpay order ID does not match' });
    }

    // Amount check: Razorpay reports amounts in paise. If the payload includes
    // the amount, it must equal the verified order total (in paise).
    if (req.body.amount !== undefined && req.body.amount !== order.total * 100) {
      return res.status(400).json({ message: 'Payment amount mismatch' });
    }

    const isValid = validatePaymentVerification(
      { order_id: razorpayOrderId, payment_id: paymentId },
      signature,
      process.env.RAZORPAY_KEY_SECRET
    );

    if (!isValid) {
      order.paymentStatus = 'Failed';
      await order.save();
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    order.paymentStatus = 'Paid';
    order.paymentId = paymentId;
    await order.save();

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    res.status(400).json({
      message: 'Payment verification failed',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
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
    sendStatusUpdate(order.toObject()).catch(err => console.error('Status email error:', err.message));
    res.json(order);
  } catch (error) {
    res.status(400).json({
      message: 'Invalid order data',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
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
    res.status(500).json({
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};


const sendStatusUpdate = async (order) => {
  const restaurantEmail = process.env.NOTIFICATION_EMAIL;
  const customerEmail = order.email;

  const subject = `Order Status Update - ${order.orderId}`;
  const html = `
    <h2>Order Status Update</h2>
    <p><strong>Order ID:</strong> ${order.orderId}</p>
    <p><strong>New Status:</strong> ${order.status}</p>
    <p>Thank you for choosing CHUNKIES.</p>
  `;

  if (customerEmail) {
    await sendEmail(customerEmail, subject, html);
  }
  if (restaurantEmail && restaurantEmail !== customerEmail) {
    await sendEmail(restaurantEmail, subject, html);
  }
};


module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  getMyOrders,
  getMyOrderById,
  verifyPayment,
  updateOrder,
  deleteOrder
};
