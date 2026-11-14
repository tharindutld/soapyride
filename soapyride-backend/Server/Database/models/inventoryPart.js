const mongoose = require('mongoose');

const StockMovementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['IN', 'OUT', 'ADJUSTMENT'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    default: ''
  },
  reference: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  performedBy: {
    type: String,
    default: 'Admin'
  }
});

const InventoryPartSchema = new mongoose.Schema({
  partCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
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
      'Engine Oil & Fluids',
      'Filters',
      'Brake Components',
      'Detailing Chemicals',
      'Batteries & Electrical',
      'Tires & Suspension',
      'General Accessories'
    ],
    default: 'Engine Oil & Fluids'
  },
  brand: {
    type: String,
    default: 'OEM Genuine'
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  unit: {
    type: String,
    default: 'Units'
  },
  reorderLevel: {
    type: Number,
    default: 5
  },
  costPrice: {
    type: Number,
    required: true,
    default: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    default: 0
  },
  supplierName: {
    type: String,
    required: true,
    default: 'AutoLanka Distributors'
  },
  supplierPhone: {
    type: String,
    default: '0112345678'
  },
  supplierEmail: {
    type: String,
    default: 'orders@autolanka.lk'
  },
  locationBin: {
    type: String,
    default: 'Rack A-1'
  },
  movements: [StockMovementSchema]
}, { timestamps: true });

module.exports = mongoose.model('InventoryPart', InventoryPartSchema);
