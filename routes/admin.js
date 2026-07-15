const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const adminBlogController = require('../controllers/adminBlogController');
const asyncHandler = require('../utils/asyncHandler');
const upload = require('../utils/upload');

const blogUpload = upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'videoFile', maxCount: 1 }]);

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

router.get('/settings', asyncHandler(adminController.showSettings));
router.post('/settings/password', asyncHandler(adminController.updatePassword));
router.post('/settings/slots', asyncHandler(adminController.updateSlots));
router.post('/settings/blocked-dates', asyncHandler(adminController.addBlockedDate));
router.post('/settings/blocked-dates/:blockedId/delete', asyncHandler(adminController.removeBlockedDate));

router.get('/blog', asyncHandler(adminBlogController.listPosts));
router.get('/blog/new', adminBlogController.showNewForm);
router.post('/blog', blogUpload, asyncHandler(adminBlogController.createPost));
router.get('/blog/:id/edit', asyncHandler(adminBlogController.showEditForm));
router.post('/blog/:id', blogUpload, asyncHandler(adminBlogController.updatePost));
router.post('/blog/:id/toggle', asyncHandler(adminBlogController.togglePublish));
router.post('/blog/:id/delete', asyncHandler(adminBlogController.deletePost));

module.exports = router;
