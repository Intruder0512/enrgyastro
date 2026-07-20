const SITE_NAME = 'EnrgyAstro';
const DEFAULT_DESCRIPTION = 'Personal Vedic astrology consultations — Kundli, Panchang, Kundli Matching, Palm Reading and Vastu, online or in person. Free Kundli, Numerology, and Daily Horoscope tools.';
const DEFAULT_KEYWORDS = 'astrology consultation, online astrologer, kundli, panchang, vedic astrology, kundli matching, numerology, vastu consultation, palm reading, daily horoscope';

// Central map of path -> meta description/keywords, so most pages get good
// SEO tags without every controller needing to set them individually.
// Dynamic pages (blog posts, generic tool pages) override res.locals
// directly in their own controller for content-specific tags.
const ROUTE_META = {
  '/': {
    description: 'Book a personal Vedic astrology consultation online or in person — Kundli, Panchang, Kundli Matching, Palm Reading & Vastu. Free Kundli, Numerology and Daily Horoscope tools.',
    keywords: 'online astrology consultation, vedic astrologer, free kundli, kundli matching, panchang today, vastu consultant, palm reading online'
  },
  '/services': {
    description: 'Browse all astrology consultation services — Kundli reading, Kundli Matching, Palm Reading, Vastu Consultation, and Career Astrology. Online and in-person sessions.',
    keywords: 'astrology services, kundli reading, vastu consultation, palm reading, career astrology, marriage matching'
  },
  '/panchang': {
    description: "Today's Hindu Panchang — Tithi, Nakshatra, Yoga, Karana, sunrise and sunset times, calculated live for your location.",
    keywords: 'today panchang, hindu panchang, tithi today, nakshatra today, daily panchang online'
  },
  '/tools': {
    description: 'Free Vedic astrology calculators — Kundli, Kundli Matching, Numerology, Dosha Check, Birth Chart, Daily Horoscope, Panchang, Dasha Periods and more.',
    keywords: 'free astrology calculator, free kundli online, numerology calculator, dosha check online, birth chart generator'
  },
  '/blog': {
    description: 'Astrology guides, Vedic insights, and updates from EnrgyAstro — learn about Kundli, Panchang, Vastu, and more.',
    keywords: 'astrology blog, vedic astrology articles, kundli guide, vastu tips'
  },
  '/about': {
    description: 'About EnrgyAstro — personal Vedic astrology consultations combining traditional methods with a modern, easy-to-book experience.',
    keywords: 'about enrgyastro, vedic astrologer profile'
  },
  '/contact': {
    description: 'Get in touch with EnrgyAstro for astrology consultation queries — WhatsApp, Facebook, and Instagram.',
    keywords: 'contact astrologer, astrology consultation whatsapp'
  },
  '/booking': {
    description: 'Book your online or in-person astrology consultation — choose your service, date, and time slot.',
    keywords: 'book astrology consultation, astrologer appointment booking'
  },
  '/horoscope': {
    description: 'Free daily horoscope reading for all zodiac signs — Aries to Pisces, updated daily.',
    keywords: 'daily horoscope, zodiac sign horoscope today, free horoscope reading'
  },
  '/horoscope/love': {
    description: 'Free daily love horoscope compatibility reading between two zodiac signs.',
    keywords: 'love horoscope, zodiac compatibility today, love compatibility calculator'
  },
  '/dashboard/kundli': {
    description: 'Generate your free detailed Vedic birth chart (Kundli) with planetary positions, nakshatra, and dasha periods.',
    keywords: 'free kundli online, birth chart generator, janam kundli free'
  },
  '/dashboard/matching': {
    description: 'Free Kundli Matching (Guna Milan) — 36-point Ashtakoota compatibility scoring for marriage.',
    keywords: 'kundli matching online, guna milan calculator, marriage compatibility astrology'
  },
  '/dashboard/numerology': {
    description: 'Free Numerology calculator — discover your Life Path Number and Destiny Number.',
    keywords: 'numerology calculator, life path number, destiny number free'
  },
  '/dashboard/dosha': {
    description: 'Free Dosha Check — Mangal Dosha, Kaal Sarp Dosha, and Sade Sati analysis in one report.',
    keywords: 'mangal dosha check, kaal sarp dosha, sade sati calculator'
  },
  '/dashboard/chart': {
    description: 'Generate your visual Vedic birth chart in North Indian or South Indian style.',
    keywords: 'birth chart generator, north indian kundli chart, south indian kundli chart'
  },
  '/dashboard/pdf-report': {
    description: 'Download a detailed personal astrology PDF report — birth chart, doshas, yogas, and dasha periods.',
    keywords: 'astrology pdf report, kundli pdf download'
  }
};

function getMetaForPath(pathname) {
  return ROUTE_META[pathname] || { description: DEFAULT_DESCRIPTION, keywords: DEFAULT_KEYWORDS };
}

module.exports = { SITE_NAME, DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS, getMetaForPath };
