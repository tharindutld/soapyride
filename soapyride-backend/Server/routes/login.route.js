const express = require('express');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../Database/models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminRoute = require('./admin.route');

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'myVerySecretKey';
const CUSTOMERS_FILE = path.join(__dirname, '../Database/customers.json');

const loadDiskCustomers = () => {
  try {
    if (fs.existsSync(CUSTOMERS_FILE)) {
      return JSON.parse(fs.readFileSync(CUSTOMERS_FILE, 'utf8'));
    }
  } catch {
    // ignore read error
  }
  return [];
};

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({
        status: 'failed',
        message: 'Email and password are required'
      });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({
          status: 'failed',
          message: 'Invalid email or password'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({
          status: 'failed',
          message: 'Invalid email or password'
        });
      }

      const token = jwt.sign(
        { userId: user._id, name: user.fullname, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '8h' }
      );
      return res.status(200).json({
        status: 'success',
        message: 'Login successful',
        token,
        user: {
          name: user.fullname,
          fullname: user.fullname,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    }

    // Persistent fallback store when MongoDB is not running locally
    const store = adminRoute.memoryStore;
    const diskCustomers = loadDiskCustomers();
    if (diskCustomers.length > 0 && store.customers.length === 0) {
      store.customers = diskCustomers;
    }

    const customer =
      store.customers.find((u) => u.email.toLowerCase() === email) ||
      diskCustomers.find((u) => u.email.toLowerCase() === email);

    if (customer) {
      const isPasswordValid = await bcrypt.compare(password, customer.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          status: 'failed',
          message: 'Invalid email or password'
        });
      }

      const token = jwt.sign(
        {
          userId: customer._id,
          name: customer.fullname,
          email: customer.email,
          role: customer.role || 'user'
        },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      return res.status(200).json({
        status: 'success',
        message: 'Login successful',
        token,
        user: {
          name: customer.fullname,
          fullname: customer.fullname,
          email: customer.email,
          phone: customer.phone,
          role: customer.role || 'user'
        }
      });
    }

    return res.status(400).json({
      status: 'failed',
      message: 'Invalid email or password'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'failed',
      message: 'An error occurred while processing your request'
    });
  }
});

module.exports = router;
