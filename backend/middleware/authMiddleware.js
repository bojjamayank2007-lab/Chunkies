const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    // Accept token from cookie (same-site) or Authorization header (cross-site)
    const cookieToken = req.cookies.adminToken;
    const authHeader = req.headers.authorization;
    let token = cookieToken;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    if (!token) {
      return res.status(401).json({
        message: 'Not authenticated'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        message: 'Admin access required'
      });
    }

    req.admin = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired authentication token'
    });
  }
};

module.exports = {
  protect
};