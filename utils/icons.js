// Free tools use the purple gradient tile; keyed by the route slug / vedicTools registry key.
const toolIcons = {
  kundli: '📜',
  matching: '💞',
  dosha: '🛡️',
  chart: '🔯',
  numerology: '🔢',
  horoscope: '☀️',
  loveHoroscope: '❤️',
  panchang: '📅',
  ritu: '🍃',
  'auspicious-period': '✅',
  'inauspicious-period': '⚠️',
  'hindu-panchang': '📿',
  'birth-details': '👶',
  'planet-position': '🪐',
  'yoga-details': '🧘',
  'sudarshana-chakra': '☸️',
  'planet-relationship': '🔗',
  'papa-dosham': '⚖️',
  'dasha-periods': '⏳',
  'pdf-report': '📄'
};

// Paid consultation services use the gold gradient tile; keyed by Service.category.
const serviceIcons = {
  kundli: '📜',
  matching: '💞',
  palmistry: '✋',
  vastu: '🧭',
  horoscope: '🌞',
  career: '💼',
  general: '🔮'
};

module.exports = { toolIcons, serviceIcons };
