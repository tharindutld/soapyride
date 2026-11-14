const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  jobCardNumber: {
    type: String,
    default: ''
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },
  vehicleNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  items: [
    {
      description: { type: String, required: true },
      itemType: { type: String, enum: ['Service', 'Part', 'Labor'], default: 'Service' },
      quantity: { type: Number, default: 1 },
      unitPrice: { type: Number, required: true },
      total: { type: Number, required: true }
    }
  ],
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    required: true,
    default: 0
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  balanceDue: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Bank Transfer', 'Online / LankaQR'],
    default: 'Cash'
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Partial', 'Unpaid'],
    default: 'Unpaid'
  },
  notes: {
    type: String,
    default: ''
  },
  issuedDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
