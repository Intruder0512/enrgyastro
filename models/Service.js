const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ['kundli', 'matching', 'palmistry', 'vastu', 'horoscope', 'career', 'general'],
      required: true
    },
    description: { type: String, required: true },
    shortDescription: { type: String },
    mode: {
      type: [String],
      enum: ['online', 'offline'],
      default: ['online', 'offline']
    },
    durationMinutes: { type: Number, default: 30 },
    price: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    icon: { type: String } // css class or image path
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
