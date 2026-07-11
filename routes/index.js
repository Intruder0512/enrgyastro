const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const panchangController = require('../controllers/panchangController');
const extraAstroController = require('../controllers/extraAstroController');
const vedicToolsController = require('../controllers/vedicToolsController');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(async (req, res) => {
  const services = await Service.find({ isActive: true }).limit(6).sort('category');
  res.render('home', { title: 'EnrgyAstro — Online & Offline Astrology Consultation', services });
}));

router.get('/services', asyncHandler(async (req, res) => {
  const services = await Service.find({ isActive: true }).sort('category name');
  res.render('services', { title: 'Our Services', services });
}));

router.get('/panchang', asyncHandler(panchangController.getTodayPanchang));
router.get('/panchang/widget', asyncHandler(panchangController.getTodayPanchang));

router.get('/horoscope', asyncHandler(extraAstroController.getHoroscope));
router.get('/horoscope/love', asyncHandler(extraAstroController.getLoveHoroscope));

router.get('/tools', vedicToolsController.showToolsIndex);

router.get('/about', (req, res) => res.render('about', { title: 'About' }));
router.get('/contact', (req, res) => res.render('contact', { title: 'Contact Us' }));

module.exports = router;
