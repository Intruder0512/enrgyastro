const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const asyncHandler = require('../utils/asyncHandler');

router.use(requireAuth, requireAdmin);

router.get('/', asyncHandler(adminController.dashboard));

router.get('/appointments', asyncHandler(adminController.listAppointments));
router.get('/appointments/export.csv', asyncHandler(adminController.exportAppointmentsCsv));
router.post('/appointments/:id/status', asyncHandler(adminController.updateAppointmentStatus));

router.get('/users', asyncHandler(adminController.listUsers));
router.get('/users/:id/calendar', asyncHandler(adminController.viewUserCalendar));

router.get('/services', asyncHandler(adminController.listServices));
router.get('/services/new', adminController.showNewServiceForm);
router.post('/services', asyncHandler(adminController.createService));
router.get('/services/:id/edit', asyncHandler(adminController.showEditServiceForm));
router.post('/services/:id', asyncHandler(adminController.updateService));
router.post('/services/:id/toggle', asyncHandler(adminController.toggleService));

router.get('/settings', adminController.showSettings);
router.post('/settings/password', asyncHandler(adminController.updatePassword));

module.exports = router;
