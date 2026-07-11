const User = require('../models/User');
const Service = require('../models/Service');

const STARTER_SERVICES = [
  {
    name: 'Free Kundli / Birth Chart',
    slug: 'free-kundli',
    category: 'kundli',
    description: 'Generate your detailed Vedic birth chart (Kundli) with planetary positions, nakshatra, and dasha.',
    shortDescription: 'Detailed birth chart, free.',
    price: 0,
    mode: ['online']
  },
  {
    name: 'Kundli Matching (Guna Milan)',
    slug: 'kundli-matching',
    category: 'matching',
    description: '36-point Ashtakoota Guna Milan compatibility matching for marriage.',
    shortDescription: 'Marriage compatibility, 36-point score.',
    price: 499,
    mode: ['online']
  },
  {
    name: 'One-on-One Astrology Consultation',
    slug: 'astrology-consultation',
    category: 'general',
    description: 'Personal consultation covering career, health, relationships, and life direction based on your Kundli.',
    shortDescription: 'Personal guidance session.',
    price: 999,
    durationMinutes: 30,
    mode: ['online', 'offline']
  },
  {
    name: 'Palm Reading (Hast Rekha)',
    slug: 'palm-reading',
    category: 'palmistry',
    description: 'Traditional palmistry reading covering life line, heart line, head line, and fate line analysis.',
    shortDescription: 'Traditional Hast Rekha reading.',
    price: 799,
    durationMinutes: 30,
    mode: ['offline', 'online']
  },
  {
    name: 'Vastu Consultation (Home/Office)',
    slug: 'vastu-consultation',
    category: 'vastu',
    description: 'Vastu Shastra consultation for your home or office, including remedies for common doshas.',
    shortDescription: 'Home & office Vastu guidance.',
    price: 1499,
    durationMinutes: 45,
    mode: ['offline', 'online']
  },
  {
    name: 'Career & Business Astrology',
    slug: 'career-astrology',
    category: 'career',
    description: 'Focused reading on career timing, business partnerships, and favorable periods for major decisions.',
    shortDescription: 'Career timing & decisions.',
    price: 999,
    durationMinutes: 30,
    mode: ['online', 'offline']
  }
];

async function seed() {
  // Admin account
  const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (!adminExists) {
    await User.create({
      name: process.env.ADMIN_NAME || 'Admin',
      email: process.env.ADMIN_EMAIL,
      phone: '0000000000',
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
      isVerified: true
    });
    console.log(`Admin account created: ${process.env.ADMIN_EMAIL}`);
  }

  // Starter services
  for (const svc of STARTER_SERVICES) {
    const exists = await Service.findOne({ slug: svc.slug });
    if (!exists) await Service.create(svc);
  }
  console.log('Starter services ensured.');
}

module.exports = seed;
