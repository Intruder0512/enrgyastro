const express = require('express');
const router = express.Router();
const { requireAuth, gateResult } = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');
const astroController = require('../controllers/astroController');
const extraAstroController = require('../controllers/extraAstroController');
const doshaChartController = require('../controllers/doshaChartController');
const vedicToolsController = require('../controllers/vedicToolsController');
const pdfReportController = require('../controllers/pdfReportController');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// ---- Calculator forms: open to everyone. Submitting (POST) requires an
// account — gateResult() stashes the submission and sends them to
// register/login first, then replays it automatically. ----

router.get('/kundli', astroController.showKundliForm);
router.post('/kundli', gateResult('kundli'), asyncHandler(astroController.generateKundli));

router.get('/matching', astroController.showMatchingForm);
router.post('/matching', gateResult('matching'), asyncHandler(astroController.generateMatching));

router.get('/numerology', extraAstroController.showNumerologyForm);
router.post('/numerology', gateResult('numerology'), asyncHandler(extraAstroController.calculateNumerology));

router.get('/dosha', doshaChartController.showDoshaForm);
router.post('/dosha', gateResult('dosha'), asyncHandler(doshaChartController.checkDosha));

router.get('/chart', doshaChartController.showChartForm);
router.post('/chart', gateResult('chart'), asyncHandler(doshaChartController.generateChart));

router.get('/tool/:type', vedicToolsController.showForm);
router.post(
  '/tool/:type',
  gateResult((req) => 'tool:' + req.params.type),
  asyncHandler(vedicToolsController.submitForm)
);

router.get('/pdf-report', pdfReportController.showForm);
router.post('/pdf-report', gateResult('pdf-report'), asyncHandler(pdfReportController.generate));

// ---- Hard-gated: personal account area ----

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render('dashboard/home', { title: 'My Dashboard', user });
}));

router.get('/appointments', requireAuth, asyncHandler(appointmentController.myAppointments));
router.get('/appointments/:id/confirmation', requireAuth, asyncHandler(appointmentController.showConfirmation));

module.exports = router;
