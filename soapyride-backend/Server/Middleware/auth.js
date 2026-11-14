const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../Database/models/user');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'myVerySecretKey';

const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Support built-in owner/admin token or DB user token
    if (decoded.role === 'admin' && (decoded.isOwner || !mongoose.Types.ObjectId.isValid(decoded.userId))) {
      req.user = {
        _id: decoded.userId,
        fullname: decoded.name || 'Shop Owner / Admin',
        email: decoded.email || 'admin@soapyride.com',
        role: 'admin'
      };
      return next();
    }

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(decoded.userId)) {
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
        return next();
      }
    }

    // Fallback to decoded payload if valid JWT
    req.user = {
      _id: decoded.userId,
      fullname: decoded.name || 'User',
      email: decoded.email || '',
      role: decoded.role || 'user'
    };
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired session. Please sign in again.' });
  }
};

const authorize = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied: Admin privileges required' });
    }
  };
};

module.exports = { authenticate, authorize };
