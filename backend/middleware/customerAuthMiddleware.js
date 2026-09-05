const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

const authenticateCustomer = async (req, res, next, allowGuest = false) => {
  try {
    const token = req.cookies.customerToken;

    if (!token) {
      if (allowGuest) return next();
      return res.status(401).json({ message: 'Customer authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'customer') {
      return res.status(403).json({ message: 'Customer access required' });
    }

    const customer = await Customer.findById(decoded.id);

    if (!customer) {
      return res.status(401).json({ message: 'Invalid or expired customer token' });
    }

    req.customer = customer;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired customer token' });
  }
};

const protectCustomer = (req, res, next) => authenticateCustomer(req, res, next);
const optionalCustomerAuth = (req, res, next) => authenticateCustomer(req, res, next, true);

module.exports = {
  protectCustomer,
  optionalCustomerAuth
};
