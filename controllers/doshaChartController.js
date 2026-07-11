const prokerala = require('../utils/prokerala');
const Report = require('../models/Report');
const crypto = require('crypto');

function hashParams(prefix, obj) {
  return crypto.createHash('md5').update(prefix + JSON.stringify(obj)).digest('hex');
}

// ---- Dosha (Mangal / Kaal Sarp / Sade Sati) ----

exports.showDoshaForm = (req, res) => res.render('astro/dosha-form', { title: 'Dosha Check' });

exports.checkDosha = async (req, res) => {
  const { dob, tob, lat, lng } = req.body;
  const datetime = `${dob}T${tob}:00+05:30`;
  const params = { dob, tob, lat, lng };
  const inputHash = hashParams('dosha', params);

  try {
    const cached = req.session.userId
      ? await Report.findOne({ type: 'dosha', inputHash, user: req.session.userId })
      : null;

    let result;
    if (cached) {
      result = cached.responseData;
    } else {
      const [mangal, kaalSarp, sadeSati] = await Promise.all([
        prokerala.getMangalDosha(lat, lng, datetime),
        prokerala.getKaalSarpDosha(lat, lng, datetime),
        prokerala.getSadeSati(lat, lng, datetime)
      ]);
      result = { mangal: mangal.data, kaalSarp: kaalSarp.data, sadeSati: sadeSati.data };

      if (req.session.userId) {
        await Report.create({
          user: req.session.userId,
          type: 'dosha',
          inputHash,
          requestParams: params,
          responseData: result
        });
      }
    }

    res.render('astro/dosha-result', { title: 'Dosha Report', result, error: null });
  } catch (err) {
    console.error('Dosha check error:', err.message);
    res.render('astro/dosha-result', {
      title: 'Dosha Report',
      result: null,
      error: 'Could not generate the dosha report right now. Please try again shortly.'
    });
  }
};

// ---- Birth Chart (visual, North/South Indian style) ----

exports.showChartForm = (req, res) => res.render('astro/chart-form', { title: 'Birth Chart' });

exports.generateChart = async (req, res) => {
  const { dob, tob, lat, lng, chartType, chartStyle } = req.body;
  const datetime = `${dob}T${tob}:00+05:30`;

  try {
    const svg = await prokerala.getChartSvg(lat, lng, datetime, chartType || 'rasi', chartStyle || 'south-indian');
    res.render('astro/chart-result', { title: 'Your Birth Chart', svg, error: null });
  } catch (err) {
    console.error('Chart generation error:', err.message);
    res.render('astro/chart-result', {
      title: 'Your Birth Chart',
      svg: null,
      error: 'Could not generate your birth chart right now. Please try again shortly.'
    });
  }
};
