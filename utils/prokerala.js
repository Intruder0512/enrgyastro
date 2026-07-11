const axios = require('axios');

// Prokerala uses OAuth2 client-credentials: exchange client id/secret for a
// short-lived bearer token, then call the v2 astrology endpoints with it.
// We cache the token in memory until shortly before it expires.
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
  // Refresh 60s before actual expiry to be safe
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

async function callProkerala(endpoint, params) {
  const token = await getAccessToken();
  const { data } = await axios.get(`${process.env.PROKERALA_BASE_URL}/${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return data;
}

// datetime must be ISO 8601 with offset, e.g. 2026-07-11T10:30:00+05:30
function formatCoordinates(lat, lng) {
  return `${lat},${lng}`;
}

const prokerala = {
  // Daily Panchang for the homepage widget
  getPanchang: (lat, lng, datetime) =>
    callProkerala('panchang', {
      ayanamsa: 1, // Lahiri, standard for Vedic/Indian panchang
      coordinates: formatCoordinates(lat, lng),
      datetime
    }),

  // Full birth chart / Kundli
  getKundli: (lat, lng, datetime) =>
    callProkerala('kundli/advanced', {
      ayanamsa: 1,
      coordinates: formatCoordinates(lat, lng),
      datetime,
      la: 'en'
    }),

  // Vimshottari Dasha
  getDasha: (lat, lng, datetime) =>
    callProkerala('dasha-periods', {
      ayanamsa: 1,
      coordinates: formatCoordinates(lat, lng),
      datetime,
      la: 'en'
    }),

  // Dosha checks: Manglik / Kaal Sarp / Sade Sati
  getDosha: (lat, lng, datetime) =>
    callProkerala('kundli-dosha', {
      ayanamsa: 1,
      coordinates: formatCoordinates(lat, lng),
      datetime,
      la: 'en'
    }),

  // 36-point Ashtakoota Guna Milan matching between two birth charts
  getMatching: (boy, girl) =>
    callProkerala('match-making/guna-milan', {
      ayanamsa: 1,
      girl_coordinates: formatCoordinates(girl.lat, girl.lng),
      girl_dob: girl.datetime,
      boy_coordinates: formatCoordinates(boy.lat, boy.lng),
      boy_dob: boy.datetime,
      la: 'en'
    })
};

module.exports = prokerala;
