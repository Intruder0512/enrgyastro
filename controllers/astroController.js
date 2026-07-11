const prokerala = require('../utils/prokerala');
const Report = require('../models/Report');
const crypto = require('crypto');

function hashParams(prefix, obj) {
  return crypto.createHash('md5').update(prefix + JSON.stringify(obj)).digest('hex');
}

exports.showKundliForm = (req, res) => res.render('astro/kundli-form', { title: 'Free Kundli / Birth Chart' });

exports.generateKundli = async (req, res) => {
  const { dob, tob, lat, lng } = req.body;
  const datetime = `${dob}T${tob}:00+05:30`;
  const params = { lat, lng, datetime };
  const inputHash = hashParams('kundli', params);

  try {
    let cached = await Report.findOne({ type: 'kundli', inputHash, user: req.session.userId });
    let data = cached ? cached.responseData : await prokerala.getKundli(lat, lng, datetime);

    if (!cached) {
      await Report.create({
        user: req.session.userId,
        type: 'kundli',
        inputHash,
        requestParams: params,
        responseData: data
      });
    }

    res.render('astro/kundli-result', { title: 'Your Kundli', kundli: data.data, error: null });
  } catch (err) {
    console.error('Kundli generation error:', err.message);
    res.render('astro/kundli-result', {
      title: 'Your Kundli',
      kundli: null,
      error: 'Could not generate your Kundli right now. Please try again shortly.'
    });
  }
};

exports.showMatchingForm = (req, res) => res.render('astro/matching-form', { title: 'Kundli Matching (Guna Milan)' });

exports.generateMatching = async (req, res) => {
  const { boyDob, boyTob, boyLat, boyLng, girlDob, girlTob, girlLat, girlLng } = req.body;

  const boy = { datetime: `${boyDob}T${boyTob}:00+05:30`, lat: boyLat, lng: boyLng };
  const girl = { datetime: `${girlDob}T${girlTob}:00+05:30`, lat: girlLat, lng: girlLng };
  const inputHash = hashParams('matching', { boy, girl });

  try {
    let cached = await Report.findOne({ type: 'matching', inputHash, user: req.session.userId });
    let data = cached ? cached.responseData : await prokerala.getMatching(boy, girl);

    if (!cached) {
      await Report.create({
        user: req.session.userId,
        type: 'matching',
        inputHash,
        requestParams: { boy, girl },
        responseData: data
      });
    }

    res.render('astro/matching-result', { title: 'Match Result', match: data.data, error: null });
  } catch (err) {
    console.error('Matching generation error:', err.message);
    res.render('astro/matching-result', {
      title: 'Match Result',
      match: null,
      error: 'Could not generate the match report right now. Please try again shortly.'
    });
  }
};
