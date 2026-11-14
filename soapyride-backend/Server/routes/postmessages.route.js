const express = require('express');
const mongoose = require('mongoose');
const Message = require('../Database/models/messages');
const adminRoute = require('./admin.route');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const messageContent = {
      message: req.body.message,
      name: req.body.name,
      email: req.body.email
    };

    if (mongoose.connection.readyState === 1) {
      const message = new Message(messageContent);
      await message.save();
      return res.status(200).json({
        status: 'success',
        data: { message }
      });
    }

    const store = adminRoute.memoryStore;
    const savedMessage = {
      _id: `msg-${Date.now()}`,
      ...messageContent,
      createdAt: new Date()
    };
    store.messages.unshift(savedMessage);

    res.status(200).json({
      status: 'success',
      data: { message: savedMessage }
    });
  } catch (err) {
    res.status(500).json({
      status: 'Failed',
      message: err.message
    });
  }
});

module.exports = router;
