const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  vehicleType: {
    type: String,
    required: true
  },
  washPackage: {
    type: String
  },
  vehicleNumber: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  estimatedPrice: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Confirmed', 'Checked In', 'In Service Bay', 'Quality Check', 'Ready for Pickup', 'Completed'],
    default: 'Confirmed'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });



const BookingMessage = mongoose.model('BookingMessage', BookingSchema);

module.exports = BookingMessage;
