const prokerala = require('../utils/prokerala');
const Report = require('../models/Report');
const crypto = require('crypto');

const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

function hashParams(prefix, obj) {
  return crypto.createHash('md5').update(prefix + JSON.stringify(obj)).digest('hex');
}

function nowISTIso() {
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return `${ist.toISOString().split('.')[0]}+05:30`;
}

// ---- Numerology ----

exports.showNumerologyForm = (req, res) =>
  res.render('astro/numerology-form', { title: 'Numerology Calculator' });

exports.calculateNumerology = async (req, res) => {
  const { dob, firstName, middleName, lastName } = req.body;
  const datetime = `${dob}T00:00:00+05:30`;
  const params = { dob, firstName, middleName, lastName };
  const inputHash = hashParams('numerology', params);

  try {
    const cached = req.session.userId
      ? await Report.findOne({ type: 'numerology', inputHash, user: req.session.userId })
      : null;

    let lifePath, destiny;
    if (cached) {
      ({ lifePath, destiny } = cached.responseData);
    } else {
      const [lifePathRes, destinyRes] = await Promise.all([
        prokerala.getNumerologyLifePath(datetime),
        prokerala.getNumerologyDestiny(firstName, middleName || '', lastName || '')
      ]);
      lifePath = lifePathRes.data.life_path_number;
      destiny = destinyRes.data.destiny_number;

      if (req.session.userId) {
        await Report.create({
          user: req.session.userId,
          type: 'numerology',
          inputHash,
          requestParams: params,
          responseData: { lifePath, destiny }
        });
      }
    }

    res.render('astro/numerology-result', { title: 'Your Numerology Report', lifePath, destiny, error: null });
  } catch (err) {
    console.error('Numerology error:', err.response?.data ? JSON.stringify(err.response.data) : err.message);
    res.render('astro/numerology-result', {
      title: 'Your Numerology Report',
      lifePath: null,
      destiny: null,
      error: 'Could not calculate your numerology report right now. Please try again shortly.'
    });
  }
};

// ---- Daily Horoscope ----

exports.showHoroscopeForm = (req, res) =>
  res.render('astro/horoscope-form', { title: 'Daily Horoscope', signs: ZODIAC_SIGNS });

exports.getHoroscope = async (req, res) => {
  const { sign } = req.query;
  const type = req.query.type || 'general';
  if (!sign) return res.render('astro/horoscope-form', { title: 'Daily Horoscope', signs: ZODIAC_SIGNS });

  const datetime = nowISTIso();

  try {
    const data = await prokerala.getDailyHoroscopeAdvanced(sign, type, datetime);

    res.render('astro/horoscope-result', {
      title: `Daily Horoscope — ${sign}`,
      signs: ZODIAC_SIGNS,
      sign,
      horoscope: data.data,
      error: null
    });
  } catch (err) {
    console.error('Daily horoscope error:', err.response?.data ? JSON.stringify(err.response.data) : err.message);
    res.render('astro/horoscope-result', {
      title: 'Daily Horoscope',
      signs: ZODIAC_SIGNS,
      sign,
      horoscope: null,
      error: 'Could not fetch today\u2019s horoscope right now. Please try again shortly.'
    });
  }
};

// ---- Daily Love Horoscope ----

exports.showLoveHoroscopeForm = (req, res) =>
  res.render('astro/love-horoscope-form', { title: 'Daily Love Horoscope', signs: ZODIAC_SIGNS });

exports.getLoveHoroscope = async (req, res) => {
  const { signOne, signTwo } = req.query;
  if (!signOne || !signTwo) {
    return res.render('astro/love-horoscope-form', { title: 'Daily Love Horoscope', signs: ZODIAC_SIGNS });
  }

  const datetime = nowISTIso();

  try {
    const data = await prokerala.getDailyLoveHoroscope(signOne, signTwo, datetime);
    res.render('astro/love-horoscope-result', {
      title: 'Daily Love Horoscope',
      signs: ZODIAC_SIGNS,
      signOne,
      signTwo,
      result: data.data,
      error: null
    });
  } catch (err) {
    console.error('Love horoscope error:', err.response?.data ? JSON.stringify(err.response.data) : err.message);
    res.render('astro/love-horoscope-result', {
      title: 'Daily Love Horoscope',
      signs: ZODIAC_SIGNS,
      signOne,
      signTwo,
      result: null,
      error: 'Could not fetch the love horoscope right now. Please try again shortly.'
    });
  }
};
