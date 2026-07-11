const axios = require('axios');
const qs = require('qs');

// Prokerala uses OAuth2 client-credentials: exchange client id/secret for a
// short-lived bearer token, then call the v2 endpoints with it. Token is
// cached in memory until shortly before it expires.
let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const { data } = await axios.post(
    process.env.PROKERALA_TOKEN_URL,
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.PROKERALA_CLIENT_ID,
      client_secret: process.env.PROKERALA_CLIENT_SECRET
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

// PROKERALA_BASE_URL should be set to https://api.prokerala.com/v2 —
// every endpoint below supplies its own full path from there
// (e.g. astrology/panchang, horoscope/daily, numerology/life-path-number),
// verified directly against Prokerala's official SDK source.
async function callProkerala(path, params) {
  const token = await getAccessToken();
  const { data } = await axios.get(`${process.env.PROKERALA_BASE_URL}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return data;
}

// The Chart endpoint returns raw SVG text, not JSON — needs its own call
// that doesn't try to parse the body as JSON.
async function callProkeralaRaw(path, params) {
  const token = await getAccessToken();
  const { data } = await axios.get(`${process.env.PROKERALA_BASE_URL}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
    responseType: 'text'
  });
  return data;
}

function formatCoordinates(lat, lng) {
  return `${lat},${lng}`;
}

const prokerala = {
  // ---- Daily Panchang ----
  getPanchang: (lat, lng, datetime, la = 'en') =>
    callProkerala('astrology/panchang', { ayanamsa: 1, coordinates: formatCoordinates(lat, lng), datetime, la }),

  // ---- Vedic Horoscope / Kundli ----
  getKundli: (lat, lng, datetime, la = 'en') =>
    callProkerala('astrology/kundli/advanced', { ayanamsa: 1, coordinates: formatCoordinates(lat, lng), datetime, la }),

  getDasha: (lat, lng, datetime, la = 'en') =>
    callProkerala('astrology/dasha-periods', { ayanamsa: 1, coordinates: formatCoordinates(lat, lng), datetime, la }),

  // Doshas are three separate endpoints on Prokerala, not one combined call
  getMangalDosha: (lat, lng, datetime, la = 'en') =>
    callProkerala('astrology/mangal-dosha/advanced', { ayanamsa: 1, coordinates: formatCoordinates(lat, lng), datetime, la }),

  getKaalSarpDosha: (lat, lng, datetime, la = 'en') =>
    callProkerala('astrology/kaal-sarp-dosha', { ayanamsa: 1, coordinates: formatCoordinates(lat, lng), datetime, la }),

  getSadeSati: (lat, lng, datetime, la = 'en') =>
    callProkerala('astrology/sade-sati/advanced', { ayanamsa: 1, coordinates: formatCoordinates(lat, lng), datetime, la }),

  // North/South Indian style birth chart — returns raw SVG markup
  getChartSvg: (lat, lng, datetime, chartType = 'rasi', chartStyle = 'south-indian', la = 'en') =>
    callProkeralaRaw('astrology/chart', {
      ayanamsa: 1,
      coordinates: formatCoordinates(lat, lng),
      datetime,
      chart_type: chartType,
      chart_style: chartStyle,
      la,
      format: 'svg'
    }),

  // 36-point Ashtakoota Guna Milan matching between two birth charts
  getMatching: (boy, girl, la = 'en') =>
    callProkerala('astrology/kundli-matching/advanced', {
      ayanamsa: 1,
      girl_coordinates: formatCoordinates(girl.lat, girl.lng),
      girl_dob: girl.datetime,
      boy_coordinates: formatCoordinates(boy.lat, boy.lng),
      boy_dob: boy.datetime,
      la
    }),

  // ---- Daily Horoscope ----
  getDailyHoroscope: (sign, datetime) =>
    callProkerala('horoscope/daily', { datetime, sign }),

  getDailyHoroscopeAdvanced: (sign, type, datetime) =>
    callProkerala('horoscope/daily/advanced', { datetime, sign, type }),

  getDailyLoveHoroscope: (signOne, signTwo, datetime) =>
    callProkerala('horoscope/daily/love-compatibility', { datetime, sign_one: signOne, sign_two: signTwo }),

  // ---- Numerology ----
  getNumerologyLifePath: (datetime) =>
    callProkerala('numerology/life-path-number', { datetime }),

  getNumerologyDestiny: (firstName, middleName, lastName) =>
    callProkerala('numerology/destiny-number', {
      first_name: firstName,
      middle_name: middleName || '',
      last_name: lastName || ''
    }),

  // ---- Generic caller used by the vedicTools registry (utils/vedicTools.js) ----
  callGeneric: (path, lat, lng, datetime, la = 'en') =>
    callProkerala(path, { ayanamsa: 1, coordinates: formatCoordinates(lat, lng), datetime, la }),

  callGenericSvg: (path, lat, lng, datetime, la = 'en') =>
    callProkeralaRaw(path, { ayanamsa: 1, coordinates: formatCoordinates(lat, lng), datetime, la, format: 'svg' }),

  // ---- PDF Report ----
  // Returns raw PDF bytes. Prokerala's report endpoint takes deeply nested
  // input/options objects, encoded the same way PHP's http_build_query
  // would (bracket notation) — qs's default 'indices' array format matches
  // that, which axios's built-in params serializer does not.
  getPersonalPdfReport: async (input, options) => {
    const token = await getAccessToken();
    const query = qs.stringify({ input, options });
    const { data } = await axios.get(
      `${process.env.PROKERALA_BASE_URL}/report/personal-reading/instant?${query}`,
      { headers: { Authorization: `Bearer ${token}` }, responseType: 'arraybuffer' }
    );
    return data;
  }
};

module.exports = prokerala;
