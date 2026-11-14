const express = require('express');
const Booking = require('../Database/models/bookingus');
const { authenticate } = require('../Middleware/auth'); 

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id }).sort({ createdAt: -1 });
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
        
        const booking = new Booking(BookingContent);
        const savedBooking = await booking.save();

        res.status(200).json({
            status: 'success',
            data: {
                booking: savedBooking
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
        await Booking.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
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
