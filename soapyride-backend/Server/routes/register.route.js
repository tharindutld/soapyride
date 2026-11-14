const express = require('express');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../Database/models/user');
const adminRoute = require('./admin.route');
const router = express.Router();

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

const saveDiskCustomers = (customers) => {
  try {
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(customers, null, 2), 'utf8');
  } catch {
    // ignore write error
  }
};

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
const PHONE_REGEX = /^[0-9]{10}$/;

router.post('/', async (req, res) => {
  try {
    const { fullname, email, phone, password, confirmPassword } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!fullname || fullname.trim().length < 3) {
      return res.status(400).json({ status: 'failed', message: 'Full name must be at least 3 characters' });
    }
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ status: 'failed', message: 'Please enter a valid email address' });
    }
    if (!PHONE_REGEX.test(String(phone || '').trim())) {
      return res.status(400).json({ status: 'failed', message: 'Phone number must be 10 digits' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ status: 'failed', message: 'Password must be at least 8 characters long' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ status: 'failed', message: 'Passwords do not match' });
    }

    if (mongoose.connection.readyState === 1) {
      let existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        existingUser.fullname = fullname.trim();
        existingUser.phone = String(phone).trim();
        existingUser.password = password;
        existingUser.confirmPassword = confirmPassword;
        await existingUser.save();

        const userToReturn = existingUser.toObject();
        delete userToReturn.password;
        return res.status(200).json({
          status: 'success',
          data: { user: userToReturn }
        });
      }

      const user = new User({
        fullname: fullname.trim(),
        email: normalizedEmail,
        phone: String(phone).trim(),
        password
      });
      user.confirmPassword = confirmPassword;

      await user.save();

      const userToReturn = user.toObject();
      delete userToReturn.password;

      return res.status(201).json({
        status: 'success',
        data: { user: userToReturn }
      });
    }

    // Persistent local fallback store when MongoDB is not running locally
    const store = adminRoute.memoryStore;
    const diskCustomers = loadDiskCustomers();
    if (diskCustomers.length > 0 && store.customers.length === 0) {
      store.customers = diskCustomers;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newCustomer = {
      _id: `cust-${Date.now()}`,
      fullname: fullname.trim(),
      email: normalizedEmail,
      phone: String(phone).trim(),
      password: hashedPassword,
      role: 'user',
      staffRole: 'Customer',
      createdAt: new Date()
    };

    // Replace any existing record with the same email so re-registering updates the name
    store.customers = store.customers.filter((u) => u.email.toLowerCase() !== normalizedEmail);
    store.customers.push(newCustomer);
    saveDiskCustomers(store.customers);

    const { password: _pwd, ...userToReturn } = newCustomer;
    return res.status(201).json({
      status: 'success',
      data: { user: userToReturn }
    });
  } catch (err) {
    let errorMessage;

    if (err.name === 'ValidationError') {
      errorMessage = Object.values(err.errors).map((val) => val.message).join(', ');
    } else {
      errorMessage = err.message;
    }

    res.status(400).json({
      status: 'failed',
      message: errorMessage
    });
  }
});

module.exports = router;
