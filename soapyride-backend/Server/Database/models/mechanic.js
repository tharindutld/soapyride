const mongoose = require('mongoose');

const MechanicSchema = new mongoose.Schema({
  employeeId: {
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
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    default: '',
    trim: true
  },
  specializations: {
    type: [String],
    default: ['General Mechanical']
  },
  experienceYears: {
    type: Number,
    default: 3
  },
  availability: {
    type: String,
    enum: ['Available', 'On Job', 'On Break', 'Off Duty'],
    default: 'Available'
  },
  assignedBay: {
    type: String,
    default: 'Bay 1'
  },
  completedJobsCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 4.8,
    min: 1,
    max: 5
  },
  hourlyRate: {
    type: Number,
    default: 1500
  }
}, { timestamps: true });

module.exports = mongoose.model('Mechanic', MechanicSchema);
