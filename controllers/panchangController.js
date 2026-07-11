const prokerala = require('../utils/prokerala');
const Report = require('../models/Report');
const crypto = require('crypto');

// Default location: New Delhi (used when no location is supplied, matching AstroSage's default)
const DEFAULT_LAT = 28.6139;
const DEFAULT_LNG = 77.209;

function nowISTIso() {
  // Prokerala expects ISO 8601 with UTC offset
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return `${ist.toISOString().split('.')[0]}+05:30`;
}

exports.getTodayPanchang = async (req, res) => {
  const lat = parseFloat(req.query.lat) || DEFAULT_LAT;
  const lng = parseFloat(req.query.lng) || DEFAULT_LNG;
  const datetime = nowISTIso();

  const inputHash = crypto
    .createHash('md5')
    .update(`panchang-${lat}-${lng}-${datetime.split('T')[0]}`)
    .digest('hex');

  try {
    let cached = await Report.findOne({ type: 'panchang', inputHash });
    let data;

    if (cached) {
      data = cached.responseData;
    } else {
      data = await prokerala.getPanchang(lat, lng, datetime);
      if (req.session && req.session.userId) {
        await Report.create({
          user: req.session.userId,
          type: 'panchang',
          inputHash,
          requestParams: { lat, lng, datetime },
          responseData: data
        });
      }
    }

    if (req.query.widget) {
      return res.render('partials/panchang-widget', { panchang: data.data, error: null });
    }
    return res.render('panchang', { title: "Today's Panchang", panchang: data.data, error: null });
  } catch (err) {
    console.error('Panchang fetch error:', err.message);
    const errMsg = 'Panchang data is temporarily unavailable. Please check back shortly.';
    if (req.query.widget) {
      return res.render('partials/panchang-widget', { panchang: null, error: errMsg });
    }
    return res.render('panchang', { title: "Today's Panchang", panchang: null, error: errMsg });
  }
};
