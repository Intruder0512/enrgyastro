// All of these Prokerala endpoints share the same input shape — datetime +
// coordinates + ayanamsa + language — so they're handled by one generic
// form/controller/view instead of duplicating five nearly-identical files
// per calculator. Verified against the official SDK source.
module.exports = {
  'birth-details': {
    label: 'Birth Details',
    description: 'Nakshatra, Rasi, and core birth chart facts from your date, time, and place of birth.',
    path: 'astrology/birth-details',
    isSvg: false
  },
  'planet-position': {
    label: 'Planet Position',
    description: 'Exact positions of all planets at the moment of birth.',
    path: 'astrology/planet-position',
    isSvg: false
  },
  'yoga-details': {
    label: 'Yoga Details',
    description: 'Auspicious and inauspicious yogas present in your birth chart.',
    path: 'astrology/yoga',
    isSvg: false
  },
  'planet-relationship': {
    label: 'Planet Relationship',
    description: 'Friendly, neutral, and enemy relationships between planets in your chart.',
    path: 'astrology/planet-relationship',
    isSvg: false
  },
  'papa-dosham': {
    label: 'Papa Dosham (Papasamyam)',
    description: 'Papasamyam analysis — malefic planetary influence assessment used in Tamil astrology.',
    path: 'astrology/papasamyam',
    isSvg: false
  },
  'ritu': {
    label: 'Ritu (Season)',
    description: 'The Vedic season (Ritu) corresponding to your birth date.',
    path: 'astrology/ritu',
    isSvg: false
  },
  'auspicious-period': {
    label: 'Auspicious Period',
    description: "Favorable time windows (Abhijit Muhurat and others) for the given date and location.",
    path: 'astrology/auspicious-period',
    isSvg: false
  },
  'inauspicious-period': {
    label: 'Inauspicious Period',
    description: 'Rahu Kaal, Yamaganda, and other unfavorable time windows for the given date and location.',
    path: 'astrology/inauspicious-period',
    isSvg: false
  },
  'hindu-panchang': {
    label: 'Hindu Panchang (Advanced)',
    description: 'Full detailed Panchang — Tithi, Nakshatra, Yoga, Karana, and more, for any date and place.',
    path: 'astrology/panchang/advanced',
    isSvg: false
  },
  'dasha-periods': {
    label: 'Dasha Periods',
    description: 'Vimshottari Dasha timeline — the planetary periods governing different phases of your life.',
    path: 'astrology/dasha-periods',
    isSvg: false
  },
  'sudarshana-chakra': {
    label: 'Sudarshana Chakra',
    description: 'Visual Sudarshana Chakra chart combining Rasi, Navamsa, and Lagna views.',
    path: 'astrology/sudarshana-chakra',
    isSvg: true
  }
};
