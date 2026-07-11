const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', requireAuth, asyncHandler(appointmentController.showBookingForm));
router.get('/slots', requireAuth, asyncHandler(appointmentController.getAvailableSlots));
router.post('/', requireAuth, asyncHandler(appointmentController.createBooking));

module.exports = router;
