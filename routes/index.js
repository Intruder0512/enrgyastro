const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const panchangController = require('../controllers/panchangController');
const extraAstroController = require('../controllers/extraAstroController');
const vedicToolsController = require('../controllers/vedicToolsController');
const asyncHandler = require('../utils/asyncHandler');
const TOOLS = require('../utils/vedicTools');
const BlogPost = require('../models/BlogPost');

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

router.get('/sitemap.xml', asyncHandler(async (req, res) => {
  const base = (process.env.BASE_URL || '').replace(/\/$/, '');

  const staticPaths = [
    '/', '/services', '/panchang', '/tools', '/blog', '/about', '/contact', '/booking',
    '/horoscope', '/horoscope/love',
    '/dashboard/kundli', '/dashboard/matching', '/dashboard/numerology',
    '/dashboard/dosha', '/dashboard/chart', '/dashboard/pdf-report',
    ...Object.keys(TOOLS).map((key) => `/dashboard/tool/${key}`)
  ];

  const posts = await BlogPost.find({ status: 'published' }).select('slug updatedAt');

  const urls = [
    ...staticPaths.map((p) => ({ loc: base + p, lastmod: null })),
    ...posts.map((p) => ({ loc: `${base}/blog/${p.slug}`, lastmod: p.updatedAt.toISOString().slice(0, 10) }))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>`;

  res.set('Content-Type', 'application/xml');
  res.send(xml);
}));

module.exports = router;
