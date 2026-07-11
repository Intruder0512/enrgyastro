const mongoose = require('mongoose');

const DEFAULT_SLOTS = [
  '10:00 AM - 10:30 AM',
  '10:30 AM - 11:00 AM',
  '11:30 AM - 12:00 PM',
  '12:00 PM - 12:30 PM',
  '04:00 PM - 04:30 PM',
  '04:30 PM - 05:00 PM',
  '05:00 PM - 05:30 PM',
  '06:00 PM - 06:30 PM'
];

const settingsSchema = new mongoose.Schema(
  {
    // Always 'main' — this collection only ever holds one document.
    singleton: { type: String, default: 'main', unique: true },
    slots: { type: [String], default: DEFAULT_SLOTS },
    blockedDates: [
      {
        date: { type: Date, required: true },
        reason: { type: String, default: '' }
      }
    ]
  },
  { timestamps: true }
);

settingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne({ singleton: 'main' });
  if (!settings) {
    settings = await this.create({ singleton: 'main', slots: DEFAULT_SLOTS, blockedDates: [] });
  }
  return settings;
};

settingsSchema.statics.DEFAULT_SLOTS = DEFAULT_SLOTS;

module.exports = mongoose.model('Settings', settingsSchema);
