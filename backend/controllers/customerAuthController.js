const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registerCustomer = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ message: 'Name must be between 2 and 100 characters' });
    }

    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    if (!phone || typeof phone !== 'string' || !phone.trim() || phone.trim().length > 20) {
      return res.status(400).json({ message: 'Valid phone number is required' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingCustomer = await Customer.findOne({ email: normalizedEmail });

    if (existingCustomer) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const customer = await Customer.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword
    });

    res.status(201).json({
      message: 'Customer account created successfully',
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      }
    });
  } catch (error) {
    res.status(400).json({
      message: 'Unable to create customer account',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const customer = await Customer
      .findOne({ email: email.toLowerCase().trim() })
      .select('+password');

    if (!customer || !await bcrypt.compare(password, customer.password)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: customer._id.toString(), role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('customerToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Login successful',
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const logoutCustomer = (req, res) => {
  res.clearCookie('customerToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });

  res.json({ message: 'Logout successful' });
};

const getCurrentCustomer = (req, res) => {
  if (!req.customer) {
    return res.json({ customer: null });
  }

  res.json({
    customer: {
      id: req.customer._id,
      name: req.customer.name,
      email: req.customer.email,
      phone: req.customer.phone
    }
  });
};

module.exports = {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  getCurrentCustomer
};
