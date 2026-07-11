const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const asyncHandler = require('../utils/asyncHandler');

router.use(requireAuth, requireAdmin);

router.get('/', asyncHandler(adminController.dashboard));

router.get('/appointments', asyncHandler(adminController.listAppointments));
router.post('/appointments/:id/status', asyncHandler(adminController.updateAppointmentStatus));

router.get('/services', asyncHandler(adminController.listServices));
router.post('/services/:id/toggle', asyncHandler(adminController.toggleService));

module.exports = router;
