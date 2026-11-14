const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['Car', 'SUV', 'Van', 'Bike', 'Truck'],
    default: 'Car'
  },
  year: {
    type: Number,
    default: 2022
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'Hybrid', 'Electric'],
    default: 'Petrol'
  },
  color: {
    type: String,
    default: 'Silver'
  },
  mileage: {
    type: Number,
    required: true,
    default: 0
  },
  ownerName: {
    type: String,
    required: true,
    trim: true
  },
  ownerPhone: {
    type: String,
    required: true,
    trim: true
  },
  ownerEmail: {
    type: String,
    default: '',
    trim: true
  },
  ownerAddress: {
    type: String,
    default: ''
  },
  lastServiceDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', VehicleSchema);
