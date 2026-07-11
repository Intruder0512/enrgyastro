const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');
const astroController = require('../controllers/astroController');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

router.use(requireAuth);

router.get('/', asyncHandler(async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render('dashboard/home', { title: 'My Dashboard', user });
}));

router.get('/appointments', asyncHandler(appointmentController.myAppointments));
router.get('/appointments/:id/confirmation', asyncHandler(appointmentController.showConfirmation));

router.get('/kundli', astroController.showKundliForm);
router.post('/kundli', asyncHandler(astroController.generateKundli));

router.get('/matching', astroController.showMatchingForm);
router.post('/matching', asyncHandler(astroController.generateMatching));

module.exports = router;
