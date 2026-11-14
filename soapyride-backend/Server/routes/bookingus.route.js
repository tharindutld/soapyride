const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../Database/models/bookingus');
const { authenticate } = require('../Middleware/auth');
const adminRoute = require('./admin.route');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.user._id)) {
      const bookings = await Booking.find({ userId: req.user._id }).sort({ createdAt: -1 });
      return res.status(200).json({
        status: 'success',
        data: { bookings }
      });
    }

    const store = adminRoute.memoryStore;
    const bookings = store.appointments.filter(
      (b) => String(b.userId) === String(req.user._id)
    );
    res.status(200).json({
      status: 'success',
      data: { bookings }
    });
  } catch (err) {
    res.status(500).json({
      status: 'Failed',
      message: err.message
    });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const BookingContent = {
      name: req.body.name,
      phone: req.body.phone,
      date: req.body.date,
      time: req.body.time,
      vehicleType: req.body.vehicleType,
      washPackage: req.body.washPackage,
      vehicleNumber: req.body.vehicleNumber || '',
      notes: req.body.notes || '',
      estimatedPrice: req.body.estimatedPrice || 0,
      userId: req.user._id
    };

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.user._id)) {
      const booking = new Booking(BookingContent);
      const savedBooking = await booking.save();

      return res.status(200).json({
        status: 'success',
        data: {
          booking: savedBooking
        }
      });
    }

    const store = adminRoute.memoryStore;
    const newBooking = {
      _id: `apt-${Date.now()}`,
      ...BookingContent,
      status: 'Pending',
      approvalStatus: 'Pending',
      assignedMechanic: 'Unassigned',
      adminNotes: '',
      createdAt: new Date()
    };
    store.appointments.unshift(newBooking);

    res.status(200).json({
      status: 'success',
      data: {
        booking: newBooking
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'Failed',
      message: err.message
    });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.user._id)) {
      await Booking.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
      return res.status(200).json({
        status: 'success',
        message: 'Booking cancelled successfully'
      });
    }

    const store = adminRoute.memoryStore;
    store.appointments = store.appointments.filter(
      (b) => !(String(b._id) === String(req.params.id) && String(b.userId) === String(req.user._id))
    );
    res.status(200).json({
      status: 'success',
      message: 'Booking cancelled successfully'
    });
  } catch (err) {
    res.status(500).json({
      status: 'Failed',
      message: err.message
    });
  }
});

module.exports = router;
