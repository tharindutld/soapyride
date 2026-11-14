const mongoose = require('mongoose');

const JobCardSchema = new mongoose.Schema({
  jobCardNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  vehicleNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  vehicleModel: {
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
  assignedMechanic: {
    type: String,
    required: true
  },
  mechanicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mechanic',
    required: false
  },
  bayNumber: {
    type: String,
    default: 'Bay 1'
  },
  priority: {
    type: String,
    enum: ['Normal', 'High', 'Urgent'],
    default: 'Normal'
  },
  status: {
    type: String,
    enum: [
      'Open',
      'Assigned',
      'In Progress',
      'Waiting for Parts',
      'Quality Check',
      'Completed',
      'Delivered'
    ],
    default: 'Open'
  },
  progressPercent: {
    type: Number,
    default: 15,
    min: 0,
    max: 100
  },
  reportedIssues: {
    type: String,
    default: ''
  },
  tasks: [
    {
      description: { type: String, required: true },
      completed: { type: Boolean, default: false },
      cost: { type: Number, default: 0 }
    }
  ],
  partsUsed: [
    {
      partCode: { type: String },
      name: { type: String },
      quantity: { type: Number, default: 1 },
      unitPrice: { type: Number, default: 0 }
    }
  ],
  laborCost: {
    type: Number,
    default: 0
  },
  estimatedTotal: {
    type: Number,
    default: 0
  },
  odometerReading: {
    type: Number,
    default: 0
  },
  estimatedCompletion: {
    type: String,
    default: ''
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BookingMessage',
    required: false
  },
  technicianNotes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('JobCard', JobCardSchema);
