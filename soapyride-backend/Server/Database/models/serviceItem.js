const mongoose = require('mongoose');

const ServiceItemSchema = new mongoose.Schema({
  serviceCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Wash & Detailing',
      'Mechanical & Lube',
      'Diagnostics & Electrical',
      'Wheel & Alignment',
      'Paint & Ceramic',
      'Custom Upgrades'
    ],
    default: 'Wash & Detailing'
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: String,
    default: '60 mins'
  },
  warranty: {
    type: String,
    default: '30 Days Service Warranty'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ServiceItem', ServiceItemSchema);
